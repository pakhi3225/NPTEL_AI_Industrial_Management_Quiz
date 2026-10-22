import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./useStore.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

/** Starts a quiz; asks first if another quiz is still in progress. */
export function useLaunch() {
  const { state, startSession } = useStore();
  const nav = useNavigate();
  const [pending, setPending] = useState(null);

  const go = (cfg) => {
    startSession(cfg);
    nav("/quiz");
  };
  const launch = (cfg) => {
    if (!cfg.ids.length) return;
    if (state.activeSession) setPending(cfg);
    else go(cfg);
  };
  const dialog = (
    <ConfirmDialog
      open={!!pending}
      title="Replace the quiz in progress?"
      confirmLabel="Start new quiz"
      danger
      onCancel={() => setPending(null)}
      onConfirm={() => {
        const c = pending;
        setPending(null);
        go(c);
      }}
    >
      You have an unfinished quiz. Starting a new one discards its current answers.
    </ConfirmDialog>
  );
  return { launch, dialog };
}
