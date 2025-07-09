import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

interface ModalFooterProps {
  children: React.ReactNode;
}

interface ModalButtonProps {
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "w-80",
    md: "w-96",
    lg: "w-[500px]",
  };

  // Separate content and footer
  const childrenArray = React.Children.toArray(children);
  const footerIndex = childrenArray.findIndex(
    (child) => React.isValidElement(child) && child.type === ModalFooter
  );

  const content =
    footerIndex !== -1 ? childrenArray.slice(0, footerIndex) : childrenArray;
  const footer = footerIndex !== -1 ? childrenArray[footerIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - translucent instead of solid black */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white border border-neutral-200 rounded-lg shadow-lg ${sizeClasses[size]} max-w-[90vw] max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
          <h2 className="text-sm font-medium text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">{content}</div>

        {/* Footer */}
        {footer}
      </div>
    </div>
  );
}

export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className="flex justify-end gap-3 p-4 border-t border-neutral-200 bg-white flex-shrink-0 rounded-b-lg">
      {children}
    </div>
  );
}

export function ModalButton({
  onClick,
  variant = "secondary",
  disabled = false,
  children,
}: ModalButtonProps) {
  const baseClasses =
    "modal-button px-4 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed min-w-[60px]";

  const variantClasses = {
    primary: "modal-button--primary",
    secondary: "modal-button--secondary",
    danger: "modal-button--danger",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}
