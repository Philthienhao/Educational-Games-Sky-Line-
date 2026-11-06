import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function KhtnPhysicsOptics3DSim({ onLog, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const [opticsMode, setOpticsMode] = useState('semicircle'); // 'semicircle' or 'prism'
  const [incidentAngle, setIncidentAngle] = useState(45); // degrees
  const [lightSource, setLightSource] = useState('red_laser'); // 'red_laser', 'green_laser', 'white_light'
  const [mediumN, setMediumN] = useState(1.50); // refractive index n2 (Glass = 1.50, Water = 1.33, Diamond = 2.42)
  const [reverseRay, setReverseRay] = useState(false); // false: Air -> Medium, true: Medium -> Air (for total internal reflection)

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const raysGroupRef = useRef(null);
  const opticalBlockGroupRef = useRef(null);

  // Snell's Law and Critical Angle
  const n1 = reverseRay ? mediumN : 1.0;
  const n2 = reverseRay ? 1.0 : mediumN;
  const radI = (incidentAngle * Math.PI) / 180;
  const sinR = (n1 / n2) * Math.sin(radI);
  const isTIR = sinR > 1.0; // Total Internal Reflection
  const radR = isTIR ? 0 : Math.asin(sinR);
  const angleR = isTIR ? null : Math.round((radR * 180) / Math.PI);
  const criticalAngle = n1 > n2 ? Math.round((Math.asin(n2 / n1) * 180) / Math.PI) : null;

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
    camera.position.set(0, 3.8, 3.2);

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
    controls.minDistance = 1.2;
    controls.maxDistance = 12.0;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    // --- 1. OPTICAL DIAL TABLE & CIRCULAR PROTRACTOR ---
    const dialGeom = new THREE.CylinderGeometry(2.0, 2.0, 0.04, 64);
    const dialMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.6, metalness: 0.2 });
    const dial = new THREE.Mesh(dialGeom, dialMat);
    dial.position.y = -0.02;
    scene.add(dial);

    // Circular Protractor Degrees Ring & Axes
    const ringGeom = new THREE.RingGeometry(1.7, 1.72, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(ring);

    // Normal Axis (Pháp tuyến NN')
    const normalGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.003, -1.8),
      new THREE.Vector3(0, 0.003, 1.8)
    ]);
    const normalLine = new THREE.Line(normalGeom, new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.08, gapSize: 0.05 }));
    normalLine.computeLineDistances();
    scene.add(normalLine);

    // Surface Boundary Line (Mặt phân cách)
    const boundaryGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.8, 0.003, 0),
      new THREE.Vector3(1.8, 0.003, 0)
    ]);
    const boundaryLine = new THREE.Line(boundaryGeom, new THREE.LineBasicMaterial({ color: 0x0ea5e9, linewidth: 2 }));
    scene.add(boundaryLine);

    // Optical Block Root Group
    const opticalBlockGroup = new THREE.Group();
    opticalBlockGroupRef.current = opticalBlockGroup;
    scene.add(opticalBlockGroup);

    // Rays Group
    const raysGroup = new THREE.Group();
    raysGroupRef.current = raysGroup;
    scene.add(raysGroup);

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
      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    if (onLog) {
      onLog('Khởi tạo Phòng Thí Nghiệm Quang Học 3D (Định luật Snell: Khúc xạ, Phản xạ Toàn phần & Tán sắc Ánh sáng).');
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  // Update Optical Block & Laser Rays Geometry
  useEffect(() => {
    if (!opticalBlockGroupRef.current || !raysGroupRef.current) return;
    const blockGroup = opticalBlockGroupRef.current;
    const raysGroup = raysGroupRef.current;

    // Clear previous children
    while (blockGroup.children.length > 0) {
      const obj = blockGroup.children[0];
      blockGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }
    while (raysGroup.children.length > 0) {
      const obj = raysGroup.children[0];
      raysGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.9,
      transparent: true,
      opacity: 0.7,
      roughness: 0.05,
      ior: mediumN,
      thickness: 0.5,
      side: THREE.DoubleSide
    });

    // 1. Build Optical Block
    if (opticsMode === 'semicircle') {
      // Semicircular glass prism: radius = 1.0, height = 0.25
      const semiGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.25, 48, 1, false, 0, Math.PI);
      const semiMesh = new THREE.Mesh(semiGeom, glassMat);
      semiMesh.position.set(0, 0.125, 0);
      blockGroup.add(semiMesh);
    } else {
      // Triangular Prism
      const prismGeom = new THREE.CylinderGeometry(0.9, 0.9, 0.35, 3, 1, false);
      const prismMesh = new THREE.Mesh(prismGeom, glassMat);
      prismMesh.position.set(0, 0.175, 0);
      blockGroup.add(prismMesh);
    }

    // 2. Build Laser Beams
    const laserColorHex = lightSource === 'green_laser' ? 0x22c55e : lightSource === 'white_light' ? 0xffffff : 0xef4444;
    const laserRayMat = new THREE.LineBasicMaterial({ color: laserColorHex, linewidth: 3 });

    // Incident Ray (Tia tới SI)
    const rayLength = 1.6;
    const sign = reverseRay ? 1 : -1;
    const startX = -rayLength * Math.sin(radI);
    const startZ = sign * rayLength * Math.cos(radI);

    const incGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(startX, 0.12, startZ),
      new THREE.Vector3(0, 0.12, 0)
    ]);
    const incLine = new THREE.Line(incGeom, laserRayMat);
    raysGroup.add(incLine);

    // Laser Emitter Box at Start
    const emitterGeom = new THREE.BoxGeometry(0.18, 0.1, 0.28);
    const emitterMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.6 });
    const emitter = new THREE.Mesh(emitterGeom, emitterMat);
    emitter.position.set(startX, 0.12, startZ);
    emitter.lookAt(0, 0.12, 0);
    raysGroup.add(emitter);

    // Reflected Ray (Tia phản xạ IR - luôn có một phần phản xạ)
    const refZ = -sign * rayLength * Math.cos(radI);
    const refX = rayLength * Math.sin(radI);
    const refGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.12, 0),
      new THREE.Vector3(refX, 0.12, refZ)
    ]);
    const refLine = new THREE.Line(refGeom, new THREE.LineBasicMaterial({
      color: laserColorHex,
      transparent: true,
      opacity: isTIR ? 1.0 : 0.35,
      linewidth: isTIR ? 3 : 1.5
    }));
    raysGroup.add(refLine);

    // Refracted Ray (Tia khúc xạ IK) - biến mất nếu phản xạ toàn phần
    if (!isTIR && lightSource !== 'white_light') {
      const refrZ = -sign * rayLength * Math.cos(radR);
      const refrX = rayLength * Math.sin(radR);
      const refrGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.12, 0),
        new THREE.Vector3(refrX, 0.12, refrZ)
      ]);
      const refrLine = new THREE.Line(refrGeom, new THREE.LineBasicMaterial({ color: laserColorHex, linewidth: 2.5 }));
      raysGroup.add(refrLine);
    } else if (lightSource === 'white_light' && !isTIR) {
      // Prism White Light Dispersion (Cầu vồng 7 màu)
      const rainbowColors = [
        { name: 'Đỏ', hex: 0xef4444, nOff: 0.00 },
        { name: 'Cam', hex: 0xf97316, nOff: 0.01 },
        { name: 'Vàng', hex: 0xeab308, nOff: 0.02 },
        { name: 'Lục', hex: 0x22c55e, nOff: 0.03 },
        { name: 'Lam', hex: 0x06b6d4, nOff: 0.04 },
        { name: 'Chàm', hex: 0x3b82f6, nOff: 0.05 },
        { name: 'Tím', hex: 0x8b5cf6, nOff: 0.06 }
      ];

      rainbowColors.forEach(item => {
        const effN2 = n2 + item.nOff;
        const colSinR = (n1 / effN2) * Math.sin(radI);
        if (colSinR <= 1.0) {
          const colRadR = Math.asin(colSinR);
          const colX = rayLength * Math.sin(colRadR);
          const colZ = -sign * rayLength * Math.cos(colRadR);
          const colGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.12, 0),
            new THREE.Vector3(colX, 0.12, colZ)
          ]);
          const colLine = new THREE.Line(colGeom, new THREE.LineBasicMaterial({ color: item.hex, linewidth: 2 }));
          raysGroup.add(colLine);
        }
      });
    }
  }, [opticsMode, incidentAngle, lightSource, mediumN, reverseRay, isTIR, radI, radR, n1, n2]);

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
            background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)'
          }}>
            🔦
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.5px' }}>
              MÔ HÌNH QUANG HỌC 3D: KHÚC XẠ, PHẢN XẠ TOÀN PHẦN & TÁN SẮC (SNELL'S LAW)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Bàn thí nghiệm quang học 3D chuẩn SGK Vật lí 11 & KHTN 9 (Khối bán trụ & Lăng kính tán sắc)
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#1e293b', padding: '3px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setOpticsMode('semicircle')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: opticsMode === 'semicircle' ? '#0284c7' : 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🌓 Bán Trụ Thủy Tinh
            </button>
            <button
              onClick={() => setOpticsMode('prism')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: opticsMode === 'prism' ? '#0284c7' : 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔺 Lăng Kính Tam Giác
            </button>
          </div>

          <button
            onClick={() => setReverseRay(!reverseRay)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #f59e0b',
              background: reverseRay ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
              color: reverseRay ? '#000' : '#f59e0b',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {reverseRay ? '🔄 Chiếu từ Thủy tinh -> KK' : '🔄 Chiếu từ KK -> Thủy tinh'}
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

        {/* Floating Incident Angle Slider Controller */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '24px',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6)',
          zIndex: 10
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fca5a5' }}>
            🎯 Góc tới i:
          </span>
          <input
            type="range"
            min="0"
            max="85"
            value={incidentAngle}
            onChange={(e) => setIncidentAngle(Number(e.target.value))}
            style={{ width: '180px', accentColor: '#ef4444', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f8fafc', minWidth: '40px' }}>
            {incidentAngle}°
          </span>

          <div style={{ width: '1px', height: '24px', background: '#334155', margin: '0 4px' }} />

          {/* Laser Color Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'red_laser', label: '🔴 Đỏ', col: '#ef4444' },
              { id: 'green_laser', label: '🟢 Lục', col: '#22c55e' },
              { id: 'white_light', label: '🌈 Trắng (Tán sắc)', col: '#ffffff' }
            ].map(src => (
              <button
                key={src.id}
                onClick={() => setLightSource(src.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: lightSource === src.id ? src.col : 'rgba(30, 41, 59, 0.8)',
                  color: lightSource === src.id && src.id === 'white_light' ? '#000' : '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {src.label}
              </button>
            ))}
          </div>
        </div>

        {/* Left Side: Optical Calculations & Formula Card */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '320px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(14px)',
          border: isTIR ? '1px solid #ef4444' : '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ĐỊNH LUẬT SNELL
            </span>
            {isTIR && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 900
              }}>
                ⚡ PHẢN XẠ TOÀN PHẦN
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>GÓC TỚI (i)</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ef4444', marginTop: '2px' }}>
                {incidentAngle}°
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>GÓC KHÚC XẠ (r)</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: isTIR ? '#ef4444' : '#38bdf8', marginTop: '2px' }}>
                {isTIR ? 'Triệt tiêu' : `${angleR}°`}
              </div>
            </div>
          </div>

          {/* Medium Info */}
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Môi trường tới (n₁):</span>
              <strong style={{ color: '#f8fafc' }}>{n1.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Môi trường khúc xạ (n₂):</span>
              <strong style={{ color: '#f8fafc' }}>{n2.toFixed(2)}</strong>
            </div>
            {criticalAngle !== null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#f59e0b', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Góc giới hạn i_gh:</span>
                <strong>{criticalAngle}°</strong>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
            {isTIR ? (
              <span style={{ color: '#fca5a5' }}>
                ⚠️ <strong>Hiện tượng phản xạ toàn phần:</strong> Khi chiếu từ môi trường chiết quang hơn sang kém hơn với góc tới i ≥ i_gh ({criticalAngle}°), toàn bộ tia sáng phản xạ trở lại, không có tia khúc xạ lọt ra ngoài!
              </span>
            ) : (
              <span>
                💡 <strong>Định luật:</strong> n₁ · sin(i) = n₂ · sin(r). Khi ánh sáng truyền từ không khí vào khối thủy tinh (n = {mediumN}), góc khúc xạ r luôn nhỏ hơn góc tới i.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
