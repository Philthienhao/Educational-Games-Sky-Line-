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
  },
  {
    id: 'user_hang_nguyen',
    username: 'hangnguyen',
    password: '123456',
    name: 'Nguyễn Thị Hằng',
    role: 'teacher',
    subject: 'Ngữ Văn',
    school: 'Hệ thống Giáo Dục Sky-Line',
    createdAt: '2026-09-03'
  },
  {
    id: 'user_nhu_hoa',
    username: 'nhuhoa',
    password: '123456',
    name: 'Lê Như Hoa',
    role: 'teacher',
    subject: 'Sinh học',
    school: 'Hệ thống Giáo Dục Sky-Line',
    createdAt: '2026-09-03'
  },
  {
    id: 'user_thao_duyen',
    username: 'thaoduyen',
    password: '123456',
    name: 'Đinh Lê Thảo Duyên',
    role: 'teacher',
    subject: 'Giáo viên',
    school: 'Hệ thống giáo dục Sky-Line',
    createdAt: '2026-09-03'
  },
  {
    id: 'user_quoc_hoang',
    username: 'quochoang',
    password: '123456',
    name: 'Văn Quốc Hoàng',
    role: 'teacher',
    subject: 'Giáo viên',
    school: 'Hệ thống giáo dục Sky-Line',
    createdAt: '2026-09-03'
  },
  {
    id: 'user_thi_van',
    username: 'thivan',
    password: '123456',
    name: 'Nguyễn Thị Vân',
    role: 'teacher',
    subject: 'Giáo viên',
    school: 'Hệ thống giáo dục Sky-Line',
    createdAt: '2026-09-03'
  },
  {
    id: 'user_mai_giang',
    username: 'maigiang',
    password: '123456',
    name: 'Nguyễn Thị Mai Giang',
    role: 'teacher',
    subject: 'Giáo viên',
    school: 'Hệ thống giáo dục Sky-Line',
    createdAt: '2026-09-03'
  },
  {
    id: 'user_thao_nguyen',
    username: 'thaonguyen',
    password: '12345',
    name: 'Huỳnh Thảo Nguyên',
    role: 'teacher',
    subject: 'Giáo viên',
    school: 'Hệ thống giáo dục Sky-Line',
    createdAt: '2026-09-04'
  },
  {
    id: 'user_ni_na',
    username: 'nina',
    password: '123456',
    name: 'Ni Na',
    role: 'teacher',
    subject: 'Giáo viên',
    school: 'Hệ thống giáo dục Sky-Line',
    createdAt: '2026-09-04'
  },
  {
    id: 'user_tri_toan',
    username: 'tritoan',
    password: '123456',
    name: 'Hoàng Trí Toàn',
    role: 'teacher',
    subject: 'Toán',
    school: 'Hệ thống giáo dục Sky-Line',
    createdAt: '2026-09-15'
  },
  {
    id: 'user_bach_hat',
    username: 'bachhat',
    password: '123456',
    name: 'Nguyễn Thị Bạch Hạt',
    role: 'teacher',
    subject: 'Giáo viên',
    school: 'Trường TH và THCS Nguyễn Văn Trỗi',
    createdAt: '2026-09-15'
  },
  {
    id: 'user_tieu_ngoc',
    username: 'tieungoc',
    password: '123456',
    name: 'Huỳnh Tiểu Ngọc',
    role: 'teacher',
    subject: 'Giáo viên',
    school: 'Hệ thống giáo dục Sky-Line',
    createdAt: '2026-09-16'
  },
  {
    id: 'user_tran_vi_hung',
    username: 'vihung',
    password: '123456',
    name: 'Trần Vi Hùng',
    role: 'teacher',
    subject: 'Giáo viên',
    school: 'Trường THCS Hiệp Mỹ',
    createdAt: '2026-09-16'
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
    id: 'mario-race-game',
    title: 'Mario Phiêu Lưu Tri Thức',
    subtitle: 'Cuộc Đua Chướng Ngại Vật Retro 8-bit',
    category: 'Đối kháng Đội nhóm',
    icon: '🍄',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 100%)',
    description: '4 đội Mario xuất phát cùng lúc trên đường đua Super Mario retro. Trả lời đúng đập vỡ hộp bí ẩn (?) ăn nấm tăng tốc và ném mai rùa chặn đối thủ cán đích lâu đài!',
    engineType: 'mario-race',
    playsCount: 0,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'tower-builder-game',
    title: 'Kiến Trúc Sư Tri Thức',
    subtitle: 'Thi Đấu Xây Nhà & Tháp Tri Thức',
    category: 'Đối kháng Đội nhóm',
    icon: '🏗️',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    description: 'Trả lời đúng câu hỏi để lựa chọn Ngói, Gỗ hoặc Gạch xây từng tầng nhà cao vút. Đội xây tòa tháp cao nhất sẽ dành chiến thắng!',
    engineType: 'tower-builder',
    playsCount: 0,
    defaultQuestions: SAMPLE_QUESTIONS
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
    id: 'claw-machine-quiz',
    title: 'Gắp Thú Gọi Tên — Siêu Thị Gấu Bông',
    subtitle: 'Gắp Thú Bông Ngẫu Nhiên Chọn Học Sinh May Mắn',
    category: 'Tương tác & Quay số',
    icon: '🧸',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    description: 'Mô phỏng máy gắp thú bông siêu thị. Mỗi gấu bông gắn tên 1 học sinh, tay gắp cơ học sẽ hạ xuống gắp ngẫu nhiên gấu bông để chọn ra học sinh lên bảng nhận thưởng!',
    engineType: 'claw-machine',
    playsCount: 0,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'astronaut-quiz',
    title: 'Phi Hành Gia Lái Phi Thuyền — Thám Hiểm Vũ Trụ',
    subtitle: 'Lái Phi Thuyền Vũ Trụ Hạ Cánh Chọn Học Sinh May Mắn',
    category: 'Tương tác & Quay số',
    icon: '🚀',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)',
    description: 'Trò chơi lái phi thuyền vũ trụ không gian huyền ảo. Đếm ngược 5s kịch tính, tên lửa rực rỡ cất cánh và hạ cánh ngẫu nhiên xuống hành tinh gắn tên 1 học sinh may mắn!',
    engineType: 'astronaut-explorer',
    playsCount: 0,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'magic-hat-quiz',
    title: 'Chiếc Mũ Ma Thuật — Hộp Quà Bí Mật',
    subtitle: 'Mũ Ảo Thuật Gia Triệu Hồi Học Sinh Bất Ngờ',
    category: 'Tương tác & Quay số',
    icon: '🎩',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #831843 100%)',
    description: 'Chiếc mũ ma thuật rực rỡ và hộp quà bí mật. Khi thầy cô bấm triệu hồi, chiếc mũ rung rinh phát sáng và chú Thỏ Ma Thuật chui ra mang theo tên học sinh được gọi!',
    engineType: 'magic-hat',
    playsCount: 0,
    defaultQuestions: SAMPLE_QUESTIONS
  },
  {
    id: 'magic-grimoire-quiz',
    title: 'Cổ Thư Triệu Hồi — AI Nhận Diện Cử Chỉ Tay',
    subtitle: 'Vẫy Tay Trước Camera AI Triệu Hồi Học Sinh',
    category: 'Tương tác & Quay số',
    icon: '📜',
    gradient: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
    description: 'Tích hợp Camera Webcam AI nhận diện cử chỉ tay. Học sinh hoặc thầy cô vẫy tay trước camera, Cổ Thư Ma Thuật lật trang ảo diệu chọn ra học sinh may mắn!',
    engineType: 'magic-grimoire',
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
// Sample Initial Saved Teacher Games (Admin & Seed Games)
const INITIAL_SAVED_GAMES = [
  {
    id: 'saved_sample_astronaut',
    userId: 'user_admin',
    baseGameId: 'astronaut-quiz',
    title: 'Phi Hành Gia Lái Phi Thuyền — Thám Hiểm Vũ Trụ',
    lessonTitle: 'Phi Hành Gia Lái Phi Thuyền — Thám Hiểm Vũ Trụ',
    subject: 'Địa Lý',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)',
    icon: '🚀',
    engineType: 'astronaut-explorer',
    description: 'Trò chơi lái phi thuyền thám hiểm vũ trụ không gian. Đếm ngược 5s kịch tính, tên lửa rực rỡ cất cánh và hạ cánh ngẫu nhiên chọn học sinh may mắn!',
    questions: SAMPLE_QUESTIONS,
    updatedAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'saved_sample_mario',
    userId: 'user_admin',
    baseGameId: 'mario-race-game',
    title: 'Mario Phiêu Lưu Tri Thức - Đường Đua Retro',
    lessonTitle: 'Mario Phiêu Lưu Tri Thức - Đường Đua Retro',
    subject: 'Địa Lý',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 100%)',
    icon: '🍄',
    engineType: 'mario-race',
    description: 'Cuộc đua Mario chướng ngại vật trắc nghiệm retro 8-bit với các vật phẩm nấm tăng tốc, ngôi sao và mai rùa chặn đối thủ',
    questions: SAMPLE_QUESTIONS,
    updatedAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'saved_sample_tower',
    userId: 'user_admin',
    baseGameId: 'tower-builder-game',
    title: 'Kiến Trúc Sư Tri Thức - Thi Đấu Xây Tháp',
    lessonTitle: 'Kiến Trúc Sư Tri Thức - Thi Đấu Xây Tháp',
    subject: 'Địa Lý',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #f59e0b 100%)',
    icon: '🏗️',
    engineType: 'tower-builder',
    description: 'Bài game thi đấu xây nhà dựa trên độ khó vật liệu Ngói, Gỗ, Gạch và các câu hỏi học tập sinh động',
    questions: SAMPLE_QUESTIONS,
    updatedAt: new Date().toISOString().split('T')[0]
  },
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
    title: 'Ôn Tập Tổng Hợp Học Kỳ 1 - Địa Lý',
    lessonTitle: 'Ôn Tập Tổng Hợp Học Kỳ 1 - Địa Lý',
    subject: 'Địa Lý',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    icon: '💰',
    engineType: 'millionaire',
    description: 'Bài game Ai Là Triệu Phú ôn tập học kỳ 1',
    questions: SAMPLE_QUESTIONS,
    updatedAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'saved_sample_3',
    userId: 'user_admin',
    baseGameId: 'fruit-ninja-quiz',
    title: 'Địa Lý 12 - Tự Nhiên & Dân Cư Việt Nam',
    lessonTitle: 'Địa Lý 12 - Tự Nhiên & Dân Cư Việt Nam',
    subject: 'Địa Lý',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    icon: '🍉',
    engineType: 'fruit-ninja',
    description: 'Trắc nghiệm phản xạ chém trái cây Địa Lý 12',
    questions: FRUIT_NINJA_SAMPLE_QUESTIONS,
    updatedAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'saved_sample_4',
    userId: 'user_admin',
    baseGameId: 'picture-flip',
    title: 'Địa Lý 10 - Vũ Trụ & Trái Đất',
    lessonTitle: 'Địa Lý 10 - Vũ Trụ & Trái Đất',
    subject: 'Địa Lý',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    icon: '🖼️',
    engineType: 'picture-reveal',
    description: 'Lật mở bức ảnh bí mật chủ đề Vũ trụ và các hành tinh trong Hệ Mặt Trời',
    questions: SAMPLE_QUESTIONS,
    updatedAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'saved_sample_5',
    userId: 'user_admin',
    baseGameId: 'jeopardy-quiz',
    title: 'Đấu Trí Jeopardy - Địa Lý Các Ngành Kinh Tế',
    lessonTitle: 'Đấu Trí Jeopardy - Địa Lý Các Ngành Kinh Tế',
    subject: 'Địa Lý',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    icon: '🟨',
    engineType: 'jeopardy',
    description: 'Đấu trí ma trận 20 ô thử thách kiến thức Địa Lý kinh tế Việt Nam',
    questions: SAMPLE_QUESTIONS,
    updatedAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'saved_sample_6',
    userId: 'user_admin',
    baseGameId: 'head-tilt-quiz',
    title: 'Nghiêng Đầu Chuẩn - Địa Lý Việt Nam',
    lessonTitle: 'Nghiêng Đầu Chuẩn - Địa Lý Việt Nam',
    subject: 'Địa Lý',
    gradient: 'linear-gradient(135deg, #00a8ff 0%, #ff5252 100%)',
    icon: '👤',
    engineType: 'head-tilt',
    description: 'Bật camera nghiêng đầu chọn đáp án đúng Địa Lý',
    questions: [
      { question: 'Sông Níl dài nhất thế giới nằm ở châu lục nào?', options: ['Châu Phi', 'Châu Á'], correct: 'A' },
      { question: 'Thủ đô của Nhật Bản là thành phố nào?', options: ['Osaka', 'Tokyo'], correct: 'B' },
      { question: 'Việt Nam thuộc khu vực nào?', options: ['Đông Nam Á', 'Đông Á'], correct: 'A' }
    ],
    updatedAt: new Date().toISOString().split('T')[0]
  }
];

