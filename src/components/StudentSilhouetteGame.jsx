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
  Download,
  Sliders,
  RefreshCw,
  ImageIcon
} from 'lucide-react';
import { SoundFX } from '../utils/sound';
import { StorageService } from '../services/storage';
import { compressImage } from '../utils/imageCompressor';
import { IDBStorageService } from '../services/idbStorage';

// Helper to generate SVG transparent silhouette pose cutouts for default sample students
const createSamplePoseSvg = (poseType) => {
  let innerElements = '';

  if (poseType === 'salute') {
    // Pose 1: Salute / Hand to head 🫡
    innerElements = `
      <!-- Head -->
      <circle cx="100" cy="55" r="24" fill="#0f172a"/>
      <!-- Neck & Torso -->
      <path d="M 85 78 L 115 78 L 132 180 L 68 180 Z" fill="#0f172a"/>
      <!-- Left Arm down -->
      <path d="M 68 85 L 50 145 L 62 148 L 78 95 Z" fill="#0f172a"/>
      <!-- Right Arm Raised to Head (Salute) -->
      <path d="M 132 85 L 158 115 L 140 120 L 122 68 L 118 58 L 105 58 L 118 72 Z" fill="#0f172a"/>
    `;
  } else if (poseType === 'heart') {
    // Pose 2: Hand Heart / Bắn tim 🫶
    innerElements = `
      <!-- Head -->
      <circle cx="100" cy="55" r="24" fill="#0f172a"/>
      <!-- Neck & Torso -->
      <path d="M 82 78 L 118 78 L 130 180 L 70 180 Z" fill="#0f172a"/>
      <!-- Arms bent inward forming heart over chest -->
      <path d="M 72 85 L 55 110 L 85 118 L 92 100 Z" fill="#0f172a"/>
      <path d="M 128 85 L 145 110 L 115 118 L 108 100 Z" fill="#0f172a"/>
      <!-- Heart shape formed by hands -->
      <path d="M 100 102 C 92 90, 80 96, 92 108 L 100 116 L 108 108 C 120 96, 108 90, 100 102 Z" fill="#0f172a"/>
    `;
  } else if (poseType === 'peace') {
    // Pose 3: Both Arms V Peace Sign ✌️✌️
    innerElements = `
      <!-- Head -->
      <circle cx="100" cy="55" r="24" fill="#0f172a"/>
      <!-- Neck & Torso -->
      <path d="M 82 78 L 118 78 L 130 180 L 70 180 Z" fill="#0f172a"/>
      <!-- Left Arm Raised Peace -->
      <path d="M 72 85 L 42 50 L 52 42 L 80 80 Z" fill="#0f172a"/>
      <path d="M 38 42 L 32 20 L 40 20 L 44 38 Z" fill="#0f172a"/>
      <path d="M 45 42 L 52 24 L 58 26 L 50 44 Z" fill="#0f172a"/>
      <!-- Right Arm Raised Peace -->
      <path d="M 128 85 L 158 50 L 148 42 L 120 80 Z" fill="#0f172a"/>
      <path d="M 162 42 L 168 20 L 160 20 L 156 38 Z" fill="#0f172a"/>
      <path d="M 155 42 L 148 24 L 142 26 L 150 44 Z" fill="#0f172a"/>
    `;
  } else if (poseType === 'artwork') {
    // Pose 4: Holding Artwork Drawing Frame 🎨
    innerElements = `
      <!-- Head -->
      <circle cx="100" cy="55" r="24" fill="#0f172a"/>
      <!-- Neck & Torso -->
      <path d="M 82 78 L 118 78 L 132 180 L 68 180 Z" fill="#0f172a"/>
      <!-- Rectangular Drawing Frame held in hands -->
      <rect x="52" y="105" width="96" height="64" rx="4" fill="#0f172a" stroke="#0f172a" strokeWidth="2"/>
      <!-- Left Arm & Hand holding frame -->
      <path d="M 72 85 L 48 115 L 56 125 L 78 95 Z" fill="#0f172a"/>
      <!-- Right Arm & Hand holding frame -->
      <path d="M 128 85 L 152 115 L 144 125 L 122 95 Z" fill="#0f172a"/>
    `;
  } else if (poseType === 'cool') {
    // Pose 5: Cool Pose Hands in Pockets 🕶️
    innerElements = `
      <!-- Head -->
      <circle cx="100" cy="55" r="24" fill="#0f172a"/>
      <!-- Neck & Torso -->
      <path d="M 82 78 L 118 78 L 128 180 L 72 180 Z" fill="#0f172a"/>
      <!-- Left Arm to Pocket -->
      <path d="M 72 85 L 54 130 L 78 135 Z" fill="#0f172a"/>
      <!-- Right Arm to Pocket -->
      <path d="M 128 85 L 146 130 L 122 135 Z" fill="#0f172a"/>
    `;
  } else if (poseType === 'victory') {
    // Pose 6: Victory Y-Arms Raised High 🏆
    innerElements = `
      <!-- Head -->
      <circle cx="100" cy="55" r="24" fill="#0f172a"/>
      <!-- Neck & Torso -->
      <path d="M 82 78 L 118 78 L 128 180 L 72 180 Z" fill="#0f172a"/>
      <!-- Left Arm Raised High Y -->
      <path d="M 75 85 L 35 25 L 48 20 L 85 78 Z" fill="#0f172a"/>
      <!-- Right Arm Raised High Y -->
      <path d="M 125 85 L 165 25 L 152 20 L 115 78 Z" fill="#0f172a"/>
    `;
  } else if (poseType === 'tilt') {
    // Pose 7: Tilt Head Girl Pose 👧
    innerElements = `
      <!-- Hair & Tilted Head -->
      <circle cx="106" cy="52" r="26" fill="#0f172a"/>
      <path d="M 76 45 C 70 85, 82 105, 84 115 C 95 105, 126 105, 134 45 Z" fill="#0f172a"/>
      <!-- Torso -->
      <path d="M 82 78 L 118 78 L 128 180 L 72 180 Z" fill="#0f172a"/>
      <!-- Hands resting under chin -->
      <path d="M 72 85 L 98 72 L 105 85 Z" fill="#0f172a"/>
      <path d="M 128 85 L 102 72 L 95 85 Z" fill="#0f172a"/>
    `;
  } else {
    // Pose 8: Crossed Arms Tự Tin 💪
    innerElements = `
      <!-- Head -->
      <circle cx="100" cy="55" r="24" fill="#0f172a"/>
      <!-- Neck & Torso -->
      <path d="M 82 78 L 118 78 L 128 180 L 72 180 Z" fill="#0f172a"/>
      <!-- Horizontal Crossed Arms -->
      <rect x="58" y="95" width="84" height="28" rx="14" fill="#0f172a"/>
    `;
  }

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">${innerElements}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;
};

