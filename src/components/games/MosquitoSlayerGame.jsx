import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Volume2, VolumeX, Maximize, Minimize, RotateCcw, Trophy, Settings, 
  Camera, CameraOff, CheckCircle2, XCircle, Clock, ArrowLeft, Users, 
  Award, Play, Edit3, Plus, Minus, Trash2, Zap, Upload, Swords, Sparkles, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { StartGameOverlay } from './StartGameOverlay';
import { parseUploadedFile } from '../../utils/universalParser';

// ==========================================
// TOP-LEVEL SUBCOMPONENTS (AGENTS.md Rule 1)
// ==========================================

/**
 * Animated Vector Mosquito SVG with flapping wings and team tint
 */
export function MosquitoSVG({ team = 'blue', isDead = false, isStunned = false, size = 80 }) {
  const isBlue = team === 'blue';
  const primaryColor = isDead ? '#64748b' : (isStunned ? '#ef4444' : (isBlue ? '#38bdf8' : '#fbbf24'));
  const wingColor = isBlue ? 'rgba(186, 230, 253, 0.75)' : 'rgba(254, 240, 138, 0.75)';

  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      filter: isStunned 
        ? 'drop-shadow(0 0 14px #ef4444)' 
        : (isBlue ? 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.8))' : 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.8))'),
      transform: isDead ? 'rotate(180deg) scale(0.8)' : (isStunned ? 'rotate(15deg) scale(0.95)' : 'none'),
      transition: 'transform 0.25s ease, filter 0.2s ease',
      userSelect: 'none',
      pointerEvents: 'none'
    }}>
      <svg viewBox="0 0 120 120" width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`glow-${team}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Buzzing Aura */}
        <circle cx="60" cy="60" r="46" fill={`url(#glow-${team})`} opacity="0.35" />

        {/* Mosquito Legs */}
        <g stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
          {/* Left Legs */}
          <path d="M 45 55 L 24 45 L 14 62" />
          <path d="M 45 65 L 18 68 L 10 85" />
          <path d="M 45 75 L 26 86 L 20 102" />
          {/* Right Legs */}
          <path d="M 75 55 L 96 45 L 106 62" />
          <path d="M 75 65 L 102 68 L 110 85" />
          <path d="M 75 75 L 94 86 L 100 102" />
        </g>

        {/* Flapping Wings Left */}
        <ellipse 
          cx="38" cy="38" rx="22" ry="10" 
          fill={wingColor} 
          stroke="#ffffff" 
          strokeWidth="1.5"
          transform="rotate(-30 38 38)"
          style={{
            transformOrigin: '50px 52px',
            animation: isDead ? 'none' : 'mosquitoWingFlapLeft 0.08s infinite alternate ease-in-out'
          }}
        />

        {/* Flapping Wings Right */}
        <ellipse 
          cx="82" cy="38" rx="22" ry="10" 
          fill={wingColor} 
          stroke="#ffffff" 
          strokeWidth="1.5"
          transform="rotate(30 82 38)"
          style={{
            transformOrigin: '70px 52px',
            animation: isDead ? 'none' : 'mosquitoWingFlapRight 0.08s infinite alternate ease-in-out'
          }}
        />

        {/* Abdomen (Thân sọc) */}
        <ellipse cx="60" cy="80" rx="14" ry="24" fill={isBlue ? '#0369a1' : '#b45309'} stroke="#ffffff" strokeWidth="2" />
        {/* Abdomen Stripes */}
        <path d="M 48 72 Q 60 76 72 72" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.9" />
        <path d="M 48 80 Q 60 84 72 80" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.9" />
        <path d="M 50 88 Q 60 92 70 88" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.9" />

        {/* Thorax (Ngực) */}
        <ellipse cx="60" cy="55" rx="13" ry="12" fill={primaryColor} stroke="#ffffff" strokeWidth="2" />

        {/* Head (Đầu) */}
        <circle cx="60" cy="38" r="10" fill={primaryColor} stroke="#ffffff" strokeWidth="1.8" />

        {/* Long Proboscis (Vòi hút nhọn) */}
        <path d="M 60 30 L 60 8" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
        <polygon points="58,10 62,10 60,4" fill="#f43f5e" />

        {/* Antennae (Râu) */}
        <path d="M 56 32 Q 46 22 40 18" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 64 32 Q 74 22 80 18" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Big Cartoon Eyes */}
        <circle cx="55" cy="36" r="4.5" fill="#ffffff" />
        <circle cx="55" cy="36" r="2.2" fill={isDead ? '#64748b' : '#0f172a'} />
        <circle cx="65" cy="36" r="4.5" fill="#ffffff" />
        <circle cx="65" cy="36" r="2.2" fill={isDead ? '#64748b' : '#0f172a'} />

        {/* Dead X Eyes */}
        {isDead && (
          <g stroke="#ef4444" strokeWidth="2">
            <line x1="52" y1="33" x2="58" y2="39" />
            <line x1="58" y1="33" x2="52" y2="39" />
            <line x1="62" y1="33" x2="68" y2="39" />
            <line x1="68" y1="33" x2="62" y2="39" />
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * Interactive Mosquito Target Component
 * Displays mosquito SVG + Option badge (A, B, C, D) + Answer Text Card
 */
export function MosquitoTarget({
  id,
  team = 'blue',
  label = 'A',
  text = '',
  x = 20,
  y = 40,
  isDead = false,
  isStunned = false,
  penaltyNotice = null,
  onSwat
}) {
  const isBlue = team === 'blue';
  const badgeBg = isBlue ? 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)' : 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)';
  const glowShadow = isStunned 
    ? '0 0 25px rgba(239, 68, 68, 0.9)' 
    : (isBlue ? '0 0 22px rgba(56, 189, 248, 0.75)' : '0 0 22px rgba(251, 191, 36, 0.75)');

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onSwat) onSwat();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        if (onSwat) onSwat();
      }}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: isDead ? 5 : (isStunned ? 15 : 20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        transition: 'transform 0.08s linear',
        filter: isDead ? 'grayscale(1) opacity(0.5)' : 'none'
      }}
    >
      {/* Floating Penalty Indicator (-2) */}
      {penaltyNotice && (
        <div style={{
          position: 'absolute',
          top: '-32px',
          fontWeight: 900,
          fontSize: '1.4rem',
          color: '#ef4444',
          background: 'rgba(0, 0, 0, 0.85)',
          padding: '2px 10px',
          borderRadius: '12px',
          border: '2px solid #ef4444',
          boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)',
          animation: 'penaltyFloat 0.7s forwards ease-out',
          pointerEvents: 'none'
        }}>
          -2
        </div>
      )}

      {/* Mosquito Character with Badge */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: isStunned ? 'shakeViolently 0.35s ease-in-out' : 'gentleHover 1.8s infinite alternate ease-in-out'
      }}>
        {/* Option Letter Badge (A, B, C, D) */}
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: badgeBg,
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2.5px solid #ffffff',
          boxShadow: glowShadow,
          zIndex: 2,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          {label}
        </div>

        <MosquitoSVG team={team} isDead={isDead} isStunned={isStunned} size={88} />
      </div>

      {/* Answer Text Card */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        border: `2px solid ${isStunned ? '#ef4444' : (isBlue ? '#38bdf8' : '#fbbf24')}`,
        borderRadius: '16px',
        padding: '6px 14px',
        color: '#ffffff',
        fontSize: '0.95rem',
        fontWeight: 700,
        maxWidth: '220px',
        textAlign: 'center',
        boxShadow: glowShadow,
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        lineHeight: 1.25,
        letterSpacing: '0.2px'
      }}>
        <span style={{ color: isBlue ? '#38bdf8' : '#fbbf24', marginRight: '6px' }}>{label}.</span>
        {text}
      </div>
    </div>
  );
}

