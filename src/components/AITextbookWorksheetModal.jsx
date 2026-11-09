import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, BookOpen, Layers, CheckCircle2, 
  Printer, Download, Copy, Edit3, Plus, Trash2, Eye, 
  FileText, Check, Layout, Award, RefreshCw, AlertCircle
} from 'lucide-react';
import { SoundFX } from '../utils/sound';
import { 
  WORKSHEET_THEMES, 
  EXERCISE_TYPES, 
  generateAITextbookWorksheet,
  generateCurriculumFallbackWorksheet 
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
  fish: { icon: '🐟', label: 'Cá bơi', bg: '#ccfbf1', border: '#5eead4' },
  frog: { icon: '🐸', label: 'Ếch cốm', bg: '#dcfce7', border: '#86efac' },
  turtle: { icon: '🐢', label: 'Rùa con', bg: '#dcfce7', border: '#86efac' },
  lion: { icon: '🦁', label: 'Sư tử', bg: '#fef3c7', border: '#f59e0b' },
  elephant: { icon: '🐘', label: 'Voi con', bg: '#f1f5f9', border: '#cbd5e1' },
  monkey: { icon: '🐒', label: 'Khỉ nâu', bg: '#ffedd5', border: '#fdba74' },

  // School & Study Tools
  book: { icon: '📖', label: 'Quyển sách', bg: '#e0e7ff', border: '#a5b4fc' },
  books: { icon: '📚', label: 'Chồng sách', bg: '#ede9fe', border: '#c4b5fd' },
  pencil: { icon: '✏️', label: 'Cây bút', bg: '#fef3c7', border: '#fcd34d' },
  ruler: { icon: '📐', label: 'Thước kẻ', bg: '#e0f2fe', border: '#7dd3fc' },
  backpack: { icon: '🎒', label: 'Balo đi học', bg: '#fae8ff', border: '#e879f9' },
  school: { icon: '🏫', label: 'Ngôi trường', bg: '#fee2e2', border: '#fca5a5' },
  desk: { icon: '🪑', label: 'Bàn học', bg: '#ffedd5', border: '#fdba74' },
  scissors: { icon: '✂️', label: 'Cây kéo', bg: '#f1f5f9', border: '#94a3b8' },
  palette: { icon: '🎨', label: 'Hộp màu', bg: '#fdf4ff', border: '#d946ef' },
  calculator: { icon: '🧮', label: 'Bàn tính', bg: '#dcfce7', border: '#86efac' },
  notebook: { icon: '📓', label: 'Quyển vở', bg: '#e0f2fe', border: '#38bdf8' },

  // Fruits & Foods
  apple: { icon: '🍎', label: 'Quả táo', bg: '#fee2e2', border: '#ef4444' },
  strawberry: { icon: '🍓', label: 'Dâu tây', bg: '#ffe4e6', border: '#fb7185' },
  orange: { icon: '🍊', label: 'Quả cam', bg: '#ffedd5', border: '#fb923c' },
  banana: { icon: '🍌', label: 'Quả chuối', bg: '#fef9c3', border: '#facc15' },
  watermelon: { icon: '🍉', label: 'Dưa hấu', bg: '#dcfce7', border: '#4ade80' },
  icecream: { icon: '🍦', label: 'Cây kem', bg: '#fce7f3', border: '#f472b6' },
  candy: { icon: '🍬', label: 'Kẹo ngọt', bg: '#fae8ff', border: '#c084fc' },
  cake: { icon: '🎂', label: 'Bánh kem', bg: '#fef3c7', border: '#fcd34d' },
  cooking: { icon: '🍲', label: 'Nấu ăn', bg: '#fef3c7', border: '#f59e0b' },

  // Nature, Weather & Shapes
  flower: { icon: '🌸', label: 'Bông hoa', bg: '#fce7f3', border: '#f472b6' },
  sunflower: { icon: '🌻', label: 'Hoa hướng dương', bg: '#fef08a', border: '#eab308' },
  tree: { icon: '🌳', label: 'Cây xanh', bg: '#dcfce7', border: '#86efac' },
  sun: { icon: '☀️', label: 'Mặt trời', bg: '#fef08a', border: '#eab308' },
  rainbow: { icon: '🌈', label: 'Cầu vồng', bg: '#fdf4ff', border: '#d946ef' },
  cloud: { icon: '☁️', label: 'Mây trắng', bg: '#f0f9ff', border: '#bae6fd' },
  star: { icon: '⭐', label: 'Ngôi sao', bg: '#fef9c3', border: '#eab308' },
  moon: { icon: '🌙', label: 'Mặt trăng', bg: '#fef3c7', border: '#facc15' },
  earth: { icon: '🌍', label: 'Trái Đất', bg: '#e0f2fe', border: '#3b82f6' },
  triangle: { icon: '🔺', label: 'Hình tam giác', bg: '#fee2e2', border: '#f87171' },
  circle: { icon: '🔴', label: 'Hình tròn', bg: '#fee2e2', border: '#ef4444' },
  square: { icon: '🟦', label: 'Hình vuông', bg: '#e0f2fe', border: '#60a5fa' },
  rectangle: { icon: '🟧', label: 'Hình chữ nhật', bg: '#ffedd5', border: '#fb923c' },

  // Actions & Sports
  runner: { icon: '🏃‍♂️', label: 'Hoạt động', bg: '#ffedd5', border: '#f97316' },
  soccer: { icon: '⚽', label: 'Quả bóng', bg: '#f1f5f9', border: '#94a3b8' },
  swim: { icon: '🏊‍♂️', label: 'Bơi lội', bg: '#e0f2fe', border: '#38bdf8' },
  sing: { icon: '🎤', label: 'Ca hát', bg: '#fae8ff', border: '#e879f9' },
  car: { icon: '🚗', label: 'Ô tô', bg: '#e0f2fe', border: '#0284c7' },
  bicycle: { icon: '🚲', label: 'Xe đạp', bg: '#dcfce7', border: '#4ade80' },
  balloon: { icon: '🎈', label: 'Bóng bay', bg: '#fee2e2', border: '#f87171' },
  clock: { icon: '⏰', label: 'Đồng hồ', bg: '#fef3c7', border: '#f59e0b' },
  question: { icon: '❓', label: 'Dấu hỏi', bg: '#e0f2fe', border: '#38bdf8' }
};

