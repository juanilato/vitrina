import React from 'react';
import './MetricCard.css';

interface MetricCardProps {
  icon: string;
  number: string | number;
  label: string;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  number,
  label,
  trend,
  className = ''
}) => {
  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <span className="metric-number">{number}</span>
        <span className="metric-label">{label}</span>
      </div>
      {trend && (
        <div className={`metric-trend ${trend.type}`}>
          {trend.value}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
