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

// ==========================================
// RICH EDUCATIONAL SVG & ILLUSTRATION ENGINE
// Phù hợp chuẩn phiếu bài tập mẫu Tiểu học & GDPT 2018
// ==========================================

function WorksheetIllustrationRenderer({ name = '', size = 52 }) {
  const norm = (name || '').toLowerCase().trim();

  // 1. ÂM NHẠC & NGHỆ THUẬT
  if (norm === 'drum' || norm.includes('trống')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="22" rx="24" ry="9" fill="#dc2626" stroke="#b91c1c" strokeWidth="2" />
        <path d="M 8 22 L 8 42 C 8 48 56 48 56 42 L 56 22 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
        <ellipse cx="32" cy="42" rx="24" ry="9" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
        <ellipse cx="32" cy="22" rx="23" ry="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
        <ellipse cx="32" cy="22" rx="14" ry="5" fill="#fef9c3" stroke="#eab308" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="16" y1="12" x2="28" y2="22" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        <circle cx="28" cy="22" r="3" fill="#dc2626" />
        <line x1="48" y1="12" x2="36" y2="22" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        <circle cx="36" cy="22" r="3" fill="#dc2626" />
        <path d="M 50 14 Q 54 8 58 12" stroke="#3b82f6" strokeWidth="2" fill="none" />
        <circle cx="50" cy="14" r="2" fill="#3b82f6" />
      </svg>
    );
  }

  if (norm === 'music_notes' || norm.includes('nốt') || norm.includes('nhạc') || norm.includes('giai điệu')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" fill="#f0fdf4" />
        <line x1="10" y1="22" x2="54" y2="22" stroke="#bae6fd" strokeWidth="1.5" />
        <line x1="10" y1="28" x2="54" y2="28" stroke="#bae6fd" strokeWidth="1.5" />
        <line x1="10" y1="34" x2="54" y2="34" stroke="#bae6fd" strokeWidth="1.5" />
        <line x1="10" y1="40" x2="54" y2="40" stroke="#bae6fd" strokeWidth="1.5" />
        <circle cx="22" cy="40" r="5" fill="#2563eb" />
        <circle cx="42" cy="34" r="5" fill="#ec4899" />
        <line x1="26" y1="40" x2="26" y2="18" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
        <line x1="46" y1="34" x2="46" y2="12" stroke="#db2777" strokeWidth="3" strokeLinecap="round" />
        <polygon points="26,18 46,12 46,17 26,23" fill="#8b5cf6" />
        <path d="M 48 20 L 50 24 L 54 24 L 51 27 L 52 31 L 48 28 L 44 31 L 45 27 L 42 24 L 46 24 Z" fill="#facc15" />
        <circle cx="14" cy="18" r="2.5" fill="#f59e0b" />
      </svg>
    );
  }

  if (norm === 'singing_kids' || norm.includes('hát') || norm.includes('ca hát')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" fill="#fef3c7" />
        <circle cx="32" cy="28" r="16" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
        <path d="M 18 25 C 18 16 46 16 46 25 C 44 20 20 20 18 25 Z" fill="#78350f" />
        <path d="M 26 26 Q 28 23 30 26" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 34 26 Q 36 23 38 26" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="32" cy="34" rx="4" ry="5" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
        <ellipse cx="32" cy="36" rx="3" ry="2" fill="#f87171" />
        <circle cx="23" cy="30" r="3" fill="#fca5a5" opacity="0.8" />
        <circle cx="41" cy="30" r="3" fill="#fca5a5" opacity="0.8" />
        <path d="M 22 44 C 22 40 42 40 42 44 L 46 54 L 18 54 Z" fill="#3b82f6" />
        <path d="M 48 18 Q 50 12 55 15" stroke="#ec4899" strokeWidth="2" fill="none" />
        <circle cx="48" cy="18" r="2.5" fill="#ec4899" />
      </svg>
    );
  }

  if (norm === 'piano' || norm.includes('đàn') || norm.includes('phím')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="6" y="16" width="52" height="34" rx="6" fill="#1e293b" />
        <rect x="8" y="24" width="48" height="24" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="14" y1="24" x2="14" y2="48" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="20" y1="24" x2="20" y2="48" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="26" y1="24" x2="26" y2="48" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="32" y1="24" x2="32" y2="48" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="38" y1="24" x2="38" y2="48" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="44" y1="24" x2="44" y2="48" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="50" y1="24" x2="50" y2="48" stroke="#cbd5e1" strokeWidth="1" />
        <rect x="11.5" y="24" width="5" height="15" rx="1" fill="#0f172a" />
        <rect x="17.5" y="24" width="5" height="15" rx="1" fill="#0f172a" />
        <rect x="29.5" y="24" width="5" height="15" rx="1" fill="#0f172a" />
        <rect x="35.5" y="24" width="5" height="15" rx="1" fill="#0f172a" />
        <rect x="41.5" y="24" width="5" height="15" rx="1" fill="#0f172a" />
        <circle cx="50" cy="12" r="3" fill="#a855f7" />
        <line x1="53" y1="12" x2="53" y2="4" stroke="#a855f7" strokeWidth="2" />
      </svg>
    );
  }

  if (norm === 'bell' || norm.includes('chuông')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M 32 10 C 22 10 20 28 16 38 L 48 38 C 44 28 42 10 32 10 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
        <ellipse cx="32" cy="40" rx="18" ry="4" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
        <circle cx="32" cy="44" r="5" fill="#b45309" />
        <circle cx="32" cy="8" r="3" fill="#d97706" />
        <path d="M 10 30 Q 6 36 10 42" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 54 30 Q 58 36 54 42" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // 2. TOÁN HỌC & TÍNH TOÁN
  if (norm === 'calculator_cute' || norm.includes('calculator') || norm.includes('máy tính')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="10" y="8" width="44" height="50" rx="10" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
        <rect x="16" y="14" width="32" height="13" rx="4" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5" />
        <circle cx="26" cy="20" r="1.5" fill="#0f172a" />
        <circle cx="38" cy="20" r="1.5" fill="#0f172a" />
        <path d="M 30 22 Q 32 24 34 22" stroke="#0f172a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="16" y="32" width="8" height="6" rx="2" fill="#ffffff" />
        <rect x="28" y="32" width="8" height="6" rx="2" fill="#ffffff" />
        <rect x="40" y="32" width="8" height="6" rx="2" fill="#fde047" />
        <rect x="16" y="41" width="8" height="6" rx="2" fill="#ffffff" />
        <rect x="28" y="41" width="8" height="6" rx="2" fill="#ffffff" />
        <rect x="40" y="41" width="8" height="6" rx="2" fill="#f97316" />
        <rect x="16" y="50" width="20" height="5" rx="2" fill="#ffffff" />
        <rect x="40" y="50" width="8" height="5" rx="2" fill="#10b981" />
      </svg>
    );
  }

  if (norm === 'abacus' || norm.includes('bàn tính')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="8" y="14" width="48" height="38" rx="4" fill="#fef3c7" stroke="#b45309" strokeWidth="3" />
        <line x1="8" y1="26" x2="56" y2="26" stroke="#b45309" strokeWidth="2.5" />
        <line x1="18" y1="14" x2="18" y2="52" stroke="#78350f" strokeWidth="1.5" />
        <line x1="28" y1="14" x2="28" y2="52" stroke="#78350f" strokeWidth="1.5" />
        <line x1="38" y1="14" x2="38" y2="52" stroke="#78350f" strokeWidth="1.5" />
        <line x1="48" y1="14" x2="48" y2="52" stroke="#78350f" strokeWidth="1.5" />
        <rect x="14" y="18" width="8" height="5" rx="2" fill="#ef4444" />
        <rect x="24" y="20" width="8" height="5" rx="2" fill="#3b82f6" />
        <rect x="34" y="18" width="8" height="5" rx="2" fill="#10b981" />
        <rect x="44" y="20" width="8" height="5" rx="2" fill="#f59e0b" />
        <rect x="14" y="32" width="8" height="5" rx="2" fill="#ef4444" />
        <rect x="24" y="38" width="8" height="5" rx="2" fill="#3b82f6" />
        <rect x="34" y="34" width="8" height="5" rx="2" fill="#10b981" />
        <rect x="44" y="44" width="8" height="5" rx="2" fill="#f59e0b" />
      </svg>
    );
  }

  if (norm === 'clock_analog' || norm === 'clock' || norm.includes('đồng hồ') || norm.includes('thời gian')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="26" fill="#fef9c3" stroke="#eab308" strokeWidth="3" />
        <circle cx="32" cy="32" r="3" fill="#854d0e" />
        <text x="32" y="16" textAnchor="middle" fontWeight="bold" fontSize="9" fill="#854d0e">12</text>
        <text x="51" y="35" textAnchor="middle" fontWeight="bold" fontSize="9" fill="#854d0e">3</text>
        <text x="32" y="53" textAnchor="middle" fontWeight="bold" fontSize="9" fill="#854d0e">6</text>
        <text x="13" y="35" textAnchor="middle" fontWeight="bold" fontSize="9" fill="#854d0e">9</text>
        <line x1="32" y1="32" x2="32" y2="18" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="32" x2="44" y2="32" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (norm === 'apple_counter' || norm.includes('táo') || norm.includes('đếm')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="24" cy="38" r="14" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" />
        <path d="M 24 24 Q 28 18 32 20" stroke="#78350f" strokeWidth="2" fill="none" />
        <ellipse cx="28" cy="20" rx="4" ry="2" fill="#22c55e" transform="rotate(-30 28 20)" />
        <circle cx="42" cy="34" r="12" fill="#dc2626" stroke="#b91c1c" strokeWidth="1.5" />
        <path d="M 42 22 Q 46 16 50 18" stroke="#78350f" strokeWidth="2" fill="none" />
        <ellipse cx="46" cy="18" rx="4" ry="2" fill="#22c55e" transform="rotate(-30 46 18)" />
        <ellipse cx="19" cy="33" rx="3" ry="5" fill="#fca5a5" transform="rotate(-30 19 33)" />
      </svg>
    );
  }

  if (norm === 'balance_scale' || norm.includes('cân')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <line x1="32" y1="12" x2="32" y2="52" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <line x1="16" y1="52" x2="48" y2="52" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <line x1="14" y1="20" x2="50" y2="20" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="20" r="3" fill="#b45309" />
        {/* Left pan */}
        <line x1="16" y1="20" x2="10" y2="34" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="16" y1="20" x2="22" y2="34" stroke="#94a3b8" strokeWidth="1.5" />
        <path d="M 8 34 Q 16 40 24 34 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
        {/* Right pan */}
        <line x1="48" y1="20" x2="42" y2="34" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="48" y1="20" x2="54" y2="34" stroke="#94a3b8" strokeWidth="1.5" />
        <path d="M 40 34 Q 48 40 56 34 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
      </svg>
    );
  }

  // 3. TIẾNG VIỆT, ĐỌC HIỂU & HỌC TẬP
  if (norm === 'book_reading' || norm.includes('đọc') || norm.includes('sách')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M 32 46 C 26 44 14 44 8 47 L 8 20 C 14 17 26 17 32 20 C 38 17 50 17 56 20 L 56 47 C 50 44 38 44 32 46 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
        <path d="M 32 44 C 26 42 16 42 10 44 L 10 21 C 16 19 26 19 32 21 C 38 19 48 19 54 21 L 54 44 C 48 42 38 42 32 44 Z" fill="#ffffff" />
        <line x1="32" y1="21" x2="32" y2="44" stroke="#bae6fd" strokeWidth="2" />
        <line x1="15" y1="26" x2="27" y2="26" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="32" x2="27" y2="32" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="37" y1="26" x2="49" y2="26" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="37" y1="32" x2="49" y2="32" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="32,8 34,13 39,13 35,16 37,21 32,18 27,21 29,16 25,13 30,13" fill="#facc15" />
      </svg>
    );
  }

  if (norm === 'books_stack' || norm.includes('vở') || norm.includes('chồng sách')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="10" y="38" width="44" height="12" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
        <rect x="14" y="27" width="40" height="11" rx="3" fill="#ec4899" stroke="#be185d" strokeWidth="1.5" />
        <rect x="18" y="16" width="36" height="11" rx="3" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
        <line x1="16" y1="38" x2="16" y2="50" stroke="#ffffff" strokeWidth="2" />
        <line x1="20" y1="27" x2="20" y2="38" stroke="#ffffff" strokeWidth="2" />
        <line x1="24" y1="16" x2="24" y2="27" stroke="#ca8a04" strokeWidth="2" />
        <polygon points="46,10 50,15 44,18" fill="#10b981" />
      </svg>
    );
  }

  if (norm === 'pencil_cute' || norm === 'pencil' || norm.includes('bút')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <g transform="rotate(25 32 32)">
          <polygon points="32,6 24,20 40,20" fill="#fcd34d" stroke="#d97706" strokeWidth="1.5" />
          <polygon points="32,6 28,13 36,13" fill="#1e293b" />
          <rect x="24" y="20" width="16" height="30" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
          <line x1="29" y1="20" x2="29" y2="50" stroke="#fcd34d" strokeWidth="1.5" />
          <line x1="35" y1="20" x2="35" y2="50" stroke="#d97706" strokeWidth="1.5" />
          <rect x="24" y="50" width="16" height="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 24 54 C 24 60 40 60 40 54 Z" fill="#f472b6" stroke="#db2777" strokeWidth="1.5" />
          <circle cx="28" cy="32" r="1.5" fill="#78350f" />
          <circle cx="36" cy="32" r="1.5" fill="#78350f" />
          <path d="M 30 36 Q 32 38 34 36" stroke="#78350f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // 4. ĐỘNG VẬT & ĐỜI SỐNG HÀNG NGÀY
  if (norm === 'cat_mouse' || norm.includes('mèo')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <ellipse cx="28" cy="36" rx="18" ry="16" fill="#fdba74" stroke="#ea580c" strokeWidth="2" />
        <polygon points="14,24 18,10 26,20" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
        <polygon points="18,22 20,14 24,19" fill="#fecdd3" />
        <polygon points="30,20 38,10 42,24" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
        <polygon points="32,19 36,14 38,22" fill="#fecdd3" />
        <circle cx="21" cy="32" r="2.5" fill="#431407" />
        <circle cx="35" cy="32" r="2.5" fill="#431407" />
        <polygon points="28,36 26,34 30,34" fill="#ec4899" />
        <path d="M 25 38 Q 28 41 31 38" stroke="#431407" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <line x1="12" y1="34" x2="19" y2="34" stroke="#c2410c" strokeWidth="1.5" />
        <line x1="12" y1="37" x2="19" y2="36" stroke="#c2410c" strokeWidth="1.5" />
        <line x1="37" y1="34" x2="44" y2="34" stroke="#c2410c" strokeWidth="1.5" />
        <line x1="37" y1="36" x2="44" y2="37" stroke="#c2410c" strokeWidth="1.5" />
        <ellipse cx="50" cy="46" rx="6" ry="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
        <circle cx="46" cy="44" r="2.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
        <circle cx="48" cy="45" r="1" fill="#0f172a" />
        <path d="M 56 46 Q 60 44 58 40" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }

  if (norm === 'chicken_family' || norm.includes('gà')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <ellipse cx="26" cy="36" rx="16" ry="14" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
        <path d="M 22 20 Q 24 14 28 18 Q 32 14 34 20" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5" />
        <circle cx="20" cy="28" r="2" fill="#7f1d1d" />
        <polygon points="12,30 18,27 18,33" fill="#f59e0b" />
        <circle cx="16" cy="34" r="2" fill="#ef4444" />
        <circle cx="48" cy="42" r="8" fill="#fde047" stroke="#eab308" strokeWidth="1.5" />
        <circle cx="45" cy="40" r="1.5" fill="#713f12" />
        <polygon points="41,42 44,40 44,44" fill="#f97316" />
      </svg>
    );
  }

  if (norm === 'duck_swimming' || norm.includes('vịt')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="36" rx="16" ry="10" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
        <circle cx="22" cy="24" r="9" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
        <circle cx="19" cy="22" r="2" fill="#713f12" />
        <path d="M 13 25 Q 7 26 13 29 Z" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
        <path d="M 6 46 Q 14 42 22 46 Q 30 50 38 46 Q 46 42 54 46" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 12 52 Q 20 48 28 52 Q 36 56 44 52" stroke="#0ea5e9" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (norm === 'dog_loyal' || norm.includes('cún') || norm.includes('chó')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="34" r="16" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
        <path d="M 18 24 Q 12 34 16 38" stroke="#7c2d12" strokeWidth="4" strokeLinecap="round" />
        <path d="M 46 24 Q 52 34 48 38" stroke="#7c2d12" strokeWidth="4" strokeLinecap="round" />
        <circle cx="26" cy="30" r="2" fill="#431407" />
        <circle cx="38" cy="30" r="2" fill="#431407" />
        <ellipse cx="32" cy="36" rx="3.5" ry="2.5" fill="#431407" />
        <path d="M 32 38 L 32 42" stroke="#431407" strokeWidth="1.5" />
        <path d="M 28 42 Q 32 45 36 42" stroke="#431407" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="49" r="3" fill="#f59e0b" />
      </svg>
    );
  }

  if (norm === 'bird_flying' || norm.includes('chim')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" fill="#e0f2fe" />
        <ellipse cx="32" cy="34" rx="14" ry="10" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
        <circle cx="22" cy="26" r="7" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
        <circle cx="20" cy="24" r="1.5" fill="#0f172a" />
        <polygon points="12,26 16,24 16,28" fill="#f97316" />
        <path d="M 30 26 Q 38 14 46 20 Q 40 28 32 30" fill="#0284c7" />
      </svg>
    );
  }

  if (norm === 'paper_plane' || norm.includes('máy bay')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M 8 50 Q 20 48 24 38 Q 28 26 40 22" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" fill="none" />
        <polygon points="56,12 28,34 38,38" fill="#fde047" stroke="#eab308" strokeWidth="1.5" />
        <polygon points="56,12 38,38 48,34" fill="#facc15" stroke="#eab308" strokeWidth="1.5" />
        <polygon points="38,38 36,46 42,40" fill="#eab308" />
      </svg>
    );
  }

  if (norm === 'family_home' || norm.includes('nhà') || norm.includes('gia đình')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <polygon points="32,14 10,32 54,32" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
        <rect x="42" y="16" width="6" height="10" fill="#b91c1c" />
        <rect x="16" y="32" width="32" height="22" fill="#fef9c3" stroke="#d97706" strokeWidth="2" />
        <rect x="28" y="42" width="8" height="12" rx="2" fill="#b45309" />
        <rect x="20" y="36" width="6" height="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
        <rect x="38" y="36" width="6" height="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
        <path d="M 32 8 C 30 4 24 6 26 10 L 32 14 L 38 10 C 40 6 34 4 32 8 Z" fill="#ec4899" />
      </svg>
    );
  }

  if (norm === 'plant_growing' || norm.includes('cây') || norm.includes('mầm') || norm.includes('lá')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M 10 48 C 20 46 44 46 54 48 L 52 56 L 12 56 Z" fill="#78350f" />
        <path d="M 32 48 Q 32 30 32 20" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 32 32 C 20 30 18 20 30 24 C 32 26 32 30 32 32 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
        <path d="M 32 24 C 44 22 46 12 34 16 C 32 18 32 22 32 24 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
        <circle cx="16" cy="16" r="6" fill="#facc15" />
        <line x1="16" y1="6" x2="16" y2="8" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="16" x2="8" y2="16" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (norm === 'earth_globe' || norm.includes('địa cầu') || norm.includes('trái đất')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M 32 48 L 32 58 M 20 58 L 44 58" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <path d="M 16 32 C 16 46 48 46 48 32" stroke="#94a3b8" strokeWidth="2" fill="none" />
        <circle cx="32" cy="28" r="18" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
        <path d="M 22 22 Q 26 16 32 18 Q 36 24 30 28 Q 24 30 22 22 Z" fill="#4ade80" />
        <path d="M 36 28 Q 44 26 42 34 Q 38 38 34 34 Z" fill="#4ade80" />
        <ellipse cx="32" cy="28" rx="18" ry="7" stroke="#bae6fd" strokeWidth="1" fill="none" strokeDasharray="3 2" />
      </svg>
    );
  }

  if (norm === 'village_scene' || norm.includes('làng') || norm.includes('quê')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="48" cy="16" r="8" fill="#f87171" opacity="0.85" />
        <path d="M 0 46 Q 24 36 64 42 L 64 64 L 0 64 Z" fill="#86efac" />
        <path d="M 0 52 Q 32 44 64 50 L 64 64 L 0 64 Z" fill="#22c55e" />
        <polygon points="20,32 10,42 32,42" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
        <rect x="14" y="42" width="14" height="12" fill="#fef3c7" stroke="#78350f" strokeWidth="1.5" />
        <rect x="19" y="47" width="5" height="7" fill="#78350f" />
        <path d="M 40 48 Q 42 34 38 24" stroke="#78350f" strokeWidth="3" fill="none" />
        <path d="M 38 24 Q 28 22 26 26" stroke="#15803d" strokeWidth="2" fill="none" />
        <path d="M 38 24 Q 46 20 52 24" stroke="#15803d" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  if (norm === 'vietnam_flag' || norm.includes('cờ')) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <line x1="12" y1="8" x2="12" y2="58" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <circle cx="12" cy="8" r="3" fill="#eab308" />
        <path d="M 14 12 Q 32 16 48 12 L 48 34 Q 32 38 14 34 Z" fill="#dc2626" />
        <polygon points="31,18 33,23 38,23 34,26 36,31 31,28 26,31 28,26 24,23 29,23" fill="#facc15" />
      </svg>
    );
  }

  // DEFAULT BRIGHT PENCIL / STUDY BADGE
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="28" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
      <g transform="rotate(25 32 32)">
        <polygon points="32,8 24,22 40,22" fill="#fcd34d" stroke="#d97706" strokeWidth="1.5" />
        <polygon points="32,8 28,15 36,15" fill="#1e293b" />
        <rect x="24" y="22" width="16" height="26" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
        <rect x="24" y="48" width="16" height="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
        <path d="M 24 52 C 24 57 40 57 40 52 Z" fill="#f472b6" stroke="#db2777" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// ==========================================
