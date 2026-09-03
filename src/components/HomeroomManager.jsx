import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Upload, ShieldAlert, Award, Cake, Save, RefreshCw, Search, Edit3, Trash2, Image, FileSpreadsheet, CheckCircle2, AlertCircle, Phone, MapPin, Sparkles, X, Plus, Settings, Crown, Medal, Trophy, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StorageService } from '../services/storage';
import { parseStudentRosterFile, downloadHomeroomSampleExcel } from '../utils/universalParser';
import { StudentDetailModal } from './StudentDetailModal';
import { SoundFX } from '../utils/sound';
import { compressImage, normalizeImageUrl, optimizeHomeroomClassData } from '../utils/imageCompressor';
import { AvatarStorageService } from '../services/avatarStorage';

// Helper function to calculate conduct points for a student
export function calculateStudentConductScore(student, pointRules) {
  const base = typeof student.basePoints === 'number' ? student.basePoints : (pointRules?.basePoints ?? 100);
  const rewardBonus = pointRules?.rewardBonus ?? 10;
  const violationDeduction = pointRules?.violationDeduction ?? 5;

  const totalRewardsPts = (student.rewards || []).reduce((sum, r) => sum + (typeof r.points === 'number' ? r.points : rewardBonus), 0);
  const totalViolationsPts = (student.violations || []).reduce((sum, v) => sum + (typeof v.points === 'number' ? v.points : violationDeduction), 0);

  return Math.max(0, base + totalRewardsPts - totalViolationsPts);
}

