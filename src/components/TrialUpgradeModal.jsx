import React from 'react';
import { AlertTriangle, Lock, Sparkles, MessageCircle, Phone, X, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { SoundFX } from '../utils/sound';

export function TrialUpgradeModal({ isOpen, onClose, currentUser, featureName }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Montserrat, system-ui, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        border: '2px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '28px',
        padding: '36px 32px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 35px rgba(245, 158, 11, 0.25)',
        color: '#ffffff',
        position: 'relative',
        textAlign: 'center'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Đóng cửa sổ"
        >
          <X size={18} />
        </button>

        {/* Lock / Warning Emblem */}
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          margin: '0 auto 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}>
          <Lock size={38} color="#ffffff" />
        </div>

        {/* Status Tag */}
        <div style={{ display: 'inline-block', marginBottom: '10px' }}>
          <span style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            fontSize: '0.78rem',
            fontWeight: 800,
            padding: '4px 14px',
            borderRadius: '20px',
            letterSpacing: '0.5px'
          }}>
            🚫 ĐÃ SỬ DỤNG HẾT 1 LẦN TRẢI NGHIỆM DÙNG THỬ
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: 900,
          margin: '0 0 10px 0',
          background: 'linear-gradient(135deg, #ffffff 0%, #fde047 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Nâng Cấp Tài Khoản Không Giới Hạn
        </h3>

        {/* Message */}
        <p style={{
          fontSize: '0.92rem',
          color: '#cbd5e1',
          lineHeight: 1.6,
          margin: '0 0 20px 0',
          textAlign: 'left',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          Thầy/cô <strong style={{ color: '#38bdf8' }}>{currentUser?.name || currentUser?.email}</strong> đã hoàn thành <strong style={{ color: '#fbbf24' }}>1 lần trải nghiệm dùng thử</strong> {featureName ? `cho trò chơi "${featureName}"` : 'trên hệ thống'}.
          <br /><br />
          Vì đây là nền tảng <strong>đóng phí bản quyền</strong> dành riêng cho giáo viên, tài khoản cần được Admin duyệt <strong>"Không giới hạn"</strong> để tiếp tục sử dụng tất cả trò chơi, bài giảng và kho giáo cụ toàn trường.
        </p>

        {/* Benefits Preview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#86efac', fontWeight: 700 }}>
            <CheckCircle2 size={16} color="#22c55e" /> Không giới hạn lượt chơi
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#86efac', fontWeight: 700 }}>
            <CheckCircle2 size={16} color="#22c55e" /> Tùy biến câu hỏi bằng Excel
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#86efac', fontWeight: 700 }}>
            <CheckCircle2 size={16} color="#22c55e" /> Toàn bộ 30+ game giáo dục
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#86efac', fontWeight: 700 }}>
            <CheckCircle2 size={16} color="#22c55e" /> Hỗ trợ kỹ thuật 24/7
          </div>
        </div>

        {/* Call to Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a
            href="https://zalo.me/0387806954"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => SoundFX.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px 20px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageCircle size={22} />
            <span>NHẮN ZALO ADMIN THẦY HẢO ĐỊA LÍ: 0387806954</span>
            <ExternalLink size={16} />
          </a>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <a
              href="tel:0387806954"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fde047',
                fontWeight: 800,
                fontSize: '0.88rem',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <Phone size={16} /> Hotline: 0387806954
            </a>

            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                fontWeight: 700,
                fontSize: '0.88rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}
            >
              Để Sau
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
