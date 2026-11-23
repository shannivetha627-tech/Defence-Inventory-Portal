import React, { useEffect } from "react";
import { CheckCircleIcon, AlertTriangleIcon, AlertCircleIcon, XIcon } from "./Icons";

export const Toast = ({ toasts = [], onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className={`toast-card toast-${toast.type || "info"}`}>
      <div className="toast-icon">
        {isSuccess && <CheckCircleIcon size={18} />}
        {isError && <AlertCircleIcon size={18} />}
        {!isSuccess && !isError && <AlertTriangleIcon size={18} />}
      </div>
      <div className="toast-content">
        {toast.title && <h5 className="toast-title">{toast.title}</h5>}
        <p className="toast-message">{toast.message}</p>
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={onDismiss}
        aria-label="Dismiss toast"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
};
