import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, ContactShadows } from '@react-three/drei';

// --- Professional Engineering: The "Quantum Lattice" ---
// A representation of structure, stability, and infinite complexity.
const QuantumLattice = () => {
    const meshRef = useRef();
    const wireframeRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Sophisticated, non-linear rotation
        // A "40+ year engineer" knows that linear rotation (+= delta) looks cheap.
        // We use sine waves to create "breathing" motion where it slows down and speeds up subtly.

        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
            meshRef.current.rotation.y = t * 0.15; // Slow constant yaw
            meshRef.current.rotation.z = Math.cos(t * 0.15) * 0.1;
        }

        if (wireframeRef.current) {
            // Counter-rotation for the wireframe slightly creates depth parallax
            wireframeRef.current.rotation.copy(meshRef.current.rotation);
            wireframeRef.current.rotation.y += 0.05; // Slight offset

            // Pulse effect on scale
            const scale = 1.05 + Math.sin(t * 1.5) * 0.02;
            wireframeRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group>
            {/* 1. The Core Object: A Black Matte Dodecahedron (The "Mystery") */}
            {/* Represents solid fundamental physics constants */}
            <mesh ref={meshRef}>
                <dodecahedronGeometry args={[2.0, 0]} />
                <meshStandardMaterial
                    color="#1a1a1a"    // Almost black
                    roughness={0.2}     // Polished concrete/ceramic look
                    metalness={0.8}     // Metallic undertone
                    flatShading={false}
                />
            </mesh>

            {/* 2. The Lattice: A Glowing HUD Wireframe (The "Intelligence") */}
            {/* Represents the data/AI analyzing the physics */}
            <mesh ref={wireframeRef}>
                <dodecahedronGeometry args={[2.0, 0]} />
                <meshBasicMaterial
                    color="#00d8ff"
                    wireframe={true}
                    transparent={true}
                    opacity={0.15}
                />
            </mesh>

            {/* 3. The Orbitals: Abstract Electrons */}
            <ElectronRing radius={3.2} speed={0.4} color="#ffffff" axis={[1, 1, 0]} />
            <ElectronRing radius={3.8} speed={-0.3} color="#ffffff" axis={[0, 1, 1]} />
        </group>
    );
};

// --- Helper: Minimalist Orbital Ring ---
const ElectronRing = ({ radius, speed, color, axis }) => {
    const ref = useRef();
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x += delta * speed * axis[0];
            ref.current.rotation.y += delta * speed * axis[1];
            ref.current.rotation.z += delta * speed * axis[2];
        }
    });

    return (
        <group ref={ref}>
            {/* Minimalist thin orbit line */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius, 0.01, 32, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>
            {/* Single particle of knowledge */}
            <mesh position={[radius, 0, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </group>
    );
};

const Logo3D = () => {
    return (
        <div className="h-[600px] w-[600px] relative">
            <Canvas camera={{ position: [0, 0, 14], fov: 35 }} gl={{ antialias: true, alpha: true }}>
                {/* 
                   "40+ Years Experience" Lighting Setup:
                   We don't rely on chaotic HDRIs. We sculpt the light manually.
                   This creates a 'Rembrandt' look for the object.
                */}

                {/* 1. Key Light: Main source, warm white, top-right */}
                <spotLight
                    position={[10, 15, 10]}
                    angle={0.3}
                    penumbra={1}
                    intensity={2.0}
                    castShadow
                    color="#ffffff"
                />

                {/* 2. Fill Light: Soft cool blue, left side, fills shadows */}
                <pointLight position={[-10, 0, -5]} intensity={1.0} color="#b0e0e6" />

                {/* 3. Rim Light: Sharp backlight to define edges/silhouette */}
                <spotLight position={[0, 10, -10]} intensity={2.0} color="#00d8ff" angle={0.5} />

                {/* 4. Bounce Light: Subtle ground reflection */}
                <ambientLight intensity={0.2} />

                <Suspense fallback={null}>
                    <Float
                        speed={1.5}
                        rotationIntensity={0.2}
                        floatIntensity={0.5}
                        floatingRange={[-0.1, 0.1]}
                    >
                        <QuantumLattice />
                    </Float>

                    {/* Soft contact shadow to ground the object in space */}
                    <ContactShadows
                        position={[0, -3.5, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2.5}
                        far={4.5}
                        color="#000000"
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Logo3D;
