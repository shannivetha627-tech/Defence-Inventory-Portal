import React from "react";

export const DashboardCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  onClick,
  className = ""
}) => {
  return (
    <div
      className={`dashboard-stat-card card-${color} ${onClick ? "clickable" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="card-top">
        <span className="card-title">{title}</span>
        {icon && <div className="card-icon-wrap">{icon}</div>}
      </div>
      <div className="card-value-wrap">
        <h3 className="card-value">{value}</h3>
      </div>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      <div className="card-glow" />
    </div>
  );
};
