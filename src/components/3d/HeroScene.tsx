"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, ContactShadows } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Group } from "three";
import { CameraModel } from "./CameraModel";
import { AxisRing } from "./AxisRing";
import { useScroll, useTransform, useSpring } from "motion/react";

function StageGroup() {
  const ref = useRef<Group>(null);
  const { scrollYProgress } = useScroll();
  const rotY = useSpring(useTransform(scrollYProgress, [0, 1], [0, Math.PI * 1.6]), { stiffness: 60, damping: 20 });
  const rotX = useSpring(useTransform(scrollYProgress, [0, 1], [0.05, -0.5]), { stiffness: 60, damping: 20 });
  const tilt = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.2, -0.1]), { stiffness: 60, damping: 20 });
  const scaleSpring = useSpring(useTransform(scrollYProgress, [0, 0.6, 1], [1.0, 0.85, 0.7]), { stiffness: 60, damping: 20 });

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y = rotY.get();
    ref.current.rotation.x = rotX.get();
    ref.current.rotation.z = tilt.get();
    const s = scaleSpring.get();
    ref.current.scale.set(s, s, s);
  });

  return (
    <group ref={ref}>
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
        <CameraModel scale={0.9} />
      </Float>
      <AxisRing radius={3.6} tube={0.03} color="#c8551b" />
    </group>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [4.5, 2, 6.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        className="!h-full !w-full"
      >
        <color attach="background" args={["#00000000"]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 4]} intensity={1.4} castShadow />
          <directionalLight position={[-6, 3, -2]} intensity={0.6} color="#c8551b" />
          <Environment preset="city" environmentIntensity={0.7} />
          <StageGroup />
          <ContactShadows position={[0, -2.4, 0]} opacity={0.45} scale={14} blur={3} far={4} resolution={512} />
        </Suspense>
      </Canvas>
    </div>
  );
}
