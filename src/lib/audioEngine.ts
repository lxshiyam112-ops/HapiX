/**
 * Web Audio Engine for Real-time Voice Processing, Microphones, Sound Effects, and Room BGM
 */

let audioCtx: AudioContext | null = null;
let micStream: MediaStream | null = null;
let micSource: MediaStreamAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;
let pitchShiftNode: BiquadFilterNode | null = null;
let delayNode: DelayNode | null = null;
let feedbackNode: GainNode | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Request real microphone input from browser
 */
export async function startMicrophone(
  onVolumeChange: (vol: number) => void,
  effect: string = 'normal'
): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const ctx = getAudioContext();
    micStream = stream;
    micSource = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64;

    // Optional voice effect chain
    const outputGain = ctx.createGain();
    outputGain.gain.value = 0.8;

    if (effect === 'echo') {
      delayNode = ctx.createDelay();
      delayNode.delayTime.value = 0.25;
      feedbackNode = ctx.createGain();
      feedbackNode.gain.value = 0.4;

      micSource.connect(delayNode);
      delayNode.connect(feedbackNode);
      feedbackNode.connect(delayNode);
      delayNode.connect(analyser);
    } else if (effect === 'deep') {
      pitchShiftNode = ctx.createBiquadFilter();
      pitchShiftNode.type = 'lowshelf';
      pitchShiftNode.frequency.value = 300;
      pitchShiftNode.gain.value = 12;

      micSource.connect(pitchShiftNode);
      pitchShiftNode.connect(analyser);
    } else if (effect === 'reverb') {
      delayNode = ctx.createDelay();
      delayNode.delayTime.value = 0.12;
      feedbackNode = ctx.createGain();
      feedbackNode.gain.value = 0.6;

      micSource.connect(delayNode);
      delayNode.connect(feedbackNode);
      feedbackNode.connect(delayNode);
      delayNode.connect(analyser);
    } else {
      micSource.connect(analyser);
    }

    // Monitor volume level loop
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateVolume = () => {
      if (!analyser || !micStream) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      // Scale 0 - 255 to 0 - 100
      const normVol = Math.min(100, Math.round((avg / 128) * 100));
      onVolumeChange(normVol);

      if (micStream.active) {
        requestAnimationFrame(updateVolume);
      }
    };

    updateVolume();
    return true;
  } catch (err) {
    console.warn('Microphone access denied or error:', err);
    return false;
  }
}

/**
 * Stop active microphone stream
 */
export function stopMicrophone() {
  if (micStream) {
    micStream.getTracks().forEach((t) => t.stop());
    micStream = null;
  }
  micSource = null;
  analyser = null;
}

/**
 * Soundboard FX Synthesizer using Web Audio API
 */
export function playSoundboardEffect(type: 'applause' | 'laughter' | 'drumroll' | 'cheer' | 'horn' | 'coin') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'coin') {
      // High pitch chime sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'horn') {
      // Party Air Horn
      const freqs = [350, 440, 520];
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      });
    } else if (type === 'cheer' || type === 'applause') {
      // Noise buffer for cheering/applause
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 1.5);
    } else if (type === 'drumroll') {
      // Drumroll effect
      for (let i = 0; i < 12; i++) {
        const t = now + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.07);
      }
    } else if (type === 'laughter') {
      // Upbeat synth chime sequence
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    }
  } catch (err) {
    console.warn('Audio FX playback error:', err);
  }
}

/**
 * Background Music (BGM) Synth Loop
 */
let bgmOscillators: OscillatorNode[] = [];
let bgmGain: GainNode | null = null;
let bgmInterval: number | null = null;

export function startBGMTrack(genre: 'lofi' | 'party' | 'chill' | 'romantic') {
  stopBGMTrack();
  try {
    const ctx = getAudioContext();
    bgmGain = ctx.createGain();
    bgmGain.gain.setValueAtTime(0.08, ctx.currentTime);
    bgmGain.connect(ctx.destination);

    let chordProgression = [261.63, 329.63, 392.0]; // C Major
    if (genre === 'lofi') {
      chordProgression = [220.0, 261.63, 329.63, 392.0]; // A Minor 7
    } else if (genre === 'party') {
      chordProgression = [349.23, 440.0, 523.25]; // F Major
    } else if (genre === 'romantic') {
      chordProgression = [293.66, 369.99, 440.0]; // D Major
    }

    let noteIdx = 0;
    bgmInterval = window.setInterval(() => {
      if (!bgmGain || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = genre === 'party' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(chordProgression[noteIdx % chordProgression.length], now);

      noteGain.gain.setValueAtTime(0.05, now);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(noteGain);
      noteGain.connect(bgmGain);

      osc.start(now);
      osc.stop(now + 0.65);

      noteIdx++;
    }, 600);
  } catch (err) {
    console.warn('BGM player error:', err);
  }
}

export function stopBGMTrack() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  if (bgmGain) {
    bgmGain.disconnect();
    bgmGain = null;
  }
}
