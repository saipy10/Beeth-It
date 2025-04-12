"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointMaterial } from "@react-three/drei";

export default function SpaceBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 65 }}> {/* Slightly wider field of view */}
        <color attach="background" args={["#0a0015"]} /> {/* Deep cosmic purple */}
        <ambientLight intensity={0.1} />
        <directionalLight position={[10, 10, 5]} intensity={0.3} color="#ffffff" />
        <SpaceScene />
      </Canvas>
    </div>
  );
}

function SpaceScene() {
  const { mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  // Slowed down mouse movement response
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.x * 0.05,
        0.01
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouse.y * 0.025,
        0.01
      );
    }
  });

  return (
    <group ref={groupRef}>
      <EnhancedStars />
      <MovingStars />
      <DynamicPlanets />
      <ShootingStars />
    </group>
  );
}

// Dynamic planets with orbiting motion - now with increased and responsive spacing
function DynamicPlanets() {
  const planetsRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  
  // Calculate scale factor based on viewport size
  const scaleFactor = useMemo(() => Math.min(viewport.width, viewport.height) / 10, [viewport]);
  
  // Define multiple planets with well-spaced, responsive positions
  const planetConfigs = useMemo(() => [
    { 
      // Far right area
      basePosition: [35 * scaleFactor, -8 * scaleFactor, -45] as [number, number, number], 
      scale: 2.5, 
      color: "#ff6b6b", 
      orbitSpeed: 0.03, 
      orbitRadius: 5 * scaleFactor,
      hasRings: true,
      ringColor: "#ff9999"
    },
    { 
      // Top left area
      basePosition: [-40 * scaleFactor, 25 * scaleFactor, -60] as [number, number, number], 
      scale: 4, 
      color: "#8a2be2", 
      orbitSpeed: 0.02, 
      orbitRadius: 7 * scaleFactor,
      hasRings: true,
      ringColor: "#b980ff"
    },
    { 
      // Bottom right area
      basePosition: [30 * scaleFactor, -20 * scaleFactor, -50] as [number, number, number], 
      scale: 1.8, 
      color: "#3498db", 
      orbitSpeed: 0.04, 
      orbitRadius: 6 * scaleFactor,
      hasRings: false
    },
    { 
      // Bottom left area
      basePosition: [-35 * scaleFactor, -22 * scaleFactor, -65] as [number, number, number], 
      scale: 3.2, 
      color: "#2ecc71", 
      orbitSpeed: 0.015, 
      orbitRadius: 8 * scaleFactor,
      hasRings: true,
      ringColor: "#7dcea0"
    },
    { 
      // Center top area
      basePosition: [5 * scaleFactor, 30 * scaleFactor, -45] as [number, number, number], 
      scale: 1.5, 
      color: "#f39c12", 
      orbitSpeed: 0.025, 
      orbitRadius: 4 * scaleFactor,
      hasRings: false
    },
    { 
      // Center of upper half
      basePosition: [0, 15 * scaleFactor, -50] as [number, number, number], 
      scale: 3, 
      color: "#800020", 
      orbitSpeed: 0.015, 
      orbitRadius: 2 * scaleFactor,
      hasRings: true,
      ringColor: "#E97451"
    },
    
  ], [scaleFactor]);

  useFrame(({ clock }) => {
    if (planetsRef.current) {
      // Slow, gentle movement for all planets
      const time = clock.getElapsedTime() * 0.2; // Slowed down global time factor
      
      planetConfigs.forEach((config, i) => {
        if (planetsRef.current && planetsRef.current.children[i]) {
          const planet = planetsRef.current.children[i];
          // Calculate orbit position with more elongated elliptical paths
          const angle = time * config.orbitSpeed;
          const x = config.basePosition[0] + Math.sin(angle) * config.orbitRadius;
          const y = config.basePosition[1] + Math.cos(angle) * config.orbitRadius * 0.5; // Elliptical orbit
          const z = config.basePosition[2];
          
          // Apply position
          planet.position.set(x, y, z);
        }
      });
    }
  });

  return (
    <group ref={planetsRef}>
      {planetConfigs.map((config, i) => (
        <Planet 
          key={i}
          position={config.basePosition}
          scale={config.scale}
          rotation={[0.1, 0.2, 0]}
          color={config.color}
          hasRings={config.hasRings}
          ringColor={config.ringColor}
        />
      ))}
    </group>
  );
}

