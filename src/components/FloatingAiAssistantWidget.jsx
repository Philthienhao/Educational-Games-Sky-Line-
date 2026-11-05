import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, MessageCircle } from 'lucide-react';

export function FloatingAiAssistantWidget({ onOpenSearchModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  // Auto-close popup when clicking outside or after 8s of inactivity
  useEffect(() => {
    let timer = null;
    if (isOpen) {
      timer = setTimeout(() => {
        setIsOpen(false);
      }, 8000);
    }

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenZalo = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    window.open('https://zalo.me/0387806954', '_blank', 'noopener,noreferrer');
  };

  const handleOpenFacebook = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    window.open('https://www.facebook.com/phil.thienhao', '_blank', 'noopener,noreferrer');
  };

  const handleTriggerSearch = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onOpenSearchModal) {
      onOpenSearchModal();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="floating-thayhao-bubble-container"
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
      {/* Zero Idle Resource Animations: One-shot popIn only for opening menu */}
      <style>{`
        @keyframes actionPopIn {
          from { opacity: 0; transform: translateY(12px) scale(0.85); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 768px) {
          .floating-thayhao-bubble-container {
            bottom: 84px !important;
            right: 16px !important;
          }
        }
      `}</style>

      {/* STACKED 3 ACTION ITEMS (POPS UP ON CLICK) */}
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
          {/* MỤC 3: FACEBOOK THẦY HẢO */}
          <div 
            onClick={handleOpenFacebook}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              animation: 'actionPopIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transition: 'transform 0.18s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#ffffff',
              padding: '7px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              border: '1.5px solid rgba(59, 130, 246, 0.5)',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)'
            }}>
              📘 Facebook Thầy Hảo
            </div>

            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1877f2 0%, #0b5ed7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(24, 119, 242, 0.45)',
              border: '2px solid #ffffff'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
          </div>

          {/* MỤC 2: ZALO THẦY HẢO */}
          <div 
            onClick={handleOpenZalo}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              animation: 'actionPopIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transition: 'transform 0.18s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#ffffff',
              padding: '7px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              border: '1.5px solid rgba(2, 132, 199, 0.5)',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)'
            }}>
              💬 Zalo Thầy Hảo (0387806954)
            </div>

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

          {/* MỤC 1: TRỢ LÝ AI & TÌM KIẾM 24/7 */}
          <div 
            onClick={handleTriggerSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              animation: 'actionPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transition: 'transform 0.18s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#fde047',
              padding: '7px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 900,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              border: '1.5px solid rgba(245, 158, 11, 0.6)',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)'
            }}>
              🔍 Trợ Lý AI & Tìm Kiếm 24/7
            </div>

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

      {/* MAIN BONG BÓNG CHAT THẦY HẢO ĐỊA LÍ */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={isOpen ? 'Bấm để đóng menu liên hệ' : 'Bong bóng chat Thầy Hảo Địa Lí - Bấm để chat Zalo, Facebook hoặc Trợ lý 24/7'}
        style={{
          position: 'relative',
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
          padding: '3px',
          cursor: 'pointer',
          boxShadow: isHovered 
            ? '0 12px 28px rgba(13, 148, 136, 0.5), 0 6px 16px rgba(0,0,0,0.25)' 
            : '0 8px 24px rgba(13, 148, 136, 0.35), 0 4px 12px rgba(0,0,0,0.18)',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease',
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
            src="/assets/thayhaodiali.jpg" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/thayhao_assistant_avatar.png';
            }}
            alt="Thầy Hảo Địa Lí"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center'
            }}
          />
        </div>

        {/* Small Active Green Status Indicator */}
        <div 
          title="Đang trực tuyến 24/7"
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#10b981',
            border: '2.5px solid #ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }} 
        />

        {/* Small Toggle Icon Badge at Bottom Right */}
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          right: '-2px',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: isOpen ? '#ef4444' : '#0d9488',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          transition: 'background 0.2s, transform 0.2s',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
        }}>
          {isOpen ? <X size={15} /> : <MessageCircle size={14} color="#ffffff" />}
        </div>
      </div>
    </div>
  );
}