/**
 * Top Scoreboard & Controls Header
 */
export function SlayerHeader({
  blueTeamName,
  blueScore,
  yellowTeamName,
  yellowScore,
  currentQIndex,
  totalQuestions,
  cameraActive,
  onToggleCamera,
  soundMuted,
  onToggleSound,
  onOpenSettings,
  onResetGame,
  onClose
}) {
  return (
    <div style={{
      width: '100%',
      padding: '10px 24px',
      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.75) 100%)',
      backdropFilter: 'blur(12px)',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      zIndex: 50,
      flexShrink: 0
    }}>
      {/* Left: Blue Team Score Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(56, 189, 248, 0.1) 100%)',
        border: '2px solid #38bdf8',
        borderRadius: '18px',
        padding: '6px 18px',
        boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)'
      }}>
        <div style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#38bdf8',
          boxShadow: '0 0 10px #38bdf8'
        }} />
        <div>
          <div style={{ fontSize: '0.85rem', color: '#7dd3fc', fontWeight: 700, textTransform: 'uppercase' }}>
            {blueTeamName}
          </div>
          <div style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 900, lineHeight: 1 }}>
            {blueScore} <span style={{ fontSize: '0.9rem', color: '#38bdf8' }}>điểm</span>
          </div>
        </div>
      </div>

      {/* Center: Title & Question Progress */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          padding: '4px 16px',
          borderRadius: '20px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>🦟</span>
          <span style={{ fontWeight: 900, color: '#ffffff', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
            DŨNG SĨ DIỆT MUỖI
          </span>
          <span style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px',
            marginLeft: '4px'
          }}>
            CÂU {currentQIndex + 1}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* Right: Yellow Team Score Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(251, 191, 36, 0.1) 100%)',
        border: '2px solid #fbbf24',
        borderRadius: '18px',
        padding: '6px 18px',
        boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)'
      }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: '#fde68a', fontWeight: 700, textTransform: 'uppercase' }}>
            {yellowTeamName}
          </div>
          <div style={{ fontSize: '1.6rem', color: '#ffffff', fontWeight: 900, lineHeight: 1 }}>
            {yellowScore} <span style={{ fontSize: '0.9rem', color: '#fbbf24' }}>điểm</span>
          </div>
        </div>
        <div style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#fbbf24',
          boxShadow: '0 0 10px #fbbf24'
        }} />
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onToggleCamera}
          style={{
            background: cameraActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `1.5px solid ${cameraActive ? '#10b981' : '#ef4444'}`,
            color: cameraActive ? '#34d399' : '#f87171',
            borderRadius: '12px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 700
          }}
          title={cameraActive ? 'Đang bật Camera AI' : 'Bật Camera AI'}
        >
          {cameraActive ? <Camera size={16} /> : <CameraOff size={16} />}
          {cameraActive ? 'Camera ON' : 'Camera OFF'}
        </button>

        <button
          onClick={onToggleSound}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            color: '#cbd5e1',
            borderRadius: '12px',
            padding: '8px 10px',
            cursor: 'pointer'
          }}
          title={soundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button
          onClick={onOpenSettings}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            color: '#cbd5e1',
            borderRadius: '12px',
            padding: '8px 10px',
            cursor: 'pointer'
          }}
          title="Cài đặt điểm và độ nhạy"
        >
          <Settings size={16} />
        </button>

        <button
          onClick={onResetGame}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            color: '#cbd5e1',
            borderRadius: '12px',
            padding: '8px 10px',
            cursor: 'pointer'
          }}
          title="Chơi lại từ đầu"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1.5px solid #ef4444',
            color: '#fca5a5',
            borderRadius: '12px',
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 800
          }}
        >
          Thoát
        </button>
      </div>
    </div>
  );
}

/**
 * Unified Question Banner at Top Center
 */
