import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useRef } from 'react';
import { Group, Mesh } from 'three';
import { CosmicButton } from '../ui/CosmicButton';

interface WelcomePhaseProps {
  onCreateWallet: () => void;
  onAccessWallet: () => void;
}

const ZenithLogo = () => {
  const logoRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (logoRef.current) {
      logoRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      logoRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group ref={logoRef} position={[0, 2, 0]}>
      {/* Constellation of stars forming ZENITH */}
      {[
        [-2, 0, 0], [-1, 0, 0], [0, 0, 0], [1, 0, 0], [2, 0, 0], // Z top
        [-1.5, -0.5, 0], [-1, -1, 0], [-0.5, -1.5, 0], // Z diagonal
        [0, -2, 0], [1, -2, 0], [2, -2, 0] // Z bottom
      ].map((position, index) => (
      <mesh key={index} position={position as [number, number, number]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      <Text
        position={[0, -3, 0]}
        fontSize={1.5}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        ZENITH
      </Text>
      <Text
        position={[0, -4, 0]}
        fontSize={0.5}
        color="#8b5cf6"
        anchorX="center"
        anchorY="middle"
      >
        Cosmic Wallet
      </Text>
    </group>
  );
};

const NebulaButton = ({ 
  position, 
  children, 
  onClick, 
  variant = "stellar" 
}: { 
  position: [number, number, number];
  children: React.ReactNode;
  onClick: () => void;
  variant?: "stellar" | "nebula";
}) => {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={variant === "stellar" ? "#06b6d4" : "#8b5cf6"}
          emissive={variant === "stellar" ? "#06b6d4" : "#8b5cf6"}
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
      <Text
        position={[0, -2, 0]}
        fontSize={0.6}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {children}
      </Text>
    </group>
  );
};

export const WelcomePhase = ({ onCreateWallet, onAccessWallet }: WelcomePhaseProps) => {
  return (
    <>
      <ZenithLogo />
      
      <group position={[0, -2, 0]}>
        <NebulaButton
          position={[-3, 0, 0]}
          onClick={onCreateWallet}
          variant="stellar"
        >
          Forge a New Wallet
        </NebulaButton>
        
        <NebulaButton
          position={[3, 0, 0]}
          onClick={onAccessWallet}
          variant="nebula"
        >
          Access Existing Wallet
        </NebulaButton>
      </group>
    </>
  );
};

export const WelcomePhaseUI = ({ onCreateWallet, onAccessWallet }: WelcomePhaseProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="text-center space-y-8 pointer-events-auto">
        <div className="space-y-4 mt-32">
          <h1 className="text-6xl font-bold text-stellar animate-pulse-glow">
            ZENITH
          </h1>
          <p className="text-xl text-nebula">
            Your Gateway to the Cosmic Blockchain
          </p>
        </div>
        
        <div className="flex gap-8 justify-center mt-16">
          <CosmicButton
            variant="stellar"
            size="lg"
            onClick={onCreateWallet}
            className="animate-pulse-glow"
          >
            Forge a New Wallet
          </CosmicButton>
          
          <CosmicButton
            variant="nebula"
            size="lg" 
            onClick={onAccessWallet}
          >
            Access Existing Wallet
          </CosmicButton>
        </div>
      </div>
    </div>
  );
};