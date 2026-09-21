import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- TOP-LEVEL SOLAR SYSTEM 3D PROCEDURAL TEXTURES & CONFIG (Rule 1 compliance) ---
const SOLAR_PLANETS_CONFIG = {
  sun: {
    key: 'sun',
    name: 'Mặt Trời',
    enName: 'THE SUN',
    dist: '— (Trung tâm hệ)',
    size: '1.392.700 km (Gấp 109 lần Trái Đất)',
    period: '≈ 25,4 ngày (Tự quay)',
    temp: '5.500°C (Bề mặt) • 15 triệu °C (Lõi)',
    moons: '8 hành tinh & hàng triệu tiểu hành tinh',
    feature: 'Ngôi sao lùn vàng chiếm 99,86% tổng khối lượng toàn Hệ Mặt Trời. Cung cấp ánh sáng và nhiệt năng nuôi sống Trái Đất.',
    color: '#f59e0b',
    radius: 12.5,
    orbitRadius: 0,
    speed: 0
  },
  mercury: {
    key: 'mercury',
    name: 'Sao Thủy',
    enName: 'MERCURY',
    dist: '57,9 triệu km (0.39 AU)',
    size: '4.879 km',
    period: '88 ngày',
    temp: '-180°C đến +430°C',
    moons: '0',
    feature: 'Hành tinh nhỏ nhất và gần Mặt Trời nhất. Bề mặt phủ nhiều hố thiên thạch.',
    color: '#cbd5e1',
    radius: 2.0,
    orbitRadius: 26,
    speed: 1.4
  },
  venus: {
    key: 'venus',
    name: 'Sao Kim',
    enName: 'VENUS',
    dist: '108,2 triệu km (0.72 AU)',
    size: '12.104 km',
    period: '225 ngày',
    temp: '≈ 465°C (Nóng nhất)',
    moons: '0',
    feature: 'Hành tinh nóng nhất Hệ Mặt Trời với bầu khí quyển CO2 cực dày và mây axit.',
    color: '#fbbf24',
    radius: 3.0,
    orbitRadius: 40,
    speed: 0.95
  },
  earth: {
    key: 'earth',
    name: 'Trái Đất',
    enName: 'EARTH',
    dist: '149,6 triệu km (1.00 AU)',
    size: '12.742 km',
    period: '365,25 ngày',
    temp: '15°C (Trung bình)',
    moons: '1 (Mặt Trăng)',
    feature: 'Hành tinh duy nhất có nước lỏng (71% bề mặt) và sự sống phong phú.',
    color: '#38bdf8',
    radius: 3.4,
    orbitRadius: 56,
    speed: 0.70,
    hasMoon: true
  },
  mars: {
    key: 'mars',
    name: 'Sao Hỏa',
    enName: 'MARS',
    dist: '227,9 triệu km (1.52 AU)',
    size: '6.779 km',
    period: '687 ngày',
    temp: '-63°C',
    moons: '2 (Phobos & Deimos)',
    feature: 'Hành tinh Đỏ phủ bụi oxit sắt. Có ngọn núi lửa Olympus Mons cao nhất Hệ Mặt Trời.',
    color: '#ef4444',
    radius: 2.5,
    orbitRadius: 72,
    speed: 0.52
  },
  jupiter: {
    key: 'jupiter',
    name: 'Sao Mộc',
    enName: 'JUPITER',
    dist: '778,5 triệu km (5.20 AU)',
    size: '139.820 km',
    period: '11,86 năm',
    temp: '-110°C',
    moons: '95+ (Ganymede, Callisto...)',
    feature: 'Hành tinh khí khổng lồ lớn nhất Hệ Mặt Trời với Vết Đỏ Lớn tồn tại hàng trăm năm.',
    color: '#d97706',
    radius: 6.4,
    orbitRadius: 96,
    speed: 0.32
  },
  saturn: {
    key: 'saturn',
    name: 'Sao Thổ',
    enName: 'SATURN',
    dist: '1,43 tỷ km (9.58 AU)',
    size: '116.460 km',
    period: '29,45 năm',
    temp: '-140°C',
    moons: '146+ (Titan)',
    feature: 'Hành tinh tráng lệ nhất với vành đai đá và băng rực rỡ dẹt khổng lồ.',
    color: '#fde047',
    radius: 5.2,
    orbitRadius: 122,
    speed: 0.22,
    hasRings: true
  },
  uranus: {
    key: 'uranus',
    name: 'Sao Thiên Vương',
    enName: 'URANUS',
    dist: '2,87 tỷ km (19.2 AU)',
    size: '50.724 km',
    period: '84 năm',
    temp: '-195°C',
    moons: '28',
    feature: 'Hành tinh băng nghiêng trục 98° có màu xanh lam nhẹ do khí metan.',
    color: '#22d3ee',
    radius: 4.0,
    orbitRadius: 148,
    speed: 0.15,
    hasRings: true
  },
  neptune: {
    key: 'neptune',
    name: 'Sao Hải Vương',
    enName: 'NEPTUNE',
    dist: '4,5 tỷ km (30.1 AU)',
    size: '49.244 km',
    period: '164,8 năm',
    temp: '-200°C',
    moons: '16 (Triton)',
    feature: 'Hành tinh xa nhất Hệ Mặt Trời với màu xanh thẫm và những trận bão gió cực mạnh.',
    color: '#3b82f6',
    radius: 3.8,
    orbitRadius: 172,
    speed: 0.10
  }
};

const planetTextureCache = {};
let saturnRingsTextureCache = null;

function createPhotorealisticPlanetTexture(key, baseColor) {
  if (planetTextureCache[key]) {
    return planetTextureCache[key];
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  let seed = 12345;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const w = 1024;
  const h = 512;

  if (key === 'sun') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#ffcc00');
    grad.addColorStop(0.5, '#ff8800');
    grad.addColorStop(1, '#ff3300');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    for (let i = 0; i < 200; i++) {
      ctx.beginPath();
      ctx.arc(pseudoRandom() * w, pseudoRandom() * h, pseudoRandom() * 15 + 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#3a0800';
    for (let i = 0; i < 15; i++) {
      const rx = pseudoRandom() * w;
      const ry = pseudoRandom() * (h * 0.6) + (h * 0.2);
      ctx.beginPath();
      ctx.arc(rx, ry, pseudoRandom() * 10 + 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (key === 'mercury') {
    ctx.fillStyle = '#858585';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(35, 35, 35, ${pseudoRandom() * 0.3 + 0.1})`;
      ctx.beginPath();
      ctx.ellipse(pseudoRandom() * w, pseudoRandom() * h, pseudoRandom() * 70 + 15, pseudoRandom() * 40 + 10, pseudoRandom(), 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 160; i++) {
      const cx = pseudoRandom() * w;
      const cy = pseudoRandom() * h;
      const cr = pseudoRandom() * 12 + 2;

      ctx.fillStyle = 'rgba(20, 20, 20, 0.45)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(220, 220, 220, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  } else if (key === 'venus') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.3, '#eab308');
    grad.addColorStop(0.7, '#d97706');
    grad.addColorStop(1, '#a16207');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < h; y += 6) {
      ctx.fillStyle = (y % 12 < 6) ? 'rgba(254, 240, 138, 0.25)' : 'rgba(180, 83, 9, 0.18)';
      ctx.beginPath();
      for (let x = 0; x < w; x += 25) {
        const offset = Math.sin(x * 0.02 + y * 0.04) * 8;
        ctx.rect(x, y + offset, 25, 4);
      }
      ctx.fill();
    }
  } else if (key === 'earth') {
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, '#1d4ed8');
    oceanGrad.addColorStop(0.5, '#0284c7');
    oceanGrad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    // Eurasia / Africa
    ctx.fillStyle = '#15803d';
    ctx.beginPath(); ctx.ellipse(w * 0.56, h * 0.39, 170, 95, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.54, h * 0.61, 95, 115, -0.1, 0, Math.PI * 2); ctx.fill();
    // Americas
    ctx.fillStyle = '#166534';
    ctx.beginPath(); ctx.ellipse(w * 0.22, h * 0.34, 95, 85, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.27, h * 0.68, 75, 110, 0.3, 0, Math.PI * 2); ctx.fill();
    // Australia
    ctx.fillStyle = '#a16207';
    ctx.beginPath(); ctx.ellipse(w * 0.78, h * 0.72, 60, 42, 0.1, 0, Math.PI * 2); ctx.fill();
    // Deserts
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath(); ctx.ellipse(w * 0.53, h * 0.47, 65, 38, 0.1, 0, Math.PI * 2); ctx.fill();

    // Ice caps
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, 38);
    ctx.fillRect(0, h - 38, w, 38);
  } else if (key === 'earthClouds') {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let i = 0; i < 70; i++) {
      const cx = pseudoRandom() * w;
      const cy = pseudoRandom() * (h * 0.8) + (h * 0.1);
      ctx.beginPath();
      ctx.ellipse(cx, cy, pseudoRandom() * 95 + 20, pseudoRandom() * 14 + 4, pseudoRandom(), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (key === 'mars') {
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(67, 20, 7, 0.48)';
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.ellipse(pseudoRandom() * w, pseudoRandom() * (h * 0.6) + (h * 0.2), pseudoRandom() * 80 + 15, pseudoRandom() * 40 + 10, pseudoRandom(), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(40, 10, 5, 0.75)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(300, 275);
    ctx.lineTo(550, 285);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, 32);
    ctx.fillRect(0, h - 32, w, 32);
  } else if (key === 'jupiter') {
    const bandColors = ['#fde047', '#d97706', '#9a3412', '#fef08a', '#b45309', '#78350f', '#fef3c7', '#92400e'];
    for (let y = 0; y < h; y += 8) {
      const col = bandColors[Math.floor(y / (h / 8)) % bandColors.length];
      ctx.fillStyle = col;
      ctx.fillRect(0, y, w, 8);
    }

    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${pseudoRandom() * 0.32})`;
      ctx.beginPath();
      ctx.ellipse(pseudoRandom() * w, pseudoRandom() * h, pseudoRandom() * 60 + 10, pseudoRandom() * 8 + 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(675, 320, 58, 35, -0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (key === 'saturn') {
    const saturnGrad = ctx.createLinearGradient(0, 0, 0, h);
    saturnGrad.addColorStop(0.0, '#fef08a');
    saturnGrad.addColorStop(0.2, '#fde047');
    saturnGrad.addColorStop(0.4, '#eab308');
    saturnGrad.addColorStop(0.6, '#ca8a04');
    saturnGrad.addColorStop(0.8, '#a16207');
    saturnGrad.addColorStop(1.0, '#78350f');
    ctx.fillStyle = saturnGrad;
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < h; y += 3) {
      const alpha = (Math.sin(y * 0.1) * 0.06 + 0.06);
      ctx.fillStyle = (y % 6 < 3) ? `rgba(255, 255, 255, ${alpha})` : `rgba(120, 53, 15, ${alpha})`;
      ctx.fillRect(0, y, w, 1.5);
    }
  } else if (key === 'uranus') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#a5f3fc');
    grad.addColorStop(0.5, '#06b6d4');
    grad.addColorStop(1, '#0e7490');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (key === 'neptune') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.5, '#1d4ed8');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(425, 240, 42, 24, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.ellipse(pseudoRandom() * w, pseudoRandom() * h, pseudoRandom() * 85 + 20, pseudoRandom() * 4 + 1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  planetTextureCache[key] = texture;
  return texture;
}

function applyRadialUVsToRingGeometry(geometry, innerRadius, outerRadius) {
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.sqrt(x * x + y * y);
    const normR = Math.max(0, Math.min(1, (r - innerRadius) / (outerRadius - innerRadius)));
    uv.setXY(i, normR, 0.5);
  }
  uv.needsUpdate = true;
}

function createPhotorealisticSaturnRingsTexture() {
  if (saturnRingsTextureCache) {
    return saturnRingsTextureCache;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Linear gradient mapping radial distance U from 0.0 (inner radius) to 1.0 (outer radius)
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0.00, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.04, 'rgba(160, 110, 45, 0.35)'); // D Ring
  grad.addColorStop(0.18, 'rgba(217, 140, 25, 0.70)'); // C Ring (amber tone)
  grad.addColorStop(0.30, 'rgba(245, 205, 90, 0.95)'); // B Ring inner bright edge
  grad.addColorStop(0.44, 'rgba(254, 243, 199, 0.98)'); // B Ring main intense bright golden-cream peak
  grad.addColorStop(0.64, 'rgba(217, 119, 6, 0.92)');  // B Ring outer rich amber gold
  grad.addColorStop(0.68, 'rgba(15, 23, 42, 0.02)');  // Cassini Division start (dark gap)
  grad.addColorStop(0.74, 'rgba(15, 23, 42, 0.02)');  // Cassini Division end
  grad.addColorStop(0.76, 'rgba(234, 179, 8, 0.88)');  // A Ring warm golden tan
  grad.addColorStop(0.88, 'rgba(100, 50, 10, 0.30)');  // Encke Division line
  grad.addColorStop(0.94, 'rgba(180, 83, 9, 0.65)');   // A Ring outer rim
  grad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');        // Transparent outer boundary

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 64);

  // Draw fine vertical striation lines (which wrap around into concentric rings)
  const xCassiniStart = Math.round(1024 * 0.68);
  const xCassiniEnd = Math.round(1024 * 0.74);

  for (let x = 0; x < 1024; x += 2) {
    if (x >= xCassiniStart && x <= xCassiniEnd) continue; // Skip Cassini division gap
    const alpha = (Math.sin(x * 0.4) * 0.08 + 0.08);
    ctx.fillStyle = (x % 4 === 0) ? `rgba(255, 255, 255, ${alpha})` : `rgba(40, 20, 0, ${alpha})`;
    ctx.fillRect(x, 0, 1.5, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  saturnRingsTextureCache = texture;
  return texture;
}


import { 
  Play, 
  Pause,
  RotateCcw, 
  Zap, 
  Flame, 
  Droplet, 
  Sliders, 
  Eye, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Maximize2, 
  Volume2, 
  X,
  Timer,
  Globe,
  Sun,
  Moon,
  CloudRain,
  Activity,
  Mountain
} from 'lucide-react';

// --- TOP-LEVEL HELPER SUB-COMPONENTS (Rule 1 compliance) ---

function AlcoholLampAssembly({ x = 250, y = 245, isHeating = false, temp = 25, scale = 1 }) {
  const flameScale = Math.min(1.4, Math.max(0.75, (temp || 25) / 300));
  
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Heat Glow Halo */}
      {isHeating && (
        <ellipse cx="0" cy="-35" rx={38 * flameScale} ry={45 * flameScale} fill="rgba(253, 224, 71, 0.35)" style={{ filter: 'blur(12px)' }} />
      )}

      {/* Ceramic Wick Collar */}
      <rect x="-10" y="-8" width="20" height="10" rx="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
      {/* Cotton Wick */}
      <line x1="0" y1="-6" x2="0" y2="-16" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

      {/* Glass Vessel Base filled with Pink/Purple Alcohol Fuel */}
      <path d="M -28 35 C -30 10, -16 0, -10 0 L 10 0 C 16 0, 30 10, 28 35 Z" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
      {/* Fuel Level Inside Lamp */}
      <path d="M -26 33 C -28 15, -14 12, -8 12 L 8 12 C 14 12, 28 15, 26 33 Z" fill="url(#alcoholFuelGrad)" />
      {/* Glass Reflection Highlight */}
      <path d="M -20 8 Q -24 20 -22 30" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Glass Cap (Off to side when heating, covering wick when off) */}
      {!isHeating ? (
        <path d="M -12 -14 L -9 -28 C -9 -32, 9 -32, 9 -28 L 12 -14 Z" fill="rgba(255,255,255,0.45)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
      ) : (
        <path d="M 40 25 L 36 10 C 36 6, 48 6, 48 10 L 44 25 Z" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" transform="rotate(25, 40, 25)" />
      )}

      {/* DYNAMIC MULTI-LAYERED FLICKERING ALCOHOL FLAME */}
      {isHeating && (
        <g transform="translate(0, -16)" className="alcohol-flame-group" style={{ animation: 'alcoholFlameFlicker 0.35s infinite alternate ease-in-out' }}>
          {/* Outer Dancing Flame (Yellow/Orange) */}
          <path 
            d={`M 0 0 Q ${-22 * flameScale} ${-20 * flameScale} 0 ${-58 * flameScale} Q ${22 * flameScale} ${-20 * flameScale} 0 0 Z`} 
            fill="url(#alcoholFlameOuterGrad)" 
            style={{ filter: 'drop-shadow(0 0 16px #fde047)' }} 
          />
          {/* Inner Alcohol Flame Core (Cyan/Blue) */}
          <path 
            d={`M 0 0 Q ${-9 * flameScale} ${-10 * flameScale} 0 ${-30 * flameScale} Q ${9 * flameScale} ${-10 * flameScale} 0 0 Z`} 
            fill="url(#alcoholFlameInnerGrad)" 
            style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }} 
          />
          {/* White Hot Tip */}
          <ellipse cx="0" cy={-18 * flameScale} rx={3.5 * flameScale} ry={11 * flameScale} fill="#ffffff" opacity="0.95" />
        </g>
      )}
    </g>
  );
}

function TempControlBar({ temp = 25, setTemp, isHeating = false, setIsHeating }) {
  const handleSliderChange = (val) => {
    const num = Math.min(1000, Math.max(25, Number(val)));
    if (setTemp) setTemp(num);
    if (setIsHeating) {
      if (num > 30 && !isHeating) setIsHeating(true);
      if (num <= 25 && isHeating) setIsHeating(false);
    }
  };

  const handleDecrease = () => {
    handleSliderChange(temp - 10);
  };

  const handleIncrease = () => {
    handleSliderChange(temp + 10);
  };

  const handleToggleBurner = () => {
    if (!setIsHeating) return;
    const next = !isHeating;
    setIsHeating(next);
    if (next && temp <= 25 && setTemp) setTemp(100.0);
    if (!next && setTemp) setTemp(25.0);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
      background: 'linear-gradient(135deg, #091a28 0%, #1e1b4b 100%)',
      border: '1.5px solid rgba(245, 158, 11, 0.6)', borderRadius: '14px',
      padding: '10px 16px', flexShrink: 0, boxShadow: '0 4px 20px rgba(245, 158, 11, 0.25)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fde047', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
          🔥 BẢNG ĐIỀU CHỈNH NHIỆT ĐỘ (°C):
        </span>
        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: temp > 100 ? '#ef4444' : temp > 30 ? '#f97316' : '#38bdf8', fontFamily: 'monospace', minWidth: '70px', textShadow: '0 0 10px rgba(249,115,22,0.6)' }}>
          {temp.toFixed(1)} °C
        </span>
      </div>

      {/* Incremental [-] and [+] Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button 
          onClick={handleDecrease}
          title="Giảm 10°C"
          style={{
            background: 'rgba(2, 132, 199, 0.3)', border: '1px solid #0284c7', color: '#38bdf8',
            borderRadius: '8px', padding: '5px 12px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          ➖ Giảm (-10°)
        </button>

        <input 
          type="range" min="25" max="1000" step="5" value={temp} 
          onChange={(e) => handleSliderChange(e.target.value)} 
          style={{ flex: 1, accentColor: '#f97316', cursor: 'pointer', height: '8px', minWidth: '120px' }}
        />

        <button 
          onClick={handleIncrease}
          title="Tăng 10°C"
          style={{
            background: 'rgba(239, 68, 68, 0.3)', border: '1px solid #ef4444', color: '#fca5a5',
            borderRadius: '8px', padding: '5px 12px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          ➕ Tăng (+10°)
        </button>
      </div>

      {/* Preset Temperature Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
        <button onClick={() => handleSliderChange(25)} style={{ background: temp === 25 ? '#0284c7' : '#1e293b', border: '1px solid #0284c7', color: '#fff', padding: '4px 9px', borderRadius: '6px', fontSize: '0.73rem', fontWeight: 800, cursor: 'pointer' }}>
          ❄️ 25°C
        </button>
        <button onClick={() => handleSliderChange(100)} style={{ background: temp === 100 ? '#d97706' : '#1e293b', border: '1px solid #d97706', color: '#fff', padding: '4px 9px', borderRadius: '6px', fontSize: '0.73rem', fontWeight: 800, cursor: 'pointer' }}>
          💧 100°C
        </button>
        <button onClick={() => handleSliderChange(500)} style={{ background: temp === 500 ? '#ea580c' : '#1e293b', border: '1px solid #ea580c', color: '#fff', padding: '4px 9px', borderRadius: '6px', fontSize: '0.73rem', fontWeight: 800, cursor: 'pointer' }}>
          🔥 500°C
        </button>
        <button onClick={() => handleSliderChange(1000)} style={{ background: temp === 1000 ? '#dc2626' : '#1e293b', border: '1px solid #dc2626', color: '#fff', padding: '4px 9px', borderRadius: '6px', fontSize: '0.73rem', fontWeight: 800, cursor: 'pointer' }}>
          ⚡ 1000°C
        </button>
      </div>
      <button 
        onClick={handleToggleBurner}
        style={{
          background: isHeating ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
          color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px',
          fontWeight: 900, fontSize: '0.78rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', whiteSpace: 'nowrap'
        }}
      >
        {isHeating ? '🔥 TẮT ĐÈN CỒN' : '🔥 BẬT ĐÈN CỒN'}
      </button>
    </div>
  );
}

function ChemicalEquationBanner({ equation, title = "PHƯƠNG TRÌNH HÓA HỌC PHẢN ỨNG:" }) {
  if (!equation) return null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #091a28 0%, #0d9488 100%)',
      border: '1.5px solid #2dd4bf', borderRadius: '12px', padding: '8px 16px',
      boxShadow: '0 4px 20px rgba(13, 148, 136, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0, gap: '12px', margin: '2px 0'
    }}>
      <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, whiteSpace: 'nowrap' }}>
        ⚡ {title}
      </div>
      <div style={{ fontSize: '0.98rem', color: '#fde047', fontWeight: 900, fontFamily: 'monospace', textShadow: '0 0 10px rgba(253, 224, 71, 0.5)' }}>
        {equation}
      </div>
    </div>
  );
}

function playLabSFX(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'bubble') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'sizzle') {
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } else if (type === 'drop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'burn') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // Graceful fallback if Web Audio is blocked
  }
}

function ChemistryAcidBaseSim({ config, onLog, onSensorUpdate }) {
  const [selectedReagent, setSelectedReagent] = useState('hcl');
  const [selectedIndicator, setSelectedIndicator] = useState('litmus');
  const [hasIndicatorAdded, setHasIndicatorAdded] = useState(false);
  const [liquidColor, setLiquidColor] = useState('rgba(255, 255, 255, 0.18)');
  const [paperColor, setPaperColor] = useState('#cbd5e1');
  const [currentPh, setCurrentPh] = useState(1.2);

  const handleReset = () => {
    setHasIndicatorAdded(false);
    setLiquidColor('rgba(255, 255, 255, 0.18)');
    setPaperColor('#cbd5e1');
    const phVal = selectedReagent === 'hcl' ? 1.2 : selectedReagent === 'naoh' ? 13.5 : 7.0;
    setCurrentPh(phVal);
    playLabSFX('drop');
    if (onSensorUpdate) onSensorUpdate({ temp: 25.0, ph: phVal, mass: 120.0 });
    onLog("Đã làm sạch cốc thủy tinh. Sẵn sàng thí nghiệm mới.");
  };

  const handleReagentChange = (reagent) => {
    setSelectedReagent(reagent);
    setHasIndicatorAdded(false);
    setLiquidColor('rgba(255, 255, 255, 0.18)');
    setPaperColor('#cbd5e1');
    const phVal = reagent === 'hcl' ? 1.2 : reagent === 'naoh' ? 13.5 : 7.0;
    setCurrentPh(phVal);
    playLabSFX('drop');
    if (onSensorUpdate) onSensorUpdate({ temp: 25.0, ph: phVal, mass: 120.0 });
  };

  const handleAddIndicator = () => {
    setHasIndicatorAdded(true);
    playLabSFX('drop');

    if (selectedIndicator === 'litmus') {
      if (selectedReagent === 'hcl') {
        setPaperColor('#ef4444');
        setLiquidColor('rgba(239, 68, 68, 0.35)');
        setCurrentPh(1.2);
        if (onSensorUpdate) onSensorUpdate({ temp: 25.0, ph: 1.2, mass: 120.5 });
        onLog("Nhúng Giấy Quỳ Tím vào dung dịch HCl ➔ Quỳ tím hóa ĐỎ (pH = 1.2 - Môi trường Acid).");
      } else if (selectedReagent === 'naoh') {
        setPaperColor('#3b82f6');
        setLiquidColor('rgba(59, 130, 246, 0.35)');
        setCurrentPh(13.5);
        if (onSensorUpdate) onSensorUpdate({ temp: 25.0, ph: 13.5, mass: 120.5 });
        onLog("Nhúng Giấy Quỳ Tím vào dung dịch NaOH ➔ Quỳ tím hóa XANH DƯƠNG (pH = 13.5 - Môi trường Base).");
      } else {
        setPaperColor('#cbd5e1');
        setLiquidColor('rgba(255, 255, 255, 0.18)');
        setCurrentPh(7.0);
        if (onSensorUpdate) onSensorUpdate({ temp: 25.0, ph: 7.0, mass: 120.5 });
        onLog("Nhúng Giấy Quỳ Tím vào Nước cất ➔ Quỳ tím KHÔNG đổi màu (pH = 7.0 - Môi trường Trung tính).");
      }
    } else if (selectedIndicator === 'phenolphthalein') {
      if (selectedReagent === 'naoh') {
        setLiquidColor('rgba(236, 72, 153, 0.85)');
        setCurrentPh(13.5);
        if (onSensorUpdate) onSensorUpdate({ temp: 25.5, ph: 13.5, mass: 120.5 });
        onLog("Nhỏ Phenolphthalein vào dung dịch NaOH ➔ Dung dịch hóa HỒNG TÍM rực rỡ (pH > 8.3).");
      } else {
        setLiquidColor('rgba(255, 255, 255, 0.18)');
        const phVal = selectedReagent === 'hcl' ? 1.2 : 7.0;
        setCurrentPh(phVal);
        if (onSensorUpdate) onSensorUpdate({ temp: 25.0, ph: phVal, mass: 120.5 });
        onLog("Nhỏ Phenolphthalein vào dung dịch ➔ Dung dịch vẫn TRONG SUỐT (Không đổi màu).");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      {/* Visual Simulation Canvas Container */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at center, #0b1a29 0%, #030712 100%)',
        borderRadius: '16px', position: 'relative', border: '1px solid rgba(13, 148, 136, 0.35)',
        padding: '20px', overflow: 'hidden', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
      }}>
        
        {/* SVG Glassware & Sensor Probe Visualizer */}
        <svg width="100%" height="100%" viewBox="0 0 500 320" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="beakerGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="80%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>
          </defs>

          {/* Wooden Lab Bench Surface */}
          <rect x="50" y="270" width="400" height="15" fill="#1e293b" rx="4" stroke="rgba(255,255,255,0.1)" />

          {/* Glass Beaker (Volumetric Ticks 50ml, 100ml, 150ml, 200ml) */}
          <g transform="translate(250, 160)">
            {/* Liquid Fill */}
            <path d="M -75 -10 L -75 90 A 15 15 0 0 0 -60 105 L 60 105 A 15 15 0 0 0 75 90 L 75 -10 Z"
              fill={liquidColor} style={{ transition: 'all 0.6s ease' }} />
            
            {/* Meniscus Ripple Line */}
            <ellipse cx="0" cy="-10" rx="75" ry="10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

            {/* Glass Beaker Body */}
            <path d="M -85 -90 L -80 -80 L -80 90 A 18 18 0 0 0 -62 108 L 62 108 A 18 18 0 0 0 80 90 L 80 -80 L 85 -90 Z"
              fill="url(#beakerGrad)" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" />
            
            {/* Beaker Measurement Lines */}
            {[-50, -20, 10, 40, 70].map((y, idx) => (
              <g key={idx}>
                <line x1="-78" y1={y} x2="-62" y2={y} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                <text x="-58" y={y + 4} fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="bold">{(5 - idx) * 40} ml</text>
              </g>
            ))}

            {/* Digital pH Probe Dipping Into Liquid */}
            <g transform="translate(35, -130)">
              {/* Probe Wire */}
              <path d="M 0 0 Q 20 -40 40 -80" fill="none" stroke="#64748b" strokeWidth="3" />
              {/* Main Shaft */}
              <rect x="-6" y="0" width="12" height="170" fill="#334155" rx="3" stroke="#475569" strokeWidth="1" />
              {/* Glass Sensor Tip */}
              <circle cx="0" cy="170" r="7" fill={currentPh < 7 ? "#ef4444" : currentPh > 7 ? "#3b82f6" : "#38bdf8"} style={{ filter: 'drop-shadow(0 0 8px currentColor)' }} />
              {/* Sensor HUD Badge */}
              <rect x="-35" y="40" width="70" height="26" fill="#09131d" rx="6" stroke="#0d9488" strokeWidth="1.5" />
              <text x="0" y="57" fill={currentPh < 7 ? "#f87171" : currentPh > 7 ? "#60a5fa" : "#38bdf8"} fontSize="11" fontWeight="900" textAnchor="middle">
                pH {currentPh.toFixed(1)}
              </text>
            </g>

            {/* Litmus Paper Test Strip */}
            {selectedIndicator === 'litmus' && (
              <g transform={`translate(-30, ${hasIndicatorAdded ? 10 : -80})`} style={{ transition: 'all 0.5s ease' }}>
                <rect x="-8" y="-40" width="16" height="110" fill={paperColor} rx="2" stroke="rgba(0,0,0,0.3)" strokeWidth="1"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }} />
                <text x="0" y="-46" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">QUỲ TÍM</text>
              </g>
            )}

            {/* Dropper Dropping Indicator */}
            {selectedIndicator === 'phenolphthalein' && (
              <g transform={`translate(0, ${hasIndicatorAdded ? -30 : -90})`} style={{ transition: 'all 0.4s ease' }}>
                <path d="M -4 -40 L -4 0 L 0 10 L 4 0 L 4 -40 Z" fill="rgba(255,255,255,0.7)" stroke="#64748b" strokeWidth="1.5" />
                {hasIndicatorAdded && <circle cx="0" cy="25" r="4" fill="#ec4899" style={{ filter: 'drop-shadow(0 0 6px #ec4899)' }} />}
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Control Toolbar */}
      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>Dung dịch:</span>
            <select 
              value={selectedReagent} 
              onChange={(e) => handleReagentChange(e.target.value)}
              style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <option value="hcl">🧪 Dung dịch HCl 1M (Acid)</option>
              <option value="naoh">🧪 Dung dịch NaOH 1M (Base)</option>
              <option value="water">💧 Nước cất H₂O (Trung tính)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>Chất chỉ thị:</span>
            <select 
              value={selectedIndicator} 
              onChange={(e) => { setSelectedIndicator(e.target.value); setHasIndicatorAdded(false); setPaperColor('#cbd5e1'); setLiquidColor('rgba(255, 255, 255, 0.18)'); }}
              style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <option value="litmus">📄 Giấy Quỳ Tím</option>
              <option value="phenolphthalein">💧 Dung dịch Phenolphthalein</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleAddIndicator}
            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)' }}
          >
            <Droplet size={16} /> Thử Chỉ Thị Real-Time
          </button>
          <button 
            onClick={handleReset}
            style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={16} /> Làm Mới
          </button>
        </div>
      </div>
    </div>
  );
}

