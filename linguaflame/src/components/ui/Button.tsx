import { clsx } from 'clsx';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-brand-500 to-brand-600 text-surface-900 hover:from-brand-400 hover:to-brand-500 font-bold shadow-lg shadow-brand-500/25',
  secondary: 'bg-surface-700 text-slate-200 hover:bg-surface-600 border border-surface-500',
  ghost: 'bg-transparent text-slate-300 hover:bg-surface-700 hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-red-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-base rounded-xl gap-2',
  lg: 'px-8 py-4 text-lg rounded-2xl gap-3',
};

export function Button({ variant = 'primary', size = 'md', icon, iconLeft, iconRight, loading, children, className, disabled, ...props }: ButtonProps) {
  const leftIcon = iconLeft ?? icon;
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
