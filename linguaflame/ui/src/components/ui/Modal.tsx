import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-800 border border-surface-600 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        {title && <h3 className="text-xl font-bold text-white mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
