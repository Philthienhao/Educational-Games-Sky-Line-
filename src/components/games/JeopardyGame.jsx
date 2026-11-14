import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Award, Zap, Bomb, Sparkles, Flame, Check, X, ShieldAlert, ArrowRight, Trophy, Upload, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { isOptionValidForQuestion, parseUploadedFile } from '../../utils/universalParser';

// Column code letters for Jeopardy board
const COLUMN_CODES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// Special Mystery Event Types (May mắn hoặc xui)
const EVENT_TYPES = {
  QUESTION: 'question',         // Câu hỏi kiến thức
  BONUS: 'bonus',               // Thưởng điểm nóng (+)
  PENALTY: 'penalty',           // Bẫy trừ điểm (-)
  LOSE_TURN: 'lose_turn',       // Mất lượt chơi
  DOUBLE_POINTS: 'double',      // Nhân đôi số điểm (x2)
  BANKRUPT: 'bankrupt'          // Hố đen mất trắng điểm (0đ)
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
          <p><strong>1. Chọn Ô Điểm:</strong> Các đội lần lượt chọn các ô trên bảng với mức điểm từ 100 đến 600 điểm.</p>
          <p><strong>2. Trả Lời Câu Hỏi:</strong> Trả lời đúng nhận nguyên số điểm của ô đó. Trả lời sai lượt chuyển sang đội tiếp theo.</p>
          <p><strong>3. Ô Bí Ẩn Bất Ngờ (May Mắn hoặc Xui):</strong> Bên cạnh toàn bộ câu hỏi bài học, bảng có các ô sự kiện kịch tính:</p>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>🎁 <strong>Thưởng Điểm Nóng:</strong> Nhận điểm thưởng trực tiếp mà không cần trả lời câu hỏi!</li>
            <li>✨ <strong>Nhân Đôi Điểm (x2):</strong> Nhân đôi toàn bộ số điểm đội đang có!</li>
            <li>💣 <strong>Bẫy Trừ Điểm:</strong> Bị trừ số điểm tương ứng của ô.</li>
            <li>🚫 <strong>Mất Lượt:</strong> Bị mất lượt chơi và chuyển ngay sang đội tiếp theo.</li>
            <li>💥 <strong>Hố Đen Mất Trắng:</strong> Mất toàn bộ số điểm đang có về 0!</li>
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
 * Giao diện câu hỏi Full Màn Hình & Dàn đáp án 2x2 Cân Đối Tuyệt Đối
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
    const correct = String(letter).trim().toUpperCase() === String(tile.correct || 'A').trim().toUpperCase();
    setIsCorrect(correct);
    setShowAnswerResult(true);

    if (correct) {
      SoundFX.correct();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } else {
      SoundFX.wrong();
    }
  };

  const rawOptions = Array.isArray(tile.options) ? tile.options : ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'];
  const validOptions = rawOptions.filter((opt, idx) => isOptionValidForQuestion(rawOptions, idx));

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(ellipse at 50% 25%, #1e293b 0%, #0f172a 65%, #020617 100%)',
      border: '6px solid #f59e0b',
      zIndex: 9999999,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 36px',
      boxSizing: 'border-box',
      color: '#fff',
      overflowY: 'auto'
    }}>
      {/* 1. Header Tile Banner (Đã bỏ tiêu đề môn học đơn lẻ) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        borderBottom: '1.5px solid rgba(255,255,255,0.12)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#000',
            fontWeight: 900,
            fontSize: '1.1rem',
            padding: '6px 18px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
          }}>
            Ô {tile.code} ({tile.points} ĐIỂM)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {tile.type === EVENT_TYPES.QUESTION && !showAnswerResult && (
            <span style={{
              background: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(2, 132, 199, 0.25)',
              border: `1.5px solid ${timeLeft <= 5 ? '#ef4444' : '#38bdf8'}`,
              color: timeLeft <= 5 ? '#fca5a5' : '#7dd3fc',
              fontWeight: 900,
              fontSize: '1rem',
              padding: '5px 16px',
              borderRadius: '12px',
              animation: timeLeft <= 5 ? 'pulse 0.5s infinite' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ⏱️ Thời gian: {timeLeft}s
            </span>
          )}

          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: `1.5px solid ${activeTeam.color}`,
            padding: '5px 14px',
            borderRadius: '12px',
            color: activeTeam.color,
            fontWeight: 900,
            fontSize: '0.98rem'
          }}>
            👑 Lượt chơi: {activeTeam.name}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                cursor: 'pointer'
              }}
              title="Đóng câu hỏi về bảng"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* 2. BODY CONTENT: CENTERED FULL-SCREEN STAGE */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1350px',
        margin: '0 auto',
        padding: '24px 0',
        gap: '24px'
      }}>
        {/* 2A. MYSTERY SPECIAL EVENTS */}
        {tile.type !== EVENT_TYPES.QUESTION ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.92) 0%, rgba(15, 23, 42, 0.98) 100%)',
            border: '2.5px solid #f59e0b',
            borderRadius: '28px',
            padding: '40px 48px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            width: '100%',
            maxWidth: '720px'
          }}>
            {tile.type === EVENT_TYPES.BONUS && (
              <>
                <div style={{ fontSize: '5rem', animation: 'bounce 1s infinite' }}>🎁</div>
                <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fde047', margin: 0 }}>THƯỞNG ĐIỂM NÓNG!</h3>
                <p style={{ fontSize: '1.25rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                  Chúc mừng <strong>{activeTeam.name}</strong> mở trúng ô may mắn và nhận ngay <strong>+{tile.points} điểm</strong> thưởng!
                </p>
              </>
            )}

            {tile.type === EVENT_TYPES.DOUBLE_POINTS && (
              <>
                <div style={{ fontSize: '5rem', animation: 'pulse 1s infinite' }}>✨</div>
                <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#38bdf8', margin: 0 }}>NHÂN ĐÔI SỐ ĐIỂM (x2)!</h3>
                <p style={{ fontSize: '1.25rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                  Phép màu may mắn! <strong>{activeTeam.name}</strong> được <strong>x2 Nhân đôi toàn bộ số điểm</strong> hiện có của đội!
                </p>
              </>
            )}

            {tile.type === EVENT_TYPES.PENALTY && (
              <>
                <div style={{ fontSize: '5rem' }}>💣</div>
                <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444', margin: 0 }}>BẪY TRỪ ĐIỂM BẤT NGỜ!</h3>
                <p style={{ fontSize: '1.25rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                  Ôi không! <strong>{activeTeam.name}</strong> giẫm phải bẫy và bị trừ <strong>-{tile.points} điểm</strong>!
                </p>
              </>
            )}

            {tile.type === EVENT_TYPES.LOSE_TURN && (
              <>
                <div style={{ fontSize: '5rem' }}>🚫</div>
                <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fb923c', margin: 0 }}>MẤT LƯỢT CHƠI!</h3>
                <p style={{ fontSize: '1.25rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                  Rất tiếc! <strong>{activeTeam.name}</strong> bị mất lượt chơi này và lượt sẽ chuyển ngay sang đội tiếp theo.
                </p>
              </>
            )}

            {tile.type === EVENT_TYPES.BANKRUPT && (
              <>
                <div style={{ fontSize: '5rem' }}>💥</div>
                <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f43f5e', margin: 0 }}>HỐ ĐEN MẤT TRẮNG ĐIỂM!</h3>
                <p style={{ fontSize: '1.25rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                  Hố đen vũ trụ nuốt chửng! <strong>{activeTeam.name}</strong> bị mất toàn bộ số điểm đang có về 0 điểm!
                </p>
              </>
            )}

            <button
              onClick={() => onCompleteMystery(tile)}
              className="btn btn-primary btn-lg"
              style={{
                marginTop: '16px',
                borderRadius: '16px',
                padding: '16px 48px',
                fontSize: '1.15rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                boxShadow: '0 4px 18px rgba(245, 158, 11, 0.5)'
              }}
            >
              Nhận Sự Kiện & Tiếp Tục
            </button>
          </div>
        ) : (
          /* 2B. STANDARD QUESTION VIEW (FULL-SCREEN & DÀN ĐÁP ÁN 2x2 CÂN ĐỐI) */
          <>
            {/* Question Text Box */}
            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '2px solid rgba(245, 158, 11, 0.5)',
              borderRadius: '24px',
              padding: '28px 36px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
              textAlign: 'center'
            }}>
              {tile.image && (
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <img 
                    src={tile.image} 
                    alt="Minh họa câu hỏi" 
                    style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.2)', objectFit: 'contain' }} 
                  />
                </div>
              )}

              <h2 style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2.3rem)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.45,
                margin: 0,
                textShadow: '0 3px 10px rgba(0,0,0,0.6)'
              }}>
                {tile.question}
              </h2>
            </div>

            {/* DÀN ĐÁP ÁN CÂN ĐỐI 2x2 (Hàng trên 2 đáp án, Hàng dưới 2 đáp án) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px 20px',
              width: '100%'
            }}>
              {validOptions.map((optText, idx) => {
                const letter = ['A', 'B', 'C', 'D'][idx];
                const isThisSelected = selectedOpt === letter;
                const isThisCorrect = String(letter).trim().toUpperCase() === String(tile.correct || 'A').trim().toUpperCase();

                let btnBg = '#ffffff';
                let btnBorder = '#cbd5e1';
                let textColor = '#0f172a';
                let badgeBg = '#2563eb';

                if (showAnswerResult) {
                  if (isThisCorrect) {
                    btnBg = '#dcfce7';
                    btnBorder = '#16a34a';
                    textColor = '#14532d';
                    badgeBg = '#16a34a';
                  } else if (isThisSelected && !isCorrect) {
                    btnBg = '#fee2e2';
                    btnBorder = '#dc2626';
                    textColor = '#7f1d1d';
                    badgeBg = '#dc2626';
                  }
                }

                return (
                  <button
                    key={letter}
                    onClick={() => handleSelectOption(letter)}
                    disabled={showAnswerResult}
                    style={{
                      minHeight: '76px',
                      padding: '16px 24px',
                      borderRadius: '20px',
                      background: btnBg,
                      border: `2.5px solid ${btnBorder}`,
                      color: textColor,
                      textAlign: 'left',
                      fontSize: 'clamp(1.1rem, 1.6vw, 1.35rem)',
                      fontWeight: 900,
                      lineHeight: 1.4,
                      cursor: showAnswerResult ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s ease',
                      transform: isThisSelected ? 'scale(1.02)' : 'none'
                    }}
                  >
                    <span style={{
                      width: '42px',
                      height: '42px',
                      minWidth: '42px',
                      borderRadius: '12px',
                      background: badgeBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      color: '#fff',
                      fontSize: '1.25rem',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                    }}>
                      {letter}
                    </span>
                    <span style={{ flex: 1, color: textColor, fontWeight: 900 }}>
                      {optText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Answer Result & Confirmation Banner */}
            {showAnswerResult && (
              <div style={{
                width: '100%',
                background: isCorrect 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.22) 100%)' 
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(220, 38, 38, 0.22) 100%)',
                border: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                borderRadius: '20px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
              }}>
                <div>
                  <div style={{
                    fontWeight: 900,
                    color: isCorrect ? '#6ee7b7' : '#fca5a5',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {isCorrect ? <Check size={24} color="#10b981" /> : <X size={24} color="#ef4444" />}
                    {isCorrect 
                      ? `CHÍNH XÁC! +${tile.points} ĐIỂM CHO ${activeTeam.name} 👏` 
                      : `CHƯA CHÍNH XÁC! Đáp án đúng là: ${tile.correct}. Lượt chơi chuyển sang đội tiếp theo.`}
                  </div>
                  {tile.explanation && (
                    <div style={{ fontSize: '0.92rem', color: '#cbd5e1', marginTop: '6px', fontWeight: 600 }}>
                      💡 Căn cứ SGK: {tile.explanation}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onAnswer(tile, isCorrect)}
                  className="btn btn-primary"
                  style={{
                    borderRadius: '14px',
                    padding: '12px 28px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    flexShrink: 0,
                    background: isCorrect 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    boxShadow: isCorrect ? '0 4px 16px rgba(16, 185, 129, 0.4)' : '0 4px 16px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  Xác Nhận & Tiếp Tục <ArrowRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

/**
 * Thuật toán tạo bảng Jeopardy dạng ma trận chữ nhật HOÀN TOÀN ĐỀU ĐẶN
 * Hàng ngang và hàng dọc xếp khít 100%, không bị chỗ đầy chỗ thiếu.
 * Cam kết 100% câu hỏi tải lên đều có mặt trên bảng + Thêm đủ các ô may rủi!
 */
function buildJeopardyBoard(questionsList = []) {
  const safeQuestions = Array.isArray(questionsList) && questionsList.length > 0
    ? questionsList
    : [];

  const qCount = safeQuestions.length;

  // Xác định số cột và số hàng của ma trận
  let cols = 5;
  let rows = 4;

  if (qCount <= 16) {
    cols = 5;
    rows = 4; // 20 ô (Tối thiểu 4 ô may rủi)
  } else if (qCount <= 20) {
    cols = 5;
    rows = 6; // 30 ô (20 câu hỏi + ĐÚNG 10 ô may rủi theo yêu cầu)
  } else if (qCount <= 25) {
    cols = 5;
    rows = 6; // 30 ô (25 câu hỏi + 5 ô may rủi)
  } else if (qCount <= 30) {
    cols = 6;
    rows = 6; // 36 ô (30 câu hỏi + 6 ô may rủi)
  } else {
    cols = 6;
    rows = Math.min(8, Math.ceil((qCount + 6) / 6)); // Tự động mở rộng thêm hàng
  }

  const colCodes = COLUMN_CODES.slice(0, cols);
  const totalTiles = cols * rows;

  const numQuestionsToPlace = Math.min(qCount > 0 ? qCount : 16, totalTiles);
  const numMysteryTiles = Math.max(0, totalTiles - numQuestionsToPlace);

  // Vị trí các ô bí ẩn may rủi (Được xác định theo tọa độ col, row)
  const isMysteryCell = (c, r) => {
    if (cols === 5 && rows === 6 && numMysteryTiles === 10) {
      if (c === 0) return r === 2 || r === 5; // A3, A6
      if (c === 1) return r === 0 || r === 3; // B1, B4
      if (c === 2) return r === 1 || r === 4; // C2, C5
      if (c === 3) return r === 2 || r === 5; // D3, D6
      if (c === 4) return r === 0 || r === 3; // E1, E4
    }

    if (numMysteryTiles <= 0) return false;
    const step = Math.max(2, Math.floor(totalTiles / numMysteryTiles));
    const tileIndex = r * cols + c;
    return (tileIndex % step === 0);
  };

  // Kho sự kiện may mắn & xui xẻo (Cân đối 50% may mắn / 50% xui xẻo)
  const mysteryPool = [
    EVENT_TYPES.DOUBLE_POINTS, // ✨ Nhân đôi số điểm (x2)
    EVENT_TYPES.BONUS,         // 🎁 Thưởng điểm nóng (+)
    EVENT_TYPES.BONUS,         // 🎁 Thưởng điểm nóng (+)
    EVENT_TYPES.BONUS,         // 🎁 Thưởng điểm nóng (+)
    EVENT_TYPES.PENALTY,       // 💣 Bẫy trừ điểm (-)
    EVENT_TYPES.PENALTY,       // 💣 Bẫy trừ điểm (-)
    EVENT_TYPES.LOSE_TURN,     // 🚫 Mất lượt chơi
    EVENT_TYPES.LOSE_TURN,     // 🚫 Mất lượt chơi
    EVENT_TYPES.BANKRUPT,      // 💥 Hố đen mất trắng điểm (0đ)
    EVENT_TYPES.DOUBLE_POINTS  // ✨ Nhân đôi số điểm (x2)
  ];

  let qIndex = 0;
  let mysteryIndex = 0;
  const tiles = [];

  // Tạo ô THEO TỪNG HÀNG (Row by row):
  // Hàng 1 (r = 0): A1, B1, C1, D1, E1 -> Điểm 100
  // Hàng 2 (r = 1): A2, B2, C2, D2, E2 -> Điểm 200
  // Hàng 3 (r = 2): A3, B3, C3, D3, E3 -> Điểm 300
  // Hàng 4 (r = 3): A4, B4, C4, D4, E4 -> Điểm 400
  // Hàng 5 (r = 4): A5, B5, C5, D5, E5 -> Điểm 500
  // Hàng 6 (r = 5): A6, B6, C6, D6, E6 -> Điểm 600
  for (let r = 0; r < rows; r++) {
    const pts = (r + 1) * 100;
    for (let c = 0; c < cols; c++) {
      const code = `${colCodes[c]}${r + 1}`;
      const isMystery = isMysteryCell(c, r);

      if (isMystery && mysteryIndex < numMysteryTiles) {
        const mType = mysteryPool[mysteryIndex % mysteryPool.length];
        mysteryIndex++;

        tiles.push({
          id: `tile_${code}`,
          code: code,
          colIndex: c,
          rowIndex: r,
          points: pts, // Điểm số của ô luôn khớp chính xác với hàng
          type: mType,
          opened: false
        });
      } else {
        const qObj = safeQuestions[qIndex] || {
          question: `Câu hỏi ${code}: Câu hỏi kiến thức bài học môn học?`,
          options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
          correct: 'A',
          explanation: 'Dựa trên sách giáo khoa bài học.'
        };
        qIndex++;

        tiles.push({
          id: `tile_${code}`,
          code: code,
          colIndex: c,
          rowIndex: r,
          points: pts, // Điểm số của ô luôn khớp chính xác với hàng
          type: EVENT_TYPES.QUESTION,
          question: qObj.question,
          image: qObj.image || null,
          options: qObj.options || ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          correct: qObj.correct || 'A',
          explanation: qObj.explanation || '',
          opened: false
        });
      }
    }
  }

  return {
    tiles,
    config: {
      cols,
      rows,
      totalTiles,
      questionCount: qIndex,
      mysteryCount: mysteryIndex
    }
  };
}

/**
 * Main Jeopardy Game Component
 */
export function JeopardyGame({ questions = [], teams = [], activeTeamIndex = 0, setActiveTeamIndex, onAddPoints, title = '', subtitle = '', onClose }) {
  const fileInputRef = useRef(null);
  const [loadedQuestions, setLoadedQuestions] = useState(null);

  // Active question list prioritizes uploaded questions, then prop questions
  const activeQuestionsList = (Array.isArray(loadedQuestions) && loadedQuestions.length > 0)
    ? loadedQuestions
    : ((Array.isArray(questions) && questions.length > 0) ? questions : []);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [activeTile, setActiveTile] = useState(null);

  // Board matrix and configuration state
  const [boardTiles, setBoardTiles] = useState([]);
  const [boardConfig, setBoardConfig] = useState({
    cols: 5,
    rows: 4,
    totalTiles: 20,
    questionCount: 16,
    mysteryCount: 4
  });

  // Re-generate board whenever questions or uploaded questions change
  useEffect(() => {
    const { tiles, config } = buildJeopardyBoard(activeQuestionsList);
    setBoardTiles(tiles);
    setBoardConfig(config);
  }, [loadedQuestions, questions]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setLoadedQuestions(parsed);
        try { SoundFX.correct(); } catch(err) {}
        const total = parsed.length >= 17 && parsed.length <= 20 ? 30 : Math.max(20, parsed.length + 5);
        const mystery = total - parsed.length;
        alert(`Đã tải thành công ${parsed.length} câu hỏi từ file!\nBảng Đấu trí Jeopardy gồm ${total} ô (${parsed.length} câu hỏi đều hiển thị + ${mystery} ô may rủi bí ẩn) đã được xếp đều đặn.`);
      } else {
        alert('Không tìm thấy câu hỏi hợp lệ trong file.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đọc file câu hỏi: ' + err.message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

  // Sync external team updates if any
  useEffect(() => {
    if (teams && teams.length > 0) {
      setLocalTeams(teams.map(t => ({ ...t })));
    }
  }, [teams]);

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
      gap: '20px',
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
              {subtitle || `Bảng gồm ${boardConfig.totalTiles} ô (${boardConfig.questionCount} câu hỏi bài học + ${boardConfig.mysteryCount} ô may rủi bí ẩn)`}
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .docx, .doc, .txt"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '12px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#7dd3fc', fontSize: '0.82rem', fontWeight: 700 }}
            title="Tải câu hỏi từ file Excel hoặc Word lên trò chơi"
          >
            <Upload size={16} /> Nhập File ({boardConfig.questionCount} câu)
          </button>

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
            title="Làm mới lại toàn bộ các ô điểm trên bảng"
          >
            <RotateCcw size={16} /> Chơi lại
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: '12px', background: 'rgba(239, 68, 68, 0.3)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '0.82rem', fontWeight: 700 }}
            >
              <LogOut size={16} /> Thoát Game
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN JEOPARDY BOARD MATRIX GRID (ĐÃ BỎ CÁC TIÊU ĐỀ THEO YÊU CẦU & DÀN ĐỀU 100%) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Ma trận các ô điểm xếp hoàn toàn thẳng hàng ngang và hàng dọc */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${boardConfig.cols}, 1fr)`,
          gap: '14px',
          width: '100%'
        }}>
          {boardTiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleOpenTile(tile)}
              disabled={tile.opened}
              style={{
                height: boardConfig.rows > 5 ? '78px' : '90px',
                borderRadius: '18px',
                background: tile.opened 
                  ? 'rgba(30, 41, 59, 0.35)' 
                  : 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                border: tile.opened ? '1px solid rgba(255,255,255,0.06)' : '1.5px solid rgba(245, 158, 11, 0.45)',
                color: tile.opened ? '#475569' : '#fde047',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                cursor: tile.opened ? 'default' : 'pointer',
                boxShadow: tile.opened ? 'none' : '0 6px 18px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
                opacity: tile.opened ? 0.35 : 1
              }}
            >
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 900,
                color: tile.opened ? '#475569' : '#94a3b8',
                background: 'rgba(255,255,255,0.06)',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {tile.code}
              </span>

              <span style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>
                {tile.opened ? '✓' : tile.points}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. TILE REVEAL MODAL */}
      <TileModal
        tile={activeTile}
        activeTeam={activeTeamObj}
        onAnswer={handleAnswerQuestion}
        onCompleteMystery={handleCompleteMystery}
        onClose={() => setActiveTile(null)}
      />

      {/* 4. RULES MODAL */}
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />

    </div>
  );
}
