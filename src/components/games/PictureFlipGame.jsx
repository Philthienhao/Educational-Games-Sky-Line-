import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { 
  Eye, CheckCircle2, XCircle, Sparkles, Image as ImageIcon, Upload, 
  ArrowLeft, Users, User, Shuffle, Trophy, RotateCcw, Plus, Trash2, 
  Edit3, Clock, Search, Pause, Play, FileText, ChevronRight, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { isOptionValidForQuestion, parseUploadedFile, parseStudentRosterFile } from '../../utils/universalParser';
import { StorageService } from '../../services/storage';

const DEFAULT_FLIP_QUESTIONS = [
  { question: 'Thủ đô của Việt Nam là thành phố nào?', options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Huế'], correct: 'A' },
  { question: '2 + 2 x 3 = ?', options: ['8', '12', '10', '16'], correct: 'A' },
  { question: 'Đại dương nào có diện tích lớn nhất hành tinh?', options: ['Thái Bình Dương', 'Đại Tây Dương', 'Ấn Độ Dương', 'Bắc Băng Dương'], correct: 'A' },
  { question: 'Kim loại nào có tính dẫn điện tốt nhất?', options: ['Bạc (Ag)', 'Đồng (Cu)', 'Vàng (Au)', 'Nhôm (Al)'], correct: 'A' },
  { question: 'Tác phẩm "Truyện Kiều" là kiệt tác của danh nhân văn hóa nào?', options: ['Nguyễn Du', 'Nguyễn Trãi', 'Hồ Xuân Hương', 'Nguyễn Khuyến'], correct: 'A' },
  { question: 'Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?', options: ['Sao Thủy', 'Sao Kim', 'Trái Đất', 'Sao Hỏa'], correct: 'A' }
];

const DEFAULT_STUDENT_ROSTERS = {
  'Lớp 9A1 (Mẫu 24 HS)': [
    'Hồ Thị Uyên', 'Văn An', 'Quốc Hùng', 'Thị Linh', 'Thị Nhung', 'Thị Thanh',
    'Văn Sơn', 'Thị Quỳnh', 'Minh Hoàng', 'Văn Khải', 'Thị Dung', 'Văn Trường',
    'Thị Thu', 'Thị Hoa', 'Văn Minh', 'Thị Lan', 'Văn Hùng', 'Thị Hạnh',
    'Văn Nam', 'Thị Trang', 'Văn Tú', 'Thị Thảo', 'Văn Cường', 'Thị Vân'
  ],
  'Lớp 10A2 (15 HS)': [
    'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Dũng', 'Vũ Thị Em',
    'Đặng Văn Phúc', 'Bùi Thị Giang', 'Đỗ Minh Hưng', 'Hồ Văn Ích', 'Nông Thị Kiều',
    'Trịnh Văn Long', 'Phan Thị Mai', 'Lương Văn Nam', 'Ngô Thị Oanh', 'Dương Văn Phong'
  ],
  'Lớp 6A3 (10 HS)': [
    'An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hương', 'Khánh', 'Linh', 'Minh', 'Nam'
  ]
};

const TEAM_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#eab308',
  '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

/**
 * Top-level Modal: Paste/Input Student List (Rule 1 Compliance)
 */
function PasteStudentsModal({ isOpen, onClose, onApply, currentText = '' }) {
  const [inputText, setInputText] = useState(currentText);

  useEffect(() => {
    if (isOpen) setInputText(currentText);
  }, [isOpen, currentText]);

  if (!isOpen) return null;

  const parsedNames = inputText
    .split(/[\n,;]+/)
    .map(line => line.replace(/^[\s\d]+[\.\)\/\-\:\s]+/, '').trim())
    .filter(name => name.length > 0 && !/^\d+$/.test(name));

  const handleApply = () => {
    if (parsedNames.length === 0) {
      alert('Vui lòng nhập ít nhất 1 tên học sinh hợp lệ.');
      return;
    }
    onApply(parsedNames, inputText);
    onClose();
  };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1e293b',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '560px',
        padding: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
            <FileText size={22} /> Nhập / Dán Danh Sách Học Sinh
          </h3>
          <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 800, background: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: '10px' }}>
            {parsedNames.length} học sinh nhận diện
          </span>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
          Dán danh sách từ Excel, Word hoặc Zalo (mỗi học sinh 1 dòng hoặc cách nhau bởi dấu phẩy). Hệ thống tự động lọc bỏ số thứ tự đầu dòng (1., 2., 3...).
        </p>

        <textarea
          rows={10}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Nguyễn Văn An\nTrần Thị Bình\nLê Hoàng Cường\nPhạm Minh Dũng...`}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: '#0f172a',
            border: '1.5px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            color: '#f8fafc',
            padding: '14px',
            fontSize: '0.92rem',
            fontFamily: 'monospace',
            outline: 'none',
            resize: 'vertical'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ borderRadius: '12px', padding: '8px 18px' }}
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleApply}
            className="btn btn-primary"
            style={{ borderRadius: '12px', padding: '8px 22px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', fontWeight: 900 }}
          >
            Áp Dụng ({parsedNames.length} Học Sinh)
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Top-level Modal: Individual Student Leaderboard (Rule 1 Compliance)
 */
function StudentLeaderboardModal({ isOpen, onClose, students = [], onAdjustScore, onResetScores }) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const sortedStudents = [...students].sort((a, b) => (b.score || 0) - (a.score || 0));
  const filtered = sortedStudents.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()));

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1e293b',
        border: '1.5px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '85vh',
        padding: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15' }}>
              <Trophy size={24} /> Bảng Vàng Điểm Số Cá Nhân
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Mỗi học sinh là 1 đội chơi • Tổng cộng {students.length} học sinh
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '12px' }}>
            Đóng
          </button>
        </div>

        {/* Filter & Reset Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Tìm tên học sinh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '8px 12px 8px 36px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
          <button
            onClick={() => {
              if (window.confirm("Thầy cô có chắc muốn đặt lại điểm của tất cả học sinh về 0 để chơi vòng mới?")) {
                onResetScores();
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', whiteSpace: 'nowrap' }}
          >
            <RotateCcw size={14} /> Đặt lại điểm
          </button>
        </div>

        {/* Student Leaderboard List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
          {filtered.map((st, idx) => {
            const originalRank = sortedStudents.findIndex(s => s.id === st.id) + 1;
            let badgeIcon = `${originalRank}`;
            let rowBg = 'rgba(255,255,255,0.03)';
            let borderColor = 'rgba(255,255,255,0.08)';

            if (originalRank === 1 && (st.score || 0) > 0) {
              badgeIcon = '🥇';
              rowBg = 'rgba(250, 204, 21, 0.12)';
              borderColor = '#facc15';
            } else if (originalRank === 2 && (st.score || 0) > 0) {
              badgeIcon = '🥈';
              rowBg = 'rgba(203, 213, 225, 0.12)';
              borderColor = '#94a3b8';
            } else if (originalRank === 3 && (st.score || 0) > 0) {
              badgeIcon = '🥉';
              rowBg = 'rgba(217, 119, 6, 0.12)';
              borderColor = '#d97706';
            }

            return (
              <div
                key={st.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderRadius: '14px',
                  background: rowBg,
                  border: `1px solid ${borderColor}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.2rem', width: '32px', textAlign: 'center', fontWeight: 900, color: '#facc15' }}>
                    {badgeIcon}
                  </span>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#f8fafc' }}>
                      {st.name}
                    </span>
                    {st.correctCount > 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                        (✓ {st.correctCount} câu đúng)
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: (st.score || 0) > 0 ? '#38bdf8' : '#94a3b8',
                    minWidth: '60px',
                    textAlign: 'right'
                  }}>
                    {st.score || 0}đ
                  </span>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => onAdjustScore(st.id, 50)}
                      title="Cộng 50 điểm"
                      style={{ padding: '3px 8px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#6ee7b7', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      +50
                    </button>
                    <button
                      onClick={() => onAdjustScore(st.id, 100)}
                      title="Cộng 100 điểm"
                      style={{ padding: '3px 8px', borderRadius: '8px', background: 'rgba(56,189,248,0.2)', border: '1px solid #38bdf8', color: '#7dd3fc', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      +100
                    </button>
                    <button
                      onClick={() => onAdjustScore(st.id, -50)}
                      title="Trừ 50 điểm"
                      style={{ padding: '3px 8px', borderRadius: '8px', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      -50
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Top-level Modal: Random Student Picker Wheel Animation (Rule 1 Compliance)
 */
function RandomPickerModal({ isOpen, isRolling, candidateName, onConfirm, onClose }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.88)',
      backdropFilter: 'blur(10px)',
      zIndex: 999999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        border: '3px solid #facc15',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '520px',
        padding: '36px 28px',
        boxShadow: '0 0 50px rgba(250, 204, 21, 0.4), 0 25px 60px rgba(0,0,0,0.8)',
        color: '#f8fafc',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ fontSize: '3rem' }}>
          {isRolling ? '🎲' : '🎉'}
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#facc15', margin: 0 }}>
          {isRolling ? 'ĐANG BỐC THĂM HỌC SINH...' : 'HỌC SINH MAY MẮN ĐƯỢC CHỌN!'}
        </h3>

        <div style={{
          padding: '18px 30px',
          borderRadius: '20px',
          background: isRolling ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          border: isRolling ? '2px dashed #facc15' : '3px solid #ffffff',
          color: isRolling ? '#38bdf8' : '#ffffff',
          fontWeight: 900,
          fontSize: '2rem',
          minWidth: '280px',
          boxShadow: isRolling ? 'none' : '0 10px 30px rgba(245, 158, 11, 0.5)',
          transition: 'all 0.3s ease'
        }}>
          {candidateName || 'Đang quay...'}
        </div>

        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0 }}>
          {isRolling ? 'Cả lớp cùng hướng mắt lên màn hình nào!' : `Chúc mừng em ${candidateName} đã được thầy cô chỉ định trả lời!`}
        </p>

        {!isRolling && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              onClick={onConfirm}
              className="btn btn-primary"
              style={{
                borderRadius: '16px',
                padding: '12px 28px',
                fontSize: '1.05rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
              }}
            >
              ✓ Xác Nhận Lượt Chơi Này
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ borderRadius: '16px', padding: '12px 20px' }}
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/**
 * Top-level Modal: Quick Select Student Inside Question Modal (Rule 1 Compliance)
 */
function QuickStudentSelectModal({ isOpen, onClose, students = [], activeStudentId, onSelect }) {
  const [filterText, setFilterText] = useState('');

  if (!isOpen) return null;

  const filtered = students.filter(s => (s.name || '').toLowerCase().includes(filterText.toLowerCase()));

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 999999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1e293b',
        border: '1.5px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '540px',
        maxHeight: '80vh',
        padding: '22px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} /> Chỉ Định Học Sinh Trả Lời
          </h3>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '10px' }}>
            Đóng
          </button>
        </div>

        <input
          type="text"
          placeholder="Tìm tên học sinh..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '8px 14px',
            color: '#fff',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', padding: '4px' }}>
          {filtered.map(st => {
            const isSelected = st.id === activeStudentId;
            return (
              <button
                key={st.id}
                onClick={() => {
                  onSelect(st.id);
                  onClose();
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: isSelected ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255,255,255,0.05)',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  color: isSelected ? '#ffffff' : '#f8fafc',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.5)' : 'none'
                }}
              >
                <span>{st.name}</span>
                <span style={{ fontSize: '0.72rem', color: isSelected ? '#fef08a' : '#94a3b8' }}>
                  {st.score || 0}đ
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Main Educational Game Engine: PictureFlipGame
 */
export function PictureFlipGame({ 
  questions: propQuestions = [], 
  teams: propTeams = [], 
  onAddPoints, 
  game, 
  secretImage, 
  activeTeamIndex = 0, 
  setActiveTeamIndex, 
  onClose,
  currentUser 
}) {
  // Game Play Mode: 'team' (Đội nhóm) OR 'student' (Mỗi học sinh là 1 đội)
  const [playMode, setPlayMode] = useState('student'); // Default to Student mode as requested by user

  // Board State
  const [revealedTiles, setRevealedTiles] = useState([]);
  const [activeTileIndex, setActiveTileIndex] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [customImage, setCustomImage] = useState('');
  const [customQuestions, setCustomQuestions] = useState(null);
  const [customTileCount, setCustomTileCount] = useState(9); // 6, 9, 12, 16

  const safeQuestions = (Array.isArray(customQuestions) && customQuestions.length > 0)
    ? customQuestions
    : ((Array.isArray(propQuestions) && propQuestions.length > 0) ? propQuestions : DEFAULT_FLIP_QUESTIONS);

  // Hidden background image: Custom -> secretImage -> game.secretImage -> fallback
  const bgImageUrl = customImage || secretImage || game?.secretImage || game?.bgImageUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop';

  // Dynamic Tile Grid Layout calculation
  const totalTiles = customTileCount || Math.max(6, safeQuestions?.length || 9);
  const gridConfig = useMemo(() => {
    if (totalTiles <= 6) return { cols: 3, rows: 2 };
    if (totalTiles <= 9) return { cols: 3, rows: 3 };
    if (totalTiles <= 12) return { cols: 4, rows: 3 };
    if (totalTiles <= 16) return { cols: 4, rows: 4 };
    return { cols: 5, rows: Math.ceil(totalTiles / 5) };
  }, [totalTiles]);

  // Current Question & Timer
  const currentQ = activeTileIndex !== null ? (safeQuestions[activeTileIndex % safeQuestions.length] || safeQuestions[0]) : null;
  const [timeLeft, setTimeLeft] = useState(20);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // ==========================================
  // MODE 1: TEAM MODE STATE
  // ==========================================
  const [localTeams, setLocalTeams] = useState(() => {
    if (Array.isArray(propTeams) && propTeams.length > 0) return propTeams;
    return [
      { id: 't1', name: 'Đội 1 (Đỏ)', score: 0, color: '#ef4444' },
      { id: 't2', name: 'Đội 2 (Xanh)', score: 0, color: '#3b82f6' },
      { id: 't3', name: 'Đội 3 (Vàng)', score: 0, color: '#f59e0b' },
      { id: 't4', name: 'Đội 4 (Lục)', score: 0, color: '#10b981' }
    ];
  });
  const [localTeamIdx, setLocalTeamIdx] = useState(0);
  const currentTeamIdx = (setActiveTeamIndex !== undefined && propTeams.length > 0) ? activeTeamIndex : localTeamIdx;
  const setTurnTeam = (newIdx) => {
    if (setActiveTeamIndex && propTeams.length > 0) setActiveTeamIndex(newIdx);
    else setLocalTeamIdx(newIdx);
  };

  const handleAdjustTeamScore = (idx, delta) => {
    if (onAddPoints && propTeams.length > 0) {
      onAddPoints(idx, delta);
    }
    setLocalTeams(prev => prev.map((t, i) => i === idx ? { ...t, score: Math.max(0, (t.score || 0) + delta) } : t));
  };

  const handleSetTeamCount = (count) => {
    const newTeams = Array.from({ length: count }, (_, i) => ({
      id: `t_${i + 1}`,
      name: `Đội ${i + 1}`,
      score: localTeams[i]?.score || 0,
      color: TEAM_COLORS[i % TEAM_COLORS.length]
    }));
    setLocalTeams(newTeams);
    setTurnTeam(0);
  };

  // ==========================================
  // MODE 2: INDIVIDUAL STUDENT MODE STATE
  // ==========================================
  const [selectedRosterName, setSelectedRosterName] = useState('Lớp Chủ Nhiệm');
  const [students, setStudents] = useState([]);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [customRosterRawText, setCustomRosterRawText] = useState('');

  // Modals
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showQuickSelectModal, setShowQuickSelectModal] = useState(false);

  // Random Rolling State
  const [isRollingRandom, setIsRollingRandom] = useState(false);
  const [rollingCandidate, setRollingCandidate] = useState('');
  const [showRandomModal, setShowRandomModal] = useState(false);
  const rollIntervalRef = useRef(null);

  // Load Initial Students from Homeroom or Default Sample
  useEffect(() => {
    let names = [];
    let loadedFromHomeroom = false;

    try {
      const hr = StorageService.getTeacherHomeroom(currentUser?.id);
      if (hr && Array.isArray(hr.students) && hr.students.length > 0) {
        names = hr.students.map(s => {
          if (typeof s === 'string') return s.trim();
          if (typeof s === 'object' && s !== null) return (s.name || s.studentName || '').trim();
          return '';
        }).filter(Boolean);

        if (names.length > 0) {
          loadedFromHomeroom = true;
          setSelectedRosterName(hr.className || 'Lớp Chủ Nhiệm');
        }
      }
    } catch (e) {
      console.warn("Could not load homeroom students for picture flip:", e);
    }

    if (!loadedFromHomeroom || names.length === 0) {
      names = DEFAULT_STUDENT_ROSTERS['Lớp 9A1 (Mẫu 24 HS)'];
      setSelectedRosterName('Lớp 9A1 (Mẫu 24 HS)');
    }

    const studentObjects = names.map((name, i) => ({
      id: `s_${i}_${Date.now()}`,
      name,
      score: 0,
      correctCount: 0,
      color: TEAM_COLORS[i % TEAM_COLORS.length]
    }));

    setStudents(studentObjects);
    setActiveStudentId(studentObjects[0]?.id || null);
    setCustomRosterRawText(names.join('\n'));
  }, [currentUser]);

  const activeStudent = useMemo(() => {
    return students.find(s => s.id === activeStudentId) || students[0] || null;
  }, [students, activeStudentId]);

  // Adjust score for individual student
  const handleAdjustStudentScore = (studentId, delta) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, score: Math.max(0, (s.score || 0) + delta) } : s));
  };

  const handleResetAllStudentScores = () => {
    setStudents(prev => prev.map(s => ({ ...s, score: 0, correctCount: 0 })));
    SoundFX.click();
  };

  // Change Roster Preset
  const handleSelectRoster = (rosterKey) => {
    setSelectedRosterName(rosterKey);
    let names = [];

    if (rosterKey === 'Lớp Chủ Nhiệm') {
      try {
        const hr = StorageService.getTeacherHomeroom(currentUser?.id);
        if (hr && Array.isArray(hr.students) && hr.students.length > 0) {
          names = hr.students.map(s => (typeof s === 'object' && s !== null) ? (s.name || s.studentName || '') : String(s || '')).filter(Boolean);
        }
      } catch (e) {}
      if (names.length === 0) {
        alert('Chưa có danh sách học sinh trong Lớp Chủ Nhiệm. Hệ thống sẽ giữ danh sách mẫu.');
        return;
      }
    } else if (DEFAULT_STUDENT_ROSTERS[rosterKey]) {
      names = DEFAULT_STUDENT_ROSTERS[rosterKey];
    }

    if (names.length > 0) {
      const studentObjects = names.map((name, i) => ({
        id: `s_${i}_${Date.now()}`,
        name,
        score: 0,
        correctCount: 0,
        color: TEAM_COLORS[i % TEAM_COLORS.length]
      }));
      setStudents(studentObjects);
      setActiveStudentId(studentObjects[0]?.id || null);
      setCustomRosterRawText(names.join('\n'));
      SoundFX.correct();
    }
  };

  // Apply Pasted Roster
  const handleApplyPastedRoster = (namesList, rawText) => {
    const studentObjects = namesList.map((name, i) => ({
      id: `s_${i}_${Date.now()}`,
      name,
      score: 0,
      correctCount: 0,
      color: TEAM_COLORS[i % TEAM_COLORS.length]
    }));
    setStudents(studentObjects);
    setActiveStudentId(studentObjects[0]?.id || null);
    setSelectedRosterName(`Danh sách vừa dán (${namesList.length} HS)`);
    setCustomRosterRawText(rawText);
    SoundFX.correct();
    confetti({ particleCount: 50, spread: 50 });
  };

  // Upload Excel/Word File with student names
  const handleRosterFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseStudentRosterFile(file);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const names = parsed.map(s => (typeof s === 'object' && s !== null) ? (s.name || s.studentName || 'Học sinh') : String(s || '')).filter(Boolean);
        const studentObjects = names.map((name, i) => ({
          id: `s_${i}_${Date.now()}`,
          name,
          score: 0,
          correctCount: 0,
          color: TEAM_COLORS[i % TEAM_COLORS.length]
        }));
        setStudents(studentObjects);
        setActiveStudentId(studentObjects[0]?.id || null);
        setSelectedRosterName(`Tệp: ${file.name} (${names.length} HS)`);
        setCustomRosterRawText(names.join('\n'));
        SoundFX.correct();
        alert(`Đã nạp thành công ${names.length} học sinh từ tệp!`);
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi đọc file danh sách học sinh.');
      SoundFX.wrong();
    }
  };

  // Roll Random Student
  const handleTriggerRandomPicker = () => {
    if (students.length === 0) return;
    setShowRandomModal(true);
    setIsRollingRandom(true);
    SoundFX.click();

    let count = 0;
    const maxTicks = 18;
    const intervalTime = 70;

    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);

    rollIntervalRef.current = setInterval(() => {
      count++;
      const randomCandidate = students[Math.floor(Math.random() * students.length)];
      setRollingCandidate(randomCandidate.name);
      try { SoundFX.click(); } catch(e) {}

      if (count >= maxTicks) {
        clearInterval(rollIntervalRef.current);
        // Final pick
        const finalWinner = students[Math.floor(Math.random() * students.length)];
        setRollingCandidate(finalWinner.name);
        setActiveStudentId(finalWinner.id);
        setIsRollingRandom(false);
        try { SoundFX.fanfare(); } catch(e) {}
        confetti({ particleCount: 60, spread: 60 });
      }
    }, intervalTime);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    };
  }, []);

  // Question File Upload Handler
  const handleQuestionFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (parsed && parsed.length > 0) {
        setCustomQuestions(parsed);
        setRevealedTiles([]);
        setActiveTileIndex(null);
        alert(`Đã nhập thành công ${parsed.length} câu hỏi vào Lật Mảnh Ghép!`);
        try { SoundFX.correct(); } catch(e) {}
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi tải tệp câu hỏi');
      try { SoundFX.wrong(); } catch(e) {}
    }
  };

  // Quick Change Secret Image
  const handleQuickImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImage(event.target.result);
      SoundFX.correct();
    };
    reader.readAsDataURL(file);
  };

  // 20s Countdown Timer Effect for Active Tile Question
  useEffect(() => {
    if (activeTileIndex === null || answerState || isTimerPaused) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAnswerState('timeout');
          setSelectedOption('TIMEOUT');
          try { SoundFX.wrong(); } catch(e) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTileIndex, answerState, isTimerPaused]);

  // Click Tile
  const handleTileClick = (idx) => {
    if (revealedTiles.includes(idx) || answerState) return;
    setActiveTileIndex(idx);
    setSelectedOption(null);
    setAnswerState(null);
    setTimeLeft(20);
    setIsTimerPaused(false);
    SoundFX.click();
  };

  // Answer Selected Option
  const handleAnswerOption = (optLabel) => {
    if (answerState || !currentQ) return;
    setSelectedOption(optLabel);

    if (optLabel === currentQ.correct) {
      setAnswerState('correct');
      SoundFX.correct();
      confetti({ particleCount: 80, spread: 70 });
      setRevealedTiles(prev => [...prev, activeTileIndex]);

      if (playMode === 'student') {
        if (activeStudent) {
          setStudents(prev => prev.map(s => s.id === activeStudent.id ? { 
            ...s, 
            score: (s.score || 0) + 100,
            correctCount: (s.correctCount || 0) + 1
          } : s));
        }
      } else {
        handleAdjustTeamScore(currentTeamIdx, 100);
      }
    } else {
      setAnswerState('wrong');
      SoundFX.wrong();
    }
  };

  // Close Question Modal
  const handleCloseQuestion = () => {
    setActiveTileIndex(null);
    setSelectedOption(null);
    setAnswerState(null);

    // Rotate turn if in team mode
    if (playMode === 'team') {
      setTurnTeam((currentTeamIdx + 1) % localTeams.length);
    }
  };

  // Reveal All Tiles
  const handleRevealAll = () => {
    setRevealedTiles(Array.from({ length: totalTiles }, (_, i) => i));
    SoundFX.fanfare();
    confetti({ particleCount: 140, spread: 100 });
  };

  // Reset Tiles
  const handleResetTiles = () => {
    if (window.confirm("Thầy cô có muốn đóng lại tất cả các mảnh ghép để chơi lại từ đầu không?")) {
      setRevealedTiles([]);
      setActiveTileIndex(null);
      SoundFX.click();
    }
  };

  // Filtered student list for tray
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    return students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()));
  }, [students, studentSearch]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 20px',
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
      boxSizing: 'border-box',
      color: '#ffffff'
    }}>
      
      {/* 1. TOP HEADER & MODE SWITCHER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        padding: '12px 20px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        {/* Title & Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onClose && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }}
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
          )}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🖼️ Lật Mảnh Ghép - Đoán Bức Ảnh Bí Mật
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              {playMode === 'student' ? 'Phiên bản Cá Nhân: Mỗi học sinh là 1 đội chơi' : 'Phiên bản Thi Đấu: Chia nhóm lớp học'}
            </p>
          </div>
        </div>

        {/* Central Mode Selector Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '16px',
          padding: '4px',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <button
            onClick={() => { setPlayMode('student'); SoundFX.click(); }}
            style={{
              padding: '6px 16px',
              borderRadius: '12px',
              border: 'none',
              background: playMode === 'student' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: playMode === 'student' ? '#ffffff' : '#94a3b8',
              fontWeight: 900,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: playMode === 'student' ? '0 2px 10px rgba(2, 132, 199, 0.5)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            <User size={15} /> Mỗi Học Sinh 1 Đội ({students.length} HS)
          </button>
          <button
            onClick={() => { setPlayMode('team'); SoundFX.click(); }}
            style={{
              padding: '6px 16px',
              borderRadius: '12px',
              border: 'none',
              background: playMode === 'team' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : 'transparent',
              color: playMode === 'team' ? '#ffffff' : '#94a3b8',
              fontWeight: 900,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: playMode === 'team' ? '0 2px 10px rgba(139, 92, 246, 0.5)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            <Users size={15} /> Thi Đấu Theo Đội ({localTeams.length} Đội)
          </button>
        </div>

        {/* Action Buttons: Question Upload, Secret Image, Reveal All */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <label className="btn btn-secondary btn-sm" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', cursor: 'pointer', borderRadius: '12px' }} title="Tải file câu hỏi .xlsx, .docx, .txt">
            <Upload size={14} /> File Câu Hỏi
            <input type="file" accept=".xlsx,.xls,.docx,.doc,.txt" onChange={handleQuestionFileUpload} style={{ display: 'none' }} />
          </label>

          <label 
            htmlFor="quick-secret-img-input"
            className="btn btn-secondary btn-sm"
            style={{ background: 'rgba(236, 72, 153, 0.15)', border: '1px solid #ec4899', color: '#f472b6', cursor: 'pointer', borderRadius: '12px' }}
            title="Đổi ảnh bí mật đằng sau các mảnh ghép"
          >
            <ImageIcon size={14} /> Đổi Ảnh Bí Mật
            <input id="quick-secret-img-input" type="file" accept="image/*" onChange={handleQuickImageUpload} style={{ display: 'none' }} />
          </label>

          <button 
            className="btn btn-sm"
            onClick={handleRevealAll}
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 900 }}
            title="Mở toàn bộ mảnh ghép để xem bức tranh"
          >
            <Eye size={14} /> Mở Tất Cả
          </button>

          {revealedTiles.length > 0 && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleResetTiles}
              style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}
              title="Đóng lại các mảnh ghép để chơi lại"
            >
              <RotateCcw size={14} /> Chơi Lại
            </button>
          )}
        </div>
      </div>

      {/* 2. DYNAMIC CONTROLS PANEL: INDIVIDUAL STUDENT VS TEAM */}
      {playMode === 'student' ? (
        <div style={{
          width: '100%',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1.5px solid rgba(56, 189, 248, 0.3)',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
        }}>
          {/* Sub-header: Roster Source & Random Picker & Leaderboard */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            
            {/* Roster Selection & Import Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800 }}>
                📋 Danh Sách:
              </span>

              <select
                value={selectedRosterName}
                onChange={(e) => handleSelectRoster(e.target.value)}
                style={{
                  background: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#38bdf8',
                  padding: '6px 12px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Lớp Chủ Nhiệm">🏫 Lớp Chủ Nhiệm</option>
                {Object.keys(DEFAULT_STUDENT_ROSTERS).map(rName => (
                  <option key={rName} value={rName}>{rName}</option>
                ))}
                {selectedRosterName && !DEFAULT_STUDENT_ROSTERS[selectedRosterName] && selectedRosterName !== 'Lớp Chủ Nhiệm' && (
                  <option value={selectedRosterName}>{selectedRosterName}</option>
                )}
              </select>

              <button
                onClick={() => setShowPasteModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: '1.5px solid #38bdf8',
                  borderRadius: '12px',
                  padding: '7px 14px',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 3px 12px rgba(2, 132, 199, 0.45)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
                  transition: 'all 0.15s ease'
                }}
                title="Dán hoặc chỉnh sửa danh sách tên học sinh"
              >
                <FileText size={15} style={{ color: '#ffffff' }} /> Dán Tên HS
              </button>

              <label 
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: '1.5px solid #34d399',
                  borderRadius: '12px',
                  padding: '7px 14px',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 3px 12px rgba(16, 185, 129, 0.45)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
                  transition: 'all 0.15s ease'
                }}
                title="Tải lên tệp Excel chứa danh sách học sinh"
              >
                <Upload size={15} style={{ color: '#ffffff' }} /> Tải Excel
                <input type="file" accept=".xlsx,.xls,.docx,.txt" onChange={handleRosterFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Random Picker & Leaderboard Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleTriggerRandomPicker}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '7px 16px',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                }}
                title="Bốc thăm ngẫu nhiên 1 học sinh trả lời câu hỏi"
              >
                <Shuffle size={16} /> 🎲 Bốc Thăm Ngẫu Nhiên
              </button>

              <button
                onClick={() => setShowLeaderboardModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '7px 16px',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
                }}
                title="Xem bảng xếp hạng điểm của tất cả học sinh"
              >
                <Trophy size={16} color="#facc15" /> 🏆 Bảng Điểm ({students.length} HS)
              </button>
            </div>
          </div>

          {/* Active Student Highlighted Spotlight */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '2px solid #38bdf8',
            borderRadius: '16px',
            padding: '10px 18px',
            flexWrap: 'wrap',
            gap: '10px',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: '#facc15',
                color: '#0f172a',
                padding: '4px 12px',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '0.78rem',
                letterSpacing: '0.04em'
              }}>
                👑 LƯỢT TRẢ LỜI
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                  {activeStudent?.name || 'Chưa chọn học sinh'}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#facc15' }}>
                  {activeStudent?.score || 0}đ
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Bấm vào học sinh bên dưới hoặc Bốc Thăm để đổi lượt
              </span>
              <button
                onClick={() => handleAdjustStudentScore(activeStudent?.id, 50)}
                style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
              >
                +50đ
              </button>
              <button
                onClick={() => handleAdjustStudentScore(activeStudent?.id, -50)}
                style={{ padding: '4px 10px', borderRadius: '10px', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
              >
                -50đ
              </button>
            </div>
          </div>

          {/* Student Roster Interactive Tray (Click to select any student) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                👉 Bấm trực tiếp vào tên học sinh để chỉ định:
              </span>
              {students.length > 12 && (
                <input
                  type="text"
                  placeholder="Lọc tên..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '3px 8px',
                    color: '#fff',
                    fontSize: '0.75rem',
                    outline: 'none',
                    width: '120px'
                  }}
                />
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              padding: '6px 2px',
              scrollbarWidth: 'thin'
            }}>
              {filteredStudents.map((st) => {
                const isSelected = st.id === activeStudent?.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setActiveStudentId(st.id);
                      SoundFX.click();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '14px',
                      background: isSelected 
                        ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: isSelected ? '#ffffff' : '#e2e8f0',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxShadow: isSelected ? '0 0 14px rgba(56, 189, 248, 0.5)' : 'none',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{st.name}</span>
                    <span style={{
                      background: isSelected ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.1)',
                      color: isSelected ? '#fef08a' : '#cbd5e1',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 900
                    }}>
                      {st.score || 0}đ
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Team Mode Controls Panel */
        <div style={{
          width: '100%',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1.5px solid rgba(139, 92, 246, 0.3)',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 800 }}>
                👥 Số lượng đội chơi:
              </span>
              {[2, 3, 4, 5, 6, 8].map(count => (
                <button
                  key={count}
                  onClick={() => handleSetTeamCount(count)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '10px',
                    border: localTeams.length === count ? '1.5px solid #8b5cf6' : '1px solid rgba(255,255,255,0.15)',
                    background: localTeams.length === count ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                    color: localTeams.length === count ? '#c4b5fd' : '#cbd5e1',
                    fontWeight: 900,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  {count} Đội
                </button>
              ))}
            </div>

            <span style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 700 }}>
              Bấm vào đội để chọn lượt chơi hoặc sửa điểm
            </span>
          </div>

          {/* Teams Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {localTeams.map((team, idx) => {
              const isActive = currentTeamIdx === idx;
              return (
                <div
                  key={team.id || idx}
                  onClick={() => setTurnTeam(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    background: isActive 
                      ? `linear-gradient(135deg, ${team.color}40 0%, rgba(15, 23, 42, 0.95) 100%)`
                      : 'rgba(15, 23, 42, 0.8)',
                    border: isActive ? `2.5px solid ${team.color}` : `1.5px solid ${team.color}60`,
                    boxShadow: isActive ? `0 0 20px ${team.color}80` : 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontWeight: 900, fontSize: '0.92rem', color: team.color }}>
                    {team.name}
                  </span>
                  <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#facc15', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '8px' }}>
                    {team.score || 0}đ
                  </span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAdjustTeamScore(idx, 50); }}
                      style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#6ee7b7', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      +50
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAdjustTeamScore(idx, -50); }}
                      style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fca5a5', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      -50
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. PUZZLE TILES GRID ARENA */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* Tiles Config Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
          <span>Số mảnh ghép:</span>
          {[6, 9, 12, 16].map(num => (
            <button
              key={num}
              onClick={() => { setCustomTileCount(num); setRevealedTiles([]); }}
              style={{
                padding: '3px 10px',
                borderRadius: '8px',
                border: totalTiles === num ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
                background: totalTiles === num ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                color: totalTiles === num ? '#38bdf8' : '#cbd5e1',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {num} Ô
            </button>
          ))}
          <span style={{ marginLeft: '10px', color: '#10b981', fontWeight: 800 }}>
            (Đã mở: {revealedTiles.length}/{totalTiles} ô)
          </span>
        </div>

        {/* Puzzle Board Container */}
        <div style={{
          position: 'relative',
          width: 'min(620px, 92vw)',
          height: 'min(420px, 50vh)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          border: '4px solid rgba(255,255,255,0.25)',
          backgroundImage: `url(${bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'grid',
          gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`
        }}>
          {Array.from({ length: totalTiles }, (_, idx) => {
            const isRevealed = revealedTiles.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => handleTileClick(idx)}
                style={{
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: isRevealed 
                    ? 'transparent' 
                    : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  opacity: isRevealed ? 0 : 1,
                  transform: isRevealed ? 'scale(0.85)' : 'scale(1)',
                  pointerEvents: isRevealed ? 'none' : 'auto',
                  transition: 'opacity 0.6s ease, transform 0.4s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isRevealed ? 'default' : 'pointer',
                  fontWeight: 900,
                  fontSize: totalTiles > 12 ? '1.25rem' : '1.5rem',
                  color: '#8b5cf6',
                  userSelect: 'none',
                  boxShadow: isRevealed ? 'none' : 'inset 0 0 20px rgba(0,0,0,0.4)'
                }}
              >
                {!isRevealed && (
                  <>
                    <span style={{ color: '#38bdf8' }}>🧩</span>
                    <span>#{idx + 1}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. QUESTION MODAL POPUP (PORTALED TO DOCUMENT.BODY) */}
      {activeTileIndex !== null && currentQ && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #0b1120 0%, #0f172a 100%)',
          border: '8px solid #38bdf8',
          zIndex: 9999999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '32px 48px',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span className="badge badge-teacher" style={{ fontSize: '1.1rem', padding: '8px 20px', borderRadius: '14px', fontWeight: 900 }}>
                🧩 MẢNH GHÉP SỐ #{activeTileIndex + 1}
              </span>

              {/* Answering Participant Indicator */}
              {playMode === 'student' ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(2, 132, 199, 0.25)',
                  border: '1.5px solid #38bdf8',
                  borderRadius: '16px',
                  padding: '6px 16px'
                }}>
                  <span style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 800 }}>
                    🎓 Học sinh trả lời: <strong style={{ color: '#fef08a', fontSize: '1.1rem' }}>{activeStudent?.name || 'Chưa chọn'}</strong>
                  </span>
                  <button
                    onClick={handleTriggerRandomPicker}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Bốc thăm ngẫu nhiên học sinh khác"
                  >
                    <Shuffle size={13} /> Bốc thăm em khác
                  </button>
                  <button
                    onClick={() => setShowQuickSelectModal(true)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: '10px',
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                    title="Chọn học sinh khác trong danh sách"
                  >
                    👥 Đổi học sinh
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(139, 92, 246, 0.25)',
                  border: '1.5px solid #8b5cf6',
                  borderRadius: '16px',
                  padding: '6px 16px'
                }}>
                  <span style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 800 }}>
                    👑 Lượt chơi: <strong style={{ color: '#c4b5fd', fontSize: '1.1rem' }}>{localTeams[currentTeamIdx]?.name}</strong>
                  </span>
                  <button
                    onClick={() => setTurnTeam((currentTeamIdx + 1) % localTeams.length)}
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '8px', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Đổi Đội
                  </button>
                </div>
              )}
            </div>

            {/* 20 Seconds Countdown Timer Display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: timeLeft <= 5 ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                padding: '8px 20px',
                borderRadius: '24px',
                fontWeight: 900,
                fontSize: '1.2rem',
                border: '1.5px solid rgba(255,255,255,0.4)',
                boxShadow: timeLeft <= 5 ? '0 0 20px rgba(239, 68, 68, 0.8)' : '0 4px 16px rgba(2, 132, 199, 0.4)',
                transition: 'all 0.3s ease'
              }}>
                ⏱️ Thời gian: <span style={{ fontSize: '1.45rem', color: '#fef08a' }}>{timeLeft}s</span>
              </div>

              <button
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff',
                  borderRadius: '16px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 800,
                  fontSize: '0.8rem'
                }}
                title={isTimerPaused ? 'Tiếp tục đếm ngược' : 'Tạm dừng thời gian'}
              >
                {isTimerPaused ? <Play size={15} /> : <Pause size={15} />}
                {isTimerPaused ? 'Tiếp tục' : 'Tạm dừng'}
              </button>
            </div>
          </div>

          {/* Question Image if present */}
          {currentQ.image && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img 
                src={currentQ.image} 
                alt="Câu hỏi" 
                style={{ maxHeight: '240px', maxWidth: '100%', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.2)', objectFit: 'contain' }} 
              />
            </div>
          )}

          {/* Question Text */}
          <h3 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff', marginBottom: '24px', lineHeight: 1.45, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {currentQ.question}
          </h3>

          {/* Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {['A', 'B', 'C', 'D'].map((optLabel, idx) => {
              const qOpts = Array.isArray(currentQ?.options) ? currentQ.options : ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'];
              if (!isOptionValidForQuestion(qOpts, idx)) return null;
              const optText = qOpts[idx] || '';
              const isSelected = selectedOption === optLabel;
              const isCorrect = currentQ.correct === optLabel;

              let bg = '#ffffff';
              let border = '2.5px solid #cbd5e1';
              let textColor = '#0f172a';
              let badgeBg = '#2563eb';

              if (answerState) {
                if (isCorrect) {
                  bg = '#dcfce7';
                  border = '2.5px solid #16a34a';
                  textColor = '#14532d';
                  badgeBg = '#16a34a';
                } else if (isSelected && !isCorrect) {
                  bg = '#fee2e2';
                  border = '2.5px solid #dc2626';
                  textColor = '#7f1d1d';
                  badgeBg = '#dc2626';
                }
              }

              return (
                <button
                  key={optLabel}
                  onClick={() => handleAnswerOption(optLabel)}
                  disabled={!!answerState}
                  style={{
                    padding: '18px 22px',
                    borderRadius: '20px',
                    background: bg,
                    border: border,
                    color: textColor,
                    textAlign: 'left',
                    fontWeight: 900,
                    fontSize: '1.25rem',
                    lineHeight: 1.4,
                    cursor: answerState ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    width: '38px',
                    height: '38px',
                    minWidth: '38px',
                    borderRadius: '12px',
                    background: badgeBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    color: '#ffffff',
                    flexShrink: 0
                  }}>
                    {optLabel}
                  </span>
                  <span style={{ flex: 1, color: textColor, fontWeight: 900 }}>{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Actions Bar */}
          {answerState && (
            <div style={{
              padding: '18px 24px',
              borderRadius: '20px',
              background: answerState === 'correct' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              border: answerState === 'correct' ? '2px solid #10b981' : '2px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', color: answerState === 'correct' ? '#6ee7b7' : '#fca5a5' }}>
                {answerState === 'correct' ? (
                  playMode === 'student' 
                    ? `🎉 CHÍNH XÁC! ${activeStudent?.name} ĐƯỢC +100 ĐIỂM! MẢNH GHÉP #${activeTileIndex + 1} ĐÃ ĐƯỢC LẬT MỞ!`
                    : `🎉 ĐÚNG RỒI! ĐỘI ${localTeams[currentTeamIdx]?.name} ĐƯỢC +100 ĐIỂM! MẢNH GHÉP #${activeTileIndex + 1} ĐÃ ĐƯỢC LẬT MỞ!`
                ) : answerState === 'timeout' ? (
                  `⏱️ HẾT GIỜ! Học sinh chưa đưa ra câu trả lời!`
                ) : (
                  `❌ TIẾC QUÁ! CÂU TRẢ LỜI CHƯA ĐÚNG! Thầy cô có thể gọi học sinh khác cứu trợ.`
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {answerState !== 'correct' && playMode === 'student' && (
                  <button
                    onClick={() => {
                      setAnswerState(null);
                      setSelectedOption(null);
                      setTimeLeft(20);
                      handleTriggerRandomPicker();
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '10px 18px', fontSize: '0.95rem', fontWeight: 800, borderRadius: '12px', background: 'rgba(245, 158, 11, 0.25)', border: '1px solid #f59e0b', color: '#fef08a' }}
                  >
                    🎲 Gọi Em Khác Cứu Trợ
                  </button>
                )}

                <button 
                  className="btn btn-primary" 
                  onClick={handleCloseQuestion} 
                  style={{ padding: '12px 28px', fontSize: '1.05rem', fontWeight: 900, borderRadius: '14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none' }}
                >
                  Tiếp Tục ➔
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* 5. TOP-LEVEL HELPER MODALS */}
      <PasteStudentsModal
        isOpen={showPasteModal}
        onClose={() => setShowPasteModal(false)}
        onApply={handleApplyPastedRoster}
        currentText={customRosterRawText}
      />

      <StudentLeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        students={students}
        onAdjustScore={handleAdjustStudentScore}
        onResetScores={handleResetAllStudentScores}
      />

      <QuickStudentSelectModal
        isOpen={showQuickSelectModal}
        onClose={() => setShowQuickSelectModal(false)}
        students={students}
        activeStudentId={activeStudent?.id}
        onSelect={(newId) => setActiveStudentId(newId)}
      />

      <RandomPickerModal
        isOpen={showRandomModal}
        isRolling={isRollingRandom}
        candidateName={rollingCandidate}
        onConfirm={() => setShowRandomModal(false)}
        onClose={() => setShowRandomModal(false)}
      />

    </div>
  );
}
