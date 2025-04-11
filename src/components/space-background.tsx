"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointMaterial } from "@react-three/drei";

export default function SpaceBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <color attach="background" args={["#0a0015"]} /> {/* Deep cosmic purple */}
        <ambientLight intensity={0.1} />
        <directionalLight position={[10, 10, 5]} intensity={0.4} color="#ffffff" />
        <SpaceScene />
      </Canvas>
    </div>
  );
}

function SpaceScene() {
  const { mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.x * 0.1,
        0.02
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouse.y * 0.05,
        0.02
      );
    }
  });

  return (
    <group ref={groupRef}>
      <EnhancedStars />
      <MovingStars />
      <Planet position={[5, -3, -15]} scale={2.5} rotation={[0.1, 0.2, 0]} color="#ff6b6b" />
      <Planet position={[-7, 4, -20]} scale={4} rotation={[0.5, 0.2, 0]} color="#8a2be2" />
      <ShootingStars />
    </group>
  );
}

// Enhanced stars with color and twinkle
function EnhancedStars() {
  const count = 8000;
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 150;
      positions[i3 + 1] = (Math.random() - 0.5) * 150;
      positions[i3 + 2] = (Math.random() - 0.5) * 150;
      colors[i3] = Math.random() * 0.5 + 0.5; // Red
      colors[i3 + 1] = Math.random() * 0.5 + 0.5; // Green
      colors[i3 + 2] = Math.random() * 0.8 + 0.2; // Blue
    }
    return { positions, colors };
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      const sizes = pointsRef.current.geometry.attributes.size as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        sizes.array[i] = 0.5 + Math.sin(clock.getElapsedTime() * 2 + i) * 0.3;
      }
      sizes.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={positions.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={new Float32Array(count).fill(0.5)}
          itemSize={1}
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

// Moving stars with subtle motion
function MovingStars() {
  const count = 300;
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
      positions[i3 + 2] = (Math.random() - 0.5) * 60;
    }
    return positions;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      const sizes = pointsRef.current.geometry.attributes.size as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        sizes.array[i] = 1 + Math.sin(clock.getElapsedTime() * 3 + i) * 0.5;
      }
      sizes.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={new Float32Array(count).fill(1)}
          itemSize={1}
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

// Shooting stars with trails
function ShootingStars() {
  const count = 15;
  const ref = useRef<THREE.Group>(null);

  // Define the type for shooting star data
  type ShootingStar = {
    position: [number, number, number];
    velocity: [number, number, number];
    size: number;
    timeOffset: number;
  };

  const shootingStars: ShootingStar[] = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, -50],
      velocity: [(Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, 0.5],
      size: Math.random() * 0.3 + 0.2,
      timeOffset: Math.random() * 20,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      ref.current.children.forEach((star, i) => {
        const data = shootingStars[i];
        const t = (time + data.timeOffset) % 10;

        if (t < 0.1) {
          star.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            -50
          );
          star.scale.set(1, 1, 1);
        } else {
          star.position.x += data.velocity[0];
          star.position.y += data.velocity[1];
          star.position.z += data.velocity[2];
          const scale = THREE.MathUtils.lerp(1, 0, t / 2);
          star.scale.set(scale, scale, scale);
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
  const trailRef = useRef<THREE.Line>(null);

  const points = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 10; i++) {
      points.push(
        new THREE.Vector3(
          position[0] - velocity[0] * i * 0.1,
          position[1] - velocity[1] * i * 0.1,
          position[2] - velocity[2] * i * 0.1
        )
      );
    }
    return points;
  }, [position, velocity]);

  useFrame(() => {
    if (trailRef.current) {
      const positions = trailRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 10; i++) {
        const i3 = i * 3;
        positions[i3] = position[0] - velocity[0] * i * 0.1;
        positions[i3 + 1] = position[1] - velocity[1] * i * 0.1;
        positions[i3 + 2] = position[2] - velocity[2] * i * 0.1;
      }
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <line ref={trailRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={10}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </line>
  );
}

// Enhanced planet with texture and glow
function Planet({
  position,
  scale = 1,
  rotation = [0, 0, 0],
  color = "#3498db",
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  color?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={scale} rotation={rotation}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh scale={scale * 1.1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <PlanetRings scale={scale} />
    </group>
  );
}

// Enhanced planet rings
function PlanetRings({ scale }: { scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]} scale={scale * 1.5}>
      <ringGeometry args={[1, 1.5, 128]} />
      <meshBasicMaterial
        color="#9b59b6"
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}