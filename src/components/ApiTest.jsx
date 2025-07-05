import React, { useState } from "react";

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testDirectAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://localhost:7777/gateway/Users/get-all-user");
      const data = await response.json();
      setResult({
        type: "Gateway API",
        success: true,
        data: data,
      });
    } catch (error) {
      setResult({
        type: "Gateway API",
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testProxyAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/Users/get-all-user");
      const data = await response.json();
      setResult({
        type: "Proxy API",
        success: true,
        data: data,
      });
    } catch (error) {
      setResult({
        type: "Proxy API",
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>API Connection Test</h2>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={testDirectAPI} disabled={loading}>
          Test Gateway API (https://localhost:7777/gateway)
        </button>
        <button onClick={testProxyAPI} disabled={loading} style={{ marginLeft: "10px" }}>
          Test Proxy API (/api)
        </button>
      </div>
      
      {loading && <p>Testing...</p>}
      
      {result && (
        <div style={{ 
          border: "1px solid #ccc", 
          padding: "10px", 
          marginTop: "10px",
          backgroundColor: result.success ? "#d4edda" : "#f8d7da"
        }}>
          <h3>{result.type} Result:</h3>
          <p><strong>Success:</strong> {result.success ? "Yes" : "No"}</p>
          {result.success ? (
            <div>
              <p><strong>Data:</strong></p>
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </div>
          ) : (
            <p><strong>Error:</strong> {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTest;
