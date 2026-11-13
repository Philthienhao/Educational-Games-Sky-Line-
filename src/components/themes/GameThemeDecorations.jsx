import React, { useEffect, useRef } from 'react';

/**
 * GameThemeDecorations
 * Render hiệu ứng không khí lễ hội (Tuyết rơi cho Noel, Cánh hoa mai/đào cho Tết)
 * Tuân thủ Rule 16: Điều tiết 30fps, 1 vòng lặp RAF duy nhất, cleanup tuyệt đối khi unmount, pointer-events: none.
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
    const FRAME_INTERVAL = 1000 / 30; // Giới hạn 30fps chống nghẽn CPU

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Khởi tạo danh sách hạt (Tuyết hoặc Cánh hoa)
    const particleCount = theme === 'noel' ? 35 : 28;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: theme === 'noel' ? Math.random() * 3 + 1.5 : Math.random() * 5 + 4,
        speedY: theme === 'noel' ? Math.random() * 1.2 + 0.6 : Math.random() * 1.4 + 0.8,
        speedX: Math.random() * 0.8 - 0.4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.5 + 0.4,
        // Dành cho Tết: phân loại hoa mai (vàng) hoặc hoa đào (hồng)
        colorType: Math.random() > 0.4 ? 'mai' : 'dao'
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

          // Vòng lặp khi rơi qua mép dưới màn hình
          if (p.y > canvas.height + 10) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.x > canvas.width + 10) p.x = -10;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);

          if (theme === 'noel') {
            // Vẽ bông tuyết trắng tròn mềm mại
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();
          } else {
            // Vẽ cánh hoa mai (vàng rực) hoặc hoa đào (hồng thắm)
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
            if (p.colorType === 'mai') {
              ctx.fillStyle = `rgba(250, 204, 21, ${p.opacity})`; // Vàng hoa mai
            } else {
              ctx.fillStyle = `rgba(244, 114, 182, ${p.opacity})`; // Hồng hoa đào
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
      {/* Canvas rơi hạt lơ lửng */}
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

      {/* Trang trí góc màn hình cho Noel */}
      {theme === 'noel' && (
        <>
          {/* Cành thông & Chuông vàng góc trên bên trái */}
          <div
            style={{
              position: 'fixed',
              top: '6px',
              left: '8px',
              pointerEvents: 'none',
              zIndex: 9999999,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
            }}
          >
            <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>🎄</span>
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🔔</span>
            <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>🧦</span>
          </div>

          {/* Người tuyết & Mũ Noel góc trên bên phải */}
          <div
            style={{
              position: 'fixed',
              top: '6px',
              right: '180px',
              pointerEvents: 'none',
              zIndex: 9999999,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
            }}
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🎅</span>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>⛄</span>
            <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>❄️</span>
          </div>
        </>
      )}

      {/* Trang trí góc màn hình cho Tết Cổ Truyền Việt Nam */}
      {theme === 'tet' && (
        <>
          {/* Đèn lồng đỏ & Cành đào bên trái */}
          <div
            style={{
              position: 'fixed',
              top: '6px',
              left: '8px',
              pointerEvents: 'none',
              zIndex: 9999999,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
            }}
          >
            <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>🏮</span>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🌸</span>
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🧧</span>
          </div>

          {/* Đèn lồng đỏ & Cành mai bên phải */}
          <div
            style={{
              position: 'fixed',
              top: '6px',
              right: '180px',
              pointerEvents: 'none',
              zIndex: 9999999,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
            }}
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🌼</span>
            <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>🏮</span>
            <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>🎋</span>
          </div>
        </>
      )}
    </>
  );
}

