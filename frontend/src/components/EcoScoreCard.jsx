import React from "react";

function EcoScoreCard({ score, label }) {
  const color = score >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";

  return (
    <div className={`rounded p-4 ${color}`}>
      <p className="text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold">{score}</p>
      <p className="text-xs mt-1">Higher scores indicate more sustainable behavior or products.</p>
    </div>
  );
}

export default EcoScoreCard;
