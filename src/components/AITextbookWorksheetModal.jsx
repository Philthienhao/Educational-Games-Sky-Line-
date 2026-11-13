import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, BookOpen, Layers, CheckCircle2, 
  Printer, Download, Copy, Edit2, Edit3, Plus, Trash2, Eye, 
  FileText, Check, Layout, Award, RefreshCw, AlertCircle
} from 'lucide-react';
import { SoundFX } from '../utils/sound';
import { 
  WORKSHEET_THEMES, 
  EXERCISE_TYPES, 
  generateAITextbookWorksheet,
  generateCurriculumFallbackWorksheet,
  extractWorksheetLesson
} from '../services/aiWorksheetService';

const safePlaySound = (type = 'click') => {
  try {
    if (typeof window !== 'undefined' && SoundFX) {
      if (typeof SoundFX[type] === 'function') {
        SoundFX[type]();
      } else if (typeof SoundFX.click === 'function') {
        SoundFX.click();
      }
    }
  } catch (e) {}
};

// ==========================================
// TOP-LEVEL SUB-COMPONENTS (Rule 1 Compliance)
// ==========================================

// ==========================================
// CUTE ILLUSTRATION DICTIONARY & MATCHER
// ==========================================

const CUTE_ILLUSTRATIONS_MAP = {
  // Animals
  cat: { icon: '🐱', label: 'Con mèo', bg: '#fef3c7', border: '#fcd34d' },
  dog: { icon: '🐶', label: 'Cún con', bg: '#fee2e2', border: '#fca5a5' },
  bunny: { icon: '🐰', label: 'Thỏ trắng', bg: '#fce7f3', border: '#f472b6' },
  bear: { icon: '🐻', label: 'Gấu bông', bg: '#ffedd5', border: '#fdba74' },
  bird: { icon: '🐦', label: 'Chim nhỏ', bg: '#e0f2fe', border: '#7dd3fc' },
  duck: { icon: '🦆', label: 'Vịt con', bg: '#fef9c3', border: '#fde047' },
  chicken: { icon: '🐔', label: 'Gà mái', bg: '#fee2e2', border: '#fca5a5' },
  chick: { icon: '🐥', label: 'Gà con', bg: '#fef9c3', border: '#fde047' },
  pig: { icon: '🐷', label: 'Lợn con', bg: '#fce7f3', border: '#f472b6' },
  cow: { icon: '🐮', label: 'Bò sữa', bg: '#f1f5f9', border: '#cbd5e1' },
  horse: { icon: '🐴', label: 'Ngựa gỗ', bg: '#ffedd5', border: '#fdba74' },
  sheep: { icon: '🐑', label: 'Cừu non', bg: '#f1f5f9', border: '#cbd5e1' },
  bee: { icon: '🐝', label: 'Ong mật', bg: '#fef9c3', border: '#facc15' },
  butterfly: { icon: '🦋', label: 'Bướm hoa', bg: '#e0f2fe', border: '#7dd3fc' },
  fish: { icon: '🐟', label: 'Cá bơi', bg: '#ccfbf1', border: '#5eead4' },
  frog: { icon: '🐸', label: 'Ếch cốm', bg: '#dcfce7', border: '#86efac' },
  turtle: { icon: '🐢', label: 'Rùa con', bg: '#dcfce7', border: '#86efac' },
  lion: { icon: '🦁', label: 'Sư tử', bg: '#fef3c7', border: '#f59e0b' },
  elephant: { icon: '🐘', label: 'Voi con', bg: '#f1f5f9', border: '#cbd5e1' },
  monkey: { icon: '🐒', label: 'Khỉ nâu', bg: '#ffedd5', border: '#fdba74' },
  mouse: { icon: '🐭', label: 'Chuột nhắt', bg: '#f1f5f9', border: '#cbd5e1' },

  // School & Study Tools
  book: { icon: '📖', label: 'Quyển sách', bg: '#e0e7ff', border: '#a5b4fc' },
  books: { icon: '📚', label: 'Chồng sách', bg: '#ede9fe', border: '#c4b5fd' },
  pencil: { icon: '✏️', label: 'Cây bút', bg: '#fef3c7', border: '#fcd34d' },
  eraser: { icon: '🧽', label: 'Cục tẩy', bg: '#fce7f3', border: '#f472b6' },
  ruler: { icon: '📐', label: 'Thước kẻ', bg: '#e0f2fe', border: '#7dd3fc' },
  backpack: { icon: '🎒', label: 'Balo đi học', bg: '#fae8ff', border: '#e879f9' },
  school: { icon: '🏫', label: 'Ngôi trường', bg: '#fee2e2', border: '#fca5a5' },
  desk: { icon: '🪑', label: 'Bàn ghế', bg: '#ffedd5', border: '#fdba74' },
  scissors: { icon: '✂️', label: 'Cây kéo', bg: '#f1f5f9', border: '#94a3b8' },
  palette: { icon: '🎨', label: 'Hộp màu vẽ', bg: '#fdf4ff', border: '#d946ef' },
  calculator: { icon: '🧮', label: 'Bàn tính / Toán', bg: '#dcfce7', border: '#86efac' },
  notebook: { icon: '📓', label: 'Quyển vở', bg: '#e0f2fe', border: '#38bdf8' },
  board: { icon: '📋', label: 'Bảng học', bg: '#e0e7ff', border: '#a5b4fc' },
  teacher: { icon: '👩‍🏫', label: 'Cô giáo', bg: '#fee2e2', border: '#fca5a5' },
  student: { icon: '🧒', label: 'Học sinh', bg: '#e0f2fe', border: '#7dd3fc' },

  // Fruits & Foods
  apple: { icon: '🍎', label: 'Quả táo', bg: '#fee2e2', border: '#ef4444' },
  strawberry: { icon: '🍓', label: 'Dâu tây', bg: '#ffe4e6', border: '#fb7185' },
  orange: { icon: '🍊', label: 'Quả cam', bg: '#ffedd5', border: '#fb923c' },
  banana: { icon: '🍌', label: 'Quả chuối', bg: '#fef9c3', border: '#facc15' },
  watermelon: { icon: '🍉', label: 'Dưa hấu', bg: '#dcfce7', border: '#4ade80' },
  grape: { icon: '🍇', label: 'Chùm nho', bg: '#f3e8ff', border: '#c084fc' },
  mango: { icon: '🥭', label: 'Quả xoài', bg: '#fef3c7', border: '#fcd34d' },
  peach: { icon: '🍑', label: 'Quả đào', bg: '#ffe4e6', border: '#fb7185' },
  icecream: { icon: '🍦', label: 'Cây kem', bg: '#fce7f3', border: '#f472b6' },
  candy: { icon: '🍬', label: 'Kẹo ngọt', bg: '#fae8ff', border: '#c084fc' },
  cake: { icon: '🎂', label: 'Bánh kem', bg: '#fef3c7', border: '#fcd34d' },
  milk: { icon: '🥛', label: 'Ly sữa', bg: '#f1f5f9', border: '#cbd5e1' },
  rice: { icon: '🍚', label: 'Bát cơm', bg: '#fef9c3', border: '#fde047' },

  // Nature, Weather & Shapes
  flower: { icon: '🌸', label: 'Bông hoa', bg: '#fce7f3', border: '#f472b6' },
  sunflower: { icon: '🌻', label: 'Hoa hướng dương', bg: '#fef08a', border: '#eab308' },
  rose: { icon: '🌹', label: 'Hoa hồng', bg: '#ffe4e6', border: '#fb7185' },
  tree: { icon: '🌳', label: 'Cây xanh', bg: '#dcfce7', border: '#86efac' },
  leaf: { icon: '🍃', label: 'Chiếc lá', bg: '#dcfce7', border: '#86efac' },
  sun: { icon: '☀️', label: 'Mặt trời', bg: '#fef08a', border: '#eab308' },
  rainbow: { icon: '🌈', label: 'Cầu vồng', bg: '#fdf4ff', border: '#d946ef' },
  cloud: { icon: '☁️', label: 'Mây trắng', bg: '#f0f9ff', border: '#bae6fd' },
  rain: { icon: '🌧️', label: 'Cơn mưa', bg: '#e0f2fe', border: '#7dd3fc' },
  star: { icon: '⭐', label: 'Ngôi sao', bg: '#fef9c3', border: '#eab308' },
  moon: { icon: '🌙', label: 'Mặt trăng', bg: '#fef3c7', border: '#facc15' },
  earth: { icon: '🌍', label: 'Trái Đất', bg: '#e0f2fe', border: '#3b82f6' },
  triangle: { icon: '🔺', label: 'Hình tam giác', bg: '#fee2e2', border: '#f87171' },
  circle: { icon: '🔴', label: 'Hình tròn', bg: '#fee2e2', border: '#ef4444' },
  square: { icon: '🟦', label: 'Hình vuông', bg: '#e0f2fe', border: '#60a5fa' },
  rectangle: { icon: '🟧', label: 'Hình chữ nhật', bg: '#ffedd5', border: '#fb923c' },

  // Objects & Daily Life
  house: { icon: '🏠', label: 'Ngôi nhà', bg: '#fee2e2', border: '#fca5a5' },
  bed: { icon: '🛏️', label: 'Cái giường', bg: '#e0e7ff', border: '#a5b4fc' },
  light: { icon: '💡', label: 'Bóng đèn', bg: '#fef9c3', border: '#facc15' },
  kite: { icon: '🪁', label: 'Cánh diều', bg: '#fce7f3', border: '#f472b6' },
  umbrella: { icon: '🌂', label: 'Cái ô / dù', bg: '#e0f2fe', border: '#7dd3fc' },
  hat: { icon: '🧢', label: 'Cái mũ', bg: '#ffedd5', border: '#fdba74' },
  car: { icon: '🚗', label: 'Ô tô', bg: '#e0f2fe', border: '#0284c7' },
  bus: { icon: '🚌', label: 'Xe buýt', bg: '#fef9c3', border: '#facc15' },
  bicycle: { icon: '🚲', label: 'Xe đạp', bg: '#dcfce7', border: '#4ade80' },
  train: { icon: '🚂', label: 'Tàu hỏa', bg: '#fee2e2', border: '#f87171' },
  plane: { icon: '✈️', label: 'Máy bay', bg: '#e0f2fe', border: '#38bdf8' },
  boat: { icon: '⛵', label: 'Thuyền buồm', bg: '#ccfbf1', border: '#5eead4' },
  balloon: { icon: '🎈', label: 'Bóng bay', bg: '#fee2e2', border: '#f87171' },
  soccer: { icon: '⚽', label: 'Quả bóng', bg: '#f1f5f9', border: '#94a3b8' },
  clock: { icon: '⏰', label: 'Đồng hồ', bg: '#fef3c7', border: '#f59e0b' },
  defaultTask: { icon: '📝', label: 'Bài tập', bg: '#f0f9ff', border: '#bae6fd', isDefault: true }
};

