import { useState } from 'react';
import { CosmicScene } from './CosmicScene';
import { WelcomePhase, WelcomePhaseUI } from './phases/WelcomePhase';
import { SecurePhaseUI } from './phases/SecurePhase';
import { RecoveryPhaseUI } from './phases/RecoveryPhase';
import { VerifyPhaseUI } from './phases/VerifyPhase';
import { DashboardPhase, DashboardPhaseUI } from './phases/DashboardPhase';
import { CosmicInput } from './ui/CosmicInput';
import { CosmicButton } from './ui/CosmicButton';
import { toast } from 'sonner';
import * as walletApi from '../api/wallet';

type WalletPhase = 
  | 'welcome'
  | 'secure' 
  | 'recovery'
  | 'verify'
  | 'dashboard'
  | 'locked';

interface Account {
  id: string;
  type: 'solana' | 'ethereum';
  name: string;
  address: string;
  balance: string;
}

const SUPPORTED_CHAINS = [
  { type: 'solana', label: 'Solana', color: '#9945FF' },
  { type: 'ethereum', label: 'Ethereum', color: '#627EEA' },
  { type: 'bitcoin', label: 'Bitcoin', color: '#F7931A' },
  // Add more chains here
];

// Add a simple modal component
const SimpleModal = ({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-card rounded-xl p-8 shadow-xl" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export const ZenithWallet = () => {
  const [currentPhase, setCurrentPhase] = useState<WalletPhase>('welcome');
  const [walletPassword, setWalletPassword] = useState('');
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [encryptedWallet, setEncryptedWallet] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [ethereumAddress, setEthereumAddress] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingChain, setAddingChain] = useState<string | null>(null);

  // Generate real mnemonic from backend
  const generateSeedPhrase = async () => {
    try {
      const { mnemonic, error } = await walletApi.generateMnemonic();
      if (error || !mnemonic) throw new Error(error || 'No mnemonic returned');
      setSeedPhrase(mnemonic.split(' '));
      return mnemonic;
    } catch (e: any) {
      console.error('Mnemonic generation error:', e);
      toast.error('Failed to generate mnemonic: ' + e.message);
      return null;
    }
  };

  const handleCreateWallet = async () => {
    setCurrentPhase('secure');
    toast.success('Beginning wallet forge sequence...');
  };

  const handleAccessWallet = () => {
    setCurrentPhase('locked');
    toast.info('Enter your password to access your existing wallet');
  };

  // Secure phase: set password, generate mnemonic, encrypt wallet
  const handleSecureComplete = async (password: string) => {
    setWalletPassword(password);
    const mnemonic = await generateSeedPhrase();
    if (!mnemonic) {
      toast.error('Mnemonic generation failed');
      return;
    }
    setSeedPhrase(mnemonic.split(' '));
    try {
      const { encrypted, error } = await walletApi.encryptWallet(mnemonic, password);
      if (error || !encrypted) {
        console.error('Encryption error:', error);
        toast.error('Encryption failed: ' + (error || 'No encrypted value'));
        return;
      }
      setEncryptedWallet(encrypted);
      setCurrentPhase('recovery');
      toast.success('Wallet security configured!');
    } catch (e: any) {
      console.error('Encryption exception:', e);
      toast.error('Encryption failed: ' + e.message);
    }
  };

  const handleRecoveryComplete = () => {
    setCurrentPhase('verify');
    toast.info('Now verify your backup by reconstructing the keystone');
  };

  const handleVerifyComplete = async () => {
    const mnemonic = seedPhrase.join(' ');
    try {
      const sol = await walletApi.deriveSolanaAddress(mnemonic, 0);
      const eth = await walletApi.deriveEthereumAddress(mnemonic, 0);
      if (sol.error || !sol.address) {
        console.error('Solana address error:', sol.error);
        toast.error('Failed to derive Solana address: ' + (sol.error || 'No address'));
        return;
      }
      if (eth.error || !eth.address) {
        console.error('Ethereum address error:', eth.error);
        toast.error('Failed to derive Ethereum address: ' + (eth.error || 'No address'));
        return;
      }
      setSolanaAddress(sol.address);
      setEthereumAddress(eth.address);
      setCurrentPhase('dashboard');
      toast.success('🎉 Zenith Wallet forged successfully! Welcome to the cosmos.');
    } catch (e: any) {
      console.error('Address derivation exception:', e);
      toast.error('Address derivation failed: ' + e.message);
    }
  };

  const handleLock = () => {
    setCurrentPhase('locked');
    setUnlockPassword('');
    toast.info('Wallet locked securely');
  };

  // Unlock: decrypt wallet and restore mnemonic
  const handleUnlock = async () => {
    if (!encryptedWallet) {
      toast.error('No encrypted wallet found');
      return;
    }
    try {
      const { mnemonic, error } = await walletApi.decryptWallet(encryptedWallet, unlockPassword);
      if (error || !mnemonic) {
        console.error('Decryption error:', error);
        toast.error('Incorrect password or corrupted wallet');
        return;
      }
      setSeedPhrase(mnemonic.split(' '));
      const sol = await walletApi.deriveSolanaAddress(mnemonic, 0);
      const eth = await walletApi.deriveEthereumAddress(mnemonic, 0);
      if (sol.error || !sol.address) {
        console.error('Solana address error:', sol.error);
        toast.error('Failed to derive Solana address: ' + (sol.error || 'No address'));
        return;
      }
      if (eth.error || !eth.address) {
        console.error('Ethereum address error:', eth.error);
        toast.error('Failed to derive Ethereum address: ' + (eth.error || 'No address'));
        return;
      }
      setSolanaAddress(sol.address);
      setEthereumAddress(eth.address);
      setCurrentPhase('dashboard');
      setUnlockPassword('');
      toast.success('Welcome back to the Zenith Cosmos!');
    } catch (e: any) {
      console.error('Decryption exception:', e);
      toast.error('Decryption failed: ' + e.message);
    }
  };

  const handleAddAccount = () => {
    setShowAddModal(true);
  };

  const handleSelectChain = async (chainType: string) => {
    setAddingChain(chainType);
    setShowAddModal(false);
    // Find next index for this chain
    const chainAccounts = accounts.filter(a => a.type === chainType);
    const nextIndex = chainAccounts.length;
    let address = '';
    if (chainType === 'solana') {
      const mnemonic = seedPhrase.join(' ');
      const res = await walletApi.deriveSolanaAddress(mnemonic, nextIndex);
      address = res.address;
    } else if (chainType === 'ethereum') {
      const mnemonic = seedPhrase.join(' ');
      const res = await walletApi.deriveEthereumAddress(mnemonic, nextIndex);
      address = res.address;
    } else if (chainType === 'bitcoin') {
      // You need to implement this endpoint in your backend
      const mnemonic = seedPhrase.join(' ');
      const res = await walletApi.deriveBitcoinAddress(mnemonic, nextIndex);
      address = res.address;
    }
    setAccounts(prev => ([
      ...prev,
      {
        id: `${chainType}-${nextIndex}`,
        type: chainType,
        name: `Account ${nextIndex + 1}`,
        address,
        balance: '', // You can fetch real balance if you want
      }
    ]));
  };

  const handleSelectAccount = (account: Account) => {
    toast.info(`Accessing ${account.name}`, {
      description: `${account.type.toUpperCase()} • ${account.balance}`
    });
  };

  const render3DPhase = (accounts: Account[]) => {
    switch (currentPhase) {
      case 'welcome':
        return (
          <WelcomePhase
            onCreateWallet={handleCreateWallet}
            onAccessWallet={handleAccessWallet}
          />
        );
      
      case 'dashboard':
        return (
          <DashboardPhase
            onLock={handleLock}
            onAddAccount={handleAddAccount}
            onSelectAccount={handleSelectAccount}
            accounts={accounts}
          />
        );
      
      
      default:
        return null;
    }
  };

  const renderUIPhase = (accounts: Account[]) => {
    switch (currentPhase) {
      case 'welcome':
        return (
          <WelcomePhaseUI
            onCreateWallet={handleCreateWallet}
            onAccessWallet={handleAccessWallet}
          />
        );
      
      case 'secure':
        return (
          <SecurePhaseUI
            onComplete={handleSecureComplete}
            onBack={() => setCurrentPhase('welcome')}
          />
        );
      
      case 'recovery':
        return (
          <RecoveryPhaseUI
            seedPhrase={seedPhrase}
            onComplete={handleRecoveryComplete}
            onBack={() => setCurrentPhase('secure')}
          />
        );
      
      case 'verify':
        return (
          <VerifyPhaseUI
            seedPhrase={seedPhrase}
            onComplete={handleVerifyComplete}
            onBack={() => setCurrentPhase('recovery')}
          />
        );
      
      case 'dashboard':
        return (
          <DashboardPhaseUI
            onLock={handleLock}
            onAddAccount={handleAddAccount}
            onSelectAccount={handleSelectAccount}
            accounts={accounts}
          />
        );
      
      case 'locked':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-card/20 backdrop-blur-xl border border-border rounded-2xl shadow-2xl" />
              
              <div className="relative z-10 p-12 max-w-md w-full space-y-8">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/30 to-accent/30 rounded-full border border-primary/50 animate-pulse-glow flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full animate-float" />
                  </div>
                  
                  <h2 className="text-4xl font-bold text-stellar">
                    Zenith Locked
                  </h2>
                  <p className="text-muted-foreground">
                    Enter your password to unlock the cosmic realm
                  </p>
                </div>

                <div className="space-y-6">
                  <CosmicInput
                    type="password"
                    label="Password"
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    placeholder="Enter your password"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUnlock();
                      }
                    }}
                  />

                  <CosmicButton
                    variant="stellar"
                    onClick={handleUnlock}
                    className="w-full"
                    disabled={!unlockPassword}
                    glow={!!unlockPassword}
                  >
                    Unlock Zenith
                  </CosmicButton>
                  
                  <CosmicButton
                    variant="nebula"
                    onClick={() => setCurrentPhase('welcome')}
                    className="w-full"
                  >
                    Back to Welcome
                  </CosmicButton>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  console.log('ZenithWallet render - currentPhase:', currentPhase);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `url('/milky-way-galaxy.jpg') center/cover fixed`,
        backgroundColor: 'hsl(var(--background))'
      }}
    >
      <CosmicScene enableControls={currentPhase === 'dashboard'}>
        {render3DPhase(accounts)}
      </CosmicScene>
      {renderUIPhase(accounts)}
      <SimpleModal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <h2 className="text-xl font-bold mb-4">Select Blockchain</h2>
        <div className="flex flex-col gap-4">
          {SUPPORTED_CHAINS.map(chain => (
            <CosmicButton
              key={chain.type}
              style={{ backgroundColor: chain.color, color: '#fff' }}
              onClick={() => handleSelectChain(chain.type)}
            >
              {chain.label}
            </CosmicButton>
          ))}
        </div>
      </SimpleModal>
    </div>
  );
};