import { TM_MODEL_URL } from '../constants';
import { Prediction } from '../types';

// We use the global window object for tmImage because we loaded it via script tags in index.html
// to ensure compatibility across different sandbox environments where npm install might fail.
declare global {
  interface Window {
    tmImage: any;
  }
}

let model: any = null;
let maxPredictions = 0;

export const loadModel = async (): Promise<boolean> => {
  try {
    const modelURL = TM_MODEL_URL + 'model.json';
    const metadataURL = TM_MODEL_URL + 'metadata.json';

    // Using the globally loaded library
    if (!window.tmImage) {
      throw new Error("Teachable Machine library not loaded");
    }

    model = await window.tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    return true;
  } catch (error) {
    console.error("Error loading model:", error);
    return false;
  }
};

// Fix: Allow HTMLImageElement in predict function
export const predict = async (input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement): Promise<Prediction[]> => {
  if (!model || !input) return [];

  const prediction = await model.predict(input);
  return prediction;
};

export const getClassLabels = (): string[] => {
  if (!model) return [];
  return model.getClassLabels();
};