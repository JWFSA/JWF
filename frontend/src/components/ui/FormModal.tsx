'use client';

import type { ReactNode } from 'react';
import { Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';

export interface FormModalProps {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  isPending?: boolean;
  error?: string | null;
  children: ReactNode;
  cancelLabel?: string;
  submitLabel?: string;
  pendingLabel?: string;
  showSaveIcon?: boolean;
  wide?: boolean;
}

export default function FormModal({
  title,
  onClose,
  onSubmit,
  isPending = false,
  error,
  children,
  cancelLabel = 'Cancelar',
  submitLabel = 'Guardar',
  pendingLabel = 'Guardando...',
  showSaveIcon = true,
  wide = false,
}: FormModalProps) {
  return (
    <Modal title={title} onClose={onClose} wide={wide}>
      <div className="space-y-4">
        {children}
        {error ? (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        ) : null}
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50"
        >
          {showSaveIcon ? <Save size={14} /> : null}
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </Modal>
  );
}