// AUTHENTIC VIETNAMESE ELEMENTARY O LY GRID NOTEBOOK
// Vở kẻ ô ly chuẩn tiểu học (dòng kẻ 4-5 ly xanh nhạt)
// ==========================================

function OlyGridNotebook({ rows = 4, label = 'Bài giải' }) {
  const height = Math.max(90, rows * 28);
  return (
    <div style={{ margin: '8px 0 12px 0', width: '100%', boxSizing: 'border-box' }}>
      {label && (
        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0369a1', marginBottom: '5px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>✍️</span> {label}:
        </div>
      )}
      <div style={{
        width: '100%',
        height: `${height}px`,
        borderRadius: '8px',
        border: '1.5px solid #38bdf8',
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 4px rgba(2, 132, 199, 0.06)'
      }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="oly-subgrid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#e0f2fe" strokeWidth="0.6" />
            </pattern>
            <pattern id="oly-maingrid" width="25" height="25" patternUnits="userSpaceOnUse">
              <rect width="25" height="25" fill="url(#oly-subgrid)" />
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#bae6fd" strokeWidth="1.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#oly-maingrid)" />
        </svg>
      </div>
    </div>
  );
}

// ==========================================
// SMART CONTEXTUAL ILLUSTRATION RESOLVER
// Đảm bảo 100% câu hỏi luôn có hình ảnh minh họa đi kèm
// ==========================================

function resolveIllustrationKey(item, subject = '', grade = '') {
  const explicit = (item?.illustration || '').trim().toLowerCase();
  if (explicit && explicit !== 'null' && explicit !== 'defaulttask' && explicit !== 'none') {
    return explicit;
  }

  const rawText = (
    (item?.question || '') + ' ' + 
    (item?.statement || '') + ' ' + 
    (item?.left || '') + ' ' + 
    (Array.isArray(item?.options) ? item.options.join(' ') : '')
  ).toLowerCase();

  // Âm nhạc
  if (rawText.includes('trống')) return 'drum';
  if (rawText.includes('hát') || rawText.includes('ca hát') || rawText.includes('vui vẻ') || rawText.includes('yêu đời')) return 'singing_kids';
  if (rawText.includes('chuông')) return 'bell';
  if (rawText.includes('piano') || rawText.includes('đàn') || rawText.includes('phím')) return 'piano';
  if (rawText.includes('âm nhạc') || rawText.includes('âm thanh') || rawText.includes('lắng nghe') || rawText.includes('tiếng') || rawText.includes('nhạc')) return 'music_notes';

  // Toán học
  if (rawText.includes('đồng hồ') || rawText.includes('mấy giờ') || rawText.includes('thời gian') || rawText.includes('phút')) return 'clock_analog';
  if (rawText.includes('cân') || rawText.includes('kg') || rawText.includes('nặng')) return 'balance_scale';
  if (rawText.includes('táo') || rawText.includes('quả') || rawText.includes('đếm')) return 'apple_counter';
  if (rawText.includes('bàn tính') || rawText.includes('que tính')) return 'abacus';
  if (rawText.includes('toán') || rawText.includes('phép tính') || rawText.includes('cộng') || rawText.includes('trừ') || rawText.includes('nhân') || rawText.includes('chia') || rawText.includes('số liền') || rawText.includes('dãy số')) return 'calculator_cute';

  // Tiếng Việt / Đọc hiểu / Đời sống
  if (rawText.includes('mèo') || rawText.includes('chuột')) return 'cat_mouse';
  if (rawText.includes('cún') || rawText.includes('chó')) return 'dog_loyal';
  if (rawText.includes('gà')) return 'chicken_family';
  if (rawText.includes('vịt')) return 'duck_swimming';
  if (rawText.includes('chim')) return 'bird_flying';
  if (rawText.includes('bút') || rawText.includes('viết') || rawText.includes('chữ')) return 'pencil_cute';
  if (rawText.includes('sách') || rawText.includes('đọc') || rawText.includes('bài thơ') || rawText.includes('câu chuyện')) return 'book_reading';
  if (rawText.includes('vở') || rawText.includes('tập')) return 'books_stack';
  if (rawText.includes('quét nhà') || rawText.includes('quét') || rawText.includes('dọn dẹp')) return 'sweeping';
  if (rawText.includes('máy bay') || rawText.includes('gấp giấy')) return 'paper_plane';
  if (rawText.includes('cơm') || rawText.includes('nấu')) return 'cooking';
  if (rawText.includes('nhà') || rawText.includes('gia đình') || rawText.includes('bố mẹ') || rawText.includes('ông bà')) return 'family_home';
  if (rawText.includes('cây') || rawText.includes('mầm') || rawText.includes('hoa') || rawText.includes('lá')) return 'plant_growing';
  if (rawText.includes('địa lí') || rawText.includes('trái đất') || rawText.includes('châu á') || rawText.includes('biển')) return 'earth_globe';
  if (rawText.includes('làng') || rawText.includes('quê') || rawText.includes('núi') || rawText.includes('sông')) return 'village_scene';
  if (rawText.includes('cờ') || rawText.includes('tổ quốc') || rawText.includes('việt nam')) return 'vietnam_flag';

  // Môn học mặc định
  const s = (subject || '').toLowerCase();
  if (s.includes('nhạc')) return 'music_notes';
  if (s.includes('toán')) return 'calculator_cute';
  if (s.includes('tiếng việt') || s.includes('văn')) return 'book_reading';
  if (s.includes('địa') || s.includes('sử') || s.includes('lsdl')) return 'village_scene';
  if (s.includes('khoa học') || s.includes('khtn') || s.includes('tnxh')) return 'plant_growing';
  return 'pencil_cute';
}

// ==========================================
// WORKPIECE ILLUSTRATION CARD COMPONENT
// Thẻ tranh minh họa sắc nét kèm viền trang trí
// ==========================================

function WorksheetIllustrationCard({ item, name = '', size = 64, subject = '', grade = '', showIllustrations = true }) {
  if (!showIllustrations) return null;
  const key = resolveIllustrationKey(item || { illustration: name }, subject, grade);

  return (
    <div 
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '14px',
        backgroundColor: '#ffffff',
        border: '1.5px solid #bae6fd',
        boxShadow: '0 3px 8px rgba(2, 132, 199, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        padding: '3px',
        boxSizing: 'border-box'
      }}
      title={`Hình minh họa: ${key}`}
    >
      <WorksheetIllustrationRenderer name={key} size={size - 10} />
    </div>
  );
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

