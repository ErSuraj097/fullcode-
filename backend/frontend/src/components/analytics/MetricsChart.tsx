import React from 'react';

interface ChartData {
  name: string;
  value: number;
}

interface MetricsChartProps {
  data: ChartData[];
  type: 'pie' | 'bar' | 'line';
  className?: string;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  data,
  type,
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 text-gray-500 ${className}`}>
        No data available
      </div>
    );
  }

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-gray-500'
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (type === 'pie') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Simple pie chart representation */}
        <div className="flex flex-wrap gap-2 justify-center">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={item.name} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
                <span className="text-sm">
                  {item.name}: {item.value} ({percentage.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Visual representation */}
        <div className="flex h-8 rounded-lg overflow-hidden">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div
                key={item.name}
                className={`${colors[index % colors.length]} flex items-center justify-center text-white text-xs font-medium`}
                style={{ width: `${percentage}%` }}
                title={`${item.name}: ${item.value}`}
              >
                {percentage > 10 ? item.value : ''}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-600">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${colors[index % colors.length]}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Line chart (simplified)
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="h-32 flex items-end space-x-2">
        {data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => d.value));
          const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={item.name} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full ${colors[index % colors.length]} rounded-t`}
                style={{ height: `${height}%` }}
                title={`${item.name}: ${item.value}`}
              ></div>
              <span className="text-xs mt-1 text-center">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};