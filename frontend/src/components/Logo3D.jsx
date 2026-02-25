import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';

const Apple = ({ appleRef }) => (
    <group ref={appleRef} position={[-4, 4, 0]}>
        <mesh castShadow>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial color="#e63946" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.3]} />
            <meshStandardMaterial color="#3E2723" />
        </mesh>
        {/* Leaf */}
        <mesh position={[0.16, 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
            <coneGeometry args={[0.1, 0.3, 4]} />
            <meshStandardMaterial color="#2E8B57" />
        </mesh>
    </group>
);

const AnimationScene = () => {
    const appleRef = useRef();
    const textRef = useRef();

    // Animation state
    const stateRef = useRef({
        phase: 'falling',
        time: 0,
        velocityY: 0,
        positionX: -4,
        rotationZ: 0
    });

    useFrame((state, delta) => {
        const s = stateRef.current;
        s.time += delta;

        // Cap delta to prevent huge jumps if tab is backgrounded
        const dt = Math.min(delta, 0.1);

        if (s.phase === 'falling') {
            if (appleRef.current) {
                // Gravity acceleration
                s.velocityY += 15 * dt;
                appleRef.current.position.y -= s.velocityY * dt;
                appleRef.current.position.x = s.positionX;

                // Ground collision (apple radius is roughly 0.4)
                if (appleRef.current.position.y <= -0.6) {
                    appleRef.current.position.y = -0.6;

                    // Bounce
                    if (s.velocityY > 2) {
                        s.velocityY = -s.velocityY * 0.4; // Dampened bounce
                    } else {
                        // Stop bouncing, start rolling
                        s.velocityY = 0;
                        s.phase = 'rolling';
                        s.time = 0;
                    }
                }
            }
        }
        else if (s.phase === 'rolling') {
            if (appleRef.current) {
                // Roll to the center (x = 0)
                const rollSpeed = 4;
                s.positionX += rollSpeed * dt;

                // Update position
                appleRef.current.position.x = s.positionX;

                // Update rotation (speed / radius)
                s.rotationZ -= (rollSpeed / 0.4) * dt;
                appleRef.current.rotation.z = s.rotationZ;

                // Slow down and stop at center
                if (s.positionX >= 0) {
                    s.positionX = 0;
                    appleRef.current.position.x = 0;
                    s.phase = 'textAppear';
                    s.time = 0;
                }
            }
        }
        else if (s.phase === 'textAppear') {
            if (textRef.current) {
                // Zoom in text
                textRef.current.scale.x = THREE.MathUtils.lerp(textRef.current.scale.x, 1, 0.1);
                textRef.current.scale.y = THREE.MathUtils.lerp(textRef.current.scale.y, 1, 0.1);
                textRef.current.scale.z = THREE.MathUtils.lerp(textRef.current.scale.z, 1, 0.1);

                // Add soft floating motion to text after appearing
                if (s.time > 1) {
                    textRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
                }
            }

            // Wait a few seconds before resetting
            if (s.time > 5) {
                s.phase = 'resetting';
            }
        }
        else if (s.phase === 'resetting') {
            // Reset all values to initial state
            s.positionX = -4;
            s.velocityY = 0;
            s.rotationZ = 0;

            if (appleRef.current) {
                appleRef.current.position.set(s.positionX, 4, 0);
                appleRef.current.rotation.set(0, 0, 0);
            }
            if (textRef.current) {
                textRef.current.scale.set(0, 0, 0);
                textRef.current.position.y = 1.5;
            }

            s.phase = 'falling';
            s.time = 0;
        }
    });

    return (
        <group>
            {/* Minimalist Floor */}
            <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 10]} />
                <meshStandardMaterial color="#1a202c" roughness={0.1} metalness={0.8} />
            </mesh>

            <Apple appleRef={appleRef} />

            {/* 3D Text */}
            <group ref={textRef} position={[0, 1.5, 0]} scale={0}>
                <Text
                    fontSize={1.2}
                    color="#ffffff"
                    font="/fonts/Inter-Bold.ttf" // Use default sans-serif if not found
                    outlineWidth={0.02}
                    outlineColor="#4a5568"
                    letterSpacing={0.05}
                >
                    Intelligent Physics
                </Text>
            </group>
        </group>
    );
};

const Logo3D = () => {
    return (
        <div className="h-[400px] md:h-[500px] w-full max-w-[800px] relative">
            <Canvas camera={{ position: [0, 1, 8], fov: 45 }} shadows gl={{ antialias: true }}>
                {/* Lighting setup for dramatic effect */}
                <ambientLight intensity={0.4} />
                <spotLight
                    position={[5, 10, 5]}
                    angle={0.5}
                    penumbra={0.8}
                    intensity={2}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-5, 2, -5]} intensity={0.5} color="#4fd1c5" />

                <Suspense fallback={null}>
                    <AnimationScene />
                    <ContactShadows
                        position={[0, -0.99, 0]}
                        opacity={0.8}
                        scale={20}
                        blur={1.5}
                        far={5}
                        color="#000000"
                    />
                    {/* Add environment mapping for reflections on the shiny floor/apple */}
                    <Environment preset="city" />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Logo3D;
