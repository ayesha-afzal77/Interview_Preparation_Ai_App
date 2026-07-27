export type Difficulty = 'easy' | 'medium' | 'hard';

export type InterviewQuestion = {
  id: string;
  text: string;
  difficulty: Difficulty;
  hints: string[];
  rubric: string[];
};

type QuestionBank = Record<string, InterviewQuestion[]>;

export const ROLES = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full-Stack Engineer',
  'Product Manager',
  'Data Scientist',
  'DevOps Engineer',
  'System Design',
  'Behavioral / HR',
] as const;

export const ROLE_LABELS: Record<string, string> = {
  'Frontend Engineer': 'Frontend Engineer',
  'Backend Engineer': 'Backend Engineer',
  'Full-Stack Engineer': 'Full-Stack Engineer',
  'Product Manager': 'Product Manager',
  'Data Scientist': 'Data Scientist',
  'DevOps Engineer': 'DevOps Engineer',
  'System Design': 'System Design',
  'Behavioral / HR': 'Behavioral / HR',
};

const BANK: QuestionBank = {
  'Frontend Engineer': [
    {
      id: 'fe-1',
      text: 'Can you explain the difference between controlled and uncontrolled components in React, and when you would choose one over the other?',
      difficulty: 'medium',
      hints: ['Mention form state ownership', 'Contrast defaultValue vs value+onChange'],
      rubric: ['Defines controlled vs uncontrolled', 'Gives a use case for each', 'Mentions trade-offs'],
    },
    {
      id: 'fe-2',
      text: 'Walk me through how the browser renders a web page from the moment a user types a URL.',
      difficulty: 'hard',
      hints: ['DNS + TCP + TLS', 'HTML parse → DOM → CSSOM → render tree → paint'],
      rubric: ['Mentions network steps', 'Describes DOM/CSSOM construction', 'Covers layout & paint'],
    },
    {
      id: 'fe-3',
      text: 'What is the virtual DOM and how does React use it to optimize updates?',
      difficulty: 'medium',
      hints: ['In-memory representation', 'Diffing / reconciliation'],
      rubric: ['Defines virtual DOM', 'Explains diffing', 'Mentions performance benefit'],
    },
    {
      id: 'fe-4',
      text: 'How would you optimize the performance of a large list rendering thousands of items?',
      difficulty: 'hard',
      hints: ['Virtualization', 'Memoization', 'Pagination'],
      rubric: ['Suggests virtualization', 'Mentions memo/useMemo', 'Considers pagination'],
    },
    {
      id: 'fe-5',
      text: 'Explain how CSS specificity works and how you would debug a style that is not being applied.',
      difficulty: 'easy',
      hints: ['Inline > ID > class > element', 'DevTools computed panel'],
      rubric: ['Orders specificity correctly', 'Mentions !important caveat', 'Uses DevTools'],
    },
  ],
  'Backend Engineer': [
    {
      id: 'be-1',
      text: 'Explain the difference between SQL and NoSQL databases and when you would pick each.',
      difficulty: 'medium',
      hints: ['ACID vs BASE', 'Schema flexibility'],
      rubric: ['Contrasts schema', 'Mentions consistency model', 'Gives use cases'],
    },
    {
      id: 'be-2',
      text: 'How does indexing work in a relational database and what are the trade-offs of adding indexes?',
      difficulty: 'hard',
      hints: ['B-tree structure', 'Faster reads, slower writes'],
      rubric: ['Explains index structure', 'Read vs write trade-off', 'Mentions storage cost'],
    },
    {
      id: 'be-3',
      text: 'Describe how you would design a rate limiter for a public API.',
      difficulty: 'hard',
      hints: ['Token bucket', 'Redis', 'Distributed sync'],
      rubric: ['Picks an algorithm', 'Handles distributed state', 'Considers fairness'],
    },
    {
      id: 'be-4',
      text: 'What happens when you type a URL into a browser and hit enter, from a backend perspective?',
      difficulty: 'medium',
      hints: ['DNS resolution', 'Server routing', 'Response cycle'],
      rubric: ['Covers DNS', 'Mentions server routing', 'Describes response'],
    },
    {
      id: 'be-5',
      text: 'Explain the difference between a thread and a process and when concurrency matters.',
      difficulty: 'easy',
      hints: ['Shared memory', 'Context switching cost'],
      rubric: ['Defines each', 'Memory model', 'Use cases'],
    },
  ],
  'Full-Stack Engineer': [
    {
      id: 'fs-1',
      text: 'Walk me through how you would build and deploy a feature from end to end.',
      difficulty: 'medium',
      hints: ['Requirements', 'API contract', 'CI/CD'],
      rubric: ['Mentions planning', 'Covers API design', 'Includes deployment'],
    },
    {
      id: 'fs-2',
      text: 'How do you keep state in sync between the client and the server in a real-time app?',
      difficulty: 'hard',
      hints: ['WebSockets', 'Optimistic UI', 'Conflict resolution'],
      rubric: ['Picks a transport', 'Handles conflicts', 'Mentions optimistic updates'],
    },
    {
      id: 'fs-3',
      text: 'Describe how you would secure authentication in a full-stack application.',
      difficulty: 'medium',
      hints: ['JWT vs sessions', 'Token storage', 'HTTPS'],
      rubric: ['Compares approaches', 'Token storage safety', 'Mentions HTTPS'],
    },
    {
      id: 'fs-4',
      text: 'How would you structure a monorepo versus a polyrepo, and why?',
      difficulty: 'easy',
      hints: ['Shared code', 'Build tooling', 'Team size'],
      rubric: ['Compares trade-offs', 'Mentions tooling', 'Considers team scale'],
    },
  ],
  'Product Manager': [
    {
      id: 'pm-1',
      text: 'How would you prioritize a backlog of 20 features with limited engineering capacity?',
      difficulty: 'medium',
      hints: ['Impact vs effort', 'RICE', 'Customer value'],
      rubric: ['Uses a framework', 'Considers constraints', 'Stakeholder input'],
    },
    {
      id: 'pm-2',
      text: 'Tell me about a time you had to make a decision without complete data.',
      difficulty: 'easy',
      hints: ['Structured thinking', 'Risk assessment'],
      rubric: ['Frames the situation', 'Describes the decision', 'Reflects on outcome'],
    },
    {
      id: 'pm-3',
      text: 'A key metric dropped 15% overnight. Walk me through how you would investigate.',
      difficulty: 'hard',
      hints: ['Segmentation', 'Regression analysis', 'Recent changes'],
      rubric: ['Segments the data', 'Checks recent releases', 'Forms hypotheses'],
    },
    {
      id: 'pm-4',
      text: 'How do you decide what not to build?',
      difficulty: 'medium',
      hints: ['Opportunity cost', 'Saying no'],
      rubric: ['Clear criteria', 'Stakeholder comms', 'Trade-off reasoning'],
    },
  ],
  'Data Scientist': [
    {
      id: 'ds-1',
      text: 'Explain the bias-variance trade-off and how it affects model selection.',
      difficulty: 'medium',
      hints: ['Overfitting vs underfitting', 'Cross-validation'],
      rubric: ['Defines both', 'Links to over/underfit', 'Mentions validation'],
    },
    {
      id: 'ds-2',
      text: 'How would you handle a dataset with missing values and imbalanced classes?',
      difficulty: 'hard',
      hints: ['Imputation', 'Resampling', 'Metrics choice'],
      rubric: ['Imputation strategy', 'Class balancing', 'Right metric'],
    },
    {
      id: 'ds-3',
      text: 'Describe the difference between supervised and unsupervised learning with examples.',
      difficulty: 'easy',
      hints: ['Labels', 'Clustering vs classification'],
      rubric: ['Clear definitions', 'Examples', 'Use cases'],
    },
  ],
  'DevOps Engineer': [
    {
      id: 'do-1',
      text: 'Explain how you would set up a CI/CD pipeline for a microservices architecture.',
      difficulty: 'medium',
      hints: ['Build, test, deploy stages', 'Container registry', 'Blue-green'],
      rubric: ['Pipeline stages', 'Artifact management', 'Deployment strategy'],
    },
    {
      id: 'do-2',
      text: 'How do you monitor and alert on a production system at scale?',
      difficulty: 'hard',
      hints: ['Metrics vs logs vs traces', 'SLOs', 'Alert fatigue'],
      rubric: ['Three pillars', 'SLOs', 'Avoids alert fatigue'],
    },
    {
      id: 'do-3',
      text: 'What is infrastructure as code and why is it valuable?',
      difficulty: 'easy',
      hints: ['Reproducibility', 'Version control'],
      rubric: ['Defines IaC', 'Benefits', 'Tooling examples'],
    },
  ],
  'System Design': [
    {
      id: 'sd-1',
      text: 'Design a URL shortening service like bit.ly. How would you handle scale?',
      difficulty: 'hard',
      hints: ['Encoding scheme', 'Database choice', 'Caching'],
      rubric: ['API design', 'Storage choice', 'Scaling strategy'],
    },
    {
      id: 'sd-2',
      text: 'How would you design a chat application that supports millions of concurrent users?',
      difficulty: 'hard',
      hints: ['WebSockets', 'Message queue', 'Sharding'],
      rubric: ['Connection handling', 'Message delivery', 'Scaling plan'],
    },
    {
      id: 'sd-3',
      text: 'Design a rate-limited API gateway. What components would you use?',
      difficulty: 'medium',
      hints: ['Token bucket', 'Redis', 'Distributed limits'],
      rubric: ['Algorithm', 'Distributed state', 'Failure modes'],
    },
  ],
  'Behavioral / HR': [
    {
      id: 'bh-1',
      text: 'Tell me about a time you faced a conflict with a teammate and how you resolved it.',
      difficulty: 'easy',
      hints: ['STAR method', 'Active listening'],
      rubric: ['Situation clear', 'Action taken', 'Result + reflection'],
    },
    {
      id: 'bh-2',
      text: 'Describe a project that failed. What did you learn from it?',
      difficulty: 'medium',
      hints: ['Ownership', 'Lessons applied'],
      rubric: ['Honest framing', 'Root cause', 'Applied learning'],
    },
    {
      id: 'bh-3',
      text: 'Tell me about a time you had to influence a decision without authority.',
      difficulty: 'medium',
      hints: ['Data', 'Stakeholder mapping'],
      rubric: ['Strategy', 'Evidence', 'Outcome'],
    },
    {
      id: 'bh-4',
      text: 'How do you handle tight deadlines with competing priorities?',
      difficulty: 'easy',
      hints: ['Prioritization', 'Communication'],
      rubric: ['Method', 'Trade-offs', 'Stakeholder comms'],
    },
  ],
};

export function getQuestions(role: string, difficulty: Difficulty, count: number): InterviewQuestion[] {
  const pool = (BANK[role] || BANK['Frontend Engineer']).slice();
  const filtered = difficulty === 'easy'
    ? pool.filter((q) => q.difficulty === 'easy' || q.difficulty === 'medium')
    : difficulty === 'hard'
      ? pool.filter((q) => q.difficulty === 'hard' || q.difficulty === 'medium')
      : pool;
  const list = filtered.length ? filtered : pool;
  const shuffled = list.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
