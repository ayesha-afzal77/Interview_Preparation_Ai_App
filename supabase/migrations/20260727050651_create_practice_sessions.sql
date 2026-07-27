/*
# Create practice_sessions table (single-tenant, no auth)

1. New Tables
- `practice_sessions`
  - `id` (uuid, primary key)
  - `role` (text, the interview role/track the user is practicing, e.g. "Frontend Engineer")
  - `difficulty` (text, easy | medium | hard)
  - `question_count` (int, number of questions in the session)
  - `score` (int, 0-100 overall confidence/score for the session)
  - `duration_minutes` (numeric, minutes spent; hours derived as duration_minutes/60)
  - `answers` (jsonb, array of {question, answer, feedback} objects)
  - `created_at` (timestamptz, when the session happened)
2. Security
- Enable RLS on `practice_sessions`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in app).
3. Notes
- Hours Practiced metric = SUM(duration_minutes)/60 across all sessions.
- Average Score metric = AVG(score) across all sessions.
- Practice Sessions metric = COUNT(*) of rows.
*/

CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL DEFAULT 'General',
  difficulty text NOT NULL DEFAULT 'medium',
  question_count integer NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0,
  duration_minutes numeric NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_practice_sessions" ON practice_sessions;
CREATE POLICY "anon_select_practice_sessions" ON practice_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_practice_sessions" ON practice_sessions;
CREATE POLICY "anon_insert_practice_sessions" ON practice_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_practice_sessions" ON practice_sessions;
CREATE POLICY "anon_update_practice_sessions" ON practice_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_practice_sessions" ON practice_sessions;
CREATE POLICY "anon_delete_practice_sessions" ON practice_sessions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS practice_sessions_created_at_idx ON practice_sessions (created_at DESC);
