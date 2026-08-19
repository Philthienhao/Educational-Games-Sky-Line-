// Data Persistence Service using LocalStorage Engine

const USERS_KEY = 'gvd_users';
const BASE_GAMES_KEY = 'gvd_base_games';
const SAVED_GAMES_KEY = 'gvd_saved_games';
const CURRENT_USER_KEY = 'gvd_current_user';

// Initial Seed Users
const INITIAL_USERS = [
  {
    id: 'user_admin',
    username: 'admin',
    password: '123',
    name: 'Admin - Quản Trị Viên',
    role: 'admin',
    subject: 'Quản trị hệ thống',
    school: 'Giáo Viên Đổi Mới HQ',
    createdAt: '2026-01-01'
  },
  {
    id: 'user_co_hoa',
    username: 'co_hoa',
    password: '123',
    name: 'Cô Nguyễn Thị Hoa',
    role: 'teacher',
    subject: 'Ngữ Văn - Lịch Sử',
    school: 'THPT Chuyên Nguyễn Trãi',
    createdAt: '2026-01-15'
  },
  {
    id: 'user_thay_nam',
    username: 'thay_nam',
    password: '123',
    name: 'Thầy Trần Văn Nam',
    role: 'teacher',
    subject: 'Toán Học - Vật Lý',
    school: 'THCS Lê Quý Đôn',
    createdAt: '2026-02-01'
  }
];

// Default Questions Palette
const SAMPLE_QUESTIONS = [
  {
    id: 'q1',
    question: 'Việt Nam nằm ở khu vực nào của Châu Á?',
    options: ['Đông Á', 'Đông Nam Á', 'Nam Á', 'Tây Nam Á'],
    correct: 'B',
    explanation: 'Việt Nam nằm ở khu vực Đông Nam Á.'
  },
  {
    id: 'q2',
    question: 'Đơn vị đo cường độ dòng điện trong hệ SI là gì?',
    options: ['Vôn (V)', 'Ampe (A)', 'Ohm (Ω)', 'Watt (W)'],
    correct: 'B',
    explanation: 'Ký hiệu là A (Ampe).'
  },
  {
    id: 'q3',
    question: 'Ai là tác giả của tác phẩm "Nam Quốc Sơn Hà"?',
    options: ['Lý Thường Kiệt', 'Trần Hưng Đạo', 'Nguyễn Trãi', 'Quang Trung'],
    correct: 'A',
    explanation: 'Được coi là bản Tuyên ngôn độc lập đầu tiên của Việt Nam.'
  },
  {
    id: 'q4',
    question: 'Hành tinh nào được gọi là Hành Tinh Đỏ?',
    options: ['Sao Kim', 'Sao Thủy', 'Sao Hỏa', 'Sao Mộc'],
    correct: 'C',
    explanation: 'Sao Hỏa có màu đỏ do chứa nhiều sắt oxit trên bề mặt.'
  },
  {
    id: 'q5',
    question: 'Số nguyên tố nhỏ nhất là số nào?',
    options: ['0', '1', '2', '3'],
    correct: 'C',
    explanation: '2 là số nguyên tố duy nhất chẵn và nhỏ nhất.'
  }
];

