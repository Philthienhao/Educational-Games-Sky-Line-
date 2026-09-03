import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

// Standardized Question Interface
// { id, question, options: [A, B, C, D], correct: 'A'|'B'|'C'|'D', explanation }

/**
 * Remove Vietnamese accents for fuzzy string matching
 */
function removeAccents(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Parse raw text (Word, PDF, TXT, Copy-Paste) using Smart Pattern Recognition
 */
export function extractQuestionsFromText(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  // Normalize line breaks
  const lines = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const questions = [];
  let currentQ = null;

  const questionHeaderRegex = /^(câu\s*\d+|question\s*\d+|\d+)[\.\:\)\-]\s*(.+)/i;
  const optionRegex = /^([a-d])[\.\:\)\-]\s*(.+)/i;
  const answerHeaderRegex = /^(đáp\s*án\s*đúng|đáp\s*án|đ\/a|key|answer)[\:\s\-]+([a-d]|.+)/i;
  const explanationRegex = /^(giải\s*thích|gợi\s*ý|explanation|note)[\:\s\-]+(.+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const normalized = removeAccents(line);

    // 1. Check if line is a Question Header (e.g. "Câu 1: ...", "1. ...", "Question 1 ...")
    const qMatch = line.match(questionHeaderRegex);
    const isEndingQuestionMark = line.endsWith('?') && !line.match(/^[a-d][\.\:\)]/i);

    if (qMatch || isEndingQuestionMark) {
      // Push previous question if valid
      if (currentQ && currentQ.question && currentQ.options.length >= 2) {
        questions.push(finalizeQuestion(currentQ));
      }

      let qContent = qMatch ? qMatch[2] : line;
      // Strip leading numbers if any
      qContent = qContent.replace(/^(câu\s*\d+|question\s*\d+|\d+)[\.\:\)\-]\s*/i, '').trim();

      currentQ = {
        question: qContent,
        options: [],
        correct: 'A',
        explanation: ''
      };
      continue;
    }

    // 2. Check inline options on single line e.g., "A. Hà Nội   B. HCM   C. Đà Nẵng   D. Cần Thơ"
    const inlineOptionsMatch = line.match(/A[\.\:\)]\s*(.*?)\s+B[\.\:\)]\s*(.*?)\s+C[\.\:\)]\s*(.*?)\s+D[\.\:\)]\s*(.*)/i);
    if (inlineOptionsMatch && currentQ) {
      currentQ.options = [
        inlineOptionsMatch[1].trim(),
        inlineOptionsMatch[2].trim(),
        inlineOptionsMatch[3].trim(),
        inlineOptionsMatch[4].trim()
      ];
      continue;
    }

    // 3. Check single option e.g., "A. Hà Nội" or "*A. Hà Nội"
    const isStarred = line.startsWith('*');
    const cleanLine = isStarred ? line.substring(1).trim() : line;
    const optMatch = cleanLine.match(optionRegex);

    if (optMatch && currentQ) {
      const label = optMatch[1].toUpperCase();
      const val = optMatch[2].trim();
      currentQ.options.push(val);
      if (isStarred) {
        currentQ.correct = label;
      }
      continue;
    }

    // 4. Check Answer Header e.g., "Đáp án đúng: B" or "Đáp án: B"
    const ansMatch = line.match(answerHeaderRegex);
    if (ansMatch && currentQ) {
      let ansVal = ansMatch[2].trim().toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(ansVal[0])) {
        currentQ.correct = ansVal[0];
      } else {
        // Try matching text of option
        const matchedIdx = currentQ.options.findIndex(opt => removeAccents(opt) === removeAccents(ansVal));
        if (matchedIdx !== -1) {
          currentQ.correct = ['A', 'B', 'C', 'D'][matchedIdx];
        }
      }
      continue;
    }

    // 5. Check Explanation e.g., "Giải thích: ..."
    const expMatch = line.match(explanationRegex);
    if (expMatch && currentQ) {
      currentQ.explanation = expMatch[2].trim();
      continue;
    }

    // 6. Append extra line text to current question text if no options yet
    if (currentQ && currentQ.options.length === 0 && !normalized.includes('dap an')) {
      currentQ.question += ' ' + line;
    }
  }

  // Push last question
  if (currentQ && currentQ.question && currentQ.options.length >= 2) {
    questions.push(finalizeQuestion(currentQ));
  }

  return questions;
}

