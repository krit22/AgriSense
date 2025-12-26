import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tmService from '../services/tmService';
import ScannerOverlay from './ScannerOverlay';
import DiseaseOverlay from './DiseaseOverlay';

// Import Preset Image Data
import { HEALTHY_BASE64 } from '../data/healthy';
import { PRESYMPTOMATIC_BASE64 } from '../data/presymptomatic';
import { SYMPTOMATIC_BASE64 } from '../data/symptomatic';

// Hardcoded solution for the MVP (Tomato Blight)
const HARDCODED_SOLUTION = {
    title: "Tomato Blight Management",
    steps: [
        "Remove infected leaves immediately.",
        "Ensure good air circulation.",
        "Water at base, keep leaves dry.",
        "Apply copper fungicide or Neem oil."
    ]
};

const PRESETS = [
    {
        category: "Healthy",
        label: "Healthy Plant",
        url: HEALTHY_BASE64, 
        color: "bg-green-500"
    },
    {
        category: "Pre-symptomatic",
        label: "Early Signs",
        url: PRESYMPTOMATIC_BASE64, 
        color: "bg-yellow-500"
    },
    {
        category: "Symptomatic",
        label: "Visible Disease",
        url: SYMPTOMATIC_BASE64, 
        color: "bg-red-500"
    }
];

