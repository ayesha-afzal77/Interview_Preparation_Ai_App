import { useEffect, useState } from 'react';
import { Play, TrendingUp, Clock, Target, Mic, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { supabase, type Metrics } from '../lib/supabase';

type Props = {
  onStartPractice: () => void;
  onOpenSetup: () => void;
};

export default function Dashboard({ onStartPractice, onOpenSetup }: Props) {
  const [metrics, setMetrics] = useState<Metrics>({ sessions: 0, avgScore: 0, hours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('score, duration_minutes');
      if (!active) return;
      if (error || !data) {
        setLoading(false);
        return;
      }
      const sessions = data.length;
      const avgScore = sessions ? Math.round(data.reduce((s, r) => s + (r.score || 0), 0) / sessions) : 0;
      const hours = sessions ? data.reduce((s, r) => s + Number(r.duration_minutes || 0), 0) / 60 : 0;
      setMetrics({ sessions, avgScore, hours });
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const confidence = metrics.sessions ? metrics.avgScore : 70;

  return (
    <div className="view">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">
            <Sparkles size={13} /> AI Voice Coach
          </span>
          <h1 className="hero-title">
            Welcome back, <span className="accent">Candidate</span>
          </h1>
          <p className="hero-desc">
            You're tracking at {confidence}% interview confidence. Keep practicing to sharpen your edge.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onStartPractice}>
              <Play size={16} /> Start Practice
            </button>
            <button className="btn btn-ghost" onClick={onOpenSetup}>
              <Sliders /> Configure Interview
            </button>
          </div>
        </div>
      </section>

      <div className="metrics">
        <MetricCard
          icon={<Target size={17} />}
          label="Practice Sessions"
          value={loading ? '—' : String(metrics.sessions)}
          foot={metrics.sessions === 1 ? '1 session completed' : `${metrics.sessions} sessions completed`}
        />
        <MetricCard
          icon={<TrendingUp size={17} />}
          label="Average Score"
          value={loading ? '—' : `${metrics.avgScore}%`}
          trend={metrics.avgScore > 0 ? `${metrics.avgScore}% trend` : undefined}
          foot="Across all sessions"
        />
        <MetricCard
          icon={<Clock size={17} />}
          label="Hours Practiced"
          value={loading ? '—' : metrics.hours.toFixed(1)}
          foot="Time on mic"
        />
      </div>

      <div className="section-head">
        <div>
          <div className="section-title">Continue sharpening</div>
          <div className="section-sub">Voice-to-voice practice with instant AI feedback</div>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <h3><Mic size={18} color="#34d399" /> Voice Interview</h3>
          <p>The AI speaks each question aloud, then listens to your spoken answer and scores it in real time. Hands-free, just like a real interview.</p>
          <div className="card-cta">
            <button className="btn btn-primary" onClick={onStartPractice}>
              Start now <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="card">
          <h3><BookOpen size={18} color="#34d399" /> Tailored Question Bank</h3>
          <p>Pick a role and difficulty. Questions span frontend, backend, system design, product, and behavioral tracks.</p>
          <div className="card-cta">
            <button className="btn btn-ghost" onClick={onOpenSetup}>
              Set up interview <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard(props: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  foot?: string;
}) {
  return (
    <div className="metric">
      <div className="metric-top">
        <span className="metric-label">{props.label}</span>
        <span className="metric-icon">{props.icon}</span>
      </div>
      <div className="metric-value">
        {props.value}
        {props.trend && (
          <span className="metric-trend">
            <TrendingUp size={14} /> {props.trend}
          </span>
        )}
      </div>
      <div className="metric-foot">{props.foot}</div>
    </div>
  );
}

function Sliders() {
  return <span style={{ display: 'inline-flex' }}><Sparkles size={16} /></span>;
}
