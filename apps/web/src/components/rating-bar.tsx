'use client';

interface RatingBarProps {
  label: string;
  value: number;
  maxValue?: number;
}

export function RatingBar({ label, value, maxValue = 5 }: RatingBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-text-secondary w-32 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-text-primary w-8 text-right">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