const CameraView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null); // For analyzing static images
  const requestRef = useRef<number>(0);
  
  // State
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Logic State
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [instruction, setInstruction] = useState<string>("");
  // Added 'ANALYZING' state
  const [scanState, setScanState] = useState<'SCANNING' | 'ANALYZING' | 'DETECTED' | 'HELP_VIEW'>('SCANNING');
  const [detectedClass, setDetectedClass] = useState<string>("");

  // Refs for timer logic and loop control
  const lastClassRef = useRef<string>("");
  const startTimeRef = useRef<number>(0);
  const isScanningRef = useRef<boolean>(true); // Track scanning status synchronously

  // Initialize Model
  useEffect(() => {
    const initModel = async () => {
      try {
        const loaded = await tmService.loadModel();
        if (loaded) {
          setIsModelLoaded(true);
        } else {
          setError("Failed to load AI model.");
        }
      } catch (err) {
        setError("Error initializing model.");
        console.error(err);
      }
    };
    initModel();
  }, []);

  // System Ready Delay
  useEffect(() => {
      if (isModelLoaded) {
          const timer = setTimeout(() => {
              setIsSystemReady(true);
          }, 5000);
          return () => clearTimeout(timer);
      }
  }, [isModelLoaded]);

  // Sync Ref with State
  useEffect(() => {
    isScanningRef.current = (scanState === 'SCANNING');
    if (scanState === 'SCANNING') {
        startTimeRef.current = 0;
        lastClassRef.current = "";
    }
  }, [scanState]);

  // --- LIVE CAMERA LOOP ---
  const animate = useCallback(async () => {
    if (!isScanningRef.current || activePreset) return; // Don't run loop if using preset or analyzing

    if (videoRef.current && isModelLoaded && videoRef.current.readyState === 4) {
      const predictions = await tmService.predict(videoRef.current);
      handlePredictions(predictions);
    }
    
    if (isScanningRef.current && !activePreset) {
        requestRef.current = requestAnimationFrame(animate);
    }
  }, [isModelLoaded, activePreset]); 

  // --- PREDICTION LOGIC (Shared) ---
  const handlePredictions = (predictions: any[]) => {
      const envClassIndex = 3; // Assuming index 3 is Environment/Background
      const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
      const top = sorted[0];

      if (top) {
        // 1. Filter Noise
        const isEnvironment = predictions[envClassIndex] && (top.className === predictions[envClassIndex].className);
        
        if (isEnvironment || top.probability < 0.85) {
            setInstruction("Point towards a tomato leaf");
            startTimeRef.current = 0; 
            lastClassRef.current = "";
        } else {
            // 2. Valid Detection Candidate
            setInstruction(""); 
            
            if (top.className === lastClassRef.current) {
                const elapsed = Date.now() - startTimeRef.current;
                if (elapsed > 2000) { // 2 Seconds hold for Camera
                    processFinalResult(top.className);
                }
            } else {
                lastClassRef.current = top.className;
                startTimeRef.current = Date.now();
            }
        }
      }
  };

  // Centralized logic to handle the transition from detection to showing results
  const processFinalResult = (className: string) => {
      // Stop the scanning loop
      isScanningRef.current = false;
      setDetectedClass(className);

      const isHealthyCheck = className.toLowerCase().includes('healthy');

      if (isHealthyCheck) {
          // If healthy, show immediately
          setScanState('DETECTED');
      } else {
          // If disease, show "Fake" analyzing effect
          setScanState('ANALYZING');
          setInstruction("Isolating Symptoms...");
          
          // Wait 2 seconds with the overlay before showing result
          setTimeout(() => {
              setInstruction("");
              setScanState('DETECTED');
          }, 2500);
      }
  };

  // --- PRESET LOGIC ---
  const handlePresetSelect = (url: string) => {
      if (!isSystemReady) return; 

      // 1. Reset state
      setScanState('SCANNING');
      setActivePreset(url);
      setInstruction("Analyzing Image...");
      isScanningRef.current = true;

      // 2. Simulate Delay for effect, then predict
      setTimeout(async () => {
          if (imageRef.current && isModelLoaded) {
              const predictions = await tmService.predict(imageRef.current);
              
              const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
              const top = sorted[0];

              if (top) {
                  processFinalResult(top.className);
              }
          }
      }, 1000); 
  };

  // Start Loop Trigger (Only for Camera)
  useEffect(() => {
      if (scanState === 'SCANNING' && isModelLoaded && !activePreset) {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
          requestRef.current = requestAnimationFrame(animate);
      }
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, [scanState, isModelLoaded, animate, activePreset]);

  // Start Camera
  useEffect(() => {
    const startCamera = async () => {
      if (!isModelLoaded || activePreset) return; // Don't start camera if preset is active
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: false, 
            video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setScanState('SCANNING'); 
          };
        }
      } catch (err) {
        console.warn("Camera access denied or failed", err);
      }
    };
    if (isModelLoaded) startCamera();
    
    return () => { 
        if (requestRef.current) cancelAnimationFrame(requestRef.current); 
    };
  }, [isModelLoaded, activePreset]);

  // Helpers
  const isHealthy = detectedClass.toLowerCase().includes('healthy');
  
  const resetScanner = () => {
      setScanState('SCANNING');
      setInstruction("");
      setActivePreset(null); // Go back to camera mode by default
      setDetectedClass("");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 h-full relative">
      {error && <div className="text-red-400 mb-4">{error}</div>}

      {/* --- MAIN VIEWPORT (Camera or Image) --- */}
      {isModelLoaded ? (
        <div className="relative w-full aspect-square max-w-[400px] bg-black rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-700">
          
          {/* A. Camera View */}
          {!activePreset && (
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
          )}

          {/* B. Preset Image View */}
          {activePreset && (
              <img 
                ref={imageRef} 
                src={activePreset} 
                alt="Test Preset" 
                className="absolute inset-0 w-full h-full object-cover"
                crossOrigin="anonymous" 
              />
          )}
          
          {/* Standard Overlay (Brackets, etc) */}
          {scanState === 'SCANNING' && (
              <ScannerOverlay instruction={instruction} />
          )}

          {/* Disease Analyzing Overlay (Fake red spots) */}
          {scanState === 'ANALYZING' && (
              <>
                <DiseaseOverlay />
                {/* Analyzing Text */}
                <div className="absolute bottom-10 inset-x-0 flex justify-center z-30">
                    <div className="bg-slate-900/80 px-6 py-2 rounded-full border border-red-500/50 backdrop-blur-sm animate-pulse">
                        <span className="text-red-400 font-mono text-sm tracking-widest font-bold uppercase">
                            ⚠️ Isolating Symptoms...
                        </span>
                    </div>
                </div>
              </>
          )}

        </div>
      ) : (
          <div className="flex flex-col items-center justify-center h-64">
             <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
             <p className="mt-4 text-slate-400">Loading AI Model...</p>
          </div>
      )}


      {/* --- PRESETS SELECTION SECTION --- */}
      {/* Hide during analyzing/results */}
      {scanState === 'SCANNING' && (
          <div className="mt-8 w-full animate-slide-up min-h-[120px]">
              <div className="text-center mb-4">
                  <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
                      Do not have an image to scan?
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">Try one of these pre-sets</p>
              </div>

              {!isSystemReady ? (
                 <div className="flex flex-col items-center justify-center py-4 space-y-2 opacity-50">
                    <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 font-mono">INITIALIZING SYSTEM...</span>
                 </div>
              ) : (
                  <div className="grid grid-cols-3 gap-3 animate-slide-up">
                      {PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => handlePresetSelect(preset.url)}
                            disabled={!!activePreset} // Disable while analyzing
                            className={`
                                relative group overflow-hidden rounded-xl border border-slate-700 
                                transition-all duration-300 hover:scale-105 hover:border-brand-accent
                                ${activePreset === preset.url ? 'ring-2 ring-brand-accent scale-95 opacity-80' : 'opacity-100'}
                            `}
                          >
                              <div className={`absolute top-0 left-0 w-full h-1 ${preset.color}`}></div>
                              <img src={preset.url} alt={preset.label} className="w-full h-20 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                  <span className="text-[10px] md:text-xs font-bold text-white text-center px-1 drop-shadow-md">
                                      {preset.label}
                                  </span>
                              </div>
                          </button>
                      ))}
                  </div>
              )}
          </div>
      )}


      {/* --- RESULTS POPUPS --- */}
      
      {/* 1. HEALTHY POPUP */}
      {scanState === 'DETECTED' && isHealthy && (
          <div className="absolute bottom-4 left-4 right-4 bg-green-600 text-white p-6 rounded-2xl shadow-2xl animate-slide-up text-center z-20 max-h-[50vh] overflow-y-auto">
              <div className="text-4xl mb-2">🌿</div>
              <h2 className="text-2xl font-bold mb-2">Leaf is Healthy!</h2>
              <p className="mb-4 opacity-90">Great job. Keep monitoring.</p>
              <button 
                onClick={resetScanner}
                className="bg-white text-green-700 font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Scan Next
              </button>
          </div>
      )}

      {/* 2. DISEASE DETECTED POPUP */}
      {scanState === 'DETECTED' && !isHealthy && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-800 text-white p-5 rounded-2xl shadow-2xl border border-orange-500 animate-slide-up text-center z-20 max-h-[60vh] overflow-y-auto">
              <div className="text-4xl mb-1">⚠️</div>
              <h2 className="text-lg font-bold text-orange-400">Detected Issue</h2>
              <p className="text-2xl font-extrabold mb-4">{detectedClass}</p>
              
              <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setScanState('HELP_VIEW')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg transition-colors"
                  >
                    Get Help
                  </button>
                  <button 
                    onClick={resetScanner}
                    className="w-full bg-slate-700 text-slate-300 font-medium py-3 rounded-xl hover:bg-slate-600"
                  >
                    Scan Again
                  </button>
              </div>
          </div>
      )}

      {/* 3. HELP CARD */}
      {scanState === 'HELP_VIEW' && (
          <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md overflow-y-auto">
              <div className="min-h-full w-full flex items-center justify-center p-4">
                  <div className="bg-slate-800 w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-slide-up relative">
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-5 text-white">
                          <h2 className="text-xl font-bold">Action Plan</h2>
                          <p className="text-sm opacity-90">For {detectedClass}</p>
                      </div>
                      
                      <div className="p-5">
                          <h3 className="font-bold text-white mb-3 text-lg">{HARDCODED_SOLUTION.title}</h3>
                          <ul className="space-y-3 mb-6">
                              {HARDCODED_SOLUTION.steps.map((step, idx) => (
                                  <li key={idx} className="flex items-start text-slate-300">
                                      <span className="bg-slate-700 text-slate-400 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 flex-shrink-0 mt-0.5">{idx + 1}</span>
                                      <span className="text-sm leading-tight">{step}</span>
                                  </li>
                              ))}
                          </ul>

                          <div className="space-y-3">
                              <a 
                                href={`https://www.google.com/search?q=${encodeURIComponent(detectedClass + " treatment")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-colors"
                              >
                                Search on Google
                              </a>

                              <button 
                                onClick={resetScanner}
                                className="block w-full text-center border-2 border-slate-600 text-slate-400 font-bold py-3 rounded-xl hover:text-white hover:border-white transition-colors"
                              >
                                Close & Scan Next
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default CameraView;