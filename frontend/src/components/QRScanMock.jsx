import React from "react";

function QRScanMock({ label, onScan }) {
  const [value, setValue] = React.useState("");

  const handleUseMock = () => {
    if (value.trim()) {
      onScan(value.trim());
    }
  };

  return (
    <div className="border rounded p-3 bg-white">
      <p className="text-sm font-medium mb-2">{label}</p>
      <p className="text-xs text-gray-600 mb-2">
        This is a mock QR scanner. Enter a bin or product code to simulate a scan.
      </p>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. BIN-001 or SKU-123"
        />
        <button onClick={handleUseMock} className="px-3 py-1 bg-primary text-white text-sm rounded">
          Use Code
        </button>
      </div>
    </div>
  );
}

export default QRScanMock;
