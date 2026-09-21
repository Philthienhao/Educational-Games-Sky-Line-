import React, { useState } from 'react';
import { Search, Sparkles, X, MessageSquare } from 'lucide-react';

export function FloatingAiAssistantWidget({ onOpenSearchModal }) {
  const [isOpen, setIsOpen] = useState(true); // Default open/expanded for immediate visibility

  const handleOpenZalo = () => {
    window.open('https://zalo.me/0387806954', '_blank', 'noopener,noreferrer');
  };

  const handleOpenFacebook = () => {
    window.open('https://www.facebook.com/phil.thienhao', '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9990,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
        fontFamily: "'Montserrat', sans-serif"
      }}
    >
      {/* Inline Animation Style Keyframes */}
      <style>{`
        @keyframes assistantAvatarFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-7px) scale(1.03); }
        }
        @keyframes assistantPulseRing {
          0% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.5), 0 8px 25px rgba(0,0,0,0.25); }
          70% { box-shadow: 0 0 0 14px rgba(13, 148, 136, 0), 0 8px 25px rgba(0,0,0,0.25); }
          100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0), 0 8px 25px rgba(0,0,0,0.25); }
        }
        @keyframes actionPopIn {
          from { opacity: 0; transform: translateY(12px) scale(0.85); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* STACKED 3 ACTION ITEMS (POPPED UP ABOVE AVATAR) */}
      {isOpen && (
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '10px',
            marginBottom: '4px'
          }}
        >
          {/* MỤC 3: FACEBOOK */}
          <div 
            onClick={handleOpenFacebook}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              animation: 'actionPopIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            className="group"
          >
            {/* Hover Tooltip Label */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.92)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)'
            }}>
              📘 Facebook Thầy Hảo
            </div>

            {/* Circular Button */}
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1877f2 0%, #0b5ed7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(24, 119, 242, 0.45)',
              border: '2px solid #ffffff',
              transition: 'transform 0.2s ease'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
          </div>

          {/* MỤC 2: ZALO */}
          <div 
            onClick={handleOpenZalo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              animation: 'actionPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Hover Tooltip Label */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.92)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              border: '1px solid rgba(2, 132, 199, 0.4)',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)'
            }}>
              💬 Zalo Hỗ Trợ (0387806954)
            </div>

            {/* Circular Button */}
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0068ff 0%, #0052cc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(0, 104, 255, 0.45)',
              border: '2px solid #ffffff'
            }}>
              <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#ffffff', letterSpacing: '-0.5px' }}>Zalo</span>
            </div>
          </div>

          {/* MỤC 1: TÌM KIẾM MỌI THÔNG TIN HỆ THỐNG */}
          <div 
            onClick={onOpenSearchModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              animation: 'actionPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Hover Tooltip Label */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.92)',
              color: '#fde047',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 900,
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)'
            }}>
              🔍 Tìm Kiếm Mọi Thông Tin System 24/7
            </div>

            {/* Circular Button */}
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(245, 158, 11, 0.5)',
              border: '2px solid #ffffff'
            }}>
              <Search size={22} color="#ffffff" />
            </div>
          </div>
        </div>
      )}

      {/* MAIN FLOATING CHATBOT AVATAR BUTTON (NO TEXT LABEL) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        title="Bấm để mở/đóng Trợ Lý Chatbot & Liên Hệ"
        style={{
          position: 'relative',
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
          padding: '3px',
          cursor: 'pointer',
          animation: 'assistantAvatarFloat 3.5s ease-in-out infinite, assistantPulseRing 3s infinite',
          transition: 'transform 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none'
        }}
      >
        {/* Avatar Image Cropped Container */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src="/assets/thayhao_assistant_avatar.png" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/thayhaodiali.jpg';
            }}
            alt="Chatbot Trợ Lý Thầy Hảo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center'
            }}
          />
        </div>

        {/* Small Active Green Status Indicator */}
        <div style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#10b981',
          border: '2.5px solid #ffffff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }} />

        {/* Small Toggle Icon Badge at Bottom Right */}
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          right: '-2px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: isOpen ? '#ef4444' : '#0d9488',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          transition: 'background 0.2s'
        }}>
          {isOpen ? <X size={14} /> : <Sparkles size={13} color="#fde047" />}
        </div>
      </div>

    </div>
  );
}
