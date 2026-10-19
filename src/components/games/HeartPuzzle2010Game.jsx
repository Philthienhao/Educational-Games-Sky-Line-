// HeartPuzzle2010Game.jsx - Trò chơi Giải Mã Bức Tranh Trái Tim 20/10 Chuẩn Mực
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Heart, Trophy, Sparkles, Volume2, VolumeX, RotateCcw, Settings, 
  Upload, Download, Users, Monitor, Touchpad, CheckCircle2, XCircle, 
  ChevronRight, ChevronLeft, ArrowLeft, Maximize, Play, Award, Clock, Palette, RefreshCw,
  Shuffle, Layers, EyeOff, HelpCircle
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

// SVG Path đường bao trái tim chuẩn mực đối xứng (viewBox 0 0 400 380)
export const HEART_SVG_PATH = "M 200,120 C 170,45 60,45 60,145 C 60,225 135,285 200,355 C 265,285 340,225 340,145 C 340,45 230,45 200,120 Z";

/**
 * Thuật toán tọa độ các ô trái tim bí mật trên ma trận (Heart Coordinates)
 * Tạo hình trái tim đối xứng, chuẩn mực, khép kín theo chu trình vòng lặp
 */
export function getHeartCoordinates(N) {
  if (N === 10) {
    // Lưới 9 cột x 7 hàng (cols: 0..8, rows: 0..6)
    // 10 điểm theo thứ tự chu trình khép kín bao quanh viền trái tim:
    return [
      { col: 4, row: 5 }, // 0: Đáy nhọn trái tim
      { col: 2, row: 4 }, // 1: Cạnh chéo dưới trái
      { col: 1, row: 3 }, // 2: Sườn trái
      { col: 1, row: 2 }, // 3: Vai trên trái
      { col: 2, row: 1 }, // 4: Đỉnh múi tim trái
      { col: 4, row: 2 }, // 5: Khe giữa 2 múi tim
      { col: 6, row: 1 }, // 6: Đỉnh múi tim phải
      { col: 7, row: 2 }, // 7: Vai trên phải
      { col: 7, row: 3 }, // 8: Sườn phải
      { col: 6, row: 4 }  // 9: Cạnh chéo dưới phải
    ];
  }
  if (N === 15) {
    // Lưới 9 cột x 8 hàng (cols: 0..8, rows: 0..7)
    return [
      { col: 4, row: 7 }, // 0: Đáy nhọn trái tim
      { col: 3, row: 6 }, // 1: Cạnh chéo dưới trái 1
      { col: 2, row: 5 }, // 2: Cạnh chéo dưới trái 2
      { col: 1, row: 4 }, // 3: Sườn dưới trái
      { col: 1, row: 3 }, // 4: Sườn giữa trái
      { col: 1, row: 2 }, // 5: Vai trên trái
      { col: 2, row: 1 }, // 6: Đỉnh múi tim trái
      { col: 3, row: 2 }, // 7: Cạnh dốc vào khe trái
      { col: 5, row: 2 }, // 8: Cạnh dốc vào khe phải
      { col: 6, row: 1 }, // 9: Đỉnh múi tim phải
      { col: 7, row: 2 }, // 10: Vai trên phải
      { col: 7, row: 3 }, // 11: Sườn giữa phải
      { col: 7, row: 4 }, // 12: Sườn dưới phải
      { col: 6, row: 5 }, // 13: Cạnh chéo dưới phải 2
      { col: 5, row: 6 }  // 14: Cạnh chéo dưới phải 1
    ];
  }

  // Thuật toán tham số (Parametric Heart) dự phòng cho N bất kỳ
  const cols = N <= 10 ? 9 : (N <= 15 ? 9 : 11);
  const rows = N <= 10 ? 7 : (N <= 15 ? 8 : 10);
  const pts = [];
  for (let i = 0; i < N; i++) {
    const t = (2 * Math.PI * i) / N;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    pts.push({ x, y });
  }
  const minX = Math.min(...pts.map(p => p.x)), maxX = Math.max(...pts.map(p => p.x));
  const minY = Math.min(...pts.map(p => p.y)), maxY = Math.max(...pts.map(p => p.y));
  const used = new Set();
  const res = [];
  for (const p of pts) {
    let c = Math.round(1 + ((p.x - minX) / (maxX - minX || 1)) * (cols - 3));
    let r = Math.round(1 + ((p.y - minY) / (maxY - minY || 1)) * (rows - 3));
    c = Math.max(0, Math.min(cols - 1, c));
    r = Math.max(0, Math.min(rows - 1, r));
    while (used.has(`${c},${r}`)) {
      c = (c + 1) % cols;
      if (c === 0) r = (r + 1) % rows;
    }
    used.add(`${c},${r}`);
    res.push({ col: c, row: r });
  }
  return res;
}

/**
 * Chuẩn hóa đáp án đúng (A, B, C, D) an toàn tuyệt đối 100%
 * Hỗ trợ mọi định dạng: 'A', 'a', 1, '1', 'A. ...', 'Đáp án B', hoặc so khớp nội dung
 */
export function getCorrectLetter(question) {
  if (!question) return 'A';
  const raw = String(question.correct || '').trim();
  if (!raw) return 'A';

  const upper = raw.toUpperCase();
  if (['A', 'B', 'C', 'D'].includes(upper)) return upper;

  if (upper === '1') return 'A';
  if (upper === '2') return 'B';
  if (upper === '3') return 'C';
  if (upper === '4') return 'D';

  const m = upper.match(/^([A-D])[\.\:\)\-\s]/);
  if (m) return m[1];

  const mVn = upper.match(/(?:ĐÁP ÁN|PHƯƠNG ÁN|CÂU|CHỌN)\s*([A-D])/);
  if (mVn) return mVn[1];

  if (Array.isArray(question.options)) {
    const rawClean = raw.toLowerCase().trim();
    const optIdx = question.options.findIndex(opt => {
      const oStr = String(opt || '').toLowerCase().trim();
      return oStr === rawClean || oStr.replace(/^[a-d][\.\:\)\-\s]+/i, '').trim() === rawClean;
    });
    if (optIdx >= 0 && optIdx < 4) {
      return ['A', 'B', 'C', 'D'][optIdx];
    }
  }

  return 'A';
}

