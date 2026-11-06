import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Flame, 
  RotateCcw, 
  Layers, 
  Sun, 
  Moon, 
  Activity, 
  Info, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2,
  Camera,
  Compass
} from 'lucide-react';

export function GeoVolcano3DSim({ onLog, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const [pressure, setPressure] = useState(50); // 20 to 120 MPa
  const [isErupting, setIsErupting] = useState(false);
  const [viewMode, setViewMode] = useState('crossSection'); // 'crossSection' or 'full'
  const [isNight, setIsNight] = useState(true); // Night makes lava glow spectacularly
  const [autoRotate, setAutoRotate] = useState(false);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const reqIdRef = useRef(null);

  // Dynamic mesh and particle refs
  const magmaChamberMeshRef = useRef(null);
  const magmaConduitMeshRef = useRef(null);
  const lavaFlowsGroupRef = useRef(null);
  const smokeParticlesRef = useRef([]);
  const sparkParticlesRef = useRef([]);
  const pointLightRef = useRef(null);
  const ambientLightRef = useRef(null);
  const hemiLightRef = useRef(null);

  const pressureRef = useRef(pressure);
  pressureRef.current = pressure;
  const isEruptingRef = useRef(isErupting);
  isEruptingRef.current = isErupting;
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;
  const isNightRef = useRef(isNight);
  isNightRef.current = isNight;
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  // Window resize & fullscreen handler
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
    scene.background = new THREE.Color(isNight ? 0x030712 : 0x0f172a);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.set(0, 32, 65);
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
    controls.minDistance = 15;
    controls.target.set(0, 4, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't flip below bottom ground
    controls.update();
    controlsRef.current = controls;

    // 5. Lighting
    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x1e1b4b, isNight ? 0.4 : 1.2);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xffedd5, isNight ? 0.6 : 2.0);
    dirLight.position.set(30, 40, 25);
    scene.add(dirLight);

    // Dynamic Magma Point Light
    const magmaLight = new THREE.PointLight(0xff3b00, 4.0, 70);
    magmaLight.position.set(0, -6, 0);
    scene.add(magmaLight);
    pointLightRef.current = magmaLight;

    // 6. Stars background for dramatic night ambiance
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starCoords = [];
    for (let i = 0; i < starCount; i++) {
      starCoords.push(
        (Math.random() - 0.5) * 300,
        Math.random() * 120 + 10,
        (Math.random() - 0.5) * 300
      );
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.7 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 7. Base Tectonic Crust & Upper Mantle Box Block
    // Dimensions: 50 width x 20 height x 50 depth
    const crustHeight = 16;
    const mantleHeight = 12;
    const blockWidth = 54;
    const blockDepth = 54;

    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    // Upper Mantle Layer (Độ sâu chứa buồng Magma)
    const mantleGeo = new THREE.BoxGeometry(blockWidth, mantleHeight, blockDepth);
    const mantleMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.9,
      metalness: 0.1
    });
    const mantleMesh = new THREE.Mesh(mantleGeo, mantleMat);
    mantleMesh.position.set(0, -mantleHeight / 2 - crustHeight / 2, 0);
    baseGroup.add(mantleMesh);

    // Earth Crust Layer (Vỏ Trái Đất)
    const crustGeo = new THREE.BoxGeometry(blockWidth, crustHeight, blockDepth);
    const crustMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.05
    });
    const crustMesh = new THREE.Mesh(crustGeo, crustMat);
    crustMesh.position.set(0, 0, 0);
    baseGroup.add(crustMesh);

    // 8. Stratovolcano Mountain Cone
    // Real Volcano shape using tapered cylinder / cone with caldera opening at top
    // Base radius: 24, Top radius: 3.2, Height: 18
    const volcanoHeight = 18;
    const volcanoBaseR = 24;
    const volcanoTopR = 3.6;

    // Full 360 volcano mesh
    const fullVolcanoGeo = new THREE.CylinderGeometry(volcanoTopR, volcanoBaseR, volcanoHeight, 48, 8, true);
    const volcanoMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.9,
      metalness: 0.1,
      bumpScale: 0.4
    });
    const fullVolcanoMesh = new THREE.Mesh(fullVolcanoGeo, volcanoMat);
    fullVolcanoMesh.position.set(0, crustHeight / 2 + volcanoHeight / 2, 0);

    // Cutaway 270° volcano geometry (missing 90° pie quadrant to see the interior conduit)
    const cutVolcanoGeo = new THREE.CylinderGeometry(
      volcanoTopR, volcanoBaseR, volcanoHeight, 36, 8, false,
      0, Math.PI * 1.5 // 270 degrees
    );
    const cutVolcanoMesh = new THREE.Mesh(cutVolcanoGeo, volcanoMat);
    cutVolcanoMesh.position.set(0, crustHeight / 2 + volcanoHeight / 2, 0);

    // Inside Cut Planes (Thành địa chất cắt ngang thể hiện các lớp tro xỉ dung nham)
    const cutWallGroup = new THREE.Group();
    const wallGeo1 = new THREE.PlaneGeometry(volcanoBaseR, volcanoHeight);
    const wallGeo2 = new THREE.PlaneGeometry(volcanoBaseR, volcanoHeight);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.7,
      side: THREE.DoubleSide
    });
    const cutWall1 = new THREE.Mesh(wallGeo1, wallMat);
    cutWall1.position.set(volcanoBaseR / 2, crustHeight / 2 + volcanoHeight / 2, 0);
    const cutWall2 = new THREE.Mesh(wallGeo2, wallMat);
    cutWall2.rotation.y = Math.PI / 2;
    cutWall2.position.set(0, crustHeight / 2 + volcanoHeight / 2, volcanoBaseR / 2);
    cutWallGroup.add(cutWall1);
    cutWallGroup.add(cutWall2);

    const volcanoContainer = new THREE.Group();
    volcanoContainer.add(fullVolcanoMesh);
    volcanoContainer.add(cutVolcanoMesh);
    volcanoContainer.add(cutWallGroup);
    scene.add(volcanoContainer);

    // 9. Subterranean Magma Chamber & Main Conduit
    // Magma Chamber Sphere (Deep in the mantle)
    const chamberGeo = new THREE.SphereGeometry(6.5, 32, 24);
    const chamberMat = new THREE.MeshStandardMaterial({
      color: 0xff3b00,
      emissive: 0xff4500,
      emissiveIntensity: 1.8,
      roughness: 0.3
    });
    const magmaChamberMesh = new THREE.Mesh(chamberGeo, chamberMat);
    magmaChamberMesh.position.set(0, -6, 0);
    scene.add(magmaChamberMesh);
    magmaChamberMeshRef.current = magmaChamberMesh;

    // Main Magma Conduit (Ống dẫn dung nham chính từ buồng lên miệng núi lửa)
    const conduitLength = crustHeight / 2 + volcanoHeight + 6;
    const conduitGeo = new THREE.CylinderGeometry(1.8, 2.8, conduitLength, 16);
    const conduitMat = new THREE.MeshStandardMaterial({
      color: 0xff5722,
      emissive: 0xff2200,
      emissiveIntensity: 1.5,
      roughness: 0.4
    });
    const magmaConduitMesh = new THREE.Mesh(conduitGeo, conduitMat);
    magmaConduitMesh.position.set(0, (-6 + (crustHeight / 2 + volcanoHeight)) / 2, 0);
    scene.add(magmaConduitMesh);
    magmaConduitMeshRef.current = magmaConduitMesh;

    // Caldera Lava Lake at top crater
    const lavaLakeGeo = new THREE.CylinderGeometry(volcanoTopR - 0.2, volcanoTopR - 0.2, 0.4, 24);
    const lavaLakeMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff4400,
      emissiveIntensity: 2.2,
      roughness: 0.2
    });
    const lavaLake = new THREE.Mesh(lavaLakeGeo, lavaLakeMat);
    lavaLake.position.set(0, crustHeight / 2 + volcanoHeight - 0.2, 0);
    scene.add(lavaLake);

    // 10. Lava Flows along slopes (Dòng dung nham tràn)
    const lavaFlowsGroup = new THREE.Group();
    const flowCount = 6;
    for (let i = 0; i < flowCount; i++) {
      const angle = (i / flowCount) * Math.PI * 1.8 + 0.3;
      const points = [];
      const steps = 14;
      for (let s = 0; s < steps; s++) {
        const t = s / (steps - 1);
        const r = volcanoTopR + t * (volcanoBaseR - volcanoTopR - 1.5);
        const y = crustHeight / 2 + volcanoHeight - t * volcanoHeight + 0.25;
        // Natural winding curve
        const wave = Math.sin(t * 5.0) * 0.8;
        points.push(new THREE.Vector3(
          Math.cos(angle + wave * 0.1) * r,
          y,
          Math.sin(angle + wave * 0.1) * r
        ));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.65, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0xff2200,
        emissive: 0xff4500,
        emissiveIntensity: 2.5,
        roughness: 0.2
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.visible = false; // Initially hidden until erupting
      lavaFlowsGroup.add(tube);
    }
    scene.add(lavaFlowsGroup);
    lavaFlowsGroupRef.current = lavaFlowsGroup;

    // 11. Volcanic Eruption Particles (Ash Column & Fire Sparks)
    const smokeCount = 180;
    const smokeParticles = [];
    const smokeGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 1.0,
      transparent: true,
      opacity: 0.75
    });

    const ashGroup = new THREE.Group();
    for (let i = 0; i < smokeCount; i++) {
      const m = new THREE.Mesh(smokeGeo, smokeMat.clone());
      m.position.set(0, crustHeight / 2 + volcanoHeight, 0);
      m.userData = {
        vy: 0.3 + Math.random() * 0.7,
        vx: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.35,
        scaleSpeed: 0.04 + Math.random() * 0.05,
        maxLife: 80 + Math.random() * 60,
        life: Math.random() * 80
      };
      ashGroup.add(m);
      smokeParticles.push(m);
    }
    scene.add(ashGroup);
    smokeParticlesRef.current = smokeParticles;

    // Fire Sparks / Volcanic Bombs (Bom núi lửa & tàn tro đỏ)
    const sparkCount = 100;
    const sparkParticles = [];
    const sparkGeo = new THREE.SphereGeometry(0.35, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xffdd00
    });

    const sparkGroup = new THREE.Group();
    for (let i = 0; i < sparkCount; i++) {
      const sp = new THREE.Mesh(sparkGeo, sparkMat);
      sp.position.set(0, crustHeight / 2 + volcanoHeight, 0);
      sp.userData = {
        vx: (Math.random() - 0.5) * 1.2,
        vy: 0.8 + Math.random() * 1.5,
        vz: (Math.random() - 0.5) * 1.2,
        gravity: 0.035,
        life: Math.random() * 40
      };
      sparkGroup.add(sp);
      sparkParticles.push(sp);
    }
    scene.add(sparkGroup);
    sparkParticlesRef.current = sparkParticles;

    // Animation Loop
    let clock = new THREE.Clock();
    let pulseTime = 0;

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      pulseTime += delta * 2.5;

      const curPressure = pressureRef.current;
      const erupting = isEruptingRef.current;
      const curView = viewModeRef.current;

      // Update View mode visibility
      if (curView === 'crossSection') {
        fullVolcanoMesh.visible = false;
        cutVolcanoMesh.visible = true;
        cutWallGroup.visible = true;
      } else {
        fullVolcanoMesh.visible = true;
        cutVolcanoMesh.visible = false;
        cutWallGroup.visible = false;
      }

      // Pulsing Magma Chamber based on Pressure
      const scaleP = 0.85 + (curPressure / 120) * 0.55 + Math.sin(pulseTime) * 0.04;
      if (magmaChamberMeshRef.current) {
        magmaChamberMeshRef.current.scale.set(scaleP, scaleP, scaleP);
        magmaChamberMeshRef.current.material.emissiveIntensity = 1.2 + (curPressure / 120) * 1.6 + Math.sin(pulseTime) * 0.3;
      }

      if (pointLightRef.current) {
        pointLightRef.current.intensity = 2.0 + (curPressure / 120) * 4.0 + (erupting ? 5.0 : 0);
      }

      // Lava flows visibility & pulsing animation
      if (lavaFlowsGroupRef.current) {
        lavaFlowsGroupRef.current.children.forEach((tube, idx) => {
          tube.visible = erupting || curPressure >= 90;
          if (tube.visible) {
            tube.material.emissiveIntensity = 2.0 + Math.sin(pulseTime + idx) * 0.8;
          }
        });
      }

      // Particle Simulation (Eruption FX)
      const craterY = crustHeight / 2 + volcanoHeight;
      if (erupting) {
        // Ash Column
        smokeParticlesRef.current.forEach(p => {
          p.visible = true;
          p.position.y += p.userData.vy;
          p.position.x += p.userData.vx;
          p.position.z += p.userData.vz;
          p.userData.life++;
          const progress = p.userData.life / p.userData.maxLife;
          const s = 1.0 + progress * 4.2;
          p.scale.set(s, s, s);
          p.material.opacity = Math.max(0, 0.75 * (1 - progress));

          // Reset particle once lifespan ends
          if (p.userData.life > p.userData.maxLife) {
            p.userData.life = 0;
            p.position.set((Math.random() - 0.5) * 1.5, craterY, (Math.random() - 0.5) * 1.5);
            p.material.opacity = 0.75;
          }
        });

        // Fire Sparks / Volcanic Bombs
        sparkParticlesRef.current.forEach(sp => {
          sp.visible = true;
          sp.position.x += sp.userData.vx;
          sp.position.y += sp.userData.vy;
          sp.position.z += sp.userData.vz;
          sp.userData.vy -= sp.userData.gravity;
          sp.userData.life++;

          if (sp.position.y < craterY - 2 || sp.userData.life > 50) {
            sp.userData.life = 0;
            sp.position.set((Math.random() - 0.5) * 1.0, craterY, (Math.random() - 0.5) * 1.0);
            sp.userData.vx = (Math.random() - 0.5) * 1.3;
            sp.userData.vy = 0.9 + Math.random() * 1.4;
            sp.userData.vz = (Math.random() - 0.5) * 1.3;
          }
        });
      } else {
        // Hide eruption particles when calm
        smokeParticlesRef.current.forEach(p => { p.visible = false; });
        sparkParticlesRef.current.forEach(sp => { sp.visible = false; });
      }

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
  }, [isNight]);

  // Handle Pressure & Eruption
  const handleIncreasePressure = () => {
    const next = Math.min(120, pressure + 20);
    setPressure(next);
    if (next >= 100 && !isErupting) {
      setIsErupting(true);
      if (onLog) onLog("🌋 Áp suất buồng Magma đạt đỉnh 100+ MPa ➔ BÙNG NỔ NÚI LỬA! Cột tro bụi phóng cao 15km, dung nham 1200°C cuồn cuộn chảy tràn sườn núi!");
    } else if (onLog) {
      onLog(`🔥 Áp suất buồng Magma tăng lên: ${next} MPa. Dung tích buồng giãn nở, nhiệt độ dung nham nóng đỏ ~1200°C.`);
    }
  };

  const handleTriggerErupt = () => {
    setPressure(115);
    setIsErupting(true);
    if (onLog) onLog("🌋 KÍCH HOẠT PHUN TRÀO TOÀN PHẦN! Dung nham bùng nổ qua ống dẫn chính, bắn tung các khối bom núi lửa và tro xỉ rực sáng!");
  };

  const handleReset = () => {
    setPressure(50);
    setIsErupting(false);
    if (onLog) onLog("🔄 Đã làm mới mô hình Núi Lửa 3D về trạng thái tích tụ Magma ban đầu (50 MPa).");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', background: '#020617', borderRadius: '16px', padding: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
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
          background: isNight ? 'radial-gradient(ellipse at center, #0a0f1d 0%, #020617 100%)' : 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)'
        }}
      >
        {/* Top HUD Title */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(245, 158, 11, 0.5)',
            padding: '8px 14px',
            borderRadius: '12px',
            color: '#f59e0b',
            fontWeight: 800,
            fontSize: '0.82rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1rem' }}>🌋</span>
            <span>Mô Hình 3D Núi Lửa & Buồng Magma Chuẩn Địa Lí 6 & 10</span>
          </div>

          {isErupting && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '10px',
              fontWeight: 900,
              fontSize: '0.78rem',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>💥 ĐANG PHUN TRÀO:</span>
              <span>Dung nham 1200°C tràn sườn núi • Cột tro bụi phóng vào tầng bình lưu</span>
            </div>
          )}
        </div>

        {/* Top Right Controls Overlay */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          display: 'flex',
          gap: '6px',
          zIndex: 10
        }}>
          <button
            onClick={() => setViewMode(prev => prev === 'crossSection' ? 'full' : 'crossSection')}
            style={{
              background: viewMode === 'crossSection' ? '#d97706' : 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Layers size={14} />
            {viewMode === 'crossSection' ? 'Mặt Cắt Địa Chất 3D' : 'Khối Núi 3D Toàn Cảnh'}
          </button>

          <button
            onClick={() => setIsNight(prev => !prev)}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(8px)'
            }}
          >
            {isNight ? <Moon size={14} color="#fde047" /> : <Sun size={14} color="#f59e0b" />}
            {isNight ? 'Ban Đêm (Lava Sáng)' : 'Ban Ngày'}
          </button>

          <button
            onClick={() => setAutoRotate(prev => !prev)}
            style={{
              background: autoRotate ? '#0284c7' : 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Compass size={14} />
            {autoRotate ? 'Đang Tự Xoay' : 'Tự Xoay 360°'}
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

        {/* Bottom Legend Guide */}
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
          <span>Kéo chuột để <b>xoay 360°</b> | Cuộn chuột để <b>phóng to/thu nhỏ</b> | Chuột phải để <b>trượt góc nhìn</b></span>
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>Ống dẫn Magma • Buồng Magma • Dòng dung nham • Tro bụi núi lửa</span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        padding: '14px 20px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        border: '1px solid rgba(245, 158, 11, 0.25)'
      }}>
        {/* Pressure Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, whiteSpace: 'nowrap' }}>
            Áp Suất Buồng Magma: <b style={{ color: pressure >= 100 ? '#ef4444' : '#f59e0b', fontSize: '1.05rem', fontFamily: 'monospace' }}>{pressure} MPa</b>
          </span>
          <input 
            type="range" 
            min="20" 
            max="120" 
            step="5" 
            value={pressure} 
            onChange={e => {
              const val = Number(e.target.value);
              setPressure(val);
              if (val >= 100 && !isErupting) {
                setIsErupting(true);
                if (onLog) onLog("🌋 Áp suất vượt ngưỡng 100 MPa ➔ Núi lửa phun trào dữ dội!");
              }
            }} 
            style={{ flex: 1, accentColor: '#ef4444', cursor: 'pointer', height: '6px' }} 
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleIncreasePressure}
            style={{ 
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', 
              border: 'none', 
              color: '#fff', 
              borderRadius: '10px', 
              padding: '8px 16px', 
              fontSize: '0.82rem', 
              fontWeight: 900, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Flame size={15} /> Tăng Áp Suất (+20 MPa)
          </button>

          <button 
            onClick={handleTriggerErupt}
            style={{ 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
              border: 'none', 
              color: '#fff', 
              borderRadius: '10px', 
              padding: '8px 16px', 
              fontSize: '0.82rem', 
              fontWeight: 900, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)'
            }}
          >
            🌋 KÍCH HOẠT PHUN TRÀO
          </button>

          <button 
            onClick={handleReset}
            style={{ 
              background: '#334155', 
              border: '1px solid #64748b', 
              color: '#cbd5e1', 
              borderRadius: '10px', 
              padding: '8px 14px', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={14} /> Làm Lại
          </button>
        </div>
      </div>
    </div>
  );
}
