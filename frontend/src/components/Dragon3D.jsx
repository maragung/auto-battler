import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import styles from './Dragon3D.module.css'

// Simple Dragon Model (Procedurally generated since we can't load external models directly)
function DragonModel({ position = [0, 0, 0], scale = 1, animation = false, team = 'player' }) {
  const groupRef = useRef()
  const headRef = useRef()
  const bodyRef = useRef()
  const wingRef = useRef()

  useFrame((state) => {
    if (!animation) return

    // Simple animation
    if (groupRef.current) {
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.01
    }

    if (wingRef.current) {
      wingRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * Math.PI / 6
    }

    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.3
    }
  })

  const dragonColor = team === 'player' ? '#3b82f6' : '#ef4444'
  const wingColor = team === 'player' ? '#1e40af' : '#b91c1c'

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.8, 2, 4, 8]} />
        <meshStandardMaterial color={dragonColor} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.2, 0.8]} castShadow receiveShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color={dragonColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 1.2, 1.4]} castShadow receiveShadow>
        <coneGeometry args={[0.4, 0.6, 8]} />
        <meshStandardMaterial color={dragonColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Horn */}
      <mesh position={[0, 1.8, 0.6]} rotation={[Math.PI / 4, 0, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.3, 1.4, 1.2]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" />
      </mesh>
      <mesh position={[0.3, 1.4, 1.2]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" />
      </mesh>

      {/* Left Wing */}
      <group ref={wingRef} position={[-0.9, 0.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.3, 1.8]} />
          <meshStandardMaterial color={wingColor} metalness={0.4} roughness={0.6} />
        </mesh>
        <mesh position={[-0.3, 0, 0]} scale={[1.2, 1, 0.9]} castShadow receiveShadow>
          <tetrahedronGeometry args={[0.8]} />
          <meshStandardMaterial color={wingColor} metalness={0.3} roughness={0.7} />
        </mesh>
      </group>

      {/* Right Wing */}
      <group position={[0.9, 0.5, 0]} rotation={[0, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.3, 1.8]} />
          <meshStandardMaterial color={wingColor} metalness={0.4} roughness={0.6} />
        </mesh>
        <mesh position={[0.3, 0, 0]} scale={[1.2, 1, 0.9]} castShadow receiveShadow>
          <tetrahedronGeometry args={[0.8]} />
          <meshStandardMaterial color={wingColor} metalness={0.3} roughness={0.7} />
        </mesh>
      </group>

      {/* Tail */}
      <group position={[0, -0.3, -1.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.3, 1.5]} />
          <meshStandardMaterial color={dragonColor} metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.3, -0.8]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color={dragonColor} metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* Front Legs */}
      <mesh position={[-0.5, -1, 0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
        <meshStandardMaterial color={dragonColor} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.5, -1, 0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
        <meshStandardMaterial color={dragonColor} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Back Legs */}
      <mesh position={[-0.5, -1, -0.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
        <meshStandardMaterial color={dragonColor} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.5, -1, -0.8]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
        <meshStandardMaterial color={dragonColor} metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}

// 3D Battle Arena Scene
function BattleArena({ playerTeam = [], opponentTeam = [], selectedUnit = null }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 8]} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#667eea" />
      <pointLight position={[10, 5, -10]} intensity={0.5} color="#ef4444" />

      {/* Background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Battle Arena Ground Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
        <ringGeometry args={[6, 7, 32]} />
        <meshStandardMaterial color="#667eea" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Player Dragon - Left Side */}
      <DragonModel
        position={[-4, 0, 2]}
        scale={1.2}
        animation={true}
        team="player"
      />

      {/* Opponent Dragon - Right Side */}
      <DragonModel
        position={[4, 0, 2]}
        scale={1.2}
        animation={true}
        team="opponent"
      />

      {/* Support Dragons - Player Team */}
      <DragonModel
        position={[-3, 0, -2]}
        scale={0.9}
        animation={true}
        team="player"
      />
      <DragonModel
        position={[-5, 0, -2]}
        scale={0.9}
        animation={true}
        team="player"
      />

      {/* Support Dragons - Opponent Team */}
      <DragonModel
        position={[3, 0, -2]}
        scale={0.9}
        animation={true}
        team="opponent"
      />
      <DragonModel
        position={[5, 0, -2]}
        scale={0.9}
        animation={true}
        team="opponent"
      />

      {/* Central Arena Light Effect */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial
          color="#667eea"
          emissive="#667eea"
          emissiveIntensity={0.2}
          transparent={true}
          opacity={0.1}
        />
      </mesh>
    </>
  )
}

export default function Dragon3DBattle({ playerTeam = [], opponentTeam = [], selectedUnit = null }) {
  return (
    <div className={styles.container}>
      <Canvas
        shadows
        camera={{ position: [0, 4, 8], fov: 60 }}
        className={styles.canvas}
      >
        <BattleArena
          playerTeam={playerTeam}
          opponentTeam={opponentTeam}
          selectedUnit={selectedUnit}
        />
      </Canvas>
    </div>
  )
}