function getIllustration(text = '', explicit = '') {
  if (explicit && CUTE_ILLUSTRATIONS_MAP[explicit]) return CUTE_ILLUSTRATIONS_MAP[explicit];
  const t = (text || '').toLowerCase();
  if (t.includes('mèo') || t.includes('cat')) return CUTE_ILLUSTRATIONS_MAP.cat;
  if (t.includes('cún') || t.includes('chó') || t.includes('dog')) return CUTE_ILLUSTRATIONS_MAP.dog;
  if (t.includes('thỏ') || t.includes('bunny')) return CUTE_ILLUSTRATIONS_MAP.bunny;
  if (t.includes('gấu') || t.includes('bear')) return CUTE_ILLUSTRATIONS_MAP.bear;
  if (t.includes('chim') || t.includes('bay') || t.includes('bird')) return CUTE_ILLUSTRATIONS_MAP.bird;
  if (t.includes('vịt') || t.includes('duck')) return CUTE_ILLUSTRATIONS_MAP.duck;
  if (t.includes('cá') || t.includes('fish')) return CUTE_ILLUSTRATIONS_MAP.fish;
  if (t.includes('ếch') || t.includes('frog')) return CUTE_ILLUSTRATIONS_MAP.frog;
  if (t.includes('rùa') || t.includes('turtle')) return CUTE_ILLUSTRATIONS_MAP.turtle;
  if (t.includes('sư tử') || t.includes('lion')) return CUTE_ILLUSTRATIONS_MAP.lion;
  if (t.includes('sách') || t.includes('đọc') || t.includes('book')) return CUTE_ILLUSTRATIONS_MAP.book;
  if (t.includes('vở') || t.includes('tập') || t.includes('notebook')) return CUTE_ILLUSTRATIONS_MAP.notebook;
  if (t.includes('bút') || t.includes('viết') || t.includes('pencil')) return CUTE_ILLUSTRATIONS_MAP.pencil;
  if (t.includes('thước') || t.includes('ruler')) return CUTE_ILLUSTRATIONS_MAP.ruler;
  if (t.includes('kéo') || t.includes('cắt')) return CUTE_ILLUSTRATIONS_MAP.scissors;
  if (t.includes('cặp') || t.includes('balo') || t.includes('backpack')) return CUTE_ILLUSTRATIONS_MAP.backpack;
  if (t.includes('trường') || t.includes('lớp') || t.includes('school')) return CUTE_ILLUSTRATIONS_MAP.school;
  if (t.includes('bàn') || t.includes('ghế') || t.includes('desk')) return CUTE_ILLUSTRATIONS_MAP.desk;
  if (t.includes('bóng bay') || t.includes('balloon')) return CUTE_ILLUSTRATIONS_MAP.balloon;
  if (t.includes('bóng') || t.includes('đá bóng') || t.includes('soccer')) return CUTE_ILLUSTRATIONS_MAP.soccer;
  if (t.includes('hoa hướng dương')) return CUTE_ILLUSTRATIONS_MAP.sunflower;
  if (t.includes('hoa') || t.includes('bông') || t.includes('flower')) return CUTE_ILLUSTRATIONS_MAP.flower;
  if (t.includes('mặt trời') || t.includes('nắng') || t.includes('sun')) return CUTE_ILLUSTRATIONS_MAP.sun;
  if (t.includes('cầu vồng') || t.includes('rainbow')) return CUTE_ILLUSTRATIONS_MAP.rainbow;
  if (t.includes('cây') || t.includes('rừng') || t.includes('tree')) return CUTE_ILLUSTRATIONS_MAP.tree;
  if (t.includes('táo') || t.includes('apple')) return CUTE_ILLUSTRATIONS_MAP.apple;
  if (t.includes('dâu') || t.includes('strawberry')) return CUTE_ILLUSTRATIONS_MAP.strawberry;
  if (t.includes('cam') || t.includes('orange')) return CUTE_ILLUSTRATIONS_MAP.orange;
  if (t.includes('chuối') || t.includes('banana')) return CUTE_ILLUSTRATIONS_MAP.banana;
  if (t.includes('dưa hấu') || t.includes('watermelon')) return CUTE_ILLUSTRATIONS_MAP.watermelon;
  if (t.includes('kem') || t.includes('ice cream')) return CUTE_ILLUSTRATIONS_MAP.icecream;
  if (t.includes('kẹo') || t.includes('candy')) return CUTE_ILLUSTRATIONS_MAP.candy;
  if (t.includes('bánh') || t.includes('cake')) return CUTE_ILLUSTRATIONS_MAP.cake;
  if (t.includes('chạy') || t.includes('nhảy') || t.includes('hoạt động') || t.includes('runner')) return CUTE_ILLUSTRATIONS_MAP.runner;
  if (t.includes('bơi') || t.includes('swim')) return CUTE_ILLUSTRATIONS_MAP.swim;
  if (t.includes('hát') || t.includes('ca hát') || t.includes('sing')) return CUTE_ILLUSTRATIONS_MAP.sing;
  if (t.includes('xe đạp') || t.includes('bicycle')) return CUTE_ILLUSTRATIONS_MAP.bicycle;
  if (t.includes('ô tô') || t.includes('xe máy') || t.includes('xe') || t.includes('car')) return CUTE_ILLUSTRATIONS_MAP.car;
  if (t.includes('giờ') || t.includes('thời gian') || t.includes('tuần') || t.includes('đồng hồ')) return CUTE_ILLUSTRATIONS_MAP.clock;
  if (t.includes('tam giác')) return CUTE_ILLUSTRATIONS_MAP.triangle;
  if (t.includes('tròn')) return CUTE_ILLUSTRATIONS_MAP.circle;
  if (t.includes('vuông')) return CUTE_ILLUSTRATIONS_MAP.square;
  if (t.includes('chữ nhật')) return CUTE_ILLUSTRATIONS_MAP.rectangle;
  if (t.includes('đỏ')) return CUTE_ILLUSTRATIONS_MAP.circle;
  if (t.includes('xanh lá')) return CUTE_ILLUSTRATIONS_MAP.tree;
  if (t.includes('xanh') || t.includes('biển')) return CUTE_ILLUSTRATIONS_MAP.square;
  if (t.includes('vàng')) return CUTE_ILLUSTRATIONS_MAP.sunflower;
  if (t.includes('bản đồ') || t.includes('châu lục') || t.includes('trái đất') || t.includes('địa lí')) return CUTE_ILLUSTRATIONS_MAP.earth;
  if (t.includes('phép tính') || t.includes('cộng') || t.includes('trừ') || t.includes('toán')) return CUTE_ILLUSTRATIONS_MAP.calculator;
  return CUTE_ILLUSTRATIONS_MAP.star;
}