/**
 * Thuật toán sinh Ma Trận Bí Mật Ẩn Trái Tim (Unified Heart Matrix):
 * - Toàn bộ ô nhìn giống hệt nhau khi chưa lật (ô trắng viền thanh mảnh, hiện mã đáp án lộn xộn)
 * - Đúng N câu hỏi = Đúng N ô mục tiêu tạo thành trái tim
 * - Các ô còn lại là ô nhiễu (decoy cells) chứa đáp án sai
 */
export function buildUnifiedMatrix(questions, teamIdx = 0, shuffledOrder = null) {
  const N = Math.max(1, questions.length);
  const cols = N <= 10 ? 9 : (N <= 15 ? 9 : 11);
  const rows = N <= 10 ? 7 : (N <= 15 ? 8 : 10);

  const heartCoords = getHeartCoordinates(N);

  const order = Array.isArray(shuffledOrder) && shuffledOrder.length === N
    ? shuffledOrder
    : Array.from({ length: N }, (_, i) => i);

  const targetMap = new Map();
  for (let slot = 0; slot < N; slot++) {
    const coord = heartCoords[slot];
    if (!coord) continue;
    const qIdx = order[slot];
    const q = questions[qIdx] || questions[0];
    const qNum = qIdx + 1;
    const correctOpt = getCorrectLetter(q);
    const code = `${qNum}-${correctOpt}`;
    targetMap.set(`${coord.col},${coord.row}`, {
      col: coord.col,
      row: coord.row,
      slotIdx: slot,
      qIdx,
      qNum,
      correctOpt,
      code,
      isTarget: true
    });
  }

  const optionLetters = ['A', 'B', 'C', 'D'];
  const grid = [];
  const seed = (teamIdx + 1) * 31;

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const key = `${c},${r}`;
      if (targetMap.has(key)) {
        row.push(targetMap.get(key));
      } else {
        const decoyQIdx = (r * 5 + c * 3 + seed) % N;
        const q = questions[decoyQIdx] || questions[0];
        const correctOpt = getCorrectLetter(q);
        const wrongOpts = optionLetters.filter(opt => opt !== correctOpt);
        const chosenWrong = wrongOpts[(r * 7 + c * 11 + seed) % wrongOpts.length] || (correctOpt === 'A' ? 'B' : 'A');
        const qNum = decoyQIdx + 1;
        const code = `${qNum}-${chosenWrong}`;
        row.push({
          col: c,
          row: r,
          slotIdx: -1,
          qIdx: -1,
          decoyQIdx,
          chosenWrong,
          code,
          isTarget: false
        });
      }
    }
    grid.push(row);
  }

  // Đường viền SVG khép kín nối tâm các ô trái tim (viewBox 0 0 100 100)
  const pathParts = [];
  for (let idx = 0; idx < heartCoords.length; idx++) {
    const coord = heartCoords[idx];
    const cx = ((coord.col + 0.5) / cols) * 100;
    const cy = ((coord.row + 0.5) / rows) * 100;
    const prefix = idx === 0 ? 'M' : 'L';
    pathParts.push(`${prefix} ${cx.toFixed(1)} ${cy.toFixed(1)}`);
  }
  pathParts.push('Z');
  const heartLoopSvgPath = pathParts.join(' ');

  return { grid, cols, rows, heartCoords, heartLoopSvgPath };
}

/**
 * Thuật toán sinh lưới các ô nền (decoy cells) bao quanh trái tim (dành cho chế độ strips/mosaic)
 */