/**
 * Finalize question structure and default 4 options
 */
/**
 * Check if an option index should be rendered for a question (Intelligently detects 2-option True/False questions & dummy placeholders)
 */
export function isOptionValidForQuestion(optionsArray, idx) {
  if (idx < 2) return true; // Options A and B are always valid
  if (!optionsArray || !Array.isArray(optionsArray) || optionsArray.length <= idx) return false;

  const optText = String(optionsArray[idx] || '').trim();
  if (!optText) return false;

  const optA = removeAccents(optionsArray[0] || '');
  const optB = removeAccents(optionsArray[1] || '');

  // If A is "Đúng" and B is "Sai" (or True/False), options C and D should NEVER be rendered
  const isTrueFalse = (
    (optA === 'dung' || optA === 'true' || optA === 'd') &&
    (optB === 'sai' || optB === 'false' || optB === 's')
  );
  if (isTrueFalse) return false;

  const normOpt = removeAccents(optText);

  // If option C/D is a dummy placeholder label ("C", "D", "Lựa chọn 3", "Lựa chọn 4", "Phương án C", "Phương án D")
  if (idx === 2 && (normOpt === 'c' || normOpt === 'lua chon 3' || normOpt === 'phuong an c')) {
    return false;
  }
  if (idx === 3 && (normOpt === 'd' || normOpt === 'lua chon 4' || normOpt === 'phuong an d')) {
    return false;
  }

  return true;
}

/**
 * Finalize question structure and default 4 options
 */
function finalizeQuestion(qObj) {
  const opts = (qObj.options || []).map(o => String(o || '').trim()).filter(o => o.length > 0);
  let finalOpts = [];
  if (opts.length === 2) {
    finalOpts = opts;
  } else if (opts.length === 3) {
    finalOpts = opts;
  } else if (opts.length >= 4) {
    finalOpts = opts.slice(0, 4);
  } else if (opts.length === 1) {
    finalOpts = [opts[0], 'Đáp án B'];
  } else {
    finalOpts = ['Đúng', 'Sai'];
  }

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    question: qObj.question.trim(),
    options: finalOpts,
    correct: ['A', 'B', 'C', 'D'].includes(qObj.correct) ? qObj.correct : 'A',
    explanation: (qObj.explanation || '').trim()
  };
}

/**
 * Smart Excel / CSV Table Parser (Handles any column arrangement)
 */
