import "./ProgressBar.css";

interface Props {
  current: number;
  total: number;
  streak: number;
}

export function ProgressBar({ current, total, streak }: Props) {
  const pct = total === 0 ? 0 : Math.min(100, (current / total) * 100);
  return (
    <div className="progress-bar">
      <div className="progress-track" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-labels">
        <span className="progress-count">
          {Math.min(current + 1, total)} / {total}
        </span>
        {streak > 1 && <span className="progress-streak">Streak ×{streak}</span>}
      </div>
    </div>
  );
}
