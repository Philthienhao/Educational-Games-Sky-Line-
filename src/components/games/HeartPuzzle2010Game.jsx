// HeartPuzzle2010Game.jsx - Trò chơi Giải Mã Bức Tranh Trái Tim 20/10 Chuẩn Mẫu Ma Trận Trái Tim
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Heart, Trophy, Sparkles, Volume2, VolumeX, RotateCcw, Settings, 
  Upload, Download, Users, Monitor, Touchpad, CheckCircle2, XCircle, 
  ChevronRight, ChevronLeft, ArrowLeft, Maximize, Play, Award, Clock, Palette, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { parseUploadedFile, getXLSX } from '../../utils/universalParser';

// Bộ câu hỏi mẫu chuẩn về ngày Phụ nữ Việt Nam 20/10 (15 câu)
export const DEFAULT_2010_QUESTIONS = [
  {
    id: 'q1',
    question: 'Ngày Phụ nữ Việt Nam được kỷ niệm vào ngày tháng nào hàng năm?',
    options: ['8 tháng 3', '20 tháng 10', '20 tháng 11', '1 tháng 6'],
    correct: 'B',
    explanation: 'Ngày 20/10/1930, Hội Phụ nữ phản đế Việt Nam (nay là Hội LHPN Việt Nam) chính thức được thành lập.'
  },
  {
    id: 'q2',
    question: 'Bác Hồ đã trao tặng phụ nữ Việt Nam 8 chữ vàng truyền thống nào?',
    options: [
      'Cần cù, sáng tạo, thông minh, nhân ái',
      'Anh hùng, bất khuất, trung hậu, đảm đang',
      'Tự tin, tự trọng, trung hậu, đảm đang',
      'Đoàn kết, kiên cường, nhân ái, thủy chung'
    ],
    correct: 'B',
    explanation: 'Tám chữ vàng Bác Hồ khen ngợi phụ nữ Việt Nam: "Anh hùng, bất khuất, trung hậu, đảm đang".'
  },
  {
    id: 'q3',
    question: 'Hội Phụ nữ phản đế Việt Nam được thành lập vào ngày 20/10 của năm nào?',
    options: ['Năm 1930', 'Năm 1945', 'Năm 1954', 'Năm 1975'],
    correct: 'A',
    explanation: 'Ngày 20/10/1930 gắn liền với sự ra đời của Hội Phụ nữ phản đế Việt Nam.'
  },
  {
    id: 'q4',
    question: 'Nữ tướng kiên cường đầu tiên của QĐND Việt Nam, gắn liền với "Đội quân tóc dài" Bến Tre là ai?',
    options: ['Võ Thị Sáu', 'Nguyễn Thị Định', 'Nguyễn Thị Minh Khai', 'Lê Thị Hồng Gấm'],
    correct: 'B',
    explanation: 'Thiếu tướng Nguyễn Thị Định - Phó Tư lệnh Quân Giải phóng miền Nam Việt Nam.'
  },
  {
    id: 'q5',
    question: 'Nữ anh hùng liệt sĩ trẻ tuổi người Đất Đỏ kiên cường, gắn liền với loài hoa Lê-ki-ma là ai?',
    options: ['Chị Võ Thị Sáu', 'Chị Mười Hai', 'Chị Út Tịch', 'Bác sĩ Đặng Thùy Trâm'],
    correct: 'A',
    explanation: 'Chị Võ Thị Sáu (1933 - 1952) là nữ anh hùng bất khuất vùng Đất Đỏ, Bà Rịa - Vũng Tàu.'
  },
  {
    id: 'q6',
    question: 'Nữ bác sĩ liệt sĩ để lại cuốn nhật ký bất hủ với câu nói: "Hãy giữ vững ngọn lửa trong tim" là ai?',
    options: ['Trần Thị Lý', 'Đặng Thùy Trâm', 'Nguyễn Thị Chiên', 'Bùi Thị Cúc'],
    correct: 'B',
    explanation: 'Bác sĩ Đặng Thùy Trâm để lại cuốn Nhật ký Đặng Thùy Trâm làm rung động hàng triệu trái tim thế giới.'
  },
  {
    id: 'q7',
    question: 'Hai vị nữ anh hùng đầu tiên trong lịch sử dân tộc phất cờ khởi nghĩa đánh đuổi quân xâm lược là ai?',
    options: ['Bà Triệu và Triệu Thị Trinh', 'Hai Bà Trưng (Trưng Trắc, Trưng Nhị)', 'Ngọc Hân Công Chúa', 'Bà Huyện Thanh Quan'],
    correct: 'B',
    explanation: 'Hai Bà Trưng khởi nghĩa năm 40 sau Công nguyên, mở đầu truyền thống đấu tranh quật cường của phụ nữ Việt.'
  },
  {
    id: 'q8',
    question: 'Hoàn thành câu ca dao: "Công cha như núi Thái Sơn, Nghĩa mẹ như nước trong ... chảy ra"?',
    options: ['biển lớn', 'nguồn', 'sông rộng', 'khe suối'],
    correct: 'B',
    explanation: '"Công cha như núi Thái Sơn / Nghĩa mẹ như nước trong nguồn chảy ra."'
  },
  {
    id: 'q9',
    question: 'Phong trào thi đua cách mạng nổi tiếng của phụ nữ miền Bắc trong kháng chiến chống Mỹ là gì?',
    options: ['Ba đảm đang', 'Năm xung phong', 'Ba sẵn sàng', 'Hũ gạo kháng chiến'],
    correct: 'A',
    explanation: 'Phong trào "Ba đảm đang" phát động năm 1965 đã huy động hàng triệu phụ nữ vừa sản xuất vừa chiến đấu.'
  },
  {
    id: 'q10',
    question: 'Nhà thơ Chế Lan Viên đã viết câu thơ bất hủ nào về tình mẫu tử thiêng liêng?',
    options: [
      'Con dù lớn vẫn là con của mẹ, Đi hết đời lòng mẹ vẫn theo con',
      'Mẹ ru cái lẽ ở đời, Sữa nuôi phần xác hát nuôi phần hồn',
      'Thời gian chạy qua tóc mẹ, Một màu trắng đến nôn nao',
      'Bàn tay mẹ dịu dàng nâng bước con đi'
    ],
    correct: 'A',
    explanation: 'Trích trong bài thơ "Con cò" nổi tiếng của thi sĩ Chế Lan Viên.'
  },
  {
    id: 'q11',
    question: 'Nữ lãnh đạo kiên trung, Bí thư đầu tiên của Thành ủy Sài Gòn - Chợ Lớn là ai?',
    options: ['Nguyễn Thị Minh Khai', 'Hà Thị Quế', 'Trương Mỹ Hoa', 'Nguyễn Thị Bình'],
    correct: 'A',
    explanation: 'Đồng chí Nguyễn Thị Minh Khai (1910 - 1941) là tấm gương nữ chiến sĩ cách mạng kiên trung.'
  },
  {
    id: 'q12',
    question: 'Câu nói nổi tiếng: "Còn cái lai quần cũng đánh" là của nữ anh hùng miền Nam nào?',
    options: ['Chị Út Tịch', 'Chị Võ Thị Sáu', 'Mẹ Suốt', 'Chị Trần Thị Lý'],
    correct: 'A',
    explanation: 'Anh hùng LLVTND Nguyễn Thị Út (chị Út Tịch) - nguyên mẫu trong tác phẩm "Mẹ vắng nhà".'
  },
  {
    id: 'q13',
    question: 'Người mẹ Quảng Bình kiên cường chèo đò chở bộ đội qua dòng sông Nhật Lệ dưới bom đạn là ai?',
    options: ['Mẹ Suốt (Nguyễn Thị Suốt)', 'Mẹ Thứ (Nguyễn Thị Thứ)', 'Mẹ VNAH Phạm Thị Ngư', 'Mẹ Nhu'],
    correct: 'A',
    explanation: 'Mẹ Suốt (1906 - 1968) anh hùng chèo đò trên sông Nhật Lệ trong kháng chiến chống Mỹ.'
  },
  {
    id: 'q14',
    question: 'Bà mẹ Việt Nam Anh hùng có nhiều người con và cháu hy sinh nhất vì Tổ quốc là ai?',
    options: ['Mẹ Nguyễn Thị Thứ', 'Mẹ Suốt', 'Mẹ Trần Thị Mít', 'Mẹ Nguyễn Thị Rành'],
    correct: 'A',
    explanation: 'Mẹ Nguyễn Thị Thứ (Điện Bàn, Quảng Nam) có 9 con trai, 1 con rể và 2 cháu ngoại hy sinh vì độc lập dân tộc.'
  },
  {
    id: 'q15',
    question: 'Loài hoa nào thường được tôn vinh là biểu tượng của tình mẫu tử và sự dịu dàng của người phụ nữ?',
    options: ['Hoa hồng & Hoa cẩm chướng', 'Hoa xương rồng', 'Hoa dạ quỳnh', 'Hoa hướng dương trắng'],
    correct: 'A',
    explanation: 'Hoa cẩm chướng và hoa hồng nhung là biểu tượng thiêng liêng thể hiện tình yêu, lòng biết ơn đối với người Mẹ.'
  }
];

