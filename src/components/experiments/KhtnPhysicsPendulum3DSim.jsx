import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const PLANETS_GRAVITY = {
  earth: { name: 'Trái Đất', g: 9.8, color: '#38bdf8' },
  moon: { name: 'Mặt Trăng', g: 1.62, color: '#94a3b8' },
  mars: { name: 'Sao Hỏa', g: 3.71, color: '#f97316' },
  jupiter: { name: 'Sao Mộc', g: 24.79, color: '#fbbf24' }
};

export function KhtnPhysicsPendulum3DSim({ onLog, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const [length, setLength] = useState(1.0); // m
  const [mass, setMass] = useState(0.5); // kg
  const [planet, setPlanet] = useState('earth');
  const [isSwinging, setIsSwinging] = useState(false);
  const [damping, setDamping] = useState(false);
  const [showVectors, setShowVectors] = useState(true);

  // Measurements
  const [oscCount, setOscCount] = useState(0);
  const [stopwatch, setStopwatch] = useState(0);
  const [isTiming10, setIsTiming10] = useState(false);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const pendulumGroupRef = useRef(null);
  const stringMeshRef = useRef(null);
  const bobMeshRef = useRef(null);
  const vectorsGroupRef = useRef(null);

  // Physics state refs
  const thetaRef = useRef(0.35); // Initial displacement angle (radians) ~ 20°
  const omegaRef = useRef(0.0); // Angular velocity
  const isSwingingRef = useRef(isSwinging);
  isSwingingRef.current = isSwinging;
  const lengthRef = useRef(length);
  lengthRef.current = length;
  const massRef = useRef(mass);
  massRef.current = mass;
  const gRef = useRef(PLANETS_GRAVITY.earth.g);
  gRef.current = PLANETS_GRAVITY[planet].g;

  const currentG = PLANETS_GRAVITY[planet].g;
  const theoreticalPeriod = (2 * Math.PI * Math.sqrt(length / currentG)).toFixed(2);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#030712');

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.0;
    controls.maxDistance = 10.0;
    controls.target.set(0, 0.8, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // --- 1. LAB STAND & SUPPORT BAR ---
    // Floor
    const floor = new THREE.GridHelper(4.0, 16, 0x0ea5e9, 0x1e293b);
    floor.position.y = -0.5;
    scene.add(floor);

    // Stand base
    const baseGeom = new THREE.BoxGeometry(0.8, 0.04, 0.6);
    const ironMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5, metalness: 0.7 });
    const standBase = new THREE.Mesh(baseGeom, ironMat);
    standBase.position.set(0, -0.48, 0);
    scene.add(standBase);

    // Vertical Stand Rod
    const standRodGeom = new THREE.CylinderGeometry(0.016, 0.016, 2.6, 16);
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.2, metalness: 0.9 });
    const standRod = new THREE.Mesh(standRodGeom, chromeMat);
    standRod.position.set(-0.35, 0.8, 0);
    scene.add(standRod);

    // Horizontal Arm
    const armGeom = new THREE.CylinderGeometry(0.014, 0.014, 0.5, 16);
    const arm = new THREE.Mesh(armGeom, chromeMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(-0.1, 2.05, 0);
    scene.add(arm);

    // Pivot Bearing
    const pivotGeom = new THREE.SphereGeometry(0.035, 16, 16);
    const pivot = new THREE.Mesh(pivotGeom, ironMat);
    pivot.position.set(0, 2.05, 0);
    scene.add(pivot);

    // --- 2. PENDULUM OSCILLATOR GROUP (PIVOTS AT Y = 2.05) ---
    const pendulumGroup = new THREE.Group();
    pendulumGroup.position.set(0, 2.05, 0);
    scene.add(pendulumGroup);
    pendulumGroupRef.current = pendulumGroup;

    // Suspension String
    const stringGeom = new THREE.CylinderGeometry(0.003, 0.003, 1.0, 8);
    const stringMat = new THREE.MeshBasicMaterial({ color: '#94a3b8' });
    const stringMesh = new THREE.Mesh(stringGeom, stringMat);
    stringMesh.position.y = -0.5;
    pendulumGroup.add(stringMesh);
    stringMeshRef.current = stringMesh;

    // Metallic Bob (Quả cầu kim loại phản chiếu)
    const bobGeom = new THREE.SphereGeometry(0.12, 32, 32);
    const bobMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const bobMesh = new THREE.Mesh(bobGeom, bobMat);
    bobMesh.position.y = -1.0;
    bobMesh.castShadow = true;
    pendulumGroup.add(bobMesh);
    bobMeshRef.current = bobMesh;

    // Vectors Group
    const vectorsGroup = new THREE.Group();
    scene.add(vectorsGroup);
    vectorsGroupRef.current = vectorsGroup;

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Physics Animation Loop
    let lastTime = performance.now();
    let passCount = 0;
    let prevTheta = 0.35;
    let timingStart = 0;

    const animate = (time) => {
      controls.update();

      const dt = Math.min(0.033, (time - lastTime) / 1000);
      lastTime = time;

      if (isSwingingRef.current) {
        const L = lengthRef.current;
        const g = gRef.current;
        const b = damping ? 0.08 : 0.002; // Damping constant

        // Nonlinear Differential Equation: theta'' = -(g/L)*sin(theta) - b*omega
        const alpha = -(g / L) * Math.sin(thetaRef.current) - b * omegaRef.current;
        omegaRef.current += alpha * dt;
        thetaRef.current += omegaRef.current * dt;

        // Count oscillations (zero crossings from negative to positive)
        if (prevTheta < 0 && thetaRef.current >= 0) {
          passCount++;
          setOscCount(passCount);

          if (isTiming10 && passCount === 10) {
            const elapsed = ((performance.now() - timingStart) / 1000).toFixed(2);
            setStopwatch(elapsed);
            setIsTiming10(false);
            if (onLog) {
              onLog(`⏱️ Bấm giờ hoàn tất 10 dao động trên ${PLANETS_GRAVITY[planet].name}: t_10 = ${elapsed}s -> Chu kỳ T_đo = ${(elapsed / 10).toFixed(2)}s (Chu kỳ lý thuyết: ${theoreticalPeriod}s).`);
            }
          }
        }
        prevTheta = thetaRef.current;

        // Apply rotation to Pendulum Group (oscillates in X-Y plane around Z axis)
        if (pendulumGroupRef.current) {
          pendulumGroupRef.current.rotation.z = -thetaRef.current;
        }
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    if (onLog) {
      onLog('Khởi tạo Mô hình Con Lắc Đơn 3D (Dao động điều hòa & Phương trình vi phân phi tuyến).');
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [planet, damping]);

  // Adjust string length & bob position dynamically
  useEffect(() => {
    if (stringMeshRef.current && bobMeshRef.current) {
      stringMeshRef.current.scale.y = length;
      stringMeshRef.current.position.y = -length / 2;
      bobMeshRef.current.position.y = -length;
    }
  }, [length]);

  const handleStartSwinging = () => {
    if (!isSwinging) {
      if (Math.abs(thetaRef.current) < 0.05) {
        thetaRef.current = 0.35; // 20°
      }
      setIsSwinging(true);
      if (onLog) {
        onLog(`▶️ Thả con lắc dao động (L = ${length}m, m = ${mass}kg) trên ${PLANETS_GRAVITY[planet].name} (g = ${currentG} m/s²). Chu kỳ lý thuyết T = ${theoreticalPeriod}s.`);
      }
    } else {
      setIsSwinging(false);
      if (onLog) onLog('⏸️ Tạm dừng dao động con lắc.');
    }
  };

  const handleStartTiming10 = () => {
    thetaRef.current = 0.35;
    omegaRef.current = 0.0;
    setIsSwinging(true);
    setOscCount(0);
    setStopwatch(0);
    setIsTiming10(true);
    if (onLog) {
      onLog('⏱️ Bắt đầu bấm giờ đo thời gian 10 dao động toàn phần...');
    }
  };

  const handleReset = () => {
    setIsSwinging(false);
    thetaRef.current = 0.35;
    omegaRef.current = 0.0;
    if (pendulumGroupRef.current) {
      pendulumGroupRef.current.rotation.z = -0.35;
    }
    setOscCount(0);
    setStopwatch(0);
    setIsTiming10(false);
    if (onLog) onLog('🔄 Đưa con lắc về vị trí góc ban đầu (alpha = 20°).');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#020617', color: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
      {/* Top Header */}
      <div style={{
        padding: '12px 18px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', boxShadow: '0 0 15px rgba(56, 189, 248, 0.5)'
          }}>
            ⏱️
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.5px' }}>
              MÔ HÌNH CON LẮC ĐƠN 3D & TRƯỜNG TRỌNG LỰC ĐA HÀNH TINH
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Khảo sát dao động điều hòa phi tuyến, chu kỳ T = 2π√(L/g) & bảo toàn cơ năng (Vật lí 10, 11)
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleStartSwinging}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: isSwinging ? '#ef4444' : '#10b981',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {isSwinging ? '⏸ Tạm Dừng' : '▶️ Bắt Đầu Thả'}
          </button>

          <button
            onClick={handleStartTiming10}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #f59e0b',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            ⏱️ Đo 10 Dao Động
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🔄 Tái Lập
          </button>

          {toggleFullscreen && (
            <button
              onClick={toggleFullscreen}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #38bdf8',
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38bdf8',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            </button>
          )}
        </div>
      </div>

      {/* Main 3D Viewport Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* Floating Bottom Sliders & Planet Bar */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '24px',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6)',
          zIndex: 10
        }}>
          {/* Length Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>Chiều dài L:</span>
            <input
              type="range"
              min="0.3"
              max="1.8"
              step="0.05"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              style={{ width: '110px', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#fff', minWidth: '38px' }}>
              {length}m
            </span>
          </div>

          <div style={{ width: '1px', height: '22px', background: '#334155' }} />

          {/* Planet Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8' }}>Hành tinh:</span>
            {Object.keys(PLANETS_GRAVITY).map(key => (
              <button
                key={key}
                onClick={() => setPlanet(key)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: planet === key ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: planet === key ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                {PLANETS_GRAVITY[key].name} ({PLANETS_GRAVITY[key].g}m/s²)
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '22px', background: '#334155' }} />

          {/* Air Damping toggle */}
          <button
            onClick={() => setDamping(!damping)}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: damping ? '#f59e0b' : 'transparent',
              color: damping ? '#000' : '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {damping ? '💨 Lực cản không khí: BẬT' : '💨 Lực cản không khí: TẮT'}
          </button>
        </div>

        {/* Left Side: Physics Measurements Card */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '320px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          zIndex: 10
        }}>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            THÔNG SỐ DAO ĐỘNG CƠ HỌC
          </div>

          {/* Main Period Readout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>CHU KỲ LÝ THUYẾT (T)</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
                {theoreticalPeriod} <span style={{ fontSize: '0.8rem' }}>s</span>
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>ĐẾM DAO ĐỘNG</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>
                {oscCount} <span style={{ fontSize: '0.8rem' }}>lần</span>
              </div>
            </div>
          </div>

          {/* Stopwatch 10 Oscillations result */}
          {stopwatch > 0 && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              padding: '10px',
              borderRadius: '10px',
              marginBottom: '10px',
              fontSize: '0.8rem'
            }}>
              <div style={{ fontWeight: 800, color: '#34d399' }}>Kết quả đo 10 dao động:</div>
              <div style={{ color: '#f8fafc', marginTop: '2px' }}>
                Thời gian t₁₀ = <strong>{stopwatch}s</strong> ➔ Chu kỳ thực nghiệm <strong>T_đo = {(stopwatch / 10).toFixed(2)}s</strong>
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.45', background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '10px' }}>
            <div>📐 <strong>Công thức chu kỳ:</strong> T = 2π√(L/g)</div>
            <div style={{ marginTop: '4px' }}>
              • Chu kỳ tỉ lệ thuận với căn bậc hai chiều dài dây <strong>√L</strong>.
            </div>
            <div style={{ marginTop: '2px' }}>
              • Chu kỳ tỉ lệ nghịch với căn bậc hai gia tốc <strong>√g</strong> (Trên Mặt Trăng g nhỏ nên con lắc dao động chậm hơn 2.45 lần).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
