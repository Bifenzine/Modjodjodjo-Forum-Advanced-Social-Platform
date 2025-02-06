import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

const FloatingObject = ({ position, color, shape }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1;
    meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
    meshRef.current.rotation.y = Math.cos(time * 0.5) * 0.2;
  });

  let geometry;
  if (shape === "box") {
    geometry = new THREE.BoxGeometry(1, 1, 1);
  } else if (shape === "sphere") {
    geometry = new THREE.SphereGeometry(0.7, 32, 32);
  } else {
    geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
  }

  return (
    <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
      <mesh
        ref={meshRef}
        position={position}
        geometry={geometry}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}>
        <meshStandardMaterial
          color={hovered ? "#ff6b6b" : color}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
};

export default FloatingObject;
