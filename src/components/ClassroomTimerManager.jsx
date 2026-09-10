import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Plus, Minus, Bell, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../utils/sound';

export default function ClassroomTimerManager() {
  const [totalSeconds, setTotalSeconds] = useState(180); // Default 3 minutes
  const [timeLeft, setTimeLeft] = useState(180);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Custom inputs
  const [customMin, setCustomMin] = useState(3);
  const [customSec, setCustomSec] = useState(0);

  const timerRef = useRef(null);

  // Synchronize custom inputs when totalSeconds changes
  useEffect(() => {
    setTimeLeft(totalSeconds);
    setIsFinished(false);
    setIsRunning(false);
  }, [totalSeconds]);

  // Main Timer Countdown Loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsFinished(true);

            if (soundEnabled) {
              try { SoundFX.alarmBell(); } catch (e) {}
              try { SoundFX.fanfare(); } catch (e) {}
            }
            confetti({ particleCount: 100, spread: 80 });
            return 0;
          }

          const nextSec = prev - 1;

          // Sound effects during countdown
          if (soundEnabled) {
            if (nextSec <= 10) {
              // Urgent rapid ticks in final 10 seconds (pitch goes up as time decreases)
              const urgencyFactor = 1 + (10 - nextSec) * 0.12;
              try { SoundFX.timerUrgentTick(urgencyFactor); } catch (e) {}
            } else if (nextSec % 10 === 0 || nextSec <= 30) {
              // Regular ticks every 10s or every second in final 30s
              try { SoundFX.timerTick(); } catch (e) {}
            }
          }

          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled]);

  const handleStartPause = () => {
    if (timeLeft <= 0) return;
    if (!isRunning) {
      if (soundEnabled) try { SoundFX.click(); } catch (e) {}
      setIsFinished(false);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(totalSeconds);
    if (soundEnabled) try { SoundFX.click(); } catch (e) {}
  };

  const handleSelectPreset = (secs) => {
    setIsRunning(false);
    setIsFinished(false);
    setTotalSeconds(secs);
    setCustomMin(Math.floor(secs / 60));
    setCustomSec(secs % 60);
    if (soundEnabled) try { SoundFX.click(); } catch (e) {}
  };

  const handleApplyCustomTime = (e) => {
    e.preventDefault();
    const min = Math.max(0, parseInt(customMin) || 0);
    const sec = Math.max(0, Math.min(59, parseInt(customSec) || 0));
    const total = min * 60 + sec;
    if (total <= 0) {
      alert('Vui lòng nhập thời gian lớn hơn 0 giây.');
      return;
    }
    handleSelectPreset(total);
  };

  const handleAddMinutes = (minToAdd) => {
    const newTotal = Math.max(1, totalSeconds + minToAdd * 60);
    const newTimeLeft = Math.max(0, timeLeft + minToAdd * 60);
    setTotalSeconds(newTotal);
    setTimeLeft(newTimeLeft);
    setCustomMin(Math.floor(newTotal / 60));
    setCustomSec(newTotal % 60);
  };

  const handleAddSeconds = (secToAdd) => {
    const newTimeLeft = Math.max(0, timeLeft + secToAdd);
    setTimeLeft(newTimeLeft);
  };

  // Format time MM:SS
  const formatTimeMinutes = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}`;
  };

  const formatTimeSeconds = (secs) => {
    const s = secs % 60;
    return `${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate Ring Progress percentage
  const progressRatio = totalSeconds > 0 ? (timeLeft / totalSeconds) : 0;
  const strokeDashoffset = 565.48 * (1 - progressRatio); // 2 * PI * 90 = 565.48

  // Dynamic status color
  const statusColor = isFinished ? '#ef4444' : (timeLeft <= 10 ? '#ef4444' : (timeLeft <= 30 ? '#f59e0b' : '#0d9488'));

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
        border: '1px solid rgba(20, 184, 166, 0.4)',
        borderRadius: '24px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #0d9488 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(13, 148, 136, 0.4)'
          }}>
            <Clock size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
              Đồng Hồ Bấm Giờ Lớp Học
            </h2>
            <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
              Công cụ bấm giờ dạy học linh hoạt, âm thanh nhắc nhở dồn dập khi gần hết thời gian!
            </p>
          </div>
        </div>

        {/* Sound Toggle Button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`btn ${soundEnabled ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 18px', borderRadius: '14px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          {soundEnabled ? 'Âm Thanh Bật' : 'Đã Tắt Âm'}
        </button>
      </div>

      {/* Main Giant Clock Display Card */}
      <div style={{
        background: isFinished ? 'rgba(239, 68, 68, 0.15)' : 'rgba(30, 41, 59, 0.85)',
        border: `3px solid ${statusColor}`,
        borderRadius: '32px',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        boxShadow: isFinished 
          ? '0 0 50px rgba(239, 68, 68, 0.5), 0 20px 40px rgba(0,0,0,0.5)' 
          : (timeLeft <= 10 && isRunning ? '0 0 40px rgba(239, 68, 68, 0.4)' : '0 20px 40px rgba(0,0,0,0.4)'),
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Alarm Banner if finished */}
        {isFinished && (
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            padding: '12px 32px',
            borderRadius: '20px',
            fontSize: '1.4rem',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
            animation: 'pulse 0.5s infinite'
          }}>
            <Bell size={28} className="spin" />
            🔔 HẾT GIỜ RỒI! HÃY DỪNG BÚT VÀ LÊN BẢNG!
          </div>
        )}

        {/* Circular Progress Meter with Giant Digital Digits */}
        <div style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          <svg width="320" height="320" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
            {/* Background Ring */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="12"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={statusColor}
              strokeWidth="12"
              strokeDasharray="565.48"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: isRunning ? 'stroke-dashoffset 1s linear, stroke 0.3s ease' : 'none' }}
            />
          </svg>

          {/* Giant Clock Digits */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <div style={{
              fontSize: '5.5rem',
              fontWeight: 900,
              fontFamily: "'Inter', 'Roboto', monospace",
              color: statusColor,
              letterSpacing: '2px',
              textShadow: `0 4px 20px ${statusColor}60`,
              lineHeight: 1
            }}>
              {formatTimeMinutes(timeLeft)}:<span style={{ color: '#ffffff' }}>{formatTimeSeconds(timeLeft)}</span>
            </div>
            
            <span style={{ marginTop: '8px', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 800 }}>
              {isRunning ? '⏱️ Đang chạy đếm ngược...' : (isFinished ? '🚨 Thời gian đã kết thúc' : '⏸️ Đang tạm dừng')}
            </span>
          </div>
        </div>

        {/* Giant Main Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleStartPause}
            className="btn btn-primary"
            style={{
              padding: '16px 44px',
              borderRadius: '20px',
              fontSize: '1.25rem',
              fontWeight: 900,
              background: isRunning 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: isRunning ? '0 8px 24px rgba(245, 158, 11, 0.4)' : '0 8px 24px rgba(16, 185, 129, 0.4)'
            }}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} fill="#ffffff" />}
            {isRunning ? 'TẠM DỪNG' : 'BẮT ĐẦU'}
          </button>

          <button
            onClick={handleReset}
            className="btn btn-secondary"
            style={{
              padding: '16px 28px',
              borderRadius: '20px',
              fontSize: '1.1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RotateCcw size={22} />
            ĐẶT LẠI
          </button>

          {/* Quick Time Adjusters (+1m, -10s, +10s) */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleAddSeconds(-10)}
              className="btn btn-secondary"
              style={{ padding: '12px 16px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 800 }}
              title="Bớt 10 giây"
            >
              -10s
            </button>

            <button
              onClick={() => handleAddSeconds(10)}
              className="btn btn-secondary"
              style={{ padding: '12px 16px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 800 }}
              title="Thêm 10 giây"
            >
              +10s
            </button>

            <button
              onClick={() => handleAddMinutes(1)}
              className="btn btn-secondary"
              style={{ padding: '12px 16px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 800 }}
              title="Thêm 1 phút"
            >
              +1 phút
            </button>
          </div>
        </div>

      </div>

      {/* Preset Times & Custom Duration Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Preset Selector Grid */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h4 style={{ margin: 0, color: '#f8fafc', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#38bdf8" />
            Chọn Thời Gian Nhanh Mẫu
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              { label: '30 Giây', sec: 30 },
              { label: '1 Phút', sec: 60 },
              { label: '2 Phút', sec: 120 },
              { label: '3 Phút', sec: 180 },
              { label: '5 Phút', sec: 300 },
              { label: '10 Phút', sec: 600 },
              { label: '15 Phút', sec: 900 },
              { label: '30 Phút', sec: 1800 }
            ].map(p => (
              <button
                key={p.sec}
                onClick={() => handleSelectPreset(p.sec)}
                className={`btn ${totalSeconds === p.sec ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '12px 8px',
                  borderRadius: '14px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  background: totalSeconds === p.sec ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' : undefined
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Exact Input Form */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h4 style={{ margin: 0, color: '#f8fafc', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#f59e0b" />
            Tự Nhập Thời Gian Tùy Ý
          </h4>

          <form onSubmit={handleApplyCustomTime} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
                Số Phút
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className="input-field"
                style={{ width: '100%', height: '48px', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
                Số Giây
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={customSec}
                onChange={(e) => setCustomSec(e.target.value)}
                className="input-field"
                style={{ width: '100%', height: '48px', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ height: '48px', padding: '0 24px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 900 }}
            >
              Áp Dụng
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
