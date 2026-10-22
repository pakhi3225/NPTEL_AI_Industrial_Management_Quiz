const KEY = "nptel-ai-im-quiz:v1";

export const defaultState = {
  attempts: [], // finished quizzes
  stats: {}, // questionId -> { attempts, correct, lastCorrect }
  bookmarks: [],
  lastWeek: 0,
  activeSession: null, // quiz in progress (survives refresh)
  prefs: { theme: "system", scoreCorrect: 1, scoreWrong: 0 },
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed, prefs: { ...defaultState.prefs, ...(parsed.prefs || {}) } };
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked – app keeps working in memory */
  }
}
