import React, { useState, useEffect, useRef } from 'react';
import { Shield, Key, Volume2, VolumeX, Maximize, ArrowLeft, Heart, X, Check, Award, Sparkles, Lock, Play, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import { isOptionValidForQuestion } from '../../utils/universalParser';

// Import all 20 dinosaur monster images with real filenames
import imgAllosaur from '/public/quaivat/Allosaur.png?url';
import imgAnkylo from '/public/quaivat/Ankylo.png?url';
import imgBaryonyx from '/public/quaivat/Baryonyx.png?url';
import imgBrachio from '/public/quaivat/Brachio.png?url';
import imgCarnotaur from '/public/quaivat/Carnotaur.png?url';
import imgDilopho from '/public/quaivat/Dilopho.png?url';
import imgDimorph from '/public/quaivat/Dimorph.png?url';
import imgGiga from '/public/quaivat/Giga.png?url';
import imgIndominus from '/public/quaivat/Indominus.png?url';
import imgIndoraptor from '/public/quaivat/Indoraptor.png?url';
import imgMosa from '/public/quaivat/Mosa.png?url';
import imgPachy from '/public/quaivat/Pachy.png?url';
import imgParasaur from '/public/quaivat/Parasaur.png?url';
import imgPlesiosaur from '/public/quaivat/Plesiosaur.png?url';
import imgPteranodon from '/public/quaivat/Pteranodon.png?url';
import imgRaptor from '/public/quaivat/Raptor.png?url';
import imgSpino from '/public/quaivat/Spino.png?url';
import imgStegosaur from '/public/quaivat/Stegosaur.png?url';
import imgTRex from '/public/quaivat/T-Rex.png?url';
import imgTriceratops from '/public/quaivat/Triceratops.png?url';

const DINOSAURS = [
  { name: 'Allosaurus', full: 'Khủng Long Allosaurus', img: imgAllosaur },
  { name: 'Ankylosaurus', full: 'Khủng Long Ankylosaurus', img: imgAnkylo },
  { name: 'Baryonyx', full: 'Khủng Long Baryonyx', img: imgBaryonyx },
  { name: 'Brachiosaurus', full: 'Khủng Long Brachiosaurus', img: imgBrachio },
  { name: 'Carnotaurus', full: 'Khủng Long Carnotaurus', img: imgCarnotaur },
  { name: 'Dilophosaurus', full: 'Khủng Long Dilophosaurus', img: imgDilopho },
  { name: 'Dimorphodon', full: 'Khủng Long Dimorphodon', img: imgDimorph },
  { name: 'Giganotosaurus', full: 'Khủng Long Giganotosaurus', img: imgGiga },
  { name: 'Indominus Rex', full: 'Khủng Long Indominus Rex', img: imgIndominus },
  { name: 'Indoraptor', full: 'Khủng Long Indoraptor', img: imgIndoraptor },
  { name: 'Mosasaurus', full: 'Khủng Long Mosasaurus', img: imgMosa },
  { name: 'Pachycephalo', full: 'Khủng Long Pachycephalosaurus', img: imgPachy },
  { name: 'Parasaurolophus', full: 'Khủng Long Parasaurolophus', img: imgParasaur },
  { name: 'Plesiosaurus', full: 'Khủng Long Plesiosaurus', img: imgPlesiosaur },
  { name: 'Pteranodon', full: 'Khủng Long Pteranodon', img: imgPteranodon },
  { name: 'Velociraptor', full: 'Khủng Long Velociraptor', img: imgRaptor },
  { name: 'Spinosaurus', full: 'Khủng Long Spinosaurus', img: imgSpino },
  { name: 'Stegosaurus', full: 'Khủng Long Stegosaurus', img: imgStegosaur },
  { name: 'T-Rex', full: 'Khủng Long Tyrannosaurus Rex', img: imgTRex },
  { name: 'Triceratops', full: 'Khủng Long Triceratops', img: imgTriceratops }
];

const DEFAULT_SAMPLE_QUESTIONS = [
  { id: 'jq1', question: 'Thủ đô của Việt Nam là thành phố nào?', options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Huế'], correct: 'A', type: 'abcd' },
  { id: 'jq2', question: 'Trái Đất quay quanh Mặt Trời, đúng hay sai?', options: ['Đúng', 'Sai', 'Không xác định', 'Cả hai sai'], correct: 'A', type: 'abcd' },
  { id: 'jq3', question: 'Tính kết quả phép tính: 2 + 2 × 3 = ?', options: ['8', '12', '10', '16'], correct: 'A', type: 'abcd' },
  { id: 'jq4', question: 'Số nào sau đây là số nguyên tố nhỏ nhất?', options: ['2', '1', '3', '0'], correct: 'A', type: 'abcd' },
  { id: 'jq5', question: 'Đơn vị đo khối lượng chuẩn trong hệ SI là gì?', options: ['Kilôgam (kg)', 'Gram (g)', 'Tấn', 'Tạ'], correct: 'A', type: 'abcd' }
];

export function JungleRescueGame({ questions = [], teams, onAddPoints, onClose }) {
  const timerRef = useRef(null);

  // 100% DEFENSIVE QUESTION NORMALIZATION
  const safeArray = (Array.isArray(questions) && questions.length > 0) 
    ? questions 
    : DEFAULT_SAMPLE_QUESTIONS;

  const qList = safeArray.map((q, idx) => {
    if (!q || typeof q !== 'object') {
      return {
        id: `q_fallback_${idx}`,
        question: `Câu hỏi ${idx + 1}`,
        options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
        correct: 'A',
        explanation: ''
      };
    }

    const qText = String(q.question || q.title || `Câu hỏi ${idx + 1}`).trim();
    let opts = [];
    if (Array.isArray(q.options) && q.options.length > 0) {
      opts = q.options.map(o => String(o || '').trim());
    } else if (q.options && typeof q.options === 'object') {
      opts = Object.values(q.options).map(o => String(o || '').trim());
    }

    while (opts.length < 4) {
      opts.push(`Lựa chọn ${opts.length + 1}`);
    }

    let rawCorrect = String(q.correct || 'A').trim().toUpperCase();
    let correctChar = 'A';
    if (['A', 'B', 'C', 'D'].includes(rawCorrect[0])) {
      correctChar = rawCorrect[0];
    }

    return {
      id: q.id || `q_${idx}_${Date.now()}`,
      question: qText || `Câu hỏi ${idx + 1}`,
      options: opts.slice(0, 4),
      correct: correctChar,
      explanation: String(q.explanation || '').trim()
    };
  });

  const totalMonsters = qList.length;

  // Game Progression State
  const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
  const [unlockedMonsterIndex, setUnlockedMonsterIndex] = useState(0);
  const [defeatedMonsters, setDefeatedMonsters] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [playerHp, setPlayerHp] = useState(5);
  
  // Encounter Modal State
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [answerResult, setAnswerResult] = useState(null);

  // Hero Position State
  const [heroPos, setHeroPos] = useState({ x: 14, y: 84 });
  const [isWalking, setIsWalking] = useState(false);

  // Final Game State
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasUnlockedTreasure, setHasUnlockedTreasure] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Optimized Spline Path Nodes across map zones
  const pathNodes = [
    { x: 14, y: 84 }, // 0: Start Entrance
    { x: 20, y: 72 }, // 1: Archway Base
    { x: 28, y: 60 }, // 2: Pillar Ruins
    { x: 36, y: 48 }, // 3: Courtyard Steps
    { x: 44, y: 38 }, // 4: Temple Steps
    { x: 50, y: 26 }, // 5: Upper Gateway
    { x: 58, y: 16 }, // 6: Northern Bridge
    { x: 66, y: 18 }, // 7: Lotus Pond West
    { x: 74, y: 24 }, // 8: Lotus Pond East
    { x: 80, y: 34 }, // 9: East Pier
    { x: 74, y: 44 }, // 10: Stream Bank
    { x: 66, y: 52 }, // 11: Stone Arch Bridge
    { x: 58, y: 62 }, // 12: River Crossing
    { x: 64, y: 74 }, // 13: Lower Courtyard
    { x: 72, y: 84 }, // 14: Garden Trail
    { x: 80, y: 76 }  // 15: Cottage Yard (Treasure)
  ];

  const getWaypoint = (idx, total) => {
    if (total <= 1) return pathNodes[5];
    const progress = idx / Math.max(1, total - 1);
    const floatIdx = progress * (pathNodes.length - 2);
    const nodeAIdx = Math.floor(floatIdx);
    const nodeBIdx = Math.min(pathNodes.length - 2, nodeAIdx + 1);
    const subP = floatIdx - nodeAIdx;

    const nodeA = pathNodes[nodeAIdx] || pathNodes[0];
    const nodeB = pathNodes[nodeBIdx] || pathNodes[pathNodes.length - 1];

    return {
      x: Math.round((nodeA.x + subP * (nodeB.x - nodeA.x)) * 10) / 10,
      y: Math.round((nodeA.y + subP * (nodeB.y - nodeA.y)) * 10) / 10
    };
  };

  const monsterWaypoints = qList.map((_, idx) => getWaypoint(idx, totalMonsters));
  const chestWaypoint = { x: 82, y: 76 };

  useEffect(() => {
    if (monsterWaypoints.length > 0) {
      setHeroPos(monsterWaypoints[0]);
    }
  }, [totalMonsters]);

  const handleTriggerMonster = (idx) => {
    if (idx !== unlockedMonsterIndex || defeatedMonsters.includes(idx) || isGameOver || isWalking) return;

    setCurrentMonsterIndex(idx);
    setSelectedOption(null);
    setTextInput('');
    setAnswerResult(null);
    setShowEncounterModal(true);
  };

  const handleAttack = () => {
    if (answerResult) return;

    const safeQIdx = Math.min(currentMonsterIndex, qList.length - 1);
    const currentQ = qList[safeQIdx] || qList[0];
    let isCorrect = false;

    if (currentQ.options && currentQ.options.length >= 2) {
      isCorrect = selectedOption === currentQ.correct;
    } else {
      const cleanUser = textInput.trim().toLowerCase();
      const cleanAns = String(currentQ.correct || '').trim().toLowerCase();
      isCorrect = cleanUser === cleanAns;
    }

    if (isCorrect) {
      setAnswerResult('correct');
      setCorrectCount(prev => prev + 1);
      setDefeatedMonsters(prev => [...prev, currentMonsterIndex]);
      try {
        if (!soundMuted) SoundFX.correct();
        confetti({ particleCount: 80, spread: 70 });
      } catch (e) {}
    } else {
      setAnswerResult('wrong');
      setPlayerHp(prev => Math.max(0, prev - 1));
      try {
        if (!soundMuted) SoundFX.wrong();
      } catch (e) {}
    }
  };

  const handleCloseEncounter = () => {
    setShowEncounterModal(false);
    setSelectedOption(null);
    setTextInput('');

    const nextIdx = currentMonsterIndex + 1;

    if (timerRef.current) clearTimeout(timerRef.current);

    if (nextIdx < totalMonsters) {
      setUnlockedMonsterIndex(nextIdx);
      const targetPos = monsterWaypoints[nextIdx] || chestWaypoint;

      setIsWalking(true);
      timerRef.current = setTimeout(() => {
        setHeroPos(targetPos);
      }, 50);

      timerRef.current = setTimeout(() => {
        setIsWalking(false);
        setCurrentMonsterIndex(nextIdx);
        setSelectedOption(null);
        setTextInput('');
        setAnswerResult(null);
        setShowEncounterModal(true);
      }, 1250);

    } else {
      setIsWalking(true);
      timerRef.current = setTimeout(() => {
        setHeroPos(chestWaypoint);
      }, 50);

      timerRef.current = setTimeout(() => {
        setIsWalking(false);
        evaluateGameEnd();
      }, 1300);
    }
  };

  const evaluateGameEnd = () => {
    const accuracy = (correctCount / totalMonsters) * 100;
    setIsGameOver(true);

    if (accuracy >= 80) {
      setHasUnlockedTreasure(true);
      try {
        if (!soundMuted) SoundFX.fanfare();
        confetti({ particleCount: 220, spread: 120, origin: { y: 0.5 } });
      } catch (e) {}
    } else {
      setHasUnlockedTreasure(false);
      try {
        if (!soundMuted) SoundFX.wrong();
      } catch (e) {}
    }
  };

  const handleResetGame = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentMonsterIndex(0);
    setUnlockedMonsterIndex(0);
    setDefeatedMonsters([]);
    setCorrectCount(0);
    setPlayerHp(5);
    if (monsterWaypoints.length > 0) setHeroPos(monsterWaypoints[0]);
    setShowEncounterModal(false);
    setIsGameOver(false);
    setHasUnlockedTreasure(false);
  };

  const finalScorePercent = Math.round((correctCount / totalMonsters) * 100);
  const safeCurrentIdx = Math.min(currentMonsterIndex, qList.length - 1);
  const currentQ = qList[safeCurrentIdx] || qList[0];
  const currentDino = DINOSAURS[safeCurrentIdx % DINOSAURS.length];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0b0f19',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(21, 128, 61, 0.3) 0%, transparent 75%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box',
      fontFamily: 'Montserrat, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* MAIN CONTAINER */}
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        height: '92vh',
        background: '#121824',
        borderRadius: '24px',
        border: '3px solid #334155',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* TOP BANNER */}
        <div style={{
          padding: '10px 20px',
          background: 'rgba(30, 41, 59, 0.95)',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: '#facc15',
          zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🦖 Giải Cứu Rừng Xanh — Bổ sung tên khủng long trên đầu quái vật & hiệu ứng bệ đá hào quang rực rỡ</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ← Thoát chơi thử
          </button>
        </div>

        {/* MAIN GAME VIEWPORT */}
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>

          {/* LEFT 16-BIT RPG MAP */}
          <div style={{
            flex: 1,
            position: 'relative',
            backgroundImage: 'url(/rpg_ancient_forest_map.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '16px 0 0 16px',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5)', pointerEvents: 'none' }} />

            {/* DASHED ADVENTURE TRAIL CONNECTING ALL MONSTERS */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 4 }}>
              <polyline
                points={monsterWaypoints.map(pt => `${pt.x}%,${pt.y}%`).join(' ')}
                fill="none"
                stroke="#facc15"
                strokeWidth="3.5"
                strokeDasharray="6 6"
                opacity="0.75"
              />
            </svg>

            {/* HERO KNIGHT SPRITE */}
            <div style={{
              position: 'absolute',
              left: `${heroPos.x}%`,
              top: `${heroPos.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'left 1.2s cubic-bezier(0.4, 0, 0.2, 1), top 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                background: '#78350f',
                border: '1.5px solid #facc15',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: 900,
                marginBottom: '4px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.6)',
                whiteSpace: 'nowrap'
              }}>
                ⚔️ ANH HÙNG
              </div>

              <div style={{
                position: 'relative',
                width: '48px',
                height: '60px',
                filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.7))'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '12px',
                  width: '24px',
                  height: '22px',
                  borderRadius: '12px 12px 6px 6px',
                  background: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)',
                  border: '2px solid #facc15',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ width: '12px', height: '4px', background: '#0f172a', margin: '8px auto 0 auto', borderRadius: '2px' }} />
                </div>

                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '10px',
                  width: '28px',
                  height: '26px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: '2px solid #93c5fd',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ fontSize: '0.7rem', textAlign: 'center', marginTop: '2px' }}>⭐</div>
                </div>

                <div style={{
                  position: 'absolute',
                  top: '22px',
                  left: '-4px',
                  width: '12px',
                  height: '20px',
                  transformOrigin: 'top center',
                  transform: isWalking ? 'rotate(-25deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease-in-out'
                }}>
                  <div style={{ width: '8px', height: '14px', background: '#e2e8f0', borderRadius: '4px' }} />
                  <div style={{ fontSize: '1.2rem', position: 'absolute', top: '2px', left: '-6px' }}>🗡️</div>
                </div>

                <div style={{
                  position: 'absolute',
                  top: '22px',
                  right: '-4px',
                  width: '12px',
                  height: '20px',
                  transformOrigin: 'top center',
                  transform: isWalking ? 'rotate(25deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease-in-out'
                }}>
                  <div style={{ fontSize: '1.1rem', position: 'absolute', top: '0', right: '-2px' }}>🛡️</div>
                </div>

                <div style={{
                  position: 'absolute',
                  top: '44px',
                  left: '12px',
                  width: '8px',
                  height: '16px',
                  background: '#334155',
                  borderRadius: '3px',
                  transformOrigin: 'top center',
                  transform: isWalking ? 'rotate(30deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease-in-out'
                }} />

                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: '12px',
                  width: '8px',
                  height: '16px',
                  background: '#334155',
                  borderRadius: '3px',
                  transformOrigin: 'top center',
                  transform: isWalking ? 'rotate(-30deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease-in-out'
                }} />
              </div>
            </div>

            {/* HIGH-VISIBILITY POPPING MONSTERS WITH NAME BADGE ON HEAD & GLOWING PEDESTAL */}
            {monsterWaypoints.map((pos, idx) => {
              const dino = DINOSAURS[idx % DINOSAURS.length];
              const isDefeated = defeatedMonsters.includes(idx);
              const isUnlocked = idx === unlockedMonsterIndex;
              const isLocked = idx > unlockedMonsterIndex;

              return (
                <div
                  key={idx}
                  onClick={() => handleTriggerMonster(idx)}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: isUnlocked && !isDefeated ? 'pointer' : 'default',
                    zIndex: isUnlocked ? 25 : 15,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {/* DINOSAUR NAME BADGE ATTACHED DIRECTLY ON HEAD */}
                  <div style={{
                    background: isDefeated 
                      ? 'linear-gradient(135deg, #15803d 0%, #166534 100%)' 
                      : isUnlocked 
                        ? 'linear-gradient(135deg, #b45309 0%, #78350f 100%)' 
                        : 'rgba(15, 23, 42, 0.92)',
                    border: isUnlocked 
                      ? '2px solid #facc15' 
                      : isDefeated 
                        ? '1.5px solid #4ade80' 
                        : '1.5px solid #475569',
                    color: isUnlocked ? '#facc15' : isDefeated ? '#86efac' : '#cbd5e1',
                    padding: '3px 9px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    marginBottom: '4px',
                    boxShadow: isUnlocked ? '0 0 12px rgba(250, 204, 21, 0.6), 0 4px 10px rgba(0,0,0,0.8)' : '0 4px 8px rgba(0,0,0,0.6)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transform: isUnlocked ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.3s ease'
                  }}>
                    {isDefeated ? '💥' : isUnlocked ? '⚔️' : '🔒'} #{idx + 1}: {dino.name}
                  </div>

                  {/* HIGH-IMPACT GLOWING PEDESTAL UNDERNEATH MONSTER FOR HIGH VISIBILITY */}
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>

                    {/* Pedestal Aura Glow Ring */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-4px',
                      width: isUnlocked ? '72px' : '60px',
                      height: isUnlocked ? '24px' : '18px',
                      borderRadius: '50%',
                      background: isUnlocked 
                        ? 'radial-gradient(ellipse at center, rgba(250, 204, 21, 0.7) 0%, rgba(180, 83, 9, 0.4) 60%, transparent 100%)'
                        : isDefeated
                          ? 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.5) 0%, transparent 100%)'
                          : 'radial-gradient(ellipse at center, rgba(51, 65, 85, 0.6) 0%, transparent 100%)',
                      border: isUnlocked ? '1.5px solid #facc15' : '1px solid rgba(255,255,255,0.2)',
                      boxShadow: isUnlocked ? '0 0 16px #facc15' : 'none',
                      zIndex: 1
                    }} />

                    {/* Defeated Monster State */}
                    {isDefeated ? (
                      <div style={{ fontSize: '2.5rem', zIndex: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))' }}>
                        💥
                      </div>
                    ) : (
                      /* BRIGHT, POPPING MONSTER IMAGE WITH DROP SHADOW */
                      <img
                        src={dino.img}
                        alt={dino.name}
                        style={{
                          width: isUnlocked ? '82px' : '72px',
                          height: isUnlocked ? '82px' : '72px',
                          objectFit: 'contain',
                          zIndex: 2,
                          filter: isUnlocked 
                            ? 'brightness(1.15) contrast(1.1) drop-shadow(0 10px 18px rgba(0,0,0,0.85)) drop-shadow(0 0 12px rgba(250, 204, 21, 0.6))' 
                            : 'brightness(0.9) contrast(1.05) drop-shadow(0 8px 14px rgba(0,0,0,0.8))',
                          transform: isUnlocked ? 'scale(1.2)' : 'scale(1)',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* GOLDEN TREASURE CHEST */}
            <div style={{
              position: 'absolute',
              left: `${chestWaypoint.x}%`,
              top: `${chestWaypoint.y}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 15
            }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '2px solid #facc15',
                color: '#facc15',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 900,
                marginBottom: '6px',
                boxShadow: '0 0 15px rgba(250, 204, 21, 0.5)'
              }}>
                👑 Kho Báu Rừng Xanh
              </div>
              <div style={{
                fontSize: '4.5rem',
                filter: 'drop-shadow(0 8px 22px rgba(250, 204, 21, 0.8))'
              }}>
                🎁
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR PANEL */}
          <div style={{
            width: '280px',
            background: '#1a1813',
            borderLeft: '2px solid #332a1d',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxSizing: 'border-box'
          }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#facc15', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                💎 Săn Kho Báu - Bản Chạy Thử
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>
                Người chơi: <strong>Học Sinh</strong><br />
                Mã hộ chiếu: <strong>PV</strong>
              </div>
            </div>

            {/* Key Progress Widget */}
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '14px 12px',
              borderRadius: '16px',
              border: '1px solid #45341c',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '8px' }}>
                🗝️ {defeatedMonsters.length}/{totalMonsters} chìa khóa diệt quái
              </div>

              <div style={{
                height: '10px',
                background: '#0f172a',
                borderRadius: '5px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '14px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(defeatedMonsters.length / totalMonsters) * 100}%`,
                  background: 'linear-gradient(90deg, #10b981 0%, #facc15 100%)',
                  transition: 'width 0.5s ease'
                }} />
              </div>

              <div style={{
                background: '#261f14',
                border: '1px solid #544127',
                borderRadius: '14px',
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ fontSize: '2.8rem' }}>🔒🎁</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#facc15' }}>
                  🔑 {defeatedMonsters.length}/{totalMonsters} chìa khóa
                </div>
              </div>
            </div>

            {/* Player Health Bar */}
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '10px 12px',
              borderRadius: '14px',
              border: '1px solid #332a1d'
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fca5a5', marginBottom: '6px' }}>
                🩸 SINH MỆNH MÁU ({playerHp}/5):
              </div>
              <div style={{ display: 'flex', gap: '4px', fontSize: '1.2rem' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} style={{ opacity: i <= playerHp ? 1 : 0.2 }}>❤️</span>
                ))}
              </div>
            </div>

            {/* Start / Action Controls */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleTriggerMonster(unlockedMonsterIndex)}
                disabled={showEncounterModal || isGameOver || isWalking}
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Play size={18} /> Đấu Quái Vật #{unlockedMonsterIndex + 1}
              </button>

              <button
                onClick={() => setSoundMuted(!soundMuted)}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: '#261f14',
                  border: '1px solid #544127',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {soundMuted ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} color="#38bdf8" />}
                Nhạc: {soundMuted ? 'Tắt' : 'Bật'}
              </button>

              <button
                onClick={onClose}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Thoát game
              </button>
            </div>
          </div>

        </div>

        {/* BOTTOM KEY SLOT BAR */}
        <div style={{
          padding: '10px 16px',
          background: '#0d1117',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '80%' }}>
            {qList.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: defeatedMonsters.includes(idx) ? 'rgba(16, 185, 129, 0.2)' : idx === unlockedMonsterIndex ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: defeatedMonsters.includes(idx) ? '1.5px solid #10b981' : idx === unlockedMonsterIndex ? '1.5px solid #facc15' : '1px dashed rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 900,
                  color: defeatedMonsters.includes(idx) ? '#facc15' : idx === unlockedMonsterIndex ? '#facc15' : '#64748b',
                  flexShrink: 0
                }}
              >
                {defeatedMonsters.includes(idx) ? '🗝️' : idx === unlockedMonsterIndex ? '⚔️' : '?'}
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, flexShrink: 0 }}>
            💡 Trả lời đúng để hạ gục quái vật — Anh hùng sẽ tự động bước tới quái vật tiếp theo!
          </div>
        </div>

      </div>

      {/* BATTLE ENCOUNTER PARCHMENT DIALOG POPUP */}
      {showEncounterModal && currentQ && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fffdf5',
            backgroundImage: 'radial-gradient(#fef9c3 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            borderRadius: '24px',
            border: '6px solid #b45309',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            width: '100%',
            maxWidth: '780px',
            overflow: 'hidden',
            display: 'flex',
            position: 'relative'
          }}>
            {/* Close X Button */}
            <button
              onClick={handleCloseEncounter}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#78350f',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>

            {/* LEFT QUESTION COLUMN */}
            <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#78350f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚔️ QUÁI VẬT #{currentMonsterIndex + 1}: {currentDino.full.toUpperCase()}
              </div>

              {/* Question Text */}
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#451a03', margin: 0, lineHeight: 1.4 }}>
                {currentQ.question}
              </h3>

              {/* Answer Options */}
              {currentQ.options && currentQ.options.length >= 2 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['A', 'B', 'C', 'D'].map((label, i) => {
                    if (!isOptionValidForQuestion(currentQ?.options, i)) return null;
                    const text = currentQ.options[i];

                    const isSelected = selectedOption === label;
                    const isCorrect = currentQ.correct === label;

                    let bg = '#ffffff';
                    let border = '2px solid #e2e8f0';

                    if (answerResult) {
                      if (isCorrect) {
                        bg = '#dcfce7';
                        border = '2px solid #16a34a';
                      } else if (isSelected && !isCorrect) {
                        bg = '#fee2e2';
                        border = '2px solid #dc2626';
                      }
                    } else if (isSelected) {
                      bg = '#fef3c7';
                      border = '2px solid #b45309';
                    }

                    return (
                      <button
                        key={label}
                        onClick={() => !answerResult && setSelectedOption(label)}
                        style={{
                          padding: '12px 18px',
                          borderRadius: '16px',
                          background: bg,
                          border: border,
                          color: '#1e293b',
                          textAlign: 'left',
                          fontWeight: 800,
                          fontSize: '1rem',
                          cursor: answerResult ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                        }}
                      >
                        <span style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: '#78350f',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900
                        }}>
                          {label}
                        </span>
                        <span>{text}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Nhập câu trả lời của bạn tại đây..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={!!answerResult}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: '16px',
                      background: '#ffffff',
                      border: '2px solid #0284c7',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* Bottom Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  onClick={handleCloseEncounter}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '14px',
                    background: '#fef3c7',
                    border: '1.5px solid #d97706',
                    color: '#78350f',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  BỎ CHẠY
                </button>

                {!answerResult ? (
                  <button
                    onClick={handleAttack}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      borderRadius: '14px',
                      background: '#78350f',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(120, 53, 15, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    ⚔️ TẤN CÔNG!
                  </button>
                ) : (
                  <button
                    onClick={handleCloseEncounter}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      borderRadius: '14px',
                      background: answerResult === 'correct' ? '#16a34a' : '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                      cursor: 'pointer'
                    }}
                  >
                    {answerResult === 'correct' ? '🎉 TIẾP TỤC ĐẾN QUÁI VẬT TIẾP THEO 🏃‍♂️' : '🩸 BỊ CẮN & BƯỚC TỚI QUÁI TIẾP THEO'}
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT MONSTER COLUMN SHOWING ACTUAL DINOSAUR IMAGE & NAME */}
            <div style={{
              width: '260px',
              background: '#fef3c7',
              borderLeft: '2px solid #fde68a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center'
            }}>
              <img
                src={currentDino.img}
                alt={currentDino.name}
                style={{
                  width: '180px',
                  height: '180px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}
              />
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#78350f', marginTop: '16px' }}>
                {currentDino.full}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FINAL TREASURE REWARD / DEFEAT MODAL */}
      {isGameOver && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 5000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '36px 40px',
            width: '100%',
            maxWidth: '480px',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}>
            {hasUnlockedTreasure ? (
              <>
                <div style={{ fontSize: '5rem', lineHeight: 1 }}>🎁✨</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a', margin: 0 }}>
                  🎉 CHÚC MỪNG BẠN ĐÃ GIẢI CỨU RỪNG XANH!
                </h2>
                <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                  Bạn đã xuất sắc hạ gục <strong>{correctCount}/{totalMonsters} quái vật ({finalScorePercent}%)</strong>, đạt điều kiện ≥ 80%!
                </p>

                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '2px solid #facc15',
                  padding: '16px 24px',
                  borderRadius: '20px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#78350f' }}>
                    🏆 PHẦN THƯỞNG KHO BÁU VÀNG:
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>
                    +10 ĐIỂM THƯỜNG XUYÊN 🌟
                  </div>
                </div>

                <button
                  onClick={handleResetGame}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)'
                  }}
                >
                  Chơi Lại Phiêu Lưu Mới 🌲
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '5rem', lineHeight: 1 }}>💀🩸</div>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#dc2626', margin: 0 }}>
                  CHƯA THỂ MỞ RƯƠNG KHO BÁU!
                </h2>
                <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                  Bạn diệt đúng <strong>{correctCount}/{totalMonsters} quái vật ({finalScorePercent}%)</strong>. Vì chưa đạt mốc 80% nên bạn bị mất hết máu và không mở được kho báu!
                </p>

                <button
                  onClick={handleResetGame}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(220, 38, 38, 0.35)'
                  }}
                >
                  Thử Lại Để Giải Cứu Rừng Xanh 🔄
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