// Initial Seed Base Games
const INITIAL_BASE_GAMES = [
  {
    id: 'wheel-quiz',
    title: 'Vòng Quay May Mắn',
    subtitle: 'Quay Số Học Sinh & Đố Vui',
    category: 'Tương tác & Quay số',
    icon: '🎡',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
    description: 'Vòng quay sinh động chọn ngẫu nhiên học sinh trả lời câu hỏi đố vui tích điểm.',
    engineType: 'wheel',
    playsCount: 1420,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'tug-of-war-game',
    title: 'Kéo Co Kiến Thức 1',
    subtitle: 'Đua Thuyền & Đẩy Dây Theo Lượt',
    category: 'Đối kháng Đội nhóm',
    icon: '🪢',
    gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    description: 'Hai đội chia làm 2 bên, trả lời câu hỏi đúng và nhanh để kéo dây về phía đội mình.',
    engineType: 'tug-of-war',
    playsCount: 2310,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'tug-of-war-dual-game',
    title: 'Kéo Co Kiến Thức 2',
    subtitle: 'Đội Kháng 2 Bên Trả Lời Đồng Thời',
    category: 'Đối kháng Đội nhóm',
    icon: '⚔️',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #dc2626 100%)',
    description: 'Hai đội tự trả lời riêng câu hỏi bên phần màn hình của mình cùng lúc, kéo dây nảy lửa về phía đội mình!',
    engineType: 'tug-of-war-dual',
    playsCount: 3450,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'millionaire',
    title: 'Ai Là Triệu Phú',
    subtitle: 'Đấu Trí 15 Câu Hỏi Kịch Tính',
    category: 'Trắc nghiệm kịch tính',
    icon: '💰',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    description: 'Chinh phục thang thưởng 15 mốc câu hỏi với đầy đủ âm thanh kịch tính và quyền trợ giúp.',
    engineType: 'millionaire',
    playsCount: 3100,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'mystery-gift',
    title: 'Hộp Quà Bí Mật',
    subtitle: 'Mở Hộp Quà & Nhận Điểm Thưởng',
    category: 'Bất ngờ & May mắn',
    icon: '🎁',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
    description: 'Học sinh chọn các hộp quà bí ẩn, trả lời câu hỏi đúng để mở điểm thưởng hoặc quà may mắn.',
    engineType: 'mystery-box',
    playsCount: 1890,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'picture-flip',
    title: 'Lật Mảnh Ghép Bí Mật',
    subtitle: 'Giải Ô Mở Tranh',
    category: 'Khám phá bức ảnh',
    icon: '🖼️',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    description: 'Trả lời đúng các ô câu hỏi để lật mở từng mảnh mảnh ghép của bức ảnh chủ đề đằng sau.',
    engineType: 'picture-reveal',
    playsCount: 1650,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'crossword-lock',
    title: 'Ô Chữ Khóa Bí Mật',
    subtitle: 'Giải Ô Chữ Tìm Từ Khóa',
    category: 'Tư duy từ ngữ',
    icon: '🧩',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    description: 'Giải các câu hỏi hàng ngang để lật mở các chữ cái của Từ Khóa Bí Mật ở hàng dọc.',
    engineType: 'crossword',
    playsCount: 980,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'knowledge-train',
    title: 'Đoàn Tàu Tri Thức',
    subtitle: 'Kéo Thả Ghép Toa Tàu',
    category: 'Kéo thả thứ tự',
    icon: '🚂',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
    description: 'Kéo thả các toa tàu theo đúng thứ tự logic hoặc nối chuỗi câu hỏi với đáp án tương ứng.',
    engineType: 'train',
    playsCount: 1120,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'flashcard-match',
    title: 'Thẻ Ghi Nhớ Flashcard',
    subtitle: 'Lật Thẻ Ghép Cặp Khái Niệm',
    category: 'Ghi nhớ & Ghép cặp',
    icon: '🎴',
    gradient: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
    description: 'Lật mở các thẻ để ghép đúng cặp Thuật ngữ - Định nghĩa hoặc Câu hỏi - Đáp án.',
    engineType: 'flashcard',
    playsCount: 850,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'fruit-ninja-quiz',
    title: 'Chém Hoa Quả / Bắt Bong Bóng',
    subtitle: 'Chém Trái Cây Mang Đáp Án Đúng',
    category: 'Hành động & Phản xạ',
    icon: '🍉',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    description: 'Trắc nghiệm phản xạ sôi động: Chém các loại quả hoặc bắt bong bóng mang đáp án đúng.',
    engineType: 'fruit-ninja',
    playsCount: 2540,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'car-race-quiz',
    title: 'Đua Xe Kiến Thức',
    subtitle: 'Cuộc Đua Xe Tốc Độ Đố Vui',
    category: 'Đối kháng Đội nhóm',
    icon: '🏎️',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    description: 'Cuộc đua tốc độ 2-4 xe: Mỗi câu trả lời đúng giúp xe đua bứt phá tiến về đích.',
    engineType: 'car-race',
    playsCount: 1980,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'minesweeper-quiz',
    title: 'Dò Mìn Phiêu Lưu',
    subtitle: 'Vượt Bãi Mìn Giải Đố 3 Mạng',
    category: 'Thử thách phiêu lưu',
    icon: '💣',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    description: 'Vượt bãi mìn phiêu lưu với 3 mạng sống. Chọn đúng ô an toàn và giải đố để tích điểm.',
    engineType: 'minesweeper',
    playsCount: 1750,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'flying-words-quiz',
    title: 'Từ Ngữ Biết Bay',
    subtitle: 'Bắt Mây Chữ Ghép Thành Câu',
    category: 'Tư duy ngữ pháp',
    icon: '✈️',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    description: 'Bắt các mây từ đang bay trên bầu trời để sắp xếp đúng thứ tự ngữ pháp thành câu hoàn chỉnh.',
    engineType: 'flying-words',
    playsCount: 1320,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'matching-pairs-quiz',
    title: 'Kéo Thả Nối Ý',
    subtitle: 'Ghép Cặp Cột A & Cột B',
    category: 'Ghi nhớ & Ghép cặp',
    icon: '🔗',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    description: 'Tạo bài trắc nghiệm kéo thả nối ý: Ghép khái niệm Cột A với giải thích tương ứng Cột B.',
    engineType: 'matching-pairs',
    playsCount: 1460,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'duck-race-quiz',
    title: 'Đua Vịt Tri Thức',
    subtitle: 'Đua Vịt Bơi Sông Về Đích',
    category: 'Tương tác & Quay số',
    icon: '🦆',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    description: 'Cuộc đua vịt sinh động trên sông: Trả lời đố vui đúng để đẩy chú vịt của đội tiến về phao đích.',
    engineType: 'duck-race',
    playsCount: 2150,
    defaultQuestions: SAMPLE_QUESTIONS
  }
];

