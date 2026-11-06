import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Activity, 
  Globe, 
  Layers, 
  RotateCcw, 
  Compass, 
  Maximize2, 
  Minimize2,
  Sliders,
  Radio,
  Flame,
  Volume2
} from 'lucide-react';

const FALLBACK_EARTHQUAKES = [
  { id: 'fb1', mag: 9.1, place: 'Tohoku, Đông Bắc Nhật Bản (Động đất & Sóng thần 2011)', coords: [142.37, 38.30, 29], time: 1299824784000, plate: 'Đới hút chìm Rãnh Nhật Bản (Mảng Thái Bình Dương chui dưới Mảng Bắc Mỹ)' },
  { id: 'fb2', mag: 9.1, place: 'Banda Aceh, Sumatra, Indonesia (Động đất Ấn Độ Dương 2004)', coords: [95.85, 3.31, 30], time: 1104022733000, plate: 'Đới hút chìm Rãnh Sunda (Mảng Ấn-Úc xô ép Mảng Á-Âu)' },
  { id: 'fb3', mag: 9.5, place: 'Valdivia, Chile (Trận động đất mạnh nhất lịch sử nhân loại 1960)', coords: [-73.05, -39.50, 33], time: -303292800000, plate: 'Đới hút chìm Rãnh Peru-Chile (Mảng Nazca chui dưới Mảng Nam Mỹ)' },
  { id: 'fb4', mag: 7.8, place: 'Kahramanmaraş, Thổ Nhĩ Kỳ & Syria (2023)', coords: [37.03, 37.17, 10], time: 1675647460000, plate: 'Đứt gãy Đông Anatolia (Mảng Ả Rập va chạm trượt Mảng Tiểu Á)' },
  { id: 'fb5', mag: 7.9, place: 'San Francisco, California, Hoa Kỳ (1906)', coords: [-122.50, 37.75, 8], time: -2010412800000, plate: 'Đứt gãy trượt bằng San Andreas (Mảng Thái Bình Dương - Bắc Mỹ)' },
  { id: 'fb6', mag: 7.7, place: 'Hoa Liên (Hualien), Đài Loan (2024)', coords: [121.60, 23.80, 15], time: 1712102280000, plate: 'Ranh giới va mảng Biển Philippines và mảng Á-Âu' },
  { id: 'fb7', mag: 6.8, place: 'Điện Biên - Lai Châu, Việt Nam (1935 & 1983)', coords: [103.01, 21.38, 12], time: 422582400000, plate: 'Đới đứt gãy Sông Mã & Sông Hồng (Tây Bắc Bộ Việt Nam)' },
  { id: 'fb8', mag: 7.4, place: 'Palu, Sulawesi, Indonesia (2018)', coords: [119.84, -0.25, 20], time: 1538130120000, plate: 'Đới đứt gãy trượt bằng Palu-Koro (Đông Nam Á)' },
  { id: 'fb9', mag: 7.6, place: 'Bán đảo Noto, Ishikawa, Nhật Bản (2024)', coords: [137.24, 37.50, 16], time: 1704092400000, plate: 'Ranh giới biến dạng nén ép Mảng Biển Nhật Bản' },
  { id: 'fb10', mag: 7.2, place: 'Quần đảo Kermadec, New Zealand', coords: [-178.80, -30.10, 34], time: 1679000000000, plate: 'Đới hút chìm Rãnh Tonga-Kermadec (Vành đai lửa TBD)' },
  { id: 'fb11', mag: 7.0, place: 'Port-au-Prince, Haiti (2010)', coords: [-72.53, 18.45, 13], time: 1263333200000, plate: 'Đới đứt gãy trượt Enriquillo-Plantain Garden (Vùng biển Caribe)' },
  { id: 'fb12', mag: 6.5, place: 'Acre, Tây Bắc Brazil (Động đất chấn tiêu sâu)', coords: [-70.80, -8.30, 608], time: 1642000000000, plate: 'Phần chìm sâu của Mảng Nazca dưới thạch quyển Nam Mỹ (Sâu 608km)' },
  { id: 'fb13', mag: 6.8, place: 'Khu vực Tonga - Fiji (Chấn tiêu siêu sâu)', coords: [-179.20, -21.10, 580], time: 1665000000000, plate: 'Mảng Thái Bình Dương chui sâu vào tầng Manti trên' },
  { id: 'fb14', mag: 5.8, place: 'Kon Plông, Kon Tum, Việt Nam (Động đất kích hoạt hồ chứa)', coords: [108.31, 14.85, 8], time: 1658000000000, plate: 'Đới đứt gãy Rào Quán - A Lưới - Kon Tum' }
];

