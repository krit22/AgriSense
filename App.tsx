import React from 'react';
import CameraView from './components/CameraView';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center py-8">
      <header className="mb-8 text-center px-4">
        <div className="inline-flex items-center justify-center p-2 mb-3 bg-slate-800/50 rounded-full border border-slate-700 backdrop-blur-sm">
           <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
           <span className="text-xs text-slate-300 font-medium tracking-wide">SYSTEM ACTIVE</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
          Object Scanner
        </h1>
        <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base">
          Point your camera at the object to classify it in real-time.
        </p>
      </header>

      <main className="w-full flex-grow">
        <CameraView />
      </main>

      <footer className="mt-8 text-slate-600 text-xs text-center pb-4">
        <p>Powered by Teachable Machine</p>
      </footer>
    </div>
  );
};

export default App;
