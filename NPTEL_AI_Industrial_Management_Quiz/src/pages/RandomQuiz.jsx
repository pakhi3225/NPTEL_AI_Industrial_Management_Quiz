import { useState } from "react";
import { WEEKS, verifiedByWeek, pickIds, originalOrder } from "../utils/quiz.js";
import { useLaunch } from "../hooks/useLaunch.jsx";

export default function RandomQuiz() {
  const { launch, dialog } = useLaunch();
  const [weeks, setWeeks] = useState(WEEKS.filter((w) => verifiedByWeek(w).length));
  const [count, setCount] = useState(10);
  const [shuffled, setShuffled] = useState(true);
  const [minutes, setMinutes] = useState(0);
  const [practice, setPractice] = useState(false);

  const pool = weeks.flatMap((w) => verifiedByWeek(w));
  const n = Math.max(1, Math.min(Number(count) || 1, pool.length || 1));
  const toggle = (w) => setWeeks(weeks.includes(w) ? weeks.filter((x) => x !== w) : [...weeks, w]);

  const start = () => {
    const picked = pickIds(pool, n, true); // unique ids, never duplicated
    launch({
      title: `Random quiz (${n} questions)`,
      mode: "random",
      ids: shuffled ? picked : originalOrder(picked),
      practice,
      timerSeconds: Number(minutes) > 0 ? Math.round(Number(minutes) * 60) : null,
      config: { weeks },
    });
  };

  return (
    <div className="stack narrow">
      <h1>Random quiz</h1>
      <section className="card stack">
        <fieldset className="choices">
          <legend>Weeks to draw from</legend>
          <div className="row wrap">
            <button className="btn btn-sm" onClick={() => setWeeks(WEEKS.filter((w) => verifiedByWeek(w).length))}>All available</button>
            <button className="btn btn-sm" onClick={() => setWeeks([])}>None</button>
          </div>
          <div className="week-checks">
            {WEEKS.map((w) => {
              const c = verifiedByWeek(w).length;
              return (
                <label key={w} className={`check pill ${c ? "" : "disabled"}`}>
                  <input type="checkbox" disabled={!c} checked={weeks.includes(w)} onChange={() => toggle(w)} /> Week {w} <span className="muted small">{c ? c : "no data"}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <label className="field">Number of questions (max {pool.length})
          <input type="number" className="num" min={1} max={Math.max(pool.length, 1)} value={count} onChange={(e) => setCount(e.target.value)} />
        </label>
        <label className="field">Timer in minutes (0 = no timer)
          <input type="number" className="num" min={0} max={300} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </label>
        <label className="check"><input type="checkbox" checked={shuffled} onChange={(e) => setShuffled(e.target.checked)} /> Shuffle order (otherwise original bank order)</label>
        <label className="check"><input type="checkbox" checked={practice} onChange={(e) => setPractice(e.target.checked)} /> Practice mode: immediate feedback after each answer</label>
        <p className="small muted">Only verified questions with valid answer keys are used. Each question appears at most once per quiz.</p>
        <div><button className="btn btn-primary" disabled={!pool.length} onClick={start}>Start random quiz ({pool.length ? n : 0})</button></div>
      </section>
      {dialog}
    </div>
  );
}
