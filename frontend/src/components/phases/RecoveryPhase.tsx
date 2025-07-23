import { useState } from 'react';
import { CosmicButton } from '../ui/CosmicButton';
import { Checkbox } from '../ui/checkbox';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface RecoveryPhaseProps {
  seedPhrase: string[];
  onComplete: () => void;
  onBack: () => void;
}

export const RecoveryPhaseUI = ({ seedPhrase, onComplete, onBack }: RecoveryPhaseProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSecured, setIsSecured] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
    toast.success('Keystone Phrase revealed! Keep it safe.', {
      duration: 4000,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase.join(' '));
    toast.success('Keystone Phrase copied to clipboard');
  };

  const canProceed = isRevealed && isSecured;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        {/* Crystalline Artifact Background */}
        <div className="absolute inset-0 bg-card/10 backdrop-blur-2xl border border-primary/30 rounded-3xl shadow-[var(--stellar-glow)] animate-pulse-glow" />
        
        <div className="relative z-10 p-12 max-w-2xl w-full space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-stellar animate-pulse-glow">
              Secret Recovery Phrase
            </h2>
            <p className="text-muted-foreground">
              Write down these 12 words in order and keep them safe. This is the only way to recover your wallet.
            </p>
          </div>

          {/* Crystal Artifact */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg border border-primary/50 animate-float shadow-[var(--stellar-glow)]" />
              {!isRevealed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <EyeOff className="w-12 h-12 text-muted-foreground animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {!isRevealed ? (
            <div className="text-center space-y-6">
              <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-6">
                <p className="text-destructive font-semibold text-lg mb-2">⚠️ CRITICAL WARNING</p>
                <p className="text-sm">
                  This is the master key to your Zenith. Anyone with this phrase can access your wallet.
                  Store it offline and never share it.
                </p>
              </div>
              
              <CosmicButton
                variant="stellar"
                size="lg"
                onClick={handleReveal}
                className="animate-pulse-glow"
              >
                <Eye className="w-5 h-5 mr-2" />
                Reveal the Keystone Phrase
              </CosmicButton>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Seed Phrase Display */}
              <div className="bg-muted/20 border border-border rounded-lg p-6">
                <div className="grid grid-cols-3 gap-8">
                  {seedPhrase.map((word, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 bg-card/30 rounded-lg border border-primary/20"
                    >
                      <span className="text-muted-foreground text-sm font-mono">
                        {index + 1}.
                      </span>
                      <span className="font-mono text-stellar font-semibold">
                        {word}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <CosmicButton
                  variant="accent"
                  onClick={handleCopy}
                  className="flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy to Clipboard</span>
                </CosmicButton>
              </div>

              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="secured"
                    checked={isSecured}
                    onCheckedChange={(checked) => setIsSecured(checked === true)}
                    className="border-destructive"
                  />
                  <label
                    htmlFor="secured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have secured my Keystone Phrase offline
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <CosmicButton
              variant="nebula"
              onClick={onBack}
              className="flex-1"
            >
              Back
            </CosmicButton>
            
            {isRevealed && (
              <CosmicButton
                variant={canProceed ? "stellar" : "nebula"}
                onClick={onComplete}
                disabled={!canProceed}
                className="flex-1"
                glow={canProceed}
              >
                Verify Backup
              </CosmicButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};