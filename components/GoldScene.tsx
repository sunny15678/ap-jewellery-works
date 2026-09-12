"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, OrbitControls, Torus, Sphere } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function GoldJewellery() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.35;
      group.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.12;
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        {/* Main gold ring */}
        <Torus args={[1.55, 0.16, 32, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color="#D4AF37"
            metalness={1}
            roughness={0.18}
          />
        </Torus>

        {/* Diamond */}
        <Sphere args={[0.38, 32, 32]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.05}
            roughness={0.02}
            transmission={0.5}
            thickness={0.4}
            clearcoat={1}
          />
        </Sphere>

        {/* Small gold stones */}
        <Sphere args={[0.12, 20, 20]} position={[0.7, 0.7, 0]}>
          <meshStandardMaterial
            color="#FFD700"
            metalness={1}
            roughness={0.15}
          />
        </Sphere>

        <Sphere args={[0.12, 20, 20]} position={[-0.7, 0.7, 0]}>
          <meshStandardMaterial
            color="#FFD700"
            metalness={1}
            roughness={0.15}
          />
        </Sphere>
      </Float>
    </group>
  );
}

export default function GoldScene() {
  return (
    <div className="h-[500px] w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={1.2} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={3}
        />

        <pointLight
          position={[-4, -2, 4]}
          intensity={2}
        />

        <GoldJewellery />

        <Environment preset="studio" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.7}
        />
      </Canvas>
    </div>
  );
}