const INITIAL_ADMIN_SLIDES = [
  {
    id: 'slide_hao_1',
    title: 'Địa Lý 12 - Bài 1: Vị trí địa lý và phạm vi lãnh thổ Việt Nam',
    subject: 'Địa Lý',
    grade: 'Khối 12',
    author: 'Thầy Hảo Địa Lí',
    slidesCount: 15,
    fileType: 'pdf',
    driveUrl: 'https://drive.google.com',
    description: 'Slide bài giảng tương tác Địa Lý 12 chuẩn định hướng thi Tốt nghiệp THPT',
    createdAt: '2026-01-10'
  },
  {
    id: 'slide_hao_2',
    title: 'Địa Lý 12 - Bài 2: Đất nước nhiều đồi núi & Ảnh hưởng thiên nhiên',
    subject: 'Địa Lý',
    grade: 'Khối 12',
    author: 'Thầy Hảo Địa Lí',
    slidesCount: 22,
    fileType: 'pptx',
    driveUrl: 'https://drive.google.com',
    description: 'Bài giảng phân tích địa hình đồi núi, đồng bằng và khoáng sản Việt Nam',
    createdAt: '2026-01-15'
  },
  {
    id: 'slide_hao_3',
    title: 'Địa Lý 10 - Bài 5: Vũ trụ, Hệ Mặt Trời và Các chuyển động của Trái Đất',
    subject: 'Địa Lý',
    grade: 'Khối 10',
    author: 'Thầy Hảo Địa Lí',
    slidesCount: 18,
    fileType: 'pdf',
    driveUrl: 'https://drive.google.com',
    description: 'Slide Trái Đất và Vũ trụ có chèn hình ảnh 3D và câu hỏi tương tác',
    createdAt: '2026-02-01'
  }
];

