import { useState } from 'react';
import { CosmicButton } from '../ui/CosmicButton';
import { CosmicInput } from '../ui/CosmicInput';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';

interface SecurePhaseProps {
  onComplete: (password: string) => void;
  onBack: () => void;
}

export const SecurePhaseUI = ({ onComplete, onBack }: SecurePhaseProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isValid = passwordStrength >= 75 && passwordsMatch && termsAccepted;

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return 'bg-destructive';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-accent';
  };

  const handleSubmit = () => {
    if (!isValid) {
      toast.error('Please ensure all requirements are met');
      return;
    }
    onComplete(password);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        {/* Crystalline Panel Background */}
        <div className="absolute inset-0 bg-card/20 backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-nebula-drift" />
        
        <div className="relative z-10 p-12 max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-stellar animate-pulse-glow">
              Secure Your Zenith
            </h2>
            <p className="text-muted-foreground">
              This password encrypts your wallet on this device.
              <span className="block text-destructive font-semibold mt-2">
                We cannot recover it.
              </span>
            </p>
          </div>

          <div className="space-y-6">
            <CosmicInput
              type="password"
              label="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Strength</span>
                  <span className={passwordStrength >= 75 ? 'text-accent' : 'text-orange-500'}>
                    {passwordStrength >= 75 ? 'Strong' : passwordStrength >= 50 ? 'Medium' : 'Weak'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}

            <CosmicInput
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              error={confirmPassword && !passwordsMatch ? "Passwords don't match" : undefined}
            />

            <div className="flex items-center space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="border-border"
              />
              <label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the{' '}
                <button className="text-stellar underline hover:text-accent">
                  Terms of Use
                </button>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <CosmicButton
              variant="nebula"
              onClick={onBack}
              className="flex-1"
            >
              Back
            </CosmicButton>
            
            <CosmicButton
              variant={isValid ? "stellar" : "nebula"}
              onClick={handleSubmit}
              disabled={!isValid}
              className="flex-1"
              glow={isValid}
            >
              Create Wallet
            </CosmicButton>
          </div>
        </div>
      </div>
    </div>
  );
};