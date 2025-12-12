import React from 'react';
import './ConfirmationModal.css';

/**
 * ConfirmationModal Component
 * Displays a confirmation dialog with custom title, message, and action buttons.
 *
 * Props:
 *   - isOpen: boolean - Whether the modal is visible
 *   - title: string - Modal title
 *   - message: string - Modal message/description
 *   - confirmText: string - Text for the confirm button (default: "Confirm")
 *   - cancelText: string - Text for the cancel button (default: "Cancel")
 *   - confirmButtonType: string - Button type ('danger' | 'success' | 'primary') (default: 'danger')
 *   - onConfirm: function - Called when user clicks confirm
 *   - onCancel: function - Called when user clicks cancel or backdrop
 *   - isLoading: boolean - Show loading state on confirm button
 *
 * Example Usage:
 * <ConfirmationModal
 *   isOpen={showDeleteConfirm}
 *   title="Delete Campaign"
 *   message="Are you sure you want to delete this campaign? This action cannot be undone."
 *   confirmText="Delete"
 *   cancelText="Keep It"
 *   confirmButtonType="danger"
 *   onConfirm={() => handleDelete()}
 *   onCancel={() => setShowDeleteConfirm(false)}
 * />
 */

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonType = 'danger',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen]);

  return (
    <div className="confirmation-overlay" onClick={handleBackdropClick} role="presentation">
      <div className="confirmation-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title">
        {/* Modal Header */}
        <div className="confirmation-header">
          <h2 id="confirmation-title" className="confirmation-title">{title}</h2>
          <button
            className="confirmation-close"
            onClick={onCancel}
            aria-label="Close dialog"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="confirmation-body">
          <p className="confirmation-message">{message}</p>
        </div>

        {/* Modal Footer */}
        <div className="confirmation-footer">
          <button
            className="confirmation-btn cancel-btn"
            onClick={onCancel}
            disabled={isLoading}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className={`confirmation-btn confirm-btn ${confirmButtonType}`}
            onClick={onConfirm}
            disabled={isLoading}
            type="button"
            aria-busy={isLoading}
          >
            {isLoading ? '...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
