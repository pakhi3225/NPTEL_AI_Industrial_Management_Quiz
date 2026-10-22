import { useState } from "react";
import { Bookmark } from "lucide-react";
import QuestionCard from "../components/QuestionCard.jsx";
import { useStore } from "../hooks/useStore.jsx";
import { useLaunch } from "../hooks/useLaunch.jsx";
import { questionById, originalOrder } from "../utils/quiz.js";

export default function Bookmarks() {
  const { state } = useStore();
  const { launch, dialog } = useLaunch();
  const [shown, setShown] = useState({});
  const ids = originalOrder(state.bookmarks.filter((id) => questionById[id]));

  return (
    <div className="stack">
      <div className="row wrap">
        <h1 className="grow">Bookmarks</h1>
        <button className="btn btn-primary" disabled={!ids.length} onClick={() => launch({ title: "Bookmarked questions", mode: "retry", ids, practice: true })}>
          Practise bookmarked ({ids.length})
        </button>
      </div>
      {ids.length === 0 ? (
        <div className="card muted"><Bookmark size={16} /> Nothing bookmarked yet. Use the bookmark icon on any question to save it here.</div>
      ) : (
        ids.map((id, i) => {
          const q = questionById[id];
          const open = !!shown[id];
          return (
            <div key={id} className="stack-sm">
              <QuestionCard q={q} number={i + 1} selected={[]} locked revealed={open} showExplanation={open} />
              <div>
                <button className="btn btn-sm" onClick={() => setShown({ ...shown, [id]: !open })}>{open ? "Hide answer" : "Show answer"}</button>
              </div>
            </div>
          );
        })
      )}
      {dialog}
    </div>
  );
}
