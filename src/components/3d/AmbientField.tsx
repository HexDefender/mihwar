"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { Points } from "three";

function ParticleCloud({ count = 280, spread = 14 }: { count?: number; spread?: number }) {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * spread * 2;
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread * 2;
    }
    return arr;
  }, [count, spread]);

  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.03;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.1) * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#c8551b" sizeAttenuation transparent opacity={0.65} />
    </points>
  );
}

export function AmbientField() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 55 }}
        gl={{ antialias: false, alpha: true }}
        className="!h-full !w-full"
      >
        <Suspense fallback={null}>
          <ParticleCloud />
        </Suspense>
      </Canvas>
    </div>
  );
}