export function extractQuestionsFromExcelBuffer(arrayBuffer) {
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (!rawJson || rawJson.length === 0) {
    throw new Error('File Excel/CSV rỗng hoặc không có dữ liệu.');
  }

  // Detect column mapping by analyzing headers
  const firstRowKeys = Object.keys(rawJson[0]);
  
  // 0. Check if file is a Student Name List (e.g. for Đua Vịt / Đua Rùa)
  let studentNameKey = null;
  firstRowKeys.forEach(key => {
    const norm = removeAccents(key);
    if (norm.includes('hoc sinh') || norm.includes('ho va ten') || norm.includes('ten hoc sinh') || norm === 'ho ten') {
      studentNameKey = key;
    }
  });

  if (studentNameKey) {
    return rawJson.map((row, index) => {
      const studentName = String(row[studentNameKey] || Object.values(row)[1] || Object.values(row)[0] || '').trim();
      return {
        id: `student_${Date.now()}_${index}`,
        question: studentName,
        name: studentName,
        options: ['Có mặt', 'Vắng mặt', '', ''],
        correct: 'A',
        explanation: String(row['Ghi chú / Nhóm'] || row['Ghi chú'] || '').trim()
      };
    }).filter(s => s.question.length > 0);
  }
  
  let qKey = null;
  let optAKey = null;
  let optBKey = null;
  let optCKey = null;
  let optDKey = null;
  let ansKey = null;
  let expKey = null;

  firstRowKeys.forEach(key => {
    const norm = removeAccents(key);
    if (!qKey && (norm.includes('cau hoi') || norm.includes('question') || norm.includes('noi dung') || norm.includes('de'))) {
      qKey = key;
    } else if (!optAKey && (norm.includes('dap an a') || norm.includes('option a') || norm === 'a' || norm.includes('lua chon a'))) {
      optAKey = key;
    } else if (!optBKey && (norm.includes('dap an b') || norm.includes('option b') || norm === 'b' || norm.includes('lua chon b'))) {
      optBKey = key;
    } else if (!optCKey && (norm.includes('dap an c') || norm.includes('option c') || norm === 'c' || norm.includes('lua chon c'))) {
      optCKey = key;
    } else if (!optDKey && (norm.includes('dap an d') || norm.includes('option d') || norm === 'd' || norm.includes('lua chon d'))) {
      optDKey = key;
    } else if (!ansKey && (norm.includes('dap an dung') || norm.includes('correct') || norm.includes('ket qua') || norm === 'dap an' || norm === 'da' || norm === 'key')) {
      ansKey = key;
    } else if (!expKey && (norm.includes('giai thich') || norm.includes('goi y') || norm.includes('explanation') || norm.includes('note'))) {
      expKey = key;
    }
  });

  // Fallback positional mapping ONLY if A and B headers were not explicitly matched by name
  if (!qKey && firstRowKeys.length >= 2) {
    qKey = firstRowKeys[1] || firstRowKeys[0];
  }
  if (!optAKey && !optBKey && firstRowKeys.length >= 4) {
    optAKey = firstRowKeys[2];
    optBKey = firstRowKeys[3];
    if (firstRowKeys.length >= 5 && firstRowKeys[4] !== ansKey && firstRowKeys[4] !== expKey) optCKey = firstRowKeys[4];
    if (firstRowKeys.length >= 6 && firstRowKeys[5] !== ansKey && firstRowKeys[5] !== expKey) optDKey = firstRowKeys[5];
  }

  const questions = rawJson.map((row, index) => {
    const qText = row[qKey] || Object.values(row)[1] || Object.values(row)[0] || '';
    
    // Check options present in row (prevent mapping to answer or explanation column)
    const rawOptA = (optAKey && row[optAKey] !== undefined) ? String(row[optAKey]).trim() : '';
    const rawOptB = (optBKey && row[optBKey] !== undefined) ? String(row[optBKey]).trim() : '';
    const rawOptC = (optCKey && row[optCKey] !== undefined && optCKey !== ansKey && optCKey !== expKey) ? String(row[optCKey]).trim() : '';
    const rawOptD = (optDKey && row[optDKey] !== undefined && optDKey !== ansKey && optDKey !== expKey) ? String(row[optDKey]).trim() : '';

    const normA = removeAccents(rawOptA);
    const normB = removeAccents(rawOptB);
    const normC = removeAccents(rawOptC);
    const normD = removeAccents(rawOptD);

    const isTrueFalseText = (
      (normA === 'dung' || normA === 'true' || normA === 'd') &&
      (normB === 'sai' || normB === 'false' || normB === 's')
    );

    const isDummyC = !rawOptC || normC === 'c' || normC === 'lua chon 3' || normC === 'phuong an c' || (ansKey && normC === removeAccents(row[ansKey]));
    const isDummyD = !rawOptD || normD === 'd' || normD === 'lua chon 4' || normD === 'phuong an d' || (expKey && normD === removeAccents(row[expKey]));

    let optionsList = [];
    if (isTrueFalseText || (isDummyC && isDummyD)) {
      // Automatic detection for 2-option True/False questions (A=Đúng, B=Sai)
      const aText = rawOptA || 'Đúng';
      const bText = rawOptB || 'Sai';
      optionsList = [aText, bText];
    } else if (isDummyD) {
      optionsList = [rawOptA || 'A', rawOptB || 'B', rawOptC];
    } else {
      optionsList = [rawOptA || 'A', rawOptB || 'B', rawOptC, rawOptD];
    }

    let rawAns = String(row[ansKey] || Object.values(row)[6] || 'A').trim().toUpperCase();
    let correct = 'A';
    if (['A', 'B', 'C', 'D'].includes(rawAns)) {
      correct = rawAns;
    } else if (rawAns === '1' || rawAns.includes(String(rawOptA || 'A'))) correct = 'A';
    else if (rawAns === '2' || rawAns.includes(String(rawOptB || 'B'))) correct = 'B';
    else if (rawAns === '3' || rawAns.includes(String(rawOptC || 'C'))) correct = 'C';
    else if (rawAns === '4' || rawAns.includes(String(rawOptD || 'D'))) correct = 'D';
    else if (rawAns.includes('ĐÚNG') || rawAns === 'DUNG' || rawAns === 'TRUE') correct = 'A';
    else if (rawAns.includes('SAI') || rawAns === 'FALSE') correct = 'B';

    const exp = row[expKey] || row['Giải thích / Gợi ý'] || '';

    return {
      id: `q_${Date.now()}_${index}`,
      question: String(qText).trim(),
      options: optionsList,
      correct: correct,
      explanation: String(exp).trim()
    };
  }).filter(q => q.question.length > 0);

  return questions;
}

