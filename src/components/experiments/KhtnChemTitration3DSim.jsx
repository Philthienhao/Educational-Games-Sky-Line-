import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- TITRATION CHEMICAL EQUATIONS & PH CALCULATION ---
// Titrating 20.00 ml HCl 0.100 M with NaOH 0.100 M
function calculateTitrationPH(vAdded) {
  const v0 = 20.0; // ml of HCl
  const cA = 0.1;  // M
  const cB = 0.1;  // M
  const totalV = v0 + vAdded; // ml

  if (vAdded < v0) {
    // Before equivalence point: excess H+
    const molesHLeft = (v0 * cA - vAdded * cB) / 1000;
    const concH = (molesHLeft / (totalV / 1000));
    const ph = -Math.log10(Math.max(1e-14, concH));
    return Math.min(6.95, Math.max(1.0, ph));
  } else if (Math.abs(vAdded - v0) < 0.02) {
    // Exact equivalence point
    return 7.0;
  } else {
    // After equivalence point: excess OH-
    const molesOHExcess = (vAdded * cB - v0 * cA) / 1000;
    const concOH = (molesOHExcess / (totalV / 1000));
    const pOH = -Math.log10(Math.max(1e-14, concOH));
    const ph = 14.0 - pOH;
    return Math.min(13.0, Math.max(7.05, ph));
  }
}

// Indicator colors based on pH
function getIndicatorColor(indicator, ph) {
  if (indicator === 'phenolphthalein') {
    if (ph < 8.2) return { hex: '#f8fafc', opacity: 0.18, name: 'Không màu (Trong suốt)' };
    if (ph <= 10.0) return { hex: '#f472b6', opacity: 0.72, name: 'Hồng cánh sen (Điểm tương đương!)' };
    return { hex: '#db2777', opacity: 0.88, name: 'Đỏ tươi / Tím hồng đậm' };
  } else if (indicator === 'litmus') {
    if (ph < 5.0) return { hex: '#ef4444', opacity: 0.65, name: 'Đỏ (Môi trường Axit)' };
    if (ph <= 8.0) return { hex: '#a855f7', opacity: 0.65, name: 'Tím (Môi trường Trung tính)' };
    return { hex: '#3b82f6', opacity: 0.75, name: 'Xanh lam (Môi trường Bazơ)' };
  } else {
    // Methyl Orange
    if (ph < 3.1) return { hex: '#ef4444', opacity: 0.7, name: 'Đỏ' };
    if (ph <= 4.4) return { hex: '#f97316', opacity: 0.7, name: 'Cam' };
    return { hex: '#eab308', opacity: 0.7, name: 'Vàng' };
  }
}