// Helper: Lấy ký tự chữ cái đáp án đúng (A, B, C, D) an toàn tuyệt đối
export function getCorrectLetter(q) {
  if (!q) return 'A';
  if (q.correct !== undefined && q.correct !== null) {
    const s = String(q.correct).trim().toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(s)) return s;
    const num = parseInt(s, 10);
    if (!isNaN(num) && num >= 0 && num <= 3) {
      return String.fromCharCode(65 + num);
    }
  }
  if (q.correctAnswer !== undefined && q.correctAnswer !== null) {
    const s = String(q.correctAnswer).trim().toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(s)) return s;
    const num = parseInt(s, 10);
    if (!isNaN(num) && num >= 0 && num <= 3) {
      return String.fromCharCode(65 + num);
    }
  }
  return 'A';
}

/**
 * MA TRẬN 7 HÀNG X 9 CỘT TẠO THÀNH HÌNH TRÁI TIM HOÀN MỸ ĐỐI XỨNG
 * 1 = Ô thuộc hình trái tim (ĐÚNG 40 Ô)
 * 0 = Ô ngoài lề / nền (23 Ô)
 * Tổng cộng 63 ô (9 cột x 7 hàng)
 * Với 10 câu hỏi -> Mỗi câu hỏi sở hữu ĐÚNG 4 ô đáp án trên trái tim!
 * Khi trả lời hết 10 câu -> Toàn bộ 40 ô tô đỏ rực rỡ ghép thành TRÁI TIM HOÀN CHỈNH!
 */
export const HEART_7X9_MASK = [
  [0, 1, 1, 1, 0, 1, 1, 1, 0], // Hàng 0: 6 ô (cols 1,2,3 và 5,6,7) - 2 múi trên của trái tim
  [1, 1, 1, 1, 1, 1, 1, 1, 1], // Hàng 1: 9 ô (toàn bộ 9 cột) - phần rộng nhất phía trên
  [1, 1, 1, 1, 1, 1, 1, 1, 1], // Hàng 2: 9 ô (toàn bộ 9 cột) - thân trái tim đầy đặn
  [0, 1, 1, 1, 1, 1, 1, 1, 0], // Hàng 3: 7 ô (cols 1..7) - thu hẹp về phía dưới
  [0, 0, 1, 1, 1, 1, 1, 0, 0], // Hàng 4: 5 ô (cols 2..6) - cạnh xiên trái tim
  [0, 0, 0, 1, 1, 1, 0, 0, 0], // Hàng 5: 3 ô (cols 3..5) - cuống nhọn trái tim
  [0, 0, 0, 0, 1, 0, 0, 0, 0], // Hàng 6: 1 ô (col 4) - đáy nhọn trái tim
];

