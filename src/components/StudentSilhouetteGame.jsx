import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  Upload, 
  Eye, 
  EyeOff, 
  Shuffle, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Users, 
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Camera,
  Star,
  Download
} from 'lucide-react';
import { SoundFX } from '../utils/sound';
import { StorageService } from '../services/storage';

// Initial sample student poses for out-of-the-box play matching reference video trochoihph.MP4
const DEFAULT_SAMPLE_STUDENTS = [
  {
    id: 'sample_1',
    name: 'Nguyễn Minh An',
    poseLabel: 'Chào Đội Viên (Salute Pose)',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    isRevealed: false
  },
  {
    id: 'sample_2',
    name: 'Trần Bảo Nam',
    poseLabel: 'Giơ Tay Bắn Tim (Heart Pose)',
    photoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&auto=format&fit=crop&q=80',
    isRevealed: false
  },
  {
    id: 'sample_3',
    name: 'Lê Hoàng Yến',
    poseLabel: 'Tạo Dáng V Thắng Lợi (Peace Sign)',
    photoUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=80',
    isRevealed: false
  },
  {
    id: 'sample_4',
    name: 'Phạm Đức Anh',
    poseLabel: 'Khoe Tranh Vẽ (Holding Artwork)',
    photoUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&auto=format&fit=crop&q=80',
    isRevealed: false
  },
  {
    id: 'sample_5',
    name: 'Vũ Thảo Chi',
    poseLabel: 'Suy Nghĩ Đúc Tay Túi (Cool Pose)',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    isRevealed: false
  },
  {
    id: 'sample_6',
    name: 'Hoàng Nhật Minh',
    poseLabel: 'Giơ Hai Tay Thể Thao (Victory Arms)',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    isRevealed: false
  },
  {
    id: 'sample_7',
    name: 'Đặng Mai Phương',
    poseLabel: 'Nghiêng Đầu Cười (Tilt Head)',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    isRevealed: false
  },
  {
    id: 'sample_8',
    name: 'Bùi Gia Hưng',
    poseLabel: 'Khoanh Tay Tự Tin (Crossed Arms)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    isRevealed: false
  }
];