// Fallback compatibility wrapper
function EducationalVisual({ item, showIllustrations, subject, grade }) {
  if (!showIllustrations || !item) return null;
  if (item.diagram) return <EducationalDiagram diagram={item.diagram} />;
  return <WorksheetIllustrationCard item={item} size={54} subject={subject} grade={grade} showIllustrations={showIllustrations} />;
}

// ==========================================
// TOP-LEVEL SUB-COMPONENTS (Rule 1 Compliance)
// ==========================================

function MultipleChoiceSection({ section, sectionIdx, isPrimaryCute, showIllustrations, subject = '', grade = '' }) {
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
                padding: isPrimaryCute ? '12px 14px' : '10px 14px',
                borderRadius: isPrimaryCute ? '16px' : '8px',
                backgroundColor: '#ffffff',
                border: isPrimaryCute ? '2px dashed #7dd3fc' : '1px dashed #cbd5e1',
                boxShadow: isPrimaryCute ? '0 3px 10px rgba(56, 189, 248, 0.1)' : 'none'
              }}
            >
              {/* Question line with Question Badge, Text, and Dedicated Illustrated Picture Card on Right */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                  <span style={{
                    padding: '3px 9px',
                    borderRadius: isPrimaryCute ? '8px' : '4px',
                    backgroundColor: isPrimaryCute ? '#e0f2fe' : '#f1f5f9',
                    color: isPrimaryCute ? '#0284c7' : '#334155',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                    border: isPrimaryCute ? '1px solid #bae6fd' : 'none'
                  }}>
                    Câu {itemIdx + 1}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.5 }}>
                      {item.question}
                    </span>
                    {/* Sơ đồ hình học nếu có */}
                    {showIllustrations && item.diagram && (
                      <EducationalDiagram diagram={item.diagram} />
                    )}
                  </div>
                </div>

                {/* Right: Rich Illustrated Card & Points */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {showIllustrations && (
                    <WorksheetIllustrationCard 
                      item={item} 
                      name={item.illustration} 
                      size={isPrimaryCute ? 60 : 50} 
                      subject={subject} 
                      grade={grade} 
                      showIllustrations={showIllustrations} 
                    />
                  )}
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', whiteSpace: 'nowrap' }}>
                    [{item.points || '1.0 đ'}]
                  </span>
                </div>
              </div>

              {/* 1-ROW HORIZONTAL OPTIONS */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${numOptions}, minmax(0, 1fr))`, 
                gap: '8px', 
                marginTop: '6px',
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

function FillBlankSection({ section, sectionIdx, isPrimaryCute, showIllustrations, subject = '', grade = '' }) {
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
              padding: isPrimaryCute ? '12px 14px' : '10px 14px',
              borderRadius: isPrimaryCute ? '14px' : '8px',
              backgroundColor: '#ffffff',
              border: isPrimaryCute ? '2px dashed #7dd3fc' : '1px dashed #cbd5e1',
              boxShadow: isPrimaryCute ? '0 2px 8px rgba(56, 189, 248, 0.08)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                <span style={{
                  padding: '3px 9px',
                  borderRadius: isPrimaryCute ? '8px' : '4px',
                  backgroundColor: isPrimaryCute ? '#e0f2fe' : '#f1f5f9',
                  color: isPrimaryCute ? '#0284c7' : '#334155',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  flexShrink: 0,
                  border: isPrimaryCute ? '1px solid #bae6fd' : 'none'
                }}>
                  Bài {itemIdx + 1}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.6 }}>
                    {item.question}
                  </span>
                  {item.wordBank && item.wordBank.length > 0 && (
                    <div style={{ 
                      marginTop: '4px', 
                      padding: '4px 12px', 
                      borderRadius: '8px', 
                      background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)', 
                      border: '1px solid #bae6fd',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.82rem',
                      color: '#0369a1'
                    }}>
                      <span>💡 Từ gợi ý:</span>
                      <strong>{item.wordBank.join('  •  ')}</strong>
                    </div>
                  )}
                  {showIllustrations && item.diagram && (
                    <EducationalDiagram diagram={item.diagram} />
                  )}
                </div>
              </div>

              {/* Right: Illustrated Card & Points */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {showIllustrations && (
                  <WorksheetIllustrationCard 
                    item={item} 
                    name={item.illustration} 
                    size={isPrimaryCute ? 60 : 50} 
                    subject={subject} 
                    grade={grade} 
                    showIllustrations={showIllustrations} 
                  />
                )}
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>
                  [{item.points || '1.0 đ'}]
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchingSection({ section, isPrimaryCute, showIllustrations, subject = '', grade = '' }) {
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
        gridTemplateColumns: '1.2fr 1fr',
        gap: '16px',
        padding: '14px 16px',
        borderRadius: isPrimaryCute ? '16px' : '10px',
        backgroundColor: '#ffffff',
        border: isPrimaryCute ? '2px dashed #7dd3fc' : '1.5px dashed #cbd5e1',
        boxShadow: isPrimaryCute ? '0 3px 10px rgba(56, 189, 248, 0.08)' : 'none'
      }}>
        {/* Column A (Has colorful illustrated cards matching Vietnamese sample worksheets) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 800, fontSize: '0.84rem', color: isPrimaryCute ? '#0284c7' : '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🖼️</span> Cột A (Hình ảnh & Khái niệm)
          </div>
          {section.pairs?.map((p, idx) => {
            const pairKey = p.leftIllustration || resolveIllustrationKey({ left: p.left, question: p.left }, subject, grade);
            return (
              <div 
                key={idx}
                style={{
                  padding: '8px 12px',
                  borderRadius: isPrimaryCute ? '12px' : '6px',
                  backgroundColor: '#f8fafc',
                  border: isPrimaryCute ? '1.5px solid #7dd3fc' : '1px solid #cbd5e1',
                  boxShadow: isPrimaryCute ? '0 2px 6px rgba(2, 132, 199, 0.08)' : 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {showIllustrations && (
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #bae6fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                    }}>
                      <WorksheetIllustrationRenderer name={pairKey} size={36} />
                    </div>
                  )}
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{p.left}</span>
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
          <div style={{ fontWeight: 800, fontSize: '0.84rem', color: isPrimaryCute ? '#f59e0b' : '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📝</span> Cột B (Nội dung tương ứng)
          </div>
          {section.pairs?.map((p, idx) => (
            <div 
              key={idx}
              style={{
                padding: '10px 12px',
                borderRadius: isPrimaryCute ? '12px' : '6px',
                backgroundColor: '#f8fafc',
                border: isPrimaryCute ? '1.5px solid #fde047' : '1px solid #cbd5e1',
                boxShadow: isPrimaryCute ? '0 2px 6px rgba(245, 158, 11, 0.08)' : 'none',
                fontSize: '0.86rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: isPrimaryCute ? '48px' : 'auto'
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
              <span style={{ lineHeight: 1.4, fontWeight: 600 }}>{p.right}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrueFalseSection({ section, isPrimaryCute, showIllustrations, subject = '', grade = '' }) {
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
        {section.items?.map((item, idx) => {
          const tfKey = item.illustration || resolveIllustrationKey({ statement: item.statement }, subject, grade);
          return (
            <div 
              key={idx}
              style={{
                padding: '10px 14px',
                borderRadius: isPrimaryCute ? '12px' : '6px',
                backgroundColor: '#ffffff',
                border: isPrimaryCute ? '1.5px solid #bae6fd' : '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {showIllustrations && (
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    <WorksheetIllustrationRenderer name={tfKey} size={30} />
                  </div>
                )}
                <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>
                  <strong>{idx + 1}.</strong> {item.statement}
                </span>
              </div>
              <div style={{ 
                width: '34px', 
                height: '34px', 
                borderRadius: '8px', 
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
          );
        })}
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

function ShortAnswerSection({ section, isPrimaryCute, showIllustrations, subject = '', grade = '' }) {
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
          const isMathProb = item.question?.toLowerCase().includes('toán') || item.question?.toLowerCase().includes('hỏi') || (subject || '').toLowerCase().includes('toán');
          return (
            <div 
              key={item.id || idx}
              style={{
                padding: isPrimaryCute ? '12px 14px' : '0',
                borderRadius: isPrimaryCute ? '14px' : '0',
                backgroundColor: isPrimaryCute ? '#ffffff' : 'transparent',
                border: isPrimaryCute ? '1.5px solid #bae6fd' : 'none',
                boxShadow: isPrimaryCute ? '0 2px 8px rgba(2, 132, 199, 0.06)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.5 }}>
                    Câu {idx + 1}: {item.question}
                  </span>
                  {showIllustrations && item.diagram && (
                    <EducationalDiagram diagram={item.diagram} />
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {showIllustrations && (
                    <WorksheetIllustrationCard 
                      item={item} 
                      name={item.illustration} 
                      size={isPrimaryCute ? 56 : 46} 
                      subject={subject} 
                      grade={grade} 
                      showIllustrations={showIllustrations} 
                    />
                  )}
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>
                    [{item.points || '2.0 đ'}]
                  </span>
                </div>
              </div>

              {/* Khung ô ly kẻ vở tiểu học (authentic Vietnamese notebook grid) */}
              {isPrimaryCute ? (
                <OlyGridNotebook 
                  rows={item.lines || 4} 
                  label={isMathProb ? 'Bài giải' : 'Bài làm'} 
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '6px 0 10px 0' }}>
                  {lines.map((_, lIdx) => (
                    <div 
                      key={lIdx} 
                      style={{ 
                        borderBottom: '1.5px dotted #94a3b8', 
                        height: '24px' 
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
                      const sub = worksheetData.subject || '';
                      const grd = worksheetData.grade || '';
                      if (section.type === 'multiple_choice') {
                        return <MultipleChoiceSection key={idx} section={section} sectionIdx={idx} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} subject={sub} grade={grd} />;
                      } else if (section.type === 'fill_blank') {
                        return <FillBlankSection key={idx} section={section} sectionIdx={idx} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} subject={sub} grade={grd} />;
                      } else if (section.type === 'matching') {
                        return <MatchingSection key={idx} section={section} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} subject={sub} grade={grd} />;
                      } else if (section.type === 'true_false') {
                        return <TrueFalseSection key={idx} section={section} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} subject={sub} grade={grd} />;
                      } else if (section.type === 'table_matrix') {
                        return <TableMatrixSection key={idx} section={section} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} subject={sub} grade={grd} />;
                      } else if (section.type === 'short_answer') {
                        return <ShortAnswerSection key={idx} section={section} isPrimaryCute={isPrimaryCute} showIllustrations={showIllustrations} subject={sub} grade={grd} />;
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
