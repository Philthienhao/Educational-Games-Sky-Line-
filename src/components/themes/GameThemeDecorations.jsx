import React, { useEffect, useRef } from 'react';

/**
 * GameThemeDecorations
 * Render không gian và template lễ hội trọn vẹn:
 * - Chủ đề Noel: Rơi tuyết, vòng hoa thông, chuông vàng, nơ đỏ, người tuyết, tuần lộc, bờ tuyết trắng.
 * - Chủ đề Tết Cổ Truyền: Mưa cánh hoa mai & hoa đào, đèn lồng đỏ treo đung đưa, tràng pháo, bánh chưng, thỏi vàng, câu đối xuân.
 * Tuân thủ Rule 16: Điều tiết 30fps, 1 vòng lặp RAF duy nhất, cleanup tuyệt đối khi unmount, pointer-events: none 100%.
 */
export function GameThemeDecorations({ theme = 'default' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (theme !== 'noel' && theme !== 'tet') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let isRunning = true;
    let lastTime = performance.now();
    const FRAME_INTERVAL = 1000 / 30; // 30fps cố định để CPU tab luôn ~0%

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Khởi tạo danh sách hạt hiệu ứng
    const particleCount = theme === 'noel' ? 36 : 30;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: theme === 'noel' ? Math.random() * 3 + 1.5 : Math.random() * 5 + 4,
        speedY: theme === 'noel' ? Math.random() * 1.2 + 0.6 : Math.random() * 1.3 + 0.7,
        speedX: Math.random() * 0.8 - 0.4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.55 + 0.35,
        colorType: Math.random() > 0.45 ? 'mai' : 'dao'
      });
    }

    const renderLoop = (time) => {
      if (!isRunning) return;

      const delta = time - lastTime;
      if (delta >= FRAME_INTERVAL) {
        lastTime = time - (delta % FRAME_INTERVAL);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotSpeed;

          if (p.y > canvas.height + 12) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.x > canvas.width + 10) p.x = -10;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);

          if (theme === 'noel') {
            // Hạt tuyết tròn phát sáng nhẹ
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();
          } else {
            // Cánh hoa mai (vàng) hoặc cánh hoa đào (hồng)
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.62, 0, 0, Math.PI * 2);
            if (p.colorType === 'mai') {
              ctx.fillStyle = `rgba(250, 204, 21, ${p.opacity})`;
            } else {
              ctx.fillStyle = `rgba(244, 114, 182, ${p.opacity})`;
            }
            ctx.fill();
          }

          ctx.restore();
        });
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
    };
  }, [theme]);

  if (theme !== 'noel' && theme !== 'tet') return null;

  return (
    <>
      {/* 1. Canvas hạt rơi tự do (30fps) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999998
        }}
      />

      {/* 2. KHÔNG GIAN LỄ HỘI: GIÁNG SINH & NOEL */}
      {theme === 'noel' && (
        <div style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 9999999 }}>
          {/* Dải dây thông & ruy băng Noel uốn lượn mép trên */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '42px',
            background: 'linear-gradient(180deg, rgba(6, 78, 59, 0.95) 0%, rgba(6, 78, 59, 0.4) 75%, transparent 100%)',
            borderBottom: '2px dashed rgba(239, 68, 68, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px'
          }}>
            {/* Chùm quả chuông & dây thông góc trái */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}>
              <span style={{ fontSize: '1.7rem', lineHeight: 1 }}>🎄</span>
              <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>🔔</span>
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🎀</span>
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🦯</span>
            </div>

            {/* Băng rôn chào mừng Giáng sinh ở giữa */}
            <div style={{
              background: 'linear-gradient(90deg, #dc2626 0%, #166534 50%, #dc2626 100%)',
              color: '#ffffff',
              padding: '3px 18px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 900,
              letterSpacing: '0.04em',
              border: '1.5px solid #facc15',
              boxShadow: '0 3px 12px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>⭐</span>
              <span>MÙA GIÁNG SINH AN LÀNH • NOEL RỘN RÃ</span>
              <span>🎁</span>
            </div>

            {/* Ông già Noel & Người tuyết góc phải */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))', marginRight: '140px' }}>
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🧦</span>
              <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>⛄</span>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🎅</span>
            </div>
          </div>

          {/* Góc dưới bên trái: Hộp quà & Người tuyết trang trí */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
          }}>
            <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>⛄</span>
            <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>🎁</span>
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🧦</span>
          </div>

          {/* Góc dưới bên phải: Tuần lộc & Xe trượt tuyết */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
          }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🌲</span>
            <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>🛷</span>
            <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>🦌</span>
          </div>

          {/* Dải tuyết trắng bồng bềnh dưới đáy màn hình */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '14px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.4) 60%, rgba(255, 255, 255, 0.85) 100%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.5)'
          }} />
        </div>
      )}

      {/* 3. KHÔNG GIAN LỄ HỘI: TẾT CỔ TRUYỀN VIỆT NAM */}
      {theme === 'tet' && (
        <div style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 9999999 }}>
          {/* Cổng vòm lụa đỏ hoàng gia Tết trên đỉnh màn hình */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '44px',
            background: 'linear-gradient(180deg, rgba(153, 27, 27, 0.95) 0%, rgba(127, 29, 29, 0.45) 80%, transparent 100%)',
            borderBottom: '2.5px solid #eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px'
          }}>
            {/* Đèn lồng đỏ & Cành đào bên trái */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}>
              <span style={{ fontSize: '1.9rem', lineHeight: 1 }}>🏮</span>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🌸</span>
              <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>🧧</span>
            </div>

            {/* Câu đối đỏ & Dải băng rôn Tết ở giữa */}
            <div style={{
              background: 'linear-gradient(90deg, #991b1b 0%, #b91c1c 50%, #991b1b 100%)',
              color: '#fef08a',
              padding: '3px 20px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 900,
              letterSpacing: '0.05em',
              border: '1.5px solid #facc15',
              boxShadow: '0 3px 14px rgba(234, 179, 8, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🌸</span>
              <span>CUNG CHÚC TÂN XUÂN • VẠN SỰ NHƯ Ý • TẾT SUM VẦY</span>
              <span>🧧</span>
            </div>

            {/* Đèn lồng đỏ & Cành mai bên phải */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))', marginRight: '140px' }}>
              <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>🧨</span>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🌼</span>
              <span style={{ fontSize: '1.9rem', lineHeight: 1 }}>🏮</span>
            </div>
          </div>

          {/* Góc dưới bên trái: Bánh chưng, dưa hấu đỏ & Bao lì xì */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
          }}>
            <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>🍘</span>
            <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>🍉</span>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🧧</span>
          </div>

          {/* Góc dưới bên phải: Thỏi vàng, pháo hoa & Cành mai phú quý */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
          }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🎋</span>
            <span style={{ fontSize: '2.0rem', lineHeight: 1 }}>🧨</span>
            <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>🪙</span>
            <span style={{ fontSize: '2.0rem', lineHeight: 1 }}>🌼</span>
          </div>

          {/* Dải mây lượn hoàng gia vàng son dưới đáy màn hình */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '14px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(234, 179, 8, 0.35) 60%, rgba(185, 28, 28, 0.85) 100%)',
            borderTop: '1px solid #eab308'
          }} />
        </div>
      )}
    </>
  );
}