// Enhanced stars with color and slowed down twinkle
function EnhancedStars() {
  const count = 8000;
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Expanded star field radius
      positions[i3] = (Math.random() - 0.5) * 180;
      positions[i3 + 1] = (Math.random() - 0.5) * 180;
      positions[i3 + 2] = (Math.random() - 0.5) * 180;
      
      // More diverse, softer colors
      const colorType = Math.floor(Math.random() * 5);
      if (colorType === 0) {
        // Blue-white stars
        colors[i3] = Math.random() * 0.5 + 0.5;
        colors[i3 + 1] = Math.random() * 0.5 + 0.5;
        colors[i3 + 2] = Math.random() * 0.2 + 0.8;
      } else if (colorType === 1) {
        // Red stars
        colors[i3] = Math.random() * 0.2 + 0.8;
        colors[i3 + 1] = Math.random() * 0.3 + 0.3;
        colors[i3 + 2] = Math.random() * 0.3 + 0.3;
      } else if (colorType === 2) {
        // Yellow stars
        colors[i3] = Math.random() * 0.2 + 0.8;
        colors[i3 + 1] = Math.random() * 0.2 + 0.8;
        colors[i3 + 2] = Math.random() * 0.3 + 0.4;
      } else {
        // White stars
        const brightness = Math.random() * 0.3 + 0.7;
        colors[i3] = brightness;
        colors[i3 + 1] = brightness;
        colors[i3 + 2] = brightness;
      }
    }
    return { positions, colors };
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // Slowed down rotation
      pointsRef.current.rotation.y += 0.0003;
      
      // Slowed down twinkling
      const sizes = pointsRef.current.geometry.attributes.size as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        // Use different frequencies for different stars to create a more natural effect
        const frequency = 0.8 + (i % 5) * 0.1; // Varies between 0.8 and 1.2
        sizes.array[i] = 0.5 + Math.sin(clock.getElapsedTime() * frequency + i * 0.2) * 0.2;
      }
      sizes.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[positions.colors, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[new Float32Array(count).fill(0.5), 1]}
          count={count}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        vertexColors
        size={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Moving stars with much slower subtle motion
function MovingStars() {
  const count = 300;
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Expanded to fill more screen space
      positions[i3] = (Math.random() - 0.5) * 75;
      positions[i3 + 1] = (Math.random() - 0.5) * 75;
      positions[i3 + 2] = (Math.random() - 0.5) * 75;
    }
    return positions;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // Slowed down rotation
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.005;
      
      // Gentler pulsing
      const sizes = pointsRef.current.geometry.attributes.size as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        // Slowed down and reduced amplitude
        sizes.array[i] = 1 + Math.sin(clock.getElapsedTime() * 1.2 + i * 0.3) * 0.3;
      }
      sizes.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[new Float32Array(count).fill(1), 1]}
          count={count}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Shooting stars with trails - slowed down and less frequent
function ShootingStars() {
  const count = 8;
  const ref = useRef<THREE.Group>(null);

  type ShootingStar = {
    position: [number, number, number];
    velocity: [number, number, number];
    size: number;
    timeOffset: number;
    duration: number;
  };

  const shootingStars: ShootingStar[] = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      // Expanded area for shooting star appearance
      position: [(Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, -60],
      velocity: [
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2, 
        0.2
      ],
      size: Math.random() * 0.3 + 0.2,
      timeOffset: Math.random() * 35,
      duration: Math.random() * 3 + 7
    }));
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      ref.current.children.forEach((star, i) => {
        const data = shootingStars[i];
        // Modulo by a longer duration for each star
        const t = (time + data.timeOffset) % (data.duration + 20);

        if (t < 0.1) {
          // Reset position when cycle restarts
          star.position.set(
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 150,
            -60
          );
          star.scale.set(1, 1, 1);
        } else if (t < data.duration) {
          // Move more slowly during active period
          star.position.x += data.velocity[0] * 0.5;
          star.position.y += data.velocity[1] * 0.5;
          star.position.z += data.velocity[2] * 0.5;
          
          // More gradual fadeout
          const progress = t / data.duration;
          const scale = progress > 0.7 
            ? THREE.MathUtils.lerp(1, 0, (progress - 0.7) / 0.3) 
            : 1;
          star.scale.set(scale, scale, scale);
        } else {
          // Keep invisible during wait period
          star.scale.set(0, 0, 0);
        }
      });
    }
  });

  return (
    <group ref={ref}>
      {shootingStars.map((data, i) => (
        <mesh key={i} position={data.position}>
          <sphereGeometry args={[data.size, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
          <Trail position={data.position} velocity={data.velocity} />
        </mesh>
      ))}
    </group>
  );
}

// Trail effect for shooting stars
function Trail({
  position,
  velocity,
}: {
  position: [number, number, number];
  velocity: [number, number, number];
}) {
  const trailRef = useRef<THREE.Object3D>(null);
  
  // Longer, more visible trails
  const points = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 15; i++) {
      points.push(
        new THREE.Vector3(
          position[0] - velocity[0] * i * 0.15,
          position[1] - velocity[1] * i * 0.15,
          position[2] - velocity[2] * i * 0.15
        )
      );
    }
    return points;
  }, [position, velocity]);

  useFrame(() => {
    if (trailRef.current) {
      const lineObject = trailRef.current as unknown as THREE.Line;
      const positions = lineObject.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 15; i++) {
        const i3 = i * 3;
        positions[i3] = position[0] - velocity[0] * i * 0.15;
        positions[i3 + 1] = position[1] - velocity[1] * i * 0.15;
        positions[i3 + 2] = position[2] - velocity[2] * i * 0.15;
      }
      lineObject.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <primitive object={new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      })
    )} ref={trailRef} />
  );
}

