import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

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
    // Capitalize first letter of the country name
    setCountryName(value.charAt(0).toUpperCase() + value.slice(1));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchOperatorsDetails();
    }
  };

  const createHeaders = () => {
    return {
      Authorization: `Bearer patxCyw5js0YvlQs5.c999816a31ada12eeed104d1b04d3d4d90200a32d20e76b0ac7e7f31877ea1c2`,
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

      console.log("Country Response:", countryResponse.data); // Log country response

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

        console.log("Operators Details:", filteredOperators); // Log operator details
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

      console.log("SIM Response:", simResponse.data); // Log SIM response

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
        `https://api.airtable.com/v0/appa8bmftcuvbaqsM/tblDPwCFKkljEmPsG`, // Operator Log table ID
        {
          headers: createHeaders(),
          params: { filterByFormula: `{Operator} = "${operatorId}"` }, // assuming OperatorID is the correct field
        }
      );

      console.log("Operator Log Response:", logResponse.data); // Log operator log response

      if (logResponse.data.records.length > 0) {
        const OperatorLogDetailsData = logResponse.data.records.map(
          (record) => record.fields
        );
        setOperatorLogs(OperatorLogDetailsData);
      } else {
        setOperatorLogs([]); // No SIM details found
      }
    } catch (err) {
      console.error("Error fetching Operator Log data:", err);
      setError("Error fetching Operator Log data:. Please try again.");
    }
  };

  const handleOperatorClick = async (operator) => {
    setSelectedOperator(operator);
    fetchSimDetails(operator.operatorID);

    const logs = await fetchOperatorLog(operator.operatorID); // Fetch logs
    setOperatorLogs(logs); // Assuming you add a new state for operator logs
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
              {/* <th>Country ID</th> */}
              {/* <th>Country Name</th> */}
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
                {/* <td>{operator.countryID || "N/A"}</td> */}
                {/* <td>
                  {(Array.isArray(operator.CountryName)
                    ? operator.CountryName
                    : []
                  ).join(", ") || "N/A"}
                </td> */}
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
                <tr>
                  <td>
                    <strong>Operator ID:</strong>
                  </td>
                  <td>{selectedOperator.operatorID || "N/A"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>IN/OUT Statuses:</strong>
                  </td>
                  <td>
                    <div className="row">
                      <div className="col-6">
                        <strong>IN</strong>
                        <ul className="list-unstyled">
                          <li>
                            GSM:{" "}
                            <span
                              className={`badge ${
                                selectedOperator.IN_GSM === "LIVE"
                                  ? "badge-success"
                                  : selectedOperator.IN_GSM === "TESTING"
                                  ? "badge-warning"
                                  : selectedOperator.IN_GSM === "N/A"
                                  ? "badge-danger"
                                  : "badge-secondary"
                              }`}
                            >
                              {selectedOperator.IN_GSM || "N/A"}
                            </span>
                          </li>
                          <li>
                            GPRS:{" "}
                            <span
                              className={`badge ${
                                selectedOperator.IN_GPRS === "LIVE"
                                  ? "badge-success"
                                  : selectedOperator.IN_GPRS === "TESTING"
                                  ? "badge-warning"
                                  : selectedOperator.IN_GPRS === "N/A"
                                  ? "badge-danger"
                                  : "badge-secondary"
                              }`}
                            >
                              {selectedOperator.IN_GPRS || "N/A"}
                            </span>
                          </li>
                          <li>
                            LTE:{" "}
                            <span
                              className={`badge ${
                                selectedOperator.IN_LTE === "LIVE"
                                  ? "badge-success"
                                  : selectedOperator.IN_LTE === "TESTING"
                                  ? "badge-warning"
                                  : selectedOperator.IN_LTE === "N/A"
                                  ? "badge-danger"
                                  : "badge-secondary"
                              }`}
                            >
                              {selectedOperator.IN_LTE || "N/A"}
                            </span>
                          </li>
                          <li>
                            5G NSA:{" "}
                            <span
                              className={`badge ${
                                selectedOperator.IN_5G_NSA === "LIVE"
                                  ? "badge-success"
                                  : selectedOperator.IN_5G_NSA === "TESTING"
                                  ? "badge-warning"
                                  : selectedOperator.IN_5G_NSA === "N/A"
                                  ? "badge-danger"
                                  : "badge-secondary"
                              }`}
                            >
                              {selectedOperator.IN_5G_NSA || "N/A"}
                            </span>
                          </li>
                          <li>
                            CAMEL:{" "}
                            <span
                              className={`badge ${
                                selectedOperator.IN_CAMEL === "LIVE"
                                  ? "badge-success"
                                  : selectedOperator.IN_CAMEL === "TESTING"
                                  ? "badge-warning"
                                  : selectedOperator.IN_CAMEL === "N/A"
                                  ? "badge-danger"
                                  : "badge-secondary"
                              }`}
                            >
                              {selectedOperator.IN_CAMEL || "N/A"}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="col-6">
                        <strong>OUT</strong>
                        <ul className="list-unstyled">
                          <li>
                            GSM:{" "}
                            <span
                              className={`badge ${
                                selectedOperator.OUT_GSM === "LIVE"
                                  ? "badge-success"
                                  : selectedOperator.OUT_GSM === "TESTING"
                                  ? "badge-warning"
                                  : selectedOperator.OUT_GSM === "N/A"
                                  ? "badge-danger"
                                  : "badge-secondary"
                              }`}
                            >
                              {selectedOperator.OUT_GSM || "N/A"}
                            </span>
                          </li>
                          <li>
                            GPRS:{" "}
                            <span
                              className={`badge ${
                                selectedOperator.OUT_GPRS === "LIVE"
                                  ? "badge-success"
                                  : selectedOperator.OUT_GPRS === "TESTING"
                                  ? "badge-warning"
                                  : selectedOperator.OUT_GPRS === "N/A"
                                  ? "badge-danger"
                                  : "badge-secondary"
                              }`}
                            >
                              {selectedOperator.OUT_GPRS || "N/A"}
                            </span>
                          </li>
                          <li>
                            LTE:{" "}
                            <span
                              className={`badge ${
                                selectedOperator.OUT_LTE === "LIVE"
                                  ? "badge-success"
                                  : selectedOperator.OUT_LTE === "TESTING"
                                  ? "badge-warning"
                                  : selectedOperator.OUT_LTE === "N/A"
                                  ? "badge-danger"
                                  : "badge-secondary"
                              }`}
                            >
                              {selectedOperator.OUT_LTE || "N/A"}
                            </span>
                          </li>
                          <li>
                            5G NSA:{" "}
                            <span
                              className={`badge ${
                                selectedOperator.OUT_5G_NSA === "LIVE"
                                  ? "badge-success"
                                  : selectedOperator.OUT_5G_NSA === "TESTING"
                                  ? "badge-warning"
                                  : selectedOperator.OUT_5G_NSA === "N/A"
                                  ? "badge-danger"
                                  : "badge-secondary"
                              }`}
                            >
                              {selectedOperator.OUT_5G_NSA || "N/A"}
                            </span>
                          </li>
                          <li>
                            CAMEL:{" "}
                            <span
                              className={`badge ${
                                selectedOperator.OUT_CAMEL === "LIVE"
                                  ? "badge-success"
                                  : selectedOperator.OUT_CAMEL === "TESTING"
                                  ? "badge-warning"
                                  : selectedOperator.OUT_CAMEL === "N/A"
                                  ? "badge-danger"
                                  : "badge-secondary"
                              }`}
                            >
                              {selectedOperator.OUT_CAMEL || "N/A"}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {simDetails && (
        <div className="mt-4">
          <h3>SIM Details:</h3>
          <div className="border p-3">
            {simDetails.length > 0 ? (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>SIM ID</th>
                    <th>MSISDN</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {simDetails.map((sim, index) => (
                    <tr key={index}>
                      <td>{sim["Sim#"] || "N/A"}</td>
                      <td>{sim.MSISDN || "N/A"}</td>
                      <td>{sim.Status || "N/A"}</td>
                      <td>{sim.Type || "N/A"}</td>
                      <td>{sim.Comments || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No SIM details found for this operator.</p>
            )}
          </div>
        </div>
      )}
      {operatorLogs.length > 0 && (
        <div className="mt-4">
          <h3>Operator Logs:</h3>
          <div className="border p-3">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Log Type</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {operatorLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.Date || "N/A"}</td>
                    <td>{log.LogType || "N/A"}</td>
                    <td>{log.Details || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