function getIllustration(text = '', explicit = '') {
  if (explicit && CUTE_ILLUSTRATIONS_MAP[explicit]) return CUTE_ILLUSTRATIONS_MAP[explicit];
  const t = (text || '').toLowerCase().trim();
  if (!t) return CUTE_ILLUSTRATIONS_MAP.defaultTask;

  // Animals
  if (t.includes('mèo') || t.includes('cat')) return CUTE_ILLUSTRATIONS_MAP.cat;
  if (t.includes('cún') || t.includes('chó') || t.includes('dog')) return CUTE_ILLUSTRATIONS_MAP.dog;
  if (t.includes('thỏ') || t.includes('bunny')) return CUTE_ILLUSTRATIONS_MAP.bunny;
  if (t.includes('gấu') || t.includes('bear')) return CUTE_ILLUSTRATIONS_MAP.bear;
  if (t.includes('gà con') || t.includes('chú gà con')) return CUTE_ILLUSTRATIONS_MAP.chick;
  if (t.includes('gà') || t.includes('con gà')) return CUTE_ILLUSTRATIONS_MAP.chicken;
  if (t.includes('chim') || t.includes('bird')) return CUTE_ILLUSTRATIONS_MAP.bird;
  if (t.includes('vịt') || t.includes('duck')) return CUTE_ILLUSTRATIONS_MAP.duck;
  if (t.includes('lợn') || t.includes('heo') || t.includes('pig')) return CUTE_ILLUSTRATIONS_MAP.pig;
  if (t.includes('bò sữa') || t.includes('con bò') || t.includes('cow')) return CUTE_ILLUSTRATIONS_MAP.cow;
  if (t.includes('ngựa') || t.includes('horse')) return CUTE_ILLUSTRATIONS_MAP.horse;
  if (t.includes('cừu') || t.includes('sheep')) return CUTE_ILLUSTRATIONS_MAP.sheep;
  if (t.includes('ong') || t.includes('bee')) return CUTE_ILLUSTRATIONS_MAP.bee;
  if (t.includes('bướm') || t.includes('butterfly')) return CUTE_ILLUSTRATIONS_MAP.butterfly;
  if (t.includes('cá') || t.includes('fish')) return CUTE_ILLUSTRATIONS_MAP.fish;
  if (t.includes('ếch') || t.includes('frog')) return CUTE_ILLUSTRATIONS_MAP.frog;
  if (t.includes('rùa') || t.includes('turtle')) return CUTE_ILLUSTRATIONS_MAP.turtle;
  if (t.includes('sư tử') || t.includes('lion')) return CUTE_ILLUSTRATIONS_MAP.lion;
  if (t.includes('voi') || t.includes('elephant')) return CUTE_ILLUSTRATIONS_MAP.elephant;
  if (t.includes('khỉ') || t.includes('monkey')) return CUTE_ILLUSTRATIONS_MAP.monkey;
  if (t.includes('chuột') || t.includes('mouse')) return CUTE_ILLUSTRATIONS_MAP.mouse;

  // School & Study Tools
  if (t.includes('sách') || t.includes('đọc sách') || t.includes('book')) return CUTE_ILLUSTRATIONS_MAP.book;
  if (t.includes('vở') || t.includes('tập viết') || t.includes('notebook')) return CUTE_ILLUSTRATIONS_MAP.notebook;
  if (t.includes('bút') || t.includes('pencil') || t.includes('viết chữ')) return CUTE_ILLUSTRATIONS_MAP.pencil;
  if (t.includes('tẩy') || t.includes('cục tẩy') || t.includes('gôm')) return CUTE_ILLUSTRATIONS_MAP.eraser;
  if (t.includes('thước') || t.includes('ruler')) return CUTE_ILLUSTRATIONS_MAP.ruler;
  if (t.includes('kéo') || t.includes('cắt')) return CUTE_ILLUSTRATIONS_MAP.scissors;
  if (t.includes('cặp') || t.includes('balo') || t.includes('backpack')) return CUTE_ILLUSTRATIONS_MAP.backpack;
  if (t.includes('trường') || t.includes('lớp') || t.includes('school')) return CUTE_ILLUSTRATIONS_MAP.school;
  if (t.includes('bàn') || t.includes('ghế') || t.includes('desk')) return CUTE_ILLUSTRATIONS_MAP.desk;
  if (t.includes('màu') || t.includes('vẽ') || t.includes('tô màu') || t.includes('palette')) return CUTE_ILLUSTRATIONS_MAP.palette;
  if (t.includes('cô giáo') || t.includes('thầy giáo') || t.includes('giáo viên')) return CUTE_ILLUSTRATIONS_MAP.teacher;
  if (t.includes('học sinh') || t.includes('em bé') || t.includes('bạn nhỏ')) return CUTE_ILLUSTRATIONS_MAP.student;
  if (t.includes('bảng') || t.includes('bảng con')) return CUTE_ILLUSTRATIONS_MAP.board;

  // Fruits & Foods
  if (t.includes('táo') || t.includes('apple')) return CUTE_ILLUSTRATIONS_MAP.apple;
  if (t.includes('dâu') || t.includes('strawberry')) return CUTE_ILLUSTRATIONS_MAP.strawberry;
  if (t.includes('cam') || t.includes('orange')) return CUTE_ILLUSTRATIONS_MAP.orange;
  if (t.includes('chuối') || t.includes('banana')) return CUTE_ILLUSTRATIONS_MAP.banana;
  if (t.includes('dưa hấu') || t.includes('watermelon')) return CUTE_ILLUSTRATIONS_MAP.watermelon;
  if (t.includes('nho') || t.includes('grape')) return CUTE_ILLUSTRATIONS_MAP.grape;
  if (t.includes('xoài') || t.includes('mango')) return CUTE_ILLUSTRATIONS_MAP.mango;
  if (t.includes('đào') || t.includes('peach')) return CUTE_ILLUSTRATIONS_MAP.peach;
  if (t.includes('kem') || t.includes('ice cream')) return CUTE_ILLUSTRATIONS_MAP.icecream;
  if (t.includes('kẹo') || t.includes('candy')) return CUTE_ILLUSTRATIONS_MAP.candy;
  if (t.includes('bánh') || t.includes('cake')) return CUTE_ILLUSTRATIONS_MAP.cake;
  if (t.includes('sữa') || t.includes('milk')) return CUTE_ILLUSTRATIONS_MAP.milk;
  if (t.includes('cơm') || t.includes('bát cơm')) return CUTE_ILLUSTRATIONS_MAP.rice;

  // Nature & Shapes
  if (t.includes('hướng dương')) return CUTE_ILLUSTRATIONS_MAP.sunflower;
  if (t.includes('hoa hồng')) return CUTE_ILLUSTRATIONS_MAP.rose;
  if (t.includes('hoa') || t.includes('bông hoa') || t.includes('flower')) return CUTE_ILLUSTRATIONS_MAP.flower;
  if (t.includes('chiếc lá') || t.includes('lá cây')) return CUTE_ILLUSTRATIONS_MAP.leaf;
  if (t.includes('cây xanh') || t.includes('cây cổ thụ') || t.includes('rừng')) return CUTE_ILLUSTRATIONS_MAP.tree;
  if (t.includes('mặt trời') || t.includes('ánh nắng') || t.includes('nắng')) return CUTE_ILLUSTRATIONS_MAP.sun;
  if (t.includes('cầu vồng') || t.includes('rainbow')) return CUTE_ILLUSTRATIONS_MAP.rainbow;
  if (t.includes('mây') || t.includes('đám mây')) return CUTE_ILLUSTRATIONS_MAP.cloud;
  if (t.includes('mưa') || t.includes('cơn mưa')) return CUTE_ILLUSTRATIONS_MAP.rain;
  if (t.includes('ngôi sao') || t.includes('sao sáng')) return CUTE_ILLUSTRATIONS_MAP.star;
  if (t.includes('mặt trăng') || t.includes('vầng trăng') || t.includes('trăng')) return CUTE_ILLUSTRATIONS_MAP.moon;
  if (t.includes('trái đất') || t.includes('địa cầu')) return CUTE_ILLUSTRATIONS_MAP.earth;

  // Shapes
  if (t.includes('hình tam giác') || t.includes('tam giác')) return CUTE_ILLUSTRATIONS_MAP.triangle;
  if (t.includes('hình tròn')) return CUTE_ILLUSTRATIONS_MAP.circle;
  if (t.includes('hình vuông')) return CUTE_ILLUSTRATIONS_MAP.square;
  if (t.includes('hình chữ nhật')) return CUTE_ILLUSTRATIONS_MAP.rectangle;

  // Objects & Daily Life
  if (t.includes('ngôi nhà') || t.includes('mái nhà')) return CUTE_ILLUSTRATIONS_MAP.house;
  if (t.includes('giường')) return CUTE_ILLUSTRATIONS_MAP.bed;
  if (t.includes('bóng đèn') || t.includes('đèn học')) return CUTE_ILLUSTRATIONS_MAP.light;
  if (t.includes('cánh diều') || t.includes('thả diều')) return CUTE_ILLUSTRATIONS_MAP.kite;
  if (t.includes('cái ô') || t.includes('cái dù')) return CUTE_ILLUSTRATIONS_MAP.umbrella;
  if (t.includes('cái mũ') || t.includes('chiếc mũ') || t.includes('cái nón')) return CUTE_ILLUSTRATIONS_MAP.hat;
  if (t.includes('ô tô') || t.includes('xe con')) return CUTE_ILLUSTRATIONS_MAP.car;
  if (t.includes('xe buýt')) return CUTE_ILLUSTRATIONS_MAP.bus;
  if (t.includes('xe đạp')) return CUTE_ILLUSTRATIONS_MAP.bicycle;
  if (t.includes('tàu hỏa') || t.includes('xe lửa')) return CUTE_ILLUSTRATIONS_MAP.train;
  if (t.includes('máy bay')) return CUTE_ILLUSTRATIONS_MAP.plane;
  if (t.includes('thuyền') || t.includes('tàu thủy')) return CUTE_ILLUSTRATIONS_MAP.boat;
  if (t.includes('bóng bay') || t.includes('bong bóng')) return CUTE_ILLUSTRATIONS_MAP.balloon;
  if (t.includes('quả bóng') || t.includes('đá bóng')) return CUTE_ILLUSTRATIONS_MAP.soccer;
  if (t.includes('đồng hồ') || t.includes('thời gian') || t.includes('mấy giờ')) return CUTE_ILLUSTRATIONS_MAP.clock;
  if (t.includes('phép tính') || t.includes('tính toán') || t.includes('cộng') || t.includes('trừ') || t.includes('toán')) return CUTE_ILLUSTRATIONS_MAP.calculator;

  return CUTE_ILLUSTRATIONS_MAP.defaultTask;
}

