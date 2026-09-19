import React, { useState, useEffect } from 'react';
import { UserCheck, Sparkles, Play, Users, Settings, Dices, Award, RefreshCw } from 'lucide-react';
import { StorageService } from '../services/storage';

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
    category: 'Tương tác & Quay số',
    icon: '🦆',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    description: 'Mỗi con vịt gắn với 1 học sinh. Khi bấm Đua!, các con vịt bơi nảy lửa trên sông về đích để chọn ra 1 hoặc nhiều học sinh may mắn nhận thưởng!',
    engineType: 'duck-race'
  };

  const turtleRaceGame = baseGames.find(g => g.engineType === 'turtle-race' || g.id === 'turtle-race-quiz') || {
    id: 'turtle-race-quiz',
    title: 'Đua Rùa Gọi Tên — Học Sinh May Mắn',
    subtitle: 'Cuộc Đua Rùa Chọn Học Sinh May Mắn Nhận Thưởng',
    category: 'Tương tác & Quay số',
    icon: '🐢',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    description: 'Mỗi con rùa gắn tên 1 học sinh. Khi bấm Đua!, các con rùa bò nảy lửa trên đường đua về đích để chọn ra học sinh may mắn!',
    engineType: 'turtle-race'
  };

  const clawMachineGame = baseGames.find(g => g.engineType === 'claw-machine' || g.id === 'claw-machine-quiz') || {
    id: 'claw-machine-quiz',
    title: 'Gắp Thú Gọi Tên — Siêu Thị Gấu Bông',
    subtitle: 'Gắp Thú Bông Ngẫu Nhiên Chọn Học Sinh May Mắn',
    category: 'Tương tác & Quay số',
    icon: '🧸',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    description: 'Mô phỏng máy gắp thú bông siêu thị. Mỗi gấu bông gắn tên 1 học sinh, tay gắp cơ học sẽ hạ xuống gắp ngẫu nhiên gấu bông để chọn ra học sinh lên bảng nhận thưởng!',
    engineType: 'claw-machine'
  };

  const astronautExplorerGame = baseGames.find(g => g.engineType === 'astronaut-explorer' || g.id === 'astronaut-quiz') || {
    id: 'astronaut-quiz',
    title: 'Phi Hành Gia / Thám Hiểm May Mắn',
    subtitle: 'Vũ Trụ Không Gian Hạ Cánh Chọn Học Sinh',
    category: 'Tương tác & Quay số',
    icon: '🚀',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    description: 'Đồ họa vũ trụ không gian huyền ảo. Đếm ngược 5s kịch tính, tên lửa phun khói và nhân vật hạ cánh chọn hành tinh học sinh may mắn!',
    engineType: 'astronaut-explorer'
  };

  const magicHatGame = baseGames.find(g => g.engineType === 'magic-hat' || g.id === 'magic-hat-quiz') || {
    id: 'magic-hat-quiz',
    title: 'Chiếc Mũ Ma Thuật / Hộp Quà Bí Mật',
    subtitle: 'Mũ Ảo Thuật Biến Phép Triệu Hồi Học Sinh',
    category: 'Tương tác & Quay số',
    icon: '🎩',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    description: 'Chiếc mũ ảo thuật lắc lư phát sáng kỳ diệu! Nhấp vào để thỏ ngọc chui ra mang theo cuộn thư mang tên học sinh được triệu hồi.',
    engineType: 'magic-hat'
  };

  const magicGrimoireGame = baseGames.find(g => g.engineType === 'magic-grimoire' || g.id === 'magic-grimoire-quiz') || {
    id: 'magic-grimoire-quiz',
    title: 'Cổ Thư Triệu Hồi (AI Gesture Camera)',
    subtitle: 'Nhận Diện Cử Chỉ Vẫy Tay Triệu Hồi Học Sinh',
    category: 'Tương tác & Quay số',
    icon: '📜',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    description: 'Sử dụng camera máy tính tích hợp nhận diện cử chỉ vẫy tay trước màn hình để lật trang cổ thư phép thuật triệu hồi học sinh!',
    engineType: 'magic-grimoire'
  };

  const studentsList = homeroomData?.students || [];

  // Quick Instant Random Picker (1-second spinner)
  const handleQuickPick = () => {
    if (!studentsList || studentsList.length === 0) {
      alert('Chưa có danh sách học sinh trong Lớp Chủ Nhiệm! Vui lòng thêm học sinh ở mục "Lớp Chủ Nhiệm" hoặc chọn trò chơi Đua Vịt/Đua Rùa để tải tệp Excel.');
      return;
    }
    setIsPickingQuick(true);
    setQuickPickedStudent(null);

    let count = 0;
    const interval = setInterval(() => {
      const randomStudent = studentsList[Math.floor(Math.random() * studentsList.length)];
      setQuickPickedStudent(randomStudent);
      count++;
      if (count >= 15) {
        clearInterval(interval);
        setIsPickingQuick(false);
      }
    }, 80);
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
                Gọi Tên Học Sinh
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
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>
              DỮ LIỆU LỚP CHỦ NHIỆM
            </span>
            <span style={{ fontSize: '1.05rem', color: '#38bdf8', fontWeight: 900 }}>
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
        background: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b'
          }}>
            <Dices size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, color: '#f8fafc', fontWeight: 800, fontSize: '1.1rem' }}>
              Quay Nhanh 1 Học Sinh (Tức Thì)
            </h4>
            <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              Dành cho thầy cô cần chọn nhanh 1 em lên bảng trong 1 giây từ danh sách Lớp Chủ Nhiệm.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

      {/* Main Feature Cards Grid: Duck Race & Turtle Race */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} color="#38bdf8" />
          Các Trò Chơi Cuộc Đua Gọi Tên Học Sinh
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1: Đua Vịt Gọi Tên */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(2, 132, 199, 0.4)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: '0 6px 16px rgba(2, 132, 199, 0.4)'
                }}>
                  🦆
                </div>
                <span className="badge" style={{ background: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8', border: '1px solid rgba(2, 132, 199, 0.5)', fontWeight: 800 }}>
                  Đua Bơi Trên Sông
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px 0' }}>
                {duckRaceGame.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                {duckRaceGame.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => onPlay && onPlay(duckRaceGame)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)'
                }}
              >
                <Play size={20} fill="#ffffff" />
                Mở Đua Vịt Chơi Ngay
              </button>

              <button
                onClick={() => onCustomize && onCustomize(duckRaceGame)}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Settings size={16} />
                Tùy Chỉnh Danh Sách Học Sinh / Tải Excel
              </button>
            </div>
          </div>

          {/* Card 2: Đua Rùa Gọi Tên */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
                }}>
                  🐢
                </div>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.5)', fontWeight: 800 }}>
                  Đua Bò Về Đích
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px 0' }}>
                {turtleRaceGame.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                {turtleRaceGame.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => onPlay && onPlay(turtleRaceGame)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Play size={20} fill="#ffffff" />
                Mở Đua Rùa Chơi Ngay
              </button>

              <button
                onClick={() => onCustomize && onCustomize(turtleRaceGame)}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Settings size={16} />
                Tùy Chỉnh Danh Sách Học Sinh / Tải Excel
              </button>
            </div>
          </div>

          {/* Card 3: Gắp Thú Gọi Tên */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: '0 6px 16px rgba(168, 85, 247, 0.4)'
                }}>
                  🧸
                </div>
                <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.5)', fontWeight: 800 }}>
                  Máy Gắp Arcade
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px 0' }}>
                {clawMachineGame.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                {clawMachineGame.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => onPlay && onPlay(clawMachineGame)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)'
                }}
              >
                <Play size={20} fill="#ffffff" />
                Mở Gắp Thú Chơi Ngay
              </button>

              <button
                onClick={() => onCustomize && onCustomize(clawMachineGame)}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Settings size={16} />
                Tùy Chỉnh Danh Sách Học Sinh / Tải Excel
              </button>
            </div>
          </div>
          {/* Card 4: Phi Hành Gia / Thám Hiểm May Mắn */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.4)'
                }}>
                  🚀
                </div>
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.5)', fontWeight: 800 }}>
                  Vũ Trụ Không Gian
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px 0' }}>
                {astronautExplorerGame.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                {astronautExplorerGame.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => onPlay && onPlay(astronautExplorerGame)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
                }}
              >
                <Play size={20} fill="#ffffff" />
                Mở Phi Hành Gia Chơi Ngay
              </button>

              <button
                onClick={() => onCustomize && onCustomize(astronautExplorerGame)}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Settings size={16} />
                Tùy Chỉnh Danh Sách Học Sinh / Tải Excel
              </button>
            </div>
          </div>

          {/* Card 5: Chiếc Mũ Ma Thuật */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(236, 72, 153, 0.4)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: '0 6px 16px rgba(236, 72, 153, 0.4)'
                }}>
                  🎩
                </div>
                <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.5)', fontWeight: 800 }}>
                  Mũ Ảo Thuật
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px 0' }}>
                {magicHatGame.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                {magicHatGame.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => onPlay && onPlay(magicHatGame)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(236, 72, 153, 0.4)'
                }}
              >
                <Play size={20} fill="#ffffff" />
                Mở Mũ Ma Thuật Chơi Ngay
              </button>

              <button
                onClick={() => onCustomize && onCustomize(magicHatGame)}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Settings size={16} />
                Tùy Chỉnh Danh Sách Học Sinh / Tải Excel
              </button>
            </div>
          </div>

          {/* Card 6: Cổ Thư Triệu Hồi (AI Gesture Camera) */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(217, 119, 6, 0.4)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  boxShadow: '0 6px 16px rgba(217, 119, 6, 0.4)'
                }}>
                  📜
                </div>
                <span className="badge" style={{ background: 'rgba(217, 119, 6, 0.2)', color: '#fbbf24', border: '1px solid rgba(217, 119, 6, 0.5)', fontWeight: 800 }}>
                  AI Camera Gesture
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 8px 0' }}>
                {magicGrimoireGame.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                {magicGrimoireGame.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => onPlay && onPlay(magicGrimoireGame)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(217, 119, 6, 0.4)'
                }}
              >
                <Play size={20} fill="#ffffff" />
                Mở Cổ Thư Chơi Ngay
              </button>

              <button
                onClick={() => onCustomize && onCustomize(magicGrimoireGame)}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Settings size={16} />
                Tùy Chỉnh Danh Sách Học Sinh / Tải Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
