import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Trophy, CheckCircle2, XCircle, Clock, Award, Sparkles, 
  RotateCw, Share2, ArrowRight, User, BookOpen, School, AlertCircle, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HomeworkService } from '../../services/homeworkService';
import { SoundFX } from '../../utils/sound';

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

  // Play State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState([]); // { qIndex, question, selected, correct, isCorrect }
  
  // Lifelines
  const [used5050, setUsed5050] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);

  // Timer State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

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
        if (!data || (!data.questions && !data.id)) {
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

  // Handle Start Playing
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

    // Prepare questions (shuffle if configured)
    let rawQ = assignment.questions || assignment.defaultQuestions || [];
    if (!Array.isArray(rawQ) || rawQ.length === 0) {
      alert("Bài tập này hiện chưa có câu hỏi nào. Vui lòng liên hệ Thầy/Cô nhé!");
      return;
    }

    let preparedQ = [...rawQ];
    if (assignment.shuffleQuestions) {
      preparedQ.sort(() => Math.random() - 0.5);
    }

    setQuestions(preparedQ);
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setStudentAnswers([]);
    setUsed5050(false);
    setHiddenOptions([]);
    setElapsedSeconds(0);
    setGamePhase('playing');

    try { SoundFX.click(); } catch(e) {}
  };

  // Timer Tick during gameplay
  useEffect(() => {
    if (gamePhase === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          // Check time limit
          if (assignment?.timeLimitMinutes > 0 && next >= assignment.timeLimitMinutes * 60) {
            clearInterval(timerRef.current);
            handleFinishGame(score, studentAnswers, next);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gamePhase, assignment, score, studentAnswers]);

  // Handle Option Select
  const handleSelectOption = (optionIndex, optionText) => {
    if (isAnswerChecked) return;

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setSelectedOption(optionIndex);
    setIsAnswerChecked(true);

    const letterOptions = ['A', 'B', 'C', 'D'];
    const selectedLetter = letterOptions[optionIndex];
    const correctLetter = String(currentQ.correct || 'A').trim().toUpperCase();
    const isCorrect = selectedLetter === correctLetter || 
      (currentQ.options && String(currentQ.options[optionIndex] || '').trim() === String(currentQ.correct || '').trim());

    let pointsEarned = 0;
    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const comboMultiplier = newCombo >= 3 ? 1.5 : (newCombo >= 2 ? 1.2 : 1.0);
      pointsEarned = Math.round(100 * comboMultiplier);
      setScore(prev => prev + pointsEarned);
      try { SoundFX.correct(); } catch(e) {}
    } else {
      setCombo(0);
      try { SoundFX.wrong(); } catch(e) {}
    }

    const answerRecord = {
      qIndex: currentIndex + 1,
      question: currentQ.question,
      selectedLetter,
      selectedText: optionText,
      correctLetter,
      correctText: currentQ.options ? currentQ.options[letterOptions.indexOf(correctLetter)] : currentQ.correct,
      isCorrect,
      pointsEarned
    };

    const nextAnswers = [...studentAnswers, answerRecord];
    setStudentAnswers(nextAnswers);

    // Auto Advance to next question after 1.2s delay
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswerChecked(false);
        setHiddenOptions([]);
      } else {
        // Finished all questions!
        handleFinishGame(score + pointsEarned, nextAnswers, elapsedSeconds);
      }
    }, 1300);
  };

  // 50:50 Lifeline Handler
  const handleUse5050 = () => {
    if (used5050 || isAnswerChecked) return;
    const currentQ = questions[currentIndex];
    if (!currentQ || !Array.isArray(currentQ.options) || currentQ.options.length <= 2) return;

    const letterOptions = ['A', 'B', 'C', 'D'];
    const correctLetter = String(currentQ.correct || 'A').trim().toUpperCase();
    const correctIdx = letterOptions.indexOf(correctLetter);

    // Pick 2 wrong indices to hide
    const wrongIndices = [0, 1, 2, 3].filter(idx => idx < currentQ.options.length && idx !== correctIdx);
    const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);

    setHiddenOptions(toHide);
    setUsed5050(true);
    try { SoundFX.click(); } catch(e) {}
  };

  // Finish Game & Submit Result to Supabase
  const handleFinishGame = async (finalGameScore, allAnswers, finalTimeSeconds) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const totalQ = questions.length || 1;
    const correctCount = allAnswers.filter(a => a.isCorrect).length;
    
    // Normalized 0 - 100 score & 0 - 10 grade
    const normalizedScore100 = Math.round((correctCount / totalQ) * 100);
    const grade10 = Number(((correctCount / totalQ) * 10).toFixed(1));

    const submissionPayload = {
      assignmentId: assignment.id,
      studentName: studentName.trim(),
      studentClass: studentClass.trim(),
      score: normalizedScore100,
      grade10,
      correctCount,
      totalQuestions: totalQ,
      timeSpentSeconds: finalTimeSeconds,
      details: allAnswers
    };

    setMySubmission(submissionPayload);
    setGamePhase('completed');

    // Confetti and Victory Sound
    try {
      SoundFX.win();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Submit to Cloud
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

  const currentQ = questions[currentIndex];
  const letterLabels = ['A', 'B', 'C', 'D'];
  const optionColors = [
    { bg: '#ef4444', text: '#ffffff', border: '#dc2626' }, // A: Red
    { bg: '#3b82f6', text: '#ffffff', border: '#2563eb' }, // B: Blue
    { bg: '#f59e0b', text: '#ffffff', border: '#d97706' }, // C: Yellow
    { bg: '#10b981', text: '#ffffff', border: '#059669' }  // D: Green
  ];

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

        {gamePhase === 'playing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Timer Badge */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#38bdf8'
            }}>
              <Clock size={16} />
              <span>{formatTime(elapsedSeconds)}</span>
              {assignment.timeLimitMinutes > 0 && (
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  / {assignment.timeLimitMinutes}p
                </span>
              )}
            </div>

            {/* Score & Combo Badge */}
            <div style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              padding: '6px 14px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              fontWeight: 900
            }}>
              <Trophy size={16} color="#fbbf24" />
              <span>{score} pts</span>
              {combo >= 2 && (
                <span style={{
                  background: '#f59e0b',
                  color: '#0f172a',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.72rem'
                }}>
                  Combo x{combo}!
                </span>
              )}
            </div>
          </div>
        )}
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
                📝 {(assignment.questions || []).length} Câu trắc nghiệm
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
                <span>🚀 BẮT ĐẦU LÀM BÀI NGAY</span>
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        )}

        {/* PHASE 2: PLAYING GAME ARENA */}
        {gamePhase === 'playing' && currentQ && (
          <div style={{
            width: '100%',
            maxWidth: '850px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Progress & Lifeline Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8' }}>
                  Câu {currentIndex + 1} / {questions.length}
                </span>
                {/* Visual Progress Bar */}
                <div style={{
                  width: '220px',
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginTop: '4px'
                }}>
                  <div style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #0d9488 0%, #0284c7 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* 50:50 Lifeline Button */}
              <button
                onClick={handleUse5050}
                disabled={used5050 || isAnswerChecked}
                style={{
                  background: used5050 ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  color: used5050 ? '#64748b' : '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: used5050 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <HelpCircle size={15} />
                <span>Trợ giúp 50:50 {used5050 && '(Đã dùng)'}</span>
              </button>
            </div>

            {/* Question Card Box */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.95)',
              border: '2px solid rgba(13, 148, 136, 0.5)',
              borderRadius: '24px',
              padding: '30px 24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              textAlign: 'center',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                top: '-14px',
                left: '24px',
                background: '#0d9488',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 900,
                padding: '4px 14px',
                borderRadius: '999px',
                letterSpacing: '0.05em'
              }}>
                CÂU HỎI SỐ {currentIndex + 1}
              </span>

              <h2 style={{
                fontSize: 'clamp(1.15rem, 2.5vw, 1.45rem)',
                fontWeight: 800,
                color: '#f8fafc',
                lineHeight: 1.5,
                margin: '10px 0 0 0'
              }}>
                {currentQ.question}
              </h2>
            </div>

            {/* Options 4-Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px'
            }}>
              {(currentQ.options || []).map((optionText, optIdx) => {
                if (hiddenOptions.includes(optIdx)) {
                  return (
                    <div 
                      key={optIdx} 
                      style={{ 
                        opacity: 0.15, 
                        border: '1.5px dashed rgba(255,255,255,0.2)', 
                        borderRadius: '18px', 
                        minHeight: '75px' 
                      }} 
                    />
                  );
                }

                const isSelected = selectedOption === optIdx;
                const letterOptions = ['A', 'B', 'C', 'D'];
                const correctLetter = String(currentQ.correct || 'A').trim().toUpperCase();
                const isCorrectOption = letterOptions[optIdx] === correctLetter || String(optionText).trim() === String(currentQ.correct).trim();

                let cardBg = 'rgba(30, 41, 59, 0.9)';
                let cardBorder = 'rgba(255, 255, 255, 0.15)';

                if (isAnswerChecked) {
                  if (isCorrectOption) {
                    cardBg = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    cardBorder = '#34d399';
                  } else if (isSelected && !isCorrectOption) {
                    cardBg = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                    cardBorder = '#f87171';
                  }
                } else if (isSelected) {
                  cardBg = 'rgba(13, 148, 136, 0.4)';
                  cardBorder = '#0d9488';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx, optionText)}
                    disabled={isAnswerChecked}
                    style={{
                      background: cardBg,
                      border: `2px solid ${cardBorder}`,
                      borderRadius: '18px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: isAnswerChecked ? 'default' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: optionColors[optIdx % 4].bg,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      flexShrink: 0
                    }}>
                      {letterLabels[optIdx]}
                    </div>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      flex: 1,
                      lineHeight: 1.4
                    }}>
                      {optionText}
                    </span>
                    {isAnswerChecked && isCorrectOption && (
                      <CheckCircle2 size={24} color="#ffffff" />
                    )}
                    {isAnswerChecked && isSelected && !isCorrectOption && (
                      <XCircle size={24} color="#ffffff" />
                    )}
                  </button>
                );
              })}
            </div>
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
              const badge = getRankBadge(mySubmission?.grade10 || 0);
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

            {/* 4 Stats Cards Grid */}
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
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>CÂU ĐÚNG</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
                  {mySubmission?.correctCount} / {mySubmission?.totalQuestions}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>THỜI GIAN</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>
                  {formatTime(mySubmission?.timeSpentSeconds || 0)}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>ĐIỂM GAME</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ec4899', marginTop: '2px' }}>
                  {mySubmission?.score} pts
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
              {assignment.allowRetry && (
                <button
                  onClick={handleStartGame}
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
              )}

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
