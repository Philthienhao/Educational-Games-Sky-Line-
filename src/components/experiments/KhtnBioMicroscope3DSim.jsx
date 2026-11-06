import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const SPECIMENS_DATA = {
  onion_skin: {
    name: 'Tế bào biểu bì vảy Hành tây',
    reagent: 'Nhuộm dung dịch Lugol (Iốt)',
    shape: 'Hình nhiều cạnh xếp sát nhau như tường gạch',
    structures: ['Vách tế bào xenlulozo dày', 'Màng sinh chất', 'Nhân tế bào bắt màu nâu đậm', 'Không bào trung tâm lớn'],
    bg: '#451a03',
    cellColor: 'rgba(251, 191, 36, 0.25)',
    borderColor: '#d97706',
    nucleusColor: '#92400e'
  },
  cheek_cells: {
    name: 'Tế bào niêm mạc miệng người',
    reagent: 'Nhuộm Xanh Metylen (Methylene Blue)',
    shape: 'Hình dẹp đa giác không đều, rời rạc',
    structures: ['Màng sinh chất mỏng (không có thành tế bào)', 'Tế bào chất hạt mịn', 'Nhân tế bào tròn bắt màu xanh đậm'],
    bg: '#0f172a',
    cellColor: 'rgba(56, 189, 248, 0.22)',
    borderColor: '#38bdf8',
    nucleusColor: '#1d4ed8'
  },
  blood_cells: {
    name: 'Tế bào máu người (Hồng cầu & Bạch cầu)',
    reagent: 'Tiêu bản nhuộm Giemsa',
    shape: 'Hồng cầu hình đĩa lõm hai mặt không nhân, bạch cầu lớn có nhân chia múi',
    structures: ['Hồng cầu (chiếm đa số, màu hồng nhạt)', 'Bạch cầu đa nhân (nhân tím đậm)', 'Tiểu cầu nhỏ li ti'],
    bg: '#1c1917',
    cellColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#ef4444',
    nucleusColor: '#7e22ce'
  }
};

