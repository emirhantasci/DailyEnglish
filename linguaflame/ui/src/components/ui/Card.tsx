import { clsx } from 'clsx';
import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
  gradient?: string;
}

export function Card({ children, className, glow, gradient, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-surface-600/50 bg-surface-800/80 backdrop-blur-sm p-6',
        'transition-all duration-300',
        glow && 'animate-pulse-glow',
        gradient,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
