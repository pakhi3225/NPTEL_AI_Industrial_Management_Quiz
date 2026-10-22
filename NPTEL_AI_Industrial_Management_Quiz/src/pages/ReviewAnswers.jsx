import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import QuestionCard from "../components/QuestionCard.jsx";
import { useStore } from "../hooks/useStore.jsx";
import { questionById } from "../utils/quiz.js";

const FILTERS = [["all", "All"], ["incorrect", "Incorrect"], ["unanswered", "Unanswered"], ["correct", "Correct"]];
const LABEL = { correct: "Correct", incorrect: "Incorrect", unanswered: "Unanswered" };

export default function ReviewAnswers() {
  const { id } = useParams();
  const { state } = useStore();
  const [filter, setFilter] = useState("all");
  const a = state.attempts.find((x) => x.id === id);
  if (!a) {
    return (
      <div className="card stack narrow">
        <h1>Attempt not found</h1>
        <Link className="btn btn-primary" to="/history">Go to history</Link>
      </div>
    );
  }
  const rows = a.summary.results.map((r, i) => ({ ...r, number: i + 1 })).filter((r) => filter === "all" || r.status === filter);
  return (
    <div className="stack">
      <div className="row wrap">
        <h1 className="grow">Review: {a.title}</h1>
        <Link className="btn" to={`/results/${a.id}`}>Back to results</Link>
      </div>
      <div className="row wrap" role="group" aria-label="Filter questions">
        {FILTERS.map(([k, l]) => (
          <button key={k} className={`btn btn-sm ${filter === k ? "btn-primary" : ""}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>
            {l} ({k === "all" ? a.summary.total : a.summary[k]})
          </button>
        ))}
      </div>
      {rows.length === 0 && <div className="card muted">No questions in this category.</div>}
      {rows.map((r) => (
        <div key={r.id} className="stack-sm">
          <span className={`status status-${r.status}`}>{LABEL[r.status]}</span>
          <QuestionCard q={questionById[r.id]} number={r.number} selected={r.selected} locked revealed showExplanation />
        </div>
      ))}
    </div>
  );
}
