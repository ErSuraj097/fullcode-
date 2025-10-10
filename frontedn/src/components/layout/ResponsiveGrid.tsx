import React, { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: {
    x?: number;
    y?: number;
  };
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  gap = {
    x: 4,
    y: 4,
  },
}) => {
  const getColumnsClass = () => {
    const classes = [];
    
    if (columns.sm) {
      classes.push(`grid-cols-${columns.sm}`);
    }
    
    if (columns.md) {
      classes.push(`md:grid-cols-${columns.md}`);
    }
    
    if (columns.lg) {
      classes.push(`lg:grid-cols-${columns.lg}`);
    }
    
    if (columns.xl) {
      classes.push(`xl:grid-cols-${columns.xl}`);
    }
    
    return classes.join(' ');
  };

  const getGapClass = () => {
    const classes = [];
    
    if (gap.x) {
      classes.push(`gap-x-${gap.x}`);
    }
    
    if (gap.y) {
      classes.push(`gap-y-${gap.y}`);
    }
    
    return classes.join(' ');
  };

  return (
    <div className={`grid ${getColumnsClass()} ${getGapClass()} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;