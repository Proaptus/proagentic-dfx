'use client';

/**
 * Modal Component
 * REQ-276: Keyboard navigation for all interactive elements
 * REQ-277: Screen reader support with ARIA labels
 * REQ-278: Focus management
 *
 * Fully accessible modal dialog with focus trap, keyboard navigation,
 * and proper ARIA attributes for screen readers.
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children }: ModalProps) {
  const containerRef = useFocusTrap<HTMLDivElement>(open);

  useKeyboardNavigation({
    onEscape: onClose,
    enabled: open,
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        ref={containerRef}
        className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {description && (
          <p id="modal-description" className="px-4 pt-4 text-gray-600">
            {description}
          </p>
        )}

        <div className="p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
