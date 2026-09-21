import React, { useState, useRef } from 'react';
import { 
  Printer, 
  FileText, 
  Download, 
  Sparkles, 
  RefreshCw, 
  UserCheck, 
  Users, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Heart,
  BookOpen,
  Maximize2,
  X,
  Plus,
  Trash2,
  Edit3,
  Building
} from 'lucide-react';

export function DeskNameCardGenerator({ classData, currentUser, onClose }) {
  // Roster state
  const initialStudents = (classData?.students && classData.students.length > 0)
    ? classData.students.map(s => typeof s === 'string' ? s : s.name)
    : ['TUẤN ANH', 'KHÁNH ANH', 'THIỆN ÂN', 'UY VŨ', 'HOÀNG KIM', 'MINH KHANG', 'CHI DĂNG'];

  const [studentList, setStudentList] = useState(initialStudents);
  const [inputText, setInputText] = useState(initialStudents.join('\n'));
  const [showEditListModal, setShowEditListModal] = useState(false);

  // Template & Customization state
  const [template, setTemplate] = useState('nature'); // 'nature' | 'playful' | 'minimal' | 'teacher_desk'
  const [thankYouMsg, setThankYouMsg] = useState('Cảm ơn Quý phụ huynh đã đến tham dự buổi họp');
  const [includeTeacherCard, setIncludeTeacherCard] = useState(true);
  const [teacherName, setTeacherName] = useState(currentUser?.name || 'Hoàng Thị Phấn');
  const [schoolName, setSchoolName] = useState(currentUser?.school || 'Trường THCS Sky-Line');
  const [schoolYear, setSchoolYear] = useState(classData?.schoolYear || '2026 - 2027');
  const [classNameStr, setClassNameStr] = useState(classData?.className || 'Lớp 6A1');

  // Preview state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState('a4_flat'); // 'a4_flat' | 'tent_3d'

  // Ref for print window
  const printContainerRef = useRef(null);

  // Sync edited text into array
  const handleSaveTextList = () => {
    const lines = inputText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length > 0) {
      setStudentList(lines);
      setCurrentIndex(0);
    }
    setShowEditListModal(false);
  };

  const handleReloadFromClass = () => {
    if (classData?.students && classData.students.length > 0) {
      const names = classData.students.map(s => typeof s === 'string' ? s : s.name);
      setStudentList(names);
      setInputText(names.join('\n'));
      setCurrentIndex(0);
    }
  };

  // Full list of cards to render (Students + optional Teacher Card at start)
  const allCardsToPrint = [
    ...(includeTeacherCard ? [{ isTeacher: true, name: `GVCN: ${teacherName}` }] : []),
    ...studentList.map(name => ({ isTeacher: false, name }))
  ];

  // Printable HTML builder for A4 folded 4-stripe layout
  const generatePrintableHTML = () => {
    const cardsHTML = allCardsToPrint.map((item, idx) => {
      const isTeacher = item.isTeacher;
      const displayName = item.name.toUpperCase();

      let themeBg = 'linear-gradient(180deg, #556b2f 0%, #6b8e23 100%)';
      let textColor = '#d97706';
      let fontStyle = "'Montserrat', sans-serif";

      if (template === 'nature') {
        themeBg = 'linear-gradient(180deg, #4d7c0f 0%, #65a30d 100%)';
        textColor = '#ea580c';
      } else if (template === 'playful') {
        themeBg = 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)';
        textColor = '#ec4899';
      } else if (template === 'minimal') {
        themeBg = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
        textColor = '#38bdf8';
      }

      return `
        <div class="a4-page">
          <!-- Stripe 1 (Top 25%): Back Fold Flap Base -->
          <div class="stripe stripe-1">
            <div class="fold-indicator">----- NẾP GẤP ĐÁY SAU -----</div>
          </div>

          <!-- Stripe 2 (Upper Middle 25%): FRONT NAME TENT - ROTATED 180 DEG -->
          <div class="stripe stripe-2">
            <div class="stripe-content rotated-180">
              <div class="card-inner-box">
                ${isTeacher ? `
                  <div class="school-header">${schoolName}</div>
                  <div class="teacher-title">${displayName}</div>
                  <div class="sub-info">Năm Học: ${schoolYear} • ${classNameStr}</div>
                ` : `
                  <div class="student-avatar-badge">👦👧</div>
                  <div class="student-name-text">${displayName}</div>
                  <div class="sub-info">${classNameStr} • ${schoolName}</div>
                `}
              </div>
            </div>
          </div>

          <!-- Stripe 3 (Lower Middle 25%): REAR THANK YOU TENT - FACING PARENT (0 DEG) -->
          <div class="stripe stripe-3">
            <div class="stripe-content">
              <div class="card-inner-box">
                <div class="illustration-row">
                  <span class="illus-icon">👩‍🏫📚</span>
                  <div class="thank-you-text">${thankYouMsg}</div>
                </div>
                <div class="school-footer">${schoolName} • Kính Chúc Quý Phụ Huynh Sức Khỏe & Thành Công</div>
              </div>
            </div>
          </div>

          <!-- Stripe 4 (Bottom 25%): Front Fold Flap Base -->
          <div class="stripe stripe-4">
            <div class="fold-indicator">----- NẾP GẤP ĐÁY TRƯỚC -----</div>
          </div>
        </div>
      `;
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bảng Tên Để Bàn Họp Phụ Huynh - ${classNameStr}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #ffffff;
            color: #0f172a;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .a4-page {
            width: 210mm;
            height: 297mm;
            page-break-after: always;
            position: relative;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .stripe {
            width: 100%;
            height: 74.25mm;
            position: relative;
            border-bottom: 1.5px dashed #cbd5e1;
            display: flex;
            align-items: center;
            justify: center;
            overflow: hidden;
          }
          .stripe-1, .stripe-4 {
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .fold-indicator {
            font-size: 11px;
            color: #94a3b8;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .stripe-2 {
            background: ${template === 'nature' ? '#65a30d' : template === 'playful' ? '#0284c7' : '#1e293b'};
            padding: 8mm;
          }
          .stripe-3 {
            background: ${template === 'nature' ? '#84cc16' : template === 'playful' ? '#0d9488' : '#334155'};
            padding: 8mm;
          }
          .stripe-content {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .rotated-180 {
            transform: rotate(180deg);
          }
          .card-inner-box {
            width: 100%;
            height: 100%;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            padding: 6mm 10mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            border: 3px dashed ${template === 'nature' ? '#a3e635' : template === 'playful' ? '#38bdf8' : '#94a3b8'};
          }
          .student-avatar-badge {
            font-size: 24px;
            margin-bottom: 2mm;
          }
          .student-name-text {
            font-size: 34px;
            font-weight: 900;
            color: ${template === 'nature' ? '#ea580c' : template === 'playful' ? '#db2777' : '#0284c7'};
            letter-spacing: 1px;
            line-height: 1.1;
            margin-bottom: 2mm;
          }
          .teacher-title {
            font-size: 28px;
            font-weight: 900;
            color: #dc2626;
            margin-bottom: 2mm;
          }
          .school-header {
            font-size: 14px;
            font-weight: 800;
            color: #0284c7;
            text-transform: uppercase;
            margin-bottom: 2mm;
          }
          .sub-info {
            font-size: 13px;
            font-weight: 700;
            color: #64748b;
          }
          .illustration-row {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .illus-icon {
            font-size: 36px;
          }
          .thank-you-text {
            font-size: 20px;
            font-weight: 800;
            font-style: italic;
            color: ${template === 'nature' ? '#c2410c' : template === 'playful' ? '#0f766e' : '#38bdf8'};
            line-height: 1.3;
          }
          .school-footer {
            font-size: 11px;
            color: #94a3b8;
            margin-top: 4mm;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        ${cardsHTML}
      </body>
      </html>
    `;
  };

  // Direct A4 Print Handler
  const handlePrintAllPDF = () => {
    const htmlContent = generatePrintableHTML();
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Vui lòng cho phép mở Cửa sổ Bật lên (Pop-up) trên trình duyệt để In / Xuất PDF!");
      return;
    }
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 600);
  };

  // Export HTML Word Doc
  const handleExportWordDoc = () => {
    const htmlContent = generatePrintableHTML();
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bang_Ten_De_Ban_Hop_Phu_Huynh_${classNameStr.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentItem = allCardsToPrint[currentIndex] || allCardsToPrint[0];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(2, 6, 23, 0.94)', backdropFilter: 'blur(12px)',
      zIndex: 2200, display: 'flex', flexDirection: 'column',
      color: '#f8fafc', fontFamily: 'Montserrat, Inter, sans-serif'
    }}>
      
      {/* 1. Header Bar */}
      <div style={{
        padding: '16px 28px',
        background: 'linear-gradient(135deg, #091a28 0%, #0d2b3a 100%)',
        borderBottom: '1.5px solid rgba(139, 92, 246, 0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)'
          }}>
            <Building size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#c4b5fd', margin: 0, lineHeight: 1.2 }}>
              TẠO BẢNG TÊN ĐỂ BÀN HỌP PHỤ HUYNH (KHỔ A4 GẤP 4)
            </h2>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
              Chuẩn mẫu gập lều 3D A4 • Mặt trước Tên Học Sinh (Lật 180°) • Mặt đối diện Lời cảm ơn Phụ Huynh
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleExportWordDoc}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff', border: 'none', borderRadius: '12px',
              padding: '10px 18px', fontWeight: 800, fontSize: '0.88rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)'
            }}
          >
            <FileText size={18} /> Xuất File Word (.DOC)
          </button>

          <button
            onClick={handlePrintAllPDF}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff', border: 'none', borderRadius: '12px',
              padding: '10px 20px', fontWeight: 900, fontSize: '0.9rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)'
            }}
          >
            <Printer size={18} /> 🖨️ IN TẤT CẢ / XUẤT PDF A4 ({allCardsToPrint.length} TRANG)
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)', border: 'none',
                color: '#cbd5e1', borderRadius: '10px', padding: '8px 12px',
                cursor: 'pointer'
              }}
            >
              <X size={22} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Studio Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '20px', gap: '20px' }}>
        
        {/* Left Sidebar: Controls & Options Panel */}
        <div style={{
          width: '380px', flexShrink: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px',
          overflowY: 'auto'
        }}>
          
          {/* Section A: Template Selector */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#c4b5fd', display: 'block', marginBottom: '8px' }}>
              🎨 PHONG CÁCH GIAO DIỆN (TEMPLATE):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { id: 'nature', name: '🌿 Cây Xanh (Ảnh 1)', desc: 'Nền cỏ lá mầm xanh' },
                { id: 'playful', name: '🎨 Học Đường (Ảnh 2)', desc: 'Họa tiết ABC pastel' },
                { id: 'teacher_desk', name: '👩‍🏫 Bảng Tên GVCN', desc: 'Cho bàn chủ trì' },
                { id: 'minimal', name: '🎓 Sang Trọng', desc: 'Gọn gàng cho Cấp 2-3' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  style={{
                    background: template === t.id ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : 'rgba(255, 255, 255, 0.05)',
                    border: template === t.id ? '2px solid #a78bfa' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff', borderRadius: '12px', padding: '10px 12px',
                    textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.82rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '2px' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section B: Roster Data Options */}
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#5eead4' }}>
                👥 ĐANH SÁCH HỌC SINH ({studentList.length} HS)
              </span>
              <button
                onClick={handleReloadFromClass}
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} /> Nạp từ Lớp
              </button>
            </div>

            <button
              onClick={() => setShowEditListModal(true)}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                color: '#ffffff', border: 'none', borderRadius: '10px',
                padding: '9px', fontWeight: 800, fontSize: '0.82rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <Edit3 size={15} /> Chỉnh Sửa / Nhập Danh Sách Nhanh
            </button>
          </div>

          {/* Section C: Teacher Desk Card Option */}
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, color: '#fde047' }}>
              <input
                type="checkbox"
                checked={includeTeacherCard}
                onChange={(e) => setIncludeTeacherCard(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
              />
              In kèm 1 Bảng Tên GVCN (Cho Bàn Chủ Trì)
            </label>

            {includeTeacherCard && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Tên GVCN..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>
            )}
          </div>

          {/* Section D: Custom Thank You Message */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 900, color: '#c4b5fd', display: 'block', marginBottom: '6px' }}>
              💬 THÔNG ĐIỆP CẢM ƠN PHỤ HUYNH (MẶT ĐỐI DIỆN):
            </label>
            <textarea
              rows={3}
              value={thankYouMsg}
              onChange={(e) => setThankYouMsg(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff', fontSize: '0.85rem', outline: 'none', lineHeight: 1.4
              }}
            />
          </div>

          {/* Section E: Class Info Meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>Tên Trường / Đơn Vị:</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>Lớp Học & Năm Học:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={classNameStr}
                  onChange={(e) => setClassNameStr(e.target.value)}
                  style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
                />
                <input
                  type="text"
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  style={{ width: '100px', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Stage: Interactive A4 Sheet & 3D Stand Preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'hidden' }}>
          
          {/* View Toolbar */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)', padding: '12px 18px',
            borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setViewMode('a4_flat')}
                style={{
                  background: viewMode === 'a4_flat' ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' : 'rgba(255,255,255,0.08)',
                  color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px',
                  fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer'
                }}
              >
                📄 Xem Trang Giấy A4 (Phẳng)
              </button>
              <button
                onClick={() => setViewMode('tent_3d')}
                style={{
                  background: viewMode === 'tent_3d' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : 'rgba(255,255,255,0.08)',
                  color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px',
                  fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer'
                }}
              >
                📐 Xem Mô Hình Lều Gấp 3D Đặt Bàn
              </button>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }}
              >
                <ChevronLeft size={18} />
              </button>

              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2dd4bf' }}>
                Trang {currentIndex + 1} / {allCardsToPrint.length}: <b style={{ color: '#ffffff' }}>{currentItem?.name}</b>
              </span>

              <button
                disabled={currentIndex >= allCardsToPrint.length - 1}
                onClick={() => setCurrentIndex(prev => Math.min(allCardsToPrint.length - 1, prev + 1))}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Canvas Preview Area */}
          <div style={{
            flex: 1, background: '#090d16', borderRadius: '20px',
            border: '1.5px solid rgba(13, 148, 136, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', overflow: 'auto', position: 'relative'
          }}>
            
            {viewMode === 'a4_flat' ? (
              /* A4 Sheet Flat Preview */
              <div style={{
                width: '380px', height: '537px', // Proportional A4 Aspect Ratio 210:297
                background: '#ffffff', borderRadius: '8px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative'
              }}>
                {/* Stripe 1 (Top 25%): Back Fold Base Flap */}
                <div style={{ height: '25%', background: '#f8fafc', borderBottom: '1.5px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px' }}>
                    ----- NẾP GẤP ĐÁY SAU -----
                  </span>
                </div>

                {/* Stripe 2 (Upper Middle 25%): FRONT NAME TENT (ROTATED 180 DEG) */}
                <div style={{
                  height: '25%',
                  background: template === 'nature' ? '#65a30d' : template === 'playful' ? '#0284c7' : '#1e293b',
                  padding: '8px', borderBottom: '1.5px dashed #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100%', height: '100%', background: '#ffffff', borderRadius: '8px',
                    border: '2px dashed #a3e635', padding: '6px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    transform: 'rotate(180deg)' // ROTATED 180 DEGREES
                  }}>
                    {currentItem?.isTeacher ? (
                      <>
                        <div style={{ fontSize: '9px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>{schoolName}</div>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626' }}>{currentItem.name.toUpperCase()}</div>
                        <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>Năm Học: {schoolYear} • {classNameStr}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '14px', marginBottom: '1px' }}>👦👧</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: template === 'nature' ? '#ea580c' : '#db2777', letterSpacing: '0.5px' }}>
                          {currentItem?.name?.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>{classNameStr} • {schoolName}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Stripe 3 (Lower Middle 25%): REAR THANK YOU TENT (0 DEG FACING PARENT) */}
                <div style={{
                  height: '25%',
                  background: template === 'nature' ? '#84cc16' : template === 'playful' ? '#0d9488' : '#334155',
                  padding: '8px', borderBottom: '1.5px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100%', height: '100%', background: '#ffffff', borderRadius: '8px',
                    border: '2px dashed #38bdf8', padding: '6px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>👩‍🏫📚</span>
                      <div style={{ fontSize: '12px', fontWeight: 800, fontStyle: 'italic', color: template === 'nature' ? '#c2410c' : '#0f766e', lineHeight: 1.2 }}>
                        {thankYouMsg}
                      </div>
                    </div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>
                      {schoolName} • Kính Chúc Quý Phụ Huynh Sức Khỏe & Thành Công
                    </div>
                  </div>
                </div>

                {/* Stripe 4 (Bottom 25%): Front Fold Base Flap */}
                <div style={{ height: '25%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px' }}>
                    ----- NẾP GẤP ĐÁY TRƯỚC -----
                  </span>
                </div>
              </div>
            ) : (
              /* 3D Folded Tent Stand Preview */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ fontSize: '0.85rem', color: '#2dd4bf', fontWeight: 800 }}>
                  📐 MÔ HÌNH LỀU GẤP KHỔ A4 KHI ĐẶT TRÊN BÀN HỌP PHỤ HUYNH (ẢNH 2)
                </div>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  
                  {/* Front Tent Card View */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 800 }}>
                      MẶT TRƯỚC (HƯỚNG RA THẦY CÔ & LỚP):
                    </div>
                    <div style={{
                      width: '320px', height: '140px',
                      background: '#ffffff', borderRadius: '12px',
                      border: '4px solid #65a30d', boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                      padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      textAlign: 'center'
                    }}>
                      {currentItem?.isTeacher ? (
                        <>
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>{schoolName}</div>
                          <div style={{ fontSize: '22px', fontWeight: 900, color: '#dc2626', margin: '4px 0' }}>{currentItem.name.toUpperCase()}</div>
                          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>Năm Học: {schoolYear} • {classNameStr}</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '18px' }}>👦👧</div>
                          <div style={{ fontSize: '26px', fontWeight: 900, color: '#ea580c', letterSpacing: '1px' }}>
                            {currentItem?.name?.toUpperCase()}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>{classNameStr} • {schoolName}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rear Tent Card View */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800 }}>
                      MẶT ĐỐI DIỆN (HƯỚNG RA PHỤ HUYNH NGỒI):
                    </div>
                    <div style={{
                      width: '320px', height: '140px',
                      background: '#ffffff', borderRadius: '12px',
                      border: '4px solid #84cc16', boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                      padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '28px' }}>👩‍🏫📚</span>
                        <div style={{ fontSize: '14px', fontWeight: 800, fontStyle: 'italic', color: '#c2410c', lineHeight: 1.3 }}>
                          {thankYouMsg}
                        </div>
                      </div>
                      <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '8px', fontWeight: 600 }}>
                        {schoolName} • Kính Chúc Quý Phụ Huynh Sức Khỏe & Thành Công
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* 3. Modal Edit Roster Text List */}
      {showEditListModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: '#0f172a', borderRadius: '20px', border: '1px solid #0d9488' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2dd4bf', margin: 0 }}>
                📝 Chỉnh Sửa / Dán Danh Sách Học Sinh
              </h3>
              <button onClick={() => setShowEditListModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '10px' }}>
              Nhập hoặc dán danh sách tên học sinh (mỗi tên nằm trên 1 dòng):
            </p>

            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="TUẤN ANH&#10;KHÁNH ANH&#10;THIỆN ÂN&#10;UY VŨ..."
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: '#020617', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: '0.9rem', outline: 'none', lineHeight: 1.5
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditListModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveTextList}
                style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' }}
              >
                Cập Nhật Danh Sách
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
