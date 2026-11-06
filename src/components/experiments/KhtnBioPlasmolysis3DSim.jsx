import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function KhtnBioPlasmolysis3DSim({ onLog, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const [solType, setSolType] = useState('hypertonic'); // 'hypertonic', 'hypotonic', 'isotonic'
  const [plasmolysisProgress, setPlasmolysisProgress] = useState(0.0); // 0.0 (full turgor) to 1.0 (fully plasmolyzed)
  const [showWaterFlow, setShowWaterFlow] = useState(true);
  const [showCutaway, setShowCutaway] = useState(false);
  const [cellType, setCellType] = useState('le_ban'); // 'le_ban' (purple) or 'onion' (green/clear)

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const vacuoleMeshRef = useRef(null);
  const protoplastGroupRef = useRef(null);
  const waterParticlesRef = useRef(null);

  const targetProgressRef = useRef(0.0);
  const currentProgressRef = useRef(0.0);
  const solTypeRef = useRef(solType);
  solTypeRef.current = solType;

  // Set target progress based on solution
  useEffect(() => {
    if (solType === 'hypertonic') {
      targetProgressRef.current = 1.0; // Co nguyên sinh
      if (onLog) {
        onLog('🧪 Nhỏ dung dịch NaCl 10% (môi trường ưu trương, nồng độ chất tan ngoài > trong tế bào). Nước thẩm thấu từ không bào thoát ra ngoài, màng sinh chất tách khỏi thành tế bào (Hiện tượng Co Nguyên Sinh)!');
      }
    } else if (solType === 'hypotonic') {
      targetProgressRef.current = 0.0; // Dãn nguyên sinh
      if (onLog) {
        onLog('💧 Nhỏ Nước Cất (môi trường nhược trương, thế nước bên ngoài cao hơn bên trong tế bào). Nước ồ ạt thẩm thấu vào không bào, tế bào hút nước trương to trở lại (Hiện tượng Dãn / Phản Co Nguyên Sinh)!');
      }
    } else {
      targetProgressRef.current = 0.35; // Đẳng trương
      if (onLog) {
        onLog('⚖️ Chuyển sang Dung dịch Đẳng trương (Thế nước cân bằng hai bên màng tế bào). Lượng nước đi vào và đi ra bằng nhau, áp suất trương nước ổn định.');
      }
    }
  }, [solType]);

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
    camera.position.set(2.8, 2.2, 3.8);

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
    controls.minDistance = 1.2;
    controls.maxDistance = 10.0;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(5, 8, 6);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.7);
    dirLight2.position.set(-6, -3, -4);
    scene.add(dirLight2);

    // --- 1. RIGID CELL WALL (THÀNH TẾ BÀO XENLULOZO) ---
    // Hexagonal box representing plant cell wall
    const wallGeom = new THREE.CylinderGeometry(1.4, 1.4, 1.6, 6, 1, false);
    const wallMat = new THREE.MeshPhysicalMaterial({
      color: 0x15803d,
      roughness: 0.35,
      metalness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const cellWall = new THREE.Mesh(wallGeom, wallMat);
    scene.add(cellWall);

    // Outer wireframe edge lines for cellulose fibrils
    const wallEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(wallGeom),
      new THREE.LineBasicMaterial({ color: 0x4ade80, linewidth: 2 })
    );
    cellWall.add(wallEdges);

    // --- 2. PROTOPLAST GROUP (KHỐI SINH CHẤT & MÀNG CO GIÃN) ---
    const protoplastGroup = new THREE.Group();
    protoplastGroupRef.current = protoplastGroup;
    scene.add(protoplastGroup);

    // Plasma Membrane (Màng sinh chất)
    const membraneGeom = new THREE.CylinderGeometry(1.36, 1.36, 1.54, 6, 1, false);
    const membraneMat = new THREE.MeshPhysicalMaterial({
      color: 0x86efac,
      roughness: 0.25,
      transmission: 0.65,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    const plasmaMembrane = new THREE.Mesh(membraneGeom, membraneMat);
    protoplastGroup.add(plasmaMembrane);

    // Central Vacuole (Không bào trung tâm lớn chứa anthocyanin màu tím hoặc dịch trong)
    const vacuoleGeom = new THREE.SphereGeometry(1.0, 32, 24);
    vacuoleGeom.scale(1.15, 0.75, 1.15);
    const vacuoleMat = new THREE.MeshPhysicalMaterial({
      color: cellType === 'le_ban' ? 0x9333ea : 0x0ea5e9,
      emissive: cellType === 'le_ban' ? 0x581c87 : 0x0369a1,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      transmission: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const vacuoleMesh = new THREE.Mesh(vacuoleGeom, vacuoleMat);
    vacuoleMesh.position.set(0, 0, 0);
    protoplastGroup.add(vacuoleMesh);
    vacuoleMeshRef.current = vacuoleMesh;

    // Nucleus (Nhân tế bào 3D với hạch nhân)
    const nucleusGroup = new THREE.Group();
    nucleusGroup.position.set(0.65, 0.35, 0.35);
    protoplastGroup.add(nucleusGroup);

    const nucleusGeom = new THREE.SphereGeometry(0.24, 24, 24);
    const nucleusMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const nucleusMesh = new THREE.Mesh(nucleusGeom, nucleusMat);
    nucleusGroup.add(nucleusMesh);

    const nucleolusGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const nucleolusMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
    const nucleolusMesh = new THREE.Mesh(nucleolusGeom, nucleolusMat);
    nucleolusMesh.position.set(0.05, 0.05, 0.05);
    nucleusGroup.add(nucleolusMesh);

    // Chloroplasts (12 lục lạp màu xanh lục lơ lửng)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 0.95;
      const cpGeom = new THREE.CapsuleGeometry(0.08, 0.16, 8, 16);
      const cpMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 });
      const cp = new THREE.Mesh(cpGeom, cpMat);
      cp.position.set(radius * Math.cos(angle), (Math.random() - 0.5) * 0.8, radius * Math.sin(angle));
      cp.rotation.set(Math.random(), Math.random(), Math.random());
      protoplastGroup.add(cp);
    }

    // --- 3. WATER FLOW DYNAMIC PARTICLES (HẠT NƯỚC THẨM THẤU) ---
    const particleCount = 200;
    const particlesGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.8 + Math.random() * 0.9;
      const y = (Math.random() - 0.5) * 1.4;
      positions[i * 3] = r * Math.cos(theta);
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = r * Math.sin(theta);
      velocities.push({ r, theta, y, speed: 0.008 + Math.random() * 0.012 });
    }
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.065,
      transparent: true,
      opacity: 0.8
    });
    const waterParticles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(waterParticles);
    waterParticlesRef.current = { mesh: waterParticles, velocities };

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
    const animate = () => {
      controls.update();

      // Smooth interpolation of plasmolysis progress
      const target = targetProgressRef.current;
      currentProgressRef.current += (target - currentProgressRef.current) * 0.035;
      const p = currentProgressRef.current;
      setPlasmolysisProgress(p);

      // Scale protoplast and vacuole based on plasmolysis progress
      // p = 0: scale = 1.0 (trương to ép sát vách)
      // p = 1: scale = 0.52 (co nguyên sinh lồi/lõm mạnh mẽ)
      const shrinkFactor = 1.0 - p * 0.48;
      if (protoplastGroupRef.current) {
        protoplastGroupRef.current.scale.set(shrinkFactor, shrinkFactor, shrinkFactor);
      }
      if (vacuoleMeshRef.current) {
        // Vacuole color intensifies as water leaves (anthocyanin concentration increases)
        vacuoleMeshRef.current.material.opacity = 0.55 + p * 0.4;
      }

      // Animate water flow particles
      if (waterParticlesRef.current && showWaterFlow) {
        const pts = waterParticlesRef.current.mesh.geometry.attributes.position.array;
        const vels = waterParticlesRef.current.velocities;
        const isOutward = solTypeRef.current === 'hypertonic';

        for (let i = 0; i < vels.length; i++) {
          const v = vels[i];
          if (isOutward) {
            // Water flows OUTWARDS (from r=0.7 to r=1.8)
            v.r += v.speed;
            if (v.r > 1.8) v.r = 0.7;
          } else {
            // Water flows INWARDS (from r=1.8 to r=0.7)
            v.r -= v.speed;
            if (v.r < 0.7) v.r = 1.8;
          }
          pts[i * 3] = v.r * Math.cos(v.theta);
          pts[i * 3 + 2] = v.r * Math.sin(v.theta);
        }
        waterParticlesRef.current.mesh.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    if (onLog) {
      onLog('Khởi tạo Mô hình 3D Tế bào Thực vật: Co & Dãn Nguyên Sinh (Màng sinh chất, Không bào Anthocyanin, Vách Xenlulozo).');
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [cellType, showWaterFlow]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#020617', color: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
      {/* Header Bar */}
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
            background: 'linear-gradient(135deg, #9333ea, #c084fc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', boxShadow: '0 0 15px rgba(192, 132, 252, 0.5)'
          }}>
            🌿
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.5px' }}>
              MÔ HÌNH 3D TẾ BÀO THỰC VẬT: CO & DÃN NGUYÊN SINH (PLASMOLYSIS)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Cơ chế thẩm thấu nước qua màng sinh chất trong môi trường ưu trương / nhược trương (Sinh học 10 & KHTN 6)
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCellType(cellType === 'le_ban' ? 'onion' : 'le_ban')}
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
            {cellType === 'le_ban' ? '🟣 Lá Lẻ Bạn (Tím)' : '🟢 Vảy Hành (Lục)'}
          </button>

          <button
            onClick={() => setShowWaterFlow(!showWaterFlow)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #0284c7',
              background: showWaterFlow ? '#0284c7' : 'transparent',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            💧 Dòng hạt H₂O: {showWaterFlow ? 'BẬT' : 'TẮT'}
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

        {/* Bottom Solution Injector Controller Bar */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(192, 132, 252, 0.35)',
          borderRadius: '24px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6)',
          zIndex: 10
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8' }}>
            🧪 Chọn môi trường thẩm thấu:
          </span>

          <button
            onClick={() => setSolType('hypertonic')}
            style={{
              padding: '8px 16px',
              borderRadius: '14px',
              border: 'none',
              background: solType === 'hypertonic' ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'rgba(30, 41, 59, 0.8)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: solType === 'hypertonic' ? '0 0 16px rgba(147, 51, 234, 0.6)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            🟣 Nhỏ NaCl 10% (Co nguyên sinh)
          </button>

          <button
            onClick={() => setSolType('hypotonic')}
            style={{
              padding: '8px 16px',
              borderRadius: '14px',
              border: 'none',
              background: solType === 'hypotonic' ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(30, 41, 59, 0.8)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: solType === 'hypotonic' ? '0 0 16px rgba(16, 185, 129, 0.6)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            💧 Nhỏ Nước cất (Dãn nguyên sinh)
          </button>

          <button
            onClick={() => setSolType('isotonic')}
            style={{
              padding: '8px 16px',
              borderRadius: '14px',
              border: 'none',
              background: solType === 'isotonic' ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'rgba(30, 41, 59, 0.8)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: solType === 'isotonic' ? '0 0 16px rgba(56, 189, 248, 0.6)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            ⚖️ Dung dịch Đẳng trương
          </button>
        </div>

        {/* Left Side: Physiological Status & Scientific Readings */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '320px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(192, 132, 252, 0.25)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          zIndex: 10
        }}>
          <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            TRẠNG THÁI SINH LÝ TẾ BÀO
          </div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc' }}>
            {solType === 'hypertonic' ? 'Co Nguyên Sinh (Plasmolyzed)' : solType === 'hypotonic' ? 'Trương Nước Tối Đa (Turgid)' : 'Trạng Thái Cân Bằng (Equilibrium)'}
          </h3>

          {/* Biological Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>THỂ TÍCH KHÔNG BÀO</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
                {(100 - plasmolysisProgress * 55).toFixed(0)}%
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>ÁP SUẤT TRƯƠNG (P)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: solType === 'hypertonic' ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                {solType === 'hypertonic' ? '0.0 atm' : solType === 'hypotonic' ? '12.5 atm' : '5.2 atm'}
              </div>
            </div>
          </div>

          {/* Anatomical Structure Legend */}
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.45', background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
            <div style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>Cấu trúc quan sát 3D:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#22c55e' }} />
              <span><strong>Thành tế bào:</strong> Xenlulozo cứng, giữ nguyên hình dạng.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#86efac' }} />
              <span><strong>Màng sinh chất:</strong> Màng bán thấm mềm, co lại khi mất nước.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7' }} />
              <span><strong>Không bào trung tâm:</strong> Chứa dịch tế bào & sắc tố anthocyanin.</span>
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: '1.4' }}>
            📌 <strong>Giải thích cơ chế:</strong> Trong dung dịch NaCl 10%, nồng độ chất tan ngoài cao làm thế nước bên ngoài thấp hơn bên trong tế bào. Nước di chuyển theo chiều gradien nồng độ ra ngoài làm chất nguyên sinh co lại.
          </div>
        </div>
      </div>
    </div>
  );
}
