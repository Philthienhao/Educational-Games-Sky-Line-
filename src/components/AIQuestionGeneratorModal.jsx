import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Layers, CheckCircle2, HelpCircle, AlertCircle } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

export function AIQuestionGeneratorModal({ isOpen, onClose, onApplyQuestions }) {
  if (!isOpen) return null;

  const [promptText, setPromptText] = useState('Địa lí 6 Bài 1 Trái Đất trong hệ Mặt Trời kết nối tri thức');
  const [questionCount, setQuestionCount] = useState(10);
  const [grade, setGrade] = useState('6');
  const [subject, setSubject] = useState('Địa Lí');
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const fullPrompt = `Môn ${subject} Lớp ${grade}: ${promptText}`;
      const results = await GeminiService.generateGameQuestions(fullPrompt, questionCount);
      setGeneratedQuestions(results);
    } catch (err) {
      setErrorMsg(err.message || 'Không thể tạo câu hỏi. Vui lòng kiểm tra lại kết nối AI!');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedQuestions && generatedQuestions.length > 0) {
      onApplyQuestions(generatedQuestions);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(7, 15, 26, 0.88)',
      backdropFilter: 'blur(12px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        borderRadius: '24px',
        padding: '28px',
        background: 'linear-gradient(135deg, #071521 0%, #0f172a 100%)',
        border: '2px solid #00a896',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #00a896 0%, #0284c7 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(0, 168, 150, 0.4)'
            }}>
              <Sparkles size={26} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                🪄 Tạo Bộ Câu Hỏi Game Tự Động Bằng AI
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#5eead4', margin: 0 }}>
                Không cần file Excel! AI Gemini sẽ tạo bộ câu hỏi trắc nghiệm tức thì
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2dd4bf', display: 'block', marginBottom: '6px' }}>
                  Môn Học:
                </label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Địa Lí">Địa Lí</option>
                  <option value="KHTN">Khoa Học Tự Nhiên (KHTN)</option>
                  <option value="Lịch Sử">Lịch Sử</option>
                  <option value="Toán">Toán</option>
                  <option value="Ngữ Văn">Ngữ Văn</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="GDCD">Giáo Dục Công Dân</option>
                  <option value="Khác">Môn Khác</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2dd4bf', display: 'block', marginBottom: '6px' }}>
                  Khối Lớp:
                </label>
                <select 
                  value={grade} 
                  onChange={(e) => setGrade(e.target.value)}
                  style={inputStyle}
                >
                  <option value="6">Lớp 6</option>
                  <option value="7">Lớp 7</option>
                  <option value="8">Lớp 8</option>
                  <option value="9">Lớp 9</option>
                  <option value="10">Lớp 10</option>
                  <option value="11">Lớp 11</option>
                  <option value="12">Lớp 12</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2dd4bf', display: 'block', marginBottom: '6px' }}>
                  Số Lượng Câu Hỏi:
                </label>
                <select 
                  value={questionCount} 
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  style={inputStyle}
                >
                  <option value={5}>5 Câu Hỏi</option>
                  <option value={10}>10 Câu Hỏi</option>
                  <option value={15}>15 Câu Hỏi</option>
                  <option value={20}>20 Câu Hỏi</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2dd4bf', display: 'block', marginBottom: '6px' }}>
                Yêu Cầu Chủ Đề / Bài Học SGK (Cụ thể):
              </label>
              <textarea 
                rows={3}
                placeholder="Ví dụ: Bài 1 Trái Đất trong hệ Mặt Trời sách Kết nối tri thức, tập trung các câu hỏi về chuyển động tự quay..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !promptText.trim()}
              style={{
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #00a896 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 6px 20px rgba(0, 168, 150, 0.45)'
              }}
            >
              {loading ? (
                <>
                  <Sparkles className="spin-icon" size={20} /> AI Gemini Đang Tự Động Biên Soạn Câu Hỏi...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> 🚀 Bắt Đầu Tạo Câu Hỏi Bằng AI ngay
                </>
              )}
            </button>

          </form>

          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 800, marginBottom: '16px' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Generated Questions Preview */}
          {generatedQuestions && (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 168, 150, 0.3)', padding: '16px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#5eead4' }}>
                  ✨ Xem trước bộ {generatedQuestions.length} câu hỏi AI vừa tạo:
                </span>

                <button
                  onClick={handleApply}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff', border: 'none', borderRadius: '12px',
                    padding: '8px 18px', fontWeight: 900, fontSize: '0.88rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <CheckCircle2 size={18} /> Nạp Ngay Vào Game Này
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                {generatedQuestions.map((q, idx) => (
                  <div key={idx} style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.88rem', marginBottom: '6px' }}>
                      Câu {idx + 1}: {q.question}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <div style={{ color: q.correctAnswer === 'A' ? '#34d399' : undefined, fontWeight: q.correctAnswer === 'A' ? 900 : 400 }}>A. {q.optionA}</div>
                      <div style={{ color: q.correctAnswer === 'B' ? '#34d399' : undefined, fontWeight: q.correctAnswer === 'B' ? 900 : 400 }}>B. {q.optionB}</div>
                      <div style={{ color: q.correctAnswer === 'C' ? '#34d399' : undefined, fontWeight: q.correctAnswer === 'C' ? 900 : 400 }}>C. {q.optionC}</div>
                      <div style={{ color: q.correctAnswer === 'D' ? '#34d399' : undefined, fontWeight: q.correctAnswer === 'D' ? 900 : 400 }}>D. {q.optionD}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '12px',
  background: '#090d16',
  border: '1.5px solid #00a896',
  color: '#ffffff',
  fontWeight: '800',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box'
};
