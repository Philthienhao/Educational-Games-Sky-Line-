import React, { useState, useEffect } from 'react';
import { UserCheck, Sparkles, Play, Users, Settings, Dices, Award, RefreshCw } from 'lucide-react';
import { StorageService } from '../services/storage';
import { GameCard } from './GameCard';

export default function StudentPickerManager({ currentUser, onPlay, onCustomize, onNavigateToHomeroom }) {
  const [baseGames, setBaseGames] = useState([]);
  const [homeroomData, setHomeroomData] = useState(null);
  const [quickPickedStudent, setQuickPickedStudent] = useState(null);
  const [isPickingQuick, setIsPickingQuick] = useState(false);

  useEffect(() => {
    // Fetch base games
    const games = StorageService.getBaseGames();
    setBaseGames(games);

    // Fetch homeroom data
    const hr = StorageService.getTeacherHomeroom(currentUser?.id);
    setHomeroomData(hr);
  }, [currentUser]);

  const duckRaceGame = baseGames.find(g => g.engineType === 'duck-race' || g.id === 'duck-race-quiz') || {
    id: 'duck-race-quiz',
    title: 'Đua Vịt Gọi Tên — Học Sinh May Mắn',
    subtitle: 'Cuộc Đua Vịt Gọi Tên / Chọn Học Sinh Nhận Thưởng',
    category: 'Gọi tên và chia nhóm',
    isStudentPicker: true,
    icon: '🦆',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    description: 'Mỗi con vịt gắn với 1 học sinh. Khi bấm Đua!, các con vịt bơi nảy lửa trên sông về đích để chọn ra 1 hoặc nhiều học sinh may mắn nhận thưởng!',
    engineType: 'duck-race'
  };

  const turtleRaceGame = baseGames.find(g => g.engineType === 'turtle-race' || g.id === 'turtle-race-quiz') || {
    id: 'turtle-race-quiz',
    title: 'Đua Rùa Gọi Tên — Học Sinh May Mắn',
    subtitle: 'Cuộc Đua Rùa Chọn Học Sinh May Mắn Nhận Thưởng',
    category: 'Gọi tên và chia nhóm',
    isStudentPicker: true,
    icon: '🐢',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    description: 'Mỗi con rùa gắn tên 1 học sinh. Khi bấm Đua!, các con rùa bò nảy lửa trên đường đua về đích để chọn ra học sinh may mắn!',
    engineType: 'turtle-race'
  };

  const clawMachineGame = baseGames.find(g => g.engineType === 'claw-machine' || g.id === 'claw-machine-quiz') || {
    id: 'claw-machine-quiz',
    title: 'Gắp Thú Gọi Tên — Siêu Thị Gấu Bông',
    subtitle: 'Gắp Thú Bông Ngẫu Nhiên Chọn Học Sinh May Mắn',
    category: 'Gọi tên và chia nhóm',
    isStudentPicker: true,
    icon: '🧸',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    description: 'Mô phỏng máy gắp thú bông siêu thị. Mỗi gấu bông gắn tên 1 học sinh, tay gắp cơ học sẽ hạ xuống gắp ngẫu nhiên gấu bông để chọn ra học sinh lên bảng nhận thưởng!',
    engineType: 'claw-machine'
  };

  const astronautExplorerGame = baseGames.find(g => g.engineType === 'astronaut-explorer' || g.id === 'astronaut-quiz') || {
    id: 'astronaut-quiz',
    title: 'Phi Hành Gia / Thám Hiểm May Mắn',
    subtitle: 'Vũ Trụ Không Gian Hạ Cánh Chọn Học Sinh',
    category: 'Gọi tên và chia nhóm',
    isStudentPicker: true,
    icon: '🚀',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    description: 'Đồ họa vũ trụ không gian huyền ảo. Đếm ngược 5s kịch tính, tên lửa phun khói và nhân vật hạ cánh chọn hành tinh học sinh may mắn!',
    engineType: 'astronaut-explorer'
  };

  const magicHatGame = baseGames.find(g => g.engineType === 'magic-hat' || g.id === 'magic-hat-quiz') || {
    id: 'magic-hat-quiz',
    title: 'Chiếc Mũ Ma Thuật / Hộp Quà Bí Mật',
    subtitle: 'Mũ Ảo Thuật Biến Phép Triệu Hồi Học Sinh',
    category: 'Gọi tên và chia nhóm',
    isStudentPicker: true,
    icon: '🎩',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    description: 'Chiếc mũ ảo thuật lắc lư phát sáng kỳ diệu! Nhấp vào để thỏ ngọc chui ra mang theo cuộn thư mang tên học sinh được triệu hồi.',
    engineType: 'magic-hat'
  };

  const magicGrimoireGame = baseGames.find(g => g.engineType === 'magic-grimoire' || g.id === 'magic-grimoire-quiz') || {
    id: 'magic-grimoire-quiz',
    title: 'Cổ Thư Triệu Hồi (AI Gesture Camera)',
    subtitle: 'Nhận Diện Cử Chỉ Vẫy Tay Triệu Hồi Học Sinh',
    category: 'Gọi tên và chia nhóm',
    isStudentPicker: true,
    icon: '📜',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    description: 'Sử dụng camera máy tính tích hợp nhận diện cử chỉ vẫy tay trước màn hình để lật trang cổ thư phép thuật triệu hồi học sinh!',
    engineType: 'magic-grimoire'
  };

  const studentGroupDividerGame = baseGames.find(g => g.engineType === 'student-group-divider' || g.id === 'student-group-divider-quiz') || {
    id: 'student-group-divider-quiz',
    title: 'Game Chia Nhóm Học Sinh — Phân Đội Bí Mật',
    subtitle: 'Chia Nhóm Tự Động / Hồi Hộp Bí Mật & Hào Hứng Cho Học Sinh',
    category: 'Gọi tên và chia nhóm',
    isStudentPicker: true,
    icon: '🧩',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    thumbnail: '/thumbnails/thumb_student_group_divider.jpg',
    description: 'Chia nhóm học sinh tùy chọn số nhóm đầu ra (2-8 nhóm). Giao diện bóc thăm bí mật hồi hộp với nhạc nền kịch tính, thẻ bí mật, tráo lại nhóm và sao chép/xuất kết quả!',
    engineType: 'student-group-divider'
  };

  const studentPickerGames = [
    duckRaceGame,
    turtleRaceGame,
    clawMachineGame,
    astronautExplorerGame,
    magicHatGame,
    magicGrimoireGame,
    studentGroupDividerGame
  ];

  const studentsList = homeroomData?.students || [];
  const [remainingQuickStudents, setRemainingQuickStudents] = useState([]);

  useEffect(() => {
    if (studentsList.length > 0) {
      setRemainingQuickStudents(studentsList);
    }
  }, [studentsList]);

  // Quick Instant Random Picker (1-second spinner)
  const handleQuickPick = () => {
    const activePool = remainingQuickStudents.length > 0 ? remainingQuickStudents : studentsList;
    if (!activePool || activePool.length === 0) {
      alert('Chưa có danh sách học sinh trong Lớp Chủ Nhiệm! Vui lòng thêm học sinh ở mục "Lớp Chủ Nhiệm" hoặc chọn trò chơi Đua Vịt/Đua Rùa để tải tệp Excel.');
      return;
    }
    setIsPickingQuick(true);
    setQuickPickedStudent(null);

    let count = 0;
    const interval = setInterval(() => {
      const randomStudent = activePool[Math.floor(Math.random() * activePool.length)];
      setQuickPickedStudent(randomStudent);
      count++;
      if (count >= 15) {
        clearInterval(interval);
        setIsPickingQuick(false);

        // Pick final winner and remove from remaining pool
        const winnerIndex = Math.floor(Math.random() * activePool.length);
        const winner = activePool[winnerIndex];
        setQuickPickedStudent(winner);

        const winnerName = (typeof winner === 'object' && winner !== null) ? (winner.name || winner.studentName || '') : String(winner || '');
        const updated = activePool.filter(s => {
          const sName = (typeof s === 'object' && s !== null) ? (s.name || s.studentName || '') : String(s || '');
          return sName !== winnerName;
        });

        if (updated.length === 0) {
          setRemainingQuickStudents(studentsList);
        } else {
          setRemainingQuickStudents(updated);
        }
      }
    }, 80);
  };

  const handleResetQuickList = () => {
    setRemainingQuickStudents(studentsList);
    setQuickPickedStudent(null);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.95) 50%, rgba(224, 242, 254, 0.95) 100%)',
        border: '1.5px solid rgba(13, 148, 136, 0.35)',
        borderRadius: '24px',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(13, 148, 136, 0.35)'
          }}>
            <UserCheck size={36} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Gọi Tên Và Chia Nhóm
              </h2>
              <span className="badge" style={{ background: '#0d9488', color: '#ffffff', fontWeight: 800, padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem' }}>
                Chức Năng Độc Lập
              </span>
            </div>
            <p style={{ color: '#334155', margin: '6px 0 0 0', fontSize: '0.98rem', fontWeight: 600 }}>
              Chọn học sinh ngẫu nhiên kịch tính và công bằng cho tiết học thông qua cuộc đua vui nhộn!
            </p>
          </div>
        </div>

        {/* Quick Homeroom Info Card */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid rgba(13, 148, 136, 0.25)',
          borderRadius: '16px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>
              DỮ LIỆU LỚP CHỦ NHIỆM
            </span>
            <span style={{ fontSize: '1.05rem', color: '#0d9488', fontWeight: 900 }}>
              {homeroomData?.className || 'Lớp chưa đặt tên'} ({studentsList.length} Học Sinh)
            </span>
          </div>
          {onNavigateToHomeroom && (
            <button
              onClick={onNavigateToHomeroom}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Users size={14} />
              Quản lý danh sách
            </button>
          )}
        </div>
      </div>

      {/* Quick Instant Random Selector Bar */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '20px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 6px 20px rgba(245, 158, 11, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d97706'
          }}>
            <Dices size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 900, fontSize: '1.1rem' }}>
                Quay Nhanh 1 Học Sinh (Tức Thì)
              </h4>
              <span className="badge" style={{ background: '#f59e0b', color: '#ffffff', fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px' }}>
                Còn {remainingQuickStudents.length}/{studentsList.length} HS
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', color: '#334155', fontSize: '0.88rem', fontWeight: 600 }}>
              Dành cho thầy cô cần chọn nhanh 1 em lên bảng. Học sinh đã chọn sẽ tự động ẩn đi để không lặp lại!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {quickPickedStudent && (
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              padding: '8px 20px',
              borderRadius: '14px',
              fontWeight: 900,
              fontSize: '1.15rem',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: isPickingQuick ? 'pulse 0.2s infinite' : 'none'
            }}>
              <Award size={20} />
              {quickPickedStudent.name || quickPickedStudent}
            </div>
          )}

          {remainingQuickStudents.length < studentsList.length && (
            <button
              onClick={handleResetQuickList}
              className="btn btn-secondary"
              style={{ padding: '10px 14px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Khôi phục danh sách đầy đủ ban đầu"
            >
              <RefreshCw size={14} /> Reset Danh Sách
            </button>
          )}

          <button
            onClick={handleQuickPick}
            disabled={isPickingQuick}
            className="btn btn-primary"
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              fontSize: '0.95rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={18} className={isPickingQuick ? 'spin' : ''} />
            {isPickingQuick ? 'Đang quay...' : '🎲 Quay Nhanh 1 Học Sinh'}
          </button>
        </div>
      </div>

      {/* Main Feature Cards Grid using standard HD GameCard UI */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} color="#0d9488" />
              Kho Game Gọi Tên Và Chia Nhóm Tương Tác
            </h3>
            <p style={{ color: '#475569', fontSize: '0.92rem', margin: '4px 0 0 0', fontWeight: 600 }}>
              Tập hợp các trò chơi đua vịt, đua rùa, gắp thú, thám hiểm vũ trụ, chiếc mũ ma thuật, cổ thư AI nhận diện cử chỉ tay & chia nhóm học sinh!
            </p>
          </div>
          <span className="badge" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#ffffff', padding: '8px 16px', borderRadius: '16px', fontWeight: 800, fontSize: '0.85rem' }}>
            {studentPickerGames.length} Game Gọi Tên & Chia Nhóm
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
          width: '100%'
        }}>
          {studentPickerGames.map(game => (
            <GameCard 
              key={game.id}
              game={game}
              currentUser={currentUser}
              onPlay={onPlay}
              onCustomize={onCustomize}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
