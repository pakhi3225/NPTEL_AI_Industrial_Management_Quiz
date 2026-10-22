import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import WeekCard from "../components/WeekCard.jsx";
import { useStore, useDerived } from "../hooks/useStore.jsx";
import { useLaunch } from "../hooks/useLaunch.jsx";
import { WEEKS, verifiedByWeek, pickIds, originalOrder } from "../utils/quiz.js";
import { WEEK_TITLES } from "../data/questions.js";

export default function WeekPractice() {
  const loc = useLocation();
  const { state, setLastWeek } = useStore();
  const { incorrectIds } = useDerived();
  const { launch, dialog } = useLaunch();
  const [week, setWeek] = useState(loc.state?.week ?? state.lastWeek ?? 0);
  const [scope, setScope] = useState("all");
  const [custom, setCustom] = useState(5);
  const [shuffled, setShuffled] = useState(true);
  const [practice, setPractice] = useState(true);

  useEffect(() => {
    if (loc.state?.week !== undefined) setWeek(loc.state.week);
  }, [loc.state]);

  const pool = verifiedByWeek(week);
  const weekIncorrect = incorrectIds.filter((id) => pool.some((q) => q.id === id));
  const n = Math.max(1, Math.min(Number(custom) || 1, pool.length || 1));

  useEffect(() => {
    if (scope === "retry" && weekIncorrect.length === 0) setScope("all");
  }, [week, scope, weekIncorrect.length]);

  const start = () => {
    let ids;
    if (scope === "retry") ids = weekIncorrect;
    else if (scope === "custom") ids = pickIds(pool, n, shuffled);
    else ids = pool.map((q) => q.id);
    if (scope !== "custom") ids = shuffled ? pickIds(pool.filter((q) => ids.includes(q.id)), ids.length) : originalOrder(ids);
    setLastWeek(week);
    launch({
      title: `Week ${week}${scope === "retry" ? " – incorrect questions" : ""}`,
      mode: scope === "retry" ? "retry" : "week",
      ids,
      practice,
      config: { week },
    });
  };

  return (
    <div className="stack">
      <h1>Weekwise practice</h1>
      <div className="week-grid">
        {WEEKS.map((w) => (
          <WeekCard key={w} week={w} selected={w === week} onOpen={(x) => { setWeek(x); setLastWeek(x); }} />
        ))}
      </div>

      <section className="card stack" aria-live="polite">
        <h2>Week {week}: {WEEK_TITLES[week]}</h2>
        {pool.length === 0 ? (
          <p className="warn-text"><AlertTriangle size={16} /> Question data required for this week. Add verified questions in <code>src/data/questions.js</code>.</p>
        ) : (
          <>
            <fieldset className="choices">
              <legend>Which questions?</legend>
              <label><input type="radio" name="scope" checked={scope === "all"} onChange={() => setScope("all")} /> All {pool.length} questions</label>
              <label>
                <input type="radio" name="scope" checked={scope === "custom"} onChange={() => setScope("custom")} /> A custom number
                <input type="number" className="num" min={1} max={pool.length} value={custom} onChange={(e) => { setCustom(e.target.value); setScope("custom"); }} aria-label="Number of questions" />
              </label>
              <label className={weekIncorrect.length ? "" : "disabled"}>
                <input type="radio" name="scope" disabled={!weekIncorrect.length} checked={scope === "retry"} onChange={() => setScope("retry")} /> Only questions I got wrong ({weekIncorrect.length})
              </label>
            </fieldset>
            <label className="check"><input type="checkbox" checked={shuffled} onChange={(e) => setShuffled(e.target.checked)} /> Shuffle question order</label>
            <label className="check"><input type="checkbox" checked={practice} onChange={(e) => setPractice(e.target.checked)} /> Practice mode: check each answer and see the explanation immediately</label>
            <div><button className="btn btn-primary" onClick={start}>Start Week {week} quiz</button></div>
          </>
        )}
      </section>
      {dialog}
    </div>
  );
}