/**
 * Universal File Parser for All Extensions (.xlsx, .xls, .csv, .docx, .doc, .pdf, .txt)
 */
export async function parseUniversalFile(file) {
  if (!file) throw new Error('Vui lòng chọn tệp câu hỏi.');

  const fileName = file.name.toLowerCase();

  // 1. Excel / CSV Formats (.xlsx, .xls, .csv, .ods)
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv') || fileName.endsWith('.ods')) {
    const buffer = await file.arrayBuffer();
    const questions = extractQuestionsFromExcelBuffer(buffer);
    if (!questions || questions.length === 0) {
      throw new Error('Không tìm thấy câu hỏi hợp lệ trong tệp Excel/CSV.');
    }
    return questions;
  }

  // 2. Word Formats (.docx, .doc)
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    try {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      const text = result.value || '';
      const questions = extractQuestionsFromText(text);
      if (!questions || questions.length === 0) {
        throw new Error('Không tìm thấy câu hỏi hợp lệ trong tệp Word. Hãy đảm bảo các câu hỏi có dạng "Câu 1: ..." hoặc "1. ... A. B. C. D."');
      }
      return questions;
    } catch (err) {
      throw new Error('Lỗi khi đọc tệp Word: ' + err.message);
    }
  }

  // 3. Text Formats (.txt, .md)
  if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    const text = await file.text();
    const questions = extractQuestionsFromText(text);
    if (!questions || questions.length === 0) {
      throw new Error('Không tìm thấy câu hỏi hợp lệ trong tệp văn bản.');
    }
    return questions;
  }

  // 4. PDF Formats (.pdf)
  if (fileName.endsWith('.pdf')) {
    try {
      const text = await parsePdfToText(file);
      const questions = extractQuestionsFromText(text);
      if (!questions || questions.length === 0) {
        throw new Error('Không tìm thấy câu hỏi hợp lệ trong tệp PDF. Hãy đảm bảo PDF là dạng văn bản có thể chọn chữ.');
      }
      return questions;
    } catch (err) {
      throw new Error('Lỗi khi đọc tệp PDF: ' + err.message);
    }
  }

  // 5. Fallback Text Reader for any other format
  try {
    const text = await file.text();
    const questions = extractQuestionsFromText(text);
    if (questions && questions.length > 0) return questions;
  } catch (e) {
    // Ignore fallback failure
  }

  throw new Error(`Định dạng tệp "${file.name}" chưa được hỗ trợ. Vui lòng tải file Excel, Word, PDF hoặc TXT.`);
}