// ==========================================
// PEDAGOGICAL DIAGRAM RENDERER (Clean Crisp SVG)
// ==========================================

function EducationalDiagram({ diagram }) {
  if (!diagram || !diagram.type) return null;
  const { type, label = '', data = {} } = diagram;

  if (type === 'geometry_triangle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <svg width="200" height="110" viewBox="0 0 200 110" style={{ overflow: 'visible' }}>
          <polygon points="100,15 30,95 170,95" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" strokeLinejoin="round" />
          <text x="100" y="8" textAnchor="middle" fontWeight="800" fontSize="12" fill="#0369a1">A</text>
          <text x="20" y="102" textAnchor="middle" fontWeight="800" fontSize="12" fill="#0369a1">B</text>
          <text x="180" y="102" textAnchor="middle" fontWeight="800" fontSize="12" fill="#0369a1">C</text>
          {data.base && <text x="100" y="108" textAnchor="middle" fontSize="11" fill="#475569">{data.base}</text>}
          {data.side && <text x="55" y="55" textAnchor="middle" fontSize="11" fill="#475569">{data.side}</text>}
        </svg>
        {label && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginTop: '6px' }}>{label}</span>}
      </div>
    );
  }

  if (type === 'geometry_rectangle' || type === 'geometry_square') {
    const isSquare = type === 'geometry_square';
    const width = isSquare ? 100 : 140;
    const height = 75;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <svg width="190" height="105" viewBox="0 0 190 105" style={{ overflow: 'visible' }}>
          <rect x={95 - width/2} y="15" width={width} height={height} rx="2" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2.5" />
          <text x={95 - width/2 - 8} y="15" textAnchor="middle" fontWeight="800" fontSize="12" fill="#15803d">A</text>
          <text x={95 + width/2 + 8} y="15" textAnchor="middle" fontWeight="800" fontSize="12" fill="#15803d">B</text>
          <text x={95 + width/2 + 8} y={15 + height + 5} textAnchor="middle" fontWeight="800" fontSize="12" fill="#15803d">C</text>
          <text x={95 - width/2 - 8} y={15 + height + 5} textAnchor="middle" fontWeight="800" fontSize="12" fill="#15803d">D</text>
          {data.length && <text x="95" y={15 + height + 16} textAnchor="middle" fontSize="11" fill="#475569">{data.length}</text>}
          {data.width && <text x={95 + width/2 + 20} y={15 + height/2 + 4} textAnchor="middle" fontSize="11" fill="#475569">{data.width}</text>}
        </svg>
        {label && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginTop: '6px' }}>{label}</span>}
      </div>
    );
  }

  if (type === 'geometry_circle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <svg width="150" height="110" viewBox="0 0 150 110" style={{ overflow: 'visible' }}>
          <circle cx="75" cy="55" r="42" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" />
          <circle cx="75" cy="55" r="3" fill="#b45309" />
          <line x1="75" y1="55" x2="117" y2="55" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="69" y="52" fontWeight="800" fontSize="11" fill="#b45309">O</text>
          <text x="96" y="50" textAnchor="middle" fontSize="10" fill="#92400e">{data.radius || 'r'}</text>
        </svg>
        {label && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginTop: '6px' }}>{label}</span>}
      </div>
    );
  }

  if (type === 'number_line') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <svg width="270" height="48" viewBox="0 0 270 48">
          <line x1="15" y1="20" x2="255" y2="20" stroke="#0284c7" strokeWidth="2" />
          <polygon points="255,20 247,16 247,24" fill="#0284c7" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, i) => (
            <g key={i}>
              <line x1={20 + i * 22} y1="15" x2={20 + i * 22} y2="25" stroke="#0284c7" strokeWidth="1.5" />
              <text x={20 + i * 22} y="37" textAnchor="middle" fontSize="10" fill="#334155" fontWeight="600">{n}</text>
            </g>
          ))}
        </svg>
        {label && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginTop: '6px' }}>{label}</span>}
      </div>
    );
  }

  if (type === 'clock') {
    const hours = data.hours || 3;
    const minutes = data.minutes || 0;
    const hourAngle = (hours % 12 + minutes / 60) * 30;
    const minuteAngle = minutes * 6;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="42" fill="#fef9c3" stroke="#ca8a04" strokeWidth="2.5" />
          <circle cx="48" cy="48" r="3" fill="#854d0e" />
          <text x="48" y="20" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#854d0e">12</text>
          <text x="80" y="52" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#854d0e">3</text>
          <text x="48" y="83" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#854d0e">6</text>
          <text x="16" y="52" textAnchor="middle" fontWeight="bold" fontSize="11" fill="#854d0e">9</text>
          <line x1="48" y1="48" 
            x2={48 + 22 * Math.sin((hourAngle * Math.PI) / 180)} 
            y2={48 - 22 * Math.cos((hourAngle * Math.PI) / 180)} 
            stroke="#854d0e" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="48" y1="48" 
            x2={48 + 32 * Math.sin((minuteAngle * Math.PI) / 180)} 
            y2={48 - 32 * Math.cos((minuteAngle * Math.PI) / 180)} 
            stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {label && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginTop: '6px' }}>{label}</span>}
      </div>
    );
  }

  return null;
}

