import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CosmicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'stellar' | 'nebula' | 'energy' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const CosmicButton = forwardRef<HTMLButtonElement, CosmicButtonProps>(
  ({ className, variant = 'stellar', size = 'md', glow = true, children, ...props }, ref) => {
    const baseClasses = "relative font-medium transition-all duration-500 rounded-lg border";
    
    const variants = {
      stellar: "btn-stellar",
      nebula: "btn-nebula", 
      energy: "bg-gradient-to-r from-accent to-primary text-accent-foreground border-accent/30 hover:scale-105 hover:shadow-[var(--energy-pulse)]",
      danger: "bg-gradient-to-r from-destructive to-orange-500 text-destructive-foreground border-destructive/30 hover:scale-105 hover:shadow-[var(--danger-glow)]",
      accent: "bg-gradient-to-r from-accent to-primary text-accent-foreground border-accent/30 hover:scale-105 hover:shadow-[var(--energy-pulse)]"
    };
    
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base", 
      lg: "px-8 py-4 text-lg"
    };
    
    const glowClass = glow ? "animate-pulse-glow" : "";

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          glowClass,
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-20 transition-opacity duration-300 bg-white" />
      </button>
    );
  }
);

CosmicButton.displayName = "CosmicButton";

export { CosmicButton };