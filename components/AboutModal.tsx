import React from 'react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-slide-up relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">ℹ️</span> Detection Guide
          </h2>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <p className="text-slate-400 text-sm">
            This AI scanner analyzes tomato leaves to determine their health status. Here is what each category means:
          </p>

          {/* Healthy */}
          <div className="flex gap-4 items-start p-3 rounded-xl bg-slate-700/30 border border-slate-700">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/50">
              <span className="text-2xl">🌿</span>
            </div>
            <div>
              <h3 className="text-green-400 font-bold text-lg">Healthy</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Leaves are vibrant green with consistent texture. No visible spots, yellowing, or wilting. Continue regular care.
              </p>
            </div>
          </div>

          {/* Pre-symptomatic */}
          <div className="flex gap-4 items-start p-3 rounded-xl bg-slate-700/30 border border-slate-700">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 border border-yellow-500/50">
              <span className="text-2xl">🔍</span>
            </div>
            <div>
              <h3 className="text-yellow-400 font-bold text-lg">Early Signs</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                <span className="italic text-slate-500 block text-xs mb-1">(Pre-symptomatic)</span>
                Subtle indications of stress. Look for slight yellowing (chlorosis), tiny irregularities, or pale halos before distinct spots form.
              </p>
            </div>
          </div>

          {/* Symptomatic */}
          <div className="flex gap-4 items-start p-3 rounded-xl bg-slate-700/30 border border-slate-700">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/50">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-red-400 font-bold text-lg">Visible Disease</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                <span className="italic text-slate-500 block text-xs mb-1">(Symptomatic)</span>
                Clear signs of blight. Dark irregular spots, brown lesions, white fungal growth on undersides, or drying/wilting leaves.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors border border-slate-600"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;