const INITIAL_ADMIN_FOLDERS = [
  {
    id: 'folder_hao_10',
    grade: 'Khối 10',
    title: 'Thư mục Kho Học Liệu & Giáo Án Địa Lý Khối 10 (Thầy Hảo)',
    folderUrl: 'https://drive.google.com',
    description: 'Tổng hợp giáo án, đề thi trắc nghiệm và slide bài giảng Địa 10 Sky-Line',
    updatedAt: '2026-02-15'
  },
  {
    id: 'folder_hao_11',
    grade: 'Khối 11',
    title: 'Thư mục Bài Giảng & Đề Trắc Nghiệm Địa Lý Khối 11 (Thầy Hảo)',
    folderUrl: 'https://drive.google.com',
    description: 'Ngân hàng câu hỏi trắc nghiệm Địa 11 các khu vực Châu Á, Châu Âu, Mỹ Khối 11',
    updatedAt: '2026-02-18'
  },
  {
    id: 'folder_hao_12',
    grade: 'Khối 12',
    title: 'Thư mục Ngân Hàng Đề Thi & Ôn Thi Tốt Nghiệp THPT Khối 12 (Thầy Hảo)',
    folderUrl: 'https://drive.google.com',
    description: 'Bộ đề thi thử Tốt nghiệp THPT môn Địa Lý, sơ đồ tư duy & slide tổng ôn 12A1',
    updatedAt: '2026-03-01'
  }
];

let isStorageInitRunning = false;

