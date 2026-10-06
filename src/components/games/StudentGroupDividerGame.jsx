import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Sparkles, 
  Play, 
  Pause, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Maximize2, 
  Minimize2, 
  X, 
  Settings, 
  Dices, 
  Layers, 
  Shield, 
  Crown, 
  Award, 
  Zap, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Shuffle,
  Volume2,
  VolumeX,
  ChevronRight
} from 'lucide-react';
import { SoundFX } from '../../utils/sound';
import { parseStudentRosterFile } from '../../utils/universalParser';
import { downloadExcelTemplate } from '../../utils/excel';
import { StorageService } from '../../services/storage';

// Preset Team Naming Themes
const THEMES = {
  magic: {
    id: 'magic',
    label: '🔮 Vương Quốc Phép Thuật (Phân Nhà)',
    teams: [
      { name: 'Nhà Rồng Lửa 🐉', color: '#ef4444', icon: '🐉', bg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
      { name: 'Nhà Phượng Hoàng 🦅', color: '#f59e0b', icon: '🦅', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
      { name: 'Nhà Kỳ Lân 🦄', color: '#ec4899', icon: '🦄', bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
      { name: 'Nhà Sư Tử 🦁', color: '#eab308', icon: '🦁', bg: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' },
      { name: 'Nhà Rắn Biển 🐍', color: '#10b981', icon: '🐍', bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
      { name: 'Nhà Báo Tuyết 🐆', color: '#38bdf8', icon: '🐆', bg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' },
      { name: 'Nhà Đại Bàng 🦅', color: '#6366f1', icon: '🦅', bg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
      { name: 'Nhà Gấu Thần 🐻', color: '#a855f7', icon: '🐻', bg: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }
    ]
  },
  space: {
    id: 'space',
    label: '🚀 Biệt Đội Vũ Trụ & Tên Lửa',
    teams: [
      { name: 'Phi Đội Alpha 🚀', color: '#38bdf8', icon: '🚀', bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' },
      { name: 'Phi Đội Beta 🛰️', color: '#818cf8', icon: '🛰️', bg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
      { name: 'Phi Đội Gamma 🪐', color: '#c084fc', icon: '🪐', bg: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' },
      { name: 'Phi Đội Delta ☄️', color: '#f472b6', icon: '☄️', bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
      { name: 'Phi Đội Omega 🌌', color: '#34d399', icon: '🌌', bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
      { name: 'Phi Đội Titan 🛸', color: '#fbbf24', icon: '🛸', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
      { name: 'Phi Đội Orion 🌟', color: '#f97316', icon: '🌟', bg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' },
      { name: 'Phi Đội Meteor 🌠', color: '#fb7185', icon: '🌠', bg: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)' }
    ]
  },
  color: {
    id: 'color',
    label: '🎨 Sắc Màu May Mắn',
    teams: [
      { name: 'Đội Đỏ Rực 🔴', color: '#ef4444', icon: '🔴', bg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
      { name: 'Đội Xanh Dương 🔵', color: '#0284c7', icon: '🔵', bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' },
      { name: 'Đội Vàng Kim 🟡', color: '#eab308', icon: '🟡', bg: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' },
      { name: 'Đội Xanh Lá 🟢', color: '#10b981', icon: '🟢', bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
      { name: 'Đội Tím Mộng Mơ 🟣', color: '#a855f7', icon: '🟣', bg: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' },
      { name: 'Đội Cam Năng Lượng 🟠', color: '#f97316', icon: '🟠', bg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' },
      { name: 'Đội Hồng May Mắn 💗', color: '#ec4899', icon: '💗', bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
      { name: 'Đội Ngọc Bích 🩵', color: '#06b6d4', icon: '🩵', bg: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)' }
    ]
  },
  beasts: {
    id: 'beasts',
    label: '🐯 Linh Thú Siêu Cấp',
    teams: [
      { name: 'Đội Hổ Vàng 🐯', color: '#f59e0b', icon: '🐯', bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
      { name: 'Đội Đại Bàng 🦅', color: '#6366f1', icon: '🦅', bg: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
      { name: 'Đội Cá Heo 🐬', color: '#0284c7', icon: '🐬', bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' },
      { name: 'Đội Gấu Bắc Cực 🐻', color: '#64748b', icon: '🐻', bg: 'linear-gradient(135deg, #64748b 0%, #334155 100%)' },
      { name: 'Đội Sói Xanh 🐺', color: '#0d9488', icon: '🐺', bg: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' },
      { name: 'Đội Phượng Hoàng 🦩', color: '#ef4444', icon: '🦩', bg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
      { name: 'Đội Kim Ngưu 🐂', color: '#d97706', icon: '🐂', bg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' },
      { name: 'Đội Báo Đốm 🐆', color: '#eab308', icon: '🐆', bg: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)' }
    ]
  }
};

// Default sample student list
const DEFAULT_STUDENT_NAMES = [
  'Bùi Thanh Phát', 'Đặng Thị Thu Huyền', 'Nguyễn Văn An', 'Trần Thị Bình',
  'Lê Hoàng Cường', 'Phạm Minh Đức', 'Hoàng Ngọc Ánh', 'Vũ Quốc Hùng',
  'Phan Thu Trang', 'Đỗ Gia Bảo', 'Đặng Mai Phương', 'Nông Văn Thắng',
  'Ngô Hải Yến', 'Bùi Văn Nam', 'Đương Hữu Nhật', 'Trương Khánh Linh',
  'Đoàn Anh Tuấn', 'Trịnh Bảo Ngọc', 'Lý Gia Hưng', 'Dương Thảo Nhi',
  'Nguyễn Đức Phúc', 'Hồ Thanh Thảo', 'Vũ Hoàng Nam', 'Phạm Quỳnh Anh'
];

export function StudentGroupDividerGame({ game, onClose, currentUser }) {
  const [screen, setScreen] = useState('setup'); // 'setup' | 'reveal'
  const [studentText, setStudentText] = useState(DEFAULT_STUDENT_NAMES.join('\n'));
  const [groupCount, setGroupCount] = useState(4);
  const [themeKey, setThemeKey] = useState('magic');
  const [revealSpeed, setRevealSpeed] = useState('medium'); // 'fast' | 'medium' | 'manual'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Divider Engine State
  const [assignedGroups, setAssignedGroups] = useState([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [assignedList, setAssignedList] = useState([]); // Array of { studentName, teamIndex }
  const [isRevealing, setIsRevealing] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentFlyingStudent, setCurrentFlyingStudent] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [manualRevealedIndices, setManualRevealedIndices] = useState([]);

  // Auto load homeroom list if available
  useEffect(() => {
    const hr = StorageService.getTeacherHomeroom(currentUser?.id);
    if (hr && hr.students && hr.students.length > 0) {
      const names = hr.students.map(s => s.name || s);
      setStudentText(names.join('\n'));
    }
  }, [currentUser]);

  // Parse Student Names Array
  const parseNamesList = () => {
    return studentText
      .split(/[\r\n,;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  const parsedStudents = parseNamesList();

  // Load Homeroom Students
  const handleLoadHomeroom = () => {
    const hr = StorageService.getTeacherHomeroom(currentUser?.id);
    if (hr && hr.students && hr.students.length > 0) {
      const names = hr.students.map(s => s.name || s);
      setStudentText(names.join('\n'));
      if (soundEnabled) SoundFX.click();
    } else {
      alert('Chưa có danh sách học sinh trong Lớp Chủ Nhiệm! Thầy cô có thể dán danh sách hoặc tải file Excel.');
    }
  };

  // Upload Excel File
  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const names = await parseStudentRosterFile(file);
      if (names && names.length > 0) {
        setStudentText(names.join('\n'));
        if (soundEnabled) SoundFX.fanfare();
      } else {
        alert('Không tìm thấy cột Họ và Tên học sinh trong file!');
      }
    } catch (err) {
      alert('Lỗi đọc file: ' + err.message);
    }
    e.target.value = '';
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    downloadExcelTemplate('Mau_Danh_Sach_Hoc_Sinh_Chia_Nhom', 'duck-race');
  };

  // Fisher-Yates Random Shuffle
  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Generate Group Allocation Strategy
  const generateGroupAllocation = () => {
    const students = shuffleArray(parsedStudents);
    const count = Math.min(Math.max(2, groupCount), 12);
    const themeTeams = THEMES[themeKey]?.teams || THEMES.magic.teams;

    // Build Empty Groups
    const groups = [];
    for (let i = 0; i < count; i++) {
      const t = themeTeams[i % themeTeams.length];
      groups.push({
        id: i,
        name: t.name,
        color: t.color,
        icon: t.icon,
        bg: t.bg,
        members: []
      });
    }

    // Distribute students sequentially round-robin
    const assignments = [];
    students.forEach((studentName, idx) => {
      const teamIdx = idx % count;
      assignments.push({
        studentName,
        teamIndex: teamIdx
      });
    });

    return { groups, assignments };
  };

  // Start Divider Game Process
  const handleStartDivision = () => {
    if (parsedStudents.length === 0) {
      alert('Vui lòng nhập danh sách học sinh trước khi chia nhóm!');
      return;
    }
    if (parsedStudents.length < groupCount) {
      alert(`Số học sinh (${parsedStudents.length}) không đủ để chia làm ${groupCount} nhóm! Vui lòng giảm số nhóm hoặc thêm học sinh.`);
      return;
    }

    const { groups, assignments } = generateGroupAllocation();
    setAssignedGroups(groups);
    setAssignedList(assignments);
    setRevealIndex(0);
    setManualRevealedIndices([]);
    setCurrentFlyingStudent(null);
    setScreen('reveal');
    setIsCountdown(true);
    setCountdownValue(3);

    if (soundEnabled) SoundFX.whoosh();
  };

  // Countdown Timer & Animation Loop Effect
  useEffect(() => {
    if (screen !== 'reveal' || !isCountdown) return;

    if (countdownValue > 0) {
      if (soundEnabled) SoundFX.timerTick();
      const timer = setTimeout(() => {
        setCountdownValue(prev => prev - 1);
      }, 900);
      return () => clearTimeout(timer);
    } else {
      setIsCountdown(false);
      if (soundEnabled) SoundFX.fanfare();
      if (revealSpeed !== 'manual') {
        setIsRevealing(true);
      }
    }
  }, [screen, isCountdown, countdownValue]);

  // Sequential Reveal Step Loop
  useEffect(() => {
    if (screen !== 'reveal' || isCountdown || !isRevealing) return;

    if (revealIndex < assignedList.length) {
      const item = assignedList[revealIndex];
      setCurrentFlyingStudent(item);

      if (soundEnabled) SoundFX.spinTick();

      const delay = revealSpeed === 'fast' ? 180 : 850;

      const timer = setTimeout(() => {
        // Add member to team
        setAssignedGroups(prev => {
          const updated = [...prev];
          const target = { ...updated[item.teamIndex] };
          target.members = [...target.members, item.studentName];
          updated[item.teamIndex] = target;
          return updated;
        });

        if (soundEnabled) SoundFX.click();

        setRevealIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setIsRevealing(false);
      setCurrentFlyingStudent(null);
      if (soundEnabled) SoundFX.correct();
    }
  }, [screen, isCountdown, isRevealing, revealIndex, assignedList, revealSpeed]);

  // Handle Manual Card Click Reveal
  const handleRevealManualStudent = (index) => {
    if (manualRevealedIndices.includes(index)) return;
    const item = assignedList[index];
    if (!item) return;

    setManualRevealedIndices(prev => [...prev, index]);

    setAssignedGroups(prev => {
      const updated = [...prev];
      const target = { ...updated[item.teamIndex] };
      target.members = [...target.members, item.studentName];
      updated[item.teamIndex] = target;
      return updated;
    });

    if (soundEnabled) SoundFX.correct();
  };

  // Reshuffle Groups
  const handleReshuffle = () => {
    handleStartDivision();
  };

  // Copy Results Markdown Summary
  const handleCopyResults = () => {
    let resultText = `📋 [DANH SÁCH CHIA NHÓM - LỚP HỌC]\n`;
    resultText += `Tổng số học sinh: ${parsedStudents.length} | Số nhóm: ${assignedGroups.length}\n`;
    resultText += `=========================================\n\n`;

    assignedGroups.forEach((g, idx) => {
      resultText += `🏆 [NHÓM ${idx + 1}: ${g.name}] (${g.members.length} thành viên):\n`;
      g.members.forEach((m, mIdx) => {
        resultText += `   ${mIdx + 1}. ${m}\n`;
      });
      resultText += `\n`;
    });

    navigator.clipboard.writeText(resultText);
    setCopiedToast(true);
    if (soundEnabled) SoundFX.click();
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Download TXT Results
  const handleDownloadTXT = () => {
    let resultText = `DANH SACH CHIA NHOM HOC SINH\n`;
    resultText += `Tong so: ${parsedStudents.length} | So nhom: ${assignedGroups.length}\n\n`;

    assignedGroups.forEach((g, idx) => {
      resultText += `[NHOM ${idx + 1}: ${g.name}] (${g.members.length} thanh vien):\n`;
      g.members.forEach((m, mIdx) => {
        resultText += `  ${mIdx + 1}. ${m}\n`;
      });
      resultText += `\n`;
    });

    const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KetQua_ChiaNhom_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Toggle Fullscreen Mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #09131d 0%, #0f172a 50%, #1e1b4b 100%)',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Top Header Bar */}
      <div style={{
        padding: '14px 24px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.5)'
          }}>
            🧩
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Game Chia Nhóm Học Sinh Bí Mật
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fde047', border: '1px solid rgba(245, 158, 11, 0.4)', fontWeight: 800 }}>
                Hồi Hộp & Thú Vị
              </span>
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>
              Chia nhóm ngẫu nhiên theo số nhóm giáo viên tùy chỉnh | Hiệu ứng phân đội kịch tính
            </p>
          </div>
        </div>

        {/* Action Controls Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
          >
            {soundEnabled ? <Volume2 size={16} color="#38bdf8" /> : <VolumeX size={16} color="#ef4444" />}
            {soundEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}
          </button>

          <button
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullscreen ? 'Thoát Toàn Màn Hình' : 'Toàn Màn Hình'}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '8px 14px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
              }}
            >
              <X size={18} />
              Thoát Game
            </button>
          )}
        </div>
      </div>

      {/* SCREEN 1: SETUP & CONFIGURATION SCREEN */}
      {screen === 'setup' && (
        <div style={{
          flex: 1,
          padding: '24px',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '24px',
          overflowY: 'auto'
        }}>
          
          {/* Left Column: Student List Input Area */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: '1.5px solid rgba(245, 158, 11, 0.3)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={22} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                  Danh Sách Học Sinh Đầu Vào
                </h3>
              </div>
              <span style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000000',
                padding: '4px 12px',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '0.82rem'
              }}>
                {parsedStudents.length} Học Sinh
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={handleLoadHomeroom}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} /> 🔄 Lấy Từ Lớp Chủ Nhiệm
              </button>

              <label style={{
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FileSpreadsheet size={14} /> 📥 Tải File Excel Họ Tên
                <input type="file" accept=".xlsx, .xls, .csv, .docx, .txt" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              <button
                onClick={handleDownloadTemplate}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} /> Tải Mẫu Excel
              </button>

              {parsedStudents.length > 0 && (
                <button
                  onClick={() => setStudentText('')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginLeft: 'auto'
                  }}
                >
                  <Trash2 size={14} /> Xóa Hết
                </button>
              )}
            </div>

            {/* Textarea Input */}
            <textarea
              value={studentText}
              onChange={e => setStudentText(e.target.value)}
              placeholder="Dán hoặc gõ danh sách tên học sinh (mỗi em một dòng)...&#10;Ví dụ:&#10;Bùi Thanh Phát&#10;Đặng Thị Thu Huyền&#10;Nguyễn Văn An..."
              rows={12}
              style={{
                width: '100%',
                background: 'rgba(2, 6, 23, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '14px',
                color: '#f8fafc',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                outline: 'none',
                resize: 'none',
                fontFamily: 'monospace'
              }}
            />

            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
              💡 Thầy cô có thể gõ trực tiếp, dán danh sách từ Zalo/Word hoặc tải file Excel danh sách học sinh.
            </div>
          </div>

          {/* Right Column: Group Settings & Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Group Count Selection Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              border: '1.5px solid rgba(56, 189, 248, 0.3)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={20} /> 1. Tuỳ Chọn Số Nhóm Đầu Ra
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#fde047', fontWeight: 800 }}>
                  ~{parsedStudents.length > 0 ? Math.ceil(parsedStudents.length / groupCount) : 0} học sinh / nhóm
                </span>
              </div>

              {/* Group Count Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setGroupCount(num);
                      if (soundEnabled) SoundFX.click();
                    }}
                    style={{
                      background: groupCount === num ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255, 255, 255, 0.06)',
                      color: groupCount === num ? '#ffffff' : '#94a3b8',
                      border: groupCount === num ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '10px 0',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: groupCount === num ? '0 4px 14px rgba(2, 132, 199, 0.4)' : 'none'
                    }}
                  >
                    {num} Nhóm
                  </button>
                ))}
              </div>
            </div>

            {/* Theme & Naming Selection Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              border: '1.5px solid rgba(236, 72, 153, 0.3)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#f472b6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} /> 2. Đặt Tên & Chủ Đề Nhóm
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.keys(THEMES).map(tKey => {
                  const th = THEMES[tKey];
                  const isSelected = themeKey === tKey;
                  return (
                    <button
                      key={tKey}
                      onClick={() => {
                        setThemeKey(tKey);
                        if (soundEnabled) SoundFX.click();
                      }}
                      style={{
                        background: isSelected ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#ffffff' : '#94a3b8',
                        border: isSelected ? '1.5px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '14px',
                        padding: '12px 14px',
                        textAlign: 'left',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{th.label}</span>
                      {isSelected && <Check size={16} color="#ec4899" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reveal Speed Mode Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} /> 3. Tốc Độ & Kiểu Hồi Hộp Khi Chia
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  onClick={() => setRevealSpeed('medium')}
                  style={{
                    background: revealSpeed === 'medium' ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'rgba(255, 255, 255, 0.05)',
                    color: revealSpeed === 'medium' ? '#ffffff' : '#94a3b8',
                    border: revealSpeed === 'medium' ? '1.5px solid #34d399' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🎬 Hồi Hộp Tự Động
                </button>
                <button
                  onClick={() => setRevealSpeed('fast')}
                  style={{
                    background: revealSpeed === 'fast' ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'rgba(255, 255, 255, 0.05)',
                    color: revealSpeed === 'fast' ? '#ffffff' : '#94a3b8',
                    border: revealSpeed === 'fast' ? '1.5px solid #34d399' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Siêu Tốc (3s)
                </button>
                <button
                  onClick={() => setRevealSpeed('manual')}
                  style={{
                    background: revealSpeed === 'manual' ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'rgba(255, 255, 255, 0.05)',
                    color: revealSpeed === 'manual' ? '#ffffff' : '#94a3b8',
                    border: revealSpeed === 'manual' ? '1.5px solid #34d399' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '10px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🔮 Lật Thẻ Bí Mật
                </button>
              </div>
            </div>

            {/* Launch Game Button */}
            <button
              onClick={handleStartDivision}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000000',
                border: 'none',
                borderRadius: '20px',
                padding: '18px',
                fontSize: '1.15rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
                transition: 'transform 0.15s ease'
              }}
            >
              <Play size={24} fill="#000000" />
              🚀 BẮT ĐẦU CHIA NHÓM BÍ MẬT!
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: SUSPENSEFUL REVEAL ARENA */}
      {screen === 'reveal' && (
        <div style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Countdown Overlay Animation */}
          {isCountdown && (
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 90,
              background: 'rgba(9, 19, 29, 0.95)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px'
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', letterSpacing: '2px' }}>
                🔮 ĐANG CHUẨN BỊ PHÂN ĐỘI BÍ MẬT...
              </div>
              <div style={{
                fontSize: '8rem',
                fontWeight: 900,
                color: '#ffffff',
                textShadow: '0 0 40px #f59e0b, 0 0 80px #d97706',
                animation: 'pulse 0.5s infinite alternate'
              }}>
                {countdownValue > 0 ? countdownValue : 'BẮT ĐẦU!'}
              </div>
              <div style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>
                {parsedStudents.length} học sinh ➔ {assignedGroups.length} nhóm bí mật
              </div>
            </div>
          )}

          {/* Central Flying Capsule Indicator */}
          {currentFlyingStudent && (
            <div style={{
              position: 'absolute',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 80,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000000',
              padding: '12px 28px',
              borderRadius: '30px',
              fontWeight: 900,
              fontSize: '1.3rem',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.8), 0 0 60px rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'bounce 0.4s infinite'
            }}>
              <Sparkles size={24} />
              <span>{currentFlyingStudent.studentName}</span>
              <ChevronRight size={24} />
              <span>{assignedGroups[currentFlyingStudent.teamIndex]?.name}</span>
            </div>
          )}

          {/* Top Control Bar for Arena */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '12px 20px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>
                ⚡ Tiến độ chia: {revealIndex} / {assignedList.length} Học Sinh
              </span>
              <div style={{ width: '160px', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(revealIndex / (assignedList.length || 1)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {revealSpeed === 'manual' && (
                <div style={{ fontSize: '0.85rem', color: '#fde047', fontWeight: 800 }}>
                  👉 Hãy nhấp vào từng thẻ bên dưới để mở nhóm bí mật!
                </div>
              )}

              {isRevealing && (
                <button
                  onClick={() => setIsRevealing(false)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Pause size={14} /> Tạm Dừng
                </button>
              )}

              {!isRevealing && revealIndex < assignedList.length && revealSpeed !== 'manual' && (
                <button
                  onClick={() => setIsRevealing(true)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Play size={14} /> Tiếp Tục Chia
                </button>
              )}

              <button
                onClick={handleReshuffle}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Shuffle size={14} /> 🎲 Tráo Lại Nhóm
              </button>

              <button
                onClick={handleCopyResults}
                style={{
                  background: copiedToast ? '#10b981' : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}
              >
                {copiedToast ? <Check size={14} /> : <Copy size={14} />}
                {copiedToast ? 'Đã Sao Chép!' : '📋 Sao Chép Bảng Kết Quả'}
              </button>

              <button
                onClick={handleDownloadTXT}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} /> Tải Tệp TXT
              </button>

              <button
                onClick={() => setScreen('setup')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Settings size={14} /> ⚙️ Đổi Cấu Hình
              </button>
            </div>
          </div>

          {/* Manual Card Reveal Mode Grid Deck */}
          {revealSpeed === 'manual' && manualRevealedIndices.length < assignedList.length && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '16px',
              borderRadius: '20px',
              border: '1px dashed rgba(245, 158, 11, 0.4)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
              maxHeight: '160px',
              overflowY: 'auto'
            }}>
              {assignedList.map((item, idx) => {
                const isRevealed = manualRevealedIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleRevealManualStudent(idx)}
                    disabled={isRevealed}
                    style={{
                      background: isRevealed ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: isRevealed ? '#64748b' : '#000000',
                      border: isRevealed ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      borderRadius: '12px',
                      padding: '8px 14px',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      cursor: isRevealed ? 'default' : 'pointer',
                      boxShadow: isRevealed ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    {isRevealed ? `✅ ${item.studentName}` : `🔮 Thẻ Bí Mật #${idx + 1}`}
                  </button>
                );
              })}
            </div>
          )}

          {/* Team Pods Display Grid */}
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${assignedGroups.length > 4 ? '260px' : '300px'}, 1fr))`,
            gap: '16px',
            overflowY: 'auto',
            paddingBottom: '20px'
          }}>
            {assignedGroups.map((group, teamIdx) => (
              <div
                key={group.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
                  borderRadius: '20px',
                  border: `2px solid ${group.color}`,
                  boxShadow: `0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px ${group.color}25`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Team Pod Header */}
                <div style={{
                  background: group.bg,
                  padding: '12px 16px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: `0 4px 14px ${group.color}40`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{group.icon}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>
                        {group.name}
                      </h4>
                      <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 700 }}>
                        Nhóm #{teamIdx + 1}
                      </span>
                    </div>
                  </div>

                  <span style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontWeight: 900,
                    fontSize: '0.85rem'
                  }}>
                    {group.members.length} HS
                  </span>
                </div>

                {/* Team Members Roster Grid */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  overflowY: 'auto',
                  maxHeight: '320px',
                  paddingRight: '4px'
                }}>
                  {group.members.map((memberName, mIdx) => (
                    <div
                      key={mIdx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        animation: 'fadeIn 0.3s ease-out'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: `${group.color}35`,
                          color: group.color,
                          fontSize: '0.72rem',
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {mIdx + 1}
                        </span>
                        <span>{memberName}</span>
                      </div>
                      <Award size={14} color={group.color} />
                    </div>
                  ))}

                  {group.members.length === 0 && (
                    <div style={{
                      padding: '30px',
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '0.82rem',
                      fontStyle: 'italic',
                      border: '1px dashed rgba(255,255,255,0.1)',
                      borderRadius: '12px'
                    }}>
                      🔮 Đang chờ học sinh hạ cánh vào nhóm...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