function ChemistrySandboxSim({ onLog, onSensorUpdate }) {
  const [selectedSubstances, setSelectedSubstances] = useState([]);
  const [isHeating, setIsHeating] = useState(false);
  const [customTemp, setCustomTemp] = useState(25.0);
  const [waterMl, setWaterMl] = useState(0);
  const [animatingItem, setAnimatingItem] = useState(null);

  const reagents = [
    { id: 'Na', name: 'Natri (Na)', type: 'metal', color: '#f59e0b', icon: '🪙' },
    { id: 'K', name: 'Kali (K)', type: 'metal', color: '#a855f7', icon: '🪙' },
    { id: 'Fe', name: 'Sắt (Fe)', type: 'metal', color: '#94a3b8', icon: '🔩' },
    { id: 'Cu', name: 'Đồng (Cu)', type: 'metal', color: '#b45309', icon: '🪙' },
    { id: 'Zn', name: 'Kẽm (Zn)', type: 'metal', color: '#cbd5e1', icon: '🪙' },
    { id: 'Mg', name: 'Magie (Mg)', type: 'metal', color: '#e2e8f0', icon: '🪙' },
    { id: 'Al', name: 'Nhôm (Al)', type: 'metal', color: '#f1f5f9', icon: '🪙' },
    { id: 'HCl', name: 'Axit HCl 1M', type: 'acid', color: 'rgba(56, 189, 248, 0.25)', icon: '🧪' },
    { id: 'H2SO4', name: 'Axit H₂SO₄ 1M', type: 'acid', color: 'rgba(239, 68, 68, 0.25)', icon: '🧪' },
    { id: 'NaOH', name: 'Xút NaOH 1M', type: 'base', color: 'rgba(59, 130, 246, 0.25)', icon: '🧪' },
    { id: 'CuSO4', name: 'Dung dịch CuSO₄', type: 'salt', color: 'rgba(2, 132, 199, 0.7)', icon: '💧' },
    { id: 'AgNO3', name: 'Dung dịch AgNO₃', type: 'salt', color: 'rgba(255, 255, 255, 0.2)', icon: '💧' },
    { id: 'CaCO3', name: 'Đá vôi CaCO₃', type: 'solid', color: '#f8fafc', icon: '🧱' },
    { id: 'CuO', name: 'Đồng Oxit CuO', type: 'solid', color: '#18181b', icon: '🖤' },
    { id: 'Glucose', name: 'Glucose C₆H₁₂O₆', type: 'sugar', color: 'rgba(255,255,255,0.2)', icon: '🍬' },
    { id: 'Phenol', name: 'Phenolphthalein', type: 'indicator', color: '#ec4899', icon: '💧' }
  ];

  const evaluateReaction = () => {
    const list = [...selectedSubstances];
    const hasWater = waterMl > 0;
    const hasNa = list.includes('Na');
    const hasK = list.includes('K');
    const hasFe = list.includes('Fe');
    const hasCu = list.includes('Cu');
    const hasZn = list.includes('Zn');
    const hasMg = list.includes('Mg');
    const hasAl = list.includes('Al');
    const hasHCl = list.includes('HCl');
    const hasH2SO4 = list.includes('H2SO4');
    const hasCuSO4 = list.includes('CuSO4');
    const hasNaOH = list.includes('NaOH');
    const hasAgNO3 = list.includes('AgNO3');
    const hasCaCO3 = list.includes('CaCO3');
    const hasCuO = list.includes('CuO');
    const hasGlucose = list.includes('Glucose');
    const hasPhenol = list.includes('Phenol');

    let equation = "";
    let logMsg = "";
    let liquidColor = waterMl > 0 ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.08)";
    let temp = isHeating ? Math.max(100.0, customTemp) : customTemp;
    let ph = 7.0;
    let mass = 120.0 + (waterMl * 0.8) + (list.length * 5.0);
    let bubbles = false;
    let sparks = false;
    let precipitate = false;
    let precipitateColor = "";
    let silverMirror = false;
    let feCoatedWithCu = false;
    let cuBurnedBlack = false;
    let feRedHotSparks = false;
    let mgBlindingLight = false;
    let caco3Decomposed = false;

    // 1. Reactions involving water or aqueous solutions
    if (hasNa && (hasWater || list.some(id => ['HCl','H2SO4','NaOH','CuSO4','AgNO3'].includes(id)))) {
      equation = "2Na + 2H₂O ➔ 2NaOH + H₂↑ (Phản ứng tỏa nhiệt mạnh)";
      logMsg = "⚡ Natri phản ứng mãnh liệt với nước, nóng chảy thành viên tròn chạy dồn dập, sủi bọt khí H₂ và phát lửa!";
      temp = isHeating ? Math.max(100.0, customTemp) : 85.5;
      ph = 13.8;
      bubbles = true;
      sparks = true;
      if (hasPhenol) {
        liquidColor = "rgba(236, 72, 153, 0.85)";
        logMsg += " Phenolphthalein hóa HỒNG TÍM rực rỡ!";
      }
    } else if (hasK && (hasWater || list.some(id => ['HCl','H2SO4','NaOH','CuSO4','AgNO3'].includes(id)))) {
      equation = "2K + 2H₂O ➔ 2KOH + H₂↑ (Bùng cháy ngọn lửa tím)";
      logMsg = "💥 Kali nổ bùm bùng cháy ngọn lửa màu TÍM rực rỡ trên mặt nước!";
      temp = isHeating ? Math.max(100.0, customTemp) : 98.0;
      ph = 14.0;
      bubbles = true;
      sparks = true;
    } else if (hasFe && hasCuSO4) {
      equation = "Fe + CuSO₄ ➔ FeSO₄ + Cu↓";
      logMsg = "🔴 Sắt đẩy Đồng ra khỏi muối: Kim loại Đồng màu đỏ nâu bám phủ lên đinh sắt, dung dịch nhạt màu xanh lam sang xanh lá!";
      liquidColor = "rgba(34, 197, 94, 0.45)";
      precipitate = true;
      precipitateColor = "#b45309";
      feCoatedWithCu = true;
    } else if ((hasZn || hasMg || hasFe || hasAl) && (hasHCl || hasH2SO4)) {
      const metalName = hasZn ? "Kẽm (Zn)" : hasMg ? "Magie (Mg)" : hasAl ? "Nhôm (Al)" : "Sắt (Fe)";
      const metalSymbol = hasZn ? "Zn" : hasMg ? "Mg" : hasAl ? "Al" : "Fe";
      const acidSymbol = hasH2SO4 ? "H₂SO₄" : "HCl";
      equation = hasH2SO4 
        ? `${metalSymbol} + H₂SO₄ ➔ ${metalSymbol}SO₄ + H₂↑` 
        : `${metalSymbol} + 2HCl ➔ ${metalSymbol}Cl₂ + H₂↑`;
      logMsg = `💨 ${metalName} tan dần trong dung dịch ${acidSymbol}, sủi bọt khí H₂ dồn dập!`;
      ph = 1.5;
      bubbles = true;
      temp = isHeating ? Math.max(100.0, customTemp) : 42.0;
    } else if (hasCaCO3 && (hasHCl || hasH2SO4)) {
      equation = hasH2SO4 
        ? "CaCO₃ + H₂SO₄ ➔ CaSO₄↓ + H₂O + CO₂↑" 
        : "CaCO₃ + 2HCl ➔ CaCl₂ + H₂O + CO₂↑";
      logMsg = "🫧 Đá vôi CaCO₃ tan dần, sủi bọt khí CO₂ mãnh liệt!";
      ph = 4.2;
      bubbles = true;
      if (hasH2SO4) {
        precipitate = true;
        precipitateColor = "#f8fafc";
      }
    } else if (hasCuO && (hasHCl || hasH2SO4) && isHeating) {
      equation = hasH2SO4 ? "CuO + H₂SO₄ ➔ CuSO₄ + H₂O (t°)" : "CuO + 2HCl ➔ CuCl₂ + H₂O (t°)";
      logMsg = "💙 Bột CuO màu đen tan hoàn toàn trong acid khi đun nóng, tạo dung dịch màu XANH LAM BÍCH rực rỡ!";
      liquidColor = "rgba(2, 132, 199, 0.85)";
      temp = Math.max(98.0, customTemp);
      ph = 2.0;
    } else if (hasCuSO4 && hasNaOH) {
      equation = "CuSO₄ + 2NaOH ➔ Cu(OH)₂↓ + Na₂SO₄";
      logMsg = "💙 Xuất hiện KẾT TỦA KEO MÀU XANH LAM SẪM của Cu(OH)₂!";
      liquidColor = "rgba(2, 132, 199, 0.35)";
      precipitate = true;
      precipitateColor = "#0284c7";
      ph = 11.5;
    } else if (hasAgNO3 && hasHCl) {
      equation = "AgNO₃ + HCl ➔ AgCl↓ + HNO₃";
      logMsg = "⚪ Xuất hiện KẾT TỦA TRẮNG DẠNG VÓN CỤC của Bạc Clorua (AgCl)!";
      precipitate = true;
      precipitateColor = "#f8fafc";
      ph = 1.2;
    } else if (hasGlucose && hasAgNO3 && isHeating) {
      equation = "C₆H₁₂O₆ + Ag₂O ➔ C₆H₁₂O₇ + 2Ag↓ (Tráng Bạc)";
      logMsg = "✨ Glucose phản ứng tráng bạc khi đun nóng: Lớp bạc kim loại sáng bóng như gương phủ kín thành cốc!";
      silverMirror = true;
      temp = Math.max(85.0, customTemp);

    // 2. DRY HEATING COMBUSTION / THERMAL DECOMPOSITION REACTIONS (Khi bật Đèn cồn đun nóng)
    } else if (isHeating && hasMg) {
      equation = "2Mg + O₂ ➔ 2MgO (t° - Cháy chói sáng)";
      logMsg = "💥 Magie (Mg) bị đun nóng bùng cháy MÃNH LIỆT ngọn lửa và phát ra ánh sáng TRẮNG CHÓI LỌI lóa mắt, tạo sản phẩm bột Magie Oxit (MgO) màu trắng!";
      temp = Math.max(850.0, customTemp);
      sparks = true;
      mgBlindingLight = true;
    } else if (isHeating && hasFe) {
      equation = "3Fe + 2O₂ ➔ Fe₃O₄ (t° - Oxit Sắt Từ)";
      logMsg = "🔥 Đinh Sắt (Fe) bị đun nóng đỏ rực, cháy mạnh phát ra các hạt TIA LỬA BẮN SÁNG CHÓI, chuyển thành Oxit Sắt Từ (Fe₃O₄) màu xám đen!";
      temp = Math.max(650.0, customTemp);
      sparks = true;
      feRedHotSparks = true;
    } else if (isHeating && hasCu) {
      equation = "2Cu + O₂ ➔ 2CuO (t° - Oxit Đồng Đen)";
      logMsg = "🔥 Dây Đồng (Cu) bị đun nóng bị oxy hóa thành lớp vỏ bột Đồng Oxit (CuO) MÀU ĐEN KHÓI bám dính bề mặt!";
      temp = Math.max(550.0, customTemp);
      cuBurnedBlack = true;
    } else if (isHeating && hasNa) {
      equation = "2Na + O₂ ➔ Na₂O₂ (t° - Cháy Vàng Rực)";
      logMsg = "⚡ Natri (Na) đun nóng chảy thành giọt tròn, bùng cháy ngọn lửa màu VÀNG CHÓI LỌI trong không khí!";
      temp = Math.max(450.0, customTemp);
      sparks = true;
    } else if (isHeating && hasK) {
      equation = "2K + O₂ ➔ KO₂ (t° - Cháy Tím Bích)";
      logMsg = "💥 Kali (K) bị đun nóng bùng cháy ngọn lửa MÀU TÍM BÍCH rực rỡ tỏa nhiều nhiệt trong không khí!";
      temp = Math.max(520.0, customTemp);
      sparks = true;
    } else if (isHeating && (hasZn || hasAl)) {
      const symbol = hasZn ? "Zn" : "Al";
      const name = hasZn ? "Kẽm (Zn)" : "Nhôm (Al)";
      equation = hasZn ? "2Zn + O₂ ➔ 2ZnO (t°)" : "4Al + 3O₂ ➔ 2Al₂O₃ (t°)";
      logMsg = `🔥 Kim loại ${name} bị đun nóng bùng cháy sáng chói lọi, tạo Oxit màu trắng!`;
      temp = Math.max(620.0, customTemp);
      sparks = true;
    } else if (isHeating && hasCaCO3) {
      equation = "CaCO₃ ➔ CaO + CO₂↑ (t° - Nung Đá Vôi)";
      logMsg = "🧱 Nung Đá vôi (CaCO₃) ở nhiệt độ cao ➔ Đá vôi bị nhiệt phân hủy sủi bọt khí CO₂ thoát ra dồn dập, thu được Vôi Sống (CaO)!";
      temp = Math.max(900.0, customTemp);
      bubbles = true;
      caco3Decomposed = true;

    // 3. Fallback Passive / Heating States
    } else if (hasHCl || hasH2SO4) {
      ph = 1.2;
      liquidColor = hasH2SO4 ? "rgba(239, 68, 68, 0.2)" : "rgba(56, 189, 248, 0.2)";
      logMsg = `Dung dịch chứa Acid (${hasH2SO4 ? 'H₂SO₄' : 'HCl'} 1M, pH = 1.2).`;
    } else if (hasNaOH) {
      ph = 13.5;
      liquidColor = hasPhenol ? "rgba(236, 72, 153, 0.85)" : "rgba(59, 130, 246, 0.25)";
      logMsg = hasPhenol ? "Dung dịch kiềm NaOH làm Phenolphthalein hóa HỒNG TÍM rực rỡ!" : "Dung dịch chứa NaOH 1M (pH = 13.5).";
    } else if (hasCuSO4) {
      liquidColor = "rgba(2, 132, 199, 0.75)";
      logMsg = "Dung dịch CuSO₄ màu xanh lam đặc trưng.";
    } else if (hasWater) {
      logMsg = `Đã rót ${waterMl}ml Nước cất H₂O trung tính (pH = 7.0).`;
    } else if (list.length > 0) {
      logMsg = `Trong cốc đang có: ${list.map(id => reagents.find(r => r.id === id)?.name || id).join(', ')}.`;
    }

    if (isHeating && logMsg === "" && (waterMl > 0 || list.length > 0)) {
      logMsg = "🔥 Đèn cồn đang đun nóng cốc thí nghiệm (Nhiệt độ dâng cao).";
    }

    const hasLiquidSolution = waterMl > 0 || list.some(id => ['HCl','H2SO4','NaOH','CuSO4','AgNO3','Phenol'].includes(id));

    return { 
      equation, logMsg, liquidColor, temp, ph, mass, bubbles, 
      sparks, precipitate, precipitateColor, silverMirror, feCoatedWithCu, 
      cuBurnedBlack, feRedHotSparks, mgBlindingLight, caco3Decomposed, hasLiquidSolution
    };
  };

  const rx = evaluateReaction();

  const handleAddReagent = (id) => {
    setAnimatingItem(id);
    setTimeout(() => setAnimatingItem(null), 600);

    const isLiquid = ['HCl', 'H2SO4', 'NaOH', 'CuSO4', 'AgNO3', 'Phenol'].includes(id);

    if (!selectedSubstances.includes(id)) {
      setSelectedSubstances(prev => [...prev, id]);
    }

    if (isLiquid && waterMl === 0) {
      setWaterMl(60);
    }

    playLabSFX('drop');
    const info = reagents.find(r => r.id === id);
    onLog(`🧪 Đã cho ${info?.name || id} vào cốc thí nghiệm.`);
  };

  const handleRemoveSubstance = (id) => {
    setSelectedSubstances(prev => prev.filter(item => item !== id));
    playLabSFX('drop');
    const info = reagents.find(r => r.id === id);
    onLog(`🗑️ Đã lấy ${info?.name || id} ra khỏi cốc.`);
  };

  const handleAddWater = () => {
    setAnimatingItem('H2O');
    setTimeout(() => setAnimatingItem(null), 600);
    setWaterMl(prev => Math.min(200, prev + 50));
    playLabSFX('drop');
    onLog("💧 Rót thêm 50ml Nước cất H₂O vào cốc thủy tinh.");
  };

  const handleRemoveWater = () => {
    setWaterMl(0);
    playLabSFX('drop');
    onLog("💧 Đã đổ hết nước cất ra khỏi cốc.");
  };

  const handleToggleHeat = () => {
    const next = !isHeating;
    setIsHeating(next);
    if (next && customTemp <= 25) setCustomTemp(100.0);
    if (!next) setCustomTemp(25.0);
    playLabSFX(next ? 'burn' : 'drop');
    onLog(next ? "🔥 Bật ngọn lửa Đèn Cồn đun nóng cốc thí nghiệm!" : "❄️ Tắt Đèn Cồn, ngừng đun nóng.");
  };

  const handleClear = () => {
    setSelectedSubstances([]);
    setWaterMl(0);
    setIsHeating(false);
    setCustomTemp(25.0);
    playLabSFX('drop');
    onLog("🧹 Đã rửa sạch cốc thủy tinh. Sẵn sàng thử nghiệm phản ứng mới.");
  };

  useEffect(() => {
    if (onSensorUpdate) {
      onSensorUpdate({ temp: rx.temp, ph: rx.ph, mass: rx.mass });
    }
  }, [selectedSubstances, isHeating, customTemp, waterMl]);

  const hasAnySubstance = selectedSubstances.length > 0 || waterMl > 0;
  const liquidFillY = 80 - Math.min(145, (waterMl > 0 ? waterMl : selectedSubstances.some(id => ['HCl','H2SO4','NaOH','CuSO4','AgNO3'].includes(id)) ? 60 : 0) + 30);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px', minHeight: 0, overflowY: 'auto' }}>
      {/* Embedded CSS Keyframes for Flame & Thermal Animations */}
      <style>{`
        @keyframes alcoholFlameFlicker {
          0% { transform: scale(1, 1) skewX(-1.5deg); opacity: 0.94; }
          25% { transform: scale(1.06, 0.94) skewX(2deg); opacity: 1; }
          50% { transform: scale(0.95, 1.07) skewX(-2deg); opacity: 0.88; }
          75% { transform: scale(1.04, 0.96) skewX(1deg); opacity: 0.98; }
          100% { transform: scale(1, 1) skewX(-1.5deg); opacity: 0.94; }
        }

        @keyframes steamRise {
          0% { transform: translateY(0) scaleX(1); opacity: 0.65; }
          50% { transform: translateY(-22px) scaleX(1.35); opacity: 0.35; }
          100% { transform: translateY(-48px) scaleX(1.7); opacity: 0; }
        }

        @keyframes boilingBubble {
          0% { transform: translateY(0) scale(0.7); opacity: 0.2; }
          50% { transform: translateY(-25px) scale(1.2); opacity: 0.95; }
          100% { transform: translateY(-55px) scale(0.9); opacity: 0; }
        }
      `}</style>

      {/* Dynamic Chemical Equation Banner */}
      <ChemicalEquationBanner equation={rx.equation} />

      {/* Custom Temperature Control Slider Bar */}
      <TempControlBar temp={customTemp} setTemp={setCustomTemp} isHeating={isHeating} setIsHeating={setIsHeating} />

      {/* Main Glassware Simulation Canvas */}
      <div style={{
        flex: 1, minHeight: '220px', maxHeight: '340px', background: 'radial-gradient(circle at center, #0b1a29 0%, #030712 100%)',
        borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
      }}>

        {/* Active Substances HUD Container */}
        <div style={{
          position: 'absolute', top: '8px', left: '12px', zIndex: 10,
          background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(13, 148, 136, 0.3)', borderRadius: '10px',
          padding: '6px 12px', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🧪 VẬT THỂ & HÓA CHẤT TRONG CỐC:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {waterMl > 0 && (
              <span style={{
                background: 'rgba(2, 132, 199, 0.3)', border: '1px solid #0284c7', color: '#38bdf8',
                borderRadius: '6px', padding: '2px 7px', fontSize: '0.72rem', fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}>
                💧 H₂O ({waterMl}ml)
                <button onClick={handleRemoveWater} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.78rem', padding: 0, marginLeft: '2px' }}>✕</button>
              </span>
            )}
            {selectedSubstances.map(id => {
              const info = reagents.find(r => r.id === id);
              return (
                <span key={id} style={{
                  background: 'rgba(13, 148, 136, 0.3)', border: '1px solid #2dd4bf', color: '#ffffff',
                  borderRadius: '6px', padding: '2px 7px', fontSize: '0.72rem', fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', gap: '4px'
                }}>
                  {info?.icon} {info?.name || id}
                  <button onClick={() => handleRemoveSubstance(id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.78rem', padding: 0, marginLeft: '2px' }}>✕</button>
                </span>
              );
            })}
            {!hasAnySubstance && (
              <span style={{ fontSize: '0.72rem', color: '#64748b', italic: 'true' }}>
                (Cốc trống - Hãy chọn nguyên tố / rót nước bên dưới)
              </span>
            )}
          </div>
        </div>

        <svg width="100%" height="100%" viewBox="0 0 500 330" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="beakerGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="80%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>

            <linearGradient id="naGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            <linearGradient id="kGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e9d5ff" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>

            <linearGradient id="alcoholFuelGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(236,72,153,0.5)" />
              <stop offset="50%" stopColor="rgba(168,85,247,0.4)" />
              <stop offset="100%" stopColor="rgba(236,72,153,0.6)" />
            </linearGradient>
          </defs>

          {/* Wooden Lab Bench */}
          <rect x="40" y="305" width="420" height="15" fill="#1e293b" rx="4" />

          {/* REALISTIC ALCOHOL LAMP ASSEMBLY SITTING ON BENCH BELOW TRIPOD */}
          <AlcoholLampAssembly x={250} y={245} isHeating={isHeating} temp={rx.temp} />

          {/* METAL TRIPOD STAND & WIRE GAUZE UNDER BEAKER */}
          <g>
            {/* Wire Gauze */}
            <line x1="170" y1="185" x2="330" y2="185" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 2" />
            <rect x="180" y="184" width="140" height="2" fill="rgba(255,255,255,0.4)" />
            
            {/* Metal Tripod Legs */}
            <line x1="180" y1="185" x2="145" y2="305" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <line x1="320" y1="185" x2="355" y2="305" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <line x1="250" y1="185" x2="250" y2="305" stroke="#334155" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          </g>

          {/* Glass Beaker Container Sitting Directly ON TOP of Wire Gauze */}
          <g transform="translate(250, 95)">
            {/* Heat Glow Bottom Effect */}
            {isHeating && (
              <ellipse cx="0" cy="90" rx="70" ry="10" fill="rgba(245, 158, 11, 0.45)" style={{ filter: 'blur(8px)' }} />
            )}

            {/* Liquid Content Fill */}
            {rx.hasLiquidSolution && (
              <path d={`M -80 ${liquidFillY} L -80 80 A 15 15 0 0 0 -65 95 L 65 95 A 15 15 0 0 0 80 80 L 80 ${liquidFillY} Z`}
                fill={rx.liquidColor} style={{ transition: 'all 0.6s ease' }} 
              />
            )}

            {/* Meniscus Ripple Line */}
            {rx.hasLiquidSolution && (
              <ellipse cx="0" cy={liquidFillY} rx="78" ry="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            )}

            {/* Rising Steam Clouds & Active Boiling Water Bubbles when Heating Liquid */}
            {isHeating && rx.hasLiquidSolution && (
              <g>
                {/* Rising Steam Clouds above beaker */}
                <g transform="translate(0, -90)">
                  <path d="M -30 0 Q -20 -15 -25 -30 T -35 -50" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeLinecap="round" style={{ animation: 'steamRise 2s infinite ease-out' }} />
                  <path d="M 0 0 Q 10 -15 5 -30 T 15 -50" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="5" strokeLinecap="round" style={{ animation: 'steamRise 2.4s infinite ease-out 0.4s' }} />
                  <path d="M 30 0 Q 40 -15 35 -30 T 45 -50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" style={{ animation: 'steamRise 1.8s infinite ease-out 0.8s' }} />
                </g>

                {/* Animated Water Boiling Bubbles inside liquid */}
                <g transform={`translate(0, ${liquidFillY + 25})`}>
                  <circle cx="-50" cy="30" r="5" fill="rgba(255,255,255,0.85)" style={{ animation: 'boilingBubble 1.1s infinite ease-in-out' }} />
                  <circle cx="-25" cy="45" r="7" fill="rgba(255,255,255,0.9)" style={{ animation: 'boilingBubble 0.8s infinite ease-in-out 0.3s' }} />
                  <circle cx="0" cy="20" r="6" fill="rgba(255,255,255,0.8)" style={{ animation: 'boilingBubble 1.0s infinite ease-in-out 0.6s' }} />
                  <circle cx="25" cy="40" r="8" fill="rgba(255,255,255,0.95)" style={{ animation: 'boilingBubble 1.3s infinite ease-in-out 0.2s' }} />
                  <circle cx="50" cy="25" r="5" fill="rgba(255,255,255,0.8)" style={{ animation: 'boilingBubble 0.9s infinite ease-in-out 0.5s' }} />
                </g>
              </g>
            )}

            {/* --- PHYSICAL OBJECTS & METALS INSIDE BEAKER --- */}

            {/* 1. Natri (Na) Solid Bead / Floating Spheres */}
            {selectedSubstances.includes('Na') && (
              <g>
                {rx.hasLiquidSolution ? (
                  <g transform={`translate(-25, ${liquidFillY + 8})`}>
                    <circle cx="0" cy="0" r="10" fill="url(#naGrad)" style={{ filter: 'drop-shadow(0 0 10px #fde047)' }} />
                    <circle cx="-3" cy="-3" r="3" fill="#ffffff" opacity="0.8" />
                    <circle cx="-12" cy="-8" r="3" fill="#fde047" />
                    <circle cx="14" cy="-5" r="2.5" fill="#ef4444" />
                  </g>
                ) : (
                  <g transform="translate(-35, 78)">
                    <ellipse cx="0" cy="0" rx="14" ry="10" fill="url(#naGrad)" stroke="#b45309" strokeWidth="1.5" />
                    <ellipse cx="-4" cy="-3" rx="5" ry="3" fill="#ffffff" opacity="0.6" />
                    <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">Na</text>
                  </g>
                )}
              </g>
            )}

            {/* 2. Kali (K) Solid Bead / Floating Spheres */}
            {selectedSubstances.includes('K') && (
              <g>
                {rx.hasLiquidSolution ? (
                  <g transform={`translate(20, ${liquidFillY + 8})`}>
                    <circle cx="0" cy="0" r="10" fill="url(#kGrad)" style={{ filter: 'drop-shadow(0 0 12px #c084fc)' }} />
                    <circle cx="-3" cy="-3" r="3" fill="#ffffff" opacity="0.8" />
                    <circle cx="10" cy="-10" r="3.5" fill="#c084fc" />
                  </g>
                ) : (
                  <g transform="translate(25, 80)">
                    <ellipse cx="0" cy="0" rx="13" ry="9" fill="url(#kGrad)" stroke="#6b21a8" strokeWidth="1.5" />
                    <ellipse cx="-3" cy="-3" rx="4" ry="2.5" fill="#ffffff" opacity="0.6" />
                    <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">K</text>
                  </g>
                )}
              </g>
            )}

            {/* 3. Sắt (Fe) Metallic Nail (Red-hot glowing when heated) */}
            {selectedSubstances.includes('Fe') && (
              <g transform="translate(-30, 72) rotate(-12)" style={{ filter: rx.feRedHotSparks ? 'drop-shadow(0 0 14px #ef4444)' : 'none' }}>
                <rect x="0" y="0" width="48" height="7" rx="2" 
                  fill={rx.feRedHotSparks ? "#ef4444" : rx.feCoatedWithCu ? "#b45309" : "#64748b"} 
                  stroke={rx.feRedHotSparks ? "#f59e0b" : rx.feCoatedWithCu ? "#78350f" : "#475569"} strokeWidth="1.5" 
                />
                <polygon points="48,0 58,3.5 48,7" fill={rx.feRedHotSparks ? "#f59e0b" : rx.feCoatedWithCu ? "#b45309" : "#64748b"} />
                <rect x="-4" y="-3" width="5" height="13" rx="1" fill={rx.feRedHotSparks ? "#ef4444" : "#475569"} />
                <text x="20" y="-3" fill="#ffffff" fontSize="9" fontWeight="900">Fe</text>
              </g>
            )}

            {/* 4. Đồng (Cu) Metal Strip / Wire Coil (Turns Black CuO when heated) */}
            {selectedSubstances.includes('Cu') && (
              <g transform="translate(5, 55)">
                <path d="M 10 10 C 25 30, 20 45, 45 35 S 55 25, 60 40" fill="none" 
                  stroke={rx.cuBurnedBlack ? "#18181b" : "#b45309"} 
                  strokeWidth="5.5" strokeLinecap="round" 
                  style={{ filter: rx.cuBurnedBlack ? 'drop-shadow(0 0 8px #000000)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} 
                />
                <text x="30" y="20" fill={rx.cuBurnedBlack ? "#94a3b8" : "#fde047"} fontSize="9" fontWeight="900">
                  {rx.cuBurnedBlack ? "CuO (Đen)" : "Cu"}
                </text>
              </g>
            )}

            {/* 5. Kẽm (Zn) Metal Plate */}
            {selectedSubstances.includes('Zn') && (
              <g transform="translate(-12, 65)">
                <rect x="0" y="0" width="36" height="16" rx="3" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="18" y="12" fill="#0f172a" fontSize="10" fontWeight="900" textAnchor="middle">Zn</text>
              </g>
            )}

            {/* 6. Magie (Mg) Ribbon Coil (Blinding white light glow when heated) */}
            {selectedSubstances.includes('Mg') && (
              <g transform="translate(-45, 65)" style={{ filter: rx.mgBlindingLight ? 'drop-shadow(0 0 30px #ffffff) drop-shadow(0 0 50px #38bdf8)' : 'none' }}>
                <path d="M 0 0 Q 15 15 30 0 Q 45 15 60 0" fill="none" 
                  stroke={rx.mgBlindingLight ? "#ffffff" : "#f1f5f9"} 
                  strokeWidth={rx.mgBlindingLight ? "6" : "4"} strokeLinecap="round" 
                />
                <text x="25" y="-5" fill={rx.mgBlindingLight ? "#fde047" : "#ffffff"} fontSize="9" fontWeight="900">Mg</text>
              </g>
            )}

            {/* 7. Nhôm (Al) Metal Sheet */}
            {selectedSubstances.includes('Al') && (
              <g transform="translate(-15, 65)">
                <polygon points="0,15 30,0 40,25 10,30" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="18" y="17" fill="#0f172a" fontSize="10" fontWeight="900">Al</text>
              </g>
            )}

            {/* 8. Đá Vôi (CaCO3) Limestone Rocks */}
            {selectedSubstances.includes('CaCO3') && (
              <g transform="translate(0, 0)">
                <circle cx="-35" cy="80" r="8" fill={rx.caco3Decomposed ? "#fef08a" : "#f8fafc"} stroke="#94a3b8" strokeWidth="1" />
                <circle cx="-22" cy="84" r="6" fill={rx.caco3Decomposed ? "#fef08a" : "#f1f5f9"} stroke="#cbd5e1" strokeWidth="1" />
                <circle cx="-10" cy="81" r="9" fill={rx.caco3Decomposed ? "#fde047" : "#e2e8f0"} stroke="#94a3b8" strokeWidth="1" />
                <text x="-25" y="72" fill="#ffffff" fontSize="8" fontWeight="900">
                  {rx.caco3Decomposed ? "CaO + CO₂↑" : "CaCO₃"}
                </text>
              </g>
            )}

            {/* 9. Đồng Oxit (CuO) Black Powder Layer */}
            {selectedSubstances.includes('CuO') && (
              <g transform="translate(0, 86)">
                <ellipse cx="0" cy="0" rx="55" ry="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
                <text x="0" y="3" fill="#94a3b8" fontSize="8" fontWeight="900" textAnchor="middle">Bột CuO (Đen)</text>
              </g>
            )}

            {/* 10. Glucose (C6H12O6) Sugar Crystals */}
            {selectedSubstances.includes('Glucose') && (
              <g transform="translate(10, 85)">
                <ellipse cx="0" cy="0" rx="40" ry="6" fill="rgba(255,255,255,0.75)" stroke="rgba(255,255,255,0.9)" strokeWidth="1" />
                <text x="0" y="3" fill="#0f172a" fontSize="8" fontWeight="900" textAnchor="middle">Glucose</text>
              </g>
            )}

            {/* Silver Mirror Coating Layer */}
            {rx.silverMirror && (
              <path d="M -85 -90 L -80 -80 L -80 80 A 18 18 0 0 0 -62 108 L 62 108 A 18 18 0 0 0 80 80 L 80 -80 L 85 -90 Z"
                fill="none" stroke="#ffffff" strokeWidth="4" style={{ filter: 'drop-shadow(0 0 20px #ffffff)' }} />
            )}

            {/* Glass Beaker Body Overlay */}
            <path d="M -85 -90 L -80 -80 L -80 80 A 18 18 0 0 0 -62 108 L 62 108 A 18 18 0 0 0 80 80 L 80 -80 L 85 -90 Z"
              fill="url(#beakerGrad2)" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" />

            {/* Volumetric Ticks */}
            {[-50, -20, 10, 40, 70].map((y, idx) => (
              <g key={idx}>
                <line x1="-78" y1={y} x2="-62" y2={y} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                <text x="-58" y={y + 4} fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="bold">{(5 - idx) * 50} ml</text>
              </g>
            ))}

            {/* Effervescence / Boiling Bubbles */}
            {rx.bubbles && (
              <g>
                <circle cx="-20" cy="20" r="4" fill="#ffffff" opacity="0.8" style={{ animation: 'boilingBubble 1.2s infinite ease-in' }} />
                <circle cx="10" cy="-10" r="5" fill="#ffffff" opacity="0.8" style={{ animation: 'boilingBubble 1.5s infinite ease-in 0.3s' }} />
                <circle cx="-5" cy="-30" r="3" fill="#ffffff" opacity="0.8" style={{ animation: 'boilingBubble 1s infinite ease-in 0.6s' }} />
                <circle cx="30" cy="40" r="4.5" fill="#ffffff" opacity="0.8" style={{ animation: 'boilingBubble 1.4s infinite ease-in 0.2s' }} />
              </g>
            )}

            {/* Sparks Firework Effect */}
            {rx.sparks && (
              <g>
                <circle cx="0" cy="-15" r="8" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 12px #fde047)' }} />
                <circle cx="-15" cy="-25" r="4" fill="#ef4444" />
                <circle cx="20" cy="-20" r="4" fill="#ffffff" />
              </g>
            )}

            {/* Precipitate Solids at Bottom */}
            {rx.precipitate && (
              <ellipse cx="0" cy="85" rx="55" ry="8" fill={rx.precipitateColor} opacity="0.95" />
            )}

            {/* Animated Pouring / Dropping Instrument */}
            {animatingItem && (
              <g transform="translate(0, -110)" style={{ transition: 'all 0.3s ease' }}>
                {['HCl', 'H2SO4', 'NaOH', 'CuSO4', 'AgNO3', 'Phenol', 'H2O'].includes(animatingItem) ? (
                  <g transform="rotate(-40)">
                    <rect x="-15" y="-30" width="30" height="50" rx="4" fill="rgba(255,255,255,0.8)" stroke="#0d9488" strokeWidth="2" />
                    <line x1="0" y1="20" x2="0" y2="80" stroke="#38bdf8" strokeWidth="4" strokeDasharray="6 4" />
                  </g>
                ) : (
                  // Metal Forceps Dropping Solid Piece
                  <g transform="translate(0, 0)">
                    <path d="M -12 -30 L 0 10 M 12 -30 L 0 10" stroke="#94a3b8" strokeWidth="3" fill="none" />
                    <circle cx="0" cy="20" r="8" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 8px #fde047)' }} />
                  </g>
                )}
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Main Control Panel: Primary Action Bar & Reagent Selector Tray */}
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.95)', padding: '12px 14px', borderRadius: '16px', 
        border: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', flexDirection: 'column', gap: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)', flexShrink: 0
      }}>
        {/* Prominent High-Visibility Temperature Control Bar */}
        <TempControlBar temp={customTemp} setTemp={setCustomTemp} isHeating={isHeating} setIsHeating={setIsHeating} />
        
        {/* TOP ROW: ALWAYS VISIBLE MAIN ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)', pb: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleAddWater}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff', border: '1.5px solid #38bdf8', borderRadius: '10px',
                padding: '8px 16px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 0 14px rgba(2, 132, 199, 0.4)'
              }}
            >
              💧 Rót Nước H₂O (+50ml)
            </button>
            <button
              onClick={handleToggleHeat}
              style={{
                background: isHeating ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#334155',
                color: '#ffffff', border: isHeating ? '1.5px solid #f87171' : '1px solid #475569',
                borderRadius: '10px', padding: '8px 16px', fontWeight: 800, fontSize: '0.82rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: isHeating ? '0 0 16px rgba(239, 68, 68, 0.5)' : 'none'
              }}
            >
              <Flame size={15} color={isHeating ? "#fde047" : "#cbd5e1"} /> 
              {isHeating ? '🔥 Đang Đun Nóng (Tắt)' : '🔥 Bật Đèn Cồn (Đun Nóng)'}
            </button>
          </div>

          <button
            onClick={handleClear}
            style={{
              background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px',
              padding: '8px 14px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <RotateCcw size={15} /> 🧹 Rửa Sạch Cốc
          </button>
        </div>

        {/* BOTTOM ROW: REAGENT SELECTION TRAY */}
        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            🏷️ KHAY NGUYÊN TỐ & HÓA CHẤT TỰ CHỌN (Bấm để cho vào cốc):
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {reagents.map(r => {
              const active = selectedSubstances.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => handleAddReagent(r.id)}
                  style={{
                    background: active ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' : '#1e293b',
                    color: active ? '#ffffff' : '#cbd5e1',
                    border: active ? '1.5px solid #2dd4bf' : '1px solid #334155',
                    borderRadius: '8px', padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                    transition: 'all 0.15s ease',
                    boxShadow: active ? '0 0 10px rgba(45, 212, 191, 0.4)' : 'none'
                  }}
                >
                  <span>{r.icon}</span> {r.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChemistryPrecipitationSim({ onLog }) {
  const [isMixed, setIsMixed] = useState(false);

  const handleMix = () => {
    setIsMixed(true);
    onLog("Trộn dung dịch BaCl2 vào Na2SO4 -> Phản ứng tức thì xuất hiện hạt kết tủa trắng BaSO4 đục ngầu chìm xuống đáy!");
  };

  const handleReset = () => {
    setIsMixed(false);
    onLog("Đã rửa sạch ống nghiệm. Hãy trộn dung dịch lại.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09131d', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.3)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '100px', height: '180px',
              border: '4px solid rgba(255, 255, 255, 0.5)', borderTop: 'none',
              borderRadius: '0 0 20px 20px', position: 'relative',
              background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: isMixed ? '70%' : '45%',
                background: isMixed ? 'rgba(255, 255, 255, 0.85)' : 'rgba(186, 230, 253, 0.35)',
                transition: 'all 0.8s ease', borderRadius: '0 0 16px 16px',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                alignItems: 'center', paddingBottom: '10px'
              }}>
                {isMixed && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0f172a', background: '#ffffff', padding: '4px 8px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    Kết tủa BaSO4 ↓
                  </div>
                )}
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
              {isMixed ? 'Hỗn hợp Phản Ứng' : 'Dung dịch Na2SO4'}
            </span>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0d9488' }}>
            {isMixed ? '=' : '+'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: isMixed ? 0.3 : 1, transition: 'opacity 0.5s' }}>
            <div style={{
              width: '80px', height: '140px',
              border: '3px solid rgba(255, 255, 255, 0.4)', borderTop: 'none',
              borderRadius: '0 0 16px 16px', position: 'relative',
              background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '50%', background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '0 0 13px 13px'
              }} />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>Dung dịch BaCl2</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Phương trình: <b style={{ color: '#38bdf8' }}>BaCl₂ + Na₂SO₄ ➔ BaSO₄↓ (trắng) + 2NaCl</b>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleMix} disabled={isMixed} style={{ background: isMixed ? '#334155' : 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: isMixed ? 'default' : 'pointer' }}>
            Trộn Dung Dịch
          </button>
          <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Làm Mới
          </button>
        </div>
      </div>
    </div>
  );
}

function ChemistryGasBurnSim({ onLog }) {
  const [isReacting, setIsReacting] = useState(false);
  const [isLit, setIsLit] = useState(false);

  const handleStart = () => {
    setIsReacting(true);
    onLog("Rót dung dịch HCl vào Kẽm (Zn) -> Sủi bọt khí H2 thoát ra mãnh liệt trong ống nghiệm!");
  };

  const handleIgnite = () => {
    if (!isReacting) return alert("Hãy cho phản ứng sinh khí trước khi đốt!");
    setIsLit(true);
    onLog("Đưa que đốt lại gần khí H2 ở miệng ống nghiệm -> Ngọn lửa xanh nhạt bùng cháy với tiếng nổ 'bốp' nhỏ!");
  };

  const handleReset = () => {
    setIsReacting(false);
    setIsLit(false);
    onLog("Đã làm sạch ống nghiệm.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09131d', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.3)', padding: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {isLit && (
            <div style={{
              position: 'absolute', top: '-45px',
              animation: 'pulse 0.5s infinite alternate'
            }}>
              <Flame size={44} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 12px #38bdf8)' }} />
            </div>
          )}

          <div style={{
            width: '76px', height: '220px',
            border: '4px solid rgba(255, 255, 255, 0.4)', borderTop: 'none',
            borderRadius: '0 0 38px 38px', position: 'relative',
            background: 'rgba(255,255,255,0.05)', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: isReacting ? '55%' : '0%', background: 'rgba(186, 230, 253, 0.3)',
              transition: 'height 0.8s ease', borderRadius: '0 0 34px 34px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: '12px'
            }}>
              <div style={{ width: '28px', height: '14px', background: '#94a3b8', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              {isReacting && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', opacity: 0.8 }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', opacity: 0.7 }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff', opacity: 0.9 }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Phương trình: <b style={{ color: '#38bdf8' }}>Zn + 2HCl ➔ ZnCl₂ + H₂↑</b>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleStart} disabled={isReacting} style={{ background: isReacting ? '#334155' : '#0d9488', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
            Rót HCl vào Zn
          </button>
          <button onClick={handleIgnite} disabled={!isReacting || isLit} style={{ background: isLit ? '#334155' : '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
            Đốt Khí H2
          </button>
          <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 14px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Làm Mới
          </button>
        </div>
      </div>
    </div>
  );
}

function ChemistryFlameBurnSim({ onLog }) {
  const [isBurning, setIsBurning] = useState(false);

  const handleBurn = () => {
    setIsBurning(true);
    onLog("Đưa dây Magnesi (Mg) vào ngọn lửa đèn cồn -> Dây Mg bùng cháy mãnh liệt phát ra ánh sáng trắng chói lọi, tạo sản phẩm bột MgO màu trắng!");
  };

  const handleReset = () => {
    setIsBurning(false);
    onLog("Đã thay dây Magnesi mới.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09131d', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.3)', padding: '20px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px', height: '120px',
              background: isBurning ? '#ffffff' : '#cbd5e1',
              boxShadow: isBurning ? '0 0 50px 20px #ffffff, 0 0 100px 40px #38bdf8' : 'none',
              borderRadius: '4px', transition: 'all 0.5s ease'
            }} />
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
              {isBurning ? 'Bột MgO sản phẩm' : 'Dây Magnesi (Mg)'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <Flame size={48} color="#ef4444" style={{ filter: 'drop-shadow(0 0 15px #f59e0b)' }} />
            <div style={{ width: '40px', height: '40px', background: '#334155', borderRadius: '6px' }} />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Đèn cồn</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Phương trình: <b style={{ color: '#fde047' }}>2Mg + O₂ ➔ 2MgO (tỏa nhiều nhiệt & ánh sáng)</b>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleBurn} disabled={isBurning} style={{ background: isBurning ? '#334155' : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
            Đốt Dây Mg
          </button>
          <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Làm Mới
          </button>
        </div>
      </div>
    </div>
  );
}

function ChemistrySilverMirrorSim({ onLog }) {
  const [isHeated, setIsHeated] = useState(false);

  const handleHeat = () => {
    setIsHeated(true);
    onLog("Đun nóng ống nghiệm chứa Glucose + AgNO3/NH3 -> Thành trong ống nghiệm dần phủ một lớp Bạc kim loại (Ag) sáng bóng như gương!");
  };

  const handleReset = () => {
    setIsHeated(false);
    onLog("Đã rửa sạch lớp gương Bạc.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09131d', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.3)', padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '84px', height: '240px',
            border: '4px solid rgba(255, 255, 255, 0.5)', borderTop: 'none',
            borderRadius: '0 0 42px 42px', position: 'relative',
            background: isHeated ? 'linear-gradient(180deg, rgba(226, 232, 240, 0.9) 0%, rgba(203, 213, 225, 0.95) 100%)' : 'rgba(255,255,255,0.05)',
            boxShadow: isHeated ? '0 0 30px rgba(226, 232, 240, 0.8)' : 'none',
            transition: 'all 1s ease', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
              background: isHeated ? 'rgba(203, 213, 225, 0.4)' : 'rgba(255,255,255,0.15)',
              borderRadius: '0 0 38px 38px'
            }} />
          </div>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            {isHeated ? 'Thành ống phủ Bạc sáng ngời ✨' : 'Dung dịch Glucose + [Ag(NH3)2]+'}
          </span>
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Phương trình: <b style={{ color: '#e2e8f0' }}>Glucose + 2AgNO₃ + 3NH₃ + H₂O ➔ 2Ag↓ (Tráng Bạc) + ...</b>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleHeat} disabled={isHeated} style={{ background: isHeated ? '#334155' : 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
            Đun Nóng Tráng Bạc
          </button>
          <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Làm Mới
          </button>
        </div>
      </div>
    </div>
  );
}

function PhysicsRefractionSim({ onLog }) {
  const [angle, setAngle] = useState(45);
  const n1 = 1.0;
  const n2 = 1.5;

  const radI = (angle * Math.PI) / 180;
  const sinR = (n1 / n2) * Math.sin(radI);
  const radR = Math.asin(sinR);
  const angleR = Math.round((radR * 180) / Math.PI);

  useEffect(() => {
    onLog(`Thay đổi góc tới i = ${angle}° -> Góc khúc xạ r = ${angleR}° trong Thủy tinh (n=1.5). Tỉ số sin(i)/sin(r) = ${(Math.sin(radI)/Math.sin(radR)).toFixed(2)}.`);
  }, [angle]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, background: '#060e17', borderRadius: '16px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(13, 148, 136, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100%" height="100%" viewBox="0 0 600 350">
          <rect x="0" y="0" width="600" height="175" fill="rgba(15, 23, 42, 0.8)" />
          <text x="20" y="30" fill="#94a3b8" fontSize="14" fontWeight="bold">Môi trường 1: Không khí (n1 = 1.0)</text>

          <rect x="0" y="175" width="600" height="175" fill="rgba(14, 116, 144, 0.3)" />
          <text x="20" y="205" fill="#38bdf8" fontSize="14" fontWeight="bold">Môi trường 2: Khối Thủy Tinh (n2 = 1.5)</text>

          <line x1="0" y1="175" x2="600" y2="175" stroke="#0d9488" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="300" y1="20" x2="300" y2="330" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 6" />

          {(() => {
            const startX = 300 - 150 * Math.tan(radI);
            return (
              <>
                <line x1={startX} y1="25" x2="300" y2="175" stroke="#ef4444" strokeWidth="4" />
                <circle cx={startX} cy="25" r="5" fill="#ef4444" />
                <text x={startX - 30} y="20" fill="#fca5a5" fontSize="13" fontWeight="bold">Laser (i = {angle}°)</text>
              </>
            );
          })()}

          {(() => {
            const endX = 300 + 140 * Math.tan(radR);
            return (
              <>
                <line x1="300" y1="175" x2={endX} y2="315" stroke="#f59e0b" strokeWidth="4" />
                <text x={endX + 10} y="320" fill="#fde047" fontSize="13" fontWeight="bold">Tia khúc xạ (r = {angleR}°)</text>
              </>
            );
          })()}

          <circle cx="300" cy="175" r="6" fill="#38bdf8" />
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, minWidth: '130px' }}>
            Góc tới (i): <b style={{ color: '#ef4444' }}>{angle}°</b>
          </span>
          <input 
            type="range" min="0" max="80" value={angle} 
            onChange={(e) => setAngle(Number(e.target.value))} 
            style={{ flex: 1, accentColor: '#0d9488', cursor: 'pointer' }} 
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: '#fde047', fontWeight: 800 }}>
          Góc khúc xạ (r): {angleR}°
        </div>
      </div>
    </div>
  );
}

function PhysicsCircuitSim({ onLog }) {
  const [isOpen, setIsOpen] = useState(false);
  const [voltage, setVoltage] = useState(12);

  const resistance = 10;
  const current = isOpen ? (voltage / resistance).toFixed(2) : 0;

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      onLog(`Đóng công tắc K -> Dòng điện I = ${current}A chạy qua bóng đèn. Đèn sáng rực!`);
    } else {
      onLog(`Ngắt công tắc K -> Dòng điện I = 0A. Đèn tắt.`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, background: '#09131d', borderRadius: '16px', position: 'relative', border: '1px solid rgba(13, 148, 136, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 300">
          <rect x="80" y="50" width="340" height="200" fill="none" stroke={isOpen ? '#38bdf8' : '#475569'} strokeWidth="4" rx="10" />

          <g transform="translate(80, 150)">
            <circle cx="0" cy="0" r="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <text x="-10" y="5" fill="#38bdf8" fontSize="14" fontWeight="bold">{voltage}V</text>
          </g>

          <g transform="translate(250, 50)" style={{ cursor: 'pointer' }} onClick={handleToggle}>
            <circle cx="-30" cy="0" r="5" fill="#f59e0b" />
            <circle cx="30" cy="0" r="5" fill="#f59e0b" />
            <line x1="-30" y1="0" x2={isOpen ? "30" : "15"} y2={isOpen ? "0" : "-25"} stroke="#f59e0b" strokeWidth="4" />
            <text x="-20" y="-30" fill="#fde047" fontSize="13" fontWeight="bold">Công tắc K ({isOpen ? 'ĐÓNG' : 'MỞ'})</text>
          </g>

          <g transform="translate(420, 150)">
            <circle cx="0" cy="0" r="28" fill={isOpen ? `rgba(253, 224, 71, ${Math.min(1, voltage/12)})` : '#1e293b'} stroke="#fde047" strokeWidth="3" style={{ filter: isOpen ? 'drop-shadow(0 0 15px #fde047)' : 'none' }} />
            <text x="-8" y="6" fill={isOpen ? '#0f172a' : '#94a3b8'} fontSize="16" fontWeight="bold">💡</text>
            <text x="35" y="5" fill="#cbd5e1" fontSize="13" fontWeight="bold">Đèn ({resistance}Ω)</text>
          </g>

          <g transform="translate(250, 250)">
            <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#0d9488" strokeWidth="3" />
            <text x="-12" y="5" fill="#2dd4bf" fontSize="13" fontWeight="bold">A: {current}A</text>
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>Nguồn điện (U): <b>{voltage}V</b></span>
          <input 
            type="range" min="3" max="24" step="3" value={voltage} 
            onChange={(e) => setVoltage(Number(e.target.value))} 
            style={{ width: '200px', accentColor: '#0d9488', cursor: 'pointer' }} 
          />
        </div>
        <button 
          onClick={handleToggle}
          style={{ background: isOpen ? '#ef4444' : 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          {isOpen ? 'Ngắt Công Tắc' : 'Đóng Công Tắc (Bật Đèn)'}
        </button>
      </div>
    </div>
  );
}

function PhysicsPendulumSim({ onLog }) {
  const [length, setLength] = useState(1.0);
  const [isSwinging, setIsSwinging] = useState(false);
  const [angle, setAngle] = useState(0);
  const [oscCount, setOscCount] = useState(0);
  const [stopwatch, setStopwatch] = useState(0);
  const [isTiming10, setIsTiming10] = useState(false);

  const gravity = 9.8;
  const theoreticalPeriod = (2 * Math.PI * Math.sqrt(length / gravity)).toFixed(2);

  const animRef = useRef(null);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const prevAngleRef = useRef(0);
  const passCountRef = useRef(0);
  const startTime10Ref = useRef(0);

  useEffect(() => {
    if (!isSwinging) {
      setAngle(0);
      return;
    }

    const omega = Math.sqrt(gravity / length);
    const amplitude = 0.35;

    const animate = (now) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      timeRef.current += dt;

      const currentAngle = amplitude * Math.cos(omega * timeRef.current);
      setAngle(currentAngle);

      if (prevAngleRef.current < 0 && currentAngle >= 0) {
        passCountRef.current += 1;
        setOscCount(passCountRef.current);

        if (isTiming10 && passCountRef.current === 10) {
          const elapsed = ((performance.now() - startTime10Ref.current) / 1000).toFixed(2);
          setStopwatch(elapsed);
          setIsTiming10(false);
          onLog(`⏱️ Bấm giờ hoàn tất 10 dao động: t10 = ${elapsed}s ➔ Chu kỳ đo được T_đo = ${(elapsed/10).toFixed(2)}s (Chu kỳ lý thuyết: ${theoreticalPeriod}s).`);
        }
      }
      prevAngleRef.current = currentAngle;

      animRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isSwinging, length]);

  const handleStartSwinging = () => {
    setIsSwinging(true);
    onLog(`▶️ Bắt đầu thả con lắc đơn (chiều dài dây l = ${length}m) dao động hòa nhập với chu kỳ lý thuyết T = ${theoreticalPeriod}s.`);
  };

  const handlePause = () => {
    setIsSwinging(false);
    onLog("⏸️ Tạm dừng dao động con lắc.");
  };

  const handleStartTimer10 = () => {
    if (!isSwinging) setIsSwinging(true);
    passCountRef.current = 0;
    setOscCount(0);
    setStopwatch(0);
    setIsTiming10(true);
    startTime10Ref.current = performance.now();
    onLog("⏱️ Bắt đầu bấm giờ đo thời gian 10 dao động toàn phần...");
  };

  const handleReset = () => {
    setIsSwinging(false);
    setAngle(0);
    setOscCount(0);
    setStopwatch(0);
    setIsTiming10(false);
    passCountRef.current = 0;
    onLog("🔄 Tái lập vị trí cân bằng cho con lắc.");
  };

  const bobX = 200 + length * 100 * Math.sin(angle);
  const bobY = 30 + length * 100 * Math.cos(angle);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, background: '#060e17', borderRadius: '16px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(13, 148, 136, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100%" height="100%" viewBox="0 0 400 300">
          <line x1="100" y1="30" x2="300" y2="30" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
          <line x1="200" y1="30" x2="200" y2="280" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

          <line x1="200" y1="30" x2={bobX} y2={bobY} stroke="#38bdf8" strokeWidth="3" />
          <circle cx={bobX} cy={bobY} r="18" fill="#0284c7" stroke="#38bdf8" strokeWidth="3" style={{ filter: 'drop-shadow(0 4px 10px rgba(2, 132, 199, 0.6))' }} />
          <circle cx={bobX} cy={bobY} r="4" fill="#ffffff" />
        </svg>

        <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(15, 23, 42, 0.85)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: '0.8rem', color: '#cbd5e1' }}>
          <div>Số dao động: <b style={{ color: '#38bdf8' }}>{oscCount}</b></div>
          {stopwatch > 0 && (
            <div style={{ color: '#fde047', fontWeight: 800, marginTop: '4px' }}>
              Thời gian 10 dao động: {stopwatch}s (T_đo = {(stopwatch/10).toFixed(2)}s)
            </div>
          )}
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>Chiều dài dây (l): <b>{length}m</b></span>
          <input 
            type="range" min="0.4" max="2.0" step="0.2" value={length} 
            onChange={(e) => setLength(Number(e.target.value))} 
            style={{ width: '160px', accentColor: '#0d9488', cursor: 'pointer' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isSwinging ? (
            <button onClick={handleStartSwinging} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Play size={16} fill="#fff" /> Thả Dao Động
            </button>
          ) : (
            <button onClick={handlePause} style={{ background: '#eab308', color: '#000', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Pause size={16} fill="#000" /> Tạm Dừng
            </button>
          )}

          <button onClick={handleStartTimer10} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Timer size={16} /> Bấm Giờ 10 Lần
          </button>

          <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 14px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Làm Mới
          </button>
        </div>
      </div>
    </div>
  );
}

function PhysicsSpringSim({ onLog }) {
  const [mass, setMass] = useState(100);
  const k = 50;
  const g = 9.8;
  const force = ((mass / 1000) * g).toFixed(2);
  const deltaL = ((force / k) * 100).toFixed(1);

  useEffect(() => {
    onLog(`Treo quả tạ m = ${mass}g (Lực F = ${force}N) -> Độ giãn lò xo delta_l = ${deltaL} cm.`);
  }, [mass]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, background: '#09131d', borderRadius: '16px', position: 'relative', border: '1px solid rgba(13, 148, 136, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '8px', background: '#475569', borderRadius: '4px' }} />
          <div style={{
            width: '24px',
            height: `${60 + Number(deltaL) * 5}px`,
            borderLeft: '4px solid #38bdf8',
            borderRight: '4px solid #38bdf8',
            borderRadius: '12px',
            transition: 'height 0.4s ease'
          }} />

          <div style={{
            width: '50px', height: '50px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            borderRadius: '10px', border: '2px solid #38bdf8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '0.8rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}>
            {mass}g
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>Khối lượng tạ:</span>
          {[50, 100, 150, 200].map(m => (
            <button 
              key={m} 
              onClick={() => setMass(m)}
              style={{ background: mass === m ? '#0d9488' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {m}g
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#fde047', fontWeight: 800 }}>
          Lực đàn hồi F = {force}N | Độ giãn Δl = {deltaL}cm
        </div>
      </div>
    </div>
  );
}

function BiologyMicroscopeSim({ onLog }) {
  const [zoom, setZoom] = useState(40);
  const [isFocused, setIsFocused] = useState(true);

  const handleZoomChange = (z) => {
    setZoom(z);
    onLog(`Chuyển độ phóng đại vật kính sang x${z}. Quan sát rõ chi tiết cấu trúc tế bào biểu bì hành.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          width: '280px', height: '280px',
          borderRadius: '50%', border: '6px solid #1e293b',
          boxShadow: '0 0 40px rgba(13, 148, 136, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.8)',
          position: 'relative', overflow: 'hidden',
          background: '#451a03',
          filter: isFocused ? 'none' : 'blur(4px)',
          transition: 'filter 0.3s ease'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: zoom === 10 ? 'repeat(6, 1fr)' : zoom === 40 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            gap: '3px', width: '100%', height: '100%', padding: '10px'
          }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{
                border: '2px solid #78350f', background: 'rgba(251, 191, 36, 0.15)',
                borderRadius: '4px', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{
                  width: zoom === 10 ? '8px' : zoom === 40 ? '16px' : '26px',
                  height: zoom === 10 ? '8px' : zoom === 40 ? '16px' : '26px',
                  borderRadius: '50%', background: '#78350f',
                  boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#2dd4bf', fontWeight: 800, fontSize: '0.8rem' }}>
          Vật kính: x{zoom} | Nhuộm Iốt (Lugol)
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>Độ phóng đại:</span>
          {[10, 40, 100].map(z => (
            <button 
              key={z} 
              onClick={() => handleZoomChange(z)}
              style={{ background: zoom === z ? '#0d9488' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              x{z}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setIsFocused(!isFocused)}
          style={{ background: isFocused ? '#334155' : '#eab308', color: isFocused ? '#cbd5e1' : '#000', border: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          {isFocused ? 'Xoay Núm Lệch Tiêu Cự' : 'Chỉnh Tiêu Cự Nét'}
        </button>
      </div>
    </div>
  );
}

function BiologyCellPlasmolysisSim({ onLog }) {
  const [state, setState] = useState('normal');

  const handlePlasmolyze = () => {
    setState('plasmolyzed');
    onLog("Nhỏ dung dịch NaCl 10% (môi trường ưu trương) -> Nước thẩm thấu từ tế bào ra ngoài, làm khối tế bào chất thu nhỏ và co rút khỏi vách tế bào (Co nguyên sinh)!");
  };

  const handleDeplasmolyze = () => {
    setState('deplasmolyzed');
    onLog("Nhỏ nước cất (môi trường nhược trương) -> Tế bào hút nước trương to trở lại trạng thái ban đầu (Dãn nguyên sinh)!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, background: '#060e17', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '200px', height: '160px',
          border: '4px solid #15803d', borderRadius: '12px',
          position: 'relative', background: 'rgba(34, 197, 94, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: state === 'plasmolyzed' ? '50%' : '90%',
            height: state === 'plasmolyzed' ? '50%' : '90%',
            background: 'rgba(147, 51, 234, 0.65)',
            border: '2px solid #a855f7', borderRadius: '8px',
            transition: 'all 0.8s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 800 }}>Tế bào chất</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePlasmolyze} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
            Nhỏ NaCl 10% (Co nguyên sinh)
          </button>
          <button onClick={handleDeplasmolyze} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
            Nhỏ Nước Cất (Dãn nguyên sinh)
          </button>
        </div>
      </div>
    </div>
  );
}

function BiologyDNAExtractionSim({ onLog }) {
  const [currentStep, setCurrentStep] = useState(1);

  const stepsInfo = [
    {
      step: 1,
      title: "1. Nghiền Cơ Học & Thêm NaCl",
      desc: "Nghiền nát 50g chuối với 50ml nước cất và 1 thìa muối NaCl. Muối giúp kết tụ ADN và bảo vệ ADN khỏi bị phân hủy bởi enzyme nội bào.",
      log: "Bước 1: Nghiền nát 50g chuối chín với nước cất & muối NaCl ➔ Phá vỡ cấu trúc mô thực vật."
    },
    {
      step: 2,
      title: "2. Thêm Nước Rửa Chén (Dung Môi Tẩy Rửa)",
      desc: "Nhỏ 5ml nước rửa chén khuấy nhẹ. Chất tẩy rửa hòa tan màng phospholipid của tế bào và màng nhân, giải phóng ADN ra dung dịch.",
      log: "Bước 2: Cho nước rửa chén khuấy nhẹ ➔ Phá vỡ màng sinh chất & màng nhân lipid giải phóng ADN."
    },
    {
      step: 3,
      title: "3. Lọc Thu Dịch Chiết ADN",
      desc: "Rót hỗn hợp qua vải lọc vào ống nghiệm sạch. Loại bỏ phần xơ chuối không tan, thu dịch chiết trong suốt chứa ADN.",
      log: "Bước 3: Lọc qua vải lọc ➔ Thu dịch chiết trong suốt chứa hỗn hợp ADN & protein."
    },
    {
      step: 4,
      title: "4. Kết Tủa ADN Bằng Cồn Lạnh 90°",
      desc: "Rót nhẹ cồn 90° ướp lạnh dọc theo thành ống nghiệm. ADN không tan trong cồn lạnh lập tức kết tủa thành các sợi màu trắng đục lơ lửng bám vào que thủy tinh!",
      log: "Bước 4: Rót Cồn 90° lạnh ➔ Xuất hiện các sợi ADN màu trắng đục kết tủa lơ lửng bám vào que thủy tinh!"
    }
  ];

  const handleSetStep = (s) => {
    setCurrentStep(s);
    onLog(stepsInfo[s - 1].log);
  };

  const handleReset = () => {
    setCurrentStep(1);
    onLog("Đã làm sạch dụng cụ. Sẵn sàng thực hành tách chiết ADN.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, background: '#09131d', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '90px', height: '160px',
              border: '4px solid rgba(255, 255, 255, 0.5)', borderTop: 'none',
              borderRadius: '0 0 24px 24px', position: 'relative',
              background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${currentStep * 20}%`,
                background: currentStep >= 4 ? 'rgba(224, 231, 255, 0.95)' : currentStep >= 2 ? 'rgba(254, 240, 138, 0.4)' : 'rgba(254, 243, 199, 0.6)',
                transition: 'all 0.6s ease', borderRadius: '0 0 20px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                {currentStep === 4 && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1e1b4b', background: '#ffffff', padding: '4px 8px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', animation: 'pulse 1s infinite alternate' }}>
                    🧬 Sợi ADN trắng đục kết tủa
                  </div>
                )}
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
              Ống Nghiệm Dịch Chiết ADN
            </span>
          </div>

          <div style={{ maxWidth: '360px', background: 'rgba(15, 23, 42, 0.9)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.4)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fde047', margin: '0 0 8px 0' }}>
              {stepsInfo[currentStep - 1].title}
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
              {stepsInfo[currentStep - 1].desc}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4].map(s => (
            <button
              key={s}
              onClick={() => handleSetStep(s)}
              style={{
                background: currentStep === s ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' : '#1e293b',
                color: currentStep === s ? '#ffffff' : '#94a3b8',
                border: currentStep === s ? '1px solid #2dd4bf' : '1px solid #334155',
                borderRadius: '10px', padding: '8px 16px',
                fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer'
              }}
            >
              Bước {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Quy trình: <b style={{ color: '#2dd4bf' }}>Phá tế bào ➔ Hòa tan màng lipid ➔ Lọc ➔ Kết tủa ADN trong Cồn 90° lạnh</b>
        </div>
        <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          Làm Mới
        </button>
      </div>
    </div>
  );
}

// ==========================================
// --- PROCEDURAL PLANET TEXTURE ENGINE (Aslan.io.vn NASA Shader Engine) ---
// ==========================================
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(x) { 
  if (typeof x !== 'number' || isNaN(x)) return 0;
  return x < 0 ? 0 : x > 1 ? 1 : x; 
}
function mix(a, b, t) {
  if (!Array.isArray(a) || !Array.isArray(b)) return [128, 128, 128];
  const factor = clamp01(t);
  return [
    (a[0] || 0) + ((b[0] || 0) - (a[0] || 0)) * factor,
    (a[1] || 0) + ((b[1] || 0) - (a[1] || 0)) * factor,
    (a[2] || 0) + ((b[2] || 0) - (a[2] || 0)) * factor,
  ];
}
function smoothstep(e0, e1, x) {
  if (e0 === e1) return 0;
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return [128, 128, 128];
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 0,
  ];
}
function makeCanvas(w, h) {
  try {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  } catch (e) {
    return null;
  }
}

function makePeriodicNoise(rand) {
  const perm = new Uint8Array(256);
  const p = [];
  for (let i = 0; i < 256; i++) p.push(i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = p[i]; p[i] = p[j]; p[j] = t;
  }
  for (let i = 0; i < 256; i++) perm[i] = p[i];
  const fade = (t) => t * t * (3 - 2 * t);

  function lat(wrapX, wrapY, ix, iy) {
    const x = ((ix % wrapX) + wrapX) % wrapX;
    const y = ((iy % wrapY) + wrapY) % wrapY;
    return perm[(perm[x & 255] + (y & 255)) & 255] / 255;
  }

  return function noise(x, y, perX, perY) {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const ux = fade(fx), uy = fade(fy);
    const v00 = lat(perX, perY, x0, y0);
    const v10 = lat(perX, perY, x0 + 1, y0);
    const v01 = lat(perX, perY, x0, y0 + 1);
    const v11 = lat(perX, perY, x0 + 1, y0 + 1);
    const a = v00 + (v10 - v00) * ux;
    const b = v01 + (v11 - v01) * ux;
    return a + (b - a) * uy;
  };
}

function fbmP(noise, u, v, scaleU, scaleV, octaves, gain = 0.5) {
  let sum = 0, amp = 1, norm = 0, f = 1;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(u * scaleU * f, v * scaleV * f, scaleU * f, scaleV * f);
    norm += amp;
    amp *= gain;
    f *= 2;
  }
  return sum / norm;
}

function paintPixels(ctx, W, H, fn) {
  const img = ctx.createImageData(W, H);
  const d = img.data;
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const c = fn(u, v);
      const i = (y * W + x) * 4;
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
      d[i + 3] = c[3] !== undefined ? c[3] : 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function drawCraters(ctx, W, H, rand, count, alphaMax = 0.3) {
  for (let i = 0; i < count; i++) {
    const cx = rand() * W;
    const cy = H * 0.08 + rand() * H * 0.84;
    const r = (0.004 + Math.pow(rand(), 2.4) * 0.028) * W;
    const alpha = 0.12 + rand() * alphaMax;
    for (const ox of [cx - W, cx, cx + W]) {
      const g = ctx.createRadialGradient(ox, cy, r * 0.1, ox, cy, r);
      g.addColorStop(0, `rgba(10,10,12,${alpha})`);
      g.addColorStop(0.75, `rgba(10,10,12,${alpha * 0.55})`);
      g.addColorStop(1, 'rgba(10,10,12,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ox, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSpot(ctx, W, H, cx, cy, rx, ry, rgb, alpha, angle = 0) {
  ctx.save();
  ctx.translate(cx * W, cy * H);
  ctx.rotate(angle);
  ctx.scale(rx * W, ry * H);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  const c = `${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0}`;
  g.addColorStop(0, `rgba(${c},${alpha})`);
  g.addColorStop(0.65, `rgba(${c},${alpha * 0.6})`);
  g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function makeBandFn(N, palette, opt) {
  const { bands = 9, warpAmp = 0.16, warpScale = 4, turb = 0.08, turbScale = 32 } = opt || {};
  const cols = palette.map(hexToRgb);
  return (u, v) => {
    const warp = (fbmP(N, u * warpScale, v * warpScale * 2, warpScale, warpScale * 2, 4) - 0.5) * warpAmp;
    const t = v * bands + warp;
    const iRaw = Math.floor(t);
    const f = t - iRaw;
    const iA = ((iRaw % cols.length) + cols.length) % cols.length;
    const iB = (iA + 1) % cols.length;
    let col = mix(cols[iA], cols[iB], smoothstep(0.18, 0.82, f));
    const g = 1 + (fbmP(N, u * turbScale + 5, v * turbScale * 2, turbScale, turbScale * 2, 3) - 0.5) * 2 * turb;
    return [col[0] * g, col[1] * g, col[2] * g];
  };
}

function makeRockyFn(N, baseHex, darkHex, contrast = 0.4, scale = 6) {
  const base = hexToRgb(baseHex);
  const dark = hexToRgb(darkHex);
  const s2 = Math.max(1, Math.round(scale / 3));
  return (u, v) => {
    const n = fbmP(N, u * scale, v * scale, scale, scale, 5) - 0.5;
    const m = fbmP(N, u * s2 + 9, v * s2 + 4, s2, s2, 3) - 0.5;
    const t = clamp01(0.52 + n * 2.1 * contrast + m * contrast);
    return mix(dark, base, t);
  };
}

function planetPixelFn(id, N) {
  switch (id) {
    case 'mercury':
      return makeRockyFn(N, '#8f8a83', '#57524b', 0.42, 7);
    case 'venus': {
      const cream = hexToRgb('#f0dcb0');
      const caramel = hexToRgb('#c49a5c');
      return (u, v) => {
        const swirlWarp = fbmP(N, u * 7, v * 14, 7, 14, 3);
        const swirl = fbmP(N, u * 4 + swirlWarp * 1.3, v * 8, 4, 8, 4);
        let col = mix(caramel, cream, smoothstep(0.22, 0.78, swirl));
        const bandK = 1 + 0.05 * Math.sin(v * Math.PI * 4 + swirl * 4);
        return [col[0] * bandK, col[1] * bandK, col[2] * bandK];
      };
    }
    case 'earth': {
      const shallow = hexToRgb('#1a6ec2');
      const abyss = hexToRgb('#071f4d');
      const jungle = hexToRgb('#2e6b34');
      const plain = hexToRgb('#7a8a46');
      const desert = hexToRgb('#b09256');
      const rock = hexToRgb('#6e6157');
      const ice = hexToRgb('#eef4fa');
      return (u, v) => {
        const cont = fbmP(N, u * 3, v * 3, 3, 3, 5);
        const det = fbmP(N, u * 12 + 31, v * 12 + 17, 12, 12, 4);
        const lat = Math.abs(v - 0.5) * 2;
        const landTh = 0.545;
        let col;
        if (cont > landTh) {
          const e = (cont - landTh) / (1 - landTh);
          const dryness = smoothstep(0.42, 0.62, det);
          col = mix(mix(jungle, plain, smoothstep(0.15, 0.55, det)), desert, dryness * 0.85);
          if (e > 0.55) col = mix(col, rock, clamp01((e - 0.55) * 2.4));
          if (e > 0.78 || lat > 0.86) col = mix(col, ice, clamp01(Math.max((e - 0.78) * 3.2, (lat - 0.86) * 9)));
        } else {
          const depth = clamp01((landTh - cont) / landTh);
          col = mix(shallow, abyss, Math.pow(depth, 0.65));
          col = [col[0] * (1 + (det - 0.5) * 0.1), col[1] * (1 + (det - 0.5) * 0.1), col[2] * (1 + (det - 0.5) * 0.1)];
          if (lat > 0.92) col = mix(col, ice, clamp01((lat - 0.92) * 14));
        }
        return col;
      };
    }
    case 'mars': {
      const darkRed = hexToRgb('#6e2a14');
      const orange = hexToRgb('#cf6b30');
      const bright = hexToRgb('#e08a4e');
      const cap = hexToRgb('#e9dfcc');
      return (u, v) => {
        const n = fbmP(N, u * 5, v * 5, 5, 5, 5);
        const m = fbmP(N, u * 16 + 50, v * 16 + 8, 16, 16, 3);
        let col = mix(darkRed, orange, clamp01(0.2 + n * 1.25));
        col = mix(col, bright, smoothstep(0.66, 0.85, m));
        const lat = Math.abs(v - 0.5) * 2;
        const polar = clamp01(Math.max((lat - 0.9) * 12, (lat - 0.84) * 6 * smoothstep(0.5, 0.8, m)));
        return mix(col, cap, polar);
      };
    }
    case 'jupiter':
      return makeBandFn(N, ['#c9a97a', '#a67c52', '#e3cdb0', '#8d6748', '#d9b891', '#b5875d', '#ead9bd', '#97744e'], { bands: 11, warpAmp: 0.22, warpScale: 4, turb: 0.09 });
    case 'saturn':
      return makeBandFn(N, ['#e8d9b0', '#d6bf94', '#efe3c0', '#cbb17e', '#e2cda2', '#d9c496'], { bands: 9, warpAmp: 0.1, warpScale: 3, turb: 0.05 });
    case 'uranus': {
      const base = hexToRgb('#a8dde0');
      const pole = hexToRgb('#c8eef0');
      return (u, v) => {
        const n = fbmP(N, u * 3, v * 6, 3, 6, 3) - 0.5;
        let col = [base[0] * (1 + n * 0.06 + 0.015 * Math.sin(v * Math.PI * 6)), base[1] * (1 + n * 0.06 + 0.015 * Math.sin(v * Math.PI * 6)), base[2] * (1 + n * 0.06)];
        const poleMix = smoothstep(0.72, 1, Math.abs(v - 0.5) * 2) * 0.5;
        return mix(col, pole, poleMix);
      };
    }
    case 'neptune': {
      const deepBlue = hexToRgb('#20376f');
      const azure = hexToRgb('#3f74e6');
      const wisp = hexToRgb('#cfe0ff');
      return (u, v) => {
        const n = fbmP(N, u * 4, v * 9, 4, 9, 4);
        let col = mix(deepBlue, azure, clamp01(0.25 + n * 1.1));
        const streak = fbmP(N, u * 10 + 7, v * 22, 10, 22, 3);
        col = mix(col, wisp, smoothstep(0.7, 0.9, streak) * 0.5);
        return col;
      };
    }
    default:
      return makeRockyFn(N, '#999999', '#555555', 0.4, 6);
  }
}

function generateProceduralPlanetTexture(id) {
  return null;
}

// ==========================================
// --- GEOGRAPHY GRADE 6 SIMULATOR COMPONENTS ---
// ==========================================

// Web Audio Sound Synthesizer for Space Flight & Core Scanners
function playSpaceSFX(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!window.__spaceAudioCtx) window.__spaceAudioCtx = new AudioCtx();
    const ctx = window.__spaceAudioCtx;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'thrust') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'xray') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.4);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'brake') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    }
  } catch (e) {
    // Audio context optional
  }
}

// 3D Multi-Planet Internal Core Cutaway Layer Engine
function createPlanetCoreCutawayMesh(key, radius) {
  const coreGroup = new THREE.Group();
  coreGroup.name = `${key}CoreGroup`;

  if (key === 'sun') {
    // Sun Nuclear Fusion Core (15,000,000°C)
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.28, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const c1Glow = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.33, 32, 32), new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.7 }));
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.62, 32, 32, 0, Math.PI * 1.5, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }));
    const c3 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.86, 32, 32, 0, Math.PI * 1.5, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xd97706, side: THREE.DoubleSide }));
    const c4 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.99, 32, 32, 0, Math.PI * 1.5, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xeab308, side: THREE.DoubleSide }));
    coreGroup.add(c1, c1Glow, c2, c3, c4);
  } else if (key === 'jupiter' || key === 'saturn') {
    // Gas Giants: Heavy Rock/Ice Core -> Liquid Metallic Hydrogen -> H/He Atmosphere
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.28, 32, 32), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    const c1Glow = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.33, 32, 32), new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.6 }));
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.72, 32, 32, 0, Math.PI * 1.5, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3, side: THREE.DoubleSide }));
    const c3 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.99, 32, 32, 0, Math.PI * 1.5, 0, Math.PI), new THREE.MeshStandardMaterial({ color: key === 'saturn' ? 0xeab308 : 0xc9a97a, roughness: 0.5, side: THREE.DoubleSide }));
    coreGroup.add(c1, c1Glow, c2, c3);
  } else if (key === 'uranus' || key === 'neptune') {
    // Ice Giants: Rocky Core -> Water/Ammonia/Methane Mantle -> Atmosphere
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.26, 32, 32), new THREE.MeshBasicMaterial({ color: 0xcbd5e1 }));
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.76, 32, 32, 0, Math.PI * 1.5, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3, side: THREE.DoubleSide }));
    const c3 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.99, 32, 32, 0, Math.PI * 1.5, 0, Math.PI), new THREE.MeshStandardMaterial({ color: key === 'uranus' ? 0xa8dde0 : 0x1d4ed8, roughness: 0.5, side: THREE.DoubleSide }));
    coreGroup.add(c1, c2, c3);
  } else {
    // Rocky Planets (Earth, Mars, Mercury, Venus)
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.24, 32, 32), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    const c1Glow = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.29, 32, 32), new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.55 }));
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.55, 32, 32, 0, Math.PI * 1.5, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.3, side: THREE.DoubleSide }));
    const c3 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.85, 32, 32, 0, Math.PI * 1.5, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.5, side: THREE.DoubleSide }));
    const c4 = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.99, 32, 32, 0, Math.PI * 1.5, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6, side: THREE.DoubleSide }));
    coreGroup.add(c1, c1Glow, c2, c3, c4);
  }

  coreGroup.visible = false;
  return coreGroup;
}

