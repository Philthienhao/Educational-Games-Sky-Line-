import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Heart, Trophy, Sparkles, Volume2, VolumeX, RotateCcw, Settings, 
  Upload, Download, Users, Monitor, Touchpad, CheckCircle2, XCircle, 
  ChevronRight, ChevronLeft, ArrowLeft, Maximize, Play, Award, Clock, Palette, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { parseUploadedFile, getXLSX } from '../../utils/universalParser';

// Bộ câu hỏi mẫu chuẩn về ngày Phụ nữ Việt Nam 20/10
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

// Kích thước chuẩn ma trận lưới: 18x18 ô (giúp mỗi ô rộng rãi ~21px, chữ tọa độ không bị tràn hay xuống dòng)
export const GRID_SIZE = 18;

// 3 MA TRẬN SILHOUETTE CHUẨN (1 = Ô tô đỏ khi đáp án đúng, 0 = Ô trắng nền hoặc âm bản)
export const PUZZLE_PATTERNS = {
  // Mẫu 1: Mẹ bồng con trong trái tim (Chuẩn 100% theo phiếu bài tập mẫu)
  'mother-child': {
    name: 'Mẹ Bồng Con (Chuẩn Phiếu)',
    icon: '🤱',
    rows: [
      '000111000001110000',
      '001111100011111000',
      '011111110111111100',
      '111111111111111110',
      '111111111111111110',
      '111111100111111110',
      '111111000011111110',
      '111110000001111110',
      '111100000000111110',
      '111000000000011110',
      '111000000000011110',
      '011100000000111100',
      '011110000001111100',
      '001111000011111000',
      '001111100111110000',
      '000111111111100000',
      '000011111110000000',
      '000000111000000000'
    ]
  },
  // Mẫu 2: Trái tim yêu thương 20/10
  'pure-heart': {
    name: 'Trái Tim Yêu Thương',
    icon: '💖',
    rows: [
      '000111000001110000',
      '001111100011111000',
      '011111110111111100',
      '111111111111111110',
      '111111111111111110',
      '111111111111111110',
      '111111111111111110',
      '111111111111111110',
      '111111111111111110',
      '111111111111111110',
      '011111111111111100',
      '011111111111111100',
      '001111111111111000',
      '001111111111111000',
      '000111111111110000',
      '000011111111100000',
      '000001111111000000',
      '000000011100000000'
    ]
  },
  // Mẫu 3: Người phụ nữ & Hoa hồng
  'woman-rose': {
    name: 'Người Phụ Nữ & Hoa Hồng',
    icon: '🌹',
    rows: [
      '000000111100000000',
      '000001111110000000',
      '000011111111000000',
      '000111111111100000',
      '000111001111100000',
      '000110000111110000',
      '000010000111110000',
      '000001000111110000',
      '000000101111110000',
      '000000111111110000',
      '000000011111100000',
      '000000001111100000',
      '000000011111000000',
      '000000111111100000',
      '000011111111110000',
      '001111111111111000',
      '011111111111111100',
      '111111111111111110'
    ]
  }
};

/**
 * Thuật toán ánh xạ câu hỏi vào lưới ô vuông 18x18:
 * - Các ô target (val === 1): Phân bổ cho các câu hỏi với ĐÁP ÁN ĐÚNG tương ứng (ví dụ: '1-A', '2-B', '3-C'...)
 * - Các ô background/âm bản (val === 0): Phân bổ các ĐÁP ÁN SAI (ví dụ: '1-B', '1-C', '2-A', '3-D'...)
 */
export function buildPuzzleBoard(patternKey, questions) {
  const pattern = PUZZLE_PATTERNS[patternKey]?.rows || PUZZLE_PATTERNS['mother-child'].rows;
  const numQuestions = Math.max(1, questions.length);

  const targetCoords = [];
  const backgroundCoords = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    const rowStr = pattern[r] || '0'.repeat(GRID_SIZE);
    for (let c = 0; c < GRID_SIZE; c++) {
      if (rowStr[c] === '1') {
        targetCoords.push({ r, c });
      } else {
        backgroundCoords.push({ r, c });
      }
    }
  }

  const cellsPerQuestion = Math.ceil(targetCoords.length / numQuestions);
  const cellMap = {};
  const optionLetters = ['A', 'B', 'C', 'D'];

  // Gán ô Target (thuộc hình mẫu) cho các câu hỏi với ĐÁP ÁN ĐÚNG
  targetCoords.forEach((coord, idx) => {
    const qIdx = Math.min(numQuestions - 1, Math.floor(idx / cellsPerQuestion));
    const q = questions[qIdx] || questions[0];
    const correctOpt = q.correct || 'A';
    // Format tọa độ gọn gàng không bị ngắt dòng (VD: 1-A hoặc 10B)
    const code = qIdx < 9 ? `${qIdx + 1}-${correctOpt}` : `${qIdx + 1}${correctOpt}`;
    cellMap[`${coord.r}_${coord.c}`] = {
      r: coord.r,
      c: coord.c,
      isTarget: true,
      questionIdx: qIdx,
      code,
      correctOpt
    };
  });

  // Gán ô Background / Âm bản cho các ĐÁP ÁN SAI
  backgroundCoords.forEach((coord, idx) => {
    const qIdx = idx % numQuestions;
    const q = questions[qIdx] || questions[0];
    const correctOpt = q.correct || 'A';
    const wrongOptions = optionLetters.filter(opt => opt !== correctOpt);
    const chosenWrongOpt = wrongOptions[idx % wrongOptions.length] || 'B';
    const code = qIdx < 9 ? `${qIdx + 1}-${chosenWrongOpt}` : `${qIdx + 1}${chosenWrongOpt}`;
    cellMap[`${coord.r}_${coord.c}`] = {
      r: coord.r,
      c: coord.c,
      isTarget: false,
      questionIdx: qIdx,
      code,
      isWrongOpt: true
    };
  });

  return {
    cellMap,
    targetCoords,
    backgroundCoords,
    totalTargetCells: targetCoords.length
  };
}

