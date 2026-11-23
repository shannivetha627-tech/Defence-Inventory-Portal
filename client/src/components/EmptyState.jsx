import React from "react";
import { PackageIcon } from "./Icons";

export const EmptyState = ({
  icon,
  title = "No records found",
  description = "Try adjusting your search criteria or filters.",
  actionText,
  onAction,
  className = ""
}) => {
  return (
    <div className={`empty-state-card ${className}`}>
      <div className="empty-state-icon-wrap">
        {icon || <PackageIcon size={32} />}
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          className="btn-secondary btn-sm"
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
