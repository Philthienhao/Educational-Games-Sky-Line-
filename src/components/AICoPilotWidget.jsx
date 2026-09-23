import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Copy, Check, MessageSquare, Bot, Key, Settings, Lightbulb, GripVertical } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

export function detectGameIntent(textPrompt) {
  const lower = (textPrompt || '').toLowerCase();

  if (lower.includes('kéo co') || lower.includes('keo co') || lower.includes('tug of war')) {
    return { type: 'tug-of-war-dual', title: 'Kéo Co Kiến Thức', icon: '🪢' };
  }
  if (lower.includes('đua vịt') || lower.includes('dua vit') || lower.includes('con vịt')) {
    return { type: 'duck-race', title: 'Đua Vịt Tri Thức', icon: '🦆' };
  }
  if (lower.includes('đua rùa') || lower.includes('dua rua') || lower.includes('con rùa')) {
    return { type: 'turtle-race', title: 'Đua Rùa Tri Thức', icon: '🐢' };
  }
  if (lower.includes('nghiêng đầu') || lower.includes('nghieng dau') || lower.includes('tilt')) {
    return { type: 'head-tilt', title: 'Nghiêng Đầu Chuẩn', icon: '👤' };
  }
  if (lower.includes('triệu phú') || lower.includes('trieu phu') || lower.includes('tri thức')) {
    return { type: 'millionaire', title: 'Ai Là Triệu Phú', icon: '💰' };
  }
  if (lower.includes('mario')) {
    return { type: 'mario-race', title: 'Mario Phiêu Lưu Tri Thức', icon: '🍄' };
  }
  if (lower.includes('xây tháp') || lower.includes('tháp') || lower.includes('kiến trúc sư')) {
    return { type: 'tower-builder', title: 'Kiến Trúc Sư Tri Thức', icon: '🏗️' };
  }
  if (lower.includes('astronaut') || lower.includes('vũ trụ') || lower.includes('phi hành gia')) {
    return { type: 'astronaut-explorer', title: 'Vũ Trụ Astronaut', icon: '🚀' };
  }
  if (lower.includes('hoa quả') || lower.includes('chém') || lower.includes('bong bóng')) {
    return { type: 'fruit-ninja', title: 'Chém Hoa Quả / Bong Bóng', icon: '🍉' };
  }
  if (lower.includes('đua xe') || lower.includes('dua xe') || lower.includes('ô tô')) {
    return { type: 'car-race', title: 'Đua Xe Kiến Thức', icon: '🏎️' };
  }
  if (lower.includes('hộp quà') || lower.includes('hop qua')) {
    return { type: 'mystery-box', title: 'Hộp Quà Bí Mật', icon: '🎁' };
  }
  if (lower.includes('lật mảnh ghép') || lower.includes('bức ảnh')) {
    return { type: 'picture-reveal', title: 'Lật Mảnh Ghép Bí Mật', icon: '🖼️' };
  }
  if (lower.includes('ô chữ') || lower.includes('o chu')) {
    return { type: 'crossword', title: 'Ô Chữ Khóa Bí Mật', icon: '🧩' };
  }
  if (lower.includes('thể dục') || lower.includes('the duc') || lower.includes('nhảy theo video') || lower.includes('tập thể dục')) {
    return { type: 'indoor-pe-dance', title: 'Thể Dục Trong Nhà - AI Nhảy Theo Video', icon: '🏃‍♂️' };
  }
  if (lower.includes('tư thế') || lower.includes('bắt chước') || lower.includes('pose')) {
    return { type: 'pose-imitation', title: 'Bắt Chước Tư Thế Camera', icon: '🏃‍♂️' };
  }
  if (lower.includes('gắp thú')) {
    return { type: 'claw-machine', title: 'Gắp Thú Tri Thức', icon: '🧸' };
  }

  return { type: 'tug-of-war-dual', title: 'Kéo Co Kiến Thức', icon: '🎮' };
}

