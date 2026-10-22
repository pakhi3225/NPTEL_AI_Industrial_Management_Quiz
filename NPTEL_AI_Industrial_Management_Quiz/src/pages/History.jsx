import { Link } from "react-router-dom";
import { fmtDate, fmtTime } from "../utils/quiz.js";
import { useStore } from "../hooks/useStore.jsx";

export default function History() {
  const { state } = useStore();
  return (
    <div className="stack">
      <h1>Results &amp; history</h1>
      {state.attempts.length === 0 ? (
        <div className="card muted">No attempts yet. Finish a quiz and it will be listed here.</div>
      ) : (
        <div className="card list">
          {state.attempts.map((a) => (
            <div key={a.id} className="list-row">
              <span className="grow">
                <strong>{a.title}</strong><br />
                <span className="small muted">
                  {fmtDate(a.finishedAt)} · {a.summary.correct} correct, {a.summary.incorrect} wrong, {a.summary.unanswered} unanswered{a.timed ? ` · ${fmtTime(a.duration)}` : ""}
                </span>
              </span>
              <strong>{a.summary.percentage}%</strong>
              <Link className="btn btn-sm" to={`/results/${a.id}`}>Results</Link>
              <Link className="btn btn-sm" to={`/review/${a.id}`}>Review</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
