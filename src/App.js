import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [countryName, setCountryName] = useState("");
  const [operatorsDetails, setOperatorsDetails] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [simDetails, setSimDetails] = useState(null);
  const [operatorLog, setOperatorLog] = useState([]); // State to store operator logs
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCountryChange = (e) => {
    const value = e.target.value;
    setCountryName(value.charAt(0).toUpperCase() + value.slice(1));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchOperatorsDetails();
    }
  };

  const createHeaders = () => {
    return {
      Authorization: `Bearer patxCyw5js0YvlQs5`,
      "Content-Type": "application/json",
    };
  };

  const fetchOperatorsDetails = async () => {
    setLoading(true);
    setError(null);
    setSelectedOperator(null);
    setSimDetails(null);
    try {
      const countryResponse = await axios.get(
        `https://api.airtable.com/v0/appa8bmftcuvbaqsM/tblE7VEswD6mcKHZf`,
        {
          headers: createHeaders(),
          params: { filterByFormula: `{Name} = "${countryName}"` },
        }
      );

      if (countryResponse.data.records.length > 0) {
        const countryRecord = countryResponse.data.records[0];
        const operatorIds = countryRecord.fields.Operators || [];

        const operatorDetailsPromises = operatorIds.map((operatorId) =>
          axios.get(
            `https://api.airtable.com/v0/appa8bmftcuvbaqsM/tble9S8CeXUAjUKxZ/${operatorId}`,
            { headers: createHeaders() }
          )
        );

        const operatorResponses = await Promise.all(operatorDetailsPromises);
        const filteredOperators = operatorResponses.map(
          (res) => res.data.fields
        );
        setOperatorsDetails(filteredOperators);
      } else {
        setError("No records found for this country.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching data. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSimDetails = async (operatorId) => {
    setSimDetails(null);
    try {
      const simResponse = await axios.get(
        `https://api.airtable.com/v0/appa8bmftcuvbaqsM/tbl7yf8TJkm4wg2v1`,
        {
          headers: createHeaders(),
          params: { filterByFormula: `{Operator} = "${operatorId}"` },
        }
      );

      if (simResponse.data.records.length > 0) {
        const simDetailsData = simResponse.data.records.map(
          (record) => record.fields
        );
        setSimDetails(simDetailsData);
      } else {
        setSimDetails([]);
      }
    } catch (err) {
      console.error("Error fetching SIM data:", err);
      setError("Error fetching SIM details. Please try again.");
    }
  };

  const fetchOperatorLog = async (operatorId) => {
    try {
      const logResponse = await axios.get(
        `https://api.airtable.com/v0/appa8bmftcuvbaqsM/tblDPwCFKkljEmPsG`,
        {
          headers: createHeaders(),
          params: { filterByFormula: `{Operator} = "${operatorId}"` },
        }
      );

      if (logResponse.data.records.length > 0) {
        const logDetailsData = logResponse.data.records.map(
          (record) => record.fields
        );
        setOperatorLog(logDetailsData);
      } else {
        setOperatorLog([]);
      }
    } catch (err) {
      console.error("Error fetching operator log:", err);
      setError("Error fetching operator log. Please try again.");
    }
  };

  const handleOperatorClick = (operator) => {
    setSelectedOperator(operator);
    fetchSimDetails(operator.operatorID);
    fetchOperatorLog(operator.operatorID); // Fetch log for selected operator
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h1 className="text-center">Operator Fetcher</h1>

      <div className="mb-4 text-center">
        <input
          type="text"
          className="form-control"
          placeholder="Enter Country Name"
          value={countryName}
          onChange={handleCountryChange}
          onKeyPress={handleKeyPress}
          style={{ width: "300px", margin: "0 auto" }}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={fetchOperatorsDetails}
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch Operators"}
        </button>
      </div>

      {error && <p className="text-danger text-center">{error}</p>}

      {selectedOperator && (
        <div className="row">
          <div className="col-md-8">
            <h3>Selected Operator Details:</h3>
            <div className="border p-3">
              <table className="table table-bordered">
                <tbody>{/* Operator Details */}</tbody>
              </table>
            </div>
          </div>

          <div className="col-md-4">
            <h3>Operator Log</h3>
            <div className="timeline">
              {operatorLog.length > 0 ? (
                <ul className="timeline">
                  {operatorLog.map((log, index) => (
                    <li key={index} className="timeline-item">
                      <div className="timeline-badge">
                        <i className="glyphicon glyphicon-check"></i>
                      </div>
                      <div className="timeline-panel">
                        <div className="timeline-heading">
                          <h4 className="timeline-title">{log.eventName}</h4>
                          <p>
                            <small className="text-muted">
                              {new Date(log.date).toLocaleDateString()}
                            </small>
                          </p>
                        </div>
                        <div className="timeline-body">
                          <p>{log.details || "No details available"}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No operator logs found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sim details and other parts of the component */}
    </div>
  );
};

export default App;
