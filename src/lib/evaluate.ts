import type { InterviewQuestion } from './questions';

const STOPWORDS = new Set([
  'the','a','an','and','or','but','is','are','was','were','be','been','being',
  'to','of','in','on','at','by','for','with','about','as','into','like','through',
  'i','you','he','she','it','we','they','this','that','these','those','my','your',
  'his','her','its','our','their','me','him','us','them','do','does','did','done',
  'have','has','had','will','would','can','could','should','may','might','must',
  'not','no','yes','so','if','then','than','too','very','just','also','only',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function overlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  let hits = 0;
  for (const w of a) if (setB.has(w)) hits++;
  return hits / Math.max(a.length, b.length);
}

export type Evaluation = {
  score: number;
  feedback: string;
};

/** Heuristic evaluation of a spoken answer against the question rubric + hints. */
export function evaluateAnswer(question: InterviewQuestion, answer: string): Evaluation {
  const ans = answer.trim();
  if (ans.length < 12) {
    return {
      score: 30,
      feedback: 'Your answer was very short. Try to elaborate with a concrete example or reasoning to show depth.',
    };
  }

  const ansTokens = tokenize(ans);
  const rubricTokens = question.rubric.flatMap(tokenize);
  const hintTokens = question.hints.flatMap(tokenize);

  const rubricHit = overlap(ansTokens, rubricTokens);
  const hintHit = overlap(ansTokens, hintTokens);
  const lengthBonus = Math.min(ansTokens.length / 60, 1) * 0.15;

  let score = Math.round((rubricHit * 0.6 + hintHit * 0.25 + lengthBonus) * 100);
  score = Math.max(35, Math.min(95, score + 40));

  const covered = question.rubric.filter((r) => overlap(ansTokens, tokenize(r)) > 0.18);
  const missed = question.rubric.filter((r) => !covered.includes(r));

  let feedback = '';
  if (score >= 80) {
    feedback = 'Strong answer. ';
  } else if (score >= 60) {
    feedback = 'Solid answer with room to improve. ';
  } else {
    feedback = 'This answer needs more depth. ';
  }

  if (covered.length) {
    feedback += `You covered: ${covered.join(', ')}. `;
  }
  if (missed.length) {
    feedback += `Consider also addressing: ${missed.join(', ')}.`;
  } else if (covered.length === question.rubric.length) {
    feedback += 'You hit all the key points — well done.';
  }

  return { score, feedback };
}
