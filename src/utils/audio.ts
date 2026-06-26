let audioCtx: AudioContext | null = null;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playTone = (progress: number) => {
  if (!audioCtx) return;
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Map progress (0.0 to 1.0) to a smoothly rising frequency
  const baseFreq = 200;
  const maxFreq = 2000;
  const freq = baseFreq + (progress * (maxFreq - baseFreq));
  
  oscillator.type = 'sine';
  oscillator.frequency.value = freq;
  
  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
};
