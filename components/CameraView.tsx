import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tmService from '../services/tmService';
import ScannerOverlay from './ScannerOverlay';

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

const CameraView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(0);
  
  // State
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Logic State
  const [instruction, setInstruction] = useState<string>("");
  const [scanState, setScanState] = useState<'SCANNING' | 'DETECTED' | 'HELP_VIEW'>('SCANNING');
  const [detectedClass, setDetectedClass] = useState<string>("");

  // Refs for timer logic and loop control
  const lastClassRef = useRef<string>("");
  const startTimeRef = useRef<number>(0);
  const isScanningRef = useRef<boolean>(true); // Track scanning status synchronously for the loop

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

  // Sync Ref with State to prevent stale closures in animation loop
  useEffect(() => {
    isScanningRef.current = (scanState === 'SCANNING');
    
    // If we just started scanning, reset logic refs
    if (scanState === 'SCANNING') {
        startTimeRef.current = 0;
        lastClassRef.current = "";
    }
  }, [scanState]);

  // Main Prediction Loop
  const animate = useCallback(async () => {
    // 1. Strict check using Ref to stop immediately if state changes
    if (!isScanningRef.current) {
        return; 
    }

    if (videoRef.current && isModelLoaded && videoRef.current.readyState === 4) {
      const predictions = await tmService.predict(videoRef.current);
      
      // Teachable Machine standard export usually has classes in a fixed order.
      // We assume index 3 is the Environment/Background class based on requirements.
      const envClassIndex = 3;
      
      // Sort to find the top class
      const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
      const top = sorted[0];

      if (top) {
        // Check if the top prediction is the Environment class
        const isEnvironment = predictions[envClassIndex] && (top.className === predictions[envClassIndex].className);

        // Logic: If Environment OR Low Confidence -> Show Instruction
        // Using 0.85 threshold to filter noise
        if (isEnvironment || top.probability < 0.85) {
            setInstruction("Point towards a tomato leaf");
            // Reset timers so we don't accidentally detect 'Environment'
            startTimeRef.current = 0; 
            lastClassRef.current = "";
        } else {
            // It is a Plant Class (Healthy, Symptomatic, etc.)
            setInstruction(""); // Clear instruction
            
            // Timer Logic for Detection
            if (top.className === lastClassRef.current) {
                const elapsed = Date.now() - startTimeRef.current;
                if (elapsed > 3000) { // 3 Seconds threshold
                    // DETECTED!
                    // 1. Stop the loop logic immediately
                    isScanningRef.current = false;
                    
                    // 2. Update State
                    setDetectedClass(top.className);
                    setScanState('DETECTED');
                    
                    // 3. Return to prevent requesting next frame
                    return;
                }
            } else {
                lastClassRef.current = top.className;
                startTimeRef.current = Date.now();
            }
        }
      }
    }
    
    // Only continue loop if we are still scanning
    if (isScanningRef.current) {
        requestRef.current = requestAnimationFrame(animate);
    }
  }, [isModelLoaded]); 

  // Start Loop Trigger
  useEffect(() => {
      if (scanState === 'SCANNING' && isModelLoaded) {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
          requestRef.current = requestAnimationFrame(animate);
      }
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, [scanState, isModelLoaded, animate]);

  // Start Camera
  useEffect(() => {
    const startCamera = async () => {
      if (!isModelLoaded) return;
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
        setError("Unable to access camera.");
      }
    };
    if (isModelLoaded) startCamera();
    
    return () => { 
        if (requestRef.current) cancelAnimationFrame(requestRef.current); 
    };
  }, [isModelLoaded]);

  // Helper: Is this a healthy plant?
  const isHealthy = detectedClass.toLowerCase().includes('healthy');

  // Reset function
  const resetScanner = () => {
      setScanState('SCANNING');
      setInstruction("");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 h-full relative">
      {error && <div className="text-red-400 mb-4">{error}</div>}

      {/* Main Camera Feed */}
      {isModelLoaded ? (
        <div className="relative w-full aspect-square max-w-[400px] bg-black rounded-3xl shadow-2xl overflow-hidden border-4 border-slate-700">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
          
          {/* Only show overlay if we are scanning */}
          {scanState === 'SCANNING' && (
              <ScannerOverlay instruction={instruction} />
          )}
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center h-64">
             <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
             <p className="mt-4 text-slate-400">Loading Model...</p>
          </div>
      )}

      {/* --- POPUPS --- */}
      
      {/* 1. HEALTHY POPUP - Positioned with safe spacing */}
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

      {/* 2. DISEASE DETECTED POPUP - Positioned with safe spacing */}
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

      {/* 3. HELP CARD (Hardcoded Solution) - Fixed Overlay with Scroll */}
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