import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface RegionData {
  region: string;
  revenue: number;
  tx_count: number;
}

const regionCoords: Record<string, [number, number]> = {
  'AF-NGA': [9.0820, 8.6753],
  'NA-USA': [37.0902, -95.7129],
  'EU-GBR': [55.3781, -3.4360],
  'AS-JPN': [36.2048, 138.2529],
  'SA-BRA': [-14.2350, -51.9253],
};

const latLongToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// 🌍 HOLOGRAPHIC EARTH
const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null!);
  useFrame(() => { earthRef.current.rotation.y += 0.003; }); // Slightly faster spin

  return (
    <Sphere ref={earthRef} args={[1.5, 64, 64]}>
      <MeshDistortMaterial
        color="#000000"        // Pure black core
        emissive="#10b981"     // Emerald glow
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={1}
        wireframe={true}       // visible grid
        distort={0.4}          // cyber glitch effect
        speed={2}
      />
    </Sphere>
  );
};

const DataSpike = ({ data }: { data: RegionData }) => {
  const coords = regionCoords[data.region];
  if (!coords) return null;

  const position = latLongToVector3(coords[0], coords[1], 1.5);
  // Taller spikes for visibility
  const height = Math.max(0.4, Math.min(data.tx_count / 20, 2.5)); 
  const lookAt = new THREE.Vector3(0,0,0);
  const meshRef = useRef<THREE.Mesh>(null!);
  useEffect(() => { meshRef.current.lookAt(lookAt); }, []);

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.03, 0.03, height, 8]} />
      <meshStandardMaterial color="#ffffff" emissive="#10b981" emissiveIntensity={3} />
    </mesh>
  );
};

export const Globe = () => {
  const [regions, setRegions] = useState<RegionData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/v1/admin/leaderboard');
        const json = await res.json();
        setRegions(json);
      } catch (e) { console.error("Map data offline"); }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full relative">
       <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <h3 className="font-mono text-[10px] text-emerald-500 uppercase italic tracking-widest">ORBITAL SCAN // ACTIVE</h3>
      </div>
      <Canvas camera={{ position: [0, 0, 3.8] }}>
        <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#10b981" />
        <Earth />
        {regions.map((r) => <DataSpike key={r.region} data={r} />)}
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.5} />
      </Canvas>
    </div>
  );
};