// Enhanced planet with texture, glow and atmosphere
function Planet({
  position,
  scale = 1,
  rotation = [0, 0, 0],
  color = "#3498db",
  hasRings = false,
  ringColor = "#9b59b6"
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  color?: string;
  hasRings?: boolean;
  ringColor?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Slowed down rotation
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.04;
    }
    
    if (atmosphereRef.current) {
      // Gentle atmosphere pulsation
      const scale = 1.1 + Math.sin(clock.getElapsedTime() * 0.2) * 0.015;
      atmosphereRef.current.scale.set(scale, scale, scale);
    }
  });

  // Generate surface details with noise pattern
  const surfaceDetails = useMemo(() => {
    // Simple procedural texture using vertex colors
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const count = geo.attributes.position.count;
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = geo.attributes.position.array[i3];
      const y = geo.attributes.position.array[i3 + 1];
      const z = geo.attributes.position.array[i3 + 2];
      
      // Simple noise function
      const noise = Math.sin(x * 10) * Math.sin(y * 10) * Math.sin(z * 10);
      const brightness = 0.8 + noise * 0.2;
      
      // Convert hex color to RGB and apply brightness
      const r = parseInt(color.slice(1, 3), 16) / 255 * brightness;
      const g = parseInt(color.slice(3, 5), 16) / 255 * brightness;
      const b = parseInt(color.slice(5, 7), 16) / 255 * brightness;
      
      colors[i3] = r;
      colors[i3 + 1] = g;
      colors[i3 + 2] = b;
    }
    
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [color]);

  return (
    <group position={position}>
      {/* Planet Surface */}
      <mesh ref={meshRef} scale={scale} rotation={rotation} geometry={surfaceDetails}>
        <meshStandardMaterial
          vertexColors
          roughness={0.7}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={scale * 1.1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Outer atmospheric haze */}
      <mesh scale={scale * 1.2}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Conditional rings */}
      {hasRings && <PlanetRings scale={scale} color={ringColor} />}
    </group>
  );
}

// Enhanced planet rings with dynamics
function PlanetRings({ scale, color = "#9b59b6" }: { scale: number; color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Very slow rotation
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.02;
    }
    
    if (innerRingRef.current) {
      // Counter-rotate inner ring for interesting effect
      innerRingRef.current.rotation.z = -clock.getElapsedTime() * 0.01;
    }
  });
  
  // Create multiple ring layers
  return (
    <>
      {/* Main ring */}
      <mesh ref={meshRef} rotation={[Math.PI / 2.2, 0, 0]} scale={scale * 1.5}>
        <ringGeometry args={[1.2, 1.8, 128]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Inner ring */}
      <mesh ref={innerRingRef} rotation={[Math.PI / 2.5, 0, 0]} scale={scale * 1.3}>
        <ringGeometry args={[0.8, 1.1, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Dust particles in ring */}
      <RingParticles scale={scale} color={color} />
    </>
  );
}

// Add dust particles to the rings
function RingParticles({ scale, color }: { scale: number; color: string }) {
  const count = 300;
  const particlesRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = (Math.random() * 0.6 + 1.2) * scale;
      const theta = Math.random() * Math.PI * 2;
      pos[i3] = Math.cos(theta) * radius;
      pos[i3 + 1] = (Math.random() * 0.1 - 0.05) * scale; // Small vertical variance
      pos[i3 + 2] = Math.sin(theta) * radius;
    }
    return pos;
  }, [scale]);
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.015;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        color={color}
        size={0.03 * scale}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}