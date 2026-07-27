import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Play, SkipForward, CheckCircle2, AlertTriangle, Volume2, ArrowRight, RotateCcw } from 'lucide-react';
import { getQuestions, type InterviewQuestion } from '../lib/questions';
import { voiceEngine } from '../lib/voice';
import { evaluateAnswer } from '../lib/evaluate';
import { supabase, type AnswerRecord } from '../lib/supabase';
import type { SetupConfig } from './InterviewSetup';

type Phase = 'idle' | 'speaking' | 'listening' | 'evaluating' | 'feedback' | 'done';

type Props = {
  config: SetupConfig;
  onExit: () => void;
};

export default function LivePractice({ config, onExit }: Props) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [feedback, setFeedback] = useState<{ score: number; text: string } | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [micState, setMicState] = useState<'off' | 'on' | 'err'>('off');
  const [toast, setToast] = useState<{ msg: string; warn?: boolean } | null>(null);
  const [started, setStarted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const transcriptRef = useRef('');
  const startTimeRef = useRef<number>(0);

  const ttsSupported = voiceEngine.isSpeechSynthesisSupported;
  const asrSupported = voiceEngine.isRecognitionSupported;

  const showToast = useCallback((msg: string, warn = false) => {
    setToast({ msg, warn });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  // Build the question set when the user starts.
  const beginInterview = useCallback(() => {
    const qs = getQuestions(config.role, config.difficulty, config.questionCount);
    setQuestions(qs);
    setIndex(0);
    setAnswers([]);
    setFeedback(null);
    setTranscript('');
    setInterim('');
    setStarted(true);
    startTimeRef.current = Date.now();
  }, [config]);

  // Speak the current question, then enable the mic.
  const askQuestion = useCallback(async (q: InterviewQuestion) => {
    setPhase('speaking');
    setFeedback(null);
    setTranscript('');
    setInterim('');
    transcriptRef.current = '';
    setMicState('off');

    if (ttsSupported) {
      await voiceEngine.speak(q.text, { rate: 0.98 });
    } else {
      // Give the user a moment to read before we start listening.
      await new Promise((r) => window.setTimeout(r, 1400));
    }

    if (!asrSupported) {
      setPhase('listening');
      setMicState('off');
      showToast('Voice recognition is not supported in this browser. Type is unavailable — try Chrome or Edge.', true);
      return;
    }

    setPhase('listening');
    voiceEngine.startListening({
      onStart: () => setMicState('on'),
      onResult: (text, isFinal) => {
        if (isFinal) {
          transcriptRef.current = (transcriptRef.current + ' ' + text).trim();
          setTranscript(transcriptRef.current);
          setInterim('');
        } else {
          setInterim(text);
        }
      },
      onError: (err) => {
        setMicState('err');
        if (err === 'network') {
          showToast('Network dropped — reconnecting the mic automatically…', true);
        } else if (err === 'no-speech') {
          // silent — recognition auto-restarts
        } else if (err === 'not-allowed' || err === 'service-not-allowed') {
          showToast('Microphone permission denied. Allow mic access to practice.', true);
        }
      },
      onEnd: () => {
        setMicState('off');
      },
    });
  }, [asrSupported, ttsSupported, showToast]);

  // Start the first question when the question set is ready.
  useEffect(() => {
    if (started && questions.length > 0 && index === 0 && phase === 'idle') {
      askQuestion(questions[0]);
    }
  }, [started, questions, index, phase, askQuestion]);

  const stopMic = useCallback(() => {
    voiceEngine.stopListening();
    setMicState('off');
  }, []);

  const submitAnswer = useCallback(() => {
    stopMic();
    const q = questions[index];
    if (!q) return;
    const finalText = transcriptRef.current.trim();
    if (!finalText) {
      showToast('No answer captured. Try speaking your answer, then press Submit.', true);
      return;
    }
    setPhase('evaluating');
    // Light delay so the "evaluating" state is visible.
    window.setTimeout(() => {
      const evalRes = evaluateAnswer(q, finalText);
      setFeedback({ score: evalRes.score, text: evalRes.feedback });
      setAnswers((prev) => [
        ...prev,
        { question: q.text, answer: finalText, feedback: evalRes.feedback, score: evalRes.score },
      ]);
      setPhase('feedback');
    }, 500);
  }, [questions, index, stopMic, showToast]);

  const nextQuestion = useCallback(() => {
    voiceEngine.cancelSpeech();
    stopMic();
    const next = index + 1;
    if (next >= questions.length) {
      finishInterview();
      return;
    }
    setIndex(next);
    setPhase('idle');
    setFeedback(null);
    setTranscript('');
    setInterim('');
    transcriptRef.current = '';
    // askQuestion will be triggered via the phase change to 'idle' for non-zero index.
    window.setTimeout(() => askQuestion(questions[next]), 80);
  }, [index, questions, stopMic, askQuestion]);

  const finishInterview = useCallback(() => {
    voiceEngine.cancelSpeech();
    stopMic();
    // Compute final score from the answers we have.
    setAnswers((prev) => {
      const score = prev.length
        ? Math.round(prev.reduce((s, a) => s + a.score, 0) / prev.length)
        : 0;
      setFinalScore(score);
      const minutes = (Date.now() - startTimeRef.current) / 60000;
      // Persist to Supabase (fire and forget — surface errors via toast).
      (async () => {
        const { error } = await supabase.from('practice_sessions').insert({
          role: config.role,
          difficulty: config.difficulty,
          question_count: prev.length,
          score,
          duration_minutes: Math.round(minutes * 100) / 100,
          answers: prev,
        });
        if (error) showToast('Could not save your session. Your score is still shown below.', true);
      })();
      return prev;
    });
    setPhase('done');
  }, [config, stopMic, showToast]);

  const skipQuestion = useCallback(() => {
    stopMic();
    const q = questions[index];
    if (!q) return;
    setAnswers((prev) => [
      ...prev,
      { question: q.text, answer: '(skipped)', feedback: 'Question skipped.', score: 0 },
    ]);
    nextQuestion();
  }, [questions, index, stopMic, nextQuestion]);

  const restart = useCallback(() => {
    voiceEngine.cancelSpeech();
    stopMic();
    setStarted(false);
    setQuestions([]);
    setIndex(0);
    setPhase('idle');
    setAnswers([]);
    setFeedback(null);
    setTranscript('');
    setInterim('');
    setFinalScore(0);
    transcriptRef.current = '';
  }, [stopMic]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      voiceEngine.cancelSpeech();
      voiceEngine.stopListening();
    };
  }, []);

  if (!started) {
    return (
      <div className="view">
        <div className="section-head">
          <div>
            <div className="section-title">Live Practice</div>
            <div className="section-sub">
              {config.role} · {config.difficulty} · {config.questionCount} questions
            </div>
          </div>
        </div>
        <div className="stage">
          <div className="empty">
            <div className="icon"><Mic size={26} /></div>
            <h3>Ready for your voice interview?</h3>
            <p>The AI will speak each question aloud, then listen to your spoken answer and score it.</p>
            <div style={{ marginTop: 22 }}>
              <button className="btn btn-primary" onClick={beginInterview}>
                <Play size={16} /> Begin Interview
              </button>
            </div>
            {!ttsSupported && (
              <p style={{ marginTop: 16, color: 'var(--amber-400)' }}>
                <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />
                Text-to-speech is not available in this browser.
              </p>
            )}
            {!asrSupported && (
              <p style={{ marginTop: 8, color: 'var(--amber-400)' }}>
                <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />
                Speech recognition needs Chrome or Edge.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="view">
        <div className="stage">
          <div className="result">
            <ScoreRing score={finalScore} />
            <h2>Interview complete</h2>
            <p>You answered {answers.filter((a) => a.answer !== '(skipped)').length} of {questions.length} questions.</p>
            <div className="stats">
              <div className="stat"><div className="v">{finalScore}%</div><div className="l">Average score</div></div>
              <div className="stat"><div className="v">{questions.length}</div><div className="l">Questions</div></div>
              <div className="stat"><div className="v">{config.role}</div><div className="l">Role</div></div>
            </div>
            <div className="actions">
              <button className="btn btn-primary" onClick={restart}>
                <RotateCcw size={16} /> Practice Again
              </button>
              <button className="btn btn-ghost" onClick={onExit}>Back to Dashboard</button>
            </div>
          </div>
        </div>
        {toast && <Toast {...toast} />}
      </div>
    );
  }

  const current = questions[index];
  const progress = questions.length ? ((index + (phase === 'feedback' ? 1 : 0)) / questions.length) * 100 : 0;

  return (
    <div className="view">
      <div className="section-head">
        <div>
          <div className="section-title">Live Practice</div>
          <div className="section-sub">
            {config.role} · {config.difficulty} · Question {index + 1} of {questions.length}
          </div>
        </div>
      </div>

      <div className="practice">
        <div className="stage">
          <div className="stage-head">
            <span className={`stage-badge ${phase === 'listening' ? 'live' : ''}`}>
              <span className="dot" />
              {phase === 'speaking' && 'AI speaking…'}
              {phase === 'listening' && 'Listening…'}
              {phase === 'evaluating' && 'Evaluating…'}
              {phase === 'feedback' && 'Feedback ready'}
              {phase === 'idle' && 'Ready'}
            </span>
            <div className="mic-status">
              <span className={`mic-dot ${micState}`} />
              {micState === 'on' ? 'Mic live' : micState === 'err' ? 'Reconnecting…' : 'Mic off'}
            </div>
          </div>

          {current && (
            <div className="q-card">
              <div className="q-meta">Question {index + 1} · {current.difficulty}</div>
              <div className={`q-text ${phase === 'speaking' ? 'speaking' : ''}`}>
                {phase === 'speaking' && <Volume2 size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: '-3px' }} />}
                {current.text}
              </div>
            </div>
          )}

          <div className="assistant-row">
            <div className={`assistant-avatar ${phase === 'listening' ? 'listening' : ''}`}>
              <Mic size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="transcript">
                {transcript || interim ? (
                  <>
                    <span className="you">{transcript}</span>
                    {interim && <span style={{ color: 'var(--text-muted)' }}> {interim}</span>}
                  </>
                ) : (
                  <span className="placeholder">
                    {phase === 'listening'
                      ? 'Speak your answer… your words will appear here.'
                      : phase === 'speaking'
                        ? 'The AI is asking the question. Listen carefully.'
                        : 'Waiting to begin…'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {feedback && (
            <div className="feedback">
              <strong>Score: {feedback.score}%</strong> — {feedback.text}
            </div>
          )}

          <div className="controls">
            {phase === 'listening' && (
              <>
                <button className="btn btn-primary" onClick={submitAnswer}>
                  <CheckCircle2 size={16} /> Submit Answer
                </button>
                <button className="btn btn-ghost" onClick={stopMic}>
                  <MicOff size={15} /> Stop Mic
                </button>
              </>
            )}
            {phase === 'feedback' && (
              <button className="btn btn-primary" onClick={nextQuestion}>
                {index + 1 >= questions.length ? 'Finish' : 'Next Question'} <ArrowRight size={15} />
              </button>
            )}
            {(phase === 'listening' || phase === 'feedback') && (
              <button className="btn btn-ghost" onClick={skipQuestion}>
                <SkipForward size={15} /> Skip
              </button>
            )}
            <button className="btn btn-danger" onClick={restart} style={{ marginLeft: 'auto' }}>
              End Session
            </button>
          </div>
        </div>

        <aside className="side">
          <div className="side-card">
            <h4>Progress</h4>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
              {index + (phase === 'feedback' ? 1 : 0)} / {questions.length} answered
            </div>
          </div>

          <div className="side-card">
            <h4>Questions</h4>
            <div className="q-list">
              {questions.map((q, i) => {
                const done = i < index || (i === index && phase === 'feedback');
                const currentQ = i === index && phase !== 'feedback';
                return (
                  <div key={q.id} className={`q-item ${done ? 'done' : ''} ${currentQ ? 'current' : ''}`}>
                    <span className="num">{done ? <CheckCircle2 size={13} /> : i + 1}</span>
                    <span className="txt">{q.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {answers.length > 0 && (
            <div className="side-card">
              <h4>Running Score</h4>
              <ScoreRing
                score={Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length)}
                small
              />
            </div>
          )}
        </aside>
      </div>

      {toast && <Toast {...toast} />}
    </div>
  );
}

function ScoreRing({ score, small }: { score: number; small?: boolean }) {
  const r = small ? 32 : 54;
  const stroke = small ? 6 : 9;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';
  return (
    <div className="ring" style={small ? { width: 76, height: 76 } : undefined}>
      <svg width={small ? 76 : 120} height={small ? 76 : 120}>
        <circle cx={small ? 38 : 60} cy={small ? 38 : 60} r={r} fill="none" stroke="#143321" strokeWidth={stroke} />
        <circle
          cx={small ? 38 : 60} cy={small ? 38 : 60} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <span className="label" style={small ? { fontSize: 16 } : undefined}>{score}%</span>
    </div>
  );
}

function Toast({ msg, warn }: { msg: string; warn?: boolean }) {
  return (
    <div className={`toast ${warn ? 'warn' : ''}`}>
      {warn ? <AlertTriangle size={15} className="ic" /> : <CheckCircle2 size={15} color="#34d399" />}
      {msg}
    </div>
  );
}
