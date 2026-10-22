import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eraser, Clock, Send, Eye, X as XIcon } from "lucide-react";
import QuestionCard from "../components/QuestionCard.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useStore } from "../hooks/useStore.jsx";
import { questionById, fmtTime, gradeAnswer } from "../utils/quiz.js";

export default function Quiz() {
  const { state, patchSession, finishSession, abandon } = useStore();
  const s = state.activeSession;
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [leave, setLeave] = useState(false);
  const [now, setNow] = useState(Date.now());
  const done = useRef(false);

  const submit = (sess) => {
    if (done.current) return;
    done.current = true;
    const attempt = finishSession(sess);
    nav(`/results/${attempt.id}`, { replace: true });
  };

  // countdown (only for timed quizzes)
  const timed = !!s?.timerSeconds;
  useEffect(() => {
    if (!timed) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [timed]);
  const remaining = timed ? Math.max(0, s.timerSeconds - Math.floor((now - s.startedAt) / 1000)) : null;
  useEffect(() => {
    if (timed && remaining === 0 && s) submit(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, timed]);

  // arrow-key navigation (ignored while typing or in a dialog)
  useEffect(() => {
    if (!s) return;
    const onKey = (e) => {
      if (confirm || leave || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight" && s.index < s.ids.length - 1) patchSession({ index: s.index + 1 });
      if (e.key === "ArrowLeft" && s.index > 0) patchSession({ index: s.index - 1 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!s) {
    return (
      <div className="card stack narrow">
        <h1>No quiz in progress</h1>
        <p className="muted">Pick a week, a random quiz or the full test to begin.</p>
        <div className="row wrap">
          <Link className="btn btn-primary" to="/weeks">Weekwise practice</Link>
          <Link className="btn" to="/random">Random quiz</Link>
          <Link className="btn" to="/full">Full test</Link>
        </div>
      </div>
    );
  }

  const q = questionById[s.ids[s.index]];
  const selected = s.answers[q.id] || [];
  const checked = s.practice && s.checked.includes(q.id);
  const answeredCount = s.ids.filter((id) => (s.answers[id] || []).length).length;
  const unanswered = s.ids.length - answeredCount;
  const isMarked = s.marked.includes(q.id);
  const status = checked ? gradeAnswer(q, selected) : null;

  const setAnswer = (sel) => patchSession({ answers: { ...s.answers, [q.id]: sel } });
  const clear = () => {
    const a = { ...s.answers };
    delete a[q.id];
    patchSession({ answers: a });
  };
  const toggleMark = () => patchSession({ marked: isMarked ? s.marked.filter((x) => x !== q.id) : [...s.marked, q.id] });
  const go = (i) => patchSession({ index: i });

  return (
    <div className="quiz-layout">
      <div className="stack">
        <div className="quiz-head card">
          <div className="grow">
            <strong>{s.title}</strong>
            <span className="muted small"> · {s.practice ? "Practice mode" : "Test mode"}</span>
            <ProgressBar value={(answeredCount / s.ids.length) * 100} label="Answered" />
            <div className="small muted">{answeredCount} of {s.ids.length} answered · question {s.index + 1} of {s.ids.length}</div>
          </div>
          {timed && (
            <div className={`timer ${remaining <= 60 ? "low" : ""}`} role="timer" aria-label={`Time remaining ${fmtTime(remaining)}`}>
              <Clock size={16} /> {fmtTime(remaining)}
            </div>
          )}
          <button className="icon-btn" onClick={() => setLeave(true)} aria-label="Quit quiz"><XIcon size={18} /></button>
        </div>

        <QuestionCard
          q={q}
          number={s.index + 1}
          selected={selected}
          onChange={setAnswer}
          locked={checked}
          revealed={checked}
          showExplanation={checked}
          marked={isMarked}
          onMark={toggleMark}
        />

        {checked && (
          <div className={`banner ${status === "correct" ? "banner-ok" : "banner-bad"}`} role="status">
            {status === "correct" ? "Correct." : status === "incorrect" ? "Not quite. The correct option is highlighted above." : ""}
          </div>
        )}

        <div className="row wrap quiz-actions">
          <button className="btn" onClick={() => go(s.index - 1)} disabled={s.index === 0}><ChevronLeft size={16} /> Previous</button>
          <button className="btn" onClick={clear} disabled={!selected.length || checked}><Eraser size={16} /> Clear</button>
          {s.practice && (
            <button className="btn btn-amber" disabled={!selected.length || checked} onClick={() => patchSession({ checked: [...s.checked, q.id] })}>
              <Eye size={16} /> Check answer
            </button>
          )}
          <span className="spacer" />
          {s.index < s.ids.length - 1 ? (
            <button className="btn btn-primary" onClick={() => go(s.index + 1)}>Next <ChevronRight size={16} /></button>
          ) : (
            <button className="btn btn-primary" onClick={() => setConfirm(true)}><Send size={16} /> Submit quiz</button>
          )}
        </div>
      </div>

      <aside className="card panel" aria-label="Question navigator">
        <h3>Questions</h3>
        <div className="navgrid">
          {s.ids.map((id, i) => {
            const ans = (s.answers[id] || []).length > 0;
            const mk = s.marked.includes(id);
            return (
              <button
                key={id}
                onClick={() => go(i)}
                className={`navq ${i === s.index ? "cur" : ""} ${ans ? "ans" : ""} ${mk ? "mk" : ""}`}
                aria-label={`Question ${i + 1}${ans ? ", answered" : ", not answered"}${mk ? ", marked for review" : ""}`}
                aria-current={i === s.index ? "true" : undefined}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <ul className="legend small muted">
          <li><i className="navq ans" /> Answered</li>
          <li><i className="navq" /> Not answered</li>
          <li><i className="navq mk" /> Marked for review</li>
        </ul>
        <button className="btn btn-primary btn-block" onClick={() => setConfirm(true)}><Send size={16} /> Submit quiz</button>
      </aside>

      <ConfirmDialog
        open={confirm}
        title="Submit this quiz?"
        confirmLabel="Submit"
        onCancel={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); submit(s); }}
      >
        <p>{answeredCount} answered, <strong>{unanswered} unanswered</strong>, {s.marked.length} marked for review.</p>
        <p className="muted">You will not be able to change answers after submitting.</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={leave}
        title="Quit without submitting?"
        confirmLabel="Quit quiz"
        danger
        onCancel={() => setLeave(false)}
        onConfirm={() => { setLeave(false); abandon(); nav("/"); }}
      >
        Your answers for this quiz will be discarded and no result will be saved.
      </ConfirmDialog>
    </div>
  );
}
