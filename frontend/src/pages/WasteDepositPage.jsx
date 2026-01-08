import React from "react";
import { createApiClient } from "../lib/api";
import QRScanMock from "../components/QRScanMock";

function WasteDepositPage() {
  const [token] = React.useState(localStorage.getItem("kadham_token"));
  const api = React.useMemo(() => createApiClient(token), [token]);
  const [binCode, setBinCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleScan = (code) => {
    setBinCode(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const depositRes = await api.post("/deposits", {
        binId: 1,
        description
      });
      setResult(depositRes.data);
    } catch (err) {
      setError("Failed to submit deposit");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Waste Deposit</h1>
      <QRScanMock label="Scan smart bin QR (mock)" onScan={handleScan} />
      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded shadow">
        <div>
          <label className="block text-sm mb-1">Detected bin code (mock)</label>
          <input
            className="w-full border rounded px-2 py-1 text-sm bg-gray-50"
            value={binCode}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            className="w-full border rounded px-2 py-1 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the waste you are depositing"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded text-sm font-medium"
        >
          Submit deposit
        </button>
      </form>
      {result && (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
          Deposit created with ID {result.id}. It will be verified before rewards are issued.
        </div>
      )}
    </div>
  );
}

export default WasteDepositPage;
