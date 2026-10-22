import { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from "react";
import { loadState, saveState, defaultState } from "../utils/storage.js";
import { gradeSession, questionById, gradeAnswer } from "../utils/quiz.js";

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function reducer(s, a) {
  switch (a.type) {
    case "start":
      return { ...s, activeSession: a.session };
    case "session": {
      if (!s.activeSession) return s;
      return { ...s, activeSession: { ...s.activeSession, ...a.patch } };
    }
    case "finish": {
      const stats = { ...s.stats };
      a.attempt.summary.results.forEach((r) => {
        if (r.status === "unanswered") return;
        const prev = stats[r.id] || { attempts: 0, correct: 0, lastCorrect: null };
        stats[r.id] = {
          attempts: prev.attempts + 1,
          correct: prev.correct + (r.status === "correct" ? 1 : 0),
          lastCorrect: r.status === "correct",
        };
      });
      return { ...s, attempts: [a.attempt, ...s.attempts].slice(0, 200), stats, activeSession: null };
    }
    case "abandon":
      return { ...s, activeSession: null };
    case "bookmark":
      return {
        ...s,
        bookmarks: s.bookmarks.includes(a.id) ? s.bookmarks.filter((x) => x !== a.id) : [...s.bookmarks, a.id],
      };
    case "lastWeek":
      return { ...s, lastWeek: a.week };
    case "prefs":
      return { ...s, prefs: { ...s.prefs, ...a.patch } };
    case "clear":
      // Progress only. The question bank lives in src/data/questions.js and is never touched.
      return { ...defaultState, prefs: s.prefs, bookmarks: [] };
    default:
      return s;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => saveState(state), [state]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const t = state.prefs.theme;
      const dark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
      root.dataset.theme = dark ? "dark" : "light";
    };
    apply();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [state.prefs.theme]);

  const startSession = useCallback((cfg) => {
    const session = {
      id: uid(),
      title: cfg.title,
      mode: cfg.mode,
      ids: cfg.ids,
      answers: {},
      marked: [],
      checked: [],
      index: 0,
      startedAt: Date.now(),
      timerSeconds: cfg.timerSeconds || null,
      practice: !!cfg.practice,
      config: cfg.config || {},
    };
    dispatch({ type: "start", session });
    return session;
  }, []);

  const finishSession = useCallback(
    (session) => {
      const scoring = { correct: Number(state.prefs.scoreCorrect), wrong: Number(state.prefs.scoreWrong) };
      const summary = gradeSession(session.ids, session.answers, scoring);
      const now = Date.now();
      const elapsed = Math.round((now - session.startedAt) / 1000);
      const attempt = {
        id: uid(),
        title: session.title,
        mode: session.mode,
        finishedAt: now,
        duration: elapsed,
        timed: !!session.timerSeconds,
        timerSeconds: session.timerSeconds,
        practice: session.practice,
        ids: session.ids,
        answers: session.answers,
        marked: session.marked,
        config: session.config,
        scoring,
        summary,
      };
      dispatch({ type: "finish", attempt });
      return attempt;
    },
    [state.prefs.scoreCorrect, state.prefs.scoreWrong]
  );

  const api = useMemo(
    () => ({
      state,
      startSession,
      finishSession,
      patchSession: (patch) => dispatch({ type: "session", patch }),
      abandon: () => dispatch({ type: "abandon" }),
      toggleBookmark: (id) => dispatch({ type: "bookmark", id }),
      setLastWeek: (week) => dispatch({ type: "lastWeek", week }),
      setPrefs: (patch) => dispatch({ type: "prefs", patch }),
      clearProgress: () => dispatch({ type: "clear" }),
    }),
    [state, startSession, finishSession]
  );
  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}

/** Derived numbers used by dashboard and week cards. */
export function useDerived() {
  const { state } = useStore();
  return useMemo(() => {
    const attemptedIds = Object.keys(state.stats);
    const totalAnswers = Object.values(state.stats).reduce((n, x) => n + x.attempts, 0);
    const totalCorrect = Object.values(state.stats).reduce((n, x) => n + x.correct, 0);
    const accuracy = totalAnswers ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    const best = state.attempts.reduce((m, a) => Math.max(m, a.summary.percentage), 0);
    const incorrectIds = attemptedIds.filter((id) => state.stats[id].lastCorrect === false && questionById[id]);
    const attemptedByWeek = {};
    attemptedIds.forEach((id) => {
      const q = questionById[id];
      if (q) attemptedByWeek[q.week] = (attemptedByWeek[q.week] || 0) + 1;
    });
    return { attemptedCount: attemptedIds.length, totalAnswers, accuracy, best, incorrectIds, attemptedByWeek };
  }, [state.stats, state.attempts]);
}

export { gradeAnswer };
