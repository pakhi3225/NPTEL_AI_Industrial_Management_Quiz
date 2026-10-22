# NPTEL – Artificial Intelligence in Industrial and Management: Quiz Practice

A frontend-only React + Vite website for practising the weekly MCQ questions of the NPTEL course
**“Artificial Intelligence in Industrial and Management”**. No backend, database, API key or login is needed.

## What it does
- Weekwise practice (Weeks 0–8): all questions, a custom number, shuffled, or only the ones you got wrong.
- Random quiz generator: choose weeks, question count, order and an optional timer. No duplicate questions in a quiz.
- Full test of every verified question with a question navigator, mark-for-review, clear answer, submit confirmation and configurable timer and marking.
- Practice mode (instant feedback + explanation) or Test mode (answers hidden until you submit).
- Results page, full answer review, attempt history, bookmarks, light/dark mode.
- Progress is saved in your browser, so refreshing does not lose a quiz in progress.

## The question bank (90 questions)
| Week | Questions | Source file |
|------|-----------|-------------|
| 0 | 10 | `Artificial_Intelligence_MCQ_Questions_and_Answers.pdf` |
| 1–8 | 10 each | `Week_1.pdf` … `Week_8.pdf` |

Questions, options, answer keys and explanations were extracted from the PDFs you supplied and are kept as written.
Explanations exist only where the source had them (all of Week 2, and Week 1 question 10).
Two source quirks are kept and noted inside the data: Week 2 Q8 option A reads “Aule”, and the Week 1 Q6 formula (a fraction in the PDF) is written `P = O / I`.

**Note on Week 0:** the supplied AI MCQ PDF is a general “Introduction to AI” set. It has been placed under Week 0 to make up 9 × 10 = 90 questions. If it is not your actual Week 0 material, replace those 10 entries in `src/data/questions.js`.

## Prerequisites
- [Node.js](https://nodejs.org) 18 or newer (includes `npm`)
- [Visual Studio Code](https://code.visualstudio.com)

## Run it in VS Code
1. Unzip `NPTEL_AI_Industrial_Management_Quiz.zip`.
2. In VS Code choose **File → Open Folder…** and select the unzipped folder.
3. Open a terminal: **Terminal → New Terminal**.
4. Install dependencies (first time only):
   ```
   npm install
   ```
5. Start the development server:
   ```
   npm run dev
   ```
6. Open the address shown in the terminal, usually <http://localhost:5173>.

## Production build
```
npm run build      # creates the dist/ folder
npm run preview    # serves the built site locally
```
The app uses hash routing and relative paths, so the contents of `dist/` can be hosted on any static host.

## Add or edit questions
All questions live in **one file: `src/data/questions.js`**. Each entry looks like this:
```js
{
  id: "w3-q11",              // unique
  week: 3,                   // 0-8
  question: "Original question text",
  type: "single",            // "single" or "multiple"
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswer: [2],        // ZERO-based indices: A=0, B=1, C=2, D=3
  explanation: "",           // optional
  verified: true,            // see below
  source: "Week_3.pdf"
}
```
For a multiple-select question use `type: "multiple"` and several indices, e.g. `correctAnswer: [0, 2]`
(it is marked correct only when exactly those options are chosen).

### Verifying answers
1. Compare the entry with your source document, especially `correctAnswer` (remember: zero-based).
2. Only then set `verified: true`.
3. Open **Settings → Question bank check**. It lists verified counts per week and flags any entry with a missing or out-of-range answer key, fewer than two options, or `verified` not true.
Flagged questions are excluded from every quiz and never counted as verified. A week with no verified questions shows “Question data required”.

## How progress is saved and reset
- Attempts, scores, per-question results, bookmarks, theme, scoring options and any quiz in progress are stored in the browser’s `localStorage`.
- They are **not** synchronised between devices or browsers, and clearing browser data deletes them.
- **Settings → Clear all progress** (with confirmation) wipes saved progress only. The question bank is part of the source code and is never touched.
- Every quiz can be retaken any number of times; nothing is ever locked as “completed”.

## Project structure
```
src/
  components/  Layout, WeekCard, QuestionCard, ProgressBar, ResultsSummary, ConfirmDialog
  pages/       Dashboard, WeekPractice, RandomQuiz, FullTest, Quiz, Results, ReviewAnswers, Bookmarks, History, Settings
  hooks/       useStore (state + localStorage), useLaunch
  utils/       quiz.js (validation, selection, grading), storage.js
  data/        questions.js  <- the question bank
```
This is an independent study tool and is not affiliated with NPTEL; no NPTEL logo is used.
