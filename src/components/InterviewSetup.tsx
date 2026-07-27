import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { ROLES, type Difficulty } from '../lib/questions';

export type SetupConfig = {
  role: string;
  difficulty: Difficulty;
  questionCount: number;
};

type Props = {
  initial: SetupConfig;
  onStart: (cfg: SetupConfig) => void;
};

const DIFFS: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'easy', label: 'Easy', desc: 'Warm-up & fundamentals' },
  { id: 'medium', label: 'Medium', desc: 'Standard interview depth' },
  { id: 'hard', label: 'Hard', desc: 'Senior / system design' },
];

const COUNTS = [3, 5, 8];

export default function InterviewSetup({ initial, onStart }: Props) {
  const [role, setRole] = useState(initial.role);
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty);
  const [questionCount, setQuestionCount] = useState(initial.questionCount);

  return (
    <div className="view">
      <div className="section-head">
        <div>
          <div className="section-title">Interview Setup</div>
          <div className="section-sub">Configure your voice interview, then jump straight in</div>
        </div>
      </div>

      <div className="panel">
        <div className="field full">
          <label>Interview Role</label>
          <div className="chip-row">
            {ROLES.map((r) => (
              <button
                key={r}
                className={`chip ${role === r ? 'active' : ''}`}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: 22 }}>
          <div className="field">
            <label>Difficulty</label>
            <div className="chip-row">
              {DIFFS.map((d) => (
                <button
                  key={d.id}
                  className={`chip ${difficulty === d.id ? 'active' : ''}`}
                  onClick={() => setDifficulty(d.id)}
                  title={d.desc}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Number of Questions</label>
            <div className="chip-row">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  className={`chip ${questionCount === c ? 'active' : ''}`}
                  onClick={() => setQuestionCount(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="panel-actions">
          <button
            className="btn btn-primary"
            onClick={() => onStart({ role, difficulty, questionCount })}
          >
            <Play size={16} /> Start Interview
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setRole(ROLES[0]);
              setDifficulty('medium');
              setQuestionCount(5);
            }}
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
