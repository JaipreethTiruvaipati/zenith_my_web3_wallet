import { useState, useEffect } from 'react';
import { CosmicButton } from '../ui/CosmicButton';
import { toast } from 'sonner';

interface VerifyPhaseProps {
  seedPhrase: string[];
  onComplete: () => void;
  onBack: () => void;
}

export const VerifyPhaseUI = ({ seedPhrase, onComplete, onBack }: VerifyPhaseProps) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Shuffle the seed phrase words
    const shuffled = [...seedPhrase].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, [seedPhrase]);

  const handleWordClick = (word: string, index: number) => {
    if (selectedWords.length < seedPhrase.length) {
      const newSelected = [...selectedWords, word];
      setSelectedWords(newSelected);
      // Remove word from shuffled array
      const newShuffled = shuffledWords.filter((_, i) => i !== index);
      setShuffledWords(newShuffled);
      // Check if completed correctly
      if (newSelected.length === seedPhrase.length) {
        const isCorrect = newSelected.every((word, idx) => word === seedPhrase[idx]);
        setIsComplete(isCorrect);
        if (isCorrect) {
          toast.success('Keystone reconstructed successfully!', {
            duration: 3000,
          });
        } else {
          toast.error('Incorrect sequence. Please try again.', {
            duration: 3000,
          });
          // Reset after delay
          setTimeout(() => {
            setSelectedWords([]);
            setShuffledWords([...seedPhrase].sort(() => Math.random() - 0.5));
          }, 1500);
        }
      }
    }
  };

  const handleReset = () => {
    setSelectedWords([]);
    setShuffledWords([...seedPhrase].sort(() => Math.random() - 0.5));
    setIsComplete(false);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-card/20 backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-nebula-drift" />
        <div className="relative z-10 p-12 max-w-2xl w-full space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-stellar animate-pulse-glow">
              Verify Your Keystone Phrase
            </h2>
            <p className="text-muted-foreground">
              Select the words in the correct order to verify your backup.
            </p>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-8">
              {shuffledWords.map((word, index) => (
                <CosmicButton
                  key={`${word}-${index}`}
                  variant="accent"
                  className="h-12 animate-float"
                  onClick={() => handleWordClick(word, index)}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animationDuration: '3s'
                  }}
                >
                  {word}
                </CosmicButton>
              ))}
            </div>
          </div>
          {isComplete && (
            <div className="text-center space-y-4">
              <div className="bg-accent/20 border border-accent/50 rounded-lg p-6 animate-pulse-glow">
                <h3 className="text-xl font-bold text-accent mb-2">
                  ✨ Keystone Reconstructed!
                </h3>
                <p className="text-muted-foreground">
                  Your Zenith Wallet is now forged and secure.
                </p>
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
            {selectedWords.length > 0 && !isComplete && (
              <CosmicButton
                variant="danger"
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </CosmicButton>
            )}
            {isComplete && (
              <CosmicButton
                variant="stellar"
                onClick={onComplete}
                className="flex-1"
                glow={true}
              >
                Finalize Setup
              </CosmicButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};