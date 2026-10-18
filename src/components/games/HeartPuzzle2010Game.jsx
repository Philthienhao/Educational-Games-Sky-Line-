import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Heart, Trophy, Sparkles, Volume2, VolumeX, RotateCcw, Settings, 
  Upload, Download, Users, Monitor, Touchpad, CheckCircle2, XCircle, 
  ChevronRight, ArrowLeft, Maximize, Play, Award, Clock
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

// Định nghĩa ma trận lưới Trái Tim & Mẹ Ôm Con (18x18 Grid)
// 0 = Nền ngoài trái tim (trắng/xám nhạt có mã ô)
// 1 = Thân trái tim (được tô đỏ theo các câu hỏi)
// 2 = Silhouette Mẹ và Em bé ôm hôn nhau bên trong trái tim (âm bản màu trắng sữa, hiện rõ khi viền đỏ bao quanh)
const HEART_GRID_SIZE = 18;
const HEART_MAP = [
  [0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0],
  [0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0],
  [0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,2,2,2,2,2,1,1,1,1,2,2,1,1,1,1,0],
  [0,1,1,2,2,2,2,1,1,1,2,2,2,2,1,1,0,0],
  [0,1,1,1,2,2,2,2,1,2,2,2,2,2,1,1,0,0],
  [0,0,1,1,1,2,2,2,2,2,2,2,2,1,1,0,0,0],
  [0,0,1,1,1,1,2,2,2,2,2,2,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,2,2,2,2,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,1,1,2,2,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]
];

// Lọc các ô thuộc phần trái tim (type 1) để ánh xạ vào số câu hỏi
const HEART_CELL_COORDS = [];
HEART_MAP.forEach((row, r) => {
  row.forEach((val, c) => {
    if (val === 1) {
      HEART_CELL_COORDS.push({ r, c });
    }
  });
});