const CUTE_OPTION_THEMES = [
  ['🍎', '🍓', '🍊', '🍇'],
  ['🐱', '🐶', '🐰', '🐻'],
  ['✏️', '📖', '📏', '🎒'],
  ['🌸', '🌻', '🌷', '🌺'],
  ['⭐', '🌟', '✨', '💫'],
  ['🚗', '🚲', '✈️', '⛵'],
  ['🎈', '🎁', '🎨', '🧩'],
  ['🔺', '🔴', '🟦', '🟧']
];

function getOptionIllustration(item, opt, optIdx, itemIdx) {
  // 1. If item has explicit optionIcons
  if (item?.optionIcons && item.optionIcons[optIdx]) {
    return item.optionIcons[optIdx];
  }
  if (typeof opt === 'object' && opt?.icon) {
    return opt.icon;
  }
  const optStr = typeof opt === 'string' ? opt : (opt?.text || '');
  // 2. Semantic matching from keyword
  const matched = getIllustration(optStr);
  if (matched && matched.icon && matched.icon !== '⭐') {
    return matched.icon;
  }
  // 3. Fallback theme by question index so all options get vibrant distinct icons
  const theme = CUTE_OPTION_THEMES[itemIdx % CUTE_OPTION_THEMES.length];
  return theme[optIdx % theme.length];
}

