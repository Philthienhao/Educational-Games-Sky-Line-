import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  X, Link2, Copy, Check, QrCode, Trophy, Download, RefreshCw, 
  Trash2, Clock, Users, Award, BookOpen, Share2, Sparkles, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { HomeworkService } from '../../services/homeworkService';
import { SoundFX } from '../../utils/sound';

export function AssignHomeworkModal({ game, currentUser, onClose }) {
  const [activeTab, setActiveTab] = useState('link'); // 'link' | 'submissions'
  const [customTitle, setCustomTitle] = useState(() => game?.lessonTitle || game?.title || 'Bài Tập Về Nhà Qua Game');
  const [targetClass, setTargetClass] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0); // 0 = unlimited
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [allowRetry, setAllowRetry] = useState(true);
  const [showAnswersAfter, setShowAnswersAfter] = useState(true);
  
  const [assignment, setAssignment] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);

  // Fetch or Auto-create assignment for this game
  useEffect(() => {
    let isMounted = true;
    async function loadOrCreateAssignment() {
      setIsGenerating(true);
      try {
        const teacherId = currentUser?.id || 'user_admin';
        const existingList = await HomeworkService.getTeacherAssignments(teacherId);
        // Find existing active assignment for this specific game
        const found = existingList.find(a => (a.gameId === game?.id || a.gameTitle === (game?.lessonTitle || game?.title)) && a.status === 'active');
        
        if (found && isMounted) {
          setAssignment(found);
          setCustomTitle(found.customTitle || found.gameTitle);
          setTargetClass(found.targetClass || '');
          setTimeLimitMinutes(found.timeLimitMinutes || 0);
          setShuffleQuestions(found.shuffleQuestions);
          setAllowRetry(found.allowRetry);
          setShowAnswersAfter(found.showAnswersAfter);
          loadSubmissions(found.id);
        } else {
          // Create initial assignment record
          const questions = game?.questions || game?.defaultQuestions || [];
          const newAssign = await HomeworkService.createAssignment({
            gameId: game?.id,
            baseGameId: game?.baseGameId || game?.id,
            gameTitle: game?.lessonTitle || game?.title,
            customTitle: game?.lessonTitle || game?.title,
            engineType: game?.engineType || game?.gameType || 'wheel',
            gameType: game?.gameType || game?.engineType || 'wheel',
            secretImage: game?.secretImage || game?.bgImageUrl,
            bgImageUrl: game?.bgImageUrl || game?.secretImage,
            category: game?.category,
            icon: game?.icon,
            gradient: game?.gradient,
            questions: questions,
            targetClass: '',
            timeLimitMinutes: 0,
            shuffleQuestions: true,
            allowRetry: true,
            showAnswersAfter: true
          }, currentUser);

          if (isMounted) {
            setAssignment(newAssign);
            loadSubmissions(newAssign.id);
          }
        }
      } catch (err) {
        console.warn("Assignment load error:", err);
      } finally {
        if (isMounted) setIsGenerating(false);
      }
    }

    loadOrCreateAssignment();
    return () => { isMounted = false; };
  }, [game, currentUser]);

  const loadSubmissions = useCallback(async (assignId) => {
    if (!assignId) return;
    setIsLoadingSubs(true);
    try {
      const subs = await HomeworkService.getSubmissions(assignId);
      setSubmissions(subs);
    } catch (e) {
      console.warn("Error loading submissions:", e);
    } finally {
      setIsLoadingSubs(false);
    }
  }, []);

  const handleUpdateAssignmentSettings = async () => {
    if (!assignment) return;
    setIsGenerating(true);
    try {
      const updated = await HomeworkService.createAssignment({
        ...assignment,
        customTitle,
        targetClass,
        timeLimitMinutes: Number(timeLimitMinutes),
        shuffleQuestions,
        allowRetry,
        showAnswersAfter
      }, currentUser);
      setAssignment(updated);
      try { SoundFX.correct(); } catch(e) {}
      alert("✅ Đã cập nhật cấu hình bài tập về nhà thành công!");
    } catch (err) {
      alert("Lỗi cập nhật: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareUrl = useMemo(() => {
    if (!assignment) return '';
    return HomeworkService.getShareUrl(assignment);
  }, [assignment]);

  const qrCodeUrl = useMemo(() => {
    if (!shareUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(shareUrl)}&margin=8`;
  }, [shareUrl]);

  const sampleZaloMessage = useMemo(() => {
    const title = customTitle || assignment?.gameTitle || 'Trò chơi ôn tập';
    const teacherName = currentUser?.name || currentUser?.username || 'Thầy Cô';
    const targetClassStr = targetClass ? ` - Lớp ${targetClass}` : '';
    const timeLimitStr = timeLimitMinutes > 0 ? `⏱️ Thời gian làm bài: ${timeLimitMinutes} phút\n` : '';

    return `📢 BÀI TẬP VỀ NHÀ QUA GAME: ${title.toUpperCase()}${targetClassStr}\n` +
      `Thầy/Cô ${teacherName} gửi các em học sinh đường link trò chơi ôn tập kiến thức:\n` +
      `👉 Link chơi ngay: ${shareUrl}\n` +
      `${timeLimitStr}` +
      `📌 Lưu ý: Các em nhập đúng Họ và tên + Lớp để ghi danh lên Bảng Vàng của lớp nhé! Chúc các em đạt điểm tối đa! 🎉`;
  }, [customTitle, assignment, currentUser, targetClass, timeLimitMinutes, shareUrl]);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      try { SoundFX.click(); } catch(e) {}
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(sampleZaloMessage).then(() => {
      setCopiedMessage(true);
      try { SoundFX.click(); } catch(e) {}
      setTimeout(() => setCopiedMessage(false), 2500);
    });
  };

  const handleExportExcel = () => {
    try {
      HomeworkService.exportToExcel(assignment, submissions);
      try { SoundFX.win(); } catch(e) {}
    } catch (err) {
      alert("Lỗi xuất Excel: " + err.message);
    }
  };

  const handleDeleteSubmission = async (subId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài làm của học sinh này?")) return;
    const ok = await HomeworkService.deleteSubmission(assignment?.id, subId);
    if (ok) {
      setSubmissions(prev => prev.filter(s => s.id !== subId));
    }
  };

  // Stats calculation
  const totalSubmissions = submissions.length;
  const avgScore = totalSubmissions > 0
    ? (submissions.reduce((acc, s) => acc + (s.score || 0), 0) / totalSubmissions).toFixed(1)
    : 0;
  const maxScore = totalSubmissions > 0
    ? Math.max(...submissions.map(s => s.score || 0))
    : 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '850px',
        maxHeight: 'min(94vh, 760px)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35)',
        border: '1.5px solid rgba(13, 148, 136, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              🚀
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
                Giao Bài Tập Về Nhà Qua Game
              </h2>
              <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: '2px' }}>
                Học sinh tự chơi ở nhà • Tự động chấm điểm & Lưu Bảng Vàng
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '4px 20px 0 20px',
          gap: '8px',
          flexShrink: 0
        }}>
          <button
            onClick={() => setActiveTab('link')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'link' ? '3px solid #0d9488' : '3px solid transparent',
              color: activeTab === 'link' ? '#0d9488' : '#64748b',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Link2 size={18} />
            <span>1. Link & Mã QR Giao Bài</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('submissions');
              if (assignment?.id) loadSubmissions(assignment.id);
            }}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'submissions' ? '3px solid #0d9488' : '3px solid transparent',
              color: activeTab === 'submissions' ? '#0d9488' : '#64748b',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Trophy size={18} />
            <span>2. Bảng Điểm & Báo Cáo Học Sinh ({totalSubmissions})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {activeTab === 'link' ? (
            <>
              {/* Game Info Banner */}
              <div style={{
                background: '#f1f5f9',
                borderRadius: '16px',
                padding: '14px 18px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: game?.gradient || 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: '#ffffff'
                  }}>
                    {game?.icon || '🎮'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {game?.lessonTitle || game?.title}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Môn: <strong style={{ color: '#0d9488' }}>{currentUser?.subject || game?.category || 'Giáo Dục'}</strong> • Tổng số câu: <strong style={{ color: '#0284c7' }}>{(game?.questions || game?.defaultQuestions || []).length} câu</strong>
                    </div>
                  </div>
                </div>

                <span style={{
                  background: '#dcfce7',
                  color: '#166534',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1px solid #bbf7d0'
                }}>
                  ● Đang mở nhận bài làm
                </span>
              </div>

              {/* Share Link & One-Click Copy */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                  🔗 Đường Link Học Sinh Vào Chơi Trực Tiếp (Không Cần Đăng Nhập):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#0284c7',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleCopyLink}
                    style={{
                      background: copiedLink ? '#10b981' : 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0 20px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {copiedLink ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copiedLink ? 'Đã Sao Chép!' : 'Sao Chép Link'}</span>
                  </button>
                </div>
              </div>

              {/* QR Code and Message Template Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 260px) 1fr', gap: '20px', alignItems: 'stretch' }}>
                {/* QR Code Card */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '180px',
                    height: '180px',
                    background: '#ffffff',
                    padding: '8px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px'
                  }}>
                    {qrCodeUrl ? (
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code bài tập" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        loading="lazy"
                      />
                    ) : (
                      <QrCode size={64} color="#94a3b8" />
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                    📱 Quét mã bằng camera điện thoại
                  </span>
                  <a
                    href={qrCodeUrl}
                    download="Ma_QR_Bai_Tap_Ve_Nha.png"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '0.78rem',
                      color: '#0d9488',
                      fontWeight: 800,
                      marginTop: '6px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Download size={14} /> Tải ảnh QR về máy
                  </a>
                </div>

                {/* Zalo / Classroom Ready-to-Send Template */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                      💬 Mẫu Tin Nhắn Gửi Zalo / Google Classroom:
                    </label>
                    <button
                      onClick={handleCopyMessage}
                      style={{
                        background: copiedMessage ? '#10b981' : '#ffffff',
                        color: copiedMessage ? '#ffffff' : '#0d9488',
                        border: '1px solid #cbd5e1',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {copiedMessage ? <Check size={14} /> : <Share2 size={14} />}
                      <span>{copiedMessage ? 'Đã Copy!' : 'Copy Tin Nhắn'}</span>
                    </button>
                  </div>

                  <textarea
                    readOnly
                    value={sampleZaloMessage}
                    style={{
                      flex: 1,
                      minHeight: '130px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '0.8rem',
                      color: '#334155',
                      lineHeight: '1.45',
                      resize: 'none',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Assignment Customization Settings */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px 20px'
              }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                  ⚙️ Cài Đặt Tùy Chọn Bài Tập (Tùy Chọn):
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Tiêu đề hiển thị cho học sinh:
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="VD: Ôn tập Châu Âu - Bài tập tuần 5"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Lớp giao bài (Gợi ý cho học sinh):
                    </label>
                    <input
                      type="text"
                      value={targetClass}
                      onChange={(e) => setTargetClass(e.target.value)}
                      placeholder="VD: 7A1, 8/2..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Thời gian làm bài:
                    </label>
                    <select
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        background: '#ffffff'
                      }}
                    >
                      <option value={0}>Không giới hạn thời gian (Tự do)</option>
                      <option value={5}>5 phút (Nhanh kịch tính)</option>
                      <option value={10}>10 phút</option>
                      <option value={15}>15 phút (Chuẩn 1 bài kiểm tra)</option>
                      <option value={20}>20 phút</option>
                      <option value={30}>30 phút</option>
                      <option value={45}>45 phút (1 tiết)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={shuffleQuestions}
                      onChange={(e) => setShuffleQuestions(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#0d9488' }}
                    />
                    Trộn thứ tự câu hỏi ngẫu nhiên
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showAnswersAfter}
                      onChange={(e) => setShowAnswersAfter(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#0d9488' }}
                    />
                    Cho phép học sinh xem đáp án & giải thích sau khi làm
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={allowRetry}
                      onChange={(e) => setAllowRetry(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#0d9488' }}
                    />
                    Cho phép chơi lại để cải thiện điểm
                  </label>

                  <button
                    onClick={handleUpdateAssignmentSettings}
                    disabled={isGenerating}
                    style={{
                      marginLeft: 'auto',
                      background: '#0d9488',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {isGenerating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Submissions & Leaderboard Tab */
            <>
              {/* Summary Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Học sinh đã nộp
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0d9488', marginTop: '4px' }}>
                    {totalSubmissions} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>em</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Điểm trung bình
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>
                    {(avgScore / 10).toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ 10</span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Điểm cao nhất
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#eab308', marginTop: '4px' }}>
                    {(maxScore / 10).toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ 10</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={handleExportExcel}
                    disabled={totalSubmissions === 0}
                    style={{
                      background: totalSubmissions > 0 ? '#10b981' : '#cbd5e1',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: totalSubmissions > 0 ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: totalSubmissions > 0 ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
                    }}
                  >
                    <FileSpreadsheet size={16} />
                    <span>Xuất File Excel Bảng Điểm</span>
                  </button>

                  <button
                    onClick={() => assignment?.id && loadSubmissions(assignment.id)}
                    disabled={isLoadingSubs}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      padding: '8px 14px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} className={isLoadingSubs ? 'animate-spin' : ''} />
                    <span>Làm mới danh sách</span>
                  </button>
                </div>
              </div>

              {/* Submissions Table */}
              {submissions.length > 0 ? (
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#ffffff'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>Hạng</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>Họ và tên học sinh</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>Lớp</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>Điểm số (Thang 10)</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>Số câu đúng</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>Thời gian</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800 }}>Thời gian nộp</th>
                        <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'center' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub, index) => {
                        const rank = index + 1;
                        const minutes = Math.floor((sub.timeSpentSeconds || 0) / 60);
                        const seconds = (sub.timeSpentSeconds || 0) % 60;
                        const timeStr = `${minutes > 0 ? `${minutes}p ` : ''}${seconds}s`;
                        const grade10 = sub.grade10 !== undefined ? sub.grade10 : (sub.score / 10).toFixed(1);

                        return (
                          <tr key={sub.id || index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 900 }}>
                              {rank === 1 ? '🥇 1' : (rank === 2 ? '🥈 2' : (rank === 3 ? '🥉 3' : `#${rank}`))}
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>
                              {sub.studentName}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 700 }}>
                              {sub.studentClass || '—'}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                fontWeight: 900,
                                fontSize: '0.95rem',
                                color: Number(grade10) >= 8 ? '#16a34a' : (Number(grade10) >= 6.5 ? '#0284c7' : '#dc2626')
                              }}>
                                {grade10} điểm
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '6px' }}>
                                ({sub.score} pts)
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#334155' }}>
                              {sub.correctCount} / {sub.totalQuestions}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#64748b' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={13} /> {timeStr}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#64748b' }}>
                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteSubmission(sub.id)}
                                title="Xóa kết quả này"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  borderRadius: '6px'
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  border: '1.5px dashed #cbd5e1'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📝</div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#334155' }}>
                    Chưa có học sinh nào nộp bài
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', maxWidth: '420px', marginInline: 'auto' }}>
                    Hãy sao chép link hoặc gửi mã QR ở tab <strong>"1. Link & Mã QR Giao Bài"</strong> vào nhóm lớp để học sinh vào làm bài nhé!
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 22px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
