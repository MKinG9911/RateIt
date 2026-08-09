'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background-elevated border border-surface-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center gap-3 p-6 border-b border-surface-border">
          <div
            className={`p-2 rounded-full ${variant === 'danger' ? 'bg-accent-red/10' : 'bg-accent-yellow/10'}`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${variant === 'danger' ? 'text-accent-red' : 'text-accent-yellow'}`}
            />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button onClick={onCancel} className="ml-auto p-1 rounded-lg hover:bg-surface-light">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-text-secondary">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-surface-border">
          <button onClick={onCancel} className="btn-secondary text-sm">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={variant === 'danger' ? 'btn-danger text-sm' : 'btn-primary text-sm'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