function CuteIllustrationBadge({ item, text, isPrimaryCute }) {
  if (!isPrimaryCute) return null;
  const illu = getIllustration(item?.question || text || '', item?.illustration || item?.icon);
  return (
    <div 
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        backgroundColor: illu.bg,
        border: `2px solid ${illu.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
        flexShrink: 0
      }}
      title={illu.label}
    >
      {item?.icon || illu.icon}
    </div>
  );
}

// ==========================================
// TOP-LEVEL SUB-COMPONENTS (Rule 1 Compliance)
// ==========================================

function MultipleChoiceSection({ section, sectionIdx, isPrimaryCute }) {
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
              {/* Question line with Illustration */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <CuteIllustrationBadge item={item} isPrimaryCute={isPrimaryCute} />
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.4 }}>
                    Câu {itemIdx + 1}: {item.question}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', whiteSpace: 'nowrap' }}>
                  [{item.points || '1.0 đ'}]
                </span>
              </div>

              {/* 1-ROW HORIZONTAL OPTIONS (ABCD NẰM TRÊN 1 HÀNG CHUẨN ĐẸP) */}
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
                  // Clean redundant leading "A. ", "B. ", "a. "
                  const optCleanText = optStr.replace(/^[A-Da-d0-9][\.\:\)\s]+/, '').trim() || optStr;
                  const optIcon = getOptionIllustration(item, opt, optIdx, itemIdx);

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

                      {/* Option Illustration Image/Icon for Elementary Worksheet */}
                      {isPrimaryCute && (
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

function FillBlankSection({ section, sectionIdx, isPrimaryCute }) {
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <CuteIllustrationBadge item={item} isPrimaryCute={isPrimaryCute} />
                <span style={{ fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.6 }}>
                  <strong>Bài {itemIdx + 1}:</strong> {item.question}
                </span>
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

function MatchingSection({ section, isPrimaryCute }) {
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
        {/* Column A: In Cute Theme, renders Picture Cards just like sample worksheets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 800, fontSize: '0.82rem', color: isPrimaryCute ? '#0284c7' : '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isPrimaryCute && <span>🖼️</span>} Cột A {isPrimaryCute && '(Hình ảnh minh họa)'}
          </div>
          {section.pairs?.map((p, idx) => {
            const illu = getIllustration(p.left, p.leftIcon);
            return (
              <div 
                key={idx}
                style={{
                  padding: isPrimaryCute ? '8px 12px' : '8px 12px',
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
                  {isPrimaryCute && (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: illu.bg,
                      border: `2px solid ${illu.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      flexShrink: 0
                    }}>
                      {p.leftIcon || illu.icon}
                    </div>
                  )}
                  <div>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{p.left}</span>
                    {isPrimaryCute && (
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        Tranh: {illu.label}
                      </div>
                    )}
                  </div>
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
            {isPrimaryCute && <span>📝</span>} Cột B {isPrimaryCute && '(Nội dung nối)'}
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
              {isPrimaryCute && (
                <span style={{ fontSize: '1.1rem' }}>{idx % 2 === 0 ? '🌸' : '🍀'}</span>
              )}
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