// Planetary Chemical Composition & Physical Data Dictionary for STEM Geography
const CELESTIAL_CHEMICAL_DATA = {
  sun: {
    name: 'MẶT TRỜI',
    color: '#f59e0b',
    layers: [
      { name: 'Vỏ Quang cầu (Photosphere)', chem: '73% H₂, 25% He', temp: '5.500°C', press: '0.86 atm' },
      { name: 'Vùng Đối lưu (Convective Zone)', chem: 'Hydro & Heli Ion hóa', temp: '2.000.000°C', press: '1.000.000 atm' },
      { name: 'Vùng Bức xạ (Radiative Zone)', chem: 'Plasma Photons Gamma', temp: '7.000.000°C', press: '100.000.000 atm' },
      { name: 'Lõi Nhiệt Hạch (Nuclear Core)', chem: 'Phản ứng 4H → He + Năng lượng', temp: '15.000.000°C', press: '250 Tỷ atm' }
    ]
  },
  earth: {
    name: 'TRÁI ĐẤT',
    color: '#0284c7',
    layers: [
      { name: 'Vỏ Trái Đất (Crust)', chem: 'SiO₂, Al₂O₃, Fe₂O₃', temp: '15 - 1.000°C', press: '1 - 10.000 atm' },
      { name: 'Lớp Manti (Mantle)', chem: 'Silicat Magie & Sắt (Mg,Fe)₂SiO₄', temp: '1.000 - 3.700°C', press: '140 GPa (1.4M atm)' },
      { name: 'Lõi Ngoài Lỏng (Outer Core)', chem: 'Sắt (Fe) & Niken (Ni) Lỏng', temp: '4.500°C', press: '330 GPa (3.3M atm)' },
      { name: 'Lõi Trong Rắn (Inner Core)', chem: 'Hợp kim Sắt - Niken Rắn', temp: '6.000°C', press: '3.6M atm (360 GPa)' }
    ]
  },
  mars: {
    name: 'SAO HỎA',
    color: '#ef4444',
    layers: [
      { name: 'Vỏ Oxit Sắt', chem: 'Fe₂O₃ (Oxit Sắt), Basalt', temp: '-60°C - 20°C', press: '0.006 atm' },
      { name: 'Manti Silicat', chem: 'Olivin, Pyroxen', temp: '1.500°C', press: '40 GPa' },
      { name: 'Lõi Kim loại', chem: 'Fe, Ni, FeS (Sắt Sulfua)', temp: '1.800°C', press: '50 GPa' }
    ]
  }
};

