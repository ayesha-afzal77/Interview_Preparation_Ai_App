import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export type PracticeSession = {
  id: string;
  role: string;
  difficulty: string;
  question_count: number;
  score: number;
  duration_minutes: number;
  answers: AnswerRecord[];
  created_at: string;
};

export type AnswerRecord = {
  question: string;
  answer: string;
  feedback: string;
  score: number;
};

export type Metrics = {
  sessions: number;
  avgScore: number;
  hours: number;
};