// Strict Option Illustration: ONLY when option explicitly provides an icon
function getOptionIllustration(item, opt, optIdx, showIllustrations) {
  if (!showIllustrations) return null;
  if (item?.optionIcons && Array.isArray(item.optionIcons) && item.optionIcons[optIdx]) {
    const icon = item.optionIcons[optIdx];
    if (typeof icon === 'string' && icon.trim().length > 0) {
      return icon.trim();
    }
  }
  return null;
}

// Strict Educational Visual: Only when item has diagram or explicit valid illustration
function EducationalVisual({ item, showIllustrations }) {
  if (!showIllustrations || !item) return null;

  // 1. Diagram takes priority
  if (item.diagram) {
    return <EducationalDiagram diagram={item.diagram} />;
  }

  // 2. Explicit illustration matched strictly (no random fallback or defaultTask)
  const illuKey = item.illustration;
  if (!illuKey || illuKey === 'defaultTask' || illuKey === 'null') return null;

  const illu = CUTE_ILLUSTRATIONS_MAP[illuKey];
  if (!illu || illu.isDefault) return null;

  return (
    <div 
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: illu.bg,
        border: `1.5px solid ${illu.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
        flexShrink: 0
      }}
      title={`Hình minh họa: ${illu.label}`}
    >
      {item.icon || illu.icon}
    </div>
  );
}

// ==========================================
// TOP-LEVEL SUB-COMPONENTS (Rule 1 Compliance)
// ==========================================

function MultipleChoiceSection({ section, sectionIdx, isPrimaryCute, showIllustrations }) {
  const optionLetters = ['A', 'B', 'C', 'D'];
  const optionPillColors = [
    { bgLight: '#f0f9ff', badgeBg: '#e0f2fe', text: '#0284c7', border: '#7dd3fc' }, // A: Blue
    { bgLight: '#f0fdf4', badgeBg: '#dcfce7', text: '#15803d', border: '#86efac' }, // B: Green
    { bgLight: '#fffbeb', badgeBg: '#fef3c7', text: '#b45309', border: '#fde047' }, // C: Amber
    { bgLight: '#faf5ff', badgeBg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' }  // D: Purple
  ];

  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h4 style={{ 
          margin: 0, 
          fontSize: '0.98rem', 
          fontWeight: 800, 
          color: isPrimaryCute ? '#0284c7' : '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {isPrimaryCute && <span style={{ fontSize: '1.15rem' }}>🌈</span>}
          {section.title}
        </h4>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
          ({section.items?.length || 0} câu)
        </span>
      </div>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {section.items?.map((item, itemIdx) => {
          const numOptions = item.options?.length || 4;
          return (
            <div 
              key={item.id || itemIdx}
              style={{
                padding: '10px 14px',
                borderRadius: isPrimaryCute ? '14px' : '8px',
                backgroundColor: isPrimaryCute ? '#f8fafc' : '#ffffff',
                border: isPrimaryCute ? '1.5px dashed #7dd3fc' : '1px dashed #cbd5e1',
                boxShadow: isPrimaryCute ? '0 2px 6px rgba(56, 189, 248, 0.08)' : 'none'
              }}
            >
              {/* Question line with Question Badge & Strict Illustration */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: isPrimaryCute ? '8px' : '4px',
                      backgroundColor: isPrimaryCute ? '#e0f2fe' : '#f1f5f9',
                      color: isPrimaryCute ? '#0284c7' : '#334155',
                      fontWeight: 900,
                      fontSize: '0.78rem',
                      flexShrink: 0
                    }}>
                      Câu {itemIdx + 1}
                    </span>
                    <EducationalVisual item={item} showIllustrations={showIllustrations} />
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.4 }}>
                      {item.question}
                    </span>
                  </div>

                  {/* Sơ đồ hình học / toán học nếu có */}
                  {showIllustrations && item.diagram && (
                    <EducationalDiagram diagram={item.diagram} />
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', whiteSpace: 'nowrap' }}>
                  [{item.points || '1.0 đ'}]
                </span>
              </div>

              {/* 1-ROW HORIZONTAL OPTIONS */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${numOptions}, minmax(0, 1fr))`, 
                gap: '8px', 
                marginTop: '10px',
                width: '100%'
              }}>
                {item.options?.map((opt, optIdx) => {
                  const colorTheme = optionPillColors[optIdx % optionPillColors.length];
                  const optStr = typeof opt === 'string' ? opt : (opt?.text || '');
                  const optCleanText = optStr.replace(/^[A-Da-d0-9][\.\:\)\s]+/, '').trim() || optStr;
                  const optIcon = getOptionIllustration(item, opt, optIdx, showIllustrations);

                  return (
                    <div 
                      key={optIdx}
                      style={{
                        padding: isPrimaryCute ? '8px 10px' : '6px 10px',
                        borderRadius: isPrimaryCute ? '10px' : '6px',
                        backgroundColor: isPrimaryCute ? colorTheme.bgLight : '#ffffff',
                        border: isPrimaryCute ? `1.5px solid ${colorTheme.border}` : '1px solid #e2e8f0',
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isPrimaryCute ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                        minWidth: 0,
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Option Letter Pill */}
                      <span style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: colorTheme.badgeBg,
                        color: colorTheme.text,
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: `1px solid ${colorTheme.border}`
                      }}>
                        {optionLetters[optIdx]}
                      </span>

                      {/* Option Illustration only when strictly provided */}
                      {showIllustrations && optIcon && (
                        <span style={{
                          fontSize: '1.2rem',
                          lineHeight: 1,
                          flexShrink: 0,
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                        }}>
                          {optIcon}
                        </span>
                      )}

                      {/* Option Text */}
                      <span style={{ 
                        fontSize: '0.82rem', 
                        fontWeight: isPrimaryCute ? 700 : 600, 
                        color: '#1e293b',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }} title={optCleanText}>
                        {optCleanText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function FillBlankSection({ section, sectionIdx, isPrimaryCute, showIllustrations }) {
  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h4 style={{ 
        margin: '0 0 4px 0', 
        fontSize: '0.98rem', 
        fontWeight: 800, 
        color: isPrimaryCute ? '#0284c7' : '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {isPrimaryCute && <span style={{ fontSize: '1.1rem' }}>✏️</span>}
        {section.title}
      </h4>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {section.items?.map((item, itemIdx) => (
          <div 
            key={item.id || itemIdx}
            style={{
              padding: '10px 14px',
              borderRadius: isPrimaryCute ? '12px' : '8px',
              backgroundColor: '#f8fafc',
              border: isPrimaryCute ? '1.5px dashed #7dd3fc' : '1px dashed #cbd5e1'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: isPrimaryCute ? '8px' : '4px',
                    backgroundColor: isPrimaryCute ? '#e0f2fe' : '#f1f5f9',
                    color: isPrimaryCute ? '#0284c7' : '#334155',
                    fontWeight: 900,
                    fontSize: '0.78rem',
                    flexShrink: 0
                  }}>
                    Bài {itemIdx + 1}
                  </span>
                  <EducationalVisual item={item} showIllustrations={showIllustrations} />
                  <span style={{ fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.6 }}>
                    {item.question}
                  </span>
                </div>

                {showIllustrations && item.diagram && (
                  <EducationalDiagram diagram={item.diagram} />
                )}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>
                [{item.points || '1.0 đ'}]
              </span>
            </div>
            {item.wordBank && item.wordBank.length > 0 && (
              <div style={{ 
                marginTop: '8px', 
                padding: '5px 12px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)', 
                border: '1px solid #bae6fd',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: '#0369a1'
              }}>
                <span>💡 Từ gợi ý:</span>
                <strong>{item.wordBank.join('  •  ')}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchingSection({ section, isPrimaryCute, showIllustrations }) {
  const hasAnyIcon = showIllustrations && section.pairs?.some(p => p.leftIcon && typeof p.leftIcon === 'string' && p.leftIcon.trim().length > 0);

  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h4 style={{ 
        margin: '0 0 4px 0', 
        fontSize: '0.98rem', 
        fontWeight: 800, 
        color: isPrimaryCute ? '#0284c7' : '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {isPrimaryCute && <span style={{ fontSize: '1.1rem' }}>🎨</span>}
        {section.title}
      </h4>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        padding: '12px 16px',
        borderRadius: isPrimaryCute ? '14px' : '10px',
        backgroundColor: '#f8fafc',
        border: isPrimaryCute ? '2px dashed #7dd3fc' : '1.5px dashed #cbd5e1'
      }}>
        {/* Column A */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 800, fontSize: '0.82rem', color: isPrimaryCute ? '#0284c7' : '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {hasAnyIcon && <span>🖼️</span>} Cột A {hasAnyIcon ? '(Hình ảnh / Khái niệm)' : ''}
          </div>
          {section.pairs?.map((p, idx) => {
            const hasIcon = showIllustrations && p.leftIcon && typeof p.leftIcon === 'string' && p.leftIcon.trim().length > 0;
            return (
              <div 
                key={idx}
                style={{
                  padding: '8px 12px',
                  borderRadius: isPrimaryCute ? '10px' : '6px',
                  backgroundColor: '#ffffff',
                  border: isPrimaryCute ? '1.5px solid #7dd3fc' : '1px solid #cbd5e1',
                  boxShadow: isPrimaryCute ? '0 2px 6px rgba(2, 132, 199, 0.08)' : 'none',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasIcon && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#e0f2fe',
                      border: '1.5px solid #bae6fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0
                    }}>
                      {p.leftIcon}
                    </div>
                  )}
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.left}</span>
                </div>
                <span style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: '#0284c7',
                  border: '2px solid #ffffff',
                  boxShadow: '0 0 0 2px #0284c7',
                  flexShrink: 0 
                }} />
              </div>
            );
          })}
        </div>

        {/* Column B */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 800, fontSize: '0.82rem', color: isPrimaryCute ? '#f59e0b' : '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isPrimaryCute && <span>📝</span>} Cột B
          </div>
          {section.pairs?.map((p, idx) => (
            <div 
              key={idx}
              style={{
                padding: '10px 12px',
                borderRadius: isPrimaryCute ? '10px' : '6px',
                backgroundColor: '#ffffff',
                border: isPrimaryCute ? '1.5px solid #fde047' : '1px solid #cbd5e1',
                boxShadow: isPrimaryCute ? '0 2px 6px rgba(245, 158, 11, 0.08)' : 'none',
                fontSize: '0.84rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: isPrimaryCute ? '44px' : 'auto'
              }}
            >
              <span style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: '#f59e0b', 
                border: '2px solid #ffffff',
                boxShadow: '0 0 0 2px #f59e0b',
                flexShrink: 0 
              }} />
              <span style={{ lineHeight: 1.4 }}>{p.right}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrueFalseSection({ section, isPrimaryCute }) {
  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h4 style={{ 
        margin: '0 0 4px 0', 
        fontSize: '0.98rem', 
        fontWeight: 800, 
        color: isPrimaryCute ? '#0284c7' : '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {isPrimaryCute && <span style={{ fontSize: '1.1rem' }}>⭐</span>}
        {section.title}
      </h4>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {section.items?.map((item, idx) => (
          <div 
            key={idx}
            style={{
              padding: '10px 14px',
              borderRadius: isPrimaryCute ? '10px' : '8px',
              backgroundColor: '#f8fafc',
              border: isPrimaryCute ? '1.5px dashed #7dd3fc' : '1px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.86rem', color: '#0f172a' }}>
                <strong>{idx + 1}.</strong> {item.statement}
              </span>
            </div>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '6px', 
              border: '2px solid #0284c7', 
              backgroundColor: '#ffffff',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#94a3b8'
            }}>
              [ &nbsp; ]
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableMatrixSection({ section, isPrimaryCute }) {
  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h4 style={{ 
        margin: '0 0 4px 0', 
        fontSize: '0.98rem', 
        fontWeight: 800, 
        color: isPrimaryCute ? '#0284c7' : '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {isPrimaryCute && <span style={{ fontSize: '1.1rem' }}>📊</span>}
        {section.title}
      </h4>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.84rem',
          backgroundColor: '#ffffff'
        }}>
          <thead>
            <tr style={{ backgroundColor: isPrimaryCute ? '#e0f2fe' : '#f1f5f9' }}>
              {section.headers?.map((h, idx) => (
                <th 
                  key={idx}
                  style={{
                    padding: '8px 10px',
                    border: '1px solid #cbd5e1',
                    textAlign: 'left',
                    fontWeight: 800,
                    color: '#1e293b'
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows?.map((r, rIdx) => (
              <tr key={rIdx}>
                <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a', width: '35%' }}>
                  {r.col1 || ''}
                </td>
                <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#334155' }}>
                  {r.col2 || <div style={{ minHeight: '28px', borderBottom: '1px dotted #cbd5e1' }}></div>}
                </td>
                {section.headers?.length > 2 && (
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#334155' }}>
                    {r.col3 || <div style={{ minHeight: '28px', borderBottom: '1px dotted #cbd5e1' }}></div>}
                  </td>
                )}
                {section.headers?.length > 3 && (
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: '#334155' }}>
                    {r.col4 || <div style={{ minHeight: '28px', borderBottom: '1px dotted #cbd5e1' }}></div>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShortAnswerSection({ section, isPrimaryCute, showIllustrations }) {
  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h4 style={{ 
        margin: '0 0 4px 0', 
        fontSize: '0.98rem', 
        fontWeight: 800, 
        color: isPrimaryCute ? '#0284c7' : '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {isPrimaryCute && <span style={{ fontSize: '1.1rem' }}>✍️</span>}
        {section.title}
      </h4>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {section.items?.map((item, idx) => {
          const lines = Array.from({ length: item.lines || 3 });
          return (
            <div key={item.id || idx}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
                    Câu {idx + 1}: {item.question}
                  </span>
                  {showIllustrations && item.diagram && (
                    <EducationalDiagram diagram={item.diagram} />
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>
                  [{item.points || '2.0 đ'}]
                </span>
              </div>

              {/* Dotted handwriting lines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '6px 0 10px 0' }}>
                {lines.map((_, lIdx) => (
                  <div 
                    key={lIdx} 
                    style={{ 
                      borderBottom: '1.5px dotted #94a3b8', 
                      width: '100%',
                      height: '4px'
                    }} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function AITextbookWorksheetModal({
  isOpen,
  onClose,
  book,
  bookText = '',
  currentUser
}) {
  if (!isOpen || !book) return null;

  const [selectedTheme, setSelectedTheme] = useState('primary_cute');
  const [promptCommand, setPromptCommand] = useState('Tạo phiếu bài tập cuối tuần ôn tập toàn diện bài học');
  const [lessonTitle, setLessonTitle] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([
    'multiple_choice', 'fill_blank', 'matching', 'true_false', 'table_matrix', 'short_answer'
  ]);
  const [showIllustrations, setShowIllustrations] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [worksheetData, setWorksheetData] = useState(null);
  const [activeTab, setActiveTab] = useState('worksheet'); // 'worksheet' | 'answer_key'
  const [copySuccess, setCopySuccess] = useState(false);

  const printAreaRef = useRef(null);

  // Auto-init form defaults on opening - DO NOT auto-generate, wait for teacher to press button!
  useEffect(() => {
    if (isOpen && book) {
      setCopySuccess(false);
      setActiveTab('worksheet');
      const isKid = (book.grade || '').includes('1') || (book.grade || '').includes('2') || (book.grade || '').includes('3') || (book.grade || '').includes('4') || (book.grade || '').includes('5');
      const initialTheme = isKid ? 'primary_cute' : 'standard_secondary';
      setSelectedTheme(initialTheme);
      setShowIllustrations(isKid);
      
      const detected = extractWorksheetLesson(book.title, book.subject, book.grade, promptCommand);
      const initialLesson = detected?.lesson || (typeof detected === 'string' ? detected : 'BÀI 1: BÀI HỌC TRỌNG TÂM SGK');
      setLessonTitle(initialLesson);

      // Keep worksheetData null until the teacher clicks "Tạo Phiếu Bài Tập"
      setWorksheetData(null);
      setIsLoading(false);
    }
  }, [isOpen, book?.id]);

  const handleToggleType = (typeId) => {
    safePlaySound('click');
    setSelectedTypes(prev => {
      const updated = prev.includes(typeId)
        ? (prev.length === 1 ? prev : prev.filter(t => t !== typeId))
        : [...prev, typeId];
      return updated;
    });
  };

  const handleSelectTheme = (themeId) => {
    safePlaySound('click');
    setSelectedTheme(themeId);
    if (worksheetData) {
      setWorksheetData(prev => prev ? ({ ...prev, theme: themeId }) : prev);
    }
  };

  const performGeneration = async (themeToUse, typesToUse, commandToUse) => {
    setIsLoading(true);
    setLoadingStep('🤖 Gemini AI đang phân tích bài học và soạn phiếu bài tập...');

    try {
      let effectiveText = bookText;
      if (!effectiveText || effectiveText.length < 50) {
        if (book.textPath) {
          try {
            const res = await fetch(book.textPath);
            if (res.ok) effectiveText = await res.text();
          } catch (e) {}
        }
      }

      const result = await generateAITextbookWorksheet({
        book,
        bookText: effectiveText,
        promptCommand: commandToUse || promptCommand,
        theme: themeToUse || selectedTheme,
        selectedTypes: typesToUse || selectedTypes
      });

      if (result && result.worksheet) {
        setWorksheetData(result.worksheet);
        if (result.worksheet.lesson) {
          setLessonTitle(result.worksheet.lesson);
        }
        safePlaySound('fanfare');
      }
    } catch (err) {
      console.error('Worksheet generation error:', err);
      // Fallback guarantees worksheet is always populated
      const fallback = generateCurriculumFallbackWorksheet({
        textbookTitle: book.title || 'Sách Giáo Khoa',
        grade: book.grade || 'Lớp 2',
        subject: book.subject || 'Tiếng Việt',
        theme: themeToUse || selectedTheme,
        selectedTypes: typesToUse || selectedTypes,
        promptCommand: commandToUse || promptCommand
      });
      setWorksheetData(fallback);
      if (fallback.lesson) {
        setLessonTitle(fallback.lesson);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    safePlaySound('click');
    await performGeneration(selectedTheme, selectedTypes, promptCommand);
  };

  // Print A4 Worksheet
  const handlePrint = () => {
    safePlaySound('click');
    window.print();
  };

  // Copy Plain Text for Word
  const handleCopyWord = () => {
    if (!worksheetData) return;
    safePlaySound('click');

    const effectiveLesson = lessonTitle || worksheetData.lesson || extractWorksheetLesson(book.title, book.subject, book.grade, promptCommand);
    let text = `${worksheetData.title}\n`;
    if (effectiveLesson) {
      text += `BÀI HỌC: ${effectiveLesson}\n`;
    }
    if (worksheetData.subtitle) text += `${worksheetData.subtitle}\n`;
    text += `Trường: ${worksheetData.school || 'Sky-Line'}\n`;
    text += `Họ và tên: ............................................ Lớp: ................. Ngày: .................\n`;
    text += `Thời gian làm bài: ${worksheetData.timeAllowed || '35 phút'}\n`;
    text += `---------------------------------------------------------\n\n`;

    worksheetData.sections?.forEach((sec) => {
      text += `${sec.title}\n`;
      if (sec.instruction) text += `${sec.instruction}\n`;

      if (sec.type === 'multiple_choice') {
        sec.items?.forEach((it, i) => {
          text += `Câu ${i + 1}: ${it.question} [${it.points || '1.0 đ'}]\n`;
          it.options?.forEach(opt => { text += `   ${opt}\n`; });
        });
      } else if (sec.type === 'fill_blank') {
        sec.items?.forEach((it, i) => {
          text += `Bài ${i + 1}: ${it.question}\n`;
          if (it.wordBank) text += `   (Từ gợi ý: ${it.wordBank.join(', ')})\n`;
        });
      } else if (sec.type === 'matching') {
        sec.pairs?.forEach(p => {
          text += `• ${p.left}  ----->  ${p.right}\n`;
        });
      } else if (sec.type === 'true_false') {
        sec.items?.forEach((it, i) => {
          text += `[   ] ${i + 1}. ${it.statement}\n`;
        });
      } else if (sec.type === 'table_matrix') {
        text += `[BẢNG TỔNG HỢP KIẾN THỨC]\n`;
        text += `${sec.headers?.join(' | ')}\n`;
        sec.rows?.forEach(r => {
          text += `${r.col1 || ''} | ${r.col2 || ''} | ${r.col3 || ''}\n`;
        });
      } else if (sec.type === 'short_answer') {
        sec.items?.forEach((it, i) => {
          text += `Câu ${i + 1}: ${it.question}\n`;
          text += `Trả lời: ........................................................................................\n`;
          text += `.................................................................................................\n`;
        });
      }
      text += `\n`;
    });

    if (worksheetData.teacherGuide) {
      text += `\n--- ĐÁP ÁN & HƯỚNG DẪN CHẤM ---\n`;
      text += `Tổng điểm: ${worksheetData.teacherGuide.totalPoints || '10 điểm'}\n`;
      text += `Đáp án: ${worksheetData.teacherGuide.answerKey || ''}\n`;
      text += `Ghi chú: ${worksheetData.teacherGuide.notes || ''}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  const activeThemeObj = WORKSHEET_THEMES.find(t => t.id === selectedTheme) || WORKSHEET_THEMES[0];
  const effectiveLesson = lessonTitle || worksheetData?.lesson || (book ? extractWorksheetLesson(book.title, book.subject, book.grade, promptCommand) : '');

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      {/* Print Specific CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #worksheet-printable-area, #worksheet-printable-area * {
            visibility: visible !important;
          }
          #worksheet-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            box-shadow: none !important;
            border: none !important;
            background-color: #ffffff !important;
          }
          .worksheet-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm 10mm;
          }
        }
      `}</style>

      {/* Main Container Card (Single Viewport Guardrail Rule 14) */}
      <div 
        style={{
          width: '100%',
          maxWidth: '1280px',
          height: 'min(95vh, 720px)',
          maxHeight: 'calc(100vh - 20px)',
          backgroundColor: '#0f172a',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Top Header Bar */}
        <div 
          style={{
            padding: '14px 20px',
            backgroundColor: '#1e293b',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#f8fafc' }}>
                  AI Soạn Phiếu Học Tập & Bài Tập Chuẩn Bộ GD&ĐT
                </h3>
                <span 
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff'
                  }}
                >
                  GDPT 2018
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Sách: <strong style={{ color: '#38bdf8' }}>{book.title}</strong> • {book.grade} • Môn {book.subject}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={!worksheetData}
              title="In phiếu bài tập hoặc Lưu file PDF chuẩn khổ A4"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: worksheetData ? 'pointer' : 'not-allowed',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              <Printer size={16} /> In Phiếu / Xuất PDF (A4)
            </button>

            {/* Copy for Word Button */}
            <button
              onClick={handleCopyWord}
              disabled={!worksheetData}
              title="Sao chép toàn bộ văn bản để dán vào Microsoft Word"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: copySuccess ? '#059669' : '#334155',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: worksheetData ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              {copySuccess ? <Check size={15} color="#34d399" /> : <Copy size={15} />}
              {copySuccess ? 'Đã chép vào Word!' : 'Chép vào Word'}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div 
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden'
          }}
        >
          {/* LEFT COLUMN: Controls & Configurations */}
          <div 
            style={{
              width: '380px',
              flexShrink: 0,
              backgroundColor: '#1e293b',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              overflowY: 'auto'
            }}
          >
            {/* Theme Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                🎨 1. Chọn phong cách mẫu phiếu
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {WORKSHEET_THEMES.map(th => {
                  const isSel = selectedTheme === th.id;
                  return (
                    <div 
                      key={th.id}
                      onClick={() => handleSelectTheme(th.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: isSel ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: isSel ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.4)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isSel ? '#38bdf8' : '#e2e8f0' }}>
                          {th.icon} {th.name}
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                          {th.badge}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        {th.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lesson / Topic Selector & Quick Suggestion Chips */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={15} style={{ color: '#38bdf8' }} /> 2. Bài học SGK (In nổi bật trên phiếu)
                </label>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Chỉnh sửa được</span>
              </div>
              <input 
                type="text"
                value={lessonTitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setLessonTitle(val);
                  if (worksheetData) {
                    setWorksheetData(prev => prev ? ({ ...prev, lesson: val }) : prev);
                  }
                }}
                placeholder="Ví dụ: Bài 1: Tôi là học sinh lớp 1"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />

              {/* Quick Lesson Suggestion Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {[
                  { label: 'Bài 1', cmd: 'Tạo phiếu bài tập cuối tuần ôn tập toàn diện Bài 1' },
                  { label: 'Bài 2', cmd: 'Tạo phiếu bài tập cuối tuần ôn tập toàn diện Bài 2' },
                  { label: 'Bài 3', cmd: 'Tạo phiếu bài tập cuối tuần ôn tập toàn diện Bài 3' },
                  { label: 'Bài 4', cmd: 'Tạo phiếu bài tập cuối tuần ôn tập toàn diện Bài 4' },
                  { label: 'Ôn tập Tuần', cmd: 'Tạo phiếu bài tập ôn tập kiến thức trọng tâm cuối tuần' }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      safePlaySound('click');
                      const detected = extractWorksheetLesson(book.title, book.subject, book.grade, chip.cmd);
                      const detectedStr = detected?.lesson || (typeof detected === 'string' ? detected : chip.label);
                      setLessonTitle(detectedStr);
                      setPromptCommand(chip.cmd);
                      if (worksheetData) {
                        setWorksheetData(prev => prev ? ({ ...prev, lesson: detectedStr }) : prev);
                      }
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: promptCommand.includes(chip.label) ? 'rgba(2, 132, 199, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                      color: promptCommand.includes(chip.label) ? '#38bdf8' : '#cbd5e1',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    📖 {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Instruction */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                ✍️ 3. Yêu cầu chi tiết từ giáo viên
              </label>
              <textarea 
                value={promptCommand}
                onChange={(e) => setPromptCommand(e.target.value)}
                placeholder="Ví dụ: Tạo phiếu ôn tập Tuần 10, tập trung vào từ chỉ hoạt động và câu Ai làm gì..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Exercise Types Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                📋 4. Các dạng bài tập xuất hiện trên phiếu
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {EXERCISE_TYPES.map(type => {
                  const isChecked = selectedTypes.includes(type.id);
                  return (
                    <label 
                      key={type.id}
                      onClick={() => handleToggleType(type.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: isChecked ? '#f1f5f9' : '#64748b',
                        cursor: 'pointer',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        backgroundColor: isChecked ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                        transition: 'all 0.15s'
                      }}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ cursor: 'pointer', accentColor: '#0284c7' }}
                      />
                      {type.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Illustration & Diagram Toggle */}
            <div 
              onClick={() => setShowIllustrations(prev => !prev)}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.05rem' }}>🖼️</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                    5. Hình ảnh & Sơ đồ minh họa
                  </div>
                  <div style={{ fontSize: '0.7rem', color: showIllustrations ? '#38bdf8' : '#94a3b8' }}>
                    {showIllustrations ? 'Đang bật (khớp chuẩn kiến thức câu hỏi)' : 'Đang tắt (tiêu chuẩn văn bản sư phạm)'}
                  </div>
                </div>
              </div>
              <input 
                type="checkbox"
                checked={showIllustrations}
                onChange={() => {}}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0284c7' }}
              />
            </div>

            {/* Generate Action Button */}
            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: '12px',
                  background: isLoading 
                    ? '#334155' 
                    : worksheetData 
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                    : 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isLoading ? 'none' : '0 4px 16px rgba(2, 132, 199, 0.45)',
                  transition: 'all 0.2s'
                }}
              >
                {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {isLoading ? 'AI Đang Soạn Phiếu...' : (worksheetData ? '🔄 AI Soạn Lại / Cập Nhật Phiếu' : '✨ BẮT ĐẦU TẠO PHIẾU BÀI TẬP')}
              </button>
              {!worksheetData && (
                <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
                  👆 Bấm nút trên để bắt đầu soạn phiếu theo cài đặt
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Live A4 Printable Preview */}
          <div 
            style={{
              flex: 1,
              backgroundColor: '#0b1120',
              overflowY: 'auto',
              padding: '24px 20px 48px 20px',
              display: 'block'
            }}
          >
            {/* View Mode Switcher Tabs - Only visible when worksheetData exists */}
            {worksheetData && (
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px',
                  borderRadius: '10px',
                  width: 'fit-content',
                  margin: '0 auto 20px auto'
                }}
              >
                <button
                  onClick={() => {
                    safePlaySound('click');
                    setActiveTab('worksheet');
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: activeTab === 'worksheet' ? '#0284c7' : 'transparent',
                    color: activeTab === 'worksheet' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Layout size={14} /> Trang Phiếu Bài Tập (A4)
                </button>
                <button
                  onClick={() => {
                    safePlaySound('click');
                    setActiveTab('answer_key');
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: activeTab === 'answer_key' ? '#0284c7' : 'transparent',
                    color: activeTab === 'answer_key' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Award size={14} /> Trang Đáp Án & Hướng Dẫn Chấm
                </button>
              </div>
            )}

            {/* INITIAL READY STATE: Waiting for teacher to press button */}
            {!isLoading && !worksheetData && (
              <div 
                style={{
                  maxWidth: '720px',
                  margin: '40px auto',
                  padding: '36px 32px',
                  backgroundColor: '#1e293b',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div 
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)'
                  }}
                >
                  <Sparkles size={34} />
                </div>

                <div>
                  <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc' }}>
                    Sẵn Sàng Biên Soạn Phiếu Bài Tập SGK
                  </h3>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '560px' }}>
                    Thầy/Cô hãy kiểm tra hoặc tùy chỉnh các thông số ở cột bên trái (tên bài học, dạng bài, phong cách, hình ảnh minh họa), sau đó nhấn nút bên dưới để AI bắt đầu soạn phiếu bài tập hoàn chỉnh.
                  </p>
                </div>

                {/* Configuration summary card */}
                <div 
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    textAlign: 'left',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '0.82rem'
                  }}
                >
                  <div>
                    <span style={{ color: '#94a3b8' }}>📚 Sách đã chọn:</span>
                    <div style={{ fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                      {book.title} ({book.grade} • Môn {book.subject})
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>📖 Bài học dự kiến:</span>
                    <div style={{ fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                      {typeof lessonTitle === 'string' ? lessonTitle : (lessonTitle?.lesson || 'Ôn tập kiến thức bài học')}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>🎨 Phong cách phiếu:</span>
                    <div style={{ fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                      {activeThemeObj.name} ({activeThemeObj.badge})
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>📋 Dạng bài tập:</span>
                    <div style={{ fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                      {selectedTypes.length} / {EXERCISE_TYPES.length} dạng bài được chọn
                    </div>
                  </div>
                </div>

                {/* Big Center Action Button */}
                <button
                  onClick={handleGenerate}
                  style={{
                    marginTop: '10px',
                    padding: '14px 36px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 6px 20px rgba(2, 132, 199, 0.45)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Sparkles size={20} /> Bấm Vào Đây Để Tạo Phiếu Bài Tập Bằng AI
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div 
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#38bdf8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '40px auto'
                }}
              >
                <RefreshCw size={36} className="animate-spin" />
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{loadingStep}</div>
              </div>
            )}

            {/* A4 Paper Container - 100% Seamless Continuous Document */}
            {!isLoading && worksheetData && (
              <div 
                id="worksheet-printable-area"
                ref={printAreaRef}
                style={{
                  width: '100%',
                  maxWidth: '820px',
                  margin: '0 auto',
                  height: 'auto',
                  minHeight: '1000px',
                  display: 'block',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  borderRadius: selectedTheme === 'primary_cute' ? '18px' : '6px',
                  boxShadow: '0 12px 45px rgba(0, 0, 0, 0.55)',
                  padding: '40px 44px 48px 44px',
                  boxSizing: 'border-box',
                  border: selectedTheme === 'primary_cute' 
                    ? '4px solid #7dd3fc' 
                    : selectedTheme === 'eco_bw'
                    ? '2px solid #000000'
                    : '2px solid #64748b',
                  position: 'relative'
                }}
              >
                {activeTab === 'worksheet' ? (
                  <>
                    {/* Cute corner decorations for primary theme matching sample */}
                    {selectedTheme === 'primary_cute' && (
                      <>
                        <div 
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '16px',
                            fontSize: '1.25rem',
                            display: 'flex',
                            gap: '4px',
                            opacity: 0.9,
                            userSelect: 'none'
                          }}
                        >
                          🖍️ 🎨 🌸
                        </div>
                        <div 
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '16px',
                            fontSize: '1.25rem',
                            display: 'flex',
                            gap: '4px',
                            opacity: 0.9,
                            userSelect: 'none'
                          }}
                        >
                          🌈 ☀️ ✨
                        </div>
                      </>
                    )}

                    {/* HEADER SECTION */}
                    {selectedTheme === 'primary_cute' ? (
                      /* PRIMARY CUTE THEME: Rich Illustrated Header with Mascots matching user sample */
                      <div 
                        style={{
                          marginBottom: '22px',
                          padding: '16px 18px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #fef3c7 100%)',
                          border: '2px dashed #38bdf8',
                          position: 'relative',
                          boxShadow: '0 4px 12px rgba(56, 189, 248, 0.15)'
                        }}
                      >
                        {/* Top Mascot Banner */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          {/* Left Mascot */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              fontSize: '2.4rem',
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                              lineHeight: 1
                            }}>
                              👧🎒
                            </div>
                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#0369a1', letterSpacing: '0.5px' }}>
                                {worksheetData.school || 'HỆ THỐNG GIÁO DỤC SKY-LINE'}
                              </div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                                Môn: {worksheetData.subject} • {worksheetData.grade}
                              </div>
                            </div>
                          </div>

                          {/* Right Mascot */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', backgroundColor: '#fef3c7', padding: '3px 8px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                                ⏱️ {worksheetData.timeAllowed || '35 phút'}
                              </span>
                            </div>
                            <div style={{
                              fontSize: '2.4rem',
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                              lineHeight: 1
                            }}>
                              ☀️🌈
                            </div>
                          </div>
                        </div>

                        {/* Prominent Lesson Ribbon Badge */}
                        {effectiveLesson && (
                          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                            <div 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '5px 18px',
                                borderRadius: '20px',
                                backgroundColor: '#fffbeb',
                                border: '1.5px solid #f59e0b',
                                color: '#b45309',
                                fontSize: '0.92rem',
                                fontWeight: 900,
                                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.15)',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase'
                              }}
                            >
                              <span style={{ fontSize: '1.15rem' }}>📖</span>
                              <span>BÀI HỌC: {effectiveLesson}</span>
                            </div>
                          </div>
                        )}

                        {/* 3D Bubble Title Pill */}
                        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                          <div 
                            style={{
                              display: 'inline-block',
                              padding: '8px 26px',
                              borderRadius: '30px',
                              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                              color: '#ffffff',
                              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35), inset 0 2px 0 rgba(255,255,255,0.4)',
                              border: '2px solid #ffffff'
                            }}
                          >
                            <h2 
                              style={{
                                margin: 0,
                                fontSize: '1.3rem',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                textShadow: '0 1px 2px rgba(0,0,0,0.25)'
                              }}
                            >
                              🌟 {worksheetData.title} 🌟
                            </h2>
                          </div>
                          {worksheetData.subtitle && (
                            <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', fontWeight: 800, color: '#0369a1' }}>
                              {worksheetData.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Cute Student Info Box */}
                        <div 
                          style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            backgroundColor: '#ffffff',
                            border: '1.5px solid #bae6fd',
                            fontSize: '0.84rem',
                            display: 'grid',
                            gridTemplateColumns: '1.8fr 1fr',
                            gap: '8px',
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div>✏️ <strong>Họ và tên:</strong> ................................................................</div>
                            <div>🏫 <strong>Lớp:</strong> ........................ • <strong>Trường:</strong> .................................</div>
                          </div>
                          <div style={{ 
                            padding: '4px 10px', 
                            borderRadius: '8px', 
                            backgroundColor: '#fef9c3', 
                            border: '1px solid #fde047',
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#854d0e' }}>
                              🌟 LỜI KHEN CỦA CÔ GIÁO
                            </div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#d97706', marginTop: '2px' }}>
                              Điểm: ........... ⭐ ⭐ ⭐
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* STANDARD & ECO THEME HEADERS */
                      <>
                        <div 
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.3fr 1fr',
                            gap: '16px',
                            paddingBottom: '14px',
                            marginBottom: '18px',
                            borderBottom: selectedTheme === 'eco_bw' ? '2px solid #000000' : '2px dashed #cbd5e1'
                          }}
                        >
                          {/* School & Subject */}
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                              {worksheetData.school || 'HỆ THỐNG GIÁO DỤC SKY-LINE'}
                            </div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                              Môn: {worksheetData.subject} • {worksheetData.grade}
                            </div>
                            <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: '#64748b', marginTop: '2px' }}>
                              Thời gian làm bài: {worksheetData.timeAllowed || '35 phút'}
                            </div>
                          </div>

                          {/* Student info box */}
                          <div 
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: selectedTheme === 'eco_bw' ? '1px solid #000' : '1px solid #cbd5e1',
                              backgroundColor: '#f8fafc',
                              fontSize: '0.82rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div>Họ và tên: ....................................................</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Lớp: .................</span>
                              <span>Ngày: .................</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0284c7' }}>
                              <span>Điểm: ...........</span>
                              <span>Lời phê: .................</span>
                            </div>
                          </div>
                        </div>

                        {/* Worksheet Main Title */}
                        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                          {effectiveLesson && (
                            <div style={{ 
                              fontSize: '0.96rem', 
                              fontWeight: 900, 
                              color: selectedTheme === 'eco_bw' ? '#000000' : '#0284c7', 
                              textTransform: 'uppercase', 
                              marginBottom: '6px',
                              letterSpacing: '0.5px'
                            }}>
                              📖 BÀI HỌC: {effectiveLesson}
                            </div>
                          )}
                          <h2 
                            style={{
                              margin: 0,
                              fontSize: '1.35rem',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              color: '#0f172a',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {worksheetData.title}
                          </h2>
                          {worksheetData.subtitle && (
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', fontWeight: 700, color: '#475569' }}>
                              {worksheetData.subtitle}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Content Sections - Passed with isPrimaryCute & showIllustrations */}
                    {worksheetData.sections?.map((section, idx) => {
                      const isPrimaryCute = selectedTheme === 'primary_cute';
                      if (section.type === 'multiple_choice') {
                        return <MultipleChoiceSection key={idx} section={section} sectionIdx={idx} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} />;
                      } else if (section.type === 'fill_blank') {
                        return <FillBlankSection key={idx} section={section} sectionIdx={idx} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} />;
                      } else if (section.type === 'matching') {
                        return <MatchingSection key={idx} section={section} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} />;
                      } else if (section.type === 'true_false') {
                        return <TrueFalseSection key={idx} section={section} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} />;
                      } else if (section.type === 'table_matrix') {
                        return <TableMatrixSection key={idx} section={section} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} />;
                      } else if (section.type === 'short_answer') {
                        return <ShortAnswerSection key={idx} section={section} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} />;
                      }
                      return null;
                    })}

                    {/* Footer */}
                    {selectedTheme === 'primary_cute' ? (
                      <div 
                        style={{
                          marginTop: '26px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
                          border: '1.5px dashed #86efac',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px'
                        }}
                      >
                        <span style={{ fontSize: '1.4rem' }}>🐰</span>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#15803d' }}>
                          🌟 Bé hãy làm bài thật cẩn thận và kiểm tra lại trước khi nộp nhé! Chúc em luôn chăm ngoan và đạt điểm 10! 💯
                        </span>
                        <span style={{ fontSize: '1.4rem' }}>🌸</span>
                      </div>
                    ) : (
                      <div 
                        style={{
                          marginTop: '30px',
                          paddingTop: '12px',
                          borderTop: '1px dashed #cbd5e1',
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontStyle: 'italic',
                          color: '#94a3b8'
                        }}
                      >
                        --- Chúc các em học sinh hoàn thành tốt bài tập! ---
                      </div>
                    )}
                  </>
                ) : (
                  /* TEACHER GUIDE & ANSWER KEY VIEW */
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #0284c7', paddingBottom: '12px' }}>
                      <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>
                        📋 ĐÁP ÁN & HƯỚNG DẪN CHẤM CHI TIẾT
                      </h2>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Dành riêng cho giáo viên môn {worksheetData.subject} • {worksheetData.grade}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#166534', marginBottom: '4px' }}>
                          Thang điểm toàn bài: {worksheetData.teacherGuide?.totalPoints || '10 điểm'}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#15803d' }}>
                          {worksheetData.teacherGuide?.notes || 'Giáo viên linh hoạt chấm điểm khuyến khích với các câu trả lời sáng tạo và trình bày sạch đẹp.'}
                        </p>
                      </div>

                      {/* Step by step answer key */}
                      {worksheetData.sections?.map((sec, sIdx) => (
                        <div key={sIdx} style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>
                            {sec.title}
                          </h4>

                          {sec.type === 'multiple_choice' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.84rem' }}>
                              {sec.items?.map((it, i) => (
                                <div key={i} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                                  Câu {i + 1}: Đáp án {it.answer}
                                </div>
                              ))}
                            </div>
                          )}

                          {sec.type === 'fill_blank' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.84rem', color: '#334155' }}>
                              {sec.items?.map((it, i) => (
                                <div key={i}>
                                  <strong>Bài {i + 1}:</strong> Từ cần điền là: <span style={{ color: '#059669', fontWeight: 700 }}>{it.answer}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {sec.type === 'matching' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.84rem', color: '#334155' }}>
                              {sec.pairs?.map((p, i) => (
                                <div key={i}>
                                  • {p.left}  ➔  <span style={{ color: '#059669', fontWeight: 700 }}>{p.right}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {sec.type === 'true_false' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.84rem' }}>
                              {sec.items?.map((it, i) => (
                                <div key={i} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 700 }}>
                                  Câu {i + 1}: [{it.answer}]
                                </div>
                              ))}
                            </div>
                          )}

                          {sec.type === 'short_answer' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                              {sec.items?.map((it, i) => (
                                <div key={i} style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Câu {i + 1}: Gợi ý chấm điểm</div>
                                  <div style={{ color: '#059669', marginTop: '2px', lineHeight: 1.5 }}>
                                    {it.suggestedAnswer || 'Học sinh nêu được 2 ý chính theo nội dung bài học.'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