/**
 * Hàm khởi tạo ma trận 7x9 ô thẻ cho từng đội
 * @param {string} patternKey - 'matrix' | 'layers'
 * @param {Array} questions - danh sách câu hỏi
 * @param {number} teamIdx - chỉ số đội để tạo độ xáo trộn khác biệt chống nhìn bài
 */
export function buildHeartMatrix(patternKey, questions, teamIdx = 0) {
  const N = Math.max(1, questions.length);
  const rows = 7;
  const cols = 9;

  // Thu thập 40 tọa độ thuộc hình trái tim và 23 tọa độ ngoài nền
  const heartCoords = [];
  const backgroundCoords = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (HEART_7X9_MASK[r][c] === 1) {
        heartCoords.push({ r, c });
      } else {
        backgroundCoords.push({ r, c });
      }
    }
  }

  // Sắp xếp 40 tọa độ trái tim theo trật tự DÂNG TRÀO KẾT NỐI LIỀN MẠCH:
  // Luôn bắt đầu từ chóp nhọn đáy tim (hàng 6) đi dần lên 2 múi tim (hàng 0)
  // và ở mỗi hàng tỏa đối xứng từ tim (cột 4) ra 2 bên, đảm bảo các ô đỏ luôn kết nối thành 1 khối thống nhất
  const sortedHeartCoords = [...heartCoords].sort((a, b) => {
    if (b.r !== a.r) return b.r - a.r; // Từ hàng 6 (đáy nhọn) lên hàng 0 (2 múi trên)
    const distA = Math.abs(a.c - 4);
    const distB = Math.abs(b.c - 4);
    if (distA !== distB) return distA - distB; // Từ cột giữa (cột 4) đối xứng ra 2 bên
    return a.c - b.c;
  });

  // Phân bổ 40 ô trái tim cho N câu hỏi
  // Mỗi câu hỏi có khoảng (40 / N) ô đáp án đúng
  const heartAssignment = new Map();
  const cellsPerQ = 40 / N;

  for (let i = 0; i < sortedHeartCoords.length; i++) {
    const coord = sortedHeartCoords[i];
    const qIdx = Math.min(N - 1, Math.floor(i / cellsPerQ));
    const q = questions[qIdx] || questions[0];
    const correctLetter = getCorrectLetter(q);
    const code = `${qIdx + 1}-${correctLetter}`;

    heartAssignment.set(`${coord.r}_${coord.c}`, {
      r: coord.r,
      c: coord.c,
      isTarget: true,
      questionIdx: qIdx,
      qNum: qIdx + 1,
      correctOpt: correctLetter,
      code,
      id: `heart_${coord.r}_${coord.c}`
    });
  }

  // Phân bổ 23 ô ngoài lề (decoy / ô nhiễu):
  // Chứa mã đáp án SAI để học sinh phải suy nghĩ, không chạm bừa
  const decoyAssignment = new Map();
  const optionLetters = ['A', 'B', 'C', 'D'];
  const teamSeed = (teamIdx + 1) * 19;

  for (let i = 0; i < backgroundCoords.length; i++) {
    const coord = backgroundCoords[i];
    const decoyQIdx = (i * 3 + coord.r * 5 + coord.c * 7 + teamSeed) % N;
    const q = questions[decoyQIdx] || questions[0];
    const correctLetter = getCorrectLetter(q);
    const wrongOptions = optionLetters.filter(opt => opt !== correctLetter);
    const chosenWrong = wrongOptions[(i + coord.r + coord.c + teamSeed) % wrongOptions.length] || 'C';
    const code = `${decoyQIdx + 1}-${chosenWrong}`;

    decoyAssignment.set(`${coord.r}_${coord.c}`, {
      r: coord.r,
      c: coord.c,
      isTarget: false,
      isDecoy: true,
      questionIdx: decoyQIdx,
      qNum: decoyQIdx + 1,
      code,
      id: `decoy_${coord.r}_${coord.c}`
    });
  }

  // Tạo lưới 7x9
  const grid = [];
  const cellMap = {};

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const key = `${r}_${c}`;
      let cell = heartAssignment.get(key) || decoyAssignment.get(key);
      row.push(cell);
      cellMap[key] = cell;
    }
    grid.push(row);
  }

  return { grid, cellMap, totalHeartCells: heartCoords.length, rows, cols };
}

/**
 * COMPONENT: KHUNG MA TRẬN Ô THẺ TRÁI TIM (Chuẩn Giao Diện Mẫu)
 */