export function QuestionBanner({ questionText, currentQIndex, totalQuestions }) {
  return (
    <div style={{
      position: 'absolute',
      top: '72px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(90vw, 920px)',
      background: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(16px)',
      borderRadius: '24px',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255,255,255,0.2)',
      padding: '16px 28px',
      textAlign: 'center',
      zIndex: 40,
      pointerEvents: 'none'
    }}>
      <div style={{
        display: 'inline-block',
        fontSize: '0.85rem',
        fontWeight: 800,
        color: '#a5f3fc',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '4px'
      }}>
        🎯 CÂU HỎI {currentQIndex + 1}/{totalQuestions}
      </div>
      <div style={{
        fontSize: 'clamp(1.15rem, 2.2vw, 1.65rem)',
        fontWeight: 900,
        color: '#ffffff',
        lineHeight: 1.35,
        textShadow: '0 2px 8px rgba(0,0,0,0.6)'
      }}>
        {questionText}
      </div>
    </div>
  );
}

/**
 * Quick Celebration Banner when a team answers correctly
 */
export function CelebrationBanner({ winnerTeam, teamName, points }) {
  const isBlue = winnerTeam === 'blue';
  const bannerBg = isBlue 
    ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.95) 0%, rgba(56, 189, 248, 0.98) 100%)' 
    : 'linear-gradient(135deg, rgba(217, 119, 6, 0.95) 0%, rgba(251, 191, 36, 0.98) 100%)';
  const glow = isBlue ? '0 0 50px rgba(56, 189, 248, 0.9)' : '0 0 50px rgba(251, 191, 36, 0.9)';

  return (
    <div style={{
      position: 'absolute',
      top: '48%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 100,
      background: bannerBg,
      padding: '24px 48px',
      borderRadius: '32px',
      border: '4px solid #ffffff',
      boxShadow: glow,
      textAlign: 'center',
      animation: 'popInCelebration 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      pointerEvents: 'none'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '4px' }}>
        🎉 🦟 💥
      </div>
      <h2 style={{
        fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
        fontWeight: 900,
        color: '#ffffff',
        margin: 0,
        textShadow: '0 4px 12px rgba(0,0,0,0.5)',
        letterSpacing: '1px'
      }}>
        {teamName.toUpperCase()} CHÍNH XÁC!
      </h2>
      <div style={{
        marginTop: '8px',
        display: 'inline-block',
        fontSize: '1.4rem',
        fontWeight: 900,
        background: '#ffffff',
        color: isBlue ? '#0369a1' : '#b45309',
        padding: '6px 24px',
        borderRadius: '20px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.3)'
      }}>
        +{points} ĐIỂM
      </div>
      <div style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginTop: '8px', opacity: 0.9 }}>
        ⚡ Chuyển câu hỏi tiếp theo...
      </div>
    </div>
  );
}

/**
 * Grand Victory Modal at Game Completion
 */