// 1. Solar System Orbits 3D Interactive Simulator (Three.js WebGL Engine matching Thinghiemdiali.mp4)
function GeoSolarSystemSim({ experiment, onLog, isFullscreen, toggleFullscreen }) {
  const mountRef = useRef(null);
  const videoRef = useRef(null);
  const webcamCanvasRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanetKey, setSelectedPlanetKey] = useState(null);
  const [badgePos, setBadgePos] = useState(null);
  const [showControlsGuide, setShowControlsGuide] = useState(false);

  // Gesture Pilot & X-Ray Core Exploration State
  const [isGesturePilot, setIsGesturePilot] = useState(() => {
    return !!(experiment?.startInCockpit || experiment?.isCockpit);
  });
  const [isAutopilot, setIsAutopilot] = useState(false);
  const [gestureStatus, setGestureStatus] = useState('🎮WASD/Mũi tên/Vô lăng ảo | 🖐️ Vẫy 2 tay trước Camera AI để bẻ lái');
  const [currentGesture, setCurrentGesture] = useState('NONE');
  const [isXRayMode, setIsXRayMode] = useState(false);
  const [pilotSpeed, setPilotSpeed] = useState(4.0);
  const [targetPlanetKey, setTargetPlanetKey] = useState('earth');
  const [targetPlanetName, setTargetPlanetName] = useState('TRÁI ĐẤT');
  const [steerPos, setSteerPos] = useState({ x: 0, y: 0 });
  const [planetWaypoints, setPlanetWaypoints] = useState([]);
  const [showDebugHud, setShowDebugHud] = useState(false);

  const [debugInfo, setDebugInfo] = useState({
    webcamStatus: 'ĐANG KHỞI TẠO...',
    handCount: 0,
    hand1Coords: 'Chưa phát hiện',
    hand2Coords: 'Chưa phát hiện',
    steerAngleDeg: '0.0',
    yaw: '0.00',
    pitch: '0.00',
    isMoving: true,
    speed: '4.0',
    currentCommand: '🚀 Đang bay du hành 3D'
  });

  const [isWebcamAiActive, setIsWebcamAiActive] = useState(false);
  const lastWaypointTimeRef = useRef(0);

  const speedRef = useRef(speed);
  const isPlayingRef = useRef(isPlaying);
  const selectedPlanetKeyRef = useRef(selectedPlanetKey);
  const isGesturePilotRef = useRef(isGesturePilot);
  const isAutopilotRef = useRef(isAutopilot);
  const isXRayModeRef = useRef(isXRayMode);

  const lastManualInputTimeRef = useRef(Date.now());
  const lastGestureTimeRef = useRef(0);

  const activeButtonSteerRef = useRef({ yawDir: 0, pitchDir: 0 });
  const activeWheelRef = useRef({ active: false, steerX: 0, steerY: 0 });
  const isScreenDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  const cameraRef = useRef(null);
  // Flight vectors - start centered facing Sun and revolving planets (posX: 0, posY: 35, posZ: 200)
  const flightVectorRef = useRef({ yaw: 0, pitch: -0.15, speed: 4.0, posX: 0, posY: 35, posZ: 200 });

  useEffect(() => {
    if (experiment?.startInCockpit || experiment?.isCockpit) {
      setIsGesturePilot(true);
    }
  }, [experiment?.startInCockpit, experiment?.isCockpit]);

  useEffect(() => {
    if (isGesturePilot) {
      flightVectorRef.current.posX = 0;
      flightVectorRef.current.posY = 35;
      flightVectorRef.current.posZ = 200;
      flightVectorRef.current.yaw = 0;
      flightVectorRef.current.pitch = -0.15;
      flightVectorRef.current.speed = 4.0;
      setPilotSpeed(4.0);
      lastManualInputTimeRef.current = Date.now();
    }
  }, [isGesturePilot]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    selectedPlanetKeyRef.current = selectedPlanetKey;
  }, [selectedPlanetKey]);

  useEffect(() => {
    isGesturePilotRef.current = isGesturePilot;
  }, [isGesturePilot]);

  useEffect(() => {
    isXRayModeRef.current = isXRayMode;
  }, [isXRayMode]);

  // Universal Piloting Control Engine (WASD, Arrow Keys, On-Screen D-Pad, Virtual Steering Wheel)
  useEffect(() => {
    if (!isGesturePilot) return;

    const pressedKeys = {};

    const handleKeyDown = (e) => {
      pressedKeys[e.code] = true;
      pressedKeys[e.key?.toLowerCase()] = true;

      if (e.key?.toLowerCase() === 'x') {
        setIsXRayMode(prev => !prev);
      }
    };

    const handleKeyUp = (e) => {
      pressedKeys[e.code] = false;
      pressedKeys[e.key?.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const keyLoop = setInterval(() => {
      if (!isGesturePilotRef.current) return;
      const fv = flightVectorRef.current;
      let moved = false;
      let steerX = 0;
      let steerY = 0;

      // 1. Keyboard Controls (WASD / Arrow Keys)
      if (pressedKeys['KeyW'] || pressedKeys['ArrowUp'] || pressedKeys['w']) {
        fv.pitch -= 0.035;
        steerY = -0.7;
        moved = true;
      }
      if (pressedKeys['KeyS'] || pressedKeys['ArrowDown'] || pressedKeys['s']) {
        fv.pitch += 0.035;
        steerY = 0.7;
        moved = true;
      }
      if (pressedKeys['KeyA'] || pressedKeys['ArrowLeft'] || pressedKeys['a']) {
        fv.yaw -= 0.04;
        steerX = -0.7;
        moved = true;
      }
      if (pressedKeys['KeyD'] || pressedKeys['ArrowRight'] || pressedKeys['d']) {
        fv.yaw += 0.04;
        steerX = 0.7;
        moved = true;
      }

      // 2. On-Screen D-Pad Button Steering
      const btnSteer = activeButtonSteerRef.current;
      if (btnSteer.yawDir !== 0 || btnSteer.pitchDir !== 0) {
        fv.yaw += btnSteer.yawDir * 0.04;
        fv.pitch += btnSteer.pitchDir * 0.035;
        steerX = btnSteer.yawDir * 0.7;
        steerY = btnSteer.pitchDir * 0.7;
        moved = true;
      }

      // 3. Virtual Steering Wheel Drag Steering
      const wheelSteer = activeWheelRef.current;
      if (wheelSteer.active) {
        fv.yaw += wheelSteer.steerX * 0.045;
        fv.pitch += -wheelSteer.steerY * 0.035;
        steerX = wheelSteer.steerX;
        steerY = wheelSteer.steerY;
        moved = true;
      }

      if (pressedKeys['Space'] || pressedKeys[' ']) {
        fv.speed = Math.min(fv.speed + 0.45, 9.0);
        moved = true;
      }
      if (pressedKeys['ShiftLeft'] || pressedKeys['ShiftRight'] || pressedKeys['shift']) {
        fv.speed = Math.max(fv.speed - 0.5, 0);
        moved = true;
      }

      if (moved) {
        lastManualInputTimeRef.current = Date.now();
        if (fv.speed === 0 && (steerX !== 0 || steerY !== 0)) {
          fv.speed = 4.0;
        }
        if (steerX !== 0 || steerY !== 0) {
          setSelectedPlanetKey(null);
        }

        setSteerPos({ x: steerX, y: steerY });
        setPilotSpeed(Number(fv.speed.toFixed(1)));
        const cmd = steerX < 0 ? '◄ Rẽ trái' : steerX > 0 ? '► Rẽ phải' : fv.speed > 0 ? '🚀 Tiến về phía trước' : '🛑 Dừng lại';
        setGestureStatus(`🎮 ĐANG LÁI PHI THUYỀN: ${cmd} | Tốc độ: ${fv.speed.toFixed(1)}`);
        setDebugInfo(prev => ({
          ...prev,
          steerAngleDeg: (steerX * 45).toFixed(1),
          yaw: fv.yaw.toFixed(2),
          pitch: fv.pitch.toFixed(2),
          isMoving: fv.speed !== 0,
          speed: fv.speed.toFixed(1),
          currentCommand: `🎮 Bàn phím / Vô lăng: ${cmd}`
        }));
      } else {
        setSteerPos(prev => {
          if (Math.abs(prev.x) < 0.01 && Math.abs(prev.y) < 0.01) return prev;
          return { x: prev.x * 0.7, y: prev.y * 0.7 };
        });
      }
    }, 30);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(keyLoop);
    };
  }, [isGesturePilot]);

  // Optional Webcam AI Dual-Hand Steering Wheel Engine (Opt-in only)
  useEffect(() => {
    if (!isGesturePilot || !isWebcamAiActive) return;

    let isCancelled = false;
    let cameraStream = null;

    // 1. Direct High-Speed Video Stream Activation
    const initWebcam = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' }
          });
          if (videoRef.current && !isCancelled) {
            videoRef.current.srcObject = cameraStream;
            videoRef.current.play().catch(() => {});
            setDebugInfo(prev => ({ ...prev, webcamStatus: 'HOẠT ĐỘNG (ACTIVE 320x240)' }));
          }
        }
      } catch (err) {
        console.warn('Webcam stream notice:', err);
        setGestureStatus('✋ Sẵn sàng lái bằng Phím W/A/S/D hoặc Rê chuột/Chạm Vô Lăng AI');
        setDebugInfo(prev => ({ ...prev, webcamStatus: 'KHÔNG CÓ WEBCAM / LỖI MỞ CAM' }));
      }
    };

    initWebcam();

    // 2. Render loop on canvas for webcam HUD box
    const renderWebcamCanvas = () => {
      if (isCancelled) return;
      const v = videoRef.current;
      const c = webcamCanvasRef.current;
      if (v && c && v.readyState >= 2) {
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(v, -c.width, 0, c.width, c.height);
          ctx.restore();

          // Draw AI tracking target grid overlay
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(10, 8, c.width - 20, c.height - 16);
          ctx.setLineDash([]);

          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('DUAL-HAND AI STEERING', 14, 20);
        }
      }
      if (!isCancelled && isGesturePilotRef.current) {
        requestAnimationFrame(renderWebcamCanvas);
      }
    };
    requestAnimationFrame(renderWebcamCanvas);

    // 3. MediaPipe Hands AI Dual-Hand Tracker Loading
    let cameraUtilsScript = document.querySelector('script[src*="camera_utils"]');
    let handsScript = document.querySelector('script[src*="hands.js"]');

    const loadScripts = async () => {
      try {
        if (!cameraUtilsScript) {
          cameraUtilsScript = document.createElement('script');
          cameraUtilsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
          cameraUtilsScript.crossOrigin = 'anonymous';
          document.head.appendChild(cameraUtilsScript);
          await new Promise(r => cameraUtilsScript.onload = r);
        }
        if (!handsScript) {
          handsScript = document.createElement('script');
          handsScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
          handsScript.crossOrigin = 'anonymous';
          document.head.appendChild(handsScript);
          await new Promise(r => handsScript.onload = r);
        }

        if (isCancelled) return;

        if (window.Hands && videoRef.current) {
          const hands = new window.Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });

          // Enable Dual-Hand Tracking for Steering Wheel Gesture
          hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          hands.onResults((results) => {
            if (isCancelled) return;
            const canvasCtx = webcamCanvasRef.current?.getContext('2d');
            const handCount = (results.multiHandLandmarks && Array.isArray(results.multiHandLandmarks)) ? results.multiHandLandmarks.length : 0;

            const fv = flightVectorRef.current;

            // RULE 1: Hand Removal or Release (< 2 Hands)
            if (handCount < 2) {
              const isManualActive = (Date.now() - lastManualInputTimeRef.current < 2500);
              const wasGesturing = (Date.now() - lastGestureTimeRef.current < 1200);

              // Only stop if user WAS using gesture steering and is NOT currently using manual controls
              if (wasGesturing && !isManualActive) {
                fv.speed = 0;
                setPilotSpeed(0);
                setSteerPos({ x: 0, y: 0 });
                setCurrentGesture('STOP_HOVER');
                const cmd = handCount === 0 ? '🛑 Dừng lại / Lơ lửng (Buông 2 tay)' : '🛑 Dừng lại / Lơ lửng (Bỏ 1 tay)';
                setGestureStatus(cmd);
              }
              return;
            }

            // RULE 2: Both Hands Holding Steering Wheel (>= 2 Hands) -> CONTINUOUS FORWARD & DYNAMIC STEERING
            if (handCount >= 2) {
              lastGestureTimeRef.current = Date.now();
              const hA = results.multiHandLandmarks[0];
              const hB = results.multiHandLandmarks[1];

              // Sort hands horizontally (Left Hand vs Right Hand)
              const leftHand = hA[0].x < hB[0].x ? hB : hA;
              const rightHand = hA[0].x < hB[0].x ? hA : hB;

              // Calculate Steering Wheel Line Angle (in degrees)
              const xLeft = (1 - leftHand[0].x) * (webcamCanvasRef.current?.width || 90);
              const yLeft = leftHand[0].y * (webcamCanvasRef.current?.height || 65);
              const xRight = (1 - rightHand[0].x) * (webcamCanvasRef.current?.width || 90);
              const yRight = rightHand[0].y * (webcamCanvasRef.current?.height || 65);

              const dx = xRight - xLeft;
              const dy = yRight - yLeft;
              const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

              // Draw Glowing Steering Wheel Line & Hand Skeleton Overlay
              if (canvasCtx && webcamCanvasRef.current) {
                results.multiHandLandmarks.forEach((landmarks, idx) => {
                  canvasCtx.fillStyle = idx === 0 ? '#00f2fe' : '#f59e0b';
                  canvasCtx.strokeStyle = '#ffffff';
                  canvasCtx.lineWidth = 1.5;
                  landmarks.forEach((pt) => {
                    const x = (1 - pt.x) * webcamCanvasRef.current.width;
                    const y = pt.y * webcamCanvasRef.current.height;
                    canvasCtx.beginPath();
                    canvasCtx.arc(x, y, 2.5, 0, Math.PI * 2);
                    canvasCtx.fill();
                  });
                });

                canvasCtx.strokeStyle = '#f59e0b';
                canvasCtx.lineWidth = 3.5;
                canvasCtx.beginPath();
                canvasCtx.moveTo(xLeft, yLeft);
                canvasCtx.lineTo(xRight, yRight);
                canvasCtx.stroke();
              }

              // Both Hands on Wheel -> Continuous Forward Movement Speed
              fv.speed = 5.0;

              if (angleDeg > 10) {
                const steerX = -Math.min(1.0, (angleDeg - 10) / 30);
                fv.yaw += steerX * 0.045;
                setSteerPos({ x: steerX, y: 0 });
              } else if (angleDeg < -10) {
                const steerX = Math.min(1.0, (-10 - angleDeg) / 30);
                fv.yaw += steerX * 0.045;
                setSteerPos({ x: steerX, y: 0 });
              } else {
                setSteerPos({ x: 0, y: 0 });
              }
            }
          });

          // Throttled 12fps AI frame processing loop
          let isProcessingFrame = false;
          let lastAiFrameTime = 0;
          const processFrame = async () => {
            const now = Date.now();
            if (!isCancelled && videoRef.current && videoRef.current.readyState >= 2 && !isProcessingFrame && (now - lastAiFrameTime > 80)) {
              lastAiFrameTime = now;
              isProcessingFrame = true;
              try {
                await hands.send({ image: videoRef.current });
              } catch (err) {
                // skip frame
              } finally {
                isProcessingFrame = false;
              }
            }
            if (!isCancelled && isGesturePilotRef.current) {
              requestAnimationFrame(processFrame);
            }
          };
          requestAnimationFrame(processFrame);
        }
      } catch (err) {
        console.warn('MediaPipe hands load warning:', err);
      }
    };

    loadScripts();

    return () => {
      isCancelled = true;
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isGesturePilot, isWebcamAiActive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    // 2. Camera setup (Sun on left, planets radiating to right matching reference image)
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 3000);
    camera.position.set(-25, 140, 245);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls (Full Mouse Drag Rotate, Scroll Zoom, Touch Pinch Zoom, Pan)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.2;
    controls.enablePan = true;
    controls.maxDistance = 1000;
    controls.minDistance = 3.0;
    controls.target.set(35, 0, 0);
    controls.update();

    // 5. Starfield background & Warp Particles
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1400;
      starPositions[i + 1] = (Math.random() - 0.5) * 1400;
      starPositions[i + 2] = (Math.random() - 0.5) * 1400;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, transparent: true, opacity: 0.85 });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0x555566, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 3.2, 1000);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 7. Celestial Mesh Creation
    const planetGroups = {};
    const planetMeshes = {};
    const planetCoreGroups = {};
    const orbitLines = {};
    const orbitAngles = {};

    // Sun
    const sunConfig = SOLAR_PLANETS_CONFIG.sun;
    const sunTexture = createPhotorealisticPlanetTexture('sun', sunConfig.color);
    const sunGeo = new THREE.SphereGeometry(sunConfig.radius, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = { key: 'sun' };

    // Sun Glow Corona Mesh
    const sunGlowGeo = new THREE.SphereGeometry(sunConfig.radius * 1.35, 24, 24);
    const sunGlowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.28, side: THREE.BackSide });
    const sunGlowMesh = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    sunMesh.add(sunGlowMesh);

    // Sun 3D Core Cutaway Group
    const sunCoreGroup = createPlanetCoreCutawayMesh('sun', sunConfig.radius);
    sunMesh.add(sunCoreGroup);
    planetCoreGroups['sun'] = sunCoreGroup;

    scene.add(sunMesh);
    planetMeshes['sun'] = sunMesh;

    // 8 Planets
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    planetKeys.forEach((key, idx) => {
      const cfg = SOLAR_PLANETS_CONFIG[key];
      orbitAngles[key] = idx * 0.8 + 0.3;

      // Group parent (positioned on orbit)
      const group = new THREE.Group();
      scene.add(group);
      planetGroups[key] = group;

      // Orbit Circle Line
      const orbitCurve = new THREE.EllipseCurve(0, 0, cfg.orbitRadius, cfg.orbitRadius, 0, 2 * Math.PI, false, 0);
      const points = orbitCurve.getPoints(96);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const orbitMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28 });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      scene.add(orbitLine);
      orbitLines[key] = orbitLine;

      // Planet Sphere Mesh
      const texture = createPhotorealisticPlanetTexture(key, cfg.color);
      const pGeo = new THREE.SphereGeometry(cfg.radius, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.65, metalness: 0.1 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.userData = { key };

      // Uranus Axial Tilt
      if (key === 'uranus') {
        pMesh.rotation.z = Math.PI * 0.54; // ~98 deg tilt
      }

      group.add(pMesh);
      planetMeshes[key] = pMesh;

      // 3D PLANETARY INTERNAL CORE EXPLORATION ENGINE (Cutaway models for ALL bodies)
      const pCoreGroup = createPlanetCoreCutawayMesh(key, cfg.radius);
      group.add(pCoreGroup);
      planetCoreGroups[key] = pCoreGroup;

      // Earth's Cloud Layer & Moon
      if (cfg.hasMoon) {
        const cloudsTexture = createPhotorealisticPlanetTexture('earthClouds', '#ffffff');
        const cloudsGeo = new THREE.SphereGeometry(cfg.radius * 1.025, 24, 24);
        const cloudsMat = new THREE.MeshStandardMaterial({ map: cloudsTexture, transparent: true, opacity: 0.7 });
        const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
        cloudsMesh.name = 'earthClouds';
        group.add(cloudsMesh);

        const moonTexture = createPhotorealisticPlanetTexture('mercury', '#cbd5e1');
        const moonGeo = new THREE.SphereGeometry(cfg.radius * 0.28, 16, 16);
        const moonMat = new THREE.MeshStandardMaterial({ map: moonTexture, roughness: 0.9 });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.name = 'earthMoon';
        moonMesh.position.set(cfg.radius * 2.4, 0, 0);
        group.add(moonMesh);
      }

      // Saturn & Uranus Rings
      if (cfg.hasRings) {
        if (key === 'saturn') {
          const ringTexture = createPhotorealisticSaturnRingsTexture();
          const innerR = cfg.radius * 1.25;
          const outerR = cfg.radius * 2.25;
          const ringGeo = new THREE.RingGeometry(innerR, outerR, 256, 16);
          applyRadialUVsToRingGeometry(ringGeo, innerR, outerR);
          ringGeo.rotateX(-Math.PI / 2);

          const ringMat = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95,
            depthWrite: false, // Prevents depth-buffer clipping of Saturn's body
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI * 0.16; // ~28.8 deg inclination matching reference photo
          ringMesh.rotation.y = -Math.PI * 0.04;
          ringMesh.renderOrder = 2;
          group.add(ringMesh);
        } else if (key === 'uranus') {
          const ringGeo = new THREE.RingGeometry(cfg.radius * 1.25, cfg.radius * 1.55, 128);
          ringGeo.rotateX(-Math.PI / 2);
          const ringMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65,
            roughness: 0.4
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.z = Math.PI * 0.54;
          group.add(ringMesh);
        }
      }
    });

    // 8. Raycasting for Mouse Clicks & Hover Pointer Feedback
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targets = [sunMesh, ...Object.values(planetMeshes)];
      const intersects = raycaster.intersectObjects(targets, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData?.key && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.key) {
          handleSelectCelestial(obj.userData.key);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);

    // 9. Animation & Space Travel Flight Physics Loop
    let animFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();

      // Rotate Sun
      sunMesh.rotation.y += delta * 0.15;

      // Update Planet Positions along Orbits
      planetKeys.forEach(key => {
        const cfg = SOLAR_PLANETS_CONFIG[key];
        if (isPlayingRef.current) {
          orbitAngles[key] += delta * cfg.speed * speedRef.current * 0.18;
        }
        const ang = orbitAngles[key];
        const px = Math.cos(ang) * cfg.orbitRadius;
        const pz = Math.sin(ang) * cfg.orbitRadius;

        const group = planetGroups[key];
        if (group) {
          group.position.set(px, 0, pz);
        }

        const pMesh = planetMeshes[key];
        if (pMesh) {
          pMesh.rotation.y += delta * 0.6;
        }

        // Rotate Earth's Clouds & Moon
        if (key === 'earth' && group) {
          const cloudsMesh = group.getObjectByName('earthClouds');
          if (cloudsMesh) cloudsMesh.rotation.y += delta * 0.85;

          const moonMesh = group.getObjectByName('earthMoon');
          if (moonMesh) {
            const moonAng = clock.getElapsedTime() * 1.8;
            moonMesh.position.set(Math.cos(moonAng) * cfg.radius * 2.4, 0, Math.sin(moonAng) * cfg.radius * 2.4);
            moonMesh.rotation.y += delta * 0.5;
          }
        }

        // Highlight Orbit Line if Selected
        const orbitLine = orbitLines[key];
        if (orbitLine) {
          const isSel = selectedPlanetKeyRef.current === key;
          orbitLine.material.opacity = isSel ? 0.85 : 0.25;
        }
      });

      // AI Hand Gesture Spaceship Flight & Dynamic Core Cutaway Visibility
      if (isGesturePilotRef.current) {
        controls.enabled = false;

        const fv = flightVectorRef.current;

        // Automatically orient ship heading towards selected target planet if set (and manual steering is idle)
        const selPKey = selectedPlanetKeyRef.current;
        const isManualSteering = (Date.now() - lastManualInputTimeRef.current < 1500);
        if (selPKey && !isManualSteering) {
          let targetWorldPos = new THREE.Vector3();
          if (selPKey === 'sun') {
            targetWorldPos.set(0, 0, 0);
          } else if (planetGroups[selPKey]) {
            planetGroups[selPKey].getWorldPosition(targetWorldPos);
          }

          const dx = targetWorldPos.x - fv.posX;
          const dy = targetWorldPos.y - fv.posY;
          const dz = targetWorldPos.z - fv.posZ;
          const distToTarget = Math.hypot(dx, dy, dz);
          const targetRadius = SOLAR_PLANETS_CONFIG[selPKey]?.radius || 12;

          if (distToTarget > targetRadius * 3.2) {
            const targetYaw = Math.atan2(dx, -dz);
            const targetPitch = Math.atan2(dy, Math.hypot(dx, dz));

            let yawDiff = targetYaw - fv.yaw;
            yawDiff = Math.atan2(Math.sin(yawDiff), Math.cos(yawDiff));
            fv.yaw += yawDiff * 0.08;
            fv.pitch += (targetPitch - fv.pitch) * 0.08;
          }
        }

        const forwardX = Math.sin(fv.yaw) * Math.cos(fv.pitch);
        const forwardY = Math.sin(fv.pitch);
        const forwardZ = -Math.cos(fv.yaw) * Math.cos(fv.pitch);

        fv.posX += forwardX * fv.speed;
        fv.posY += forwardY * fv.speed;
        fv.posZ += forwardZ * fv.speed;

        camera.position.set(fv.posX, fv.posY, fv.posZ);
        const lookAtTarget = new THREE.Vector3(
          fv.posX + forwardX * 10,
          fv.posY + forwardY * 10,
          fv.posZ + forwardZ * 10
        );
        camera.lookAt(lookAtTarget);

        // Compute Sci-Fi 3D Projected Waypoints & Off-Screen Compass Arrows
        const containerW = container?.clientWidth || width;
        const containerH = container?.clientHeight || height;
        const margin = 50;
        const wpts = [];

        planetKeys.concat(['sun']).forEach(pKey => {
          const pMesh = planetMeshes[pKey];
          const cGroup = planetCoreGroups[pKey];
          if (!pMesh || !cGroup) return;

          let worldPos = new THREE.Vector3();
          if (pKey === 'sun') {
            worldPos.set(0, 0, 0);
          } else if (planetGroups[pKey]) {
            planetGroups[pKey].getWorldPosition(worldPos);
          }

          const distToPlanet = camera.position.distanceTo(worldPos);
          const planetRadius = SOLAR_PLANETS_CONFIG[pKey]?.radius || 12;

          if (isXRayModeRef.current || distToPlanet < planetRadius * 3.5) {
            cGroup.visible = true;
            pMesh.visible = false;
            if (distToPlanet < planetRadius * 3.5) {
              setTargetPlanetName(SOLAR_PLANETS_CONFIG[pKey]?.name || pKey.toUpperCase());
            }
          } else {
            cGroup.visible = false;
            pMesh.visible = true;
          }

          // Project 3D position to 2D screen pixels
          const proj = worldPos.clone().project(camera);
          const isBehind = proj.z > 1;
          const sx = (proj.x * 0.5 + 0.5) * containerW;
          const sy = (-proj.y * 0.5 + 0.5) * containerH;

          const isOnScreen = !isBehind && sx >= margin && sx <= containerW - margin && sy >= margin && sy <= containerH - margin;

          let clampedX = Math.max(margin, Math.min(containerW - margin, sx));
          let clampedY = Math.max(margin, Math.min(containerH - margin, sy));

          if (isBehind) {
            clampedX = sx > containerW / 2 ? margin : containerW - margin;
            clampedY = sy > containerH / 2 ? margin : containerH - margin;
          }

          wpts.push({
            key: pKey,
            name: SOLAR_PLANETS_CONFIG[pKey]?.name || pKey.toUpperCase(),
            color: SOLAR_PLANETS_CONFIG[pKey]?.color || '#38bdf8',
            isOnScreen,
            dist: Math.round(distToPlanet),
            x: isOnScreen ? sx : clampedX,
            y: isOnScreen ? sy : clampedY
          });
        });

        const nowWp = Date.now();
        if (nowWp - lastWaypointTimeRef.current > 150) {
          lastWaypointTimeRef.current = nowWp;
          setPlanetWaypoints(wpts);
        }
      } else {
        controls.enabled = true;

        // Camera Lerp Space Travel Physics ONLY when Orbit Controls active
        const selKey = selectedPlanetKeyRef.current;
        if (selKey) {
          let targetWorldPos = new THREE.Vector3();
          let radius = 10;

          if (selKey === 'sun') {
            targetWorldPos.set(0, 0, 0);
            radius = SOLAR_PLANETS_CONFIG.sun.radius;
          } else if (planetMeshesRef.current[selKey]) {
            planetMeshesRef.current[selKey].getWorldPosition(targetWorldPos);
            radius = SOLAR_PLANETS_CONFIG[selKey]?.radius || 10;
          }

          const targetCamPos = targetWorldPos.clone().add(new THREE.Vector3(0, radius * 0.8, radius * 3.5));
          camera.position.lerp(targetCamPos, 0.05);
          controls.target.lerp(targetWorldPos, 0.05);
        }
      }

      controls.update();
      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isGesturePilot]);

  const activePlanet = selectedPlanetKey ? SOLAR_PLANETS_CONFIG[selectedPlanetKey] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', userSelect: 'none', position: 'relative' }}>
      
      {/* 3D WebGL Scene Canvas Container */}
      <div 
        ref={mountRef} 
        onPointerDown={(e) => {
          if (!isGesturePilotRef.current) return;
          isScreenDraggingRef.current = true;
          dragStartPosRef.current = { x: e.clientX, y: e.clientY };
          lastManualInputTimeRef.current = Date.now();
          setSelectedPlanetKey(null);
        }}
        onPointerMove={(e) => {
          if (!isGesturePilotRef.current || !isScreenDraggingRef.current) return;
          lastManualInputTimeRef.current = Date.now();
          const dx = e.clientX - dragStartPosRef.current.x;
          const dy = e.clientY - dragStartPosRef.current.y;
          dragStartPosRef.current = { x: e.clientX, y: e.clientY };

          const fv = flightVectorRef.current;
          fv.yaw += dx * 0.005;
          fv.pitch += -dy * 0.005;

          const steerX = Math.max(-1, Math.min(1, dx * 0.08));
          const steerY = Math.max(-1, Math.min(1, dy * 0.08));
          setSteerPos({ x: steerX, y: steerY });
        }}
        onPointerUp={() => {
          isScreenDraggingRef.current = false;
        }}
        onPointerCancel={() => {
          isScreenDraggingRef.current = false;
        }}
        style={{
          flex: 1, minHeight: '520px', background: '#020617',
          borderRadius: '16px', border: '1.5px solid rgba(56, 189, 248, 0.35)',
          position: 'relative', overflow: 'hidden',
          touchAction: isGesturePilot ? 'none' : 'auto',
          cursor: isGesturePilot ? 'crosshair' : 'grab'
        }}
      >
        {/* Standard Mode Top Header (only when NOT in cockpit mode) */}
        {!isGesturePilot && (
          <div style={{ position: 'absolute', top: '20px', left: '24px', zIndex: 30, display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                THREE.JS · INTERACTIVE EXPERIENCE
              </div>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#38bdf8', margin: '2px 0 0 0', textShadow: '0 0 16px rgba(56, 189, 248, 0.6)' }}>
                HỆ MẶT TRỜI
              </h2>
            </div>

            <button
              onClick={() => {
                flightVectorRef.current.posX = 0;
                flightVectorRef.current.posY = 35;
                flightVectorRef.current.posZ = 200;
                flightVectorRef.current.yaw = 0;
                flightVectorRef.current.pitch = -0.15;
                flightVectorRef.current.speed = 4.0;
                setSelectedPlanetKey(null);
                setIsGesturePilot(true);
                if (onLog) onLog('Bật Chế độ Lái Phi thuyền Vũ trụ 3D (Bàn phím WASD & Cử chỉ tay AI).');
              }}
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                color: '#ffffff', border: '2px solid #fde047',
                borderRadius: '14px', padding: '10px 18px',
                fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.6)',
                display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto'
              }}
            >
              🛸 BẬT PHI THUYỀN LÁI VŨ TRỤ 3D
            </button>
          </div>
        )}

        {/* Floating Planet Screen Badge (Standard Orbit Mode) */}
        {!isGesturePilot && activePlanet && badgePos && (
          <div style={{
            position: 'absolute', left: `${badgePos.x}px`, top: `${badgePos.y - 45}px`,
            transform: 'translate(-50%, -100%)', zIndex: 15, pointerEvents: 'none',
            background: 'rgba(15, 23, 42, 0.85)', border: `1.5px solid ${activePlanet.color}`,
            borderRadius: '20px', padding: '4px 12px', color: '#fff',
            fontSize: '0.75rem', fontWeight: 900, boxShadow: `0 0 16px ${activePlanet.color}`,
            whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activePlanet.color }} />
            {activePlanet.name.toUpperCase()} ({activePlanet.enName})
          </div>
        )}

        {/* Docked Right-Side Celestial Detail Card (Standard Orbit Mode) */}
        {!isGesturePilot && activePlanet && (
          <div style={{
            position: 'absolute', top: '60px', right: '24px', maxWidth: '330px', width: 'calc(100% - 48px)',
            background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(16px)',
            border: `2px solid ${activePlanet.color}`, borderRadius: '18px',
            padding: '18px', color: '#f8fafc', boxShadow: '0 12px 48px rgba(0, 0, 0, 0.7)',
            zIndex: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: activePlanet.color, boxShadow: `0 0 10px ${activePlanet.color}` }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  {activePlanet.name}
                </h3>
              </div>
              <button onClick={() => setSelectedPlanetKey(null)} style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#cbd5e1', borderRadius: '8px', width: '26px', height: '26px', cursor: 'pointer', fontWeight: 800 }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Khoảng cách:</span>
                <strong style={{ color: '#fff' }}>{activePlanet.dist}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Chu kỳ:</span>
                <strong style={{ color: '#fff' }}>{activePlanet.period}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Đường kính:</span>
                <strong style={{ color: '#fff' }}>{activePlanet.size}</strong>
              </div>
              <div style={{ marginTop: '6px', background: 'rgba(56, 189, 248, 0.1)', borderLeft: `4px solid ${activePlanet.color}`, padding: '8px 10px', borderRadius: '0 8px 8px 0', fontSize: '0.75rem', color: '#e2e8f0' }}>
                <b>📌 Đặc điểm:</b> {activePlanet.feature}
              </div>
            </div>
          </div>
        )}

        {/* --- IMMERSIVE SPACESHIP COCKPIT OVERLAY --- */}
        {isGesturePilot && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 25,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            overflow: 'hidden'
          }}>
            {/* Subtle Sci-Fi Glass Vignette Border */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, transparent 65%, rgba(2, 6, 23, 0.4) 85%, rgba(2, 6, 23, 0.95) 100%)',
              border: '2px solid rgba(56, 189, 248, 0.3)', pointerEvents: 'none'
            }} />

            {/* 1. Sleek Translucent Top HUD Header Bar */}
            <div style={{
              position: 'absolute', top: '12px', left: '16px', right: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px',
              padding: '8px 16px', pointerEvents: 'auto', zIndex: 35
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🛸 BUỒNG LÁI 3D
                </div>
                {targetPlanetName && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fde047', background: 'rgba(253, 224, 71, 0.15)', padding: '3px 10px', borderRadius: '10px', border: '1px solid rgba(253, 224, 71, 0.3)' }}>
                    🎯 HƯỚNG VỀ: {targetPlanetName}
                  </span>
                )}
              </div>

              {/* Quick Target Selector Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', maxWidth: '50%' }}>
                {[
                  { key: 'sun', label: '☀️ MẶT TRỜI' },
                  { key: 'earth', label: '🌍 TRÁI ĐẤT' },
                  { key: 'mars', label: '🔴 SAO HỎA' },
                  { key: 'jupiter', label: '🪐 SAO MỘC' },
                  { key: 'saturn', label: '🪐 SAO THỔ' },
                  { key: 'uranus', label: '💎 SAO THIÊN VƯƠNG' },
                  { key: 'neptune', label: '🔵 SAO HẢI VƯƠNG' }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => handleSelectCelestial(item.key)}
                    style={{
                      background: selectedPlanetKey === item.key ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.06)',
                      color: selectedPlanetKey === item.key ? '#38bdf8' : '#cbd5e1',
                      border: selectedPlanetKey === item.key ? '1px solid #38bdf8' : '1px solid transparent',
                      borderRadius: '12px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setIsWebcamAiActive(prev => !prev)}
                  style={{
                    background: isWebcamAiActive ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(56, 189, 248, 0.15)',
                    color: isWebcamAiActive ? '#ffffff' : '#38bdf8', border: '1px solid #38bdf8',
                    borderRadius: '8px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  {isWebcamAiActive ? '📷 TẮT CAMERA AI' : '📷 BẬT CAMERA AI'}
                </button>

                <button
                  onClick={() => setIsXRayMode(!isXRayMode)}
                  style={{
                    background: isXRayMode ? '#f59e0b' : 'rgba(56, 189, 248, 0.2)',
                    color: isXRayMode ? '#000' : '#38bdf8', border: '1px solid #38bdf8',
                    borderRadius: '8px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  {isXRayMode ? '✌️ TẮT LÕI X-RAY' : '✌️ XEM LÕI X-RAY'}
                </button>

                <button
                  onClick={() => setShowDebugHud(!showDebugHud)}
                  style={{
                    background: showDebugHud ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                    color: showDebugHud ? '#fde047' : '#94a3b8', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer'
                  }}
                  title="Bật/Tắt thông tin gỡ lỗi telemetry"
                >
                  🐞 Debug
                </button>

                {toggleFullscreen && (
                  <button
                    onClick={toggleFullscreen}
                    style={{
                      background: 'rgba(2, 132, 199, 0.3)', color: '#ffffff',
                      border: '1px solid #38bdf8', borderRadius: '8px', padding: '4px 10px',
                      fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer'
                    }}
                  >
                    🖥️ TOÀN MÀN HÌNH
                  </button>
                )}

                <button
                  onClick={() => setIsGesturePilot(false)}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff', border: 'none', borderRadius: '8px', padding: '4px 12px',
                    fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                  }}
                >
                  ✕ THOÁT LÁI
                </button>
              </div>
            </div>

            {/* Optional Telemetry Debug Box (Collapsible) */}
            {showDebugHud && (
              <div style={{
                position: 'absolute', top: '60px', left: '20px', zIndex: 35, pointerEvents: 'auto',
                background: 'rgba(2, 6, 23, 0.92)', backdropFilter: 'blur(14px)',
                border: '1.5px solid #38bdf8', borderRadius: '12px',
                padding: '8px 12px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.65rem',
                maxWidth: '240px', display: 'flex', flexDirection: 'column', gap: '3px'
              }}>
                <div><b>📷 WEBCAM:</b> {debugInfo.webcamStatus}</div>
                <div><b>🛞 GÓC VÔ LĂNG:</b> {debugInfo.steerAngleDeg}°</div>
                <div><b>🚀 VELOCITY:</b> Speed: {debugInfo.speed}</div>
              </div>
            )}

            {/* 3D SCI-FI PLANET WAYPOINT MARKERS & OFF-SCREEN DIRECTION INDICATORS */}
            {planetWaypoints.map(wp => (
              <div
                key={wp.key}
                onClick={() => handleSelectCelestial(wp.key)}
                title={`Bay tới ${wp.name}`}
                style={{
                  position: 'absolute',
                  left: `${wp.x}px`,
                  top: `${wp.y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 28,
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: wp.isOnScreen ? 'rgba(15, 23, 42, 0.88)' : 'rgba(217, 119, 6, 0.92)',
                  border: `1.5px solid ${wp.color}`,
                  borderRadius: '16px',
                  padding: wp.isOnScreen ? '4px 10px' : '3px 8px',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  boxShadow: `0 0 14px ${wp.color}`,
                  whiteSpace: 'nowrap',
                  opacity: wp.isOnScreen ? 0.95 : 0.85,
                  transition: 'transform 0.08s ease-out'
                }}
              >
                {!wp.isOnScreen && <span>🎯</span>}
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: wp.color, boxShadow: `0 0 8px ${wp.color}` }} />
                <span>{wp.name}</span>
                {wp.isOnScreen && <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>({wp.dist}m)</span>}
              </div>
            ))}

            {/* Cockpit Targeting Crosshair / Flight Reticle */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: `translate(-50%, -50%) translate(${steerPos.x * 50}px, ${steerPos.y * 35}px)`,
              transition: 'transform 0.08s ease-out', pointerEvents: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                border: '1.5px dashed rgba(56, 189, 248, 0.8)', boxShadow: '0 0 15px rgba(56, 189, 248, 0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
              </div>
            </div>

            {/* Bottom Dashboard Controls */}
            <div style={{
              position: 'absolute', bottom: '12px', left: 0, right: 0,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              padding: '0 20px', pointerEvents: 'auto', zIndex: 30
            }}>
              {/* Left Dashboard Panel: Astronaut Pilot Helmet */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  transform: `rotate(${steerPos.x * 8}deg)`, transition: 'transform 0.1s ease-out'
                }}>
                  <div style={{
                    width: '38px', height: '30px', borderRadius: '16px 16px 8px 8px',
                    background: 'linear-gradient(135deg, #09131d 0%, #1e293b 100%)',
                    border: '1.5px solid #38bdf8', boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '26px', height: '12px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(253, 224, 71, 0.9) 0%, rgba(56, 189, 248, 0.9) 100%)'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.55rem', color: '#2dd4bf', fontWeight: 900, marginTop: '2px' }}>O2: 100%</span>
                </div>
              </div>

              {/* Center: Sleek Virtual Steering Wheel, 4-Directional D-Pad & Flight Speed Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  
                  {/* Virtual Steering Wheel SVG */}
                  <div 
                    onPointerDown={(e) => {
                      if (e.currentTarget.setPointerCapture) {
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch(err) {}
                      }
                      lastManualInputTimeRef.current = Date.now();
                      setSelectedPlanetKey(null);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const centerX = rect.left + rect.width / 2;
                      const centerY = rect.top + rect.height / 2;
                      const dx = e.clientX - centerX;
                      const dy = e.clientY - centerY;
                      const sx = Math.max(-1.0, Math.min(1.0, dx / (rect.width / 2)));
                      const sy = Math.max(-1.0, Math.min(1.0, dy / (rect.height / 2)));
                      activeWheelRef.current = { active: true, steerX: sx, steerY: sy, centerX, centerY, rectWidth: rect.width / 2, rectHeight: rect.height / 2 };
                    }}
                    onPointerMove={(e) => {
                      if (!activeWheelRef.current.active) return;
                      lastManualInputTimeRef.current = Date.now();
                      const dx = e.clientX - activeWheelRef.current.centerX;
                      const dy = e.clientY - activeWheelRef.current.centerY;
                      const sx = Math.max(-1.0, Math.min(1.0, dx / activeWheelRef.current.rectWidth));
                      const sy = Math.max(-1.0, Math.min(1.0, dy / activeWheelRef.current.rectHeight));
                      activeWheelRef.current.steerX = sx;
                      activeWheelRef.current.steerY = sy;
                    }}
                    onPointerUp={(e) => {
                      if (e.target?.releasePointerCapture) {
                        try { e.target.releasePointerCapture(e.pointerId); } catch(err) {}
                      }
                      activeWheelRef.current.active = false;
                      setSteerPos({ x: 0, y: 0 });
                    }}
                    onPointerCancel={() => {
                      activeWheelRef.current.active = false;
                      setSteerPos({ x: 0, y: 0 });
                    }}
                    title="🛞 Giữ và xoay Vô Lăng Ảo để bẻ lái phi thuyền 360°"
                    style={{
                      width: '110px', height: '75px', position: 'relative', cursor: 'grab',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      touchAction: 'none'
                    }}
                  >
                    <svg 
                      width="105" height="70" viewBox="0 0 200 130"
                      style={{
                        transform: `rotate(${steerPos.x * 45}deg) translateY(${steerPos.y * 6}px)`,
                        transition: 'transform 0.08s ease-out',
                        filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.7))'
                      }}
                    >
                      <path d="M 20 65 A 80 80 0 0 1 180 65 A 80 80 0 0 1 20 65 Z" fill="none" stroke="#38bdf8" strokeWidth="9" strokeDasharray="140 18 140 18" />
                      <rect x="12" y="45" width="16" height="40" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <rect x="172" y="45" width="16" height="40" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <line x1="28" y1="65" x2="70" y2="65" stroke="#38bdf8" strokeWidth="6" />
                      <line x1="172" y1="65" x2="130" y2="65" stroke="#38bdf8" strokeWidth="6" />
                      <circle cx="100" cy="65" r="24" fill="#09131d" stroke="#f59e0b" strokeWidth="3" />
                      <text x="100" y="69" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">
                        {(steerPos.x * 45).toFixed(0)}°
                      </text>
                    </svg>
                  </div>

                  {/* Touch/Click 4-Directional D-Pad Cross */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 34px)', gridTemplateRows: 'repeat(2, 30px)', gap: '4px', alignItems: 'center' }}>
                    <div />
                    <button
                      onPointerDown={() => { activeButtonSteerRef.current.pitchDir = -1; lastManualInputTimeRef.current = Date.now(); setSelectedPlanetKey(null); }}
                      onPointerUp={() => { activeButtonSteerRef.current.pitchDir = 0; }}
                      onPointerLeave={() => { activeButtonSteerRef.current.pitchDir = 0; }}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff',
                        border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 900, fontSize: '0.75rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'
                      }}
                      title="Bay lên trên (Phím W / Mũi tên lên)"
                    >
                      ▲
                    </button>
                    <div />
                    <button
                      onPointerDown={() => { activeButtonSteerRef.current.yawDir = -1; lastManualInputTimeRef.current = Date.now(); setSelectedPlanetKey(null); }}
                      onPointerUp={() => { activeButtonSteerRef.current.yawDir = 0; }}
                      onPointerLeave={() => { activeButtonSteerRef.current.yawDir = 0; }}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff',
                        border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 900, fontSize: '0.75rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'
                      }}
                      title="Rẽ trái (Phím A / Mũi tên trái)"
                    >
                      ◄
                    </button>
                    <button
                      onPointerDown={() => { activeButtonSteerRef.current.pitchDir = 1; lastManualInputTimeRef.current = Date.now(); setSelectedPlanetKey(null); }}
                      onPointerUp={() => { activeButtonSteerRef.current.pitchDir = 0; }}
                      onPointerLeave={() => { activeButtonSteerRef.current.pitchDir = 0; }}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff',
                        border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 900, fontSize: '0.75rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'
                      }}
                      title="Bay xuống dưới (Phím S / Mũi tên xuống)"
                    >
                      ▼
                    </button>
                    <button
                      onPointerDown={() => { activeButtonSteerRef.current.yawDir = 1; lastManualInputTimeRef.current = Date.now(); setSelectedPlanetKey(null); }}
                      onPointerUp={() => { activeButtonSteerRef.current.yawDir = 0; }}
                      onPointerLeave={() => { activeButtonSteerRef.current.yawDir = 0; }}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff',
                        border: '1px solid #38bdf8', borderRadius: '8px', fontWeight: 900, fontSize: '0.75rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'
                      }}
                      title="Rẽ phải (Phím D / Mũi tên phải)"
                    >
                      ►
                    </button>
                  </div>
                </div>

                {/* Speed Controls (Tiến, Dừng, Lùi) */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      lastManualInputTimeRef.current = Date.now();
                      flightVectorRef.current.speed = 5.0;
                      setPilotSpeed(5.0);
                    }}
                    style={{
                      background: pilotSpeed > 0 ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff', border: '1px solid #38bdf8', borderRadius: '8px',
                      padding: '4px 12px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer'
                    }}
                  >
                    🚀 TIẾN (5.0)
                  </button>

                  <button
                    onClick={() => {
                      lastManualInputTimeRef.current = Date.now();
                      flightVectorRef.current.speed = 0;
                      setPilotSpeed(0);
                    }}
                    style={{
                      background: pilotSpeed === 0 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff', border: '1px solid #ef4444', borderRadius: '8px',
                      padding: '4px 12px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer'
                    }}
                  >
                    🛑 DỪNG
                  </button>

                  <button
                    onClick={() => {
                      lastManualInputTimeRef.current = Date.now();
                      flightVectorRef.current.speed = -2.5;
                      setPilotSpeed(-2.5);
                    }}
                    style={{
                      background: pilotSpeed < 0 ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff', border: '1px solid #f59e0b', borderRadius: '8px',
                      padding: '4px 12px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer'
                    }}
                  >
                    ◀️ BAY LÙI
                  </button>
                </div>
              </div>

              {/* Right: Embedded Interactive Webcam Feed (ONLY when Webcam AI is Active) */}
              {isWebcamAiActive && (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <div 
                    style={{
                      background: 'rgba(9, 19, 29, 0.95)', border: '1px solid #f59e0b',
                      borderRadius: '8px', padding: '3px', boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#f59e0b', marginBottom: '1px', textAlign: 'center' }}>
                      📷 WEBCAM AI
                    </div>
                    <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
                    <canvas ref={webcamCanvasRef} width={90} height={65} style={{ borderRadius: '4px', background: '#020617', display: 'block' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Pill Navigation Toolbar (ONLY in Orbit Mode) */}
        {!isGesturePilot && (
          <div style={{
            position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10,
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '30px',
            padding: '6px 14px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            maxWidth: '92%', overflowX: 'auto'
          }}>
            {[
              { key: 'sun', label: 'MẶT TRỜI' },
              { key: 'mercury', label: 'SAO THỦY' },
              { key: 'venus', label: 'SAO KIM' },
              { key: 'earth', label: 'TRÁI ĐẤT' },
              { key: 'mars', label: 'SAO HỎA' },
              { key: 'jupiter', label: 'SAO MỘC' },
              { key: 'saturn', label: 'SAO THỔ' },
              { key: 'uranus', label: 'SAO THIÊN VƯƠNG' },
              { key: 'neptune', label: 'SAO HẢI VƯƠNG' }
            ].map(item => {
              const isSel = selectedPlanetKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelectCelestial(item.key)}
                  style={{
                    background: isSel ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                    color: isSel ? '#38bdf8' : '#94a3b8',
                    border: isSel ? '1.5px solid #38bdf8' : '1px solid transparent',
                    borderRadius: '20px', padding: '6px 14px',
                    fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                    whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                    boxShadow: isSel ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            {selectedPlanetKey && (
              <button
                onClick={() => setSelectedPlanetKey(null)}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '20px',
                  padding: '6px 14px', fontWeight: 800, fontSize: '0.75rem',
                  cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '6px'
                }}
              >
                ← QUAY VỀ TỔNG QUAN
              </button>
            )}
          </div>
        )}
      </div>

      {/* Control Bar (Speed, Play/Pause) - ONLY in Orbit Mode */}
      {!isGesturePilot && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'rgba(15, 23, 42, 0.6)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚀 DU HÀNH HỆ MẶT TRỜI 3D · THREE.JS WEBGL REALTIME</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Tốc độ quỹ đạo: <b style={{ color: '#38bdf8' }}>{speed}x</b></span>
            <input type="range" min="0.2" max="5.0" step="0.2" value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ width: '100px', accentColor: '#38bdf8', cursor: 'pointer' }} />
            <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: isPlaying ? '#eab308' : '#0d9488', color: isPlaying ? '#000' : '#fff', border: 'none', borderRadius: '10px', padding: '7px 14px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
              {isPlaying ? '⏸️ Dừng' : '▶️ Chạy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 2. Real Astronomical Sun-Earth-Moon Orbit Simulator
function GeoEarthSunMoonSim({ onLog }) {
  const [mode, setMode] = useState('free'); // 'free', 'day_night', 'solar_eclipse', 'lunar_eclipse'
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [timeStep, setTimeStep] = useState(0);

  const animRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setTimeStep(prev => prev + dt * speed);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, speed]);

  // Orbital Mechanics Math
  // Earth revolves around Sun: 1 cycle = ~20 seconds
  const earthOrbitAngle = mode === 'solar_eclipse' ? Math.PI : mode === 'lunar_eclipse' ? Math.PI : (timeStep * 0.25) % (Math.PI * 2);
  
  // Moon orbits around Earth: ~12-13 times faster than Earth's orbit around Sun
  const moonOrbitAngle = mode === 'solar_eclipse' ? Math.PI : mode === 'lunar_eclipse' ? 0 : (timeStep * 0.25 * 12.3) % (Math.PI * 2);

  // Earth spins on axis: ~365 times faster than Earth orbit
  const earthSpinAngle = (timeStep * 50) % 360;

  // Sun center position
  const sunX = 250;
  const sunY = 150;
  const earthOrbitR = 120;

  // Earth coordinates
  const earthX = sunX + earthOrbitR * Math.cos(earthOrbitAngle);
  const earthY = sunY + earthOrbitR * Math.sin(earthOrbitAngle);

  // Moon coordinates around Earth
  const moonOrbitR = 34;
  const moonX = earthX + moonOrbitR * Math.cos(moonOrbitAngle);
  const moonY = earthY + moonOrbitR * Math.sin(moonOrbitAngle);

  const handleSetMode = (m) => {
    setMode(m);
    if (m === 'free') onLog("Chuyển sang mô hình Chuyển động Tự do Thực tế: Trái Đất tự quay quanh trục nghiêng 23.5°, tịnh tiến quanh Mặt Trời, Mặt Trăng quay quanh Trái Đất.");
    if (m === 'day_night') onLog("Chế độ Ngày & Đêm: Thể hiện Trái Đất quay trên trục nghiêng 23°27' gây hiện tượng luân phiên Ngày và Đêm.");
    if (m === 'solar_eclipse') onLog("Chế độ Nhật Thực Trực quan: Mặt Trăng đi đúng vào đường thẳng giữa Mặt Trời và Trái Đất, che bóng Umbra lên bề mặt Trái Đất.");
    if (m === 'lunar_eclipse') onLog("Chế độ Nguyệt Thực Trực quan: Trái Đất đi đúng vào giữa Mặt Trời và Mặt Trăng, nón bóng tối Trái Đất che phủ Mặt Trăng.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 300">
          {/* Starry bg */}
          <rect x="0" y="0" width="500" height="300" fill="#020617" />

          {/* Earth's Orbit Ellipse around Sun */}
          <circle cx={sunX} cy={sunY} r={earthOrbitR} fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Sun Rays & Radiance */}
          <circle cx={sunX} cy={sunY} r="32" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 25px #fde047)' }} />
          <text x={sunX} y={sunY + 4} fill="#0f172a" fontSize="10" fontWeight="900" textAnchor="middle">MẶT TRỜI</text>

          {/* Solar Light Beams */}
          <line x1={sunX} y1={sunY} x2={earthX} y2={earthY} stroke="rgba(253, 224, 71, 0.25)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Moon's Orbit Path around Earth */}
          <circle cx={earthX} cy={earthY} r={moonOrbitR} fill="none" stroke="rgba(203, 213, 225, 0.25)" strokeWidth="1" strokeDasharray="2 2" />

          {/* Shadow Cones for Eclipse Modes */}
          {mode === 'solar_eclipse' && (
            <polygon points={`${sunX},${sunY - 20} ${earthX},${earthY - 6} ${earthX},${earthY + 6} ${sunX},${sunY + 20}`} fill="rgba(15, 23, 42, 0.6)" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
          )}
          {mode === 'lunar_eclipse' && (
            <polygon points={`${earthX},${earthY - 14} ${moonX + 40},${moonY - 22} ${moonX + 40},${moonY + 22} ${earthX},${earthY + 14}`} fill="rgba(15, 23, 42, 0.7)" stroke="#7c3aed" strokeWidth="1" strokeDasharray="2 2" />
          )}

          {/* Earth Group with Tilted Axis */}
          <g transform={`translate(${earthX}, ${earthY})`}>
            {/* Day / Night Shading */}
            <circle cx="0" cy="0" r="16" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            
            {/* Dark night hemisphere facing away from Sun */}
            {(() => {
              const sunAngleToEarth = Math.atan2(sunY - earthY, sunX - earthX);
              const rotationDeg = (sunAngleToEarth * 180 / Math.PI) + 90;
              return (
                <g transform={`rotate(${rotationDeg})`}>
                  <path 
                    d="M 0 -16 A 16 16 0 0 1 0 16 Z" 
                    fill="rgba(15, 23, 42, 0.82)" 
                  />
                </g>
              );
            })()}

            {/* Earth 23.5° Tilted Axis Line */}
            <line x1="-6" y1="-22" x2="6" y2="22" stroke="#ef4444" strokeWidth="1.5" />
            <text x="0" y="28" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">Trái Đất (Trục 23.5°)</text>
          </g>

          {/* Moon Body */}
          <g transform={`translate(${moonX}, ${moonY})`}>
            <circle cx="0" cy="0" r="6" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            <text x="0" y="-9" fill="#cbd5e1" fontSize="8" fontWeight="bold" textAnchor="middle">Mặt Trăng</text>
          </g>

        </svg>

        <div style={{ position: 'absolute', top: '12px', left: '16px', background: 'rgba(15, 23, 42, 0.85)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(13, 148, 136, 0.3)', color: '#2dd4bf', fontSize: '0.78rem', fontWeight: 800 }}>
          ⚙️ Tỉ lệ quay: 1 Vòng Trái Đất = ~12 Vòng Mặt Trăng
        </div>
      </div>

      {/* Mode Controls & Play/Pause */}
      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleSetMode('free')} style={{ background: mode === 'free' ? '#0d9488' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
            🌍 Quay Thực Tế
          </button>
          <button onClick={() => handleSetMode('day_night')} style={{ background: mode === 'day_night' ? '#eab308' : '#1e293b', color: mode === 'day_night' ? '#000' : '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
            ☀️ Ngày & Đêm
          </button>
          <button onClick={() => handleSetMode('solar_eclipse')} style={{ background: mode === 'solar_eclipse' ? '#0284c7' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
            🌑 Nhật Thực
          </button>
          <button onClick={() => handleSetMode('lunar_eclipse')} style={{ background: mode === 'lunar_eclipse' ? '#7c3aed' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
            🌕 Nguyệt Thực
          </button>
        </div>

        <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: isPlaying ? '#eab308' : '#0d9488', color: isPlaying ? '#000' : '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}>
          {isPlaying ? '⏸️ Dừng' : '▶️ Chạy'}
        </button>
      </div>
    </div>
  );
}

// 5. Authentic USGS-Style Water Cycle Simulator (Vòng Tuần Hoàn Nước Standard USGS Diagram)
function GeoWaterCycleSim({ onLog }) {
  const [activeStage, setActiveStage] = useState('all'); // 'all', 'evap', 'cond', 'precip', 'runoff', 'infilt'

  const stagesInfo = {
    all: { title: 'VÒNG TUẦN HOÀN NƯỚC TOÀN CẦU (USGS Standard)', desc: 'Sự vận động liên tục của nước giữa Đại dương, Khí quyển, Băng tuyết núi cao và Nước ngầm.', log: 'Tổng quan Vòng tuần hoàn nước chuẩn USGS: Khép kín từ bốc hơi đại dương đến dòng chảy ngầm trả về biển.' },
    evap: { title: '1. BỐC HƠI & BỐC THOÁT HƠI', desc: 'Bức xạ nhiệt Mặt Trời làm nước ở đại dương, sông hồ bốc hơi và cây cối bốc thoát hơi nước vào không khí.', log: 'Giai đoạn Bốc hơi & Bốc thoát hơi: Năng lượng Mặt Trời chuyển nước lỏng thành hơi nước bốc lên cao.' },
    cond: { title: '2. NGƯNG HƠI & LƯỢNG TRỮ TRONG KHÍ QUYỂN', desc: 'Hơi nước gặp không khí lạnh ngưng tụ thành các đám mây tích tụ lượng trữ trong khí quyển.', log: 'Giai đoạn Ngưng hơi: Hơi nước gặp lạnh đọng lại thành mây tích tụ ở tầng khí quyển.' },
    precip: { title: '3. GIÁNG THỦY (MƯA & TUYẾT RƠI)', desc: 'Giọt nước trong mây đọng đủ nặng rơi xuống mặt đất dưới dạng hạt mưa hoặc tích tụ thành băng tuyết đỉnh núi.', log: 'Giai đoạn Giáng thủy: Mây phát tán Mưa xuống đồng bằng & Tuyết rơi phủ đỉnh núi cao.' },
    runoff: { title: '4. DÒNG CHẢY TUYẾT TAN & DÒNG CHẢY MẶT', desc: 'Băng tuyết núi tan chảy hình thành suối, đổ vào dòng chảy trong sông và chảy bề mặt về đại dương.', log: 'Giai đoạn Dòng chảy mặt: Tuyết tan tạo dòng suối hợp lưu thành sông chảy ra đại dương.' },
    infilt: { title: '5. THẤM & DÒNG CHẢY NGẦM', desc: 'Nước mưa ngấm qua các tầng đất đá tạo lượng trữ nước ngầm và di chuyển âm thầm ra biển.', log: 'Giai đoạn Thấm & Dòng chảy ngầm: Nước ngấm sâu tạo mạch nước ngầm và dòng chảy ngầm ra biển.' }
  };

  const handleSelectStage = (key) => {
    setActiveStage(key);
    onLog(stagesInfo[key].log);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#09131d', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.3)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Full USGS Scenic Landscape SVG */}
        <svg width="100%" height="100%" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Sky Gradient */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>

            {/* Ocean Gradient */}
            <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            {/* Mountain Rock Gradient */}
            <linearGradient id="mountainGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Underground Soil Layer Gradient */}
            <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* Arrow Marker */}
            <marker id="blueArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
            </marker>
            <marker id="cyanArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Sky background */}
          <rect x="0" y="0" width="600" height="220" fill="url(#skyGrad)" />

          {/* Sun Upper Right */}
          <circle cx="530" cy="45" r="28" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 20px #fde047)' }} />
          {/* Sun Rays */}
          <g stroke="#fde047" strokeWidth="2" opacity="0.6">
            <line x1="530" y1="10" x2="530" y2="0" />
            <line x1="495" y1="45" x2="485" y2="45" />
            <line x1="505" y1="20" x2="495" y2="10" />
            <line x1="505" y1="70" x2="495" y2="80" />
          </g>

          {/* Ocean Section (Right) */}
          <path d="M 380 200 Q 450 195 600 200 L 600 290 L 380 290 Z" fill="url(#oceanGrad)" />
          <text x="490" y="245" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">LƯỢNG TRỮ TRONG CÁC ĐẠI DƯƠNG</text>

          {/* Mountain Ranges & Glacier (Left to Middle) */}
          {/* Back Mountain */}
          <polygon points="20,220 120,60 240,220" fill="#64748b" />
          
          {/* Front Main Snow Peak */}
          <polygon points="-20,260 90,40 260,260" fill="url(#mountainGrad)" />
          
          {/* Glacier Snow Cap */}
          <polygon points="65,80 90,40 115,80 100,75 90,85 80,75" fill="#ffffff" />
          <text x="90" y="30" fill="#1e293b" fontSize="10" fontWeight="900" textAnchor="middle">LƯỢNG TRỮ TRONG BĂNG VÀ TUYẾT</text>

          {/* Coastal Lowland Green Landscape */}
          <path d="M 220 230 Q 300 200 390 200 L 390 290 L 220 290 Z" fill="#15803d" />

          {/* Underground Soil Layer (Cross-Section) */}
          <path d="M 0 250 L 600 250 L 600 360 L 0 360 Z" fill="url(#soilGrad)" />

          {/* Winding Rivers & Streams */}
          {/* Snowmelt Stream */}
          <path d="M 90 85 Q 110 130 130 170" stroke="#38bdf8" strokeWidth="4" fill="none" />
          <text x="145" y="145" fill="#0284c7" fontSize="9" fontWeight="800">Dòng chảy tuyết tan</text>

          {/* River Stream */}
          <path d="M 130 170 Q 220 180 380 215" stroke="#0284c7" strokeWidth="6" fill="none" />
          <text x="260" y="195" fill="#ffffff" fontSize="9" fontWeight="900">Dòng chảy trong sông</text>

          {/* Freshwater Lake */}
          <ellipse cx="230" cy="225" rx="25" ry="10" fill="#0284c7" />
          <text x="230" y="240" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">Lượng trữ nước ngọt</text>

          {/* Clouds in Atmosphere */}
          <g transform="translate(260, 45)" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))' }}>
            <circle cx="0" cy="0" r="22" fill="#ffffff" />
            <circle cx="25" cy="-8" r="28" fill="#ffffff" />
            <circle cx="55" cy="0" r="24" fill="#ffffff" />
            <circle cx="30" cy="10" r="22" fill="#ffffff" />
            <text x="28" y="36" fill="#0369a1" fontSize="10" fontWeight="900" textAnchor="middle">LƯỢNG TRỮ TRONG KHÍ QUYỂN</text>
          </g>

          {/* USGS Curved Process Arrows & Vietnamese Labels */}

          {/* 1. Bốc hơi (Evaporation from Ocean) */}
          <g opacity={activeStage === 'all' || activeStage === 'evap' ? 1 : 0.25} style={{ cursor: 'pointer' }} onClick={() => handleSelectStage('evap')}>
            <path d="M 520 200 Q 550 130 460 70" stroke="#0284c7" strokeWidth="5" fill="none" markerEnd="url(#blueArrow)" strokeDasharray={activeStage === 'evap' ? '6 3' : 'none'} />
            <text x="540" y="140" fill="#0284c7" fontSize="11" fontWeight="900">Bốc hơi</text>
          </g>

          {/* 2. Bốc thoát hơi (Evapotranspiration from land) */}
          <g opacity={activeStage === 'all' || activeStage === 'evap' ? 1 : 0.25} style={{ cursor: 'pointer' }} onClick={() => handleSelectStage('evap')}>
            <path d="M 330 200 L 330 110" stroke="#0284c7" strokeWidth="4" fill="none" markerEnd="url(#blueArrow)" />
            <text x="340" y="150" fill="#0284c7" fontSize="10" fontWeight="900">Bốc thoát hơi</text>
          </g>

          {/* 3. Ngưng hơi (Condensation) */}
          <g opacity={activeStage === 'all' || activeStage === 'cond' ? 1 : 0.25} style={{ cursor: 'pointer' }} onClick={() => handleSelectStage('cond')}>
            <path d="M 430 55 L 360 45" stroke="#0369a1" strokeWidth="4" fill="none" markerEnd="url(#blueArrow)" />
            <text x="400" y="38" fill="#0369a1" fontSize="10" fontWeight="900">Ngưng hơi</text>
          </g>

          {/* 4. Giáng thủy (Precipitation Rain/Snow) */}
          <g opacity={activeStage === 'all' || activeStage === 'precip' ? 1 : 0.25} style={{ cursor: 'pointer' }} onClick={() => handleSelectStage('precip')}>
            {/* Rain over mountains */}
            <path d="M 230 70 Q 180 80 140 100" stroke="#0284c7" strokeWidth="4" fill="none" markerEnd="url(#blueArrow)" />
            <text x="160" y="80" fill="#0284c7" fontSize="11" fontWeight="900">Giáng thủy (Mưa / Tuyết)</text>
            
            {/* Raindrops visual */}
            <g stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3">
              <line x1="140" y1="105" x2="130" y2="135" />
              <line x1="160" y1="110" x2="150" y2="140" />
              <line x1="180" y1="115" x2="170" y2="145" />
            </g>
          </g>

          {/* 5. Dòng chảy mặt (Surface Runoff) */}
          <g opacity={activeStage === 'all' || activeStage === 'runoff' ? 1 : 0.25} style={{ cursor: 'pointer' }} onClick={() => handleSelectStage('runoff')}>
            <path d="M 310 215 Q 350 210 390 220" stroke="#0284c7" strokeWidth="4" fill="none" markerEnd="url(#blueArrow)" />
            <text x="310" y="235" fill="#ffffff" fontSize="10" fontWeight="900">Dòng chảy mặt</text>
          </g>

          {/* 6. Thấm (Infiltration) */}
          <g opacity={activeStage === 'all' || activeStage === 'infilt' ? 1 : 0.25} style={{ cursor: 'pointer' }} onClick={() => handleSelectStage('infilt')}>
            <path d="M 170 240 L 140 280" stroke="#38bdf8" strokeWidth="4" fill="none" markerEnd="url(#cyanArrow)" />
            <text x="110" y="265" fill="#fde047" fontSize="11" fontWeight="900">Thấm</text>
          </g>

          {/* 7. Dòng chảy ngầm & Lượng trữ nước ngầm */}
          <g opacity={activeStage === 'all' || activeStage === 'infilt' ? 1 : 0.25} style={{ cursor: 'pointer' }} onClick={() => handleSelectStage('infilt')}>
            <path d="M 140 310 Q 280 340 440 270" stroke="#38bdf8" strokeWidth="6" fill="none" markerEnd="url(#cyanArrow)" strokeDasharray="6 3" />
            <text x="220" y="325" fill="#ffffff" fontSize="11" fontWeight="900">Dòng chảy ngầm</text>
            <text x="320" y="348" fill="#fde047" fontSize="10" fontWeight="bold">LƯỢNG TRỮ NƯỚC NGẦM</text>
          </g>
        </svg>

        {/* Floating Stage Explainer Overlay Banner */}
        <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#38bdf8' }}>
              📌 {stagesInfo[activeStage].title}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
              {stagesInfo[activeStage].desc}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Stage Selector Buttons */}
      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '12px', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {[
          { key: 'all', label: '🌐 Toàn Bộ Tuần Hoàn' },
          { key: 'evap', label: '☀️ 1. Bốc Hơi & Bốc Thoát Hơi' },
          { key: 'cond', label: '☁️ 2. Ngưng Hơi (Mây)' },
          { key: 'precip', label: '🌧️ 3. Giáng Thủy (Mưa/Tuyết)' },
          { key: 'runoff', label: '🏔️ 4. Dòng Chảy Mặt & Sông' },
          { key: 'infilt', label: '🕳️ 5. Thấm & Dòng Chảy Ngầm' }
        ].map(st => (
          <button 
            key={st.key}
            onClick={() => handleSelectStage(st.key)}
            style={{
              background: activeStage === st.key ? '#0d9488' : '#1e293b',
              color: activeStage === st.key ? '#fff' : '#cbd5e1',
              border: activeStage === st.key ? '2px solid #2dd4bf' : '1px solid #334155',
              borderRadius: '8px', padding: '8px 14px',
              fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {st.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// 6. Structure of Earth Interior Simulator
function GeoEarthStructureSim({ onLog }) {
  const [activeLayer, setActiveLayer] = useState('crust');

  const layersInfo = {
    crust: { name: 'Vỏ Trái Đất', depth: '5 - 70 km', temp: '0 - 1000°C', state: 'Rắn cứng', desc: 'Lớp ngoài cùng mỏng nhất, nơi con người & các sinh vật sinh sống.', color: '#38bdf8' },
    mantle: { name: 'Lớp Manti', depth: '2.900 km', temp: '1.500 - 4.700°C', state: 'Dẻo quánh đến rắn', desc: 'Chiếm 80% thể tích Trái Đất, nơi xảy ra dòng đối lưu magma gây động đất núi lửa.', color: '#f59e0b' },
    outerCore: { name: 'Nhân Ngoài', depth: '2.200 km', temp: '5.000°C', state: 'Kim loại lỏng (Fe, Ni)', desc: 'Chuyển động kim loại lỏng tạo nên Từ trường Trái Đất.', color: '#ef4444' },
    innerCore: { name: 'Nhân Trong (Tâm Trái Đất)', depth: '1.250 km', temp: '5.500 - 6.000°C', state: 'Rắn (Hợp kim sắt nickel)', desc: 'Áp suất cực lớn giữ kim loại ở dạng rắn dù nhiệt độ nóng bằng bề mặt Mặt Trời!', color: '#ffffff' }
  };

  const handleSelectLayer = (key) => {
    setActiveLayer(key);
    onLog(`Khám phá cấu tạo ${layersInfo[key].name}: Độ sâu ${layersInfo[key].depth}, Nhiệt độ ${layersInfo[key].temp}.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, background: '#09131d', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.3)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          {/* Concentric Circles */}
          <svg width="260" height="260" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="120" fill="#38bdf8" onClick={() => handleSelectLayer('crust')} style={{ cursor: 'pointer' }} />
            <circle cx="130" cy="130" r="110" fill="#d97706" onClick={() => handleSelectLayer('mantle')} style={{ cursor: 'pointer' }} />
            <circle cx="130" cy="130" r="70" fill="#ef4444" onClick={() => handleSelectLayer('outerCore')} style={{ cursor: 'pointer' }} />
            <circle cx="130" cy="130" r="35" fill="#ffffff" onClick={() => handleSelectLayer('innerCore')} style={{ cursor: 'pointer' }} />
          </svg>

          {/* Info Card */}
          <div style={{ maxWidth: '320px', background: 'rgba(15, 23, 42, 0.9)', padding: '16px 20px', borderRadius: '16px', border: `2px solid ${layersInfo[activeLayer].color}` }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: layersInfo[activeLayer].color, margin: '0 0 8px 0' }}>
              {layersInfo[activeLayer].name}
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              <div>• Độ sâu: <b>{layersInfo[activeLayer].depth}</b></div>
              <div>• Nhiệt độ: <b>{layersInfo[activeLayer].temp}</b></div>
              <div>• Trạng thái: <b>{layersInfo[activeLayer].state}</b></div>
              <p style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94a3b8', margin: '8px 0 0 0' }}>
                {layersInfo[activeLayer].desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', gap: '8px' }}>
        {Object.keys(layersInfo).map(key => (
          <button key={key} onClick={() => handleSelectLayer(key)} style={{ background: activeLayer === key ? layersInfo[key].color : '#1e293b', color: activeLayer === key ? '#000' : '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
            {layersInfo[key].name}
          </button>
        ))}
      </div>
    </div>
  );
}

// 7. Glacial Melt & River Formation Simulator
function GeoGlacialRiverSim({ onLog }) {
  const [temp, setTemp] = useState(15);
  const flowRate = Math.max(0, (temp - 0) * 4);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (onLog) onLog(`Nhiệt độ mùa hè t = ${temp}°C ➔ Băng tuyết tan với lưu lượng dòng chảy ${flowRate} m³/s hình thành dòng sông cuồn cuộn.`);
  }, [temp]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, background: '#09131d', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.3)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 300">
          {/* Mountain */}
          <polygon points="100,300 250,50 400,300" fill="#334155" />
          
          {/* Snow top receding with temp */}
          <polygon points={`${230 + temp} ${70 + temp} 250 50 ${270 - temp} ${70 + temp}`} fill="#ffffff" />
          <text x="250" y="40" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">Đỉnh núi tuyết vĩnh cửu</text>

          {/* Winding River Stream */}
          <path d="M 250 120 Q 230 180 200 220 T 100 300" fill="none" stroke="#38bdf8" strokeWidth={Math.min(16, 3 + flowRate/10)} />
          <text x="180" y="240" fill="#38bdf8" fontSize="12" fontWeight="bold">Dòng Sông Nguồn ({flowRate} m³/s)</text>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>Nhiệt độ Mùa Hè: <b style={{ color: '#fde047' }}>{temp}°C</b></span>
          <input type="range" min="0" max="35" step="1" value={temp} onChange={e => setTemp(Number(e.target.value))} style={{ flex: 1, accentColor: '#0d9488', cursor: 'pointer' }} />
        </div>
        <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 800 }}>
          Lưu lượng nước sông: {flowRate} m³/s
        </div>
      </div>
    </div>
  );
}

