import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'default' | 'overlay';
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className,
  variant = 'default',
}) => {
  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-black rounded-xl p-6 flex flex-col items-center space-y-4 shadow-elegant-lg border border-gray-200 dark:border-gray-800">
          <Loader2 className={cn('animate-spin text-black dark:text-white', sizeClasses[size])} />
          {text && (
            <p className={cn('text-gray-700 dark:text-gray-300 font-medium', textSizeClasses[size])}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <Loader2 className={cn('animate-spin text-black dark:text-white', sizeClasses[size])} />
      {text && (
        <p className={cn('text-gray-600 dark:text-gray-400', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
};

// Inline spinner for buttons and small spaces
export const InlineSpinner: React.FC<{ size?: 'xs' | 'sm' | 'md' }> = ({ size = 'sm' }) => (
  <Loader2 className={cn('animate-spin', sizeClasses[size])} />
);

// Page loading component
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

// Section loading component
export const SectionLoader: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Loading...', 
  className 
}) => (
  <div className={cn('flex items-center justify-center py-12', className)}>
    <LoadingSpinner size="md" text={text} />
  </div>
);