export function KhtnBioMicroscope3DSim({ onLog, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const [viewMode, setViewMode] = useState('eyepiece'); // 'eyepiece' or 'hardware3d'
  const [specimenKey, setSpecimenKey] = useState('onion_skin');
  const [objectiveMag, setObjectiveMag] = useState(40); // 10, 40, 100
  const [focusOffset, setFocusOffset] = useState(0); // 0 is sharp, -5 to +5 is blur
  const [lightIntensity, setLightIntensity] = useState(85);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const currentSpecimen = SPECIMENS_DATA[specimenKey];
  const totalMag = objectiveMag * 10; // eyepiece is 10x

  // Initialize 3D Hardware Microscope Scene
  useEffect(() => {
    if (viewMode !== 'hardware3d') return;

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
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.0;
    controls.maxDistance = 8.0;
    controls.target.set(0, 0.8, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Bench Surface
    const bench = new THREE.GridHelper(3.5, 14, 0x0ea5e9, 0x1e293b);
    bench.position.y = -0.01;
    scene.add(bench);

    // --- 3D MICROSCOPE ANATOMY ---
    const metalMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4, metalness: 0.7 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.15, metalness: 0.95 });

    // 1. Heavy Base
    const baseGeom = new THREE.BoxGeometry(0.75, 0.1, 0.9);
    const baseMesh = new THREE.Mesh(baseGeom, metalMat);
    baseMesh.position.set(0, 0.05, 0);
    scene.add(baseMesh);

    // 2. Curved Arm (Thân kính)
    const armGeom = new THREE.CylinderGeometry(0.06, 0.08, 1.4, 16);
    const armMesh = new THREE.Mesh(armGeom, metalMat);
    armMesh.position.set(0, 0.8, -0.25);
    armMesh.rotation.x = -0.15;
    scene.add(armMesh);

    // 3. Stage (Bàn sa trượt)
    const stageGeom = new THREE.BoxGeometry(0.65, 0.04, 0.55);
    const stageMesh = new THREE.Mesh(stageGeom, metalMat);
    stageMesh.position.set(0, 0.65, 0.05);
    scene.add(stageMesh);

    // Glass slide on stage
    const slideGeom = new THREE.BoxGeometry(0.35, 0.01, 0.18);
    const slideMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, transparent: true, opacity: 0.7 });
    const slideMesh = new THREE.Mesh(slideGeom, slideMat);
    slideMesh.position.set(0, 0.675, 0.05);
    scene.add(slideMesh);

    // 4. Body Tube & Eyepiece (Ống ngắm & Thị kính)
    const tubeGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.85, 20);
    const tubeMesh = new THREE.Mesh(tubeGeom, metalMat);
    tubeMesh.position.set(0, 1.35, 0.05);
    scene.add(tubeMesh);

    // Eyepiece lens (Thị kính 10x)
    const eyepieceGeom = new THREE.CylinderGeometry(0.05, 0.045, 0.18, 20);
    const eyepieceMesh = new THREE.Mesh(eyepieceGeom, chromeMat);
    eyepieceMesh.position.set(0, 1.85, 0.05);
    scene.add(eyepieceMesh);

    // 5. Revolving Nosepiece with 3 Objectives (Mâm xoay vật kính)
    const noseGeom = new THREE.CylinderGeometry(0.12, 0.14, 0.06, 24);
    const noseMesh = new THREE.Mesh(noseGeom, chromeMat);
    noseMesh.position.set(0, 0.96, 0.05);
    scene.add(noseMesh);

    // 3 Objectives (x10, x40, x100)
    [0, 120, 240].forEach((deg, idx) => {
      const rad = (deg * Math.PI) / 180;
      const objGeom = new THREE.CylinderGeometry(0.024, 0.03, 0.18 + idx * 0.05, 16);
      const objMat = new THREE.MeshStandardMaterial({
        color: idx === 0 ? '#eab308' : idx === 1 ? '#0ea5e9' : '#ffffff',
        roughness: 0.3, metalness: 0.8
      });
      const objMesh = new THREE.Mesh(objGeom, objMat);
      objMesh.position.set(0.07 * Math.cos(rad), 0.86 - (idx * 0.025), 0.05 + 0.07 * Math.sin(rad));
      scene.add(objMesh);
    });

    // 6. Coarse and Fine Adjustment Knobs (Ốc vi cấp & Vĩ cấp)
    [-0.18, 0.18].forEach(x => {
      const knobBigGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 20);
      const knobBig = new THREE.Mesh(knobBigGeom, metalMat);
      knobBig.rotation.z = Math.PI / 2;
      knobBig.position.set(x, 0.75, -0.22);
      scene.add(knobBig);

      const knobSmallGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 20);
      const knobSmall = new THREE.Mesh(knobSmallGeom, chromeMat);
      knobSmall.rotation.z = Math.PI / 2;
      knobSmall.position.set(x * 1.25, 0.75, -0.22);
      scene.add(knobSmall);
    });

    // Resize
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

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [viewMode]);

  const handleMagChange = (mag) => {
    setObjectiveMag(mag);
    if (onLog) {
      onLog(`Chuyển vật kính sang x${mag} -> Độ phóng đại tổng cộng: ${mag * 10}x. Quan sát chi tiết tế bào.`);
    }
  };

  const handleSpecimenChange = (key) => {
    setSpecimenKey(key);
    setFocusOffset(0);
    if (onLog) {
      onLog(`Đổi tiêu bản quan sát: ${SPECIMENS_DATA[key].name} (${SPECIMENS_DATA[key].reagent}).`);
    }
  };

  const blurAmount = Math.abs(focusOffset) * 2.2;

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
            🔬
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.5px' }}>
              PHÒNG THÍ NGHIỆM KÍNH HIỂN VI QUANG HỌC 3D (MICROSCOPY LAB)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Quan sát cấu trúc tế bào sinh học ở độ phóng đại x100, x400, x1000 (KHTN 6 & Sinh học 10)
            </div>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#1e293b', padding: '3px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setViewMode('eyepiece')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'eyepiece' ? '#0284c7' : 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              👁️ Thị Kính (Soi tế bào)
            </button>
            <button
              onClick={() => setViewMode('hardware3d')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'hardware3d' ? '#0284c7' : 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔬 Kính Hiển Vi 3D
            </button>
          </div>

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

      {/* Main View Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {viewMode === 'hardware3d' ? (
          <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
        ) : (
          /* Eyepiece Circular View Aperture */
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle, #0b1329 0%, #020617 100%)',
            position: 'relative'
          }}>
            {/* Circular Eyepiece Tube Rim */}
            <div style={{
              width: 'min(70vh, 460px)',
              height: 'min(70vh, 460px)',
              borderRadius: '50%',
              border: '14px solid #1e293b',
              boxShadow: '0 0 60px rgba(0,0,0,0.9), inset 0 0 35px rgba(0,0,0,0.95), 0 0 20px rgba(56, 189, 248, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              background: currentSpecimen.bg,
              filter: `blur(${blurAmount}px)`,
              transition: 'filter 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Cellular Grid Simulator based on Magnification */}
              {specimenKey === 'onion_skin' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: objectiveMag === 10 ? 'repeat(8, 1fr)' : objectiveMag === 40 ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
                  gap: '4px',
                  width: '120%',
                  height: '120%',
                  padding: '20px'
                }}>
                  {Array.from({ length: objectiveMag === 10 ? 64 : objectiveMag === 40 ? 16 : 4 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        border: '3px solid #d97706',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      {/* Nucleus dot */}
                      <div style={{
                        width: objectiveMag === 10 ? '8px' : objectiveMag === 40 ? '22px' : '45px',
                        height: objectiveMag === 10 ? '8px' : objectiveMag === 40 ? '22px' : '45px',
                        borderRadius: '50%',
                        background: '#78350f',
                        boxShadow: '0 0 6px rgba(120, 53, 15, 0.8)'
                      }} />
                    </div>
                  ))}
                </div>
              )}

              {specimenKey === 'cheek_cells' && (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  {[
                    { top: '35%', left: '40%', size: 90 },
                    { top: '55%', left: '25%', size: 110 },
                    { top: '20%', left: '60%', size: 80 }
                  ].map((cell, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        top: cell.top, left: cell.left,
                        width: `${cell.size * (objectiveMag / 40)}px`,
                        height: `${(cell.size * 0.8) * (objectiveMag / 40)}px`,
                        borderRadius: '45% 55% 60% 40%',
                        border: '2px solid #38bdf8',
                        background: 'rgba(56, 189, 248, 0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <div style={{
                        width: `${14 * (objectiveMag / 40)}px`,
                        height: `${14 * (objectiveMag / 40)}px`,
                        borderRadius: '50%',
                        background: '#1d4ed8'
                      }} />
                    </div>
                  ))}
                </div>
              )}

              {specimenKey === 'blood_cells' && (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  {/* Red blood cells scattered */}
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        top: `${15 + (i * 17) % 70}%`,
                        left: `${10 + (i * 23) % 75}%`,
                        width: `${18 * (objectiveMag / 40)}px`,
                        height: `${18 * (objectiveMag / 40)}px`,
                        borderRadius: '50%',
                        border: '2px solid #ef4444',
                        background: 'radial-gradient(circle, #7f1d1d 30%, #ef4444 80%)'
                      }}
                    />
                  ))}
                  {/* One large white blood cell */}
                  <div style={{
                    position: 'absolute',
                    top: '45%', left: '45%',
                    width: `${36 * (objectiveMag / 40)}px`,
                    height: `${36 * (objectiveMag / 40)}px`,
                    borderRadius: '50%',
                    border: '3px solid #c084fc',
                    background: 'rgba(192, 132, 252, 0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{ width: '16px', height: '12px', background: '#6b21a8', borderRadius: '4px' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Crosshair Micrometer Lines */}
            <div style={{
              position: 'absolute',
              width: 'min(70vh, 460px)',
              height: 'min(70vh, 460px)',
              pointerEvents: 'none',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
              <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(255,255,255,0.15)' }} />
            </div>
          </div>
        )}

        {/* Floating Specimen & Focus Bar */}
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
          {/* Objective Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>Vật kính:</span>
            {[10, 40, 100].map(mag => (
              <button
                key={mag}
                onClick={() => handleMagChange(mag)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: objectiveMag === mag ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                x{mag} ({mag * 10}x)
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '22px', background: '#334155' }} />

          {/* Coarse / Fine Focus Adjustment */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b' }}>
              Ốc vi cấp (Độ nét):
            </span>
            <input
              type="range"
              min="-4"
              max="4"
              step="1"
              value={focusOffset}
              onChange={(e) => setFocusOffset(Number(e.target.value))}
              style={{ width: '110px', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            <button
              onClick={() => setFocusOffset(0)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#10b981',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Lấy nét chuẩn (0)
            </button>
          </div>
        </div>

        {/* Left Side: Specimen Info Card */}
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
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            TIÊU BẢN VI THỂ
          </div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc' }}>
            {currentSpecimen.name}
          </h3>

          {/* Specimen Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            {Object.keys(SPECIMENS_DATA).map(key => (
              <button
                key={key}
                onClick={() => handleSpecimenChange(key)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: specimenKey === key ? '#0284c7' : 'rgba(30, 41, 59, 0.7)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {SPECIMENS_DATA[key].name}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '10px 12px', borderRadius: '10px', marginBottom: '10px' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>ĐỘ PHÓNG ĐẠI</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
              {totalMag}x <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>(Thị kính 10x × Vật kính {objectiveMag}x)</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.45', background: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '10px' }}>
            <div style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>Cấu trúc nhận diện:</div>
            {currentSpecimen.structures.map((st, i) => (
              <div key={i} style={{ marginTop: '2px' }}>• {st}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
