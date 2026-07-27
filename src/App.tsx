import { useState } from 'react';
import Header, { type View } from './components/Header';
import Dashboard from './components/Dashboard';
import InterviewSetup, { type SetupConfig } from './components/InterviewSetup';
import LivePractice from './components/LivePractice';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [config, setConfig] = useState<SetupConfig>({
    role: 'Frontend Engineer',
    difficulty: 'medium',
    questionCount: 5,
  });

  return (
    <div className="app-shell">
      <Header view={view} onNavigate={setView} />
      <main className="main">
        <div className="container">
          {view === 'dashboard' && (
            <Dashboard
              onStartPractice={() => setView('practice')}
              onOpenSetup={() => setView('setup')}
            />
          )}
          {view === 'setup' && (
            <InterviewSetup
              initial={config}
              onStart={(cfg) => {
                setConfig(cfg);
                setView('practice');
              }}
            />
          )}
          {view === 'practice' && (
            <LivePractice config={config} onExit={() => setView('dashboard')} />
          )}
        </div>
      </main>
      <footer style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-faint)', fontSize: 12.5, borderTop: '1px solid var(--line-soft)' }}>
        <div className="container">InterviewPrep AI — voice-to-voice interview practice</div>
      </footer>
    </div>
  );
}
