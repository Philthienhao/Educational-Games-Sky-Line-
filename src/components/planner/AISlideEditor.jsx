import React, { useState } from 'react';
import { Presentation, Play, Edit3, Plus, Trash2, Palette, Sparkles, Check, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

const SLIDE_THEMES = [
  { id: 'skyline', name: 'Vibrant Sky-Line', bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', border: '#8b5cf6', text: '#ffffff', accent: '#a855f7' },
  { id: 'modern-light', name: 'Modern Minimal (Light)', bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', border: '#0284c7', text: '#0f172a', accent: '#0284c7' },
  { id: 'glass-emerald', name: 'Emerald Edu', bg: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', border: '#10b981', text: '#ffffff', accent: '#10b981' },
  { id: 'warm-amber', name: 'Warm Amber', bg: 'linear-gradient(135deg, #451a03 0%, #18181b 100%)', border: '#f59e0b', text: '#ffffff', accent: '#f59e0b' }
];

export function AISlideEditor({ slides: initialSlides, topicTitle, onSaveSlides }) {
  const [slides, setSlides] = useState(initialSlides || []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeTheme, setActiveTheme] = useState(SLIDE_THEMES[0]);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const activeSlide = slides[currentIdx] || slides[0] || {};

  const handleUpdateSlideField = (field, val) => {
    setSlides(prev => prev.map((s, i) => i === currentIdx ? { ...s, [field]: val } : s));
  };

  const handleUpdateBullet = (bulletIdx, val) => {
    setSlides(prev => prev.map((s, i) => {
      if (i !== currentIdx) return s;
      const newBullets = [...(s.bulletPoints || [])];
      newBullets[bulletIdx] = val;
      return { ...s, bulletPoints: newBullets };
    }));
  };

  const handleAddBullet = () => {
    setSlides(prev => prev.map((s, i) => {
      if (i !== currentIdx) return s;
      return { ...s, bulletPoints: [...(s.bulletPoints || []), 'Điểm kiến thức mới'] };
    }));
  };

  const handleDeleteBullet = (bulletIdx) => {
    setSlides(prev => prev.map((s, i) => {
      if (i !== currentIdx) return s;
      return { ...s, bulletPoints: (s.bulletPoints || []).filter((_, idx) => idx !== bulletIdx) };
    }));
  };

  const handleAddSlide = () => {
    const newSlide = {
      title: `Trang ${slides.length + 1}: Kiến Thức Mới`,
      subtitle: 'Tóm tắt nội dung trọng tâm',
      bulletPoints: ['Ý chính 1', 'Ý chính 2'],
      teacherNote: 'Ghi chú hoạt động sư phạm',
      visualHint: 'Hình ảnh minh họa bài học',
      slideType: 'concept'
    };
    setSlides([...slides, newSlide]);
    setCurrentIdx(slides.length);
  };

  const handleDeleteSlide = (idx) => {
    if (slides.length <= 1) {
      alert('Phải giữ lại ít nhất 1 trang Slide.');
      return;
    }
    const filtered = slides.filter((_, i) => i !== idx);
    setSlides(filtered);
    setCurrentIdx(Math.max(0, idx - 1));
  };

  if (isPresenting) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: activeTheme.bg,
        color: activeTheme.text,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'between',
        padding: '40px',
        userSelect: 'none'
      }}>
        {/* Top Floating Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 900, opacity: 0.8, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Presentation size={20} color={activeTheme.accent} />
            {topicTitle || 'Bài Giảng Slide AI'} • Trang {currentIdx + 1} / {slides.length}
          </div>
          <button 
            onClick={() => setIsPresenting(false)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: activeTheme.text, padding: '8px 16px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
          >
            ✕ Thoát Trình Chiếu
          </button>
        </div>

        {/* Slide Content View */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%'
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '10px', color: activeTheme.accent }}>
            {activeSlide.title}
          </h1>
          {activeSlide.subtitle && (
            <p style={{ fontSize: '1.4rem', opacity: 0.85, marginBottom: '30px', fontWeight: 700 }}>
              {activeSlide.subtitle}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
            {(activeSlide.bulletPoints || []).map((bp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '1.5rem', fontWeight: 700 }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: activeTheme.accent, shrink: 0 }} />
                <span>{bp}</span>
              </div>
            ))}
          </div>

          {activeSlide.teacherNote && (
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderLeft: `4px solid ${activeTheme.accent}`,
              padding: '12px 18px',
              borderRadius: '8px',
              fontSize: '1rem',
              opacity: 0.9
            }}>
              💡 <strong>Ghi chú giáo viên:</strong> {activeSlide.teacherNote}
            </div>
          )}
        </div>

        {/* Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
          <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '16px', cursor: 'pointer', fontWeight: 900 }}
          >
            ❮ Trang Trước
          </button>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{currentIdx + 1} / {slides.length}</span>
          <button 
            disabled={currentIdx === slides.length - 1}
            onClick={() => setCurrentIdx(prev => Math.min(slides.length - 1, prev + 1))}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '16px', cursor: 'pointer', fontWeight: 900 }}
          >
            Trang Sau ❯
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Toolbar */}
      <div style={{
        background: '#0f172a',
        padding: '14px 20px',
        borderRadius: '18px',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Presentation size={22} color="#8b5cf6" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', margin: 0 }}>
            Slide Bài Dạy Tương Tác ({slides.length} Trang)
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Palette size={16} color="#cbd5e1" />
            <select
              value={activeTheme.id}
              onChange={(e) => setActiveTheme(SLIDE_THEMES.find(t => t.id === e.target.value) || SLIDE_THEMES[0])}
              style={{
                background: '#1e293b', border: '1px solid #475569', color: '#fff',
                padding: '6px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700
              }}
            >
              {SLIDE_THEMES.map(t => (
                <option key={t.id} value={t.id}>Giao diện: {t.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsPresenting(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '12px',
              fontSize: '0.85rem', fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Play size={16} /> Trình Chiếu Web
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
        
        {/* Left Thumbnails Sidebar */}
        <div style={{
          background: '#090d16',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '18px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8' }}>DANH SÁCH SLIDE</span>
            <button 
              onClick={handleAddSlide}
              style={{ background: '#8b5cf6', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Thêm Slide mới"
            >
              <Plus size={14} />
            </button>
          </div>

          {slides.map((s, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                background: idx === currentIdx ? 'rgba(139, 92, 246, 0.25)' : '#0f172a',
                border: idx === currentIdx ? '1.5px solid #8b5cf6' : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 900, marginBottom: '2px' }}>
                TRANG {idx + 1}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.title || 'Slide không tiêu đề'}
              </div>

              {slides.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteSlide(idx); }}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                  title="Xóa Slide này"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Right Active Slide Preview & Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Big Canvas View */}
          <div style={{
            background: activeTheme.bg,
            border: `2px solid ${activeTheme.border}`,
            borderRadius: '24px',
            padding: '40px',
            color: activeTheme.text,
            minHeight: '400px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <input 
              type="text"
              value={activeSlide.title || ''}
              onChange={(e) => handleUpdateSlideField('title', e.target.value)}
              placeholder="Nhập tiêu đề trang Slide..."
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTheme.accent,
                fontSize: '1.8rem',
                fontWeight: 900,
                outline: 'none',
                marginBottom: '10px',
                width: '100%'
              }}
            />

            <input 
              type="text"
              value={activeSlide.subtitle || ''}
              onChange={(e) => handleUpdateSlideField('subtitle', e.target.value)}
              placeholder="Mô tả phụ trang Slide..."
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTheme.text,
                fontSize: '1.1rem',
                fontWeight: 700,
                opacity: 0.85,
                outline: 'none',
                marginBottom: '24px',
                width: '100%'
              }}
            />

            {/* Bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {(activeSlide.bulletPoints || []).map((bp, bIdx) => (
                <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeTheme.accent, shrink: 0 }} />
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => handleUpdateBullet(bIdx, e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      color: activeTheme.text,
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                  <button 
                    onClick={() => handleDeleteBullet(bIdx)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                onClick={handleAddBullet}
                style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px dashed rgba(255,255,255,0.3)',
                  color: activeTheme.text,
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} /> Thêm điểm ý chính
              </button>
            </div>
          </div>

          {/* Teacher Pedagogical Note */}
          <div style={{
            background: '#090d16',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '16px'
          }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', marginBottom: '6px', display: 'block' }}>
              💡 Ghi Chú Hoạt Động Dạy Học (Công văn 5512):
            </label>
            <textarea
              value={activeSlide.teacherNote || ''}
              onChange={(e) => handleUpdateSlideField('teacherNote', e.target.value)}
              placeholder="Nhập ghi chú hướng dẫn sư phạm cho giáo viên..."
              rows={2}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#fff',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

        </div>

      </div>

    </div>
  );
}
