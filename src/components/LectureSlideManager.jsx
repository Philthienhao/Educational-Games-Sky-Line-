import React, { useState, useMemo, useEffect } from 'react';
import { 
  Presentation, 
  Search, 
  ExternalLink, 
  Copy, 
  Plus, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  FileText, 
  X, 
  BookOpen, 
  Trash2, 
  Edit, 
  HardDrive, 
  FolderOpen,
  FolderPlus
} from 'lucide-react';
import { StorageService } from '../services/storage';

export function LectureSlideManager({ searchTerm = '', currentUser }) {
  // Strictly resolve userId from prop first, then from session — NEVER default to 'guest' or admin
  const resolvedUser = currentUser || StorageService.getCurrentUser();
  const effectiveUserId = resolvedUser?.id || null;
  const currentUserName = resolvedUser?.name || 'Giáo Viên';

  // Array of Teacher-Created Grade Folders [{ id, grade, title, driveUrl, createdAt }, ...]
  const [gradeFoldersList, setGradeFoldersList] = useState([]);

  // Array of Teacher-Created Individual Lecture Slides [{ id, title, grade, subject, lesson, bookSeries, driveUrl, description }, ...]
  const [slidesList, setSlidesList] = useState([]);

  // Filters state for individual slides
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('Tất cả');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('Tất cả các môn');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState('Tất cả các bài');
  const [localSearch, setLocalSearch] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Modal 1: Add / Edit Grade Folder
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [folderGrade, setFolderGrade] = useState('Lớp 10');
  const [customGradeInput, setCustomGradeInput] = useState('');
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [folderDriveUrl, setFolderDriveUrl] = useState('');
  const [folderTitle, setFolderTitle] = useState('');

  // Modal 2: Add / Edit Individual Slide
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState(null);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideGrade, setSlideGrade] = useState('Lớp 10');
  const [slideSubject, setSlideSubject] = useState('Địa Lý');
  const [slideLesson, setSlideLesson] = useState('Bài 1');
  const [slideBook, setSlideBook] = useState('Kết Nối Tri Thức');
  const [slideDriveUrl, setSlideDriveUrl] = useState('');
  const [slideDesc, setSlideDesc] = useState('');

  // Load Per-User Account Data strictly from StorageService
  useEffect(() => {
    const folders = StorageService.getGradeDriveFolders(effectiveUserId);
    const slides = StorageService.getLectureSlides(effectiveUserId);
    setGradeFoldersList(Array.isArray(folders) ? folders : []);
    setSlidesList(Array.isArray(slides) ? slides : []);
  }, [effectiveUserId]);

  // Toast Helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copy Link Helper
  const handleCopyLink = (url, label) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    triggerToast(`📋 Đã sao chép đường dẫn Google Drive của "${label}"!`);
  };

  // --- GRADE FOLDER HANDLERS ---
  const handleOpenAddFolderModal = () => {
    setEditingFolderId(null);
    setFolderGrade('Lớp 10');
    setIsCustomGrade(false);
    setCustomGradeInput('');
    setFolderDriveUrl('');
    setFolderTitle('');
    setShowFolderModal(true);
  };

  const handleOpenEditFolderModal = (folder) => {
    setEditingFolderId(folder.id);
    const standardGrades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];
    if (standardGrades.includes(folder.grade)) {
      setFolderGrade(folder.grade);
      setIsCustomGrade(false);
      setCustomGradeInput('');
    } else {
      setFolderGrade('Khác');
      setIsCustomGrade(true);
      setCustomGradeInput(folder.grade || '');
    }
    setFolderDriveUrl(folder.driveUrl || '');
    setFolderTitle(folder.title || '');
    setShowFolderModal(true);
  };

  const handleSaveGradeFolder = (e) => {
    e.preventDefault();
    const finalGradeName = (isCustomGrade ? customGradeInput.trim() : folderGrade) || 'Khối Lớp';
    if (!folderDriveUrl.trim()) {
      alert('Vui lòng nhập đường dẫn Google Drive cho Thư mục Khối Lớp!');
      return;
    }

    let updatedList = [];
    if (editingFolderId) {
      updatedList = gradeFoldersList.map(f => f.id === editingFolderId ? {
        ...f,
        grade: finalGradeName,
        title: folderTitle.trim() || `Thư mục Slide ${finalGradeName}`,
        driveUrl: folderDriveUrl.trim(),
        updatedAt: new Date().toLocaleDateString('vi-VN')
      } : f);
      triggerToast(`✅ Đã cập nhật Thư mục Google Drive cho ${finalGradeName}!`);
    } else {
      const newFolder = {
        id: `grade_folder_${Date.now()}`,
        grade: finalGradeName,
        title: folderTitle.trim() || `Thư mục Slide ${finalGradeName}`,
        driveUrl: folderDriveUrl.trim(),
        createdAt: new Date().toLocaleDateString('vi-VN')
      };
      updatedList = [...gradeFoldersList, newFolder];
      triggerToast(`🎉 Đã tạo Thư mục Google Drive cho ${finalGradeName}!`);
    }

    setGradeFoldersList(updatedList);
    StorageService.saveGradeDriveFolders(effectiveUserId, updatedList);
    setShowFolderModal(false);
  };

  const handleDeleteGradeFolder = (folderId, gradeName) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa Thư mục Drive ${gradeName}?`)) {
      const updated = gradeFoldersList.filter(f => f.id !== folderId);
      setGradeFoldersList(updated);
      StorageService.saveGradeDriveFolders(effectiveUserId, updated);
      triggerToast(`🗑️ Đã xóa Thư mục Drive ${gradeName}!`);
    }
  };

  // --- INDIVIDUAL SLIDE HANDLERS ---
  const handleOpenAddSlideModal = () => {
    setEditingSlideId(null);
    setSlideTitle('');
    setSlideGrade(gradeFoldersList.length > 0 ? gradeFoldersList[0].grade : 'Lớp 10');
    setSlideSubject('Địa Lý');
    setSlideLesson('Bài 1');
    setSlideBook('Kết Nối Tri Thức');
    setSlideDriveUrl('');
    setSlideDesc('');
    setShowSlideModal(true);
  };

  const handleOpenEditSlideModal = (slide) => {
    setEditingSlideId(slide.id);
    setSlideTitle(slide.title || '');
    setSlideGrade(slide.grade || 'Lớp 10');
    setSlideSubject(slide.subject || 'Địa Lý');
    setSlideLesson(slide.lesson || 'Bài 1');
    setSlideBook(slide.bookSeries || 'Kết Nối Tri Thức');
    setSlideDriveUrl(slide.driveUrl || '');
    setSlideDesc(slide.description || '');
    setShowSlideModal(true);
  };

  const handleSaveSlide = (e) => {
    e.preventDefault();
    if (!slideTitle.trim() || !slideDriveUrl.trim()) {
      alert('Vui lòng nhập Tên Slide và Đường dẫn Google Drive!');
      return;
    }

    let updatedSlides = [];
    if (editingSlideId) {
      updatedSlides = slidesList.map(s => s.id === editingSlideId ? {
        ...s,
        title: slideTitle.trim(),
        grade: slideGrade,
        subject: slideSubject,
        lesson: slideLesson,
        bookSeries: slideBook,
        driveUrl: slideDriveUrl.trim(),
        description: slideDesc.trim() || 'Slide bài giảng điện tử.'
      } : s);
      triggerToast('✅ Đã cập nhật Slide bài giảng!');
    } else {
      const newSlideObj = {
        id: `user_slide_${Date.now()}`,
        title: slideTitle.trim(),
        grade: slideGrade,
        subject: slideSubject,
        lesson: slideLesson,
        bookSeries: slideBook,
        format: 'PPTX / Google Slides',
        driveUrl: slideDriveUrl.trim(),
        description: slideDesc.trim() || 'Slide bài giảng điện tử.',
        createdAt: new Date().toISOString()
      };
      updatedSlides = [newSlideObj, ...slidesList];
      triggerToast('🎉 Đã thêm Slide bài giảng mới!');
    }

    setSlidesList(updatedSlides);
    StorageService.saveLectureSlides(effectiveUserId, updatedSlides);
    setShowSlideModal(false);
  };

  const handleDeleteSlide = (slideId, title) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa slide "${title}"?`)) {
      const updated = slidesList.filter(s => s.id !== slideId);
      setSlidesList(updated);
      StorageService.saveLectureSlides(effectiveUserId, updated);
      triggerToast('🗑️ Đã xóa Slide bài giảng!');
    }
  };

  // Options lists
  const standardGradesList = [
    'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5',
    'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9',
    'Lớp 10', 'Lớp 11', 'Lớp 12'
  ];

  // Dynamic Grades for Filter
  const availableGradesInFilter = useMemo(() => {
    const set = new Set();
    gradeFoldersList.forEach(f => f.grade && set.add(f.grade));
    slidesList.forEach(s => s.grade && set.add(s.grade));
    return ['Tất cả', ...Array.from(set)];
  }, [gradeFoldersList, slidesList]);

  const subjectsOptions = [
    'Tất cả các môn',
    'Địa Lý', 'Lịch Sử', 'Toán Học', 'Ngữ Văn', 'Tiếng Anh',
    'Khoa Học Tự Nhiên', 'Vật Lý', 'Hóa Học', 'Sinh Học',
    'Tin Học', 'GDCD / GDKT&PL', 'Âm Nhạc', 'Mỹ Thuật', 'Hoạt Động Trải Nghiệm'
  ];

  const lessonsOptions = [
    'Tất cả các bài',
    'Bài 1', 'Bài 2', 'Bài 3', 'Bài 4', 'Bài 5',
    'Bài 6', 'Bài 7', 'Bài 8', 'Bài 9', 'Bài 10',
    'Bài 11', 'Bài 12', 'Bài 15', 'Bài 20',
    'Chương 1', 'Chương 2', 'Chương 3', 'Hợp nhất HK1', 'Hợp nhất HK2'
  ];

  // Filtered Slides
  const filteredSlides = useMemo(() => {
    const effectiveSearch = (searchTerm || localSearch || '').toLowerCase().normalize('NFC').trim();
    
    return slidesList.filter(item => {
      if (selectedGradeFilter !== 'Tất cả') {
        const itemGradeNorm = (item.grade || '').normalize('NFC').trim();
        const selGradeNorm = selectedGradeFilter.normalize('NFC').trim();
        if (itemGradeNorm !== selGradeNorm) return false;
      }

      if (selectedSubjectFilter !== 'Tất cả các môn') {
        const itemSubNorm = (item.subject || '').normalize('NFC').trim();
        const selSubNorm = selectedSubjectFilter.normalize('NFC').trim();
        if (!itemSubNorm.includes(selSubNorm) && !selSubNorm.includes(itemSubNorm)) return false;
      }

      if (selectedLessonFilter !== 'Tất cả các bài') {
        const itemLesNorm = (item.lesson || '').normalize('NFC').trim();
        const selLesNorm = selectedLessonFilter.normalize('NFC').trim();
        if (itemLesNorm !== selLesNorm) return false;
      }

      if (effectiveSearch) {
        const t = (item.title || '').toLowerCase().normalize('NFC');
        const g = (item.grade || '').toLowerCase().normalize('NFC');
        const s = (item.subject || '').toLowerCase().normalize('NFC');
        const l = (item.lesson || '').toLowerCase().normalize('NFC');
        const b = (item.bookSeries || '').toLowerCase().normalize('NFC');
        const d = (item.description || '').toLowerCase().normalize('NFC');

        return t.includes(effectiveSearch) || g.includes(effectiveSearch) || s.includes(effectiveSearch) || l.includes(effectiveSearch) || b.includes(effectiveSearch) || d.includes(effectiveSearch);
      }

      return true;
    });
  }, [slidesList, selectedGradeFilter, selectedSubjectFilter, selectedLessonFilter, searchTerm, localSearch]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '10px 10px 40px 10px', color: '#f8fafc' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: '#ffffff',
          padding: '12px 22px',
          borderRadius: '16px',
          fontWeight: 800,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          border: '1.5px solid #6ee7b7'
        }}>
          <CheckCircle2 size={20} color="#6ee7b7" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)',
        borderRadius: '28px',
        padding: '32px',
        marginBottom: '28px',
        boxShadow: '0 15px 40px rgba(49, 46, 129, 0.4)',
        border: '1.5px solid rgba(99, 102, 241, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', padding: '10px', borderRadius: '16px', display: 'flex', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.5)' }}>
                <Presentation size={30} color="#ffffff" />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                KHO SLIDE BÀI GIẢNG CỦA TÔI
              </h1>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.98rem', margin: 0, maxWidth: '800px', lineHeight: 1.5 }}>
              🔒 Quản lý thư mục Google Drive theo các Khối Lớp do Thầy/Cô <strong>{currentUserName}</strong> chủ động tạo lập và cài đặt riêng.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleOpenAddFolderModal}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 22px',
                borderRadius: '18px',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              <FolderPlus size={18} />
              + Tạo Thư Mục Khối Lớp Mới
            </button>

            <button
              onClick={handleOpenAddSlideModal}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 22px',
                borderRadius: '18px',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)'
              }}
            >
              <Plus size={18} />
              + Thêm Slide Bài Giảng Cụ Thể
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: TEACHER-CREATED GRADE LEVEL DRIVE FOLDERS                      */}
      {/* ========================================================================= */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        borderRadius: '26px',
        padding: '26px',
        marginBottom: '32px',
        border: '1.5px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 12px 35px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#6ee7b7', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FolderOpen size={22} color="#34d399" />
              THƯ MỤC GOOGLE DRIVE KHỐI LỚP CỦA TÔI ({gradeFoldersList.length} Khối Lớp)
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
              Thầy/Cô dạy bao nhiêu khối lớp thì tự tạo ra bấy nhiêu thư mục khối lớp tương ứng để lưu trữ và quản lý chủ động.
            </p>
          </div>

          <button
            onClick={handleOpenAddFolderModal}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '16px',
              fontWeight: 900,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}
          >
            <FolderPlus size={16} />
            + Tạo Thư Mục Khối Lớp Mới
          </button>
        </div>

        {/* IF NO GRADE FOLDERS CREATED YET */}
        {gradeFoldersList.length === 0 ? (
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '22px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '2px dashed rgba(16, 185, 129, 0.3)',
            marginTop: '12px'
          }}>
            <FolderPlus size={52} color="#34d399" style={{ marginBottom: '14px', filter: 'drop-shadow(0 4px 10px rgba(52,211,153,0.3))' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
              Thầy/Cô Chưa Cài Đặt Thư Mục Khối Lớp Nào
            </h3>
            <p style={{ color: '#94a3b8', maxWidth: '520px', margin: '0 auto 20px auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Thầy/Cô giảng dạy những khối lớp nào (VD: Lớp 10, Lớp 11, Lớp 12...)? Hãy bấm nút dưới đây để tạo thư mục Google Drive cho các khối lớp đó!
            </p>
            <button
              onClick={handleOpenAddFolderModal}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              <FolderPlus size={18} />
              + Tạo Thư Mục Khối Lớp Đầu Tiên
            </button>
          </div>
        ) : (
          /* DYNAMIC GRID OF TEACHER-CREATED GRADE FOLDERS */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
            marginTop: '16px'
          }}>
            {gradeFoldersList.map(folder => (
              <div
                key={folder.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  borderRadius: '22px',
                  padding: '20px',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      padding: '4px 14px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                    }}>
                      🎓 {folder.grade}
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenEditFolderModal(folder)}
                        title="Chỉnh sửa thư mục này"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#38bdf8',
                          padding: '6px 10px',
                          borderRadius: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteGradeFolder(folder.id, folder.grade)}
                        title="Xóa thư mục khối lớp này"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '6px 10px',
                          borderRadius: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                    {folder.title || `Thư mục Slide ${folder.grade}`}
                  </h3>

                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Ngày cài đặt: {folder.createdAt || 'Mới khởi tạo'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <a
                    href={folder.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ffffff',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
                    }}
                  >
                    <HardDrive size={16} />
                    MỞ FOLDER DRIVE
                    <ExternalLink size={14} />
                  </a>

                  <button
                    onClick={() => handleCopyLink(folder.driveUrl, `Thư mục Drive ${folder.grade}`)}
                    title="Sao chép link Google Drive"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#cbd5e1',
                      padding: '10px 12px',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Copy size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: INDIVIDUAL LECTURE SLIDES SEARCH & LIST                        */}
      {/* ========================================================================= */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.9)',
        borderRadius: '26px',
        padding: '24px',
        marginBottom: '28px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#818cf8" />
            TÌM KIẾM SLIDE BÀI GIẢNG CHI TIẾT TỰ NHẬP ({filteredSlides.length})
          </h3>
        </div>

        {/* SEARCH INPUT */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="🔍 Nhập từ khóa bài học, môn học (VD: Bài 1, Địa Lý 10, Trái Đất)..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 44px 14px 48px',
              borderRadius: '18px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1.5px solid rgba(99, 102, 241, 0.4)',
              color: '#ffffff',
              fontSize: '0.98rem',
              fontWeight: 600,
              outline: 'none',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
            }}
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* DROPDOWN FILTERS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} />
              Lọc Khối Lớp:
            </label>
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                background: '#0f172a',
                border: '1.5px solid rgba(129, 140, 248, 0.4)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {availableGradesInFilter.map(g => (
                <option key={g} value={g}>{g === 'Tất cả' ? '📚 Tất Cả Khối Lớp' : `🎓 ${g}`}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} />
              Lọc Môn Học:
            </label>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                background: '#0f172a',
                border: '1.5px solid rgba(129, 140, 248, 0.4)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {subjectsOptions.map(s => (
                <option key={s} value={s}>{s === 'Tất cả các môn' ? '📖 Tất Cả Các Môn' : `📌 Môn: ${s}`}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} />
              Lọc Bài Học / Chương:
            </label>
            <select
              value={selectedLessonFilter}
              onChange={(e) => setSelectedLessonFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                background: '#0f172a',
                border: '1.5px solid rgba(129, 140, 248, 0.4)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {lessonsOptions.map(l => (
                <option key={l} value={l}>{l === 'Tất cả các bài' ? '📝 Tất Cả Bài Học' : `📑 ${l}`}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingTop: '22px' }}>
            <button
              onClick={() => {
                setSelectedGradeFilter('Tất cả');
                setSelectedSubjectFilter('Tất cả các môn');
                setSelectedLessonFilter('Tất cả các bài');
                setLocalSearch('');
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#cbd5e1',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} />
              Đặt Lại Bộ Lọc
            </button>
          </div>

        </div>
      </div>

      {/* INDIVIDUAL SLIDES CARDS GRID */}
      {slidesList.length === 0 ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
          borderRadius: '26px',
          padding: '48px 24px',
          textAlign: 'center',
          border: '2px dashed rgba(99, 102, 241, 0.3)'
        }}>
          <Presentation size={56} color="#818cf8" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', marginBottom: '8px' }}>
            Chưa Có Tệp Slide Bài Giảng Chi Tiết Nào
          </h3>
          <p style={{ color: '#94a3b8', maxWidth: '520px', margin: '0 auto 20px auto', fontSize: '0.92rem' }}>
            Thầy/Cô có thể thêm các đường dẫn tệp Slide bài giảng riêng lẻ cho từng bài học cụ thể bằng cách bấm nút dưới đây.
          </p>
          <button
            onClick={handleOpenAddSlideModal}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} />
            + Thêm Slide Bài Giảng Cụ Thể
          </button>
        </div>
      ) : filteredSlides.length === 0 ? (
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '24px',
          padding: '40px 20px',
          textAlign: 'center',
          border: '1px dashed rgba(255,255,255,0.2)'
        }}>
          <Presentation size={40} color="#64748b" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>Không tìm thấy Slide theo bộ lọc hiện tại</h3>
          <button
            onClick={() => {
              setSelectedGradeFilter('Tất cả');
              setSelectedSubjectFilter('Tất cả các môn');
              setSelectedLessonFilter('Tất cả các bài');
              setLocalSearch('');
            }}
            style={{
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Đặt Lại Bộ Lọc
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {filteredSlides.map(slide => (
            <div
              key={slide.id}
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                borderRadius: '24px',
                padding: '24px',
                border: '1.5px solid rgba(99, 102, 241, 0.25)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      borderRadius: '10px'
                    }}>
                      🎓 {slide.grade}
                    </span>

                    <span style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      borderRadius: '10px'
                    }}>
                      📌 {slide.subject}
                    </span>

                    {slide.bookSeries && (
                      <span style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        borderRadius: '10px'
                      }}>
                        📖 {slide.bookSeries}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenEditSlideModal(slide)}
                      title="Chỉnh sửa"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '6px',
                        color: '#38bdf8',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      onClick={() => handleDeleteSlide(slide.id, slide.title)}
                      title="Xóa"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '6px',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.4, marginBottom: '10px' }}>
                  {slide.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '18px' }}>
                  {slide.description}
                </p>
              </div>

              <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href={slide.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    padding: '10px 16px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Presentation size={16} />
                  MỞ SLIDE TRÊN GOOGLE DRIVE
                  <ExternalLink size={14} />
                </a>

                <button
                  onClick={() => handleCopyLink(slide.driveUrl, slide.title)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Copy size={14} />
                  Sao Chép Đường Dẫn Google Drive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT GRADE DRIVE FOLDER                                    */}
      {/* ========================================================================= */}
      {showFolderModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            color: '#f8fafc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#059669', padding: '8px', borderRadius: '12px', display: 'flex' }}>
                  <FolderPlus size={20} color="#fff" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>
                  {editingFolderId ? 'Chỉnh Sửa Thư Mục Khối Lớp' : 'Tạo Thư Mục Khối Lớp Mới'}
                </h3>
              </div>

              <button
                onClick={() => setShowFolderModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveGradeFolder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  Chọn Tên Khối Lớp: *
                </label>
                <select
                  value={isCustomGrade ? 'Khác' : folderGrade}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Khác') {
                      setIsCustomGrade(true);
                    } else {
                      setIsCustomGrade(false);
                      setFolderGrade(val);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.95rem'
                  }}
                >
                  {standardGradesList.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                  <option value="Khác">➕ Nhập tên khối lớp khác (Tùy chỉnh)...</option>
                </select>
              </div>

              {isCustomGrade && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                    Nhập Tên Khối Lớp Riêng Của Thầy/Cô: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Lớp 10A1, Chuyên Địa, Khối THPT..."
                    value={customGradeInput}
                    onChange={(e) => setCustomGradeInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#0f172a',
                      border: '1px solid rgba(99, 102, 241, 0.5)',
                      color: '#fff',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  Tên Thư Mục / Mô Tả Ngắn:
                </label>
                <input
                  type="text"
                  placeholder={`VD: Thư mục Slide Bài Giảng ${isCustomGrade ? customGradeInput : folderGrade}`}
                  value={folderTitle}
                  onChange={(e) => setFolderTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  Đường Dẫn Google Drive Thư Mục: *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={folderDriveUrl}
                  onChange={(e) => setFolderDriveUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#cbd5e1',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {editingFolderId ? 'Lưu Cập Nhật' : 'Tạo Thư Mục Khối Lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT INDIVIDUAL SLIDE                                      */}
      {/* ========================================================================= */}
      {showSlideModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1.5px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '560px',
            padding: '28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            color: '#f8fafc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#4f46e5', padding: '8px', borderRadius: '12px', display: 'flex' }}>
                  <Presentation size={20} color="#fff" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                  {editingSlideId ? 'Chỉnh Sửa Slide Bài Giảng' : 'Thêm Slide Bài Giảng Cụ Thể'}
                </h3>
              </div>

              <button
                onClick={() => setShowSlideModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  Tên Slide Bài Giảng / Tiêu Đề: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bài 1: Môn Địa lý với định hướng nghề nghiệp"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                    Khối Lớp:
                  </label>
                  <select
                    value={slideGrade}
                    onChange={(e) => setSlideGrade(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontWeight: 700
                    }}
                  >
                    {gradeFoldersList.length > 0 ? (
                      gradeFoldersList.map(f => (
                        <option key={f.id} value={f.grade}>{f.grade}</option>
                      ))
                    ) : (
                      standardGradesList.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                    Môn Học:
                  </label>
                  <select
                    value={slideSubject}
                    onChange={(e) => setSlideSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontWeight: 700
                    }}
                  >
                    {subjectsOptions.filter(s => s !== 'Tất cả các môn').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                    Bài / Chương:
                  </label>
                  <select
                    value={slideLesson}
                    onChange={(e) => setSlideLesson(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontWeight: 700
                    }}
                  >
                    {lessonsOptions.filter(l => l !== 'Tất cả các bài').map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                    Bộ Sách:
                  </label>
                  <select
                    value={slideBook}
                    onChange={(e) => setSlideBook(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontWeight: 700
                    }}
                  >
                    <option value="Kết Nối Tri Thức">Kết Nối Tri Thức</option>
                    <option value="Cánh Diều">Cánh Diều</option>
                    <option value="Chân Trời Sáng Tạo">Chân Trời Sáng Tạo</option>
                    <option value="Bộ Sách Khác">Bộ Sách Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  Đường Dẫn Google Drive: *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/... hoặc folder link"
                  value={slideDriveUrl}
                  onChange={(e) => setSlideDriveUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  Mô Tả / Ghi Chú:
                </label>
                <textarea
                  rows={2}
                  placeholder="Nhập mô tả hoặc ghi chú ngắn về file slide này..."
                  value={slideDesc}
                  onChange={(e) => setSlideDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 600,
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowSlideModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#cbd5e1',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
                  }}
                >
                  {editingSlideId ? 'Lưu Cập Nhật' : 'Lưu Vào Kho Của Tôi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