export function VictoryModal({
  blueTeamName,
  blueScore,
  yellowTeamName,
  yellowScore,
  totalQuestions,
  onReplay,
  onUploadQuestions,
  onClose
}) {
  const isBlueWinner = blueScore > yellowScore;
  const isYellowWinner = yellowScore > blueScore;
  const isTie = blueScore === yellowScore;

  const winnerTitle = isTie 
    ? '🤝 HAI ĐỘI HÒA NHAU!' 
    : (isBlueWinner ? `🏆 ${blueTeamName.toUpperCase()} CHIẾN THẮNG!` : `🏆 ${yellowTeamName.toUpperCase()} CHIẾN THẮNG!`);

  const winnerColor = isTie ? '#a855f7' : (isBlueWinner ? '#38bdf8' : '#fbbf24');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
        border: `3px solid ${winnerColor}`,
        borderRadius: '32px',
        boxShadow: `0 25px 70px rgba(0, 0, 0, 0.8), 0 0 50px ${winnerColor}44`,
        padding: '36px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        animation: 'popInCelebration 0.4s ease-out'
      }}>
        <div style={{ fontSize: '4.5rem', lineHeight: 1 }}>
          {isTie ? '🤝' : '🏆'}
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
          fontWeight: 900,
          color: winnerColor,
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          {winnerTitle}
        </h1>

        <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>
          Đã hoàn thành toàn bộ {totalQuestions} câu hỏi trong trận đấu "Dũng Sĩ Diệt Muỗi"!
        </p>

        {/* Score Comparison Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          width: '100%',
          marginTop: '10px'
        }}>
          {/* Blue Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%)',
            border: `2px solid ${isBlueWinner ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'}`,
            borderRadius: '20px',
            padding: '16px',
            boxShadow: isBlueWinner ? '0 0 25px rgba(56, 189, 248, 0.4)' : 'none'
          }}>
            <div style={{ color: '#7dd3fc', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>
              {blueTeamName}
            </div>
            <div style={{ color: '#ffffff', fontWeight: 900, fontSize: '2.5rem', margin: '4px 0' }}>
              {blueScore}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>tổng điểm ghi được</div>
          </div>

          {/* Yellow Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)',
            border: `2px solid ${isYellowWinner ? '#fbbf24' : 'rgba(251, 191, 36, 0.4)'}`,
            borderRadius: '20px',
            padding: '16px',
            boxShadow: isYellowWinner ? '0 0 25px rgba(251, 191, 36, 0.4)' : 'none'
          }}>
            <div style={{ color: '#fde68a', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>
              {yellowTeamName}
            </div>
            <div style={{ color: '#ffffff', fontWeight: 900, fontSize: '2.5rem', margin: '4px 0' }}>
              {yellowScore}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>tổng điểm ghi được</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
          <button
            onClick={onReplay}
            style={{
              padding: '14px 28px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
            }}
          >
            <RotateCcw size={18} />
            Chơi Lại Trận Này
          </button>

          <button
            onClick={onUploadQuestions}
            style={{
              padding: '14px 24px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Upload size={18} />
            Nhập Đề Thi Mới
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '14px 24px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1.5px solid #ef4444',
              color: '#fca5a5',
              fontWeight: 800,
              fontSize: '1.05rem',
              cursor: 'pointer'
            }}
          >
            Thoát
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Settings Modal for Scoring & Camera Sensitivity
 */
export function SlayerSettingsModal({
  pointsPerCorrect,
  setPointsPerCorrect,
  penaltyPerWrong,
  setPenaltyPerWrong,
  sensitivity,
  setSensitivity,
  speedLevel,
  setSpeedLevel,
  onClose
}) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#1e293b',
        border: '2px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        padding: '28px 24px',
        color: '#ffffff',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>⚙️ Cài Đặt Game Diệt Muỗi</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.4rem' }}>✕</button>
        </div>

        {/* Points Per Correct */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            🎯 Điểm cộng khi đập đúng (mặc định +5):
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {[3, 5, 10, 15].map(pts => (
              <button
                key={pts}
                onClick={() => setPointsPerCorrect(pts)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '12px',
                  background: pointsPerCorrect === pts ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontWeight: 800,
                  border: pointsPerCorrect === pts ? '2px solid #34d399' : '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer'
                }}
              >
                +{pts}
              </button>
            ))}
          </div>
        </div>

        {/* Penalty Per Wrong */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            ❌ Điểm trừ khi đập sai (mặc định -2):
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {[0, 1, 2, 5].map(pen => (
              <button
                key={pen}
                onClick={() => setPenaltyPerWrong(pen)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '12px',
                  background: penaltyPerWrong === pen ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontWeight: 800,
                  border: penaltyPerWrong === pen ? '2px solid #f87171' : '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer'
                }}
              >
                -{pen}
              </button>
            ))}
          </div>
        </div>

        {/* Camera Sensitivity */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            📷 Độ nhạy vung tay Camera AI:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {[
              { id: 'low', label: 'Thấp' },
              { id: 'normal', label: 'Vừa Chuẩn' },
              { id: 'high', label: 'Rất Nhạy' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSensitivity(item.id)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '12px',
                  background: sensitivity === item.id ? '#0284c7' : 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontWeight: 800,
                  border: sensitivity === item.id ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flight Speed */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            🦟 Tốc độ muỗi bay lượn:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {[
              { id: 'slow', label: 'Chậm Rãi' },
              { id: 'normal', label: 'Tự Nhiên' },
              { id: 'fast', label: 'Lượn Nhanh' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSpeedLevel(item.id)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '12px',
                  background: speedLevel === item.id ? '#d97706' : 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontWeight: 800,
                  border: speedLevel === item.id ? '2px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 800,
            fontSize: '1.05rem',
            cursor: 'pointer'
          }}
        >
          Lưu Cài Đặt
        </button>
      </div>
    </div>
  );
}

// ==========================================
// DEFAULT MULTI-SUBJECT QUESTIONS
// ==========================================
const DEFAULT_MOSQUITO_QUESTIONS = [
  {
    question: 'Hành tinh nào được mệnh danh là "Hành tinh Đỏ" trong Hệ Mặt Trời?',
    options: ['Sao Hỏa', 'Sao Kim', 'Sao Mộc', 'Sao Thổ'],
    correct: 'A'
  },
  {
    question: 'Số nguyên tố chẵn duy nhất trong tập hợp các số tự nhiên là số nào?',
    options: ['0', '2', '4', '6'],
    correct: 'B'
  },
  {
    question: 'Thủ đô của nước Pháp là thành phố hoa lệ nào?',
    options: ['London', 'Berlin', 'Paris', 'Rome'],
    correct: 'C'
  },
  {
    question: 'Chất khí nào chiếm thể tích lớn nhất trong không khí quyển Trái Đất?',
    options: ['Khí Ô-xi (O2)', 'Khí Carbonic (CO2)', 'Khí Hydro (H2)', 'Khí Nitơ (N2)'],
    correct: 'D'
  },
  {
    question: 'Loài động vật có vú nào trên cạn có tốc độ chạy nhanh nhất thế giới?',
    options: ['Báo săn Cheetah', 'Sư tử đồng cỏ', 'Ngựa hoang', 'Linh dương'],
    correct: 'A'
  },
  {
    question: 'Sông Mê Kông chảy qua bao nhiêu quốc gia trước khi đổ ra biển Đông?',
    options: ['4 quốc gia', '6 quốc gia', '8 quốc gia', '10 quốc gia'],
    correct: 'B'
  },
  {
    question: 'Trong tiếng Anh, từ "Butterfly" mang ý nghĩa là con gì?',
    options: ['Con ong mật', 'Con chuồn chuồn', 'Con bướm', 'Con muỗi'],
    correct: 'C'
  },
  {
    question: 'Năm 1975 gắn liền với sự kiện lịch sử trọng đại nào của dân tộc Việt Nam?',
    options: ['Cách mạng Tháng Tám', 'Chiến thắng Điện Biên Phủ', 'Giải phóng miền Nam thống nhất', 'Ký Hiệp định Paris'],
    correct: 'C'
  }
];

// ==========================================
// MAIN MOSQUITO SLAYER GAME COMPONENT
// ==========================================
export function MosquitoSlayerGame({ 
  questions: propQuestions = [], 
  teams = [], 
  onAddPoints, 
  onClose,
  game
}) {
  const fileInputRef = useRef(null);
  const [customQuestions, setCustomQuestions] = useState(null);

  // Fallback safe questions
  const activeQuestionsList = useMemo(() => {
    if (Array.isArray(customQuestions) && customQuestions.length > 0) return customQuestions;
    if (Array.isArray(propQuestions) && propQuestions.length > 0) return propQuestions;
    if (Array.isArray(game?.questions) && game.questions.length > 0) return game.questions;
    return DEFAULT_MOSQUITO_QUESTIONS;
  }, [customQuestions, propQuestions, game]);

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Teams Setup
  const blueTeamObj = (teams && teams.find(t => t.color === '#3b82f6' || t.name?.includes('Xanh'))) || (teams && teams[0]) || { name: 'Đội Xanh', score: 0 };
  const yellowTeamObj = (teams && teams.find(t => t.color === '#eab308' || t.color === '#fbbf24' || t.name?.includes('Vàng'))) || (teams && teams[1]) || { name: 'Đội Vàng', score: 0 };

  const blueTeamIndex = teams ? teams.findIndex(t => t.id === blueTeamObj?.id) : 0;
  const yellowTeamIndex = teams ? teams.findIndex(t => t.id === yellowTeamObj?.id) : 1;

  const blueTeamName = blueTeamObj?.name || 'Đội Xanh';
  const yellowTeamName = yellowTeamObj?.name || 'Đội Vàng';

  const [blueScore, setBlueScore] = useState(0);
  const [yellowScore, setYellowScore] = useState(0);

  // Scoring Rules
  const [pointsPerCorrect, setPointsPerCorrect] = useState(5);
  const [penaltyPerWrong, setPenaltyPerWrong] = useState(2);
  const [sensitivity, setSensitivity] = useState('normal'); // 'low' | 'normal' | 'high'
  const [speedLevel, setSpeedLevel] = useState('normal'); // 'slow' | 'normal' | 'fast'
  const [soundMuted, setSoundMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Question Locking & Celebration
  const [isQuestionLocked, setIsQuestionLocked] = useState(false);
  const [celebration, setCelebration] = useState(null); // { winnerTeam, teamName, points }
  const [stunnedMosquitoes, setStunnedMosquitoes] = useState({}); // { [id]: true }
  const [penaltyNotices, setPenaltyNotices] = useState({}); // { [id]: true }

  // Camera & Vision Detection Refs
  const videoRef = useRef(null);
  const motionCanvasRef = useRef(null);
  const prevFrameDataRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(true);

  // Swat reticles tracked by camera motion
  const [blueReticle, setBlueReticle] = useState({ x: 25, y: 50, visible: false });
  const [yellowReticle, setYellowReticle] = useState({ x: 75, y: 50, visible: false });

  // Cooldown tracker to prevent duplicate swats within 600ms
  const lastSwatTimeRef = useRef({});

  // Current Question Data
  const currentQ = activeQuestionsList[currentQIndex % activeQuestionsList.length];
  const qOptions = useMemo(() => {
    if (!currentQ || !Array.isArray(currentQ.options)) return ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'];
    return currentQ.options.slice(0, 4);
  }, [currentQ]);

  // Determine correct option index (0 = A, 1 = B, 2 = C, 3 = D)
  const correctOptionIndex = useMemo(() => {
    if (!currentQ) return 0;
    if (typeof currentQ.correct === 'number') return currentQ.correct;
    if (typeof currentQ.correct === 'string') {
      const c = currentQ.correct.trim().toUpperCase();
      if (c === 'A' || c === '1') return 0;
      if (c === 'B' || c === '2') return 1;
      if (c === 'C' || c === '3') return 2;
      if (c === 'D' || c === '4') return 3;
      const idx = qOptions.findIndex(opt => String(opt).trim().toLowerCase() === c.toLowerCase());
      if (idx !== -1) return idx;
    }
    return 0;
  }, [currentQ, qOptions]);

  // ==========================================
  // FLYING MOSQUITOES SIMULATION STATE
  // ==========================================
  // Blue territory: X in [5%, 43%], Y in [22%, 76%]
  // Yellow territory: X in [57%, 95%], Y in [22%, 76%]
  const baseSpeed = speedLevel === 'slow' ? 0.35 : (speedLevel === 'fast' ? 0.95 : 0.65);

  const initialMosquitoesState = useMemo(() => {
    const list = [];
    const labels = ['A', 'B', 'C', 'D'];

    // Blue Team Mosquitoes (Left Side)
    qOptions.forEach((optText, idx) => {
      const startX = 10 + (idx % 2) * 20;
      const startY = 28 + Math.floor(idx / 2) * 28;
      list.push({
        id: `blue_${idx}`,
        team: 'blue',
        optionIndex: idx,
        label: labels[idx],
        text: optText,
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * baseSpeed,
        vy: (Math.random() - 0.5) * baseSpeed,
        minX: 5,
        maxX: 43,
        minY: 22,
        maxY: 76,
        flutter: Math.random() * 10
      });
    });

    // Yellow Team Mosquitoes (Right Side)
    qOptions.forEach((optText, idx) => {
      const startX = 62 + (idx % 2) * 20;
      const startY = 28 + Math.floor(idx / 2) * 28;
      list.push({
        id: `yellow_${idx}`,
        team: 'yellow',
        optionIndex: idx,
        label: labels[idx],
        text: optText,
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * baseSpeed,
        vy: (Math.random() - 0.5) * baseSpeed,
        minX: 57,
        maxX: 95,
        minY: 22,
        maxY: 76,
        flutter: Math.random() * 10
      });
    });

    return list;
  }, [qOptions, baseSpeed]);

  const [mosquitoes, setMosquitoes] = useState(initialMosquitoesState);
  const mosquitoesRef = useRef(initialMosquitoesState);

  // Sync ref when question changes
  useEffect(() => {
    mosquitoesRef.current = initialMosquitoesState;
    setMosquitoes(initialMosquitoesState);
    setStunnedMosquitoes({});
    setPenaltyNotices({});
  }, [initialMosquitoesState]);

  // ==========================================
  // CAMERA INITIALIZATION & CLEANUP
  // ==========================================
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('getUserMedia not supported in this browser.');
        setCameraActive(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // ==========================================
  // CORE SWAT LOGIC & RULES
  // ==========================================
  const handleSwat = useCallback((team, optionIndex) => {
    if (isQuestionLocked || isGameOver) return;

    const mosquitoId = `${team}_${optionIndex}`;
    const now = Date.now();
    if (lastSwatTimeRef.current[mosquitoId] && (now - lastSwatTimeRef.current[mosquitoId] < 650)) {
      return; // Debounce duplicate triggers
    }
    lastSwatTimeRef.current[mosquitoId] = now;

    const isCorrect = optionIndex === correctOptionIndex;
    const teamName = team === 'blue' ? blueTeamName : yellowTeamName;

    if (isCorrect) {
      // 1. Lock the question immediately so no other team can swat
      setIsQuestionLocked(true);

      // 2. Award points to this team
      if (team === 'blue') {
        setBlueScore(prev => prev + pointsPerCorrect);
        if (onAddPoints) onAddPoints(blueTeamIndex, pointsPerCorrect);
      } else {
        setYellowScore(prev => prev + pointsPerCorrect);
        if (onAddPoints) onAddPoints(yellowTeamIndex, pointsPerCorrect);
      }

      // 3. Audio & Confetti burst
      try {
        if (!soundMuted) SoundFX.correct();
        confetti({
          particleCount: 140,
          spread: 100,
          origin: { x: team === 'blue' ? 0.28 : 0.72, y: 0.55 }
        });
      } catch (e) {}

      // 4. Show Celebration Banner
      setCelebration({
        winnerTeam: team,
        teamName: teamName,
        points: pointsPerCorrect
      });

      // 5. Swiftly advance to next question after 1.8s
      setTimeout(() => {
        setCelebration(null);
        setIsQuestionLocked(false);
        if (currentQIndex + 1 < activeQuestionsList.length) {
          setCurrentQIndex(prev => prev + 1);
        } else {
          setIsGameOver(true);
          try {
            if (!soundMuted) SoundFX.fanfare();
            confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 } });
          } catch (e) {}
        }
      }, 1800);

    } else {
      // Wrong Answer: Penalty & Stun effect, but question CONTINUES!
      if (team === 'blue') {
        setBlueScore(prev => Math.max(0, prev - penaltyPerWrong));
        if (onAddPoints) onAddPoints(blueTeamIndex, -penaltyPerWrong);
      } else {
        setYellowScore(prev => Math.max(0, prev - penaltyPerWrong));
        if (onAddPoints) onAddPoints(yellowTeamIndex, -penaltyPerWrong);
      }

      try {
        if (!soundMuted) SoundFX.wrong();
      } catch (e) {}

      // Trigger temporary stun animation & floating penalty
      setStunnedMosquitoes(prev => ({ ...prev, [mosquitoId]: true }));
      setPenaltyNotices(prev => ({ ...prev, [mosquitoId]: true }));

      setTimeout(() => {
        setPenaltyNotices(prev => {
          const next = { ...prev };
          delete next[mosquitoId];
          return next;
        });
      }, 700);

      setTimeout(() => {
        setStunnedMosquitoes(prev => {
          const next = { ...prev };
          delete next[mosquitoId];
          return next;
        });
      }, 600);
    }
  }, [
    isQuestionLocked, isGameOver, correctOptionIndex, blueTeamName, yellowTeamName,
    pointsPerCorrect, penaltyPerWrong, onAddPoints, blueTeamIndex, yellowTeamIndex,
    soundMuted, currentQIndex, activeQuestionsList.length
  ]);

  // ==========================================
  // REAL-TIME PHYSICS & CAMERA MOTION LOOP (60 FPS)
  // ==========================================
  useEffect(() => {
    if (!isGameStarted || isGameOver) return;

    let animId = null;
    let lastTime = performance.now();

    // Prepare offscreen canvas for motion differencing
    let offscreenCanvas = motionCanvasRef.current;
    if (!offscreenCanvas) {
      offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = 160;
      offscreenCanvas.height = 120;
      motionCanvasRef.current = offscreenCanvas;
    }
    const offCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    // Sensitivity threshold mapping
    const energyThreshold = sensitivity === 'high' ? 18 : (sensitivity === 'low' ? 38 : 26);

    const gameLoop = (currentTime) => {
      const dt = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      // ----------------------------------------
      // 1. UPDATE FLYING MOSQUITOES PHYSICS
      // ----------------------------------------
      if (!isQuestionLocked) {
        const currentList = mosquitoesRef.current;
        const updatedList = currentList.map(m => {
          let { x, y, vx, vy, minX, maxX, minY, maxY, flutter } = m;

          flutter += 0.15;
          x += vx * (dt / 16);
          y += vy * (dt / 16) + Math.sin(flutter) * 0.18;

          // Bounce off boundaries
          if (x < minX) { x = minX; vx = Math.abs(vx); }
          if (x > maxX) { x = maxX; vx = -Math.abs(vx); }
          if (y < minY) { y = minY; vy = Math.abs(vy); }
          if (y > maxY) { y = maxY; vy = -Math.abs(vy); }

          // Slight random drift
          if (Math.random() < 0.04) {
            vx += (Math.random() - 0.5) * 0.25;
            vy += (Math.random() - 0.5) * 0.25;
            const spd = Math.hypot(vx, vy);
            if (spd > baseSpeed * 1.6) {
              vx = (vx / spd) * baseSpeed * 1.6;
              vy = (vy / spd) * baseSpeed * 1.6;
            }
          }

          return { ...m, x, y, vx, vy, flutter };
        });

        mosquitoesRef.current = updatedList;
        setMosquitoes(updatedList);
      }

      // ----------------------------------------
      // 2. CAMERA MOTION DIFFERENCING & SWAT DETECTION
      // ----------------------------------------
      if (videoRef.current && cameraActive && videoRef.current.readyState >= 2 && offCtx) {
        const video = videoRef.current;
        const W = 160;
        const H = 120;

        // Draw flipped video so canvas coordinates align 1:1 with mirrored camera view!
        offCtx.save();
        offCtx.translate(W, 0);
        offCtx.scale(-1, 1);
        offCtx.drawImage(video, 0, 0, W, H);
        offCtx.restore();

        const currentFrame = offCtx.getImageData(0, 0, W, H);
        const currData = currentFrame.data;
        const prevData = prevFrameDataRef.current;

        if (prevData) {
          let blueMotionCount = 0;
          let blueSumX = 0;
          let blueSumY = 0;

          let yellowMotionCount = 0;
          let yellowSumX = 0;
          let yellowSumY = 0;

          // Track motion pixels per mosquito bounding area
          const mosquitoHits = {};

          for (let y = 12; y < H - 10; y += 2) {
            for (let x = 8; x < W - 8; x += 2) {
              const idx = (y * W + x) * 4;
              const diff = Math.abs(currData[idx] - prevData[idx]) +
                           Math.abs(currData[idx + 1] - prevData[idx + 1]) +
                           Math.abs(currData[idx + 2] - prevData[idx + 2]);

              if (diff > 42) {
                // Left side (Blue) vs Right side (Yellow)
                if (x < W / 2) {
                  blueMotionCount++;
                  blueSumX += x;
                  blueSumY += y;
                } else {
                  yellowMotionCount++;
                  yellowSumX += x;
                  yellowSumY += y;
                }

                // Check collision with mosquitoes (normalized % to canvas coords)
                if (!isQuestionLocked) {
                  mosquitoesRef.current.forEach(m => {
                    const cx = (m.x / 100) * W;
                    const cy = (m.y / 100) * H;
                    const distSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
                    if (distSq < 130) { // ~11px radius on 160x120 canvas
                      mosquitoHits[m.id] = (mosquitoHits[m.id] || 0) + 1;
                    }
                  });
                }
              }
            }
          }

          // Update Blue Reticle
          if (blueMotionCount > 15) {
            const bx = (blueSumX / blueMotionCount / W) * 100;
            const by = (blueSumY / blueMotionCount / H) * 100;
            setBlueReticle({ x: bx, y: by, visible: true });
          } else {
            setBlueReticle(prev => ({ ...prev, visible: false }));
          }

          // Update Yellow Reticle
          if (yellowMotionCount > 15) {
            const yx = (yellowSumX / yellowMotionCount / W) * 100;
            const yy = (yellowSumY / yellowMotionCount / H) * 100;
            setYellowReticle({ x: yx, y: yy, visible: true });
          } else {
            setYellowReticle(prev => ({ ...prev, visible: false }));
          }

          // Trigger Swat if motion burst exceeds threshold
          if (!isQuestionLocked) {
            for (const [mId, hits] of Object.entries(mosquitoHits)) {
              if (hits >= energyThreshold) {
                const target = mosquitoesRef.current.find(m => m.id === mId);
                if (target) {
                  handleSwat(target.team, target.optionIndex);
                  break; // Handle single hit per frame
                }
              }
            }
          }
        }

        prevFrameDataRef.current = currData;
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isGameStarted, isGameOver, isQuestionLocked, cameraActive, sensitivity, baseSpeed, handleSwat]);

  // ==========================================
  // CUSTOM QUESTION FILE UPLOAD HANDLER
  // ==========================================
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCustomQuestions(parsed);
        setCurrentQIndex(0);
        setBlueScore(0);
        setYellowScore(0);
        setIsGameOver(false);
        setIsQuestionLocked(false);
        try { SoundFX.correct(); } catch(err) {}
        alert(`Đã nhập thành công ${parsed.length} câu hỏi mới cho game Dũng Sĩ Diệt Muỗi!`);
      } else {
        alert('Không tìm thấy danh sách câu hỏi hợp lệ trong tệp.');
      }
    } catch (err) {
      alert('Lỗi tải tệp: ' + err.message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetGame = () => {
    setCurrentQIndex(0);
    setBlueScore(0);
    setYellowScore(0);
    setIsGameOver(false);
    setIsQuestionLocked(false);
    setCelebration(null);
  };

  // ==========================================
  // RENDER: PRE-GAME OVERLAY
  // ==========================================
  if (!isGameStarted) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#090d16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 999999
      }}>
        {/* Hidden File Input for Question Upload */}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept=".xlsx,.xls,.docx,.doc,.txt,.csv" 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
        />

        <StartGameOverlay
          title="DŨNG SĨ DIỆT MUỖI"
          icon="🦟"
          subtitle="Tương tác Camera AI 2 Đội Đối Kháng. Các con muỗi mang đáp án A-B-C-D bay lượn liên tục. Hai đội vung tay đập muỗi nhanh nhất để ghi điểm!"
          description="Đội nào đập đúng con muỗi trước sẽ giành +5 điểm và khóa câu hỏi của đối phương. Đập sai bị trừ -2 điểm! Hỗ trợ camera vung tay hoặc chạm cảm ứng trực tiếp."
          onStart={() => setIsGameStarted(true)}
          onUpload={() => fileInputRef.current?.click()}
        />
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN CAMERA GAME ARENA
  // ==========================================
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      background: '#090d16',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
      zIndex: 999999
    }}>
      {/* Hidden File Input */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept=".xlsx,.xls,.docx,.doc,.txt,.csv" 
        style={{ display: 'none' }} 
        onChange={handleFileUpload} 
      />

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes mosquitoWingFlapLeft {
          0% { transform: rotate(-30deg) scaleY(1); }
          100% { transform: rotate(-5deg) scaleY(0.7); }
        }
        @keyframes mosquitoWingFlapRight {
          0% { transform: rotate(30deg) scaleY(1); }
          100% { transform: rotate(5deg) scaleY(0.7); }
        }
        @keyframes gentleHover {
          0% { transform: translateY(-4px) rotate(-2deg); }
          100% { transform: translateY(4px) rotate(2deg); }
        }
        @keyframes shakeViolently {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-8px, 4px) rotate(-10deg); }
          40% { transform: translate(8px, -4px) rotate(10deg); }
          60% { transform: translate(-6px, -3px) rotate(-6deg); }
          80% { transform: translate(6px, 3px) rotate(6deg); }
        }
        @keyframes penaltyFloat {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(1.3); }
        }
        @keyframes popInCelebration {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
          70% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes laserPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.85; }
        }
      `}</style>

      {/* Top Header */}
      <SlayerHeader
        blueTeamName={blueTeamName}
        blueScore={blueScore}
        yellowTeamName={yellowTeamName}
        yellowScore={yellowScore}
        currentQIndex={currentQIndex}
        totalQuestions={activeQuestionsList.length}
        cameraActive={cameraActive}
        onToggleCamera={() => {
          if (cameraActive) stopCamera();
          else startCamera();
        }}
        soundMuted={soundMuted}
        onToggleSound={() => setSoundMuted(!soundMuted)}
        onOpenSettings={() => setShowSettings(true)}
        onResetGame={handleResetGame}
        onClose={onClose}
      />

      {/* Unified Top Question Banner */}
      <QuestionBanner
        questionText={currentQ.question}
        currentQIndex={currentQIndex}
        totalQuestions={activeQuestionsList.length}
      />

      {/* Main Dual Arena (Live Camera + Mosquito Swarms) */}
      <div style={{
        flex: 1,
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        {/* Mirrored Live Camera Feed Background */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirrored feed
            opacity: cameraActive ? 0.72 : 0,
            transition: 'opacity 0.4s ease',
            zIndex: 1
          }}
        />

        {/* Fallback Virtual Classroom Background when camera is off */}
        {!cameraActive && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 60%, #020617 100%)',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: '4rem', opacity: 0.5 }}>📷</div>
            <div style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 600 }}>
              Camera đang tắt. Bạn có thể chạm hoặc nhấp chuột trực tiếp vào con muỗi để đập!
            </div>
            <button
              onClick={startCamera}
              style={{
                marginTop: '10px',
                padding: '10px 24px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Bật Lại Camera AI
            </button>
          </div>
        )}

        {/* Territory Overlays: Blue (Left) & Yellow (Right) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(2, 132, 199, 0.18) 0%, rgba(2, 132, 199, 0.04) 100%)',
          borderRight: '2px dashed rgba(56, 189, 248, 0.3)',
          pointerEvents: 'none',
          zIndex: 2
        }}>
          {/* Blue Side Badge */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(2, 132, 199, 0.35)',
            border: '1.5px solid #38bdf8',
            padding: '6px 16px',
            borderRadius: '16px',
            color: '#7dd3fc',
            fontWeight: 800,
            fontSize: '0.9rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🔵</span> KHU VỰC {blueTeamName.toUpperCase()}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(270deg, rgba(217, 119, 6, 0.18) 0%, rgba(217, 119, 6, 0.04) 100%)',
          borderLeft: '2px dashed rgba(251, 191, 36, 0.3)',
          pointerEvents: 'none',
          zIndex: 2
        }}>
          {/* Yellow Side Badge */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(217, 119, 6, 0.35)',
            border: '1.5px solid #fbbf24',
            padding: '6px 16px',
            borderRadius: '16px',
            color: '#fde68a',
            fontWeight: 800,
            fontSize: '0.9rem'
          }}>
            KHU VỰC {yellowTeamName.toUpperCase()} <span style={{ fontSize: '1.2rem' }}>🟡</span>
          </div>
        </div>

        {/* Center Futuristic Dividing Laser */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: '4px',
          height: '100%',
          background: 'linear-gradient(180deg, #38bdf8 0%, #ec4899 50%, #fbbf24 100%)',
          boxShadow: '0 0 16px rgba(236, 72, 153, 0.8)',
          transform: 'translateX(-50%)',
          zIndex: 3,
          pointerEvents: 'none',
          animation: 'laserPulse 2s infinite ease-in-out'
        }} />

        {/* Center VS Swords Marker */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '3px solid #ffffff',
          boxShadow: '0 0 25px rgba(255, 255, 255, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4,
          pointerEvents: 'none'
        }}>
          <Swords size={26} color="#ffffff" />
        </div>

        {/* Visual Swatting Hand Reticles (from camera motion) */}
        {cameraActive && blueReticle.visible && (
          <div style={{
            position: 'absolute',
            left: `${blueReticle.x}%`,
            top: `${blueReticle.y}%`,
            transform: 'translate(-50%, -50%)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '3px solid #38bdf8',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(56, 189, 248, 0.05) 100%)',
            boxShadow: '0 0 20px #38bdf8',
            pointerEvents: 'none',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'left 0.06s ease-out, top 0.06s ease-out'
          }}>
            <span style={{ fontSize: '1.6rem' }}>⚡</span>
          </div>
        )}

        {cameraActive && yellowReticle.visible && (
          <div style={{
            position: 'absolute',
            left: `${yellowReticle.x}%`,
            top: `${yellowReticle.y}%`,
            transform: 'translate(-50%, -50%)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '3px solid #fbbf24',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, rgba(251, 191, 36, 0.05) 100%)',
            boxShadow: '0 0 20px #fbbf24',
            pointerEvents: 'none',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'left 0.06s ease-out, top 0.06s ease-out'
          }}>
            <span style={{ fontSize: '1.6rem' }}>⚡</span>
          </div>
        )}

        {/* Flying Mosquito Targets */}
        {mosquitoes.map(m => (
          <MosquitoTarget
            key={m.id}
            id={m.id}
            team={m.team}
            label={m.label}
            text={m.text}
            x={m.x}
            y={m.y}
            isDead={isQuestionLocked && m.optionIndex === correctOptionIndex}
            isStunned={Boolean(stunnedMosquitoes[m.id])}
            penaltyNotice={Boolean(penaltyNotices[m.id])}
            onSwat={() => handleSwat(m.team, m.optionIndex)}
          />
        ))}

        {/* Celebration Banner when a team answers correctly */}
        {celebration && (
          <CelebrationBanner
            winnerTeam={celebration.winnerTeam}
            teamName={celebration.teamName}
            points={celebration.points}
          />
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SlayerSettingsModal
          pointsPerCorrect={pointsPerCorrect}
          setPointsPerCorrect={setPointsPerCorrect}
          penaltyPerWrong={penaltyPerWrong}
          setPenaltyPerWrong={setPenaltyPerWrong}
          sensitivity={sensitivity}
          setSensitivity={setSensitivity}
          speedLevel={speedLevel}
          setSpeedLevel={setSpeedLevel}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Victory Modal */}
      {isGameOver && (
        <VictoryModal
          blueTeamName={blueTeamName}
          blueScore={blueScore}
          yellowTeamName={yellowTeamName}
          yellowScore={yellowScore}
          totalQuestions={activeQuestionsList.length}
          onReplay={handleResetGame}
          onUploadQuestions={() => fileInputRef.current?.click()}
          onClose={onClose}
        />
      )}
    </div>
  );
}