const HeartCardMatrixView = React.memo(({
  teamName = 'Đội 1 (Đỏ)',
  teamColor = '#dc2626',
  boardData,
  correctQuestionIndices = [],
  totalQuestions = 10,
  isCompleted = false,
  onCellClick,
  wrongClickedCellId = null
}) => {
  const answeredSet = useMemo(() => new Set(correctQuestionIndices), [correctQuestionIndices]);
  const correctCount = correctQuestionIndices.length;
  const percent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxSizing: 'border-box'
    }}>
      {/* Tiêu đề & Thông tin Đội */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2px 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: teamColor,
            color: '#ffffff',
            fontWeight: 900,
            fontSize: 'clamp(0.85rem, 1.15vw, 0.96rem)',
            padding: '4px 14px',
            borderRadius: '20px',
            boxShadow: `0 2px 8px ${teamColor}40`
          }}>
            {teamName}
          </span>
          <span style={{
            color: '#64748b',
            fontWeight: 700,
            fontSize: 'clamp(0.78rem, 1vw, 0.88rem)'
          }}>
            Chạm ô đúng để tô đỏ trái tim
          </span>
        </div>

        <div style={{
          border: `1.5px solid ${teamColor}`,
          color: teamColor,
          background: isCompleted ? '#ecfdf5' : '#ffffff',
          fontWeight: 900,
          fontSize: 'clamp(0.8rem, 1.05vw, 0.9rem)',
          padding: '3px 12px',
          borderRadius: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {correctCount}/{totalQuestions} câu ({percent}%)
        </div>
      </div>

      {/* KHUNG THẺ TRẮNG BO GÓC CHỨA LƯỚI MA TRẬN 7x9 */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #cbd5e1',
        borderRadius: '14px',
        padding: '10px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative'
      }}>
        {/* Banner Chúc Mừng Khi Trái Tim Lớn Xuất Hiện Trọn Vẹn */}
        {isCompleted && (
          <div style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
            border: '1.5px solid #f43f5e',
            borderRadius: '8px',
            padding: '5px 12px',
            textAlign: 'center',
            color: '#be123c',
            fontWeight: 900,
            fontSize: 'clamp(0.82rem, 1.1vw, 0.95rem)',
            boxShadow: '0 2px 10px rgba(225, 29, 72, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span>💖</span>
            <span>BỨC TRANH TRÁI TIM LỚN 20/10 ĐÃ XUẤT HIỆN TRỌN VẸN!</span>
            <span>💖</span>
          </div>
        )}

        {/* Lưới 9 Cột x 7 Hàng Ô Thẻ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gridTemplateRows: 'repeat(7, 1fr)',
          gap: '5px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {boardData?.grid?.map((row, rIdx) => 
            row.map((cell, cIdx) => {
              const isCellRed = cell.isTarget && answeredSet.has(cell.questionIdx);
              const isCellWrong = wrongClickedCellId === cell.id;

              let bg = '#ffffff';
              let borderColor = '#e2e8f0';
              let textColor = '#64748b';
              let shadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
              let transform = 'scale(1)';
              let opacity = 1;

              if (isCompleted) {
                if (cell.isTarget) {
                  // TOÀN BỘ CÁC Ô TRÁI TIM BỪNG SÁNG KẾT THÀNH TRÁI TIM LỚN RỰC RỠ
                  bg = 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)';
                  borderColor = '#fca5a5';
                  textColor = '#ffffff';
                  shadow = '0 0 14px rgba(220, 38, 38, 0.7), inset 0 0 8px rgba(255, 255, 255, 0.4)';
                  transform = 'scale(1.03)';
                } else {
                  // CÁC Ô NGOÀI NỀN MỜ ĐI ĐỂ TÔN LÊN TRÁI TIM LỚN
                  bg = 'rgba(248, 250, 252, 0.4)';
                  borderColor = 'transparent';
                  textColor = '#cbd5e1';
                  opacity = 0.16;
                  shadow = 'none';
                }
              } else if (isCellRed) {
                // Ô trái tim đã được giải mã chính xác
                bg = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                borderColor = '#b91c1c';
                textColor = '#ffffff';
                shadow = '0 4px 12px rgba(220, 38, 38, 0.45)';
                transform = 'scale(1.02)';
              } else if (isCellWrong) {
                // Ô vừa bấm sai
                bg = '#fee2e2';
                borderColor = '#ef4444';
                textColor = '#b91c1c';
                transform = 'scale(0.96)';
              } else if (cell.isTarget) {
                // Ô thuộc hình trái tim đang chờ thắp đỏ: nền phớt hồng tinh tế
                bg = '#fff5f7';
                borderColor = '#fecdd3';
                textColor = '#334155';
                shadow = '0 1px 4px rgba(225, 29, 72, 0.05)';
              } else {
                // Ô ngoài lề (decoy)
                bg = '#f8fafc';
                borderColor = '#e2e8f0';
                textColor = '#64748b';
              }

              return (
                <button
                  key={`${rIdx}_${cIdx}`}
                  onClick={() => onCellClick && onCellClick(cell)}
                  title={`Ô [${cell.code}]`}
                  style={{
                    height: 'clamp(32px, 4.4vh, 44px)',
                    background: bg,
                    border: `1.5px solid ${borderColor}`,
                    borderRadius: '8px',
                    color: textColor,
                    fontWeight: 900,
                    fontSize: 'clamp(0.78rem, 1.25vw, 0.98rem)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    cursor: isCompleted ? 'default' : 'pointer',
                    userSelect: 'none',
                    outline: 'none',
                    boxShadow: shadow,
                    transform,
                    opacity,
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    padding: '0 2px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{cell.code}</span>
                  {isCellRed && <span style={{ fontSize: '0.74rem' }}>❤️</span>}
                </button>
              );
            })
          )}
        </div>

        {/* Khung Chữ Thơ Ca Dao & Chủ Đề 20/10 ở góc dưới thẻ trắng */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '6px',
          borderTop: '1px dashed #e2e8f0',
          fontSize: 'clamp(0.72rem, 0.95vw, 0.82rem)'
        }}>
          <span style={{
            fontFamily: 'serif',
            fontStyle: 'italic',
            color: '#be123c',
            fontWeight: 700
          }}>
            “ Nghĩa mẹ như nước trong nguồn chảy ra ”
          </span>
          <span style={{
            color: '#e11d48',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            💖 20/10
          </span>
        </div>
      </div>
    </div>
  );
});

/**
/**
 * COMPONENT: KHUNG CÂU HỎI & 4 ĐÁP ÁN HIỂN THỊ
 * Học sinh đọc câu hỏi & các phương án A, B, C, D ở đây,
 * sau đó chạm vào ô chứa đáp án đúng trên ma trận trái tim bên trên!
 */
