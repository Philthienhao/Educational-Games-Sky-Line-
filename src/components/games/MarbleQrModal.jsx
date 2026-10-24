import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  QrCode, Smartphone, Users, Check, Copy, X, 
  Trash2, RefreshCw, Sparkles, Play, Save, CheckCircle2,
  AlertCircle, ShieldCheck
} from 'lucide-react';
import { MarbleLobbyService } from '../../services/marbleLobbyService';
import { StorageService } from '../../services/storage';

export function MarbleQrModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  currentStudents, 
  onApplyStudents, 
  selectedClassName, 
  setSelectedClassName 
}) {
  const [pin, setPin] = useState('');
  const [lobby, setLobby] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  const prevCountRef = useRef(0);
  const audioCtxRef = useRef(null);

  // Play pleasant "ting" sound when new student joins
  const playJoinTing = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  };

  // Initialize or fetch Lobby
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    let localPin = pin;
    if (!localPin) {
      localPin = MarbleLobbyService.generatePin();
      setPin(localPin);
    }

    const initLobby = async () => {
      setIsInitializing(true);
      try {
        const title = selectedClassName || 'Đua Bi Sinh Tử';
        const newOrExisting = await MarbleLobbyService.createOrGetLobby(currentUser, localPin, title);
        if (isMounted && newOrExisting) {
          setLobby(newOrExisting);
          if (Array.isArray(newOrExisting.participants)) {
            setParticipants(newOrExisting.participants);
            prevCountRef.current = newOrExisting.participants.length;
          }
        }
      } catch (e) {
        console.warn("Init marble lobby error:", e);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    initLobby();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Real-time Polling & BroadcastChannel Listener while Modal is open
  useEffect(() => {
    if (!isOpen || !pin) return;

    let isMounted = true;

    // 1. Polling Cloud DB every 1.5s (compliant with Rule 16 - bounded polling & clean up on unmount)
    let pollCount = 0;
    const maxPolls = 600; // 15 minutes of standing waiting max
    const intervalId = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPolls) {
        clearInterval(intervalId);
        return;
      }
      try {
        const freshLobby = await MarbleLobbyService.getLobby(pin);
        if (isMounted && freshLobby && Array.isArray(freshLobby.participants)) {
          setLobby(freshLobby);
          const newLen = freshLobby.participants.length;
          if (newLen > prevCountRef.current) {
            playJoinTing();
            prevCountRef.current = newLen;
          }
          setParticipants(freshLobby.participants);
        }
      } catch (e) {}
    }, 1500);

    // 2. BroadcastChannel for instant same-browser / zero-latency push
    let channel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('gvd_marble_race_lobby');
        channel.onmessage = (event) => {
          if (event.data?.type === 'STUDENT_JOINED' && String(event.data.pin) === String(pin)) {
            const p = event.data.participant;
            if (p) {
              setParticipants(prev => {
                if (prev.some(x => x.id === p.id)) return prev;
                playJoinTing();
                prevCountRef.current = prev.length + 1;
                return [...prev, p];
              });
            }
          }
        };
      } catch (e) {}
    }

    // 3. Local CustomEvent fallback
    const handleLocalJoin = (e) => {
      if (e.detail?.pin === pin && e.detail?.participant) {
        const p = e.detail.participant;
        setParticipants(prev => {
          if (prev.some(x => x.id === p.id)) return prev;
          playJoinTing();
          prevCountRef.current = prev.length + 1;
          return [...prev, p];
        });
      }
    };
    window.addEventListener('gvd_marble_student_joined', handleLocalJoin);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (channel) channel.close();
      window.removeEventListener('gvd_marble_student_joined', handleLocalJoin);
    };
  }, [isOpen, pin]);

  const joinUrl = useMemo(() => {
    return pin ? MarbleLobbyService.getStudentJoinUrl(pin) : '';
  }, [pin]);

  const qrCodeUrl = useMemo(() => {
    return pin ? MarbleLobbyService.getQrCodeUrl(pin) : '';
  }, [pin]);

  const handleCopyLink = () => {
    if (!joinUrl) return;
    try {
      navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      alert("Link tham gia: " + joinUrl);
    }
  };

  const handleCopyPin = () => {
    if (!pin) return;
    try {
      navigator.clipboard.writeText(pin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    } catch (e) {}
  };

  const handleRemoveStudent = async (studentId) => {
    setParticipants(prev => prev.filter(p => p.id !== studentId));
    prevCountRef.current = Math.max(0, prevCountRef.current - 1);
    await MarbleLobbyService.removeParticipant(pin, studentId);
  };

  const handleClearAll = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách để học sinh quét lại từ đầu?")) {
      setParticipants([]);
      prevCountRef.current = 0;
      await MarbleLobbyService.clearParticipants(pin);
    }
  };

  // Chốt danh sách & Áp dụng vào Đua Bi
  const handleApplyRoster = () => {
    if (participants.length === 0) {
      alert("Chưa có học sinh nào quét mã tham gia! Vui lòng chờ ít nhất 2 học sinh quét mã.");
      return;
    }
    if (participants.length < 2) {
      alert("Cần ít nhất 2 học sinh để bắt đầu cuộc đua bi!");
      return;
    }

    const newClassName = `Lớp Quét QR (${participants.length} HS)`;
    onApplyStudents(participants, newClassName);
    onClose();
  };

  // Lưu danh sách này thành 1 lớp để thầy cô dùng lại trong tương lai
  const handleSaveAsClass = () => {
    if (participants.length === 0) {
      alert("Chưa có học sinh nào để lưu!");
      return;
    }

    const defaultName = `Lớp Quét QR ${new Date().toLocaleDateString('vi-VN')} (${participants.length} HS)`;
    const inputName = window.prompt("Nhập tên lớp muốn lưu để sử dụng lại lần sau:", defaultName);
    if (!inputName || !inputName.trim()) return;

    const className = inputName.trim();
    const names = participants.map(p => p.name);

    try {
      const storageKey = `gvd_marble_custom_roster_${currentUser?.id || 'guest'}`;
      localStorage.setItem(storageKey, JSON.stringify({
        className,
        names
      }));

      // Đồng thời cập nhật vào danh sách lớp mẫu nếu muốn
      setSaveSuccessMsg(`🎉 Đã lưu thành công danh sách "${className}"!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (e) {
      alert("Lỗi lưu danh sách: " + e.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(7, 10, 19, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 140,
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#131b2e',
        color: '#f8fafc',
        border: '1.5px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '920px',
        maxHeight: 'min(94vh, 720px)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.15)',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* MODAL HEADER */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, #131b2e 0%, #1e293b 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
            }}>
              <QrCode size={24} />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.22rem',
                fontWeight: 900,
                margin: 0,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                QUÉT MÃ QR — HỌC SINH TỰ ĐIỀN TÊN VÀO GAME
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Học sinh dùng điện thoại/máy tính bảng quét mã để tự điền tên và trường, không cần tài khoản đăng nhập.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              borderRadius: '10px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY (2 COLUMNS) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 360px) 1fr',
          gap: '20px',
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* LEFT COLUMN: QR CODE & PIN */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.65)',
            borderRadius: '18px',
            padding: '20px 16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center'
          }}>
            {/* PIN BADGE */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1.5px solid #38bdf8',
              borderRadius: '14px',
              padding: '6px 16px',
              marginBottom: '14px'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                MÃ PIN:
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '2px' }}>
                {pin || '------'}
              </span>
              <button
                onClick={handleCopyPin}
                title="Sao chép mã PIN"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedPin ? '#10b981' : '#38bdf8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {copiedPin ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {/* QR CODE CONTAINER */}
            <div style={{
              background: '#ffffff',
              padding: '12px',
              borderRadius: '16px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.3)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '210px',
              height: '210px'
            }}>
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR Code phòng ${pin}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                    display: 'block'
                  }}
                />
              ) : (
                <div style={{ color: '#0f172a', fontSize: '0.85rem' }}>Đang tạo QR...</div>
              )}
            </div>

            {/* DIRECT SHARE LINK */}
            <div style={{
              width: '100%',
              display: 'flex',
              gap: '6px',
              marginBottom: '14px'
            }}>
              <input
                type="text"
                readOnly
                value={joinUrl}
                style={{
                  flex: 1,
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  padding: '6px 10px',
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  background: copiedLink ? '#10b981' : '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                {copiedLink ? 'Đã chép' : 'Chép link'}
              </button>
            </div>

            {/* 3 STEPS INSTRUCTIONS */}
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              padding: '10px 12px',
              textAlign: 'left',
              fontSize: '0.78rem',
              color: '#cbd5e1',
              lineHeight: 1.45
            }}>
              <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                💡 Hướng dẫn học sinh:
              </div>
              <div>1. Mở <strong>Camera điện thoại</strong> hoặc <strong>Zalo</strong> quét mã QR.</div>
              <div>2. Điền <strong>Họ tên</strong> và chọn màu viên bi may mắn.</div>
              <div>3. Bấm <strong>Tham gia</strong> ➔ Viên bi tự động nhảy lên máy chiếu!</div>
            </div>
          </div>

          {/* RIGHT COLUMN: REAL-TIME PARTICIPANT LIST */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(15, 23, 42, 0.65)',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 18px',
            overflow: 'hidden'
          }}>
            {/* List Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#34d399" />
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                  Vạch Xuất Phát Trực Tiếp
                </span>
                <span style={{
                  background: participants.length > 0 ? '#10b981' : '#334155',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 900
                }}>
                  {participants.length} Học sinh
                </span>
              </div>

              {participants.length > 0 && (
                <button
                  onClick={handleClearAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 6px',
                    borderRadius: '6px'
                  }}
                  title="Xóa toàn bộ để quét lại"
                >
                  <Trash2 size={13} />
                  Quét lại từ đầu
                </button>
              )}
            </div>

            {/* List Body */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingRight: '4px',
              minHeight: '220px'
            }}>
              {participants.length === 0 ? (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '30px 20px',
                  color: '#64748b'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1.5px dashed #38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                    marginBottom: '14px',
                    animation: 'pulse 2s infinite'
                  }}>
                    <Smartphone size={28} />
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px' }}>
                    Đang chờ học sinh quét mã QR...
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '320px', lineHeight: 1.4 }}>
                    Khi học sinh quét mã và bấm Tham gia trên điện thoại, tên và viên bi sẽ lập tức nhảy vào vạch xuất phát tại đây!
                  </div>
                  <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.96); } }`}</style>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                  gap: '8px',
                  alignContent: 'start'
                }}>
                  {participants.map((p, idx) => {
                    const marbleColor = p.color || '#3b82f6';
                    const initials = p.name ? (p.name.trim().split(/\s+/).length === 1 ? p.name.slice(0, 2) : (p.name.trim().split(/\s+/)[0][0] + p.name.trim().split(/\s+/).slice(-1)[0][0])) : 'HS';

                    return (
                      <div
                        key={p.id || idx}
                        style={{
                          background: 'rgba(30, 41, 59, 0.75)',
                          border: `1.5px solid ${marbleColor}88`,
                          borderRadius: '12px',
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          boxShadow: `0 2px 8px -2px ${marbleColor}44`,
                          position: 'relative'
                        }}
                      >
                        {/* 3D Marble Sphere */}
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: `radial-gradient(circle at 35% 35%, #ffffff, ${marbleColor} 60%, #0f172a 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '0.72rem',
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                          boxShadow: `0 2px 6px ${marbleColor}88`,
                          flexShrink: 0
                        }}>
                          {initials.toUpperCase()}
                        </div>

                        {/* Student Info */}
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                          <div style={{
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            color: '#ffffff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {p.name}
                          </div>
                          <div style={{
                            fontSize: '0.7rem',
                            color: '#94a3b8',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {p.school || `Bi số #${idx + 1}`}
                          </div>
                        </div>

                        {/* Remove Student Button */}
                        <button
                          onClick={() => handleRemoveStudent(p.id)}
                          title="Xóa học sinh này"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.6,
                            transition: 'opacity 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.opacity = '1'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.opacity = '0.6'; }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {saveSuccessMsg && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginTop: '10px',
                fontWeight: 700
              }}>
                {saveSuccessMsg}
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(90deg, #131b2e 0%, #1e293b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            <span>Phòng đang kết nối đám mây 24/7 • Tự động nhận tên học sinh</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {participants.length > 0 && (
              <button
                onClick={handleSaveAsClass}
                style={{
                  background: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid #38bdf8',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Save size={15} />
                Lưu thành DS lớp
              </button>
            )}

            <button
              onClick={handleApplyRoster}
              disabled={participants.length === 0}
              style={{
                background: participants.length === 0
                  ? '#334155'
                  : 'linear-gradient(135deg, #059669 0%, #0284c7 100%)',
                color: '#ffffff',
                border: participants.length === 0 ? 'none' : '1px solid #34d399',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 900,
                cursor: participants.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: participants.length === 0 ? 'none' : '0 4px 16px rgba(5, 150, 105, 0.45)',
                transition: 'all 0.2s ease'
              }}
            >
              <Play size={16} fill="#ffffff" />
              ÁP DỤNG & VÀO ĐƯỜNG ĐUA NGAY ({participants.length} HS)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
