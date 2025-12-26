// Simple browser-based TTS for low latency in the hackathon MVP
// In production, we could swap this for Gemini Audio generation

export const speak = (text: string, priority: 'gentle' | 'urgent' = 'gentle') => {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find a good voice
  const voices = window.speechSynthesis.getVoices();
  // Prefer a female voice for "gentle/calming" effect usually associated with assistants
  const preferredVoice = voices.find(v => v.name.includes('Google') && v.name.includes('Female')) 
                      || voices.find(v => v.lang === 'en-US');
  
  if (preferredVoice) utterance.voice = preferredVoice;

  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = priority === 'gentle' ? 1.1 : 1.0;
  
  window.speechSynthesis.speak(utterance);
};

// Helper to init voices (chrome needs this)
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}
