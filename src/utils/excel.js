import * as XLSX from 'xlsx';
import { parseUniversalFile } from './universalParser';

export { parseUniversalFile };

function removeAccents(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// 1. Export Fruit Ninja / Bắt Bóng Bóng Excel Template
export function downloadFruitNinjaExcelTemplate() {
  const sampleData = [
    {
      'STT': 1,
      'Câu hỏi': 'Tỉnh/Thành phố nào thuộc khu vực Đông Nam Bộ Việt Nam?',
      'Đáp án đúng duy nhất': 'Bình Dương',
      'Các đáp án nhiễu (phân cách bằng dấu phẩy hoặc dấu phẩy gõ)': 'Hà Nội, Đà Nẵng, Hải Phòng, Lào Cai, Bắc Ninh, Lạng Sơn, Cà Mau, Cần Thơ',
      'Giải thích / Gợi ý': 'Bình Dương thuộc vùng Đông Nam Bộ.'
    },
    {
      'STT': 2,
      'Câu hỏi': 'Ký hiệu hóa học của nguyên tố Vàng trong bảng tuần hoàn là gì?',
      'Đáp án đúng duy nhất': 'Au',
      'Các đáp án nhiễu (phân cách bằng dấu phẩy hoặc dấu phẩy gõ)': 'Ag, Fe, Cu, Pb, Hg, Zn, Al, Na, Ca',
      'Giải thích / Gợi ý': 'Au xuất phát từ Aurum tiếng Latinh.'
    },
    {
      'STT': 3,
      'Câu hỏi': 'Số nào sau đây là số nguyên tố?',
      'Đáp án đúng duy nhất': '17',
      'Các đáp án nhiễu (phân cách bằng dấu phẩy hoặc dấu phẩy gõ)': '4, 6, 8, 9, 12, 15, 18, 21, 25',
      'Giải thích / Gợi ý': '17 chỉ chia hết cho 1 và chính nó.'
    },
    {
      'STT': 4,
      'Câu hỏi': 'Tác giả của tác phẩm "Truyện Kiều" là ai?',
      'Đáp án đúng duy nhất': 'Nguyễn Du',
      'Các đáp án nhiễu (phân cách bằng dấu phẩy hoặc dấu phẩy gõ)': 'Nguyễn Trãi, Lý Thường Kiệt, Trần Hưng Đạo, Hồ Xuân Hương, Xuân Diệu',
      'Giải thích / Gợi ý': 'Đại thi hào Nguyễn Du.'
    },
    {
      'STT': 5,
      'Câu hỏi': 'Hành tinh nào được gọi là Hành Tinh Đỏ trong Hệ Mặt Trời?',
      'Đáp án đúng duy nhất': 'Sao Hỏa',
      'Các đáp án nhiễu (phân cách bằng dấu phẩy hoặc dấu phẩy gõ)': 'Sao Kim, Sao Thủy, Sao Mộc, Sao Thổ, Sao Hải Vương, Trái Đất',
      'Giải thích / Gợi ý': 'Sao Hỏa (Mars) có bề mặt chứa sắt oxit màu đỏ.'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 45 },
    { wch: 25 },
    { wch: 60 },
    { wch: 35 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CauHoiChemHoaQua');
  XLSX.writeFile(workbook, 'Mau_Cau_Hoi_Chem_Hoa_Qua_Bat_Bong_Bong.xlsx');
}

// 2. Export Game Nghiêng Đầu Chuẩn Excel Template (Only 2 options: A & B)
export function downloadHeadTiltExcelTemplate(gameTitle = 'Mau_Cau_Hoi_Nghieng_Dau_Chuan') {
  const sampleData = [
    {
      'STT': 1,
      'Câu hỏi': 'Số nào sau đây là số chẵn?',
      'Đáp án A': '12',
      'Đáp án B': '15',
      'Đáp án đúng (A/B)': 'A',
      'Giải thích / Gợi ý': '12 chia hết cho 2.'
    },
    {
      'STT': 2,
      'Câu hỏi': 'Trái Đất quay quanh Mặt Trời hay Mặt Trời quay quanh Trái Đất?',
      'Đáp án A': 'Trái Đất quay quanh Mặt Trời',
      'Đáp án B': 'Mặt Trời quay quanh Trái Đất',
      'Đáp án đúng (A/B)': 'A',
      'Giải thích / Gợi ý': 'Trái Đất là hành tinh chuyển động quanh Mặt Trời.'
    },
    {
      'STT': 3,
      'Câu hỏi': 'Nước nào sau đây thuộc khu vực Đông Nam Á?',
      'Đáp án A': 'Việt Nam',
      'Đáp án B': 'Nhật Bản',
      'Đáp án đúng (A/B)': 'A',
      'Giải thích / Gợi ý': 'Việt Nam nằm ở khu vực Đông Nam Á.'
    },
    {
      'STT': 4,
      'Câu hỏi': 'Hành tinh nào lớn nhất trong Hệ Mặt Trời?',
      'Đáp án A': 'Sao Mộc (Jupiter)',
      'Đáp án B': 'Trái Đất (Earth)',
      'Đáp án đúng (A/B)': 'A',
      'Giải thích / Gợi ý': 'Sao Mộc có kích thước lớn nhất.'
    },
    {
      'STT': 5,
      'Câu hỏi': 'Công thức hóa học của nước là gì?',
      'Đáp án A': 'H2O',
      'Đáp án B': 'CO2',
      'Đáp án đúng (A/B)': 'A',
      'Giải thích / Gợi ý': 'H2O gồm 2 nguyên tử Hydro và 1 nguyên tử Oxy.'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 45 },
    { wch: 25 },
    { wch: 25 },
    { wch: 22 },
    { wch: 35 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CauHoiNghiengDau');
  XLSX.writeFile(workbook, 'Mau_Cau_Hoi_Nghieng_Dau_Chuan.xlsx');
}

// 3. Export Game Đua Vịt & Đua Rùa Student List Excel Template
export function downloadStudentListExcelTemplate(gameTitle = 'Mau_Danh_Sach_Hoc_Sinh_Dua_Vit_Dua_Rua') {
  const sampleData = [
    { 'STT': 1, 'Họ và tên học sinh': 'Nguyễn Văn An', 'Ghi chú / Nhóm': 'Lớp 10A1' },
    { 'STT': 2, 'Họ và tên học sinh': 'Trần Thị Bình', 'Ghi chú / Nhóm': 'Lớp 10A1' },
    { 'STT': 3, 'Họ và tên học sinh': 'Lê Hoàng Cường', 'Ghi chú / Nhóm': 'Lớp 10A1' },
    { 'STT': 4, 'Họ và tên học sinh': 'Phạm Minh Đức', 'Ghi chú / Nhóm': 'Lớp 10A1' },
    { 'STT': 5, 'Họ và tên học sinh': 'Hoàng Ngọc Anh', 'Ghi chú / Nhóm': 'Lớp 10A1' },
    { 'STT': 6, 'Họ và tên học sinh': 'Đỗ Thanh Hà', 'Ghi chú / Nhóm': 'Lớp 10A1' },
    { 'STT': 7, 'Họ và tên học sinh': 'Bùi Hữu Phước', 'Ghi chú / Nhóm': 'Lớp 10A1' },
    { 'STT': 8, 'Họ và tên học sinh': 'Ngô Hải Yến', 'Ghi chú / Nhóm': 'Lớp 10A1' },
    { 'STT': 9, 'Họ và tên học sinh': 'Vũ Quốc Hùng', 'Ghi chú / Nhóm': 'Lớp 10A1' },
    { 'STT': 10, 'Họ và tên học sinh': 'Đặng Mai Phương', 'Ghi chú / Nhóm': 'Lớp 10A1' }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 25 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');
  XLSX.writeFile(workbook, 'Mau_Danh_Sach_Hoc_Sinh_Dua_Vit_Dua_Rua.xlsx');
}

// 4. Main Export Function Router
export function downloadExcelTemplate(gameTitle = 'Mau_Cau_Hoi_Game', engineType = '') {
  const normTitle = removeAccents(gameTitle);
  const normEngine = removeAccents(engineType);

  // Game Đua Vịt & Game Đua Rùa -> Student Name List Template
  if (
    normEngine === 'duck-race' || normEngine === 'turtle-race' || normEngine === 'racing' ||
    normTitle.includes('dua vit') || normTitle.includes('dua rua')
  ) {
    return downloadStudentListExcelTemplate(gameTitle);
  }

  // Game Nghiêng đầu chuẩn -> 2 Options (A & B) Template
  if (
    normEngine === 'tilt' || normEngine === 'tilt-head' || normEngine === 'head-tilt' ||
    normTitle.includes('nghieng dau')
  ) {
    return downloadHeadTiltExcelTemplate(gameTitle);
  }

  // Game Chém Hoa Quả / Bắt Bóng Bóng -> Fruit Ninja Template
  if (
    normEngine === 'fruit-ninja' || normTitle.includes('hoa qua') || normTitle.includes('bong bong')
  ) {
    return downloadFruitNinjaExcelTemplate();
  }

  // Standard 4 Options (A, B, C, D) Template for all other games
  const sampleData = [
    {
      'STT': 1,
      'Câu hỏi': 'Thủ đô của Việt Nam là gì?',
      'Đáp án A': 'Hà Nội',
      'Đáp án B': 'TP. Hồ Chí Minh',
      'Đáp án C': 'Đà Nẵng',
      'Đáp án D': 'Cần Thơ',
      'Đáp án đúng (A/B/C/D)': 'A',
      'Giải thích / Gợi ý': 'Hà Nội là thủ đô ngàn năm văn hiến.'
    },
    {
      'STT': 2,
      'Câu hỏi': 'Kết quả của phép tính 15 + 27 là 42',
      'Đáp án A': 'Đúng',
      'Đáp án B': 'Sai',
      'Đáp án C': '',
      'Đáp án D': '',
      'Đáp án đúng (A/B/C/D)': 'A',
      'Giải thích / Gợi ý': '15 + 27 = 42.'
    },
    {
      'STT': 3,
      'Câu hỏi': 'Nguyên tố hóa học nào có ký hiệu là Fe?',
      'Đáp án A': 'Đồng',
      'Đáp án B': 'Sắt',
      'Đáp án C': 'Vàng',
      'Đáp án D': 'Bạc',
      'Đáp án đúng (A/B/C/D)': 'B',
      'Giải thích / Gợi ý': 'Fe xuất phát từ Ferrum tiếng Latinh có nghĩa là Sắt.'
    },
    {
      'STT': 4,
      'Câu hỏi': 'Tác giả của tác phẩm Truyện Kiều là ai?',
      'Đáp án A': 'Nguyễn Trãi',
      'Đáp án B': 'Nguyễn Du',
      'Đáp án C': 'Hồ Xuân Hương',
      'Đáp án D': 'Đoàn Thị Điểm',
      'Đáp án đúng (A/B/C/D)': 'B',
      'Giải thích / Gợi ý': 'Đại thi hào Nguyễn Du là tác giả Truyện Kiều.'
    },
    {
      'STT': 5,
      'Câu hỏi': 'Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?',
      'Đáp án A': 'Trái Đất',
      'Đáp án B': 'Sao Hỏa',
      'Đáp án C': 'Sao Thủy',
      'Đáp án D': 'Sao Kim',
      'Đáp án đúng (A/B/C/D)': 'C',
      'Giải thích / Gợi ý': 'Sao Thủy (Mercury) là hành tinh gần Mặt Trời nhất.'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 45 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 35 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CauHoi');

  const safeFileName = `${gameTitle.replace(/[^a-zA-Z0-9_ -]/g, '_')}_MauCauHoi.xlsx`;
  XLSX.writeFile(workbook, safeFileName);
}

// Parse uploaded file into standard questions array using Universal Parser
export function parseExcelFile(file) {
  return parseUniversalFile(file);
}
