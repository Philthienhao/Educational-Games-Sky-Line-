import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, CheckCircle2, Clock, Sparkles, Award, Trophy, ArrowRight,
  ShieldCheck, AlertCircle, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LiveBattleService } from '../../services/liveBattleService';
import { SoundFX } from '../../utils/sound';

export function StudentGroupArena({ roomPin }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Group Identity State
  const [selectedTeamId, setSelectedTeamId] = useState(() => {
    try { return localStorage.getItem(`gvd_live_team_${roomPin}`) || ''; } catch(e) { return ''; }
  });
  const [teamCustomName, setTeamCustomName] = useState(() => {
    try { return localStorage.getItem(`gvd_live_teamname_${roomPin}`) || ''; } catch(e) { return ''; }
  });
  const [members, setMembers] = useState(() => {
    try { return localStorage.getItem(`gvd_live_members_${roomPin}`) || ''; } catch(e) { return ''; }
  });
  const [hasJoined, setHasJoined] = useState(() => {
    try { return Boolean(localStorage.getItem(`gvd_live_joined_${roomPin}`)); } catch(e) { return false; }
  });

  // Answering State
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const questionStartTimeRef = useRef(Date.now());

  // Initial Load Room
  useEffect(() => {
    let isMounted = true;
    async function fetchRoom() {
      try {
        setLoading(true);
        const data = await LiveBattleService.getRoom(roomPin);
        if (!data) throw new Error("Không tìm thấy phòng đấu hoặc mã PIN đã kết thúc!");
        if (isMounted) setRoom(data);
      } catch (err) {
        if (isMounted) setError(err.message || "Lỗi nạp phòng đấu");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchRoom();
    return () => { isMounted = false; };
  }, [roomPin]);

  // Periodic Sync Loop with Host Server (Every 1.2s)
  useEffect(() => {
    if (!roomPin) return;

    const interval = setInterval(async () => {
      try {
        const latest = await LiveBattleService.getRoom(roomPin);
        if (latest) {
          setRoom(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(latest)) {
              return latest;
            }
            return prev;
          });
        }
      } catch (e) {}
    }, 1200);

    return () => clearInterval(interval);
  }, [roomPin]);

  // Reset selected answer on new question
  useEffect(() => {
    setSelectedAnswer(null);
    questionStartTimeRef.current = Date.now();
  }, [room?.currentQuestionIndex]);

  // Join Room
  const handleJoin = async (e) => {
    if (e) e.preventDefault();
    if (!selectedTeamId) {
      alert("Vui lòng chọn nhóm của các em!");
      return;
    }

    try {
      const updated = await LiveBattleService.joinTeam(roomPin, selectedTeamId, teamCustomName, members);
      if (updated) setRoom(updated);

      try {
        localStorage.setItem(`gvd_live_team_${roomPin}`, selectedTeamId);
        localStorage.setItem(`gvd_live_teamname_${roomPin}`, teamCustomName);
        localStorage.setItem(`gvd_live_members_${roomPin}`, members);
        localStorage.setItem(`gvd_live_joined_${roomPin}`, 'true');
      } catch (e) {}

      setHasJoined(true);
      try { SoundFX.click(); } catch(e) {}
    } catch (err) {
      alert("Lỗi tham gia phòng: " + err.message);
    }
  };

  // Submit Answer
  const handleAnswer = async (letter) => {
    if (selectedAnswer || isSubmitting || room?.isLocked) return;
    setSelectedAnswer(letter);
    setIsSubmitting(true);
    try { SoundFX.click(); } catch(e) {}

    const elapsedMs = Date.now() - questionStartTimeRef.current;
    try {
      const updated = await LiveBattleService.submitTeamAnswer(
        roomPin,
        room.currentQuestionIndex,
        selectedTeamId,
        letter,
        elapsedMs
      );
      if (updated) setRoom(updated);
    } catch (e) {
      console.warn("Submit answer error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const myTeam = useMemo(() => {
    return room?.teams?.find(t => t.id === selectedTeamId) || null;
  }, [room?.teams, selectedTeamId]);

  const currentQ = room?.questions?.[room?.currentQuestionIndex];
  const myAnswerData = room?.answers?.[room?.currentQuestionIndex]?.[selectedTeamId];

  // Loading Screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0b0f19', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px'
      }}>
        <div style={{
          width: '50px', height: '50px', borderRadius: '50%',
          border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#00a896',
          animation: 'spin 0.8s linear infinite', marginBottom: '20px'
        }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Đang kết nối Máy Chủ Phòng Đấu...</h2>
      </div>
    );
  }

  // Error Screen
  if (error || !room) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0b0f19', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center'
      }}>
        <AlertCircle size={54} color="#f87171" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginBottom: '8px' }}>
          Không thể vào phòng đấu
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '440px', marginBottom: '24px', lineHeight: 1.6 }}>
          {error || "Mã phòng không tồn tại hoặc đã kết thúc bởi Thầy/Cô."}
        </p>
        <button
          onClick={() => window.location.href = window.location.origin}
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer'
          }}
        >
          Quay về Trang Chủ
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e17',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(13, 148, 136, 0.25) 0%, transparent 75%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Top Client Header */}
      <header style={{
        padding: '12px 20px',
        background: 'rgba(15, 23, 42, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f8fafc' }}>
            {room.gameTitle}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            GV: <strong style={{ color: '#00a896' }}>{room.teacherName}</strong> • PIN: <strong style={{ color: '#facc15' }}>{room.roomPin}</strong>
          </div>
        </div>

        {myTeam && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: `1.5px solid ${myTeam.color}`,
            borderRadius: '12px',
            padding: '4px 12px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: myTeam.color }}>
              {myTeam.name}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15' }}>
              {myTeam.score} điểm
            </div>
          </div>
        )}
      </header>

      {/* MAIN BODY */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>

        {/* PHASE 1: CHOOSE GROUP / CHECK-IN FORM */}
        {!hasJoined && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '2px solid rgba(13, 148, 136, 0.4)',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px 24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '8px' }}>👥</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 6px 0', color: '#f8fafc' }}>
              Chọn Nhóm Tham Gia
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
              Vui lòng chọn nhóm của các em để cùng tranh tài trên màn hình máy chủ!
            </p>

            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '8px' }}>
                  Chọn Nhóm của em: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {room.teams.map(team => {
                    const isSelected = selectedTeamId === team.id;
                    return (
                      <button
                        type="button"
                        key={team.id}
                        onClick={() => setSelectedTeamId(team.id)}
                        style={{
                          background: isSelected ? 'rgba(13, 148, 136, 0.3)' : 'rgba(15, 23, 42, 0.8)',
                          border: `2px solid ${isSelected ? '#00a896' : 'rgba(255, 255, 255, 0.15)'}`,
                          borderRadius: '14px',
                          padding: '12px 10px',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{team.icon || '👥'}</span>
                        <span style={{ color: team.color }}>{team.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  Tên thành viên / Trưởng nhóm:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàng Nam (Trưởng nhóm), Lan, Huy..."
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(13, 148, 136, 0.45)'
                }}
              >
                <span>🚀 VÀO PHÒNG ĐẤU</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* PHASE 2: WAITING IN LOBBY */}
        {hasJoined && room.status === 'lobby' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '2px solid rgba(13, 148, 136, 0.4)',
            borderRadius: '24px',
            maxWidth: '440px',
            width: '100%',
            padding: '36px 24px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)', border: '2px solid #10b981',
              color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', margin: '0 auto 16px auto'
            }}>
              ✓
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
              Đã Tham Gia Phòng Đấu!
            </h2>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: myTeam?.color, marginBottom: '6px' }}>
              {myTeam?.name}
            </div>
            {members && (
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
                Thành viên: {members}
              </p>
            )}

            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: '#38bdf8',
              fontWeight: 800,
              fontSize: '0.92rem'
            }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: '#38bdf8', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
              }} />
              <span>Chờ Thầy/Cô bấm Bắt Đầu trên máy chủ...</span>
            </div>
          </div>
        )}

        {/* PHASE 3: LIVE ANSWERING ARENA */}
        {hasJoined && (room.status === 'playing' || room.status === 'question_result') && currentQ && (
          <div style={{
            maxWidth: '540px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Question Header Card */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.95)',
              border: '2px solid rgba(13, 148, 136, 0.4)',
              borderRadius: '20px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
            }}>
              <span className="badge" style={{ background: '#0284c7', color: '#fff', fontWeight: 900, padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem' }}>
                CÂU {room.currentQuestionIndex + 1} / {room.questions.length}
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: '12px 0 0 0', lineHeight: 1.4 }}>
                {currentQ.question || currentQ.title}
              </h3>
            </div>

            {/* Answer Result Banner (When host reveals answer) */}
            {room.showAnswer && myAnswerData && (
              <div style={{
                background: myAnswerData.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `2px solid ${myAnswerData.isCorrect ? '#10b981' : '#ef4444'}`,
                borderRadius: '16px',
                padding: '14px',
                textAlign: 'center',
                color: '#ffffff'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: myAnswerData.isCorrect ? '#34d399' : '#f87171' }}>
                  {myAnswerData.isCorrect ? `🎉 CHÍNH XÁC! (+${myAnswerData.points} điểm)` : `❌ CHƯA CHÍNH XÁC (0 điểm)`}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
                  Nhóm đã chọn đáp án: <strong>{myAnswerData.answer}</strong>
                </div>
              </div>
            )}

            {/* If host locked but not revealed */}
            {room.isLocked && !room.showAnswer && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1.5px solid #f59e0b',
                borderRadius: '14px',
                padding: '12px',
                textAlign: 'center',
                color: '#fef08a',
                fontWeight: 800,
                fontSize: '0.9rem'
              }}>
                🔒 Đã hết giờ trả lời! Chờ Thầy/Cô công bố đáp án...
              </div>
            )}

            {/* Answering Feedback if submitted */}
            {selectedAnswer && !room.showAnswer && !room.isLocked && (
              <div style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1.5px solid #38bdf8',
                borderRadius: '14px',
                padding: '12px',
                textAlign: 'center',
                color: '#bae6fd',
                fontWeight: 800,
                fontSize: '0.9rem'
              }}>
                ⚡ Đã gửi đáp án: <strong>{selectedAnswer}</strong>! Chờ các nhóm khác...
              </div>
            )}

            {/* 4 Big Tactile Touch Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {['A', 'B', 'C', 'D'].map((letter, idx) => {
                const optText = currentQ.options?.[idx] || `Đáp án ${letter}`;
                const isSelected = selectedAnswer === letter || myAnswerData?.answer === letter;
                const colors = [
                  { bg: '#ef4444', hover: '#dc2626', name: 'Đỏ' },
                  { bg: '#3b82f6', hover: '#2563eb', name: 'Xanh' },
                  { bg: '#f59e0b', hover: '#d97706', name: 'Vàng' },
                  { bg: '#10b981', hover: '#059669', name: 'Lục' }
                ];
                const c = colors[idx];

                return (
                  <button
                    key={letter}
                    disabled={!!selectedAnswer || room.isLocked || room.showAnswer}
                    onClick={() => handleAnswer(letter)}
                    style={{
                      background: isSelected ? c.bg : `${c.bg}22`,
                      border: `3px solid ${c.bg}`,
                      borderRadius: '20px',
                      padding: '24px 16px',
                      color: '#ffffff',
                      cursor: (selectedAnswer || room.isLocked) ? 'default' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: isSelected ? `0 0 25px ${c.bg}` : 'none',
                      opacity: (selectedAnswer && !isSelected) ? 0.45 : 1,
                      transform: isSelected ? 'scale(1.02)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: c.bg,
                      color: '#ffffff',
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                      {letter}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.3 }}>
                      {optText}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASE 4: FINAL RESULTS / FINISHED */}
        {hasJoined && room.status === 'finished' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '2px solid rgba(250, 204, 21, 0.5)',
            borderRadius: '24px',
            maxWidth: '440px',
            width: '100%',
            padding: '36px 24px',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🏆</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#facc15', margin: '0 0 6px 0' }}>
              Trận Đấu Đã Kết Thúc!
            </h2>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: myTeam?.color, marginBottom: '6px' }}>
              {myTeam?.name}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '12px 0' }}>
              {myTeam?.score} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>điểm</span>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '14px',
              marginBottom: '20px',
              color: '#38bdf8',
              fontWeight: 800,
              fontSize: '0.9rem'
            }}>
              Số câu đúng: {myTeam?.correctCount || 0} / {room.questions.length}
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Hãy nhìn lên màn hình lớn của Thầy/Cô để theo dõi vinh danh Bảng Vàng!
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
