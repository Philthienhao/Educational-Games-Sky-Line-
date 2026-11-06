import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- ATOMIC CONSTANTS & CPK COLOR STANDARDS ---
const ATOM_CONFIG = {
  C: { name: 'Carbon', symbol: 'C', color: '#1e293b', specular: '#64748b', radiusBall: 0.28, radiusFill: 0.62 },
  H: { name: 'Hydrogen', symbol: 'H', color: '#f8fafc', specular: '#ffffff', radiusBall: 0.18, radiusFill: 0.42 },
  Cl: { name: 'Chlorine', symbol: 'Cl', color: '#22c55e', specular: '#86efac', radiusBall: 0.35, radiusFill: 0.72 }
};

// Molecule database matching Vietnamese textbooks & Tongjiang-lab
const MOLECULES_DB = {
  CH4: {
    key: 'CH4',
    name: 'Metan (Methane)',
    formula: 'CH₄',
    category: 'Ankan (Alkane)',
    geometry: 'Tứ diện đều (Regular Tetrahedron)',
    angle: '109.5° (109°28\')',
    bondLength: 'C—H: 109 pm',
    rotatable: false,
    desc: 'Phân tử có 5 nguyên tử không cùng nằm trên một mặt phẳng. Nguyên tử Carbon ở tâm, 4 nguyên tử Hydrogen ở 4 đỉnh của hình tứ diện đều. 4 liên kết C—H hoàn toàn tương đương nhau.',
    examNote: 'Trọng tâm SGK: Metan là hình tứ diện đều, góc liên kết 109.5°. Không phải hình vuông phẳng!',
    atoms: [
      { el: 'C', pos: [0, 0, 0] },
      { el: 'H', pos: [0.65, 0.65, 0.65] },
      { el: 'H', pos: [0.65, -0.65, -0.65] },
      { el: 'H', pos: [-0.65, 0.65, -0.65] },
      { el: 'H', pos: [-0.65, -0.65, 0.65] }
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 }
    ]
  },
  CH2Cl2: {
    key: 'CH2Cl2',
    name: 'Điclorometan (Dichloromethane)',
    formula: 'CH₂Cl₂',
    category: 'Dẫn xuất Halogen',
    geometry: 'Tứ diện biến dạng (Distorted Tetrahedron)',
    angle: 'Cl—C—Cl ≈ 112°',
    bondLength: 'C—Cl: 176 pm • C—H: 109 pm',
    rotatable: false,
    desc: 'Do 4 đỉnh của tứ diện đều là tương đương, dù thay thế 2 nguyên tử H ở vị trí nào cũng chỉ thu được 1 chất duy nhất CH₂Cl₂. Điều này chứng minh Metan có cấu trúc không gian tứ diện chứ không phải hình vuông phẳng (nếu phẳng sẽ có 2 đồng phân cis/trans).',
    examNote: 'Câu hỏi kinh điển: CH₂Cl₂ chỉ có 1 đồng phân duy nhất, khẳng định cấu trúc tứ diện của CH₄.',
    atoms: [
      { el: 'C', pos: [0, 0, 0] },
      { el: 'H', pos: [0.65, 0.65, 0.65] },
      { el: 'H', pos: [0.65, -0.65, -0.65] },
      { el: 'Cl', pos: [-0.85, 0.85, -0.85] },
      { el: 'Cl', pos: [-0.85, -0.85, 0.85] }
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 }
    ]
  },
  C2H6: {
    key: 'C2H6',
    name: 'Etan (Ethane)',
    formula: 'C₂H₆',
    category: 'Ankan (Alkane)',
    geometry: 'Chuỗi 2 tứ diện ghép chung đỉnh',
    angle: 'H—C—H ≈ 109.5°',
    bondLength: 'C—C: 154 pm • C—H: 109 pm',
    rotatable: true,
    desc: 'Liên kết đơn C—C là liên kết σ có tính đối xứng trục, cho phép hai nhóm metyl (-CH₃) quay tự do xung quanh trục liên kết mà không bị phá vỡ. Sự quay này tạo ra các cấu dạng khác nhau (xen kẽ và che khuất), nhưng không tạo ra chất mới.',
    examNote: 'Liên kết đơn C—C quay tự do được. Liên kết đôi C=C và liên kết ba C≡C KHÔNG quay được!',
    buildAtoms: (rotDeg = 0) => {
      const rad = (rotDeg * Math.PI) / 180;
      const ccHalf = 0.55;
      const hDist = 0.62;
      const hY = 0.35;
      return [
        { el: 'C', pos: [-ccHalf, 0, 0] },
        { el: 'C', pos: [ccHalf, 0, 0] },
        // Left methyl (fixed)
        { el: 'H', pos: [-ccHalf - 0.4, hDist, 0] },
        { el: 'H', pos: [-ccHalf - 0.4, -hY, hDist * 0.866] },
        { el: 'H', pos: [-ccHalf - 0.4, -hY, -hDist * 0.866] },
        // Right methyl (rotatable around X-axis)
        { el: 'H', pos: [ccHalf + 0.4, hDist * Math.cos(rad), hDist * Math.sin(rad)] },
        { el: 'H', pos: [ccHalf + 0.4, -hY * Math.cos(rad) - hDist * 0.866 * Math.sin(rad), -hY * Math.sin(rad) + hDist * 0.866 * Math.cos(rad)] },
        { el: 'H', pos: [ccHalf + 0.4, -hY * Math.cos(rad) + hDist * 0.866 * Math.sin(rad), -hY * Math.sin(rad) - hDist * 0.866 * Math.cos(rad)] }
      ];
    },
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 1, b: 5, order: 1 },
      { a: 1, b: 6, order: 1 },
      { a: 1, b: 7, order: 1 }
    ]
  },
  C2H4: {
    key: 'C2H4',
    name: 'Etilen (Ethene)',
    formula: 'C₂H₄',
    category: 'Anken (Alkene)',
    geometry: 'Phẳng (Planar) - 6 nguyên tử đồng phẳng',
    angle: 'H—C—H ≈ 117° • H—C=C ≈ 121.5°',
    bondLength: 'C=C: 133 pm (ngắn hơn đơn) • C—H: 109 pm',
    rotatable: false,
    desc: 'Liên kết đôi C=C gồm 1 liên kết σ bền và 1 liên kết π kém bền. Sự xen phủ bên của liên kết π khóa chặt trục quay, giữ toàn bộ 6 nguyên tử của phân tử nằm trên cùng 1 mặt phẳng. Phân tử không thể quay quanh trục C=C.',
    examNote: 'Trọng tâm thi: Toàn bộ 6 nguyên tử của Etilen cùng nằm trên MỘT MẶT PHẲNG! Không thể quay quanh nối đôi.',
    atoms: [
      { el: 'C', pos: [-0.5, 0, 0] },
      { el: 'C', pos: [0.5, 0, 0] },
      { el: 'H', pos: [-1.0, 0.65, 0] },
      { el: 'H', pos: [-1.0, -0.65, 0] },
      { el: 'H', pos: [1.0, 0.65, 0] },
      { el: 'H', pos: [1.0, -0.65, 0] }
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 1, b: 4, order: 1 },
      { a: 1, b: 5, order: 1 }
    ]
  },
  C2H2: {
    key: 'C2H2',
    name: 'Axetilen (Ethyne)',
    formula: 'C₂H₂',
    category: 'Ankin (Alkyne)',
    geometry: 'Đường thẳng (Linear) - 4 nguyên tử thẳng hàng',
    angle: 'H—C≡C = 180°',
    bondLength: 'C≡C: 120 pm (rất ngắn & bền) • C—H: 106 pm',
    rotatable: false,
    desc: 'Liên kết ba C≡C gồm 1 liên kết σ và 2 liên kết π vuông góc nhau. Hai nguyên tử Carbon ở trạng thái lai hóa sp, kéo 4 nguyên tử xếp thẳng hàng trên một đường thẳng (góc liên kết 180°).',
    examNote: 'Trọng tâm thi: Phân tử Axetilen có 4 nguyên tử THẲNG HÀNG (góc 180°). Liên kết ba ngắn nhất trong chuỗi C-C.',
    atoms: [
      { el: 'C', pos: [-0.4, 0, 0] },
      { el: 'C', pos: [0.4, 0, 0] },
      { el: 'H', pos: [-1.2, 0, 0] },
      { el: 'H', pos: [1.2, 0, 0] }
    ],
    bonds: [
      { a: 0, b: 1, order: 3 },
      { a: 0, b: 2, order: 1 },
      { a: 1, b: 3, order: 1 }
    ]
  },
  C6H6: {
    key: 'C6H6',
    name: 'Benzen (Benzene)',
    formula: 'C₆H₆',
    category: 'Aren (Arene - Hidrocacbon thơm)',
    geometry: 'Mặt phẳng lục giác đều (Planar Regular Hexagon)',
    angle: 'C—C—C = 120° • C—C—H = 120°',
    bondLength: '6 liên kết C—C hoàn toàn bằng nhau: 139 pm',
    rotatable: false,
    desc: 'Tất cả 12 nguyên tử (6 C và 6 H) đều nằm trên cùng một mặt phẳng. 6 liên kết C—C có độ dài 139 pm, nằm trung gian giữa liên kết đơn C—C (154 pm) và liên kết đôi C=C (133 pm). Hệ 6 electron π giải tỏa đều trên toàn vòng thơm.',
    examNote: 'Trọng tâm thi: Benzen KHÔNG có liên kết đơn và đôi xen kẽ thông thường; 6 liên kết C-C HOÀN TOÀN TƯƠNG ĐƯƠNG nhau (139 pm)!',
    atoms: (() => {
      const atoms = [];
      const rC = 0.95;
      const rH = 1.65;
      for (let i = 0; i < 6; i++) {
        const theta = (i * 60 * Math.PI) / 180;
        atoms.push({ el: 'C', pos: [rC * Math.cos(theta), rC * Math.sin(theta), 0] });
      }
      for (let i = 0; i < 6; i++) {
        const theta = (i * 60 * Math.PI) / 180;
        atoms.push({ el: 'H', pos: [rH * Math.cos(theta), rH * Math.sin(theta), 0] });
      }
      return atoms;
    })(),
    bonds: [
      { a: 0, b: 1, order: 1.5 },
      { a: 1, b: 2, order: 1.5 },
      { a: 2, b: 3, order: 1.5 },
      { a: 3, b: 4, order: 1.5 },
      { a: 4, b: 5, order: 1.5 },
      { a: 5, b: 0, order: 1.5 },
      { a: 0, b: 6, order: 1 },
      { a: 1, b: 7, order: 1 },
      { a: 2, b: 8, order: 1 },
      { a: 3, b: 9, order: 1 },
      { a: 4, b: 10, order: 1 },
      { a: 5, b: 11, order: 1 }
    ]
  },
  C4H10: {
    key: 'C4H10',
    name: 'n-Butan (Normal Butane)',
    formula: 'C₄H₁₀ (Mạch thẳng)',
    category: 'Đồng phân Cấu tạo (Isomers)',
    geometry: 'Mạch Carbon gấp khúc liên tục',
    angle: 'C—C—C ≈ 109.5°',
    bondLength: 'C—C: 154 pm • C—H: 109 pm',
    rotatable: true,
    desc: 'Butan mạch không phân nhánh có 4 nguyên tử Carbon liên kết thành chuỗi ziczac gấp khúc. Nhiệt độ sôi: -0.5°C. Có thể quay tự do tại các liên kết đơn để biến đổi qua lại giữa dạng anti và gauche.',
    examNote: 'Cùng công thức phân tử C₄H₁₀ nhưng n-butan và isobutan có cấu tạo mạch khác nhau -> tính chất vật lý khác nhau.',
    atoms: [
      { el: 'C', pos: [-1.35, -0.25, 0] },
      { el: 'C', pos: [-0.45, 0.35, 0] },
      { el: 'C', pos: [0.45, -0.25, 0] },
      { el: 'C', pos: [1.35, 0.35, 0] },
      // H atoms
      { el: 'H', pos: [-1.9, 0.1, 0.45] },
      { el: 'H', pos: [-1.9, 0.1, -0.45] },
      { el: 'H', pos: [-1.4, -0.85, 0] },
      { el: 'H', pos: [-0.45, 0.95, 0.55] },
      { el: 'H', pos: [-0.45, 0.95, -0.55] },
      { el: 'H', pos: [0.45, -0.85, 0.55] },
      { el: 'H', pos: [0.45, -0.85, -0.55] },
      { el: 'H', pos: [1.9, 0.0, 0.45] },
      { el: 'H', pos: [1.9, 0.0, -0.45] },
      { el: 'H', pos: [1.35, 0.95, 0] }
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 1, b: 2, order: 1 },
      { a: 2, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 0, b: 5, order: 1 },
      { a: 0, b: 6, order: 1 },
      { a: 1, b: 7, order: 1 },
      { a: 1, b: 8, order: 1 },
      { a: 2, b: 9, order: 1 },
      { a: 2, b: 10, order: 1 },
      { a: 3, b: 11, order: 1 },
      { a: 3, b: 12, order: 1 },
      { a: 3, b: 13, order: 1 }
    ]
  },
  iC4H10: {
    key: 'iC4H10',
    name: 'Isobutan (Isobutane / 2-Metylpropan)',
    formula: 'C₄H₁₀ (Mạch nhánh)',
    category: 'Đồng phân Cấu tạo (Isomers)',
    geometry: 'Mạch Carbon phân nhánh (Dạng chân vạc)',
    angle: 'C—C—C ≈ 109.5°',
    bondLength: 'C—C: 154 pm • C—H: 109 pm',
    rotatable: true,
    desc: 'Có 1 nguyên tử Carbon trung tâm liên kết với 3 nhóm metyl (-CH₃) xung quanh và 1 nguyên tử H. Dạng phân tử cầu gọn hơn n-butan nên lực van der Waals yếu hơn, nhiệt độ sôi thấp hơn (-11.7°C so với -0.5°C của n-butan).',
    examNote: 'So sánh đồng phân: Phân tử càng phân nhánh thì diện tích tiếp xúc càng nhỏ -> nhiệt độ sôi càng giảm.',
    atoms: [
      { el: 'C', pos: [0, 0, 0] },
      { el: 'C', pos: [0, 0.95, 0] },
      { el: 'C', pos: [-0.85, -0.45, 0.45] },
      { el: 'C', pos: [0.85, -0.45, -0.45] },
      { el: 'H', pos: [0, -0.6, -0.7] },
      // CH3 top
      { el: 'H', pos: [0, 1.55, 0] },
      { el: 'H', pos: [0.55, 0.95, 0.55] },
      { el: 'H', pos: [-0.55, 0.95, -0.55] },
      // CH3 left
      { el: 'H', pos: [-1.45, -0.45, 0.45] },
      { el: 'H', pos: [-0.65, -1.05, 0.45] },
      { el: 'H', pos: [-0.65, -0.15, 1.05] },
      // CH3 right
      { el: 'H', pos: [1.45, -0.45, -0.45] },
      { el: 'H', pos: [0.65, -1.05, -0.45] },
      { el: 'H', pos: [0.65, -0.15, -1.05] }
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 1, b: 5, order: 1 },
      { a: 1, b: 6, order: 1 },
      { a: 1, b: 7, order: 1 },
      { a: 2, b: 8, order: 1 },
      { a: 2, b: 9, order: 1 },
      { a: 2, b: 10, order: 1 },
      { a: 3, b: 11, order: 1 },
      { a: 3, b: 12, order: 1 },
      { a: 3, b: 13, order: 1 }
    ]
  }
};

