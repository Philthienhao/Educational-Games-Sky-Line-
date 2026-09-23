import React, { useState } from 'react';
import { X, Sparkles, Key, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

export function AISettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = () => {
    GeminiService.saveApiKey(apiKey);
    setTestStatus('success');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleTestKey = async () => {
    if (!apiKey || apiKey.trim().length < 15) {
      setTestStatus('error');
      setErrorMsg('API Key không hợp lệ hoặc quá ngắn. Vui lòng kiểm tra lại (Key chuẩn bắt đầu bằng AIzaSy...).');
      return;
    }

    setTestStatus('testing');
    setErrorMsg('');
    try {
      const result = await GeminiService.testApiKey(apiKey);
      if (result.success) {
        GeminiService.saveApiKey(apiKey);
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setErrorMsg(result.error || 'Không thể kết nối Gemini API. Vui lòng kiểm tra lại mã Key!');
      }
    } catch (e) {
      setTestStatus('error');
      setErrorMsg(e.message || 'Không thể kết nối Gemini API. Vui lòng kiểm tra lại mã Key!');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(7, 15, 26, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        borderRadius: '24px',
        padding: '28px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        border: '2px solid #8b5cf6',
        boxShadow: '0 20px 50px rgba(139, 92, 246, 0.4)',
        color: '#ffffff'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)'
            }}>
              <Sparkles size={24} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                Cài Đặt Gemini AI Co-Pilot
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#c4b5fd', margin: 0 }}>
                Cấu hình API Key để kích hoạt Trợ lý AI toàn năng trên hệ thống
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Info Banner */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          padding: '14px', borderRadius: '14px', marginBottom: '20px',
          fontSize: '0.86rem', color: '#ddd6fe', lineHeight: 1.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>
            <ShieldCheck size={18} /> Bảo Mật 100% Trên Máy Cá Nhân
          </div>
          API Key của thầy/cô được lưu trực tiếp trên trình duyệt của máy tính này, không bị gửi lên máy chủ trung gian. Thầy/cô có thể tạo Gemini API Key miễn phí tại Google AI Studio.
        </div>

        {/* Input Form */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Key size={16} /> Nhập Google Gemini API Key:
          </label>

          <input 
            type="password"
            placeholder="Dán mã AIzaSy... vào đây"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#090d16',
              border: '1.5px solid #8b5cf6',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 800,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textDecoration: 'underline' }}
            >
              🔗 Bấm vào đây để lấy Gemini API Key miễn phí từ Google ↗
            </a>

            <button
              type="button"
              onClick={handleTestKey}
              disabled={!apiKey || testStatus === 'testing'}
              style={{
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {testStatus === 'testing' ? '⏳ Đang thử kết nối...' : '⚡ Kiểm Tra Kết Nối'}
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {testStatus === 'success' && (
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#6ee7b7', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> Kết nối Gemini AI thành công! Trợ lý AI đã sẵn sàng phục vụ.
          </div>
        )}

        {testStatus === 'error' && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '20px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: '12px', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', fontWeight: 700, cursor: 'pointer'
            }}
          >
            Đóng
          </button>
          <button 
            onClick={handleSave}
            style={{
              padding: '10px 24px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              color: '#ffffff', border: 'none', fontWeight: 900, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.45)'
            }}
          >
            💾 Lưu API Key & Sử Dụng
          </button>
        </div>

      </div>
    </div>
  );
}
