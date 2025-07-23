import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CosmicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const CosmicInput = forwardRef<HTMLInputElement, CosmicInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-stellar">
            {label}
          </label>
        )}
        <input
          className={cn(
            "input-cosmic",
            error && "border-destructive focus:border-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive animate-pulse-glow">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CosmicInput.displayName = "CosmicInput";

export { CosmicInput };