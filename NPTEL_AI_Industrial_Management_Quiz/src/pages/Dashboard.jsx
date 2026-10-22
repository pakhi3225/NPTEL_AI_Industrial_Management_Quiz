import { Link, useNavigate } from "react-router-dom";
import { Play, Shuffle, ClipboardCheck, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import WeekCard from "../components/WeekCard.jsx";
import { Stat } from "../components/ResultsSummary.jsx";
import { useStore, useDerived } from "../hooks/useStore.jsx";
import { useLaunch } from "../hooks/useLaunch.jsx";
import { verifiedQuestions, verifiedByWeek, weeksWithData, WEEKS, pickIds, originalOrder, fmtDate } from "../utils/quiz.js";

export default function Dashboard() {
  const { state } = useStore();
  const d = useDerived();
  const nav = useNavigate();
  const { launch, dialog } = useLaunch();

  const continuePractice = () => {
    if (state.activeSession) return nav("/quiz");
    nav("/weeks", { state: { week: state.lastWeek } });
  };
  const quickRandom = () =>
    launch({ title: "Random quiz (10 questions)", mode: "random", ids: pickIds(verifiedQuestions, 10), practice: false });
  const reviewIncorrect = () =>
    launch({ title: "Practise incorrect answers", mode: "retry", ids: originalOrder(d.incorrectIds), practice: true });

  return (
    <div className="stack">
      <section className="hero">
        <p className="hero-kicker">NPTEL course practice</p>
        <h1>Artificial Intelligence in Industrial and Management</h1>
        <p className="lead">
          Welcome back. Work through the weekly assignment questions, mix them into random quizzes, or sit the full set as a timed test. Every attempt is saved in this browser so you can keep coming back to the weak spots.
        </p>
        <div className="row wrap">
          <button className="btn btn-primary" onClick={continuePractice}><Play size={16} /> {state.activeSession ? "Resume quiz" : "Continue practising"}</button>
          <button className="btn" onClick={quickRandom}><Shuffle size={16} /> Random quiz</button>
          <button className="btn" onClick={() => nav("/full")}><ClipboardCheck size={16} /> Full test</button>
          <button className="btn" onClick={reviewIncorrect} disabled={!d.incorrectIds.length} title={d.incorrectIds.length ? "" : "No incorrect answers saved yet"}>
            <RotateCcw size={16} /> Review incorrect answers {d.incorrectIds.length ? `(${d.incorrectIds.length})` : ""}
          </button>
        </div>
      </section>

      <section className="stat-grid">
        <Stat label="Verified questions" value={verifiedQuestions.length} />
        <Stat label="Weeks with questions" value={`${weeksWithData.length} / ${WEEKS.length}`} />
        <Stat label="Questions attempted" value={`${d.attemptedCount} / ${verifiedQuestions.length}`} />
        <Stat label="Overall accuracy" value={`${d.accuracy}%`} />
        <Stat label="Best score" value={state.attempts.length ? `${d.best}%` : "–"} />
      </section>

      <section>
        <h2 className="section-title">Weeks</h2>
        <div className="week-grid">
          {WEEKS.map((w) => (
            <WeekCard key={w} week={w} onOpen={(week) => nav("/weeks", { state: { week } })} />
          ))}
        </div>
        <p className="small muted">
          Question counts: {WEEKS.map((w) => `W${w}: ${verifiedByWeek(w).length}`).join(" · ")} — total {verifiedQuestions.length}.
        </p>
      </section>

      <section>
        <h2 className="section-title">Recent attempts</h2>
        {state.attempts.length === 0 ? (
          <div className="card muted">No attempts yet. Start a week or a random quiz and your results will appear here.</div>
        ) : (
          <div className="card list">
            {state.attempts.slice(0, 5).map((a) => (
              <Link key={a.id} to={`/results/${a.id}`} className="list-row">
                <span className="grow"><strong>{a.title}</strong><br /><span className="small muted">{fmtDate(a.finishedAt)}</span></span>
                <span className="small"><CheckCircle2 size={14} className="ok" /> {a.summary.correct} <XCircle size={14} className="bad" /> {a.summary.incorrect}</span>
                <strong>{a.summary.percentage}%</strong>
              </Link>
            ))}
          </div>
        )}
      </section>
      {dialog}
    </div>
  );
}
