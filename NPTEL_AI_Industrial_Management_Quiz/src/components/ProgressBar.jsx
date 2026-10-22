export default function ProgressBar({ value, label, tone = "accent" }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return (
    <div
      className={`pbar pbar-${tone}`}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || "Progress"}
    >
      <span style={{ width: `${v}%` }} />
    </div>
  );
}