// INITIAL SAMPLE STUDENTS WITH 100% PURE POSE CUTOUT SILHOUETTES
const DEFAULT_SAMPLE_STUDENTS = [
  {
    id: 'sample_1',
    name: 'Nguyễn Minh An',
    poseLabel: 'Chào Đội Viên (Salute Pose)',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    silhouetteUrl: createSamplePoseSvg('salute'),
    isRevealed: false
  },
  {
    id: 'sample_2',
    name: 'Trần Bảo Nam',
    poseLabel: 'Giơ Tay Bắn Tim (Heart Pose)',
    photoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&auto=format&fit=crop&q=80',
    silhouetteUrl: createSamplePoseSvg('heart'),
    isRevealed: false
  },
  {
    id: 'sample_3',
    name: 'Lê Hoàng Yến',
    poseLabel: 'Tạo Dáng V Thắng Lợi (Peace Sign)',
    photoUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=80',
    silhouetteUrl: createSamplePoseSvg('peace'),
    isRevealed: false
  },
  {
    id: 'sample_4',
    name: 'Phạm Đức Anh',
    poseLabel: 'Khoe Tranh Vẽ (Holding Artwork)',
    photoUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&auto=format&fit=crop&q=80',
    silhouetteUrl: createSamplePoseSvg('artwork'),
    isRevealed: false
  },
  {
    id: 'sample_5',
    name: 'Vũ Thảo Chi',
    poseLabel: 'Suy Nghĩ Đút Tay Túi (Cool Pose)',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    silhouetteUrl: createSamplePoseSvg('cool'),
    isRevealed: false
  },
  {
    id: 'sample_6',
    name: 'Hoàng Nhật Minh',
    poseLabel: 'Giơ Hai Tay Thể Thao (Victory Arms)',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    silhouetteUrl: createSamplePoseSvg('victory'),
    isRevealed: false
  },
  {
    id: 'sample_7',
    name: 'Đặng Mai Phương',
    poseLabel: 'Nghiêng Đầu Cười (Tilt Head)',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    silhouetteUrl: createSamplePoseSvg('tilt'),
    isRevealed: false
  },
  {
    id: 'sample_8',
    name: 'Bùi Gia Hưng',
    poseLabel: 'Khoanh Tay Tự Tin (Crossed Arms)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    silhouetteUrl: createSamplePoseSvg('crossed'),
    isRevealed: false
  }
];