export function StudentSilhouetteGame({ currentUser }) {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem(`gvd_parent_meeting_silhouette_${currentUser?.id || 'default'}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_SAMPLE_STUDENTS;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [silhouetteStyle, setSilhouetteStyle] = useState('solid'); // 'solid' | 'glow' | 'contrast'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhoto, setNewStudentPhoto] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(
      `gvd_parent_meeting_silhouette_${currentUser?.id || 'default'}`,
      JSON.stringify(students)
    );
  }, [students, currentUser]);

  // Toggle reveal state for a specific card
  const handleToggleReveal = (id) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.isRevealed;
        if (nextState && audioEnabled) {
          SoundFX.correct();
        } else if (audioEnabled) {
          SoundFX.click();
        }
        return { ...s, isRevealed: nextState };
      }
      return s;
    }));
  };

  // Reveal all student answers
  const handleRevealAll = () => {
    if (audioEnabled) SoundFX.fanfare();
    setStudents(prev => prev.map(s => ({ ...s, isRevealed: true })));
  };

  // Hide all answers (reset to silhouettes)
  const handleHideAll = () => {
    if (audioEnabled) SoundFX.click();
    setStudents(prev => prev.map(s => ({ ...s, isRevealed: false })));
  };

  // Shuffle order of student cards
  const handleShuffle = () => {
    if (audioEnabled) SoundFX.click();
    setStudents(prev => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  };

  // Import students & photos from Homeroom class list
  const handleImportFromHomeroom = () => {
    try {
      const hrData = StorageService.getTeacherHomeroom(currentUser?.id);
      if (hrData && hrData.students && Array.isArray(hrData.students) && hrData.students.length > 0) {
        const imported = hrData.students.map((st, idx) => ({
          id: `hr_${st.id || idx}_${Date.now()}`,
          name: st.name || `Học sinh ${idx + 1}`,
          poseLabel: st.gender === 'Nữ' ? 'Tư thế học sinh nữ' : 'Tư thế học sinh nam',
          photoUrl: st.avatar || DEFAULT_SAMPLE_STUDENTS[idx % DEFAULT_SAMPLE_STUDENTS.length].photoUrl,
          isRevealed: false
        }));
        setStudents(imported);
        if (audioEnabled) SoundFX.correct();
        alert(`🎉 Đã tải thành công ${imported.length} học sinh từ Lớp Chủ Nhiệm!`);
      } else {
        alert('⚠️ Chưa tìm thấy dữ liệu học sinh trong Lớp Chủ Nhiệm. Thầy/Cô có thể tải ảnh lên thủ công hoặc thêm học sinh ở phần Lớp Chủ Nhiệm.');
      }
    } catch (err) {
      console.warn('Homeroom import notice:', err);
    }
  };

  // Handle single photo upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setNewStudentPhoto(String(base64));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add new student photo
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudentPhoto) {
      alert('Vui lòng chọn hoặc tải ảnh học sinh!');
      return;
    }

    const newSt = {
      id: `custom_${Date.now()}`,
      name: newStudentName.trim() || `Học sinh ${students.length + 1}`,
      poseLabel: 'Tư thế tự chọn',
      photoUrl: newStudentPhoto,
      isRevealed: false
    };

    setStudents(prev => [...prev, newSt]);
    setNewStudentName('');
    setNewStudentPhoto('');
    setShowAddModal(false);
    if (audioEnabled) SoundFX.correct();
  };

  // Delete student photo
  const handleDeleteStudent = (id, e) => {
    e.stopPropagation();
    if (confirm('Thầy/Cô có chắc chắn muốn xóa hình ảnh học sinh này khỏi trò chơi?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
      if (audioEnabled) SoundFX.click();
    }
  };

  // Reset to default sample roster
  const handleResetToSample = () => {
    if (confirm('Thầy/Cô có muốn khôi phục về bộ ảnh mẫu ban đầu không?')) {
      setStudents(DEFAULT_SAMPLE_STUDENTS);
      if (audioEnabled) SoundFX.click();
    }
  };

  // Toggle browser fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const revealedCount = students.filter(s => s.isRevealed).length;

  return (
    <div 
      ref={containerRef}
      style={{
        display: 'flex', flexDirection: 'column', gap: '20px',
        background: '#020617', color: '#ffffff', borderRadius: '20px',
        border: '1.5px solid rgba(236, 72, 153, 0.4)', padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(236, 72, 153, 0.15)',
        position: 'relative', overflow: 'hidden'
      }}
    >
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)', color: '#ffffff'
            }}
          >
            <HeartHandshake size={28} />
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#f472b6', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              TRÒ CHƠI KHỞI ĐỘNG HỌP PHỤ HUYNH
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#ffffff', margin: '2px 0 0 0', textShadow: '0 0 16px rgba(236, 72, 153, 0.4)' }}>
              🎭 ĐOÁN BÓNG TÌM CON
            </h2>
          </div>
        </div>

        {/* Top Control Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'Tắt âm thanh trò chơi' : 'Bật âm thanh trò chơi'}
            style={{
              background: audioEnabled ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.1)',
              color: audioEnabled ? '#f472b6' : '#94a3b8',
              border: `1px solid ${audioEnabled ? 'rgba(236, 72, 153, 0.4)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '10px', padding: '8px 12px', fontWeight: 800, fontSize: '0.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{audioEnabled ? 'Âm Thanh ON' : 'Âm Thanh OFF'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff', border: 'none', borderRadius: '10px',
              padding: '8px 14px', fontWeight: 800, fontSize: '0.85rem',
              cursor: 'pointer', boxShadow: '0 0 14px rgba(56, 189, 248, 0.4)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{isFullscreen ? '↙️ THOÁT TOÀN MÀN HÌNH' : '🖥️ TOÀN MÀN HÌNH TRÌNH CHIẾU'}</span>
          </button>

        </div>
      </div>

      {/* Control & Toolbar Actions Bar */}
      <div 
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px', background: 'rgba(15, 23, 42, 0.7)',
          padding: '12px 18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          <button
            onClick={handleRevealAll}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff', border: 'none', borderRadius: '10px',
              padding: '7px 14px', fontWeight: 800, fontSize: '0.82rem',
              cursor: 'pointer', boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Eye size={16} />
            <span>HIỆN TẤT CẢ ĐÁP ÁN</span>
          </button>

          <button
            onClick={handleHideAll}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '10px', padding: '7px 14px', fontWeight: 800, fontSize: '0.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <EyeOff size={16} />
            <span>CHE TẤT CẢ (RESET BÓNG)</span>
          </button>

          <button
            onClick={handleShuffle}
            style={{
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#fde047', border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '10px', padding: '7px 14px', fontWeight: 800, fontSize: '0.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Shuffle size={16} />
            <span>TRÁO VỊ TRÍ SỐ</span>
          </button>

        </div>

        {/* Management & Import Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          <button
            onClick={handleImportFromHomeroom}
            title="Lấy danh sách ảnh & tên học sinh từ Lớp Chủ Nhiệm"
            style={{
              background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '10px',
              padding: '7px 14px', fontWeight: 800, fontSize: '0.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Users size={16} />
            <span>LẤY TỪ LỚP CHỦ NHIỆM</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              color: '#ffffff', border: 'none', borderRadius: '10px',
              padding: '7px 14px', fontWeight: 800, fontSize: '0.82rem',
              cursor: 'pointer', boxShadow: '0 0 12px rgba(236, 72, 153, 0.4)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Plus size={16} />
            <span>+ TẢI ẢNH HỌC SINH MỚI</span>
          </button>

          <button
            onClick={handleResetToSample}
            title="Khôi phục về ảnh mẫu mặc định"
            style={{
              background: 'rgba(255,255,255,0.08)', color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
              padding: '7px 12px', fontWeight: 700, fontSize: '0.8rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <RotateCcw size={14} />
            <span>MẪU</span>
          </button>

        </div>
      </div>

      {/* Banner Guidance for Parents & Teachers */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(236, 72, 153, 0.12) 100%)',
          borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} color="#f59e0b" />
          <span style={{ fontSize: '0.9rem', color: '#fde047', fontWeight: 800 }}>
            📌 Hướng Dẫn: Kính mời Phụ Huynh quan sát tư thế dáng hình bóng đen và đoán số tương ứng của con!
          </span>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>
          Đã mở đáp án: <b style={{ color: '#38bdf8', fontSize: '0.95rem' }}>{revealedCount}</b> / {students.length} học sinh
        </div>
      </div>

      {/* PRESENTATION STAGE ARENA: THE SILHOUETTE CARDS GRID (MATCHING REFERENCED VIDEO trochoihph.MP4) */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #09131d 0%, #0f172a 100%)',
          borderRadius: '16px', border: '1.5px solid rgba(56, 189, 248, 0.3)',
          padding: '30px 24px', minHeight: '480px',
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${isFullscreen ? '220px' : '180px'}, 1fr))`,
          gap: isFullscreen ? '28px' : '22px',
          alignItems: 'end',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)'
        }}
      >
        {students.map((student, index) => {
          const numberBadge = index + 1;
          const isRevealed = student.isRevealed;

          return (
            <div 
              key={student.id}
              onClick={() => handleToggleReveal(student.id)}
              title={isRevealed ? `Bấm để ẩn lại bóng đen` : `Bấm vào đây để mở đáp án cho Phụ Huynh!`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                cursor: 'pointer', position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isRevealed ? 'scale(1.04)' : 'scale(1)',
                userSelect: 'none'
              }}
            >
              {/* Individual Student Image Container */}
              <div 
                style={{
                  width: isFullscreen ? '200px' : '160px',
                  height: isFullscreen ? '260px' : '210px',
                  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isRevealed ? 'rgba(30, 41, 59, 0.4)' : 'transparent',
                  borderRadius: '16px',
                  padding: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Delete button (hoverable in teacher edit mode) */}
                <button
                  onClick={(e) => handleDeleteStudent(student.id, e)}
                  title="Xóa hình học sinh này"
                  style={{
                    position: 'absolute', top: '2px', right: '2px', zIndex: 15,
                    background: 'rgba(239, 68, 68, 0.8)', color: '#ffffff',
                    border: 'none', borderRadius: '50%', width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', opacity: 0.4, transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
                >
                  <Trash2 size={12} />
                </button>

                {/* THE SILHOUETTE VS REVEALED REAL PHOTO DISPLAY */}
                <img 
                  src={student.photoUrl} 
                  alt={student.name}
                  style={{
                    maxWidth: '100%', maxHeight: '100%',
                    objectFit: 'contain',
                    // SILHOUETTE SHADER EFFECT MATCHING trochoihph.MP4
                    filter: isRevealed 
                      ? 'none' 
                      : silhouetteStyle === 'solid'
                        ? 'brightness(0) drop-shadow(0 4px 10px rgba(0,0,0,0.8))'
                        : silhouetteStyle === 'glow'
                          ? 'brightness(0) drop-shadow(0 0 14px #f59e0b)'
                          : 'brightness(0) contrast(200%)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isRevealed ? 'scale(1.05)' : 'scale(1)'
                  }}
                />

                {/* Celebration Sparkles overlay when revealed */}
                {isRevealed && (
                  <div style={{ position: 'absolute', top: '10px', left: '10px', pointerEvents: 'none' }}>
                    <Sparkles size={24} color="#fde047" className="animate-pulse" />
                  </div>
                )}
              </div>

              {/* NUMBER BADGE BOX MATCHING EXACT STYLING IN VIDEO trochoihph.MP4 */}
              <div 
                style={{
                  background: isRevealed ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : '#fde047',
                  color: isRevealed ? '#ffffff' : '#0f172a',
                  border: isRevealed ? '2px solid #34d399' : '2px solid #d97706',
                  borderRadius: '10px',
                  padding: isRevealed ? '4px 12px' : '4px 18px',
                  fontWeight: 900,
                  fontSize: isRevealed ? '0.88rem' : '1.35rem',
                  boxShadow: isRevealed ? '0 0 15px rgba(16, 185, 129, 0.6)' : '0 4px 12px rgba(245, 158, 11, 0.5)',
                  textAlign: 'center',
                  minWidth: '50px',
                  transition: 'all 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                {isRevealed ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{student.name}</span>
                  </>
                ) : (
                  <span>{numberBadge}</span>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal for Uploading Custom Student Photos */}
      {showAddModal && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(9, 19, 29, 0.85)', backdropFilter: 'blur(12px)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              background: '#0f172a', borderRadius: '20px',
              border: '1.5px solid #ec4899', width: '100%', maxWidth: '480px',
              padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
              display: 'flex', flexDirection: 'column', gap: '18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f472b6', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={22} />
                Tải Ảnh Học Sinh Mới
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Họ và Tên Học Sinh:
                </label>
                <input 
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(236, 72, 153, 0.4)',
                    borderRadius: '10px', padding: '10px 14px', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Hình Ảnh Tư Thế Học Sinh (Tải tệp từ máy tính):
                </label>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(236, 72, 153, 0.5)', borderRadius: '14px',
                    padding: '20px', textAlign: 'center', cursor: 'pointer',
                    background: 'rgba(236, 72, 153, 0.05)', transition: 'all 0.2s'
                  }}
                >
                  {newStudentPhoto ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <img src={newStudentPhoto} alt="Preview" style={{ maxHeight: '140px', borderRadius: '10px', objectFit: 'contain' }} />
                      <span style={{ fontSize: '0.78rem', color: '#f472b6', fontWeight: 800 }}>Bấm để chọn tệp khác</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#f472b6' }}>
                      <Upload size={28} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Bấm vào đây để chọn tệp ảnh học sinh</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Hỗ trợ JPG, PNG, WEBP</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.1)', color: '#cbd5e1',
                    border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', color: '#ffffff',
                    border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)'
                  }}
                >
                  + Tải Lên & Thêm Vào Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
