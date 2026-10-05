import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Sparkles, Clock, Flame } from 'lucide-react';
import { SoundFX } from '../../utils/sound';

export function ClassroomTimerGame({ onClose }) {
  const [totalSeconds, setTotalSeconds] = useState(30); // Default 30s
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('hourglass'); // 'hourglass' | 'candle' | 'alarm' | 'led' | 'ring'
  const [isMuted, setIsMuted] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const startTimeRef = useRef(null);
  const initialTimeRef = useRef(30);

  // High precision countdown timer engine
  useEffect(() => {
    if (!isRunning) return;

    startTimeRef.current = Date.now() - (initialTimeRef.current - secondsLeft) * 1000;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, initialTimeRef.current - elapsed);

      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        setIsRunning(false);
        if (!isMuted) SoundFX.alarmBell();
      } else if (remaining <= 5 && !isMuted) {
        SoundFX.timerUrgentTick(1 + (5 - remaining) * 0.2);
      } else if (!isMuted) {
        SoundFX.timerTick();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isMuted]);

  const handleStartPause = () => {
    if (secondsLeft <= 0) {
      setSecondsLeft(totalSeconds);
      initialTimeRef.current = totalSeconds;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
    initialTimeRef.current = totalSeconds;
  };

  const setPreset = (sec) => {
    setIsRunning(false);
    setTotalSeconds(sec);
    setSecondsLeft(sec);
    initialTimeRef.current = sec;
  };

  const applyCustomInput = () => {
    const parsed = parseInt(customInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setPreset(parsed);
      setCustomInput('');
    }
  };

  const formatMMSS = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const mm = m < 10 ? `0${m}` : `${m}`;
    const ss = s < 10 ? `0${s}` : `${s}`;
    return `${mm}:${ss}`;
  };

  const progressRatio = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#090d16',
      fontFamily: "'Inter', sans-serif",
      color: '#fff',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {/* Top Controls Header */}
      <div style={{
        padding: '14px 28px',
        background: 'rgba(15, 23, 42, 0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost" style={{ color: '#fff' }}>
            ✕
          </button>
          <span style={{ fontSize: '1.4rem' }}>⏳</span>
          <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#f59e0b' }}>
            ĐỒNG HỒ ĐẾM NGƯỢC LỚP HỌC MULTI-THEME
          </span>
        </div>

        {/* Theme Selector Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '4px' }}>
          {[
            { id: 'hourglass', label: '⏳ Đồng Hồ Cát' },
            { id: 'candle', label: '🕯️ Ngọn Nến' },
            { id: 'alarm', label: '⏰ Báo Thức' },
            { id: 'led', label: '🚨 Đèn LED' },
            { id: 'ring', label: '⭕ Vòng Tròn' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTheme(t.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                border: 'none',
                background: selectedTheme === t.id ? '#f59e0b' : 'transparent',
                color: selectedTheme === t.id ? '#0f172a' : '#94a3b8',
                fontWeight: 900,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            padding: '8px 14px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          {isMuted ? 'Tắt âm' : 'Bật âm'}
        </button>
      </div>

      {/* Main Visual Animation Display Arena */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '20px'
      }}>
        {/* Theme 1: Hourglass (Đồng hồ cát) */}
        {selectedTheme === 'hourglass' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              width: '180px',
              height: '260px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px'
            }}>
              {/* Wooden Frames */}
              <div style={{ width: '100%', height: '16px', background: '#d97706', borderRadius: '8px' }} />

              {/* Glass Bulbs Container */}
              <div style={{
                width: '120px',
                height: '210px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(4px)',
                borderRadius: '50px 50px 10px 10px / 90px 90px 10px 10px',
                border: '4px solid rgba(255,255,255,0.4)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {/* Top Sand Fill */}
                <div style={{
                  width: '100%',
                  height: `${progressRatio * 50}%`,
                  background: '#f59e0b',
                  borderRadius: '0 0 50% 50%',
                  transition: 'height 1s linear'
                }} />

                {/* Sand Stream Trickle */}
                {isRunning && secondsLeft > 0 && (
                  <div style={{
                    width: '3px',
                    height: '100%',
                    background: '#fbbf24',
                    margin: '0 auto',
                    animation: 'pulse 0.5s infinite'
                  }} />
                )}

                {/* Bottom Sand Accumulation */}
                <div style={{
                  width: '100%',
                  height: `${(1 - progressRatio) * 50}%`,
                  background: '#f59e0b',
                  borderRadius: '50% 50% 0 0',
                  transition: 'height 1s linear'
                }} />
              </div>

              <div style={{ width: '100%', height: '16px', background: '#d97706', borderRadius: '8px' }} />
            </div>

            <div style={{
              fontSize: '4.5rem',
              fontWeight: 900,
              letterSpacing: '2px',
              color: '#f59e0b',
              textShadow: '0 0 30px rgba(245, 158, 11, 0.4)'
            }}>
              {formatMMSS(secondsLeft)}
            </div>
          </div>
        )}

        {/* Theme 2: Candle (Ngọn nến đếm ngược) */}
        {selectedTheme === 'candle' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              height: '280px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}>
              {/* Animated Flame */}
              {secondsLeft > 0 && (
                <div style={{
                  width: '24px',
                  height: '36px',
                  background: 'radial-gradient(ellipse at bottom, #fde047 0%, #f97316 60%, transparent 100%)',
                  borderRadius: '50% 50% 20% 20%',
                  boxShadow: '0 0 40px #f97316',
                  animation: isRunning ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none',
                  marginBottom: '-4px'
                }} />
              )}

              {/* Candle Body shrinking with time */}
              <div style={{
                width: '70px',
                height: `${Math.max(20, progressRatio * 200)}px`,
                background: 'linear-gradient(90deg, #fbcfe8 0%, #f472b6 100%)',
                borderRadius: '12px 12px 4px 4px',
                boxShadow: '0 10px 25px rgba(244, 114, 182, 0.3)',
                transition: 'height 1s linear'
              }} />

              {/* Candle Plate Stand */}
              <div style={{
                width: '120px',
                height: '14px',
                background: '#94a3b8',
                borderRadius: '50%',
                marginTop: '-4px'
              }} />
            </div>

            <div style={{
              fontSize: '4.5rem',
              fontWeight: 900,
              color: '#f472b6',
              textShadow: '0 0 30px rgba(244, 114, 182, 0.4)'
            }}>
              {formatMMSS(secondsLeft)}
            </div>
          </div>
        )}

        {/* Theme 3: Alarm Clock (Đồng hồ báo thức kim quay) */}
        {selectedTheme === 'alarm' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '10px solid #ef4444',
              boxShadow: '0 20px 50px rgba(239, 68, 68, 0.4)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Red Pie Wedge Overlay */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: `conic-gradient(#fca5a5 ${ (1 - progressRatio) * 360 }deg, transparent 0deg)`,
                opacity: 0.8
              }} />

              {/* Clock Center Pin */}
              <div style={{
                width: '16px',
                height: '16px',
                background: '#0f172a',
                borderRadius: '50%',
                zIndex: 10
              }} />

              {/* Clock Hand Sweep */}
              <div style={{
                position: 'absolute',
                width: '6px',
                height: '90px',
                background: '#ef4444',
                borderRadius: '4px',
                bottom: '50%',
                transformOrigin: 'bottom center',
                transform: `rotate(${ (1 - progressRatio) * 360 }deg)`,
                transition: 'transform 1s linear',
                zIndex: 5
              }} />
            </div>

            <div style={{
              fontSize: '4.5rem',
              fontWeight: 900,
              color: '#ef4444',
              textShadow: '0 0 30px rgba(239, 68, 68, 0.4)'
            }}>
              {formatMMSS(secondsLeft)}
            </div>
          </div>
        )}

        {/* Theme 4: Digital LED (Đèn LED Đỏ High-Contrast) */}
        {selectedTheme === 'led' && (
          <div style={{
            background: '#000000',
            border: '6px solid #1e293b',
            borderRadius: '24px',
            padding: '40px 80px',
            boxShadow: '0 0 50px rgba(239, 68, 68, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '7rem',
              fontFamily: "'Courier New', monospace",
              fontWeight: 900,
              color: secondsLeft <= 5 ? '#ef4444' : '#f87171',
              letterSpacing: '8px',
              textShadow: '0 0 40px #ef4444'
            }}>
              {formatMMSS(secondsLeft)}
            </div>
          </div>
        )}

        {/* Theme 5: Circular Ring (Vòng tròn đếm ngược) */}
        {selectedTheme === 'ring' && (
          <div style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="140"
                cy="140"
                r="120"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="16"
                fill="transparent"
              />
              <circle
                cx="140"
                cy="140"
                r="120"
                stroke={progressRatio > 0.4 ? '#10b981' : progressRatio > 0.15 ? '#f59e0b' : '#ef4444'}
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progressRatio)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              fontSize: '4.5rem',
              fontWeight: 900,
              color: '#ffffff'
            }}>
              {formatMMSS(secondsLeft)}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Presets & Controls Bar */}
      <div style={{
        padding: '20px 32px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center'
      }}>
        {/* Presets Quick Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: '15s', sec: 15 },
            { label: '30s', sec: 30 },
            { label: '1 phút', sec: 60 },
            { label: '2 phút', sec: 120 },
            { label: '3 phút', sec: 180 },
            { label: '5 phút', sec: 300 },
            { label: '10 phút', sec: 600 }
          ].map(p => (
            <button
              key={p.sec}
              onClick={() => setPreset(p.sec)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                background: totalSeconds === p.sec ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                color: totalSeconds === p.sec ? '#0f172a' : '#fff',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {p.label}
            </button>
          ))}

          {/* Custom Input */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Giây..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              style={{
                width: '80px',
                padding: '6px 10px',
                borderRadius: '10px',
                border: '1px solid #475569',
                background: '#1e293b',
                color: '#fff',
                fontWeight: 700
              }}
            />
            <button
              onClick={applyCustomInput}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Đặt
            </button>
          </div>
        </div>

        {/* Play / Pause / Reset Action Controls */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={handleStartPause}
            style={{
              padding: '12px 36px',
              borderRadius: '16px',
              background: isRunning 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 900,
              fontSize: '1.2rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isRunning ? <Pause size={22} /> : <Play size={22} />}
            {isRunning ? 'TẠM DỪNG' : 'BẮT ĐẦU'}
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: '12px 24px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RotateCcw size={20} /> ĐẶT LẠI
          </button>
        </div>
      </div>
    </div>
  );
}
