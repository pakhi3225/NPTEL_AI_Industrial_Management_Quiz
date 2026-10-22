import { useState } from "react";
import { CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useStore } from "../hooks/useStore.jsx";
import { WEEKS, verifiedByWeek, allQuestions, verifiedQuestions, issues } from "../utils/quiz.js";
import { WEEK_TITLES } from "../data/questions.js";

export default function Settings() {
  const { state, setPrefs, clearProgress } = useStore();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="stack narrow">
      <h1>Settings</h1>
      <section className="card stack">
        <h2>Appearance</h2>
        <div className="row wrap" role="radiogroup" aria-label="Theme">
          {[["system", "Match device"], ["light", "Light"], ["dark", "Dark"]].map(([k, l]) => (
            <button key={k} role="radio" aria-checked={state.prefs.theme === k} className={`btn ${state.prefs.theme === k ? "btn-primary" : ""}`} onClick={() => setPrefs({ theme: k })}>{l}</button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <h2>Scoring</h2>
        <div className="row wrap">
          <label className="field">Marks per correct answer
            <input type="number" className="num" step="0.25" min={0} value={state.prefs.scoreCorrect} onChange={(e) => setPrefs({ scoreCorrect: Math.max(0, Number(e.target.value)) })} />
          </label>
          <label className="field">Marks lost per wrong answer
            <input type="number" className="num" step="0.25" min={0} value={state.prefs.scoreWrong} onChange={(e) => setPrefs({ scoreWrong: Math.max(0, Number(e.target.value)) })} />
          </label>
        </div>
        <p className="small muted">Applies to quizzes you submit from now on. Unanswered questions score zero.</p>
      </section>

      <section className="card stack">
        <h2>Question bank check</h2>
        <p>
          {verifiedQuestions.length} of {allQuestions.length} questions are verified and usable.
          {issues.length > 0 && <span className="warn-text"> {issues.length} flagged and excluded from quizzes.</span>}
        </p>
        <table className="table">
          <thead><tr><th>Week</th><th>Topic</th><th>Verified</th></tr></thead>
          <tbody>
            {WEEKS.map((w) => {
              const n = verifiedByWeek(w).length;
              return (
                <tr key={w}>
                  <td>{w}</td>
                  <td>{WEEK_TITLES[w]}</td>
                  <td>{n ? <><CheckCircle2 size={14} className="ok" /> {n}</> : <span className="warn-text"><AlertTriangle size={14} /> Question data required</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {issues.length > 0 && (
          <ul className="plain small">
            {issues.map((i) => <li key={i.id}><code>{i.id}</code>: {i.problems.join("; ")}</li>)}
          </ul>
        )}
        <p className="small muted">Edit questions in <code>src/data/questions.js</code>. Week 0 comes from the supplementary AI MCQ PDF and Weeks 1–8 from the weekly assignment PDFs.</p>
      </section>

      <section className="card stack">
        <h2>Saved progress</h2>
        <p className="small muted">Attempts, scores, bookmarks and preferences are stored in this browser’s localStorage. They are not synchronised between devices or browsers, and clearing your browser data removes them.</p>
        <p className="small">Currently saved: {state.attempts.length} attempts, {Object.keys(state.stats).length} questions attempted, {state.bookmarks.length} bookmarks.</p>
        <div><button className="btn btn-danger" onClick={() => setConfirm(true)}><Trash2 size={16} /> Clear all progress</button></div>
      </section>

      <ConfirmDialog open={confirm} title="Clear all progress?" confirmLabel="Clear progress" danger onCancel={() => setConfirm(false)} onConfirm={() => { clearProgress(); setConfirm(false); }}>
        This deletes your attempts, statistics, bookmarks and any quiz in progress. The question bank is not affected.
      </ConfirmDialog>
    </div>
  );
}
