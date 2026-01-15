import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import PointCloud from './components/PointCloud';
import Sidebar from './components/Sidebar';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [400, 400, 400], fov: 60, near: 0.1, far: 5000 }}>
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />

          <Suspense fallback={null}>
            <PointCloud />
          </Suspense>
        </Canvas>
      </div>

      {/* Header Mobile / Toggle */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto md:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-slate-800 text-white p-2 rounded-lg border border-white/20 shadow-lg"
        >
          {isSidebarOpen ? 'Cerrar Menú' : '☰ Menú / Filtros'}
        </button>
      </div>

      {/* UI Overlay - Responsive Wrapper */}
      <div className={`
        absolute z-10 
        transition-transform duration-300 ease-in-out
        md:top-0 md:right-0 md:h-full md:w-80 md:translate-x-0
        
        ${/* Mobile Styles */ ''}
        border-t md:border-t-0 border-white/10
        bottom-0 left-0 w-full h-[70vh] rounded-t-2xl md:rounded-none
        ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Loading / Info Overlay (Desktop only or adjusted) */}
      <div className="absolute top-4 left-4 text-white/50 text-sm pointer-events-none hidden md:block">
        <h1 className="text-xl font-bold text-white">Quini 6 3D</h1>
        <p>9.3M Combinaciones</p>
      </div>
    </div>
  );
}

export default App;
