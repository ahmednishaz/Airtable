// src/OperatorCard.js
import React from "react";

const OperatorCard = ({ operator, onClick }) => {
  return (
    <div
      className="card operator-card"
      onClick={onClick}
      style={{
        cursor: "pointer",
      }}
    >
      <div className="card-body">
        <h5 className="card-title">
          {operator.operatorName || "Unknown Operator"}
        </h5>
        <p className="card-text">
          <strong>MCCMNC:</strong> {operator.MCCMNC || "N/A"}
          <br />
          <strong>Status:</strong> {operator.Status || "N/A"}
          <br />
          <strong>Country ID:</strong> {operator.countryID || "N/A"}
          <br />
          <strong>Country Name:</strong>{" "}
          {(Array.isArray(operator.CountryName)
            ? operator.CountryName
            : []
          ).join(", ") || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default OperatorCard;
