import { useState, useRef } from 'react';
import { evaluateAnswer, EvaluationResult } from '../lib/evaluate';
 
interface Props {
  config: any;
  onExit: () => void;
}
 
export function LivePractice({ config, onExit }: Props) {
  const [phase, setPhase] = useState<'idle' | 'evaluating' | 'feedback'>('idle');
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<EvaluationResult | null>(null);
  const transcriptRef = useRef<string>("Candidate response placeholder");
 
  const questions = [
    { text: "Tell me about your experience with React and modern JavaScript." },
    { text: "How do you optimize state management in large scale frontend applications?" }
  ];
 
  const q = questions[index] || questions[0];
 
  const submitAnswer = async () => {
    setPhase('evaluating');
    const finalText = transcriptRef.current;
    const evalRes = await evaluateAnswer(q.text, finalText, config?.role);
    setFeedback(evalRes);
    setPhase('feedback');
  };
 
  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <h2>Live Interview Practice</h2>
      <p><strong>Question {index + 1}:</strong> {q.text}</p>
      
      <button onClick={submitAnswer} style={{ padding: '8px 16px', cursor: 'pointer', margin: '10px 0' }}>
        {phase === 'evaluating' ? 'Evaluating Answer...' : 'Submit Answer'}
      </button>
 
      {phase === 'feedback' && feedback && (
        <div style={{ marginTop: '20px', background: '#222', padding: '15px', borderRadius: '8px' }}>
          <h3>Score: {feedback.score}/10</h3>
          <p>{feedback.feedback}</p>
          <button onClick={() => { setPhase('idle'); setIndex((prev) => prev + 1); }}>
            Next Question
          </button>
        </div>
      )}
 
      <div style={{ marginTop: '20px' }}>
        <button onClick={onExit}>Exit Practice</button>
      </div>
    </div>
  );
}
 
export default LivePractice;
 
