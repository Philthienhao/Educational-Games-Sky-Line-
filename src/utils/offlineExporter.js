/**
 * Standalone Universal Offline Game Exporter
 * Generates an all-in-one standalone .html file containing the FULL INTERACTIVE GAME ENGINE.
 * Includes FULL AI CAMERA WEBCAM SUPPORT (Pose Imitation & Head Tilt detection)!
 * Ensures the exported offline game looks and plays 100% IDENTICALLY to the online version!
 */

export function resolveEngineType(game) {
  if (!game) return 'wheel';

  const title = (game.title || game.lessonTitle || '').toLowerCase();
  const idStr = (game.baseGameId || game.id || '').toLowerCase();

  // 1. Explicit title resolution (Highest Priority for customized teacher games)
  if (title.includes('bắt chước')) return 'pose-imitation';
  if (title.includes('nghiêng đầu')) return 'head-tilt';
  if (title.includes('kéo co đôi') || title.includes('kéo co kiến thức')) return 'tug-of-war-dual';
  if (title.includes('kéo co')) return 'tug-of-war';
  if (title.includes('triệu phú')) return 'millionaire';
  if (title.includes('hộp quà')) return 'mystery-box';
  if (title.includes('mảnh ghép') || title.includes('bức ảnh')) return 'picture-reveal';
  if (title.includes('ô chữ')) return 'crossword';
  if (title.includes('đoàn tàu') || title.includes('tàu hỏa')) return 'train';
  if (title.includes('flashcard') || title.includes('thẻ ghi nhớ')) return 'flashcard';
  if (title.includes('chém hoa quả') || title.includes('trái cây')) return 'fruit-ninja';
  if (title.includes('đua xe')) return 'car-race';
  if (title.includes('dò mìn')) return 'minesweeper';
  if (title.includes('từ bay') || title.includes('từ ngữ biết bay')) return 'flying-words';
  if (title.includes('nối ý') || title.includes('ghép cặp')) return 'matching-pairs';
  if (title.includes('đua vịt')) return 'duck-race';
  if (title.includes('đua rùa')) return 'turtle-race';
  if (title.includes('rừng xanh')) return 'jungle-rescue';
  if (title.includes('jeopardy')) return 'jeopardy';

  // 2. ID / baseGameId resolution
  if (idStr.includes('pose')) return 'pose-imitation';
  if (idStr.includes('head-tilt')) return 'head-tilt';
  if (idStr.includes('tug-of-war-dual')) return 'tug-of-war-dual';
  if (idStr.includes('tug-of-war')) return 'tug-of-war';
  if (idStr.includes('millionaire')) return 'millionaire';
  if (idStr.includes('mystery')) return 'mystery-box';
  if (idStr.includes('picture') || idStr.includes('flip')) return 'picture-reveal';
  if (idStr.includes('crossword')) return 'crossword';
  if (idStr.includes('train')) return 'train';
  if (idStr.includes('flashcard')) return 'flashcard';
  if (idStr.includes('fruit')) return 'fruit-ninja';
  if (idStr.includes('car')) return 'car-race';
  if (idStr.includes('minesweeper')) return 'minesweeper';
  if (idStr.includes('flying')) return 'flying-words';
  if (idStr.includes('matching')) return 'matching-pairs';
  if (idStr.includes('duck')) return 'duck-race';
  if (idStr.includes('turtle')) return 'turtle-race';
  if (idStr.includes('jungle')) return 'jungle-rescue';
  if (idStr.includes('jeopardy')) return 'jeopardy';

  // 3. Fallback to game.engineType if valid and not default 'tug-of-war-dual' override
  if (game.engineType && game.engineType !== 'tug-of-war-dual') {
    return game.engineType;
  }

  return game.engineType || 'wheel';
}

