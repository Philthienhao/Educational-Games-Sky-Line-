import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Users, 
  FileText, 
  Award, 
  Target, 
  MessageSquare, 
  DollarSign, 
  CheckCircle2, 
  PlusCircle, 
  Sparkles,
  Calendar,
  Clock,
  ChevronRight,
  FolderPlus,
  BookOpen
} from 'lucide-react';

export function ParentMeetingSupport({ currentUser }) {
  const [activeModule, setActiveModule] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState('Họp Phụ Huynh Học Sinh Đầu Năm Học 2025 - 2026');
  const [meetingDate, setMeetingDate] = useState('2026-09-20');

  const modules = [
    {
      id: 'academic-report',
      title: 'Báo Cáo Học Tập & Rèn Luyện',
      icon: FileText,
      color: '#0284c7',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
      desc: 'Tổng hợp chi tiết kết quả học tập, điểm số, chuyên cần và đánh giá nề nếp rèn luyện từng học sinh.',
      badge: 'Trọng Tâm'
    },
    {
      id: 'student-honors',
      title: 'Vinh Danh & Tuyên Dương Học Sinh',
      icon: Award,
      color: '#eab308',
      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      desc: 'Trình chiếu bảng vinh danh học sinh xuất sắc, học sinh có tiến bộ vượt bậc và các giải thưởng phong trào.',
      badge: 'Nổi Bật'
    },
    {
      id: 'semester-plan',
      title: 'Kế Hoạch & Mục Tiêu Học Kỳ',
      icon: Target,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      desc: 'Trình bày phương hướng giảng dạy, kế hoạch học tập, chỉ tiêu thi đua và các mốc thời gian quan trọng.',
      badge: 'Kế Hoạch'
    },
    {
      id: 'parent-discussion',
      title: 'Góc Góp Ý & Thảo Luận PHHS',
      icon: MessageSquare,
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
      desc: 'Ghi nhận ý kiến đóng góp, giải đáp thắc mắc của Phụ huynh và tạo sự đồng thuận giữa Nhà trường - Gia đình.',
      badge: 'Tương Tác'
    },
    {
      id: 'finance-fund',
      title: 'Thu Chi & Quỹ Hoạt Động Lớp',
      icon: DollarSign,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
      desc: 'Công khai minh bạch các khoản thu chi, quỹ lớp và kế hoạch tài chính phục vụ các hoạt động ngoại khóa.',
      badge: 'Minh Bạch'
    },
    {
      id: 'meeting-minutes',
      title: 'Biên Bản & Nghị Quyết Cuộc Họp',
      icon: CheckCircle2,
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
      desc: 'Tự động tạo biên bản cuộc họp, biểu quyết ý kiến và lưu trữ đám mây xuất file PDF/Word nhanh chóng.',
      badge: 'Tự Động'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Hero Header Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
          borderRadius: '20px',
          border: '1.5px solid rgba(236, 72, 153, 0.4)',
          padding: '28px 32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(236, 72, 153, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Background Glow Spheres */}
        <div 
          style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '240px', height: '240px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }} 
        />
        <div 
          style={{
            position: 'absolute', bottom: '-80px', left: '20%',
            width: '280px', height: '280px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }} 
        />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)',
                  color: '#ffffff'
                }}
              >
                <HeartHandshake size={28} />
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#f472b6', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  SKY-LINE EDUCATIONAL SUITE · HỆ THỐNG HỖ TRỢ GIÁO VIÊN
                </div>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#ffffff', margin: '2px 0 0 0', textShadow: '0 0 20px rgba(236, 72, 153, 0.4)' }}>
                  Hỗ Trợ Họp Phụ Huynh
                </h1>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span 
                style={{
                  background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6',
                  border: '1px solid rgba(236, 72, 153, 0.4)', borderRadius: '12px',
                  padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Sparkles size={14} /> Niên khóa 2025 - 2026
              </span>
              
              <span 
                style={{
                  background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '12px',
                  padding: '6px 14px', fontSize: '0.8rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Users size={14} /> {currentUser?.name || 'Giáo Viên Chủ Nhiệm'}
              </span>
            </div>
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0, maxWidth: '850px', lineHeight: '1.6' }}>
            Trung tâm quản lý, điều hành và chuẩn bị nội dung họp Phụ huynh học sinh chuyên nghiệp. Giúp Giáo viên tổ chức cuộc họp sinh động, công khai minh bạch thông tin và thắt chặt mối liên kết giữa Nhà trường & Gia đình.
          </p>

          {/* Quick Setup Bar */}
          <div 
            style={{
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              marginTop: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
              <Calendar size={18} color="#f472b6" />
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>Tên cuộc họp:</span>
              <input 
                type="text" 
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                style={{
                  flex: 1, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(236, 72, 153, 0.3)',
                  borderRadius: '10px', padding: '6px 12px', color: '#ffffff', fontWeight: 700, fontSize: '0.88rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#f472b6" />
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>Ngày tổ chức:</span>
              <input 
                type="date" 
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(236, 72, 153, 0.3)',
                  borderRadius: '10px', padding: '6px 12px', color: '#ffffff', fontWeight: 700, fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid of Feature Modules */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚀 Các Chức Năng Hỗ Trợ Họp Phụ Huynh</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Chọn một trong các công cụ dưới đây để bắt đầu soạn thảo và chuẩn bị nội dung họp
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isSelected = activeModule === mod.id;

            return (
              <div 
                key={mod.id}
                onClick={() => setActiveModule(isSelected ? null : mod.id)}
                style={{
                  background: isSelected 
                    ? 'rgba(30, 41, 59, 0.95)' 
                    : 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                  borderRadius: '16px',
                  border: isSelected ? `2px solid ${mod.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '22px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSelected ? `0 0 25px ${mod.color}40` : '0 4px 15px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Module Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div 
                    style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: mod.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: `0 0 15px ${mod.color}60`
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  <span 
                    style={{
                      fontSize: '0.72rem', fontWeight: 900,
                      background: `rgba(${mod.color === '#0284c7' ? '2, 132, 199' : '236, 72, 153'}, 0.15)`,
                      color: mod.color,
                      border: `1px solid ${mod.color}40`,
                      padding: '3px 10px', borderRadius: '20px'
                    }}
                  >
                    {mod.badge}
                  </span>
                </div>

                {/* Module Body */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: '0 0 6px 0' }}>
                    {mod.title}
                  </h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                    {mod.desc}
                  </p>
                </div>

                {/* Module Footer Action */}
                <div 
                  style={{
                    marginTop: 'auto', paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    color: mod.color, fontWeight: 800, fontSize: '0.82rem'
                  }}
                >
                  <span>{isSelected ? 'Đã Chọn Chức Năng' : 'Bấm Để Mở & Cấu Hình'}</span>
                  <ChevronRight size={16} style={{ transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Module Detail Panel / Extension Sandbox */}
      {activeModule && (
        <div 
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: '16px',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} />
              Cấu Hình Chi Tiết: {modules.find(m => m.id === activeModule)?.title}
            </h3>

            <button 
              onClick={() => setActiveModule(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1', border: 'none',
                borderRadius: '8px', padding: '4px 12px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem'
              }}
            >
              Đóng
            </button>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '20px', borderRadius: '12px', border: '1px dashed rgba(56, 189, 248, 0.3)', textAlign: 'center' }}>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: '0 0 12px 0' }}>
              Khung chức năng <strong>"{modules.find(m => m.id === activeModule)?.title}"</strong> đã được tạo và sẵn sàng tích hợp các tính năng chi tiết theo yêu cầu tiếp theo của Thầy/Cô.
            </p>
            <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 800 }}>
              💡 Thầy/Cô có thể đưa thêm yêu cầu cụ thể (bảng điểm học sinh, slide trình chiếu họp phụ huynh, phiếu lấy ý kiến, danh sách thu chi...) để hoàn thiện module này!
            </div>
          </div>
        </div>
      )}

      {/* Developer / Teacher Expansion Notice */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '10px', borderRadius: '12px', color: '#f59e0b' }}>
          <FolderPlus size={24} />
        </div>
        <div>
          <div style={{ fontWeight: 900, color: '#fde047', fontSize: '0.95rem', marginBottom: '2px' }}>
            Sẵn Sàng Cho Các Chức Năng Tiếp Theo!
          </div>
          <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
            Phần <strong>"Hỗ trợ họp Phụ Huynh"</strong> đã được khởi tạo thành công trên hệ thống. Hãy gửi tiếp các yêu cầu tính năng chi tiết mà Thầy/Cô muốn tích hợp vào mục này!
          </div>
        </div>
      </div>

    </div>
  );
}
