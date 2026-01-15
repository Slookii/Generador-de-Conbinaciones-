import { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { TOTAL_COMBINATIONS, indexToPosition } from '../utils/combinatorics';
import { useAppStore } from '../store/useAppStore';

// Vertex Shader: Fast and simple
const vertexShader = `
  attribute float visible;
  varying vec3 vColor;
  
  void main() {
    vColor = color;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Simple size logic
    float size = visible > 0.5 ? 2.5 : 0.0;
    
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment Shader: Hard circle for max performance (no transparency blending overhead if possible)
const fragmentShader = `
  varying vec3 vColor;
  
  void main() {
    // Circle shape
    vec2 coord = gl_PointCoord - vec2(0.5);
    if(length(coord) > 0.5) discard;
    
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

export default function PointCloud() {
    const pointsRef = useRef<THREE.Points>(null);
    const includedNumbers = useAppStore(s => s.includedNumbers);

    // Create Worker
    const worker = useMemo(() => new Worker(new URL('../workers/filterWorker.ts', import.meta.url), { type: 'module' }), []);

    // Create Geometry once
    const { positions, initialColors, visibility } = useMemo(() => {
        const pos = new Float32Array(TOTAL_COMBINATIONS * 3);
        const col = new Float32Array(TOTAL_COMBINATIONS * 3);
        const vis = new Float32Array(TOTAL_COMBINATIONS);

        const white = new THREE.Color('#ffffff');

        for (let i = 0; i < TOTAL_COMBINATIONS; i++) {
            const [x, y, z] = indexToPosition(i);

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            col[i * 3] = white.r;
            col[i * 3 + 1] = white.g;
            col[i * 3 + 2] = white.b;

            vis[i] = 1.0;
        }

        return {
            positions: pos,
            initialColors: col,
            visibility: vis
        };
    }, []);

    useEffect(() => {
        // Worker message handler
        worker.onmessage = (e) => {
            const { visibility: newVis, matchCount } = e.data;
            if (pointsRef.current) {
                const geometry = pointsRef.current.geometry;
                const visibleAttr = geometry.getAttribute('visible') as THREE.BufferAttribute;
                const colorsAttr = geometry.getAttribute('color') as THREE.BufferAttribute;

                const visArray = visibleAttr.array as Float32Array;
                const colArray = colorsAttr.array as Float32Array;

                const matchColor = new THREE.Color('#ff0055');
                const white = new THREE.Color('#ffffff');

                for (let i = 0; i < TOTAL_COMBINATIONS; i++) {
                    const isVis = newVis[i];
                    visArray[i] = isVis;

                    if (isVis) {
                        colArray[i * 3] = matchColor.r;
                        colArray[i * 3 + 1] = matchColor.g;
                        colArray[i * 3 + 2] = matchColor.b;
                    } else {
                        colArray[i * 3] = white.r;
                        colArray[i * 3 + 1] = white.g;
                        colArray[i * 3 + 2] = white.b;
                    }
                }

                visibleAttr.needsUpdate = true;
                colorsAttr.needsUpdate = true;
                console.log(`Filtered: ${matchCount} matches`);
            }
        };

        return () => {
            // worker.terminate(); 
        }
    }, [worker]);

    // Highlights
    const searchedIndex = useAppStore(s => s.searchedIndex);

    // Effect to handle search highlight
    useEffect(() => {
        if (searchedIndex === null || !pointsRef.current) return;

        const geometry = pointsRef.current.geometry;
        const colorsAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
        const visibleAttr = geometry.getAttribute('visible') as THREE.BufferAttribute;

        // Reset all to white first if we navigated from filter? 
        // Or just highlight on top.
        // If filter is active, we might not see it if hidden.
        // Use worker ensures we usually have clean state or filtered state.

        // Force visibility of the searched item
        visibleAttr.setX(searchedIndex, 1.0);

        // Set color to GOLD/Bright Yellow
        colorsAttr.setXYZ(searchedIndex, 1.0, 0.8, 0.0); // Gold

        colorsAttr.needsUpdate = true;
        visibleAttr.needsUpdate = true;

    }, [searchedIndex]);

    // Trigger worker on filter change
    useEffect(() => {
        worker.postMessage({
            includedNumbers,
            totalCombinations: TOTAL_COMBINATIONS
        });
    }, [includedNumbers, worker]);

    // Interaction
    const handlePointerMove = (e: any) => {
        if (e.index !== undefined) {
            useAppStore.getState().setHoveredIndex(e.index);
        } else {
            useAppStore.getState().setHoveredIndex(null);
        }
    };

    // Grid Boundary
    const gridSize = Math.ceil(Math.pow(TOTAL_COMBINATIONS, 1 / 3));

    return (
        <>
            <points ref={pointsRef} onPointerMove={handlePointerMove}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={TOTAL_COMBINATIONS}
                        array={positions}
                        itemSize={3}
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={TOTAL_COMBINATIONS}
                        array={initialColors}
                        itemSize={3}
                        args={[initialColors, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-visible"
                        count={TOTAL_COMBINATIONS}
                        array={visibility}
                        itemSize={1}
                        args={[visibility, 1]}
                    />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    transparent={false}
                    vertexColors
                    depthWrite={true}
                />
            </points>

            {/* Bounding Box for reference */}
            <mesh>
                <boxGeometry args={[gridSize, gridSize, gridSize]} />
                <meshBasicMaterial color="#444444" wireframe opacity={0.3} transparent />
            </mesh>
        </>
    );
}
