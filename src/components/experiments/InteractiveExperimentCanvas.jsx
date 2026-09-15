import React, { useState, useEffect, useRef } from 'react';
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

const PROCEDURAL_TEXTURE_CACHE = {};

function generateProceduralPlanetTexture(id) {
  if (PROCEDURAL_TEXTURE_CACHE[id]) return PROCEDURAL_TEXTURE_CACHE[id];
  try {
    if (typeof document === 'undefined') return null;
    const W = (id === 'earth' || id === 'jupiter' || id === 'saturn') ? 256 : 128;
    const H = Math.round(W / 2);
    const rand = mulberry32(id.length * 7919 + id.charCodeAt(0) * 131);
    const N = makePeriodicNoise(rand);
    const canvas = makeCanvas(W, H);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    paintPixels(ctx, W, H, planetPixelFn(id, N));

    if (id === 'mercury') drawCraters(ctx, W, H, rand, 30, 0.25);
    if (id === 'mars') drawCraters(ctx, W, H, rand, 12, 0.18);
    if (id === 'jupiter') {
      drawSpot(ctx, W, H, 0.31, 0.63, 0.055, 0.045, hexToRgb('#c0392b'), 0.85, -0.12);
      drawSpot(ctx, W, H, 0.31, 0.63, 0.028, 0.024, hexToRgb('#e8604a'), 0.8, -0.12);
    }
    if (id === 'neptune') {
      drawSpot(ctx, W, H, 0.62, 0.42, 0.05, 0.035, hexToRgb('#101f45'), 0.75);
    }

    const dataUrl = canvas.toDataURL('image/png');
    PROCEDURAL_TEXTURE_CACHE[id] = dataUrl;
    return dataUrl;
  } catch (e) {
    console.warn("Failed to generate texture for", id, e);
    return null;
  }
}

// ==========================================
// --- GEOGRAPHY GRADE 6 SIMULATOR COMPONENTS ---
// ==========================================

