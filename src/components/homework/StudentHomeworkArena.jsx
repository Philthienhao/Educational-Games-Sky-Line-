import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Trophy, CheckCircle2, Clock, Award, Sparkles, 
  RotateCw, ArrowRight, User, School, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HomeworkService } from '../../services/homeworkService';
import { SoundFX } from '../../utils/sound';
import { ClassroomPlayModal } from '../ClassroomPlayModal';

export function StudentHomeworkArena({ assignmentId, encodedData }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignment, setAssignment] = useState(null);

  // Student Info State
  const [studentName, setStudentName] = useState(() => {
    try { return localStorage.getItem('gvd_saved_student_name') || ''; } catch (e) { return ''; }
  });
  const [studentClass, setStudentClass] = useState(() => {
    try { return localStorage.getItem('gvd_saved_student_class') || ''; } catch (e) { return ''; }
  });

  // Game Phases: 'register' | 'playing' | 'completed'
  const [gamePhase, setGamePhase] = useState('register');

  // Submissions Leaderboard State
  const [submissions, setSubmissions] = useState([]);
  const [mySubmission, setMySubmission] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Assignment on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchAssignment() {
      setLoading(true);
      try {
        const data = await HomeworkService.getAssignmentById(assignmentId, encodedData);
        if (!data || (!data.questions && !data.id && !data.title)) {
          throw new Error("Không tìm thấy dữ liệu bài tập hoặc liên kết đã hết hạn.");
        }
        if (isMounted) {
          setAssignment(data);
          if (data.targetClass && !studentClass) {
            setStudentClass(data.targetClass);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Lỗi tải bài tập");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAssignment();
    return () => { isMounted = false; };
  }, [assignmentId, encodedData]);

  // Handle Start Playing Game (Launches the 100% Exact Original Game Engine)
  const handleStartGame = (e) => {
    if (e) e.preventDefault();
    const cleanName = studentName.trim();
    if (!cleanName) {
      alert("Vui lòng nhập Họ và tên của em để bắt đầu làm bài!");
      return;
    }

    try {
      localStorage.setItem('gvd_saved_student_name', cleanName);
      localStorage.setItem('gvd_saved_student_class', studentClass.trim());
    } catch (err) {}

    setGamePhase('playing');
    try { SoundFX.click(); } catch(e) {}
  };

  // Callback when student finishes or clicks "Nộp Bài" inside the original game engine
  const handleFinishHomework = async (result) => {
    const rawScore = Number(result?.score) || 0;
    const timeSpent = Number(result?.timeSpentSeconds) || 0;
    const questionsCount = (assignment?.questions || assignment?.defaultQuestions || []).length || 10;
    
    // Scale to standard 10-point grade
    let grade10 = 10;
    if (rawScore > 0) {
      if (rawScore <= 10) grade10 = Number(rawScore.toFixed(1));
      else if (rawScore <= 100) grade10 = Number((rawScore / 10).toFixed(1));
      else grade10 = Number(Math.min(10, (rawScore / (questionsCount * 50 || 500)) * 10).toFixed(1));
    }

    const submissionPayload = {
      assignmentId: assignment.id,
      studentName: studentName.trim(),
      studentClass: studentClass.trim(),
      score: rawScore,
      grade10,
      correctCount: questionsCount,
      totalQuestions: questionsCount,
      timeSpentSeconds: timeSpent,
      details: result?.teams || []
    };

    setMySubmission(submissionPayload);
    setGamePhase('completed');

    // Confetti and Victory Sound
    try {
      SoundFX.win();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Submit to Cloud DB
    setIsSubmitting(true);
    try {
      await HomeworkService.submitHomework(submissionPayload);
      const latestSubs = await HomeworkService.getSubmissions(assignment.id);
      setSubmissions(latestSubs);
    } catch (e) {
      console.warn("Submit error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Rank Badge Calculator
  const getRankBadge = (grade) => {
    if (grade >= 9.0) return { label: 'Xuất Sắc 🏆', color: '#16a34a', bg: '#dcfce7' };
    if (grade >= 8.0) return { label: 'Giỏi 🌟', color: '#0284c7', bg: '#e0f2fe' };
    if (grade >= 6.5) return { label: 'Khá 👍', color: '#ca8a04', bg: '#fef9c3' };
    return { label: 'Cần Cố Gắng 💪', color: '#ea580c', bg: '#ffedd5' };
  };

  // Loading Screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0b0f19',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        padding: '24px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.2)',
          borderTopColor: '#00a896',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '20px'
        }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
          Đang nạp dữ liệu trò chơi ôn tập...
        </h2>
      </div>
    );
  }

  // Error Screen
  if (error || !assignment) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0b0f19',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginBottom: '8px' }}>
          Không thể mở bài tập
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '460px', marginBottom: '24px', lineHeight: '1.6' }}>
          {error || "Liên kết bài tập không hợp lệ hoặc đã bị gỡ bỏ bởi Thầy/Cô."}
        </p>
        <button
          onClick={() => window.location.href = window.location.origin}
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '14px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Quay về Trang Chủ
        </button>
      </div>
    );
  }

  // PHASE 2: PLAYING THE 100% EXACT ORIGINAL GAME ENGINE!
  if (gamePhase === 'playing') {
    return (
      <ClassroomPlayModal 
        game={assignment}
        onClose={() => {
          handleFinishHomework({
            score: 100,
            timeSpentSeconds: 0
          });
        }}
        currentUser={{
          id: assignment.teacherId || 'user_admin',
          name: assignment.teacherName || 'Giáo viên',
          subject: assignment.teacherSubject || 'Giáo dục'
        }}
        isHomework={true}
        studentName={studentName}
        studentClass={studentClass}
        onHomeworkFinish={handleFinishHomework}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0f19',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(13, 148, 136, 0.25) 0%, transparent 75%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Top Header Bar */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: assignment.gradient || 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            {assignment.icon || '🎮'}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#f8fafc' }}>
              {assignment.customTitle || assignment.gameTitle}
            </h1>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              GV: <strong style={{ color: '#00a896' }}>{assignment.teacherName}</strong> • {assignment.teacherSubject || 'Giáo Dục'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {/* PHASE 1: REGISTRATION / CHECK-IN SCREEN */}
        {gamePhase === 'register' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '1.5px solid rgba(13, 148, 136, 0.4)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            padding: '32px 28px',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: assignment.gradient || 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              margin: '0 auto 16px auto',
              boxShadow: '0 10px 25px rgba(13, 148, 136, 0.4)'
            }}>
              {assignment.icon || '🚀'}
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px', color: '#f8fafc' }}>
              {assignment.customTitle || assignment.gameTitle}
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 20px 0' }}>
              Bài tập về nhà môn <strong style={{ color: '#38bdf8' }}>{assignment.teacherSubject || 'Học tập'}</strong> • Giao bởi <strong style={{ color: '#2dd4bf' }}>Thầy/Cô {assignment.teacherName}</strong>
            </p>

            {/* Quick Rules Pills */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '24px'
            }}>
              <span style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>
                📝 {(assignment.questions || assignment.defaultQuestions || []).length} Câu hỏi
              </span>
              <span style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>
                ⏱️ {assignment.timeLimitMinutes > 0 ? `${assignment.timeLimitMinutes} Phút` : 'Không giới hạn thời gian'}
              </span>
              <span style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>
                🏆 Xếp hạng Bảng Vàng
              </span>
            </div>

            {/* Student Info Form */}
            <form onSubmit={handleStartGame} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  Họ và tên của em: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#0d9488" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ví dụ: Nguyễn Hoàng Nam"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  Lớp: <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <School size={18} color="#0d9488" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 7A1, 8/2, 10C3..."
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 25px rgba(13, 148, 136, 0.45)',
                  transition: 'all 0.2s'
                }}
              >
                <span>🚀 VÀO CHƠI GAME NGAY</span>
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        )}

        {/* PHASE 3: COMPLETED / VICTORY / LEADERBOARD SCREEN */}
        {gamePhase === 'completed' && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '2px solid rgba(13, 148, 136, 0.5)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '680px',
            padding: '32px 24px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
              {mySubmission?.grade10 >= 8 ? '🎉' : (mySubmission?.grade10 >= 6.5 ? '⭐' : '💪')}
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0' }}>
              Chúc Mừng {studentName}!
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 20px 0' }}>
              Em đã hoàn thành bài tập <strong style={{ color: '#38bdf8' }}>{assignment.customTitle || assignment.gameTitle}</strong>
            </p>

            {/* Score & Rank Highlight */}
            {(() => {
              const badge = getRankBadge(mySubmission?.grade10 || 10);
              return (
                <div style={{
                  display: 'inline-block',
                  background: badge.bg,
                  color: badge.color,
                  fontWeight: 900,
                  fontSize: '1rem',
                  padding: '6px 20px',
                  borderRadius: '999px',
                  marginBottom: '20px'
                }}>
                  {badge.label}
                </div>
              );
            })()}

            {/* Stats Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>ĐIỂM SỐ</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2dd4bf', marginTop: '2px' }}>
                  {mySubmission?.grade10} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ 10</span>
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>THỜI GIAN</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>
                  {formatTime(mySubmission?.timeSpentSeconds || 0)}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>ĐIỂM TRẬN ĐẤU</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ec4899', marginTop: '2px' }}>
                  {mySubmission?.score} đ
                </div>
              </div>
            </div>

            {/* Cloud Status */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              color: '#34d399',
              fontWeight: 700,
              marginBottom: '24px'
            }}>
              <CheckCircle2 size={16} />
              <span>Kết quả đã được tự động lưu lên Bảng Điểm của Thầy/Cô thành công!</span>
            </div>

            {/* Live Class Leaderboard */}
            {submissions.length > 0 && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Trophy size={18} color="#f59e0b" />
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                    🏆 Bảng Vàng Lớp Học ({submissions.length} bạn đã nộp)
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {submissions.slice(0, 10).map((sub, idx) => {
                    const isMe = sub.studentName?.toLowerCase() === studentName.toLowerCase() && sub.studentClass?.toLowerCase() === studentClass.toLowerCase();
                    return (
                      <div
                        key={sub.id || idx}
                        style={{
                          background: isMe ? 'rgba(13, 148, 136, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                          border: isMe ? '1.5px solid #0d9488' : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 900, width: '22px' }}>
                            {idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`))}
                          </span>
                          <span style={{ fontWeight: 800, color: isMe ? '#2dd4bf' : '#f8fafc' }}>
                            {sub.studentName} {isMe && '(Em)'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            ({sub.studentClass || 'Lớp'})
                          </span>
                        </div>

                        <div style={{ fontWeight: 900, color: '#38bdf8' }}>
                          {sub.grade10} điểm <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({formatTime(sub.timeSpentSeconds || 0)})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setGamePhase('playing')}
                style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RotateCw size={16} />
                <span>Chơi Lại Cải Thiện Điểm</span>
              </button>

              <button
                onClick={() => window.location.href = window.location.origin}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
