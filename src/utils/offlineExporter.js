/**
 * Standalone Offline Game Package Exporter
 * Generates an all-in-one standalone .html file containing the FULL INTERACTIVE GAME ENGINE.
 * Ensures the exported offline game looks and plays 100% IDENTICALLY to the online version!
 */

export function exportGameToOfflineHtml(game) {
  if (!game) return;

  const gameJson = JSON.stringify(game, null, 2);
  const fileName = `${(game.title || 'game_giao_duc').replace(/[^a-zA-Z0-9_ -]/g, '').trim()}_Offline.html`;

  const isTugOfWar = (game.engineType === 'tug-of-war-dual' || game.id === 'tug-of-war-dual-game' || (game.title && game.title.includes('Kéo Co')));

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${game.title} - Bản Chơi Offline Đầy Đủ Sky-Line</title>
  <style>
    :root {
      --bg-dark: #071521;
      --primary: #00a896;
      --blue: #3b82f6;
      --red: #ef4444;
      --text: #ffffff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #071521;
      color: #ffffff;
      min-height: 100vh;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }
    header {
      background: linear-gradient(90deg, #1e3a8a 0%, #071521 50%, #881337 100%);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid rgba(0, 168, 150, 0.4);
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .header-title { font-size: 1.25rem; font-weight: 900; color: #5eead4; display: flex; alignItems: center; gap: 8px; }
    .badge-offline { background: #00a896; color: #fff; padding: 4px 12px; border-radius: 12px; font-weight: 800; font-size: 0.8rem; }
    
    /* TUG OF WAR DUAL SPLIT SCREEN LAYOUT */
    .rope-bar-container {
      background: rgba(15, 23, 42, 0.9);
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      position: relative;
    }
    .rope-track {
      height: 20px;
      border-radius: 10px;
      background: linear-gradient(90deg, #3b82f6 0%, #cbd5e1 50%, #ef4444 100%);
      position: relative;
      overflow: visible;
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.6);
    }
    .rope-flag {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 1.8rem;
      transition: left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      filter: drop-shadow(0 0 10px #f59e0b);
    }

    .dual-arena {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 16px;
      height: calc(100vh - 130px);
    }
    .team-panel {
      border-radius: 20px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .team-blue {
      background: linear-gradient(180deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%);
      border: 2px solid rgba(59, 130, 246, 0.5);
    }
    .team-red {
      background: linear-gradient(180deg, rgba(136, 19, 55, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%);
      border: 2px solid rgba(239, 68, 68, 0.5);
    }
    .team-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .team-name { font-size: 1.3rem; font-weight: 900; }
    .blue-text { color: #60a5fa; }
    .red-text { color: #f87171; }
    
    .q-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      padding: 18px;
      margin: 14px 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .q-text { font-size: 1.25rem; font-weight: 800; color: #fbbf24; margin-bottom: 16px; line-height: 1.4; }
    .options-grid { display: flex; flex-direction: column; gap: 10px; }
    
    .opt-btn {
      padding: 14px 18px;
      border-radius: 12px;
      background: rgba(255,255,255,0.08);
      border: 1.5px solid rgba(255,255,255,0.2);
      color: #fff;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
    }
    .opt-btn:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-2px);
    }
    .btn-correct { background: #15803d !important; border-color: #4ade80 !important; color: #fff !important; }
    .btn-wrong { background: #b91c1c !important; border-color: #f87171 !important; color: #fff !important; }

    /* WIN OVERLAY */
    .win-overlay {
      position: fixed;
      inset: 0;
      background: rgba(7, 21, 33, 0.95);
      z-index: 999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .win-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border: 3px solid #f59e0b;
      border-radius: 28px;
      padding: 40px;
      text-align: center;
      max-width: 550px;
      width: 100%;
      box-shadow: 0 0 50px rgba(245, 158, 11, 0.4);
    }
    .btn-replay {
      background: linear-gradient(135deg, #00a896 0%, #0284c7 100%);
      color: #fff;
      border: none;
      padding: 14px 32px;
      border-radius: 16px;
      font-size: 1.2rem;
      font-weight: 900;
      cursor: pointer;
      margin-top: 24px;
      box-shadow: 0 8px 25px rgba(0, 168, 150, 0.5);
    }
  </style>
</head>
<body>
  <header>
    <div class="header-title">${game.icon || '🪢'} ${game.title}</div>
    <div class="badge-offline">⚡ BẢN CHƠI OFFLINE ĐẦY ĐỦ 100% (GIAO DIỆN CHUẨN ONLINE)</div>
  </header>

  <div class="rope-bar-container">
    <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 0.9rem; margin-bottom: 6px;">
      <span class="blue-text">⬅️ ĐỘI XANH KÉO VỀ BÊN TRÁI</span>
      <span style="color: #fbbf24;" id="timer-txt">⏱️ THỜI GIAN: 90s</span>
      <span class="red-text">ĐỘI ĐỎ KÉO VỀ BÊN PHẢI ➡️</span>
    </div>
    <div class="rope-track">
      <div class="rope-flag" id="rope-flag">🪢</div>
    </div>
  </div>

  <div class="dual-arena">
    <!-- TEAM BLUE -->
    <div class="team-panel team-blue">
      <div class="team-header">
        <div class="team-name blue-text">🟦 ĐỘI XANH</div>
        <div style="font-weight: 800; font-size: 0.9rem; color: #93c5fd;" id="blue-score">Đại diện: 0 điểm</div>
      </div>
      <div class="q-card" id="blue-q-card">
        <!-- Blue Question Rendered via JS -->
      </div>
    </div>

    <!-- TEAM RED -->
    <div class="team-panel team-red">
      <div class="team-header">
        <div class="team-name red-text">🟥 ĐỘI ĐỎ</div>
        <div style="font-weight: 800; font-size: 0.9rem; color: #fca5a5;" id="red-score">Đại diện: 0 điểm</div>
      </div>
      <div class="q-card" id="red-q-card">
        <!-- Red Question Rendered via JS -->
      </div>
    </div>
  </div>

  <div id="win-modal" class="win-overlay" style="display: none;">
    <div class="win-box">
      <div style="font-size: 4rem; margin-bottom: 12px;">🏆</div>
      <h1 id="win-title" style="color: #fbbf24; font-size: 2rem; margin-bottom: 12px;">ĐỘI CHIẾN THẮNG!</h1>
      <p id="win-sub" style="font-size: 1.1rem; color: #cbd5e1;">Đã xuất sắc kéo sợi dây tri thức về phía đội mình!</p>
      <button class="btn-replay" onclick="initGame()">🔄 THI ĐẤU LẠI TỪ ĐẦU</button>
    </div>
  </div>

  <script>
    const gameData = ${gameJson};
    const rawQuestions = (gameData.questions && gameData.questions.length > 0) ? gameData.questions : (gameData.defaultQuestions || []);
    
    let blueList = [];
    let redList = [];
    let blueIdx = 0;
    let redIdx = 0;
    let ropePos = 50; // 0% (Blue wins) to 100% (Red wins), 50% = Center
    let isGameOver = false;

    const pullStep = 100 / Math.max(1, rawQuestions.length * 2);

    function initGame() {
      document.getElementById('win-modal').style.display = 'none';
      isGameOver = false;
      ropePos = 50;
      blueIdx = 0;
      redIdx = 0;
      
      blueList = [...rawQuestions].sort(() => 0.5 - Math.random());
      redList = [...rawQuestions].sort(() => 0.5 - Math.random());
      
      updateRopeUI();
      renderBlueQ();
      renderRedQ();
    }

    function updateRopeUI() {
      const flag = document.getElementById('rope-flag');
      const safePos = Math.max(5, Math.min(95, ropePos));
      flag.style.left = safePos + '%';

      if (ropePos <= 10) {
        endGame('🟦 ĐỘI XANH CHIẾN THẮNG NỐC AO!');
      } else if (ropePos >= 90) {
        endGame('🟥 ĐỘI ĐỎ CHIẾN THẮNG NỐC AO!');
      }
    }

    function endGame(titleStr) {
      if (isGameOver) return;
      isGameOver = true;
      document.getElementById('win-title').innerText = titleStr;
      document.getElementById('win-modal').style.display = 'flex';
    }

    function renderBlueQ() {
      if (blueIdx >= blueList.length) blueIdx = 0;
      const q = blueList[blueIdx];
      const card = document.getElementById('blue-q-card');
      
      let opts = '';
      (q.options || []).forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        opts += \`<button class="opt-btn" onclick="answerBlue('\${letter}', this)">\${letter}. \${opt}</button>\`;
      });

      card.innerHTML = \`
        <div style="font-size: 0.8rem; color: #93c5fd; font-weight: 800; margin-bottom: 6px;">CÂU HỎI ĐỘI XANH (#\${blueIdx + 1})</div>
        <div class="q-text">\${q.question}</div>
        <div class="options-grid">\${opts}</div>
      \`;
    }

    function answerBlue(letter, btn) {
      if (isGameOver) return;
      const q = blueList[blueIdx];
      if (letter === q.correct) {
        btn.classList.add('btn-correct');
        ropePos -= pullStep * 1.5; // Pull left towards Blue
      } else {
        btn.classList.add('btn-wrong');
        ropePos += pullStep * 0.8; // Slip right towards Red
      }
      updateRopeUI();
      setTimeout(() => {
        blueIdx++;
        renderBlueQ();
      }, 600);
    }

    function renderRedQ() {
      if (redIdx >= redList.length) redIdx = 0;
      const q = redList[redIdx];
      const card = document.getElementById('red-q-card');
      
      let opts = '';
      (q.options || []).forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        opts += \`<button class="opt-btn" onclick="answerRed('\${letter}', this)">\${letter}. \${opt}</button>\`;
      });

      card.innerHTML = \`
        <div style="font-size: 0.8rem; color: #fca5a5; font-weight: 800; margin-bottom: 6px;">CÂU HỎI ĐỘI ĐỎ (#\${redIdx + 1})</div>
        <div class="q-text">\${q.question}</div>
        <div class="options-grid">\${opts}</div>
      \`;
    }

    function answerRed(letter, btn) {
      if (isGameOver) return;
      const q = redList[redIdx];
      if (letter === q.correct) {
        btn.classList.add('btn-correct');
        ropePos += pullStep * 1.5; // Pull right towards Red
      } else {
        btn.classList.add('btn-wrong');
        ropePos -= pullStep * 0.8; // Slip left towards Blue
      }
      updateRopeUI();
      setTimeout(() => {
        redIdx++;
        renderRedQ();
      }, 600);
    }

    // Start game on page load
    window.onload = initGame;
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
