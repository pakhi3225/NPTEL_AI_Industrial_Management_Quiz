import { Check, X, Bookmark, Flag } from "lucide-react";
import { useStore } from "../hooks/useStore.jsx";

/**
 * Shared question display.
 * mode="answer": selectable. mode="review": locked, shows correct/incorrect.
 */
export default function QuestionCard({ q, number, selected = [], onChange, revealed = false, locked = false, marked, onMark, showExplanation = false }) {
  const { state, toggleBookmark } = useStore();
  const multi = q.type === "multiple";
  const bookmarked = state.bookmarks.includes(q.id);

  const pick = (i) => {
    if (locked) return;
    if (multi) onChange(selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i].sort());
    else onChange([i]);
  };

  return (
    <section className="qcard card" aria-labelledby={`q-${q.id}`}>
      <div className="q-meta">
        <span className="chip">Question {number}</span>
        <span className="chip chip-week">Week {q.week}</span>
        {multi && <span className="chip">Select all that apply</span>}
        <span className="spacer" />
        {onMark && (
          <button className={`btn btn-sm ${marked ? "btn-amber" : ""}`} onClick={onMark} aria-pressed={!!marked}>
            <Flag size={14} /> {marked ? "Marked" : "Mark for review"}
          </button>
        )}
        <button className={`icon-btn ${bookmarked ? "on" : ""}`} onClick={() => toggleBookmark(q.id)} aria-pressed={bookmarked} aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}>
          <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>
      <h2 id={`q-${q.id}`} className="q-text">{q.question}</h2>
      <div className="options" role={multi ? "group" : "radiogroup"} aria-labelledby={`q-${q.id}`}>
        {q.options.map((opt, i) => {
          const isSel = selected.includes(i);
          const isRight = q.correctAnswer.includes(i);
          let cls = "opt";
          if (isSel) cls += " sel";
          if (revealed && isRight) cls += " right";
          if (revealed && isSel && !isRight) cls += " wrong";
          return (
            <button
              key={i}
              className={cls}
              onClick={() => pick(i)}
              role={multi ? "checkbox" : "radio"}
              aria-checked={isSel}
              disabled={locked && !revealed}
              aria-disabled={locked}
            >
              <span className="opt-key">{String.fromCharCode(65 + i)}</span>
              <span className="opt-text">{opt}</span>
              {revealed && isRight && <span className="opt-flag ok"><Check size={16} /> Correct</span>}
              {revealed && isSel && !isRight && <span className="opt-flag bad"><X size={16} /> Your answer</span>}
              {revealed && isSel && isRight && <span className="sr-only">Your answer</span>}
            </button>
          );
        })}
      </div>
      {revealed && showExplanation && (
        <div className="explain">
          <strong>Explanation</strong>
          <p>{q.explanation || "No explanation was supplied for this question in the source material."}</p>
        </div>
      )}
      {revealed && q.note && <p className="small muted note">Source note: {q.note}</p>}
    </section>
  );
}