export function KhtnChemTitration3DSim({ onLog, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const [vAdded, setVAdded] = useState(0.0); // ml NaOH added
  const [flowRate, setFlowRate] = useState(0); // 0: closed, 1: drop by drop, 2: slow, 3: fast
  const [isStirring, setIsStirring] = useState(true);
  const [stirSpeed, setStirSpeed] = useState(600); // rpm
  const [indicator, setIndicator] = useState('phenolphthalein');

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const buretteLiquidMeshRef = useRef(null);
  const flaskLiquidMeshRef = useRef(null);
  const stirBarMeshRef = useRef(null);
  const dropletsGroupRef = useRef(null);

  const vAddedRef = useRef(vAdded);
  vAddedRef.current = vAdded;
  const flowRateRef = useRef(flowRate);
  flowRateRef.current = flowRate;
  const isStirringRef = useRef(isStirring);
  isStirringRef.current = isStirring;

  const currentPH = calculateTitrationPH(vAdded);
  const indicatorInfo = getIndicatorColor(indicator, currentPH);

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
    camera.position.set(2.2, 1.8, 3.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.0;
    controls.maxDistance = 8.0;
    controls.target.set(0, 0.6, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.6);
    mainLight.position.set(4, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Lab Workbench Table Surface
    const benchGeom = new THREE.BoxGeometry(4.0, 0.1, 2.5);
    const benchMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.35, metalness: 0.2 });
    const benchMesh = new THREE.Mesh(benchGeom, benchMat);
    benchMesh.position.y = -0.05;
    benchMesh.receiveShadow = true;
    scene.add(benchMesh);

    // Grid on bench
    const benchGrid = new THREE.GridHelper(3.0, 15, 0x0ea5e9, 0x334155);
    benchGrid.position.y = 0.002;
    scene.add(benchGrid);

    // --- 1. IRON RETORT STAND & CLAMP ---
    const standBaseGeom = new THREE.BoxGeometry(0.55, 0.04, 0.35);
    const ironMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6, metalness: 0.8 });
    const standBase = new THREE.Mesh(standBaseGeom, ironMat);
    standBase.position.set(-0.35, 0.02, 0);
    standBase.castShadow = true;
    scene.add(standBase);

    const rodGeom = new THREE.CylinderGeometry(0.014, 0.014, 2.4, 16);
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.2, metalness: 0.9 });
    const rodMesh = new THREE.Mesh(rodGeom, chromeMat);
    rodMesh.position.set(-0.5, 1.2, 0);
    rodMesh.castShadow = true;
    scene.add(rodMesh);

    // Burette Clamps (2 clamps holding burette)
    [0.9, 1.7].forEach((yPos) => {
      const clampGeom = new THREE.BoxGeometry(0.35, 0.04, 0.05);
      const clampMesh = new THREE.Mesh(clampGeom, ironMat);
      clampMesh.position.set(-0.32, yPos, 0);
      scene.add(clampMesh);
    });

    // --- 2. GLASS BURETTE (50 ML) ---
    // Outer Glass Tube
    const buretteGlassGeom = new THREE.CylinderGeometry(0.045, 0.045, 1.6, 24, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
      thickness: 0.08
    });
    const buretteGlass = new THREE.Mesh(buretteGlassGeom, glassMat);
    buretteGlass.position.set(-0.15, 1.35, 0);
    scene.add(buretteGlass);

    // Burette Tip Cone
    const tipGeom = new THREE.ConeGeometry(0.045, 0.15, 24, 1, true);
    const tipMesh = new THREE.Mesh(tipGeom, glassMat);
    tipMesh.rotation.x = Math.PI;
    tipMesh.position.set(-0.15, 0.48, 0);
    scene.add(tipMesh);

    // Burette Stopcock valve
    const stopcockGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.12, 16);
    const stopcockMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.3 });
    const stopcock = new THREE.Mesh(stopcockGeom, stopcockMat);
    stopcock.rotation.z = Math.PI / 2;
    stopcock.position.set(-0.15, 0.55, 0);
    scene.add(stopcock);

    // Liquid column inside Burette (NaOH)
    const buretteLiquidGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.5, 20);
    const liquidNaOHMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.85,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1
    });
    const buretteLiquidMesh = new THREE.Mesh(buretteLiquidGeom, liquidNaOHMat);
    buretteLiquidMesh.position.set(-0.15, 1.35, 0);
    scene.add(buretteLiquidMesh);
    buretteLiquidMeshRef.current = buretteLiquidMesh;

    // --- 3. MAGNETIC STIRRER & FLASK ---
    // Magnetic Stirrer Box
    const stirrerGeom = new THREE.BoxGeometry(0.55, 0.12, 0.55);
    const stirrerMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4, metalness: 0.4 });
    const stirrer = new THREE.Mesh(stirrerGeom, stirrerMat);
    stirrer.position.set(-0.15, 0.06, 0);
    stirrer.castShadow = true;
    scene.add(stirrer);

    // Ceramic Plate on Stirrer
    const plateGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.02, 32);
    const ceramicMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 });
    const plate = new THREE.Mesh(plateGeom, ceramicMat);
    plate.position.set(-0.15, 0.13, 0);
    scene.add(plate);

    // Erlenmeyer Conical Flask 250ml
    const flaskGroup = new THREE.Group();
    flaskGroup.position.set(-0.15, 0.14, 0);
    scene.add(flaskGroup);

    // Conical base
    const flaskBaseGeom = new THREE.CylinderGeometry(0.07, 0.22, 0.22, 32, 1, true);
    const flaskBase = new THREE.Mesh(flaskBaseGeom, glassMat);
    flaskBase.position.y = 0.11;
    flaskGroup.add(flaskBase);

    // Neck tube
    const flaskNeckGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.12, 32, 1, true);
    const flaskNeck = new THREE.Mesh(flaskNeckGeom, glassMat);
    flaskNeck.position.y = 0.28;
    flaskGroup.add(flaskNeck);

    // Flask Liquid Mesh
    const flaskLiquidGeom = new THREE.CylinderGeometry(0.06, 0.21, 0.14, 32);
    const flaskLiquidMat = new THREE.MeshPhysicalMaterial({
      color: '#f8fafc',
      transmission: 0.8,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      ior: 1.33
    });
    const flaskLiquidMesh = new THREE.Mesh(flaskLiquidGeom, flaskLiquidMat);
    flaskLiquidMesh.position.y = 0.07;
    flaskGroup.add(flaskLiquidMesh);
    flaskLiquidMeshRef.current = flaskLiquidMesh;

    // Magnetic Stir Bar (Pill shape)
    const stirBarGeom = new THREE.CapsuleGeometry(0.015, 0.06, 8, 16);
    const teflonMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 });
    const stirBar = new THREE.Mesh(stirBarGeom, teflonMat);
    stirBar.rotation.x = Math.PI / 2;
    stirBar.position.y = 0.02;
    flaskGroup.add(stirBar);
    stirBarMeshRef.current = stirBar;

    // --- 4. FALLING DROPLETS GROUP ---
    const dropletsGroup = new THREE.Group();
    dropletsGroupRef.current = dropletsGroup;
    scene.add(dropletsGroup);

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

    // Animation Loop
    let lastDropTime = performance.now();
    const dropletPool = [];

    const animate = (time) => {
      controls.update();

      // Rotate stir bar if stirring
      if (isStirringRef.current && stirBarMeshRef.current) {
        stirBarMeshRef.current.rotation.z += 0.35;
      }

      // Droplet generator
      const rate = flowRateRef.current;
      if (rate > 0) {
        const dropInterval = rate === 1 ? 1200 : rate === 2 ? 400 : 120;
        if (time - lastDropTime > dropInterval) {
          lastDropTime = time;

          // Spawn a falling droplet
          const dropGeom = new THREE.SphereGeometry(0.016, 12, 12);
          const dropMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.8 });
          const drop = new THREE.Mesh(dropGeom, dropMat);
          drop.position.set(-0.15, 0.45, 0);
          dropletsGroup.add(drop);
          dropletPool.push(drop);

          // Increment titration volume
          const deltaV = rate === 1 ? 0.05 : rate === 2 ? 0.15 : 0.45;
          setVAdded(prev => Math.min(40.0, Number((prev + deltaV).toFixed(2))));
        }
      }

      // Animate falling droplets down to flask (from y=0.45 down to y=0.22)
      for (let i = dropletPool.length - 1; i >= 0; i--) {
        const drop = dropletPool[i];
        drop.position.y -= 0.035;
        if (drop.position.y <= 0.22) {
          dropletsGroup.remove(drop);
          drop.geometry.dispose();
          drop.material.dispose();
          dropletPool.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    if (onLog) {
      onLog('Khởi tạo Thí nghiệm Chuẩn độ Axit - Bazơ 3D (HCl + NaOH -> NaCl + H2O). Bắt đầu chuẩn bị dung dịch trong buret.');
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  // Update Liquid visual parameters (Level in Burette and Color in Flask)
  useEffect(() => {
    // 1. Burette liquid height (drops from 50ml down to 0ml)
    if (buretteLiquidMeshRef.current) {
      const remainingRatio = Math.max(0.01, (50.0 - vAdded) / 50.0);
      buretteLiquidMeshRef.current.scale.y = remainingRatio;
      buretteLiquidMeshRef.current.position.y = 0.6 + (1.5 * remainingRatio) / 2;
    }

    // 2. Flask liquid color based on pH
    if (flaskLiquidMeshRef.current) {
      const col = indicatorInfo.hex;
      flaskLiquidMeshRef.current.material.color.set(col);
      flaskLiquidMeshRef.current.material.opacity = indicatorInfo.opacity;
    }
  }, [vAdded, indicator]);

  // Log equivalence point transition
  useEffect(() => {
    if (Math.abs(vAdded - 20.0) <= 0.1 && onLog) {
      onLog(`🎯 ĐẠT ĐIỂM TƯƠNG ĐƯƠNG! V_NaOH = ${vAdded.toFixed(2)} ml, pH = 7.00. Phản ứng trung hòa hoàn toàn: H+ + OH- -> H2O. Dung dịch chuyển sang màu hồng nhạt bền vững!`);
    }
  }, [vAdded]);

  const handleReset = () => {
    setVAdded(0.0);
    setFlowRate(0);
    if (onLog) {
      onLog('🔄 Tái nạp đầy Buret bằng dung dịch NaOH 0.1M và đổ mới 20ml HCl trong bình nón.');
    }
  };

  const handleAddExactDrop = () => {
    setVAdded(prev => Math.min(40.0, Number((prev + 0.05).toFixed(2))));
    if (onLog) {
      onLog('💧 Nhỏ thêm đúng 1 giọt NaOH (0.05 ml) từ đầu buret.');
    }
  };

  const handleAddHalfDrop = () => {
    setVAdded(prev => Math.min(40.0, Number((prev + 0.025).toFixed(3))));
    if (onLog) {
      onLog('💧 Thao tác chuẩn độ chính xác: Lấy nửa giọt NaOH (0.025 ml) chạm thành bình tam giác!');
    }
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
            background: 'linear-gradient(135deg, #059669, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)'
          }}>
            🧪
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.5px' }}>
              THÍ NGHIỆM CHUẨN ĐỘ AXIT - BAZƠ 3D (ACID-BASE TITRATION)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Chuẩn độ 20.00 ml HCl 0.1M bằng NaOH 0.1M với Buret thủy tinh & Máy khuấy từ 3D
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleAddHalfDrop}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #f472b6',
              background: 'rgba(244, 114, 182, 0.15)',
              color: '#f472b6',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            💧 Nửa giọt (0.025 ml)
          </button>

          <button
            onClick={handleAddExactDrop}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #38bdf8',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            💧 1 Giọt (0.05 ml)
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
            🔄 Tái lập
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

      {/* Main 3D Viewport */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* Floating Burette Stopcock Flow Controller Bar */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '20px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6)',
          zIndex: 10
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8' }}>
            🚰 Khóa vặn Buret:
          </span>
          {[
            { id: 0, label: 'Đóng (0)', color: '#ef4444' },
            { id: 1, label: 'Nhỏ giọt (1 g/s)', color: '#f59e0b' },
            { id: 2, label: 'Chảy chậm', color: '#10b981' },
            { id: 3, label: 'Chảy nhanh', color: '#0284c7' }
          ].map(flow => (
            <button
              key={flow.id}
              onClick={() => setFlowRate(flow.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: 'none',
                background: flowRate === flow.id ? flow.color : 'rgba(30, 41, 59, 0.8)',
                color: flowRate === flow.id ? '#fff' : '#cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {flow.label}
            </button>
          ))}

          <div style={{ width: '1px', height: '24px', background: '#334155', margin: '0 4px' }} />

          <button
            onClick={() => setIsStirring(!isStirring)}
            style={{
              padding: '6px 12px',
              borderRadius: '10px',
              border: '1px solid #334155',
              background: isStirring ? '#059669' : '#334155',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {isStirring ? '🌪 Máy khuấy: BẬT' : '🌪 Máy khuấy: TẮT'}
          </button>
        </div>

        {/* Left Side: Real-time Titration Curve & Readout Data Panel */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '340px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          zIndex: 10
        }}>
          {/* Digital Sensor Readout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>THỂ TÍCH V (NaOH)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
                {vAdded.toFixed(2)} <span style={{ fontSize: '0.85rem' }}>ml</span>
              </div>
            </div>

            <div style={{
              background: currentPH >= 7.0 ? 'rgba(236, 72, 153, 0.15)' : 'rgba(30, 41, 59, 0.8)',
              padding: '10px',
              borderRadius: '12px',
              border: currentPH >= 7.0 ? '1px solid #ec4899' : '1px solid #334155'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>ĐỘ PH DUNG DỊCH</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: currentPH >= 7.0 ? '#f472b6' : '#f59e0b', marginTop: '2px' }}>
                {currentPH.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Indicator State */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            padding: '10px 12px',
            borderRadius: '10px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>CHỈ THỊ MÀU</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {indicatorInfo.name}
              </div>
            </div>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: indicatorInfo.hex,
              border: '2px solid #ffffff',
              boxShadow: `0 0 12px ${indicatorInfo.hex}`
            }} />
          </div>

          {/* Real-time 2D pH Titration Curve Canvas */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
              ĐƯỜNG CONG CHUẨN ĐỘ PH (TITRATION CURVE)
            </div>
            <svg width="100%" height="130" viewBox="0 0 300 130" style={{ background: '#0b1329', borderRadius: '10px' }}>
              {/* Axes */}
              <line x1="30" y1="10" x2="30" y2="115" stroke="#475569" strokeWidth="1.5" />
              <line x1="30" y1="115" x2="290" y2="115" stroke="#475569" strokeWidth="1.5" />

              {/* Equivalence line at V = 20ml (x = 30 + (20/40)*250 = 155) */}
              <line x1="155" y1="10" x2="155" y2="115" stroke="#0ea5e9" strokeDasharray="3 3" strokeWidth="1" />
              {/* pH = 7 horizontal line (y = 115 - (7/14)*100 = 65) */}
              <line x1="30" y1="65" x2="290" y2="65" stroke="#ec4899" strokeDasharray="3 3" strokeWidth="1" />

              {/* Axis labels */}
              <text x="5" y="68" fill="#94a3b8" fontSize="10">pH 7</text>
              <text x="145" y="126" fill="#0ea5e9" fontSize="10" fontWeight="bold">20ml</text>

              {/* Theoretical Titration S-Curve Path */}
              {(() => {
                let d = '';
                for (let v = 0; v <= 40; v += 0.5) {
                  const ph = calculateTitrationPH(v);
                  const px = 30 + (v / 40) * 250;
                  const py = 115 - (ph / 14) * 100;
                  d += (v === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
                }
                return <path d={d} fill="none" stroke="#60a5fa" strokeWidth="2.5" />;
              })()}

              {/* Current Titration Position Dot */}
              {(() => {
                const px = 30 + (vAdded / 40) * 250;
                const py = 115 - (currentPH / 14) * 100;
                return (
                  <>
                    <circle cx={px} cy={py} r="5" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
                    <circle cx={px} cy={py} r="10" fill="none" stroke="#f43f5e" opacity="0.6">
                      <animate attributeName="r" values="5;14" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  </>
                );
              })()}
            </svg>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>
            💡 <strong>Bước nhảy pH:</strong> Tại lân cận điểm tương đương (19.98 - 20.02 ml), chỉ cần thêm 1 giọt NaOH nồng độ pH đã vọt từ 3.5 lên 10.5 làm chỉ thị phenolphthalein đổi màu tức thì.
          </div>
        </div>
      </div>
    </div>
  );
}
