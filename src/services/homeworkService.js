/**
 * Homework & Assignment Service for Sky-Line Educational Games
 * Supports Level 2: Game-based Homework, Student Solo Play, Real-time Submissions, Leaderboard & Excel Export
 */

import { CloudStorageService } from './cloudStorage.js';
import { IDBStorageService } from './idbStorage.js';
import * as XLSX from 'xlsx';

const HOMEWORK_PREFIX = 'gvd_hw_assign_';
const SUBMISSION_PREFIX = 'gvd_hw_subs_';

// Safe UTF-8 Base64 Encoder / Decoder for Vietnamese strings in URLs
export function encodeAssignmentData(obj) {
  try {
    const jsonStr = JSON.stringify(obj);
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return encodeURIComponent(btoa(binary));
  } catch (e) {
    console.warn("encodeAssignmentData error:", e);
    return '';
  }
}

export function decodeAssignmentData(str) {
  try {
    if (!str) return null;
    const binary = atob(decodeURIComponent(str));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn("decodeAssignmentData error:", e);
    return null;
  }
}

export const HomeworkService = {
  /**
   * Create a new game homework assignment
   */
  createAssignment: async (assignmentData, currentUser) => {
    const teacherId = currentUser?.id || 'user_admin';
    const teacherName = currentUser?.name || currentUser?.username || 'Thầy Cô';
    const id = `hw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const assignment = {
      ...assignmentData,
      id,
      gameId: assignmentData.gameId || assignmentData.id || 'game',
      baseGameId: assignmentData.baseGameId || assignmentData.gameId || assignmentData.id,
      title: assignmentData.title || assignmentData.gameTitle || assignmentData.lessonTitle,
      gameTitle: assignmentData.gameTitle || assignmentData.lessonTitle || assignmentData.title || 'Trò Chơi Ôn Tập',
      customTitle: assignmentData.customTitle || assignmentData.gameTitle || assignmentData.title || 'Bài Tập Về Nhà Qua Game',
      engineType: assignmentData.engineType || assignmentData.gameType || 'wheel',
      gameType: assignmentData.gameType || assignmentData.engineType || 'wheel',
      teacherId,
      teacherName,
      teacherSubject: currentUser?.subject || assignmentData.category || 'Môn học',
      school: currentUser?.school || 'Sky-Line Education',
      targetClass: assignmentData.targetClass || '',
      timeLimitMinutes: Number(assignmentData.timeLimitMinutes) || 0, // 0 = unlimited
      allowRetry: assignmentData.allowRetry !== false,
      showAnswersAfter: assignmentData.showAnswersAfter !== false,
      shuffleQuestions: Boolean(assignmentData.shuffleQuestions),
      questions: Array.isArray(assignmentData.questions) ? assignmentData.questions : (assignmentData.defaultQuestions || []),
      defaultQuestions: Array.isArray(assignmentData.defaultQuestions) ? assignmentData.defaultQuestions : (assignmentData.questions || []),
      category: assignmentData.category || 'Game Giáo Dục',
      icon: assignmentData.icon || '🎮',
      gradient: assignmentData.gradient || 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
      createdAt: new Date().toISOString(),
      dueDate: assignmentData.dueDate || null,
      status: 'active'
    };

    // 1. Save locally in Teacher's browser
    try {
      const key = `${HOMEWORK_PREFIX}${teacherId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [assignment, ...existing.filter(a => a.id !== id)];
      localStorage.setItem(key, JSON.stringify(updated));
      await IDBStorageService.setItem(key, updated).catch(() => {});
    } catch (e) {
      console.warn("Local assignment save error:", e);
    }

    // 2. Push to Supabase Cloud DB & Vercel Storage (Global scope for students to access without login)
    try {
      // Direct assignment payload for students
      await CloudStorageService.saveUserPrivateCloudData('global_hw', assignment.id, assignment);
    } catch (e) {
      console.warn("Cloud assignment save error:", e);
    }

    return assignment;
  },

  /**
   * Get list of assignments created by teacher
   */
  getTeacherAssignments: async (teacherId) => {
    if (!teacherId) return [];
    const key = `${HOMEWORK_PREFIX}${teacherId}`;
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {}

    // Fallback to IndexedDB
    if (!list || list.length === 0) {
      try {
        const idbList = await IDBStorageService.getItem(key);
        if (Array.isArray(idbList) && idbList.length > 0) {
          list = idbList;
          try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
        }
      } catch (e) {}
    }

    return list;
  },

  /**
   * Delete an assignment
   */
  deleteAssignment: async (teacherId, assignmentId) => {
    if (!teacherId || !assignmentId) return false;
    const key = `${HOMEWORK_PREFIX}${teacherId}`;
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter(a => a.id !== assignmentId);
      localStorage.setItem(key, JSON.stringify(filtered));
      await IDBStorageService.setItem(key, filtered).catch(() => {});
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Fetch assignment details for student by ID (with fallback to embedded URL data)
   */
  getAssignmentById: async (assignmentId, encodedDataFallback = null) => {
    if (!assignmentId && !encodedDataFallback) return null;

    // 1. Check local storage if teacher is testing on same device
    if (assignmentId) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(HOMEWORK_PREFIX)) {
            const list = JSON.parse(localStorage.getItem(k) || '[]');
            const found = list.find(a => a.id === assignmentId);
            if (found) return found;
          }
        }
      } catch (e) {}
    }

    // 2. Fetch from Supabase Cloud DB (Global endpoint)
    if (assignmentId) {
      try {
        const cloudData = await CloudStorageService.getUserPrivateCloudData('global_hw', assignmentId);
        if (cloudData && cloudData.id === assignmentId) {
          return cloudData;
        }
      } catch (e) {
        console.warn("Cloud assignment fetch warning:", e);
      }
    }

    // 3. Fallback to encoded URL data (Guarantees 100% offline & zero-backend availability)
    if (encodedDataFallback) {
      const decoded = decodeAssignmentData(encodedDataFallback);
      if (decoded && (decoded.id || decoded.questions)) {
        return decoded;
      }
    }

    return null;
  },

  /**
   * Student submits completed homework
   */
  submitHomework: async (submission) => {
    const assignmentId = submission.assignmentId;
    if (!assignmentId) return false;

    const subPayload = {
      id: submission.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      assignmentId,
      studentName: String(submission.studentName || 'Học sinh').trim(),
      studentClass: String(submission.studentClass || '').trim(),
      score: Number(submission.score) || 0, // 0 - 100
      grade10: Number(submission.grade10 || (submission.score / 10).toFixed(1)),
      correctCount: Number(submission.correctCount) || 0,
      totalQuestions: Number(submission.totalQuestions) || 0,
      timeSpentSeconds: Number(submission.timeSpentSeconds) || 0,
      submittedAt: new Date().toISOString(),
      details: submission.details || []
    };

    // 1. Save in student's local device
    try {
      const localKey = `gvd_my_sub_${assignmentId}`;
      localStorage.setItem(localKey, JSON.stringify(subPayload));
    } catch (e) {}

    // 2. Fetch existing submissions from Cloud and append
    try {
      const cloudSubsKey = `subs_${assignmentId}`;
      let existingSubs = await CloudStorageService.getUserPrivateCloudData('global_subs', cloudSubsKey);
      if (!Array.isArray(existingSubs)) existingSubs = [];

      // Avoid duplicates from same student if they retry: update if exists or append
      const existingIdx = existingSubs.findIndex(s => 
        s.studentName.toLowerCase() === subPayload.studentName.toLowerCase() && 
        s.studentClass.toLowerCase() === subPayload.studentClass.toLowerCase()
      );

      if (existingIdx >= 0) {
        // Keep highest score or newest submission
        existingSubs[existingIdx] = subPayload;
      } else {
        existingSubs.push(subPayload);
      }

      await CloudStorageService.saveUserPrivateCloudData('global_subs', cloudSubsKey, existingSubs);
    } catch (e) {
      console.warn("Cloud submission push error:", e);
    }

    // 3. Also append to teacher's local device if on same origin
    try {
      const teacherSubsKey = `${SUBMISSION_PREFIX}${assignmentId}`;
      let localTeacherSubs = JSON.parse(localStorage.getItem(teacherSubsKey) || '[]');
      if (!Array.isArray(localTeacherSubs)) localTeacherSubs = [];
      const exIdx = localTeacherSubs.findIndex(s => 
        s.studentName.toLowerCase() === subPayload.studentName.toLowerCase() && 
        s.studentClass.toLowerCase() === subPayload.studentClass.toLowerCase()
      );
      if (exIdx >= 0) {
        localTeacherSubs[exIdx] = subPayload;
      } else {
        localTeacherSubs[exIdx] = subPayload;
      }
      localStorage.setItem(teacherSubsKey, JSON.stringify(localTeacherSubs));
      await IDBStorageService.setItem(teacherSubsKey, localTeacherSubs).catch(() => {});
    } catch (e) {}

    return subPayload;
  },

  /**
   * Get all student submissions for an assignment
   */
  getSubmissions: async (assignmentId) => {
    if (!assignmentId) return [];

    let submissions = [];

    // 1. Try Cloud DB
    try {
      const cloudSubsKey = `subs_${assignmentId}`;
      const cloudSubs = await CloudStorageService.getUserPrivateCloudData('global_subs', cloudSubsKey);
      if (Array.isArray(cloudSubs) && cloudSubs.length > 0) {
        submissions = cloudSubs;
        // Cache to local
        try {
          localStorage.setItem(`${SUBMISSION_PREFIX}${assignmentId}`, JSON.stringify(submissions));
        } catch (e) {}
      }
    } catch (e) {
      console.warn("getSubmissions cloud error:", e);
    }

    // 2. Fallback to LocalStorage / IndexedDB if Cloud returned empty or failed
    if (submissions.length === 0) {
      try {
        const localSubs = JSON.parse(localStorage.getItem(`${SUBMISSION_PREFIX}${assignmentId}`) || '[]');
        if (Array.isArray(localSubs) && localSubs.length > 0) {
          submissions = localSubs;
        }
      } catch (e) {}
    }

    if (submissions.length === 0) {
      try {
        const idbSubs = await IDBStorageService.getItem(`${SUBMISSION_PREFIX}${assignmentId}`);
        if (Array.isArray(idbSubs) && idbSubs.length > 0) {
          submissions = idbSubs;
        }
      } catch (e) {}
    }

    // Sort descending by score, then ascending by time spent (higher score & faster time gets higher rank)
    submissions.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSpentSeconds - b.timeSpentSeconds;
    });

    return submissions;
  },

  /**
   * Delete a student submission (Teacher moderation)
   */
  deleteSubmission: async (assignmentId, submissionId) => {
    if (!assignmentId || !submissionId) return false;
    try {
      const cloudSubsKey = `subs_${assignmentId}`;
      let currentSubs = await HomeworkService.getSubmissions(assignmentId);
      currentSubs = currentSubs.filter(s => s.id !== submissionId);
      
      localStorage.setItem(`${SUBMISSION_PREFIX}${assignmentId}`, JSON.stringify(currentSubs));
      await IDBStorageService.setItem(`${SUBMISSION_PREFIX}${assignmentId}`, currentSubs).catch(() => {});
      await CloudStorageService.saveUserPrivateCloudData('global_subs', cloudSubsKey, currentSubs);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Generate Full Shareable Link for Students
   */
  getShareUrl: (assignment) => {
    if (!assignment || !assignment.id) return '';
    const origin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'https://eduvth.vercel.app';
    const encodedData = encodeAssignmentData({
      id: assignment.id,
      gameId: assignment.gameId || assignment.id,
      baseGameId: assignment.baseGameId || assignment.gameId || assignment.id,
      title: assignment.customTitle || assignment.gameTitle || assignment.title,
      gameTitle: assignment.gameTitle || assignment.title,
      lessonTitle: assignment.customTitle || assignment.gameTitle || assignment.title,
      engineType: assignment.engineType || assignment.gameType,
      gameType: assignment.gameType || assignment.engineType,
      secretImage: assignment.secretImage || assignment.bgImageUrl || null,
      teacherName: assignment.teacherName,
      teacherSubject: assignment.teacherSubject,
      targetClass: assignment.targetClass,
      timeLimitMinutes: assignment.timeLimitMinutes,
      allowRetry: assignment.allowRetry,
      showAnswersAfter: assignment.showAnswersAfter,
      shuffleQuestions: assignment.shuffleQuestions,
      questions: assignment.questions || assignment.defaultQuestions || [],
      defaultQuestions: assignment.defaultQuestions || assignment.questions || [],
      category: assignment.category,
      icon: assignment.icon,
      gradient: assignment.gradient
    });

    // Provide clean hash link with fallback encoded data
    return `${origin}/#play?hw=${encodeURIComponent(assignment.id)}&d=${encodedData}`;
  },

  /**
   * Export Submissions to Excel (.xlsx) file
   */
  exportToExcel: (assignment, submissions) => {
    if (!Array.isArray(submissions) || submissions.length === 0) {
      alert("Chưa có học sinh nào nộp bài để xuất bảng điểm!");
      return;
    }

    const title = assignment?.customTitle || assignment?.gameTitle || 'Bài Tập Về Nhà';
    const teacherName = assignment?.teacherName || 'Giáo Viên';
    const targetClass = assignment?.targetClass ? ` - Lớp ${assignment.targetClass}` : '';

    // Prepare table rows
    const excelRows = submissions.map((sub, idx) => {
      const minutes = Math.floor(sub.timeSpentSeconds / 60);
      const seconds = sub.timeSpentSeconds % 60;
      const timeStr = `${minutes > 0 ? `${minutes}p ` : ''}${seconds}s`;
      const dateStr = sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('vi-VN') : '';

      return {
        'Hạng': idx + 1,
        'Họ và tên học sinh': sub.studentName,
        'Lớp': sub.studentClass || assignment?.targetClass || 'Chung',
        'Điểm (Thang 10)': sub.grade10 !== undefined ? sub.grade10 : (sub.score / 10).toFixed(1),
        'Điểm Game (Thang 100)': sub.score,
        'Số câu đúng': `${sub.correctCount} / ${sub.totalQuestions}`,
        'Thời gian làm': timeStr,
        'Thời gian nộp': dateStr
      };
    });

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(excelRows);

    // Auto-fit column widths
    const columnWidths = [
      { wch: 8 },  // Hạng
      { wch: 26 }, // Họ tên
      { wch: 12 }, // Lớp
      { wch: 16 }, // Điểm thang 10
      { wch: 22 }, // Điểm game 100
      { wch: 14 }, // Số câu đúng
      { wch: 16 }, // Thời gian làm
      { wch: 24 }  // Thời gian nộp
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bảng Điểm BTVN');

    const cleanFileName = `Bang_Diem_${title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_')}${targetClass}.xlsx`;
    XLSX.writeFile(workbook, cleanFileName);
  }
};