// Component hiển thị khung tranh Trái Tim Mosaic Pixel & Mẹ Hôn Con
const HeartMatrixView = React.memo(({ 
  answeredCount = 0, 
  totalQuestions = 15, 
  isCompleted = false, 
  teamColor = '#e11d48',
  teamName = 'Đội Chơi',
  compact = false
}) => {
  const percent = Math.min(100, Math.round((answeredCount / Math.max(1, totalQuestions)) * 100));
  const totalHeartCells = HEART_CELL_COORDS.length;
  // Số ô được tô đỏ dựa theo tiến độ số câu đúng
  const redCellCount = isCompleted 
    ? totalHeartCells 
    : Math.min(totalHeartCells, Math.round((answeredCount / Math.max(1, totalQuestions)) * totalHeartCells));

  // Tập hợp các ô đã được tô đỏ
  const activeCellsSet = useMemo(() => {
    const set = new Set();
    for (let i = 0; i < redCellCount; i++) {
      const coord = HEART_CELL_COORDS[i];
      if (coord) set.add(`${coord.r}_${coord.c}`);
    }
    return set;
  }, [redCellCount]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(254, 242, 242, 0.98) 100%)',
      borderRadius: compact ? '16px' : '24px',
      padding: compact ? '10px 12px' : '16px 20px',
      border: isCompleted ? '3px solid #f59e0b' : '2px solid rgba(225, 29, 72, 0.25)',
      boxShadow: isCompleted 
        ? '0 0 25px rgba(245, 158, 11, 0.45), 0 10px 30px rgba(225, 29, 72, 0.2)' 
        : '0 8px 24px rgba(0, 0, 0, 0.08)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.4s ease'
    }}>
      {/* Huy hiệu hoàn thành lấp lánh */}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
          zIndex: 5
        }}>
          <Sparkles size={13} /> GIẢI MÃ HOÀN TẤT
        </div>
      )}

      {/* Tên Đội & Tiến độ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: compact ? '6px' : '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: compact ? '10px' : '14px',
            height: compact ? '10px' : '14px',
            borderRadius: '50%',
            backgroundColor: teamColor,
            boxShadow: `0 0 8px ${teamColor}`
          }} />
          <span style={{
            fontWeight: 900,
            fontSize: compact ? '0.9rem' : '1.05rem',
            color: '#881337',
            maxWidth: compact ? '130px' : '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {teamName}
          </span>
        </div>

        <div style={{
          background: isCompleted ? 'rgba(245, 158, 11, 0.15)' : 'rgba(225, 29, 72, 0.1)',
          color: isCompleted ? '#b45309' : '#be123c',
          padding: '2px 10px',
          borderRadius: '12px',
          fontWeight: 900,
          fontSize: compact ? '0.78rem' : '0.88rem'
        }}>
          {answeredCount}/{totalQuestions} ô ({percent}%)
        </div>
      </div>

      {/* Khung chứa ma trận Trái Tim & Vector Nghệ Thuật */}
      <div style={{
        position: 'relative',
        width: compact ? '180px' : '270px',
        height: compact ? '180px' : '270px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        borderRadius: '16px',
        padding: compact ? '4px' : '8px',
        boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.05)',
        border: '1.5px solid #fecdd3'
      }}>
        {/* Lưới ô vuông pixel mosaic (như phiếu học tập giấy) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${HEART_GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${HEART_GRID_SIZE}, 1fr)`,
          width: '100%',
          height: '100%',
          gap: compact ? '1px' : '1.5px'
        }}>
          {HEART_MAP.map((row, r) => 
            row.map((val, c) => {
              const cellKey = `${r}_${c}`;
              const isHeartBorder = val === 1;
              const isMotherChildSilhouette = val === 2;
              const isRedActive = activeCellsSet.has(cellKey);

              let bgColor = '#ffffff'; // Nền ngoài
              let borderStyle = '1px solid #f1f5f9';

              if (isHeartBorder) {
                if (isRedActive) {
                  bgColor = teamColor || '#e11d48';
                  borderStyle = '1px solid rgba(190, 18, 60, 0.8)';
                } else {
                  bgColor = '#f8fafc';
                  borderStyle = '1px solid #e2e8f0';
                }
              } else if (isMotherChildSilhouette) {
                // Vùng âm bản Mẹ và Con: Hiện ánh sáng vàng dịu khi viền đỏ bao quanh
                bgColor = isCompleted 
                  ? '#fffbeb' 
                  : (redCellCount > totalHeartCells * 0.4 ? '#fff1f2' : '#ffffff');
                borderStyle = '1px dashed #fbcfe8';
              }

              return (
                <div
                  key={cellKey}
                  style={{
                    backgroundColor: bgColor,
                    border: borderStyle,
                    borderRadius: '2px',
                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                    boxShadow: isRedActive ? `0 0 3px ${teamColor}` : 'none'
                  }}
                />
              );
            })
          )}
        </div>

        {/* Lớp phủ Silhouette nghệ thuật Vector Mẹ Ôm Con ở trung tâm */}
        <div style={{
          position: 'absolute',
          top: '12%',
          left: '12%',
          width: '76%',
          height: '76%',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isCompleted ? 1 : Math.max(0.35, percent / 100),
          transition: 'all 0.5s ease'
        }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {/* Silhouette người mẹ âu yếm ôm hôn con gái/con trai */}
            <path
              d="M 50 15 C 38 15 28 25 28 38 C 28 55 45 68 50 78 C 55 68 72 55 72 38 C 72 25 62 15 50 15 Z"
              fill="none"
              stroke={isCompleted ? '#d97706' : (percent > 50 ? '#be123c' : '#cbd5e1')}
              strokeWidth="2.5"
              strokeDasharray={isCompleted ? 'none' : '3,3'}
            />
            {/* Đầu Mẹ nghiêng xuống */}
            <circle 
              cx="54" 
              cy="36" 
              r="7.5" 
              fill={isCompleted ? '#be123c' : (percent > 30 ? '#be123c' : '#94a3b8')} 
              opacity="0.85"
            />
            {/* Đầu Bé ngước lên hôn mẹ */}
            <circle 
              cx="44" 
              cy="46" 
              r="5.5" 
              fill={isCompleted ? '#be123c' : (percent > 30 ? '#be123c' : '#94a3b8')} 
              opacity="0.85"
            />
            {/* Vòng tay Mẹ ôm lấy bé */}
            <path
              d="M 52 43 C 50 49 46 54 41 57 C 37 60 45 66 52 64 C 58 62 61 52 58 45 Z"
              fill={isCompleted ? '#e11d48' : (percent > 40 ? '#fb7185' : '#cbd5e1')}
              opacity="0.75"
            />
          </svg>
        </div>

        {/* Tranh ảnh hoàn chỉnh sắc nét bung nở khi đạt 100% */}
        {isCompleted && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 0 20px rgba(225, 29, 72, 0.4)',
            animation: 'fadeIn 0.6s ease forwards'
          }}>
            <img 
              src="/assets/mother_child_heart_2010.jpg" 
              alt="Mẹ Yêu Con 20/10" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(0deg, rgba(136, 19, 55, 0.92) 0%, transparent 100%)',
              color: '#ffffff',
              textAlign: 'center',
              padding: '6px 4px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              ❤️ Mẹ Yêu Con - 20/10
            </div>
          </div>
        )}
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
            : `linear-gradient(90deg, ${teamColor}, #f43f5e)`,
          borderRadius: '3px',
          transition: 'width 0.4s ease'
        }} />
      </div>
    </div>
  );
});