const PACIFIC_RING_OF_FIRE = [
  [-71, -33], [-77, -12], [-88, 13], [-105, 20], [-122, 38], [-135, 57],
  [-150, 60], [-168, 53], [160, 52], [142, 38], [130, 32], [121, 24],
  [125, 10], [140, 0], [152, -5], [168, -15], [178, -38]
];

function geoLatLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function getQuakeColor(mag) {
  if (mag >= 8.0) return '#ef4444'; // Red
  if (mag >= 7.0) return '#ea580c'; // Orange
  if (mag >= 6.0) return '#eab308'; // Yellow
  return '#22c55e'; // Green
}

export function GeoEarthquake3DSim({ onLog, experiment, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const [viewMode, setViewMode] = useState('block3d'); // 'block3d' (3D Fault Block) or 'globe' (Global 3D Earth)
  const [faultType, setFaultType] = useState('reverse'); // 'reverse', 'normal', 'strike_slip'
  const [magnitude, setMagnitude] = useState(7.0); // 4.0 to 9.0 Richter
  const [focalDepth, setFocalDepth] = useState(25); // 10 to 100 km
  const [isShaking, setIsShaking] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // Globe state
  const [quakes, setQuakes] = useState(FALLBACK_EARTHQUAKES);
  const [selectedQuake, setSelectedQuake] = useState(FALLBACK_EARTHQUAKES[0]);
  const [minMag, setMinMag] = useState(5.0);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const reqIdRef = useRef(null);

  // Dynamic 3D Refs
  const faultBlockGroupRef = useRef(null);
  const hangingWallRef = useRef(null);
  const footwallRef = useRef(null);
  const buildingsGroupRef = useRef(null);
  const pWaveMeshRef = useRef(null);
  const sWaveMeshRef = useRef(null);
  const surfaceWaveMeshRef = useRef(null);
  const hypocenterMeshRef = useRef(null);
  const epicenterPinRef = useRef(null);

  const magnitudeRef = useRef(magnitude);
  magnitudeRef.current = magnitude;
  const isShakingRef = useRef(isShaking);
  isShakingRef.current = isShaking;
  const faultTypeRef = useRef(faultType);
  faultTypeRef.current = faultType;
  const focalDepthRef = useRef(focalDepth);
  focalDepthRef.current = focalDepth;
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

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

  // Try fetching USGS live feed
  useEffect(() => {
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.features) && data.features.length > 0) {
          const parsed = data.features.slice(0, 40).map(f => ({
            id: f.id,
            mag: Number(f.properties?.mag?.toFixed(1) || 5.0),
            place: f.properties?.place || 'Đới đứt gãy khu vực',
            coords: f.geometry?.coordinates || [0, 0, 10],
            time: f.properties?.time || Date.now(),
            plate: f.properties?.mag >= 7.0 ? 'Vành đai lửa Thái Bình Dương (Đứt gãy quy mô lớn)' : 'Đới đứt gãy khu vực'
          }));
          setQuakes(parsed);
          setSelectedQuake(parsed[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060f1e);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    camera.position.set(0, 36, 60);
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
    controls.update();
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x1e293b, 0.8);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 2.0);
    dirLight.position.set(30, 40, 25);
    scene.add(dirLight);

    // 6. BUILD MODE 1: 3D TECTONIC FAULT BLOCK (Khối Đứt Gãy Kiến Tạo 3D)
    const blockGroup = new THREE.Group();
    scene.add(blockGroup);
    faultBlockGroupRef.current = blockGroup;

    // A. Footwall Block (Khối cánh dưới)
    // Angled box geometry
    const footGeo = new THREE.BoxGeometry(22, 20, 36);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, flatShading: true });
    const footMesh = new THREE.Mesh(footGeo, footMat);
    footMesh.position.set(-11, 0, 0);
    blockGroup.add(footMesh);
    footwallRef.current = footMesh;

    // B. Hanging Wall Block (Khối cánh treo - di chuyển theo đứt gãy)
    const hangGeo = new THREE.BoxGeometry(22, 20, 36);
    const hangMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, flatShading: true });
    const hangMesh = new THREE.Mesh(hangGeo, hangMat);
    hangMesh.position.set(11, 0, 0);
    blockGroup.add(hangMesh);
    hangingWallRef.current = hangMesh;

    // C. Fault Plane Indicator (Mặt phẳng đứt gãy xiên phát sáng đỏ)
    const planeGeo = new THREE.PlaneGeometry(36, 24);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const faultPlane = new THREE.Mesh(planeGeo, planeMat);
    faultPlane.rotation.y = Math.PI / 2;
    faultPlane.position.set(0, 0, 0);
    blockGroup.add(faultPlane);

    // D. Surface Layer on top (Thảm đất và thực vật trên mặt đất)
    const surfMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
    const surf1 = new THREE.Mesh(new THREE.BoxGeometry(22, 0.6, 36), surfMat1);
    surf1.position.set(-11, 10.3, 0);
    blockGroup.add(surf1);

    const surfMat2 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
    const surf2 = new THREE.Mesh(new THREE.BoxGeometry(22, 0.6, 36), surfMat2);
    surf2.position.set(11, 10.3, 0);
    blockGroup.add(surf2);

    // E. 3D Buildings & Infrastructure on the Surface
    const bldGroup = new THREE.Group();
    blockGroup.add(bldGroup);
    buildingsGroupRef.current = bldGroup;

    // School / City block on hanging wall
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 8), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 }));
    b1.position.set(7, 14.5, -4);
    bldGroup.add(b1);

    const b2 = new THREE.Mesh(new THREE.BoxGeometry(5, 12, 6), new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 }));
    b2.position.set(13, 16.5, 4);
    bldGroup.add(b2);

    // Houses on footwall
    const b3 = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 6), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 }));
    b3.position.set(-8, 13, -3);
    bldGroup.add(b3);

    const b4 = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 5), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 }));
    b4.position.set(-14, 13.5, 5);
    bldGroup.add(b4);

    // F. Hypocenter Sphere (Chấn tiêu 3D phát sáng đỏ rực)
    const hypoGeo = new THREE.SphereGeometry(2.2, 24, 24);
    const hypoMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff3b00,
      emissiveIntensity: 2.5
    });
    const hypoMesh = new THREE.Mesh(hypoGeo, hypoMat);
    hypoMesh.position.set(0, -2, 0);
    blockGroup.add(hypoMesh);
    hypocenterMeshRef.current = hypoMesh;

    // G. Epicenter Pin on Surface (Tâm chấn trên mặt đất)
    const pinGeo = new THREE.ConeGeometry(1.2, 3.2, 8);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(0, 12, 0);
    pin.rotation.x = Math.PI; // Pointing down at epicenter
    blockGroup.add(pin);
    epicenterPinRef.current = pin;

    // Vertical line connecting Hypocenter to Epicenter
    const connectLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -2, 0),
      new THREE.Vector3(0, 10.5, 0)
    ]);
    const connectLineMat = new THREE.LineDashedMaterial({ color: 0xf59e0b, dashSize: 0.8, gapSize: 0.5 });
    const connectLine = new THREE.Line(connectLineGeo, connectLineMat);
    connectLine.computeLineDistances();
    blockGroup.add(connectLine);

    // H. 3D Spherical Seismic Waves
    // Primary P-Wave (Sóng dọc 3D - hình cầu màu lam)
    const pGeo = new THREE.SphereGeometry(1, 24, 24);
    const pMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    const pWave = new THREE.Mesh(pGeo, pMat);
    pWave.position.set(0, -2, 0);
    pWave.visible = false;
    blockGroup.add(pWave);
    pWaveMeshRef.current = pWave;

    // Secondary S-Wave (Sóng ngang 3D - hình cầu màu đỏ cam)
    const sGeo = new THREE.SphereGeometry(1, 24, 24);
    const sMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const sWave = new THREE.Mesh(sGeo, sMat);
    sWave.position.set(0, -2, 0);
    sWave.visible = false;
    blockGroup.add(sWave);
    sWaveMeshRef.current = sWave;

    // Surface Waves along crust
    const surfRingGeo = new THREE.RingGeometry(1, 1.5, 32);
    const surfRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const surfWave = new THREE.Mesh(surfRingGeo, surfRingMat);
    surfWave.rotation.x = -Math.PI / 2;
    surfWave.position.set(0, 10.6, 0);
    surfWave.visible = false;
    blockGroup.add(surfWave);
    surfaceWaveMeshRef.current = surfWave;

    // 7. BUILD MODE 2: 3D EARTH GLOBE FOR USGS LIVE FEED
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const earthR = 25;
    const earthGeo = new THREE.SphereGeometry(earthR, 36, 36);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.6,
      metalness: 0.1
    });
    const earthGlobe = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthGlobe);

    // Pacific Ring of Fire Curve
    try {
      const ringPts = PACIFIC_RING_OF_FIRE.map(([lon, lat]) => geoLatLonToVector3(lat, lon, earthR * 1.01));
      const ringCurve = new THREE.CatmullRomCurve3(ringPts, false);
      const ringGeom = new THREE.BufferGeometry().setFromPoints(ringCurve.getPoints(100));
      const ringLine = new THREE.Line(ringGeom, new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 }));
      globeGroup.add(ringLine);
    } catch (e) {}

    // Add Quake Pins onto Globe
    quakes.forEach(q => {
      const pos = geoLatLonToVector3(q.coords[1], q.coords[0], earthR * 1.008);
      const qPin = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(0.6, (q.mag - 3.5) * 0.35), 8, 8),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(getQuakeColor(q.mag)) })
      );
      qPin.position.copy(pos);
      globeGroup.add(qPin);
    });

    // Animation Loop
    let clock = new THREE.Clock();
    let waveProgress = 0;
    let shakeTimer = 0;

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const isCurShaking = isShakingRef.current;
      const curMag = magnitudeRef.current;
      const curDepth = focalDepthRef.current;
      const curType = faultTypeRef.current;
      const curView = viewModeRef.current;

      // Visibility based on view mode
      if (curView === 'block3d') {
        blockGroup.visible = true;
        globeGroup.visible = false;
      } else {
        blockGroup.visible = false;
        globeGroup.visible = true;
        globeGroup.rotation.y += delta * 0.15;
      }

      // Update Hypocenter Y position based on depth slider (10 to 100km -> Y: 6 to -8)
      const hypoY = 6 - (curDepth / 100) * 14;
      if (hypocenterMeshRef.current) {
        hypocenterMeshRef.current.position.y = hypoY;
      }

      // Fault slip displacement based on fault type
      if (hangingWallRef.current) {
        let targetY = 0;
        let targetZ = 0;
        if (isCurShaking) {
          const displacement = (curMag - 3.5) * 0.6;
          if (curType === 'reverse') {
            targetY = displacement; // Reverse fault: hanging wall thrusts UP
          } else if (curType === 'normal') {
            targetY = -displacement; // Normal fault: hanging wall drops DOWN
          } else {
            targetZ = displacement * 1.5; // Strike slip: horizontal translation
          }
        }
        hangingWallRef.current.position.y += (targetY - hangingWallRef.current.position.y) * 0.1;
        hangingWallRef.current.position.z += (targetZ - hangingWallRef.current.position.z) * 0.1;
      }

      // Seismic Wave propagation when shaking
      if (isCurShaking) {
        waveProgress += delta * 18;
        shakeTimer += delta;

        // Vibrate surface buildings
        if (buildingsGroupRef.current) {
          const shakeAmp = (curMag / 9.0) * 0.35;
          buildingsGroupRef.current.position.x = (Math.random() - 0.5) * shakeAmp;
          buildingsGroupRef.current.position.y = (Math.random() - 0.5) * shakeAmp;
          buildingsGroupRef.current.position.z = (Math.random() - 0.5) * shakeAmp;
        }

        // P-Wave Sphere expands rapidly
        if (pWaveMeshRef.current) {
          pWaveMeshRef.current.visible = true;
          pWaveMeshRef.current.position.y = hypoY;
          const s = Math.max(1, waveProgress * 1.6);
          pWaveMeshRef.current.scale.set(s, s, s);
          pWaveMeshRef.current.material.opacity = Math.max(0, 0.8 * (1 - s / 45));
        }

        // S-Wave Sphere follows slightly behind with larger amplitude
        if (sWaveMeshRef.current && waveProgress > 5) {
          sWaveMeshRef.current.visible = true;
          sWaveMeshRef.current.position.y = hypoY;
          const s = Math.max(1, (waveProgress - 5) * 1.2);
          sWaveMeshRef.current.scale.set(s, s, s);
          sWaveMeshRef.current.material.opacity = Math.max(0, 0.9 * (1 - s / 38));
        }

        // Surface Waves expand on crust surface
        if (surfaceWaveMeshRef.current && waveProgress > 10) {
          surfaceWaveMeshRef.current.visible = true;
          const r = Math.max(1, (waveProgress - 10) * 1.4);
          surfaceWaveMeshRef.current.scale.set(r, r, 1);
          surfaceWaveMeshRef.current.material.opacity = Math.max(0, 1.0 * (1 - r / 28));
        }

        // Auto stop shaking after wave completes (~3.5 seconds)
        if (shakeTimer > 3.5) {
          setIsShaking(false);
          isShakingRef.current = false;
          shakeTimer = 0;
          waveProgress = 0;
          if (pWaveMeshRef.current) pWaveMeshRef.current.visible = false;
          if (sWaveMeshRef.current) sWaveMeshRef.current.visible = false;
          if (surfaceWaveMeshRef.current) surfaceWaveMeshRef.current.visible = false;
          if (buildingsGroupRef.current) buildingsGroupRef.current.position.set(0, 0, 0);
        }
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
  }, [quakes]);

  const handleTriggerQuake = () => {
    setIsShaking(true);
    isShakingRef.current = true;
    if (onLog) {
      onLog(`💥 KÍCH HOẠT ĐỘNG ĐẤT M${magnitude.toFixed(1)} RICHTER! Chấn tiêu sâu ${focalDepth}km phát sóng dọc P và sóng ngang S làm chấn động toàn bộ bề mặt kiến tạo!`);
    }
  };

  const handleReset = () => {
    setIsShaking(false);
    isShakingRef.current = false;
    if (hangingWallRef.current) {
      hangingWallRef.current.position.set(11, 0, 0);
    }
    if (onLog) onLog("🔄 Đã làm mới mô hình Động đất 3D về trạng thái cân bằng ứng suất.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', background: '#020617', borderRadius: '16px', padding: '12px', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
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
          background: 'radial-gradient(ellipse at center, #0b1a30 0%, #030814 100%)'
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
            border: '1.5px solid rgba(249, 115, 22, 0.45)',
            padding: '8px 14px',
            borderRadius: '12px',
            color: '#f97316',
            fontWeight: 800,
            fontSize: '0.82rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1rem' }}>⚡</span>
            <span>{viewMode === 'block3d' ? 'Mô Hình 3D Khối Đứt Gãy Kiến Tạo & Sóng Địa Chấn P/S' : 'Quả Địa Cầu Địa Chấn 3D & Vành Đai Lửa TBD (USGS)'}</span>
          </div>

          {isShaking && (
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
              <span>🚨 ĐANG XẢY RA ĐỘNG ĐẤT:</span>
              <span>M{magnitude.toFixed(1)} Richter • Sóng P & S bung tỏa 3D từ Chấn tiêu (Sâu {focalDepth}km)</span>
            </div>
          )}
        </div>

        {/* Top Right Mode Toggle */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          display: 'flex',
          gap: '6px',
          zIndex: 10
        }}>
          <button
            onClick={() => setViewMode(prev => prev === 'block3d' ? 'globe' : 'block3d')}
            style={{
              background: viewMode === 'block3d' ? '#ea580c' : 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(249, 115, 22, 0.4)',
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
            {viewMode === 'block3d' ? <Layers size={14} /> : <Globe size={14} />}
            {viewMode === 'block3d' ? 'Khối Đứt Gãy 3D' : 'Quả Cầu Địa Chấn 3D'}
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
          <span>Kéo chuột xoay 360° | Cuộn phóng to/thu nhỏ | Chuột phải trượt góc nhìn</span>
          <span style={{ color: '#f97316', fontWeight: 700 }}>
            🔴 Chấn tiêu (Hypocenter) • 📍 Tâm chấn (Epicenter) • 🔵 Sóng dọc P • 🔴 Sóng ngang S
          </span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        padding: '12px 18px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        border: '1px solid rgba(249, 115, 22, 0.25)'
      }}>
        {/* Fault Type Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800 }}>LOẠI ĐỨT GÃY:</span>
          {[
            { key: 'reverse', label: 'Xô Húc / Nghịch' },
            { key: 'normal', label: 'Tách Dãn / Thuận' },
            { key: 'strike_slip', label: 'Trượt Bằng' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setFaultType(item.key)}
              style={{
                background: faultType === item.key ? '#ea580c' : '#1e293b',
                color: '#ffffff',
                border: faultType === item.key ? '1px solid #fdba74' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sliders for Richter & Focal Depth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '320px' }}>
          {/* Magnitude Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Cấp độ: <b style={{ color: '#ef4444', fontFamily: 'monospace' }}>M{magnitude.toFixed(1)}</b>
            </span>
            <input 
              type="range" 
              min="4.5" 
              max="9.0" 
              step="0.5" 
              value={magnitude} 
              onChange={e => setMagnitude(Number(e.target.value))} 
              style={{ flex: 1, accentColor: '#ef4444', cursor: 'pointer', height: '6px' }} 
            />
          </div>

          {/* Focal Depth Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Độ sâu: <b style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{focalDepth} km</b>
            </span>
            <input 
              type="range" 
              min="10" 
              max="100" 
              step="5" 
              value={focalDepth} 
              onChange={e => setFocalDepth(Number(e.target.value))} 
              style={{ flex: 1, accentColor: '#38bdf8', cursor: 'pointer', height: '6px' }} 
            />
          </div>
        </div>

        {/* Trigger Earthquake Action Button */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleTriggerQuake}
            disabled={isShaking}
            style={{ 
              background: isShaking ? 'rgba(239, 68, 68, 0.4)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
              border: 'none', 
              color: '#fff', 
              borderRadius: '10px', 
              padding: '8px 16px', 
              fontSize: '0.82rem', 
              fontWeight: 900, 
              cursor: isShaking ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isShaking ? 'none' : '0 0 16px rgba(239, 68, 68, 0.5)'
            }}
          >
            ⚡ {isShaking ? 'ĐANG CHẤN ĐỘNG...' : 'KÍCH HOẠT ĐỘNG ĐẤT'}
          </button>

          <button 
            onClick={handleReset}
            style={{ 
              background: '#334155', 
              border: '1px solid #64748b', 
              color: '#cbd5e1', 
              borderRadius: '10px', 
              padding: '8px 12px', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
