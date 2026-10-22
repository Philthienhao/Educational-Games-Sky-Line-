/**
 * Live Classroom Battle Service (Máy Chủ Đấu Nhóm Trực Tiếp)
 * Connects Teacher Host Server (Máy Chủ) with Student Groups in Real-Time
 */

import { CloudStorageService } from './cloudStorage.js';
import { IDBStorageService } from './idbStorage.js';
import * as XLSX from 'xlsx';

const LIVE_PREFIX = 'gvd_live_room_';

export const LiveBattleService = {
  /**
   * Generate random 6-digit PIN
   */
  generatePin: () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  },

  /**
   * Host Teacher creates a new Live Battle Room
   */
  createRoom: async (game, currentUser, customConfig = {}) => {
    const teacherId = currentUser?.id || 'user_admin';
    const teacherName = currentUser?.name || currentUser?.username || 'Thầy Cô';
    const pin = LiveBattleService.generatePin();

    const questions = Array.isArray(game?.questions) && game.questions.length > 0
      ? game.questions
      : (Array.isArray(game?.defaultQuestions) && game.defaultQuestions.length > 0 ? game.defaultQuestions : []);

    const defaultTeams = [
      { id: 'team_1', name: 'Nhóm 1 (Đỏ)', color: '#ef4444', icon: '🔴', score: 0, connected: false, members: '', correctCount: 0 },
      { id: 'team_2', name: 'Nhóm 2 (Xanh)', color: '#3b82f6', icon: '🔵', score: 0, connected: false, members: '', correctCount: 0 },
      { id: 'team_3', name: 'Nhóm 3 (Vàng)', color: '#f59e0b', icon: '🟡', score: 0, connected: false, members: '', correctCount: 0 },
      { id: 'team_4', name: 'Nhóm 4 (Lục)', color: '#10b981', icon: '🟢', score: 0, connected: false, members: '', correctCount: 0 }
    ];

    const initialRoom = {
      roomPin: pin,
      roomId: `live_${Date.now()}_${pin}`,
      teacherId,
      teacherName,
      teacherSubject: currentUser?.subject || game?.category || 'Môn học',
      gameId: game?.id || 'game',
      gameTitle: game?.lessonTitle || game?.title || 'Đấu Trường Tri Thức',
      engineType: game?.engineType || game?.gameType || 'wheel',
      timePerQuestion: Number(customConfig.timePerQuestion) || 30, // seconds
      status: 'lobby', // 'lobby' | 'playing' | 'question_result' | 'finished'
      currentQuestionIndex: 0,
      isLocked: false,
      showAnswer: false,
      questions: questions,
      teams: customConfig.teams || defaultTeams,
      answers: {}, // [qIndex]: { [teamId]: { answer: 'A', isCorrect: true, points: 120, timeMs: 1500 } }
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save locally
    try {
      localStorage.setItem(`${LIVE_PREFIX}${pin}`, JSON.stringify(initialRoom));
      await IDBStorageService.setItem(`${LIVE_PREFIX}${pin}`, initialRoom).catch(() => {});
    } catch (e) {}

    // Push to Supabase Cloud DB (global_live)
    try {
      await CloudStorageService.saveUserPrivateCloudData('global_live', pin, initialRoom);
    } catch (e) {
      console.warn("Cloud live room save error:", e);
    }

    return initialRoom;
  },

  /**
   * Fetch room data by PIN (from Cloud DB with local fallback)
   */
  getRoom: async (roomPin) => {
    if (!roomPin) return null;
    const cleanPin = String(roomPin).trim();

    // 1. Try Cloud DB for real-time state
    try {
      const cloudData = await CloudStorageService.getUserPrivateCloudData('global_live', cleanPin);
      if (cloudData && cloudData.roomPin === cleanPin) {
        // Cache to local
        try { localStorage.setItem(`${LIVE_PREFIX}${cleanPin}`, JSON.stringify(cloudData)); } catch (e) {}
        return cloudData;
      }
    } catch (e) {}

    // 2. Fallback to LocalStorage / IDB
    try {
      const local = localStorage.getItem(`${LIVE_PREFIX}${cleanPin}`);
      if (local) return JSON.parse(local);
    } catch (e) {}

    try {
      const idb = await IDBStorageService.getItem(`${LIVE_PREFIX}${cleanPin}`);
      if (idb) return idb;
    } catch (e) {}

    return null;
  },

  /**
   * Update Room State (Host controls or student actions)
   */
  updateRoom: async (roomPin, patch) => {
    if (!roomPin) return null;
    const cleanPin = String(roomPin).trim();
    let current = await LiveBattleService.getRoom(cleanPin);
    if (!current) return null;

    const updated = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString()
    };

    // Save local
    try {
      localStorage.setItem(`${LIVE_PREFIX}${cleanPin}`, JSON.stringify(updated));
      await IDBStorageService.setItem(`${LIVE_PREFIX}${cleanPin}`, updated).catch(() => {});
    } catch (e) {}

    // Push Cloud
    try {
      await CloudStorageService.saveUserPrivateCloudData('global_live', cleanPin, updated);
    } catch (e) {}

    return updated;
  },

  /**
   * Student Group joins room
   */
  joinTeam: async (roomPin, teamId, teamCustomName, members) => {
    const cleanPin = String(roomPin).trim();
    const room = await LiveBattleService.getRoom(cleanPin);
    if (!room) throw new Error("Không tìm thấy phòng đấu hoặc mã PIN không hợp lệ!");

    const updatedTeams = room.teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          name: teamCustomName || t.name,
          members: members || t.members || 'Đã vào phòng',
          connected: true
        };
      }
      return t;
    });

    return await LiveBattleService.updateRoom(cleanPin, { teams: updatedTeams });
  },

  /**
   * Student Group submits an answer
   */
  submitTeamAnswer: async (roomPin, questionIndex, teamId, answerLetter, elapsedMs = 5000) => {
    const cleanPin = String(roomPin).trim();
    const room = await LiveBattleService.getRoom(cleanPin);
    if (!room) return null;
    if (room.isLocked) return room; // Question locked by host

    const q = room.questions[questionIndex];
    if (!q) return room;

    // Check correctness
    let correctLetter = q.correct ?? q.answer ?? q.correctAnswer ?? 'A';
    if (typeof correctLetter === 'number') {
      correctLetter = ['A', 'B', 'C', 'D'][correctLetter] || 'A';
    } else {
      correctLetter = String(correctLetter).trim().toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(correctLetter) && Array.isArray(q.options)) {
        const idx = q.options.findIndex(opt => String(opt).trim().toLowerCase() === String(correctLetter).toLowerCase());
        if (idx !== -1) correctLetter = ['A', 'B', 'C', 'D'][idx];
        else correctLetter = 'A';
      }
    }

    const isCorrect = String(answerLetter).trim().toUpperCase() === correctLetter;

    // Point scoring formula:
    // Base points = 100
    // Speed bonus: up to 50 points if answered within time limit
    let points = 0;
    if (isCorrect) {
      const timeLimitMs = (room.timePerQuestion || 30) * 1000;
      const speedFraction = Math.max(0, (timeLimitMs - elapsedMs) / timeLimitMs);
      const speedBonus = Math.round(speedFraction * 50);
      points = 100 + speedBonus;
    }

    const currentAnswers = { ...(room.answers || {}) };
    const qAnswers = { ...(currentAnswers[questionIndex] || {}) };

    // Prevent re-answering
    if (qAnswers[teamId]) {
      return room;
    }

    qAnswers[teamId] = {
      answer: answerLetter,
      isCorrect,
      points,
      timeMs: elapsedMs,
      timestamp: Date.now()
    };
    currentAnswers[questionIndex] = qAnswers;

    // Update team total score
    const updatedTeams = room.teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          score: t.score + points,
          correctCount: (t.correctCount || 0) + (isCorrect ? 1 : 0),
          lastAnswer: answerLetter
        };
      }
      return t;
    });

    return await LiveBattleService.updateRoom(cleanPin, {
      answers: currentAnswers,
      teams: updatedTeams
    });
  },

  /**
   * Host starts the battle
   */
  startBattle: async (roomPin) => {
    return await LiveBattleService.updateRoom(roomPin, {
      status: 'playing',
      currentQuestionIndex: 0,
      isLocked: false,
      showAnswer: false
    });
  },

  /**
   * Host locks answering for current question
   */
  lockQuestion: async (roomPin) => {
    return await LiveBattleService.updateRoom(roomPin, {
      isLocked: true
    });
  },

  /**
   * Host reveals correct answer and scores
   */
  revealAnswer: async (roomPin) => {
    return await LiveBattleService.updateRoom(roomPin, {
      isLocked: true,
      showAnswer: true,
      status: 'question_result'
    });
  },

  /**
   * Host advances to next question
   */
  nextQuestion: async (roomPin) => {
    const room = await LiveBattleService.getRoom(roomPin);
    if (!room) return null;
    const nextIdx = room.currentQuestionIndex + 1;
    if (nextIdx >= room.questions.length) {
      return await LiveBattleService.finishBattle(roomPin);
    }

    return await LiveBattleService.updateRoom(roomPin, {
      currentQuestionIndex: nextIdx,
      status: 'playing',
      isLocked: false,
      showAnswer: false
    });
  },

  /**
   * Host adjusts points manually (+/-)
   */
  adjustPoints: async (roomPin, teamId, delta) => {
    const room = await LiveBattleService.getRoom(roomPin);
    if (!room) return null;

    const updatedTeams = room.teams.map(t => {
      if (t.id === teamId) {
        return { ...t, score: Math.max(0, t.score + delta) };
      }
      return t;
    });

    return await LiveBattleService.updateRoom(roomPin, { teams: updatedTeams });
  },

  /**
   * Host finishes the match
   */
  finishBattle: async (roomPin) => {
    return await LiveBattleService.updateRoom(roomPin, {
      status: 'finished',
      isLocked: true,
      showAnswer: true
    });
  },

  /**
   * Export Battle Report to Excel
   */
  exportReport: (room) => {
    if (!room) return;
    try {
      // 1. Leaderboard Sheet
      const sortedTeams = [...(room.teams || [])].sort((a, b) => b.score - a.score);
      const leaderboardData = sortedTeams.map((t, idx) => ({
        'Hạng': idx + 1,
        'Tên Nhóm': t.name,
        'Thành Viên': t.members || 'Chưa ghi tên',
        'Tổng Điểm': t.score,
        'Số Câu Đúng': `${t.correctCount || 0}/${room.questions.length}`,
        'Tỉ Lệ Chính Xác': `${Math.round(((t.correctCount || 0) / (room.questions.length || 1)) * 100)}%`
      }));

      // 2. Question Details Sheet
      const detailsData = [];
      room.questions.forEach((q, qIdx) => {
        let corr = q.correct ?? q.answer ?? 'A';
        const qAns = room.answers?.[qIdx] || {};
        const row = {
          'Câu Số': qIdx + 1,
          'Nội Dung Câu Hỏi': q.question || q.title || `Câu ${qIdx + 1}`,
          'Đáp Án Đúng': corr
        };
        room.teams.forEach(t => {
          const tAns = qAns[t.id];
          row[t.name] = tAns ? `${tAns.answer} (${tAns.isCorrect ? `+${tAns.points}đ` : '0đ'})` : 'Chưa trả lời';
        });
        detailsData.push(row);
      });

      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.json_to_sheet(leaderboardData);
      const ws2 = XLSX.utils.json_to_sheet(detailsData);

      XLSX.utils.book_append_sheet(wb, ws1, "Bảng Vàng Xếp Hạng");
      XLSX.utils.book_append_sheet(wb, ws2, "Chi Tiết Từng Câu");

      const fileName = `Ket_Qua_Dau_Nhom_${room.gameTitle.replace(/[^a-zA-Z0-9]/g, '_')}_PIN_${room.roomPin}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (e) {
      console.warn("Export report error:", e);
      alert("Lỗi xuất file Excel: " + e.message);
    }
  },

  /**
   * Get direct share link for student devices
   */
  getStudentJoinUrl: (roomPin) => {
    const origin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'https://eduvth.vercel.app';
    return `${origin}?live=${roomPin}`;
  }
};