// HIGH-PRECISION CANVAS BACKGROUND CUTOUT SILHOUETTE GENERATOR (Downscaled & Offloaded)
export function processCutoutSilhouette(imageSrc, options = {}) {
  return new Promise((resolve) => {
    if (!imageSrc) {
      resolve('');
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      try {
        const maxDim = 450;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        const tolerance = options.tolerance !== undefined ? options.tolerance : 48;
        const mode = options.mode || 'auto'; // 'auto' | 'light' | 'none'

        if (mode === 'none') {
          resolve(imageSrc);
          return;
        }

        // Sample background color from border pixels and corners
        let bgR = 0, bgG = 0, bgB = 0, samples = 0;
        
        for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 30))) {
          const idxTop = (0 * w + x) * 4;
          if (data[idxTop + 3] > 20) {
            bgR += data[idxTop];
            bgG += data[idxTop + 1];
            bgB += data[idxTop + 2];
            samples++;
          }
        }
        for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 30))) {
          const idxLeft = (y * w + 0) * 4;
          const idxRight = (y * w + w - 1) * 4;
          if (data[idxLeft + 3] > 20) { bgR += data[idxLeft]; bgG += data[idxLeft+1]; bgB += data[idxLeft+2]; samples++; }
          if (data[idxRight + 3] > 20) { bgR += data[idxRight]; bgG += data[idxRight+1]; bgB += data[idxRight+2]; samples++; }
        }

        if (samples > 0) {
          bgR /= samples;
          bgG /= samples;
          bgB /= samples;
        } else {
          bgR = 240; bgG = 240; bgB = 240;
        }

        if (mode === 'light') { bgR = 245; bgG = 245; bgB = 245; }

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // If pixel is already transparent (PNG)
          if (a < 30) {
            data[i + 3] = 0;
            continue;
          }

          // Distance from sampled background color
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

          if (dist < tolerance) {
            // Cutout background: set transparent!
            data[i + 3] = 0;
          } else {
            // Solid dark silhouette pose for student body
            data[i] = 15;
            data[i + 1] = 23;
            data[i + 2] = 42;
            data[i + 3] = 255;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Silhouette cutout error:', err);
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
  });
}

