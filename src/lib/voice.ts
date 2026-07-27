// Voice engine: SpeechSynthesis (AI speaks) + SpeechRecognition (user answers).
// Handles network errors gracefully with auto-retry so the mic never freezes.

export type RecognitionHandlers = {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  onStart?: () => void;
};

const MAX_RETRIES = 3;
const RETRYABLE_ERRORS = new Set([
  'network',
  'no-speech',
  'audio-capture',
  'service-not-allowed',
  'aborted',
]);

export class VoiceEngine {
  private synth: SpeechSynthesis | null;
  private recognition: any | null;
  private voices: SpeechSynthesisVoice[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private handlers: RecognitionHandlers | null = null;
  private listening = false;
  private stopped = false;
  private retryCount = 0;
  private retryTimer: number | null = null;

  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.loadVoices();
    if (this.synth) {
      // Voices load asynchronously in some browsers.
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
    this.initRecognition();
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    this.preferredVoice =
      this.voices.find((v) => /en-US/i.test(v.lang) && /female|samantha|zira|google/i.test(v.name)) ||
      this.voices.find((v) => /en-US/i.test(v.lang)) ||
      this.voices.find((v) => /^en/i.test(v.lang)) ||
      this.voices[0] ||
      null;
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  get isSpeechSynthesisSupported() { return !!this.synth; }
  get isRecognitionSupported() { return !!this.recognition; }

  /** Speak text aloud. Resolves when speech ends (or is cancelled). */
  speak(text: string, opts: { rate?: number; pitch?: number } = {}): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        // No TTS — resolve immediately so the flow can continue.
        resolve();
        return;
      }
      this.cancelSpeech();
      const u = new SpeechSynthesisUtterance(text);
      if (this.preferredVoice) u.voice = this.preferredVoice;
      u.rate = opts.rate ?? 1;
      u.pitch = opts.pitch ?? 1;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      this.synth.speak(u);
    });
  }

  cancelSpeech() {
    if (!this.synth) return;
    try { this.synth.cancel(); } catch { /* ignore */ }
  }

  /** Start listening for the user's answer. */
  startListening(handlers: RecognitionHandlers) {
    this.handlers = handlers;
    this.stopped = false;
    this.retryCount = 0;
    this.beginRecognition();
  }

  private beginRecognition() {
    if (!this.recognition || this.stopped) {
      this.handlers?.onStart?.();
      return;
    }
    try {
      this.recognition.onstart = () => {
        this.listening = true;
        this.handlers?.onStart?.();
      };
      this.recognition.onresult = (e: any) => {
        this.retryCount = 0; // successful activity resets retry budget
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) final += r[0].transcript;
          else interim += r[0].transcript;
        }
        if (final) this.handlers?.onResult(final.trim(), true);
        else if (interim) this.handlers?.onResult(interim.trim(), false);
      };
      this.recognition.onerror = (e: any) => {
        const err = e?.error || 'unknown';
        this.listening = false;
        if (RETRYABLE_ERRORS.has(err) && this.retryCount < MAX_RETRIES && !this.stopped) {
          this.retryCount += 1;
          this.handlers?.onError(err);
          // Auto-retry after a short backoff so the mic doesn't freeze.
          if (this.retryTimer) window.clearTimeout(this.retryTimer);
          this.retryTimer = window.setTimeout(() => {
            if (this.stopped) return;
            try { this.recognition.start(); }
            catch { /* may already be started; onstart will fire */ }
          }, 600);
        } else {
          this.handlers?.onError(err);
        }
      };
      this.recognition.onend = () => {
        this.listening = false;
        if (this.stopped) {
          this.handlers?.onEnd();
          return;
        }
        // Recognition auto-stops after silence; restart if we're still active.
        if (this.retryCount < MAX_RETRIES) {
          try { this.recognition.start(); return; }
          catch { /* already running */ }
        }
        this.handlers?.onEnd();
      };
      this.recognition.start();
    } catch {
      // start() throws if already started — treat as started.
      this.listening = true;
      this.handlers?.onStart?.();
    }
  }

  /** Stop listening and finalize. */
  stopListening() {
    this.stopped = true;
    if (this.retryTimer) { window.clearTimeout(this.retryTimer); this.retryTimer = null; }
    if (this.recognition) {
      try { this.recognition.stop(); } catch { /* ignore */ }
    }
    this.listening = false;
  }

  get isListening() { return this.listening; }
}

export const voiceEngine = new VoiceEngine();
