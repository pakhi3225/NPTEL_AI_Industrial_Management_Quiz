import { useState } from "react";
import { verifiedQuestions, pickIds, originalOrder } from "../utils/quiz.js";
import { useLaunch } from "../hooks/useLaunch.jsx";
import { useStore } from "../hooks/useStore.jsx";

export default function FullTest() {
  const { launch, dialog } = useLaunch();
  const { state, setPrefs } = useStore();
  const [minutes, setMinutes] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const total = verifiedQuestions.length;

  const start = () => {
    const all = verifiedQuestions.map((q) => q.id);
    launch({
      title: "Full test",
      mode: "full",
      ids: shuffled ? pickIds(verifiedQuestions, total) : originalOrder(all),
      practice: false,
      timerSeconds: Number(minutes) > 0 ? Math.round(Number(minutes) * 60) : null,
    });
  };

  return (
    <div className="stack narrow">
      <h1>Full test</h1>
      <section className="card stack">
        <h2>Instructions</h2>
        <ul className="plain">
          <li>The test contains all {total} verified questions from Weeks 0–8.</li>
          <li>Answers are hidden until you submit. Use the question panel to jump around, mark questions for review and clear answers.</li>
          <li>You can submit at any time; unanswered questions are counted separately.</li>
          <li>The duration and marking scheme below are your own choice. They are not an official NPTEL exam format.</li>
        </ul>
        <label className="field">Timer in minutes (0 = no timer)
          <input type="number" className="num" min={0} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </label>
        <div className="row wrap">
          <label className="field">Marks per correct answer
            <input type="number" className="num" step="0.25" min={0} value={state.prefs.scoreCorrect} onChange={(e) => setPrefs({ scoreCorrect: Math.max(0, Number(e.target.value)) })} />
          </label>
          <label className="field">Marks lost per wrong answer
            <input type="number" className="num" step="0.25" min={0} value={state.prefs.scoreWrong} onChange={(e) => setPrefs({ scoreWrong: Math.max(0, Number(e.target.value)) })} />
          </label>
        </div>
        <label className="check"><input type="checkbox" checked={shuffled} onChange={(e) => setShuffled(e.target.checked)} /> Shuffle question order</label>
        <div><button className="btn btn-primary" disabled={!total} onClick={start}>Start full test</button></div>
      </section>
      {dialog}
    </div>
  );
}
