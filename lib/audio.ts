let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function playSuccessSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Play a pleasant ascending chord (C-E-G)
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = freq;

    const startTime = now + index * 0.08;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, startTime + 0.4);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.5);
  });
}

export function playErrorSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Play a gentle descending tone
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(400, now);
  oscillator.frequency.linearRampToValueAtTime(300, now + 0.2);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.12, now + 0.02);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.3);

  oscillator.start(now);
  oscillator.stop(now + 0.35);
}
