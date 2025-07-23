import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { Vector3 } from 'three';
import { CosmicBackground } from './scene/CosmicBackground';
import { ParticleField } from './scene/ParticleField';

interface CosmicSceneProps {
  children: React.ReactNode;
  cameraPosition?: Vector3;
  enableControls?: boolean;
}

export const CosmicScene = ({ 
  children, 
  cameraPosition = new Vector3(0, 0, 10),
  enableControls = true 
}: CosmicSceneProps) => {
  const sceneRef = useRef();

  console.log('CosmicScene render - children:', children, 'enableControls:', enableControls);

  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        ref={sceneRef}
        camera={{ 
          position: cameraPosition,
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: 'transparent' }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          {/* Ambient cosmic lighting */}
          <ambientLight intensity={0.3} color="#4f46e5" />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#06b6d4" />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />
          
          {/* Cosmic Background Elements */}
          <CosmicBackground />
          <Stars 
            radius={300} 
            depth={200} 
            count={3000} 
            factor={6} 
            saturation={0.8}
            fade
            speed={0.5}
          />
          <ParticleField />
          
          {/* Main Scene Content */}
          {children}
          
          {/* Camera Controls */}
          {enableControls && (
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              enableRotate={true}
              rotateSpeed={0.1}
              autoRotate={false}
              minDistance={5}
              maxDistance={50}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};