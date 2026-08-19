import * as XLSX from 'xlsx';

// Export standard question template to Excel .xlsx
export function downloadExcelTemplate(gameTitle = 'Mau_Cau_Hoi_Game') {
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
      'Câu hỏi': 'Kết quả của phép tính 15 + 27 là bao nhiêu?',
      'Đáp án A': '32',
      'Đáp án B': '42',
      'Đáp án C': '52',
      'Đáp án D': '45',
      'Đáp án đúng (A/B/C/D)': 'B',
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

  // Set column widths
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

// Parse uploaded Excel / CSV file into standard questions array
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          reject(new Error('File Excel rỗng hoặc không đúng định dạng.'));
          return;
        }

        const questions = rawJson.map((row, index) => {
          const qText = row['Câu hỏi'] || row['Cau hoi'] || row['Question'] || row['CAU_HOI'] || Object.values(row)[1] || '';
          const optA = row['Đáp án A'] || row['Dap an A'] || row['Option A'] || row['A'] || Object.values(row)[2] || '';
          const optB = row['Đáp án B'] || row['Dap an B'] || row['Option B'] || row['B'] || Object.values(row)[3] || '';
          const optC = row['Đáp án C'] || row['Dap an C'] || row['Option C'] || row['C'] || Object.values(row)[4] || '';
          const optD = row['Đáp án D'] || row['Dap an D'] || row['Option D'] || row['D'] || Object.values(row)[5] || '';
          
          let correct = String(row['Đáp án đúng (A/B/C/D)'] || row['Đáp án đúng'] || row['Correct'] || Object.values(row)[6] || 'A').trim().toUpperCase();
          if (!['A', 'B', 'C', 'D'].includes(correct)) {
            if (correct === '1' || correct.includes(optA)) correct = 'A';
            else if (correct === '2' || correct.includes(optB)) correct = 'B';
            else if (correct === '3' || correct.includes(optC)) correct = 'C';
            else if (correct === '4' || correct.includes(optD)) correct = 'D';
            else correct = 'A';
          }

          const explanation = row['Giải thích / Gợi ý'] || row['Giai thich'] || row['Explanation'] || row['Gợi ý'] || '';

          return {
            id: `q_${Date.now()}_${index}`,
            question: String(qText).trim(),
            options: [
              String(optA).trim(),
              String(optB).trim(),
              String(optC).trim(),
              String(optD).trim()
            ],
            correct: correct,
            explanation: String(explanation).trim()
          };
        }).filter(q => q.question.length > 0);

        if (questions.length === 0) {
          reject(new Error('Không tìm thấy danh sách câu hỏi hợp lệ trong tệp Excel.'));
        } else {
          resolve(questions);
        }
      } catch (err) {
        reject(new Error('Lỗi khi đọc file Excel/CSV: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc tệp.'));
    reader.readAsArrayBuffer(file);
  });
}
