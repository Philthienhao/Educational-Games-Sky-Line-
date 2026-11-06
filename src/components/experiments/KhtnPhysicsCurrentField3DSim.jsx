import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function KhtnPhysicsCurrentField3DSim({ onLog, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const [conductorType, setConductorType] = useState('straight'); // 'straight', 'loop', 'solenoid'
  const [currentI, setCurrentI] = useState(5.0); // Amperes (0 to 10)
  const [reversed, setReversed] = useState(false);
  const [showNeedles, setShowNeedles] = useState(true);
  const [showFieldLines, setShowFieldLines] = useState(true);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const conductorGroupRef = useRef(null);
  const fieldLinesGroupRef = useRef(null);
  const needlesGroupRef = useRef(null);
  const electronParticlesRef = useRef(null);

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
    camera.position.set(2.8, 2.5, 3.8);

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
    controls.maxDistance = 12.0;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Platform Plate (Tấm bìa thí nghiệm nằm ngang)
    const plateGeom = new THREE.BoxGeometry(3.2, 0.04, 3.2);
    const plateMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6, metalness: 0.2 });
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.position.y = 0;
    plate.receiveShadow = true;
    scene.add(plate);

    // Grid on plate
    const grid = new THREE.GridHelper(3.0, 16, 0x0ea5e9, 0x334155);
    grid.position.y = 0.021;
    scene.add(grid);

    // Sub-groups
    const conductorGroup = new THREE.Group();
    conductorGroupRef.current = conductorGroup;
    scene.add(conductorGroup);

    const fieldLinesGroup = new THREE.Group();
    fieldLinesGroupRef.current = fieldLinesGroup;
    scene.add(fieldLinesGroup);

    const needlesGroup = new THREE.Group();
    needlesGroupRef.current = needlesGroup;
    scene.add(needlesGroup);

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

      // Electron flow animation
      if (electronParticlesRef.current && currentI > 0) {
        const pts = electronParticlesRef.current.geometry.attributes.position.array;
        const dirSign = reversed ? -1 : 1;
        for (let i = 0; i < pts.length / 3; i++) {
          pts[i * 3 + 1] += dirSign * 0.015 * (currentI / 5.0);
          if (pts[i * 3 + 1] > 1.2) pts[i * 3 + 1] = -1.2;
          if (pts[i * 3 + 1] < -1.2) pts[i * 3 + 1] = 1.2;
        }
        electronParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    if (onLog) {
      onLog('Khởi tạo Mô hình 3D Từ Trường của Dòng Điện (Quy tắc nắm tay phải & Ma trận kim nam châm).');
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  // Re-build Conductor, Field Lines, and Magnetic Needles
  useEffect(() => {
    if (!conductorGroupRef.current || !fieldLinesGroupRef.current || !needlesGroupRef.current) return;
    const condGroup = conductorGroupRef.current;
    const fieldGroup = fieldLinesGroupRef.current;
    const needlesGroup = needlesGroupRef.current;

    // Clear previous
    [condGroup, fieldGroup, needlesGroup].forEach(grp => {
      while (grp.children.length > 0) {
        const obj = grp.children[0];
        grp.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      }
    });

    const copperMat = new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.3, metalness: 0.8 });
    const currentDirectionSign = reversed ? -1 : 1;

    // 1. Build Conductor Geometry
    if (conductorType === 'straight') {
      // Vertical straight copper rod passing through origin (0, y, 0)
      const wireGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 24);
      const wire = new THREE.Mesh(wireGeom, copperMat);
      condGroup.add(wire);

      // Electron Flow Particles inside wire
      const pCount = 35;
      const pGeom = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 0.04;
        pPos[i * 3 + 1] = -1.2 + (i / pCount) * 2.4;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
      }
      pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.05 });
      const electrons = new THREE.Points(pGeom, pMat);
      condGroup.add(electrons);
      electronParticlesRef.current = electrons;

      // 2. Build Concentric Circular Magnetic Field Lines
      if (showFieldLines && currentI > 0) {
        const radii = [0.45, 0.75, 1.1, 1.5];
        radii.forEach(r => {
          const curveGeom = new THREE.RingGeometry(r - 0.008, r + 0.008, 48);
          const curveMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, side: THREE.DoubleSide });
          const ring = new THREE.Mesh(curveGeom, curveMat);
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 0.025;
          fieldGroup.add(ring);
        });
      }

      // 3. Build Compass Needles Matrix (3D Magnetic needles with North=Red, South=Blue)
      if (showNeedles && currentI > 0) {
        const radii = [0.6, 1.0, 1.4];
        radii.forEach(r => {
          const count = r === 0.6 ? 6 : r === 1.0 ? 8 : 12;
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = r * Math.cos(angle);
            const z = r * Math.sin(angle);

            // Needle tangent orientation: theta = angle + 90° (or -90° if reversed)
            const tangentAngle = angle + (currentDirectionSign > 0 ? Math.PI / 2 : -Math.PI / 2);

            const needleGroup = new THREE.Group();
            needleGroup.position.set(x, 0.04, z);
            needleGroup.rotation.y = -tangentAngle;

            // North half (Red pointer)
            const nGeom = new THREE.ConeGeometry(0.035, 0.12, 4);
            const nMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.3 });
            const nMesh = new THREE.Mesh(nGeom, nMat);
            nMesh.rotation.x = Math.PI / 2;
            nMesh.position.z = 0.06;
            needleGroup.add(nMesh);

            // South half (Blue pointer)
            const sGeom = new THREE.ConeGeometry(0.035, 0.12, 4);
            const sMat = new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.3 });
            const sMesh = new THREE.Mesh(sGeom, sMat);
            sMesh.rotation.x = -Math.PI / 2;
            sMesh.position.z = -0.06;
            needleGroup.add(sMesh);

            // Pivot pin
            const pinGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 8);
            const pinMat = new THREE.MeshStandardMaterial({ color: '#f8fafc' });
            const pin = new THREE.Mesh(pinGeom, pinMat);
            needleGroup.add(pin);

            needlesGroup.add(needleGroup);
          }
        });
      }
    } else if (conductorType === 'loop') {
      // Circular loop in vertical plane
      const loopGeom = new THREE.TorusGeometry(0.75, 0.035, 16, 48);
      const loop = new THREE.Mesh(loopGeom, copperMat);
      loop.rotation.y = Math.PI / 2;
      loop.position.y = 0.75;
      condGroup.add(loop);
    } else {
      // Solenoid (Cylindrical spiral coil)
      const turns = 8;
      const radius = 0.5;
      const length = 1.6;
      const curvePoints = [];
      for (let t = 0; t <= turns * Math.PI * 2; t += 0.1) {
        const x = radius * Math.cos(t);
        const y = 0.5 + radius * Math.sin(t);
        const z = -length / 2 + (t / (turns * Math.PI * 2)) * length;
        curvePoints.push(new THREE.Vector3(x, y, z));
      }
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const coilGeom = new THREE.TubeGeometry(curve, 180, 0.025, 8, false);
      const coil = new THREE.Mesh(coilGeom, copperMat);
      condGroup.add(coil);
    }
  }, [conductorType, currentI, reversed, showNeedles, showFieldLines]);

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
            🧲
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.5px' }}>
              MÔ HÌNH 3D TỪ TRƯỜNG DÒNG ĐIỆN & MA TRẬN KIM NAM CHÂM
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Quy tắc nắm tay phải, đường sức từ 3D và định hướng kim nam châm (Vật lí 11 & KHTN 9)
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#1e293b', padding: '3px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setConductorType('straight')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: conductorType === 'straight' ? '#0284c7' : 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📏 Dây Thẳng Dài
            </button>
            <button
              onClick={() => setConductorType('loop')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: conductorType === 'loop' ? '#0284c7' : 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ⭕ Vòng Dây Tròn
            </button>
            <button
              onClick={() => setConductorType('solenoid')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: conductorType === 'solenoid' ? '#0284c7' : 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🌀 Ống Dây Solenoid
            </button>
          </div>

          <button
            onClick={() => {
              setReversed(!reversed);
              if (onLog) {
                onLog(`🔄 Đảo chiều dòng điện: Chiều dòng điện đảo ngược -> Toàn bộ kim nam châm và véc-tơ cảm ứng từ B tự động quay 180° theo Quy tắc nắm bàn tay phải!`);
              }
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #f59e0b',
              background: reversed ? '#f59e0b' : 'rgba(245, 158, 11, 0.15)',
              color: reversed ? '#000' : '#f59e0b',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {reversed ? '⬇️ Dòng đi xuống' : '⬆️ Dòng đi lên'}
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

        {/* Floating Current Slider Controller */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '24px',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6)',
          zIndex: 10
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>
            ⚡ Cường độ dòng điện I:
          </span>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={currentI}
            onChange={(e) => setCurrentI(Number(e.target.value))}
            style={{ width: '160px', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f8fafc', minWidth: '40px' }}>
            {currentI}A
          </span>

          <div style={{ width: '1px', height: '22px', background: '#334155' }} />

          <button
            onClick={() => setShowNeedles(!showNeedles)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: showNeedles ? '#0284c7' : 'transparent',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🧭 Kim nam châm: {showNeedles ? 'BẬT' : 'TẮT'}
          </button>
        </div>

        {/* Left Side: Right-Hand Grip Rule Card */}
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
            QUY TẮC NẮM TAY PHẢI
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px 12px', borderRadius: '10px', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CẢM ỨNG TỪ TẠI KHOẢNG CÁCH r = 0.5m:</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
              {(2 * Math.PI * 1e-7 * (currentI / 0.5) * 1e6).toFixed(2)} <span style={{ fontSize: '0.8rem' }}>µT</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.45', background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '10px' }}>
            <div style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>Quy tắc bàn tay phải 1:</div>
            <div>
              • <strong>Ngón tay cái:</strong> Choãi ra chỉ theo chiều dòng điện I.
            </div>
            <div style={{ marginTop: '2px' }}>
              • <strong>Bốn ngón tay khum lại:</strong> Chỉ chiều của đường sức từ (chiều xoay của cực Bắc kim nam châm màu đỏ).
            </div>
            <div style={{ marginTop: '2px' }}>
              • <strong>Đường sức từ:</strong> Là những đường tròn đồng tâm nằm trong mặt phẳng vuông góc với dòng điện.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