function ShortAnswerSection({ section, isPrimaryCute }) {
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
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
                  Câu {idx + 1}: {item.question}
                </span>
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
  const [selectedTypes, setSelectedTypes] = useState([
    'multiple_choice', 'fill_blank', 'matching', 'true_false', 'table_matrix', 'short_answer'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [worksheetData, setWorksheetData] = useState(null);
  const [activeTab, setActiveTab] = useState('worksheet'); // 'worksheet' | 'answer_key'
  const [copySuccess, setCopySuccess] = useState(false);

  const printAreaRef = useRef(null);

  // Auto-init on opening
  useEffect(() => {
    if (isOpen && book) {
      setCopySuccess(false);
      setActiveTab('worksheet');
      const isKid = (book.grade || '').includes('1') || (book.grade || '').includes('2') || (book.grade || '').includes('3') || (book.grade || '').includes('4') || (book.grade || '').includes('5');
      const initialTheme = isKid ? 'primary_cute' : 'standard_secondary';
      setSelectedTheme(initialTheme);
      
      // 1. Immediately create rich worksheet from curriculum engine so teacher NEVER faces empty screen
      const immediateWs = generateCurriculumFallbackWorksheet({
        textbookTitle: book.title || 'Sách Giáo Khoa',
        grade: book.grade || 'Lớp 2',
        subject: book.subject || 'Tiếng Việt',
        theme: initialTheme,
        selectedTypes
      });
      setWorksheetData(immediateWs);

      // 2. Then trigger asynchronous AI enhancement
      performGeneration(initialTheme, selectedTypes, promptCommand);
    }
  }, [isOpen, book?.id]);

  const handleToggleType = (typeId) => {
    safePlaySound('click');
    const updatedTypes = selectedTypes.includes(typeId)
      ? (selectedTypes.length === 1 ? selectedTypes : selectedTypes.filter(t => t !== typeId))
      : [...selectedTypes, typeId];
    
    setSelectedTypes(updatedTypes);
    
    // Immediately refresh visible sections
    const refreshedWs = generateCurriculumFallbackWorksheet({
      textbookTitle: book.title || 'Sách Giáo Khoa',
      grade: book.grade || 'Lớp 2',
      subject: book.subject || 'Tiếng Việt',
      theme: selectedTheme,
      selectedTypes: updatedTypes,
      promptCommand
    });
    setWorksheetData(refreshedWs);
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

    let text = `${worksheetData.title}\n${worksheetData.subtitle}\n`;
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

            {/* Prompt Instruction */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                ✍️ 2. Yêu cầu biên soạn từ giáo viên
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
                📋 3. Các dạng bài tập xuất hiện trên phiếu
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

            {/* Re-generate Action Button */}
            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                {isLoading ? <RefreshCw size={17} className="animate-spin" /> : <Sparkles size={17} />}
                {isLoading ? 'AI Đang Soạn Phiếu...' : '⚡ AI Soạn Lại Phiếu Này'}
              </button>
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
            {/* View Mode Switcher Tabs */}
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
                  margin: '0 auto'
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

                    {/* Content Sections - Passed with isPrimaryCute */}
                    {worksheetData.sections?.map((section, idx) => {
                      const isPrimaryCute = selectedTheme === 'primary_cute';
                      if (section.type === 'multiple_choice') {
                        return <MultipleChoiceSection key={idx} section={section} sectionIdx={idx} isPrimaryCute={isPrimaryCute} />;
                      } else if (section.type === 'fill_blank') {
                        return <FillBlankSection key={idx} section={section} sectionIdx={idx} isPrimaryCute={isPrimaryCute} />;
                      } else if (section.type === 'matching') {
                        return <MatchingSection key={idx} section={section} isPrimaryCute={isPrimaryCute} />;
                      } else if (section.type === 'true_false') {
                        return <TrueFalseSection key={idx} section={section} isPrimaryCute={isPrimaryCute} />;
                      } else if (section.type === 'table_matrix') {
                        return <TableMatrixSection key={idx} section={section} isPrimaryCute={isPrimaryCute} />;
                      } else if (section.type === 'short_answer') {
                        return <ShortAnswerSection key={idx} section={section} isPrimaryCute={isPrimaryCute} />;
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