/**
 * Generate official Homeroom Student Roster Sample Excel File (.xlsx)
 */
export function downloadHomeroomSampleExcel() {
  const sampleData = [
    {
      "STT": 1,
      "Mã Học Sinh": "HS1001",
      "Họ Và Tên": "Nguyễn Văn An",
      "Ngày Sinh": "2010-08-15",
      "Giới Tính": "Nam",
      "Họ Tên Bố": "Nguyễn Văn Bình",
      "Họ Tên Mẹ": "Lê Thị Mai",
      "Số Điện Thoại": "0905123456",
      "Địa Chỉ Nhà": "123 Nguyễn Tất Thành, Đà Nẵng",
      "Ghi Chú Đặc Điểm": "Lớp trưởng gương mẫu, hăng hái phát biểu.",
      "Tình Hình Học Tập": "Tiến bộ xuất sắc"
    },
    {
      "STT": 2,
      "Mã Học Sinh": "HS1002",
      "Họ Và Tên": "Trần Thị Bảo Ngọc",
      "Ngày Sinh": "2010-11-22",
      "Giới Tính": "Nữ",
      "Họ Tên Bố": "Trần Văn Dũng",
      "Họ Tên Mẹ": "Phạm Thị Lan",
      "Số Điện Thoại": "0914987654",
      "Địa Chỉ Nhà": "456 Lê Duẩn, Đà Nẵng",
      "Ghi Chú Đặc Điểm": "Thành viên ban cán sự, năng nổ phong trào.",
      "Tình Hình Học Tập": "Khá - Giỏi"
    },
    {
      "STT": 3,
      "Mã Học Sinh": "HS1003",
      "Họ Và Tên": "Lê Hoàng Nam",
      "Ngày Sinh": "2010-03-05",
      "Giới Tính": "Nam",
      "Họ Tên Bố": "Lê Hoàng Sơn",
      "Họ Tên Mẹ": "Nguyễn Thị Thảo",
      "Số Điện Thoại": "0983112233",
      "Địa Chỉ Nhà": "789 Điện Biên Phủ, Đà Nẵng",
      "Ghi Chú Đặc Điểm": "Yêu thích môn Địa lí, tích cực xây dựng bài.",
      "Tình Hình Học Tập": "Tiến bộ rõ rệt"
    },
    {
      "STT": 4,
      "Mã Học Sinh": "HS1004",
      "Họ Và Tên": "Phạm Thu Hà",
      "Ngày Sinh": "2010-08-18",
      "Giới Tính": "Nữ",
      "Họ Tên Bố": "Phạm Minh Hoàng",
      "Họ Tên Mẹ": "Vũ Thị Hương",
      "Số Điện Thoại": "0935445566",
      "Địa Chỉ Nhà": "12 Nguyễn Văn Linh, Đà Nẵng",
      "Ghi Chú Đặc Điểm": "Học sinh hòa đồng, cẩn thận, chỉn chu.",
      "Tình Hình Học Tập": "Đạt chuẩn"
    },
    {
      "STT": 5,
      "Mã Học Sinh": "HS1005",
      "Họ Và Tên": "Vũ Quốc Khánh",
      "Ngày Sinh": "2010-09-30",
      "Giới Tính": "Nam",
      "Họ Tên Bố": "Vũ Quốc Hùng",
      "Họ Tên Mẹ": "Đỗ Thị Hồng",
      "Số Điện Thoại": "0977889900",
      "Địa Chỉ Nhà": "88 Trần Phú, Đà Nẵng",
      "Ghi Chú Đặc Điểm": "Cần tập trung hơn trong giờ học.",
      "Tình Hình Học Tập": "Cần cố gắng thêm"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Mã HS
    { wch: 24 }, // Họ tên
    { wch: 14 }, // Ngày sinh
    { wch: 10 }, // Giới tính
    { wch: 20 }, // Bố
    { wch: 20 }, // Mẹ
    { wch: 16 }, // SĐT
    { wch: 32 }, // Địa chỉ
    { wch: 35 }, // Ghi chú
    { wch: 20 }  // Tiến bộ
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Danh Sách Học Sinh");
  XLSX.writeFile(workbook, "danh_sach_hoc_sinh_mau_sky_line.xlsx");
}

/**
 * Smart Student Roster File Parser (Excel, Word, PDF, Text, CSV)
 */
export async function parseStudentRosterFile(file) {
  if (!file) throw new Error('Vui lòng chọn tệp thông tin học sinh.');

  const fileName = file.name.toLowerCase();

  // 1. Excel & CSV files
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv') || fileName.endsWith('.ods')) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Read raw 2D array of rows
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (!rows || rows.length === 0) {
      throw new Error('File Excel/CSV rỗng hoặc không có dữ liệu học sinh.');
    }

    // Find true header row (row containing student header e.g. "Họ và tên", "Họ tên", "Ngày sinh", "STT")
    let headerIdx = -1;
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const rowStr = removeAccents((rows[i] || []).join(' '));
      if (
        rowStr.includes('ho va ten') ||
        rowStr.includes('ho ten') ||
        rowStr.includes('hoc sinh') ||
        rowStr.includes('ten hoc sinh') ||
        rowStr.includes('ngay sinh') ||
        rowStr.includes('ma hs') ||
        rowStr.includes('stt') ||
        rowStr.includes('full name')
      ) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1) headerIdx = 0;

    const headerRow = (rows[headerIdx] || []).map(col => String(col || '').trim());
    
    let idCol = -1, nameCol = -1, dobCol = -1, genderCol = -1, fatherCol = -1, motherCol = -1, phoneCol = -1, addrCol = -1, noteCol = -1, progCol = -1;

    headerRow.forEach((colName, colIdx) => {
      const norm = removeAccents(colName);
      if (!norm) return;

      // 1. Student ID matching (Mã HS / Mã học sinh / MSHS / Mã số) - MUST BE MATCHED FIRST!
      if (idCol === -1 && (
        norm.includes('ma hs') ||
        norm.includes('ma hoc sinh') ||
        norm.includes('mshs') ||
        norm.includes('ma so') ||
        norm.includes('student id') ||
        norm.includes('so the') ||
        norm === 'id' ||
        norm === 'ma'
      )) {
        idCol = colIdx;
        return;
      }

      // 2. Full Name matching (Họ và tên / Họ tên / Tên học sinh)
      if (nameCol === -1 && (
        norm.includes('ho va ten') ||
        norm.includes('ho ten') ||
        norm.includes('ten hoc sinh') ||
        norm.includes('ten hs') ||
        norm.includes('full name') ||
        norm === 'ten' ||
        norm === 'name' ||
        (norm.includes('hoc sinh') && !norm.includes('ma') && !norm.includes('mshs'))
      )) {
        nameCol = colIdx;
        return;
      }

      // Date of birth matching (Ngày sinh / Ngày tháng năm sinh / DOB)
      if (dobCol === -1 && (
        norm.includes('ngay sinh') ||
        norm.includes('sinh nhat') ||
        norm.includes('nam sinh') ||
        norm.includes('dob') ||
        norm.includes('birth')
      )) {
        dobCol = colIdx;
        return;
      }

      // Gender matching (Giới tính / Phái)
      if (genderCol === -1 && (
        norm.includes('gioi tinh') ||
        norm.includes('phai') ||
        norm.includes('gender') ||
        norm.includes('nam/nu')
      )) {
        genderCol = colIdx;
        return;
      }

      // Father matching (Bố / Ba / Cha)
      if (fatherCol === -1 && (
        norm.includes('bo') ||
        norm.includes('ba') ||
        norm.includes('cha') ||
        norm.includes('father')
      )) {
        fatherCol = colIdx;
        return;
      }

      // Mother matching (Mẹ)
      if (motherCol === -1 && (
        norm.includes('me') ||
        norm.includes('mother')
      )) {
        motherCol = colIdx;
        return;
      }

      // Phone matching (SĐT / Điện thoại / Liên hệ)
      if (phoneCol === -1 && (
        norm.includes('sdt') ||
        norm.includes('dien thoai') ||
        norm.includes('phone') ||
        norm.includes('lien he') ||
        norm.includes('mobile')
      )) {
        phoneCol = colIdx;
        return;
      }

      // Address matching (Địa chỉ / Nơi ở)
      if (addrCol === -1 && (
        norm.includes('dia chi') ||
        norm.includes('noi o') ||
        norm.includes('address') ||
        norm.includes('thuong tru')
      )) {
        addrCol = colIdx;
        return;
      }

      // Notes matching (Ghi chú / Đặc điểm)
      if (noteCol === -1 && (
        norm.includes('ghi chu') ||
        norm.includes('dac diem') ||
        norm.includes('nhan xet') ||
        norm.includes('note')
      )) {
        noteCol = colIdx;
        return;
      }

      // Progress matching (Tình hình học tập / Tiến bộ)
      if (progCol === -1 && (
        norm.includes('hoc tap') ||
        norm.includes('tien bo') ||
        norm.includes('progress') ||
        norm.includes('hoc luc') ||
        norm.includes('ket qua')
      )) {
        progCol = colIdx;
        return;
      }
    });

    const dataRows = rows.slice(headerIdx + 1);
    const students = [];

    dataRows.forEach((row, idx) => {
      if (!row || row.length === 0) return;

      let rawName = String(row[nameCol !== -1 ? nameCol : (idCol === 1 ? 2 : 1)] || '').trim();
      let rawId = String(row[idCol !== -1 ? idCol : (nameCol === 2 ? 1 : 0)] || '').trim();
      let rawDob = String(row[dobCol !== -1 ? dobCol : 3] || '').trim();

      // AUTOMATIC SWAP SAFEGUARD: If rawName is purely numeric (e.g. "1800862626") AND rawId contains a real name (e.g. "Lê Thanh Hồng"), swap them!
      if (/^\d{5,}$/.test(rawName) && rawId && /[a-zA-Zà-ỹÀ-Ỹ]/.test(rawId)) {
        const temp = rawName;
        rawName = rawId;
        rawId = temp;
      } else if (/^\d{5,}$/.test(rawName)) {
        // Search the row for any cell that has a Vietnamese text name
        const textCell = row.find((val, cI) => cI !== idCol && typeof val === 'string' && /[a-zA-Zà-ỹÀ-Ỹ]{2,}/.test(val) && !removeAccents(val).includes('hoc sinh') && !removeAccents(val).includes('danh sach'));
        if (textCell) {
          rawId = rawName;
          rawName = String(textCell).trim();
        }
      }

      const normName = removeAccents(rawName);

      // Skip title rows, sub-headers, or blank rows
      if (
        !rawName ||
        rawName.length < 2 ||
        normName.includes('ho va ten') ||
        normName.includes('ngay sinh') ||
        normName.includes('gioi tinh') ||
        normName.includes('tong so') ||
        normName.includes('danh sach') ||
        normName.includes('ma hs') ||
        normName.includes('stt')
      ) {
        return;
      }

      // Auto-fix if rawName is a date e.g. "08/02/2012"
      if (rawName.match(/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/)) {
        const temp = rawName;
        // Search row for actual full name
        const foundName = row.find((val, colI) => colI !== dobCol && typeof val === 'string' && val.length > 3 && !val.match(/\d{4}/));
        rawName = String(foundName || row[1] || 'Học Sinh ' + (idx + 1)).trim();
        rawDob = temp;
      }

      // Format DOB cleanly
      if (!rawDob || rawDob.length < 4) rawDob = '2010-01-01';
      else if (typeof row[dobCol] === 'number') {
        const dateObj = XLSX.SSF.parse_date_code(row[dobCol]);
        if (dateObj) {
          const yyyy = dateObj.y;
          const mm = String(dateObj.m).padStart(2, '0');
          const dd = String(dateObj.d).padStart(2, '0');
          rawDob = `${yyyy}-${mm}-${dd}`;
        }
      }

      // Normalize Vietnamese date string DD/MM/YYYY to YYYY-MM-DD
      const dateParts = rawDob.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
      if (dateParts) {
        const dd = String(dateParts[1]).padStart(2, '0');
        const mm = String(dateParts[2]).padStart(2, '0');
        const yyyy = dateParts[3];
        rawDob = `${yyyy}-${mm}-${dd}`;
      }

      students.push({
        id: `st_${Date.now()}_${idx}`,
        studentId: rawId && !rawId.toLowerCase().includes('stt') && !rawId.toLowerCase().includes('ma') ? rawId : `HS100${idx + 1}`,
        name: rawName,
        dob: rawDob,
        gender: String(row[genderCol] || 'Nam').trim(),
        fatherName: fatherCol !== -1 ? String(row[fatherCol] || '').trim() : '',
        motherName: motherCol !== -1 ? String(row[motherCol] || '').trim() : '',
        phone: phoneCol !== -1 ? String(row[phoneCol] || '').trim() : '',
        address: addrCol !== -1 ? String(row[addrCol] || '').trim() : '',
        avatar: '',
        teacherNotes: noteCol !== -1 ? String(row[noteCol] || '').trim() : '',
        academicProgress: progCol !== -1 ? String(row[progCol] || 'Khá - Giỏi').trim() : 'Khá - Giỏi',
        violations: [],
        rewards: []
      });
    });

    if (students.length === 0) {
      throw new Error('Không tìm thấy danh sách học sinh hợp lệ trong tệp Excel. Thầy cô có thể tải File Mẫu (.xlsx) của hệ thống để nhập.');
    }
    return students;
  }

  // 2. Word / PDF / TXT Text Parsing
  let rawText = '';
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    const buffer = await file.arrayBuffer();
    const res = await mammoth.extractRawText({ arrayBuffer: buffer });
    rawText = res.value || '';
  } else if (fileName.endsWith('.pdf')) {
    rawText = await parsePdfToText(file);
  } else {
    rawText = await file.text();
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const students = [];

  lines.forEach((line, idx) => {
    // Match line pattern e.g. "1. Nguyễn Văn A - 15/08/2010 - Nam - SĐT: 0905123456"
    const nameMatch = line.match(/^(\d+[\.\:\)\-]|\-)\s*([^\d\-\:\,\;]+)/);
    if (nameMatch && nameMatch[2].length > 3) {
      const name = nameMatch[2].trim();
      const phoneMatch = line.match(/(0\d{9,10})/);
      const dobMatch = line.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/);

      students.push({
        id: `st_${Date.now()}_${idx}`,
        studentId: `HS100${idx + 1}`,
        name: name,
        dob: dobMatch ? dobMatch[1] : '2010-01-01',
        gender: line.includes('Nữ') ? 'Nữ' : 'Nam',
        fatherName: '',
        motherName: '',
        phone: phoneMatch ? phoneMatch[1] : '',
        address: '',
        avatar: '',
        teacherNotes: line,
        academicProgress: 'Tiến bộ',
        violations: [],
        rewards: []
      });
    }
  });

  if (students.length === 0) {
    throw new Error('Không trích xuất được học sinh từ file. Thầy cô có thể sử dụng nút Tải File Excel Mẫu (.xlsx) để nhập danh sách chính xác.');
  }

  return students;
}
