import { clsx } from 'clsx';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'brand' | 'success' | 'danger' | 'info';
  variant?: 'brand' | 'success' | 'danger' | 'info';
  showPercent?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const colors = {
  brand: 'bg-gradient-to-r from-brand-500 to-brand-400',
  success: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
  danger: 'bg-gradient-to-r from-red-500 to-red-400',
  info: 'bg-gradient-to-r from-blue-500 to-blue-400',
};

const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export function ProgressBar({ value, max, label, color, variant, showPercent, showPercentage, size = 'md' }: ProgressBarProps) {
  const effectiveColor = variant ?? color ?? 'brand';
  const effectiveShowPercent = showPercent ?? showPercentage;
  const percent = max != null && max > 0 ? Math.min(100, Math.round((value / max) * 100)) : Math.min(100, Math.round(value));

  return (
    <div className="w-full">
      {(label || effectiveShowPercent) && (
        <div className="flex justify-between items-center mb-1 text-sm text-slate-400">
          {label && <span>{label}</span>}
          {effectiveShowPercent && <span className="font-mono">{percent}%</span>}
        </div>
      )}
      <div className={clsx('w-full rounded-full bg-surface-700 overflow-hidden', heights[size])}>
        <div
          className={clsx('h-full rounded-full transition-all duration-700 ease-out', colors[effectiveColor])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