/**
 * Component Hiển Thị Tờ Phiếu Bài Tập Lưới Ô "GIẢI MÃ BỨC TRANH"
 */
export const WorksheetPuzzleView = React.memo(({
  teamName = 'Đội Chơi',
  teamColor = '#e11d48',
  boardData,
  correctQuestionIndices = [],
  totalQuestions = 15,
  isCompleted = false,
  compact = false,
  activePatternKey = 'mother-child'
}) => {
  const correctCount = correctQuestionIndices.length;
  const percent = Math.min(100, Math.round((correctCount / Math.max(1, totalQuestions)) * 100));

  // Tập hợp các câu hỏi đã trả lời đúng để kiểm tra ô nhanh
  const answeredSet = useMemo(() => new Set(correctQuestionIndices), [correctQuestionIndices]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      borderRadius: compact ? '16px' : '22px',
      padding: compact ? '12px 14px' : '18px 22px',
      boxShadow: isCompleted 
        ? '0 12px 35px rgba(225, 29, 72, 0.25), 0 0 20px rgba(245, 158, 11, 0.3)' 
        : '0 8px 24px rgba(0, 0, 0, 0.07)',
      border: isCompleted ? '2.5px solid #f59e0b' : '1.5px solid #e2e8f0',
      width: '100%',
      maxWidth: compact ? '420px' : '520px',
      margin: '0 auto',
      transition: 'all 0.3s ease',
      position: 'relative'
    }}>
      {/* Huy hiệu chiến thắng hoàn thành */}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          right: '16px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
          color: '#ffffff',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.78rem',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)',
          zIndex: 10
        }}>
          <Sparkles size={14} /> GIẢI MÃ HOÀN TẤT (100%)
        </div>
      )}

      {/* Header Tờ Phiếu Bài Tập: Đúng chuẩn tiêu đề trên phiếu giấy */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #0f172a',
        paddingBottom: compact ? '6px' : '10px',
        marginBottom: compact ? '8px' : '12px'
      }}>
        <div style={{
          background: '#0f172a',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: compact ? '0.85rem' : '1.05rem',
          padding: compact ? '4px 10px' : '6px 14px',
          borderRadius: '6px',
          letterSpacing: '0.8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>GIẢI MÃ BỨC TRANH</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: compact ? '0.82rem' : '0.95rem',
            fontWeight: 800,
            color: '#475569'
          }}>
            Nhóm:
          </span>
          <span style={{
            fontSize: compact ? '0.95rem' : '1.15rem',
            fontWeight: 900,
            color: teamColor || '#e11d48',
            borderBottom: `2px dashed ${teamColor || '#e11d48'}`,
            paddingBottom: '2px',
            maxWidth: '160px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {teamName}
          </span>
        </div>
      </div>

      {/* Dòng hướng dẫn phong cách Phiếu học tập */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: compact ? '6px 10px' : '8px 12px',
        marginBottom: compact ? '8px' : '12px',
        fontSize: compact ? '0.75rem' : '0.85rem',
        color: '#334155',
        lineHeight: 1.4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1.1rem' }}>💬</span>
          <span><strong>Quy tắc:</strong> Câu nào đúng thì ô chứa đáp án ô đó sẽ được <strong>tô đỏ</strong>.</span>
        </div>
        <div style={{
          fontWeight: 900,
          color: isCompleted ? '#059669' : '#be123c',
          background: isCompleted ? '#d1fae5' : '#ffe4e6',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: compact ? '0.72rem' : '0.82rem',
          flexShrink: 0
        }}>
          {correctCount}/{totalQuestions} câu ({percent}%)
        </div>
      </div>

      {/* KHUNG LƯỚI MA TRẬN Ô VUÔNG 18x18: THOÁNG ĐÃNG, CHỮ RÕ NÉT */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        background: '#ffffff',
        border: '2px solid #cbd5e1',
        borderRadius: '8px',
        padding: '2px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          width: '100%',
          height: '100%',
          gap: '1px',
          background: '#e2e8f0'
        }}>
          {Array.from({ length: GRID_SIZE }).map((_, r) => 
            Array.from({ length: GRID_SIZE }).map((_, c) => {
              const cell = boardData?.cellMap?.[`${r}_${c}`];
              if (!cell) return null;

              // Ô này có được tô đỏ hay không?
              const isRed = cell.isTarget && answeredSet.has(cell.questionIdx);

              return (
                <div
                  key={`${r}_${c}`}
                  title={`Tọa độ [${cell.code}]`}
                  style={{
                    backgroundColor: isRed ? (teamColor || '#dc2626') : '#ffffff',
                    color: isRed ? '#ffffff' : '#64748b',
                    fontSize: compact ? 'clamp(7px, 1.2vw, 9px)' : 'clamp(8px, 1.3vw, 10.5px)',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    letterSpacing: '-0.5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    transition: 'background-color 0.35s ease, color 0.3s ease, transform 0.2s ease',
                    boxShadow: isRed ? `inset 0 0 3px rgba(0,0,0,0.2)` : 'none',
                    lineHeight: 1
                  }}
                >
                  {cell.code}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Khung Thơ Ca Dao & Lời Chúc Mẹ 20/10 ở góc dưới (Chuẩn như phiếu mẫu) */}
      <div style={{
        marginTop: compact ? '10px' : '14px',
        padding: compact ? '8px 12px' : '10px 16px',
        background: '#fff1f2',
        borderLeft: '4px solid #e11d48',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{
          fontFamily: 'serif',
          fontStyle: 'italic',
          color: '#881337',
          fontSize: compact ? '0.78rem' : '0.9rem',
          lineHeight: 1.45,
          fontWeight: 600
        }}>
          “ Công cha như núi Thái Sơn,<br />
          Nghĩa mẹ như nước trong nguồn chảy ra.<br />
          Một lòng thờ mẹ kính cha,<br />
          Cho tròn chữ hiếu mới là đạo con. ”
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: compact ? '0.7rem' : '0.78rem',
          color: '#be123c',
          fontWeight: 700,
          marginTop: '2px'
        }}>
          <span>👤 Giáo viên Sky-Line</span>
          <span>💖 Chủ đề 20/10</span>
        </div>
      </div>

      {/* Thanh tiến độ bên dưới */}
      <div style={{
        width: '100%',
        height: '6px',
        backgroundColor: '#f1f5f9',
        borderRadius: '3px',
        marginTop: compact ? '8px' : '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          background: isCompleted 
            ? 'linear-gradient(90deg, #f59e0b, #ef4444)' 
            : `linear-gradient(90deg, ${teamColor || '#e11d48'}, #f43f5e)`,
          borderRadius: '3px',
          transition: 'width 0.4s ease'
        }} />
      </div>
    </div>
  );
});

/**
 * Component Thẻ Câu Hỏi & 4 Đáp Án Tương Tác
 */
const QuestionPanel = React.memo(({
  question,
  questionNumber = 1,
  totalQuestions = 15,
  onSelectOption,
  onPrevQuestion,
  onNextQuestion,
  selectedOption,
  answerState,
  disabled = false,
  compact = false,
  teamLabel = ''
}) => {
  if (!question) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#881337',
        fontWeight: 700,
        background: '#fff1f2',
        borderRadius: '16px'
      }}>
        🎉 Đã hoàn thành toàn bộ bộ câu hỏi!
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? '8px' : '12px',
      width: '100%'
    }}>
      {/* Khung nội dung câu hỏi */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
        border: '1.5px solid #fecdd3',
        borderRadius: compact ? '14px' : '18px',
        padding: compact ? '12px 14px' : '16px 20px',
        boxShadow: '0 4px 15px rgba(225, 29, 72, 0.06)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px'
        }}>
          {teamLabel ? (
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 900,
              color: '#be123c',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {teamLabel}
            </div>
          ) : (
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#94a3b8'
            }}>
              CÂU HỎI {questionNumber}/{totalQuestions}
            </div>
          )}

          {/* Nút Điều Hướng Câu Hỏi Nhanh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onPrevQuestion && (
              <button
                onClick={(e) => { e.stopPropagation(); onPrevQuestion(); }}
                disabled={questionNumber <= 1}
                style={{
                  background: 'rgba(225, 29, 72, 0.08)',
                  border: '1px solid #fecdd3',
                  color: '#be123c',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  cursor: questionNumber <= 1 ? 'default' : 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  opacity: questionNumber <= 1 ? 0.4 : 1
                }}
              >
                ◀ Trước
              </button>
            )}

            <div style={{
              background: 'rgba(225, 29, 72, 0.1)',
              color: '#be123c',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              Câu #{questionNumber}
            </div>

            {onNextQuestion && (
              <button
                onClick={(e) => { e.stopPropagation(); onNextQuestion(); }}
                disabled={questionNumber >= totalQuestions}
                style={{
                  background: 'rgba(225, 29, 72, 0.08)',
                  border: '1px solid #fecdd3',
                  color: '#be123c',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  cursor: questionNumber >= totalQuestions ? 'default' : 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  opacity: questionNumber >= totalQuestions ? 0.4 : 1
                }}
              >
                Sau ▶
              </button>
            )}
          </div>
        </div>

        <h3 style={{
          margin: 0,
          fontSize: compact ? '0.98rem' : '1.18rem',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1.45
        }}>
          {question.question}
        </h3>
      </div>

      {/* Lưới 4 đáp án A, B, C, D */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: compact ? '8px' : '10px'
      }}>
        {question.options?.map((opt, idx) => {
          const label = optionLabels[idx] || String.fromCharCode(65 + idx);
          const isSelected = selectedOption === label;
          const isCorrect = label === question.correct;

          let btnBg = '#ffffff';
          let borderCol = '#fecdd3';
          let textCol = '#334155';
          let shadow = '0 2px 6px rgba(0, 0, 0, 0.04)';

          if (answerState) {
            if (isCorrect) {
              btnBg = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              borderCol = '#059669';
              textCol = '#ffffff';
              shadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            } else if (isSelected && !isCorrect) {
              btnBg = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              borderCol = '#dc2626';
              textCol = '#ffffff';
              shadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }
          } else if (isSelected) {
            btnBg = '#ffe4e6';
            borderCol = '#e11d48';
            textCol = '#be123c';
          }

          return (
            <button
              key={idx}
              onClick={() => {
                if (!disabled && answerState === null) {
                  onSelectOption(label);
                }
              }}
              disabled={disabled || answerState !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: compact ? '8px' : '10px',
                padding: compact ? '10px 12px' : '12px 16px',
                borderRadius: compact ? '12px' : '14px',
                background: btnBg,
                border: `2px solid ${borderCol}`,
                color: textCol,
                boxShadow: shadow,
                cursor: (disabled || answerState !== null) ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                outline: 'none',
                minHeight: compact ? '48px' : '56px'
              }}
            >
              <div style={{
                width: compact ? '26px' : '30px',
                height: compact ? '26px' : '30px',
                borderRadius: '50%',
                background: answerState && isCorrect 
                  ? '#ffffff' 
                  : (answerState && isSelected ? '#ffffff' : 'rgba(225, 29, 72, 0.1)'),
                color: answerState && isCorrect 
                  ? '#059669' 
                  : (answerState && isSelected ? '#dc2626' : '#be123c'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: compact ? '0.85rem' : '0.98rem',
                flexShrink: 0
              }}>
                {label}
              </div>
              <span style={{
                fontWeight: 700,
                fontSize: compact ? '0.85rem' : '0.96rem',
                lineHeight: 1.35,
                flex: 1
              }}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

/**
 * COMPONENT CHÍNH: GAME GIẢI MÃ BỨC TRANH 20/10
 */
export function HeartPuzzle2010Game({ 
  questions: propQuestions = [], 
  teams = [], 
  onAddPoints, 
  onClose 
}) {
  // Chế độ chơi: 'dual-touch' (2 đội chạm song song) | 'teacher-led' (Giáo viên chiếu máy chiếu và chấm)
  const [gameMode, setGameMode] = useState('dual-touch');
  
  // Mẫu hình hiển thị: 'mother-child' | 'pure-heart' | 'woman-rose'
  const [patternKey, setPatternKey] = useState('mother-child');

  // Số lượng đội (ở chế độ teacher-led có thể chọn 1, 2, 3, 4 đội)
  const [teamCount, setTeamCount] = useState(2);

  // Danh sách câu hỏi sử dụng
  const [customQuestions, setCustomQuestions] = useState(null);
  const activeQuestionsList = useMemo(() => {
    if (Array.isArray(customQuestions) && customQuestions.length > 0) return customQuestions;
    if (Array.isArray(propQuestions) && propQuestions.length > 0) return propQuestions;
    return DEFAULT_2010_QUESTIONS;
  }, [customQuestions, propQuestions]);

  // Quản lý âm thanh
  const [soundMuted, setSoundMuted] = useState(false);

  // Cấu trúc bảng ô vuông câu hỏi
  const boardData = useMemo(() => {
    return buildPuzzleBoard(patternKey, activeQuestionsList);
  }, [patternKey, activeQuestionsList]);

  // Màu sắc đại diện cho các đội
  const TEAM_COLORS = ['#e11d48', '#2563eb', '#10b981', '#f59e0b'];
  const DEFAULT_TEAM_NAMES = ['Đội 1 (Đỏ)', 'Đội 2 (Xanh)', 'Đội 3 (Lục)', 'Đội 4 (Vàng)'];

  // Khởi tạo trạng thái cho các đội
  const [teamStates, setTeamStates] = useState(() => [
    {
      id: 0,
      name: (teams && teams[0]?.name) || DEFAULT_TEAM_NAMES[0],
      color: TEAM_COLORS[0],
      score: 0,
      correctIndices: [],
      currentQIdx: 0,
      selectedOption: null,
      answerState: null
    },
    {
      id: 1,
      name: (teams && teams[1]?.name) || DEFAULT_TEAM_NAMES[1],
      color: TEAM_COLORS[1],
      score: 0,
      correctIndices: [],
      currentQIdx: 0,
      selectedOption: null,
      answerState: null
    }
  ]);

  // Cập nhật số lượng đội khi chuyển chế độ hoặc chọn số đội
  useEffect(() => {
    const count = gameMode === 'dual-touch' ? 2 : teamCount;
    setTeamStates(prev => {
      const next = [];
      for (let i = 0; i < count; i++) {
        const existing = prev[i];
        next.push({
          id: i,
          name: existing?.name || (teams && teams[i]?.name) || DEFAULT_TEAM_NAMES[i] || `Đội ${i + 1}`,
          color: TEAM_COLORS[i % TEAM_COLORS.length],
          score: existing?.score || 0,
          correctIndices: existing?.correctIndices || [],
          currentQIdx: existing?.currentQIdx || 0,
          selectedOption: null,
          answerState: null
        });
      }
      return next;
    });
  }, [teamCount, gameMode]);

  // Đội đang có lượt (cho chế độ Teacher-led)
  const [activeTeacherTeamIdx, setActiveTeacherTeamIdx] = useState(0);
  // Câu hỏi chung hiện tại (cho chế độ Teacher-led)
  const [teacherQIdx, setTeacherQIdx] = useState(0);
  const [teacherSelectedOpt, setTeacherSelectedOpt] = useState(null);
  const [teacherAnswerState, setTeacherAnswerState] = useState(null);

  // Đội thắng cuộc
  const [winner, setWinner] = useState(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const fireworksIntervalRef = useRef(null);

  // Trigger pháo hoa ăn mừng
  const triggerVictoryFireworks = () => {
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      const end = Date.now() + 3000;
      fireworksIntervalRef.current = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(fireworksIntervalRef.current);
          return;
        }
        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
      }, 350);
    } catch (e) {}
  };

  useEffect(() => {
    return () => {
      if (fireworksIntervalRef.current) clearInterval(fireworksIntervalRef.current);
    };
  }, []);

  // Xử lý khi Đội chọn đáp án trong chế độ Chạm Cảm Ứng (Dual-Touch)
  const handleTouchTeamSelectOption = (teamIdx, opt) => {
    const team = teamStates[teamIdx];
    if (!team || team.answerState !== null || winner) return;

    const currentQuestion = activeQuestionsList[team.currentQIdx];
    if (!currentQuestion) return;

    const isCorrect = opt === currentQuestion.correct;

    // Phát âm thanh an toàn
    if (!soundMuted) {
      try {
        if (isCorrect) SoundFX.correct();
        else SoundFX.wrong();
      } catch (e) {}
    }

    // Cập nhật trạng thái câu trả lời ngay lập tức
    setTeamStates(prev => {
      const next = [...prev];
      const cur = { ...next[teamIdx] };
      cur.selectedOption = opt;
      cur.answerState = isCorrect ? 'correct' : 'wrong';

      if (isCorrect) {
        cur.score += 10;
        if (!cur.correctIndices.includes(cur.currentQIdx)) {
          cur.correctIndices = [...cur.correctIndices, cur.currentQIdx];
        }
      }

      next[teamIdx] = cur;
      return next;
    });

    // Chuyển câu tiếp theo hoặc cho phép thử lại
    setTimeout(() => {
      setTeamStates(prev => {
        const next = [...prev];
        const cur = { ...next[teamIdx] };
        cur.selectedOption = null;
        cur.answerState = null;

        // Nếu đúng thì tự động chuyển câu hỏi tiếp theo
        if (isCorrect) {
          cur.currentQIdx = Math.min(activeQuestionsList.length - 1, cur.currentQIdx + 1);
        }

        // Kiểm tra xem đội này đã giải mã xong 100% chưa
        if (cur.correctIndices.length >= activeQuestionsList.length) {
          setWinner(cur);
          setShowVictoryModal(true);
          triggerVictoryFireworks();
          try { SoundFX.fanfare(); } catch (e) {}
          if (onAddPoints) {
            onAddPoints(cur.name, 100);
          }
        }

        next[teamIdx] = cur;
        return next;
      });
    }, 900);
  };

  // Xử lý khi Giáo viên chọn đáp án trong chế độ Máy Chiếu (Teacher-Led)
  const handleTeacherSelectOption = (opt) => {
    if (teacherAnswerState !== null || winner) return;

    const currentQuestion = activeQuestionsList[teacherQIdx];
    if (!currentQuestion) return;

    const isCorrect = opt === currentQuestion.correct;
    setTeacherSelectedOpt(opt);
    setTeacherAnswerState(isCorrect ? 'correct' : 'wrong');

    // Phát âm thanh an toàn
    if (!soundMuted) {
      try {
        if (isCorrect) SoundFX.correct();
        else SoundFX.wrong();
      } catch (e) {}
    }

    // Nếu đúng -> Tô đỏ các ô đáp án tương ứng của đội đang có lượt
    if (isCorrect) {
      setTeamStates(prev => {
        const next = [...prev];
        const cur = { ...next[activeTeacherTeamIdx] };
        cur.score += 10;
        if (!cur.correctIndices.includes(teacherQIdx)) {
          cur.correctIndices = [...cur.correctIndices, teacherQIdx];
        }
        next[activeTeacherTeamIdx] = cur;

        // Kiểm tra đội thắng
        if (cur.correctIndices.length >= activeQuestionsList.length) {
          setWinner(cur);
          setShowVictoryModal(true);
          triggerVictoryFireworks();
          try { SoundFX.fanfare(); } catch (e) {}
          if (onAddPoints) {
            onAddPoints(cur.name, 100);
          }
        }

        return next;
      });
    }

    // Chuyển sang câu tiếp theo sau 1s
    setTimeout(() => {
      setTeacherSelectedOpt(null);
      setTeacherAnswerState(null);
      if (isCorrect) {
        setTeacherQIdx(prev => Math.min(activeQuestionsList.length - 1, prev + 1));
      }
    }, 900);
  };

  // Nút Giáo Viên Chấm Đúng trực tiếp (cho phép giáo viên can thiệp tô đỏ ô)
  const handleTeacherManualAward = (teamIdx) => {
    if (winner) return;
    if (!soundMuted) {
      try { SoundFX.correct(); } catch (e) {}
    }

    setTeamStates(prev => {
      const next = [...prev];
      const cur = { ...next[teamIdx] };
      cur.score += 10;
      if (!cur.correctIndices.includes(teacherQIdx)) {
        cur.correctIndices = [...cur.correctIndices, teacherQIdx];
      }
      next[teamIdx] = cur;

      if (cur.correctIndices.length >= activeQuestionsList.length) {
        setWinner(cur);
        setShowVictoryModal(true);
        triggerVictoryFireworks();
        try { SoundFX.fanfare(); } catch (e) {}
      }
      return next;
    });

    // Chuyển câu hỏi tiếp theo
    setTeacherQIdx(prev => Math.min(activeQuestionsList.length - 1, prev + 1));
  };

  // Tải file Excel mẫu câu hỏi chuẩn 20/10
  const handleDownloadSampleExcel = () => {
    const XLSX = getXLSX();
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
  };

  // Tải lên file Excel câu hỏi tuỳ chỉnh
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseUploadedFile(file);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCustomQuestions(parsed);
        alert(`Đã nhập thành công ${parsed.length} câu hỏi mới vào game!`);
        handleResetGame();
      } else {
        alert('Không tìm thấy danh sách câu hỏi hợp lệ trong file Excel.');
      }
    } catch (err) {
      alert('Lỗi đọc file Excel: ' + (err.message || 'Định dạng không hợp lệ'));
    }
    e.target.value = '';
  };

  // Reset trận đấu
  const handleResetGame = () => {
    setWinner(null);
    setShowVictoryModal(false);
    setTeacherQIdx(0);
    setTeacherSelectedOpt(null);
    setTeacherAnswerState(null);

    setTeamStates(prev => prev.map(t => ({
      ...t,
      score: 0,
      correctIndices: [],
      currentQIdx: 0,
      selectedOption: null,
      answerState: null
    })));
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: '#0f172a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* THANH ĐIỀU KHIỂN TRÊN CÙNG (TOP BAR) */}
      <div style={{
        height: '60px',
        background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0
      }}>
        {/* Nút Thoát Game & Tiêu đề */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '7px 14px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <ArrowLeft size={16} /> Thoát Game
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>💖</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#f43f5e' }}>
                GIẢI MÃ BỨC TRANH 20/10
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Tô đỏ ô đáp án đúng để lộ diện hình ảnh tri ân Phụ Nữ Việt Nam
              </div>
            </div>
          </div>
        </div>

        {/* Thanh chuyển chế độ chơi & Chọn Mẫu Tranh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Chọn Mẫu Bức Tranh */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '3px 8px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            gap: '6px'
          }}>
            <Palette size={15} color="#fb7185" />
            <select
              value={patternKey}
              onChange={(e) => {
                setPatternKey(e.target.value);
                handleResetGame();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="mother-child" style={{ background: '#1e293b', color: '#fff' }}>
                🤱 Mẹ Bồng Con (Chuẩn Phiếu)
              </option>
              <option value="pure-heart" style={{ background: '#1e293b', color: '#fff' }}>
                💖 Trái Tim Yêu Thương
              </option>
              <option value="woman-rose" style={{ background: '#1e293b', color: '#fff' }}>
                🌹 Người Phụ Nữ & Hoa Hồng
              </option>
            </select>
          </div>

          {/* Chọn Chế Độ Chơi: Chạm 2 Đội vs Máy Chiếu */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <button
              onClick={() => { setGameMode('dual-touch'); handleResetGame(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: gameMode === 'dual-touch' ? '#e11d48' : 'transparent',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Touchpad size={15} /> Chạm 2 Đội (Bảng Cảm Ứng)
            </button>
            <button
              onClick={() => { setGameMode('teacher-led'); handleResetGame(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: gameMode === 'teacher-led' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <Monitor size={15} /> Máy Chiếu (Giáo Viên Điều Khiển)
            </button>
          </div>

          {/* Chọn Số Đội (nếu ở chế độ Máy Chiếu) */}
          {gameMode === 'teacher-led' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '4px 10px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <Users size={15} color="#94a3b8" />
              <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700 }}>Số Đội:</span>
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => { setTeamCount(num); handleResetGame(); }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: 'none',
                    background: teamCount === num ? '#2563eb' : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          )}

          {/* Nút Excel Mẫu & Nhập Excel */}
          <button
            onClick={handleDownloadSampleExcel}
            title="Tải file Excel câu hỏi mẫu 20/10"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem'
            }}
          >
            <Download size={14} /> Mẫu Excel
          </button>

          <label
            title="Nhập câu hỏi từ file Excel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem'
            }}
          >
            <Upload size={14} /> Nhập Excel
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          {/* Nút Reset & Âm Thanh */}
          <button
            onClick={handleResetGame}
            title="Làm mới trận đấu"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              padding: '7px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            title={soundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: soundMuted ? '#f87171' : '#4ade80',
              padding: '7px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* KHÔNG GIAN ĐẤU TRƯỜNG CHÍNH (ARENA) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 100%)'
      }}>
        {/* CHẾ ĐỘ 1: BẢNG CẢM ỨNG 2 ĐỘI (DUAL-TOUCH) */}
        {gameMode === 'dual-touch' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            width: '100%',
            maxWidth: '1500px',
            margin: '0 auto',
            alignItems: 'start'
          }}>
            {teamStates.slice(0, 2).map((team, teamIdx) => {
              const currentQ = activeQuestionsList[team.currentQIdx] || activeQuestionsList[activeQuestionsList.length - 1];
              const isTeamCompleted = team.correctIndices.length >= activeQuestionsList.length;

              return (
                <div
                  key={team.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: `2px solid ${team.color}40`,
                    borderRadius: '24px',
                    padding: '16px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {/* Tờ Phiếu Bài Tập Lưới Ô Vuông của Đội */}
                  <WorksheetPuzzleView
                    teamName={team.name}
                    teamColor={team.color}
                    boardData={boardData}
                    correctQuestionIndices={team.correctIndices}
                    totalQuestions={activeQuestionsList.length}
                    isCompleted={isTeamCompleted}
                    compact={true}
                    activePatternKey={patternKey}
                  />

                  {/* Bảng Câu Hỏi Chạm Tương Tác cho Đội */}
                  {!isTeamCompleted ? (
                    <QuestionPanel
                      question={currentQ}
                      questionNumber={team.currentQIdx + 1}
                      totalQuestions={activeQuestionsList.length}
                      onSelectOption={(opt) => handleTouchTeamSelectOption(teamIdx, opt)}
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
                      selectedOption={team.selectedOption}
                      answerState={team.answerState}
                      disabled={winner !== null}
                      compact={true}
                      teamLabel={`${team.name} - Chạm chọn đáp án`}
                    />
                  ) : (
                    <div style={{
                      padding: '18px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '2px solid #10b981',
                      borderRadius: '16px',
                      textAlign: 'center',
                      color: '#34d399',
                      fontWeight: 800,
                      fontSize: '1.05rem'
                    }}>
                      🎉 ĐÃ GIẢI MÃ HOÀN TẤT BỨC TRANH!
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
            flexDirection: 'column',
            gap: '18px',
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {/* Hàng Các Tờ Phiếu Trái Tim Của Từng Đội */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${teamStates.length}, 1fr)`,
              gap: '16px',
              width: '100%'
            }}>
              {teamStates.map((team, idx) => {
                const isCurrentTurn = activeTeacherTeamIdx === idx;
                const isTeamCompleted = team.correctIndices.length >= activeQuestionsList.length;

                return (
                  <div
                    key={team.id}
                    onClick={() => setActiveTeacherTeamIdx(idx)}
                    style={{
                      cursor: 'pointer',
                      transform: isCurrentTurn ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Badge Đang Chọn Lượt */}
                    {isCurrentTurn && (
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: team.color,
                        color: '#ffffff',
                        padding: '3px 12px',
                        borderRadius: '20px',
                        fontWeight: 900,
                        fontSize: '0.75rem',
                        boxShadow: `0 4px 12px ${team.color}60`,
                        zIndex: 20,
                        whiteSpace: 'nowrap'
                      }}>
                        👉 LƯỢT ĐỘI NÀY
                      </div>
                    )}

                    <WorksheetPuzzleView
                      teamName={team.name}
                      teamColor={team.color}
                      boardData={boardData}
                      correctQuestionIndices={team.correctIndices}
                      totalQuestions={activeQuestionsList.length}
                      isCompleted={isTeamCompleted}
                      compact={teamStates.length > 2}
                      activePatternKey={patternKey}
                    />

                    {/* Nút Giáo Viên Chấm Điểm Nhanh */}
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTeacherManualAward(idx);
                        }}
                        style={{
                          flex: 1,
                          padding: '7px',
                          background: `${team.color}25`,
                          border: `1.5px solid ${team.color}`,
                          color: '#ffffff',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle2 size={14} color={team.color} /> Chấm Đúng & Tô Đỏ Ô
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Khung Câu Hỏi Chiếu Trung Tâm */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '20px 28px',
              boxShadow: '0 10px 35px rgba(0, 0, 0, 0.4)',
              border: '2px solid #e2e8f0',
              color: '#0f172a'
            }}>
              {/* Chọn Lượt Đội Trả Lời */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>
                    ĐỘI ĐANG TRẢ LỜI CÂU HỎI:
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {teamStates.map((team, idx) => (
                      <button
                        key={team.id}
                        onClick={() => setActiveTeacherTeamIdx(idx)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '20px',
                          border: activeTeacherTeamIdx === idx ? `2px solid ${team.color}` : '1px solid #cbd5e1',
                          background: activeTeacherTeamIdx === idx ? `${team.color}15` : '#f8fafc',
                          color: activeTeacherTeamIdx === idx ? team.color : '#64748b',
                          fontWeight: 900,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        {team.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Điều Hướng Câu Hỏi */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setTeacherQIdx(prev => Math.max(0, prev - 1))}
                    disabled={teacherQIdx === 0}
                    style={{
                      padding: '5px 10px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      cursor: teacherQIdx === 0 ? 'default' : 'pointer',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: '#475569'
                    }}
                  >
                    ◀ Câu Trước
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                    Câu {teacherQIdx + 1}/{activeQuestionsList.length}
                  </span>
                  <button
                    onClick={() => setTeacherQIdx(prev => Math.min(activeQuestionsList.length - 1, prev + 1))}
                    disabled={teacherQIdx === activeQuestionsList.length - 1}
                    style={{
                      padding: '5px 10px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      cursor: teacherQIdx === activeQuestionsList.length - 1 ? 'default' : 'pointer',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: '#475569'
                    }}
                  >
                    Câu Tiếp ▶
                  </button>
                </div>
              </div>

              {/* Bảng Câu Hỏi và 4 Đáp Án Chiếu Lớn */}
              <QuestionPanel
                question={activeQuestionsList[teacherQIdx]}
                questionNumber={teacherQIdx + 1}
                totalQuestions={activeQuestionsList.length}
                onSelectOption={handleTeacherSelectOption}
                onPrevQuestion={() => setTeacherQIdx(prev => Math.max(0, prev - 1))}
                onNextQuestion={() => setTeacherQIdx(prev => Math.min(activeQuestionsList.length - 1, prev + 1))}
                selectedOption={teacherSelectedOpt}
                answerState={teacherAnswerState}
                disabled={winner !== null}
                compact={false}
                teamLabel={`Đang chấm cho: ${teamStates[activeTeacherTeamIdx]?.name}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* POPUP CHIẾN THẮNG & VINH DANH HOÀN THÀNH BỨC TRANH */}
      {showVictoryModal && winner && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '3px solid #f59e0b',
            borderRadius: '28px',
            padding: '32px 40px',
            maxWidth: '560px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(245, 158, 11, 0.4)',
            animation: 'scaleUp 0.3s ease-out'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '10px' }}>
              🏆
            </div>

            <h2 style={{
              margin: '0 0 8px 0',
              fontSize: '2rem',
              fontWeight: 900,
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              CHÚC MỪNG {winner.name}!
            </h2>

            <p style={{
              color: '#fecdd3',
              fontSize: '1.05rem',
              fontWeight: 700,
              lineHeight: 1.5,
              marginBottom: '20px'
            }}>
              Đã xuất sắc trả lời đúng và <strong>tô đỏ toàn bộ bức tranh</strong> tri ân người Mẹ nhân ngày Phụ Nữ Việt Nam 20/10!
            </p>

            {/* Khung Tranh Hoàn Thành Thu Nhỏ */}
            <div style={{
              maxWidth: '300px',
              margin: '0 auto 24px auto',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
              <WorksheetPuzzleView
                teamName={winner.name}
                teamColor={winner.color}
                boardData={boardData}
                correctQuestionIndices={Array.from({ length: activeQuestionsList.length }, (_, i) => i)}
                totalQuestions={activeQuestionsList.length}
                isCompleted={true}
                compact={true}
                activePatternKey={patternKey}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleResetGame}
                style={{
                  padding: '12px 28px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(225, 29, 72, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={18} /> Chơi Lại Trận Mới
              </button>

              <button
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
