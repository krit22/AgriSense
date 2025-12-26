import React from 'react';
import { AgentResponse } from '../types';

interface ResultCardProps {
  data: AgentResponse;
  onDismiss: () => void;
  isLoading: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ data, onDismiss, isLoading }) => {
  
  if (isLoading) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700 p-6 rounded-t-3xl animate-slide-up z-50 min-h-[300px] flex flex-col items-center justify-center">
         <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
         <p className="text-indigo-300 font-medium animate-pulse">Consulting AI Agronomist...</p>
      </div>
    );
  }

  const isHealthy = data.diagnosis.toLowerCase().includes('healthy');
  const accentColor = isHealthy ? 'text-green-400' : 'text-orange-400';
  const borderColor = isHealthy ? 'border-green-500/30' : 'border-orange-500/30';

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 p-6 rounded-t-3xl animate-slide-up z-50 shadow-2xl overflow-y-auto max-h-[70vh]">
      
      {/* Drag handle */}
      <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
           <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Diagnosis</span>
           <h2 className={`text-3xl font-bold ${accentColor} mt-1`}>{data.diagnosis}</h2>
        </div>
        <button 
          onClick={onDismiss}
          className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors"
        >
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-6">
        <div className="flex items-start gap-3">
            <span className="text-2xl">👩‍🌾</span>
            <div>
                 <p className="text-slate-200 leading-relaxed italic">"{data.advice}"</p>
            </div>
        </div>
      </div>

      {data.remedies.length > 0 && (
        <div className="space-y-4 mb-6">
           <h3 className="text-sm font-semibold text-slate-400 uppercase">Recommended Actions</h3>
           {data.remedies.map((remedy, idx) => (
             <div key={idx} className={`p-4 rounded-lg border ${borderColor} bg-slate-800/30 flex items-center justify-between`}>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${remedy.type === 'organic' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>
                        {remedy.type}
                      </span>
                      <h4 className="text-white font-medium">{remedy.name}</h4>
                   </div>
                   <p className="text-sm text-slate-400">{remedy.action}</p>
                </div>
             </div>
           ))}
        </div>
      )}

      {data.productMatch && !isHealthy && (
         <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
            <span>🛒</span> Purchase {data.productMatch}
         </button>
      )}
      
      {isHealthy && (
         <button onClick={onDismiss} className="w-full py-4 bg-green-600 rounded-xl font-bold text-white shadow-lg shadow-green-500/30 active:scale-95 transition-transform">
            Scan Next Plant
         </button>
      )}

    </div>
  );
};

export default ResultCard;
