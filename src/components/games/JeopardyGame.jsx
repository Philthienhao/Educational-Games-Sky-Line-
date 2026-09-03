import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Award, Zap, Bomb, Sparkles, Flame, Check, X, ShieldAlert, ArrowRight, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { isOptionValidForQuestion } from '../../utils/universalParser';

// Default Jeopardy Categories matching teacher screenshot
const DEFAULT_CATEGORIES = [
  { id: 'cat_a', code: 'A', name: 'SỬ DỤNG BẢN ĐỒ', icon: '🗺️' },
  { id: 'cat_b', code: 'B', name: 'TỈ LỆ BẢN ĐỒ', icon: '📏' },
  { id: 'cat_c', code: 'C', name: 'HỆ THỐNG GPS', icon: '🛰️' },
  { id: 'cat_d', code: 'D', name: 'BẢN ĐỒ SỐ', icon: '📱' },
  { id: 'cat_e', code: 'E', name: 'ỨNG DỤNG THỰC TIỄN', icon: '🌐' }
];

// Special Mystery Event Types
const EVENT_TYPES = {
  QUESTION: 'question',         // Standard Question
  BONUS: 'bonus',               // Bonus Points
  PENALTY: 'penalty',           // Penalty Deduction
  LOSE_TURN: 'lose_turn',       // Lose Turn
  DOUBLE_POINTS: 'double',      // Double Current Points (x2)
  BANKRUPT: 'bankrupt'          // Bankrupt (Reset to 0)
};

/**
 * Top-Level Helper Component: Rules Modal
 */
function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 4000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1e293b',
        border: '2px solid #f59e0b',
        borderRadius: '24px',
        padding: '28px',
        maxWidth: '550px',
        width: '100%',
        color: '#fff',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fde047', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            ❓ LUẬT CHƠI JEOPARDY
          </h3>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
          <p><strong>1. Chọn Ô Điểm:</strong> Các đội lần lượt chọn các ô câu hỏi thuộc 5 chủ đề khác nhau với giá trị từ 100 đến 500 điểm.</p>
          <p><strong>2. Trả Lời Câu Hỏi:</strong> Trả lời đúng nhận nguyên số điểm của ô đó. Trả lời sai lượt chuyển sang đội khác.</p>
          <p><strong>3. Ô Bí Ẩn Bất Ngờ:</strong> Đằng sau mỗi ô có thể ẩn chứa các sự kiện đặc biệt:</p>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>🎁 <strong>Thưởng Điểm Nóng:</strong> Nhận điểm thưởng trực tiếp mà không cần trả lời câu hỏi!</li>
            <li>💣 <strong>Trừ Điểm Bất Ngờ:</strong> Bị bẫy và trừ số điểm tương ứng.</li>
            <li>🚫 <strong>Mất Lượt:</strong> Bị mất lượt và chuyển sang đội tiếp theo.</li>
            <li>✨ <strong>Nhân Đôi Số Điểm (x2):</strong> Nhân đôi toàn bộ số điểm đội đang có!</li>
            <li>💥 <strong>Mất Trắng Điểm:</strong> Hố đen bí ẩn làm mất toàn bộ điểm về 0!</li>
          </ul>
        </div>
        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', marginTop: '24px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#000', fontWeight: 900 }}>
          Đã Hiểu - Bắt Đầu Đấu Trí!
        </button>
      </div>
    </div>
  );
}

/**
 * Top-Level Helper Component: Tile Reveal Modal (Question or Mystery Event)
 */