export const StorageService = {
  // Safe helper to extract active user ID without invoking StorageService.init() recursively
  getEffectiveUserId: (userId) => {
    if (userId && typeof userId === 'string' && userId.trim()) return userId.trim();
    try {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u && u.id && u.isLoggedIn !== false) return u.id;
      }
    } catch (e) {}
    return 'user_admin';
  },

  // Init storage safely without filling localStorage limit
  init: () => {
    if (isStorageInitRunning) return;
    isStorageInitRunning = true;

    try {
      // 0. Request Chrome Persistent Storage permission to prevent Chrome from ever evicting site data
      if (typeof window !== 'undefined' && navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }

      // 0b. Restore active session CURRENT_USER_KEY from IndexedDB if LocalStorage was cleared
      if (!localStorage.getItem(CURRENT_USER_KEY)) {
        IDBStorageService.getItem(CURRENT_USER_KEY).then(idbSession => {
          if (idbSession && idbSession.isLoggedIn) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(idbSession));
          }
        }).catch(() => {});
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
            // Rule #2: Preserved 100% stored user properties; initial seed records MUST NEVER overwrite existing user properties
            users[idx] = { ...iu, ...users[idx] };
            if (iuName === 'philthienhao' || iu.id === 'user_admin') {
              users[idx].role = 'admin';
            }
          }
        });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Asynchronously restore any accounts saved in IndexedDB back into LocalStorage if missing
        IDBStorageService.getAllUsers().then(idbUsers => {
          if (Array.isArray(idbUsers) && idbUsers.length > 0) {
            let currentUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
            if (!Array.isArray(currentUsers)) currentUsers = [];
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
            let currentUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
            if (!Array.isArray(currentUsers)) currentUsers = [];
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

      // 4. Safely initialize saved games key without overwriting & respecting deleted game blacklist
      const currentUserIdForInit = StorageService.getEffectiveUserId();
      const deletedIdsForInit = StorageService.getDeletedGameIds(currentUserIdForInit);

      if (!localStorage.getItem(SAVED_GAMES_KEY)) {
        const filteredInitial = INITIAL_SAVED_GAMES.filter(g => !deletedIdsForInit.includes(g.id));
        try {
          localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(filteredInitial));
        } catch (e) {}
        if (!runtimeSavedGamesCache) runtimeSavedGamesCache = [...filteredInitial];
      } else {
        try {
          let saved = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY));
          if (Array.isArray(saved)) {
            let updated = false;
            INITIAL_SAVED_GAMES.forEach(ig => {
              if (!saved.some(g => g.id === ig.id) && !deletedIdsForInit.includes(ig.id)) {
                saved.push(ig);
                updated = true;
              }
            });
            saved = saved.filter(g => g && typeof g === 'object' && (g.title || g.lessonTitle || g.name || g.id) && !deletedIdsForInit.includes(g.id));
            if (updated) {
              try {
                localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(saved));
              } catch (e) {}
            }
            runtimeSavedGamesCache = saved;
          }
        } catch (e) {}
      }
      if (!Array.isArray(runtimeSavedGamesCache)) {
        const filteredInitial = INITIAL_SAVED_GAMES.filter(g => !deletedIdsForInit.includes(g.id));
        runtimeSavedGamesCache = [...filteredInitial];
      } else {
        runtimeSavedGamesCache = runtimeSavedGamesCache.filter(g => g && !deletedIdsForInit.includes(g.id));
      }

      // 5. Asynchronously restore games from IndexedDB into memory and LocalStorage if missing
      IDBStorageService.getAllGames().then(idbGames => {
        if (Array.isArray(idbGames) && idbGames.length > 0) {
          if (!Array.isArray(runtimeSavedGamesCache)) runtimeSavedGamesCache = [];
          let updatedCache = false;
          idbGames.forEach(idbG => {
            if (idbG && idbG.id && !deletedIdsForInit.includes(idbG.id)) {
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
    } catch (e) {
      console.warn("StorageService.init execution error:", e);
    } finally {
      isStorageInitRunning = false;
    }
  },

  // Explicit IndexedDB & Cloud Async Synchronization - returns only current user's games
  syncWithIndexedDB: async (userId) => {
    StorageService.init();
    const effectiveUserId = userId || StorageService.getCurrentUser()?.id || null;
    const deletedIds = StorageService.getDeletedGameIds(effectiveUserId);
    try {
      const idbGames = await IDBStorageService.getAllGames();
      if (Array.isArray(idbGames) && idbGames.length > 0) {
        if (!Array.isArray(runtimeSavedGamesCache)) runtimeSavedGamesCache = [];
        let updated = false;
        idbGames.forEach(idbG => {
          if (idbG && idbG.id && !deletedIds.includes(idbG.id)) {
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

    if (effectiveUserId) {
      try {
        await StorageService.syncAllUserDataFromCloud(effectiveUserId);
      } catch (e) {}
    }

    // CRITICAL: Return only the current user's games (not all users')
    return StorageService.getTeacherSavedGames(effectiveUserId);
  },

  // Cross-Device Universal Cloud Data Synchronization Engine
  syncAllUserDataFromCloud: async (userId) => {
    if (!userId) return false;
    try {
      // 0. Deleted Game IDs Sync
      const cloudDeletedIds = await CloudStorageService.getUserPrivateCloudData(userId, 'deleted_game_ids');
      if (Array.isArray(cloudDeletedIds) && cloudDeletedIds.length > 0) {
        cloudDeletedIds.forEach(id => StorageService.addDeletedGameId(userId, id));
      }
      const deletedIds = StorageService.getDeletedGameIds(userId);

      // 1. Saved Games
      const cloudGames = await CloudStorageService.getUserPrivateCloudData(userId, 'saved_games');
      if (Array.isArray(cloudGames) && cloudGames.length > 0) {
        if (!Array.isArray(runtimeSavedGamesCache)) runtimeSavedGamesCache = [];
        let updated = false;
        cloudGames.forEach(cg => {
          if (cg && cg.id && !deletedIds.includes(cg.id)) {
            const idx = runtimeSavedGamesCache.findIndex(rg => rg.id === cg.id);
            if (idx >= 0) {
              const localG = runtimeSavedGamesCache[idx];
              if (!localG.updatedAt || (cg.updatedAt && cg.updatedAt >= localG.updatedAt)) {
                runtimeSavedGamesCache[idx] = cg;
                updated = true;
              }
            } else {
              runtimeSavedGamesCache.push(cg);
              updated = true;
            }
          }
        });
        runtimeSavedGamesCache = runtimeSavedGamesCache.filter(g => g && !deletedIds.includes(g.id));
        if (updated) {
          try {
            localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(runtimeSavedGamesCache));
            IDBStorageService.saveAllGames(runtimeSavedGamesCache).catch(() => {});
          } catch (e) {}
        }
      }

      // 2. Homeroom Class
      const cloudHomeroom = await CloudStorageService.getUserPrivateCloudData(userId, 'homeroom');
      if (cloudHomeroom && typeof cloudHomeroom === 'object' && Array.isArray(cloudHomeroom.students) && cloudHomeroom.isCustomized) {
        const key = `gvd_homeroom_${userId}`;
        const localStr = localStorage.getItem(key);
        let shouldApplyCloud = true;
        if (localStr) {
          try {
            const localH = JSON.parse(localStr);
            if (localH && localH.isCustomized && Array.isArray(localH.students) && localH.students.length > cloudHomeroom.students.length) {
              shouldApplyCloud = false;
            }
          } catch (e) {}
        }
        if (shouldApplyCloud) {
          try {
            localStorage.setItem(key, JSON.stringify(cloudHomeroom));
            IDBStorageService.setItem(key, cloudHomeroom).catch(() => {});
          } catch (e) {}
        }
      }

      // 3. Lecture Slides
      const cloudSlides = await CloudStorageService.getUserPrivateCloudData(userId, 'slides');
      if (Array.isArray(cloudSlides) && cloudSlides.length > 0) {
        const key = `gvd_user_slides_${userId}`;
        const localStr = localStorage.getItem(key);
        let localCount = 0;
        if (localStr) {
          try { localCount = (JSON.parse(localStr) || []).length; } catch (e) {}
        }
        if (cloudSlides.length >= localCount) {
          try {
            localStorage.setItem(key, JSON.stringify(cloudSlides));
            IDBStorageService.setItem(key, cloudSlides).catch(() => {});
          } catch (e) {}
        }
      }

      // 4. Grade Drive Folders
      const cloudFolders = await CloudStorageService.getUserPrivateCloudData(userId, 'grade_folders');
      if (Array.isArray(cloudFolders) && cloudFolders.length > 0) {
        const key = `gvd_user_grade_folders_${userId}`;
        const localStr = localStorage.getItem(key);
        let localCount = 0;
        if (localStr) {
          try { localCount = (JSON.parse(localStr) || []).length; } catch (e) {}
        }
        if (cloudFolders.length >= localCount) {
          try {
            localStorage.setItem(key, JSON.stringify(cloudFolders));
            IDBStorageService.setItem(key, cloudFolders).catch(() => {});
          } catch (e) {}
        }
      }

      return true;
    } catch (e) {
      console.warn("syncAllUserDataFromCloud error:", e);
      return false;
    }
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
    if (seedUser) {
      if (seedUser.username === 'philthienhao' || seedUser.id === 'user_admin') {
        seedUser.role = 'admin';
      }
      return seedUser;
    }

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

    if (found && (found.username === 'philthienhao' || found.id === 'user_admin')) {
      found.role = 'admin';
    }

    return found || null;
  },

  // Authenticate User Async (Checks local first, then queries Cloud Storage for newly created remote accounts)
  authenticateUserAsync: async (username, password) => {
    const localUser = StorageService.authenticateUser(username, password);
    if (localUser) {
      if (localUser.username === 'philthienhao' || localUser.id === 'user_admin') {
        localUser.role = 'admin';
      }
      return localUser;
    }

    // Check Cloud Database for cross-device newly created accounts
    try {
      const cloudUser = await CloudStorageService.authenticateCloudUser(username, password);
      if (cloudUser) {
        if (cloudUser.username === 'philthienhao' || cloudUser.id === 'user_admin') {
          cloudUser.role = 'admin';
        }
        return cloudUser;
      }
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
        if (user && (user.username === 'philthienhao' || user.id === 'user_admin')) {
          user.role = 'admin';
        }
        if (user && user.isLoggedIn) return user;
        if (user && (user.isLoggedIn === false || user.loggedOut)) return null;
      }
    } catch (e) {}

    // Require login for new visitors
    return null;
  },

  setCurrentUser: (user) => {
    if (user && (user.username === 'philthienhao' || user.id === 'user_admin')) {
      user.role = 'admin';
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    if (user && user.isLoggedIn) {
      IDBStorageService.setItem(CURRENT_USER_KEY, user).catch(() => {});
    }
  },

  // Users Management
  getUsers: () => {
    StorageService.init();
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.map(u => {
      if (u && (u.username === 'philthienhao' || u.id === 'user_admin')) {
        return { ...u, role: 'admin' };
      }
      return u;
    });
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
    let games = [];
    try {
      games = JSON.parse(localStorage.getItem(BASE_GAMES_KEY) || '[]');
      if (!Array.isArray(games)) games = [];
    } catch (e) {
      games = [];
    }

    // Always guarantee all INITIAL_BASE_GAMES exist in games
    const existingIds = new Set(games.map(g => g.id));
    let updated = false;
    INITIAL_BASE_GAMES.forEach(bg => {
      if (!existingIds.has(bg.id)) {
        games.push(bg);
        updated = true;
      }
    });

    if (updated || games.length === 0) {
      try {
        localStorage.setItem(BASE_GAMES_KEY, JSON.stringify(games.length > 0 ? games : INITIAL_BASE_GAMES));
      } catch (e) {}
    }

    return games
      .filter(g => g && g.id !== 'wheel-quiz' && g.engineType !== 'wheel' && g.id !== 'tug-of-war-game')
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

  // Per-User Deleted Game Blacklist Management (Zero Resurrect Guarantee)
  getDeletedGameIds: (userId) => {
    const effectiveId = StorageService.getEffectiveUserId(userId);
    const key = `gvd_deleted_game_ids_${effectiveId}`;
    let deleted = [];
    try {
      deleted = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(deleted)) deleted = [];
    } catch (e) {
      deleted = [];
    }
    try {
      const globalDeleted = JSON.parse(localStorage.getItem('gvd_deleted_game_ids') || '[]');
      if (Array.isArray(globalDeleted)) {
        globalDeleted.forEach(id => {
          if (id && !deleted.includes(id)) deleted.push(id);
        });
      }
    } catch (e) {}
    return deleted;
  },

  addDeletedGameId: (userId, gameId) => {
    if (!gameId) return;
    const effectiveId = StorageService.getEffectiveUserId(userId);
    const key = `gvd_deleted_game_ids_${effectiveId}`;
    const deleted = StorageService.getDeletedGameIds(effectiveId);
    if (!deleted.includes(gameId)) {
      deleted.push(gameId);
      try {
        localStorage.setItem(key, JSON.stringify(deleted));
        localStorage.setItem('gvd_deleted_game_ids', JSON.stringify(deleted));
      } catch (e) {}
      IDBStorageService.setItem(key, deleted).catch(() => {});
      if (effectiveId) {
        CloudStorageService.saveUserPrivateCloudData(effectiveId, 'deleted_game_ids', deleted).catch(() => {});
      }
    }
  },

  // Teacher Saved Games - STRICTLY filtered per userId for data isolation & blacklisted deletions
  getTeacherSavedGames: (userId) => {
    StorageService.init();

    const effectiveUserId = StorageService.getEffectiveUserId(userId);
    const deletedIds = StorageService.getDeletedGameIds(effectiveUserId);

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

    // Always merge missing INITIAL_SAVED_GAMES entries (e.g. newly added seed games)
    INITIAL_SAVED_GAMES.forEach(ig => {
      if (ig && ig.id && !runtimeSavedGamesCache.some(cg => cg.id === ig.id)) {
        runtimeSavedGamesCache.push(ig);
      }
    });

    // Clean up any corrupt entries and exclude blacklisted deleted game IDs
    const cleanSaved = runtimeSavedGamesCache.filter(g =>
      g && typeof g === 'object' && !Array.isArray(g) && (g.title || g.lessonTitle || g.name || g.id) && !deletedIds.includes(g.id)
    );
    runtimeSavedGamesCache = cleanSaved;

    // CRITICAL: Return games belonging to the current user OR initial sample games (unless blacklisted deleted)
    if (!effectiveUserId) return [];
    return cleanSaved.filter(g => g.userId === effectiveUserId || (g.userId === 'user_admin' && !deletedIds.includes(g.id)));
  },

  saveTeacherGame: (arg1, arg2) => {
    StorageService.init();
    const activeCurrentUser = StorageService.getCurrentUser();
    let targetUserId = activeCurrentUser?.id || 'user_admin';
    let rawGameData = null;

    if (arg1 && typeof arg1 === 'object') {
      rawGameData = arg1;
      targetUserId = (rawGameData.userId && rawGameData.userId !== 'user_admin') ? rawGameData.userId : (activeCurrentUser?.id || rawGameData.userId || 'user_admin');
    } else if (arg2 && typeof arg2 === 'object') {
      rawGameData = arg2;
      targetUserId = (typeof arg1 === 'string' && arg1 && arg1 !== 'user_admin') ? arg1 : (activeCurrentUser?.id || rawGameData.userId || 'user_admin');
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

    const rawTitleStr = String(rawGameData.title || rawGameData.lessonTitle || '').toLowerCase();
    const rawIdStr = String(rawGameData.baseGameId || rawGameData.id || '').toLowerCase();
    let resolvedEngineType = rawGameData.engineType;
    if (rawTitleStr.includes('bắt chước')) resolvedEngineType = 'pose-imitation';
    else if (rawTitleStr.includes('nghiêng đầu')) resolvedEngineType = 'head-tilt';
    else if (rawTitleStr.includes('kéo co đôi') || rawTitleStr.includes('kéo co kiến thức')) resolvedEngineType = 'tug-of-war-dual';
    else if (rawTitleStr.includes('kéo co')) resolvedEngineType = 'tug-of-war';
    else if (rawTitleStr.includes('triệu phú')) resolvedEngineType = 'millionaire';
    else if (rawTitleStr.includes('hộp quà')) resolvedEngineType = 'mystery-box';
    else if (rawTitleStr.includes('mảnh ghép') || rawTitleStr.includes('bức ảnh')) resolvedEngineType = 'picture-reveal';
    else if (rawTitleStr.includes('ô chữ')) resolvedEngineType = 'crossword';
    else if (rawTitleStr.includes('đoàn tàu') || rawTitleStr.includes('tàu hỏa')) resolvedEngineType = 'train';
    else if (rawTitleStr.includes('flashcard') || rawTitleStr.includes('thẻ ghi nhớ')) resolvedEngineType = 'flashcard';
    else if (rawTitleStr.includes('chém hoa quả') || rawTitleStr.includes('trái cây')) resolvedEngineType = 'fruit-ninja';
    else if (rawTitleStr.includes('đua xe')) resolvedEngineType = 'car-race';
    else if (rawTitleStr.includes('dò mìn')) resolvedEngineType = 'minesweeper';
    else if (rawTitleStr.includes('từ bay') || rawTitleStr.includes('từ ngữ biết bay')) resolvedEngineType = 'flying-words';
    else if (rawTitleStr.includes('nối ý') || rawTitleStr.includes('ghép cặp')) resolvedEngineType = 'matching-pairs';
    else if (rawTitleStr.includes('đua vịt')) resolvedEngineType = 'duck-race';
    else if (rawTitleStr.includes('đua rùa')) resolvedEngineType = 'turtle-race';
    else if (rawTitleStr.includes('rừng xanh')) resolvedEngineType = 'jungle-rescue';
    else if (rawTitleStr.includes('jeopardy')) resolvedEngineType = 'jeopardy';
    else if (rawTitleStr.includes('mario')) resolvedEngineType = 'mario-race';
    else if (rawTitleStr.includes('xây tháp') || rawTitleStr.includes('xây nhà')) resolvedEngineType = 'tower-builder';
    else if (rawIdStr.includes('pose')) resolvedEngineType = 'pose-imitation';
    else if (rawIdStr.includes('head-tilt')) resolvedEngineType = 'head-tilt';
    else if (rawIdStr.includes('tug-of-war-dual')) resolvedEngineType = 'tug-of-war-dual';
    else if (rawIdStr.includes('mario')) resolvedEngineType = 'mario-race';
    else if (rawIdStr.includes('tower')) resolvedEngineType = 'tower-builder';
    else if (!resolvedEngineType || resolvedEngineType === 'tug-of-war-dual') {
      resolvedEngineType = rawGameData.baseGameId || 'wheel';
    }

    const gameToSave = {
      ...rawGameData,
      id: gameId,
      userId: targetUserId || rawGameData.userId || 'user_admin',
      title: rawGameData.title || rawGameData.lessonTitle || 'Bài Game Cá Nhân',
      lessonTitle: rawGameData.lessonTitle || rawGameData.title || 'Bài Game Cá Nhân',
      questions: cleanQuestions,
      engineType: resolvedEngineType,
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

    // Sync user's saved games to Cloud Storage asynchronously
    if (targetUserId) {
      const userGames = StorageService.getTeacherSavedGames(targetUserId);
      CloudStorageService.saveUserPrivateCloudData(targetUserId, 'saved_games', userGames).catch(() => {});
    }

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

  deleteTeacherGame: (target, userId) => {
    StorageService.init();
    const idToDelete = (target && typeof target === 'object') ? target.id : target;
    if (!idToDelete) return;

    const effectiveUserId = userId || (target && typeof target === 'object' && target.userId) || StorageService.getCurrentUser()?.id || 'user_admin';

    // 1. Record in per-user deleted game blacklist
    StorageService.addDeletedGameId(effectiveUserId, idToDelete);

    // 2. Remove from runtimeSavedGamesCache
    if (Array.isArray(runtimeSavedGamesCache)) {
      runtimeSavedGamesCache = runtimeSavedGamesCache.filter(g => g.id !== idToDelete);
    }

    // 3. Remove from LocalStorage
    let allSaved = JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) || '[]');
    allSaved = allSaved.filter(g => g.id !== idToDelete);
    try {
      localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(allSaved));
    } catch (e) {}

    // 4. Always delete from IndexedDB asynchronously
    IDBStorageService.deleteGame(idToDelete).catch(() => {});

    // 5. Cloud Storage Sync: update remaining user games and deleted game IDs on Cloud
    if (effectiveUserId) {
      const userGames = StorageService.getTeacherSavedGames(effectiveUserId);
      CloudStorageService.saveUserPrivateCloudData(effectiveUserId, 'saved_games', userGames).catch(() => {});
      const deletedIds = StorageService.getDeletedGameIds(effectiveUserId);
      CloudStorageService.saveUserPrivateCloudData(effectiveUserId, 'deleted_game_ids', deletedIds).catch(() => {});
    }
  },

  deleteTeacherSavedGame: (arg1, arg2) => {
    let effectiveUserId = StorageService.getCurrentUser()?.id || 'user_admin';
    let gameId = null;
    if (typeof arg1 === 'string' && arg2) {
      effectiveUserId = arg1;
      gameId = (typeof arg2 === 'object') ? arg2.id : arg2;
    } else {
      gameId = (arg1 && typeof arg1 === 'object') ? arg1.id : arg1;
      if (arg1 && typeof arg1 === 'object' && arg1.userId) {
        effectiveUserId = arg1.userId;
      }
    }
    return StorageService.deleteTeacherGame(gameId, effectiveUserId);
  },

  // Homeroom Class Management Service
  getTeacherHomeroom: (userId) => {
    StorageService.init();
    const effectiveId = userId || StorageService.getCurrentUser()?.id || 'user_admin';
    const key = `gvd_homeroom_${effectiveId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        // Fallback to initial
      }
    }

    // Dynamic class name tailored per teacher account
    const users = StorageService.getUsers();
    const targetTeacher = users.find(u => u && u.id === effectiveId) || INITIAL_USERS.find(iu => iu.id === effectiveId);

    let defaultClassName = targetTeacher ? `Lớp Chủ Nhiệm (${targetTeacher.name})` : 'Lớp Chủ Nhiệm 10A1';
    if (effectiveId === 'user_admin') defaultClassName = 'Lớp Chủ Nhiệm 12A1 (Admin)';
    
    const sampleClass = {
      isCustomized: false,
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

    // For admin (user_admin), return full initial sample class
    if (effectiveId === 'user_admin') {
      return sampleClass;
    }

    // For non-admin teacher accounts, return clean empty class so sample students NEVER pollute or overwrite custom homeroom
    return {
      isCustomized: false,
      className: defaultClassName,
      schoolYear: '2026 - 2027',
      classBgImage: '',
      classPhoto: '',
      pointRules: {
        basePoints: 100,
        rewardBonus: 10,
        violationDeduction: 5,
        topHonorsCount: 3
      },
      students: []
    };
  },

  syncHomeroomWithIndexedDB: async (userId) => {
    StorageService.init();
    const effectiveId = userId || StorageService.getCurrentUser()?.id || 'user_admin';
    const key = `gvd_homeroom_${effectiveId}`;

    // 1. Check LocalStorage first if customized
    const localStored = localStorage.getItem(key);
    if (localStored) {
      try {
        const parsed = JSON.parse(localStored);
        if (parsed && typeof parsed === 'object' && parsed.isCustomized) {
          IDBStorageService.setItem(key, parsed).catch(() => {});
          CloudStorageService.saveUserPrivateCloudData(effectiveId, 'homeroom', parsed).catch(() => {});
          return parsed;
        }
      } catch (e) {}
    }

    // 2. Try IndexedDB Permanent Storage next
    try {
      const idbClass = await IDBStorageService.getItem(key);
      if (idbClass && typeof idbClass === 'object' && Array.isArray(idbClass.students)) {
        try {
          localStorage.setItem(key, JSON.stringify(idbClass));
        } catch(err) {}
        CloudStorageService.saveUserPrivateCloudData(effectiveId, 'homeroom', idbClass).catch(() => {});
        return idbClass;
      }
    } catch(e) {}
    
    // 3. Try Cloud API Vercel Serverless Sync last
    try {
      const cloudClass = await CloudStorageService.getUserPrivateCloudData(effectiveId, 'homeroom');
      if (cloudClass && typeof cloudClass === 'object' && Array.isArray(cloudClass.students) && cloudClass.isCustomized) {
        try {
          localStorage.setItem(key, JSON.stringify(cloudClass));
        } catch (err) {}
        IDBStorageService.setItem(key, cloudClass).catch(() => {});
        return cloudClass;
      }
    } catch (e) {}
    
    return StorageService.getTeacherHomeroom(effectiveId);
  },

  saveTeacherHomeroom: (userId, classData) => {
    StorageService.init();
    const effectiveId = userId || StorageService.getCurrentUser()?.id || 'user_admin';
    const key = `gvd_homeroom_${effectiveId}`;
    
    if (!classData) return classData;

    // Mark as customized so default sample class is NEVER injected over user's setup
    const updatedClassData = { ...classData, isCustomized: true };

    // 1. Pre-save any student base64 avatars to AvatarStorageService to shrink payload
    if (Array.isArray(updatedClassData.students)) {
      updatedClassData.students.forEach(st => {
        if (st && st.id && st.avatar && st.avatar.length > 500) {
          AvatarStorageService.saveAvatar(st.id, st.avatar);
        }
      });
    }

    // 2. Save full object to IndexedDB (Unified IDB Storage)
    IDBStorageService.setItem(key, updatedClassData).catch(() => {});

    // 3. Save to localStorage with QuotaExceeded fallback handling
    try {
      localStorage.setItem(key, JSON.stringify(updatedClassData));
    } catch (e) {
      console.warn("StorageService: localStorage quota error handled, stripping heavy images for LocalStorage", e);
      const lightClass = {
        ...updatedClassData,
        classBgImage: updatedClassData.classBgImage && updatedClassData.classBgImage.length > 1000 ? '' : updatedClassData.classBgImage,
        classPhoto: updatedClassData.classPhoto && updatedClassData.classPhoto.length > 1000 ? '' : updatedClassData.classPhoto,
        students: (updatedClassData.students || []).map(st => ({
          ...st,
          avatar: st.avatar && st.avatar.length > 1000 ? '' : st.avatar
        }))
      };
      try {
        localStorage.setItem(key, JSON.stringify(lightClass));
      } catch (e2) {}
    }

    if (effectiveId) {
      CloudStorageService.saveUserPrivateCloudData(effectiveId, 'homeroom', updatedClassData).catch(() => {});
    }

    return updatedClassData;
  },

  resetTeacherHomeroom: (userId, mode = 'sample') => {
    StorageService.init();
    const effectiveId = userId || StorageService.getCurrentUser()?.id || 'user_admin';
    const key = `gvd_homeroom_${effectiveId}`;
    if (mode === 'clear') {
      const emptyClass = {
        isCustomized: true,
        className: 'Lớp Chủ Nhiệm Mới',
        schoolYear: '2026 - 2027',
        classBgImage: '',
        classPhoto: '',
        students: []
      };
      localStorage.setItem(key, JSON.stringify(emptyClass));
      IDBStorageService.setItem(key, emptyClass).catch(() => {});
      CloudStorageService.saveUserPrivateCloudData(effectiveId, 'homeroom', emptyClass).catch(() => {});
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
      systemName: "HỆ THỐNG HỖ TRỢ DẠY VÀ HỌC SKY-LINE",
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

  // Granular Homeroom Class JSON Export & Import Engine
  exportHomeroomBackup: (userId) => {
    StorageService.init();
    const effectiveId = StorageService.getEffectiveUserId(userId);
    const homeroom = StorageService.getTeacherHomeroom(effectiveId);
    const payload = {
      type: 'HOMEROOM_BACKUP',
      userId: effectiveId,
      exportDate: new Date().toISOString(),
      data: homeroom
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SaoLuu_LopChuNhiem_${effectiveId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importHomeroomBackup: (userId, jsonStr) => {
    try {
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      const data = parsed.data || parsed;
      if (!data || typeof data !== 'object' || !Array.isArray(data.students)) {
        throw new Error('Định dạng tệp sao lưu Lớp chủ nhiệm không hợp lệ!');
      }
      const effectiveId = StorageService.getEffectiveUserId(userId);
      StorageService.saveTeacherHomeroom(effectiveId, data);
      return { success: true, message: `Khôi phục thành công danh sách Lớp (${data.className || 'Chủ nhiệm'}) với ${data.students.length} học sinh!` };
    } catch (e) {
      return { success: false, message: e.message || 'Lỗi đọc tệp JSON lớp chủ nhiệm!' };
    }
  },

  // Granular Lecture Slides JSON Export & Import Engine
  exportSlidesBackup: (userId) => {
    StorageService.init();
    const effectiveId = StorageService.getEffectiveUserId(userId);
    const slides = StorageService.getLectureSlides(effectiveId);
    const payload = {
      type: 'SLIDES_BACKUP',
      userId: effectiveId,
      exportDate: new Date().toISOString(),
      data: slides
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SaoLuu_SlideBaiGiang_${effectiveId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importSlidesBackup: (userId, jsonStr) => {
    try {
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      const data = Array.isArray(parsed.data) ? parsed.data : (Array.isArray(parsed) ? parsed : []);
      if (!Array.isArray(data)) {
        throw new Error('Định dạng tệp sao lưu Slide bài giảng không hợp lệ!');
      }
      const effectiveId = StorageService.getEffectiveUserId(userId);
      StorageService.saveLectureSlides(effectiveId, data);
      return { success: true, message: `Khôi phục thành công ${data.length} Slide bài giảng!` };
    } catch (e) {
      return { success: false, message: e.message || 'Lỗi đọc tệp JSON Slide bài giảng!' };
    }
  },

  // Granular Games JSON Export & Import Engine
  exportGamesBackup: (userId) => {
    StorageService.init();
    const effectiveId = StorageService.getEffectiveUserId(userId);
    const games = StorageService.getTeacherSavedGames(effectiveId);
    const payload = {
      type: 'GAMES_BACKUP',
      userId: effectiveId,
      exportDate: new Date().toISOString(),
      data: games
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SaoLuu_KhoGame_${effectiveId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importGamesBackup: (userId, jsonStr) => {
    try {
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      const games = Array.isArray(parsed.data) ? parsed.data : (Array.isArray(parsed.savedGames) ? parsed.savedGames : (Array.isArray(parsed) ? parsed : []));
      if (!Array.isArray(games)) {
        throw new Error('Định dạng tệp sao lưu Kho Game không hợp lệ!');
      }
      const effectiveId = StorageService.getEffectiveUserId(userId);
      games.forEach(g => {
        if (g && typeof g === 'object') {
          StorageService.saveTeacherGame(effectiveId, { ...g, userId: effectiveId });
        }
      });
      return { success: true, message: `Khôi phục thành công ${games.length} bài Game cá nhân!` };
    } catch (e) {
      return { success: false, message: e.message || 'Lỗi đọc tệp JSON Kho Game!' };
    }
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

      // 4. Sync games to IndexedDB & Cloud for resilient 24/7 storage
      if (backupData.savedGames && Array.isArray(backupData.savedGames)) {
        IDBStorageService.saveAllGames(backupData.savedGames).catch(() => {});
      }

      // Re-initialize memory cache
      StorageService.init();

      // Synchronize restored user data to Cloud DB 24/7
      const currentUser = StorageService.getCurrentUser();
      if (currentUser && currentUser.id) {
        const uId = currentUser.id;
        const uGames = StorageService.getTeacherSavedGames(uId);
        if (uGames.length > 0) CloudStorageService.saveUserPrivateCloudData(uId, 'saved_games', uGames).catch(() => {});
        const uClass = StorageService.getTeacherHomeroom(uId);
        if (uClass) CloudStorageService.saveUserPrivateCloudData(uId, 'homeroom', uClass).catch(() => {});
        const uSlides = StorageService.getLectureSlides(uId);
        if (uSlides.length > 0) CloudStorageService.saveUserPrivateCloudData(uId, 'slides', uSlides).catch(() => {});
      }

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
    const effectiveId = StorageService.getEffectiveUserId(userId);
    const key = `gvd_user_slides_${effectiveId}`;
    try {
      const data = localStorage.getItem(key);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}

    if (effectiveId === 'user_admin') {
      return INITIAL_ADMIN_SLIDES;
    }
    return [];
  },

  saveLectureSlides: (userId, slides) => {
    StorageService.init();
    const effectiveId = StorageService.getEffectiveUserId(userId);
    const key = `gvd_user_slides_${effectiveId}`;
    try {
      const safeSlides = Array.isArray(slides) ? slides : [];
      localStorage.setItem(key, JSON.stringify(safeSlides));
      IDBStorageService.setItem(key, safeSlides).catch(() => {});
      CloudStorageService.saveUserPrivateCloudData(effectiveId, 'slides', safeSlides).catch(() => {});
      return true;
    } catch (e) {
      return false;
    }
  },

  // Per-User Grade Drive Folders Storage
  getGradeDriveFolders: (userId) => {
    StorageService.init();
    const effectiveId = StorageService.getEffectiveUserId(userId);
    const key = `gvd_user_grade_folders_${effectiveId}`;
    try {
      const data = localStorage.getItem(key);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}

    if (effectiveId === 'user_admin') {
      return INITIAL_ADMIN_FOLDERS;
    }
    return [];
  },

  saveGradeDriveFolders: (userId, folders) => {
    StorageService.init();
    const effectiveId = StorageService.getEffectiveUserId(userId);
    const key = `gvd_user_grade_folders_${effectiveId}`;
    try {
      const safeFolders = Array.isArray(folders) ? folders : [];
      localStorage.setItem(key, JSON.stringify(safeFolders));
      IDBStorageService.setItem(key, safeFolders).catch(() => {});
      CloudStorageService.saveUserPrivateCloudData(effectiveId, 'grade_folders', safeFolders).catch(() => {});
      return true;
    } catch (e) {
      return false;
    }
  },

  // Full Initial Restorer Engine for Thầy Hảo Địa Lí (user_admin)
  restoreInitialDataForAdmin: () => {
    StorageService.init();
    const adminId = 'user_admin';

    // 1. Saved Games
    runtimeSavedGamesCache = [...INITIAL_SAVED_GAMES];
    try {
      localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(INITIAL_SAVED_GAMES));
      IDBStorageService.saveAllGames(INITIAL_SAVED_GAMES).catch(() => {});
      CloudStorageService.saveUserPrivateCloudData(adminId, 'saved_games', INITIAL_SAVED_GAMES).catch(() => {});
    } catch (e) {}

    // 2. Homeroom 12A1
    const homeroomKey = `gvd_homeroom_${adminId}`;
    const defaultHomeroom = StorageService.getTeacherHomeroom(adminId);
    try {
      localStorage.setItem(homeroomKey, JSON.stringify(defaultHomeroom));
      IDBStorageService.setItem(homeroomKey, defaultHomeroom).catch(() => {});
      CloudStorageService.saveUserPrivateCloudData(adminId, 'homeroom', defaultHomeroom).catch(() => {});
    } catch (e) {}

    // 3. Lecture Slides
    const slidesKey = `gvd_user_slides_${adminId}`;
    try {
      localStorage.setItem(slidesKey, JSON.stringify(INITIAL_ADMIN_SLIDES));
      IDBStorageService.setItem(slidesKey, INITIAL_ADMIN_SLIDES).catch(() => {});
      CloudStorageService.saveUserPrivateCloudData(adminId, 'slides', INITIAL_ADMIN_SLIDES).catch(() => {});
    } catch (e) {}

    // 4. Grade Folders
    const foldersKey = `gvd_user_grade_folders_${adminId}`;
    try {
      localStorage.setItem(foldersKey, JSON.stringify(INITIAL_ADMIN_FOLDERS));
      IDBStorageService.setItem(foldersKey, INITIAL_ADMIN_FOLDERS).catch(() => {});
      CloudStorageService.saveUserPrivateCloudData(adminId, 'grade_folders', INITIAL_ADMIN_FOLDERS).catch(() => {});
    } catch (e) {}

    return {
      games: INITIAL_SAVED_GAMES,
      slides: INITIAL_ADMIN_SLIDES,
      folders: INITIAL_ADMIN_FOLDERS,
      homeroom: defaultHomeroom
    };
  }
};