// 1. Solar System Orbits Simulator (Aslan.io.vn 3D Interactive Design)
function GeoSolarSystemSim({ onLog }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanetKey, setSelectedPlanetKey] = useState(null); // null = overview mode
  const [tiltAngle, setTiltAngle] = useState(65); // 3D tilt perspective (degrees)
  const [yawAngle, setYawAngle] = useState(0); // 3D yaw rotation
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState(1.0);
  const [isMaximized, setIsMaximized] = useState(false); // Fullscreen 3D View mode

  const orbitPlanetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

  // Generate photorealistic procedural textures for all 8 planets
  const planetTextures = useMemo(() => {
    const map = {};
    orbitPlanetKeys.forEach((key) => {
      map[key] = generateProceduralPlanetTexture(key);
    });
    return map;
  }, []);

  const planetData = {
    sun: { key: 'sun', name: 'Mặt Trời (The Sun)', shortName: 'Mặt Trời', dist: '— (Trung tâm hệ)', size: '1.392.700 km (Gấp 109 lần Trái Đất)', period: '≈ 25,4 ngày (Tự quay)', temp: '5.500°C (Bề mặt) • 15 triệu °C (Lõi)', moons: '8 hành tinh & hàng triệu tiểu hành tinh', feature: 'Ngôi sao lùn vàng chiếm 99,86% tổng khối lượng toàn Hệ Mặt Trời. Cung cấp ánh sáng và năng lượng nhiệt nuôi sống Trái Đất.', color: '#f59e0b', pSize: 32 },
    mercury: { key: 'mercury', name: 'Sao Thủy (Mercury)', shortName: 'Sao Thủy', dist: '57,9 triệu km (0.39 AU)', size: '4.879 km', period: '88 ngày', temp: '-180°C (Đêm) đến +430°C (Ngày)', moons: '0', feature: 'Hành tinh nhỏ nhất và gần Mặt Trời nhất. Chênh lệch nhiệt độ cực đại giữa ngày và đêm do không có khí quyển.', color: '#94a3b8', radius: 55, pSize: 7, speedVal: 4.1 },
    venus: { key: 'venus', name: 'Sao Kim (Venus)', shortName: 'Sao Kim', dist: '108,2 triệu km (0.72 AU)', size: '12.104 km', period: '225 ngày', temp: '≈ 465°C (Nóng nhất toàn hệ)', moons: '0', feature: 'Hành tinh nóng nhất Hệ Mặt Trời với bầu khí quyển CO2 cực dày và mây axit sulfuric. Tự quay ngược chiều (Đông sang Tây).', color: '#f59e0b', radius: 85, pSize: 10, speedVal: 1.6 },
    earth: { key: 'earth', name: 'Trái Đất (Earth)', shortName: 'Trái Đất', dist: '149,6 triệu km (1.00 AU)', size: '12.742 km', period: '365,25 ngày', temp: '15°C (Trung bình)', moons: '1 (Mặt Trăng / Moon)', feature: 'Hành tinh duy nhất có nước lỏng (phủ 71% bề mặt), khí quyển giàu Oxy/Nitơ và sự sống phong phú.', color: '#38bdf8', radius: 120, pSize: 11, speedVal: 1.0 },
    mars: { key: 'mars', name: 'Sao Hỏa (Mars)', shortName: 'Sao Hỏa', dist: '227,9 triệu km (1.52 AU)', size: '6.779 km', period: '687 ngày', temp: '-63°C', moons: '2 (Phobos & Deimos)', feature: 'Hành tinh Đỏ phủ bụi oxit sắt. Có ngọn núi lửa Olympus Mons cao nhất Hệ Mặt Trời (21.9 km, gấp 2.5 lần Everest).', color: '#ef4444', radius: 155, pSize: 9, speedVal: 0.5 },
    jupiter: { key: 'jupiter', name: 'Sao Mộc (Jupiter)', shortName: 'Sao Mộc', dist: '778,5 triệu km (5.20 AU)', size: '139.820 km', period: '11,86 năm', temp: '-110°C', moons: '95+ (Io, Europa, Ganymede...)', feature: 'Hành tinh khí khổng lồ lớn nhất (thể tích gấp 1.300 lần Trái Đất). Nổi tiếng với bão khổng lồ Vết Đỏ Lớn tồn tại 350 năm.', color: '#d97706', radius: 195, pSize: 19, speedVal: 0.2 },
    saturn: { key: 'saturn', name: 'Sao Thổ (Saturn)', shortName: 'Sao Thổ', dist: '1,43 tỷ km (9.58 AU)', size: '116.460 km', period: '29,45 năm', temp: '-140°C', moons: '146+ (Titan có khí quyển)', feature: 'Tráng lệ nhất với vành đai đá và băng rực rỡ dẹt khổng lồ. Titan là vệ tinh duy nhất có khí quyển dày.', color: '#fde047', radius: 240, pSize: 16, speedVal: 0.1, ring: true },
    uranus: { key: 'uranus', name: 'Sao Thiên Vương (Uranus)', shortName: 'Sao Thiên Vương', dist: '2,87 tỷ km (19.2 AU)', size: '50.724 km', period: '84 năm', temp: '-195°C', moons: '28', feature: 'Hành tinh băng nghiêng trục 98° ("lăn" trên quỹ đạo). Màu xanh lam do khí metan trong bầu khí quyển.', color: '#2dd4bf', radius: 280, pSize: 13, speedVal: 0.05 },
    neptune: { key: 'neptune', name: 'Sao Hải Vương (Neptune)', shortName: 'Sao Hải Vương', dist: '4,5 tỷ km (30.1 AU)', size: '49.244 km', period: '164,8 năm', temp: '-200°C', moons: '16 (Triton)', feature: 'Hành tinh xa nhất Hệ Mặt Trời, tìm ra bằng toán học trước khi nhìn thấy. Sắc xanh thẫm với gió bão mạnh nhất (2.100 km/h).', color: '#6366f1', radius: 315, pSize: 13, speedVal: 0.03 }
  };

  const animRef = useRef(null);
  const anglesRef = useRef(orbitPlanetKeys.map(() => Math.random() * Math.PI * 2));
  const [planetAngles, setPlanetAngles] = useState(anglesRef.current);

  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const nextAngles = anglesRef.current.map((ang, i) => {
        const key = orbitPlanetKeys[i];
        return ang + planetData[key].speedVal * dt * speed;
      });
      anglesRef.current = nextAngles;
      setPlanetAngles([...nextAngles]);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, speed]);

  // Handle Mouse Drag to Rotate 3D Camera View
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setYawAngle(prev => prev + dx * 0.4);
    setTiltAngle(prev => Math.min(85, Math.max(15, prev - dy * 0.4)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel to Zoom
  const handleWheel = (e) => {
    setZoomScale(prev => Math.min(2.5, Math.max(0.5, prev - e.deltaY * 0.0015)));
  };

  const handleSelectCelestial = (key) => {
    if (selectedPlanetKey === key) {
      // Toggle OFF to Overview
      setSelectedPlanetKey(null);
      onLog(`Quay về tổng quan góc nhìn 3D Hệ Mặt Trời.`);
    } else {
      setSelectedPlanetKey(key);
      const p = planetData[key];
      onLog(`Khám phá ${p.name}: Khoảng cách ${p.dist}, Đường kính ${p.size}, Chu kỳ ${p.period}.`);
    }
  };

  const activePlanet = selectedPlanetKey ? planetData[selectedPlanetKey] : null;

  // Compute 3D projected coordinates for planets
  const tiltRad = (tiltAngle * Math.PI) / 180;
  const yawRad = (yawAngle * Math.PI) / 180;
  const aspectY = Math.sin(tiltRad); // Vertical compression for 3D tilt

  // Effective container style: Fullscreen backdrop vs normal container
  const containerStyle = isMaximized ? {
    position: 'fixed', inset: '12px', zIndex: 2000,
    background: '#020617', borderRadius: '20px', padding: '16px',
    boxShadow: '0 0 60px rgba(0, 0, 0, 0.95)', border: '2px solid rgba(56, 189, 248, 0.6)',
    display: 'flex', flexDirection: 'column', gap: '12px', userSelect: 'none'
  } : {
    display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', userSelect: 'none'
  };

  return (
    <div style={containerStyle}>
      
      {/* 3D Canvas Area */}
      <div 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          flex: 1, background: 'radial-gradient(circle at center, #091a2a 0%, #020617 100%)',
          borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* Header Branding matching Aslan.io.vn */}
        <div style={{ position: 'absolute', top: '16px', left: '20px', zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            THREE.JS / SVG · INTERACTIVE EXPERIENCE
          </div>
          <h3 style={{ fontSize: isMaximized ? '1.8rem' : '1.4rem', fontWeight: 900, color: '#f8fafc', margin: '2px 0 0 0', textShadow: '0 0 15px rgba(56, 189, 248, 0.5)' }}>
            HỆ MẶT TRỜI <span style={{ fontSize: '0.85rem', color: '#2dd4bf', fontWeight: 700 }}>3D</span>
          </h3>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
            Mô hình 3D tương tác — 8 hành tinh quay quanh một ngôi sao
          </div>
        </div>

        {/* Top-Right Quick Control Guide Box & Fullscreen Maximize Toggle */}
        <div style={{ position: 'absolute', top: '16px', right: '20px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => {
              setIsMaximized(!isMaximized);
              onLog(isMaximized ? 'Đã thu nhỏ màn hình 3D.' : 'Đã mở rộng TOÀN MÀN HÌNH 3D Hệ Mặt Trời!');
            }}
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              color: '#ffffff', border: '1px solid #2dd4bf', borderRadius: '10px',
              padding: '8px 14px', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer',
              boxShadow: '0 0 14px rgba(13, 148, 136, 0.6)', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {isMaximized ? '⤡ THU NHỎ MÀN HÌNH' : '⤢ MỞ RỘNG MÀN HÌNH 3D'}
          </button>

          <div style={{
            background: 'rgba(15, 23, 42, 0.82)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '14px',
            padding: '10px 14px', fontSize: '0.72rem', color: '#cbd5e1',
            display: 'flex', flexDirection: 'column', gap: '5px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#38bdf8', fontWeight: 700 }}>Kéo chuột</span>
              <span>Xoay góc nhìn 3D</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#38bdf8', fontWeight: 700 }}>Cuộn</span>
              <span>Thu phóng (Zoom)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#38bdf8', fontWeight: 700 }}>Nhấp thiên thể</span>
              <span>Đi tới & xem chi tiết</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fde047', fontWeight: 700 }}>Bấm lần nữa</span>
              <span>Quay về tổng quan</span>
            </div>
          </div>
        </div>

        {/* 3D SVG Canvas */}
        <svg width="100%" height="100%" viewBox={isMaximized ? "0 0 900 600" : "0 0 700 500"} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            {/* Sun Plasma Radiance Shader */}
            <radialGradient id="sunShader" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="90%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>

            {/* Saturn Rings Shader with Cassini Division */}
            <linearGradient id="saturnRingsGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(254, 240, 138, 0.9)" />
              <stop offset="40%" stopColor="rgba(202, 138, 4, 0.85)" />
              <stop offset="48%" stopColor="rgba(15, 23, 42, 0.95)" /> {/* Cassini Division */}
              <stop offset="55%" stopColor="rgba(254, 240, 138, 0.85)" />
              <stop offset="85%" stopColor="rgba(161, 98, 7, 0.6)" />
              <stop offset="100%" stopColor="rgba(254, 240, 138, 0.15)" />
            </linearGradient>

            {/* Universal 3D Spherical Light Shadow Overlay */}
            <radialGradient id="sphere3DShade" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.0" />
              <stop offset="85%" stopColor="#000000" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
            </radialGradient>
          </defs>

          <g transform={`translate(${isMaximized ? 450 : 350}, ${isMaximized ? 300 : 250}) scale(${zoomScale * (isMaximized ? 1.25 : 1.0)})`}>
            
            {/* 3D Concentric Orbit Ellipses (Solid smooth lines, no dashed dots) */}
            {orbitPlanetKeys.map((key) => {
              const p = planetData[key];
              const isSel = selectedPlanetKey === key;
              return (
                <ellipse 
                  key={key} 
                  cx="0" cy="0" 
                  rx={p.radius} ry={p.radius * aspectY} 
                  fill="none" 
                  stroke={isSel ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)'} 
                  strokeWidth={isSel ? 2 : 1} 
                  transform={`rotate(${yawAngle})`}
                />
              );
            })}

            {/* Glowing Fiery Sun in Center */}
            <g style={{ cursor: 'pointer' }} onClick={() => handleSelectCelestial('sun')}>
              <circle cx="0" cy="0" r="42" fill="url(#sunShader)" style={{ filter: 'drop-shadow(0 0 45px #fde047)' }} />
              <circle cx="0" cy="0" r="35" fill="#fef08a" opacity="0.4" />
              <text x="0" y="4" fill="#0f172a" fontSize="10" fontWeight="900" textAnchor="middle">MẶT TRỜI</text>
            </g>

            {/* Realistic Textured Planets in 3D Orbits */}
            {orbitPlanetKeys.map((key, i) => {
              const p = planetData[key];
              const ang = (planetAngles[i] || 0) + yawRad;
              
              // 3D Projected coordinates
              const px = p.radius * Math.cos(ang);
              const py = p.radius * Math.sin(ang) * aspectY;
              
              // Depth Z sorting (farther planets smaller & dimmer)
              const depthZ = Math.sin(ang); // -1 (back) to +1 (front)
              const planetScale = 1 + depthZ * 0.25;
              const r = p.pSize * planetScale;
              const isSel = selectedPlanetKey === key;

              return (
                <g key={key} transform={`translate(${px}, ${py})`}>
                  {/* Selection Glowing Halo (Solid glow ring, no dashes) */}
                  {isSel && (
                    <circle cx="0" cy="0" r={r + 6} fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.85" />
                  )}

                  {/* Saturn Ring (Back Layer) */}
                  {key === 'saturn' && (
                    <g transform="rotate(-15)">
                      <ellipse cx="0" cy="0" rx={r * 2.5} ry={r * 0.8} fill="none" stroke="url(#saturnRingsGrad)" strokeWidth={r * 0.9} opacity="0.95" />
                    </g>
                  )}

                  {/* PLANET BODY SPECIFIC REALISTIC TEXTURED GRAPHICS */}
                  <g style={{ cursor: 'pointer' }} onClick={() => handleSelectCelestial(key)}>
                    <defs>
                      <clipPath id={`clip-${key}`}>
                        <circle cx="0" cy="0" r={r} />
                      </clipPath>
                    </defs>

                    {/* Base Photorealistic Surface Map Texture generated via Aslan.io.vn NASA Shader Engine */}
                    {planetTextures[key] ? (
                      <image 
                        href={planetTextures[key]} 
                        x={-r} 
                        y={-r} 
                        width={r * 2} 
                        height={r * 2} 
                        preserveAspectRatio="none"
                        clipPath={`url(#clip-${key})`} 
                      />
                    ) : (
                      <circle cx="0" cy="0" r={r} fill={p.color} />
                    )}

                    {/* Earth Atmospheric Cyan Glow Halo */}
                    {key === 'earth' && (
                      <circle cx="0" cy="0" r={r + 1.2} fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.85" />
                    )}

                    {/* Universal 3D Spherical Light Shadow Overlay */}
                    <circle cx="0" cy="0" r={r} fill="url(#sphere3DShade)" style={{ pointerEvents: 'none' }} />
                  </g>

                  {/* Full Planet Name Tag (Tên đầy đủ của hành tinh) */}
                  <text 
                    x="0" y={-r - 8} 
                    fill={isSel ? '#38bdf8' : '#ffffff'} 
                    fontSize="10" fontWeight={isSel ? 900 : 800} 
                    textAnchor="middle" 
                    style={{ cursor: 'pointer', textShadow: '0 2px 6px rgba(0,0,0,0.95)' }}
                    onClick={() => handleSelectCelestial(key)}
                  >
                    {p.shortName}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Side Info Modal / Panel matching Aslan.io.vn */}
        {activePlanet && (
          <div style={{
            position: 'absolute', top: '75px', left: '20px', maxWidth: '340px',
            background: 'rgba(15, 23, 42, 0.94)', backdropFilter: 'blur(12px)',
            border: `2px solid ${activePlanet.color}`, borderRadius: '16px',
            padding: '18px', color: '#f8fafc', boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
            animation: 'fadeIn 0.25s ease-out', zIndex: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: activePlanet.color, display: 'inline-block', boxShadow: `0 0 10px ${activePlanet.color}` }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: activePlanet.color, margin: 0 }}>
                  {activePlanet.name}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedPlanetKey(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#cbd5e1', borderRadius: '6px', width: '26px', height: '26px', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}
                title="Quay về tổng quan"
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>• Khoảng cách tới Mặt Trời: <b style={{ color: '#fff' }}>{activePlanet.dist}</b></div>
              <div>• Chu kỳ quỹ đạo: <b style={{ color: '#fff' }}>{activePlanet.period}</b></div>
              <div>• Đường kính: <b style={{ color: '#fff' }}>{activePlanet.size}</b></div>
              <div>• Nhiệt độ: <b style={{ color: '#fde047' }}>{activePlanet.temp}</b></div>
              <div>• Vệ tinh tự nhiên: <b style={{ color: '#fff' }}>{activePlanet.moons}</b></div>
              
              <div style={{ marginTop: '10px', background: 'rgba(56, 189, 248, 0.12)', borderLeft: `4px solid ${activePlanet.color}`, padding: '10px 12px', borderRadius: '0 10px 10px 0', fontSize: '0.78rem', color: '#e2e8f0' }}>
                <b>📌 Đặc điểm chi tiết:</b> {activePlanet.feature}
              </div>
              <div style={{ textAlign: 'right', marginTop: '6px', fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                (💡 Bấm lại thiên thể hoặc bấm ✕ để đóng)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Capsule Navigation Toolbar matching Aslan.io.vn */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px',
        padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'
      }}>
        {/* Celestial body chips bar matching Aslan */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', flex: 1 }}>
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
          ].map(c => {
            const p = planetData[c.key];
            const isSel = selectedPlanetKey === c.key;
            return (
              <button
                key={c.key}
                onClick={() => handleSelectCelestial(c.key)}
                style={{
                  background: isSel ? p.color : 'rgba(30, 41, 59, 0.8)',
                  color: isSel ? '#000' : '#cbd5e1',
                  border: isSel ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '6px 12px',
                  fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSel ? `0 0 12px ${p.color}` : 'none'
                }}
              >
                {c.label}
              </button>
            );
          })}

          <button
            onClick={() => setSelectedPlanetKey(null)}
            style={{
              background: selectedPlanetKey === null ? '#0d9488' : '#334155',
              color: '#fff', border: 'none', borderRadius: '12px', padding: '6px 14px',
              fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer'
            }}
          >
            🔄 QUAY VỀ TỔNG QUAN
          </button>
        </div>

        {/* Speed Slider & Play/Pause */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '14px' }}>
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Tốc độ: <b style={{ color: '#2dd4bf' }}>{speed}x</b></span>
          <input type="range" min="0.2" max="5.0" step="0.2" value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ width: '100px', accentColor: '#0d9488', cursor: 'pointer' }} />
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: isPlaying ? '#eab308' : '#0d9488', color: isPlaying ? '#000' : '#fff', border: 'none', borderRadius: '10px', padding: '7px 14px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
            {isPlaying ? '⏸️ Dừng' : '▶️ Chạy'}
          </button>
        </div>
      </div>
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
      <div style={{ flex: 1, background: '#070f1e', borderRadius: '16px', border: '1.5px solid rgba(56, 189, 248, 0.4)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 600 320" preserveAspectRatio="xMidYMid meet" className={isShaking ? "earthquake-shake" : ""}>
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

export function InteractiveExperimentCanvas({ experiment, onClose }) {
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
      case 'geo_solar_system':
        return <GeoSolarSystemSim onLog={addLog} />;
      case 'geo_earth_sun_moon':
        return <GeoEarthSunMoonSim onLog={addLog} />;
      case 'geo_volcano':
        return <GeoVolcanoSim onLog={addLog} />;
      case 'geo_earthquake':
        return <GeoEarthquakeSim onLog={addLog} />;
      case 'geo_water_cycle':
        return <GeoWaterCycleSim onLog={addLog} />;
      case 'geo_earth_structure':
        return <GeoEarthStructureSim onLog={addLog} />;
      case 'geo_glacial_river':
        return <GeoGlacialRiverSim onLog={addLog} />;
      default:
        return <ChemistryAcidBaseSim config={experiment.simulationConfig} onLog={addLog} onSensorUpdate={handleSensorUpdate} />;
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
              {experiment.title}
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
              Khối {experiment.grade} • {experiment.subject} • GDPT 2018
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
          
          {/* Zperiod Real-Time Digital Sensors HUD Bar */}
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

        {/* Right Side: Theory, Steps, & Scientific Explanation */}
        <div style={{
          flex: 1, background: 'rgba(15, 23, 42, 0.85)', borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto'
        }}>
          {/* Objective */}
          <div style={{ background: 'rgba(13, 148, 136, 0.15)', borderLeft: '4px solid #0d9488', padding: '12px 14px', borderRadius: '0 10px 10px 0' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#2dd4bf', margin: '0 0 4px 0' }}>🎯 MỤC ĐÍCH THÍ NGHIỆM / MÔ HÌNH</h4>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
              {experiment.objective}
            </p>
          </div>

          {/* Equipment & Reagents */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fde047', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🛠️ DỤNG CỤ & MÔ HÌNH THỰC HÀNH
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {experiment.equipment?.map((item, idx) => (
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
              {experiment.steps?.map((step, idx) => (
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
              {experiment.phenomenon}
            </p>
          </div>

          {/* Scientific Explanation & Equations */}
          <div style={{ background: 'rgba(147, 51, 234, 0.15)', border: '1px solid rgba(147, 51, 234, 0.3)', padding: '12px', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#c084fc', margin: '0 0 4px 0' }}>💡 GIẢI THÍCH BẢN CHẤT ĐỊA LÍ / KHOA HỌC</h4>
            <p style={{ fontSize: '0.8rem', color: '#e9d5ff', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
              {experiment.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
