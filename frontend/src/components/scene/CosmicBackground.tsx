import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh, ShaderMaterial } from 'three';

const galaxyVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const galaxyFragmentShader = `
  uniform float time;
  varying vec2 vUv;
  
  vec3 galaxy(vec2 uv) {
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = uv - center;
    float dist = length(pos);
    float angle = atan(pos.y, pos.x);
    
    // Galaxy spiral pattern
    float spiral = sin(angle * 3.0 + dist * 10.0 - time * 0.5) * 0.5 + 0.5;
    
    // Galactic core
    float core = 1.0 / (1.0 + dist * 8.0);
    
    // Nebula clouds
    float noise = sin(uv.x * 20.0 + time * 0.3) * sin(uv.y * 20.0 + time * 0.2) * 0.5 + 0.5;
    
    // Color mixing
    vec3 coreColor = vec3(0.8, 0.9, 1.0); // Blue-white core
    vec3 spiralColor = vec3(0.6, 0.3, 0.9); // Purple spiral arms
    vec3 nebulaColor = vec3(0.2, 0.8, 0.9); // Cyan nebula
    
    vec3 color = mix(spiralColor, coreColor, core);
    color = mix(color, nebulaColor, noise * 0.3);
    
    return color * (spiral * 0.7 + 0.3) * (1.0 - dist * 0.8);
  }
  
  void main() {
    vec3 color = galaxy(vUv);
    gl_FragColor = vec4(color, 0.6);
  }
`;

export const CosmicBackground = () => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -100]} scale={[200, 200, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={galaxyVertexShader}
        fragmentShader={galaxyFragmentShader}
        uniforms={{
          time: { value: 0 }
        }}
        transparent
      />
    </mesh>
  );
};