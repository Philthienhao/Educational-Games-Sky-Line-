import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Droplets, 
  Sun, 
  CloudRain, 
  Waves, 
  Layers, 
  RotateCcw, 
  Compass, 
  Maximize2, 
  Minimize2,
  Play,
  Pause
} from 'lucide-react';

export function GeoWaterCycle3DSim({ onLog, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const [activeStage, setActiveStage] = useState('all'); // 'all', 'evap', 'cond', 'precip', 'runoff', 'infilt'
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [speed, setSpeed] = useState(1);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const reqIdRef = useRef(null);

  // Particle systems
  const evapParticlesRef = useRef([]);
  const rainParticlesRef = useRef([]);
  const snowParticlesRef = useRef([]);
  const groundParticlesRef = useRef([]);
  const cloudsGroupRef = useRef(null);
  const sunMeshRef = useRef(null);

  const activeStageRef = useRef(activeStage);
  activeStageRef.current = activeStage;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const stagesInfo = {
    all: {
      title: 'VÒNG TUẦN HOÀN NƯỚC TOÀN CẦU (3D USGS Standard)',
      desc: 'Sự vận động khép kín không ngừng của nước giữa Đại dương, Khí quyển, Băng tuyết đỉnh núi và Mạch nước ngầm.',
      log: 'Tổng quan Vòng tuần hoàn nước 3D: Khép kín từ Bốc hơi biển -> Ngưng tụ mây -> Giáng thủy -> Dòng chảy mặt & Nước ngầm trả về đại dương.'
    },
    evap: {
      title: '1. BỐC HƠI & BỐC THOÁT HƠI (Evaporation & Transpiration)',
      desc: 'Nhiệt năng từ Mặt Trời nung nóng bề mặt biển & sông hồ làm nước lỏng chuyển hóa thành hơi nước bay vút lên khí quyển.',
      log: 'Giai đoạn 1 - Bốc hơi: Bức xạ Mặt Trời làm nước đại dương bốc hơi, kết hợp cây rừng bốc thoát hơi nước vào tầng đối lưu.'
    },
    cond: {
      title: '2. NGƯNG TỤ & HÌNH THÀNH MÂY (Condensation)',
      desc: 'Hơi nước lên cao gặp nhiệt độ lạnh ngưng kết thành hàng tỷ giọt nước li ti, kết tụ lại tạo thành các khối mây trắng bồng bềnh.',
      log: 'Giai đoạn 2 - Ngưng tụ: Hơi nước gặp lạnh đọng thành giọt li ti hình thành các đám mây tích tụ trên bầu trời.'
    },
    precip: {
      title: '3. GIÁNG THỦY - MƯA & TUYẾT RƠI (Precipitation)',
      desc: 'Khi các giọt nước trong mây tích tụ đủ nặng sẽ rơi xuống dưới dạng Mưa ở vùng thấp và Tuyết rơi phủ trắng đỉnh núi cao.',
      log: 'Giai đoạn 3 - Giáng thủy: Mưa rơi tưới mát đồng bằng, tuyết rơi tích tụ trên các đỉnh núi cao tạo nguồn băng hà.'
    },
    runoff: {
      title: '4. DÒNG CHẢY MẶT & SÔNG NGÒI (Surface Runoff)',
      desc: 'Băng tuyết núi tan chảy kết hợp với nước mưa hình thành các con suối nhỏ, hợp lưu thành dòng sông uốn lượn đổ ra biển lớn.',
      log: 'Giai đoạn 4 - Dòng chảy mặt: Tuyết tan và nước mưa hội tụ thành dòng sông lớn chảy xuyên qua đồng bằng đổ ra đại dương.'
    },
    infilt: {
      title: '5. THẤM & DÒNG CHẢY NGẦM (Infiltration & Groundwater Flow)',
      desc: 'Một phần nước mưa ngấm sâu qua các tầng đất đá tạo thành tầng ngậm nước (Aquifer) và âm thầm di chuyển ra đại dương.',
      log: 'Giai đoạn 5 - Thấm & Nước ngầm: Nước mưa ngấm qua khe nứt đất đá, hình thành túi nước ngầm và mạch nước ngầm đổ ra biển.'
    }
  };

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
    scene.background = new THREE.Color(0x0c1e33);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.set(0, 42, 75);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 150;
    controls.minDistance = 15;
    controls.target.set(0, 6, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent viewing underneath
    controls.update();
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.95);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x0284c7, 0.85);
    hemiLight.position.set(0, 60, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
    sunLight.position.set(35, 45, 25);
    scene.add(sunLight);

    // 6. Terrain Diorama Base Block
    // Total block size: 60 width (X: -30 to +30) x 16 height (Y: -16 to 0) x 50 depth (Z: -25 to +25)
    // Left side (X: -30 to 0): Mountains & Plains
    // Right side (X: 0 to +30): Ocean
    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);

    // Deep underground mantle/bedrock (Bottom brown layer)
    const bedrockGeo = new THREE.BoxGeometry(60, 8, 48);
    const bedrockMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const bedrockMesh = new THREE.Mesh(bedrockGeo, bedrockMat);
    bedrockMesh.position.set(0, -12, 0);
    dioramaGroup.add(bedrockMesh);

    // Porous Aquifer Layer (Tầng ngậm nước ngầm màu đất pha cát)
    const aquiferGeo = new THREE.BoxGeometry(32, 8, 48);
    const aquiferMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const aquiferMesh = new THREE.Mesh(aquiferGeo, aquiferMat);
    aquiferMesh.position.set(-14, -4, 0);
    dioramaGroup.add(aquiferMesh);

    // Underground Water Table (Mạch nước ngầm xanh biếc phát sáng nhẹ)
    const groundWaterGeo = new THREE.BoxGeometry(30, 2.5, 46);
    const groundWaterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.75
    });
    const groundWaterMesh = new THREE.Mesh(groundWaterGeo, groundWaterMat);
    groundWaterMesh.position.set(-15, -4, 0);
    dioramaGroup.add(groundWaterMesh);

    // Coastal Plains (Mặt đồng bằng đất thịt màu xanh lá cây)
    const plainsGeo = new THREE.BoxGeometry(32, 3, 48);
    const plainsMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const plainsMesh = new THREE.Mesh(plainsGeo, plainsMat);
    plainsMesh.position.set(-14, 1.5, 0);
    dioramaGroup.add(plainsMesh);

    // 7. Mountain Range with Snow Caps (Dãy núi cao phía Tây)
    // Mountain 1 (Main peak with snow)
    const mtnGeo1 = new THREE.ConeGeometry(14, 24, 7);
    const mtnMat1 = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9, flatShading: true });
    const mtn1 = new THREE.Mesh(mtnGeo1, mtnMat1);
    mtn1.position.set(-20, 15, -6);
    dioramaGroup.add(mtn1);

    // Snow Cap on Mountain 1
    const snowGeo1 = new THREE.ConeGeometry(5.2, 8.5, 7);
    const snowMat1 = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, flatShading: true });
    const snow1 = new THREE.Mesh(snowGeo1, snowMat1);
    snow1.position.set(-20, 22.8, -6);
    dioramaGroup.add(snow1);

    // Mountain 2 (Secondary peak)
    const mtnGeo2 = new THREE.ConeGeometry(10, 17, 6);
    const mtn2 = new THREE.Mesh(mtnGeo2, mtnMat1);
    mtn2.position.set(-22, 11, 10);
    dioramaGroup.add(mtn2);

    const snowGeo2 = new THREE.ConeGeometry(3.6, 6, 6);
    const snow2 = new THREE.Mesh(snowGeo2, snowMat1);
    snow2.position.set(-22, 16.5, 10);
    dioramaGroup.add(snow2);

    // Mountain 3 (Back ridge)
    const mtnGeo3 = new THREE.ConeGeometry(12, 19, 6);
    const mtn3 = new THREE.Mesh(mtnGeo3, mtnMat1);
    mtn3.position.set(-12, 12, -14);
    dioramaGroup.add(mtn3);

    const snowGeo3 = new THREE.ConeGeometry(4.2, 6.8, 6);
    const snow3 = new THREE.Mesh(snowGeo3, snowMat1);
    snow3.position.set(-12, 18.2, -14);
    dioramaGroup.add(snow3);

    // 8. 3D Winding River (Dòng sông uốn lượn từ núi tuyết đổ ra biển)
    const riverPoints = [
      new THREE.Vector3(-19, 10, -5), // Mountain source
      new THREE.Vector3(-16, 6, -3),
      new THREE.Vector3(-12, 3.2, 2),
      new THREE.Vector3(-8, 3.1, -4),
      new THREE.Vector3(-4, 3.1, 3),
      new THREE.Vector3(0, 3.0, 0), // Estuary / mouth of river
      new THREE.Vector3(3, 2.9, 0)
    ];
    const riverCurve = new THREE.CatmullRomCurve3(riverPoints);
    const riverGeo = new THREE.TubeGeometry(riverCurve, 28, 1.4, 8, false);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    dioramaGroup.add(riverMesh);

    // 9. 3D Ocean Section (Đại dương phía Đông)
    // Box dimensions: 28 width x 11 height x 48 depth
    const oceanGeo = new THREE.BoxGeometry(28, 11, 48);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.set(16, -2.5, 0);
    dioramaGroup.add(oceanMesh);

    // Ocean Surface Ripple Layer (Mặt nước đại dương phát sáng)
    const waterSurfaceGeo = new THREE.PlaneGeometry(28, 48, 16, 16);
    const waterSurfaceMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const waterSurface = new THREE.Mesh(waterSurfaceGeo, waterSurfaceMat);
    waterSurface.rotation.x = -Math.PI / 2;
    waterSurface.position.set(16, 3.05, 0);
    dioramaGroup.add(waterSurface);

    // 10. Glowing 3D Sun in Upper Right
    const sunGeo = new THREE.SphereGeometry(4.2, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(24, 28, -12);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Sun Corona Glow
    const coronaGeo = new THREE.SphereGeometry(5.8, 16, 16);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      side: THREE.BackSide
    });
    sunMesh.add(new THREE.Mesh(coronaGeo, coronaMat));

    // 11. Fluffy 3D Clouds Group
    const cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 1.0,
      transparent: true,
      opacity: 0.92
    });

    const createSingleCloud = (x, y, z, scale = 1) => {
      const cg = new THREE.Group();
      const p1 = new THREE.Mesh(new THREE.SphereGeometry(2.4 * scale, 12, 12), cloudMat);
      const p2 = new THREE.Mesh(new THREE.SphereGeometry(3.2 * scale, 12, 12), cloudMat);
      const p3 = new THREE.Mesh(new THREE.SphereGeometry(2.2 * scale, 12, 12), cloudMat);
      p2.position.set(2.2 * scale, 0.4 * scale, 0);
      p3.position.set(-2.0 * scale, 0.2 * scale, 0);
      cg.add(p1);
      cg.add(p2);
      cg.add(p3);
      cg.position.set(x, y, z);
      return cg;
    };

    const cloud1 = createSingleCloud(-14, 24, -4, 1.2); // Over mountain
    const cloud2 = createSingleCloud(4, 25, 6, 1.0);  // Over plain
    const cloud3 = createSingleCloud(18, 26, -6, 1.1); // Over ocean
    cloudsGroup.add(cloud1);
    cloudsGroup.add(cloud2);
    cloudsGroup.add(cloud3);
    scene.add(cloudsGroup);
    cloudsGroupRef.current = cloudsGroup;

    // 12. Dynamic Particle Streams
    // A. Evaporation Particles (Lam ngọc bốc lên từ biển)
    const evapCount = 100;
    const evapParticles = [];
    const evapGeo = new THREE.SphereGeometry(0.3, 6, 6);
    const evapMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.8 });
    const evapGroup = new THREE.Group();
    for (let i = 0; i < evapCount; i++) {
      const m = new THREE.Mesh(evapGeo, evapMat);
      m.position.set(
        4 + Math.random() * 24,
        3.2 + Math.random() * 22,
        (Math.random() - 0.5) * 44
      );
      m.userData = { vy: 0.12 + Math.random() * 0.15, vx: -0.05 - Math.random() * 0.08 };
      evapGroup.add(m);
      evapParticles.push(m);
    }
    scene.add(evapGroup);
    evapParticlesRef.current = evapParticles;

    // B. Rain Particles (Mưa rơi xuống thung lũng & đồng bằng)
    const rainCount = 160;
    const rainParticles = [];
    const rainGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 4);
    const rainMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const rainGroup = new THREE.Group();
    for (let i = 0; i < rainCount; i++) {
      const rm = new THREE.Mesh(rainGeo, rainMat);
      rm.position.set(
        -18 + Math.random() * 24,
        4 + Math.random() * 20,
        (Math.random() - 0.5) * 36
      );
      rm.userData = { vy: 0.45 + Math.random() * 0.4 };
      rainGroup.add(rm);
      rainParticles.push(rm);
    }
    scene.add(rainGroup);
    rainParticlesRef.current = rainParticles;

    // C. Snow Particles (Tuyết rơi trên đỉnh núi cao)
    const snowCount = 80;
    const snowParticles = [];
    const snowPGeo = new THREE.SphereGeometry(0.25, 6, 6);
    const snowPMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const snowGroup = new THREE.Group();
    for (let i = 0; i < snowCount; i++) {
      const sm = new THREE.Mesh(snowPGeo, snowPMat);
      sm.position.set(
        -26 + Math.random() * 12,
        14 + Math.random() * 12,
        -16 + Math.random() * 24
      );
      sm.userData = { vy: 0.08 + Math.random() * 0.08, vx: (Math.random() - 0.5) * 0.04 };
      snowGroup.add(sm);
      snowParticles.push(sm);
    }
    scene.add(snowGroup);
    snowParticlesRef.current = snowParticles;

    // D. Groundwater Particles (Nước ngầm di chuyển âm thầm qua lòng đất)
    const groundCount = 60;
    const groundParticles = [];
    const gGeo = new THREE.SphereGeometry(0.28, 6, 6);
    const gMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const gGroup = new THREE.Group();
    for (let i = 0; i < groundCount; i++) {
      const gm = new THREE.Mesh(gGeo, gMat);
      gm.position.set(
        -28 + Math.random() * 28,
        -5 + (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 40
      );
      gm.userData = { vx: 0.06 + Math.random() * 0.08 };
      gGroup.add(gm);
      groundParticles.push(gm);
    }
    scene.add(gGroup);
    groundParticlesRef.current = groundParticles;

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const curSpeed = speedRef.current;
      const curStage = activeStageRef.current;

      // Sun pulse
      if (sunMeshRef.current) {
        sunMeshRef.current.rotation.y += delta * 0.2;
      }

      // Clouds gentle drift
      if (cloudsGroupRef.current) {
        cloudsGroupRef.current.children.forEach((c, idx) => {
          c.position.x -= delta * (0.8 + idx * 0.2) * curSpeed;
          if (c.position.x < -32) {
            c.position.x = 28;
          }
        });
      }

      // 1. Evaporation Particles
      const showEvap = curStage === 'all' || curStage === 'evap';
      evapParticlesRef.current.forEach(p => {
        p.visible = showEvap;
        if (showEvap) {
          p.position.y += p.userData.vy * curSpeed;
          p.position.x += p.userData.vx * curSpeed;
          if (p.position.y > 25 || p.position.x < -4) {
            p.position.y = 3.2;
            p.position.x = 4 + Math.random() * 24;
            p.position.z = (Math.random() - 0.5) * 44;
          }
        }
      });

      // 2. Rain Particles
      const showRain = curStage === 'all' || curStage === 'precip';
      rainParticlesRef.current.forEach(p => {
        p.visible = showRain;
        if (showRain) {
          p.position.y -= p.userData.vy * curSpeed;
          if (p.position.y < 3.2) {
            p.position.y = 24 + Math.random() * 4;
            p.position.x = -18 + Math.random() * 24;
            p.position.z = (Math.random() - 0.5) * 36;
          }
        }
      });

      // 3. Snow Particles
      const showSnow = curStage === 'all' || curStage === 'precip';
      snowParticlesRef.current.forEach(p => {
        p.visible = showSnow;
        if (showSnow) {
          p.position.y -= p.userData.vy * curSpeed;
          p.position.x += p.userData.vx * curSpeed;
          if (p.position.y < 12) {
            p.position.y = 26;
            p.position.x = -26 + Math.random() * 12;
            p.position.z = -16 + Math.random() * 24;
          }
        }
      });

      // 4. Groundwater Particles
      const showGround = curStage === 'all' || curStage === 'infilt';
      groundParticlesRef.current.forEach(p => {
        p.visible = showGround;
        if (showGround) {
          p.position.x += p.userData.vx * curSpeed;
          if (p.position.x > 2) {
            p.position.x = -28;
            p.position.z = (Math.random() - 0.5) * 40;
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

  // Handle stage selection & camera fly-to
  const handleSelectStage = (stageKey) => {
    setActiveStage(stageKey);
    activeStageRef.current = stageKey;
    if (onLog && stagesInfo[stageKey]) {
      onLog(stagesInfo[stageKey].log);
    }

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (stageKey === 'all') {
      camera.position.set(0, 42, 75);
      controls.target.set(0, 6, 0);
    } else if (stageKey === 'evap') {
      // Focus on ocean & rising vapor
      camera.position.set(28, 22, 38);
      controls.target.set(16, 8, 0);
    } else if (stageKey === 'cond') {
      // Focus on clouds & upper sky
      camera.position.set(0, 36, 45);
      controls.target.set(0, 24, 0);
    } else if (stageKey === 'precip') {
      // Focus on mountain rain & snow
      camera.position.set(-15, 26, 42);
      controls.target.set(-16, 14, -2);
    } else if (stageKey === 'runoff') {
      // Focus on river path
      camera.position.set(-6, 20, 36);
      controls.target.set(-8, 4, 0);
    } else if (stageKey === 'infilt') {
      // Focus on cross section underground
      camera.position.set(-12, 6, 52);
      controls.target.set(-12, -4, 0);
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
          background: 'radial-gradient(ellipse at center, #0e294b 0%, #030a16 100%)'
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
          maxWidth: '550px'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            padding: '8px 14px',
            borderRadius: '12px',
            color: '#38bdf8',
            fontWeight: 800,
            fontSize: '0.82rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1rem' }}>💧</span>
            <span>{stagesInfo[activeStage]?.title || 'Mô Hình 3D Vòng Tuần Hoàn Nước'}</span>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            borderLeft: '3px solid #38bdf8',
            padding: '6px 12px',
            borderRadius: '8px',
            color: '#cbd5e1',
            fontSize: '0.74rem',
            lineHeight: 1.4
          }}>
            {stagesInfo[activeStage]?.desc}
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
          <span>Kéo chuột xoay 360° | Cuộn phóng to/thu nhỏ | Chuột phải trượt góc nhìn</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>Đại dương ➔ Hơi nước ➔ Mây ➔ Mưa/Tuyết ➔ Sông ngòi ➔ Mạch nước ngầm</span>
        </div>
      </div>

      {/* Interactive Stages Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        padding: '12px 16px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        border: '1px solid rgba(13, 148, 136, 0.25)'
      }}>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginRight: '4px' }}>
          GIAI ĐOẠN:
        </span>

        {[
          { key: 'all', label: '🌐 Toàn Cảnh Vòng Tuần Hoàn' },
          { key: 'evap', label: '☀️ 1. Bốc Hơi Đại Dương' },
          { key: 'cond', label: '☁️ 2. Ngưng Tụ Tạo Mây' },
          { key: 'precip', label: '🌧️ 3. Mưa & Tuyết Rơi' },
          { key: 'runoff', label: '🌊 4. Dòng Chảy Mặt & Sông' },
          { key: 'infilt', label: '💧 5. Thấm & Nước Ngầm' }
        ].map(stage => {
          const isActive = activeStage === stage.key;
          return (
            <button
              key={stage.key}
              onClick={() => handleSelectStage(stage.key)}
              style={{
                background: isActive 
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                  : 'rgba(30, 41, 59, 0.8)',
                color: isActive ? '#ffffff' : '#cbd5e1',
                border: isActive ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                fontWeight: isActive ? 900 : 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 16px rgba(2, 132, 199, 0.5)' : 'none'
              }}
            >
              {stage.label}
            </button>
          );
        })}

        {/* Speed Controls */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Tốc độ:</span>
          {[0.5, 1, 2].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                background: speed === s ? '#0d9488' : '#1e293b',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
