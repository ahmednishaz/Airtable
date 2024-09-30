import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Import the CSS for timeline styling

const App = () => {
  const [countryName, setCountryName] = useState("");
  const [operatorsDetails, setOperatorsDetails] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [simDetails, setSimDetails] = useState(null);
  const [operatorLogs, setOperatorLogs] = useState([]);
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

  const createHeaders = () => ({
    Authorization: `Bearer patxCyw5js0YvlQs5.c999816a31ada12eeed104d1b04d3d4d90200a32d20e76b0ac7e7f31877ea1c2`,
    "Content-Type": "application/json",
  });

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
            {
              headers: createHeaders(),
            }
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
        setSimDetails([]); // No SIM details found
      }
    } catch (err) {
      console.error("Error fetching SIM data:", err);
      setError("Error fetching SIM details. Please try again.");
    }
  };

  const fetchOperatorLog = async (operatorId) => {
    setOperatorLogs([]);
    try {
      const logResponse = await axios.get(
        `https://api.airtable.com/v0/appa8bmftcuvbaqsM/tblDPwCFKkljEmPsG`,
        {
          headers: createHeaders(),
          params: { filterByFormula: `{Operator} = "${operatorId}"` },
        }
      );

      if (logResponse.data.records.length > 0) {
        const OperatorLogDetailsData = logResponse.data.records.map(
          (record) => ({
            id: record.id,
            timestamp: record.createdTime,
            action: record.fields.Action || "N/A",
            status: record.fields.Status || "N/A",
          })
        );
        setOperatorLogs(OperatorLogDetailsData);
      } else {
        setOperatorLogs([]); // No logs found
      }
    } catch (err) {
      console.error("Error fetching Operator Log data:", err);
      setError("Error fetching Operator Log data. Please try again.");
    }
  };

  const handleOperatorClick = async (operator) => {
    setSelectedOperator(operator);
    fetchSimDetails(operator.operatorID);
    await fetchOperatorLog(operator.operatorID); // Fetch logs
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

      <h2 className="mt-4">Operators:</h2>
      {operatorsDetails.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Operator Name</th>
              <th>MCCMNC</th>
              <th>CCNDC</th>
              <th>Status</th>
              <th>Sim Count</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {operatorsDetails.map((operator, index) => (
              <tr key={index}>
                <td>{operator.operatorName || "Unknown Operator"}</td>
                <td>{operator.MCCMNC || "N/A"}</td>
                <td>{operator.CCNDC || "N/A"}</td>
                <td>{operator.Status || "N/A"}</td>
                <td>{operator["Sim Count"] || "N/A"}</td>
                <td>
                  <button
                    className="btn btn-info"
                    onClick={() => handleOperatorClick(operator)}
                  >
                    View SIM Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center">
          <p>No operators found for this country.</p>
        </div>
      )}

      {selectedOperator && (
        <div className="mt-4">
          <h3>Selected Operator Details:</h3>
          <div className="border p-3">
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <td>
                    <strong>Name:</strong>
                  </td>
                  <td>{selectedOperator.operatorName || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>MCCMNC:</strong>
                  </td>
                  <td>{selectedOperator.MCCMNC || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>CCNDC:</strong>
                  </td>
                  <td>{selectedOperator.CCNDC || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>EPC Realm:</strong>
                  </td>
                  <td>{selectedOperator.EPC_Realm || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>GPRS Zone:</strong>
                  </td>
                  <td>{selectedOperator.GPRS_Zone || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Status:</strong>
                  </td>
                  <td>{selectedOperator.Status || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Last Updated:</strong>
                  </td>
                  <td>{selectedOperator["Last updated"] || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Sim Count:</strong>
                  </td>
                  <td>{selectedOperator["Sim Count"] || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {simDetails && (
        <div className="mt-4">
          <h3>SIM Details:</h3>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>SIM ID</th>
                <th>Operator</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {simDetails.length > 0 ? (
                simDetails.map((sim, index) => (
                  <tr key={index}>
                    <td>{sim["SIM ID"] || "N/A"}</td>
                    <td>{sim.Operator || "N/A"}</td>
                    <td>{sim.Status || "N/A"}</td>
                    <td>{sim["Created At"] || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No SIM details found for this operator.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {operatorLogs.length > 0 && (
        <div className="mt-4">
          <h3>Operator Logs:</h3>
          <div className="timeline">
            {operatorLogs.map((log, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-time">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className="timeline-content">
                  <h4 className="timeline-title">{log.action}</h4>
                  <p>Status: {log.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
