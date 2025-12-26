import React from 'react';

interface ScannerOverlayProps {
  instruction?: string;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ instruction }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 rounded-lg overflow-hidden flex flex-col items-center justify-center">
      
      {/* Visual Frame / Brackets */}
      {!instruction && (
        <div className="absolute inset-0 border-2 border-slate-500/30 rounded-lg">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-accent rounded-tl-lg opacity-80"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-accent rounded-tr-lg opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-accent rounded-bl-lg opacity-80"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-accent rounded-br-lg opacity-80"></div>
        </div>
      )}

      {/* Scanning Laser Animation - Only show if no instruction (active scanning) */}
      {!instruction && (
         <div className="absolute w-full h-0.5 bg-brand-accent shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-scan opacity-60"></div>
      )}
      
      {/* Instruction Text (for Environment/Background) */}
      {instruction && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-slate-900/80 px-8 py-4 rounded-2xl border border-white/20 animate-pulse mx-8">
                <p className="text-white font-bold text-xl text-center shadow-black drop-shadow-md leading-relaxed">
                    {instruction}
                </p>
            </div>
        </div>
      )}

      {/* Grid Effect - subtle background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(6,182,212,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.3)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
    </div>
  );
};

export default ScannerOverlay;
