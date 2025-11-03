import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-12 h-12',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'w-16 h-16',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeClasses[size].container,
      className
    )}>
      {Icon && (
        <div className="mb-4">
          <div className="w-20 h-20 bg-gradient-light dark:bg-gradient-dark rounded-full flex items-center justify-center">
            <Icon className={cn('text-gray-400 dark:text-gray-600', sizeClasses[size].icon)} />
          </div>
        </div>
      )}
      
      <h3 className={cn(
        'font-semibold text-black dark:text-white mb-2',
        sizeClasses[size].title
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          'text-gray-600 dark:text-gray-400 mb-6 max-w-md',
          sizeClasses[size].description
        )}>
          {description}
        </p>
      )}
      
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;