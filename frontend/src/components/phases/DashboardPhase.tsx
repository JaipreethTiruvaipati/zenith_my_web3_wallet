import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useRef, useState } from 'react';
import { Group, Mesh } from 'three';
import { CosmicButton } from '../ui/CosmicButton';
import { Plus, Lock } from 'lucide-react';

interface Account {
  id: string;
  type: string; // allow any chain type
  name: string;
  address: string;
  balance: string;
}

interface DashboardPhaseProps {
  onLock: () => void;
  onAddAccount: () => void;
  onSelectAccount: (account: Account) => void;
  accounts: Account[];
}

const ZenithKeystone = () => {
  const keystoneRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (keystoneRef.current) {
      keystoneRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      keystoneRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={keystoneRef} position={[0, 0, 0]}>
      <mesh>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh scale={[0.8, 0.8, 0.8]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.6}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
};

const AccountPlanet = ({ 
  account, 
  position, 
  onClick 
}: { 
  account: Account;
  position: [number, number, number];
  onClick: () => void;
}) => {
  const planetRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      planetRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
      planetRef.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  const planetColor = account.type === 'solana' ? "#9945FF" : "#627EEA";

  return (
    <group position={position}>
      <mesh ref={planetRef} onClick={onClick}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={planetColor}
          emissive={planetColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {account.name}
      </Text>
      
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.2}
        color="#8b5cf6"
        anchorX="center"
        anchorY="middle"
      >
        {account.address.slice(0, 8)}...{account.address.slice(-4)}
      </Text>
    </group>
  );
};

const AddAccountButton = ({ 
  position, 
  onClick 
}: { 
  position: [number, number, number];
  onClick: () => void;
}) => {
  const buttonRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (buttonRef.current) {
      buttonRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      buttonRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh ref={buttonRef} onClick={onClick}>
        <torusGeometry args={[0.6, 0.2, 16, 100]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      <mesh onClick={onClick}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.3}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
      >
        Add Account
      </Text>
    </group>
  );
};

export const DashboardPhase = ({ onLock, onAddAccount, onSelectAccount, accounts }: DashboardPhaseProps) => {
  return (
    <>
      {/* Central Keystone */}
      <ZenithKeystone />
      {/* Account Planets in Orbit */}
      {accounts.map((account, index) => (
        <AccountPlanet
          key={account.id}
          account={account}
          position={[
            Math.cos((index / accounts.length) * Math.PI * 2) * 4,
            Math.sin((index / accounts.length) * Math.PI * 2) * 0.5,
            Math.sin((index / accounts.length) * Math.PI * 2) * 4
          ]}
          onClick={() => onSelectAccount(account)}
        />
      ))}
      {/* Add Account Button */}
      <AddAccountButton
        position={[0, 3, 0]}
        onClick={onAddAccount}
      />
    </>
  );
};

export const DashboardPhaseUI = ({ onLock, onAddAccount, onSelectAccount, accounts }: DashboardPhaseProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Header */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center pointer-events-auto">
        <div>
          <h1 className="text-3xl font-bold text-stellar">
            Zenith Cosmos
          </h1>
          <p className="text-muted-foreground">
            Your cosmic blockchain realm
          </p>
        </div>
        <CosmicButton
          variant="danger"
          onClick={onLock}
          className="flex items-center space-x-2"
        >
          <Lock className="w-4 h-4" />
          <span>Lock</span>
        </CosmicButton>
      </div>
      {/* Account Info Panel */}
      <div className="absolute bottom-8 left-8 right-8 pointer-events-auto">
        <div className="bg-card/20 backdrop-blur-xl border border-border rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stellar">
              Active Accounts
            </h2>
            <CosmicButton
              variant="stellar"
              onClick={onAddAccount}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </CosmicButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-muted/20 rounded-lg p-4 border border-border cursor-pointer hover:border-primary/50 transition-all duration-300"
                onClick={() => onSelectAccount(account)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-stellar">
                      {account.type === 'solana' ? '◉' : account.type === 'ethereum' ? '◈' : '₿'} {account.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {account.address.slice(0, 12)}...{account.address.slice(-6)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">
                      {account.balance}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {account.type}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};