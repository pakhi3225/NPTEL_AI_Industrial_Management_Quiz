import { AlertTriangle, Play, RotateCcw } from "lucide-react";
import ProgressBar from "./ProgressBar.jsx";
import { WEEK_TITLES } from "../data/questions.js";
import { verifiedByWeek } from "../utils/quiz.js";
import { useDerived } from "../hooks/useStore.jsx";

export default function WeekCard({ week, onOpen, selected }) {
  const { attemptedByWeek } = useDerived();
  const total = verifiedByWeek(week).length;
  const attempted = attemptedByWeek[week] || 0;
  const pct = total ? Math.round((attempted / total) * 100) : 0;
  const empty = total === 0;
  return (
    <article className={`card week-card ${selected ? "selected" : ""} ${empty ? "empty" : ""}`}>
      <div className="week-no">Week {week}</div>
      <h3>{WEEK_TITLES[week]}</h3>
      {empty ? (
        <p className="warn-text"><AlertTriangle size={15} /> Question data required</p>
      ) : (
        <>
          <p className="muted">{total} verified questions · {attempted} attempted</p>
          <ProgressBar value={pct} label={`Week ${week} progress`} />
          <p className="small muted">{pct}% practised</p>
        </>
      )}
      <button className="btn btn-primary btn-block" disabled={empty} onClick={() => onOpen(week)}>
        {attempted ? <RotateCcw size={15} /> : <Play size={15} />} {attempted ? "Continue practising" : "Start quiz"}
      </button>
    </article>
  );
}
