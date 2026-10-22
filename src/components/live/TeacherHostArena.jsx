import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Trophy, Users, Play, Clock, Sparkles, CheckCircle2, XCircle, 
  ArrowRight, RotateCcw, Share2, Copy, Check, Download, AlertCircle,
  Plus, Minus, Lock, Eye, Volume2, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LiveBattleService } from '../../services/liveBattleService';
import { SoundFX } from '../../utils/sound';

export function TeacherHostArena({ game, currentUser, onClose }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isAutoNext, setIsAutoNext] = useState(false);

  // Initialize room on mount
  useEffect(() => {
    let isMounted = true;
    async function initRoom() {
      try {
        setLoading(true);
        const newRoom = await LiveBattleService.createRoom(game, currentUser);
        if (isMounted) {
          setRoom(newRoom);
        }
      } catch (err) {
        console.warn("Init live room error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    initRoom();
    return () => { isMounted = false; };
  }, [game, currentUser]);

  // Host Polling Loop (Periodically syncs room from Cloud DB to receive student answers & joins)
  useEffect(() => {
    if (!room?.roomPin) return;
    const pin = room.roomPin;

    const interval = setInterval(async () => {
      try {
        const latest = await LiveBattleService.getRoom(pin);
        if (latest) {
          setRoom(prev => {
            // Only update if changes occurred to avoid unnecessary renders
            if (JSON.stringify(prev) !== JSON.stringify(latest)) {
              return latest;
            }
            return prev;
          });
        }
      } catch (e) {}
    }, 1200);

    return () => clearInterval(interval);
  }, [room?.roomPin]);

  // Question Timer
  useEffect(() => {
    if (room?.status !== 'playing' || room?.isLocked) return;
    setElapsedTime(0);

    const timer = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 1;
        const limit = room.timePerQuestion || 30;
        if (next >= limit) {
          // Auto lock when time is up
          LiveBattleService.lockQuestion(room.roomPin).then(updated => {
            if (updated) setRoom(updated);
          });
          try { SoundFX.wrong(); } catch (e) {}
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room?.status, room?.currentQuestionIndex, room?.isLocked]);

  // Copy student join link
  const handleCopyLink = () => {
    if (!room?.roomPin) return;
    const url = LiveBattleService.getStudentJoinUrl(room.roomPin);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      try { SoundFX.click(); } catch(e) {}
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Host Controls
  const handleStartBattle = async () => {
    if (!room?.roomPin) return;
    try { SoundFX.fanfare(); } catch(e) {}
    const updated = await LiveBattleService.startBattle(room.roomPin);
    if (updated) setRoom(updated);
  };

  const handleLockQuestion = async () => {
    if (!room?.roomPin) return;
    try { SoundFX.click(); } catch(e) {}
    const updated = await LiveBattleService.lockQuestion(room.roomPin);
    if (updated) setRoom(updated);
  };

  const handleRevealAnswer = async () => {
    if (!room?.roomPin) return;
    try { SoundFX.correct(); } catch(e) {}
    const updated = await LiveBattleService.revealAnswer(room.roomPin);
    if (updated) setRoom(updated);
  };

  const handleNextQuestion = async () => {
    if (!room?.roomPin) return;
    try { SoundFX.click(); } catch(e) {}
    const updated = await LiveBattleService.nextQuestion(room.roomPin);
    if (updated) {
      setRoom(updated);
      if (updated.status === 'finished') {
        try {
          SoundFX.win();
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        } catch (e) {}
      }
    }
  };

  const handleFinishEarly = async () => {
    if (!room?.roomPin) return;
    if (window.confirm("Thầy/Cô có chắc chắn muốn kết thúc trận đấu ngay bây giờ và vinh danh Bảng Vàng không?")) {
      const updated = await LiveBattleService.finishBattle(room.roomPin);
      if (updated) {
        setRoom(updated);
        try {
          SoundFX.win();
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        } catch (e) {}
      }
    }
  };

  const handleAdjustPoints = async (teamId, delta) => {
    if (!room?.roomPin) return;
    try { SoundFX.click(); } catch(e) {}
    const updated = await LiveBattleService.adjustPoints(room.roomPin, teamId, delta);
    if (updated) setRoom(updated);
  };

  const handleAddTeam = async () => {
    if (!room?.roomPin) return;
    const currentTeams = room.teams || [];
    const nextIdx = currentTeams.length + 1;
    const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#eab308', '#f97316'];
    const color = colors[(nextIdx - 1) % colors.length];
    const newTeam = {
      id: `team_${nextIdx}`,
      name: `Nhóm ${nextIdx}`,
      color,
      icon: '⭐',
      score: 0,
      connected: false,
      members: '',
      correctCount: 0
    };
    const updated = await LiveBattleService.updateRoom(room.roomPin, {
      teams: [...currentTeams, newTeam]
    });
    if (updated) setRoom(updated);
  };

  const sortedTeams = [...(room?.teams || [])].sort((a, b) => b.score - a.score);
  const currentQ = room?.questions?.[room?.currentQuestionIndex];
  const qAnswers = room?.answers?.[room?.currentQuestionIndex] || {};
  const answeredCount = Object.keys(qAnswers).length;
  const totalTeams = room?.teams?.length || 0;

  let correctLetter = currentQ?.correct ?? currentQ?.answer ?? 'A';
  if (typeof correctLetter === 'number') {
    correctLetter = ['A', 'B', 'C', 'D'][correctLetter] || 'A';
  } else {
    correctLetter = String(correctLetter).trim().toUpperCase();
  }

  if (loading || !room) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999999, background: '#0b0f19',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff'
      }}>
        <div style={{
          width: '54px', height: '54px', borderRadius: '50%',
          border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#00a896',
          animation: 'spin 0.8s linear infinite', marginBottom: '20px'
        }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Đang khởi tạo Máy Chủ Đấu Nhóm Live...</h2>
      </div>
    );
  }

  const joinUrl = LiveBattleService.getStudentJoinUrl(room.roomPin);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: '#0a0e17',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(13, 148, 136, 0.2) 0%, transparent 70%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* HOST HEADER BAR */}
      <header style={{
        padding: '12px 24px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1.5px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        zIndex: 50
      }}>
        {/* Left Info: Game & Host Server Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            padding: '8px 14px',
            borderRadius: '12px',
            fontWeight: 900,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)'
          }}>
            <ShieldCheck size={18} />
            <span>MÁY CHỦ GIÁO VIÊN</span>
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc' }}>
              {room.gameTitle}
            </h1>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              GV: <strong style={{ color: '#38bdf8' }}>{room.teacherName}</strong> • {room.questions.length} Câu hỏi • PIN: <strong style={{ color: '#facc15', fontSize: '0.9rem' }}>{room.roomPin}</strong>
            </div>
          </div>
        </div>

        {/* Center: PIN Pill for Classroom Projector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1.5px solid rgba(250, 204, 21, 0.4)',
          borderRadius: '16px',
          padding: '6px 18px'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700 }}>MÃ PHÒNG (PIN):</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#facc15', letterSpacing: '3px' }}>
            {room.roomPin}
          </span>
          <button
            onClick={handleCopyLink}
            style={{
              background: copied ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Đã sao chép' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {room.status === 'playing' && (
            <button
              onClick={handleFinishEarly}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1.5px solid #ef4444',
                color: '#fca5a5',
                borderRadius: '12px',
                padding: '7px 14px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🏁 Kết Thúc Trận Đấu
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '8px 14px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            ✕ Đóng
          </button>
        </div>
      </header>

      {/* MAIN VIEW AREA */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* SCREEN 1: LOBBY WAITING ROOM */}
        {room.status === 'lobby' && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            overflowY: 'auto'
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '2px solid rgba(13, 148, 136, 0.4)',
              borderRadius: '28px',
              padding: '36px 32px',
              maxWidth: '860px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
            }}>
              <span className="badge" style={{ background: '#f59e0b', color: '#000', fontWeight: 900, fontSize: '0.9rem', padding: '6px 18px', borderRadius: '14px', marginBottom: '14px' }}>
                📡 PHÒNG ĐẤU NHÓM LIVE TRÊN MÁY CHIẾU LỚP HỌC
              </span>

              <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '10px 0 6px 0', color: '#f8fafc' }}>
                Học sinh quét mã QR hoặc mở link để vào nhóm!
              </h2>

              <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0 0 24px 0' }}>
                Mỗi nhóm cử 1 đại diện dùng điện thoại/máy tính mở đường dẫn: <strong style={{ color: '#38bdf8' }}>{joinUrl}</strong>
              </p>

              {/* Connected Teams Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
              }}>
                {room.teams.map((team, idx) => (
                  <div key={team.id} style={{
                    background: team.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${team.connected ? '#10b981' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '18px',
                    padding: '20px 14px',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
                      {team.icon || '👥'}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: team.color }}>
                      {team.name}
                    </h3>
                    <div style={{
                      marginTop: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: team.connected ? '#10b981' : '#64748b'
                    }}>
                      {team.connected ? '🟢 ĐÃ VÀO PHÒNG' : '⚪ Đang chờ nhóm...'}
                    </div>
                    {team.members && (
                      <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#cbd5e1' }}>
                        {team.members}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Lobby Action Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAddTeam}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '14px 22px',
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={18} />
                  <span>Thêm Nhóm Đấu</span>
                </button>

                <button
                  onClick={handleStartBattle}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '16px 36px',
                    borderRadius: '18px',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 8px 30px rgba(16, 185, 129, 0.5)'
                  }}
                >
                  <Play size={24} fill="#fff" />
                  <span>🚀 BẮT ĐẦU TRẬN ĐẤU</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: LIVE BATTLE ARENA (PLAYING OR QUESTION RESULT) */}
        {(room.status === 'playing' || room.status === 'question_result') && currentQ && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Top Question Status & Timer Bar */}
            <div style={{
              padding: '14px 28px',
              background: 'rgba(30, 41, 59, 0.8)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span className="badge" style={{ background: '#0284c7', color: '#fff', fontWeight: 900, fontSize: '0.95rem', padding: '6px 16px', borderRadius: '12px' }}>
                  CÂU HỎI {room.currentQuestionIndex + 1} / {room.questions.length}
                </span>

                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 700 }}>
                  Tiến độ trả lời: <strong style={{ color: '#38bdf8', fontSize: '1.1rem' }}>{answeredCount}</strong> / {totalTeams} Nhóm
                </div>
              </div>

              {/* Host Answering Control Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {!room.isLocked && (
                  <button
                    onClick={handleLockQuestion}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 18px',
                      borderRadius: '12px',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    <Lock size={16} />
                    <span>Khóa Trả Lời</span>
                  </button>
                )}

                {!room.showAnswer ? (
                  <button
                    onClick={handleRevealAnswer}
                    style={{
                      background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 20px',
                      borderRadius: '12px',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)'
                    }}
                  >
                    <Eye size={16} />
                    <span>Công Bố Đáp Án & Điểm Số</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 22px',
                      borderRadius: '12px',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.5)'
                    }}
                  >
                    <span>Sang Câu Tiếp Theo</span>
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Question Arena (Big Screen Projection View) */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              
              {/* Left 65%: The Giant Question & Options */}
              <div style={{
                flex: '1 1 65%',
                padding: '28px 32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflowY: 'auto'
              }}>
                {/* Question Box */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '2px solid rgba(13, 148, 136, 0.4)',
                  borderRadius: '24px',
                  padding: '28px 32px',
                  marginBottom: '24px',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)'
                }}>
                  <h2 style={{
                    fontSize: '1.65rem',
                    fontWeight: 900,
                    lineHeight: 1.4,
                    color: '#f8fafc',
                    margin: 0
                  }}>
                    {currentQ.question || currentQ.title}
                  </h2>
                </div>

                {/* 4 Options Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px'
                }}>
                  {(currentQ.options || ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D']).map((opt, idx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const letter = letters[idx];
                    const isCorrect = room.showAnswer && letter === correctLetter;
                    const colors = [
                      { bg: '#ef4444', border: '#b91c1c' },
                      { bg: '#3b82f6', border: '#1d4ed8' },
                      { bg: '#f59e0b', border: '#b45309' },
                      { bg: '#10b981', border: '#047857' }
                    ];
                    const c = colors[idx % 4];

                    return (
                      <div key={idx} style={{
                        background: isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(30, 41, 59, 0.85)',
                        border: `3px solid ${isCorrect ? '#10b981' : (room.showAnswer ? 'rgba(255, 255, 255, 0.1)' : c.border)}`,
                        borderRadius: '20px',
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        boxShadow: isCorrect ? '0 0 25px rgba(16, 185, 129, 0.5)' : 'none',
                        transition: 'all 0.3s'
                      }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: c.bg,
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {letter}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', flex: 1 }}>
                          {opt}
                        </div>
                        {isCorrect && (
                          <div style={{ fontSize: '1.4rem' }}>✅</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 35%: Real-Time Leaderboard & Team Response Status */}
              <div style={{
                flex: '0 0 35%',
                background: 'rgba(15, 23, 42, 0.85)',
                borderLeft: '1.5px solid rgba(255, 255, 255, 0.12)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={20} color="#facc15" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc' }}>
                      BẢNG XẾP HẠNG LIVE
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>
                    Thời gian thực
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {sortedTeams.map((team, rankIdx) => {
                    const ans = qAnswers[team.id];
                    const hasAnswered = !!ans;

                    return (
                      <div key={team.id} style={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: `2px solid ${rankIdx === 0 ? '#facc15' : 'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: '16px',
                        padding: '12px 16px',
                        boxShadow: rankIdx === 0 ? '0 4px 20px rgba(250, 204, 21, 0.25)' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: rankIdx === 0 ? '#facc15' : (rankIdx === 1 ? '#cbd5e1' : (rankIdx === 2 ? '#d97706' : 'rgba(255, 255, 255, 0.1)')),
                              color: rankIdx <= 2 ? '#000' : '#fff',
                              fontWeight: 900,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {rankIdx + 1}
                            </div>
                            <div>
                              <div style={{ fontWeight: 900, fontSize: '0.98rem', color: team.color }}>
                                {team.name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                {team.members || 'Chưa ghi tên'}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#facc15' }}>
                              {team.score} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>đ</span>
                            </div>
                          </div>
                        </div>

                        {/* Live Answer Status for current question */}
                        <div style={{
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.78rem'
                        }}>
                          <div>
                            {!hasAnswered ? (
                              <span style={{ color: '#94a3b8', fontWeight: 600 }}>⏳ Đang suy nghĩ...</span>
                            ) : (
                              room.showAnswer ? (
                                <span style={{ color: ans.isCorrect ? '#10b981' : '#ef4444', fontWeight: 800 }}>
                                  {ans.isCorrect ? `✅ Chọn ${ans.answer} (+${ans.points}đ)` : `❌ Chọn ${ans.answer} (0đ)`}
                                </span>
                              ) : (
                                <span style={{ color: '#38bdf8', fontWeight: 800 }}>
                                  ⚡ Đã gửi đáp án
                                </span>
                              )
                            )}
                          </div>

                          {/* Host Manual Score override */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleAdjustPoints(team.id, 50)}
                              style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'none', borderRadius: '6px', padding: '2px 6px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                              title="Thưởng nóng +50đ"
                            >
                              +50đ
                            </button>
                            <button
                              onClick={() => handleAdjustPoints(team.id, -20)}
                              style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'none', borderRadius: '6px', padding: '2px 6px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                              title="Trừ điểm -20đ"
                            >
                              -20đ
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: MATCH COMPLETED / PODIUM / EXCEL REPORT */}
        {room.status === 'finished' && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            overflowY: 'auto'
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '2px solid rgba(250, 204, 21, 0.5)',
              borderRadius: '28px',
              padding: '36px 32px',
              maxWidth: '920px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.7)'
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🏆</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#facc15', margin: '0 0 6px 0' }}>
                VINH DANH NHÀ VÔ ĐỊCH ĐẤU TRƯỜNG!
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 28px 0' }}>
                Tổng kết trận đấu trực tiếp môn <strong style={{ color: '#38bdf8' }}>{room.teacherSubject}</strong> • Game <strong style={{ color: '#2dd4bf' }}>{room.gameTitle}</strong>
              </p>

              {/* Podium 1st, 2nd, 3rd */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '36px'
              }}>
                {/* 2nd Place */}
                {sortedTeams[1] && (
                  <div style={{
                    flex: 1,
                    maxWidth: '180px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '20px 14px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem' }}>🥈</div>
                    <div style={{ fontWeight: 900, color: '#cbd5e1', fontSize: '1.05rem', margin: '6px 0' }}>
                      {sortedTeams[1].name}
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#facc15' }}>
                      {sortedTeams[1].score} đ
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {sortedTeams[0] && (
                  <div style={{
                    flex: 1.2,
                    maxWidth: '220px',
                    background: 'linear-gradient(180deg, rgba(250, 204, 21, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
                    border: '3px solid #facc15',
                    borderRadius: '24px',
                    padding: '30px 16px',
                    textAlign: 'center',
                    boxShadow: '0 0 40px rgba(250, 204, 21, 0.4)',
                    transform: 'translateY(-12px)'
                  }}>
                    <div style={{ fontSize: '3rem' }}>👑</div>
                    <div style={{ fontWeight: 900, color: '#facc15', fontSize: '1.25rem', margin: '8px 0' }}>
                      {sortedTeams[0].name}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
                      {sortedTeams[0].score} đ
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#a7f3d0', fontWeight: 800, marginTop: '4px' }}>
                      VÔ ĐỊCH 🥇
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {sortedTeams[2] && (
                  <div style={{
                    flex: 1,
                    maxWidth: '180px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid #d97706',
                    borderRadius: '20px',
                    padding: '16px 14px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem' }}>🥉</div>
                    <div style={{ fontWeight: 900, color: '#f59e0b', fontSize: '1.05rem', margin: '6px 0' }}>
                      {sortedTeams[2].name}
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#facc15' }}>
                      {sortedTeams[2].score} đ
                    </div>
                  </div>
                )}
              </div>

              {/* Full Summary Table */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '28px',
                overflowX: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid rgba(255, 255, 255, 0.15)', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>Hạng</th>
                      <th style={{ padding: '10px' }}>Tên Nhóm</th>
                      <th style={{ padding: '10px' }}>Thành Viên</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Số Câu Đúng</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Tổng Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeams.map((t, idx) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 900, color: idx === 0 ? '#facc15' : '#cbd5e1' }}>
                          #{idx + 1}
                        </td>
                        <td style={{ padding: '12px 10px', fontWeight: 800, color: t.color }}>
                          {t.name}
                        </td>
                        <td style={{ padding: '12px 10px', color: '#cbd5e1', fontSize: '0.82rem' }}>
                          {t.members || 'Chưa ghi tên'}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 800, color: '#38bdf8' }}>
                          {t.correctCount || 0} / {room.questions.length}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 900, color: '#facc15', fontSize: '1.1rem' }}>
                          {t.score} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => LiveBattleService.exportReport(room)}
                  style={{
                    background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '14px',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(13, 148, 136, 0.4)'
                  }}
                >
                  <Download size={18} />
                  <span>Xuất Báo Cáo Excel</span>
                </button>

                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  Đóng Phòng Đấu
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
