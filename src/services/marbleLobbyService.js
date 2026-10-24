/**
 * Marble Race Live Lobby Service (Phòng Chờ Quét Mã QR Điền Tên Nhanh)
 * Cho phép học sinh quét mã QR tự điền Tên & Trường/Lớp để tham gia Đua Bi Sinh Tử
 * Đồng bộ thời gian thực qua Supabase Cloud DB, Vercel Storage & BroadcastChannel
 */

import { CloudStorageService } from './cloudStorage.js';
import { IDBStorageService } from './idbStorage.js';

const MARBLE_LOBBY_PREFIX = 'gvd_marble_lobby_';
const BROADCAST_CHANNEL_NAME = 'gvd_marble_race_lobby';

// Helper get BroadcastChannel safely
const getLobbyChannel = () => {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const MarbleLobbyService = {
  /**
   * Tạo mã PIN 6 chữ số ngẫu nhiên
   */
  generatePin: () => {
    return String(Math.floor(100000 + Math.random() * 900000));
  },

  /**
   * Giáo viên tạo hoặc khởi động phiên phòng chờ quét QR cho Đua Bi
   */
  createOrGetLobby: async (currentUser, existingPin = null, customTitle = '') => {
    const teacherId = currentUser?.id || 'teacher';
    const teacherName = currentUser?.name || currentUser?.username || 'Thầy Cô';
    const pin = existingPin ? String(existingPin).trim() : MarbleLobbyService.generatePin();

    // Check if existing lobby exists
    let existingLobby = null;
    if (existingPin) {
      existingLobby = await MarbleLobbyService.getLobby(existingPin);
    }

    if (existingLobby && existingLobby.status !== 'closed') {
      return existingLobby;
    }

    const newLobby = {
      pin,
      teacherId,
      teacherName,
      teacherSchool: currentUser?.school || 'Sky-Line',
      teacherSubject: currentUser?.subject || '',
      title: customTitle || 'Đua Bi Sinh Tử — Quét QR Tham Gia',
      status: 'waiting', // 'waiting' | 'racing' | 'closed'
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Lưu Local & IndexedDB
    try {
      localStorage.setItem(`${MARBLE_LOBBY_PREFIX}${pin}`, JSON.stringify(newLobby));
      await IDBStorageService.setItem(`${MARBLE_LOBBY_PREFIX}${pin}`, newLobby).catch(() => {});
    } catch (e) {}

    // 2. Lưu Cloud Storage (Supabase REST API + Vercel Storage)
    try {
      await CloudStorageService.saveUserPrivateCloudData('global_marble_lobby', pin, newLobby);
    } catch (e) {
      console.warn("Lỗi lưu cloud marble lobby:", e);
    }

    // 3. Broadcast
    try {
      const ch = getLobbyChannel();
      if (ch) {
        ch.postMessage({ type: 'LOBBY_CREATED', pin, lobby: newLobby });
        ch.close();
      }
    } catch (e) {}

    return newLobby;
  },

  /**
   * Lấy thông tin phòng chờ theo PIN
   */
  getLobby: async (pin) => {
    if (!pin) return null;
    const cleanPin = String(pin).trim();

    // 1. Fetch từ Cloud DB (Supabase / Vercel API) để lấy dữ liệu mới nhất từ điện thoại học sinh
    try {
      const cloudData = await CloudStorageService.getUserPrivateCloudData('global_marble_lobby', cleanPin);
      if (cloudData && String(cloudData.pin) === cleanPin) {
        // Cache lại vào LocalStorage & IndexedDB
        try {
          localStorage.setItem(`${MARBLE_LOBBY_PREFIX}${cleanPin}`, JSON.stringify(cloudData));
          await IDBStorageService.setItem(`${MARBLE_LOBBY_PREFIX}${cleanPin}`, cloudData).catch(() => {});
        } catch (e) {}
        return cloudData;
      }
    } catch (e) {}

    // 2. Fallback sang LocalStorage
    try {
      const local = localStorage.getItem(`${MARBLE_LOBBY_PREFIX}${cleanPin}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && String(parsed.pin) === cleanPin) return parsed;
      }
    } catch (e) {}

    // 3. Fallback sang IndexedDB
    try {
      const idb = await IDBStorageService.getItem(`${MARBLE_LOBBY_PREFIX}${cleanPin}`);
      if (idb && String(idb.pin) === cleanPin) return idb;
    } catch (e) {}

    return null;
  },

  /**
   * Học sinh gửi thông tin tham gia cuộc đua (Tên + Trường/Lớp + Màu bi)
   */
  joinLobby: async (pin, studentData) => {
    if (!pin || !studentData) throw new Error("Thiếu mã PIN hoặc thông tin học sinh!");
    const cleanPin = String(pin).trim();
    const cleanName = String(studentData.name || '').trim();
    if (!cleanName) throw new Error("Vui lòng nhập Họ và tên!");

    let lobby = await MarbleLobbyService.getLobby(cleanPin);
    if (!lobby) {
      // Nếu cloud chưa kịp fetch, thử tạo lobby rỗng tạm
      lobby = {
        pin: cleanPin,
        teacherId: 'teacher',
        teacherName: 'Thầy Cô',
        title: 'Đua Bi Sinh Tử',
        status: 'waiting',
        participants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const currentParticipants = Array.isArray(lobby.participants) ? [...lobby.participants] : [];

    // Kiểm tra xem đã có học sinh trùng tên chưa (nếu có thì thêm số thứ tự)
    let finalName = cleanName;
    const sameNameCount = currentParticipants.filter(p => 
      String(p.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    ).length;

    if (sameNameCount > 0) {
      finalName = `${cleanName} (${sameNameCount + 1})`;
    }

    const newParticipant = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: finalName,
      school: String(studentData.school || studentData.className || '').trim() || 'Học sinh',
      className: String(studentData.className || '').trim(),
      color: studentData.color || '#3b82f6',
      avatar: studentData.avatar || null,
      joinedAt: new Date().toISOString()
    };

    currentParticipants.push(newParticipant);

    const updatedLobby = {
      ...lobby,
      participants: currentParticipants,
      updatedAt: new Date().toISOString()
    };

    // 1. Lưu Local & IDB
    try {
      localStorage.setItem(`${MARBLE_LOBBY_PREFIX}${cleanPin}`, JSON.stringify(updatedLobby));
      await IDBStorageService.setItem(`${MARBLE_LOBBY_PREFIX}${cleanPin}`, updatedLobby).catch(() => {});
    } catch (e) {}

    // 2. Cập nhật Cloud DB ngay lập tức
    try {
      await CloudStorageService.saveUserPrivateCloudData('global_marble_lobby', cleanPin, updatedLobby);
    } catch (e) {
      console.warn("Lỗi lưu cloud khi học sinh join:", e);
    }

    // 3. Broadcast sự kiện để màn hình giáo viên nhận ngay tức thì (nếu cùng thiết bị/mạng)
    try {
      const ch = getLobbyChannel();
      if (ch) {
        ch.postMessage({ type: 'STUDENT_JOINED', pin: cleanPin, participant: newParticipant, count: currentParticipants.length });
        ch.close();
      }
    } catch (e) {}

    try {
      window.dispatchEvent(new CustomEvent('gvd_marble_student_joined', { 
        detail: { pin: cleanPin, participant: newParticipant } 
      }));
    } catch (e) {}

    return {
      success: true,
      participant: newParticipant,
      totalCount: currentParticipants.length
    };
  },

  /**
   * Giáo viên xóa 1 học sinh khỏi danh sách (ví dụ gõ nhầm hoặc spam)
   */
  removeParticipant: async (pin, participantId) => {
    if (!pin || !participantId) return null;
    const cleanPin = String(pin).trim();
    const lobby = await MarbleLobbyService.getLobby(cleanPin);
    if (!lobby || !Array.isArray(lobby.participants)) return null;

    const filtered = lobby.participants.filter(p => p.id !== participantId);
    const updatedLobby = {
      ...lobby,
      participants: filtered,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`${MARBLE_LOBBY_PREFIX}${cleanPin}`, JSON.stringify(updatedLobby));
      await IDBStorageService.setItem(`${MARBLE_LOBBY_PREFIX}${cleanPin}`, updatedLobby).catch(() => {});
      await CloudStorageService.saveUserPrivateCloudData('global_marble_lobby', cleanPin, updatedLobby);
    } catch (e) {}

    return updatedLobby;
  },

  /**
   * Giáo viên xóa toàn bộ học sinh để quét lại từ đầu
   */
  clearParticipants: async (pin) => {
    if (!pin) return null;
    const cleanPin = String(pin).trim();
    const lobby = await MarbleLobbyService.getLobby(cleanPin);
    if (!lobby) return null;

    const updatedLobby = {
      ...lobby,
      participants: [],
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`${MARBLE_LOBBY_PREFIX}${cleanPin}`, JSON.stringify(updatedLobby));
      await IDBStorageService.setItem(`${MARBLE_LOBBY_PREFIX}${cleanPin}`, updatedLobby).catch(() => {});
      await CloudStorageService.saveUserPrivateCloudData('global_marble_lobby', cleanPin, updatedLobby);
    } catch (e) {}

    return updatedLobby;
  },

  /**
   * Lấy đường link tham gia trực tiếp cho học sinh quét QR
   */
  getStudentJoinUrl: (pin) => {
    const origin = (typeof window !== 'undefined' && window.location.origin) 
      ? window.location.origin 
      : 'https://eduvth.vercel.app';
    return `${origin}/?marbleJoin=${pin}`;
  },

  /**
   * Lấy URL ảnh mã QR Code chất lượng cao
   */
  getQrCodeUrl: (pin) => {
    const joinUrl = MarbleLobbyService.getStudentJoinUrl(pin);
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(joinUrl)}&margin=10`;
  }
};