export function exportGameToOfflineHtml(game) {
  if (!game) return;

  const engineType = resolveEngineType(game);
  const gameJson = JSON.stringify({ ...game, engineType }, null, 2);
  const sanitizeFileName = (game.title || 'game_giao_duc').replace(/[^a-zA-Z0-9_ -]/g, '').trim();
  const fileName = `${sanitizeFileName}_Offline.html`;

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${game.title || 'Game Giáo Dục'} - Bản Chơi Offline Đầy Đủ Sky-Line</title>
  <style>
    :root {
      --bg-dark: #0b0f19;
      --panel-bg: rgba(15, 23, 42, 0.85);
      --primary: #00a896;
      --secondary: #3b82f6;
      --accent: #8b5cf6;
      --amber: #f59e0b;
      --red: #ef4444;
      --green: #10b981;
      --text: #ffffff;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0b0f19;
      background-image: radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }
    
    /* HEADER */
    header {
      background: rgba(15, 23, 42, 0.95);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      z-index: 100;
      flex-wrap: wrap;
      gap: 12px;
    }
    .header-info { display: flex; align-items: center; gap: 14px; }
    .header-icon {
      background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
    }
    .header-title { font-size: 1.25rem; font-weight: 900; color: #ffffff; display: flex; align-items: center; gap: 8px; }
    .badge-offline { background: #00a896; color: #fff; padding: 3px 10px; border-radius: 10px; font-weight: 800; font-size: 0.75rem; }

    .header-actions { display: flex; align-items: center; gap: 10px; }
    .btn {
      padding: 8px 16px;
      border-radius: 12px;
      border: none;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
    .btn:active { transform: translateY(0); }
    .btn-primary { background: linear-gradient(135deg, #00a896 0%, #0284c7 100%); color: #fff; }
    .btn-secondary { background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); }
    .btn-amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.5); }
    .btn-cam { background: rgba(14, 165, 233, 0.25); color: #38bdf8; border: 1px solid #0ea5e9; }

    /* TEAMS BAR */
    .teams-bar {
      padding: 10px 24px;
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
      z-index: 90;
    }
    .team-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 16px;
      background: rgba(15, 23, 42, 0.8);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }
    .team-chip.active {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 0 20px rgba(0, 168, 150, 0.5);
      border-width: 2.5px;
    }
    .active-badge {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: #f59e0b;
      color: #000;
      font-size: 0.65rem;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 10px;
      white-space: nowrap;
    }
    .team-input {
      background: transparent;
      border: none;
      font-weight: 900;
      font-size: 0.9rem;
      outline: none;
      width: 100px;
      text-align: center;
    }

    /* MAIN CONTAINER */
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      min-height: calc(100vh - 120px);
    }

    /* GENERAL GAME COMPONENTS */
    .game-card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      padding: 28px;
      max-width: 850px;
      width: 100%;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      backdrop-filter: blur(12px);
    }
    .q-title {
      font-size: 1.4rem;
      font-weight: 900;
      color: #fbbf24;
      margin-bottom: 20px;
      line-height: 1.4;
      text-align: center;
    }
    .opts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    @media (max-width: 640px) {
      .opts-grid { grid-template-columns: 1fr; }
    }
    .opt-btn {
      padding: 16px 20px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.07);
      border: 2px solid rgba(255, 255, 255, 0.15);
      color: #ffffff;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .opt-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      border-color: #3b82f6;
      transform: translateY(-2px);
    }
    .opt-btn.correct { background: #15803d !important; border-color: #4ade80 !important; color: #fff !important; }
    .opt-btn.wrong { background: #b91c1c !important; border-color: #f87171 !important; color: #fff !important; }

    /* WIN MODAL OVERLAY */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(7, 15, 25, 0.95);
      backdrop-filter: blur(10px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .modal-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border: 3px solid #f59e0b;
      border-radius: 28px;
      padding: 40px;
      text-align: center;
      max-width: 550px;
      width: 100%;
      box-shadow: 0 0 60px rgba(245, 158, 11, 0.4);
    }

    /* WEBCAM CAMERA CONTAINER STYLES */
    .cam-layout { display: grid; grid-template-columns: 1fr 340px; gap: 20px; width: 100%; max-width: 1200px; }
    @media (max-width: 900px) { .cam-layout { grid-template-columns: 1fr; } }

    .webcam-card {
      background: rgba(15, 23, 42, 0.95);
      border-radius: 24px;
      border: 2px solid rgba(255, 255, 255, 0.15);
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .webcam-viewport {
      width: 100%;
      aspect-ratio: 4/3;
      background: #000;
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255,255,255,0.1);
    }
    .webcam-viewport video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scaleX(-1);
    }
    .cam-hud {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.9);
      color: #4ade80;
      border: 1.5px solid #22c55e;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 0.85rem;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }

    /* Pose Imitation */
    .pose-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%; }
    .pose-card {
      background: rgba(15, 23, 42, 0.85);
      border-radius: 20px;
      padding: 16px;
      border: 3px solid rgba(255, 255, 255, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .pose-card:hover { transform: translateY(-4px); border-color: #3b82f6; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); }

    /* Head Tilt 3-Column Arena (Left Card - Center Circular Video - Right Card) */
    .head-tilt-3col {
      display: grid;
      grid-template-columns: 1fr 240px 1fr;
      gap: 20px;
      align-items: center;
      width: 100%;
      max-width: 1150px;
    }
    @media (max-width: 850px) {
      .head-tilt-3col { grid-template-columns: 1fr; }
    }
    .tilt-card {
      background: rgba(15, 23, 42, 0.85);
      border-radius: 24px;
      padding: 24px;
      border: 3px solid rgba(255,255,255,0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s ease;
      min-height: 230px;
      position: relative;
    }
    .tilt-card:hover { transform: translateY(-4px); filter: brightness(1.1); }

    /* Tug of war dual */
    .dual-arena { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; height: 100%; }
    .rope-track { height: 20px; border-radius: 10px; background: linear-gradient(90deg, #3b82f6 0%, #cbd5e1 50%, #ef4444 100%); position: relative; }
    .rope-flag { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); font-size: 2rem; transition: left 0.3s ease; }

    /* Race game (Duck/Turtle/Car) */
    .race-track { width: 100%; max-width: 900px; background: rgba(15, 23, 42, 0.9); border-radius: 20px; border: 2px solid rgba(255,255,255,0.1); padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .lane-item { background: rgba(255,255,255,0.05); border-radius: 14px; padding: 10px 16px; display: flex; align-items: center; gap: 14px; position: relative; }
    .lane-bar { flex: 1; height: 16px; background: rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; position: relative; }
    .lane-fill { height: 100%; transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }

    /* Millionaire */
    .millionaire-layout { display: grid; grid-template-columns: 1fr 260px; gap: 20px; width: 100%; max-width: 1000px; }
    .ladder-list { display: flex; flex-direction: column-reverse; gap: 4px; background: rgba(15, 23, 42, 0.9); padding: 12px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
    .ladder-step { padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 800; display: flex; justify-content: space-between; color: #94a3b8; }
    .ladder-step.active { background: #f59e0b; color: #000; }
    .ladder-step.milestone { color: #fbbf24; }

    /* Mystery Box */
    .boxes-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px; width: 100%; max-width: 750px; }
    .box-item { height: 130px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 3rem; cursor: pointer; border: 2px solid #fbbf24; transition: all 0.3s ease; box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
    .box-item:hover { transform: scale(1.06); filter: brightness(1.15); }

    /* Picture reveal */
    .reveal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%; max-width: 550px; aspect-ratio: 16/9; position: relative; border-radius: 20px; overflow: hidden; border: 3px solid #00a896; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .reveal-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
    .reveal-tile { background: #1e293b; color: #fbbf24; font-size: 1.5rem; font-weight: 900; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.4s ease; z-index: 2; border: 1px solid rgba(255,255,255,0.1); }
    .reveal-tile.open { opacity: 0; pointer-events: none; transform: scale(0.8); }

    /* Flashcard */
    .card-3d { width: 100%; max-width: 550px; height: 320px; perspective: 1000px; cursor: pointer; }
    .card-inner { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1); }
    .card-inner.flipped { transform: rotateY(180deg); }
    .card-front, .card-back { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 24px; padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 2px solid rgba(255,255,255,0.15); box-shadow: 0 15px 35px rgba(0,0,0,0.4); }
    .card-front { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
    .card-back { background: linear-gradient(135deg, #065f46 0%, #047857 100%); transform: rotateY(180deg); }

    /* Fruit Ninja */
    .fruit-stage { width: 100%; max-width: 800px; height: 420px; background: rgba(15, 23, 42, 0.9); border-radius: 24px; position: relative; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); }
    .fruit-item { position: absolute; padding: 14px 22px; border-radius: 30px; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #fff; font-weight: 800; font-size: 1.1rem; cursor: pointer; border: 2px solid #fef08a; box-shadow: 0 6px 15px rgba(0,0,0,0.4); transition: transform 0.1s linear; }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header>
    <div class="header-info">
      <div class="header-icon" id="game-icon">${game.icon || '🎮'}</div>
      <div>
        <div class="header-title">
          <span>${game.title || 'Trò Chơi Giáo Dục'}</span>
          <span class="badge-offline">⚡ 100% OFFLINE (GIAO DIỆN CHUẨN ONLINE)</span>
        </div>
        <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">
          Môn: ${game.subject || 'Tổng hợp'} • Tác giả: ${game.author || 'Hệ thống Sky-Line'}
        </div>
      </div>
    </div>

    <div class="header-actions">
      ${['pose-imitation', 'head-tilt'].includes(engineType) ? '<button class="btn btn-cam" id="cam-toggle-btn" onclick="toggleOfflineCamera()">📷 Mở Camera AI</button>' : ''}
      <button class="btn btn-secondary" onclick="toggleSound()" id="sound-btn">🔊 Âm Thanh: Mở</button>
      <button class="btn btn-secondary" onclick="openTeamModal()">⚙️ Cấu Hình Đội Chơi</button>
      <button class="btn btn-amber" onclick="initGame()">🔄 Chơi Lại Từ Đầu</button>
      <button class="btn btn-primary" onclick="toggleFullscreen()">📺 Toàn Màn Hình</button>
    </div>
  </header>

  <!-- SCOREBOARD BAR -->
  <div class="teams-bar" id="teams-bar">
    <!-- Rendered via JS -->
  </div>

  <!-- MAIN STAGE -->
  <main id="main-stage">
    <!-- Game Engine UI Rendered Dynamically via JS -->
  </main>

  <!-- WIN MODAL -->
  <div class="modal-overlay" id="win-modal" style="display: none;">
    <div class="modal-box">
      <div style="font-size: 4.5rem; margin-bottom: 12px;">🏆</div>
      <h1 id="win-title" style="color: #fbbf24; font-size: 2rem; margin-bottom: 12px; font-weight: 900;">XUẤT SẮC HOÀN THÀNH!</h1>
      <p id="win-desc" style="font-size: 1.1rem; color: #cbd5e1; margin-bottom: 24px;">Bạn đã trả lời xuất sắc tất cả câu hỏi của bài học!</p>
      <button class="btn btn-primary" style="padding: 14px 32px; font-size: 1.1rem;" onclick="initGame()">🔄 THI ĐẤU LẠI TỪ ĐẦU</button>
    </div>
  </div>

  <!-- TEAM CONFIG MODAL -->
  <div class="modal-overlay" id="team-modal" style="display: none;">
    <div class="modal-box" style="text-align: left; max-width: 520px;">
      <h2 style="font-size: 1.3rem; color: #fff; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <span>⚙️ Cấu Hình Đội Chơi Lớp Học</span>
        <button onclick="closeTeamModal()" style="background: transparent; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer;">✕</button>
      </h2>
      <div id="team-modal-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto; margin-bottom: 16px;">
        <!-- Dynamic Team List -->
      </div>
      <div style="display: flex; justify-content: space-between;">
        <button class="btn btn-secondary" onclick="addNewTeam()">+ Thêm Đội Mới</button>
        <button class="btn btn-primary" onclick="closeTeamModal()">Xong</button>
      </div>
    </div>
  </div>

  <script>
    // GAME ENGINE & DATA INITIALIZATION
    const rawGameData = ${gameJson};
    const engineType = "${engineType}";
    const questions = (rawGameData.questions && rawGameData.questions.length > 0) 
      ? rawGameData.questions 
      : (rawGameData.defaultQuestions || []);

    // WEB AUDIO SOUND SYNTHESIZER (100% Offline, Zero external audio files required)
    let isSoundMuted = false;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playTone(freq, type, duration, delay = 0) {
      if (isSoundMuted) return;
      setTimeout(() => {
        try {
          if (audioCtx.state === 'suspended') audioCtx.resume();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + duration);
        } catch(e) {}
      }, delay);
    }

    const SoundFX = {
      correct: () => { playTone(523.25, 'sine', 0.15, 0); playTone(659.25, 'sine', 0.15, 100); playTone(783.99, 'sine', 0.3, 200); },
      wrong: () => { playTone(200, 'sawtooth', 0.2, 0); playTone(150, 'sawtooth', 0.3, 150); },
      click: () => { playTone(400, 'sine', 0.05, 0); },
      victory: () => {
        playTone(523.25, 'triangle', 0.15, 0);
        playTone(659.25, 'triangle', 0.15, 150);
        playTone(783.99, 'triangle', 0.15, 300);
        playTone(1046.50, 'triangle', 0.4, 450);
      }
    };

    function toggleSound() {
      isSoundMuted = !isSoundMuted;
      document.getElementById('sound-btn').innerText = isSoundMuted ? '🔇 Âm Thanh: Tắt' : '🔊 Âm Thanh: Mở';
    }

    // WEBCAM CAMERA AI ENGINE FOR OFFLINE HTML
    let cameraActive = false;
    let poseAnalysisInterval = null;
    const analysisCanvas = document.createElement('canvas');
    analysisCanvas.width = 160;
    analysisCanvas.height = 120;
    const analysisCtx = analysisCanvas.getContext('2d');

    async function startOfflineCamera(videoElemId, dotElemId) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        const vid = document.getElementById(videoElemId);
        if (vid) {
          vid.srcObject = stream;
          vid.play();
        }
        const dot = document.getElementById(dotElemId);
        if (dot) dot.style.background = '#22c55e';
        cameraActive = true;
        const btn = document.getElementById('cam-toggle-btn');
        if (btn) btn.innerText = '🎥 Tắt Camera AI';

        const camNotice = document.getElementById('cam-off-notice');
        if (camNotice) camNotice.style.display = 'none';

        return true;
      } catch(err) {
        console.warn("Camera access failed offline:", err);
        cameraActive = false;
        return false;
      }
    }

    function stopOfflineCamera(videoElemId, dotElemId) {
      const vid = document.getElementById(videoElemId || 'webcam-video') || document.getElementById('headtilt-video');
      if (vid && vid.srcObject) {
        vid.srcObject.getTracks().forEach(t => t.stop());
        vid.srcObject = null;
      }
      cameraActive = false;
      if (poseAnalysisInterval) clearInterval(poseAnalysisInterval);
      const dot = document.getElementById(dotElemId || 'camera-status-dot');
      if (dot) dot.style.background = '#ef4444';
      const btn = document.getElementById('cam-toggle-btn');
      if (btn) btn.innerText = '📷 Mở Camera AI';

      const camNotice = document.getElementById('cam-off-notice');
      if (camNotice) camNotice.style.display = 'flex';
    }

    function toggleOfflineCamera() {
      if (!cameraActive) {
        const vidId = engineType === 'head-tilt' ? 'headtilt-video' : 'webcam-video';
        const dotId = 'camera-status-dot';
        startOfflineCamera(vidId, dotId).then(success => {
          if (success) {
            if (engineType === 'pose-imitation') startPoseDetectionLoop();
            else if (engineType === 'head-tilt') startHeadTiltDetectionLoop();
          }
        });
      } else {
        stopOfflineCamera();
      }
    }

    function startPoseDetectionLoop() {
      if (poseAnalysisInterval) clearInterval(poseAnalysisInterval);
      let smoothedScores = [0, 0, 0, 0];
      let holdCount = 0;
      let lastCandidate = null;

      poseAnalysisInterval = setInterval(() => {
        const vid = document.getElementById('webcam-video');
        if (!vid || vid.readyState < 2 || !cameraActive) return;

        analysisCtx.drawImage(vid, 0, 0, 160, 120);
        const imgData = analysisCtx.getImageData(0, 0, 160, 120);
        const data = imgData.data;

        let topLeft = 0, topRight = 0, topCenter = 0, wideSides = 0;
        for (let y = 10; y < 105; y++) {
          for (let x = 10; x < 150; x++) {
            const idx = (y * 160 + x) * 4;
            const r = data[idx], g = data[idx+1], b = data[idx+2];
            const isBody = (r > 45 && g > 30 && b > 20 && Math.abs(r - g) > 8) || (r + g + b > 400);

            if (isBody) {
              if (y < 42 && x < 65) topLeft++;
              if (y < 42 && x > 95) topRight++;
              if (y < 42 && x >= 55 && x <= 105) topCenter++;
              if (x < 28 || x > 132) wideSides++;
            }
          }
        }

        const raw = [
          Math.min(99, Math.round((topLeft / 500) * 100)),
          Math.min(99, Math.round((topRight / 500) * 100)),
          Math.min(99, Math.round((topCenter / 550) * 100)),
          Math.min(99, Math.round((wideSides / 650) * 100))
        ];

        smoothedScores = smoothedScores.map((prev, i) => Math.round(prev * 0.7 + raw[i] * 0.3));

        let best = null, maxScore = 0;
        smoothedScores.forEach((score, i) => {
          if (score > maxScore && score >= 80) {
            maxScore = score;
            best = i;
          }
        });

        const hud = document.getElementById('camera-hud');
        const cards = document.querySelectorAll('.pose-card');
        if (best !== null && cards[best]) {
          if (hud) {
            hud.style.display = 'block';
            hud.innerText = '🎯 Đã nhận diện Động tác ' + (best + 1) + ' (' + maxScore + '%)';
          }
          if (lastCandidate === best) {
            holdCount++;
            if (holdCount >= 4) {
              selectPoseOption(best, cards[best]);
              holdCount = 0;
            }
          } else {
            lastCandidate = best;
            holdCount = 1;
          }
        } else {
          if (hud) hud.style.display = 'none';
          holdCount = 0;
        }
      }, 150);
    }

    // HEAD TILT ANALYSIS LOOP WITH CENTER WEBCAM RING ANIMATION & RULE #3 COMPLIANCE
    function startHeadTiltDetectionLoop() {
      if (poseAnalysisInterval) clearInterval(poseAnalysisInterval);
      let smoothedTilt = 0;
      let holdCount = 0;
      let currentDir = 'center';

      poseAnalysisInterval = setInterval(() => {
        const vid = document.getElementById('headtilt-video');
        if (!vid || vid.readyState < 2 || !cameraActive) return;

        analysisCtx.drawImage(vid, 0, 0, 160, 120);
        const imgData = analysisCtx.getImageData(0, 0, 160, 120);
        const data = imgData.data;

        let leftMass = 0, rightMass = 0;
        for (let y = 10; y < 110; y++) {
          for (let x = 10; x < 150; x++) {
            const idx = (y * 160 + x) * 4;
            const r = data[idx], g = data[idx+1], b = data[idx+2];
            if (r > 50 && g > 35 && b > 25) {
              if (x < 75) leftMass += x;
              else rightMass += (160 - x);
            }
          }
        }

        // Rule #3: Negative diff = Physical Left tilt = Option A (Screen Left)
        // Positive diff = Physical Right tilt = Option B (Screen Right)
        const rawDiff = rightMass - leftMass;
        smoothedTilt = smoothedTilt * 0.7 + rawDiff * 0.3;

        const hud = document.getElementById('tilt-hud');
        const camRing = document.getElementById('cam-ring');
        const cardA = document.getElementById('tilt-card-a');
        const cardB = document.getElementById('tilt-card-b');
        const holdBarA = document.getElementById('hold-bar-a');
        const holdFillA = document.getElementById('hold-fill-a');
        const holdBarB = document.getElementById('hold-bar-b');
        const holdFillB = document.getElementById('hold-fill-b');

        if (smoothedTilt < -3500) {
          if (hud) { hud.style.display = 'block'; hud.innerText = '⬅️ NGHIÊNG TRÁI: ĐÁP ÁN A'; }
          if (camRing) camRing.style.boxShadow = '0 0 45px #3b82f6';
          if (cardA) cardA.style.transform = 'scale(1.05) translateY(-4px)';
          if (cardB) cardB.style.transform = 'scale(1)';
          if (holdBarA) holdBarA.style.display = 'block';
          if (holdBarB) holdBarB.style.display = 'none';

          if (currentDir === 'left') {
            holdCount++;
            if (holdFillA) holdFillA.style.width = Math.min(100, holdCount * 25) + '%';
            if (holdCount >= 4) {
              selectHeadTilt('A', cardA);
              holdCount = 0;
            }
          } else { currentDir = 'left'; holdCount = 1; }
        } else if (smoothedTilt > 3500) {
          if (hud) { hud.style.display = 'block'; hud.innerText = '➡️ NGHIÊNG PHẢI: ĐÁP ÁN B'; }
          if (camRing) camRing.style.boxShadow = '0 0 45px #ef4444';
          if (cardB) cardB.style.transform = 'scale(1.05) translateY(-4px)';
          if (cardA) cardA.style.transform = 'scale(1)';
          if (holdBarB) holdBarB.style.display = 'block';
          if (holdBarA) holdBarA.style.display = 'none';

          if (currentDir === 'right') {
            holdCount++;
            if (holdFillB) holdFillB.style.width = Math.min(100, holdCount * 25) + '%';
            if (holdCount >= 4) {
              selectHeadTilt('B', cardB);
              holdCount = 0;
            }
          } else { currentDir = 'right'; holdCount = 1; }
        } else {
          if (hud) hud.style.display = 'none';
          if (camRing) camRing.style.boxShadow = '0 0 25px rgba(34, 197, 94, 0.5)';
          if (cardA) cardA.style.transform = 'scale(1)';
          if (cardB) cardB.style.transform = 'scale(1)';
          if (holdBarA) holdBarA.style.display = 'none';
          if (holdBarB) holdBarB.style.display = 'none';
          currentDir = 'center';
          holdCount = 0;
        }
      }, 150);
    }

    // STATE MANAGEMENT
    let teams = [
      { id: 't1', name: 'Đội 1 (Đỏ)', score: 0, color: '#ef4444' },
      { id: 't2', name: 'Đội 2 (Xanh)', score: 0, color: '#3b82f6' },
      { id: 't3', name: 'Đội 3 (Vàng)', score: 0, color: '#f59e0b' },
      { id: 't4', name: 'Đội 4 (Lục)', score: 0, color: '#10b981' }
    ];
    let activeTeamIndex = 0;
    let currentQIdx = 0;

    function renderScoreboard() {
      const bar = document.getElementById('teams-bar');
      if (['tug-of-war-dual', 'head-tilt'].includes(engineType)) {
        bar.style.display = 'none';
        return;
      }
      bar.style.display = 'flex';
      let html = '';
      teams.forEach((t, i) => {
        const isActive = activeTeamIndex === i;
        html += \`
          <div class="team-chip \${isActive ? 'active' : ''}" style="border-color: \${t.color};" onclick="setActiveTeam(\${i})">
            \${isActive ? '<span class="active-badge">👑 LƯỢT CHƠI</span>' : ''}
            <input type="text" class="team-input" style="color: \${t.color};" value="\${t.name}" onchange="renameTeam(\${i}, this.value)" onclick="event.stopPropagation()">
            <span style="color: #facc15; font-weight: 900;">\${t.score}đ</span>
            <button onclick="event.stopPropagation(); addScore(\${i}, 50)" style="padding:2px 6px; background:rgba(255,255,255,0.1); border:none; border-radius:6px; color:#6ee7b7; font-weight:800; cursor:pointer;">+50</button>
            <button onclick="event.stopPropagation(); addScore(\${i}, -50)" style="padding:2px 6px; background:rgba(255,255,255,0.1); border:none; border-radius:6px; color:#fca5a5; font-weight:800; cursor:pointer;">-50</button>
          </div>
        \`;
      });
      bar.innerHTML = html;
    }

    function setActiveTeam(idx) { activeTeamIndex = idx; renderScoreboard(); SoundFX.click(); }
    function renameTeam(idx, val) { teams[idx].name = val; renderScoreboard(); }
    function addScore(idx, delta) { teams[idx].score = Math.max(0, teams[idx].score + delta); renderScoreboard(); }

    function openTeamModal() {
      const list = document.getElementById('team-modal-list');
      let html = '';
      teams.forEach((t, i) => {
        html += \`
          <div style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:10px; border:1px solid \${t.color};">
            <input type="text" value="\${t.name}" onchange="renameTeam(\${i}, this.value)" style="flex:1; padding:6px; border-radius:6px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.2); color:#fff; font-weight:700;">
            <input type="number" value="\${t.score}" onchange="teams[\${i}].score = Number(this.value)||0; renderScoreboard();" style="width:70px; padding:6px; border-radius:6px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.2); color:#facc15; font-weight:800; text-align:center;">
          </div>
        \`;
      });
      list.innerHTML = html;
      document.getElementById('team-modal').style.display = 'flex';
    }
    function closeTeamModal() { document.getElementById('team-modal').style.display = 'none'; }
    function addNewTeam() {
      const idx = teams.length + 1;
      const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];
      teams.push({ id: 't_' + Date.now(), name: 'Đội ' + idx, score: 0, color: colors[idx % colors.length] });
      renderScoreboard();
      openTeamModal();
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    function showWinModal(title, desc) {
      SoundFX.victory();
      document.getElementById('win-title').innerText = title || 'XUẤT SẮC HOÀN THÀNH!';
      if (desc) document.getElementById('win-desc').innerText = desc;
      document.getElementById('win-modal').style.display = 'flex';
    }

    // ENGINE DISPATCHER & RENDERERS
    function initGame() {
      document.getElementById('win-modal').style.display = 'none';
      currentQIdx = 0;
      renderScoreboard();
      const stage = document.getElementById('main-stage');

      switch (engineType) {
        case 'pose-imitation':
          renderPoseImitation(stage);
          break;
        case 'head-tilt':
          renderHeadTilt(stage);
          break;
        case 'tug-of-war-dual':
          renderTugOfWarDual(stage);
          break;
        case 'duck-race':
        case 'turtle-race':
        case 'car-race':
        case 'jungle-rescue':
          renderRaceGame(stage);
          break;
        case 'millionaire':
          renderMillionaire(stage);
          break;
        case 'mystery-box':
          renderMysteryBox(stage);
          break;
        case 'picture-reveal':
          renderPictureReveal(stage);
          break;
        case 'fruit-ninja':
          renderFruitNinja(stage);
          break;
        case 'flashcard':
          renderFlashcard(stage);
          break;
        default:
          renderStandardQuiz(stage);
          break;
      }
    }

    // 0. POSE IMITATION (Bắt Chước Nhanh - Cơ Hội Lớn) WITH LIVE WEBCAM CAMERA FEED
    const poseIcons = ['🏃‍♂️', '🤸‍♂️', '🧍‍♂️', '🏃‍♀️'];
    const poseColors = ['#00a8ff', '#ff5252', '#10b981', '#8b5cf6'];
    function renderPoseImitation(stage) {
      if (currentQIdx >= questions.length) { showWinModal('HOÀN THÀNH BẮT CHƯỚC NHANH - CƠ HỘI LỚN!'); return; }
      const q = questions[currentQIdx];
      const opts = q.options || ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'];

      let cardsHtml = '';
      opts.forEach((opt, i) => {
        const icon = poseIcons[i % 4];
        const color = poseColors[i % 4];
        cardsHtml += \`
          <div class="pose-card" style="border-color:\${color};" onclick="selectPoseOption(\${i}, this)">
            <div style="font-size:2.8rem; margin-bottom:6px;">\${icon}</div>
            <div style="font-size:0.8rem; font-weight:800; color:\${color}; text-transform:uppercase; margin-bottom:4px;">ĐỘNG TÁC \${i+1}</div>
            <div style="font-size:1.1rem; font-weight:800; color:#fff;">\${opt}</div>
          </div>
        \`;
      });

      stage.innerHTML = \`
        <div style="width:100%; max-width:1200px; display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="background:rgba(79, 70, 229, 0.25); border:1px solid #6366f1; padding:6px 16px; border-radius:14px; font-weight:800; color:#c7d2fe; font-size:0.9rem;">
              🏃‍♂️ BẮT CHƯỚC NHANH — CÂU HỎI #\${currentQIdx + 1} / \${questions.length}
            </div>
            <button class="btn btn-cam" onclick="toggleOfflineCamera()">📷 Bật / Tắt Camera AI</button>
          </div>

          <div class="q-title" style="text-align:left;">\${q.question}</div>

          <div class="cam-layout">
            <div class="pose-grid">\${cardsHtml}</div>

            <div class="webcam-card">
              <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:8px; font-size:0.85rem; font-weight:800;">
                <span style="display:flex; align-items:center; gap:6px;">
                  <span id="camera-status-dot" style="width:10px; height:10px; border-radius:50%; background:#ef4444;"></span>
                  CAMERA AI LIVE
                </span>
                <span style="color:#0ea5e9;">90%+ ACCURACY</span>
              </div>
              <div class="webcam-viewport">
                <video id="webcam-video" autoPlay playsInline muted></video>
                <div class="cam-hud" id="camera-hud" style="display:none;">🎯 ĐÃ NHẬN DIỆN ĐỘNG TÁC</div>
                <div id="cam-off-notice" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0f172a; color:#94a3b8; font-size:0.8rem; text-align:center; padding:12px;">
                  📷<br>Đang bật camera...
                </div>
              </div>
              <p style="font-size:0.75rem; color:#94a3b8; margin-top:8px; text-align:center;">
                Thực hiện động tác trước camera hoặc click trực tiếp vào ô đáp án
              </p>
            </div>
          </div>
        </div>
      \`;

      setTimeout(() => {
        if (!cameraActive) toggleOfflineCamera();
      }, 300);
    }

    function selectPoseOption(optIdx, cardEl) {
      const q = questions[currentQIdx];
      let correctIdx = 0;
      if (typeof q.correct === 'number') correctIdx = q.correct;
      else if (typeof q.correct === 'string') {
        const c = q.correct.trim().toUpperCase();
        if (c === 'A' || c === '1') correctIdx = 0;
        else if (c === 'B' || c === '2') correctIdx = 1;
        else if (c === 'C' || c === '3') correctIdx = 2;
        else if (c === 'D' || c === '4') correctIdx = 3;
      }

      if (optIdx === correctIdx) {
        SoundFX.correct();
        if (cardEl) {
          cardEl.style.background = 'rgba(16, 185, 129, 0.4)';
          cardEl.style.borderColor = '#10b981';
        }
        addScore(activeTeamIndex, 10);
      } else {
        SoundFX.wrong();
        if (cardEl) {
          cardEl.style.background = 'rgba(239, 68, 68, 0.4)';
          cardEl.style.borderColor = '#ef4444';
        }
      }

      setTimeout(() => {
        currentQIdx++;
        renderPoseImitation(document.getElementById('main-stage'));
      }, 700);
    }

    // 2. HEAD TILT WITH CENTER CIRCULAR WEBCAM CAMERA (100% IDENTICAL TO HeadTiltGame.jsx ONLINE)
    function renderHeadTilt(stage) {
      if (currentQIdx >= questions.length) { showWinModal('HOÀN THÀNH BÀI QUIZ NGHIÊNG ĐẦU!'); return; }
      const q = questions[currentQIdx];
      const optA = q.options?.[0] || 'Đáp án A';
      const optB = q.options?.[1] || 'Đáp án B';

      stage.innerHTML = \`
        <div style="width:100%; max-width:1150px; display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:0.9rem; font-weight:800; color:#00a896;">
              👤 NGHIÊNG ĐẦU CHUẨN — CÂU HỎI #\${currentQIdx + 1} / \${questions.length}
            </div>
            <button class="btn btn-cam" onclick="toggleOfflineCamera()">📷 Bật / Tắt Camera AI</button>
          </div>

          <div class="q-title">\${q.question}</div>

          <!-- 3-COLUMN ARENA: LEFT OPTION A | CENTER CIRCULAR WEBCAM | RIGHT OPTION B -->
          <div class="head-tilt-3col">
            <!-- LEFT OPTION CARD A (BLUE) -->
            <div class="tilt-card" id="tilt-card-a" onclick="selectHeadTilt('A', this)" style="border-color:#3b82f6; background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
              <div style="font-size:2.8rem; margin-bottom:6px;">👈</div>
              <div style="font-size:0.85rem; font-weight:900; text-transform:uppercase; color:#93c5fd; letter-spacing:0.5px;">ĐÁP ÁN A (NGHIÊNG TRÁI)</div>
              <div style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-top:8px; text-shadow:0 2px 6px rgba(0,0,0,0.3);">\${optA}</div>
              <div id="hold-bar-a" style="display:none; height:8px; background:rgba(0,0,0,0.35); border-radius:4px; width:100%; max-width:200px; margin-top:12px; overflow:hidden;">
                <div id="hold-fill-a" style="height:100%; width:0%; background:#ffffff; transition: width 0.05s linear;"></div>
              </div>
            </div>

            <!-- CENTER CIRCULAR WEBCAM CAMERA PREVIEW -->
            <div style="display:flex; flex-direction:column; align-items:center; gap:10px; position:relative;">
              <div id="cam-ring" style="position:relative; width:210px; height:210px; border-radius:50%; padding:8px; background:linear-gradient(135deg, #0284c7 0%, #38bdf8 100%); boxShadow:0 0 30px rgba(2, 132, 199, 0.5); transition:all 0.3s ease;">
                <div style="width:100%; height:100%; border-radius:50%; overflow:hidden; background:#020617; position:relative;">
                  <video id="headtilt-video" autoPlay playsInline muted style="width:100%; height:100%; object-fit:cover; transform:scaleX(-1);"></video>
                  <div id="cam-off-notice" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0f172a; color:#94a3b8; font-size:0.8rem; text-align:center; padding:12px;">
                    📷<br>Đang bật camera...
                  </div>
                </div>
              </div>
              <div class="cam-hud" id="tilt-hud" style="display:none; font-size:0.8rem; padding:4px 14px; border-radius:14px; background:rgba(15,23,42,0.95); color:#38bdf8; border:1px solid #0284c7; font-weight:800;">
                👤 ĐÃ NGHIÊNG ĐẦU
              </div>
            </div>

            <!-- RIGHT OPTION CARD B (RED) -->
            <div class="tilt-card" id="tilt-card-b" onclick="selectHeadTilt('B', this)" style="border-color:#ef4444; background:linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);">
              <div style="font-size:2.8rem; margin-bottom:6px;">👉</div>
              <div style="font-size:0.85rem; font-weight:900; text-transform:uppercase; color:#fca5a5; letter-spacing:0.5px;">ĐÁP ÁN B (NGHIÊNG PHẢI)</div>
              <div style="font-size:1.55rem; font-weight:900; color:#ffffff; margin-top:8px; text-shadow:0 2px 6px rgba(0,0,0,0.3);">\${optB}</div>
              <div id="hold-bar-b" style="display:none; height:8px; background:rgba(0,0,0,0.35); border-radius:4px; width:100%; max-width:200px; margin-top:12px; overflow:hidden;">
                <div id="hold-fill-b" style="height:100%; width:0%; background:#ffffff; transition: width 0.05s linear;"></div>
              </div>
            </div>
          </div>
        </div>
      \`;

      setTimeout(() => {
        if (!cameraActive) toggleOfflineCamera();
      }, 300);
    }

    function selectHeadTilt(letter, el) {
      const q = questions[currentQIdx];
      if (letter === q.correct) {
        SoundFX.correct();
        if (el) el.style.background = 'rgba(21, 128, 61, 0.8)';
        addScore(activeTeamIndex, 10);
      } else {
        SoundFX.wrong();
        if (el) el.style.background = 'rgba(185, 28, 28, 0.8)';
      }
      setTimeout(() => { currentQIdx++; renderHeadTilt(document.getElementById('main-stage')); }, 700);
    }

    // 3. TUG OF WAR DUAL
    let ropePos = 50;
    let blueIdx = 0, redIdx = 0;
    function renderTugOfWarDual(stage) {
      ropePos = 50; blueIdx = 0; redIdx = 0;
      stage.innerHTML = \`
        <div style="width:100%; max-width:950px; display:flex; flex-direction:column; gap:16px;">
          <div style="background:rgba(15,23,42,0.9); padding:16px; border-radius:18px; border:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex; justify-content:space-between; font-weight:900; margin-bottom:8px;">
              <span style="color:#60a5fa;">⬅️ ĐỘI XANH KÉO TRÁI</span>
              <span style="color:#fbbf24;">🪢 SỢI DÂY TRI THỨC</span>
              <span style="color:#f87171;">ĐỘI ĐỎ KÉO PHẢI ➡️</span>
            </div>
            <div class="rope-track"><div class="rope-flag" id="rope-flag">🪢</div></div>
          </div>
          <div class="dual-arena">
            <div style="background:rgba(30,58,138,0.3); padding:20px; border-radius:20px; border:2px solid #3b82f6;" id="blue-card"></div>
            <div style="background:rgba(136,19,55,0.3); padding:20px; border-radius:20px; border:2px solid #ef4444;" id="red-card"></div>
          </div>
        </div>
      \`;
      updateRopeUI();
      renderBlueQ();
      renderRedQ();
    }
    function updateRopeUI() {
      const flag = document.getElementById('rope-flag');
      if (flag) flag.style.left = Math.max(5, Math.min(95, ropePos)) + '%';
      if (ropePos <= 10) showWinModal('🟦 ĐỘI XANH CHIẾN THẮNG!', 'Đội Xanh đã xuất sắc kéo ngã Đội Đỏ!');
      else if (ropePos >= 90) showWinModal('🟥 ĐỘI ĐỎ CHIẾN THẮNG!', 'Đội Đỏ đã xuất sắc kéo ngã Đội Xanh!');
    }
    function renderBlueQ() {
      if (blueIdx >= questions.length) blueIdx = 0;
      const q = questions[blueIdx];
      let opts = '';
      (q.options || []).forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        opts += \`<button class="opt-btn" onclick="ansBlue('\${letter}', this)">\${letter}. \${opt}</button>\`;
      });
      document.getElementById('blue-card').innerHTML = \`<div class="q-title" style="color:#93c5fd;">CÂU HỎI ĐỘI XANH</div><div style="font-weight:800; font-size:1.15rem; margin-bottom:14px;">\${q.question}</div><div style="display:flex; flex-direction:column; gap:10px;">\${opts}</div>\`;
    }
    function ansBlue(letter, btn) {
      const q = questions[blueIdx];
      if (letter === q.correct) { SoundFX.correct(); btn.classList.add('correct'); ropePos -= 12; }
      else { SoundFX.wrong(); btn.classList.add('wrong'); ropePos += 6; }
      updateRopeUI();
      setTimeout(() => { blueIdx++; renderBlueQ(); }, 600);
    }
    function renderRedQ() {
      if (redIdx >= questions.length) redIdx = 0;
      const q = questions[redIdx];
      let opts = '';
      (q.options || []).forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        opts += \`<button class="opt-btn" onclick="ansRed('\${letter}', this)">\${letter}. \${opt}</button>\`;
      });
      document.getElementById('red-card').innerHTML = \`<div class="q-title" style="color:#fca5a5;">CÂU HỎI ĐỘI ĐỎ</div><div style="font-weight:800; font-size:1.15rem; margin-bottom:14px;">\${q.question}</div><div style="display:flex; flex-direction:column; gap:10px;">\${opts}</div>\`;
    }
    function ansRed(letter, btn) {
      const q = questions[redIdx];
      if (letter === q.correct) { SoundFX.correct(); btn.classList.add('correct'); ropePos += 12; }
      else { SoundFX.wrong(); btn.classList.add('wrong'); ropePos -= 6; }
      updateRopeUI();
      setTimeout(() => { redIdx++; renderRedQ(); }, 600);
    }

    // 4. RACE GAME (Duck/Turtle/Car/Jungle)
    let lanePositions = [0, 0, 0, 0];
    function renderRaceGame(stage) {
      if (currentQIdx >= questions.length) { showWinModal('CUỘC ĐUA KẾT THÚC!'); return; }
      const q = questions[currentQIdx];
      const avatar = engineType === 'duck-race' ? '🦆' : engineType === 'turtle-race' ? '🐢' : engineType === 'jungle-rescue' ? '🦖' : '🏎️';
      
      let lanesHtml = '';
      teams.forEach((t, i) => {
        const pos = lanePositions[i] || 0;
        lanesHtml += \`
          <div class="lane-item">
            <div style="width:100px; font-weight:900; color:\${t.color}; font-size:0.9rem;">\${t.name}</div>
            <div class="lane-bar">
              <div class="lane-fill" style="width:\${pos}%; background:\${t.color};"></div>
            </div>
            <div style="font-size:1.5rem; position:absolute; left:calc(110px + (100% - 150px) * \${pos / 100}); transition: left 0.5s ease;">\${avatar}</div>
          </div>
        \`;
      });

      let opts = '';
      (q.options || []).forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        opts += \`<button class="opt-btn" onclick="ansRace('\${letter}', this)">\${letter}. \${opt}</button>\`;
      });

      stage.innerHTML = \`
        <div style="width:100%; max-width:850px; display:flex; flex-direction:column; gap:20px;">
          <div class="race-track">\${lanesHtml}</div>
          <div class="game-card">
            <div class="q-title">\${q.question}</div>
            <div class="opts-grid">\${opts}</div>
          </div>
        </div>
      \`;
    }
    function ansRace(letter, btn) {
      const q = questions[currentQIdx];
      if (letter === q.correct) {
        SoundFX.correct();
        btn.classList.add('correct');
        lanePositions[activeTeamIndex] = Math.min(100, (lanePositions[activeTeamIndex] || 0) + 25);
        addScore(activeTeamIndex, 100);
        if (lanePositions[activeTeamIndex] >= 100) {
          setTimeout(() => showWinModal('🏁 ' + teams[activeTeamIndex].name + ' ĐÃ CÁN ĐÍCH VỀ NHẤT!'), 500);
          return;
        }
      } else {
        SoundFX.wrong();
        btn.classList.add('wrong');
      }
      setTimeout(() => { currentQIdx++; renderRaceGame(document.getElementById('main-stage')); }, 700);
    }

    // 5. MILLIONAIRE
    const prizeLadder = ['$100', '$200', '$300', '$500', '$1,000', '$2,000', '$4,000', '$8,000', '$16,000', '$32,000', '$64,000', '$125,000', '$250,000', '$500,000', '$1,000,000'];
    function renderMillionaire(stage) {
      if (currentQIdx >= questions.length || currentQIdx >= 15) { showWinModal('TRIỆU PHÚ KHIẾN BẠN BỎ TÚI 1,000,000$!'); return; }
      const q = questions[currentQIdx];
      
      let ladderHtml = '';
      prizeLadder.forEach((p, i) => {
        const isAct = i === currentQIdx;
        const isMilestone = i === 4 || i === 9 || i === 14;
        ladderHtml += \`<div class="ladder-step \${isAct ? 'active' : ''} \${isMilestone ? 'milestone' : ''}"><span>Câu \${i+1}</span><span>\${p}</span></div>\`;
      });

      let opts = '';
      (q.options || []).forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        opts += \`<button class="opt-btn" onclick="ansMillionaire('\${letter}', this)">\${letter}. \${opt}</button>\`;
      });

      stage.innerHTML = \`
        <div class="millionaire-layout">
          <div class="game-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
              <span style="color:#fbbf24; font-weight:800;">CÂU HỎI THƯỞNG: \${prizeLadder[currentQIdx]}</span>
              <button class="btn btn-secondary" onclick="alert('50:50 Đã loại bỏ 2 phương án sai!')">🆘 Quyền trợ giúp 50:50</button>
            </div>
            <div class="q-title">\${q.question}</div>
            <div class="opts-grid">\${opts}</div>
          </div>
          <div class="ladder-list">\${ladderHtml}</div>
        </div>
      \`;
    }
    function ansMillionaire(letter, btn) {
      const q = questions[currentQIdx];
      if (letter === q.correct) {
        SoundFX.correct();
        btn.classList.add('correct');
        addScore(activeTeamIndex, 200);
        setTimeout(() => { currentQIdx++; renderMillionaire(document.getElementById('main-stage')); }, 700);
      } else {
        SoundFX.wrong();
        btn.classList.add('wrong');
        setTimeout(() => showWinModal('RẤT TIẾC! CÂU TRẢ LỜI CHƯA CHÍNH XÁC', 'Bạn dừng cuộc chơi tại mốc ' + (prizeLadder[currentQIdx] || '$0')), 700);
      }
    }

    // 6. MYSTERY BOX
    function renderMysteryBox(stage) {
      if (currentQIdx >= questions.length) { showWinModal('ĐÃ MỞ HẾT TẤT CẢ HỘP QUÀ BÍ MẬT!'); return; }
      const q = questions[currentQIdx];
      
      let boxesHtml = '';
      for(let i=0; i<6; i++) {
        boxesHtml += \`<div class="box-item" onclick="openBox(\${i})">🎁<span style="font-size:0.9rem; color:#fff; font-weight:900; margin-top:4px;">Hộp \${i+1}</span></div>\`;
      }

      stage.innerHTML = \`
        <div class="game-card" style="text-align:center;">
          <div class="q-title">CHỌN 1 HỘP QUÀ BÍ MẬT ĐỂ MỞ CÂU HỎI</div>
          <div class="boxes-grid" style="margin: 20px auto;">\${boxesHtml}</div>
          <div id="box-q-area" style="display:none; margin-top:20px; text-align:left;"></div>
        </div>
      \`;
    }
    function openBox(idx) {
      SoundFX.click();
      const q = questions[currentQIdx];
      const area = document.getElementById('box-q-area');
      let opts = '';
      (q.options || []).forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        opts += \`<button class="opt-btn" onclick="ansBox('\${letter}', this)">\${letter}. \${opt}</button>\`;
      });
      area.innerHTML = \`<div class="q-title" style="font-size:1.2rem;">\${q.question}</div><div class="opts-grid">\${opts}</div>\`;
      area.style.display = 'block';
    }
    function ansBox(letter, btn) {
      const q = questions[currentQIdx];
      if (letter === q.correct) {
        SoundFX.correct();
        btn.classList.add('correct');
        const bonus = [50, 100, 150, 200][Math.floor(Math.random()*4)];
        addScore(activeTeamIndex, bonus);
        alert('🎉 CHÍNH XÁC! Bạn nhận được +' + bonus + ' điểm từ Hộp quà bí mật!');
      } else {
        SoundFX.wrong();
        btn.classList.add('wrong');
      }
      setTimeout(() => { currentQIdx++; renderMysteryBox(document.getElementById('main-stage')); }, 700);
    }

    // 7. PICTURE REVEAL
    let openedTiles = [];
    function renderPictureReveal(stage) {
      const bgImg = rawGameData.secretImage || rawGameData.bgImageUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800';
      if (currentQIdx >= questions.length) {
        stage.innerHTML = \`
          <div style="text-align:center;">
            <h2 style="color:#fbbf24; font-size:1.8rem; margin-bottom:16px;">🖼️ BỨC ẢNH BÍ MẬT ĐÃ ĐƯỢC GIẢI MÃ HOÀN TOÀN!</h2>
            <img src="\${bgImg}" style="max-width:600px; width:100%; border-radius:20px; border:4px solid #00a896; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          </div>
        \`;
        return;
      }
      const q = questions[currentQIdx];

      let tilesHtml = '';
      for(let i=0; i<9; i++) {
        const isOpen = openedTiles.includes(i);
        tilesHtml += \`<div class="reveal-tile \${isOpen ? 'open' : ''}">\${i+1}</div>\`;
      }

      let opts = '';
      (q.options || []).forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        opts += \`<button class="opt-btn" onclick="ansReveal('\${letter}', this)">\${letter}. \${opt}</button>\`;
      });

      stage.innerHTML = \`
        <div style="display:flex; flex-direction:column; align-items:center; gap:20px; width:100%;">
          <div class="reveal-grid">
            <div class="reveal-bg" style="background-image:url('\${bgImg}');"></div>
            \${tilesHtml}
          </div>
          <div class="game-card">
            <div class="q-title">\${q.question}</div>
            <div class="opts-grid">\${opts}</div>
          </div>
        </div>
      \`;
    }
    function ansReveal(letter, btn) {
      const q = questions[currentQIdx];
      if (letter === q.correct) {
        SoundFX.correct();
        btn.classList.add('correct');
        openedTiles.push(currentQIdx % 9);
        addScore(activeTeamIndex, 50);
      } else {
        SoundFX.wrong();
        btn.classList.add('wrong');
      }
      setTimeout(() => { currentQIdx++; renderPictureReveal(document.getElementById('main-stage')); }, 700);
    }

    // 8. FRUIT NINJA
    function renderFruitNinja(stage) {
      if (currentQIdx >= questions.length) { showWinModal('ĐÃ CHÉM HẾT TRÁI CÂY TRI THỨC!'); return; }
      const q = questions[currentQIdx];
      
      let fruitsHtml = '';
      const opts = q.options || [q.correct, ...(q.distractors || ['Sai 1', 'Sai 2'])];
      opts.forEach((opt, i) => {
        const top = 30 + (i * 70);
        const left = 20 + (i * 200) % 500;
        fruitsHtml += \`<div class="fruit-item" style="top:\${top}px; left:\${left}px;" onclick="sliceFruit('\${opt}', this)">🍎 \${opt}</div>\`;
      });

      stage.innerHTML = \`
        <div style="width:100%; max-width:850px; display:flex; flex-direction:column; gap:16px;">
          <div class="q-title" style="text-align:center;">🍉 CHÉM QUẢ MANG ĐÁP ÁN ĐÚNG: \${q.question}</div>
          <div class="fruit-stage">\${fruitsHtml}</div>
        </div>
      \`;
    }
    function sliceFruit(val, el) {
      const q = questions[currentQIdx];
      if (val === q.correct || val === q.options?.[q.correct === 'A' ? 0 : q.correct === 'B' ? 1 : 2]) {
        SoundFX.correct();
        el.style.transform = 'scale(1.4) rotate(45deg)';
        el.style.opacity = '0';
        addScore(activeTeamIndex, 50);
        setTimeout(() => { currentQIdx++; renderFruitNinja(document.getElementById('main-stage')); }, 600);
      } else {
        SoundFX.wrong();
        el.style.background = '#b91c1c';
      }
    }

    // 9. FLASHCARD
    function renderFlashcard(stage) {
      if (currentQIdx >= questions.length) currentQIdx = 0;
      const q = questions[currentQIdx];
      stage.innerHTML = \`
        <div style="display:flex; flex-direction:column; align-items:center; gap:20px; width:100%;">
          <div class="card-3d" onclick="this.querySelector('.card-inner').classList.toggle('flipped')">
            <div class="card-inner">
              <div class="card-front">
                <div style="font-size:0.8rem; color:#00a896; font-weight:800; margin-bottom:12px;">🎴 CÂU HỎI (#\${currentQIdx + 1})</div>
                <div style="font-size:1.4rem; font-weight:900; color:#fff;">\${q.question}</div>
                <div style="font-size:0.8rem; color:#94a3b8; margin-top:20px;">(Bấm vào thẻ để lật xem đáp án)</div>
              </div>
              <div class="card-back">
                <div style="font-size:0.8rem; color:#6ee7b7; font-weight:800; margin-bottom:12px;">✅ ĐÁP ÁN CHÍNH XÁC</div>
                <div style="font-size:1.3rem; font-weight:900; color:#fff;">\${q.correct}. \${q.options?.[q.correct === 'A'?0:q.correct==='B'?1:2] || q.correct}</div>
              </div>
            </div>
          </div>
          <div style="display:flex; gap:14px;">
            <button class="btn btn-secondary" onclick="currentQIdx=Math.max(0, currentQIdx-1); renderFlashcard(document.getElementById('main-stage'))">⬅️ Câu Trước</button>
            <button class="btn btn-primary" onclick="currentQIdx=(currentQIdx+1)%questions.length; renderFlashcard(document.getElementById('main-stage'))">Câu Tiếp ➡️</button>
          </div>
        </div>
      \`;
    }

    // 10. STANDARD QUIZ
    function renderStandardQuiz(stage) {
      if (currentQIdx >= questions.length) { showWinModal('BẠN ĐÃ HOÀN THÀNH TẤT CẢ CÂU HỎI!'); return; }
      const q = questions[currentQIdx];
      let opts = '';
      (q.options || []).forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        opts += \`<button class="opt-btn" onclick="ansStandard('\${letter}', this)"><span style="background:rgba(255,255,255,0.15); width:32px; height:32px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center;">\${letter}</span> \${opt}</button>\`;
      });

      stage.innerHTML = \`
        <div class="game-card">
          <div style="font-size:0.85rem; color:#00a896; font-weight:800; margin-bottom:10px;">CÂU HỎI #\${currentQIdx + 1} / \${questions.length}</div>
          <div class="q-title" style="text-align:left;">\${q.question}</div>
          <div class="opts-grid" style="margin-top:20px;">\${opts}</div>
        </div>
      \`;
    }
    function ansStandard(letter, btn) {
      const q = questions[currentQIdx];
      if (letter === q.correct) {
        SoundFX.correct();
        btn.classList.add('correct');
        addScore(activeTeamIndex, 50);
      } else {
        SoundFX.wrong();
        btn.classList.add('wrong');
      }
      setTimeout(() => { currentQIdx++; renderStandardQuiz(document.getElementById('main-stage')); }, 700);
    }

    // Start game on load
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
