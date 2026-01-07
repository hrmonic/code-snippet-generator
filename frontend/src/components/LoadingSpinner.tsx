interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const innerSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className={`animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 ${sizeClasses[size]}`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${innerSizeClasses[size]} bg-primary-600 rounded-full animate-pulse`}></div>
        </div>
      </div>
      {text && <span className="mt-4 text-gray-600 text-sm">{text}</span>}
    </div>
  );
}