export function HomeroomManager({ currentUser, readOnlyAdminClass = null }) {
  const teacherId = readOnlyAdminClass ? readOnlyAdminClass.teacher.id : currentUser?.id;
  const isReadOnlyAdmin = !!readOnlyAdminClass;

  const [classData, setClassData] = useState(() => {
    let initialData = null;
    if (readOnlyAdminClass) {
      initialData = readOnlyAdminClass.classData;
    } else if (teacherId) {
      initialData = StorageService.getTeacherHomeroom(teacherId);
    }
    if (initialData) {
      if (!initialData.pointRules) {
        initialData.pointRules = { basePoints: 100, rewardBonus: 10, violationDeduction: 5, topHonorsCount: 3 };
      }
      if (!initialData.schoolYear || initialData.schoolYear === '2025 - 2026') {
        initialData.schoolYear = '2026 - 2027';
      }
      return initialData;
    }
    return {
      className: 'Lớp Chủ Nhiệm 10A1',
      schoolYear: '2026 - 2027',
      classBgImage: '',
      classPhoto: '',
      pointRules: {
        basePoints: 100,
        rewardBonus: 10,
        violationDeduction: 5,
        topHonorsCount: 3
      },
      students: []
    };
  });

  const [selectedTab, setSelectedTab] = useState('roster'); // 'roster' | 'honors' | 'violations_all' | 'rewards' | 'violations_warning' | 'birthdays'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [showResetModal, setShowResetModal] = useState(false);

  // Quick Action Modal States (+ Thêm Vi Phạm & + Thêm Khen Thưởng)
  const [quickAddType, setQuickAddType] = useState(null); // 'violation' | 'reward' | null
  const [quickStudentId, setQuickStudentId] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPoints, setQuickPoints] = useState(10);
  const [quickNote, setQuickNote] = useState('');

  // Point Rules Modal State (Cài Đặt Điểm Nề Nếp)
  const [showPointRulesModal, setShowPointRulesModal] = useState(false);
  const [tempRules, setTempRules] = useState({
    basePoints: 100,
    rewardBonus: 10,
    violationDeduction: 5,
    topHonorsCount: 3
  });

  // Time period filter for Honors Board
  const [honorsPeriod, setHonorsPeriod] = useState('month'); // 'week' | 'month' | 'term'

  // Photo URL Modal State ('bg' | 'photo' | null)
  const [photoModalType, setPhotoModalType] = useState(null);
  const [directUrlInput, setDirectUrlInput] = useState('');

  const handleApplyDirectUrl = (e) => {
    if (e) e.preventDefault();
    if (!photoModalType || !directUrlInput || !directUrlInput.trim()) return;
    const cleanUrl = normalizeImageUrl(directUrlInput);
    const updated = photoModalType === 'bg'
      ? { ...classData, classBgImage: cleanUrl }
      : { ...classData, classPhoto: cleanUrl };
    setClassData(updated);
    StorageService.saveTeacherHomeroom(teacherId, updated);
    setPhotoModalType(null);
    setDirectUrlInput('');
    setStatusMsg({
      type: 'success',
      text: photoModalType === 'bg' ? '🎨 Đã cập nhật ảnh nền lớp học thành công!' : '🖼️ Đã cập nhật ảnh tập thể lớp thành công!'
    });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
  };

  const handleLocalClassPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImage(file, 900, 900, 0.75);
      const updated = photoModalType === 'bg'
        ? { ...classData, classBgImage: compressedDataUrl }
        : { ...classData, classPhoto: compressedDataUrl };
      setClassData(updated);
      StorageService.saveTeacherHomeroom(teacherId, updated);
      setPhotoModalType(null);
      setDirectUrlInput('');
      setStatusMsg({
        type: 'success',
        text: photoModalType === 'bg' ? '🎨 Đã nạp và lưu ảnh nền lớp từ máy tính thành công!' : '🖼️ Đã nạp và lưu ảnh tập thể lớp từ máy tính thành công!'
      });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      alert('Không thể đọc file ảnh từ máy tính. Vui lòng thử lại với file ảnh JPEG/PNG khác.');
    }
  };

  const isDataLoadedRef = React.useRef(false);

  // Load homeroom data when teacherId changes & auto-optimize oversized avatars
  useEffect(() => {
    let data = null;
    if (readOnlyAdminClass) {
      data = readOnlyAdminClass.classData;
    } else if (teacherId) {
      data = StorageService.getTeacherHomeroom(teacherId);
    }
    if (data) {
      if (!data.pointRules) {
        data.pointRules = { basePoints: 100, rewardBonus: 10, violationDeduction: 5, topHonorsCount: 3 };
      }
      if (!data.schoolYear || data.schoolYear === '2025 - 2026') {
        data.schoolYear = '2026 - 2027';
      }
      setClassData(data);
      setTempRules(data.pointRules);

      // Async sync from IndexedDB for guaranteed high-capacity storage restoration
      if (!readOnlyAdminClass && teacherId) {
        StorageService.syncHomeroomWithIndexedDB(teacherId).then(idbData => {
          if (idbData && Array.isArray(idbData.students) && idbData.students.length >= (data?.students?.length || 0)) {
            setClassData(idbData);
            if (idbData.pointRules) setTempRules(idbData.pointRules);
          }
        }).catch(() => {});
      }

      // Preload all avatars into AvatarStorageService memory cache
      if (Array.isArray(data.students)) {
        AvatarStorageService.preloadAvatars(data.students).then(() => {
          setClassData(prev => ({ ...prev }));
        });
      }

      // Auto-compress any old oversized base64 student avatars from previous uncompressed uploads
      optimizeHomeroomClassData(data).then(optimizedData => {
        if (optimizedData && optimizedData !== data) {
          setClassData(optimizedData);
          if (!readOnlyAdminClass && teacherId) {
            StorageService.saveTeacherHomeroom(teacherId, optimizedData);
          }
        }
      });
    }
    // Mark as safely loaded
    isDataLoadedRef.current = true;
  }, [teacherId, readOnlyAdminClass]);

  // REAL-TIME AUTO-SAVE EFFECT: Safely persists any user change (Class Name, Photos, Students) instantly!
  useEffect(() => {
    if (!isReadOnlyAdmin && teacherId && classData && classData.className && isDataLoadedRef.current) {
      StorageService.saveTeacherHomeroom(teacherId, classData);
    }
  }, [classData, teacherId, isReadOnlyAdmin]);

  const currentMonthNum = new Date().getMonth() + 1;
  const pointRules = classData.pointRules || { basePoints: 100, rewardBonus: 10, violationDeduction: 5, topHonorsCount: 3 };

  // Sorted & Filtered students
  const filteredStudents = (classData.students || []).filter(st => {
    const term = searchTerm.toLowerCase();
    return (
      st.name.toLowerCase().includes(term) ||
      st.studentId.toLowerCase().includes(term) ||
      (st.phone && st.phone.includes(term)) ||
      (st.address && st.address.toLowerCase().includes(term))
    );
  });

  // Ranked students by conduct points (High to Low)
  const rankedStudents = [...(classData.students || [])].sort((a, b) => {
    return calculateStudentConductScore(b, pointRules) - calculateStudentConductScore(a, pointRules);
  });

  // Top Honors Students
  const topHonorsCount = Math.max(1, pointRules.topHonorsCount || 3);
  const honorsTopStudents = rankedStudents.slice(0, topHonorsCount);

  // All students with at least 1 violation
  const allViolationStudents = (classData.students || []).filter(st => (st.violations || []).length > 0);

  // AUTOMATIC WARNING FILTER: Students with 2 or more violations (>= 2 times)
  const highViolationStudents = (classData.students || []).filter(st => (st.violations || []).length >= 2);

  // Save Homeroom Data
  const handleSaveClass = () => {
    if (isReadOnlyAdmin) return;
    StorageService.saveTeacherHomeroom(teacherId, classData);
    try { SoundFX.correct(); } catch(e) {}
    setStatusMsg({ type: 'success', text: '✅ Đã lưu dữ liệu Lớp Chủ Nhiệm thành công!' });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
  };

  // Quick Add Violation or Reward Execution
  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!quickStudentId || !quickTitle.trim()) {
      alert('Vui lòng chọn học sinh và nhập nội dung.');
      return;
    }

    const updatedStudents = classData.students.map(st => {
      if (st.id === quickStudentId) {
        const today = new Date().toISOString().split('T')[0];
        if (quickAddType === 'violation') {
          const newV = {
            id: `v_${Date.now()}`,
            date: today,
            title: quickTitle.trim(),
            severity: 'Trung bình',
            points: Number(quickPoints) || pointRules.violationDeduction,
            note: quickNote.trim()
          };
          return { ...st, violations: [...(st.violations || []), newV] };
        } else {
          const newR = {
            id: `r_${Date.now()}`,
            date: today,
            title: quickTitle.trim(),
            bonus: `+${quickPoints} điểm nề nếp`,
            points: Number(quickPoints) || pointRules.rewardBonus,
            note: quickNote.trim()
          };
          return { ...st, rewards: [...(st.rewards || []), newR] };
        }
      }
      return st;
    });

    const updatedClass = { ...classData, students: updatedStudents };
    setClassData(updatedClass);
    if (!isReadOnlyAdmin) StorageService.saveTeacherHomeroom(teacherId, updatedClass);

    if (quickAddType === 'reward') {
      try { SoundFX.fanfare(); } catch(e) {}
      try { confetti({ particleCount: 70, spread: 60 }); } catch(e) {}
    } else {
      try { SoundFX.wrong(); } catch(e) {}
    }

    setQuickAddType(null);
    setQuickStudentId('');
    setQuickTitle('');
    setQuickNote('');
    setStatusMsg({
      type: 'success',
      text: quickAddType === 'violation' ? '🚨 Đã ghi nhận vi phạm mới và tự động cập nhật vào Bảng Cảnh Báo!' : '🏆 Đã ghi nhận khen thưởng mới và cộng điểm nề nếp!'
    });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
  };

  // Save Point Rules Configuration
  const handleSavePointRules = (e) => {
    e.preventDefault();
    const updatedClass = { ...classData, pointRules: tempRules };
    setClassData(updatedClass);
    if (!isReadOnlyAdmin) StorageService.saveTeacherHomeroom(teacherId, updatedClass);
    setShowPointRulesModal(false);
    try { SoundFX.correct(); } catch(e) {}
    setStatusMsg({ type: 'success', text: '⚙️ Đã cập nhật Quy Tắc Cộng/Trừ Điểm Nề Nếp cho toàn lớp!' });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
  };

  // Reset Homeroom Data
  const executeResetClass = (mode) => {
    if (isReadOnlyAdmin) return;
    const resetData = StorageService.resetTeacherHomeroom(teacherId, mode);
    setClassData(resetData);
    try { SoundFX.click(); } catch(e) {}
    setShowResetModal(false);
    setStatusMsg({
      type: 'success',
      text: mode === 'clear' ? '🧹 Đã xóa sạch danh sách học sinh (Lớp trống 0 học sinh)!' : '🔄 Đã khôi phục danh sách học sinh mẫu ban đầu!'
    });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 3500);
  };

  // Background Image Upload with Auto-Compression
  const handleClassBgUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressedDataUrl = await compressImage(file, 1000, 1000, 0.72);
      const updated = { ...classData, classBgImage: compressedDataUrl };
      setClassData(updated);
      StorageService.saveTeacherHomeroom(teacherId, updated);
      setStatusMsg({ type: 'success', text: '🎨 Đã cập nhật ảnh nền lớp học thành công!' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    }
  };

  // Class Photo Upload with Auto-Compression
  const handleClassPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressedDataUrl = await compressImage(file, 1000, 1000, 0.72);
      const updated = { ...classData, classPhoto: compressedDataUrl };
      setClassData(updated);
      StorageService.saveTeacherHomeroom(teacherId, updated);
      try { SoundFX.win(); } catch(e) {}
      setStatusMsg({ type: 'success', text: '🖼️ Đã cập nhật ảnh tập thể lớp học thành công!' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    }
  };

  const handleDeleteClassPhoto = () => {
    const updated = { ...classData, classPhoto: '' };
    setClassData(updated);
    StorageService.saveTeacherHomeroom(teacherId, updated);
  };

  // Student Roster Universal File Upload
  const handleRosterFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessingFile(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const importedStudents = await parseStudentRosterFile(file);
      const updatedStudents = [...classData.students, ...importedStudents];
      const updatedClass = { ...classData, students: updatedStudents };
      
      setClassData(updatedClass);
      StorageService.saveTeacherHomeroom(teacherId, updatedClass);
      try { SoundFX.fanfare(); } catch(e) {}
      setStatusMsg({
        type: 'success',
        text: `⚡ Đã trích xuất & thêm thành công ${importedStudents.length} học sinh từ file "${file.name}"!`
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: '❌ Lỗi đọc file: ' + err.message });
    } finally {
      setIsProcessingFile(false);
      e.target.value = '';
    }
  };

  // Add New Student
  const handleAddStudent = () => {
    const newSt = {
      id: `st_${Date.now()}`,
      studentId: `HS10${(classData.students.length + 1).toString().padStart(2, '0')}`,
      name: 'Học Sinh Mới',
      dob: '2010-01-01',
      gender: 'Nam',
      fatherName: '',
      motherName: '',
      phone: '',
      address: '',
      avatar: '',
      teacherNotes: '',
      academicProgress: 'Tiến bộ',
      violations: [],
      rewards: []
    };
    setEditingStudent(newSt);
    setIsModalOpen(true);
  };

  // Save Single Student Edit
  const handleSaveStudent = (updatedStudent) => {
    if (updatedStudent.avatar) {
      AvatarStorageService.saveAvatar(updatedStudent.id, updatedStudent.avatar);
    }
    const existingIdx = classData.students.findIndex(s => s.id === updatedStudent.id);
    let newStudents = [...classData.students];
    if (existingIdx >= 0) {
      newStudents[existingIdx] = updatedStudent;
    } else {
      newStudents.unshift(updatedStudent);
    }
    const updatedClass = { ...classData, students: newStudents };
    setClassData(updatedClass);
    StorageService.saveTeacherHomeroom(teacherId, updatedClass);
  };

  // Delete Student
  const handleDeleteStudent = (sId) => {
    const newStudents = classData.students.filter(s => s.id !== sId);
    const updatedClass = { ...classData, students: newStudents };
    setClassData(updatedClass);
    StorageService.saveTeacherHomeroom(teacherId, updatedClass);
  };

  // Birthday Students
  const birthdayStudents = (classData.students || []).filter(st => {
    if (!st.dob) return false;
    const parts = st.dob.split(/[\/\-\.]/);
    let m = 0;
    if (parts.length === 3) {
      if (parts[0].length === 4) m = parseInt(parts[1], 10);
      else m = parseInt(parts[1], 10);
    }
    return m === currentMonthNum;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Class Banner Container */}
      <div 
        className="glass-panel"
        style={{
          padding: '28px 36px',
          borderRadius: '24px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: classData.classBgImage ? `linear-gradient(to right, rgba(7,21,33,0.92) 0%, rgba(7,21,33,0.75) 100%), url(${classData.classBgImage})` : 'linear-gradient(135deg, rgba(7, 30, 44, 0.95) 0%, rgba(13, 148, 136, 0.35) 50%, rgba(2, 132, 199, 0.25) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1.5px solid rgba(0, 168, 150, 0.45)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge" style={{ background: '#00a896', color: '#fff', fontWeight: 800, padding: '4px 12px', borderRadius: '14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                🏫 LỚP CHỦ NHIỆM • NĂM HỌC
                <select
                  disabled={isReadOnlyAdmin}
                  value={classData.schoolYear || '2026 - 2027'}
                  onChange={(e) => setClassData({ ...classData, schoolYear: e.target.value })}
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '2px 8px',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="2026 - 2027" style={{ color: '#0f172a' }}>2026 - 2027</option>
                  <option value="2025 - 2026" style={{ color: '#0f172a' }}>2025 - 2026</option>
                  <option value="2027 - 2028" style={{ color: '#0f172a' }}>2027 - 2028</option>
                  <option value="2028 - 2029" style={{ color: '#0f172a' }}>2028 - 2029</option>
                </select>
              </span>
              {isReadOnlyAdmin && (
                <span className="badge" style={{ background: '#ec4899', color: '#fff', fontWeight: 800, padding: '4px 12px', borderRadius: '14px', fontSize: '0.8rem' }}>
                  🔍 CHẾ ĐỘ KIỂM SOÁT ADMIN
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="text"
                disabled={isReadOnlyAdmin}
                value={classData.className}
                onChange={(e) => setClassData({ ...classData, className: e.target.value })}
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  color: '#fff',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '2px dashed rgba(0,168,150,0.5)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  width: 'auto'
                }}
              />
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '6px' }}>
              Tổng sĩ số: <strong style={{ color: '#5eead4', fontSize: '1.1rem' }}>{classData.students.length} học sinh</strong>
            </p>
          </div>

          {/* Banner Stats Cards & Actions */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '12px 18px', borderRadius: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fca5a5', display: 'block' }}>
                {highViolationStudents.length}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 700 }}>
                🚨 Cảnh báo &ge; 2 vi phạm
              </span>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '12px 18px', borderRadius: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fde047', display: 'block' }}>
                {birthdayStudents.length}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#fde047', fontWeight: 700 }}>
                🎂 Sinh nhật T{currentMonthNum}
              </span>
            </div>

            {!isReadOnlyAdmin && (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setPhotoModalType('bg')}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', borderRadius: '16px' }}
              >
                <Image size={18} />
                <span style={{ fontSize: '0.72rem', marginTop: '4px' }}>Đổi Ảnh Nền Lớp</span>
              </button>
            )}
          </div>

          {/* Right Side: Class Photo Showcase Frame */}
          <div style={{
            position: 'relative',
            width: '300px',
            height: '165px',
            borderRadius: '20px',
            overflow: 'hidden',
            border: classData.classPhoto ? '2px solid #00a896' : '2px dashed rgba(0, 168, 150, 0.6)',
            background: 'rgba(7, 21, 33, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.35)'
          }}>
            {classData.classPhoto ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img 
                  src={classData.classPhoto} 
                  alt="Ảnh Tập Thể Lớp" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  padding: '10px 14px'
                }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.82rem' }}>
                    🖼️ Ảnh Lớp Học
                  </span>
                  {!isReadOnlyAdmin && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => setPhotoModalType('photo')}
                        style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Đổi Ảnh
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={handleDeleteClassPhoto} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ fontSize: '1.8rem', background: 'rgba(0,168,150,0.2)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #00a896' }}>
                  📸
                </div>
                <span style={{ color: '#5eead4', fontWeight: 800, fontSize: '0.85rem' }}>
                  Ảnh Tập Thể Lớp Học
                </span>
                {!isReadOnlyAdmin && (
                  <button 
                    className="btn btn-success btn-sm" 
                    onClick={() => setPhotoModalType('photo')}
                    style={{ padding: '4px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Upload size={14} /> Tải / Chọn Ảnh Lớp
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MAIN ACTION BAR WITH FEATURE BUTTONS */}
      {!isReadOnlyAdmin && (
        <div style={{
          background: 'rgba(7, 21, 33, 0.85)',
          border: '1.5px solid rgba(0, 168, 150, 0.4)',
          padding: '16px 24px',
          borderRadius: '20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
        }}>
          {/* Quick Violations & Rewards Entry Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-danger"
              onClick={() => {
                setQuickAddType('violation');
                setQuickStudentId(classData.students[0]?.id || '');
                setQuickPoints(pointRules.violationDeduction);
              }}
              style={{ fontWeight: 800, borderRadius: '14px', padding: '10px 18px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
            >
              🚨 + Thêm Vi Phạm
            </button>

            <button
              className="btn btn-warning"
              onClick={() => {
                setQuickAddType('reward');
                setQuickStudentId(classData.students[0]?.id || '');
                setQuickPoints(pointRules.rewardBonus);
              }}
              style={{ fontWeight: 900, borderRadius: '14px', padding: '10px 18px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#000', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}
            >
              🏆 + Thêm Khen Thưởng
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShowPointRulesModal(true)}
              style={{ fontWeight: 800, borderRadius: '14px', padding: '10px 16px', background: 'rgba(167, 139, 250, 0.2)', border: '1.5px solid #a78bfa', color: '#c4b5fd' }}
            >
              <Settings size={18} /> ⚙️ Cài Đặt Quy Tắc Điểm
            </button>
          </div>

          {/* Import, Add Student & Class Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary" 
              onClick={downloadHomeroomSampleExcel}
              style={{
                padding: '10px 16px',
                fontWeight: 800,
                fontSize: '0.88rem',
                borderRadius: '14px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
              }}
              title="Tải tệp mẫu Excel chuẩn để nhập danh sách học sinh"
            >
              <FileSpreadsheet size={16} /> 📄 Tải File Excel Mẫu (.xlsx)
            </button>

            <label className="btn btn-success" style={{ cursor: 'pointer', padding: '10px 16px', fontWeight: 800, fontSize: '0.88rem', borderRadius: '14px' }}>
              <Upload size={16} />
              {isProcessingFile ? '⏳ Đang Đọc File...' : '⚡ Nạp File Học Sinh (Excel, Word)'}
              <input type="file" accept=".xlsx, .xls, .csv, .docx, .doc, .pdf, .txt" onChange={handleRosterFileUpload} style={{ display: 'none' }} />
            </label>

            <button className="btn btn-primary" onClick={handleAddStudent} style={{ padding: '10px 16px', fontWeight: 800, borderRadius: '14px' }}>
              <UserPlus size={16} /> + Thêm Học Sinh
            </button>

            <button className="btn btn-secondary" onClick={() => setShowResetModal(true)} style={{ padding: '10px 14px', borderRadius: '14px' }} title="Reset dữ liệu">
              <RefreshCw size={16} />
            </button>

            <button className="btn btn-success" onClick={handleSaveClass} style={{ padding: '10px 20px', fontWeight: 900, borderRadius: '14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Save size={16} /> Lưu
            </button>
          </div>
        </div>
      )}

      {/* Feedback Status Message */}
      {statusMsg.text && (
        <div style={{
          padding: '12px 20px',
          borderRadius: '14px',
          marginBottom: '20px',
          background: statusMsg.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          border: `1px solid ${statusMsg.type === 'error' ? '#ef4444' : '#10b981'}`,
          color: statusMsg.type === 'error' ? '#fca5a5' : '#6ee7b7',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {statusMsg.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {statusMsg.text}
        </div>
      )}

      {/* NAVIGATION SUB-TABS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn"
            onClick={() => setSelectedTab('roster')}
            style={{
              borderRadius: '16px',
              padding: '10px 18px',
              fontWeight: 900,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              background: selectedTab === 'roster' ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' : '#ffffff',
              color: selectedTab === 'roster' ? '#ffffff' : '#0f172a',
              border: selectedTab === 'roster' ? 'none' : '1.5px solid #cbd5e1',
              boxShadow: selectedTab === 'roster' ? '0 6px 20px rgba(13, 148, 136, 0.45)' : '0 2px 8px rgba(0,0,0,0.08)',
              transform: selectedTab === 'roster' ? 'scale(1.03)' : 'scale(1)'
            }}
          >
            📋 Danh Sách Học Sinh ({classData.students.length})
          </button>

          <button 
            className="btn"
            onClick={() => setSelectedTab('honors')}
            style={{
              borderRadius: '16px',
              padding: '10px 18px',
              fontWeight: 900,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              background: selectedTab === 'honors' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#ffffff',
              color: selectedTab === 'honors' ? '#000000' : '#92400e',
              border: selectedTab === 'honors' ? 'none' : '1.5px solid #fcd34d',
              boxShadow: selectedTab === 'honors' ? '0 6px 20px rgba(245, 158, 11, 0.45)' : '0 2px 8px rgba(0,0,0,0.08)',
              transform: selectedTab === 'honors' ? 'scale(1.03)' : 'scale(1)'
            }}
          >
            👑 BẢNG TUYÊN DƯƠNG (TOP {topHonorsCount})
          </button>

          {/* DEDICATED VIOLATIONS TAB RIGHT NEXT TO REWARDS */}
          <button 
            className="btn"
            onClick={() => setSelectedTab('violations_all')}
            style={{
              borderRadius: '16px',
              padding: '10px 18px',
              fontWeight: 900,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              background: selectedTab === 'violations_all' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#ffffff',
              color: selectedTab === 'violations_all' ? '#ffffff' : '#991b1b',
              border: selectedTab === 'violations_all' ? 'none' : '1.5px solid #fca5a5',
              boxShadow: selectedTab === 'violations_all' ? '0 6px 20px rgba(239, 68, 68, 0.45)' : '0 2px 8px rgba(0,0,0,0.08)',
              transform: selectedTab === 'violations_all' ? 'scale(1.03)' : 'scale(1)'
            }}
          >
            ⚠️ Vi Phạm ({allViolationStudents.length})
          </button>

          <button 
            className="btn"
            onClick={() => setSelectedTab('rewards')}
            style={{
              borderRadius: '16px',
              padding: '10px 18px',
              fontWeight: 900,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              background: selectedTab === 'rewards' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#ffffff',
              color: selectedTab === 'rewards' ? '#ffffff' : '#065f46',
              border: selectedTab === 'rewards' ? 'none' : '1.5px solid #6ee7b7',
              boxShadow: selectedTab === 'rewards' ? '0 6px 20px rgba(16, 185, 129, 0.45)' : '0 2px 8px rgba(0,0,0,0.08)',
              transform: selectedTab === 'rewards' ? 'scale(1.03)' : 'scale(1)'
            }}
          >
            🏆 Khen Thưởng
          </button>

          {/* AUTOMATIC WARNING MONITORING TAB FOR >= 2 VIOLATIONS */}
          <button 
            className="btn"
            onClick={() => setSelectedTab('violations_warning')}
            style={{
              borderRadius: '16px',
              padding: '10px 18px',
              fontWeight: 900,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              background: selectedTab === 'violations_warning' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : '#ffffff',
              color: selectedTab === 'violations_warning' ? '#ffffff' : '#7f1d1d',
              border: selectedTab === 'violations_warning' ? 'none' : '1.5px solid #f87171',
              boxShadow: selectedTab === 'violations_warning' ? '0 6px 20px rgba(220, 38, 38, 0.45)' : '0 2px 8px rgba(0,0,0,0.08)',
              transform: selectedTab === 'violations_warning' ? 'scale(1.03)' : 'scale(1)'
            }}
          >
            🚨 Cảnh Báo Vi Phạm (&ge; 2 lần) ({highViolationStudents.length})
          </button>

          <button 
            className="btn"
            onClick={() => setSelectedTab('birthdays')}
            style={{
              borderRadius: '16px',
              padding: '10px 18px',
              fontWeight: 900,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              background: selectedTab === 'birthdays' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#ffffff',
              color: selectedTab === 'birthdays' ? '#ffffff' : '#075985',
              border: selectedTab === 'birthdays' ? 'none' : '1.5px solid #7dd3fc',
              boxShadow: selectedTab === 'birthdays' ? '0 6px 20px rgba(2, 132, 199, 0.45)' : '0 2px 8px rgba(0,0,0,0.08)',
              transform: selectedTab === 'birthdays' ? 'scale(1.03)' : 'scale(1)'
            }}
          >
            🎂 Sinh Nhật T{currentMonthNum} ({birthdayStudents.length})
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên, mã HS, SĐT..."
            style={{
              width: '100%',
              padding: '9px 14px 9px 40px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              outline: 'none',
              fontSize: '0.88rem'
            }}
          />
        </div>
      </div>

      {/* TAB 1: Roster Table */}
      {selectedTab === 'roster' && (
        <div className="glass-panel" style={{ padding: '0', borderRadius: '20px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 168, 150, 0.25)', borderBottom: '1px solid rgba(0, 168, 150, 0.4)', color: '#5eead4' }}>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>STT</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Mã HS</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Ảnh</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Họ Và Tên (Bấm Để Xem)</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Điểm Nề Nếp</th>
                <th style={{ padding: '14px 16px', fontWeight: 800 }}>Phụ Huynh & SĐT</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'center' }}>Vi Phạm</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'center' }}>Khen Thưởng</th>
                <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Không tìm thấy học sinh nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const score = calculateStudentConductScore(st, pointRules);
                  const vCount = (st.violations || []).length;
                  const rCount = (st.rewards || []).length;
                  const isHighAlert = vCount >= 2;

                  let scoreColor = '#10b981';
                  if (score < 90) scoreColor = '#ef4444';
                  else if (score < 100) scoreColor = '#f59e0b';

                  return (
                    <tr 
                      key={st.id}
                      onClick={() => {
                        setEditingStudent(st);
                        setIsModalOpen(true);
                      }}
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: isHighAlert ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                    >
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#5eead4' }}>{st.studentId}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {st.avatar ? (
                          <img src={st.avatar} alt={st.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #00a896' }} />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
                            {st.name.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#fff' }}>
                        <div style={{ color: '#38bdf8', textDecoration: 'underline' }}>{st.name}</div>
                        {st.teacherNotes && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                            💬 {st.teacherNotes}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="badge" style={{ background: `${scoreColor}20`, color: scoreColor, border: `1.5px solid ${scoreColor}`, fontWeight: 900, fontSize: '0.88rem', padding: '4px 12px' }}>
                          💯 {score} điểm
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>
                        <div>{st.fatherName || st.motherName || 'Phụ huynh'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>📞 {st.phone || 'Chưa có SĐT'}</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {vCount > 0 ? (
                          <span className="badge" style={{ background: isHighAlert ? '#dc2626' : 'rgba(239, 68, 68, 0.2)', color: isHighAlert ? '#fff' : '#fca5a5', fontWeight: 800 }}>
                            {isHighAlert && '🚨 '} {vCount} lần
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>0</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {rCount > 0 ? (
                          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fde047', fontWeight: 800 }}>
                            🏆 {rCount}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>0</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setEditingStudent(st);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit3 size={14} /> Chi tiết
                          </button>
                          {!isReadOnlyAdmin && (
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                if (window.confirm(`Xóa học sinh ${st.name}?`)) {
                                  handleDeleteStudent(st.id);
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: HONORS LEADERBOARD & PODIUM */}
      {selectedTab === 'honors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{
            padding: '24px 28px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #071521 0%, #0f172a 100%)',
            border: '2.5px solid #f59e0b',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fde047', display: 'flex', alignItems: 'center', gap: '10px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                <Crown size={30} color="#fde047" /> BẢNG TUYÊN DƯƠNG HỌC SINH XUẤT SẮC CỦA LỚP
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, marginTop: '6px' }}>
                Vinh danh các học sinh có tổng điểm nề nếp và thành tích rèn luyện cao nhất trong lớp!
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px 12px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24' }}>Mốc Tuyên Dương:</span>
              <button
                className={`btn btn-sm ${honorsPeriod === 'week' ? 'btn-warning' : 'btn-secondary'}`}
                onClick={() => setHonorsPeriod('week')}
                style={{
                  fontWeight: 900,
                  color: '#000000',
                  background: honorsPeriod === 'week' ? '#fbbf24' : '#ffffff',
                  border: honorsPeriod === 'week' ? '1.5px solid #f59e0b' : '1.5px solid rgba(15, 23, 42, 0.2)'
                }}
              >
                Tuần Này
              </button>
              <button
                className={`btn btn-sm ${honorsPeriod === 'month' ? 'btn-warning' : 'btn-secondary'}`}
                onClick={() => setHonorsPeriod('month')}
                style={{
                  fontWeight: 900,
                  color: '#000000',
                  background: honorsPeriod === 'month' ? '#fbbf24' : '#ffffff',
                  border: honorsPeriod === 'month' ? '1.5px solid #f59e0b' : '1.5px solid rgba(15, 23, 42, 0.2)'
                }}
              >
                Tháng Này
              </button>
              <button
                className={`btn btn-sm ${honorsPeriod === 'term' ? 'btn-warning' : 'btn-secondary'}`}
                onClick={() => setHonorsPeriod('term')}
                style={{
                  fontWeight: 900,
                  color: '#000000',
                  background: honorsPeriod === 'term' ? '#fbbf24' : '#ffffff',
                  border: honorsPeriod === 'term' ? '1.5px solid #f59e0b' : '1.5px solid rgba(15, 23, 42, 0.2)'
                }}
              >
                Học Kỳ
              </button>
            </div>
          </div>

          {/* 3D STYLED PODIUM */}
          <div className="glass-panel" style={{
            padding: '36px 20px 20px 20px',
            borderRadius: '24px',
            background: 'radial-gradient(ellipse at 50% 30%, #1e1b4b 0%, #0f172a 100%)',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '24px',
            minHeight: '410px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            
            {/* RANK 2 */}
            {honorsTopStudents[1] && (
              <div 
                onClick={() => { setEditingStudent(honorsTopStudents[1]); setIsModalOpen(true); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '200px', cursor: 'pointer' }}
              >
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <div style={{ position: 'absolute', top: '-26px', left: '50%', transform: 'translateX(-50%)', fontSize: '1.8rem', zIndex: 2 }}>
                    🥈
                  </div>
                  {honorsTopStudents[1].avatar ? (
                    <img src={honorsTopStudents[1].avatar} alt="" style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #cbd5e1', boxShadow: '0 0 20px rgba(203,213,225,0.6)' }} />
                  ) : (
                    <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '2rem', border: '4px solid #cbd5e1' }}>
                      {honorsTopStudents[1].name.charAt(0)}
                    </div>
                  )}
                </div>

                <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.05rem', textAlign: 'center' }}>{honorsTopStudents[1].name}</div>
                <span className="badge" style={{ background: '#94a3b8', color: '#0f172a', fontWeight: 900, fontSize: '0.8rem', marginTop: '4px' }}>
                  🥈 {calculateStudentConductScore(honorsTopStudents[1], pointRules)} điểm
                </span>

                <div style={{
                  width: '100%',
                  height: '140px',
                  marginTop: '12px',
                  borderRadius: '20px 20px 0 0',
                  background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(148,163,184,0.3)',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '2.2rem'
                }}>
                  #2
                </div>
              </div>
            )}

            {/* RANK 1 */}
            {honorsTopStudents[0] && (
              <div 
                onClick={() => { setEditingStudent(honorsTopStudents[0]); setIsModalOpen(true); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '230px', cursor: 'pointer' }}
              >
                <div style={{ position: 'relative', marginBottom: '14px' }}>
                  <div style={{ position: 'absolute', top: '-34px', left: '50%', transform: 'translateX(-50%)', fontSize: '2.6rem', zIndex: 2, filter: 'drop-shadow(0 0 12px #f59e0b)' }}>
                    👑
                  </div>
                  {honorsTopStudents[0].avatar ? (
                    <img src={honorsTopStudents[0].avatar} alt="" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f59e0b', boxShadow: '0 0 35px rgba(245,158,11,0.9)' }} />
                  ) : (
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '2.4rem', border: '4px solid #fef08a' }}>
                      {honorsTopStudents[0].name.charAt(0)}
                    </div>
                  )}
                </div>

                <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '1.25rem', textAlign: 'center', textShadow: '0 2px 8px rgba(245,158,11,0.5)' }}>{honorsTopStudents[0].name}</div>
                <span className="badge badge-accent" style={{ background: '#f59e0b', color: '#000', fontWeight: 900, fontSize: '0.88rem', marginTop: '4px', padding: '6px 14px' }}>
                  🏆 {calculateStudentConductScore(honorsTopStudents[0], pointRules)} ĐIỂM HOÀN HẢO
                </span>

                <div style={{
                  width: '100%',
                  height: '190px',
                  marginTop: '12px',
                  borderRadius: '24px 24px 0 0',
                  background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 40px rgba(245,158,11,0.5)',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '3rem'
                }}>
                  🥇 #1
                </div>
              </div>
            )}

            {/* RANK 3 */}
            {honorsTopStudents[2] && (
              <div 
                onClick={() => { setEditingStudent(honorsTopStudents[2]); setIsModalOpen(true); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '200px', cursor: 'pointer' }}
              >
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <div style={{ position: 'absolute', top: '-26px', left: '50%', transform: 'translateX(-50%)', fontSize: '1.8rem', zIndex: 2 }}>
                    🥉
                  </div>
                  {honorsTopStudents[2].avatar ? (
                    <img src={honorsTopStudents[2].avatar} alt="" style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #d97706', boxShadow: '0 0 20px rgba(217,119,6,0.6)' }} />
                  ) : (
                    <div style={{ width: '84px', height: '84px', borderRadius: '50%', background: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '2rem', border: '4px solid #d97706' }}>
                      {honorsTopStudents[2].name.charAt(0)}
                    </div>
                  )}
                </div>

                <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.05rem', textAlign: 'center' }}>{honorsTopStudents[2].name}</div>
                <span className="badge" style={{ background: '#b45309', color: '#fff', fontWeight: 900, fontSize: '0.8rem', marginTop: '4px' }}>
                  🥉 {calculateStudentConductScore(honorsTopStudents[2], pointRules)} điểm
                </span>

                <div style={{
                  width: '100%',
                  height: '110px',
                  marginTop: '12px',
                  borderRadius: '20px 20px 0 0',
                  background: 'linear-gradient(180deg, #b45309 0%, #78350f 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(180,83,9,0.3)',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '2.2rem'
                }}>
                  #3
                </div>
              </div>
            )}
          </div>

          {/* Full Ranked Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#5eead4', marginBottom: '16px' }}>
              📊 Bảng Xếp Hạng Điểm Nề Nếp Toàn Lớp
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rankedStudents.map((st, idx) => {
                const score = calculateStudentConductScore(st, pointRules);
                return (
                  <div
                    key={st.id}
                    onClick={() => { setEditingStudent(st); setIsModalOpen(true); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      borderRadius: '16px',
                      background: idx < topHonorsCount ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: idx < topHonorsCount ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontWeight: 900, fontSize: '1.2rem', color: idx === 0 ? '#fbbf24' : (idx === 1 ? '#cbd5e1' : (idx === 2 ? '#d97706' : 'var(--text-muted)')), width: '32px' }}>
                        #{idx + 1}
                      </span>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>
                        {st.name} ({st.studentId})
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid #10b981', fontWeight: 900, fontSize: '0.9rem', padding: '6px 14px' }}>
                        💯 {score} điểm
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: DEDICATED ALL VIOLATIONS TAB (QUẢN LÝ TẤT CẢ VI PHẠM) */}
      {selectedTab === 'violations_all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            padding: '24px 28px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #071521 0%, #1e1b4b 100%)',
            border: '2.5px solid #ef4444',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                <AlertTriangle size={28} color="#ef4444" /> DANH SÁCH VI PHẠM NỀ NẾP LỚP HỌC
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, marginTop: '6px' }}>
                Quản lý chi tiết tất cả các lượt vi phạm nội quy của từng học sinh. Dữ liệu sẽ tự động đồng bộ sang bảng Cảnh Báo Vi Phạm.
              </p>
            </div>

            {!isReadOnlyAdmin && (
              <button
                className="btn btn-danger"
                onClick={() => {
                  setQuickAddType('violation');
                  setQuickStudentId(classData.students[0]?.id || '');
                  setQuickPoints(pointRules.violationDeduction);
                }}
                style={{ fontWeight: 900, padding: '10px 20px', borderRadius: '14px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
              >
                🚨 + Ghi Nhận Vi Phạm Mới
              </button>
            )}
          </div>

          {allViolationStudents.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#6ee7b7', fontWeight: 800, fontSize: '1.05rem' }}>
              ✨ Tuyệt vời! Hiện tại lớp không có học sinh nào có lịch sử vi phạm.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px', width: '100%' }}>
              {allViolationStudents.map(st => (
                <div key={st.id} className="glass-panel" style={{ padding: '20px', borderRadius: '18px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>
                        ⚠️
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{st.name}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#fca5a5', fontWeight: 700 }}>Tổng: {st.violations.length} vi phạm (Trừ {st.violations.length * pointRules.violationDeduction}đ)</span>
                      </div>
                    </div>

                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditingStudent(st); setIsModalOpen(true); }}>
                      <Edit3 size={14} /> Quản lý
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {st.violations.map((v, i) => (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px', fontSize: '0.82rem', borderLeft: '3px solid #ef4444' }}>
                        <div style={{ color: '#fca5a5', fontWeight: 800 }}>⚠️ {v.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Trừ: -{v.points || pointRules.violationDeduction}đ • Ngày: {v.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 4: REWARDS SUMMARY */}
      {selectedTab === 'rewards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '24px 28px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #071521 0%, #0f172a 100%)',
            border: '2.5px solid #10b981',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '10px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                <Award size={28} color="#10b981" /> BẢNG VÀNG THÀNH TÍCH KHEN THƯỞNG LỚP HỌC
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, marginTop: '6px' }}>
                Tổng hợp các thành tích khen thưởng và hoa điểm tốt của các học sinh trong lớp chủ nhiệm.
              </p>
            </div>

            {!isReadOnlyAdmin && (
              <button
                className="btn btn-warning btn-sm"
                onClick={() => {
                  setQuickAddType('reward');
                  setQuickStudentId(classData.students[0]?.id || '');
                  setQuickPoints(pointRules.rewardBonus);
                }}
                style={{ fontWeight: 900, padding: '8px 16px', borderRadius: '12px', color: '#000' }}
              >
                + Thêm Khen Thưởng Mới
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', width: '100%' }}>
            {classData.students.filter(s => (s.rewards || []).length > 0).map(st => (
              <div key={st.id} className="glass-panel" style={{ padding: '18px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 900 }}>
                    🏆
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{st.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#fde047', fontWeight: 700 }}>{st.rewards.length} thành tích khen thưởng</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {st.rewards.map((r, i) => (
                    <div key={i} style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                      <div style={{ color: '#fde047', fontWeight: 700 }}>✨ {r.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Cộng: +{r.points || pointRules.rewardBonus}đ ({r.date})</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUTOMATIC WARNING MONITORING TAB (HỌC SINH VI PHẠM ≥ 2 LẦN) */}
      {selectedTab === 'violations_warning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '24px 28px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #071521 0%, #7f1d1d 100%)',
            border: '2.5px solid #dc2626',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(220, 38, 38, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                <ShieldAlert size={28} color="#dc2626" /> CẢNH BÁO TỰ ĐỘNG: HỌC SINH VI PHẠM TRÊN 2 LẦN ({highViolationStudents.length})
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, marginTop: '6px' }}>
                Hệ thống tự động tổng hợp tất cả các số liệu nhập bên mục Vi Phạm và hiển thị ngay các học sinh có từ 2 vi phạm trở lên để giáo viên chủ nhiệm đôn đốc, nhắc nhở và liên hệ phụ huynh.
              </p>
            </div>
          </div>

          {highViolationStudents.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#6ee7b7', fontWeight: 800, fontSize: '1.05rem' }}>
              ✨ Tuyệt vời! Hiện tại không có học sinh nào vi phạm từ 2 lần trở lên.
            </div>
          ) : (
            highViolationStudents.map(st => (
              <div key={st.id} className="glass-panel" style={{ padding: '22px', borderRadius: '20px', borderLeft: '6px solid #dc2626', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.3rem', boxShadow: '0 0 15px rgba(220,38,38,0.6)' }}>
                      🚨
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff' }}>{st.name} ({st.studentId})</h4>
                      <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>SĐT Phụ Huynh: <strong style={{ color: '#38bdf8' }}>{st.phone || 'Chưa có SĐT'}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge" style={{ background: '#dc2626', color: '#fff', fontWeight: 900, padding: '6px 14px', fontSize: '0.85rem' }}>
                      CẢNH BÁO: {st.violations.length} LẦN VI PHẠM
                    </span>
                    <button className="btn btn-danger btn-sm" onClick={() => { setEditingStudent(st); setIsModalOpen(true); }}>
                      <Edit3 size={15} /> Xử Lý Chi Tiết
                    </button>
                  </div>
                </div>

                <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fca5a5', marginBottom: '10px' }}>Chi tiết danh sách các lần vi phạm đã tự động nạp ({st.violations.length} lần):</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                  {st.violations.map((v, i) => (
                    <div key={i} style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 14px', borderRadius: '12px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                      <span style={{ color: '#fca5a5', fontWeight: 800 }}>Lần {i+1}: {v.title}</span>
                      <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.78rem' }}>Ngày: {v.date} • Ghi chú: {v.note || 'Không có'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: BIRTHDAYS */}
      {selectedTab === 'birthdays' && (
        <div>
          <div style={{
            padding: '24px 28px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #071521 0%, #0369a1 100%)',
            border: '2.5px solid #0284c7',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(2, 132, 199, 0.25)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#7dd3fc', display: 'flex', alignItems: 'center', gap: '10px', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              <Cake size={28} color="#38bdf8" /> CHÚC MỪNG SINH NHẬT HỌC SINH TRONG THÁNG {currentMonthNum} 🎉
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, marginTop: '6px' }}>
              Danh sách các học sinh trong lớp chủ nhiệm có sinh nhật trong tháng {currentMonthNum}.
            </p>
          </div>

          {birthdayStudents.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Tháng {currentMonthNum} này lớp không có học sinh nào sinh nhật.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {birthdayStudents.map(st => (
                <div key={st.id} className="glass-panel" style={{ padding: '22px', borderRadius: '20px', textAlign: 'center', border: '2px solid #0284c7', background: 'linear-gradient(135deg, rgba(7, 30, 44, 0.9) 0%, rgba(2, 132, 199, 0.2) 100%)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎂</div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff' }}>{st.name}</h4>
                  <span className="badge" style={{ background: '#0284c7', color: '#fff', fontWeight: 800, padding: '4px 14px', borderRadius: '12px', fontSize: '0.85rem', marginTop: '6px' }}>
                    🗓️ Ngày sinh: {st.dob}
                  </span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                    Phụ huynh: {st.fatherName || st.motherName || 'Chưa cập nhật'} (📞 {st.phone})
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STUDENT DETAIL MODAL */}
      <StudentDetailModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingStudent(null); }}
        student={editingStudent}
        onSave={handleSaveStudent}
        onDelete={handleDeleteStudent}
      />

      {/* QUICK ADD VIOLATION / REWARD MODAL */}
      {quickAddType && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '540px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: quickAddType === 'violation' ? '#ef4444' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {quickAddType === 'violation' ? '🚨 GHI NHẬN VI PHẠM MỚI' : '🏆 GHI NHẬN KHEN THƯỞNG MỚI'}
              </h3>
              <button onClick={() => setQuickAddType(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                  Chọn Học Sinh:
                </label>
                <select
                  value={quickStudentId}
                  onChange={(e) => setQuickStudentId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }}
                >
                  {classData.students.map(st => (
                    <option key={st.id} value={st.id}>{st.studentId} - {st.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                  Nội Dung {quickAddType === 'violation' ? 'Vi Phạm' : 'Khen Thưởng'}:
                </label>
                <input
                  type="text"
                  placeholder={quickAddType === 'violation' ? 'Ví dụ: Đi học muộn 15 phút, Nói chuyện riêng...' : 'Ví dụ: Đạt điểm 10 môn Toán, Giúp đỡ bạn bè...'}
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                  Số Điểm Nề Nếp {quickAddType === 'violation' ? 'Trừ (-)' : 'Cộng (+)'}:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quickPoints}
                  onChange={(e) => setQuickPoints(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                  Ghi Chú Chi Tiết (Không bắt buộc):
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú hình thức xử lý / trao giải..."
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setQuickAddType(null)}>Hủy</button>
                <button type="submit" className={`btn ${quickAddType === 'violation' ? 'btn-danger' : 'btn-warning'}`} style={{ color: quickAddType === 'reward' ? '#000' : '#fff', fontWeight: 900 }}>
                  Xác Nhận Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POINT RULES CONFIGURATION MODAL */}
      {showPointRulesModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '520px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={22} color="#a78bfa" /> CÀI ĐẶT QUY TẮC ĐIỂM NỀ NẾP LỚP HỌC
              </h3>
              <button onClick={() => setShowPointRulesModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSavePointRules} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                  Mức Điểm Khởi Điểm (Mặc định toàn lớp):
                </label>
                <input
                  type="number"
                  value={tempRules.basePoints}
                  onChange={(e) => setTempRules({ ...tempRules, basePoints: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                  Số Điểm Cộng Cho Mỗi Lần Khen Thưởng (+):
                </label>
                <input
                  type="number"
                  value={tempRules.rewardBonus}
                  onChange={(e) => setTempRules({ ...tempRules, rewardBonus: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                  Số Điểm Trừ Cho Mỗi Lần Vi Phạm (-):
                </label>
                <input
                  type="number"
                  value={tempRules.violationDeduction}
                  onChange={(e) => setTempRules({ ...tempRules, violationDeduction: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                  Số Học Sinh Được Vinh Danh Bảng Tuyên Dương:
                </label>
                <select
                  value={tempRules.topHonorsCount}
                  onChange={(e) => setTempRules({ ...tempRules, topHonorsCount: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800 }}
                >
                  <option value={3}>Top 3 Học Sinh Xuất Sắc</option>
                  <option value={5}>Top 5 Học Sinh Xuất Sắc</option>
                  <option value={10}>Top 10 Học Sinh Xuất Sắc</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPointRulesModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-success" style={{ fontWeight: 900 }}>
                  Áp Dụng Cho Cả Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET CONFIRM MODAL */}
      {showResetModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-modal" style={{ width: '100%', maxWidth: '480px', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>
              🔄 Reset Dữ Liệu Lớp Chủ Nhiệm
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Bạn muốn xóa toàn bộ học sinh để làm mới hay khôi phục danh sách mẫu?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-danger" onClick={() => executeResetClass('clear')}>
                🧹 Xóa Hết (0 Học Sinh)
              </button>
              <button className="btn btn-primary" onClick={() => executeResetClass('default')}>
                🔄 Khôi Phục Mẫu
              </button>
              <button className="btn btn-secondary" onClick={() => setShowResetModal(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO URL MODAL (Dán Link Ảnh Trực Tiếp) */}
      {photoModalType && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '560px',
            borderRadius: '24px',
            padding: '28px',
            border: '2px solid #00a896',
            background: 'linear-gradient(135deg, #071521 0%, #0d2838 100%)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(0,168,150,0.3)', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#5eead4', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                🖼️ {photoModalType === 'bg' ? 'Cập Nhật Ảnh Nền Lớp Học' : 'Cập Nhật Ảnh Tập Thể Lớp'}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => { setPhotoModalType(null); setDirectUrlInput(''); }} style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* OPTION 1: Upload directly from computer */}
              <div style={{
                background: 'rgba(13, 148, 136, 0.12)',
                border: '1.5px solid #0d9488',
                borderRadius: '16px',
                padding: '18px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2dd4bf', display: 'block', marginBottom: '10px' }}>
                  📁 PHƯƠNG ÁN 1: TẢI ẢNH TRỰC TIẾP TỪ MÁY TÍNH (Khuyên Dùng)
                </span>
                
                <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem', fontWeight: 900, background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)', border: 'none', borderRadius: '14px', boxShadow: '0 4px 15px rgba(13, 148, 136, 0.4)' }}>
                  <Upload size={18} /> Chọn Ảnh Tải Từ Máy Tính...
                  <input type="file" accept="image/*" onChange={handleLocalClassPhotoUpload} style={{ display: 'none' }} />
                </label>

                <span style={{ fontSize: '0.78rem', color: '#34d399', display: 'block', marginTop: '10px', fontWeight: 600 }}>
                  ✨ Tự động nén ảnh siêu nhẹ ~30KB (Lưu trực tiếp thành công 100%, KHÔNG CẦN đưa lên Google Drive).
                </span>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>HOẶC DÙNG LINK ONLINE</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* OPTION 2: Paste URL link */}
              <form onSubmit={handleApplyDirectUrl}>
                <label style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  🔗 PHƯƠNG ÁN 2: Dán đường dẫn Link URL ảnh từ Internet hoặc Google Drive:
                </label>
                <input 
                  type="text" 
                  placeholder="https://... (hỗ trợ link ảnh, Canva, Google Drive)" 
                  value={directUrlInput}
                  onChange={(e) => setDirectUrlInput(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1.5px solid #00a896',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Live Preview If Input Exists */}
                {directUrlInput.trim() && (
                  <div style={{ marginTop: '14px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#5eead4', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      🖼️ Xem trước hình ảnh:
                    </span>
                    <div style={{ height: '120px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', background: '#000' }}>
                      <img 
                        src={normalizeImageUrl(directUrlInput.trim())} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setPhotoModalType(null); setDirectUrlInput(''); }}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success" 
                    disabled={!directUrlInput.trim()}
                    style={{ fontWeight: 900, padding: '10px 24px' }}
                  >
                    💾 Lưu Link Ảnh
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
