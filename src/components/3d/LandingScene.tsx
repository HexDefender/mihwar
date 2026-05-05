"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, Float } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import { Group, MathUtils, Points, Vector3 } from "three";
import { useScroll, useTransform, useSpring, type MotionValue } from "motion/react";
import { CameraModel } from "./CameraModel";
import { AxisRing } from "./AxisRing";

function ParticleField({ count = 320, spread = 22 }: { count?: number; spread?: number }) {
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
    ref.current.rotation.y = s.clock.elapsedTime * 0.025;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.08) * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.028} color="#c8551b" sizeAttenuation transparent opacity={0.55} />
    </points>
  );
}

type Choreo = {
  rotY: MotionValue<number>;
  rotX: MotionValue<number>;
  rotZ: MotionValue<number>;
  scale: MotionValue<number>;
  posX: MotionValue<number>;
  posY: MotionValue<number>;
  ringScale: MotionValue<number>;
  ringOpacity: MotionValue<number>;
  camX: MotionValue<number>;
  camY: MotionValue<number>;
  camZ: MotionValue<number>;
};

function StageGroup({ choreo }: { choreo: Choreo }) {
  const ref = useRef<Group>(null);
  const ring = useRef<Group>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y = choreo.rotY.get();
      ref.current.rotation.x = choreo.rotX.get();
      ref.current.rotation.z = choreo.rotZ.get();
      ref.current.position.x = choreo.posX.get();
      ref.current.position.y = choreo.posY.get();
      const s = choreo.scale.get();
      ref.current.scale.set(s, s, s);
    }
    if (ring.current) {
      const rs = choreo.ringScale.get();
      ring.current.scale.set(rs, rs, rs);
      const mat = (ring.current.children[0] as { material?: { opacity?: number; transparent?: boolean } } | undefined)?.material;
      if (mat) {
        mat.transparent = true;
        mat.opacity = choreo.ringOpacity.get();
      }
    }
  });

  return (
    <>
      <group ref={ref}>
        <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.5}>
          <CameraModel scale={0.95} />
        </Float>
      </group>
      <group ref={ring}>
        <AxisRing radius={3.6} tube={0.03} color="#c8551b" />
      </group>
    </>
  );
}

function CameraRig({ choreo }: { choreo: Choreo }) {
  const three = useThree();
  const target = useMemo(() => new Vector3(0, 0, 0), []);

  useFrame(() => {
    const cam = three.camera;
    cam.position.x = MathUtils.lerp(cam.position.x, choreo.camX.get(), 0.08);
    cam.position.y = MathUtils.lerp(cam.position.y, choreo.camY.get(), 0.08);
    cam.position.z = MathUtils.lerp(cam.position.z, choreo.camZ.get(), 0.08);
    cam.lookAt(target);
  });

  return null;
}

export function LandingScene() {
  const { scrollYProgress } = useScroll();

  const cfg = { stiffness: 70, damping: 22, mass: 0.6 };

  // 0..0.20  hero   |  0.20..0.45 features  |  0.45..0.75 flow  |  0.75..0.95 cta  |  0.95..1 footer
  const rotY = useSpring(
    useTransform(
      scrollYProgress,
      [0, 0.20, 0.45, 0.75, 0.95, 1],
      [0, Math.PI * 0.55, Math.PI * 1.1, Math.PI * 1.85, Math.PI * 2.4, Math.PI * 2.6]
    ),
    cfg
  );
  const rotX = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [0.05, -0.18, 0.32, -0.22, 0.1]), cfg);
  const rotZ = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [0, 0.18, -0.22, 0.12, 0]), cfg);
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 0.95, 1], [1.0, 0.78, 0.9, 1.15, 0.6, 0.4]), cfg);
  const posX = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [0, -2.4, 2.6, 0, 0]), cfg);
  const posY = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [0, 0.4, -0.4, 0.6, -0.4]), cfg);

  const ringScale = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [1, 1.25, 1.55, 1.8, 2.2]), cfg);
  const ringOpacity = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 0.95, 1], [1, 0.85, 0.65, 0.55, 0.25, 0]), cfg);

  const camX = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [4.5, 5.5, -5.5, 0, 0]), cfg);
  const camY = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [2.0, 1.2, 2.6, 1.8, 0.8]), cfg);
  const camZ = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [6.2, 7.0, 7.4, 4.6, 8.5]), cfg);

  const choreo: Choreo = {
    rotY,
    rotX,
    rotZ,
    scale,
    posX,
    posY,
    ringScale,
    ringOpacity,
    camX,
    camY,
    camZ,
  };

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [4.5, 2, 6.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        className="!h-full !w-full"
      >
        <color attach="background" args={["#00000000"]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 8, 4]} intensity={1.4} castShadow />
          <directionalLight position={[-6, 3, -2]} intensity={0.6} color="#c8551b" />
          <Environment preset="city" environmentIntensity={0.7} />
          <ParticleField />
          <StageGroup choreo={choreo} />
          <CameraRig choreo={choreo} />
          <ContactShadows position={[0, -2.4, 0]} opacity={0.4} scale={14} blur={3} far={4} resolution={512} />
        </Suspense>
      </Canvas>
    </div>
  );
}
