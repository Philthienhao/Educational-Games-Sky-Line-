import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Send, 
  X, 
  Gamepad2, 
  BookOpen, 
  Users, 
  Clock, 
  HeartHandshake, 
  FlaskConical, 
  Globe, 
  Presentation, 
  PlusCircle, 
  HelpCircle, 
  Play, 
  ArrowRight, 
  BookmarkCheck, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Cpu, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { StorageService } from '../services/storage';

// Helper for Vietnamese diacritic removal for fuzzy search
function removeAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function AiSystemAssistantModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onSelectTab, 
  onPlayGame, 
  onOpenAdminCreateGame, 
  onOpenUserManagement,
  savedGames = [] 
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: `🤖 **Xin chào ${currentUser?.name || 'Thầy/Cô'}!** Em là **Trợ Lý Tìm Kiếm & Hướng Dẫn Hệ Thống 24/7**.\n\nThầy/Cô có thể nhập từ khóa để **tìm kiếm nhanh bất kỳ trò chơi, môn học hay công cụ nào**, hoặc đặt câu hỏi về **cách sử dụng hệ thống** để em hỗ trợ ngay nhé!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 150);
    }
  }, [isOpen]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  // Master System Database Index (Catalog Games + Saved Games + Tools + Guides)
  const systemIndex = useMemo(() => {
    const allTeacherGames = StorageService.getTeacherSavedGames(currentUser?.id) || [];
    const games = [
      ...(savedGames.length > 0 ? savedGames : allTeacherGames)
    ];

    const tools = [
      {
        id: 'tool_catalog',
        title: 'Kho Game Giáo Dục',
        type: 'tab',
        tabId: 'catalog',
        icon: '🎮',
        category: 'Thư viện game',
        description: 'Tổng hợp tất cả các trò chơi trắc nghiệm, tương tác camera AI và đua top học sinh.',
        keywords: ['kho game', 'danh sach game', 'tat ca game', 'giao duc', 'tro choi']
      },
      {
        id: 'tool_my_games',
        title: 'Game Của Tôi & Đã Lưu',
        type: 'tab',
        tabId: 'my-games',
        icon: '📑',
        category: 'Thư viện cá nhân',
        description: 'Xem, chỉnh sửa, nhân bản và trình chiếu các bộ game trắc nghiệm do thầy cô tự tạo.',
        keywords: ['game cua toi', 'game da luu', 'bo cau hoi cua toi', 'sua game']
      },
      {
        id: 'tool_call_student',
        title: 'Gọi Tên Học Sinh & Đoán Bóng Tìm Con',
        type: 'tab',
        tabId: 'call-student',
        icon: '👤',
        category: 'Công cụ lớp học',
        description: 'Vòng quay gọi tên ngẫu nhiên, ghép ảnh học sinh và game Đoán bóng tìm con phục vụ họp phụ huynh.',
        keywords: ['goi ten', 'doan bong tim con', 'bONG', 'quay ten', 'ngau nhien', 'goi hoc sinh']
      },
      {
        id: 'tool_timer',
        title: 'Đồng Hồ Bấm Giờ Lớp Học',
        type: 'tab',
        tabId: 'timer',
        icon: '⏱️',
        category: 'Công cụ lớp học',
        description: 'Đồng hồ đếm ngược, đếm tiến, tính giờ làm bài thi đấu cho các đội chơi.',
        keywords: ['dong ho', 'bam gio', 'dem nguoc', 'tinh gio', 'timer']
      },
      {
        id: 'tool_homeroom',
        title: 'Lớp Chủ Nhiệm & Sơ Đồ Lớp Học',
        type: 'tab',
        tabId: 'homeroom',
        icon: '👥',
        category: 'Quản lý lớp',
        description: 'Quản lý danh sách học sinh, sơ đồ chỗ ngồi, điểm thi đua tổ, ảnh tập thể lớp và phiếu nhận xét.',
        keywords: ['chu nhiem', 'lop chu nhiem', 'so do lop', 'nhan xet', 'hoc sinh', 'thi dua']
      },
      {
        id: 'tool_parent_meeting',
        title: 'Họp Phụ Huynh & Game Bắt Chước',
        type: 'tab',
        tabId: 'parent-meeting',
        icon: '🤝',
        category: 'Hoạt động trường',
        description: 'Kịch bản họp phụ huynh đầu năm/cuối năm, game Đoán bóng tìm con và video vinh danh học sinh.',
        keywords: ['hop phu huynh', 'phu huynh', 'doan bong', 'vinh danh', 'kich ban']
      },
      {
        id: 'tool_textbook',
        title: 'Tải Sách Giáo Khoa SGK (PDF)',
        type: 'tab',
        tabId: 'textbook-download',
        icon: '📖',
        category: 'Tài liệu',
        description: 'Tải và đọc trực tuyến SGK các môn Lớp 6, 7, 8, 9 (Chân trời sáng tạo, Kết nối tri thức, Cánh diều).',
        keywords: ['tai sgk', 'sach giao khoa', 'pdf', 'lop 6', 'lop 7', 'lop 8', 'lop 9', 'dia ly', 'khtn']
      },
      {
        id: 'tool_virtual_lab',
        title: 'Thí Nghiệm KHTN (Vật Lý, Hóa Học, Sinh Học)',
        type: 'tab',
        tabId: 'virtual-lab',
        icon: '🧪',
        category: 'Mô phỏng 3D',
        description: 'Phòng thí nghiệm ảo tương tác: phản ứng Hóa học, mạch điện Vật lý, tế bào Sinh học.',
        keywords: ['thi nghiem', 'khtn', 'hoa hoc', 'vat ly', 'sinh hoc', 'phong thi nghiem']
      },
      {
        id: 'tool_geo_3d',
        title: '3D Địa Lý & Hệ Mặt Trời Interative',
        type: 'tab',
        tabId: 'geo-experiments',
        icon: '🌍',
        category: 'Mô phỏng 3D',
        description: 'Mô hình 3D chuyển động Trái Đất, Hệ Mặt Trời, cấu tạo địa chất và các hành tinh.',
        keywords: ['3d dia ly', 'dia ly 3d', 'he mat troi', 'trai dat', 'xoay 3d', 'hanh tinh']
      },
      {
        id: 'tool_slides',
        title: 'Slide Bài Giảng & Lưu Trữ Google Drive',
        type: 'tab',
        tabId: 'lecture-slides',
        icon: '📊',
        category: 'Giảng dạy',
        description: 'Quản lý danh mục Slide bài giảng điện tử theo môn học, nhúng Canva / Google Slides chiếu trực tiếp.',
        keywords: ['slide', 'bai giang', 'trinh chieu', 'powerpoint', 'canva', 'drive']
      },
      {
        id: 'tool_create_game',
        title: 'Tạo Bộ Câu Hỏi & Game Giáo Dục Mới',
        type: 'action',
        actionType: 'create_game',
        icon: '✨',
        category: 'Tạo nội dung',
        description: 'Công cụ nhập câu hỏi thủ công hoặc tải file Excel trắc nghiệm để sinh game giáo dục mới.',
        keywords: ['tao game', 'nhap cau hoi', 'tao bo cau hoi', 'them game', 'excel', 'tao moi']
      }
    ];

    const systemFaqs = [
      {
        id: 'faq_create_game',
        keywords: ['cach tao game', 'lam sao tao game', 'tao cau hoi', 'nhap excel cau hoi', 'huong dan tao game'],
        title: 'Hướng dẫn Tạo Game Giáo Dục Mới',
        answer: 'Để tạo một game trắc nghiệm mới:\n1. Bấm vào nút **"✨ Tạo Game Mới"** trên thanh Menu trái hoặc ở đầu trang "Game Của Tôi".\n2. Chọn loại trò chơi mong muốn (ví dụ: *Nghiêng Đầu, Đua Vịt, Kéo Co, Ai Là Triệu Phú...*).\n3. Nhập tiêu đề, chọn môn học và tải lên file Excel câu hỏi hoặc nhập trực tiếp từng câu.\n4. Bấm **"Lưu Game"** để bắt đầu trình chiếu trên lớp!',
        actionType: 'create_game',
        actionText: '✨ Thử Tạo Game Mới Ngay'
      },
      {
        id: 'faq_excel_student',
        keywords: ['nhap danh sach hoc sinh', 'excel hoc sinh', 'dua vit excel', 'dua rua excel', 'mau excel'],
        title: 'Hướng dẫn Nhập Danh Sách Học Sinh bằng Excel',
        answer: 'Đối với các game đua top như **Đua Vịt** & **Đua Rùa**:\n1. Trong màn hình cấu hình game, bấm nút **"📥 Tải Mẫu Excel Học Sinh"** (`Mau_Danh_Sach_Hoc_Sinh_Dua_Vit_Dua_Rua.xlsx`).\n2. Điền cột **"Họ và tên học sinh"** và cột **"Ghi chú / Nhóm"**.\n3. Bấm **"Upload File Excel"** để hệ thống tự động nhận diện danh sách học sinh vào đường đua!',
        tabId: 'catalog',
        actionText: '🎮 Mở Kho Game Trình Chiếu'
      },
      {
        id: 'faq_camera_ai',
        keywords: ['camera ai', 'nghieng dau', 'bat chuoc', 'camera khong hoat dong', 'cach dung camera'],
        title: 'Hướng dẫn Sử dụng Camera AI (Nghiêng Đầu & Bắt Chước)',
        answer: 'Các game tương tác Camera AI gồm **Nghiêng Đầu Chuẩn** và **Bắt Chước Nhanh**:\n• **Game Nghiêng Đầu**: Học sinh nghiêng đầu sang trái (Physical Left) để chọn **Đáp án A**, nghiêng sang phải (Physical Right) để chọn **Đáp án B**.\n• **Game Bắt Chước**: Học sinh tạo dáng cơ thể đúng theo hình minh họa của **Động tác 1, 2, 3** trên màn hình.\n• *Lưu ý*: Hãy cho phép trình duyệt truy cập WebCam và đảm bảo ánh sáng lớp học đủ sáng!',
        tabId: 'catalog',
        actionText: '👤 Thử Game Camera AI'
      },
      {
        id: 'faq_slides',
        keywords: ['luu slide', 'google drive slide', 'canva slide', 'nhung slide', 'bai giang'],
        title: 'Hướng dẫn Quản lý & Trình Chiếu Slide Bài Giảng',
        answer: 'Mục **Slide Bài Giảng** giúp thầy cô quản lý giáo án điện tử:\n1. Chọn khối lớp (Lớp 6, 7, 8, 9...).\n2. Bấm **"Thêm Slide Bài Giảng"**, dán đường dẫn link chia sẻ từ **Google Slides** hoặc **Canva**.\n3. Hệ thống sẽ tự động hiển thị trình chiếu trực tiếp trên lớp mà không cần mở tab trình duyệt khác!',
        tabId: 'lecture-slides',
        actionText: '📊 Mở Slide Bài Giảng'
      },
      {
        id: 'faq_backup',
        keywords: ['sao luu', 'backup', 'khoi phuc du lieu', 'xuat json', 'nhap json', 'luu tru'],
        title: 'Hướng dẫn Sao Lưu & Khôi Phục Dữ Liệu System',
        answer: 'Hệ thống hỗ trợ lưu trữ 3 tầng (LocalStorage + IndexedDB + Cloud Server).\n• Để chuyển dữ liệu sang máy tính khác: Vào mục **Game Của Tôi**, bấm **"📥 Xuất Sao Lưu System (JSON)"**.\n• Trên máy tính mới: Bấm **"📤 Nhập Sao Lưu (JSON)"** và chọn file JSON đã tải để khôi phục toàn bộ game và dữ liệu lớp học!',
        tabId: 'my-games',
        actionText: '📑 Đến Trang Game Của Tôi'
      }
    ];

    return { games, tools, systemFaqs };
  }, [savedGames]);

  // Execute Search & Question Answering
  const handleSearchAndAsk = (queryText) => {
    const rawQuery = (queryText || inputQuery).trim();
    if (!rawQuery) return;

    // Add User Message
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: rawQuery,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const cleanQ = removeAccents(rawQuery);

    // 1. Search Games & Tools Matching
    const matchedTools = systemIndex.tools.filter(t => {
      const titleMatch = removeAccents(t.title).includes(cleanQ);
      const descMatch = removeAccents(t.description).includes(cleanQ);
      const kwMatch = t.keywords.some(k => removeAccents(k).includes(cleanQ) || cleanQ.includes(removeAccents(k)));
      return titleMatch || descMatch || kwMatch;
    });

    const matchedGames = systemIndex.games.filter(g => {
      const gTitle = removeAccents(g.title || g.name || '');
      const gDesc = removeAccents(g.description || '');
      const gSub = removeAccents(g.subject || g.category || '');
      return gTitle.includes(cleanQ) || gDesc.includes(cleanQ) || gSub.includes(cleanQ);
    });

    // 2. Search System FAQs
    const matchedFaqs = systemIndex.systemFaqs.filter(f => {
      const titleMatch = removeAccents(f.title).includes(cleanQ);
      const ansMatch = removeAccents(f.answer).includes(cleanQ);
      const kwMatch = f.keywords.some(k => removeAccents(k).includes(cleanQ) || cleanQ.includes(removeAccents(k)));
      return titleMatch || ansMatch || kwMatch;
    });

    // Construct Bot Response
    let botText = '';
    let resultsPayload = {
      tools: matchedTools,
      games: matchedGames,
      faqs: matchedFaqs
    };

    const totalResults = matchedTools.length + matchedGames.length;

    if (matchedFaqs.length > 0) {
      const topFaq = matchedFaqs[0];
      botText = `💡 **${topFaq.title}**\n\n${topFaq.answer}`;
      if (totalResults > 0) {
        botText += `\n\n🔍 **Dưới đây là các trò chơi & công cụ tìm thấy liên quan đến từ khóa "${rawQuery}":**`;
      }
    } else if (totalResults > 0) {
      botText = `🎯 Em đã tìm thấy **${totalResults} kết quả** phù hợp với từ khóa **"${rawQuery}"**. Thầy/Cô bấm vào nút để mở ngay nhé:`;
    } else {
      botText = `🔍 Không tìm thấy nội dung nào trùng khớp hoàn toàn với **"${rawQuery}"**.\n\nThầy/Cô có thể thử tìm bằng từ khóa ngắn hơn như: *Đua vịt, Nghiêng đầu, Gọi tên, Slide, SGK, Lớp chủ nhiệm, Hướng dẫn tạo game...*`;
    }

    const botMsg = {
      id: `bot_${Date.now()}`,
      sender: 'bot',
      text: botText,
      payload: resultsPayload,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg, botMsg]);
    setInputQuery('');
  };

  const handleQuickChipClick = (keyword) => {
    handleSearchAndAsk(keyword);
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose} 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(10px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="glass-modal" 
        style={{
          width: '100%',
          maxWidth: '680px',
          height: '82vh',
          maxHeight: '720px',
          borderRadius: '24px',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          border: '1.5px solid rgba(13, 148, 136, 0.2)'
        }}
      >

        {/* 1. MODAL HEADER BAR */}
        <div style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)'
            }}>
              <Sparkles size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Trợ Lý Tìm Kiếm & Hướng Dẫn System 24/7
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Tìm kiếm nội dung trò chơi, tài liệu & giải đáp thắc mắc cách dùng hệ thống
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '10px',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. CHIP SUGGESTIONS BAR */}
        <div style={{
          padding: '10px 18px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            💡 Gợi ý nhanh:
          </span>

          {[
            '🎮 Đua vịt',
            '👤 Gọi tên học sinh',
            '👤 Game Nghiêng đầu',
            '🏃‍♂️ Bắt chước nhanh',
            '📊 Slide bài giảng',
            '📖 Tải SGK PDF',
            '🤝 Họp phụ huynh',
            '✨ Cách tạo game mới',
            '📥 Nhập danh sách Excel'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickChipClick(chip.replace(/^[^\w\sà-ỹÀ-Ỹ]+/u, '').trim())}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '16px',
                padding: '4px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* 3. CHAT MESSAGES BODY */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: '#ffffff'
        }}>
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  background: isUser ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' : '#f1f5f9',
                  color: isUser ? '#ffffff' : '#0f172a',
                  padding: '14px 18px',
                  borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  boxShadow: isUser ? '0 4px 12px rgba(13, 148, 136, 0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
                  fontSize: '0.92rem',
                  lineHeight: 1.55,
                  fontWeight: 500
                }}>
                  {/* Formatted Text Message */}
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>

                  {/* Dynamic Search Payload Cards */}
                  {msg.payload && (
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      
                      {/* Matched System Tools & Tabs */}
                      {msg.payload.tools && msg.payload.tools.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            background: '#ffffff',
                            border: '1.5px solid #0d9488',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                                {t.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {t.description}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              onClose();
                              if (t.actionType === 'create_game' && onOpenAdminCreateGame) {
                                onOpenAdminCreateGame();
                              } else if (t.tabId && onSelectTab) {
                                onSelectTab(t.tabId);
                              }
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '8px 14px',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0,
                              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)'
                            }}
                          >
                            <span>Mở Ngay</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      ))}

                      {/* Matched Games */}
                      {msg.payload.games && msg.payload.games.map((g) => (
                        <div
                          key={g.id || g.title}
                          style={{
                            background: '#ffffff',
                            border: '1.5px solid #3b82f6',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.5rem' }}>{g.icon || '🎮'}</span>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                                {g.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>
                                Môn: {g.subject || g.category || 'Giáo dục'} • {g.questions?.length || g.defaultQuestions?.length || 0} câu hỏi
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              onClose();
                              if (onPlayGame) onPlayGame(g);
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '8px 14px',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0,
                              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                            }}
                          >
                            <Play size={14} />
                            <span>Trình Chiếu</span>
                          </button>
                        </div>
                      ))}

                      {/* Matched FAQ Action Shortcut */}
                      {msg.payload.faqs && msg.payload.faqs.map((f) => (
                        <div key={f.id} style={{ marginTop: '4px' }}>
                          <button
                            onClick={() => {
                              onClose();
                              if (f.actionType === 'create_game' && onOpenAdminCreateGame) {
                                onOpenAdminCreateGame();
                              } else if (f.tabId && onSelectTab) {
                                onSelectTab(f.tabId);
                              }
                            }}
                            style={{
                              background: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '8px 16px',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>{f.actionText || 'Mở Tính Năng Này'}</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      ))}

                    </div>
                  )}
                </div>

                <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* 4. CHAT INPUT & SUBMIT BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchAndAsk();
          }}
          style={{
            padding: '14px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '16px',
            padding: '4px 14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <Search size={18} color="#0d9488" style={{ marginRight: '8px', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Nhập tên trò chơi, từ khóa hoặc câu hỏi thắc mắc hệ thống..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#0f172a',
                padding: '8px 0'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            style={{
              background: inputQuery.trim() ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' : '#cbd5e1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '12px 20px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: inputQuery.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: inputQuery.trim() ? '0 4px 12px rgba(13, 148, 136, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Tìm & Hỏi</span>
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