function TileModal({ tile, activeTeam, onAnswer, onCompleteMystery, onClose }) {
  if (!tile) return null;

  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (!tile || tile.type !== EVENT_TYPES.QUESTION || showAnswerResult) return;

    setTimeLeft(20);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowAnswerResult(true);
          setIsCorrect(false);
          setSelectedOpt('TIMEOUT');
          try { SoundFX.wrong(); } catch(e) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tile, showAnswerResult]);

  const handleSelectOption = (letter) => {
    if (showAnswerResult) return;
    setSelectedOpt(letter);
    const correct = letter === (tile.correct || 'A');
    setIsCorrect(correct);
    setShowAnswerResult(true);

    if (correct) {
      SoundFX.correct();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      SoundFX.wrong();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(11, 15, 25, 0.9)',
      backdropFilter: 'blur(10px)',
      zIndex: 3500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '2px solid #f59e0b',
        borderRadius: '28px',
        padding: '32px',
        maxWidth: '750px',
        width: '100%',
        color: '#fff',
        boxShadow: '0 25px 60px rgba(245, 158, 11, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        animation: 'popIn 0.3s ease-out'
      }}>
        {/* Header Tile Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: '#f59e0b', color: '#000', fontWeight: 900, fontSize: '1rem', padding: '4px 14px', borderRadius: '10px' }}>
              Ô {tile.code} ({tile.points} ĐIỂM)
            </span>
            <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.9rem' }}>
              Chủ đề: {tile.categoryName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {tile.type === EVENT_TYPES.QUESTION && !showAnswerResult && (
              <span style={{
                background: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(2, 132, 199, 0.25)',
                border: `1.5px solid ${timeLeft <= 5 ? '#ef4444' : '#38bdf8'}`,
                color: timeLeft <= 5 ? '#fca5a5' : '#7dd3fc',
                fontWeight: 900,
                fontSize: '0.9rem',
                padding: '4px 12px',
                borderRadius: '10px',
                animation: timeLeft <= 5 ? 'pulse 0.5s infinite' : 'none'
              }}>
                ⏱️ Thời gian: {timeLeft}s
              </span>
            )}

            <div style={{ color: activeTeam.color, fontWeight: 900, fontSize: '0.95rem' }}>
              Lượt chơi: {activeTeam.name}
            </div>
          </div>
        </div>

        {/* 1. MYSTERY SPECIAL EVENTS */}
        {tile.type !== EVENT_TYPES.QUESTION ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {tile.type === EVENT_TYPES.BONUS && (
              <>
                <div style={{ fontSize: '4rem', animation: 'bounce 1s infinite' }}>🎁</div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fde047', margin: 0 }}>THƯỞNG ĐIỂM NÓNG!</h3>
                <p style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>
                  Chúc mừng <strong>{activeTeam.name}</strong> nhận ngay <strong>+{tile.points} điểm</strong> thưởng!
                </p>
              </>
            )}

            {tile.type === EVENT_TYPES.PENALTY && (
              <>
                <div style={{ fontSize: '4rem', animation: 'shake 0.5s' }}>💣</div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ef4444', margin: 0 }}>TRỪ ĐIỂM BẤT NGỜ!</h3>
                <p style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>
                  Bẫy bãi mìn! <strong>{activeTeam.name}</strong> bị trừ <strong>-{tile.points} điểm</strong>!
                </p>
              </>
            )}

            {tile.type === EVENT_TYPES.LOSE_TURN && (
              <>
                <div style={{ fontSize: '4rem' }}>🚫</div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fb923c', margin: 0 }}>MẤT LƯỢT CHƠI!</h3>
                <p style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>
                  Rất tiếc! <strong>{activeTeam.name}</strong> bị mất lượt chơi này và chuyển sang đội tiếp theo.
                </p>
              </>
            )}

            {tile.type === EVENT_TYPES.DOUBLE_POINTS && (
              <>
                <div style={{ fontSize: '4rem', animation: 'pulse 1s infinite' }}>✨</div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', margin: 0 }}>NHÂN ĐÔI SỐ ĐIỂM!</h3>
                <p style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>
                  Bùa phép thuật! <strong>{activeTeam.name}</strong> được <strong>x2 Nhân đôi toàn bộ số điểm</strong> hiện có!
                </p>
              </>
            )}

            {tile.type === EVENT_TYPES.BANKRUPT && (
              <>
                <div style={{ fontSize: '4rem' }}>💥</div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f43f5e', margin: 0 }}>MẤT TRẮNG ĐIỂM SỐ!</h3>
                <p style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>
                  Hố đen vũ trụ! <strong>{activeTeam.name}</strong> bị mất toàn bộ số điểm đang có về 0!
                </p>
              </>
            )}

            <button
              onClick={() => onCompleteMystery(tile)}
              className="btn btn-primary btn-lg"
              style={{ marginTop: '16px', borderRadius: '16px', padding: '14px 40px', fontWeight: 900, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#000' }}
            >
              Nhận Sự Kiện & Tiếp Tục
            </button>
          </div>
        ) : (
          /* 2. STANDARD QUESTION MODAL */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.4, margin: 0 }}>
              {tile.question}
            </h2>

            {/* Options List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {(tile.options || ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D']).map((optText, idx) => {
                if (!isOptionValidForQuestion(tile?.options, idx)) return null;
                const letter = ['A', 'B', 'C', 'D'][idx];
                const isThisSelected = selectedOpt === letter;
                const isThisCorrect = letter === tile.correct;

                let btnBg = 'rgba(30, 41, 59, 0.9)';
                let btnBorder = 'rgba(255,255,255,0.15)';
                let textColor = '#fff';

                if (showAnswerResult) {
                  if (isThisCorrect) {
                    btnBg = 'rgba(16, 185, 129, 0.25)';
                    btnBorder = '#10b981';
                    textColor = '#6ee7b7';
                  } else if (isThisSelected && !isCorrect) {
                    btnBg = 'rgba(239, 68, 68, 0.25)';
                    btnBorder = '#ef4444';
                    textColor = '#fca5a5';
                  }
                }

                return (
                  <button
                    key={letter}
                    onClick={() => handleSelectOption(letter)}
                    disabled={showAnswerResult}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      background: btnBg,
                      border: `2px solid ${btnBorder}`,
                      color: textColor,
                      textAlign: 'left',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: showAnswerResult ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isThisCorrect && showAnswerResult ? '#10b981' : isThisSelected && !isCorrect ? '#ef4444' : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      color: '#fff',
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}>
                      {letter}
                    </span>
                    <span style={{ flex: 1 }}>{optText}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Result Banner */}
            {showAnswerResult && (
              <div style={{
                background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1.5px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontWeight: 900, color: isCorrect ? '#6ee7b7' : '#fca5a5', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isCorrect ? <Check size={20} /> : <X size={20} />}
                    {isCorrect ? `CHÍNH XÁC! +${tile.points} ĐIỂMCHO ${activeTeam.name}` : `CHƯA ĐÚNG! CHUYỂN LƯỢT CHO ĐỘI TIẾP THEO`}
                  </div>
                  {tile.explanation && (
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
                      💡 Căn cứ SGK: {tile.explanation}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onAnswer(tile, isCorrect)}
                  className="btn btn-primary"
                  style={{
                    borderRadius: '12px',
                    padding: '10px 24px',
                    fontWeight: 900,
                    background: isCorrect ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  }}
                >
                  Xác Nhận & Tiếp Tục <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main Jeopardy Game Component
 */
export function JeopardyGame({ questions = [], teams = [], activeTeamIndex = 0, setActiveTeamIndex, onAddPoints, title = '', subtitle = '' }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [activeTile, setActiveTile] = useState(null);

  // Local Editable Team Names & Scores State
  const [localTeams, setLocalTeams] = useState(() => {
    if (teams && teams.length > 0) {
      return teams.map(t => ({ ...t }));
    }
    return [
      { id: 't1', name: 'Đội 1', score: 0, color: '#f59e0b' },
      { id: 't2', name: 'Đội 2', score: 0, color: '#3b82f6' },
      { id: 't3', name: 'Đội 3', score: 0, color: '#10b981' },
      { id: 't4', name: 'Đội 4', score: 0, color: '#8b5cf6' }
    ];
  });

  // Generate 5x4 Grid Matrix of Tiles (A1-A4, B1-B4, C1-C4, D1-D4, E1-E4)
  const [boardTiles, setBoardTiles] = useState([]);

  // Initialize Jeopardy Board Matrix from questions or generator
  useEffect(() => {
    const categories = DEFAULT_CATEGORIES;
    const tiles = [];
    const pointLevels = [100, 200, 300, 400];

    let questionIdx = 0;
    categories.forEach((cat, colIdx) => {
      pointLevels.forEach((pts, rowIdx) => {
        const tileCode = `${cat.code}${rowIdx + 1}`;
        const qObj = questions[questionIdx] || {
          question: `Câu hỏi ${tileCode}: Kiến thức tổng hợp môn học liên quan đến ${cat.name}?`,
          options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
          correct: 'A',
          explanation: 'Dựa trên sách giáo khoa bài học.'
        };

        // Determine if this tile is a Mystery Event tile (approx 20% chance for mystery events)
        let eventType = EVENT_TYPES.QUESTION;
        const rand = (colIdx * 4 + rowIdx) % 10;
        if (rand === 3) eventType = EVENT_TYPES.BONUS;
        else if (rand === 6) eventType = EVENT_TYPES.PENALTY;
        else if (rand === 8) eventType = EVENT_TYPES.DOUBLE_POINTS;
        else if (rand === 9) eventType = EVENT_TYPES.BANKRUPT;

        tiles.push({
          id: `tile_${cat.code}_${rowIdx + 1}`,
          code: tileCode,
          categoryCode: cat.code,
          categoryName: cat.name,
          points: pts,
          type: eventType,
          question: qObj.question,
          options: qObj.options || ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          correct: qObj.correct || 'A',
          explanation: qObj.explanation || '',
          opened: false
        });

        questionIdx++;
      });
    });

    setBoardTiles(tiles);
  }, [questions]);

  // Sync external team updates if any
  useEffect(() => {
    if (teams && teams.length > 0) {
      setLocalTeams(teams.map(t => ({ ...t })));
    }
  }, [teams]);

  // Handle Team Name Edit
  const handleTeamNameChange = (idx, newName) => {
    setLocalTeams(prev => prev.map((t, i) => i === idx ? { ...t, name: newName } : t));
  };

  // Handle Quick Adjust Score
  const handleAdjustTeamScore = (idx, delta) => {
    if (onAddPoints) {
      onAddPoints(idx, delta);
    }
  };

  // Handle Select Active Turn Team
  const handleSetTurn = (idx) => {
    if (setActiveTeamIndex) {
      setActiveTeamIndex(idx);
    }
    SoundFX.click();
  };

  // Handle Opening Tile Card
  const handleOpenTile = (tile) => {
    if (tile.opened) return;
    setActiveTile(tile);
    SoundFX.pop();
  };

  // Handle Standard Question Answer Confirmation
  const handleAnswerQuestion = (tile, isCorrect) => {
    setBoardTiles(prev => prev.map(t => t.id === tile.id ? { ...t, opened: true } : t));

    if (isCorrect) {
      if (onAddPoints) onAddPoints(activeTeamIndex, tile.points);
    }

    // Auto Advance Turn to Next Team
    const numTeams = teams && teams.length > 0 ? teams.length : 4;
    const nextTurn = (activeTeamIndex + 1) % numTeams;
    if (setActiveTeamIndex) setActiveTeamIndex(nextTurn);

    setActiveTile(null);
  };

  // Handle Mystery Special Event Completion
  const handleCompleteMystery = (tile) => {
    setBoardTiles(prev => prev.map(t => t.id === tile.id ? { ...t, opened: true } : t));

    const numTeams = teams && teams.length > 0 ? teams.length : 4;
    const currentScore = teams[activeTeamIndex]?.score || 0;

    if (tile.type === EVENT_TYPES.BONUS) {
      SoundFX.win();
      confetti({ particleCount: 50, spread: 60 });
      if (onAddPoints) onAddPoints(activeTeamIndex, tile.points);
    } else if (tile.type === EVENT_TYPES.PENALTY) {
      SoundFX.wrong();
      if (onAddPoints) onAddPoints(activeTeamIndex, -tile.points);
    } else if (tile.type === EVENT_TYPES.LOSE_TURN) {
      SoundFX.wrong();
    } else if (tile.type === EVENT_TYPES.DOUBLE_POINTS) {
      SoundFX.win();
      confetti({ particleCount: 70, spread: 80 });
      if (onAddPoints) onAddPoints(activeTeamIndex, Math.max(100, currentScore));
    } else if (tile.type === EVENT_TYPES.BANKRUPT) {
      SoundFX.wrong();
      if (onAddPoints) onAddPoints(activeTeamIndex, -currentScore);
    }

    // Auto Advance Turn to Next Team
    const nextTurn = (activeTeamIndex + 1) % numTeams;
    if (setActiveTeamIndex) setActiveTeamIndex(nextTurn);

    setActiveTile(null);
  };

  // Restart Board State
  const handleRestartBoard = () => {
    setBoardTiles(prev => prev.map(t => ({ ...t, opened: false })));
    if (setActiveTeamIndex) setActiveTeamIndex(0);
    SoundFX.click();
  };

  const activeTeamObj = teams[activeTeamIndex] || teams[0] || { name: 'Đội 1', color: '#f59e0b' };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0a0e17',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.15) 0%, transparent 75%)',
      color: '#fff',
      padding: '20px 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. TOP HEADER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
          }}>
            🟨
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fde047', letterSpacing: '0.5px', margin: 0, textTransform: 'uppercase' }}>
              {title || 'JEOPARDY ĐẤU TRÍ THỨC'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '2px 0 0 0', fontWeight: 700 }}>
              {subtitle || 'Ôn tập kiến thức bài học & Mở ô điểm thưởng kịch tính'}
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}
          >
            {soundEnabled ? <Volume2 size={16} color="#6ee7b7" /> : <VolumeX size={16} color="#fca5a5" />}
            Âm thanh: {soundEnabled ? 'Bật' : 'Tắt'}
          </button>

          <button
            onClick={() => setShowRules(true)}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#60a5fa', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <HelpCircle size={16} /> Luật chơi
          </button>

          <button
            onClick={handleRestartBoard}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '0.82rem', fontWeight: 700 }}
          >
            <RotateCcw size={16} /> Chơi lại
          </button>
        </div>
      </div>

      {/* 2. MAIN JEOPARDY BOARD MATRIX GRID */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Matrix Tiles Rows (Point levels: 100, 200, 300, 400) */}
        {[100, 200, 300, 400].map(pointVal => (
          <div key={pointVal} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
            {DEFAULT_CATEGORIES.map(cat => {
              const tile = boardTiles.find(t => t.categoryCode === cat.code && t.points === pointVal);
              if (!tile) return null;

              return (
                <button
                  key={tile.id}
                  onClick={() => handleOpenTile(tile)}
                  disabled={tile.opened}
                  style={{
                    height: '90px',
                    borderRadius: '18px',
                    background: tile.opened 
                      ? 'rgba(30, 41, 59, 0.4)' 
                      : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    border: tile.opened ? '1px solid rgba(255,255,255,0.05)' : '1.5px solid rgba(245, 158, 11, 0.4)',
                    color: tile.opened ? '#475569' : '#fde047',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: tile.opened ? 'default' : 'pointer',
                    boxShadow: tile.opened ? 'none' : '0 6px 15px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease',
                    opacity: tile.opened ? 0.4 : 1
                  }}
                >
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    color: tile.opened ? '#475569' : '#94a3b8',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {tile.code}
                  </span>

                  <span style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>
                    {tile.opened ? '✓' : tile.points}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 4. TILE REVEAL MODAL */}
      <TileModal
        tile={activeTile}
        activeTeam={activeTeamObj}
        onAnswer={handleAnswerQuestion}
        onCompleteMystery={handleCompleteMystery}
        onClose={() => setActiveTile(null)}
      />

      {/* 5. RULES MODAL */}
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />

    </div>
  );
}
