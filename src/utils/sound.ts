// Sound synthesizer and player using Web Audio API + HTML5 Audio for custom uploads

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Ensure audio context is unlocked by user gesture
export function unlockAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (e) {
    console.warn('Audio unlock warning:', e);
  }
}

export function playPresetSound(presetId: string, volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    if (presetId === 'esports-horn') {
      // Powerful brassy stadium horn chord
      const freqs = [146.83, 220, 293.66, 370]; // D3 chord
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.8);
      });
    } else if (presetId === 'digital-zap') {
      // Cyber pulse zap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (presetId === 'laser-strike') {
      // High-frequency sci-fi laser
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // Classic game show buzzer
      const freqs = [150, 154]; // discordant buzzer
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.9);
      });
    }
  } catch (err) {
    console.error('Failed to play preset audio:', err);
  }
}

export function playBuzzerAudio(
  audioConfig: { presetId: string; customAudioData?: string; volume?: number }
) {
  const vol = audioConfig.volume ?? 0.8;

  if (audioConfig.presetId === 'custom' && audioConfig.customAudioData) {
    try {
      const audio = new Audio(audioConfig.customAudioData);
      audio.volume = vol;
      audio.play().catch((err) => {
        console.warn('Custom audio playback failed, falling back to preset:', err);
        playPresetSound('esports-horn', vol);
      });
    } catch {
      playPresetSound('esports-horn', vol);
    }
  } else {
    playPresetSound(audioConfig.presetId || 'esports-horn', vol);
  }
}