export function KhtnChemBallStick3DSim({ onLog, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const [selectedMolKey, setSelectedMolKey] = useState('CH4');
  const [viewMode, setViewMode] = useState('ball_stick'); // 'ball_stick' or 'space_filling'
  const [rotAngle, setRotAngle] = useState(0); // for C-C rotation in C2H6
  const [showLabels, setShowLabels] = useState(true);
  const [showPlaneGuide, setShowPlaneGuide] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

  const sceneRef = useRef(null);
  const molGroupRef = useRef(null);
  const guidesGroupRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const currentMol = MOLECULES_DB[selectedMolKey];

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
    camera.position.set(2.8, 2.2, 4.0);

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
    controls.maxDistance = 15.0;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(5, 10, 7);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.7);
    dirLight2.position.set(-6, -4, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xf59e0b, 0.6, 10);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // Lab Workbench Grid Floor
    const gridHelper = new THREE.GridHelper(10, 20, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -1.8;
    scene.add(gridHelper);

    // Molecular root groups
    const molGroup = new THREE.Group();
    molGroupRef.current = molGroup;
    scene.add(molGroup);

    const guidesGroup = new THREE.Group();
    guidesGroupRef.current = guidesGroup;
    scene.add(guidesGroup);

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

    // Animation Loop (Safe single-loop RAF protocol - Rule 16)
    const animate = () => {
      controls.update();
      if (autoRotate && molGroupRef.current) {
        molGroupRef.current.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    if (onLog) {
      onLog(`Khởi tạo Mô hình Phân tử 3D WebGL (Chuẩn SGK KHTN & Hóa học). Đang hiển thị: ${currentMol.name}.`);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  // Re-build 3D Molecular Mesh whenever Molecule, ViewMode, or Rotation changes
  useEffect(() => {
    if (!molGroupRef.current || !guidesGroupRef.current) return;
    const molGroup = molGroupRef.current;
    const guidesGroup = guidesGroupRef.current;

    // Clear previous children
    while (molGroup.children.length > 0) {
      const obj = molGroup.children[0];
      molGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
    while (guidesGroup.children.length > 0) {
      const obj = guidesGroup.children[0];
      guidesGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    const mol = currentMol;
    const atomsData = mol.buildAtoms ? mol.buildAtoms(rotAngle) : mol.atoms;
    const isSpaceFill = viewMode === 'space_filling';

    // 1. Build Atoms
    const atomSpheres = [];
    atomsData.forEach((atom, idx) => {
      const cfg = ATOM_CONFIG[atom.el] || ATOM_CONFIG.C;
      const radius = isSpaceFill ? cfg.radiusFill : cfg.radiusBall;
      
      const geom = new THREE.SphereGeometry(radius, 32, 32);
      const mat = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        roughness: 0.25,
        metalness: 0.05,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        reflectivity: 0.9
      });

      const sphere = new THREE.Mesh(geom, mat);
      sphere.position.set(atom.pos[0], atom.pos[1], atom.pos[2]);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      molGroup.add(sphere);
      atomSpheres.push(sphere);

      // Atom Label Canvas Sprite
      if (showLabels && !isSpaceFill) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = atom.el === 'H' ? '#38bdf8' : atom.el === 'Cl' ? '#4ade80' : '#fbbf24';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(atom.el, 64, 46);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(atom.pos[0], atom.pos[1] + radius + 0.18, atom.pos[2]);
        sprite.scale.set(0.4, 0.2, 1);
        molGroup.add(sprite);
      }
    });

    // 2. Build Chemical Bonds (only in Ball-and-Stick mode)
    if (!isSpaceFill && mol.bonds) {
      mol.bonds.forEach((bond) => {
        const p1 = new THREE.Vector3(...atomsData[bond.a].pos);
        const p2 = new THREE.Vector3(...atomsData[bond.b].pos);
        const distance = p1.distanceTo(p2);
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        // Single, Double, Triple, or Aromatic Bond
        if (bond.order === 1) {
          const bondGeom = new THREE.CylinderGeometry(0.065, 0.065, distance, 16);
          const bondMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.4, metalness: 0.2 });
          const bondMesh = new THREE.Mesh(bondGeom, bondMat);
          bondMesh.position.copy(midPoint);
          bondMesh.quaternion.copy(orientation);
          bondMesh.castShadow = true;
          molGroup.add(bondMesh);
        } else if (bond.order === 2) {
          // Double Bond: 2 parallel cylinders
          const offsetDist = 0.09;
          const up = new THREE.Vector3(0, 0, 1);
          const right = new THREE.Vector3().crossVectors(dir, up).normalize();

          [-offsetDist, offsetDist].forEach((off) => {
            const bondGeom = new THREE.CylinderGeometry(0.05, 0.05, distance, 14);
            const bondMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.35, metalness: 0.3 });
            const bondMesh = new THREE.Mesh(bondGeom, bondMat);
            const offPos = midPoint.clone().addScaledVector(right, off);
            bondMesh.position.copy(offPos);
            bondMesh.quaternion.copy(orientation);
            molGroup.add(bondMesh);
          });
        } else if (bond.order === 3) {
          // Triple Bond: 3 cylinders
          const offsetDist = 0.095;
          const up = new THREE.Vector3(0, 1, 0);
          const right = new THREE.Vector3().crossVectors(dir, up).normalize();
          const normal = new THREE.Vector3().crossVectors(dir, right).normalize();

          [
            new THREE.Vector3(0, 0, 0),
            right.clone().multiplyScalar(offsetDist),
            normal.clone().multiplyScalar(offsetDist)
          ].forEach((offVec) => {
            const bondGeom = new THREE.CylinderGeometry(0.045, 0.045, distance, 14);
            const bondMat = new THREE.MeshStandardMaterial({ color: '#ec4899', roughness: 0.35, metalness: 0.3 });
            const bondMesh = new THREE.Mesh(bondGeom, bondMat);
            bondMesh.position.copy(midPoint.clone().add(offVec));
            bondMesh.quaternion.copy(orientation);
            molGroup.add(bondMesh);
          });
        } else if (bond.order === 1.5) {
          // Benzene Aromatic Ring Bond
          const bondGeom = new THREE.CylinderGeometry(0.07, 0.07, distance, 16);
          const bondMat = new THREE.MeshStandardMaterial({ color: '#818cf8', roughness: 0.3, metalness: 0.3 });
          const bondMesh = new THREE.Mesh(bondGeom, bondMat);
          bondMesh.position.copy(midPoint);
          bondMesh.quaternion.copy(orientation);
          molGroup.add(bondMesh);
        }
      });
    }

    // 3. Geometry Guides (Planar circle for Benzene / Ethene, Tetrahedron wireframe for Methane)
    if (showPlaneGuide && !isSpaceFill) {
      if (mol.key === 'C6H6' || mol.key === 'C2H4') {
        const ringGeom = new THREE.RingGeometry(0.01, mol.key === 'C6H6' ? 1.85 : 1.35, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: mol.key === 'C6H6' ? 0x6366f1 : 0x0ea5e9,
          transparent: true,
          opacity: 0.12,
          side: THREE.DoubleSide
        });
        const planeGuide = new THREE.Mesh(ringGeom, ringMat);
        guidesGroup.add(planeGuide);
      } else if (mol.key === 'CH4' || mol.key === 'CH2Cl2') {
        // Wireframe tetrahedron linking the 4 outer atoms
        const pts = [
          new THREE.Vector3(...atomsData[1].pos),
          new THREE.Vector3(...atomsData[2].pos),
          new THREE.Vector3(...atomsData[3].pos),
          new THREE.Vector3(...atomsData[4].pos)
        ];
        const tetraGeom = new THREE.BufferGeometry();
        const indices = [0, 1, 1, 2, 2, 0, 0, 3, 1, 3, 2, 3];
        const verts = [];
        indices.forEach(i => verts.push(pts[i].x, pts[i].y, pts[i].z));
        tetraGeom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        const tetraLine = new THREE.LineSegments(tetraGeom, new THREE.LineDashedMaterial({
          color: 0x38bdf8,
          dashSize: 0.08,
          gapSize: 0.05,
          transparent: true,
          opacity: 0.45
        }));
        tetraLine.computeLineDistances();
        guidesGroup.add(tetraLine);
      }
    }
  }, [selectedMolKey, viewMode, rotAngle, showLabels, showPlaneGuide]);

  const handleSelectMol = (key) => {
    setSelectedMolKey(key);
    setRotAngle(0);
    if (onLog) {
      onLog(`🔬 Chuyển quan sát phân tử: ${MOLECULES_DB[key].name} (${MOLECULES_DB[key].formula}). ${MOLECULES_DB[key].examNote}`);
    }
  };

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0, 0);
    }
    if (molGroupRef.current) {
      molGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#020617', color: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
      {/* Top Header Bar */}
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
            ⚛️
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.5px' }}>
              MÔ HÌNH PHÂN TỬ HÓA HỌC 3D (BALL-AND-STICK & SPACE-FILLING)
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Mô phỏng 3D đa chiều chuẩn SGK KHTN 9 & Hóa học 11 GDPT 2018 (Công nghệ Three.js)
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#1e293b', padding: '3px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setViewMode('ball_stick')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'ball_stick' ? '#0284c7' : 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🎾 Quả cầu & Que nối
            </button>
            <button
              onClick={() => setViewMode('space_filling')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'space_filling' ? '#0284c7' : 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🌐 Không gian lấp đầy
            </button>
          </div>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: autoRotate ? '#10b981' : '#1e293b',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {autoRotate ? '⏸ Dừng xoay' : '🔄 Tự xoay 360°'}
          </button>

          <button
            onClick={resetView}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🎯 Đặt lại góc
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

      {/* Main 3D Canvas Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* Floating Molecule Selector Pill Bar */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '30px',
          padding: '6px 10px',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          zIndex: 10
        }}>
          {Object.values(MOLECULES_DB).map((mol) => {
            const isSelected = selectedMolKey === mol.key;
            return (
              <button
                key={mol.key}
                onClick={() => handleSelectMol(mol.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: isSelected ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'rgba(30, 41, 59, 0.8)',
                  color: isSelected ? '#fff' : '#cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 0 14px rgba(56, 189, 248, 0.5)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {mol.formula} ({mol.name.split(' ')[0]})
              </button>
            );
          })}
        </div>

        {/* C-C Bond Rotation Slider (for C2H6, C4H10) */}
        {currentMol.rotatable && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '16px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            zIndex: 10
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b' }}>
              🔄 Quay quanh liên kết đơn C—C:
            </span>
            <input
              type="range"
              min="0"
              max="360"
              value={rotAngle}
              onChange={(e) => setRotAngle(Number(e.target.value))}
              style={{ width: '180px', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fef08a', minWidth: '45px' }}>
              {rotAngle}°
            </span>
            <button
              onClick={() => setRotAngle(prev => (prev + 60) % 360)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                background: '#f59e0b',
                color: '#000',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              +60° (Đổi cấu dạng)
            </button>
          </div>
        )}

        {/* Left Side: Scientific Info & Exam Insights Card */}
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          width: '320px',
          maxHeight: 'calc(100% - 110px)',
          overflowY: 'auto',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          fontSize: '0.85rem',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {currentMol.category}
            </span>
            <span style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              {currentMol.formula}
            </span>
          </div>

          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc' }}>
            {currentMol.name}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '8px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>DẠNG HÌNH HỌC KHÔNG GIAN</div>
              <div style={{ fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>{currentMol.geometry}</div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '8px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>GÓC LIÊN KẾT & ĐỘ DÀI LIÊN KẾT</div>
              <div style={{ fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>{currentMol.angle}</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>{currentMol.bondLength}</div>
            </div>
          </div>

          <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', lineHeight: '1.45', color: '#cbd5e1' }}>
            {currentMol.desc}
          </p>

          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            borderLeft: '4px solid #ef4444',
            padding: '8px 12px',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.78rem',
            color: '#fca5a5',
            lineHeight: '1.4'
          }}>
            <strong>📌 Trọng tâm ghi nhớ:</strong> {currentMol.examNote}
          </div>

          {/* Atom Colors Legend */}
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
              QUY ƯỚC MÀU NGUYÊN TỬ (CPK STANDARD)
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1e293b', border: '1px solid #475569' }} />
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Carbon (C)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #94a3b8' }} />
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Hydrogen (H)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '1px solid #16a34a' }} />
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Chlorine (Cl)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
