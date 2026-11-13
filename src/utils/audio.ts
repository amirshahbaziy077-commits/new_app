let sharedAudioCtx: AudioContext | null = null;
let globalSoundEnabled = true;
let alphabetPauseTimer: number | null = null;

function clearAlphabetPauseTimer() {
  if (alphabetPauseTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(alphabetPauseTimer);
    alphabetPauseTimer = null;
  }
}

export function setSoundEnabled(enabled: boolean) {
  globalSoundEnabled = enabled;
  if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    clearAlphabetPauseTimer();
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore speechSynthesis cancel errors
    }
  }
}

export function isSoundEnabled(): boolean {
  return globalSoundEnabled;
}

function getAudioContext(): AudioContext | null {
  if (!globalSoundEnabled || typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    void sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function playTone(
  frequency: number,
  startOffsetSec: number,
  durationSec: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.18
) {
  if (!globalSoundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startOffsetSec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationSec + 0.02);
}

export function playCorrectDing() {
  playTone(659.25, 0, 0.14, 'triangle', 0.2);
  playTone(987.77, 0.1, 0.28, 'triangle', 0.22);
}

export function playWrongTone() {
  playTone(260, 0, 0.16, 'sine', 0.16);
  playTone(210, 0.12, 0.22, 'sine', 0.14);
}

export function playTapPop() {
  playTone(520, 0, 0.07, 'sine', 0.1);
}

export function playWinFanfare() {
  playTone(523.25, 0.0, 0.15, 'triangle', 0.2);
  playTone(659.25, 0.13, 0.15, 'triangle', 0.2);
  playTone(783.99, 0.26, 0.15, 'triangle', 0.2);
  playTone(1046.5, 0.4, 0.42, 'triangle', 0.24);
}

function createUsUtterance(text: string, rate: number, pitch: number): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voices = window.speechSynthesis.getVoices();
  const usVoice =
    voices.find((v) => v.lang === 'en-US' && v.localService) ||
    voices.find((v) => v.lang.startsWith('en-US')) ||
    voices.find((v) => v.lang.startsWith('en'));

  if (usVoice) {
    utterance.voice = usVoice;
  }

  return utterance;
}

export function speakWord(word: string, rate = 0.85, pitch = 1.08) {
  if (!globalSoundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  clearAlphabetPauseTimer();

  try {
    window.speechSynthesis.cancel();
    const utterance = createUsUtterance(word, rate, pitch);
    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful no-op when speech synthesis is unavailable
  }
}

/**
 * Speaks an alphabet letter and example word slowly (0.65 rate) with a natural pause
 * ("A ... Apple.") so young children can hear both clearly.
 */
export function speakAlphabetItem(letter: string, word: string) {
  if (!globalSoundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  clearAlphabetPauseTimer();

  try {
    window.speechSynthesis.cancel();
    const letterUtterance = createUsUtterance(`${letter}.`, 0.65, 1.12);
    const wordUtterance = createUsUtterance(`${word}.`, 0.65, 1.12);

    let wordQueued = false;
    const speakExampleWord = () => {
      if (wordQueued || !globalSoundEnabled) return;
      wordQueued = true;
      alphabetPauseTimer = window.setTimeout(() => {
        alphabetPauseTimer = null;
        if (!globalSoundEnabled) return;
        try {
          window.speechSynthesis.speak(wordUtterance);
        } catch {
          // Ignore speechSynthesis speak errors
        }
      }, 420);
    };

    letterUtterance.onend = speakExampleWord;
    letterUtterance.onerror = speakExampleWord;

    window.speechSynthesis.speak(letterUtterance);
  } catch {
    // Graceful no-op when speech synthesis is unavailable
  }
}
