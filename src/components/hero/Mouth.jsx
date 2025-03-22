import React, { useMemo } from 'react';
import * as THREE from 'three';

function Mouth({ mouthOpen, mouthArc, mouthSmile }) {
  // Create a mouth curve that adjusts both vertically and horizontally.
  const curve = useMemo(() => {
    const start = new THREE.Vector3(-0.3, 0, 0);
    const end = new THREE.Vector3(0.3, 0, 0);
    // Control point now uses mouthSmile for horizontal adjustment
    const control = new THREE.Vector3(
      mouthSmile,                // horizontal shift based on mouse x
      mouthArc - mouthOpen * 0.1, // vertical adjustment with mouthOpen and mouthArc
      0
    );
    return new THREE.QuadraticBezierCurve3(start, control, end);
  }, [mouthOpen, mouthArc, mouthSmile]);

  const geometry = useMemo(
    () => new THREE.TubeGeometry(curve, 32, 0.015, 8, false),
    [curve]
  );

  return (
    <mesh geometry={geometry} position={[0, -0.25, 1]}>
      <meshStandardMaterial color="#333" side={THREE.DoubleSide} />
    </mesh>
  );
}

export default Mouth;
