"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh } from "three";

export function CameraModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<Group>(null);
  const lensFront = useRef<Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.08;
    }
    if (lensFront.current) {
      const m = lensFront.current.material as { emissiveIntensity?: number };
      if (m.emissiveIntensity !== undefined) {
        m.emissiveIntensity = 0.35 + Math.sin(state.clock.elapsedTime * 1.4) * 0.18;
      }
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Camera body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.6, 1.6, 1.1]} />
        <meshStandardMaterial color="#16161a" metalness={0.55} roughness={0.4} />
      </mesh>
      {/* Top deck */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[2.4, 0.3, 0.95]} />
        <meshStandardMaterial color="#0d0d10" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Hot shoe */}
      <mesh position={[0, 1.18, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.3]} />
        <meshStandardMaterial color="#1c1c20" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Pentaprism */}
      <mesh position={[0, 1.05, 0]}>
        <coneGeometry args={[0.55, 0.6, 4]} />
        <meshStandardMaterial color="#101013" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Grip */}
      <mesh position={[1.05, 0, 0.05]}>
        <boxGeometry args={[0.6, 1.6, 1.2]} />
        <meshStandardMaterial color="#0a0a0c" metalness={0.4} roughness={0.7} />
      </mesh>
      {/* Shutter button */}
      <mesh position={[1.15, 0.92, 0.4]}>
        <cylinderGeometry args={[0.08, 0.1, 0.1, 24]} />
        <meshStandardMaterial color="#c8551b" emissive="#7a3010" emissiveIntensity={0.4} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Mode dial */}
      <mesh position={[-0.85, 0.92, 0.1]}>
        <cylinderGeometry args={[0.32, 0.34, 0.14, 32]} />
        <meshStandardMaterial color="#1a1a20" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Lens mount ring */}
      <mesh position={[0, 0, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.18, 48]} />
        <meshStandardMaterial color="#252529" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Lens barrel */}
      <mesh position={[0, 0, 1.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.78, 0.92, 1.4, 48]} />
        <meshStandardMaterial color="#0e0e11" metalness={0.6} roughness={0.45} />
      </mesh>
      {/* Lens grip rings */}
      <mesh position={[0, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.86, 0.05, 12, 48]} />
        <meshStandardMaterial color="#1d1d22" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 1.55]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.84, 0.05, 12, 48]} />
        <meshStandardMaterial color="#1d1d22" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Lens hood */}
      <mesh position={[0, 0, 2.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.05, 0.92, 0.4, 48]} />
        <meshStandardMaterial color="#08080a" metalness={0.4} roughness={0.7} />
      </mesh>
      {/* Front element */}
      <mesh ref={lensFront} position={[0, 0, 2.05]}>
        <circleGeometry args={[0.7, 48]} />
        <meshStandardMaterial color="#0a1a2a" emissive="#1a4a8a" emissiveIntensity={0.45} metalness={0.4} roughness={0.05} />
      </mesh>
      {/* LCD on back */}
      <mesh position={[-0.4, -0.05, -0.56]}>
        <planeGeometry args={[1.5, 1.0]} />
        <meshStandardMaterial color="#181a26" emissive="#1d5b8c" emissiveIntensity={0.3} metalness={0.2} roughness={0.4} />
      </mesh>
      {/* Brand strip */}
      <mesh position={[0, 0.35, 0.56]}>
        <planeGeometry args={[1.4, 0.18]} />
        <meshStandardMaterial color="#15151a" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}
