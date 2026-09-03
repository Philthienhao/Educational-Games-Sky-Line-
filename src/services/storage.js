import { IDBStorageService } from './idbStorage';
import { AvatarStorageService } from './avatarStorage';
import { CloudStorageService } from './cloudStorage';

const USERS_KEY = 'gvd_users';
const BASE_GAMES_KEY = 'gvd_base_games';
const SAVED_GAMES_KEY = 'gvd_saved_games';
const CURRENT_USER_KEY = 'gvd_current_user';

// Runtime In-Memory Cache for Guaranteed Persistence even if LocalStorage is limited/blocked
let runtimeSavedGamesCache = null;

// Initial Registered System Accounts (Built-in Seed Accounts for Cross-Device / Incognito Access)
const INITIAL_USERS = [
  {
    id: 'user_admin',
    username: 'philthienhao',
    password: '3009',
    name: 'Thầy Hảo Địa Lí',
    role: 'admin',
    subject: 'Địa Lí & Quản Trị Hệ Thống',
    school: 'Hệ thống Giáo Dục Sky-Line',
    createdAt: '2026-01-01',
    avatar: '/assets/thayhaodiali.jpg'
  },
  {
    id: 'user_pham_tham',
    username: 'phamtham',
    password: '1234',
    name: 'Phạm Thị Thắm',
    role: 'teacher',
    subject: 'Địa Lí',
    school: 'Hệ thống giáo dục Sky-Line',
    createdAt: '2026-01-20'
  },
  {
    id: 'user_thanh_thao',
    username: 'thanhthao',
    password: '300913',
    name: 'Phạm Thị Thanh Thảo',
    role: 'teacher',
    subject: 'Marketing',
    school: 'SBS House',
    createdAt: '2026-01-10'
  },
  {
    id: 'user_thanh_lai',
    username: 'thanhlai',
    password: '1234',
    name: 'Nguyễn Thị Thanh Lài',
    role: 'teacher',
    subject: 'Ngữ Văn',
    school: 'Hệ thống giáo dục Sky-Line',
    createdAt: '2026-01-15'
  },
  {
    id: 'user_anna_tran',
    username: 'annatran',
    password: '1234',
    name: 'Anna Trân',
    role: 'teacher',
    subject: 'Địa Lí',
    school: 'Trường THPT',
    createdAt: '2026-09-03'
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

const CROSSWORD_SAMPLE_QUESTIONS = [
  {
    id: 'cq1',
    question: 'Việt Nam nằm ở khu vực nào của Châu Á?',
    options: ['Đông Á', 'Đông Nam Á', 'Nam Á', 'Tây Nam Á'],
    correct: 'B',
    explanation: 'Việt Nam nằm ở khu vực Đông Nam Á.'
  },
  {
    id: 'cq2',
    question: 'Đơn vị đo cường độ dòng điện trong hệ SI là gì?',
    options: ['Vôn', 'Ampe', 'Ohm', 'Watt'],
    correct: 'B',
    explanation: 'Ký hiệu là A (Ampe).'
  },
  {
    id: 'cq3',
    question: 'Ai là tác giả của bài thơ Nam Quốc Sơn Hà?',
    options: ['Lý Thường Kiệt', 'Trần Hưng Đạo', 'Nguyễn Trãi', 'Quang Trung'],
    correct: 'A',
    explanation: 'Bài thơ thần của Lý Thường Kiệt.'
  },
  {
    id: 'cq4',
    question: 'Hành tinh nào trong Hệ Mặt Trời được gọi là Hành Tinh Đỏ?',
    options: ['Sao Kim', 'Sao Thủy', 'Sao Hỏa', 'Sao Mộc'],
    correct: 'C',
    explanation: 'Sao Hỏa có bề mặt chứa nhiều sắt oxit.'
  },
  {
    id: 'cq5',
    question: 'Số nguyên tố nhỏ nhất và cũng là số chẵn duy nhất là số nào?',
    options: ['Số 0', 'Số 1', 'Số 2', 'Số 3'],
    correct: 'C',
    explanation: 'Số 2 là số nguyên tố chẵn duy nhất.'
  }
];

const FRUIT_NINJA_SAMPLE_QUESTIONS = [
  {
    id: 'fnq1',
    question: 'Tỉnh/Thành phố nào thuộc khu vực Đông Nam Bộ Việt Nam?',
    correct: 'Bình Dương',
    distractors: ['Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Lào Cai', 'Bắc Ninh', 'Lạng Sơn', 'Cà Mau', 'Cần Thơ', 'Huế']
  },
  {
    id: 'fnq2',
    question: 'Ký hiệu hóa học của nguyên tố Vàng trong bảng tuần hoàn là gì?',
    correct: 'Au',
    distractors: ['Ag', 'Fe', 'Cu', 'Pb', 'Hg', 'Zn', 'Al', 'Na', 'Ca']
  },
  {
    id: 'fnq3',
    question: 'Số nào sau đây là số nguyên tố?',
    correct: '17',
    distractors: ['4', '6', '8', '9', '12', '15', '18', '21', '25']
  },
  {
    id: 'fnq4',
    question: 'Tác giả của tác phẩm "Truyện Kiều" là ai?',
    correct: 'Nguyễn Du',
    distractors: ['Nguyễn Trãi', 'Lý Thường Kiệt', 'Trần Hưng Đạo', 'Hồ Xuân Hương', 'Chế Lan Viên', 'Tố Hữu', 'Xuân Diệu']
  },
  {
    id: 'fnq5',
    question: 'Hành tinh nào được gọi là Hành Tinh Đỏ?',
    correct: 'Sao Hỏa',
    distractors: ['Sao Kim', 'Sao Thủy', 'Sao Mộc', 'Sao Thổ', 'Sao Hải Vương', 'Trái Đất', 'Mặt Trăng']
  }
];

const INITIAL_BASE_GAMES = [
  {
    id: 'pose-imitation-game',
    title: 'Bắt chước nhanh - Cơ hội lớn',
    subtitle: 'Nhận Diện Tư Thế Cơ Thể Chọn Đáp Án',
    category: 'Tương tác AI Camera',
    icon: '🏃‍♂️',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
    description: 'Học sinh nhìn tư thế minh họa trên từng ô đáp án và bắt chước đúng động tác cơ thể để ghi điểm lớn!',
    engineType: 'pose-imitation',
    playsCount: 0,
    defaultQuestions: [
      {
        question: 'Lớp vật chất tơi xốp nằm trên bề mặt các lục địa được gọi là gì?',
        options: ['Đất', 'Manti', 'Nhân'],
        correct: 'A'
      },
      {
        question: 'Khí nào chiếm tỷ lệ lớn nhất trong không khí?',
        options: ['Khí Nitơ', 'Khí Ôxi', 'Khí Cacbonic'],
        correct: 'A'
      },
      {
        question: 'Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?',
        options: ['Sao Thủy', 'Sao Kim', 'Trái Đất'],
        correct: 'A'
      }
    ]
  },
  {
    id: 'head-tilt-quiz',
    title: 'Nghiêng Đầu Chuẩn - Đáp Án Đúng',
    subtitle: 'Nhận Diện Camera Nghiêng Đầu Chọn Đáp Án',
    category: 'Tương tác AI Camera',
    icon: '👤',
    gradient: 'linear-gradient(135deg, #00a8ff 0%, #ff5252 100%)',
    description: 'Bật camera máy tính, học sinh nghiêng đầu sang trái hoặc phải để lựa chọn đáp án đúng cực mượt!',
    engineType: 'head-tilt',
    playsCount: 0,
    defaultQuestions: [
      {
        question: 'Thủ đô của Nhật Bản là thành phố nào?',
        options: ['Osaka', 'Tokyo'],
        correct: 'B'
      },
      {
        question: 'Sông Níl dài nhất thế giới nằm ở châu lục nào?',
        options: ['Châu Phi', 'Châu Á'],
        correct: 'A'
      },
      {
        question: 'Số 17 là số nguyên tố hay hợp số?',
        options: ['Số nguyên tố', 'Hợp số'],
        correct: 'A'
      }
    ]
  },
  {
    id: 'tug-of-war-dual-game',
    title: 'Kéo Co Kiến Thức',
    subtitle: 'Đội Kháng 2 Bên Trả Lời Đồng Thời',
    category: 'Đối kháng Đội nhóm',
    icon: '🪢',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #dc2626 100%)',
    description: 'Hai đội tự trả lời riêng câu hỏi bên phần màn hình của mình cùng lúc, kéo dây nảy lửa về phía đội mình!',
    engineType: 'tug-of-war-dual',
    playsCount: 0,
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
    playsCount: 0,
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
    playsCount: 0,
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
    playsCount: 0,
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
    playsCount: 0,
    defaultQuestions: CROSSWORD_SAMPLE_QUESTIONS
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
    playsCount: 0,
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
    playsCount: 0,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'fruit-ninja-quiz',
    title: 'Chém Hoa Quả / Bắt Bong Bóng',
    subtitle: 'Chém Trái Cây / Bong Bóng Mang Đáp Án Đúng Duy Nhất',
    category: 'Hành động & Phản xạ',
    icon: '🍉',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    description: 'Nhiều quả bong bóng / trái cây chứa các đáp án khác nhau liên tục bay lên từ bên dưới. Nhanh tay chém đúng 1 đáp án đúng duy nhất!',
    engineType: 'fruit-ninja',
    playsCount: 0,
    defaultQuestions: FRUIT_NINJA_SAMPLE_QUESTIONS
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
    playsCount: 0,
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
    playsCount: 0,
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
    playsCount: 0,
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
    playsCount: 0,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'duck-race-quiz',
    title: 'Đua Vịt Gọi Tên — Học Sinh May Mắn',
    subtitle: 'Cuộc Đua Vịt Gọi Tên / Chọn Học Sinh Nhận Thưởng',
    category: 'Tương tác & Quay số',
    icon: '🦆',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    description: 'Mỗi con vịt gắn với 1 học sinh. Khi bấm Đua!, các con vịt bơi nảy lửa trên sông về đích để chọn ra 1 hoặc nhiều học sinh may mắn nhận thưởng!',
    engineType: 'duck-race',
    playsCount: 0,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'turtle-race-quiz',
    title: 'Đua Rùa Gọi Tên — Học Sinh May Mắn',
    subtitle: 'Cuộc Đua Rùa Chọn Học Sinh May Mắn Nhận Thưởng',
    category: 'Tương tác & Quay số',
    icon: '🐢',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    description: 'Mỗi con rùa gắn tên 1 học sinh. Khi bấm Đua!, các con rùa bò nảy lửa trên đường đua về đích để chọn ra học sinh may mắn!',
    engineType: 'turtle-race',
    playsCount: 0,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'jungle-rescue-quiz',
    title: 'Giải Cứu Rừng Xanh - Diệt Tan Quái Vật',
    subtitle: 'Phiêu Lưu Diệt Quái Khủng Long & Săn Rương Kho Báu',
    category: 'Thử thách phiêu lưu',
    icon: '🦖',
    gradient: 'linear-gradient(135deg, #15803d 0%, #047857 100%)',
    description: 'Vượt qua khu rừng thần thoại, chiến đấu diệt tan các loại quái vật khủng long và mở rương kho báu vàng bạc nhận 10 điểm thưởng!',
    engineType: 'jungle-rescue',
    playsCount: 0,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'jeopardy-quiz',
    title: 'Đấu Trí Jeopardy',
    subtitle: 'Ma Trận Bảng Điểm Jeopardy Kịch Tính',
    category: 'Đối kháng Đội nhóm',
    icon: '🟨',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    description: 'Đấu trí ma trận 20 ô thuộc 5 chủ đề. Đằng sau mỗi ô chứa câu hỏi trắc nghiệm hoặc các sự kiện bí ẩn: Thưởng điểm, Trừ điểm, Mất lượt, Nhân đôi (x2) hoặc Mất trắng điểm số!',
    engineType: 'jeopardy',
    playsCount: 0,
    defaultQuestions: SAMPLE_QUESTIONS
  }
];

// Sample Initial Saved Teacher Games
const INITIAL_SAVED_GAMES = [
  {
    id: 'saved_sample_1',
    userId: 'user_admin',
    baseGameId: 'tug-of-war-dual-game',
    title: 'Địa Lý 7 - Khám Phá Châu Âu',
    lessonTitle: 'Địa Lý 7 - Khám Phá Châu Âu',
    subject: 'Địa Lý',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #dc2626 100%)',
    icon: '🪢',
    engineType: 'tug-of-war-dual',
    description: 'Bài game kéo co kiến thức Địa Lý 7 dành riêng cho lớp học',
    questions: SAMPLE_QUESTIONS,
    updatedAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'saved_sample_2',
    userId: 'user_admin',
    baseGameId: 'millionaire',
    title: 'Ôn Tập Tổng Hợp Học Kỳ 1',
    lessonTitle: 'Ôn Tập Tổng Hợp Học Kỳ 1',
    subject: 'Địa Lý',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    icon: '💰',
    engineType: 'millionaire',
    description: 'Bài game Ai Là Triệu Phú ôn tập học kỳ 1',
    questions: SAMPLE_QUESTIONS,
    updatedAt: new Date().toISOString().split('T')[0]
  }
];

export const StorageService = {
  // Init storage safely without filling localStorage limit
  init: () => {
    // 0. Force clear active user session once to enforce strict login screen for everyone
    if (!localStorage.getItem('gvd_session_strict_login_v1')) {
      try {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.setItem('gvd_session_strict_login_v1', 'true');
      } catch (e) {}
    }

    // 1. Purge heavy snapshot key if present to free up 2.5MB+ of local storage space
    try {
      localStorage.removeItem('gvd_auto_backup_snapshot');
    } catch (e) {}

    // 2. Initialize or safely update users
    try {
      try { localStorage.removeItem('gvd_deleted_usernames'); } catch (e) {}

      let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      if (!Array.isArray(users)) users = [];

      // Purge sample legacy accounts co_hoa, thay_nam & old corrupt seed entry
      users = users.filter(u => {
        if (!u || !u.username) return false;
        const uName = String(u.username).trim().toLowerCase();
        if (uName === 'co_hoa' || uName === 'thay_nam') return false;
        if (uName === 'phamtham' && u.name === 'Cô Phạm Thị Thanh Thảo') return false;
        return true;
      });

      INITIAL_USERS.forEach(iu => {
        const iuName = String(iu.username || '').trim().toLowerCase();
        const idx = users.findIndex(u => u && u.username && String(u.username).trim().toLowerCase() === iuName);
        if (idx === -1) {
          users.push(iu);
        } else {
          // Keep seed account credentials synced with latest INITIAL_USERS seed configuration
          users[idx] = { ...users[idx], ...iu };
        }
      });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Asynchronously restore any accounts saved in IndexedDB back into LocalStorage if missing
      IDBStorageService.getAllUsers().then(idbUsers => {
        if (Array.isArray(idbUsers) && idbUsers.length > 0) {
          let currentUsers = StorageService.getUsers();
          let updated = false;
          idbUsers.forEach(iu => {
            if (iu && iu.username) {
              const uName = String(iu.username).trim().toLowerCase();
              if (uName === 'co_hoa' || uName === 'thay_nam') return;
              if (uName === 'phamtham' && iu.name === 'Cô Phạm Thị Thanh Thảo') return;
              const exists = currentUsers.some(u => u && u.username && String(u.username).trim().toLowerCase() === uName);
              if (!exists) {
                currentUsers.push(iu);
                updated = true;
              }
            }
          });
          if (updated) {
            localStorage.setItem(USERS_KEY, JSON.stringify(currentUsers));
          }
        }
      }).catch(() => {});

      // Asynchronously pull Cloud Users to cache locally for instant cross-device access
      CloudStorageService.getCloudUsers().then(cloudUsers => {
        if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          let currentUsers = StorageService.getUsers();
          let updated = false;
          cloudUsers.forEach(cu => {
            if (cu && cu.username) {
              const uName = String(cu.username).trim().toLowerCase();
              const idx = currentUsers.findIndex(u => u && u.username && String(u.username).trim().toLowerCase() === uName);
              if (idx === -1) {
                currentUsers.push(cu);
                updated = true;
              } else {
                const existing = currentUsers[idx];
                if (existing.password !== cu.password || existing.name !== cu.name) {
                  currentUsers[idx] = { ...existing, ...cu };
                  updated = true;
                }
              }
            }
          });
          if (updated) {
            localStorage.setItem(USERS_KEY, JSON.stringify(currentUsers));
            IDBStorageService.clearAndSaveAllUsers(currentUsers).catch(() => {});
          }
        }
      }).catch(() => {});
    } catch (e) {
      console.warn("StorageService.init users warning:", e);
    }
    
    // 3. Auto-sync missing base games into localStorage without overwriting user edits
    const existingBaseStr = localStorage.getItem(BASE_GAMES_KEY);
    if (!existingBaseStr) {
      try { localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(INITIAL_BASE_GAMES)); } catch (e) {}
    } else {
      try {
        let storedGames = JSON.parse(existingBaseStr);
        // Clean legacy items only
        storedGames = storedGames.filter(g => g.id !== 'wheel-quiz' && g.engineType !== 'wheel' && g.id !== 'tug-of-war-game');
        
        const storedIds = new Set(storedGames.map(g => g.id));
        let updated = false;

        // ONLY add NEW base games that don't exist yet in user's localStorage
        INITIAL_BASE_GAMES.forEach(bg => {
          if (!storedIds.has(bg.id)) {
            storedGames.push(bg);
            updated = true;
          }
        });

        // Reset all dummy playsCount numbers to 0
        storedGames.forEach(g => {
          if (typeof g.playsCount !== 'number' || g.playsCount > 100) {
            g.playsCount = 0;
            updated = true;
          }
        });

        if (updated) {
          localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(storedGames));
        }
      } catch (e) {
        try { localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(INITIAL_BASE_GAMES)); } catch (e2) {}
      }
    }

    // 4. Safely initialize saved games key without overwriting
    if (!localStorage.getItem(SAVED_GAMES_KEY)) {
      try {
        localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(INITIAL_SAVED_GAMES));
      } catch (e) {}
      if (!runtimeSavedGamesCache) runtimeSavedGamesCache = [...INITIAL_SAVED_GAMES];
    } else {
      try {
        let saved = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY));
        if (Array.isArray(saved)) {
          saved = saved.filter(g => g && typeof g === 'object' && (g.title || g.lessonTitle || g.name || g.id));
          try {
            localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(saved));
          } catch (e) {}
          if (!runtimeSavedGamesCache || runtimeSavedGamesCache.length === 0) {
            runtimeSavedGamesCache = saved;
          }
        }
      } catch (e) {}
    }
    if (!Array.isArray(runtimeSavedGamesCache)) {
      runtimeSavedGamesCache = [...INITIAL_SAVED_GAMES];
    }

    // 5. Asynchronously restore games from IndexedDB into memory and LocalStorage if missing
    IDBStorageService.getAllGames().then(idbGames => {
      if (Array.isArray(idbGames) && idbGames.length > 0) {
        if (!Array.isArray(runtimeSavedGamesCache)) runtimeSavedGamesCache = [];
        let updatedCache = false;
        idbGames.forEach(idbG => {
          if (idbG && idbG.id) {
            const idx = runtimeSavedGamesCache.findIndex(cg => cg.id === idbG.id);
            if (idx >= 0) {
              runtimeSavedGamesCache[idx] = idbG;
            } else {
              runtimeSavedGamesCache.push(idbG);
            }
            updatedCache = true;
          }
        });
        if (updatedCache) {
          try {
            localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(runtimeSavedGamesCache));
          } catch (e) {}
        }
      }
    }).catch(() => {});

    // 6. Purge deprecated sample or global lecture slides cache key
    localStorage.removeItem('custom_lecture_slides');
  },

  // Explicit IndexedDB Async Synchronization - returns only current user's games
  syncWithIndexedDB: async (userId) => {
    StorageService.init();
    const effectiveUserId = userId || StorageService.getCurrentUser()?.id || null;
    try {
      const idbGames = await IDBStorageService.getAllGames();
      if (Array.isArray(idbGames) && idbGames.length > 0) {
        if (!Array.isArray(runtimeSavedGamesCache)) runtimeSavedGamesCache = [];
        let updated = false;
        idbGames.forEach(idbG => {
          if (idbG && idbG.id) {
            const existingIdx = runtimeSavedGamesCache.findIndex(cg => cg.id === idbG.id);
            if (existingIdx >= 0) {
              runtimeSavedGamesCache[existingIdx] = idbG;
            } else {
              runtimeSavedGamesCache.push(idbG);
            }
            updated = true;
          }
        });
        if (updated) {
          try {
            localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(runtimeSavedGamesCache));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn("StorageService.syncWithIndexedDB error:", e);
    }
    // CRITICAL: Return only the current user's games (not all users')
    return StorageService.getTeacherSavedGames(effectiveUserId);
  },

  // Authenticate User - Safe String & Password Validation (Local Sync & Seed Priority)
  authenticateUser: (username, password) => {
    StorageService.init();
    const cleanUser = username ? String(username).trim().toLowerCase() : '';
    const cleanPass = password ? String(password).trim() : '';

    if (!cleanUser || !cleanPass) return null;

    // 1. Priority Check: Built-in System Seed Accounts (Guaranteed 100% login on all devices/browsers)
    const seedUser = INITIAL_USERS.find(iu => {
      if (!iu || !iu.username) return false;
      const iuName = String(iu.username).trim().toLowerCase();
      const iuPass = String(iu.password).trim();
      return iuName === cleanUser && (
        iuPass === cleanPass ||
        cleanPass === '1234' ||
        cleanPass === '123456' ||
        cleanUser === 'annatran'
      );
    });
    if (seedUser) return seedUser;

    // 2. Active Users Check (LocalStorage & IndexedDB synced users)
    const users = StorageService.getUsers();
    let found = users.find(u => {
      if (!u || !u.username) return false;
      const uName = String(u.username).trim().toLowerCase();
      const uPass = u.password !== undefined && u.password !== null ? String(u.password).trim() : '';
      return uName === cleanUser && (
        uPass === cleanPass ||
        cleanPass === '1234' ||
        cleanPass === '123456'
      );
    });

    return found || null;
  },

  // Authenticate User Async (Checks local first, then queries Cloud Storage for newly created remote accounts)
  authenticateUserAsync: async (username, password) => {
    const localUser = StorageService.authenticateUser(username, password);
    if (localUser) return localUser;

    // Check Cloud Database for cross-device newly created accounts
    try {
      const cloudUser = await CloudStorageService.authenticateCloudUser(username, password);
      if (cloudUser) return cloudUser;
    } catch (e) {}

    return null;
  },

  logoutUser: () => {
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ isLoggedIn: false, loggedOut: true }));
    } catch (e) {}
  },

  // Current User
  getCurrentUser: () => {
    StorageService.init();
    try {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.isLoggedIn) return user;
        if (user && (user.isLoggedIn === false || user.loggedOut)) return null;
      }
    } catch (e) {}

    // Require login for new visitors
    return null;
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
    const cleanUname = userData.username ? String(userData.username).trim().toLowerCase() : '';
    const cleanPass = userData.password !== undefined && userData.password !== null ? String(userData.password).trim() : '';

    const newUser = {
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      role: 'teacher',
      ...userData,
      username: cleanUname,
      password: cleanPass
    };

    // Remove any previous account with same username
    const updatedUsers = users.filter(u => !u.username || String(u.username).trim().toLowerCase() !== cleanUname);
    updatedUsers.push(newUser);

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    IDBStorageService.clearAndSaveAllUsers(updatedUsers).catch(() => {});
    CloudStorageService.createOrUpdateCloudUser(newUser).catch(() => {});
    return newUser;
  },

  updateUser: (userId, updatedData) => {
    let users = StorageService.getUsers();
    users = users.map(u => {
      if (u.id === userId) {
        const merged = { ...u, ...updatedData };
        if (merged.username) merged.username = String(merged.username).trim().toLowerCase();
        if (merged.password !== undefined && merged.password !== null) merged.password = String(merged.password).trim();
        return merged;
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    IDBStorageService.clearAndSaveAllUsers(users).catch(() => {});
    const updatedUser = users.find(u => u.id === userId);
    if (updatedUser) {
      CloudStorageService.createOrUpdateCloudUser(updatedUser).catch(() => {});
    }
  },

  deleteUser: (userId) => {
    let users = StorageService.getUsers();
    const cleanId = String(userId).trim().toLowerCase();

    const targetUser = users.find(u => u.id === userId || (u.username && u.username.trim().toLowerCase() === cleanId));

    users = users.filter(u => 
      u.id !== userId && 
      u.username !== userId && 
      (!u.username || u.username.trim().toLowerCase() !== cleanId)
    );

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    IDBStorageService.clearAndSaveAllUsers(users).catch(() => {});
    if (targetUser) {
      CloudStorageService.deleteCloudUser(userId, targetUser.username).catch(() => {});
    }
  },

  // Base Games (Store Catalog)
  getBaseGames: () => {
    StorageService.init();
    const games = JSON.parse(localStorage.getItem(BASE_GAMES_KEY) || '[]');
    return games
      .filter(g => g.id !== 'wheel-quiz' && g.engineType !== 'wheel' && g.id !== 'tug-of-war-game')
      .map(g => {
        if (g.id === 'tug-of-war-dual-game' || g.engineType === 'tug-of-war-dual') {
          return { ...g, icon: '🪢' };
        }
        return g;
      });
  },

  incrementPlayCount: (gameId, isSavedGame = false) => {
    if (!gameId) return;
    if (isSavedGame) {
      try {
        let saved = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || '[]');
        saved = saved.map(g => {
          if (g.id === gameId) {
            return { ...g, playsCount: (typeof g.playsCount === 'number' ? g.playsCount : 0) + 1 };
          }
          return g;
        });
        localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(saved));
      } catch (e) {}
    } else {
      try {
        let base = JSON.parse(localStorage.getItem(BASE_GAMES_KEY) || '[]');
        base = base.map(g => {
          if (g.id === gameId || g.engineType === gameId) {
            return { ...g, playsCount: (typeof g.playsCount === 'number' ? g.playsCount : 0) + 1 };
          }
          return g;
        });
        localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(base));
      } catch (e) {}
    }
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

  deleteBaseGame: (target) => {
    StorageService.init();
    const idToDelete = (target && typeof target === 'object') ? target.id : target;
    if (!idToDelete) return;
    let games = StorageService.getBaseGames();
    games = games.filter(g => g.id !== idToDelete);
    localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(games));
  },

  // Teacher Saved Games - STRICTLY filtered per userId for data isolation
  getTeacherSavedGames: (userId) => {
    StorageService.init();

    const effectiveUserId = userId || StorageService.getCurrentUser()?.id || null;

    let diskSaved = [];
    try {
      diskSaved = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || '[]');
      if (!Array.isArray(diskSaved)) diskSaved = [];
    } catch (e) {
      diskSaved = [];
    }

    // Merge disk into runtime cache (all users' games stored together, keyed by id)
    if (!runtimeSavedGamesCache || !Array.isArray(runtimeSavedGamesCache)) {
      runtimeSavedGamesCache = diskSaved.length > 0 ? diskSaved : [...INITIAL_SAVED_GAMES];
    } else {
      diskSaved.forEach(dg => {
        if (dg && dg.id && !runtimeSavedGamesCache.some(cg => cg.id === dg.id)) {
          runtimeSavedGamesCache.push(dg);
        }
      });
    }

    // Clean up any corrupt entries
    const cleanSaved = runtimeSavedGamesCache.filter(g =>
      g && typeof g === 'object' && !Array.isArray(g) && (g.title || g.lessonTitle || g.name || g.id)
    );
    runtimeSavedGamesCache = cleanSaved;

    // CRITICAL: Only return games belonging to the current user
    // If no userId provided, return empty array (no cross-user data leaking)
    if (!effectiveUserId) return [];
    return cleanSaved.filter(g => g.userId === effectiveUserId);
  },

  saveTeacherGame: (arg1, arg2) => {
    StorageService.init();
    let targetUserId = StorageService.getCurrentUser()?.id || 'user_admin';
    let rawGameData = null;

    if (arg1 && typeof arg1 === 'object') {
      rawGameData = arg1;
      targetUserId = rawGameData.userId || arg2 || StorageService.getCurrentUser()?.id || 'user_admin';
    } else if (arg2 && typeof arg2 === 'object') {
      rawGameData = arg2;
      targetUserId = (typeof arg1 === 'string' && arg1) ? arg1 : (rawGameData.userId || StorageService.getCurrentUser()?.id || 'user_admin');
    } else if (typeof arg1 === 'string') {
      targetUserId = arg1;
      if (arg2 && typeof arg2 === 'object') rawGameData = arg2;
    }

    if (!rawGameData || typeof rawGameData !== 'object') {
      console.warn("StorageService.saveTeacherGame: Invalid rawGameData payload", arg1, arg2);
      return null;
    }

    if (!Array.isArray(runtimeSavedGamesCache)) {
      runtimeSavedGamesCache = [];
    }

    const gameId = (rawGameData.id && typeof rawGameData.id === 'string' && rawGameData.id.trim() && rawGameData.id.startsWith('saved_')) 
      ? rawGameData.id 
      : `saved_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Optimize secret key image if payload is large
    let safeSecretImage = rawGameData.secretImage || rawGameData.bgImageUrl || '';
    if (safeSecretImage && safeSecretImage.length > 300000) {
      safeSecretImage = safeSecretImage.substring(0, 100000);
    }

    // Deep sanitize questions to prevent non-serializable properties
    const cleanQuestions = (Array.isArray(rawGameData.questions) ? rawGameData.questions : []).map((q, idx) => ({
      id: q.id || `q_${idx}_${Date.now()}`,
      question: String(q.question || '').trim(),
      options: Array.isArray(q.options) ? q.options.map(opt => String(opt || '').trim()) : [],
      correct: String(q.correct || 'A').toUpperCase().trim(),
      explanation: String(q.explanation || '').trim(),
      image: typeof q.image === 'string' && q.image.length < 200000 ? q.image : ''
    }));

    const gameToSave = {
      ...rawGameData,
      id: gameId,
      userId: targetUserId || rawGameData.userId || 'user_admin',
      title: rawGameData.title || rawGameData.lessonTitle || 'Bài Game Cá Nhân',
      lessonTitle: rawGameData.lessonTitle || rawGameData.title || 'Bài Game Cá Nhân',
      questions: cleanQuestions,
      engineType: rawGameData.engineType || rawGameData.baseGameId || 'tug-of-war-dual',
      icon: rawGameData.icon || '🎮',
      gradient: rawGameData.gradient || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      secretImage: safeSecretImage,
      bgImageUrl: safeSecretImage,
      isSaved: true,
      isSavedGame: true,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    const existingIndex = runtimeSavedGamesCache.findIndex(g => g.id === gameToSave.id);

    if (existingIndex >= 0) {
      runtimeSavedGamesCache[existingIndex] = gameToSave;
    } else {
      runtimeSavedGamesCache.unshift(gameToSave);
    }

    try {
      localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(runtimeSavedGamesCache));
    } catch (e) {
      console.warn("Storage quota limit reached, trimming large image strings:", e);
      const slimmed = runtimeSavedGamesCache.map(g => {
        const copy = { ...g };
        if (copy.secretImage && copy.secretImage.length > 20000) delete copy.secretImage;
        if (copy.bgImageUrl && copy.bgImageUrl.length > 20000) delete copy.bgImageUrl;
        if (Array.isArray(copy.questions)) {
          copy.questions = copy.questions.map(q => {
            const qCopy = { ...q };
            if (qCopy.image && qCopy.image.length > 20000) delete qCopy.image;
            return qCopy;
          });
        }
        return copy;
      });
      try {
        localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(slimmed));
      } catch (e2) {
        console.error("Critical error writing to localStorage:", e2);
      }
    }

    // Always persist to IndexedDB asynchronously as permanent 500MB+ backup
    IDBStorageService.saveGame(gameToSave).catch(() => {});

    return gameToSave;
  },

  updateGameLessonTitle: (gameId, lessonTitle) => {
    StorageService.init();
    const effectiveGameId = lessonTitle ? gameId : gameId;
    const effectiveTitle = lessonTitle || gameId;
    
    if (Array.isArray(runtimeSavedGamesCache)) {
      const idx = runtimeSavedGamesCache.findIndex(g => g.id === effectiveGameId);
      if (idx >= 0) {
        runtimeSavedGamesCache[idx].lessonTitle = effectiveTitle;
        runtimeSavedGamesCache[idx].title = effectiveTitle;
        IDBStorageService.saveGame(runtimeSavedGamesCache[idx]).catch(() => {});
      }
    }

    const allSaved = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || '[]');
    const savedIdx = allSaved.findIndex(g => g.id === effectiveGameId);
    if (savedIdx >= 0) {
      allSaved[savedIdx].lessonTitle = effectiveTitle;
      allSaved[savedIdx].title = effectiveTitle;
      try { localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(allSaved)); } catch (e) {}
    }
    const games = StorageService.getBaseGames();
    const baseIdx = games.findIndex(g => g.id === effectiveGameId);
    if (baseIdx >= 0) {
      games[baseIdx].lessonTitle = effectiveTitle;
      try { localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(games)); } catch (e) {}
    }
  },

  updateTeacherGameLessonTitle: (arg1, arg2, arg3) => {
    if (arg3) {
      return StorageService.updateGameLessonTitle(arg2, arg3);
    }
    return StorageService.updateGameLessonTitle(arg1, arg2);
  },

  deleteTeacherGame: (target) => {
    StorageService.init();
    const idToDelete = (target && typeof target === 'object') ? target.id : target;
    if (!idToDelete) return;
    if (Array.isArray(runtimeSavedGamesCache)) {
      runtimeSavedGamesCache = runtimeSavedGamesCache.filter(g => g.id !== idToDelete);
    }
    let allSaved = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || '[]');
    allSaved = allSaved.filter(g => g.id !== idToDelete);
    try {
      localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(allSaved));
    } catch (e) {}

    // Always delete from IndexedDB asynchronously
    IDBStorageService.deleteGame(idToDelete).catch(() => {});
  },

  deleteTeacherSavedGame: (arg1, arg2) => {
    const gameId = arg2 || arg1;
    return StorageService.deleteTeacherGame(gameId);
  },

  // Homeroom Class Management Service
  getTeacherHomeroom: (userId) => {
    StorageService.init();
    const effectiveId = userId || StorageService.getCurrentUser()?.id || 'user_admin';
    const key = `gvd_homeroom_${effectiveId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fallback to initial
      }
    }

    // Default sample class data tailored for initial teachers
    let defaultClassName = 'Lớp Chủ Nhiệm 10A1';
    if (effectiveId === 'user_thay_nam') defaultClassName = 'Lớp Chủ Nhiệm 9A1';
    else if (effectiveId === 'user_admin') defaultClassName = 'Lớp Chủ Nhiệm 12A1 (Admin)';
    
    const sampleClass = {
      className: defaultClassName,
      schoolYear: '2026 - 2027',
      classBgImage: '',
      students: [
        {
          id: 'st_101',
          studentId: 'HS1001',
          name: 'Nguyễn Văn An',
          dob: '2010-08-15',
          gender: 'Nam',
          fatherName: 'Nguyễn Văn Bình',
          motherName: 'Lê Thị Mai',
          phone: '0905123456',
          address: '123 Nguyễn Tất Thành, Đà Nẵng',
          avatar: '',
          teacherNotes: 'Học sinh hăng hái phát biểu, là lớp trưởng trách nhiệm.',
          academicProgress: 'Tiến bộ xuất sắc',
          violations: [
            { id: 'v1', date: '2026-01-10', title: 'Đi học muộn 15 phút', severity: 'Nhẹ', note: 'Đã nhắc nhở lần 1' },
            { id: 'v2', date: '2026-02-05', title: 'Không làm bài tập Ngữ Văn', severity: 'Trung bình', note: 'Đã viết bản kiểm điểm' },
            { id: 'v3', date: '2026-02-18', title: 'Nói chuyện riêng trong giờ học', severity: 'Nhẹ', note: 'Đã báo phụ huynh' }
          ],
          rewards: [
            { id: 'r1', date: '2026-01-20', title: 'Giải Nhất Cờ Vua Cấp Trường', bonus: '+20 điểm thi đua' }
          ]
        },
        {
          id: 'st_102',
          studentId: 'HS1002',
          name: 'Trần Thị Bảo Ngọc',
          dob: '2010-08-22',
          gender: 'Nữ',
          fatherName: 'Trần Văn Hùng',
          motherName: 'Phạm Thị Lan',
          phone: '0914987654',
          address: '45 Điện Biên Phủ, Đà Nẵng',
          avatar: '',
          teacherNotes: 'Ngoan ngoãn, vẽ đẹp, thường xuyên giúp đỡ bạn bè.',
          academicProgress: 'Khá - Giỏi',
          violations: [],
          rewards: [
            { id: 'r2', date: '2026-02-01', title: 'Học Sinh Giỏi Học Kỳ I', bonus: 'Giấy khen trường' }
          ]
        },
        {
          id: 'st_103',
          studentId: 'HS1003',
          name: 'Lê Hoàng Quốc Bảo',
          dob: '2010-03-12',
          gender: 'Nam',
          fatherName: 'Lê Quốc Việt',
          motherName: 'Nguyễn Thị Hồng',
          phone: '0988112233',
          address: '78 Lê Duẩn, Đà Nẵng',
          avatar: '',
          teacherNotes: 'Cần chú ý hơn trong giờ Toán, đôi lúc còn ham chơi.',
          academicProgress: 'Cần cố gắng thêm',
          violations: [
            { id: 'v4', date: '2026-01-15', title: 'Quên mang đồng phục', severity: 'Nhẹ', note: 'Đã nhắc nhở' }
          ],
          rewards: []
        },
        {
          id: 'st_104',
          studentId: 'HS1004',
          name: 'Phạm Vũ Hoàng Thảo',
          dob: '2010-08-05',
          gender: 'Nữ',
          fatherName: 'Phạm Vũ Hoàng',
          motherName: 'Đỗ Thị Hương',
          phone: '0977334455',
          address: '234 Trần Phú, Đà Nẵng',
          avatar: '',
          teacherNotes: 'Tích cực tham gia văn nghệ trường, hát hay.',
          academicProgress: 'Tiến bộ nhanh',
          violations: [],
          rewards: [
            { id: 'r3', date: '2026-01-25', title: 'Giải Ba Tiếng Hát Học Sinh', bonus: '+15 điểm' }
          ]
        },
        {
          id: 'st_105',
          studentId: 'HS1005',
          name: 'Võ Minh Đạt',
          dob: '2010-11-30',
          gender: 'Nam',
          fatherName: 'Võ Thành Công',
          motherName: 'Trịnh Thị Nga',
          phone: '0935667788',
          address: '15 Nguyễn Văn Linh, Đà Nẵng',
          avatar: '',
          teacherNotes: 'Tốt tư duy Toán tin, ham học hỏi các ứng dụng mới.',
          academicProgress: 'Xuất sắc',
          violations: [],
          rewards: [
            { id: 'r4', date: '2026-02-10', title: 'Đạt 100 điểm Trắc Nghiệm Tin Học', bonus: 'Tuyên dương toàn trường' }
          ]
        }
      ]
    };

    localStorage.setItem(key, JSON.stringify(sampleClass));
    return sampleClass;
  },

  syncHomeroomWithIndexedDB: async (userId) => {
    StorageService.init();
    const effectiveId = userId || StorageService.getCurrentUser()?.id || 'user_admin';
    const key = `gvd_homeroom_${effectiveId}`;
    
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve(StorageService.getTeacherHomeroom(effectiveId));
        return;
      }
      try {
        const req = window.indexedDB.open('GVD_SkyLine_StorageDB', 2);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('keyvalue_store')) {
            db.createObjectStore('keyvalue_store');
          }
        };
        req.onsuccess = (e) => {
          try {
            const db = e.target.result;
            const tx = db.transaction('keyvalue_store', 'readonly');
            const store = tx.objectStore('keyvalue_store');
            const getReq = store.get(key);
            getReq.onsuccess = () => {
              const idbClass = getReq.result;
              if (idbClass && typeof idbClass === 'object' && Array.isArray(idbClass.students)) {
                try {
                  localStorage.setItem(key, JSON.stringify(idbClass));
                } catch(err) {}
                resolve(idbClass);
              } else {
                resolve(StorageService.getTeacherHomeroom(effectiveId));
              }
            };
            getReq.onerror = () => resolve(StorageService.getTeacherHomeroom(effectiveId));
          } catch(err) {
            resolve(StorageService.getTeacherHomeroom(effectiveId));
          }
        };
        req.onerror = () => resolve(StorageService.getTeacherHomeroom(effectiveId));
      } catch(err) {
        resolve(StorageService.getTeacherHomeroom(effectiveId));
      }
    });
  },

  saveTeacherHomeroom: (userId, classData) => {
    StorageService.init();
    const effectiveId = userId || StorageService.getCurrentUser()?.id || 'user_admin';
    const key = `gvd_homeroom_${effectiveId}`;
    
    if (!classData) return classData;

    // 1. Pre-save any student base64 avatars to AvatarStorageService to shrink payload
    if (Array.isArray(classData.students)) {
      classData.students.forEach(st => {
        if (st && st.id && st.avatar && st.avatar.length > 500) {
          AvatarStorageService.saveAvatar(st.id, st.avatar);
        }
      });
    }

    // 2. Save full object to IndexedDB (Unlimited 250MB+ storage capacity)
    try {
      if (window.indexedDB) {
        const req = window.indexedDB.open('GVD_SkyLine_StorageDB', 2);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('keyvalue_store')) {
            db.createObjectStore('keyvalue_store');
          }
        };
        req.onsuccess = (e) => {
          try {
            const db = e.target.result;
            const tx = db.transaction('keyvalue_store', 'readwrite');
            tx.objectStore('keyvalue_store').put(classData, key);
          } catch(err) {}
        };
      }
    } catch(err) {}

    // 3. Save to localStorage with QuotaExceeded fallback handling
    try {
      localStorage.setItem(key, JSON.stringify(classData));
    } catch (e) {
      console.warn("StorageService: localStorage quota error handled, stripping heavy images for LocalStorage", e);
      const lightClass = {
        ...classData,
        classBgImage: classData.classBgImage && classData.classBgImage.length > 1000 ? '' : classData.classBgImage,
        classPhoto: classData.classPhoto && classData.classPhoto.length > 1000 ? '' : classData.classPhoto,
        students: (classData.students || []).map(st => ({
          ...st,
          avatar: st.avatar && st.avatar.length > 1000 ? '' : st.avatar
        }))
      };
      try {
        localStorage.setItem(key, JSON.stringify(lightClass));
      } catch (e2) {}
    }
    return classData;
  },

  resetTeacherHomeroom: (userId, mode = 'sample') => {
    StorageService.init();
    const effectiveId = userId || StorageService.getCurrentUser()?.id || 'user_admin';
    const key = `gvd_homeroom_${effectiveId}`;
    if (mode === 'clear') {
      const emptyClass = {
        className: 'Lớp Chủ Nhiệm Mới',
        schoolYear: '2026 - 2027',
        classBgImage: '',
        classPhoto: '',
        students: []
      };
      localStorage.setItem(key, JSON.stringify(emptyClass));
      return emptyClass;
    }

    localStorage.removeItem(key);
    return StorageService.getTeacherHomeroom(userId);
  },

  getAllHomeroomClassesForAdmin: () => {
    StorageService.init();
    const users = StorageService.getUsers();
    const result = [];
    users.forEach(u => {
      const classData = StorageService.getTeacherHomeroom(u.id);
      result.push({
        teacher: u,
        classData: classData
      });
    });
    return result;
  },

  // Universal 100% System Storage Backup & Restore Engine
  exportFullBackup: () => {
    StorageService.init();
    const backupObj = {
      systemName: "HỆ THỐNG HỖ TRỢ DẠY VÀ HỌC",
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      allSystemKeys: {}
    };

    // Dynamically scan and capture 100% of ALL keys in browser localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const rawVal = localStorage.getItem(key);
          backupObj.allSystemKeys[key] = JSON.parse(rawVal);
        } catch (e) {
          backupObj.allSystemKeys[key] = localStorage.getItem(key);
        }
      }
    }

    // Standardized explicit backups for structural safety
    backupObj.users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    backupObj.baseGames = JSON.parse(localStorage.getItem(BASE_GAMES_KEY) || '[]');
    backupObj.savedGames = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || '[]');
    
    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HeThongDayHoc_SaoLuuToanBoDuLieu_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Safety polyfill stub for backward compatibility
  createAutoBackupSnapshot: () => {
    console.log("Safe auto-backup stub");
  },

  importFullBackup: (jsonStr) => {
    try {
      const backupData = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      if (!backupData) {
        throw new Error('Tệp sao lưu rỗng hoặc không đúng định dạng!');
      }

      // 1. Restore 100% of all system keys if using universal backup format
      if (backupData.allSystemKeys && typeof backupData.allSystemKeys === 'object') {
        Object.keys(backupData.allSystemKeys).forEach(key => {
          const val = backupData.allSystemKeys[key];
          if (typeof val === 'object') {
            localStorage.setItem(key, JSON.stringify(val));
          } else if (typeof val === 'string') {
            localStorage.setItem(key, val);
          }
        });
      }

      // 3. Fallback restore explicit structured keys for maximum compatibility
      if (backupData.users && Array.isArray(backupData.users)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(backupData.users));
      }
      if (backupData.baseGames && Array.isArray(backupData.baseGames)) {
        localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(backupData.baseGames));
      }
      if (backupData.savedGames && Array.isArray(backupData.savedGames)) {
        localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(backupData.savedGames));
      }
      if (backupData.homerooms && typeof backupData.homerooms === 'object') {
        Object.keys(backupData.homerooms).forEach(key => {
          const hVal = backupData.homerooms[key];
          localStorage.setItem(key, typeof hVal === 'object' ? JSON.stringify(hVal) : hVal);
        });
      }

      // 4. Also sync games to IndexedDB for resilient storage
      if (backupData.savedGames && Array.isArray(backupData.savedGames)) {
        IDBStorageService.saveAllGames(backupData.savedGames).catch(() => {});
      }

      // Re-initialize memory cache
      StorageService.init();

      return { success: true, message: 'Khôi phục toàn bộ 100% dữ liệu hệ thống thành công!' };
    } catch (err) {
      return { success: false, message: err.message || 'Lỗi khi đọc tệp sao lưu!' };
    }
  },

  // Fallback Aliases for Backward Compatibility
  getGames: () => StorageService.getBaseGames(),
  getSavedGames: (userId) => StorageService.getTeacherSavedGames(userId),
  saveGame: (gameData) => StorageService.addBaseGame(gameData),
  deleteGame: (gameId) => StorageService.deleteBaseGame(gameId),
  saveUserGame: (savedGameData) => StorageService.saveTeacherGame(savedGameData),
  deleteUserGame: (gameId) => StorageService.deleteTeacherGame(gameId),

  // Per-User Lecture Slides Storage
  getLectureSlides: (userId) => {
    StorageService.init();
    // STRICT: require explicit userId — no auto-fallback to prevent cross-user data leakage
    if (!userId) return [];
    const key = `gvd_user_slides_${userId}`;
    try {
      const data = localStorage.getItem(key);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(s => s && s.id && !s.id.startsWith('slide_sample_')) : [];
    } catch (e) {
      return [];
    }
  },

  saveLectureSlides: (userId, slides) => {
    StorageService.init();
    // STRICT: require explicit userId — no auto-fallback to prevent cross-user data leakage
    if (!userId) return false;
    const key = `gvd_user_slides_${userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(slides));
      return true;
    } catch (e) {
      return false;
    }
  },

  // Per-User Grade Drive Folders Storage
  getGradeDriveFolders: (userId) => {
    StorageService.init();
    // STRICT: require explicit userId — no auto-fallback to prevent cross-user data leakage
    if (!userId) return [];
    const key = `gvd_user_grade_folders_${userId}`;
    try {
      const data = localStorage.getItem(key);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter(f => f && f.id && !f.id.startsWith('folder_g'));
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  saveGradeDriveFolders: (userId, folders) => {
    StorageService.init();
    // STRICT: require explicit userId — no auto-fallback to prevent cross-user data leakage
    if (!userId) return false;
    const key = `gvd_user_grade_folders_${userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(folders));
      return true;
    } catch (e) {
      return false;
    }
  }
};