// Component Thẻ Câu Hỏi & 4 Đáp Án dành cho tương tác Touch hoặc Teacher
const QuestionInteractivePanel = React.memo(({
  question,
  onSelectOption,
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
        fontWeight: 700
      }}>
        Đã hoàn thành toàn bộ câu hỏi!
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? '8px' : '14px',
      width: '100%'
    }}>
      {/* Tiêu đề câu hỏi */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
        border: '1.5px solid #fecdd3',
        borderRadius: compact ? '14px' : '20px',
        padding: compact ? '12px 14px' : '18px 22px',
        boxShadow: '0 4px 15px rgba(225, 29, 72, 0.06)'
      }}>
        {teamLabel && (
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#be123c',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            {teamLabel}
          </div>
        )}
        <h3 style={{
          margin: 0,
          fontSize: compact ? '0.98rem' : '1.25rem',
          fontWeight: 800,
          color: '#1e293b',
          lineHeight: 1.45
        }}>
          {question.question}
        </h3>
      </div>

      {/* Lưới 4 đáp án A, B, C, D */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr 1fr' : '1fr 1fr',
        gap: compact ? '8px' : '12px'
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
              onClick={() => !disabled && onSelectOption(label)}
              disabled={disabled || answerState !== null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: compact ? '8px' : '12px',
                padding: compact ? '10px 12px' : '14px 18px',
                borderRadius: compact ? '12px' : '16px',
                background: btnBg,
                border: `2px solid ${borderCol}`,
                color: textCol,
                boxShadow: shadow,
                cursor: (disabled || answerState !== null) ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                outline: 'none',
                minHeight: compact ? '48px' : '62px'
              }}
            >
              <div style={{
                width: compact ? '26px' : '34px',
                height: compact ? '26px' : '34px',
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
                fontSize: compact ? '0.85rem' : '1.05rem',
                flexShrink: 0
              }}>
                {label}
              </div>
              <span style={{
                fontWeight: 700,
                fontSize: compact ? '0.88rem' : '1.02rem',
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

export function HeartPuzzle2010Game({ 
  questions: propQuestions = [], 
  teams = [], 
  onAddPoints, 
  onClose 
}) {
  // Chế độ chơi: 'dual-touch' (2 đội chạm song song) | 'teacher-led' (Giáo viên chiếu và bấm)
  const [gameMode, setGameMode] = useState('dual-touch');
  
  // Số lượng đội (ở chế độ teacher-led có thể chọn 1, 2, 3, 4 đội)
  const [teamCount, setTeamCount] = useState(2);

  // Danh sách câu hỏi sử dụng
  const [customQuestions, setCustomQuestions] = useState(null);
  const activeQuestionsList = (Array.isArray(customQuestions) && customQuestions.length > 0)
    ? customQuestions
    : ((Array.isArray(propQuestions) && propQuestions.length > 0) ? propQuestions : DEFAULT_2010_QUESTIONS);

  // Quản lý âm thanh
  const [soundMuted, setSoundMuted] = useState(false);

  // Đếm ngược thời gian (cho cả trận hoặc cho từng câu hỏi)
  const [matchDuration, setMatchDuration] = useState(120);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Màu sắc đại diện cho các đội
  const TEAM_COLORS = ['#e11d48', '#2563eb', '#10b981', '#f59e0b'];
  const DEFAULT_TEAM_NAMES = ['Đội Hoa Hồng', 'Đội Hoa Sen', 'Đội Hướng Dương', 'Đội Hoa Lan'];

  // Khởi tạo trạng thái cho các đội
  const [teamStates, setTeamStates] = useState(() => [
    {
      id: 0,
      name: (teams && teams[0]?.name) || DEFAULT_TEAM_NAMES[0],
      color: TEAM_COLORS[0],
      score: 0,
      answeredCount: 0,
      currentQIdx: 0,
      selectedOption: null,
      answerState: null,
      questions: [...activeQuestionsList].sort(() => 0.5 - Math.random())
    },
    {
      id: 1,
      name: (teams && teams[1]?.name) || DEFAULT_TEAM_NAMES[1],
      color: TEAM_COLORS[1],
      score: 0,
      answeredCount: 0,
      currentQIdx: 0,
      selectedOption: null,
      answerState: null,
      questions: [...activeQuestionsList].sort(() => 0.5 - Math.random())
    }
  ]);

  // Đội đang có lượt (dành riêng cho chế độ Giáo viên chiếu 'teacher-led')
  const [activeTeacherTeamIdx, setActiveTeacherTeamIdx] = useState(0);
  // Câu hỏi chung hiện tại (cho chế độ Teacher-led)
  const [teacherQIdx, setTeacherQIdx] = useState(0);
  const [teacherSelectedOpt, setTeacherSelectedOpt] = useState(null);
  const [teacherAnswerState, setTeacherAnswerState] = useState(null); // 'correct' | 'wrong' | null

  // Đội thắng cuộc
  const [winner, setWinner] = useState(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const fireworksIntervalRef = useRef(null);

  // Pháo hoa ăn mừng rực rỡ
  const triggerVictoryFireworks = () => {
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      const end = Date.now() + 3000;
      fireworksIntervalRef.current = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(fireworksIntervalRef.current);
          return;
        }
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 350);
    } catch (e) {}
  };

  useEffect(() => {
    return () => {
      if (fireworksIntervalRef.current) clearInterval(fireworksIntervalRef.current);
    };
  }, []);

  // Timer trận đấu
  useEffect(() => {
    let timer = null;
    if (isTimerRunning && timeLeft > 0 && !winner) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerRunning(false);
            // Hết giờ -> Xét đội có tiến độ cao nhất thắng
            determineWinnerByTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft, winner]);

  // Khởi tạo hoặc cập nhật số đội khi đổi `teamCount` hoặc `gameMode`
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
          answeredCount: existing?.answeredCount || 0,
          currentQIdx: existing?.currentQIdx || 0,
          selectedOption: null,
          answerState: null,
          questions: existing?.questions?.length > 0 ? existing.questions : [...activeQuestionsList].sort(() => 0.5 - Math.random())
        });
      }
      return next;
    });
  }, [teamCount, gameMode, activeQuestionsList]);

  // Xét đội thắng khi hết giờ
  const determineWinnerByTimeout = () => {
    let bestTeam = teamStates[0];
    teamStates.forEach(t => {
      if (t.answeredCount > bestTeam.answeredCount) {
        bestTeam = t;
      }
    });
    setWinner(bestTeam);
    setShowVictoryModal(true);
    if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
    triggerVictoryFireworks();
  };

  // Reset Game
  const handleResetGame = () => {
    if (fireworksIntervalRef.current) clearInterval(fireworksIntervalRef.current);
    setWinner(null);
    setShowVictoryModal(false);
    setTimeLeft(matchDuration);
    setIsTimerRunning(true);
    setTeacherQIdx(0);
    setTeacherSelectedOpt(null);
    setTeacherAnswerState(null);

    setTeamStates(prev => prev.map(t => ({
      ...t,
      score: 0,
      answeredCount: 0,
      currentQIdx: 0,
      selectedOption: null,
      answerState: null,
      questions: [...activeQuestionsList].sort(() => 0.5 - Math.random())
    })));
  };

  // Xử lý học sinh trả lời ở Chế độ 1: 'dual-touch' (Bảng cảm ứng song song)
  const handleDualTouchAnswer = (teamIdx, optLabel) => {
    const team = teamStates[teamIdx];
    if (!team || team.answerState !== null || winner) return;

    const currentQ = team.questions[team.currentQIdx % team.questions.length];
    if (!currentQ) return;

    const isCorrect = optLabel === currentQ.correct;

    // Cập nhật trạng thái đang chọn
    setTeamStates(prev => prev.map((t, idx) => {
      if (idx !== teamIdx) return t;
      return {
        ...t,
        selectedOption: optLabel,
        answerState: isCorrect ? 'correct' : 'wrong'
      };
    }));

    if (isCorrect) {
      if (!soundMuted) try { SoundFX.correct(); } catch(e) {}
      if (onAddPoints) onAddPoints(teamIdx, 100);

      const nextAnswered = team.answeredCount + 1;
      const isTeamComplete = nextAnswered >= activeQuestionsList.length;

      setTimeout(() => {
        setTeamStates(prev => prev.map((t, idx) => {
          if (idx !== teamIdx) return t;
          return {
            ...t,
            score: t.score + 100,
            answeredCount: nextAnswered,
            currentQIdx: t.currentQIdx + 1,
            selectedOption: null,
            answerState: null
          };
        }));

        // Kiểm tra chiến thắng khi hoàn thành 100% trái tim
        if (isTeamComplete && !winner) {
          setWinner(team);
          setShowVictoryModal(true);
          setIsTimerRunning(false);
          if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
          triggerVictoryFireworks();
        }
      }, 700);
    } else {
      if (!soundMuted) try { SoundFX.wrong(); } catch(e) {}
      setTimeout(() => {
        setTeamStates(prev => prev.map((t, idx) => {
          if (idx !== teamIdx) return t;
          return {
            ...t,
            currentQIdx: t.currentQIdx + 1,
            selectedOption: null,
            answerState: null
          };
        }));
      }, 800);
    }
  };

  // Xử lý giáo viên bấm trả lời ở Chế độ 2: 'teacher-led' (Máy chiếu)
  const handleTeacherAnswer = (optLabel) => {
    if (teacherAnswerState !== null || winner) return;
    const currentQ = activeQuestionsList[teacherQIdx % activeQuestionsList.length];
    if (!currentQ) return;

    setTeacherSelectedOpt(optLabel);
    const isCorrect = optLabel === currentQ.correct;

    if (isCorrect) {
      setTeacherAnswerState('correct');
      if (!soundMuted) try { SoundFX.correct(); } catch(e) {}
      
      // Tô đỏ trái tim cho đội đang có lượt
      const targetTeam = teamStates[activeTeacherTeamIdx];
      if (targetTeam) {
        if (onAddPoints) onAddPoints(activeTeacherTeamIdx, 100);
        const nextAnswered = targetTeam.answeredCount + 1;

        setTeamStates(prev => prev.map((t, idx) => {
          if (idx !== activeTeacherTeamIdx) return t;
          return {
            ...t,
            score: t.score + 100,
            answeredCount: nextAnswered
          };
        }));

        if (nextAnswered >= activeQuestionsList.length && !winner) {
          setWinner(targetTeam);
          setShowVictoryModal(true);
          setIsTimerRunning(false);
          if (!soundMuted) try { SoundFX.fanfare(); } catch(e) {}
          triggerVictoryFireworks();
        }
      }

      setTimeout(() => {
        setTeacherAnswerState(null);
        setTeacherSelectedOpt(null);
        // Chuyển sang câu hỏi tiếp theo
        setTeacherQIdx(prev => (prev + 1) % activeQuestionsList.length);
        // Tự động xoay tua sang đội tiếp theo
        setActiveTeacherTeamIdx(prev => (prev + 1) % teamStates.length);
      }, 1200);
    } else {
      setTeacherAnswerState('wrong');
      if (!soundMuted) try { SoundFX.wrong(); } catch(e) {}
      setTimeout(() => {
        setTeacherAnswerState(null);
        setTeacherSelectedOpt(null);
      }, 1000);
    }
  };

  // Tải lên tệp câu hỏi mới
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseUploadedFile(file);
      if (parsed && parsed.length > 0) {
        setCustomQuestions(parsed);
        alert(`Đã nạp thành công ${parsed.length} câu hỏi mới cho Game Giải Mã 20/10!`);
        if (!soundMuted) try { SoundFX.correct(); } catch(e) {}
        handleResetGame();
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi đọc file câu hỏi');
      if (!soundMuted) try { SoundFX.wrong(); } catch(e) {}
    }
  };

  // Tải file mẫu Excel câu hỏi 20/10
  const handleDownloadSampleExcel = async () => {
    try {
      const XLSX = await getXLSX();
      const wsData = [
        ['STT', 'Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng', 'Giải thích'],
        ...DEFAULT_2010_QUESTIONS.map((q, idx) => [
          idx + 1,
          q.question,
          q.options[0] || '',
          q.options[1] || '',
          q.options[2] || '',
          q.options[3] || '',
          q.correct,
          q.explanation || ''
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cau_Hoi_20_10');
      XLSX.writeFile(wb, 'Mau_Cau_Hoi_Giai_Ma_Buc_Tranh_20_10.xlsx');
    } catch (e) {
      alert('Không thể tạo file Excel mẫu: ' + e.message);
    }
  };

  // Đổi tên đội
  const handleRenameTeam = (teamIdx, newName) => {
    setTeamStates(prev => prev.map((t, idx) => {
      if (idx !== teamIdx) return t;
      return { ...t, name: newName };
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#fff1f2',
      backgroundImage: 'radial-gradient(#fecdd3 1px, transparent 1px), radial-gradient(#ffe4e6 1px, #fff1f2 1px)',
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0, 12px 12px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* HEADER TOP BAR CHỦ ĐỀ 20/10 */}
      <div style={{
        background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #9f1239 100%)',
        color: '#ffffff',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(190, 18, 60, 0.25)',
        borderBottom: '2px solid #fb7185'
      }}>
        {/* Nút thoát & Tiêu đề */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            <ArrowLeft size={16} /> Thoát
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={20} fill="#ffffff" color="#ffffff" />
              <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '0.5px' }}>
                GIẢI MÃ BỨC TRANH 20/10 - MẸ YÊU CON
              </span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '2px 8px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 800
              }}>
                Chào Mừng Ngày Phụ Nữ Việt Nam
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#ffe4e6', fontStyle: 'italic', marginTop: '1px' }}>
              "Con dù lớn vẫn là con của mẹ / Đi hết đời lòng mẹ vẫn theo con."
            </div>
          </div>
        </div>

        {/* Chuyển đổi 2 Chế Độ Giao Diện */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '4px',
          borderRadius: '14px',
          gap: '4px'
        }}>
          <button
            onClick={() => setGameMode('dual-touch')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '10px',
              border: 'none',
              background: gameMode === 'dual-touch' ? '#ffffff' : 'transparent',
              color: gameMode === 'dual-touch' ? '#be123c' : '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: gameMode === 'dual-touch' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Touchpad size={16} /> 2 Đội Bảng Cảm Ứng (Song Song)
          </button>

          <button
            onClick={() => setGameMode('teacher-led')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '10px',
              border: 'none',
              background: gameMode === 'teacher-led' ? '#ffffff' : 'transparent',
              color: gameMode === 'teacher-led' ? '#be123c' : '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: gameMode === 'teacher-led' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Monitor size={16} /> Giáo Viên Chiếu (Máy Chiếu)
          </button>
        </div>

        {/* Bộ đếm thời gian & Công cụ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Đồng hồ trận đấu */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.18)',
            padding: '5px 12px',
            borderRadius: '20px',
            fontWeight: 800,
            fontSize: '0.9rem'
          }}>
            <Clock size={16} />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              title={isTimerRunning ? 'Tạm dừng đếm giờ' : 'Bắt đầu đếm giờ'}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Play size={13} fill={isTimerRunning ? '#ffffff' : 'none'} />
            </button>
          </div>

          {/* Âm thanh */}
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            title={soundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer'
            }}
          >
            {soundMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          {/* Làm mới trận đấu */}
          <button
            onClick={handleResetGame}
            title="Chơi lại từ đầu"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={17} />
          </button>

          {/* Tải tệp Excel câu hỏi */}
          <label
            title="Nạp bộ câu hỏi từ file Excel"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Upload size={17} />
            <input 
              type="file" 
              accept=".xlsx,.xls,.docx,.pdf,.txt" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
          </label>

          {/* Tải file mẫu Excel */}
          <button
            onClick={handleDownloadSampleExcel}
            title="Tải tệp Excel mẫu câu hỏi 20/10"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer'
            }}
          >
            <Download size={17} />
          </button>
        </div>
      </div>

      {/* KHÔNG GIAN NỘI DUNG CHÍNH (MAIN PLAY ARENA) */}
      <div style={{
        flex: 1,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* ================= OPTION 1: 2 ĐỘI BẢNG CẢM ỨNG (SONG SONG) ================= */}
        {gameMode === 'dual-touch' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            height: '100%',
            overflow: 'hidden'
          }}>
            {teamStates.slice(0, 2).map((team, idx) => {
              const currentQ = team.questions[team.currentQIdx % team.questions.length];
              const isComplete = team.answeredCount >= activeQuestionsList.length;

              return (
                <div
                  key={team.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 30px rgba(190, 18, 60, 0.08)',
                    border: `2px solid ${team.color}33`,
                    overflow: 'hidden'
                  }}
                >
                  {/* Trái tim & Thông tin đội */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <HeartMatrixView
                      answeredCount={team.answeredCount}
                      totalQuestions={activeQuestionsList.length}
                      isCompleted={isComplete}
                      teamColor={team.color}
                      teamName={team.name}
                      compact={true}
                    />
                  </div>

                  {/* Panel câu hỏi & 4 nút đáp án Touch đa điểm */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <QuestionInteractivePanel
                      question={currentQ}
                      onSelectOption={(opt) => handleDualTouchAnswer(idx, opt)}
                      selectedOption={team.selectedOption}
                      answerState={team.answerState}
                      disabled={isComplete || winner !== null}
                      compact={true}
                      teamLabel={`${team.name} (Câu ${team.currentQIdx + 1})`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= OPTION 2: GIÁO VIÊN CHIẾU (MÁY CHIẾU THÔNG THƯỜNG) ================= */}
        {gameMode === 'teacher-led' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: '12px',
            overflow: 'hidden'
          }}>
            {/* Thanh điều khiển số lượng đội và chọn đội trả lời */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
            }}>
              {/* Chọn số lượng đội */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#be123c" />
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#881337' }}>
                  SỐ ĐỘI THI ĐẤU:
                </span>
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setTeamCount(num)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      border: teamCount === num ? '2px solid #be123c' : '1px solid #cbd5e1',
                      background: teamCount === num ? '#be123c' : '#ffffff',
                      color: teamCount === num ? '#ffffff' : '#475569',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {num} Đội
                  </button>
                ))}
              </div>

              {/* Chỉ định Đội đang có quyền trả lời */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b' }}>
                  ĐỘI TRẢ LỜI CÂU NÀY:
                </span>
                {teamStates.map((team, idx) => (
                  <button
                    key={team.id}
                    onClick={() => setActiveTeacherTeamIdx(idx)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '10px',
                      border: activeTeacherTeamIdx === idx ? `2px solid ${team.color}` : '1.5px solid #e2e8f0',
                      background: activeTeacherTeamIdx === idx ? `${team.color}15` : '#ffffff',
                      color: activeTeacherTeamIdx === idx ? team.color : '#64748b',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: team.color }} />
                    {team.name}
                  </button>
                ))}
              </div>

              {/* Chuyển câu hỏi */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setTeacherQIdx(prev => (prev - 1 + activeQuestionsList.length) % activeQuestionsList.length)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}
                >
                  ◀ Câu trước
                </button>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#be123c' }}>
                  Câu {teacherQIdx + 1} / {activeQuestionsList.length}
                </span>
                <button
                  onClick={() => setTeacherQIdx(prev => (prev + 1) % activeQuestionsList.length)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}
                >
                  Câu tiếp theo ▶
                </button>
              </div>
            </div>

            {/* Khu vực giữa: Câu hỏi lớn ở trên & Hàng Trái Tim các đội ở dưới */}
            <div style={{
              flex: 1,
              display: 'grid',
              gridTemplateRows: 'auto 1fr',
              gap: '12px',
              overflow: 'hidden'
            }}>
              {/* Câu hỏi trung tâm to rõ ràng cho máy chiếu */}
              <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '16px 24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: '2px solid #fecdd3'
              }}>
                <QuestionInteractivePanel
                  question={activeQuestionsList[teacherQIdx % activeQuestionsList.length]}
                  onSelectOption={handleTeacherAnswer}
                  selectedOption={teacherSelectedOpt}
                  answerState={teacherAnswerState}
                  disabled={winner !== null}
                  compact={false}
                  teamLabel={`Lượt trả lời của: ${teamStates[activeTeacherTeamIdx]?.name || 'Đội chơi'}`}
                />
              </div>

              {/* Dãy Trái Tim của các đội thi đấu */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${teamStates.length}, 1fr)`,
                gap: '12px',
                overflow: 'hidden'
              }}>
                {teamStates.map((team, idx) => (
                  <div
                    key={team.id}
                    onClick={() => setActiveTeacherTeamIdx(idx)}
                    style={{
                      cursor: 'pointer',
                      transform: activeTeacherTeamIdx === idx ? 'scale(1.02)' : 'scale(1)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <HeartMatrixView
                      answeredCount={team.answeredCount}
                      totalQuestions={activeQuestionsList.length}
                      isCompleted={team.answeredCount >= activeQuestionsList.length}
                      teamColor={team.color}
                      teamName={team.name}
                      compact={teamStates.length > 2}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* POPUP CHIẾN THẮNG & VINH DANH HOÀN THÀNH 100% */}
      {showVictoryModal && winner && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          padding: '20px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
            borderRadius: '28px',
            padding: '32px 40px',
            maxWidth: '540px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(225, 29, 72, 0.4)',
            border: '3px solid #f59e0b',
            position: 'relative'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)'
            }}>
              <Trophy size={44} />
            </div>

            <div style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#be123c',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10
            </div>

            <h2 style={{
              margin: '8px 0',
              fontSize: '1.85rem',
              fontWeight: 900,
              color: '#881337'
            }}>
              🎉 {winner.name} CHIẾN THẮNG! 🎉
            </h2>

            <p style={{
              fontSize: '1.02rem',
              color: '#475569',
              margin: '0 0 20px 0',
              lineHeight: 1.5
            }}>
              Đã xuất sắc giải mã toàn bộ bức tranh trái tim <strong>"Mẹ Yêu Con"</strong> với thành tích tuyệt vời!
            </p>

            {/* Bức tranh hiện ra toàn bộ */}
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 25px rgba(225, 29, 72, 0.25)',
              marginBottom: '20px',
              maxHeight: '220px'
            }}>
              <img 
                src="/assets/mother_child_heart_2010.jpg" 
                alt="Bức Tranh 20/10" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{
              fontStyle: 'italic',
              color: '#be123c',
              fontWeight: 700,
              fontSize: '0.92rem',
              marginBottom: '24px'
            }}>
              "Con dù lớn vẫn là con của mẹ / Đi hết đời lòng mẹ vẫn theo con."
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleResetGame}
                style={{
                  padding: '12px 28px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(190, 18, 60, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RotateCcw size={18} /> Chơi Lại Trận Mới
              </button>

              <button
                onClick={() => setShowVictoryModal(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '14px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeartPuzzle2010Game;
