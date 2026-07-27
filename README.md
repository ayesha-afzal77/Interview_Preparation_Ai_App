# 🎙️ InterviewPrep AI

*Master your next interview with AI*

### a. What it is, and who it's for

**InterviewPrep AI** is a voice-to-voice mock interview app. Instead of reading questions off a
screen and typing answers, the AI actually **speaks each interview question out loud**, listens
to your **spoken answer** through the microphone, and gives instant scored feedback — just like a
real interview, minus the pressure of a real interviewer.

**The real problem it solves:** most students and job seekers prepare for interviews by silently
reading question lists, which doesn't build the actual skill that matters — speaking clearly and
confidently under real interview conditions. InterviewPrep AI closes that gap by making practice
fully spoken, with immediate, honest feedback on each answer.

**Who it's for:** students and job seekers (Frontend, Backend, Full-Stack, Data Science, DevOps,
System Design, Product, and Behavioral/HR tracks) preparing for technical or HR interviews and
wanting realistic, low-pressure spoken practice.

---

### b. Live URL

🔗 **[interview-preparation-ai-diriux8m6-self-b0ee.vercel.app](https://interview-preparation-ai-diriux8m6-self-b0ee.vercel.app/)**

> Best experienced in **Chrome or Edge** — voice recognition (Web Speech API) isn't supported in
> Safari or Firefox; the app detects this and tells you gracefully instead of failing silently.

---

### c. Features

**Dashboard**
- Hero card — "Welcome back, Candidate" with a live interview-confidence percentage and a
  one-click **Start Practice** button, plus a **Configure Interview** shortcut
- Metrics row — Practice Sessions completed, Average Score (with trend indicator), and total
  Hours Practiced, all pulled live from saved session data
- "Continue sharpening" section nudging the next practice session

**Interview Setup**
- Choose an interview role: Frontend Engineer, Backend Engineer, Full-Stack Engineer, Product
  Manager, Data Scientist, DevOps Engineer, System Design, or Behavioral/HR
- Choose difficulty: Easy, Medium, or Hard
- Choose question count: 3, 5, or 8 questions per session
- **Start Interview** / **Reset** controls

**Live Practice (the core experience)**
- Fully **voice-to-voice**: the AI speaks each question aloud, then automatically switches on the
  mic to listen for your spoken answer — no typing, no clicking "record"
- Live transcription of your spoken answer as you talk
- Instant per-answer **score (%) and written feedback**, naming exactly what the answer was
  missing (e.g. "Defines controlled vs uncontrolled, gives a use case for each, mentions
  trade-offs")
- Progress tracker and a question sidebar showing answered / upcoming questions at a glance
- Running score shown throughout the session
- **Skip**, **Next Question**, and **End Session** controls
- Sessions are saved automatically, so Dashboard metrics stay up to date after every practice run

**Reliability**
- Graceful handling of speech-recognition network drops — if the connection interrupts mid-answer,
  the mic auto-retries in the background (with backoff) instead of freezing, showing a
  "reconnecting" state rather than a dead mic
- Clear browser-compatibility messaging for browsers without Web Speech API support

---

### d. The AI feature

**What it does:** InterviewPrep AI runs a genuine **voice-to-voice interview loop**:

1. A question is selected from the role/difficulty-matched question bank
2. The browser's **SpeechSynthesis API** speaks the question out loud automatically
3. The moment speech finishes, **SpeechRecognition** switches the mic on and transcribes the
   candidate's spoken answer live
4. The transcribed answer is scored against the expected key points for that question, and the
   candidate gets an instant percentage score plus specific written feedback on what the answer
   was missing
5. If the recognition connection drops mid-answer (a common issue with the Web Speech API), the
   app detects the network error and automatically retries the mic rather than leaving it frozen

This logic lives in `src/lib/voice.ts` (speech synthesis/recognition + auto-retry handling) and
`src/lib/evaluate.ts` (answer scoring and feedback generation), wired together in
`src/components/LivePractice.tsx`.

---

### e. Tools, services, and AI models used

| Layer | Tool |
|---|---|
| App builder | Bolt.new (AI-assisted scaffolding and iteration) |
| Frontend | Vite + React + TypeScript |
| Voice AI | Browser-native Web Speech API — `SpeechSynthesis` (text-to-speech) and `SpeechRecognition` (speech-to-text) |
| Data persistence | Bolt Database (stores practice sessions, powers live Dashboard metrics) |
| Hosting | Vercel |
| Version control | Git + GitHub |

---

### f. Screenshots

**Dashboard — session metrics and confidence tracking**
<img width="1366" height="768" alt="sana dash" src="https://github.com/user-attachments/assets/e6f701a3-38f6-45b1-a6bb-147841b3a8cf" />

**Interview Setup — role, difficulty, and question count**
<img width="1366" height="768" alt="sana dash 2" src="https://github.com/user-attachments/assets/6a6ae4e2-847e-489e-bde6-14574984e30d" />


**Live Practice — voice-to-voice question, live transcription, instant scoring**
<img width="1366" height="768" alt="sana 1" src="https://github.com/user-attachments/assets/9684a714-3ae4-4b06-b050-143397c49315" />


---

### g. How to run

**Locally**
```bash
git clone https://github.com/<your-username>/interviewprep-ai.git
cd interviewprep-ai
npm install
```

Create a `.env` file in the project root (do **not** commit this file):
```
VITE_API_KEY=your_own_key_here
```
> Note: any variable prefixed `VITE_` is bundled into the client-side code and visible to anyone
> who inspects the deployed app. Keep `.env` out of git (add it to `.gitignore`), and if the key
> needs to stay private, move the call behind a Bolt Database Edge Function instead of calling it
> directly from the browser.

Then run:
```bash
npm run dev
```

**Live version:** just open [interview-preparation-ai-diriux8m6-self-b0ee.vercel.app](https://interview-preparation-ai-diriux8m6-self-b0ee.vercel.app/)
in Chrome or Edge, allow microphone access when prompted, and click **Start Practice**.
