import ProgressBar from "./ProgressBar.jsx";
import { fmtTime } from "../utils/quiz.js";

export default function ResultsSummary({ attempt }) {
  const s = attempt.summary;
  const tone = s.percentage >= 70 ? "good" : s.percentage >= 40 ? "accent" : "bad";
  return (
    <div className="stack">
      <div className="card score-hero">
        <div>
          <div className="big">{s.percentage}%</div>
          <div className="muted">Score {s.score} / {s.max}</div>
        </div>
        <ProgressBar value={s.percentage} tone={tone} label="Score" />
      </div>
      <div className="stat-grid">
        <Stat label="Total questions" value={s.total} />
        <Stat label="Correct" value={s.correct} tone="good" />
        <Stat label="Incorrect" value={s.incorrect} tone="bad" />
        <Stat label="Unanswered" value={s.unanswered} />
        {attempt.timed && <Stat label="Time taken" value={fmtTime(attempt.duration)} />}
      </div>
      <div className="card">
        <h3>Weekwise performance</h3>
        <div className="stack-sm">
          {Object.keys(s.byWeek).map(Number).sort((a, b) => a - b).map((w) => {
            const x = s.byWeek[w];
            const p = Math.round((x.correct / x.total) * 100);
            return (
              <div key={w} className="wk-row">
                <span>Week {w}</span>
                <ProgressBar value={p} tone={p >= 70 ? "good" : p >= 40 ? "accent" : "bad"} label={`Week ${w} accuracy`} />
                <span className="muted small">{x.correct}/{x.total}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Stat({ label, value, tone }) {
  return (
    <div className={`stat ${tone ? "stat-" + tone : ""}`}>
      <div className="stat-v">{value}</div>
      <div className="stat-l">{label}</div>
    </div>
  );
}
