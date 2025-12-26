import React from 'react';
import { Prediction } from '../types';

interface PredictionListProps {
  predictions: Prediction[];
}

const PredictionList: React.FC<PredictionListProps> = ({ predictions }) => {
  if (predictions.length === 0) return null;

  // Sort by probability desc
  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
  const topPrediction = sorted[0];

  return (
    <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl mt-6">
      <div className="mb-4 text-center">
        <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Detected Class</span>
        <h2 className="text-3xl font-bold text-white mt-1">
            {topPrediction.probability > 0.8 ? (
                <span className="text-brand-accent">{topPrediction.className}</span>
            ) : (
                <span className="text-slate-500">Scanning...</span>
            )}
        </h2>
      </div>

      <div className="space-y-3">
        {predictions.map((p) => (
          <div key={p.className} className="flex items-center gap-3 text-sm">
            <div className="w-24 text-right truncate font-medium text-slate-300">
              {p.className}
            </div>
            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  p.className === topPrediction.className && p.probability > 0.5 
                    ? 'bg-brand-accent shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                    : 'bg-slate-500'
                }`}
                style={{ width: `${p.probability * 100}%` }}
              ></div>
            </div>
            <div className="w-10 text-xs text-slate-400">
              {Math.round(p.probability * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictionList;
