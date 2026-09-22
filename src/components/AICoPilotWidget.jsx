import React, { useState } from 'react';
import { Sparkles, X, Send, Copy, Check, MessageSquare, Bot, Key, Settings, Lightbulb } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

export function AICoPilotWidget({ activeTab, onOpenAISettings, onApplyAIGameQuestions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '👋 Xin chào Thầy/Cô! Em là **Trợ lý AI Thầy Hảo (Sky-Line AI)**. Em có thể tự động tạo câu hỏi Game, soạn Slide, viết nhận xét học sinh, tóm tắt SGK và hỗ trợ mọi môn học. Thầy/Cô cần em giúp gì ạ?'
    }
  ]);
  const [copiedId, setCopiedId] = useState(null);

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
          '🪄 Tạo 10 câu hỏi trắc nghiệm Địa lí 6 bài Trái Đất',
          '🎮 Gợi ý game giáo dục gây hứng thú học tập',
          '📝 Viết nhận xét khen thưởng học sinh'
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
      // Check if user is requesting game question generation
      if (textToSend.toLowerCase().includes('câu hỏi') || textToSend.toLowerCase().includes('tạo câu hỏi') || textToSend.toLowerCase().includes('game')) {
        try {
          const questions = await GeminiService.generateGameQuestions(textToSend, 10);
          const aiMsg = {
            id: Date.now() + 1,
            sender: 'ai',
            text: `✅ Em đã tạo xong **${questions.length} câu hỏi trắc nghiệm** theo đúng chuẩn hệ thống!`,
            gameQuestions: questions
          };
          setMessages(prev => [...prev, aiMsg]);
          setLoading(false);
          return;
        } catch (e) {
          // Fall back to general assistant response
        }
      }

      const reply = await GeminiService.askGeneralAssistant(textToSend, activeTab);
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errReply = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: `⚠️ **Lỗi kết nối AI**: ${err.message}. Thầy/Cô vui lòng bấm vào biểu tượng bánh răng ⚙️ góc trên để kiểm tra lại API Key Gemini nhé!` 
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
      {/* FLOATING ACTION TRIGGER BUTTON AT BOTTOM RIGHT */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #0284c7 100%)',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '0.92rem',
          cursor: 'pointer',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.55)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        title="Bấm để trò chuyện và tạo nội dung bằng Trợ lý AI Gemini"
      >
        <Sparkles size={22} className="pulse-icon" />
        <span>Trợ Lý AI Gemini</span>
        <span className="badge" style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 900, fontSize: '0.68rem', padding: '2px 7px', borderRadius: '10px' }}>
          PRO 2.5
        </span>
      </div>

      {/* FLOATING AI DRAWER WINDOW */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '84px',
          right: '24px',
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
                      🎯 Bộ câu hỏi AI đã sẵn sàng để nạp vào Game!
                    </div>
                    <button
                      onClick={() => {
                        onApplyAIGameQuestions(msg.gameQuestions);
                        setIsOpen(false);
                      }}
                      className="btn btn-success btn-sm"
                      style={{ width: '100%', fontWeight: 900 }}
                    >
                      🚀 Nạp Trực Tiếp Vào Game Hiện Tại
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
