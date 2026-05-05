"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

export function AxisRing({ radius = 3.4, tube = 0.04, color = "#c8551b" }: { radius?: number; tube?: number; color?: string }) {
  const ref = useRef<Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.x = s.clock.elapsedTime * 0.15;
    ref.current.rotation.y = s.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, tube, 24, 200]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[radius * 0.92, tube * 0.7, 20, 180]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.18} metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[radius * 1.08, tube * 0.4, 16, 180]} />
        <meshStandardMaterial color={color} transparent opacity={0.25} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}