export function AICoPilotWidget({ activeTab, onOpenAISettings, onApplyAIGameQuestions, onSelectTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '👋 Xin chào Thầy/Cô! Em là **Trợ lý AI Thầy Hảo (Sky-Line AI PRO 3.6)**. Em có thể tự động đọc câu lệnh, tạo 10-50 câu hỏi trắc nghiệm và kích hoạt mở ngay Game (Kéo Co, Đua Vịt, Đua Rùa, Nghiêng Đầu...), Soạn Slide hoặc Nhận xét học sinh! Thầy/Cô hãy thử gõ câu lệnh ngay bên dưới ạ.'
    }
  ]);
  const [copiedId, setCopiedId] = useState(null);

  // Position state (Default bottom: 105px, right: 24px so it never overlaps avatar chatbot)
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem('gvd_ai_widget_pos');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { right: 24, bottom: 105 };
  });

  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startRight: 24, startBottom: 105, hasMoved: false });

  const handlePointerDown = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      isDragging: true,
      startX: clientX,
      startY: clientY,
      startRight: pos.right,
      startBottom: pos.bottom,
      hasMoved: false
    };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.hasMoved = true;
    }

    const newRight = Math.max(10, Math.min(window.innerWidth - 220, dragRef.current.startRight - dx));
    const newBottom = Math.max(10, Math.min(window.innerHeight - 80, dragRef.current.startBottom - dy));

    const newPos = { right: newRight, bottom: newBottom };
    setPos(newPos);
    try {
      localStorage.setItem('gvd_ai_widget_pos', JSON.stringify(newPos));
    } catch(err) {}
  };

  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
  };

  useEffect(() => {
    const onMove = (e) => handlePointerMove(e);
    const onUp = (e) => handlePointerUp(e);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [pos]);

  const handleBtnClick = () => {
    if (dragRef.current.hasMoved) {
      dragRef.current.hasMoved = false;
      return;
    }
    setIsOpen(!isOpen);
  };

  const getContextPrompts = () => {
    switch (activeTab) {
      case 'homeroom':
        return [
          '📝 Viết nhận xét học bạ cho học sinh khá giỏi',
          '🚨 Gợi ý biện pháp nhắc nhở học sinh hay đi muộn',
          '🎉 Ý tưởng tổ chức sinh hoạt lớp 15 phút vui tươi'
        ];
      case 'call-student':
        return [
          '🎯 5 Câu hỏi khởi động đầu giờ môn Địa Lí 6',
          '⚡ Trò chơi thử thách nhanh 3 phút nhận thưởng',
          '🎲 Gợi ý chia nhóm học tập công bằng'
        ];
      case 'parent-meeting':
        return [
          '💌 Lời tri ân phụ huynh xúc động cuối học kỳ',
          '📋 Kịch bản họp phụ huynh 45 phút ấn tượng',
          '🏷️ Lời dặn dò phối hợp học tập tại nhà'
        ];
      case 'lecture-slides':
        return [
          '📊 Soạn dàn ý Slide bài giảng Công văn 5512',
          '💡 3 Hoạt động nhóm phát huy năng lực học sinh',
          '❓ 5 Câu hỏi củng cố kiến thức cuối bài'
        ];
      case 'textbook-download':
        return [
          '📖 Tóm tắt kiến thức trọng tâm SGK Địa Lí 6',
          '❓ Tạo 10 câu hỏi trắc nghiệm theo bài học',
          '🔍 Gợi ý câu hỏi tự luận mở rộng tư duy'
        ];
      case 'geo-experiments':
      case 'virtual-lab':
        return [
          '🌍 Giải thích hiện tượng Trái Đất tự quay quanh trục',
          '🔬 Hướng dẫn các bước thí nghiệm KHTN an toàn',
          '❓ 5 Câu hỏi củng cố sau khi xem mô phỏng'
        ];
      default:
        return [
          '🪄 Tạo 20 câu hỏi trắc nghiệm và nhập vào Game Kéo Co Kiến Thức',
          '🦆 Tạo 15 câu hỏi trắc nghiệm nhập vào Game Đua Vịt',
          '👤 Tạo 10 câu hỏi nhập vào Game Nghiêng Đầu'
        ];
    }
  };

  const handleSend = async (customText) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!customText) setPrompt('');
    setLoading(true);

    try {
      const textLower = textToSend.toLowerCase();

      // 1. Detect Game creation & Auto-Launch request
      if (textLower.includes('câu hỏi') || textLower.includes('tạo') || textLower.includes('game') || textLower.includes('trắc nghiệm') || textLower.includes('bài tập')) {
        const gameIntent = detectGameIntent(textToSend);
        
        // Extract requested question count (default 10 or 20)
        const countMatch = textToSend.match(/(\d+)\s*câu/i);
        const count = countMatch ? Math.min(50, Math.max(1, parseInt(countMatch[1], 10))) : 10;

        const questions = await GeminiService.generateGameQuestions(textToSend, count);

        // Auto-apply & auto-launch game screen immediately for teacher!
        if (onApplyAIGameQuestions) {
          onApplyAIGameQuestions(questions, gameIntent.type, gameIntent.title, true);
        }

        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `🎉 **Đã tự động khởi tạo thành công ${questions.length} câu hỏi AI!**\n\n🎮 **Trò chơi chỉ định:** ${gameIntent.icon} **${gameIntent.title}**\n\nBàn chơi đã được kích hoạt trực tiếp trên màn hình! Thầy/cô có thể tùy chỉnh lại câu hỏi hoặc bấm bắt đầu cho học sinh chơi ngay lập tức.`,
          gameQuestions: questions,
          gameIntent: gameIntent
        };

        setMessages(prev => [...prev, aiMsg]);
        setLoading(false);
        setIsOpen(false); // Auto close drawer so teacher sees full game arena!
        return;
      }

      // 2. Tab Navigation Intent Handling
      if (textLower.includes('slide') || textLower.includes('bài giảng') || textLower.includes('5512')) {
        if (onSelectTab) onSelectTab('lecture-slides');
      } else if (textLower.includes('nhận xét') || textLower.includes('học bạ') || textLower.includes('chủ nhiệm')) {
        if (onSelectTab) onSelectTab('homeroom');
      } else if (textLower.includes('phụ huynh') || textLower.includes('kịch bản họp')) {
        if (onSelectTab) onSelectTab('parent-meeting');
      }

      const reply = await GeminiService.askGeneralAssistant(textToSend, activeTab);
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errReply = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: `⚡ **Trợ Lý AI Thầy Hảo**: ${err.message || 'Đã tạo xong thông tin cho Thầy/Cô!'}` 
      };
      setMessages(prev => [...prev, errReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* FLOATING ACTION TRIGGER BUTTON (DRAGGABLE & REPOSITIONABLE) */}
      <div 
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onClick={handleBtnClick}
        style={{
          position: 'fixed',
          bottom: `${pos.bottom}px`,
          right: `${pos.right}px`,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 18px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #0284c7 100%)',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '0.92rem',
          cursor: dragRef.current.isDragging ? 'grabbing' : 'grab',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.55)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          userSelect: 'none',
          touchAction: 'none',
          transition: dragRef.current.isDragging ? 'none' : 'box-shadow 0.3s ease, bottom 0.2s ease, right 0.2s ease'
        }}
        title="Bấm để trò chuyện AI | Giữ chuột kéo rê để di chuyển nút bất kỳ"
      >
        <GripVertical size={16} style={{ opacity: 0.75, cursor: 'grab' }} />
        <Sparkles size={20} className="pulse-icon" />
        <span>Trợ Lí Thầy Hảo</span>
        <span className="badge" style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 900, fontSize: '0.68rem', padding: '2px 7px', borderRadius: '10px' }}>
          PRO 3.6
        </span>
      </div>

      {/* FLOATING AI DRAWER WINDOW */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: `${Math.min(window.innerHeight - 620, Math.max(12, pos.bottom + 56))}px`,
          right: `${Math.min(window.innerWidth - 440, Math.max(12, pos.right))}px`,
          width: '420px',
          maxWidth: '90vw',
          height: '600px',
          maxHeight: '80vh',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #071521 0%, #0f172a 100%)',
          border: '2px solid #8b5cf6',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden'
        }}>
          
          {/* HEADER */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(2, 132, 199, 0.2) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={22} color="#fff" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                  Trợ Lý AI Thầy Hảo
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>
                  ⚡ Sẵn sàng tạo Game, Slide & Đề thi
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={onOpenAISettings}
                style={{ background: 'transparent', border: 'none', color: '#c4b5fd', cursor: 'pointer', padding: '4px' }}
                title="Cài đặt API Key Gemini"
              >
                <Settings size={18} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES CONTAINER */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(msg => (
              <div 
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  position: 'relative'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                {/* Game Questions Instant Load Button */}
                {msg.gameQuestions && (
                  <div style={{ marginTop: '12px', background: 'rgba(13, 148, 136, 0.25)', border: '1px solid #0d9488', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 800, color: '#5eead4', fontSize: '0.82rem', marginBottom: '8px' }}>
                      🎯 Bộ {msg.gameQuestions.length} câu hỏi AI đã sẵn sàng!
                    </div>
                    <button
                      onClick={() => {
                        const intent = msg.gameIntent || detectGameIntent(msg.text || '');
                        if (onApplyAIGameQuestions) {
                          onApplyAIGameQuestions(msg.gameQuestions, intent.type, intent.title, true);
                        }
                        setIsOpen(false);
                      }}
                      className="btn btn-success btn-sm"
                      style={{ width: '100%', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      🚀 Mở & Cho Học Sinh Chơi Ngay ({msg.gameIntent?.title || 'Game Kéo Co'})
                    </button>
                  </div>
                )}

                {/* Copy Button */}
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => handleCopyText(msg.text, msg.id)}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                    title="Sao chép nội dung"
                  >
                    {copiedId === msg.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.08)', padding: '10px 16px', borderRadius: '18px', color: '#c4b5fd', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} className="spin-icon" /> AI đang suy nghĩ và tạo nội dung...
              </div>
            )}
          </div>

          {/* QUICK PROMPTS BAR */}
          <div style={{ padding: '8px 16px', background: 'rgba(0, 0, 0, 0.3)', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lightbulb size={12} /> Gợi ý câu lệnh nhanh cho mục này:
            </div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {getContextPrompts().map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  style={{
                    whiteSpace: 'nowrap',
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#ddd6fe',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT BAR */}
          <div style={{ padding: '12px 16px', background: '#090d16', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text"
              placeholder="Nhập yêu cầu cho AI (vd: Tạo 10 câu hỏi Địa 6...)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '14px',
                background: '#0f172a',
                border: '1px solid #8b5cf6',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !prompt.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={18} />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
