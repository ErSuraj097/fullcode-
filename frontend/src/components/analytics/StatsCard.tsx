import React from 'react';
import Card from '../common/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend = 'stable',
  subtitle,
  className = ''
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '➡️';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className={`p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <div className="flex items-center space-x-1">
              <span className={`text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
              </span>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-2xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};