const InteractiveQuestionPanel = React.memo(({
  question,
  questionNumber = 1,
  totalQuestions = 10,
  onPrevQuestion,
  onNextQuestion,
  teamColor = '#dc2626',
  isAnswered = false
}) => {
  const optionLabels = ['A', 'B', 'C', 'D'];
  if (!question) return null;
  const correctLetter = getCorrectLetter(question);

  return (
    <div style={{
      background: '#ffffff',
      border: '1.5px solid #e2e8f0',
      borderRadius: '14px',
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {/* Hàng Thanh Điều Hướng Câu Hỏi */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: teamColor,
            color: '#ffffff',
            fontWeight: 900,
            fontSize: 'clamp(0.85rem, 1.1vw, 0.98rem)',
            padding: '3px 10px',
            borderRadius: '6px'
          }}>
            Câu {questionNumber}/{totalQuestions}
          </span>
          {isAnswered && (
            <span style={{
              background: '#ecfdf5',
              border: '1px solid #10b981',
              color: '#059669',
              fontWeight: 800,
              fontSize: '0.76rem',
              padding: '2px 8px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ❤️ Đã giải mã trái tim
            </span>
          )}
        </div>

        {/* Nút Trước / Sau */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onPrevQuestion && onPrevQuestion(); }}
            disabled={questionNumber <= 1}
            style={{
              padding: '3px 10px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: questionNumber <= 1 ? '#94a3b8' : '#334155',
              cursor: questionNumber <= 1 ? 'default' : 'pointer',
              fontWeight: 800,
              fontSize: '0.76rem',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            ◀ Trước
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNextQuestion && onNextQuestion(); }}
            disabled={questionNumber >= totalQuestions}
            style={{
              padding: '3px 10px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: questionNumber >= totalQuestions ? '#94a3b8' : '#334155',
              cursor: questionNumber >= totalQuestions ? 'default' : 'pointer',
              fontWeight: 800,
              fontSize: '0.76rem',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            Sau ▶
          </button>
        </div>
      </div>

      {/* Nội Dung Câu Hỏi (To, Đậm, Rõ Nét) */}
      <div style={{
        fontSize: 'clamp(0.92rem, 1.25vw, 1.12rem)',
        fontWeight: 800,
        color: '#0f172a',
        lineHeight: 1.35,
        minHeight: '2.4em',
        display: 'flex',
        alignItems: 'center'
      }}>
        {question.question}
      </div>

      {/* Lưới 4 Đáp Án A, B, C, D (Hiển thị phương án để học sinh đọc) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px'
      }}>
        {question.options?.map((opt, idx) => {
          const label = optionLabels[idx] || String.fromCharCode(65 + idx);
          const isCorrectHighlight = isAnswered && (label === correctLetter);

          let cardBg = '#f8fafc';
          let borderCol = '#cbd5e1';
          let textCol = '#0f172a';
          let badgeBg = `${teamColor}15`;
          let badgeCol = teamColor;

          if (isCorrectHighlight) {
            cardBg = 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)';
            borderCol = '#059669';
            textCol = '#065f46';
            badgeBg = '#059669';
            badgeCol = '#ffffff';
          }

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: cardBg,
                border: `1.5px solid ${borderCol}`,
                color: textCol,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                textAlign: 'left',
                minHeight: 'clamp(36px, 4.8vh, 46px)',
                userSelect: 'none',
                boxSizing: 'border-box'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: badgeBg,
                color: badgeCol,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.82rem',
                flexShrink: 0
              }}>
                {label}
              </div>
              <span style={{
                fontWeight: 700,
                fontSize: 'clamp(0.82rem, 1.1vw, 0.98rem)',
                lineHeight: 1.25,
                flex: 1
              }}>
                {opt}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dòng Hướng Dẫn Tương Tác: Chạm ô ở trên ma trận */}
      <div style={{
        padding: '5px 10px',
        borderRadius: '8px',
        background: isAnswered ? '#f0fdf4' : '#fff1f2',
        border: `1px dashed ${isAnswered ? '#10b981' : '#f43f5e'}`,
        color: isAnswered ? '#15803d' : '#be123c',
        fontSize: 'clamp(0.75rem, 0.95vw, 0.84rem)',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        textAlign: 'center'
      }}>
        {isAnswered ? (
          <span>✨ Ô trái tim cho Câu {questionNumber} đã được giải mã! Hãy tiếp tục câu tiếp theo.</span>
        ) : (
          <span>👆 Đọc câu hỏi và <strong>CHẠM Ô ĐÁP ÁN ĐÚNG [{questionNumber}-...]</strong> trên ma trận trái tim bên trên!</span>
        )}
      </div>
    </div>
  );
});

/**
 * COMPONENT CHÍNH: GAME GIẢI MÃ BỨC TRANH TRÁI TIM 20/10
 */
export function HeartPuzzle2010Game({ 
  questions: propQuestions = [], 
  teams = [], 
  onAddPoints, 
  onClose 
}) {
  // Chế độ chơi: 'dual-touch' (2 Đội chạm song song) | 'teacher-led' (Máy chiếu giáo viên điều khiển)
  const [gameMode, setGameMode] = useState('dual-touch');
  
  // Mẫu hình trái tim: 'matrix' (❤️ Ô Trái Tim Ẩn Giấu - Chuẩn) | 'layers' (💖 Tô Màu Từng Lớp)
  const [patternKey, setPatternKey] = useState('matrix');

  // Danh sách câu hỏi sử dụng
  const [customQuestions, setCustomQuestions] = useState(null);
  const activeQuestionsList = useMemo(() => {
    if (Array.isArray(customQuestions) && customQuestions.length > 0) return customQuestions;
    if (Array.isArray(propQuestions) && propQuestions.length > 0) return propQuestions;
    return DEFAULT_2010_QUESTIONS;
  }, [customQuestions, propQuestions]);

  // Quản lý âm thanh
  const [soundMuted, setSoundMuted] = useState(false);

  // Ma trận ô thẻ cho Đội 1 và Đội 2
  const team1Board = useMemo(() => {
    return buildHeartMatrix(patternKey, activeQuestionsList, 0);
  }, [patternKey, activeQuestionsList]);

  const team2Board = useMemo(() => {
    return buildHeartMatrix(patternKey, activeQuestionsList, 1);
  }, [patternKey, activeQuestionsList]);

  // Trạng thái chơi của 2 đội
  const [teamStates, setTeamStates] = useState([
    {
      id: 'team_1',
      name: 'Đội 1 (Đỏ)',
      color: '#dc2626',
      score: 0,
      currentQIdx: 0,
      correctIndices: [],
      selectedOption: null,
      answerState: null,
      wrongClickedCellId: null
    },
    {
      id: 'team_2',
      name: 'Đội 2 (Xanh)',
      color: '#2563eb',
      score: 0,
      currentQIdx: 0,
      correctIndices: [],
      selectedOption: null,
      answerState: null,
      wrongClickedCellId: null
    }
  ]);

  // Trạng thái chế độ Máy Chiếu (Giáo Viên Điều Khiển)
  const [teacherQIdx, setTeacherQIdx] = useState(0);
  const [activeTeacherTeamIdx, setActiveTeacherTeamIdx] = useState(0);
  const [teacherSelectedOpt, setTeacherSelectedOpt] = useState(null);
  const [teacherAnswerState, setTeacherAnswerState] = useState(null);

  // Đội chiến thắng & Modal chúc mừng
  const [winner, setWinner] = useState(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // Reset toàn bộ trò chơi
  const handleResetGame = useCallback(() => {
    setTeamStates([
      {
        id: 'team_1',
        name: 'Đội 1 (Đỏ)',
        color: '#dc2626',
        score: 0,
        currentQIdx: 0,
        correctIndices: [],
        selectedOption: null,
        answerState: null,
        wrongClickedCellId: null
      },
      {
        id: 'team_2',
        name: 'Đội 2 (Xanh)',
        color: '#2563eb',
        score: 0,
        currentQIdx: 0,
        correctIndices: [],
        selectedOption: null,
        answerState: null,
        wrongClickedCellId: null
      }
    ]);
    setTeacherQIdx(0);
    setTeacherSelectedOpt(null);
    setTeacherAnswerState(null);
    setWinner(null);
    setShowVictoryModal(false);
  }, []);

  // Pháo hoa chiến thắng
  const triggerVictoryFireworks = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };



  // Xử lý khi học sinh chạm trực tiếp vào một ô thẻ trên ma trận
  const handleCellClick = (teamIdx, cell) => {
    const team = teamStates[teamIdx];
    if (!team || winner || !cell) return;

    // Lấy câu hỏi hiện tại đang hiển thị
    const curQIdx = gameMode === 'teacher-led' ? teacherQIdx : team.currentQIdx;
    const curQuestion = activeQuestionsList[curQIdx];
    if (!curQuestion) return;

    const curCorrectLetter = getCorrectLetter(curQuestion);
    const targetCode = `${curQIdx + 1}-${curCorrectLetter}`;
    const cellCode = String(cell.code || '').trim().toUpperCase();

    // 1. Kiểm tra: Ô vừa chạm có phải là ô trái tim chứa đáp án đúng của câu hỏi đang mở không?
    const isCurrentTarget = (cell.isTarget && cell.questionIdx === curQIdx) || (cellCode === targetCode);

    // 2. Hoặc ô vừa chạm là ô trái tim chứa đáp án đúng của một câu hỏi khác trong đề:
    const isOtherTarget = cell.isTarget && cell.questionIdx !== undefined && cell.questionIdx >= 0;

    let solvedQIdx = -1;
    if (isCurrentTarget) {
      solvedQIdx = curQIdx;
    } else if (isOtherTarget) {
      solvedQIdx = cell.questionIdx;
    }

    if (solvedQIdx !== -1) {
      // ĐÚNG Ô! (Ô thuộc hình trái tim ẩn giấu)
      if (!soundMuted) {
        try { SoundFX.correct(); } catch (e) {}
      }

      setTeamStates(prev => {
        const next = [...prev];
        const cur = { ...next[teamIdx] };

        // Nếu câu này chưa được ghi nhận hoàn thành
        if (!cur.correctIndices.includes(solvedQIdx)) {
          cur.correctIndices = [...cur.correctIndices, solvedQIdx];
          cur.score += 10;
        }

        // Tự động chuyển sang câu hỏi tiếp theo chưa làm sau 400ms
        setTimeout(() => {
          if (gameMode === 'teacher-led') {
            setTeacherQIdx(prevQ => {
              for (let q = 0; q < activeQuestionsList.length; q++) {
                if (!cur.correctIndices.includes(q)) return q;
              }
              return prevQ;
            });
          }

          setTeamStates(innerPrev => {
            const innerNext = [...innerPrev];
            const innerCur = { ...innerNext[teamIdx] };

            const nextUnanswered = activeQuestionsList.findIndex((_, idx) => !innerCur.correctIndices.includes(idx));
            if (nextUnanswered !== -1) {
              innerCur.currentQIdx = nextUnanswered;
            }

            // Kiểm tra hoàn tất toàn bộ trái tim
            if (innerCur.correctIndices.length >= activeQuestionsList.length) {
              setWinner(innerCur);
              setShowVictoryModal(true);
              triggerVictoryFireworks();
              try { SoundFX.fanfare(); } catch (e) {}
              if (onAddPoints) {
                onAddPoints(innerCur.name, 100);
              }
            }

            innerNext[teamIdx] = innerCur;
            return innerNext;
          });
        }, 400);

        next[teamIdx] = cur;
        return next;
      });
    } else {
      // Chạm vào ô sai (decoy / đáp án sai): Báo âm thanh sai và rung lắc nháy đỏ
      if (!soundMuted) {
        try { SoundFX.wrong(); } catch (e) {}
      }

      setTeamStates(prev => {
        const next = [...prev];
        next[teamIdx] = {
          ...next[teamIdx],
          wrongClickedCellId: cell.id
        };
        return next;
      });

      setTimeout(() => {
        setTeamStates(prev => {
          const next = [...prev];
          next[teamIdx] = {
            ...next[teamIdx],
            wrongClickedCellId: null
          };
          return next;
        });
      }, 400);
    }
  };

  // Tải file Excel mẫu câu hỏi chuẩn 20/10
  const handleDownloadSampleExcel = async () => {
    try {
      const XLSX = await getXLSX();
      if (!XLSX) {
        alert('Đang nạp thư viện Excel, vui lòng thử lại sau giây lát!');
        return;
      }

      const rows = DEFAULT_2010_QUESTIONS.map((q, idx) => ({
        'STT': idx + 1,
        'Câu hỏi': q.question,
        'Đáp án A': q.options[0] || '',
        'Đáp án B': q.options[1] || '',
        'Đáp án C': q.options[2] || '',
        'Đáp án D': q.options[3] || '',
        'Đáp án đúng': q.correct,
        'Giải thích': q.explanation || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cau_Hoi_20_10');
      XLSX.writeFile(workbook, 'Mau_Cau_Hoi_Giai_Ma_Buc_Tranh_20_10.xlsx');
    } catch (err) {
      alert('Lỗi tải file mẫu: ' + (err.message || 'Không thể tạo file Excel'));
    }
  };

  // Nhập file Excel / Word / PDF / TXT từ giáo viên
  const fileInputRef = useRef(null);
  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseUploadedFile(file);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const parsedQ = parsed.map((item, idx) => ({
          id: `custom_${idx + 1}`,
          question: item.question || `Câu hỏi ${idx + 1}`,
          options: Array.isArray(item.options) && item.options.length >= 2
            ? item.options
            : [
                item['Đáp án A'] || item['A'] || 'A',
                item['Đáp án B'] || item['B'] || 'B',
                item['Đáp án C'] || item['C'] || 'C',
                item['Đáp án D'] || item['D'] || 'D'
              ],
          correct: getCorrectLetter(item),
          explanation: item.explanation || ''
        }));

        setCustomQuestions(parsedQ);
        handleResetGame();
        alert(`🎉 Đã nhập thành công ${parsedQ.length} câu hỏi mới từ tệp ${file.name}!`);
        try { SoundFX.correct(); } catch (e) {}
      } else {
        alert('File không chứa dữ liệu câu hỏi hợp lệ.');
      }
    } catch (err) {
      alert('Lỗi đọc file: ' + (err.message || 'Không thể xử lý tệp'));
      try { SoundFX.wrong(); } catch (e) {}
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0b132b',
      backgroundImage: 'radial-gradient(circle at 50% 10%, #1c2541 0%, #0b132b 100%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      color: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: 'hidden',
      userSelect: 'none',
      boxSizing: 'border-box'
    }}>
      {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG (HEADER BAR) */}
      <div style={{
        height: '52px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        flexShrink: 0,
        zIndex: 50
      }}>
        {/* Nút Thoát Game & Tiêu Đề */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <ArrowLeft size={16} />
            Thoát Game
          </button>

          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 900,
              fontSize: '1rem',
              color: '#f43f5e',
              letterSpacing: '0.5px'
            }}>
              <Heart size={18} fill="#f43f5e" />
              GIẢI MÃ BỨC TRANH 20/10
            </div>
            <div style={{
              fontSize: '0.74rem',
              color: '#94a3b8',
              fontWeight: 500
            }}>
              Đọc câu hỏi bên dưới ➔ Chạm đúng ô trên bảng để tô đỏ kết nối thành Trái Tim
            </div>
          </div>
        </div>

        {/* Bộ Chọn Kiểu Ma Trận Trái Tim & Chế Độ Chơi */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Dropdown Mẫu Ma Trận Trái Tim */}
          <select
            value={patternKey}
            onChange={(e) => setPatternKey(e.target.value)}
            style={{
              background: '#1e293b',
              border: '1.5px solid #e11d48',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.82rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="matrix">❤️ Ô Trái Tim Ẩn Giấu (Lộn Xộn Ma Trận - Chuẩn)</option>
            <option value="layers">💖 Trái Tim Tô Màu Từng Lớp (Dưới Lên Trên)</option>
          </select>

          {/* Nút Chuyển Chế Độ: Chạm 2 Đội vs Máy Chiếu */}
          <div style={{
            display: 'flex',
            background: '#1e293b',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #334155'
          }}>
            <button
              onClick={() => setGameMode('dual-touch')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                background: gameMode === 'dual-touch' ? '#e11d48' : 'transparent',
                border: 'none',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Touchpad size={15} />
              Chạm 2 Đội (Bảng Cảm Ứng)
            </button>
            <button
              onClick={() => setGameMode('teacher-led')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                background: gameMode === 'teacher-led' ? '#2563eb' : 'transparent',
                border: 'none',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Monitor size={15} />
              Máy Chiếu (Giáo Viên Điều Khiển)
            </button>
          </div>

          {/* Các Nút Thao Tác Excel & Âm Thanh */}
          <button
            onClick={handleDownloadSampleExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#059669',
              border: 'none',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <Download size={14} />
            Mẫu Excel
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls, .csv, .docx, .doc, .txt, .pdf"
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#0891b2',
              border: 'none',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <Upload size={14} />
            Nhập Excel
          </button>

          <button
            onClick={handleResetGame}
            title="Làm mới trò chơi"
            style={{
              background: '#334155',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            title={soundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            style={{
              background: '#334155',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* KHU VỰC ĐẤU TRƯỜNG CHÍNH (MAIN ARENA) */}
      <div style={{
        flex: 1,
        padding: '10px 16px',
        overflow: 'hidden',
        display: 'flex',
        boxSizing: 'border-box'
      }}>
        {/* CHẾ ĐỘ 1: CHẠM 2 ĐỘI SONG SONG (DUAL TOUCH) */}
        {gameMode === 'dual-touch' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box'
          }}>
            {teamStates.map((team, teamIdx) => {
              const currentQ = activeQuestionsList[team.currentQIdx];
              const isTeamCompleted = team.correctIndices.length >= activeQuestionsList.length;
              const currentBoard = teamIdx === 0 ? team1Board : team2Board;

              return (
                <div
                  key={team.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    height: '100%',
                    boxSizing: 'border-box',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* Bảng Ma Trận Ô Thẻ Trái Tim Của Đội */}
                  <HeartCardMatrixView
                    teamName={team.name}
                    teamColor={team.color}
                    boardData={currentBoard}
                    correctQuestionIndices={team.correctIndices}
                    totalQuestions={activeQuestionsList.length}
                    isCompleted={isTeamCompleted}
                    onCellClick={(cell) => handleCellClick(teamIdx, cell)}
                    wrongClickedCellId={team.wrongClickedCellId}
                  />

                  {/* Bảng Câu Hỏi & 4 Đáp Án Tương Tác Phía Dưới */}
                  {!isTeamCompleted ? (
                    <InteractiveQuestionPanel
                      question={currentQ}
                      questionNumber={team.currentQIdx + 1}
                      totalQuestions={activeQuestionsList.length}
                      onPrevQuestion={() => {
                        setTeamStates(prev => {
                          const next = [...prev];
                          next[teamIdx].currentQIdx = Math.max(0, next[teamIdx].currentQIdx - 1);
                          return next;
                        });
                      }}
                      onNextQuestion={() => {
                        setTeamStates(prev => {
                          const next = [...prev];
                          next[teamIdx].currentQIdx = Math.min(activeQuestionsList.length - 1, next[teamIdx].currentQIdx + 1);
                          return next;
                        });
                      }}
                      teamColor={team.color}
                      isAnswered={team.correctIndices.includes(team.currentQIdx)}
                    />
                  ) : (
                    <div style={{
                      padding: '16px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '2px solid #10b981',
                      borderRadius: '14px',
                      textAlign: 'center',
                      color: '#34d399',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <Trophy size={24} />
                      🎉 ĐÃ GIẢI MÃ HOÀN TẤT TRÁI TIM 20/10!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CHẾ ĐỘ 2: MÁY CHIẾU - GIÁO VIÊN ĐIỀU KHIỂN (TEACHER-LED) */}
        {gameMode === 'teacher-led' && (
          <div style={{
            display: 'flex',
            gap: '20px',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            height: '100%',
            boxSizing: 'border-box',
            alignItems: 'center'
          }}>
            {/* Cột Trái: Ma Trận Trái Tim Đội Đang Có Lượt */}
            <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
                {teamStates.map((team, idx) => (
                  <button
                    key={team.id}
                    onClick={() => setActiveTeacherTeamIdx(idx)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      background: activeTeacherTeamIdx === idx ? team.color : '#1e293b',
                      border: `1.5px solid ${team.color}`,
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {team.name} ({team.correctIndices.length}/{activeQuestionsList.length})
                  </button>
                ))}
              </div>

              <HeartCardMatrixView
                teamName={teamStates[activeTeacherTeamIdx].name}
                teamColor={teamStates[activeTeacherTeamIdx].color}
                boardData={activeTeacherTeamIdx === 0 ? team1Board : team2Board}
                correctQuestionIndices={teamStates[activeTeacherTeamIdx].correctIndices}
                totalQuestions={activeQuestionsList.length}
                isCompleted={teamStates[activeTeacherTeamIdx].correctIndices.length >= activeQuestionsList.length}
                onCellClick={(cell) => handleCellClick(activeTeacherTeamIdx, cell)}
                wrongClickedCellId={teamStates[activeTeacherTeamIdx].wrongClickedCellId}
              />
            </div>

            {/* Cột Phải: Bảng Câu Hỏi Cho Giáo Viên Điều Khiển */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <InteractiveQuestionPanel
                question={activeQuestionsList[teacherQIdx]}
                questionNumber={teacherQIdx + 1}
                totalQuestions={activeQuestionsList.length}
                onPrevQuestion={() => setTeacherQIdx(prev => Math.max(0, prev - 1))}
                onNextQuestion={() => setTeacherQIdx(prev => Math.min(activeQuestionsList.length - 1, prev + 1))}
                teamColor={teamStates[activeTeacherTeamIdx].color}
                isAnswered={teamStates[activeTeacherTeamIdx].correctIndices.includes(teacherQIdx)}
              />
            </div>
          </div>
        )}
      </div>

      {/* MODAL CHIẾN THẮNG */}
      {showVictoryModal && winner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: `2px solid ${winner.color}`,
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '460px',
            width: '90%',
            textAlign: 'center',
            boxShadow: `0 20px 50px ${winner.color}60`
          }}>
            <Trophy size={64} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              🎉 {winner.name} CHIẾN THẮNG!
            </h2>
            <p style={{
              color: '#94a3b8',
              fontSize: '0.96rem',
              lineHeight: 1.5,
              marginBottom: '20px'
            }}>
              Chúc mừng đội đã xuất sắc giải mã toàn bộ câu hỏi và ghép thành bức tranh Trái Tim 20/10 trọn vẹn yêu thương!
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleResetGame}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: winner.color,
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.96rem',
                  cursor: 'pointer'
                }}
              >
                Chơi Lại Trận Mới
              </button>
              <button
                onClick={() => setShowVictoryModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#334155',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  cursor: 'pointer'
                }}
              >
                Xem Bức Tranh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeartPuzzle2010Game;
