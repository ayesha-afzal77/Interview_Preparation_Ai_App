import { Mic, LayoutDashboard, SlidersHorizontal, Sparkles } from 'lucide-react';

export type View = 'dashboard' | 'setup' | 'practice';

type Props = {
  view: View;
  onNavigate: (v: View) => void;
};

export default function Header({ view, onNavigate }: Props) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <div className="brand-mark">
            <Mic size={22} color="#04130a" strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <span className="brand-title">InterviewPrep AI</span>
            <span className="brand-sub">Master your next interview with AI</span>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Primary">
          <button
            className={`tab ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <LayoutDashboard size={15} /> Dashboard
            </span>
          </button>
          <button
            className={`tab ${view === 'setup' ? 'active' : ''}`}
            onClick={() => onNavigate('setup')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <SlidersHorizontal size={15} /> Interview Setup
            </span>
          </button>
          <button
            className={`tab ${view === 'practice' ? 'active' : ''}`}
            onClick={() => onNavigate('practice')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Sparkles size={15} /> Live Practice
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