// 8. Volcano Eruption & Magma Chamber Simulator
function GeoVolcanoSim({ onLog }) {
  const [pressure, setPressure] = useState(50); // MPa (0 to 120)
  const [isErupting, setIsErupting] = useState(false);

  const handleIncreasePressure = () => {
    const next = Math.min(120, pressure + 20);
    setPressure(next);
    if (next >= 100 && !isErupting) {
      setIsErupting(true);
      if (onLog) onLog("🌋 Áp suất buồng Magma vượt ngưỡng 100 MPa ➔ BÙNG NỔ NÚI LỬA! Dung nham đỏ rực 1200°C và tro bụi phun trào dữ dội!");
    } else if (onLog) {
      onLog(`🔥 Áp suất buồng Magma tăng lên: ${next} MPa. Nhiệt độ Magma t° ~ 1200°C.`);
    }
  };

  const handleReset = () => {
    setPressure(50);
    setIsErupting(false);
    if (onLog) onLog("🔄 Đã làm mới mô hình Núi Lửa về trạng thái tích tụ Magma ban đầu.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ flex: 1, background: '#070f1e', borderRadius: '16px', border: '1.5px solid rgba(245, 158, 11, 0.4)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 600 320" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="magmaChamberGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#991b1b" />
            </radialGradient>

            <linearGradient id="volcanoBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          <rect width="600" height="320" fill="url(#volcanoBg)" />

          {/* Earth Crust Layers */}
          <rect x="0" y="200" width="600" height="120" fill="#1e293b" />
          <rect x="0" y="260" width="600" height="60" fill="#0f172a" />
          <text x="30" y="230" fill="#94a3b8" fontSize="11" fontWeight="bold">Lớp Vỏ Trái Đất (Crust)</text>
          <text x="30" y="285" fill="#f59e0b" fontSize="11" fontWeight="bold">Lớp Manti Trên (Magma Chamber)</text>

          {/* Volcano Mountain Cone */}
          <polygon points="120,200 300,70 480,200" fill="#334155" stroke="#475569" strokeWidth="2" />
          <polygon points="270,70 300,70 330,70 315,90 285,90" fill="#0f172a" />

          {/* Main Magma Conduit / Vent */}
          <rect x="290" y="80" width="20" height="150" fill={pressure > 80 ? "#f97316" : "#7f1d1d"} />

          {/* Subterranean Magma Chamber Reservoir */}
          <ellipse cx="300" cy="260" rx={60 + (pressure * 0.4)} ry={35 + (pressure * 0.2)} fill="url(#magmaChamberGrad)" style={{ filter: 'drop-shadow(0 0 20px #ef4444)' }} />
          <text x="300" y="264" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">
            Buồng Magma ({pressure} MPa)
          </text>

          {/* Eruption FX when active */}
          {isErupting && (
            <g>
              <path d="M 300 70 Q 250 -20 200 130 Q 180 180 160 200" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
              <path d="M 300 70 Q 350 -20 400 130 Q 420 180 440 200" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />

              <circle cx="300" cy="30" r="35" fill="#475569" opacity="0.8" />
              <circle cx="270" cy="15" r="28" fill="#334155" opacity="0.8" />
              <circle cx="330" cy="15" r="28" fill="#334155" opacity="0.8" />
              <text x="300" y="25" fill="#fde047" fontSize="10" fontWeight="900" textAnchor="middle">
                💨 Tro Bụi & Khí Độc (15km)
              </text>
            </g>
          )}
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            Áp Suất Buồng Magma: <b style={{ color: pressure > 90 ? '#ef4444' : '#f59e0b', fontSize: '1rem', fontFamily: 'monospace' }}>{pressure} MPa</b>
          </span>
          <input 
            type="range" min="20" max="120" step="5" value={pressure} 
            onChange={e => {
              const val = Number(e.target.value);
              setPressure(val);
              if (val >= 100 && !isErupting) {
                setIsErupting(true);
                if (onLog) onLog("🌋 BÙNG NỔ NÚI LỬA! Dung nham tràn qua họng núi lửa và tro bụi bùng nổ!");
              }
            }} 
            style={{ flex: 1, accentColor: '#ef4444', cursor: 'pointer' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleIncreasePressure}
            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', color: '#fff', borderRadius: '10px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 900, cursor: 'pointer' }}
          >
            🔥 Tăng Áp Suất (+20 MPa)
          </button>

          <button 
            onClick={handleReset}
            style={{ background: '#334155', border: '1px solid #64748b', color: '#cbd5e1', borderRadius: '10px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// 9. Earthquake & Tectonic Fault Seismic Wave Simulator
function GeoEarthquakeSim({ onLog }) {
  const [magnitude, setMagnitude] = useState(6.5); // Richter
  const [isShaking, setIsShaking] = useState(false);

  const handleTriggerQuake = () => {
    setIsShaking(true);
    if (onLog) onLog(`⚡ ĐỨT GÃY MẢNG KIẾN TẠO! Giải phóng ứng suất địa chất ➔ Động đất ${magnitude.toFixed(1)} độ Richter! Sóng địa chất P và S chấn động mạnh lên tâm chấn.`);
    setTimeout(() => setIsShaking(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <style>{`
        @keyframes quakeShake {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-6px, 4px); }
          40% { transform: translate(6px, -5px); }
          60% { transform: translate(-5px, 5px); }
          80% { transform: translate(5px, -3px); }
          100% { transform: translate(0, 0); }
        }
        .earthquake-shake {
          animation: quakeShake 0.15s infinite;
        }
      `}</style>
      <div style={{ flex: 1, background: '#070f1e', borderRadius: '16px', border: '1.5px solid rgba(56, 189, 248, 0.4)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 600 320" preserveAspectRatio="xMidYMid meet" className={isShaking ? "earthquake-shake" : ""}>
          <rect width="600" height="320" fill="#030816" />

          {/* Tectonic Plate 1 (Left) */}
          <path d="M 0 120 L 295 120 L 285 320 L 0 320 Z" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
          <text x="80" y="200" fill="#94a3b8" fontSize="12" fontWeight="bold">Mảng Kiến Tạo A</text>

          {/* Tectonic Plate 2 (Right) */}
          <path d="M 305 120 L 600 120 L 600 320 L 315 320 Z" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
          <text x="400" y="200" fill="#94a3b8" fontSize="12" fontWeight="bold">Mảng Kiến Tạo B</text>

          {/* Fault Line */}
          <line x1="295" y1="120" x2="285" y2="320" stroke="#ef4444" strokeWidth="3" strokeDasharray="4,4" />

          {/* Hypocenter (Chấn Tiêu) */}
          <circle cx="290" cy="220" r="12" fill="#ef4444" stroke="#fef08a" strokeWidth="2" />
          <text x="290" y="245" fill="#fca5a5" fontSize="10" fontWeight="900" textAnchor="middle">
            Chấn Tiêu (Hypocenter)
          </text>

          {/* Epicenter (Tâm Chấn) */}
          <polygon points="295,120 287,105 303,105" fill="#f59e0b" />
          <circle cx="295" cy="120" r="6" fill="#f59e0b" />
          <text x="295" y="95" fill="#fde047" fontSize="11" fontWeight="900" textAnchor="middle">
            Tâm Chấn Bề Mặt (Epicenter)
          </text>

          {/* Surface Buildings */}
          <rect x="150" y="70" width="40" height="50" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <rect x="420" y="60" width="50" height="60" fill="#334155" stroke="#64748b" strokeWidth="1" />

          {/* Seismic Waves */}
          {isShaking && (
            <g transform="translate(290, 220)">
              <circle cx="0" cy="0" r="40" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
              <circle cx="0" cy="0" r="70" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.6" />
              <circle cx="0" cy="0" r="100" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.4" />
            </g>
          )}

          <g transform="translate(430, 20)">
            <rect x="0" y="0" width="150" height="50" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#0284c7" strokeWidth="1.5" />
            <text x="10" y="18" fill="#38bdf8" fontSize="9" fontWeight="900">Máy Đo Địa Chấn (Richter)</text>
            <text x="10" y="38" fill="#ef4444" fontSize="13" fontWeight="900" fontFamily="monospace">
              {magnitude.toFixed(1)} Richter
            </text>
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            Độ Cường Độ (Richter): <b style={{ color: magnitude > 7.0 ? '#ef4444' : '#38bdf8', fontSize: '1rem', fontFamily: 'monospace' }}>{magnitude.toFixed(1)}</b>
          </span>
          <input 
            type="range" min="1.0" max="9.0" step="0.1" value={magnitude} 
            onChange={e => setMagnitude(Number(e.target.value))} 
            style={{ flex: 1, accentColor: '#0284c7', cursor: 'pointer' }} 
          />
        </div>

        <button 
          onClick={handleTriggerQuake}
          style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0284c7 100%)', border: 'none', color: '#fff', borderRadius: '10px', padding: '10px 20px', fontSize: '0.88rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)' }}
        >
          ⚡ Kích Hoạt Động Đất
        </button>
      </div>
    </div>
  );
}

// --- GRADE 9 CHEMISTRY SIMULATION SUBCOMPONENTS (Matching Textbook & 4 Sample Videos) ---

function Chem9FeO2Sim({ onLog }) {
  const [step, setStep] = useState(0); // 0: idle, 1: heating, 2: reacting, 3: done
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        const newSparks = Array.from({ length: 12 }).map(() => ({
          id: Math.random(),
          x: 200 + (Math.random() - 0.5) * 60,
          y: 140 + (Math.random() - 0.5) * 70,
          vx: (Math.random() - 0.5) * 140,
          vy: (Math.random() - 0.5) * 140,
          color: Math.random() > 0.3 ? '#fde047' : '#f97316',
          size: 2 + Math.random() * 4
        }));
        setSparks(newSparks);
      }, 80);
      return () => clearInterval(interval);
    } else {
      setSparks([]);
    }
  }, [step]);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      onLog("🔥 Nung nóng đỏ mẩu than quấn ở đầu dây sắt trên ngọn lửa đèn cồn.");
    } else if (step === 1) {
      setStep(2);
      onLog("⚡ Đưa nhanh dây sắt nóng đỏ vào bình chứa khí Oxygen (O₂)...");
      setTimeout(() => {
        setStep(3);
        onLog("💥 Dây sắt BÙNG CHÁY DỮ DỘI, bắn ra các TIA LỬA SÁNG RỰC RỠ như pháo hoa, tạo khối Fe₃O₄ màu nâu đen!");
      }, 3500);
    }
  };

  const handleReset = () => {
    setStep(0);
    onLog("🔄 Chuẩn bị lại bài thí nghiệm Fe + O₂.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#030712" />

          {/* Sand layer in flask bottom */}
          <ellipse cx="200" cy="270" rx="65" ry="12" fill="#d97706" opacity="0.6" />

          {/* Erlenmeyer Flask for O2 */}
          <path d="M 175 120 L 140 270 A 15 15 0 0 0 155 285 L 245 285 A 15 15 0 0 0 260 270 L 225 120 Z" fill="rgba(56, 189, 248, 0.06)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
          <rect x="175" y="90" width="50" height="30" fill="rgba(56, 189, 248, 0.08)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <text x="200" y="240" fill="rgba(56, 189, 248, 0.4)" fontSize="16" fontWeight="900" textAnchor="middle">O₂ (Oxygen)</text>

          {/* Dynamic Realistic Alcohol Lamp */}
          <AlcoholLampAssembly x={360} y={225} isHeating={step === 1} temp={step === 1 ? 650 : 25} />

          {/* Iron Coil Holder Rod */}
          <line x1="80" y1="40" x2={step === 1 ? "360" : "200"} y2={step === 1 ? "160" : step >= 2 ? "160" : "80"} stroke="#94a3b8" strokeWidth="3" style={{ transition: 'all 0.6s ease' }} />
          
          {/* Iron Coil Spiral */}
          <g transform={`translate(${step === 1 ? 360 : 200}, ${step === 1 ? 160 : step >= 2 ? 160 : 80})`} style={{ transition: 'all 0.6s ease' }}>
            <path d="M 0 0 Q 8 6 0 12 Q -8 18 0 24 Q 8 30 0 36 Q -8 42 0 48" fill="none" 
              stroke={step === 0 ? "#cbd5e1" : step === 1 ? "#ef4444" : step === 2 ? "#fde047" : "#475569"} 
              strokeWidth="4" 
              style={{ filter: step === 1 || step === 2 ? 'drop-shadow(0 0 15px #f59e0b)' : 'none' }}
            />

            {/* Glowing Charcoal at tip */}
            <circle cx="0" cy="50" r="5" fill={step >= 1 ? "#f97316" : "#1e293b"} style={{ filter: step >= 1 ? 'drop-shadow(0 0 10px #ef4444)' : 'none' }} />
          </g>

          {/* Intense Spark Particles during reaction */}
          {(step === 2 || step === 3) && sparks.map(s => (
            <circle key={s.id} cx={s.x} cy={s.y} r={s.size} fill={s.color} style={{ filter: 'drop-shadow(0 0 6px #fde047)' }} />
          ))}

          {/* Fe3O4 Brownish Black Solid Residue */}
          {step === 3 && (
            <g>
              <ellipse cx="200" cy="265" rx="35" ry="8" fill="#18181b" opacity="0.9" />
              <text x="200" y="220" fill="#fde047" fontSize="13" fontWeight="900" textAnchor="middle" style={{ filter: 'drop-shadow(0 2px 8px #000)' }}>
                💥 Cháy sáng rực rỡ! Tạo Fe₃O₄ nâu đen
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Control Panel & Equations */}
      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>3Fe + 2O₂ ➔ Fe₃O₄ (t°)</b>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            Sắt cháy mạnh trong Oxygen với ngọn lửa sáng chói, phát ra hoa lửa sáng rực.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {step < 2 ? (
            <button onClick={handleNext} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
              {step === 0 ? '1. Nung nóng dây sắt' : '2. Đưa vào bình Oxygen (O₂)'}
            </button>
          ) : (
            <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              🔄 Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Chem9AlO2Sim({ onLog }) {
  const [isBurning, setIsBurning] = useState(false);

  const handleBurn = () => {
    setIsBurning(true);
    onLog("✨ Rắc bột nhôm (Al) lên ngọn lửa đèn cồn -> Bột nhôm cháy sáng CHÓI LÓA phát ra các hạt hoa lửa trắng lấp lánh (4Al + 3O₂ ➔ 2Al₂O₃)!");
  };

  const handleReset = () => {
    setIsBurning(false);
    onLog("🔄 Tái lập thí nghiệm Al + O₂.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />

          {/* Dynamic Realistic Alcohol Lamp */}
          <AlcoholLampAssembly x={250} y={235} isHeating={true} temp={620} />

          {/* Spatula with Aluminum Powder */}
          <g transform="translate(200, 90)">
            <rect x="-80" y="0" width="120" height="6" fill="#cbd5e1" rx="3" />
            <path d="M 40 -4 C 55 -4 60 8 40 8 Z" fill="#94a3b8" />
            <ellipse cx="45" cy="1" rx="8" ry="3" fill="#e2e8f0" />
            <text x="-40" y="-10" fill="#cbd5e1" fontSize="12" fontWeight="bold">Thìa chứa Bột Nhôm (Al)</text>
          </g>

          {/* Blinding White Flash & Fireworks Sparks */}
          {isBurning && (
            <g>
              <circle cx="250" cy="150" r="70" fill="url(#sunShader)" opacity="0.6" style={{ filter: 'drop-shadow(0 0 40px #ffffff)' }} />
              {Array.from({ length: 25 }).map((_, i) => {
                const angle = (i / 25) * Math.PI * 2;
                const r = 20 + Math.random() * 65;
                const cx = 250 + Math.cos(angle) * r;
                const cy = 150 + Math.sin(angle) * r;
                return <circle key={i} cx={cx} cy={cy} r={2 + Math.random() * 3} fill="#ffffff" style={{ filter: 'drop-shadow(0 0 8px #ffffff)' }} />;
              })}
              <text x="250" y="60" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle" style={{ filter: 'drop-shadow(0 0 10px #ffffff)' }}>
                ✨ CHÁY SÁNG CHÓI LÓA TẠO Al₂O₃ TRẮNG!
              </text>
            </g>
          )}
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>4Al + 3O₂ ➔ 2Al₂O₃ (t°)</b>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            Nhôm cháy sáng rực rỡ với ngọn lửa chói lóa, phát ra nhiều hạt lửa trắng sáng.
          </div>
        </div>

        <div>
          {!isBurning ? (
            <button onClick={handleBurn} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
              ✨ Rắc bột Nhôm (Al)
            </button>
          ) : (
            <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              🔄 Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Chem9NaCl2Sim({ onLog }) {
  const [step, setStep] = useState(0); // 0: idle, 1: melting Na, 2: reacting

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      onLog("🔥 Đun nóng chảy mẩu Natri (Na) trên ngọn lửa đèn cồn...");
    } else if (step === 1) {
      setStep(2);
      onLog("💥 Đưa Natri nóng chảy vào bình chứa khí Chlorine (Cl₂) -> Natri CHÁY VÀNG RỰC RỠ, sinh ra khói trắng tinh thể NaCl!");
    }
  };

  const handleReset = () => {
    setStep(0);
    onLog("🔄 Tái lập thí nghiệm Na + Cl₂.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />

          {/* Round Bottom Flask containing Cl2 Gas */}
          <g transform="translate(250, 190)">
            <circle cx="0" cy="0" r="75" fill={step === 2 ? "rgba(255, 255, 255, 0.25)" : "rgba(163, 230, 53, 0.3)"} stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
            <rect x="-18" y="-125" width="36" height="60" fill={step === 2 ? "rgba(255, 255, 255, 0.2)" : "rgba(163, 230, 53, 0.25)"} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <rect x="-22" y="-135" width="44" height="15" fill="#334155" rx="3" />
            <text x="0" y="45" fill={step === 2 ? "#cbd5e1" : "#a3e635"} fontSize="14" fontWeight="900" textAnchor="middle">
              {step === 2 ? "Khói tinh thể NaCl màu trắng" : "Cl₂ (Chlorine khí vàng nhạt)"}
            </text>
          </g>

          {/* Deflagrating Spoon with Na */}
          <g transform={`translate(250, ${step === 2 ? 140 : 50})`} style={{ transition: 'all 0.6s ease' }}>
            <line x1="0" y1="-80" x2="0" y2="20" stroke="#cbd5e1" strokeWidth="3" />
            <path d="M -12 20 C -12 32 12 32 12 20 Z" fill="#94a3b8" />
            <circle cx="0" cy="18" r="7" fill={step === 0 ? "#cbd5e1" : step === 1 ? "#f59e0b" : "#fef08a"} style={{ filter: step >= 1 ? 'drop-shadow(0 0 12px #fde047)' : 'none' }} />
          </g>

          {/* Reaction Bright Yellow Flame & Billowing White Smoke Clouds */}
          {step === 2 && (
            <g>
              <circle cx="250" cy="160" r="35" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 30px #fde047)' }} />
              {/* White Smoke Clouds */}
              <circle cx="230" cy="140" r="22" fill="#ffffff" opacity="0.6" />
              <circle cx="270" cy="135" r="25" fill="#ffffff" opacity="0.7" />
              <circle cx="250" cy="115" r="30" fill="#ffffff" opacity="0.8" />
              <text x="250" y="50" fill="#fde047" fontSize="14" fontWeight="900" textAnchor="middle" style={{ filter: 'drop-shadow(0 2px 8px #000)' }}>
                🟡 Na cháy ngọn lửa vàng chói ➔ Tạo khói trắng NaCl
              </text>
            </g>
          )}
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>2Na + Cl₂ ➔ 2NaCl (t°)</b>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            Natri nóng chảy cháy rực rỡ trong khí chlorine tạo khói trắng tinh thể NaCl.
          </div>
        </div>

        <div>
          {step < 2 ? (
            <button onClick={handleNext} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
              {step === 0 ? '1. Đun nóng chảy Sodium (Na)' : '2. Đưa vào bình khí Chlorine (Cl₂)'}
            </button>
          ) : (
            <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              🔄 Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Chem9FeCl2Sim({ onLog }) {
  const [step, setStep] = useState(0); // 0: idle, 1: heating, 2: combusting, 3: dissolved

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      onLog("🔥 Nung nóng đỏ đầu dây sắt (Fe) trên ngọn lửa đèn cồn...");
    } else if (step === 1) {
      setStep(2);
      onLog("💥 Đưa dây sắt nóng đỏ vào bình chứa khí Chlorine (Cl₂) -> Sắt cháy mạnh rực rỡ, bình ngập tràn KHÓI MÀU NÂU ĐỎ (FeCl₃)!");
    } else if (step === 2) {
      setStep(3);
      onLog("💧 Rót nước cất vào bình và lắc nhẹ -> Khói tan hết tạo DUNG DỊCH MÀU NÂU VÀNG của FeCl₃!");
    }
  };

  const handleReset = () => {
    setStep(0);
    onLog("🔄 Tái lập thí nghiệm Fe + Cl₂.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(217, 119, 6, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />

          {/* Flask for Cl2 Gas */}
          <g transform="translate(250, 190)">
            {/* Liquid at bottom when dissolved */}
            {step === 3 && (
              <path d="M -50 45 Q 0 55 50 45 L 60 70 A 15 15 0 0 1 45 85 L -45 85 A 15 15 0 0 1 -60 70 Z" fill="#b45309" opacity="0.85" />
            )}

            <path d="M -25 -70 L -60 70 A 15 15 0 0 0 -45 85 L 45 85 A 15 15 0 0 0 60 70 L 25 -70 Z" 
              fill={step === 2 ? "rgba(180, 83, 9, 0.4)" : step === 3 ? "rgba(255,255,255,0.05)" : "rgba(163, 230, 53, 0.25)"} 
              stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" 
            />
            <rect x="-25" y="-100" width="50" height="30" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <text x="0" y="30" fill={step === 2 ? "#f97316" : step === 3 ? "#fde047" : "#a3e635"} fontSize="13" fontWeight="900" textAnchor="middle">
              {step === 2 ? "Khói nâu đỏ FeCl₃" : step === 3 ? "Dung dịch FeCl₃ nâu vàng" : "Cl₂ (Chlorine vàng nhạt)"}
            </text>
          </g>

          {/* Iron Wire Coil */}
          <g transform={`translate(250, ${step >= 2 ? 140 : 50})`} style={{ transition: 'all 0.6s ease' }}>
            <line x1="0" y1="-80" x2="0" y2="0" stroke="#94a3b8" strokeWidth="3" />
            <path d="M 0 0 Q 8 6 0 12 Q -8 18 0 24 Q 8 30 0 36" fill="none" 
              stroke={step === 0 ? "#cbd5e1" : step === 1 ? "#ef4444" : step === 2 ? "#fde047" : "#71717a"} 
              strokeWidth="4" 
              style={{ filter: step === 1 || step === 2 ? 'drop-shadow(0 0 12px #f97316)' : 'none' }}
            />
          </g>

          {/* Dense Brown Smoke Particles */}
          {step === 2 && (
            <g>
              <circle cx="230" cy="150" r="28" fill="#7c2d12" opacity="0.6" />
              <circle cx="270" cy="140" r="32" fill="#9a3412" opacity="0.7" />
              <circle cx="250" cy="120" r="35" fill="#c2410c" opacity="0.75" />
              <text x="250" y="50" fill="#f97316" fontSize="14" fontWeight="900" textAnchor="middle" style={{ filter: 'drop-shadow(0 2px 8px #000)' }}>
                🔥 Sắt cháy mạnh tạo KHÓI MÀU NÂU ĐỎ FeCl₃!
              </text>
            </g>
          )}
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>2Fe + 3Cl₂ ➔ 2FeCl₃ (t°)</b>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            Sắt bị oxy hóa bởi khí chlorine tạo muối sắt(III) chloride màu nâu đỏ.
          </div>
        </div>

        <div>
          {step < 3 ? (
            <button onClick={handleNext} style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
              {step === 0 ? '1. Nung nóng đỏ dây sắt' : step === 1 ? '2. Đưa vào bình khí Cl₂' : '3. Rót nước hòa tan FeCl₃'}
            </button>
          ) : (
            <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              🔄 Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Chem9NaH2OSim({ onLog, onSensorUpdate }) {
  const [isReacting, setIsReacting] = useState(false);

  const handleDrop = () => {
    setIsReacting(true);
    playLabSFX('bubble');
    if (onSensorUpdate) onSensorUpdate({ temp: 85.4, ph: 13.8, mass: 149.82 });
    onLog("⚡ Thả mẩu Natri vào nước ➔ Natri nóng chảy chạy nhảy mãnh liệt trên mặt nước, sủi bọt khí H₂, phát ra ngọn lửa màu cam và dung dịch hóa HỒNG TÍM rực rỡ (2Na + 2H₂O ➔ 2NaOH + H₂↑)!");
  };

  const handleReset = () => {
    setIsReacting(false);
    playLabSFX('drop');
    if (onSensorUpdate) onSensorUpdate({ temp: 25.0, ph: 7.0, mass: 150.00 });
    onLog("🔄 Tái lập thí nghiệm Na + H₂O.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{
        flex: 1, background: 'radial-gradient(circle at center, #0b1a29 0%, #030712 100%)',
        borderRadius: '16px', border: '1px solid rgba(236, 72, 153, 0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <defs>
            <linearGradient id="glassBeakerGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="80%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>
          </defs>

          {/* Wooden Bench */}
          <rect x="40" y="270" width="420" height="15" fill="#1e293b" rx="4" />

          {/* Glass Beaker */}
          <g transform="translate(250, 175)">
            {/* Fluid */}
            <path d="M -100 -20 L -100 80 A 15 15 0 0 0 -85 95 L 85 95 A 15 15 0 0 0 100 80 L 100 -20 Z"
              fill={isReacting ? "rgba(236, 72, 153, 0.75)" : "rgba(56, 189, 248, 0.25)"} 
              style={{ transition: 'all 1.2s ease' }} 
            />

            {/* Meniscus Ripple */}
            <ellipse cx="0" cy="-20" rx="100" ry="12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

            {/* Beaker Outline */}
            <path d="M -108 -90 L -104 -80 L -104 80 A 18 18 0 0 0 -86 98 L 86 98 A 18 18 0 0 0 104 80 L 104 -80 L 108 -90 Z"
              fill="url(#glassBeakerGrad)" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" />

            {/* Volumetric Ticks */}
            {[-60, -30, 0, 30, 60].map((y, idx) => (
              <g key={idx}>
                <line x1="-102" y1={y} x2="-88" y2={y} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                <text x="-84" y={y + 4} fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="bold">{(5 - idx) * 50} ml</text>
              </g>
            ))}

            <text x="0" y="45" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" style={{ textShadow: '0 2px 6px #000' }}>
              {isReacting ? "Dung dịch NaOH (Phenolphthalein HỒNG TÍM)" : "Nước cất H₂O + Phenolphthalein"}
            </text>

            {/* Dancing Molten Sodium Sphere & Sparks */}
            {isReacting && (
              <g>
                <ellipse cx="25" cy="-20" rx="12" ry="7" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 16px #fde047)' }} />
                <circle cx="25" cy="-25" r="7" fill="#ef4444" style={{ filter: 'drop-shadow(0 0 10px #f97316)' }} />
                {/* Ascending Gas Bubbles */}
                <circle cx="-30" cy="10" r="4" fill="#ffffff" opacity="0.8" />
                <circle cx="0" cy="-5" r="5" fill="#ffffff" opacity="0.8" />
                <circle cx="45" cy="20" r="3" fill="#ffffff" opacity="0.8" />
                <circle cx="15" cy="-35" r="3" fill="#fde047" />
                <circle cx="35" cy="-30" r="2.5" fill="#ffffff" />
              </g>
            )}
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>2Na + 2H₂O ➔ 2NaOH + H₂↑ (tỏa nhiệt mạnh)</b>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            Natri phản ứng mãnh liệt với nước tạo dung dịch kiềm NaOH làm phenolphthalein hóa hồng.
          </div>
        </div>

        <div>
          {!isReacting ? (
            <button onClick={handleDrop} style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)' }}>
              💥 Thả mẩu Natri vào nước
            </button>
          ) : (
            <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              🔄 Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Chem9FeCuSO4Sim({ onLog, onSensorUpdate }) {
  const [isDipped, setIsDipped] = useState(false);

  const handleDip = () => {
    setIsDipped(true);
    playLabSFX('drop');
    if (onSensorUpdate) onSensorUpdate({ temp: 26.5, ph: 4.5, mass: 125.80 });
    onLog("🔴 Nhúng đinh sắt vào dung dịch CuSO₄ ➔ Kim loại Đồng màu đỏ nâu bám chặt lên đinh sắt, màu xanh lam của dung dịch nhạt dần (Fe + CuSO₄ ➔ FeSO₄ + Cu)!");
  };

  const handleReset = () => {
    setIsDipped(false);
    playLabSFX('drop');
    if (onSensorUpdate) onSensorUpdate({ temp: 25.0, ph: 4.2, mass: 125.00 });
    onLog("🔄 Tái lập thí nghiệm Fe + CuSO₄.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{
        flex: 1, background: 'radial-gradient(circle at center, #0b1a29 0%, #030712 100%)',
        borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="transparent" />

          {/* Test Tube Holder Clamp */}
          <rect x="240" y="30" width="20" height="15" fill="#475569" rx="2" />
          <line x1="250" y1="0" x2="250" y2="40" stroke="#64748b" strokeWidth="4" />

          {/* Test Tube */}
          <g transform="translate(250, 160)">
            <rect x="-35" y="-110" width="70" height="210" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" rx="35" />
            
            {/* CuSO4 / FeSO4 Liquid */}
            <rect x="-31" y="-20" width="62" height="115" 
              fill={isDipped ? "rgba(34, 197, 94, 0.4)" : "rgba(2, 132, 199, 0.75)"} 
              style={{ transition: 'fill 2s ease' }} rx="24" 
            />

            {/* Iron Nail */}
            <g transform={`translate(0, ${isDipped ? 15 : -60})`} style={{ transition: 'all 0.8s ease' }}>
              <rect x="-6" y="-30" width="12" height="75" fill={isDipped ? "#b45309" : "#94a3b8"} rx="2" stroke="#1e293b" strokeWidth="1"
                style={{ filter: isDipped ? 'drop-shadow(0 0 10px #b45309)' : 'none' }} />
              <rect x="-10" y="-35" width="20" height="5" fill="#64748b" rx="1" />
            </g>

            <text x="100" y="30" fill={isDipped ? "#86efac" : "#38bdf8"} fontSize="13" fontWeight="900">
              {isDipped ? "FeSO₄ xanh nhạt + Lớp Cu đỏ nâu bám vào đinh" : "Dung dịch CuSO₄ màu xanh lam"}
            </text>
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>Fe + CuSO₄ ➔ FeSO₄ + Cu↓</b>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            Sắt đẩy đồng ra khỏi dung dịch muối CuSO₄, đồng kim loại màu đỏ nâu bám vào đinh sắt.
          </div>
        </div>

        <div>
          {!isDipped ? (
            <button onClick={handleDip} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
              📌 Nhúng đinh sắt Fe
            </button>
          ) : (
            <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              🔄 Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Chem9SurveyWaterSim({ onLog, onSensorUpdate }) {
  const [tested, setTested] = useState(false);

  const handleTest = () => {
    setTested(true);
    playLabSFX('bubble');
    if (onSensorUpdate) onSensorUpdate({ temp: 35.0, ph: 13.5, mass: 180.00 });
    onLog("🧪 Khảo sát tác dụng với nước: Na phản ứng mãnh liệt sủi bọt H₂ (2Na + 2H₂O ➔ 2NaOH + H₂↑). Fe và Cu KHÔNG phản ứng với nước ở nhiệt độ thường!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />

          {/* 3 Test Tubes: Na, Fe, Cu */}
          {[
            { x: 120, label: 'Ống 1: Natri (Na)', color: tested ? 'rgba(236, 72, 153, 0.6)' : 'rgba(56, 189, 248, 0.2)', active: tested },
            { x: 250, label: 'Ống 2: Sắt (Fe)', color: 'rgba(56, 189, 248, 0.2)', active: false },
            { x: 380, label: 'Ống 3: Đồng (Cu)', color: 'rgba(56, 189, 248, 0.2)', active: false }
          ].map((t, idx) => (
            <g key={idx} transform={`translate(${t.x}, 160)`}>
              <rect x="-22" y="-90" width="44" height="180" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" rx="22" />
              <rect x="-19" y="-10" width="38" height="95" fill={t.color} rx="15" />
              <text x="0" y="110" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">{t.label}</text>
              {t.active && (
                <g>
                  <circle cx="0" cy="-12" r="5" fill="#f59e0b" />
                  <circle cx="-5" cy="-2" r="3" fill="#fff" />
                  <circle cx="6" cy="5" r="2.5" fill="#fff" />
                  <text x="0" y="-30" fill="#ec4899" fontSize="11" fontWeight="900" textAnchor="middle">💥 Phản ứng mạnh!</text>
                </g>
              )}
              {tested && !t.active && (
                <text x="0" y="-30" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">❌ Không phản ứng</text>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            kết luận Dãy hoạt động: <b style={{ color: '#2dd4bf', fontSize: '0.95rem' }}>Na {'>'} H {'>'} Fe, Cu (với Nước)</b>
          </div>
        </div>

        <button onClick={handleTest} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
          🧪 Tiến hành khảo sát Nước
        </button>
      </div>
    </div>
  );
}

function Chem9SurveyHClSim({ onLog, onSensorUpdate }) {
  const [tested, setTested] = useState(false);

  const handleTest = () => {
    setTested(true);
    playLabSFX('bubble');
    if (onSensorUpdate) onSensorUpdate({ temp: 32.0, ph: 1.0, mass: 140.00 });
    onLog("🧪 Khảo sát dung dịch HCl: Fe phản ứng sủi bọt khí H₂ dồn dập (Fe + 2HCl ➔ FeCl₂ + H₂↑). Cu đứng sau H nên KHÔNG phản ứng!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />

          {/* 2 Test Tubes: Fe + HCl, Cu + HCl */}
          {[
            { x: 170, label: 'Ống 1: Đinh Sắt (Fe + HCl)', active: tested, gas: 'H₂↑' },
            { x: 330, label: 'Ống 2: Dây Đồng (Cu + HCl)', active: false, gas: '' }
          ].map((t, idx) => (
            <g key={idx} transform={`translate(${t.x}, 160)`}>
              <rect x="-24" y="-90" width="48" height="180" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" rx="24" />
              <rect x="-20" y="-10" width="40" height="95" fill="rgba(56, 189, 248, 0.2)" rx="16" />
              <text x="0" y="110" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">{t.label}</text>
              {t.active ? (
                <g>
                  <circle cx="0" cy="-20" r="3" fill="#fff" />
                  <circle cx="-6" cy="0" r="4" fill="#fff" />
                  <circle cx="8" cy="15" r="3.5" fill="#fff" />
                  <text x="0" y="-40" fill="#38bdf8" fontSize="12" fontWeight="900" textAnchor="middle">💨 Sủi bọt khí H₂!</text>
                </g>
              ) : tested ? (
                <text x="0" y="-40" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">❌ Không bọt khí</text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>Fe + 2HCl ➔ FeCl₂ + H₂↑ (Cu không phản ứng)</b>
          </div>
        </div>

        <button onClick={handleTest} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
          🧪 Tiến hành khảo sát Acid HCl
        </button>
      </div>
    </div>
  );
}

function Chem9CuAgNO3Sim({ onLog, onSensorUpdate }) {
  const [isDipped, setIsDipped] = useState(false);

  const handleDip = () => {
    setIsDipped(true);
    playLabSFX('drop');
    if (onSensorUpdate) onSensorUpdate({ temp: 27.0, ph: 5.0, mass: 132.50 });
    onLog("✨ Nhúng dây Cu vào AgNO₃ ➔ Tinh thể Bạc màu trắng bạc bám lấp lánh lên dây Cu, dung dịch hóa XANH LAM (Cu + 2AgNO₃ ➔ Cu(NO₃)₂ + 2Ag)!");
  };

  const handleReset = () => {
    setIsDipped(false);
    playLabSFX('drop');
    if (onSensorUpdate) onSensorUpdate({ temp: 25.0, ph: 5.0, mass: 130.00 });
    onLog("🔄 Tái lập thí nghiệm Cu + AgNO₃.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />

          {/* Test Tube */}
          <g transform="translate(250, 160)">
            <rect x="-30" y="-110" width="60" height="210" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" rx="30" />
            <rect x="-26" y="-20" width="52" height="115" 
              fill={isDipped ? "rgba(2, 132, 199, 0.65)" : "rgba(255, 255, 255, 0.15)"} 
              style={{ transition: 'fill 2s ease' }} rx="20" 
            />

            {/* Copper Wire Coil */}
            <path d="M 0 -80 L 0 0 Q 12 10 0 20 Q -12 30 0 40 Q 12 50 0 60" fill="none" 
              stroke={isDipped ? "#e2e8f0" : "#b45309"} strokeWidth="4" 
              style={{ filter: isDipped ? 'drop-shadow(0 0 10px #ffffff)' : 'none' }}
            />

            <text x="80" y="30" fill={isDipped ? "#38bdf8" : "#cbd5e1"} fontSize="13" fontWeight="900">
              {isDipped ? "Bạc (Ag) bám trắng bạc + Cu(NO₃)₂ xanh lam" : "Dung dịch AgNO₃ không màu"}
            </text>
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>Cu + 2AgNO₃ ➔ Cu(NO₃)₂ + 2Ag</b>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            Đồng hoạt động hóa học mạnh hơn Bạc nên đẩy Bạc ra khỏi dung dịch AgNO₃.
          </div>
        </div>

        <div>
          {!isDipped ? (
            <button onClick={handleDip} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
              ✨ Nhúng dây Đồng (Cu)
            </button>
          ) : (
            <button onClick={handleReset} style={{ background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              🔄 Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Chem9CharcoalAdsorptionSim({ onLog, onSensorUpdate }) {
  const [isFiltering, setIsFiltering] = useState(false);

  const handleFilter = () => {
    setIsFiltering(true);
    playLabSFX('drop');
    if (onSensorUpdate) onSensorUpdate({ temp: 25.0, ph: 7.0, mass: 100.00 });
    onLog("💧 Rót nước màu qua cột bột than gỗ ➔ Chất màu bị hấp phụ hoàn toàn, thu được nước TRONG SUỐT trong cốc hứng!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />

          {/* Funnel & Charcoal Layer */}
          <g transform="translate(250, 110)">
            <polygon points="-60,-40 60,-40 10,30 10,70 -10,70 -10,30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
            {/* Charcoal Layer */}
            <polygon points="-40,-15 40,-15 8,25 -8,25" fill="#18181b" />
            <text x="70" y="-10" fill="#cbd5e1" fontSize="12" fontWeight="bold">Bột Than Gỗ (Hấp phụ)</text>
          </g>

          {/* Beaker Below */}
          <g transform="translate(250, 230)">
            <rect x="-50" y="-40" width="100" height="80" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" rx="6" />
            {isFiltering && (
              <rect x="-46" y="0" width="92" height="36" fill="rgba(255, 255, 255, 0.25)" rx="4" />
            )}
            <text x="0" y="20" fill={isFiltering ? "#2dd4bf" : "#94a3b8"} fontSize="12" fontWeight="bold" textAnchor="middle">
              {isFiltering ? "Dịch lọc TRONG SUỐT" : "Cốc hứng dịch lọc"}
            </text>
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            Hiện tượng: <b style={{ color: '#2dd4bf', fontSize: '0.95rem' }}>Than gỗ hấp phụ các chất màu vật lí</b>
          </div>
        </div>

        <button onClick={handleFilter} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
          💧 Rót nước màu qua cột than
        </button>
      </div>
    </div>
  );
}

function Chem9ButaneCombustionSim({ onLog, onSensorUpdate }) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
      playLabSFX('burn');
      if (onSensorUpdate) onSensorUpdate({ temp: 180.0, ph: 7.0, mass: 95.20 });
      onLog("🔥 Đốt ngọn lửa gas Butane và thu sản phẩm cháy vào bình tam giác...");
    } else {
      setStep(2);
      playLabSFX('sizzle');
      if (onSensorUpdate) onSensorUpdate({ temp: 30.0, ph: 6.5, mass: 105.00 });
      onLog("💨 Rót nước vôi trong Ca(OH)₂ vào bình ➔ Nước vôi trong VẨN ĐỤC TRẮNG do tạo kết tủa CaCO₃!");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />

          <g transform="translate(250, 170)">
            <path d="M -30 -60 L -70 60 A 15 15 0 0 0 -55 75 L 55 75 A 15 15 0 0 0 70 60 L 30 -60 Z" 
              fill={step === 2 ? "rgba(255, 255, 255, 0.45)" : "rgba(255,255,255,0.06)"} 
              stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" 
            />
            <text x="0" y="30" fill={step === 2 ? "#ffffff" : "#cbd5e1"} fontSize="12" fontWeight="bold" textAnchor="middle">
              {step === 2 ? "Nước vôi trong VẨN ĐỤC (CaCO₃)" : "Bình sản phẩm cháy"}
            </text>
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>2C₄H₁₀ + 13O₂ ➔ 8CO₂ + 10H₂O; CO₂ + Ca(OH)₂ ➔ CaCO₃↓</b>
          </div>
        </div>

        <button onClick={handleNext} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
          {step === 0 ? '1. Đốt gas Butane' : '2. Thử sản phẩm với nước vôi trong'}
        </button>
      </div>
    </div>
  );
}

function Chem9EthyleneBr2Sim({ onLog, onSensorUpdate }) {
  const [isReacting, setIsReacting] = useState(false);

  const handleReact = () => {
    setIsReacting(true);
    playLabSFX('bubble');
    if (onSensorUpdate) onSensorUpdate({ temp: 26.0, ph: 6.8, mass: 110.50 });
    onLog("🧪 Đun cồn với H₂SO₄ đặc tạo khí Ethylene (C₂H₄) ➔ Khí C₂H₄ sục vào nước Bromine làm MẤT MÀU DA CAM hoàn toàn (C₂H₄ + Br₂ ➔ C₂H₄Br₂)!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />

          {/* Test tube with Bromine Water */}
          <g transform="translate(320, 160)">
            <rect x="-24" y="-80" width="48" height="170" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" rx="24" />
            <rect x="-20" y="-10" width="40" height="90" 
              fill={isReacting ? "rgba(255,255,255,0.15)" : "rgba(249, 115, 22, 0.75)"} 
              style={{ transition: 'fill 1.8s ease' }} rx="16" 
            />
            <text x="0" y="30" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 2px 6px #000' }}>
              {isReacting ? "Bromine MẤT MÀU (Trong suốt)" : "Nước Bromine (Màu da cam)"}
            </text>
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>C₂H₄ + Br₂ ➔ C₂H₄Br₂ (mất màu da cam)</b>
          </div>
        </div>

        <button onClick={handleReact} style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
          ✨ Sục khí Ethylene vào nước Bromine
        </button>
      </div>
    </div>
  );
}

function Chem9AlcoholCombustionSim({ onLog, onSensorUpdate }) {
  const [isBurning, setIsBurning] = useState(false);

  const handleBurn = () => {
    setIsBurning(true);
    playLabSFX('burn');
    if (onSensorUpdate) onSensorUpdate({ temp: 320.0, ph: 7.0, mass: 85.00 });
    onLog("🔥 Châm lửa đốt cồn Ethylic Alcohol ➔ Cồn cháy ngọn lửa màu xanh mờ tỏa nhiều nhiệt (C₂H₅OH + 3O₂ ➔ 2CO₂ + 3H₂O)!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />
          <g transform="translate(250, 200)">
            <ellipse cx="0" cy="20" rx="70" ry="25" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
            <ellipse cx="0" cy="15" rx="55" ry="18" fill="rgba(56, 189, 248, 0.3)" />
            {isBurning && (
              <path d="M 0 15 Q -25 -40 0 -85 Q 25 -40 0 15" fill="#38bdf8" opacity="0.8" style={{ filter: 'drop-shadow(0 0 20px #38bdf8)' }} />
            )}
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>C₂H₅OH + 3O₂ ➔ 2CO₂ + 3H₂O (t°)</b>
          </div>
        </div>

        <button onClick={handleBurn} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
          🔥 Đốt Ethylic Alcohol
        </button>
      </div>
    </div>
  );
}

function Chem9AlcoholNaSim({ onLog, onSensorUpdate }) {
  const [isDropped, setIsDropped] = useState(false);

  const handleDrop = () => {
    setIsDropped(true);
    playLabSFX('bubble');
    if (onSensorUpdate) onSensorUpdate({ temp: 34.0, ph: 9.5, mass: 112.00 });
    onLog("⚡ Thả mẩu Natri vào cồn tuyệt đối ➔ Natri chìm xuống đáy, bọt khí H₂ sủi chậm rải rác (2C₂H₅OH + 2Na ➔ 2C₂H₅ONa + H₂↑)!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />
          <g transform="translate(250, 160)">
            <rect x="-30" y="-100" width="60" height="200" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" rx="30" />
            <rect x="-26" y="-10" width="52" height="100" fill="rgba(56, 189, 248, 0.25)" rx="20" />
            {isDropped && (
              <g>
                <circle cx="0" cy="75" r="7" fill="#cbd5e1" />
                <circle cx="-3" cy="55" r="2.5" fill="#fff" />
                <circle cx="4" cy="35" r="2" fill="#fff" />
                <text x="60" y="80" fill="#38bdf8" fontSize="12" fontWeight="bold">Natri chìm ở đáy, bọt H₂ sủi chậm</text>
              </g>
            )}
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>2C₂H₅OH + 2Na ➔ 2C₂H₅ONa + H₂↑</b>
          </div>
        </div>

        <button onClick={handleDrop} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
          ⚡ Thả Natri vào cồn
        </button>
      </div>
    </div>
  );
}

function Chem9AceticAcidPropertiesSim({ onLog, onSensorUpdate }) {
  const [activeReagent, setActiveReagent] = useState('litmus');

  const handleSelect = (r) => {
    setActiveReagent(r);
    playLabSFX(r === 'litmus' ? 'drop' : r === 'mg' || r === 'caco3' ? 'bubble' : 'sizzle');
    
    if (r === 'litmus') {
      if (onSensorUpdate) onSensorUpdate({ temp: 25.0, ph: 3.2, mass: 120.00 });
      onLog("🔴 Quỳ tím nhúng vào CH₃COOH ➔ Chuyển màu ĐỎ RÕ RỆT (Môi trường Acid pH = 3.2).");
    } else if (r === 'mg') {
      if (onSensorUpdate) onSensorUpdate({ temp: 32.0, ph: 4.5, mass: 119.80 });
      onLog("💨 Thả kim loại Mg vào CH₃COOH ➔ Mg tan dần, sủi bọt khí H₂ dồn dập (2CH₃COOH + Mg ➔ (CH₃COO)₂Mg + H₂↑).");
    } else if (r === 'cuo') {
      if (onSensorUpdate) onSensorUpdate({ temp: 45.0, ph: 4.8, mass: 121.50 });
      onLog("💙 Bột CuO màu đen vào CH₃COOH đun nhẹ ➔ CuO đen tan hết tạo dung dịch màu XANH LAM của (CH₃COO)₂Cu!");
    } else if (r === 'naoh') {
      if (onSensorUpdate) onSensorUpdate({ temp: 28.0, ph: 7.0, mass: 120.00 });
      onLog("🌸 Dung dịch NaOH + Phenolphthalein màu hồng tác dụng CH₃COOH ➔ Dung dịch MẤT MÀU HỒNG (Trung hòa hoàn toàn).");
    } else if (r === 'caco3') {
      if (onSensorUpdate) onSensorUpdate({ temp: 26.5, ph: 5.2, mass: 118.50 });
      onLog("🫧 Cho đá vôi CaCO₃ vào CH₃COOH ➔ Đá vôi tan dần, sủi bọt khí CO₂ sục mãnh liệt!");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 300">
          <rect width="500" height="300" fill="#020617" />
          <g transform="translate(250, 150)">
            <rect x="-40" y="-80" width="80" height="170" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" rx="10" />
            <rect x="-35" y="-10" width="70" height="90" 
              fill={activeReagent === 'cuo' ? "rgba(2, 132, 199, 0.65)" : activeReagent === 'naoh' ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)"} 
              rx="6" 
            />
            {activeReagent === 'litmus' && (
              <rect x="-8" y="-40" width="16" height="90" fill="#ef4444" rx="2" />
            )}
            {activeReagent === 'mg' && (
              <g><circle cx="0" cy="20" r="3" fill="#fff" /><circle cx="-10" cy="40" r="4" fill="#fff" /><text x="0" y="-20" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">Sủi bọt H₂↑</text></g>
            )}
            {activeReagent === 'caco3' && (
              <g><circle cx="5" cy="10" r="4" fill="#fff" /><circle cx="-8" cy="30" r="5" fill="#fff" /><text x="0" y="-20" fill="#fde047" fontSize="12" fontWeight="bold" textAnchor="middle">Sủi bọt CO₂↑</text></g>
            )}
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '12px', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {[
          { id: 'litmus', label: '1. Quỳ tím (Đỏ)' },
          { id: 'mg', label: '2. Kim loại Mg (Sủi H₂)' },
          { id: 'cuo', label: '3. Bột CuO (Dung dịch Xanh)' },
          { id: 'naoh', label: '4. NaOH + Ph (Mất màu hồng)' },
          { id: 'caco3', label: '5. Đá vôi CaCO₃ (Sủi CO₂)' }
        ].map(b => (
          <button key={b.id} onClick={() => handleSelect(b.id)} style={{ background: activeReagent === b.id ? '#0d9488' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Chem9GlucoseSilverMirrorSim({ onLog, onSensorUpdate }) {
  const [isMirrored, setIsMirrored] = useState(false);

  const handleWarm = () => {
    setIsMirrored(true);
    playLabSFX('drop');
    if (onSensorUpdate) onSensorUpdate({ temp: 75.0, ph: 9.0, mass: 115.00 });
    onLog("✨ Ngâm ống nghiệm chứa Glucose + AgNO₃/NH₃ vào cốc nước nóng 75°C ➔ Lớp BẠC KIM LOẠI sáng bóng như gương bám chặt rực rỡ lên thành ống nghiệm!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(253, 224, 71, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />
          <g transform="translate(250, 160)">
            <rect x="-30" y="-110" width="60" height="210" 
              fill={isMirrored ? "url(#beakerGrad)" : "rgba(255,255,255,0.05)"} 
              stroke={isMirrored ? "#ffffff" : "rgba(255,255,255,0.4)"} 
              strokeWidth="3" rx="30" 
              style={{ filter: isMirrored ? 'drop-shadow(0 0 25px #ffffff)' : 'none', transition: 'all 1.5s ease' }} 
            />
            <text x="0" y="-20" fill={isMirrored ? "#ffffff" : "#cbd5e1"} fontSize="13" fontWeight="900" textAnchor="middle">
              {isMirrored ? "LỚP BẠC TRÁNG GƯƠNG SÁNG BÓNG!" : "Glucose + AgNO₃/NH₃"}
            </text>
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>C₆H₁₂O₆ + Ag₂O ➔ C₆H₁₂O₇ + 2Ag↓ (tráng bạc)</b>
          </div>
        </div>

        <button onClick={handleWarm} style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', color: '#000', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer' }}>
          ✨ Ngâm nước nóng (Tráng Bạc)
        </button>
      </div>
    </div>
  );
}

function Chem9StarchIodineSim({ onLog }) {
  const [state, setState] = useState('raw'); // 'raw', 'blue', 'heated'

  const handleAddIodine = () => {
    setState('blue');
    onLog("🔵 Nhỏ dung dịch Iodine vào Hồ tinh bột ➔ Dung dịch lập tức xuất hiện màu XANH TÍM đặc trưng!");
  };

  const handleHeat = () => {
    if (state === 'blue') {
      setState('heated');
      onLog("🔥 Đun nóng ống nghiệm ➔ Màu xanh tím BIẾN MẤT (Trở lại trong suốt). Để nguội màu xanh tím hiện lại!");
    } else {
      setState('blue');
      onLog("❄️ Để nguội ống nghiệm ➔ Màu XANH TÍM tái xuất hiện trở lại!");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />
          <g transform="translate(250, 160)">
            <rect x="-30" y="-110" width="60" height="210" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" rx="30" />
            <rect x="-26" y="-20" width="52" height="115" 
              fill={state === 'blue' ? "rgba(79, 70, 229, 0.85)" : "rgba(255, 255, 255, 0.2)"} 
              style={{ transition: 'fill 1s ease' }} rx="20" 
            />
            <text x="0" y="30" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">
              {state === 'blue' ? "MÀU XANH TÍM ĐẶC TRƯNG" : state === 'heated' ? "Mất màu khi đun nóng" : "Hồ Tinh Bột trong suốt"}
            </text>
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            Hiện tượng: <b style={{ color: '#818cf8', fontSize: '0.95rem' }}>Tinh bột + Iodine ➔ Phức màu Xanh Tím</b>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {state === 'raw' ? (
            <button onClick={handleAddIodine} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
              🔵 Nhỏ Iodine (Hiện Xanh Tím)
            </button>
          ) : (
            <button onClick={handleHeat} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
              {state === 'blue' ? '🔥 Đun nóng (Mất màu)' : '❄️ Để nguội (Hiện Xanh Tím)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Chem9StarchHydrolysisSim({ onLog }) {
  const [tested, setTested] = useState(false);

  const handleHydrolyze = () => {
    setTested(true);
    onLog("🧪 Thủy phân Tinh bột với HCl đun nóng 10 phút -> Thử Iodine: Ống 2 (đối chứng) hiện màu XANH TÍM. Ống 1 (đã thủy phân) KHÔNG hiện màu xanh tím do tinh bột đã biến thành Glucose!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(13, 148, 136, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 320">
          <rect width="500" height="320" fill="#020617" />
          <g transform="translate(170, 160)">
            <rect x="-24" y="-80" width="48" height="170" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" rx="24" />
            <rect x="-20" y="-10" width="40" height="90" fill="rgba(255,255,255,0.2)" rx="16" />
            <text x="0" y="110" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">Ống 1: Tinh bột + HCl (Thủy phân)</text>
            {tested && <text x="0" y="-30" fill="#2dd4bf" fontSize="11" fontWeight="900" textAnchor="middle">❌ Không đổi màu (Glucose)</text>}
          </g>
          <g transform="translate(330, 160)">
            <rect x="-24" y="-80" width="48" height="170" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" rx="24" />
            <rect x="-20" y="-10" width="40" height="90" fill={tested ? "rgba(79, 70, 229, 0.85)" : "rgba(255, 255, 255, 0.2)"} rx="16" />
            <text x="0" y="110" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">Ống 2: Tinh bột (Đối chứng)</text>
            {tested && <text x="0" y="-30" fill="#818cf8" fontSize="11" fontWeight="900" textAnchor="middle">🔵 XANH TÍM</text>}
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>
            PTHH: <b style={{ color: '#fde047', fontSize: '0.95rem' }}>(C₆H₁₀O₅)♮ + nH₂O ➔ nC₆H₁₂O₆ (HCl, t°)</b>
          </div>
        </div>

        <button onClick={handleHydrolyze} style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
          🧪 Đun thủy phân & Thử Iodine
        </button>
      </div>
    </div>
  );
}

function Chem9ProteinPropertiesSim({ onLog }) {
  const [activeOpt, setActiveOpt] = useState('raw');

  const handleSelect = (opt) => {
    setActiveOpt(opt);
    if (opt === 'acid') onLog("⚪ Thêm HCl vào lòng trắng trứng ➔ Protein bị đông tụ vón cục màu trắng!");
    if (opt === 'heat') onLog("🔥 Đun nóng nhẹ lòng trắng trứng ➔ Protein biến tính và đông tụ đóng bánh trắng!");
    if (opt === 'burn') onLog("💨 Đun khô cháy Protein ➔ Bốc khói đen và tỏa MÙI KHÉT ĐẶC TRƯNG như cháy tóc!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div style={{ flex: 1, background: '#020617', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 300">
          <rect width="500" height="300" fill="#020617" />
          <g transform="translate(250, 150)">
            <rect x="-35" y="-80" width="70" height="170" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" rx="12" />
            <rect x="-30" y="-10" width="60" height="90" 
              fill={activeOpt === 'burn' ? "#18181b" : activeOpt !== 'raw' ? "rgba(248, 250, 252, 0.85)" : "rgba(255, 255, 255, 0.25)"} 
              rx="8" 
            />
            {activeOpt === 'burn' && (
              <g><circle cx="0" cy="-40" r="25" fill="#3f3f46" opacity="0.6" /><text x="0" y="-20" fill="#ef4444" fontSize="12" fontWeight="900" textAnchor="middle">💨 MÙI KHÉT ĐẮC TRƯNG!</text></g>
            )}
            {activeOpt === 'acid' && (
              <text x="0" y="-30" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">Đông tụ Acid (Trắng)</text>
            )}
            {activeOpt === 'heat' && (
              <text x="0" y="-30" fill="#fde047" fontSize="12" fontWeight="bold" textAnchor="middle">Đông tụ Nhiệt (Đóng bánh)</text>
            )}
          </g>
        </svg>
      </div>

      <div style={{ background: 'rgba(15, 23, 42, 0.95)', padding: '12px', borderRadius: '16px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => handleSelect('acid')} style={{ background: activeOpt === 'acid' ? '#0284c7' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
          ⚪ 1. Thêm Acid HCl (Đông tụ)
        </button>
        <button onClick={() => handleSelect('heat')} style={{ background: activeOpt === 'heat' ? '#d97706' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
          🔥 2. Đun nóng nhẹ (Đông tụ)
        </button>
        <button onClick={() => handleSelect('burn')} style={{ background: activeOpt === 'burn' ? '#dc2626' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
          💨 3. Đun khô cháy (Mùi khét)
        </button>
      </div>
    </div>
  );
}

// --- NOBOOK 3D INTERACTIVE LAB SUB-COMPONENTS (Rule 1 compliance) ---

function ScissorJackAssembly({ x = 200, y = 280, jackHeight = 0.5, onHeightChange, scale = 1 }) {
  const currentHeightPx = 20 + jackHeight * 50;
  const topY = y - currentHeightPx;
  const midY = (y + topY) / 2;

  return (
    <g transform={`translate(${x}, 0) scale(${scale})`}>
      {/* Base Plate */}
      <rect x="-45" y={y + 8} width="90" height="8" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
      <rect x="-40" y={y + 4} width="80" height="4" fill="#475569" />

      {/* Threaded Screw Rod & Adjustment Knob */}
      <line x1="-38" y1={midY} x2="42" y2={midY} stroke="#94a3b8" strokeWidth="3" strokeDasharray="2,2" />
      <circle 
        cx="44" cy={midY} r="7" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" 
        style={{ cursor: 'pointer' }}
        onClick={() => onHeightChange && onHeightChange(jackHeight >= 0.8 ? 0.2 : jackHeight + 0.3)}
      />

      {/* Scissor Arm Linkages (X Arms) */}
      <line x1="-35" y1={y + 4} x2="35" y2={topY} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      <line x1="35" y1={y + 4} x2="-35" y2={topY} stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      
      <circle cx="0" cy={midY} r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
      <circle cx="-35" cy={y + 4} r="2.5" fill="#475569" />
      <circle cx="35" cy={y + 4} r="2.5" fill="#475569" />
      <circle cx="-35" cy={topY} r="2.5" fill="#475569" />
      <circle cx="35" cy={topY} r="2.5" fill="#475569" />

      {/* Top Elevator Platform */}
      <rect x="-45" y={topY - 6} width="90" height="6" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="-42" y={topY - 10} width="84" height="4" fill="#64748b" />
    </g>
  );
}

function MatchBoxAndStickAssembly({ x = 320, y = 320, isMatchLit = false, onStrikeMatch, scale = 1 }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Matchbox Body */}
      <g style={{ cursor: 'pointer' }} onClick={onStrikeMatch}>
        <rect x="-40" y="0" width="80" height="38" rx="4" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
        <rect x="-40" y="26" width="80" height="12" fill="#78350f" rx="1" />
        <path d="M -38 28 L 38 28 M -38 32 L 38 32 M -38 36 L 38 36" stroke="#451a03" strokeWidth="1" />
        <rect x="-35" y="4" width="70" height="18" rx="2" fill="#2563eb" />
        <text x="0" y="16" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
          HỘP DIỄM THÍ NGHIỆM
        </text>
      </g>

      {/* Match Stick */}
      <g transform={isMatchLit ? "rotate(-40, 20, -10)" : "rotate(-12, 20, 0)"} style={{ cursor: 'pointer' }} onClick={onStrikeMatch}>
        <rect x="10" y="-4" width="60" height="6" rx="1" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
        <ellipse cx="72" cy="-1" rx="5" ry="4" fill="#dc2626" />

        {isMatchLit && (
          <g transform="translate(74, -1)">
            <path d="M 0 0 Q -10 -15 0 -35 Q 10 -15 0 0 Z" fill="url(#alcoholFlameOuterGrad)" style={{ filter: 'drop-shadow(0 0 10px #f97316)' }} />
            <path d="M 0 0 Q -4 -8 0 -18 Q 4 -8 0 0 Z" fill="#fef08a" />
            <path d="M 0 -35 Q 5 -50 -2 -65" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" strokeDasharray="3,3" />
          </g>
        )}
      </g>
    </g>
  );
}

function SpatulaToolAssembly({ x = 460, y = 310, powderAmount = 15, onScoop, scale = 1 }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} style={{ cursor: 'pointer' }} onClick={onScoop}>
      <rect x="-60" y="-3" width="70" height="6" rx="3" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
      <rect x="10" y="-2" width="40" height="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
      <path d="M 50 -2 L 80 -6 C 88 -6, 88 6, 80 6 L 50 2 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
      
      {powderAmount > 0 && (
        <ellipse cx="70" cy="-1" rx="9" ry="4" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
      )}

      <rect x="-10" y="-24" width="90" height="16" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#991b1b" strokeWidth="1" />
      <text x="35" y="-13" fill="#fca5a5" fontSize="8.5" fontWeight="900" textAnchor="middle">
        Spatula Fe₂O₃ ({powderAmount}g)
      </text>
    </g>
  );
}

function ApparatusPopoverMenu({ x = 300, y = 200, title = "Large hard-glass tube", toggles = {}, onToggle, onOpenMicroscope, onDelete, onClose }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      transform: 'translate(-50%, -105%)',
      background: 'rgba(15, 23, 42, 0.96)',
      backdropFilter: 'blur(16px)',
      border: '1.5px solid rgba(56, 189, 248, 0.6)',
      borderRadius: '16px',
      padding: '12px 16px',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.25)',
      zIndex: 100,
      minWidth: '220px',
      userSelect: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.02em' }}>
          {title}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <button 
          onClick={() => onToggle('temp')}
          style={{
            background: toggles.temp ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
            border: toggles.temp ? '1px solid #38bdf8' : '1px solid #334155',
            color: toggles.temp ? '#ffffff' : '#cbd5e1',
            borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
          }}
        >
          Temperature
        </button>

        <button 
          onClick={() => onToggle('vol')}
          style={{
            background: toggles.vol ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
            border: toggles.vol ? '1px solid #38bdf8' : '1px solid #334155',
            color: toggles.vol ? '#ffffff' : '#cbd5e1',
            borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
          }}
        >
          Volume
        </button>

        <button 
          onClick={() => onToggle('aos')}
          style={{
            background: toggles.aos ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
            border: toggles.aos ? '1px solid #38bdf8' : '1px solid #334155',
            color: toggles.aos ? '#ffffff' : '#cbd5e1',
            borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
          }}
        >
          AoS (Mol/m)
        </button>

        <button 
          onClick={() => onToggle('eq')}
          style={{
            background: toggles.eq ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
            border: toggles.eq ? '1px solid #38bdf8' : '1px solid #334155',
            color: toggles.eq ? '#ffffff' : '#cbd5e1',
            borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
          }}
        >
          Equation
        </button>

        <button 
          onClick={() => onToggle('mass')}
          style={{
            background: toggles.mass ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
            border: toggles.mass ? '1px solid #38bdf8' : '1px solid #334155',
            color: toggles.mass ? '#ffffff' : '#cbd5e1',
            borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
          }}
        >
          Mass
        </button>

        {onOpenMicroscope && (
          <button 
            onClick={onOpenMicroscope}
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
              border: '1px solid #a855f7',
              color: '#ffffff',
              borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            🔬 Microscope
          </button>
        )}
      </div>

      <button 
        onClick={onDelete}
        style={{
          width: '100%', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444',
          color: '#fca5a5', borderRadius: '8px', padding: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'
        }}
      >
        🗑️ Reset / Refill
      </button>
    </div>
  );
}

function MicroscopeModalWindow({ isOpen, onClose, temp = 25, isReacting = false }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      left: '16px',
      top: '16px',
      width: '280px',
      background: 'rgba(9, 14, 30, 0.96)',
      backdropFilter: 'blur(16px)',
      border: '2px solid #a855f7',
      borderRadius: '16px',
      padding: '14px',
      boxShadow: '0 16px 40px rgba(0,0,0,0.8), 0 0 25px rgba(168, 85, 247, 0.3)',
      zIndex: 120
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#e9d5ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🔬 KÍNH HIỂN VI PHÂN TỬ
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{
        width: '100%', height: '140px', background: '#020617', borderRadius: '12px',
        border: '1px solid rgba(168, 85, 247, 0.4)', position: 'relative', overflow: 'hidden'
      }}>
        <svg width="100%" height="100%" viewBox="0 0 250 140">
          <defs>
            <radialGradient id="feAtomGrad" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
            <radialGradient id="coMoleculeGrad" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>
          </defs>

          <g transform="translate(125, 70)">
            {/* Fe Atoms */}
            <circle cx="-30" cy="-20" r="10" fill="url(#feAtomGrad)" stroke="#fbbf24" strokeWidth="1" />
            <circle cx="30" cy="-20" r="10" fill="url(#feAtomGrad)" stroke="#fbbf24" strokeWidth="1" />
            <circle cx="0" cy="25" r="10" fill="url(#feAtomGrad)" stroke="#fbbf24" strokeWidth="1" />

            {/* O Atoms (Red) */}
            <circle cx="-15" cy="-35" r="7" fill="#ef4444" />
            <circle cx="15" cy="-35" r="7" fill="#ef4444" />
            <circle cx="0" cy="-10" r="7" fill="#ef4444" />

            <g className="co-molecules">
              <g transform="translate(-70, 0)">
                <circle cx="-6" cy="0" r="8" fill="url(#coMoleculeGrad)" />
                <circle cx="6" cy="0" r="7" fill="#ef4444" />
                <text x="0" y="14" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">CO</text>
              </g>
              {isReacting && (
                <g transform="translate(70, -30)">
                  <circle cx="0" cy="0" r="7" fill="#475569" />
                  <circle cx="-10" cy="0" r="6" fill="#ef4444" />
                  <circle cx="10" cy="0" r="6" fill="#ef4444" />
                  <text x="0" y="14" fill="#a855f7" fontSize="8" fontWeight="bold" textAnchor="middle">CO₂</text>
                </g>
              )}
            </g>
          </g>
        </svg>
      </div>

      <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Phân tử CO:</span>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>2.337 × 10⁻³ mol</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Mạng tinh thể Fe₂O₃:</span>
          <span style={{ color: isReacting ? '#ef4444' : '#fde047', fontWeight: 'bold' }}>
            {isReacting ? 'Đang bị CO chiếm O₂...' : '15.00 g (9.39 × 10⁻² mol)'}
          </span>
        </div>
        {isReacting && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Sắt kim loại (Fe):</span>
            <span style={{ color: '#4ade80', fontWeight: 'bold' }}>10.50 g (Mới sinh)</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Chem9Fe2O3COSim({ onLog, onSensorUpdate }) {
  const [fe2o3Amount, setFe2o3Amount] = useState(15);
  const [isPowderInTube, setIsPowderInTube] = useState(true);
  const [jackHeight, setJackHeight] = useState(0.6);
  const [isMatchLit, setIsMatchLit] = useState(false);
  const [isBurnerOn, setIsBurnerOn] = useState(false);
  const [isGasFlowOn, setIsGasFlowOn] = useState(false);
  const [temp, setTemp] = useState(25.0);
  const [reactionProgress, setReactionProgress] = useState(0.0);
  const [activePopover, setActivePopover] = useState(null);
  const [showMicroscope, setShowMicroscope] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [toggles, setToggles] = useState({ temp: true, vol: true, aos: true, eq: true, mass: true });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStrikeMatch = () => {
    setIsMatchLit(true);
    if (onLog) onLog("🔥 Đã quẹt diêm! Ngọn lửa diêm bùng cháy.");
  };

  const handleToggleBurner = () => {
    if (!isMatchLit && !isBurnerOn) {
      if (onLog) onLog("⚠️ Bạn cần quẹt diêm thắp lửa trước khi đốt đèn cồn!");
      return;
    }
    const next = !isBurnerOn;
    setIsBurnerOn(next);
    if (next && onLog) onLog("🔥 Ngọn lửa đèn cồn bùng cháy dưới ống nghiệm!");
  };

  const handleToggleGas = () => {
    const next = !isGasFlowOn;
    setIsGasFlowOn(next);
    if (next && onLog) onLog("💨 Đã mở van xả! Dòng khí Carbon Monoxide (CO) bắt đầu thổi qua ống nghiệm.");
  };

  const handleScoopPowder = () => {
    setIsPowderInTube(true);
    if (onLog) onLog(`🥄 Thìa Spatula đong ${fe2o3Amount}g bột Fe₂O₃ đỏ nâu cho vào ống thủy tinh.`);
  };

  const handleReset = () => {
    setFe2o3Amount(15);
    setIsPowderInTube(true);
    setJackHeight(0.6);
    setIsMatchLit(false);
    setIsBurnerOn(false);
    setIsGasFlowOn(false);
    setTemp(25.0);
    setReactionProgress(0.0);
    setActivePopover(null);
    setShowMicroscope(false);
    if (onLog) onLog("🔄 Đã làm mới phòng thí nghiệm ảo về trạng thái ban đầu.");
  };

  // Heating & Reaction Kinetics Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Heating
      if (isBurnerOn && jackHeight > 0.35) {
        setTemp(prev => {
          const next = Math.min(600.0, prev + 12.5);
          return next;
        });
      } else {
        setTemp(prev => Math.max(25.0, prev - 8.0));
      }

      // Reaction
      if (temp > 350.0 && isGasFlowOn && isPowderInTube) {
        setReactionProgress(prev => {
          const next = Math.min(1.0, prev + 0.05);
          if (next >= 1.0 && prev < 1.0 && onLog) {
            onLog("⚡ PHẢN ỨNG HOÀN TOÀN: Bột Fe₂O₃ màu đỏ nâu đã bị khí CO khử hoàn toàn thành bột sắt Fe xám đen! Khí CO₂ làm đục nước vôi trong Ca(OH)₂.");
          }
          return next;
        });
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isBurnerOn, jackHeight, temp, isGasFlowOn, isPowderInTube, onLog]);

  useEffect(() => {
    if (onSensorUpdate) {
      onSensorUpdate({
        temp: temp,
        ph: reactionProgress > 0.3 ? 8.2 : 7.0,
        mass: 15.0 - (reactionProgress * 4.5)
      });
    }
  }, [temp, reactionProgress, onSensorUpdate]);

  // Interpolated powder color: #991b1b (red-brown) to #1e293b (metallic dark grey/black)
  const powderColor = reactionProgress > 0.8 ? '#1e293b' : reactionProgress > 0.4 ? '#571c26' : '#991b1b';
  const limewaterOpacity = 0.3 + (reactionProgress * 0.65);
  const burnerY = 270 - (jackHeight * 45);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px', background: '#070f1e', borderRadius: '16px', border: '1.5px solid rgba(56, 189, 248, 0.4)', padding: '12px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Top Floating Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px 14px', borderRadius: '12px', flexWrap: 'wrap', gap: '8px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🧪 KHỬ Fe₂O₃ BẰNG KHÍ CO (GDPT 2018)
          </span>
          <span style={{ fontSize: '0.75rem', color: temp > 400 ? '#ef4444' : temp > 100 ? '#f59e0b' : '#38bdf8', fontWeight: 'bold', fontFamily: 'monospace' }}>
            Nhiệt độ: {temp.toFixed(1)} °C
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={handleScoopPowder} style={{ background: '#991b1b', border: '1px solid #fca5a5', color: '#fff', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
            🥄 Thìa Fe₂O₃
          </button>
          <button onClick={handleStrikeMatch} style={{ background: isMatchLit ? '#eab308' : '#3b82f6', border: 'none', color: '#fff', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
            🔥 {isMatchLit ? 'Diêm đang cháy' : 'Quẹt Diêm'}
          </button>
          <button onClick={handleToggleBurner} style={{ background: isBurnerOn ? '#dc2626' : '#1e293b', border: '1px solid #ef4444', color: '#fff', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
            🕯️ {isBurnerOn ? 'Tắt Đèn Cồn' : 'Đốt Đèn Cồn'}
          </button>
          <button onClick={handleToggleGas} style={{ background: isGasFlowOn ? '#0284c7' : '#1e293b', border: '1px solid #38bdf8', color: '#fff', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
            💨 {isGasFlowOn ? 'Khí CO: BẬT' : 'Mở Khí CO'}
          </button>
          <button onClick={() => setShowMicroscope(!showMicroscope)} style={{ background: '#7c3aed', border: '1px solid #a855f7', color: '#fff', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>
            🔬 Kính hiển vi
          </button>
          <button onClick={handleReset} style={{ background: '#334155', border: '1px solid #64748b', color: '#cbd5e1', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Main 3D Virtual Canvas Window */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', background: '#030816', borderRadius: '12px', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="hardGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="30%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>

            <linearGradient id="limewaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(224, 242, 254, 0.8)" />
              <stop offset="100%" stopColor="rgba(186, 230, 253, 0.4)" />
            </linearGradient>

            <filter id="glowHeat">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background Grid Pattern */}
          <rect width="800" height="420" fill="#030816" />
          <path d="M 0 50 L 800 50 M 0 100 L 800 100 M 0 150 L 800 150 M 0 200 L 800 200 M 0 250 L 800 250 M 0 300 L 800 300 M 0 350 L 800 350" stroke="rgba(30, 58, 138, 0.2)" strokeWidth="1" strokeDasharray="4,4" />

          {/* 1. LEFT RETORT STAND (Giá kẹp thí nghiệm 1) */}
          <g transform="translate(140, 360)">
            <rect x="-40" y="0" width="80" height="12" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <rect x="-4" y="-280" width="8" height="280" fill="#64748b" stroke="#475569" strokeWidth="1" />
            {/* Clamp Bosshead */}
            <rect x="-10" y="-195" width="20" height="14" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {/* Clamp Jaws holding glass tube */}
            <path d="M -10 -188 L -25 -188 L -25 -170 L 15 -170 L 15 -188 L 0 -188" stroke="#cbd5e1" strokeWidth="3" fill="none" />
          </g>

          {/* 2. RIGHT RETORT STAND (Giá kẹp thí nghiệm 2) */}
          <g transform="translate(440, 360)">
            <rect x="-40" y="0" width="80" height="12" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <rect x="-4" y="-280" width="8" height="280" fill="#64748b" stroke="#475569" strokeWidth="1" />
            <rect x="-10" y="-195" width="20" height="14" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <path d="M -10 -188 L -25 -188 L -25 -170 L 15 -170 L 15 -188 L 0 -188" stroke="#cbd5e1" strokeWidth="3" fill="none" />
          </g>

          {/* 3. CO GAS SUPPLY CYLINDER (Bình chứa khí CO) */}
          <g transform="translate(60, 260)" style={{ cursor: 'pointer' }} onClick={() => setActivePopover('cylinder')}>
            <rect x="-25" y="0" width="50" height="100" rx="12" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <rect x="-12" y="-14" width="24" height="14" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <circle cx="0" cy="-20" r="8" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" onClick={handleToggleGas} />
            <text x="0" y="55" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">CO (g)</text>
            <text x="0" y="72" fill="#bae6fd" fontSize="9" fontWeight="bold" textAnchor="middle">{isGasFlowOn ? '💨 BẬT' : 'TẮT'}</text>
          </g>

          {/* CO Gas Rubber Hose to Tube */}
          <path d="M 60 240 Q 60 178 120 178" stroke="#38bdf8" strokeWidth="5" fill="none" strokeDasharray={isGasFlowOn ? "6,3" : "none"} />

          {/* 4. SCISSOR JACK LIFT & ALCOHOL BURNER */}
          <ScissorJackAssembly x={280} y={350} jackHeight={jackHeight} onHeightChange={setJackHeight} />
          <g transform={`translate(280, ${burnerY})`} style={{ cursor: 'pointer' }} onClick={() => setActivePopover('burner')}>
            <AlcoholLampAssembly x={0} y={0} isHeating={isBurnerOn} temp={temp} />
          </g>

          {/* 5. HORIZONTAL HARD GLASS TUBE (Ống thủy tinh chịu nhiệt) */}
          <g transform="translate(120, 160)" style={{ cursor: 'pointer' }} onClick={() => setActivePopover('tube')}>
            {/* Rubber Stopper Left */}
            <rect x="-5" y="6" width="16" height="24" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
            
            {/* Main Glass Tube Body */}
            <rect x="10" y="4" width="340" height="28" rx="14" fill="url(#hardGlassGrad)" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
            
            {/* Fe2O3 / Fe Powder Mound inside tube */}
            {isPowderInTube && (
              <path d="M 120 30 Q 170 14 220 30 Z" fill={powderColor} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
            )}

            {/* Glowing Red Heat Area when heating */}
            {temp > 300 && (
              <rect x="110" y="2" width="120" height="32" rx="16" fill="rgba(239, 68, 68, 0.25)" filter="url(#glowHeat)" />
            )}

            {/* Dynamic Gas Flow Stream inside tube */}
            {isGasFlowOn && (
              <path d="M 10 18 L 340 18" stroke="rgba(56, 189, 248, 0.6)" strokeWidth="2" strokeDasharray="8,6" style={{ animation: 'gasStreamFlow 0.5s infinite linear' }} />
            )}

            {/* Rubber Stopper Right */}
            <rect x="345" y="6" width="16" height="24" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          </g>

          {/* 6. DELIVERY GLASS TUBE TO LIMEWATER TEST TUBE */}
          <path d="M 480 178 L 560 178 L 560 260" stroke="rgba(255,255,255,0.8)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* 7. LIMEWATER TEST TUBE & RACK (Ống nghiệm đựng Ca(OH)2) */}
          <g transform="translate(560, 240)" style={{ cursor: 'pointer' }} onClick={() => setActivePopover('testtube')}>
            {/* Test Tube Holder Stand */}
            <rect x="-30" y="110" width="60" height="10" fill="#334155" rx="2" />
            <rect x="-4" y="0" width="8" height="110" fill="#475569" />
            <rect x="-25" y="20" width="50" height="8" rx="2" fill="#64748b" />

            {/* Glass Test Tube Body */}
            <rect x="-18" y="0" width="36" height="100" rx="18" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
            
            {/* Ca(OH)2 / CaCO3 Solution Liquid */}
            <rect x="-16" y="30" width="32" height="68" rx="14" fill={reactionProgress > 0.4 ? "#f8fafc" : "url(#limewaterGrad)"} opacity={limewaterOpacity} />
            
            {/* Gas Bubbles escaping delivery tube in liquid */}
            {reactionProgress > 0.05 && (
              <g className="gas-bubbles">
                <circle cx="0" cy="80" r="3" fill="#ffffff" opacity="0.8" />
                <circle cx="-6" cy="65" r="4" fill="#ffffff" opacity="0.7" />
                <circle cx="5" cy="50" r="3" fill="#ffffff" opacity="0.9" />
              </g>
            )}

            <text x="0" y="128" fill="#e2e8f0" fontSize="10" fontWeight="900" textAnchor="middle">
              Ca(OH)₂ (Nước vôi trong)
            </text>
          </g>

          {/* 8. TOOLS & REAGENTS TABLE SHELF */}
          <rect x="0" y="372" width="800" height="48" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />

          <MatchBoxAndStickAssembly x={670} y={350} isMatchLit={isMatchLit} onStrikeMatch={handleStrikeMatch} />
          <SpatulaToolAssembly x={500} y={360} powderAmount={fe2o3Amount} onScoop={handleScoopPowder} />

          {/* Floating Chemical Equations on Canvas */}
          {toggles.eq && (
            <g transform="translate(180, 115)">
              <rect x="-10" y="-18" width="320" height="24" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="#38bdf8" strokeWidth="1" />
              <text x="150" y="-2" fill="#38bdf8" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                Fe₂O₃ + 3CO ──t°──➔ 2Fe + 3CO₂
              </text>
            </g>
          )}

          {toggles.eq && (
            <g transform="translate(560, 210)">
              <rect x="-105" y="-18" width="210" height="24" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="#a855f7" strokeWidth="1" />
              <text x="0" y="-2" fill="#c084fc" fontSize="10" fontWeight="900" textAnchor="middle">
                Ca(OH)₂ + CO₂ ➔ CaCO₃↓ + H₂O
              </text>
            </g>
          )}

          {/* Floating AoS Real-Time Stats Card */}
          {toggles.aos && (
            <g transform="translate(300, 40)">
              <rect x="0" y="0" width="200" height="65" rx="8" fill="rgba(15, 23, 42, 0.9)" stroke="#0284c7" strokeWidth="1.5" />
              <text x="10" y="16" fill="#fde047" fontSize="9.5" fontWeight="bold">Fe₂O₃(s): m = 15.00g, n = 9.39 × 10⁻² mol</text>
              <text x="10" y="32" fill="#38bdf8" fontSize="9.5" fontWeight="bold">CO(g): temp = {temp.toFixed(0)}°C, p = 107.9 kPa</text>
              <text x="10" y="48" fill="#4ade80" fontSize="9.5" fontWeight="bold">Fe(s): m = {(reactionProgress * 10.5).toFixed(2)}g, n = {(reactionProgress * 0.18).toFixed(2)} mol</text>
            </g>
          )}
        </svg>

        {/* Interactive Popover Menu Window */}
        {activePopover === 'tube' && (
          <ApparatusPopoverMenu 
            x={320} y={170} 
            title="Large hard-glass tube (Ống thủy tinh chịu nhiệt)" 
            toggles={toggles} 
            onToggle={handleToggle}
            onOpenMicroscope={() => setShowMicroscope(true)}
            onDelete={handleReset}
            onClose={() => setActivePopover(null)}
          />
        )}

        {activePopover === 'testtube' && (
          <ApparatusPopoverMenu 
            x={640} y={230} 
            title="Large test tube (Ống nghiệm Ca(OH)₂)" 
            toggles={toggles} 
            onToggle={handleToggle}
            onOpenMicroscope={() => setShowMicroscope(true)}
            onDelete={handleReset}
            onClose={() => setActivePopover(null)}
          />
        )}

        {/* Microscope Floating Modal */}
        <MicroscopeModalWindow 
          isOpen={showMicroscope} 
          onClose={() => setShowMicroscope(false)} 
          temp={temp} 
          isReacting={reactionProgress > 0.05} 
        />
      </div>
    </div>
  );
}



class SimErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Simulation Rendering Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09131d',
          borderRadius: '16px',
          border: '1.5px solid rgba(13, 148, 136, 0.4)',
          padding: '28px',
          color: '#f8fafc',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚙️</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8', marginBottom: '8px' }}>
            Mô Phỏng Trực Quan Nâng Cao
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '420px', marginBottom: '18px', lineHeight: 1.5 }}>
            Hệ thống đang tự động tối ưu hóa hiệu năng đồ họa 3D/Interactive cho thiết bị. Vui lòng bấm nút bên dưới để khởi chạy lại mô hình.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(13, 148, 136, 0.4)'
            }}
          >
            🔄 Tải Lại Mô Phỏng
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const isGeoExperiment = (exp) => {
  if (!exp) return false;
  if (exp.isGeo) return true;
  
  const sub = String(exp.subject || '').toLowerCase();
  const cat = String(exp.category || exp.subjectCategory || '').toLowerCase();
  const title = String(exp.title || '').toLowerCase();
  const type = String(exp.interactiveType || '').toLowerCase();
  const expId = String(exp.id || '').toLowerCase();
  const chapter = String(exp.chapter || '').toLowerCase();
  const tags = Array.isArray(exp.tags) ? exp.tags.join(' ').toLowerCase() : String(exp.tags || '').toLowerCase();

  const keywords = [
    'địa', 'dia', 'geo', 'trái đất', 'trai dat', 'hành tinh', 'hanh tinh', 
    'mặt trời', 'mat troi', 'vũ trụ', 'vu tru', 'núi lửa', 'nui lua', 
    'động đất', 'dong dat', 'thủy triều', 'thuy trieu', 'khí hậu', 'khi hau', 
    'vòng tuần hoàn', 'cấu tạo trái đất', 'băng', 'kiến tạo', 'bản đồ', 
    'xoáy thuận', 'bão', 'địa hình', 'khí quyển', 'mặt trăng', 'mat trang',
    'nhật thực', 'nguyệt thực', 'mùa', 'ngày và đêm'
  ];

  const searchStr = `${sub} ${cat} ${title} ${type} ${expId} ${chapter} ${tags}`;
  return keywords.some(kw => searchStr.includes(kw));
};

export const detectExperimentInteractiveType = (exp) => {
  if (!exp) return 'khtn_dynamic_lab';
  const rawType = String(exp.interactiveType || '').toLowerCase();
  
  if (rawType && rawType !== 'chemistry_acid_base' && rawType !== 'default' && rawType !== 'custom') {
    return exp.interactiveType;
  }

  const title = String(exp.title || '').toLowerCase();
  const obj = String(exp.objective || '').toLowerCase();
  const eq = Array.isArray(exp.equipment) ? exp.equipment.join(' ').toLowerCase() : String(exp.equipment || '').toLowerCase();
  const expText = String(exp.explanation || '').toLowerCase();
  const fullText = `${title} ${obj} ${eq} ${expText}`;

  if (fullText.includes('tách oxi') || fullText.includes('tách oxygen') || fullText.includes('điện phân nước') || 
      fullText.includes('thu khí oxi') || fullText.includes('chế tạo oxi') || fullText.includes('khí oxi ra khỏi nước') || 
      fullText.includes('oxi ra khỏi nước') || fullText.includes('khoi nuoc') || fullText.includes('điện phân') ||
      (fullText.includes('nước') && fullText.includes('oxi'))) {
    return 'chem_water_oxygen_separation';
  }

  if (fullText.includes('đốt cháy') || fullText.includes('cháy trong oxi') || fullText.includes('cồn') || fullText.includes('butane')) {
    return 'chem9_alcohol_combustion';
  }

  if (fullText.includes('quỳ tím') || fullText.includes('phenolphthalein') || fullText.includes('axit') || fullText.includes('base') || fullText.includes('bazo')) {
    return 'chemistry_acid_base';
  }

  if (fullText.includes('fe2o3') || fullText.includes('khử sắt')) {
    return 'chem9_fe2o3_co';
  }

  if (fullText.includes('mạch điện') || fullText.includes('dòng điện') || fullText.includes('vôn kế')) {
    return 'physics_circuit';
  }

  if (fullText.includes('kính hiển vi') || fullText.includes('tế bào')) {
    return 'biology_microscope';
  }

  return 'khtn_dynamic_lab';
};

function ChemWaterOxygenSeparationSim({ experiment, onLog, onSensorUpdate }) {
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [isHeatOn, setIsHeatOn] = useState(false);
  const [gasO2, setGasO2] = useState(0);
  const [gasH2, setGasH2] = useState(0);
  const [temp, setTemp] = useState(25.0);
  const [splintTested, setSplintTested] = useState(false);
  const [splintFlames, setSplintFlames] = useState(false);

  useEffect(() => {
    let timer;
    if (isPowerOn) {
      timer = setInterval(() => {
        setGasO2(prev => Math.min(25.0, Number((prev + 0.5).toFixed(1))));
        setGasH2(prev => Math.min(50.0, Number((prev + 1.0).toFixed(1))));
        if (onSensorUpdate) {
          onSensorUpdate({
            temp: temp,
            ph: 7.0,
            mass: Number((180.0 - gasO2 * 0.1).toFixed(2))
          });
        }
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isPowerOn, gasO2, temp]);

  useEffect(() => {
    let timer;
    if (isHeatOn) {
      timer = setInterval(() => {
        setTemp(prev => Math.min(100.0, Number((prev + 2.5).toFixed(1))));
      }, 400);
    } else {
      timer = setInterval(() => {
        setTemp(prev => Math.max(25.0, Number((prev - 1.5).toFixed(1))));
      }, 600);
    }
    return () => clearInterval(timer);
  }, [isHeatOn]);

  const handleTogglePower = () => {
    const nextState = !isPowerOn;
    setIsPowerOn(nextState);
    playLabSFX('bubble');
    if (nextState) {
      onLog("⚡ [Điện Phân Nước] Đã mở nguồn điện 12V DC. Dòng điện chạy qua dung dịch làm nước phân hủy: Bọt khí O₂ sủi mạnh ở Cực Dương (+) và bọt khí H₂ sủi ở Cực Âm (-). (2H₂O ➔ 2H₂↑ + O₂↑)");
    } else {
      onLog("⏸️ Đã ngắt nguồn điện phân.");
    }
  };

  const handleToggleHeat = () => {
    const nextState = !isHeatOn;
    setIsHeatOn(nextState);
    playLabSFX('flame');
    if (nextState) {
      onLog("🔥 Đã bật ngọn lửa Đèn Cồn. Nhiệt độ bình phản ứng tăng dần lên 100°C, gia tăng tốc độ thoát khí Oxi!");
    } else {
      onLog("🛑 Đã tắt Đèn Cồn.");
    }
  };

  const handleTestSplint = () => {
    if (gasO2 < 1.5) {
      onLog("⚠️ Lượng khí Oxi thu được chưa đủ (cần > 1.5ml). Vui lòng bật Nguồn Điện Phân để tích lũy thêm khí O₂!");
      return;
    }
    setSplintTested(true);
    playLabSFX('correct');
    setTimeout(() => {
      setSplintFlames(true);
      playLabSFX('win');
      onLog("🔥 [THÍ NGHIỆM THÀNH CÔNG] Đưa que đốm tàn đỏ vào miệng ống thu khí Oxi (O₂) ➔ Que đốm BÙNG CHÁY SÁNG CHÓI! Khẳng định khí Oxi duy trì và bùng cháy mãnh liệt.");
    }, 500);
  };

  const handleReset = () => {
    setIsPowerOn(false);
    setIsHeatOn(false);
    setGasO2(0);
    setGasH2(0);
    setTemp(25.0);
    setSplintTested(false);
    setSplintFlames(false);
    playLabSFX('drop');
    onLog("🔄 Đã làm mới mô hình Thí nghiệm Tách Oxi ra khỏi nước. Sẵn sàng thực hiện lại.");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px', color: '#f8fafc' }}>
      <div style={{
        flex: 1, background: '#020617', borderRadius: '20px',
        border: '1.5px solid rgba(13, 148, 136, 0.4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <svg width="100%" height="100%" viewBox="0 0 600 360">
          <defs>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="o2GasGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="h2GasGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(148, 163, 184, 0.05)" strokeWidth="1" />
          </pattern>
          <rect width="600" height="360" fill="url(#gridPattern)" />

          <text x="300" y="32" fill="#2dd4bf" fontSize="15" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
            ⚡ SƠ ĐỒ ĐIỆN PHÂN NƯỚC TÁCH KHÍ OXI (O₂) VÀ HIDRO (H₂)
          </text>

          <rect x="50" y="300" width="500" height="12" fill="#1e293b" rx="4" />

          {/* Hoffman U-Tube */}
          <path d="M 220 120 L 220 240 Q 220 280 300 280 Q 380 280 380 240 L 380 120" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" />
          <path d="M 245 120 L 245 230 Q 245 255 300 255 Q 355 255 355 230 L 355 120" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          
          <path d={`M 222 ${160 - gasH2*1.5} L 222 240 Q 222 278 300 278 Q 378 278 378 240 L 378 ${160 - gasO2*1.5} L 353 ${160 - gasO2*1.5} L 353 230 Q 353 253 300 253 Q 247 253 247 230 L 247 ${160 - gasH2*1.5} Z`} fill="url(#waterGrad)" />

          <rect x="223" y="100" width="22" height={Math.max(0, 60 - gasH2 * 1.5)} fill="url(#h2GasGrad)" rx="3" />
          <text x="210" y="85" fill="#38bdf8" fontSize="11" fontWeight="900">⚡ Cực Âm (-): H₂ ({gasH2} ml)</text>

          <rect x="355" y="100" width="23" height={Math.max(0, 60 - gasO2 * 1.5)} fill="url(#o2GasGrad)" rx="3" />
          <text x="390" y="85" fill="#2dd4bf" fontSize="11" fontWeight="900">🔋 Cực Dương (+): O₂ ({gasO2} ml)</text>

          <rect x="230" y="200" width="8" height="60" fill="#94a3b8" rx="2" stroke="#cbd5e1" strokeWidth="1" />
          <rect x="362" y="200" width="8" height="60" fill="#f59e0b" rx="2" stroke="#fde047" strokeWidth="1" />

          <path d="M 234 260 L 234 315 L 140 315 L 140 260" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray={isPowerOn ? "6 3" : "none"} />
          <path d="M 366 260 L 366 315 L 460 315 L 460 260" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={isPowerOn ? "6 3" : "none"} />

          <rect x="100" y="210" width="70" height="50" fill="#0f172a" stroke="#ef4444" strokeWidth="2" rx="8" />
          <text x="135" y="235" fill="#ef4444" fontSize="12" fontWeight="900" textAnchor="middle">12V DC</text>
          <text x="135" y="250" fill={isPowerOn ? "#22c55e" : "#94a3b8"} fontSize="10" fontWeight="bold" textAnchor="middle">
            {isPowerOn ? "ON ●" : "OFF ○"}
          </text>

          {isHeatOn && (
            <g transform="translate(285, 280)">
              <polygon points="15,0 0,25 30,25" fill="#f97316" opacity="0.8" />
              <polygon points="15,3 5,22 25,22" fill="#fde047" opacity="0.9" />
              <circle cx="15" cy="12" r="6" fill="#fff" opacity="0.7" />
              <text x="15" y="42" fill="#f97316" fontSize="10" fontWeight="bold" textAnchor="middle">🔥 100°C</text>
            </g>
          )}

          {isPowerOn && (
            <g>
              <circle cx="234" cy="220" r="3" fill="#fff" opacity="0.8" />
              <circle cx="230" cy="190" r="2.5" fill="#fff" opacity="0.9" />
              <circle cx="238" cy="160" r="4" fill="#fff" opacity="0.7" />

              <circle cx="366" cy="220" r="2.5" fill="#2dd4bf" opacity="0.9" />
              <circle cx="362" cy="190" r="3.5" fill="#2dd4bf" opacity="0.8" />
              <circle cx="370" cy="160" r="3" fill="#2dd4bf" opacity="0.85" />
            </g>
          )}

          {splintTested && (
            <g transform="translate(366, 75)">
              <line x1="0" y1="-30" x2="0" y2="15" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
              {!splintFlames ? (
                <circle cx="0" cy="15" r="4" fill="#ef4444" opacity="0.9">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="0.6s" repeatCount="indefinite" />
                </circle>
              ) : (
                <g>
                  <polygon points="0,15 -10,-10 0,-25 10,-10" fill="#f59e0b" />
                  <polygon points="0,15 -6,-5 0,-18 6,-5" fill="#fef08a" />
                  <circle cx="0" cy="-5" r="4" fill="#fff" />
                  <text x="25" y="-10" fill="#fde047" fontSize="13" fontWeight="900">💥 BÙNG CHÁY SÁNG!</text>
                </g>
              )}
            </g>
          )}
        </svg>

        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
          <span style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid #0d9488', color: '#2dd4bf', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
            🌡️ Nhiệt độ: {temp.toFixed(1)} °C
          </span>
          <span style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid #0284c7', color: '#38bdf8', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
            💧 Dung dịch: Nước cất H₂O + H₂SO₄ loãng
          </span>
        </div>
      </div>

      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        padding: '16px 20px', borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleTogglePower}
            style={{
              background: isPowerOn ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              color: '#ffffff', border: 'none', borderRadius: '12px',
              padding: '10px 18px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: isPowerOn ? '0 0 16px rgba(239, 68, 68, 0.5)' : '0 4px 14px rgba(13, 148, 136, 0.3)'
            }}
          >
            {isPowerOn ? '⏸️ TẮT NGUỒN ĐIỆN PHÂN' : '⚡ BẬT NGUỒN ĐIỆN PHÂN 12V'}
          </button>

          <button
            onClick={handleToggleHeat}
            style={{
              background: isHeatOn ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px',
              padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {isHeatOn ? '🔥 TẮT ĐÈN CỒN' : '🔥 BẬT ĐÈN CỒN ĐUN NÓNG'}
          </button>

          <button
            onClick={handleTestSplint}
            style={{
              background: splintFlames ? 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)' : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff', border: 'none', borderRadius: '12px',
              padding: '10px 18px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            🪵 THỬ QUE ĐỐM TÀN ĐỎ KHÍ O₂
          </button>
        </div>

        <button
          onClick={handleReset}
          style={{
            background: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px',
            padding: '8px 16px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
          }}
        >
          🔄 Làm Mới
        </button>
      </div>
    </div>
  );
}

function KHTNDynamicLabSim({ experiment, onLog, onSensorUpdate }) {
  const [step, setStep] = useState(1);
  const [isReacting, setIsReacting] = useState(false);
  const [temp, setTemp] = useState(25.0);
  const [gasVolume, setGasVolume] = useState(0);

  const title = experiment?.title || 'Thí Nghiệm Thực Hành KHTN';
  const equipmentList = Array.isArray(experiment?.equipment) 
    ? experiment.equipment 
    : (experiment?.equipment ? String(experiment.equipment).split(',') : ['Cốc thủy tinh chia độ', 'Đèn cồn', 'Nước cất']);

  const stepsList = Array.isArray(experiment?.steps)
    ? experiment.steps
    : (experiment?.steps ? String(experiment.steps).split('\n') : ['Bước 1: Rót hóa chất', 'Bước 2: Tiến hành phản ứng']);

  const handleStepClick = (idx) => {
    setStep(idx + 1);
    setIsReacting(true);
    playLabSFX('bubble');
    setTemp(prev => Math.min(90.0, prev + 15.0));
    setGasVolume(prev => Math.min(40.0, prev + 10.0));
    
    if (onSensorUpdate) {
      onSensorUpdate({
        temp: 25.0 + (idx + 1) * 12.0,
        ph: 7.0,
        mass: 150.0 - (idx + 1) * 2.5
      });
    }

    const stepText = stepsList[idx] || `Thực hiện bước ${idx + 1}`;
    onLog(`🧪 [KHTN Step ${idx + 1}] ${stepText}`);
  };

  const handleReset = () => {
    setStep(1);
    setIsReacting(false);
    setTemp(25.0);
    setGasVolume(0);
    playLabSFX('drop');
    onLog(`🔄 Đã làm mới phòng thí nghiệm KHTN: "${title}".`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px', color: '#f8fafc' }}>
      <div style={{
        flex: 1, background: '#020617', borderRadius: '20px',
        border: '1.5px solid rgba(13, 148, 136, 0.4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden', padding: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <span style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', fontSize: '0.72rem', fontWeight: 900, padding: '3px 10px', borderRadius: '6px' }}>
              🔬 PHÒNG THÍ NGHIỆM KHTN TƯƠNG TÁC THÔNG MINH
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#2dd4bf', margin: '4px 0 0 0' }}>
              {title}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid #0d9488', color: '#2dd4bf', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
              🌡️ {temp.toFixed(1)} °C
            </span>
            <span style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid #0284c7', color: '#38bdf8', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800 }}>
              🫧 Thể tích khí: {gasVolume.toFixed(1)} mL
            </span>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#f59e0b' }}>🧰 Dụng Cụ Thực Hành:</span>
          {equipmentList.map((eq, i) => (
            <span key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#cbd5e1', padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
              🧪 {eq.trim()}
            </span>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="100%" height="240" viewBox="0 0 500 240">
            <rect width="500" height="240" fill="#020617" rx="12" />
            <line x1="50" y1="210" x2="450" y2="210" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

            <rect x="200" y="70" width="100" height="130" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.5)" strokeWidth="3" rx="8" />
            <rect x="203" y={130 - (step * 8)} width="94" height={68 + (step * 8)} fill={step > 1 ? "rgba(13, 148, 136, 0.4)" : "rgba(56, 189, 248, 0.3)"} rx="6" />

            {[90, 110, 130, 150, 170].map((y, idx) => (
              <line key={idx} x1="200" y1={y} x2="215" y2={y} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            ))}

            {isReacting && (
              <g>
                <circle cx="230" cy="140" r="4" fill="#2dd4bf" opacity="0.8" />
                <circle cx="260" cy="110" r="5" fill="#38bdf8" opacity="0.9" />
                <circle cx="245" cy="85" r="6" fill="#fff" opacity="0.85" />
                <circle cx="270" cy="60" r="4" fill="#2dd4bf" opacity="0.75" />
                <text x="250" y="45" fill="#2dd4bf" fontSize="11" fontWeight="900" textAnchor="middle">✨ Đang diễn ra phản ứng!</text>
              </g>
            )}

            <rect x="275" y="40" width="6" height="130" fill="#cbd5e1" rx="3" />
            <rect x="276" y={170 - (temp * 0.8)} width="4" height={temp * 0.8} fill="#ef4444" rx="2" />
            <circle cx="278" cy="170" r="6" fill="#ef4444" />
          </svg>
        </div>
      </div>

      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        padding: '14px 18px', borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>📋 CÁC BƯỚC TIẾN HÀNH THÍ NGHIỆM:</span>
          <button onClick={handleReset} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer' }}>
            🔄 Reset
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {stepsList.map((stText, idx) => (
            <button
              key={idx}
              onClick={() => handleStepClick(idx)}
              style={{
                flex: 1, minWidth: '160px',
                background: step === idx + 1 ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.06)',
                border: step === idx + 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff', borderRadius: '10px', padding: '10px 14px',
                fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {stText}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InteractiveExperimentCanvas({ experiment, onClose }) {
  if (!experiment) return null;

  const [logs, setLogs] = useState([
    `[Hệ thống] Đã tải bài thí nghiệm/mô hình: "${experiment?.title || ''}" (Khối ${experiment?.grade || ''} - ${experiment?.subject || ''}).`
  ]);

  const [sensorData, setSensorData] = useState({ temp: 25.0, ph: 7.0, mass: 150.00 });
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [simOverride, setSimOverride] = useState(null);

  useEffect(() => {
    setSimOverride(null);
  }, [experiment?.id]);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSensorUpdate = (sensors) => {
    if (sensors) setSensorData(prev => ({ ...prev, ...sensors }));
  };

  const addLog = (msg, sensors) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [`[${time}] ${msg}`, ...prev]);
    if (sensors) setSensorData(prev => ({ ...prev, ...sensors }));
  };

  const renderSimComponent = () => {
    if (simOverride === 'chem9_fe2o3_co') {
      return <Chem9Fe2O3COSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
    }

    switch (experiment?.interactiveType) {
      case 'chem_water_oxygen_separation':
        return <ChemWaterOxygenSeparationSim experiment={experiment} onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'khtn_dynamic_lab':
        return <KHTNDynamicLabSim experiment={experiment} onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chemistry_acid_base':
        return <ChemistryAcidBaseSim config={experiment.simulationConfig} onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chemistry_sandbox':
        return <ChemistrySandboxSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chemistry_precipitation':
        return <ChemistryPrecipitationSim onLog={addLog} />;
      case 'chemistry_gas_burn':
        return <ChemistryGasBurnSim onLog={addLog} />;
      case 'chemistry_flame_burn':
        return <ChemistryFlameBurnSim onLog={addLog} />;
      case 'chemistry_silver_mirror':
        return <ChemistrySilverMirrorSim onLog={addLog} />;

      // Grade 9 Chemistry Textbook & Video Simulations
      case 'chem9_fe2o3_co':
        return <Chem9Fe2O3COSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_fe_o2':
        return <Chem9FeO2Sim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_al_o2':
        return <Chem9AlO2Sim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_na_cl2':
        return <Chem9NaCl2Sim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_fe_cl2':
        return <Chem9FeCl2Sim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_na_h2o':
        return <Chem9NaH2OSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_fe_cuso4':
        return <Chem9FeCuSO4Sim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_survey_water':
        return <Chem9SurveyWaterSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_survey_hcl':
        return <Chem9SurveyHClSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_cu_agno3':
        return <Chem9CuAgNO3Sim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_charcoal_adsorption':
        return <Chem9CharcoalAdsorptionSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_butane_combustion':
        return <Chem9ButaneCombustionSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_ethylene_br2':
        return <Chem9EthyleneBr2Sim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_alcohol_combustion':
        return <Chem9AlcoholCombustionSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_alcohol_na':
        return <Chem9AlcoholNaSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_acetic_acid_properties':
        return <Chem9AceticAcidPropertiesSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_glucose_silver_mirror':
        return <Chem9GlucoseSilverMirrorSim onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      case 'chem9_starch_iodine':
        return <Chem9StarchIodineSim onLog={addLog} />;
      case 'chem9_starch_hydrolysis':
        return <Chem9StarchHydrolysisSim onLog={addLog} />;
      case 'chem9_protein_properties':
        return <Chem9ProteinPropertiesSim onLog={addLog} />;

      case 'physics_refraction':
        return <PhysicsRefractionSim onLog={addLog} />;
      case 'physics_circuit':
        return <PhysicsCircuitSim onLog={addLog} />;
      case 'physics_pendulum':
        return <PhysicsPendulumSim onLog={addLog} />;
      case 'physics_spring':
        return <PhysicsSpringSim onLog={addLog} />;
      case 'biology_microscope':
        return <BiologyMicroscopeSim onLog={addLog} />;
      case 'biology_cell_plasmolysis':
        return <BiologyCellPlasmolysisSim onLog={addLog} />;
      case 'biology_dna_extraction':
        return <BiologyDNAExtractionSim onLog={addLog} />;
      case 'exp_geo_6_01':
      case 'geo_6_01':
      case 'geo_solar_system':
        return <GeoSolarSystemSim experiment={experiment} onLog={addLog} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />;
      case 'exp_geo_6_02':
      case 'geo_6_02':
      case 'geo_earth_sun_moon':
        return <GeoEarthSunMoonSim onLog={addLog} />;
      case 'exp_geo_6_03':
      case 'geo_6_03':
      case 'geo_volcano':
        return <GeoVolcanoSim onLog={addLog} />;
      case 'exp_geo_6_04':
      case 'geo_6_04':
      case 'geo_earthquake':
        return <GeoEarthquakeSim onLog={addLog} />;
      case 'exp_geo_6_05':
      case 'geo_6_05':
      case 'geo_water_cycle':
        return <GeoWaterCycleSim onLog={addLog} />;
      case 'exp_geo_6_06':
      case 'geo_6_06':
      case 'geo_earth_structure':
        return <GeoEarthStructureSim onLog={addLog} />;
      case 'exp_geo_6_07':
      case 'geo_6_07':
      case 'geo_glacial_river':
        return <GeoGlacialRiverSim onLog={addLog} />;
      default: {
        const detectedType = detectExperimentInteractiveType(experiment);
        if (detectedType === 'chem_water_oxygen_separation') {
          return <ChemWaterOxygenSeparationSim experiment={experiment} onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
        }
        if (detectedType === 'khtn_dynamic_lab') {
          return <KHTNDynamicLabSim experiment={experiment} onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
        }
        const title = (experiment?.title || '').toLowerCase();
        const isGeo = isGeoExperiment(experiment);

        if (isGeo) {
          if (title.includes('hành tinh') || title.includes('mặt trời') || title.includes('vũ trụ')) {
            return <GeoSolarSystemSim experiment={experiment} onLog={addLog} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />;
          }
          if (title.includes('ngày') || title.includes('đêm') || title.includes('trăng') || title.includes('thực')) {
            return <GeoEarthSunMoonSim onLog={addLog} />;
          }
          if (title.includes('núi lửa') || title.includes('magma')) {
            return <GeoVolcanoSim onLog={addLog} />;
          }
          if (title.includes('động đất') || title.includes('sóng') || title.includes('kiến tạo')) {
            return <GeoEarthquakeSim onLog={addLog} />;
          }
          if (title.includes('tuần hoàn') || title.includes('nước') || title.includes('mưa')) {
            return <GeoWaterCycleSim onLog={addLog} />;
          }
          if (title.includes('bóc tách') || title.includes('cấu tạo') || title.includes('manti') || title.includes('nhân') || title.includes('lõi')) {
            return <GeoEarthStructureSim onLog={addLog} />;
          }
          if (title.includes('sông') || title.includes('suối') || title.includes('băng') || title.includes('tuyết')) {
            return <GeoGlacialRiverSim onLog={addLog} />;
          }
          return <GeoSolarSystemSim experiment={experiment} onLog={addLog} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />;
        }
        return <KHTNDynamicLabSim experiment={experiment} onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
      }
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(2, 6, 23, 0.96)', backdropFilter: 'blur(12px)',
      zIndex: 1100, display: 'flex', flexDirection: 'column',
      color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header Bar */}
      <div style={{
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #091a28 0%, #0d2b3a 100%)',
        borderBottom: '1px solid rgba(13, 148, 136, 0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(13, 148, 136, 0.6)'
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2dd4bf', margin: 0, lineHeight: 1.2 }}>
              {experiment?.title || 'Bài Thí Nghiệm'}
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
              Khối {experiment?.grade || ''} • {experiment?.subject || ''} • GDPT 2018
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {experiment?.interactiveType === 'chem9_fe2o3_co' && (
            <button 
              onClick={() => setSimOverride(simOverride === 'chem9_fe2o3_co' ? null : 'chem9_fe2o3_co')}
              style={{
                background: simOverride === 'chem9_fe2o3_co' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
                border: '1px solid #a855f7',
                color: '#ffffff', borderRadius: '12px', padding: '10px 16px',
                fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)'
              }}
            >
              <Sparkles size={18} /> {simOverride === 'chem9_fe2o3_co' ? '🔥 Đang ở 3D NOBOOK Lab' : '🔥 Chuyển 3D NOBOOK Lab'}
            </button>
          )}

          <button 
            onClick={toggleFullscreen}
            style={{
              background: isFullscreen ? 'rgba(13, 148, 136, 0.3)' : 'rgba(51, 65, 85, 0.4)',
              border: '1px solid rgba(13, 148, 136, 0.5)',
              color: '#38bdf8', borderRadius: '12px', padding: '10px 16px',
              fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Maximize2 size={18} /> {isFullscreen ? 'Thoát Màn Hình' : 'Toàn Màn Hình'}
          </button>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5', borderRadius: '12px', padding: '10px 18px',
              fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <X size={18} /> Thoát Mô Phỏng
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div style={{ flex: 1, display: 'flex', padding: '14px 20px', gap: '20px', overflowY: 'auto', minHeight: 0 }}>
        
        {/* Left Side: Interactive Canvas Simulator */}
        <div style={{ flex: 1.6, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', minHeight: 0, paddingRight: '4px' }}>
          
          {/* Real-Time Digital Sensors HUD Bar (Hidden for All Geography Experiments) */}
          {!isGeoExperiment(experiment) && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(13, 148, 136, 0.35)', borderRadius: '12px',
              padding: '8px 16px', boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              flexShrink: 0
            }}>
              {/* Temp Sensor & Interactive Temperature Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 10px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                <Flame size={18} color="#f97316" />
                <span style={{ fontSize: '0.75rem', color: '#fde047', fontWeight: 800 }}>Nhiệt độ:</span>
                <span style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 900, fontFamily: 'monospace', minWidth: '65px' }}>{sensorData.temp.toFixed(1)} °C</span>
                
                {/* Quick +/- temperature buttons and slider directly in the header sensor bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                  <button
                    onClick={() => {
                      const newT = Math.max(25, sensorData.temp - 10);
                      handleSensorUpdate({ temp: newT });
                    }}
                    title="Giảm 10°C"
                    style={{ background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '3px 8px', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    ➖ 10°
                  </button>

                  <input
                    type="range" min="25" max="1000" step="5"
                    value={sensorData.temp}
                    onChange={(e) => handleSensorUpdate({ temp: Number(e.target.value) })}
                    style={{ accentColor: '#f97316', cursor: 'pointer', width: '85px', height: '6px' }}
                    title="Kéo thanh trượt để tùy chỉnh nhiệt độ"
                  />

                  <button
                    onClick={() => {
                      const newT = Math.min(1000, sensorData.temp + 10);
                      handleSensorUpdate({ temp: newT });
                    }}
                    title="Tăng 10°C"
                    style={{ background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '3px 8px', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    ➕ 10°
                  </button>
                </div>
              </div>

              {/* pH Sensor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#38bdf8" />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Cảm biến pH:</span>
                <span style={{ fontSize: '0.9rem', color: sensorData.ph < 7 ? '#ef4444' : sensorData.ph > 7 ? '#3b82f6' : '#2dd4bf', fontWeight: 900, fontFamily: 'monospace' }}>
                  pH {sensorData.ph.toFixed(1)}
                </span>
              </div>

              {/* Mass Sensor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="#a855f7" />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Cân điện tử:</span>
                <span style={{ fontSize: '0.9rem', color: '#c084fc', fontWeight: 900, fontFamily: 'monospace' }}>{sensorData.mass.toFixed(2)} g</span>
              </div>

              {/* Audio SFX Toggle */}
              <button 
                onClick={() => setAudioEnabled(!audioEnabled)}
                style={{ background: audioEnabled ? 'rgba(13, 148, 136, 0.25)' : 'rgba(51, 65, 85, 0.4)', border: '1px solid rgba(13, 148, 136, 0.4)', borderRadius: '8px', padding: '4px 10px', color: audioEnabled ? '#2dd4bf' : '#94a3b8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Volume2 size={14} /> {audioEnabled ? 'Âm thanh SFX: BẬT' : 'Âm thanh SFX: TẮT'}
              </button>
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <SimErrorBoundary key={experiment?.id || experiment?.interactiveType || 'sim'}>
              {renderSimComponent()}
            </SimErrorBoundary>
          </div>

          {/* Live Experiment Log Output */}
          <div style={{
            height: '80px', background: '#040d16', borderRadius: '14px',
            border: '1px solid rgba(13, 148, 136, 0.25)', padding: '10px 14px', overflowY: 'auto',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#0d9488', letterSpacing: '0.05em', marginBottom: '4px' }}>
              LOG QUAN SÁT HIỆN TƯỢNG REAL-TIME:
            </div>
            {logs.map((log, i) => (
              <div key={i} style={{ fontSize: '0.78rem', color: i === 0 ? '#2dd4bf' : '#94a3b8', fontFamily: 'monospace', lineHeight: 1.4 }}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Theory, Steps, & Scientific Explanation (Hidden in Fullscreen Mode) */}
        {!isFullscreen && (
          <div style={{
            flex: 1, background: 'rgba(15, 23, 42, 0.85)', borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto'
          }}>
            {/* 3D Controls Guide (Docked on Right Panel) */}
            <div style={{
              background: 'rgba(9, 25, 43, 0.9)', border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '12px', padding: '12px 16px', color: '#f8fafc'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎮 BẢNG HƯỚNG DẪN ĐIỀU KHIỂN 3D
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                <div>• <b style={{ color: '#fff' }}>Kéo trái:</b> Xoay 360°</div>
                <div>• <b style={{ color: '#fff' }}>Cuộn chuột:</b> Thu phóng</div>
                <div>• <b style={{ color: '#fff' }}>Kéo phải:</b> Di chuyển</div>
                <div>• <b style={{ color: '#fff' }}>Nhấp tinh cầu:</b> Du hành</div>
              </div>
            </div>
            {/* Objective */}
            <div style={{ background: 'rgba(13, 148, 136, 0.15)', borderLeft: '4px solid #0d9488', padding: '12px 14px', borderRadius: '0 10px 10px 0' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#2dd4bf', margin: '0 0 4px 0' }}>🎯 MỤC ĐÍCH THÍ NGHIỆM / MÔ HÌNH</h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                {experiment?.objective || ''}
              </p>
            </div>

            {/* Equipment & Reagents */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fde047', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🛠️ DỤNG CỤ & MÔ HÌNH THỰC HÀNH
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {experiment?.equipment?.map((item, idx) => (
                  <span key={idx} style={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Procedure Steps */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#38bdf8', margin: '0 0 8px 0' }}>
                📝 CÁC BƯỚC THỰC HÀNH & QUAN SÁT
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {experiment?.steps?.map((step, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4, background: '#09131d', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #0284c7' }}>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Observed Phenomenon */}
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '12px', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fde047', margin: '0 0 4px 0' }}>👁️ HIỆN TƯỢNG QUAN SÁT TRỰC QUAN</h4>
              <p style={{ fontSize: '0.8rem', color: '#fef08a', margin: 0, lineHeight: 1.4 }}>
                {experiment?.phenomenon || ''}
              </p>
            </div>

            {/* Scientific Explanation & Equations */}
            <div style={{ background: 'rgba(147, 51, 234, 0.15)', border: '1px solid rgba(147, 51, 234, 0.3)', padding: '12px', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#c084fc', margin: '0 0 4px 0' }}>💡 GIẢI THÍCH BẢN CHẤT ĐỊA LÍ / KHOA HỌC</h4>
              <p style={{ fontSize: '0.8rem', color: '#e9d5ff', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                {experiment?.explanation || ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
