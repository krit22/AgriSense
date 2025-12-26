import React, { useState } from 'react';
import CameraView from './components/CameraView';
import AboutModal from './components/AboutModal';

const App: React.FC = () => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center py-8 relative">
      
      {/* Header */}
      <header className="mb-6 text-center px-4 w-full relative z-30">
        <div className="absolute right-4 top-0">
          <button 
            onClick={() => setShowAbout(true)}
            className="text-slate-400 hover:text-cyan-400 transition-colors flex flex-col items-center group"
          >
            <div className="w-8 h-8 rounded-full border border-slate-600 group-hover:border-cyan-400 flex items-center justify-center mb-1">
              <span className="text-sm font-bold serif">i</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4">About</span>
          </button>
        </div>

        <div className="inline-flex items-center justify-center p-2 mb-3 bg-slate-800/50 rounded-full border border-slate-700 backdrop-blur-sm">
           <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
           <span className="text-xs text-slate-300 font-medium tracking-wide">SYSTEM ACTIVE</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
          Tomato Blight Detector
        </h1>
        <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base">
          Point your camera towards a tomato leaf to scan and get results.
        </p>
      </header>

      {/* Main Content */}
      <main className="w-full flex-grow relative z-10">
        <CameraView />
      </main>

      {/* Footer - Z-Index 50 to ensure visibility over camera elements if needed */}
      <footer className="mt-8 pb-8 text-center px-4 w-full relative z-50">
        <p className="text-slate-600 text-xs mb-3 font-mono tracking-wider uppercase opacity-70">Powered by Teachable Machine</p>
        
        <div className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/80 rounded-full border border-slate-700/50 backdrop-blur-md shadow-lg transform hover:scale-105 transition-all duration-300 cursor-default">
            <span className="text-slate-200 font-semibold text-sm md:text-base tracking-wide">Built by Krit with</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6 text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
};

export default App;