export function StudentSilhouetteGame({ currentUser }) {
  const [students, setStudents] = useState(DEFAULT_SAMPLE_STUDENTS);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhoto, setNewStudentPhoto] = useState('');
  const [newSilhouettePhoto, setNewSilhouettePhoto] = useState('');
  const [cutoutTolerance, setCutoutTolerance] = useState(48);
  const [cutoutMode, setCutoutMode] = useState('auto'); // 'auto' | 'light' | 'none'
  const [isProcessingCutout, setIsProcessingCutout] = useState(false);

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const storageKey = `gvd_parent_meeting_silhouette_${currentUser?.id || 'default'}`;

  // Hydrate initial data safely from IndexedDB & LocalStorage on mount
  useEffect(() => {
    let isCancelled = false;
    IDBStorageService.getItem(storageKey).then(idbData => {
      if (isCancelled) return;
      if (Array.isArray(idbData) && idbData.length > 0) {
        setStudents(idbData);
      } else {
        const local = localStorage.getItem(storageKey);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setStudents(parsed);
            }
          } catch (e) {}
        }
      }
    });
    return () => { isCancelled = true; };
  }, [currentUser, storageKey]);

  // Save changes safely to IndexedDB (unlimited quota) with localStorage try/catch safety
  useEffect(() => {
    if (!students || students.length === 0) return;

    // Offload to IndexedDB
    IDBStorageService.setItem(storageKey, students).catch(() => {});

    // Try localStorage with QuotaExceededError protection
    try {
      localStorage.setItem(storageKey, JSON.stringify(students));
    } catch (e) {
      console.warn('LocalStorage quota reached, persisted in IndexedDB:', e);
    }
  }, [students, storageKey]);

  // Re-process uploaded photo cutout when tolerance or mode changes in modal
  useEffect(() => {
    if (!newStudentPhoto) return;
    setIsProcessingCutout(true);
    processCutoutSilhouette(newStudentPhoto, { tolerance: cutoutTolerance, mode: cutoutMode })
      .then(res => {
        setNewSilhouettePhoto(res);
        setIsProcessingCutout(false);
      });
  }, [newStudentPhoto, cutoutTolerance, cutoutMode]);

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
  const handleImportFromHomeroom = async () => {
    try {
      const hrData = StorageService.getTeacherHomeroom(currentUser?.id);
      if (hrData && hrData.students && Array.isArray(hrData.students) && hrData.students.length > 0) {
        setIsProcessingCutout(true);
        const importedPromises = hrData.students.map(async (st, idx) => {
          let photoUrl = st.avatar || DEFAULT_SAMPLE_STUDENTS[idx % DEFAULT_SAMPLE_STUDENTS.length].photoUrl;
          // Compress avatar photo first if base64
          if (photoUrl && photoUrl.startsWith('data:image')) {
            photoUrl = await compressImage(photoUrl, 450, 450, 0.85);
          }
          const silhouetteUrl = await processCutoutSilhouette(photoUrl, { tolerance: 48, mode: 'auto' });
          return {
            id: `hr_${st.id || idx}_${Date.now()}`,
            name: st.name || `Học sinh ${idx + 1}`,
            poseLabel: st.gender === 'Nữ' ? 'Tư thế học sinh nữ' : 'Tư thế học sinh nam',
            photoUrl,
            silhouetteUrl: silhouetteUrl || DEFAULT_SAMPLE_STUDENTS[idx % DEFAULT_SAMPLE_STUDENTS.length].silhouetteUrl,
            isRevealed: false
          };
        });

        const imported = await Promise.all(importedPromises);
        setStudents(imported);
        setIsProcessingCutout(false);
        if (audioEnabled) SoundFX.correct();
        alert(`🎉 Đã tải thành công ${imported.length} học sinh từ Lớp Chủ Nhiệm và tự động tách nền lấy bóng dáng tư thế!`);
      } else {
        alert('⚠️ Chưa tìm thấy dữ liệu học sinh trong Lớp Chủ Nhiệm. Thầy/Cô có thể tải ảnh lên thủ công.');
      }
    } catch (err) {
      console.warn('Homeroom import notice:', err);
      setIsProcessingCutout(false);
    }
  };

  // Handle single photo upload with automatic image compression to prevent QuotaExceededError
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingCutout(true);
    try {
      // Compress photo to max 500px under 40KB
      const compressedBase64 = await compressImage(file, 500, 500, 0.82);
      setNewStudentPhoto(String(compressedBase64));
    } catch (err) {
      console.warn('Image compression fallback:', err);
    } finally {
      setIsProcessingCutout(false);
    }
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
      silhouetteUrl: newSilhouettePhoto || newStudentPhoto,
      isRevealed: false
    };

    setStudents(prev => [...prev, newSt]);
    setNewStudentName('');
    setNewStudentPhoto('');
    setNewSilhouettePhoto('');
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
    if (confirm('Thầy/Cô có muốn khôi phục về bộ ảnh dáng tư thế mẫu ban đầu không?')) {
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
              🎭 ĐOÁN BÓNG TÌM CON (TỰ ĐỘNG TÁCH NỀN LẤY DÁNG TƯ THẾ)
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
            disabled={isProcessingCutout}
            style={{
              background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '10px',
              padding: '7px 14px', fontWeight: 800, fontSize: '0.82rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Users size={16} />
            <span>{isProcessingCutout ? 'ĐANG TÁCH NỀN BÓNG DÁNG...' : 'LẤY TỪ LỚP CHỦ NHIỆM'}</span>
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
            title="Khôi phục về bộ dáng tư thế mẫu mặc định"
            style={{
              background: 'rgba(255,255,255,0.08)', color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
              padding: '7px 12px', fontWeight: 700, fontSize: '0.8rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <RotateCcw size={14} />
            <span>MẪU DÁNG</span>
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
            📌 Hướng Dẫn: Kính mời Phụ Huynh quan sát tư thế bóng dáng của học sinh (đã tách sạch khung nền) và đoán số tương ứng!
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

          // Determine which image URL to render:
          // Unrevealed mode -> render student.silhouetteUrl (transparent background cutout!)
          // Revealed mode -> render student.photoUrl (full color original photo!)
          const displayImage = isRevealed ? student.photoUrl : (student.silhouetteUrl || student.photoUrl);

          return (
            <div 
              key={student.id}
              onClick={() => handleToggleReveal(student.id)}
              title={isRevealed ? `Bấm để ẩn lại bóng dáng tư thế` : `Bấm vào đây để mở đáp án ảnh thật cho Phụ Huynh!`}
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

                {/* THE SILHOUETTE BODY CUTOUT VS REVEALED REAL PHOTO DISPLAY */}
                <img 
                  src={displayImage} 
                  alt={student.name}
                  style={{
                    maxWidth: '100%', maxHeight: '100%',
                    objectFit: 'contain',
                    // Fallback brightness filter if silhouetteUrl is raw photo
                    filter: (!isRevealed && !student.silhouetteUrl) 
                      ? 'brightness(0) drop-shadow(0 4px 10px rgba(0,0,0,0.8))'
                      : 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
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

      {/* Modal for Uploading & Auto-Tuning Cutout Student Photos */}
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
              border: '1.5px solid #ec4899', width: '100%', maxWidth: '540px',
              padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
              display: 'flex', flexDirection: 'column', gap: '18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f472b6', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={22} />
                Tải Ảnh & Tự Động Tách Nền Bóng Dáng
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
                  Hình Ảnh Học Sinh (Tải tệp từ máy tính):
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
                    padding: '16px', textAlign: 'center', cursor: 'pointer',
                    background: 'rgba(236, 72, 153, 0.05)', transition: 'all 0.2s'
                  }}
                >
                  {newStudentPhoto ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>Ảnh Gốc:</div>
                        <img src={newStudentPhoto} alt="Original" style={{ maxHeight: '120px', borderRadius: '10px', objectFit: 'contain' }} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: '#f472b6', fontWeight: 700, marginBottom: '4px' }}>Bóng Dáng Tách Nền:</div>
                        <div style={{ background: '#020617', padding: '6px', borderRadius: '10px', display: 'inline-block' }}>
                          <img src={newSilhouettePhoto || newStudentPhoto} alt="Silhouette Cutout" style={{ maxHeight: '110px', objectFit: 'contain' }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#f472b6' }}>
                      <Upload size={28} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Bấm vào đây để chọn tệp ảnh chụp tư thế học sinh</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Hệ thống tự động cắt bỏ nền tường và lấy riêng bóng đen tư thế học sinh!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tách Nền Fine-Tuning Controls */}
              {newStudentPhoto && (
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: '#fde047', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sliders size={14} /> Độ Nhạy Cắt Nền: {cutoutTolerance}
                    </span>
                    {isProcessingCutout && <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>Đang xử lý...</span>}
                  </div>
                  <input 
                    type="range" min="15" max="110" step="3"
                    value={cutoutTolerance}
                    onChange={(e) => setCutoutTolerance(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#ec4899', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setCutoutMode('auto')}
                      style={{
                        flex: 1, background: cutoutMode === 'auto' ? '#ec4899' : 'rgba(255,255,255,0.08)',
                        color: '#fff', border: 'none', borderRadius: '6px', padding: '4px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer'
                      }}
                    >
                      Tự Động Tách
                    </button>
                    <button
                      type="button"
                      onClick={() => setCutoutMode('light')}
                      style={{
                        flex: 1, background: cutoutMode === 'light' ? '#ec4899' : 'rgba(255,255,255,0.08)',
                        color: '#fff', border: 'none', borderRadius: '6px', padding: '4px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer'
                      }}
                    >
                      Nền Tường Sáng
                    </button>
                    <button
                      type="button"
                      onClick={() => setCutoutMode('none')}
                      style={{
                        flex: 1, background: cutoutMode === 'none' ? '#ec4899' : 'rgba(255,255,255,0.08)',
                        color: '#fff', border: 'none', borderRadius: '6px', padding: '4px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer'
                      }}
                    >
                      Ảnh Đã Tách Nền Sẵn (PNG)
                    </button>
                  </div>
                </div>
              )}

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
                  disabled={isProcessingCutout}
                  style={{
                    flex: 1, background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', color: '#ffffff',
                    border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)'
                  }}
                >
                  {isProcessingCutout ? 'ĐANG TÁCH NỀN...' : '+ TẢI LÊN & THÊM VÀO GAME'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