// Sample Initial Saved Teacher Games
const INITIAL_SAVED_GAMES = [
  {
    id: 'saved_1',
    userId: 'user_co_hoa',
    username: 'co_hoa',
    baseGameId: 'wheel-quiz',
    title: 'Vòng Quay Văn Học 10 - Tác Phẩm Dân Gian',
    subject: 'Ngữ Văn',
    grade: 'Lớp 10',
    description: 'Bộ câu hỏi ôn tập Ca dao, Tục ngữ và Thần thoại Việt Nam.',
    questions: [
      {
        id: 'sq1',
        question: 'Tác phẩm nào được coi là truyện thơ Nôm xuất sắc nhất của Nguyễn Du?',
        options: ['Truyện Kiều', 'Lục Vân Tiên', 'Chinh Phụ Ngâm', 'Cung Oán Ngâm Khúc'],
        correct: 'A',
        explanation: 'Truyện Kiều (Đoạn trường tân thanh) là kiệt tác của Nguyễn Du.'
      },
      {
        id: 'sq2',
        question: 'Nhân vật chính trong sử thi "Đăm Săn" thuộc dân tộc nào?',
        options: ['Mường', 'Ê-đê', 'Tày', 'H’Mông'],
        correct: 'B',
        explanation: 'Sử thi Đăm Săn là của người Ê-đê ở Tây Nguyên.'
      },
      {
        id: 'sq3',
        question: 'Bánh chưng, bánh giầy gắn liền với vị vua Hùng nào?',
        options: ['Hùng Vương thứ 1', 'Hùng Vương thứ 6', 'Hùng Vương thứ 18', 'Hùng Vương thứ 10'],
        correct: 'B',
        explanation: 'Gắn liền với sự tích Lang Liêu thời Hùng Vương thứ 6.'
      }
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'saved_2',
    userId: 'user_thay_nam',
    username: 'thay_nam',
    baseGameId: 'tug-of-war-game',
    title: 'Kéo Co Toán 9 - Ôn Tập Hàm Số & Hình Học',
    subject: 'Toán Học',
    grade: 'Lớp 9',
    description: 'Bộ đố vui Toán 9 dành cho lớp 9A1 thi đua cuối tuần.',
    questions: [
      {
        id: 'sq10',
        question: 'Đồ thị của hàm số y = ax + b (a ≠ 0) là hình gì?',
        options: ['Đường thẳng', 'Đường Parabol', 'Đường tròn', 'Đường elip'],
        correct: 'A',
        explanation: 'Hàm số bậc nhất có đồ thị là một đường thẳng.'
      },
      {
        id: 'sq11',
        question: 'Căn bậc hai số học của 81 là bao nhiêu?',
        options: ['-9', '9', '±9', '81'],
        correct: 'B',
        explanation: 'Căn bậc hai số học luôn là số không âm √81 = 9.'
      },
      {
        id: 'sq12',
        question: 'Tổng ba góc trong một tam giác bằng bao nhiêu độ?',
        options: ['90°', '180°', '270°', '360°'],
        correct: 'B',
        explanation: 'Định lý tổng 3 góc trong tam giác luôn bằng 180°.'
      }
    ],
    updatedAt: '2026-02-12'
  }
];

export const StorageService = {
  // Init storage if clean or auto-sync new base games
  init: () => {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
    
    // Auto-sync missing base games into localStorage
    const existingBaseStr = localStorage.getItem(BASE_GAMES_KEY);
    if (!existingBaseStr) {
      localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(INITIAL_BASE_GAMES));
    } else {
      try {
        const storedGames = JSON.parse(existingBaseStr);
        const storedIds = new Set(storedGames.map(g => g.id));
        let updated = false;
        INITIAL_BASE_GAMES.forEach(bg => {
          if (!storedIds.has(bg.id)) {
            storedGames.push(bg);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(storedGames));
        }
      } catch (e) {
        localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(INITIAL_BASE_GAMES));
      }
    }

    if (!localStorage.getItem(SAVED_GAMES_KEY)) {
      localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(INITIAL_SAVED_GAMES));
    }
    if (!localStorage.getItem(CURRENT_USER_KEY)) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(INITIAL_USERS[1])); // Default: Cô Hoa
    }
  },

  // Current User
  getCurrentUser: () => {
    StorageService.init();
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch (e) {
      return INITIAL_USERS[1];
    }
  },

  setCurrentUser: (user) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  // Users Management
  getUsers: () => {
    StorageService.init();
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  createUser: (userData) => {
    const users = StorageService.getUsers();
    const newUser = {
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      role: 'teacher',
      ...userData
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  updateUser: (userId, updatedData) => {
    let users = StorageService.getUsers();
    users = users.map(u => u.id === userId ? { ...u, ...updatedData } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  deleteUser: (userId) => {
    let users = StorageService.getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Base Games (Store Catalog)
  getBaseGames: () => {
    StorageService.init();
    return JSON.parse(localStorage.getItem(BASE_GAMES_KEY) || '[]');
  },

  addBaseGame: (gameData) => {
    const games = StorageService.getBaseGames();
    const newGame = {
      id: `game_${Date.now()}`,
      playsCount: 0,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      icon: '🎮',
      ...gameData
    };
    games.unshift(newGame);
    localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(games));
    return newGame;
  },

  // Teacher Saved Games
  getTeacherSavedGames: (userId) => {
    StorageService.init();
    const allSaved = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || '[]');
    if (!userId) return allSaved;
    return allSaved.filter(g => g.userId === userId);
  },

  saveTeacherGame: (savedGameData) => {
    StorageService.init();
    const allSaved = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || '[]');
    const existingIndex = allSaved.findIndex(g => g.id === savedGameData.id);
    
    const gameToSave = {
      updatedAt: new Date().toISOString().split('T')[0],
      ...savedGameData
    };

    if (!gameToSave.id) {
      gameToSave.id = `saved_${Date.now()}`;
      allSaved.unshift(gameToSave);
    } else if (existingIndex >= 0) {
      allSaved[existingIndex] = gameToSave;
    } else {
      allSaved.unshift(gameToSave);
    }

    localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(allSaved));
    return gameToSave;
  },

  deleteTeacherGame: (gameId) => {
    StorageService.init();
    let allSaved = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || '[]');
    allSaved = allSaved.filter(g => g.id !== gameId);
    localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(allSaved));
  }
};