export function buildDecoyGrid(questions, rows = 12, cols = 14) {
  const numQ = Math.max(1, questions.length);
  const optionLetters = ['A', 'B', 'C', 'D'];
  const grid = [];

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const qIdx = (r * 7 + c * 3 + 1) % numQ;
      const q = questions[qIdx] || questions[0];
      const correctOpt = getCorrectLetter(q);
      const wrongOpts = optionLetters.filter(opt => opt !== correctOpt);
      const chosenWrong = wrongOpts[(r * 5 + c * 2) % wrongOpts.length] || (correctOpt === 'A' ? 'B' : 'A');
      const qNum = qIdx + 1;
      const code = `${qNum}-${chosenWrong}`;
      row.push({ r, c, code, qIdx, isTarget: false });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Thuật toán phân bổ các mảnh ghép trái tim:
 * ĐÚNG 1 CÂU HỎI = 1 Ô/MẢNH GHÉP DUY NHẤT TRONG TRÁI TIM!
 */
export function buildHeartPieces(questions, layoutMode = 'strips', shuffledOrder = null) {
  const N = Math.max(1, questions.length);
  const pieces = [];

  const Y_TOP = 48;
  const Y_BOTTOM = 355;
  const TOTAL_H = Y_BOTTOM - Y_TOP;

  const order = Array.isArray(shuffledOrder) && shuffledOrder.length === N
    ? shuffledOrder
    : Array.from({ length: N }, (_, i) => i);

  if (layoutMode === 'mosaic') {
    let rowCounts = [1];
    if (N === 2) rowCounts = [1, 1];
    else if (N === 3) rowCounts = [2, 1];
    else if (N === 4) rowCounts = [2, 2];
    else if (N === 5) rowCounts = [2, 2, 1];
    else if (N <= 7) rowCounts = [2, N - 4, 2];
    else if (N <= 10) rowCounts = [2, Math.ceil((N - 3) * 0.55), Math.floor((N - 3) * 0.45), 1];
    else if (N <= 14) rowCounts = [2, 4, N - 8, 2];
    else if (N <= 18) rowCounts = [2, 4, N - 9, 2, 1];
    else {
      const r1 = 2;
      const r2 = Math.round(N * 0.28);
      const r3 = Math.round(N * 0.32);
      const r4 = Math.round(N * 0.24);
      const r5 = Math.max(1, N - r1 - r2 - r3 - r4);
      rowCounts = [r1, r2, r3, r4, r5];
    }

    const R = rowCounts.length;
    const rowH = TOTAL_H / R;
    let slotIdx = 0;

    for (let r = 0; r < R; r++) {
      const countInRow = rowCounts[r];
      const yStart = Y_TOP + r * rowH;
      const blockW = 340 / countInRow;

      for (let c = 0; c < countInRow; c++) {
        if (slotIdx >= N) break;
        const qIdx = order[slotIdx];
        const q = questions[qIdx] || questions[0];
        const qNum = qIdx + 1;
        const correctOpt = getCorrectLetter(q);
        const code = `${qNum}-${correctOpt}`;

        const xStart = 30 + c * blockW;
        const cx = xStart + blockW / 2;
        const cy = yStart + rowH / 2;

        pieces.push({
          slotIdx,
          qIdx,
          qNum,
          correctOpt,
          code,
          x: xStart + 2,
          y: yStart + 2,
          width: blockW - 4,
          height: rowH - 4,
          cx,
          cy,
          isTopLobe: r === 0 && countInRow === 2,
          isTarget: true
        });
        slotIdx++;
      }
    }
  } else {
    // CHẾ ĐỘ DẢI NGANG (HORIZONTAL STRIPS)
    const stripH = TOTAL_H / N;

    for (let slotIdx = 0; slotIdx < N; slotIdx++) {
      const qIdx = order[slotIdx];
      const q = questions[qIdx] || questions[0];
      const qNum = qIdx + 1;
      const correctOpt = getCorrectLetter(q);
      const code = `${qNum}-${correctOpt}`;

      const y = Y_TOP + slotIdx * stripH;
      const isTopLobe = y < 125;

      pieces.push({
        slotIdx,
        qIdx,
        qNum,
        correctOpt,
        code,
        x: 40,
        y: y + 1.2,
        width: 320,
        height: Math.max(12, stripH - 2.4),
        cx: 200,
        cy: y + stripH / 2,
        isTopLobe,
        stripH,
        isTarget: true
      });
    }
  }

  return pieces;
}

/**
 * Tạo danh sách thứ tự câu hỏi ngẫu nhiên cho từng đội (Chống nhìn lén / Chống chép bài)
 */
export function generateTeamSequences(numQuestions, count = 2) {
  const sequences = [];
  const N = Math.max(1, numQuestions);

  for (let teamIdx = 0; teamIdx < count; teamIdx++) {
    const seq = Array.from({ length: N }, (_, i) => i);
    for (let i = seq.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [seq[i], seq[j]] = [seq[j], seq[i]];
    }

    if (teamIdx === 1 && sequences[0] && seq[0] === sequences[0][0] && N > 1) {
      const swapIdx = (1 % N);
      [seq[0], seq[swapIdx]] = [seq[swapIdx], seq[0]];
    }

    sequences.push(seq);
  }
  return sequences;
}

/**
 * COMPONENT TỜ PHIẾU BÀI TẬP "GIẢI MÃ BỨC TRANH"
 * TẤT CẢ CÁC Ô ĐỀU CÓ THỂ CHẠM VÀO: ĐÚNG THÌ HIỆN ĐỎ, SAI KHÔNG HIỆN GÌ CẢ!
 */
export const WorksheetPuzzleView = React.memo(({
  teamId = 0,
  teamName = 'Đội Chơi',
  teamColor = '#e11d48',
  matrixData = null,
  heartPieces = [],
  decoyGrid = [],
  correctQuestionIndices = [],
  totalQuestions = 15,
  isCompleted = false,
  compact = false,
  onCellClick = null
}) => {
  const correctCount = correctQuestionIndices.length;
  const percent = Math.min(100, Math.round((correctCount / Math.max(1, totalQuestions)) * 100));
  const answeredSet = useMemo(() => new Set(correctQuestionIndices), [correctQuestionIndices]);

  const clipId = `heart-clip-team-${teamId}`;
  const gradId = `heart-grad-team-${teamId}`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      borderRadius: '14px',
      padding: '8px 12px',
      boxShadow: isCompleted 
        ? `0 10px 30px ${teamColor}35, 0 0 16px rgba(245, 158, 11, 0.35)` 
        : '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: isCompleted ? '2.5px solid #f59e0b' : '1.5px solid #e2e8f0',
      width: '100%',
      flexShrink: 0,
      margin: '0 auto',
      transition: 'all 0.3s ease',
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      {/* Huy hiệu chiến thắng hoàn thành */}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '12px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
          color: '#ffffff',
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '0.74rem',
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)',
          zIndex: 10
        }}>
          <Sparkles size={13} /> GIẢI MÃ HOÀN TẤT (100%)
        </div>
      )}

      {/* Header Tờ Phiếu Bài Tập Tinh Gọn */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `2.5px solid ${teamColor || '#0f172a'}`,
        paddingBottom: '4px',
        marginBottom: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: teamColor || '#0f172a',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: 'clamp(0.85rem, 1.2vw, 1.05rem)',
            padding: '2px 10px',
            borderRadius: '5px',
            letterSpacing: '0.4px'
          }}>
            {teamName}
          </span>
          <span style={{
            fontSize: 'clamp(0.72rem, 1vw, 0.88rem)',
            color: '#64748b',
            fontWeight: 700
          }}>
            Chạm ô đúng để tô đỏ trái tim
          </span>
        </div>

        <div style={{
          fontWeight: 900,
          color: isCompleted ? '#059669' : (teamColor || '#be123c'),
          background: isCompleted ? '#d1fae5' : '#fff1f2',
          padding: '2px 10px',
          borderRadius: '6px',
          fontSize: 'clamp(0.78rem, 1.1vw, 0.95rem)',
          border: '1.5px solid #fecdd3'
        }}>
          {correctCount}/{totalQuestions} câu ({percent}%)
        </div>
      </div>

      {/* KHUNG ARENA GIẢI MÃ: BẢNG MA TRẬN Ô ĐÁP ÁN LỘN XỘN (CHUẨN YÊU CẦU NGƯỜI DÙNG) */}
      {matrixData ? (
        <div style={{
          position: 'relative',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: `repeat(${matrixData.cols}, 1fr)`,
          gridTemplateRows: `repeat(${matrixData.rows}, 1fr)`,
          gap: 'clamp(2.5px, 0.35vw, 4.5px)',
          background: '#f1f5f9',
          padding: '6px',
          borderRadius: '10px',
          border: '1.5px solid #cbd5e1',
          boxSizing: 'border-box'
        }}>
          {matrixData.grid.map((row, rIdx) => 
            row.map((cell, cIdx) => {
              const isAnswered = cell.isTarget && answeredSet.has(cell.qIdx);
              return (
                <div
                  key={`${rIdx}_${cIdx}`}
                  onClick={() => onCellClick && onCellClick(cell)}
                  style={{
                    background: isAnswered 
                      ? `linear-gradient(135deg, ${teamColor || '#ef4444'} 0%, #be123c 100%)` 
                      : '#ffffff',
                    color: isAnswered ? '#ffffff' : '#1e293b',
                    border: isAnswered ? '2px solid #b91c1c' : '1.5px solid #cbd5e1',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    fontSize: 'clamp(11.5px, 1.4vw, 15.5px)',
                    fontWeight: 900,
                    cursor: isAnswered ? 'default' : 'pointer',
                    userSelect: 'none',
                    height: 'clamp(28px, 4.2vh, 38px)',
                    boxShadow: isAnswered ? `0 0 12px ${teamColor || '#ef4444'}95` : '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isAnswered ? 'scale(1.04)' : 'scale(1)',
                    zIndex: isAnswered ? 2 : 1
                  }}
                >
                  <span>{cell.code}</span>
                  {isAnswered && <Heart size={13} fill="#ffffff" color="#ffffff" />}
                </div>
              );
            })
          )}

          {/* SVG đường viền hào quang nối các ô trái tim khi giải mã xong 100% */}
          {isCompleted && matrixData.heartLoopSvgPath && (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10
              }}
            >
              <path
                d={matrixData.heartLoopSvgPath}
                fill="rgba(244, 63, 94, 0.12)"
                stroke="#f59e0b"
                strokeWidth="3.2"
                strokeLinejoin="round"
                filter="drop-shadow(0 0 6px #f59e0b)"
              />
            </svg>
          )}
        </div>
      ) : (
        /* CHẾ ĐỘ DẢI NGANG / MOSAIC CŨ (NẾU GIÁO VIÊN CHỌN TRONG MENU) */
        <div style={{
          position: 'relative',
          width: '100%',
          height: compact ? 'clamp(180px, 28vh, 250px)' : 'clamp(240px, 35vh, 340px)',
          aspectRatio: '1 / 0.95',
          margin: '0 auto',
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '8px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(14, 1fr)',
            gridTemplateRows: 'repeat(12, 1fr)',
            gap: '1px',
            background: '#e2e8f0',
            opacity: 0.85
          }}>
            {decoyGrid.map((row, rIdx) => 
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}_${cIdx}`}
                  onClick={() => onCellClick && onCellClick(cell)}
                  style={{
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: compact ? '7.5px' : '9px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {cell.code}
                </div>
              ))
            )}
          </div>

          <svg
            viewBox="0 0 400 380"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            <defs>
              <clipPath id={clipId}>
                <path d={HEART_SVG_PATH} />
              </clipPath>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={teamColor || '#e11d48'} />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
            </defs>

            <g clipPath={`url(#${clipId})`} style={{ pointerEvents: 'auto' }}>
              {heartPieces.map((piece) => {
                const isCorrect = answeredSet.has(piece.qIdx);
                const fontSize = piece.height > 24 ? '13px' : '10px';
                return (
                  <g 
                    key={`piece-${piece.slotIdx ?? piece.qIdx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCellClick) onCellClick(piece);
                    }}
                    style={{ cursor: isCorrect ? 'default' : 'pointer' }}
                  >
                    <rect
                      x={piece.x}
                      y={piece.y}
                      width={piece.width}
                      height={piece.height}
                      rx="3"
                      fill={isCorrect ? `url(#${gradId})` : '#ffffff'}
                      stroke={isCorrect ? '#ffffff' : '#cbd5e1'}
                      strokeWidth="1.2"
                    />
                    <text
                      x={piece.cx}
                      y={piece.cy + 4}
                      textAnchor="middle"
                      fill={isCorrect ? '#ffffff' : '#334155'}
                      fontSize={fontSize}
                      fontWeight="900"
                      style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                      {piece.code}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      )}

      {/* Khung Thơ Ca Dao & Lời Chúc Mẹ 20/10 ở góc dưới */}
      <div style={{
        marginTop: compact ? '3px' : '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: compact ? '0.64rem' : '0.74rem',
        color: '#be123c',
        fontWeight: 700,
        padding: '0 2px'
      }}>
        <span style={{ fontStyle: 'italic', color: '#881337' }}>“ Nghĩa mẹ như nước trong nguồn chảy ra ”</span>
        <span>💖 20/10</span>
      </div>

      {/* Thanh tiến độ bên dưới */}
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: '#f1f5f9',
        borderRadius: '2px',
        marginTop: compact ? '3px' : '6px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          background: isCompleted 
            ? 'linear-gradient(90deg, #f59e0b, #ef4444)' 
            : `linear-gradient(90deg, ${teamColor || '#e11d48'}, #f43f5e)`,
          borderRadius: '2px',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
});

/**
 * COMPONENT THẺ CÂU HỎI & 4 ĐÁP ÁN (TƯƠNG TÁC RÕ RÀNG, CHỌN ĐƯỢC CẢ Ở ĐÂY VÀ TRÊN BẢNG)
 */
const QuestionPanel = React.memo(({
  question,
  stepNumber = 1,
  originalQNum = 1,
  totalQuestions = 15,
  onPrevQuestion,
  onNextQuestion,
  compact = false,
  teamLabel = '',
  teamColor = '#e11d48',
  onOptionSelect = null
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
        🎉 Đã hoàn thành toàn bộ câu hỏi!
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%',
      flexShrink: 0
    }}>
      {/* Khung nội dung câu hỏi */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
        border: '1.5px solid #fecdd3',
        borderRadius: '10px',
        padding: '5px 12px',
        boxShadow: '0 4px 15px rgba(225, 29, 72, 0.06)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: teamColor || '#be123c',
              color: '#ffffff',
              fontSize: 'clamp(0.82rem, 1.15vw, 0.96rem)',
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              Câu #{originalQNum}
            </span>
            <span style={{
              fontSize: 'clamp(0.75rem, 1vw, 0.88rem)',
              fontWeight: 700,
              color: '#64748b'
            }}>
              (Tiến độ {stepNumber}/{totalQuestions})
            </span>
          </div>

          {/* Nút Điều Hướng Câu Hỏi Nhanh (Trước / Sau) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onPrevQuestion && (
              <button
                onClick={(e) => { e.stopPropagation(); onPrevQuestion(); }}
                disabled={stepNumber <= 1}
                style={{
                  background: 'rgba(225, 29, 72, 0.08)',
                  border: '1px solid #fecdd3',
                  color: '#be123c',
                  padding: '2px 8px',
                  borderRadius: '5px',
                  cursor: stepNumber <= 1 ? 'default' : 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  opacity: stepNumber <= 1 ? 0.4 : 1
                }}
              >
                ◀ Trước
              </button>
            )}

            {onNextQuestion && (
              <button
                onClick={(e) => { e.stopPropagation(); onNextQuestion(); }}
                disabled={stepNumber >= totalQuestions}
                style={{
                  background: 'rgba(225, 29, 72, 0.08)',
                  border: '1px solid #fecdd3',
                  color: '#be123c',
                  padding: '2px 8px',
                  borderRadius: '5px',
                  cursor: stepNumber >= totalQuestions ? 'default' : 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  opacity: stepNumber >= totalQuestions ? 0.4 : 1
                }}
              >
                Sau ▶
              </button>
            )}
          </div>
        </div>

        <h3 style={{
          margin: 0,
          fontSize: 'clamp(0.92rem, 1.3vw, 1.16rem)',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1.35
        }}>
          {question.question}
        </h3>
      </div>

      {/* Lưới 4 đáp án A, B, C, D: CHỌN ĐƯỢC TRỰC TIẾP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px'
      }}>
        {question.options?.map((opt, idx) => {
          const label = optionLabels[idx] || String.fromCharCode(65 + idx);

          return (
            <button
              key={idx}
              onClick={() => onOptionSelect && onOptionSelect(label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                cursor: onOptionSelect ? 'pointer' : 'default',
                userSelect: 'none',
                minHeight: 'clamp(34px, 4.6vh, 44px)',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (onOptionSelect) {
                  e.currentTarget.style.borderColor = teamColor || '#e11d48';
                  e.currentTarget.style.background = '#fff5f7';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(225, 29, 72, 0.12)';
                }
              }}
              onMouseLeave={(e) => {
                if (onOptionSelect) {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                }
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(225, 29, 72, 0.12)',
                color: teamColor || '#be123c',
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
            </button>
          );
        })}
      </div>
    </div>
  );
});

const TEAM_COLORS = ['#e11d48', '#2563eb', '#10b981', '#f59e0b'];
const DEFAULT_TEAM_NAMES = ['Đội 1 (Đỏ)', 'Đội 2 (Xanh)', 'Đội 3 (Lục)', 'Đội 4 (Vàng)'];

/**
 * COMPONENT CHÍNH: GAME GIẢI MÃ BỨC TRANH TRÁI TIM 20/10
 */
export function HeartPuzzle2010Game({ 
  questions: propQuestions = [], 
  teams = [], 
  onAddPoints, 
  onClose 
}) {
  const [gameMode, setGameMode] = useState('dual-touch');
  const [layoutMode, setLayoutMode] = useState('matrix');
  const [teamCount, setTeamCount] = useState(2);

  const [customQuestions, setCustomQuestions] = useState(null);
  const activeQuestionsList = useMemo(() => {
    if (Array.isArray(customQuestions) && customQuestions.length > 0) return customQuestions;
    if (Array.isArray(propQuestions) && propQuestions.length > 0) return propQuestions;
    return DEFAULT_2010_QUESTIONS;
  }, [customQuestions, propQuestions]);

  const [soundMuted, setSoundMuted] = useState(false);

  // Khởi tạo trạng thái cho các đội với chuỗi câu hỏi xáo trộn độc lập (Chống nhìn lén!)
  // VÀ thứ tự các mảnh ghép trong trái tim cũng được xáo trộn lộn xộn riêng cho từng đội!
  const [teamStates, setTeamStates] = useState(() => {
    const sequences = generateTeamSequences(activeQuestionsList.length, 4);
    const pieceOrders = generateTeamSequences(activeQuestionsList.length, 4);

    return [0, 1, 2, 3].map(i => ({
      id: i,
      name: (teams && teams[i]?.name) || DEFAULT_TEAM_NAMES[i],
      color: TEAM_COLORS[i % TEAM_COLORS.length],
      score: 0,
      correctIndices: [],
      questionSequence: sequences[i] || Array.from({ length: activeQuestionsList.length }, (_, k) => k),
      pieceOrder: pieceOrders[i] || Array.from({ length: activeQuestionsList.length }, (_, k) => k),
      currentStep: 0
    }));
  });

  // Lưới Ma Trận Bí Mật Ẩn Trái Tim độc lập cho từng đội (Chuẩn yêu cầu: các ô lộn xộn, đúng kết nối thành trái tim)
  const teamMatrices = useMemo(() => {
    return teamStates.map((team, idx) => {
      return buildUnifiedMatrix(activeQuestionsList, idx, team.pieceOrder);
    });
  }, [teamStates, activeQuestionsList]);

  // Lưới các ô đáp án nhiễu mờ ảo xung quanh trái tim (dành cho strips/mosaic)
  const decoyGrid = useMemo(() => {
    return buildDecoyGrid(activeQuestionsList, 12, 14);
  }, [activeQuestionsList]);

  // Khi danh sách câu hỏi thay đổi hoặc thay đổi số đội -> Tạo lại thứ tự xáo trộn độc lập
  const resetTeamStates = useCallback((count = teamCount, questions = activeQuestionsList) => {
    const numTeams = gameMode === 'dual-touch' ? 2 : count;
    const sequences = generateTeamSequences(questions.length, numTeams);
    const pieceOrders = generateTeamSequences(questions.length, numTeams);

    setTeamStates(prev => {
      const next = [];
      for (let i = 0; i < numTeams; i++) {
        const existing = prev[i];
        next.push({
          id: i,
          name: existing?.name || (teams && teams[i]?.name) || DEFAULT_TEAM_NAMES[i] || `Đội ${i + 1}`,
          color: TEAM_COLORS[i % TEAM_COLORS.length],
          score: 0,
          correctIndices: [],
          questionSequence: sequences[i] || Array.from({ length: questions.length }, (_, k) => k),
          pieceOrder: pieceOrders[i] || Array.from({ length: questions.length }, (_, k) => k),
          currentStep: 0
        });
      }
      return next;
    });
  }, [gameMode, teamCount, activeQuestionsList, teams]);

  useEffect(() => {
    resetTeamStates(teamCount, activeQuestionsList);
  }, [teamCount, gameMode, activeQuestionsList.length]);

  // Tạo danh sách mảnh ghép trái tim cho từng đội (đảm bảo vị trí ô lộn xộn riêng biệt)
  const teamHeartPieces = useMemo(() => {
    return teamStates.map(team => {
      return buildHeartPieces(activeQuestionsList, layoutMode, team.pieceOrder);
    });
  }, [teamStates, activeQuestionsList, layoutMode]);

  // Đội đang có lượt (cho chế độ Teacher-led)
  const [activeTeacherTeamIdx, setActiveTeacherTeamIdx] = useState(0);
  const [teacherQIdx, setTeacherQIdx] = useState(0);

  const [winner, setWinner] = useState(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const fireworksIntervalRef = useRef(null);

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

  // XỬ LÝ KHI ĐỘI CHẠM VÀO Ô TRÊN BẢNG / TRÁI TIM:
  // "nếu chọn đúng ô đó hiện lên màu đỏ, nếu chọn sai thì không có hiện gì cả"
  const handleTeamCellClick = (teamIdx, cell) => {
    const team = teamStates[teamIdx];
    if (!team || winner || !cell) return;

    // Lấy câu hỏi hiện tại đang hiển thị của đội
    let currentQIdx;
    if (gameMode === 'teacher-led') {
      currentQIdx = teacherQIdx;
    } else {
      const seq = team.questionSequence || [];
      currentQIdx = (seq[team.currentStep] !== undefined) ? seq[team.currentStep] : team.currentStep;
    }

    const currentQuestion = activeQuestionsList[currentQIdx];
    if (!currentQuestion) return;

    const qNum = currentQIdx + 1;
    const correctOpt = getCorrectLetter(currentQuestion);
    const targetCodeWithDash = `${qNum}-${correctOpt}`;
    const targetCodeNoDash = `${qNum}${correctOpt}`;
    const cellCodeClean = cell.code ? String(cell.code).toUpperCase().trim() : '';

    // Kiểm tra: Ô vừa chạm có đúng là ô chứa đáp án đúng của câu hỏi đang hiển thị hay không?
    const isCurrentMatch = (cell.isTarget && cell.qIdx === currentQIdx) || 
                           (cellCodeClean === targetCodeWithDash) || 
                           (cellCodeClean === targetCodeNoDash);

    let solvedQIdx = -1;
    if (isCurrentMatch) {
      solvedQIdx = currentQIdx;
    } else if (cell.isTarget && cell.qIdx !== undefined && cell.qIdx >= 0) {
      // Ô mục tiêu trái tim của một câu hỏi khác trong đề
      solvedQIdx = cell.qIdx;
    } else if (cellCodeClean) {
      // Tìm xem mã ô này có trùng khớp đáp án đúng của bất kỳ câu nào trong đề không
      const matchedIdx = activeQuestionsList.findIndex((q, i) => {
        const cOpt = getCorrectLetter(q);
        const cCode = `${i + 1}-${cOpt}`;
        const cCodeNoDash = `${i + 1}${cOpt}`;
        return cellCodeClean === cCode || cellCodeClean === cCodeNoDash;
      });
      if (matchedIdx !== -1) {
        solvedQIdx = matchedIdx;
      }
    }

    if (solvedQIdx !== -1) {
      // ĐÚNG Ô! Hiện lên màu đỏ
      if (!soundMuted) {
        try { SoundFX.correct(); } catch (e) {}
      }

      setTeamStates(prev => {
        const next = [...prev];
        const cur = { ...next[teamIdx] };

        if (!cur.correctIndices.includes(solvedQIdx)) {
          cur.correctIndices = [...cur.correctIndices, solvedQIdx];
          cur.score += 10;
        }

        // Tự động chuyển sang câu hỏi tiếp theo chưa làm sau 0.35s
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

            let nextStep = innerCur.currentStep;
            for (let step = 0; step < activeQuestionsList.length; step++) {
              const checkQIdx = innerCur.questionSequence[step];
              if (!innerCur.correctIndices.includes(checkQIdx)) {
                nextStep = step;
                break;
              }
            }
            innerCur.currentStep = nextStep;

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
        }, 350);

        next[teamIdx] = cur;
        return next;
      });
    } else {
      // CHỌN SAI Ô: "nếu chọn sai thì không có hiện gì cả"
      // Giữ nguyên trạng thái, không đổi màu đỏ
      if (!soundMuted) {
        try { SoundFX.click(); } catch (e) {}
      }
    }
  };

  // XỬ LÝ KHI ĐỘI CHỌN ĐÁP ÁN A, B, C, D Ở KHUNG CÂU HỎI BÊN DƯỚI
  const handleTeamOptionSelect = (teamIdx, selectedLabel) => {
    const team = teamStates[teamIdx];
    if (!team || winner) return;

    let currentQIdx;
    if (gameMode === 'teacher-led') {
      currentQIdx = teacherQIdx;
    } else {
      const seq = team.questionSequence || [];
      currentQIdx = (seq[team.currentStep] !== undefined) ? seq[team.currentStep] : team.currentStep;
    }

    const currentQuestion = activeQuestionsList[currentQIdx];
    if (!currentQuestion) return;

    const correctOpt = getCorrectLetter(currentQuestion);
    const isCorrect = String(selectedLabel).toUpperCase().trim() === correctOpt;

    if (isCorrect) {
      if (!soundMuted) {
        try { SoundFX.correct(); } catch (e) {}
      }

      setTeamStates(prev => {
        const next = [...prev];
        const cur = { ...next[teamIdx] };

        if (!cur.correctIndices.includes(currentQIdx)) {
          cur.correctIndices = [...cur.correctIndices, currentQIdx];
          cur.score += 10;
        }

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

            let nextStep = innerCur.currentStep;
            for (let step = 0; step < activeQuestionsList.length; step++) {
              const checkQIdx = innerCur.questionSequence[step];
              if (!innerCur.correctIndices.includes(checkQIdx)) {
                nextStep = step;
                break;
              }
            }
            innerCur.currentStep = nextStep;

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
      if (!soundMuted) {
        try { SoundFX.click(); } catch (e) {}
      }
    }
  };

  // Nút Giáo Viên Chấm Đúng trực tiếp (chế độ máy chiếu)
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
        alert(`Đã nhập thành công ${parsed.length} câu hỏi mới vào game! Trái tim đã được chia thành ${parsed.length} ô tương ứng!`);
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
    resetTeamStates(teamCount, activeQuestionsList);
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
        height: '44px',
        background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        flexShrink: 0
      }}>
        {/* Nút Thoát Game & Tiêu đề */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.82rem'
            }}
          >
            <ArrowLeft size={15} /> Thoát Game
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>💖</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.02rem', color: '#f43f5e' }}>
                GIẢI MÃ BỨC TRANH 20/10
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Đọc câu hỏi bên dưới ➔ Chạm đúng ô trên bảng để tô đỏ kết nối thành Trái Tim
              </div>
            </div>
          </div>
        </div>

        {/* Thanh chuyển chế độ chơi & Chọn Kiểu Trái Tim */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Chọn Kiểu Hiển Thị Trái Tim */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '3px 8px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            gap: '6px'
          }}>
            <Layers size={14} color="#fb7185" />
            <select
              value={layoutMode}
              onChange={(e) => {
                setLayoutMode(e.target.value);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="matrix" style={{ background: '#1e293b', color: '#fff' }}>
                ❤️ Ô Trái Tim Ẩn Giấu (Lộn Xộn Ma Trận - Chuẩn)
              </option>
              <option value="strips" style={{ background: '#1e293b', color: '#fff' }}>
                💖 Dải Ngang Trái Tim (1 Câu 1 Dải)
              </option>
              <option value="mosaic" style={{ background: '#1e293b', color: '#fff' }}>
                🧩 Khối Ghép Mảnh (Mosaic Blocks)
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
                padding: '5px 11px',
                borderRadius: '8px',
                border: 'none',
                background: gameMode === 'dual-touch' ? '#e11d48' : 'transparent',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <Touchpad size={14} /> Chạm 2 Đội (Bảng Cảm Ứng)
            </button>
            <button
              onClick={() => { setGameMode('teacher-led'); handleResetGame(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                borderRadius: '8px',
                border: 'none',
                background: gameMode === 'teacher-led' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <Monitor size={14} /> Máy Chiếu (Giáo Viên Điều Khiển)
            </button>
          </div>

          {/* Chọn Số Đội (nếu ở chế độ Máy Chiếu) */}
          {gameMode === 'teacher-led' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '3px 8px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <Users size={14} color="#94a3b8" />
              <span style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 700 }}>Số Đội:</span>
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => { setTeamCount(num); handleResetGame(); }}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: 'none',
                    background: teamCount === num ? '#2563eb' : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.74rem',
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
              padding: '5px 9px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.76rem'
            }}
          >
            <Download size={13} /> Mẫu Excel
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
              padding: '5px 9px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.76rem'
            }}
          >
            <Upload size={13} /> Nhập Excel
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          {/* Nút Reset & Âm Thanh */}
          <button
            onClick={handleResetGame}
            title="Xáo trộn lại và làm mới trận đấu"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            title={soundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: soundMuted ? '#f87171' : '#4ade80',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {soundMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* KHÔNG GIAN ĐẤU TRƯỜNG CHÍNH (ARENA) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '4px 8px 6px 8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        background: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 100%)',
        boxSizing: 'border-box',
        maxHeight: 'calc(100vh - 44px)'
      }}>
        {/* CHẾ ĐỘ 1: BẢNG CẢM ỨNG 2 ĐỘI (DUAL-TOUCH) */}
        {gameMode === 'dual-touch' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            alignItems: 'stretch',
            flex: 1,
            minHeight: 0,
            boxSizing: 'border-box'
          }}>
            {teamStates.slice(0, 2).map((team, teamIdx) => {
              const seq = team.questionSequence || [];
              const currentQIdx = (seq[team.currentStep] !== undefined) ? seq[team.currentStep] : team.currentStep;
              const currentQ = activeQuestionsList[currentQIdx] || activeQuestionsList[0];
              const isTeamCompleted = team.correctIndices.length >= activeQuestionsList.length;
              const pieces = teamHeartPieces[teamIdx] || [];
              const matrix = teamMatrices[teamIdx] || null;

              return (
                <div
                  key={team.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    gap: 'clamp(6px, 1.2vh, 12px)',
                    background: 'rgba(30, 41, 59, 0.75)',
                    border: `2px solid ${team.color}40`,
                    borderRadius: '14px',
                    padding: '8px 10px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                    boxSizing: 'border-box',
                    height: '100%',
                    minHeight: 0,
                    overflowY: 'auto'
                  }}
                >
                  {/* Tờ Phiếu Bài Tập Trái Tim: CHẠM TICK VÀO Ô ĐỂ TÔ ĐỎ */}
                  <WorksheetPuzzleView
                    teamId={team.id}
                    teamName={team.name}
                    teamColor={team.color}
                    matrixData={layoutMode === 'matrix' ? matrix : null}
                    heartPieces={pieces}
                    decoyGrid={decoyGrid}
                    correctQuestionIndices={team.correctIndices}
                    totalQuestions={activeQuestionsList.length}
                    isCompleted={isTeamCompleted}
                    compact={true}
                    onCellClick={(cell) => handleTeamCellClick(teamIdx, cell)}
                  />

                  {/* Bảng Câu Hỏi & 4 Đáp Án (CHỌN ĐƯỢC CẢ Ở ĐÂY VÀ TRÊN BẢNG) */}
                  {!isTeamCompleted ? (
                    <QuestionPanel
                      question={currentQ}
                      stepNumber={team.currentStep + 1}
                      originalQNum={currentQIdx + 1}
                      totalQuestions={activeQuestionsList.length}
                      onPrevQuestion={() => {
                        setTeamStates(prev => {
                          const next = [...prev];
                          next[teamIdx].currentStep = Math.max(0, next[teamIdx].currentStep - 1);
                          return next;
                        });
                      }}
                      onNextQuestion={() => {
                        setTeamStates(prev => {
                          const next = [...prev];
                          next[teamIdx].currentStep = Math.min(activeQuestionsList.length - 1, next[teamIdx].currentStep + 1);
                          return next;
                        });
                      }}
                      compact={true}
                      teamLabel={`${team.name} - Chọn đáp án đúng`}
                      teamColor={team.color}
                      onOptionSelect={(label) => handleTeamOptionSelect(teamIdx, label)}
                    />
                  ) : (
                    <div style={{
                      padding: '14px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '2px solid #10b981',
                      borderRadius: '14px',
                      textAlign: 'center',
                      color: '#34d399',
                      fontWeight: 800,
                      fontSize: '1rem'
                    }}>
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
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            height: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            {/* Hàng Các Tờ Phiếu Trái Tim Của Từng Đội */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${teamStates.length}, 1fr)`,
              gap: '12px',
              width: '100%',
              flex: 1,
              boxSizing: 'border-box'
            }}>
              {teamStates.map((team, idx) => {
                const isCurrentTurn = activeTeacherTeamIdx === idx;
                const isTeamCompleted = team.correctIndices.length >= activeQuestionsList.length;
                const pieces = teamHeartPieces[idx] || [];
                const matrix = teamMatrices[idx] || null;

                return (
                  <div
                    key={team.id}
                    onClick={() => setActiveTeacherTeamIdx(idx)}
                    style={{
                      cursor: 'pointer',
                      transform: isCurrentTurn ? 'scale(1.01)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
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
                      teamId={team.id}
                      teamName={team.name}
                      teamColor={team.color}
                      matrixData={layoutMode === 'matrix' ? matrix : null}
                      heartPieces={pieces}
                      decoyGrid={decoyGrid}
                      correctQuestionIndices={team.correctIndices}
                      totalQuestions={activeQuestionsList.length}
                      isCompleted={isTeamCompleted}
                      compact={teamStates.length > 2}
                      onCellClick={(cell) => handleTeamCellClick(idx, cell)}
                    />

                    {/* Nút Giáo Viên Chấm Điểm Nhanh */}
                    <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTeacherManualAward(idx);
                        }}
                        style={{
                          flex: 1,
                          padding: '6px',
                          background: `${team.color}25`,
                          border: `1.5px solid ${team.color}`,
                          color: '#ffffff',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.76rem',
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

            {/* Khung Câu Hỏi Chiếu Trung Tâm (CHỈ HIỂN THỊ ĐỂ ĐỌC) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '18px 24px',
              boxShadow: '0 10px 35px rgba(0, 0, 0, 0.4)',
              border: '2px solid #e2e8f0',
              color: '#0f172a'
            }}>
              {/* Chọn Lượt Đội Trả Lời */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '8px'
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
                          padding: '4px 12px',
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
                      padding: '4px 10px',
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
                      padding: '4px 10px',
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

              {/* Bảng Câu Hỏi Chiếu Lớn (Học sinh nhìn câu hỏi rồi lên bảng chạm ô hoặc chọn đáp án) */}
              <QuestionPanel
                question={activeQuestionsList[teacherQIdx]}
                stepNumber={teacherQIdx + 1}
                originalQNum={teacherQIdx + 1}
                totalQuestions={activeQuestionsList.length}
                onPrevQuestion={() => setTeacherQIdx(prev => Math.max(0, prev - 1))}
                onNextQuestion={() => setTeacherQIdx(prev => Math.min(activeQuestionsList.length - 1, prev + 1))}
                compact={false}
                teamLabel={`Đang chấm cho: ${teamStates[activeTeacherTeamIdx]?.name}`}
                teamColor={teamStates[activeTeacherTeamIdx]?.color}
                onOptionSelect={(label) => handleTeamOptionSelect(activeTeacherTeamIdx, label)}
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
            padding: '30px 36px',
            maxWidth: '540px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(245, 158, 11, 0.4)',
            animation: 'scaleUp 0.3s ease-out'
          }}>
            <div style={{ fontSize: '3.6rem', marginBottom: '8px' }}>
              🏆
            </div>

            <h2 style={{
              margin: '0 0 8px 0',
              fontSize: '1.9rem',
              fontWeight: 900,
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              CHÚC MỪNG {winner.name}!
            </h2>

            <p style={{
              color: '#fecdd3',
              fontSize: '1rem',
              fontWeight: 700,
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              Đã xuất sắc tìm đúng tất cả các ô và <strong>kết nối thành công bức tranh Trái Tim Đỏ</strong> tri ân người Mẹ nhân ngày Phụ Nữ Việt Nam 20/10!
            </p>

            {/* Khung Tranh Hoàn Thành Thu Nhỏ */}
            <div style={{
              maxWidth: '300px',
              margin: '0 auto 20px auto',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
              <WorksheetPuzzleView
                teamId={winner.id}
                teamName={winner.name}
                teamColor={winner.color}
                heartPieces={teamHeartPieces[winner.id] || []}
                decoyGrid={decoyGrid}
                correctQuestionIndices={Array.from({ length: activeQuestionsList.length }, (_, i) => i)}
                totalQuestions={activeQuestionsList.length}
                isCompleted={true}
                compact={true}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleResetGame}
                style={{
                  padding: '11px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(225, 29, 72, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={17} /> Chơi Lại Trận Mới
              </button>

              <button
                onClick={onClose}
                style={{
                  padding: '11px 22px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
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
