import { Link, useNavigate, useParams } from "react-router-dom";
import { ListChecks, RotateCcw, Target, Home } from "lucide-react";
import ResultsSummary from "../components/ResultsSummary.jsx";
import { useStore } from "../hooks/useStore.jsx";
import { useLaunch } from "../hooks/useLaunch.jsx";
import { originalOrder } from "../utils/quiz.js";

export default function Results() {
  const { id } = useParams();
  const { state } = useStore();
  const nav = useNavigate();
  const { launch, dialog } = useLaunch();
  const a = state.attempts.find((x) => x.id === id);

  if (!a) {
    return (
      <div className="card stack narrow">
        <h1>Result not found</h1>
        <p className="muted">This attempt may have been cleared.</p>
        <Link className="btn btn-primary" to="/history">Go to history</Link>
      </div>
    );
  }
  const wrongIds = a.summary.results.filter((r) => r.status !== "correct").map((r) => r.id);
  const retry = () => launch({ title: a.title, mode: a.mode, ids: a.ids, practice: a.practice, timerSeconds: a.timerSeconds, config: a.config });
  const retryWrong = () =>
    launch({ title: `${a.title} – incorrect only`, mode: "retry", ids: originalOrder(wrongIds), practice: true });

  return (
    <div className="stack">
      <h1>Results: {a.title}</h1>
      <ResultsSummary attempt={a} />
      <div className="row wrap">
        <button className="btn btn-primary" onClick={() => nav(`/review/${a.id}`)}><ListChecks size={16} /> Review answers</button>
        <button className="btn" onClick={retry}><RotateCcw size={16} /> Retry quiz</button>
        <button className="btn" onClick={retryWrong} disabled={!wrongIds.length}><Target size={16} /> Practise incorrect questions</button>
        <button className="btn" onClick={() => nav("/")}><Home size={16} /> Dashboard</button>
      </div>
      {dialog}
    </div>
  );
}
