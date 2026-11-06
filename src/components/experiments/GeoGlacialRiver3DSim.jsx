import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Mountain, 
  Thermometer, 
  Waves, 
  RotateCcw, 
  Compass, 
  Maximize2, 
  Minimize2,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';

export function GeoGlacialRiver3DSim({ onLog, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const [temp, setTemp] = useState(18); // -10°C to +35°C
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraView, setCameraView] = useState('overview'); // 'overview', 'glacier', 'river', 'peak'

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const reqIdRef = useRef(null);

  // Dynamic 3D meshes
  const glacierTongueRef = useRef(null);
  const riverMeshRef = useRef(null);
  const iceChunksGroupRef = useRef(null);
  const meltParticlesRef = useRef([]);

  const tempRef = useRef(temp);
  tempRef.current = temp;
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  // Flow rate formula: 0 when temp <= 0, then scales up to ~150 m3/s
  const flowRate = Math.max(0, Math.round(temp <= 0 ? 0 : temp * 4.4));

  // Audio/log updates on temperature changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (onLog) {
      if (temp <= 0) {
        onLog(`❄️ Nhiệt độ t = ${temp}°C (Dưới điểm đóng băng): Băng tuyết tích tụ dày đặc, sông băng mở rộng bao phủ thung lũng, dòng chảy ngừng lại (0 m³/s).`);
      } else if (temp <= 15) {
        onLog(`🌤️ Nhiệt độ mùa xuân t = ${temp}°C: Băng bắt đầu tan chậm, hình thành các khe nứt và dòng suối băng tan nhỏ (${flowRate} m³/s).`);
      } else {
        onLog(`🔥 Nhiệt độ mùa hè t = ${temp}°C: Sông băng tan chảy dữ dội, lưu lượng nước sông nguồn đạt ${flowRate} m³/s cuốn theo bọt tuyết và băng tích!`);
      }
    }
  }, [temp]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      if (width === 0 || height === 0) return;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isFullscreen]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1628);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.set(0, 38, 70);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 140;
    controls.minDistance = 12;
    controls.target.set(0, 8, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.update();
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.9);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.8);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    sunLight.position.set(30, 45, 25);
    scene.add(sunLight);

    // Subtle blue rim light for icy highlights
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-30, 20, -20);
    scene.add(rimLight);

    // 6. Base U-Shaped Glacial Valley & Mountain Flanks
    const valleyGroup = new THREE.Group();
    scene.add(valleyGroup);

    // Valley Floor (Đáy thung lũng hình chữ U)
    const floorGeo = new THREE.BoxGeometry(64, 6, 60);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -3, 0);
    valleyGroup.add(floorMesh);

    // Left Mountain Ridge (Sườn núi dốc đứng bên trái đặc trưng thung lũng băng hà)
    const leftRidgeGeo = new THREE.BoxGeometry(18, 22, 60);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, flatShading: true });
    const leftRidge = new THREE.Mesh(leftRidgeGeo, rockMat);
    leftRidge.position.set(-25, 10, 0);
    valleyGroup.add(leftRidge);

    // Right Mountain Ridge (Sườn núi dốc đứng bên phải)
    const rightRidgeGeo = new THREE.BoxGeometry(18, 22, 60);
    const rightRidge = new THREE.Mesh(rightRidgeGeo, rockMat);
    rightRidge.position.set(25, 10, 0);
    valleyGroup.add(rightRidge);

    // 7. Majestic Glacial Horn Peaks at the Back (Đỉnh nhọn băng hà phía sau)
    const peak1Geo = new THREE.ConeGeometry(12, 28, 5);
    const peak1 = new THREE.Mesh(peak1Geo, rockMat);
    peak1.position.set(-14, 18, -24);
    valleyGroup.add(peak1);

    const snow1Geo = new THREE.ConeGeometry(5.5, 11, 5);
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, flatShading: true });
    const snow1 = new THREE.Mesh(snow1Geo, snowMat);
    snow1.position.set(-14, 26.5, -24);
    valleyGroup.add(snow1);

    const peak2Geo = new THREE.ConeGeometry(10, 24, 5);
    const peak2 = new THREE.Mesh(peak2Geo, rockMat);
    peak2.position.set(12, 16, -24);
    valleyGroup.add(peak2);

    const snow2Geo = new THREE.ConeGeometry(4.5, 9, 5);
    const snow2 = new THREE.Mesh(snow2Geo, snowMat);
    snow2.position.set(12, 23.5, -24);
    valleyGroup.add(snow2);

    // Central Cirque Amphitheater (Vòm băng hà vòng cung)
    const cirqueGeo = new THREE.CylinderGeometry(16, 20, 14, 16, 1, false, 0, Math.PI);
    const cirque = new THREE.Mesh(cirqueGeo, rockMat);
    cirque.position.set(0, 10, -22);
    cirque.rotation.y = Math.PI / 2;
    valleyGroup.add(cirque);

    // 8. 3D Glacial Ice Tongue (Lưỡi Sông Băng khổng lồ chảy dọc thung lũng)
    // Dynamic shape: curves from Z: -22 down to Z: 0 (or receding based on temperature)
    const glacierPoints = [
      new THREE.Vector3(0, 14, -22), // Origin at high cirque
      new THREE.Vector3(-1, 9, -15),
      new THREE.Vector3(1, 5, -8),
      new THREE.Vector3(0, 2.5, -1)   // Glacier snout / terminus
    ];
    const glacierCurve = new THREE.CatmullRomCurve3(glacierPoints);
    const glacierGeo = new THREE.TubeGeometry(glacierCurve, 24, 6.2, 10, false);
    const glacierMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.15,
      transparent: true,
      opacity: 0.95
    });
    const glacierTongue = new THREE.Mesh(glacierGeo, glacierMat);
    valleyGroup.add(glacierTongue);
    glacierTongueRef.current = glacierTongue;

    // Crevasses / Ice Fissures (Các đường nứt nẻ màu xanh thẫm trên thân sông băng)
    const crevasseGroup = new THREE.Group();
    for (let c = 0; c < 8; c++) {
      const z = -18 + c * 2.2;
      const crackGeo = new THREE.BoxGeometry(7, 0.4, 0.5);
      const crackMat = new THREE.MeshBasicMaterial({ color: 0x0369a1 });
      const crack = new THREE.Mesh(crackGeo, crackMat);
      crack.position.set((Math.random() - 0.5) * 1.5, 6 - (c * 0.4), z);
      crack.rotation.y = (Math.random() - 0.5) * 0.3;
      crevasseGroup.add(crack);
    }
    glacierTongue.add(crevasseGroup);

    // 9. Meltwater River Emerging from Glacial Snout (Dòng Sông Băng Tan uốn lượn về hạ lưu)
    const riverPoints = [
      new THREE.Vector3(0, 0.6, -1),   // Glacial cave terminus
      new THREE.Vector3(-3, 0.6, 6),
      new THREE.Vector3(2, 0.6, 14),
      new THREE.Vector3(-2, 0.6, 21),
      new THREE.Vector3(0, 0.6, 28)    // Lower valley plain
    ];
    const riverCurve = new THREE.CatmullRomCurve3(riverPoints);
    const riverGeo = new THREE.TubeGeometry(riverCurve, 28, 2.2, 8, false);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.2
    });
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    valleyGroup.add(riverMesh);
    riverMeshRef.current = riverMesh;

    // 10. Floating Ice Chunks on Meltwater River (Các tảng băng trôi dạt trên dòng sông)
    const iceChunksGroup = new THREE.Group();
    const chunkGeo = new THREE.DodecahedronGeometry(0.75, 0);
    const chunkMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.3 });
    const chunks = [];

    for (let i = 0; i < 12; i++) {
      const ch = new THREE.Mesh(chunkGeo, chunkMat);
      ch.position.set((Math.random() - 0.5) * 2, 0.8, -1 + Math.random() * 26);
      ch.userData = { speed: 0.08 + Math.random() * 0.12, rotSpeed: (Math.random() - 0.5) * 0.04 };
      iceChunksGroup.add(ch);
      chunks.push(ch);
    }
    valleyGroup.add(iceChunksGroup);
    iceChunksGroupRef.current = chunks;

    // 11. Meltwater Splash Particles at Terminus (Bọt nước trắng xóa tại cửa hang băng)
    const meltCount = 60;
    const meltParticles = [];
    const meltGeo = new THREE.SphereGeometry(0.2, 4, 4);
    const meltMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const splashGroup = new THREE.Group();

    for (let i = 0; i < meltCount; i++) {
      const sp = new THREE.Mesh(meltGeo, meltMat);
      sp.position.set(0, 0.8, -1);
      sp.userData = {
        vx: (Math.random() - 0.5) * 0.2,
        vy: 0.05 + Math.random() * 0.15,
        vz: 0.1 + Math.random() * 0.25,
        life: Math.random() * 30
      };
      splashGroup.add(sp);
      meltParticles.push(sp);
    }
    valleyGroup.add(splashGroup);
    meltParticlesRef.current = meltParticles;

    // 12. Moraines (Băng tích ven sườn núi - đống đá cuội do băng bào mòn)
    const moraineGeo = new THREE.DodecahedronGeometry(1.2, 0);
    const moraineMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
    for (let m = 0; m < 16; m++) {
      const rock1 = new THREE.Mesh(moraineGeo, moraineMat);
      rock1.position.set(-6.5 + (Math.random() - 0.5), 1.2, -18 + m * 2.5);
      rock1.scale.set(0.6 + Math.random() * 0.8, 0.6 + Math.random() * 0.8, 0.6 + Math.random() * 0.8);
      valleyGroup.add(rock1);

      const rock2 = new THREE.Mesh(moraineGeo, moraineMat);
      rock2.position.set(6.5 + (Math.random() - 0.5), 1.2, -18 + m * 2.5);
      rock2.scale.set(0.6 + Math.random() * 0.8, 0.6 + Math.random() * 0.8, 0.6 + Math.random() * 0.8);
      valleyGroup.add(rock2);
    }

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const curTemp = tempRef.current;
      const isFrozen = curTemp <= 0;

      // Adjust glacier tongue scale based on temperature
      // Cold (<0): Glacier expands down valley
      // Hot (>25): Glacier retreats up valley
      if (glacierTongueRef.current) {
        if (isFrozen) {
          glacierTongueRef.current.scale.set(1.15, 1.15, 1.15);
          glacierTongueRef.current.material.opacity = 0.98;
          glacierTongueRef.current.material.emissiveIntensity = 0.2;
        } else {
          const retreat = Math.max(0.7, 1.05 - (curTemp / 35) * 0.35);
          glacierTongueRef.current.scale.set(retreat, retreat, retreat);
          glacierTongueRef.current.material.opacity = 0.88;
          glacierTongueRef.current.material.emissiveIntensity = 0.45;
        }
      }

      // Adjust river width & flow appearance
      if (riverMeshRef.current) {
        if (isFrozen) {
          // River is frozen solid white/cyan sheet
          riverMeshRef.current.scale.set(0.6, 0.6, 1.0);
          riverMeshRef.current.material.color.setHex(0xe0f2fe);
          riverMeshRef.current.material.emissiveIntensity = 0.1;
        } else {
          const flowScale = Math.min(2.0, 0.8 + (curTemp / 35) * 1.2);
          riverMeshRef.current.scale.set(flowScale, flowScale, 1.0);
          riverMeshRef.current.material.color.setHex(0x0284c7);
          riverMeshRef.current.material.emissiveIntensity = 0.6;
        }
      }

      // Animate floating ice chunks on river
      if (iceChunksGroupRef.current) {
        iceChunksGroupRef.current.forEach(ch => {
          if (isFrozen) {
            ch.visible = false;
          } else {
            ch.visible = true;
            ch.position.z += ch.userData.speed * (0.6 + (curTemp / 20));
            ch.rotation.y += ch.userData.rotSpeed;
            if (ch.position.z > 27) {
              ch.position.z = -1;
              ch.position.x = (Math.random() - 0.5) * 2;
            }
          }
        });
      }

      // Animate water splashes at terminus
      meltParticlesRef.current.forEach(sp => {
        if (isFrozen) {
          sp.visible = false;
        } else {
          sp.visible = true;
          sp.position.x += sp.userData.vx;
          sp.position.y += sp.userData.vy;
          sp.position.z += sp.userData.vz * (0.8 + (curTemp / 20));
          sp.userData.vy -= 0.01; // Gravity
          sp.userData.life++;

          if (sp.userData.life > 25 || sp.position.y < 0.6) {
            sp.userData.life = 0;
            sp.position.set((Math.random() - 0.5) * 1.5, 0.8, -1);
            sp.userData.vy = 0.06 + Math.random() * 0.14;
          }
        }
      });

      controls.autoRotate = autoRotateRef.current;
      controls.update();
      renderer.render(scene, camera);
      reqIdRef.current = requestAnimationFrame(animate);
    };

    reqIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
          rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  // Camera views
  const switchCamera = (viewKey) => {
    setCameraView(viewKey);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (viewKey === 'overview') {
      camera.position.set(0, 38, 70);
      controls.target.set(0, 8, 0);
    } else if (viewKey === 'glacier') {
      // Close up on glacier tongue
      camera.position.set(12, 16, 8);
      controls.target.set(0, 7, -10);
    } else if (viewKey === 'river') {
      // Focus on lower river
      camera.position.set(-8, 12, 28);
      controls.target.set(0, 2, 14);
    } else if (viewKey === 'peak') {
      // Looking down from snow peak
      camera.position.set(-18, 34, -20);
      controls.target.set(0, 6, 0);
    }
    controls.update();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', background: '#020617', borderRadius: '16px', padding: '12px', border: '1px solid rgba(13, 148, 136, 0.3)' }}>
      {/* 3D WebGL Canvas */}
      <div 
        ref={mountRef}
        style={{ 
          flex: 1, 
          minHeight: '380px', 
          borderRadius: '14px', 
          overflow: 'hidden', 
          position: 'relative', 
          cursor: 'grab',
          background: 'radial-gradient(ellipse at center, #0e294b 0%, #020817 100%)'
        }}
      >
        {/* Top Floating HUD Status */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 10,
          pointerEvents: 'none',
          maxWidth: '520px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(45, 212, 191, 0.4)',
            padding: '8px 14px',
            borderRadius: '12px',
            color: '#2dd4bf',
            fontWeight: 800,
            fontSize: '0.82rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1rem' }}>🏔️</span>
            <span>Mô Hình 3D Thung Lũng Băng Hà (Chữ U) & Sông Băng Tan Chuẩn Địa Lí 6</span>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            borderLeft: `3px solid ${temp <= 0 ? '#38bdf8' : '#f59e0b'}`,
            padding: '6px 12px',
            borderRadius: '8px',
            color: '#cbd5e1',
            fontSize: '0.74rem',
            lineHeight: 1.4
          }}>
            {temp <= 0 ? (
              <span>❄️ <b>Mùa Đông (-10°C):</b> Sông băng mở rộng bao phủ toàn bộ thung lũng chữ U, nước đóng băng (Lưu lượng: 0 m³/s).</span>
            ) : (
              <span>☀️ <b>Mùa Hè ({temp}°C):</b> Sông băng tan chảy tại cửa hang băng, hình thành dòng sông nguồn cuồn cuộn đổ về hạ lưu (Lưu lượng: <b>{flowRate} m³/s</b>).</span>
            )}
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          display: 'flex',
          gap: '6px',
          zIndex: 10
        }}>
          {[
            { key: 'overview', label: '🏔️ Toàn Cảnh Chữ U' },
            { key: 'glacier', label: '🧊 Lưỡi Sông Băng' },
            { key: 'river', label: '🌊 Dòng Sông Nguồn' }
          ].map(view => (
            <button
              key={view.key}
              onClick={() => switchCamera(view.key)}
              style={{
                background: cameraView === view.key ? '#0d9488' : 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                border: cameraView === view.key ? '1px solid #2dd4bf' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)'
              }}
            >
              {view.label}
            </button>
          ))}

          <button
            onClick={() => setAutoRotate(prev => !prev)}
            style={{
              background: autoRotate ? '#0284c7' : 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Compass size={13} />
            {autoRotate ? 'Đang Xoay' : 'Xoay 360°'}
          </button>

          {toggleFullscreen && (
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}
        </div>

        {/* Bottom Legend */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '14px',
          right: '14px',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.72rem',
          color: '#94a3b8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <span>Kéo chuột xoay 360° | Cuộn thu phóng | Chuột phải trượt góc nhìn</span>
          <span style={{ color: '#2dd4bf', fontWeight: 700 }}>Đỉnh nhọn băng hà • Vòm băng • Lưỡi sông băng • Băng tích • Sông tan băng</span>
        </div>
      </div>

      {/* Interactive Temperature Slider & Flow Readout */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        padding: '14px 20px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
        border: '1px solid rgba(13, 148, 136, 0.25)'
      }}>
        {/* Temperature Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Thermometer size={18} color={temp <= 0 ? '#38bdf8' : '#f59e0b'} />
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Nhiệt Độ Mùa Hè: <b style={{ color: temp <= 0 ? '#38bdf8' : '#fde047', fontSize: '1.05rem', fontFamily: 'monospace' }}>{temp > 0 ? `+${temp}` : temp}°C</b>
            </span>
          </div>
          <input 
            type="range" 
            min="-10" 
            max="35" 
            step="1" 
            value={temp} 
            onChange={e => setTemp(Number(e.target.value))} 
            style={{ flex: 1, accentColor: '#0d9488', cursor: 'pointer', height: '6px' }} 
          />
        </div>

        {/* River Discharge Readout */}
        <div style={{
          background: 'rgba(2, 132, 199, 0.2)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          padding: '8px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Waves size={18} color="#38bdf8" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>LƯU LƯỢNG NƯỚC SÔNG NGUỒN</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
              {flowRate} <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>m³/s</span>
            </span>
          </div>
        </div>

        {/* Quick Season Presets */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { label: '❄️ Mùa Đông (-5°C)', val: -5 },
            { label: '🌤️ Mùa Xuân (+12°C)', val: 12 },
            { label: '🔥 Mùa Hè (+28°C)', val: 28 }
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => setTemp(preset.val)}
              style={{
                background: temp === preset.val ? '#0d9488' : '#1e293b',
                color: '#ffffff',
                border: temp === preset.val ? '1px solid #2dd4bf' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
