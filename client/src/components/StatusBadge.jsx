import React from "react";

export const StatusBadge = ({ status, type = "default", className = "" }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let badgeClass = "badge-neutral";

  // Movements
  if (normalized === "RECEIPT") {
    badgeClass = "badge-receipt";
  } else if (normalized === "ISSUE") {
    badgeClass = "badge-issue";
  } else if (normalized === "RETURN") {
    badgeClass = "badge-return";
  }
  // Requests
  else if (normalized === "DRAFT") {
    badgeClass = "badge-draft";
  } else if (normalized === "SUBMITTED") {
    badgeClass = "badge-submitted";
  } else if (normalized === "APPROVED") {
    badgeClass = "badge-approved";
  } else if (normalized === "REJECTED") {
    badgeClass = "badge-rejected";
  } else if (normalized === "ISSUED") {
    badgeClass = "badge-issued";
  } else if (normalized === "CLOSED") {
    badgeClass = "badge-closed";
  }
  // Stock health
  else if (normalized === "HEALTHY") {
    badgeClass = "badge-healthy";
  } else if (normalized === "LOW STOCK" || normalized === "LOW") {
    badgeClass = "badge-low";
  } else if (normalized === "CRITICAL") {
    badgeClass = "badge-critical";
  }
  // Generic
  else if (normalized === "ACTIVE" || normalized === "OPEN") {
    badgeClass = "badge-active";
  }

  return (
    <span className={`status-badge ${badgeClass} ${className}`}>
      <span className="badge-dot" />
      {normalized}
    </span>
  );
};
