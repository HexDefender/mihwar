"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, Float, Sparkles } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Group, MathUtils, Mesh, Points, Vector3 } from "three";
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

function GlowOrb({ z = -4 }: { z?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.position.x = Math.sin(t * 0.25) * 1.6;
    ref.current.position.y = Math.cos(t * 0.18) * 0.8 + 0.5;
    const m = ref.current.material as { emissiveIntensity?: number };
    if (m && m.emissiveIntensity !== undefined) {
      m.emissiveIntensity = 0.6 + Math.sin(t * 0.7) * 0.2;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0.5, z]}>
      <sphereGeometry args={[1.4, 48, 48]} />
      <meshStandardMaterial
        color="#c8551b"
        emissive="#f0763a"
        emissiveIntensity={0.6}
        metalness={0.2}
        roughness={0.7}
        transparent
        opacity={0.18}
      />
    </mesh>
  );
}

function FogPlane() {
  const ref = useRef<Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.z = s.clock.elapsedTime * 0.02;
  });
  return (
    <mesh ref={ref} position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 40, 1, 1]} />
      <meshBasicMaterial color="#0e0e14" transparent opacity={0.18} />
    </mesh>
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
  const ring2 = useRef<Group>(null);

  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = choreo.rotY.get();
      ref.current.rotation.x = choreo.rotX.get();
      ref.current.rotation.z = choreo.rotZ.get();
      ref.current.position.x = choreo.posX.get();
      ref.current.position.y = choreo.posY.get();
      const sc = choreo.scale.get();
      ref.current.scale.set(sc, sc, sc);
    }
    if (ring.current) {
      const rs = choreo.ringScale.get();
      ring.current.scale.set(rs, rs, rs);
      ring.current.rotation.y = s.clock.elapsedTime * 0.08;
      const mat = (ring.current.children[0] as { material?: { opacity?: number; transparent?: boolean } } | undefined)?.material;
      if (mat) {
        mat.transparent = true;
        mat.opacity = choreo.ringOpacity.get();
      }
    }
    if (ring2.current) {
      const rs = choreo.ringScale.get() * 1.4;
      ring2.current.scale.set(rs, rs, rs);
      ring2.current.rotation.x = s.clock.elapsedTime * -0.06;
      ring2.current.rotation.z = s.clock.elapsedTime * 0.04;
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
      <group ref={ring2}>
        <AxisRing radius={5.2} tube={0.018} color="#5a8cff" />
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
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setIsMobile(mqMobile.matches);
      setReduced(mqReduce.matches);
    };
    sync();
    mqMobile.addEventListener("change", sync);
    mqReduce.addEventListener("change", sync);
    return () => {
      mqMobile.removeEventListener("change", sync);
      mqReduce.removeEventListener("change", sync);
    };
  }, []);

  const cfg = { stiffness: 70, damping: 22, mass: 0.6 };
  const mScale = isMobile ? 0.78 : 1.0;
  const mCamZ = isMobile ? 1.4 : 1.0;
  const mPosX = isMobile ? 0.55 : 1.0;

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
  const scale = useSpring(
    useTransform(
      scrollYProgress,
      [0, 0.20, 0.45, 0.75, 0.95, 1],
      [1.0 * mScale, 0.78 * mScale, 0.9 * mScale, 1.15 * mScale, 0.6 * mScale, 0.4 * mScale]
    ),
    cfg
  );
  const posX = useSpring(
    useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [0, -2.4 * mPosX, 2.6 * mPosX, 0, 0]),
    cfg
  );
  const posY = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [0, 0.4, -0.4, 0.6, -0.4]), cfg);

  const ringScale = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [1, 1.25, 1.55, 1.8, 2.2]), cfg);
  const ringOpacity = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 0.95, 1], [1, 0.85, 0.65, 0.55, 0.25, 0]), cfg);

  const camX = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [4.5, 5.5, -5.5, 0, 0]), cfg);
  const camY = useSpring(useTransform(scrollYProgress, [0, 0.20, 0.45, 0.75, 1], [2.0, 1.2, 2.6, 1.8, 0.8]), cfg);
  const camZ = useSpring(
    useTransform(
      scrollYProgress,
      [0, 0.20, 0.45, 0.75, 1],
      [6.2 * mCamZ, 7.0 * mCamZ, 7.4 * mCamZ, 4.6 * mCamZ, 8.5 * mCamZ]
    ),
    cfg
  );

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

  if (reduced) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 opacity-90 md:opacity-100"
      aria-hidden="true"
      style={{ maskImage: "linear-gradient(to bottom, #000 65%, transparent 98%)", WebkitMaskImage: "linear-gradient(to bottom, #000 65%, transparent 98%)" }}
    >
      <Canvas
        shadows
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [4.5, 2, 6.2], fov: isMobile ? 46 : 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="!h-full !w-full"
      >
        <color attach="background" args={["#00000000"]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 8, 4]} intensity={1.4} castShadow />
          <directionalLight position={[-6, 3, -2]} intensity={0.7} color="#c8551b" />
          <directionalLight position={[2, -2, 6]} intensity={0.35} color="#5a8cff" />
          <Environment preset="city" environmentIntensity={0.7} />
          <GlowOrb z={-5} />
          <FogPlane />
          <ParticleField count={isMobile ? 180 : 320} />
          <Sparkles count={isMobile ? 40 : 80} scale={[14, 8, 14]} size={2.5} speed={0.35} color="#f0763a" opacity={0.6} />
          <StageGroup choreo={choreo} />
          <CameraRig choreo={choreo} />
          <ContactShadows position={[0, -2.4, 0]} opacity={0.4} scale={14} blur={3} far={4} resolution={isMobile ? 256 : 512} />
        </Suspense>
      </Canvas>
    </div>
  );
}
