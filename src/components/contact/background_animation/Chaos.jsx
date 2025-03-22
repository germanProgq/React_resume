// ChaosScene.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import {
  LorenzAttractor,
  RosslerAttractor,
  AizawaAttractor,
  ThomasAttractor,
  MovingCameraRig,
} from './ChaosAttractors';
import './Chaos.css'; // or your own CSS

const ChaosScene = () => {
  return (
    <div className="chaos-wrapper">
      <Canvas className="chaos-canvas" camera={{ position: [0, 0, 50], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        <MovingCameraRig>
          <LorenzAttractor />
          <RosslerAttractor />
          <AizawaAttractor />
          <ThomasAttractor />
        </MovingCameraRig>
      </Canvas>
    </div>
  );
};

export default ChaosScene;
