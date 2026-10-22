import { questions, WEEK_TITLES } from "../data/questions.js";

export const WEEKS = Object.keys(WEEK_TITLES).map(Number).sort((a, b) => a - b);

/** Returns a list of problems with a question, or [] when it is valid. */
export function validateQuestion(q) {
  const problems = [];
  if (!q || typeof q !== "object") return ["Not an object"];
  if (!q.id) problems.push("Missing id");
  if (!Number.isInteger(q.week) || !WEEKS.includes(q.week)) problems.push("Week must be 0-8");
  if (!q.question || !String(q.question).trim()) problems.push("Missing question text");
  if (!Array.isArray(q.options) || q.options.length < 2) problems.push("Needs at least 2 options");
  if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
    problems.push("Missing answer key");
  } else if (
    Array.isArray(q.options) &&
    q.correctAnswer.some((i) => !Number.isInteger(i) || i < 0 || i >= q.options.length)
  ) {
    problems.push("Answer key points to a non-existent option");
  }
  if (q.type === "single" && Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1)
    problems.push("Single-answer question has several correct answers");
  if (q.verified !== true) problems.push("Answer key not marked verified");
  return problems;
}

export const allQuestions = questions;
export const issues = questions
  .map((q) => ({ id: q.id, week: q.week, problems: validateQuestion(q) }))
  .filter((x) => x.problems.length);
const badIds = new Set(issues.map((x) => x.id));
export const verifiedQuestions = questions.filter((q) => !badIds.has(q.id));
export const questionById = Object.fromEntries(questions.map((q) => [q.id, q]));

export const verifiedByWeek = (w) => verifiedQuestions.filter((q) => q.week === w);
export const weeksWithData = WEEKS.filter((w) => verifiedByWeek(w).length > 0);

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `count` unique ids from the pool. */
export function pickIds(pool, count, shuffled = true) {
  const ids = pool.map((q) => q.id);
  const base = shuffled ? shuffle(ids) : ids;
  return base.slice(0, Math.max(0, Math.min(count, base.length)));
}

/** Question ids in original (bank) order. */
export function originalOrder(ids) {
  const set = new Set(ids);
  return verifiedQuestions.filter((q) => set.has(q.id)).map((q) => q.id);
}

export const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

/** Status of one answer: "correct" | "incorrect" | "unanswered". */
export function gradeAnswer(q, selected) {
  if (!selected || selected.length === 0) return "unanswered";
  return sameSet([...selected].sort(), [...q.correctAnswer].sort()) ? "correct" : "incorrect";
}

export function gradeSession(ids, answers, scoring = { correct: 1, wrong: 0 }) {
  const results = ids.map((id) => {
    const q = questionById[id];
    const selected = answers[id] || [];
    return { id, week: q.week, selected, status: gradeAnswer(q, selected) };
  });
  const correct = results.filter((r) => r.status === "correct").length;
  const incorrect = results.filter((r) => r.status === "incorrect").length;
  const unanswered = results.length - correct - incorrect;
  const score = correct * scoring.correct - incorrect * scoring.wrong;
  const max = results.length * scoring.correct;
  const percentage = results.length ? Math.round((Math.max(score, 0) / max) * 1000) / 10 : 0;
  const byWeek = {};
  results.forEach((r) => {
    byWeek[r.week] ||= { total: 0, correct: 0 };
    byWeek[r.week].total++;
    if (r.status === "correct") byWeek[r.week].correct++;
  });
  return { results, correct, incorrect, unanswered, score, max, percentage, byWeek, total: results.length };
}

export const fmtTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};
export const fmtDate = (t) =>
  new Date(t).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
