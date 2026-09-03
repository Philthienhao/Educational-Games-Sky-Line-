import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import textbookCatalog from './textbookCatalog.json';
import { getCurriculumQuestions } from './curriculumQuestionBank';

// Set PDF.js worker fallback if needed
try {
  if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker setup fallback');
}

/**
 * Built-In Textbook Catalog Registry
 */
export const BUILTIN_TEXTBOOKS = textbookCatalog.filter(b => !b.fileName.endsWith('HD_CHEP_FILE_SGK.txt'));

/**
 * Clean & Sanitize Raw Textbook Text
 * Strips HTML tags, web boilerplate, DOCTYPE declarations, code snippets & PDF page noise
 */
export function cleanTextbookText(text) {
  if (!text) return '';

  let cleaned = String(text);

  // 1. Detect if this is an HTML file or SPA fallback page (like index.html starting with <!DOCTYPE)
  if (cleaned.trim().toLowerCase().startsWith('<!doctype') || cleaned.toLowerCase().includes('<html')) {
    // Strip HTML markup tags & scripts
    cleaned = cleaned
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ');
  }

  return cleaned
    // Remove HTML Entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Remove Code directives & HTML attributes
    .replace(/<!DOCTYPE[^>]*>/gi, ' ')
    .replace(/\b(charset|viewport|content-type|href|src|class|style|doctype|html|head|body)\s*=\s*"[^"]*"/gi, ' ')
    // Remove '-- X of Y --' and page number noise
    .replace(/--\s*\d+\s*(of|\/)\s*\d+\s*--/gi, ' ')
    .replace(/--\s*\d+\s*--/g, ' ')
    .replace(/\b\d+\s*of\s*\d+\b/gi, ' ')
    .replace(/\bTrang\s*\d+(\s*\/\s*\d+)?\b/gi, ' ')
    .replace(/\bPage\s*\d+(\s*of\s*\d+)?\b/gi, ' ')
    .replace(/--- Trang \d+ ---/gi, ' ')
    // Remove repetitive Publisher boilerplate
    .replace(/NHÀ XUẤT BẢN GIÁO DỤC VIỆT NAM/gi, ' ')
    .replace(/KẾT NỐI TRI THỨC VỚI CUỘC SỐNG/gi, ' ')
    .replace(/SÁCH GIÁO VIÊN/gi, ' ')
    .replace(/SÁCH GIÁO KHOA/gi, ' ')
    .replace(/ISBN\s*[\d\-]+/gi, ' ')
    // Remove excess symbols
    .replace(/[-_]{3,}/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Load Content from Built-In Textbook PDF / Pre-extracted text file
 */
export async function loadBuiltInTextbook(textbookId) {
  const found = BUILTIN_TEXTBOOKS.find(b => b.id === textbookId);
  if (!found) return '';

  // 1. Try loading pre-extracted text file if available
  if (found.textPath) {
    try {
      const res = await fetch(found.textPath);
      if (res.ok) {
        const text = await res.text();
        // Check if fetched text is SPA fallback index.html (starts with <!DOCTYPE html)
        if (text && !text.trim().toLowerCase().startsWith('<!doctype') && !text.toLowerCase().includes('<html')) {
          const cleanedText = cleanTextbookText(text);
          if (cleanedText && cleanedText.length > 20) return cleanedText;
        }
      }
    } catch (e) {
      console.warn('Pre-extracted text fetch error:', e);
    }
  }

  // 2. Fallback to raw file fetch
  try {
    const pathSegments = found.fileName.split('/').map(seg => encodeURIComponent(seg)).join('/');
    const fileUrl = `/textbooks/${pathSegments}`;

    const res = await fetch(fileUrl);
    if (res.ok) {
      const text = await res.text();
      if (text && !text.trim().toLowerCase().startsWith('<!doctype') && !text.toLowerCase().includes('<html')) {
        const blob = await res.blob();
        const mockFile = new File([blob], found.fileName, { type: blob.type });
        const rawText = await extractTextFromTextbookFile(mockFile);
        return cleanTextbookText(rawText);
      }
    }
  } catch (e) {
    console.warn('Error reading built-in textbook file:', e);
  }

  // Guaranteed fallback: Return title & subject indicator for Curriculum Question Bank
  return `SÁCH GIÁO KHOA: ${found.title} - ${found.grade || 'Lớp 10'} - ${found.subject || 'Địa Lý'}`;
}

/**
 * Extract raw text from textbook file (.pdf, .docx, .txt, .xlsx, .csv)
 */
export async function extractTextFromTextbookFile(file) {
  if (!file) return '';
  const fileName = file.name.toLowerCase();
  let rawText = '';

  // 1. Text / Markdown / CSV
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv')) {
    rawText = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || '');
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }
  // 2. Word Document (.docx)
  else if (fileName.endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      rawText = result.value || '';
    } catch (e) {
      console.warn('Mammoth docx parse error:', e);
    }
  }
  // 3. Excel Document (.xlsx, .xls)
  else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      let fullText = '';
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        fullText += `\n--- Sheet: ${sheetName} ---\n` + XLSX.utils.sheet_to_txt(worksheet);
      });
      rawText = fullText;
    } catch (e) {
      console.warn('Excel parse error:', e);
    }
  }
  // 4. PDF Document (.pdf)
  else if (fileName.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let pdfText = '';
      const maxPages = Math.min(pdf.numPages, 60);
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        pdfText += `\n ` + pageText;
      }
      rawText = pdfText;
    } catch (e) {
      console.warn('PDFjs parse error, trying text fallback:', e);
      rawText = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result || '');
        reader.readAsText(file);
      });
    }
  }
  else {
    rawText = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || '');
      reader.readAsText(file);
    });
  }

  return cleanTextbookText(rawText);
}

/**
 * AI Question Generator Function
 * Supports Gemini AI API & Guaranteed Smart Curriculum NLP Engine
 */
export async function generateQuestionsFromTextbook({ textbookText, promptCommand, apiKey = '', grade = '', subject = '' }) {
  const sanitizedText = cleanTextbookText(textbookText);

  // Detect target count requested by teacher
  const countMatch = (promptCommand || '').match(/(\d+)\s*câu/i);
  const targetCount = countMatch ? Math.min(50, Math.max(1, parseInt(countMatch[1], 10))) : 15;

  // Check saved API key
  const effectiveKey = apiKey || localStorage.getItem('gemini_api_key') || '';

  if (effectiveKey && effectiveKey.trim().length > 10) {
    try {
      const geminiQuestions = await generateQuestionsViaGemini({ textbookText: sanitizedText, promptCommand, targetCount, apiKey: effectiveKey.trim() });
      if (geminiQuestions && geminiQuestions.length > 0) {
        return geminiQuestions;
      }
    } catch (err) {
      console.warn('Gemini API call error, falling back to Smart Curriculum Engine:', err.message);
    }
  }

  // Fallback to Guaranteed Smart Curriculum NLP Engine
  return generateQuestionsViaSmartCurriculum({ textbookText: sanitizedText, promptCommand, targetCount, grade, subject });
}

/**
 * Generate Questions via Google Gemini API
 */
async function generateQuestionsViaGemini({ textbookText, promptCommand, targetCount, apiKey }) {
  const truncatedText = textbookText.slice(0, 30000);

  const systemPrompt = `Bạn là trợ lý AI chuyên gia soạn thảo đề thi & câu hỏi trắc nghiệm giáo dục Việt Nam. Dưới đây là nội dung tài liệu / Sách Giáo Khoa do giáo viên chọn:

--- NỘI DUNG SÁCH GIÁO KHOA / TÀI LIỆU ---
${truncatedText}
----------------------------------------

Yêu cầu chỉ đạo từ giáo viên: "${promptCommand}"

Nhiệm vụ của bạn:
1. Phân tích kĩ tài liệu Sách Giáo Khoa trên và tạo ra đúng ${targetCount} câu hỏi trắc nghiệm kiến thức môn học.
2. Tuyệt đối KHÔNG tạo câu hỏi về mã HTML, thẻ lập trình hay ký tự hệ thống web. Chỉ tạo câu hỏi bài học giáo dục chuẩn mực.
3. Mỗi câu hỏi gồm 4 phương án đáp án (A, B, C, D) và xác định rõ 1 đáp án đúng (A, B, C, hoặc D).
4. Thêm phần giải thích ngắn gọn tại sao chọn đáp án đó dựa theo SGK.
5. Chỉ trả về một mảng JSON thuần túy (Array of Objects), KHÔNG kèm theo lời mở đầu, giải thích hay markdown block nào.

Cấu trúc JSON từng phần tử:
[
  {
    "question": "Nội dung câu hỏi...",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correct": "A",
    "explanation": "Giải thích căn cứ theo SGK..."
  }
]`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Lỗi Gemini API (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  const jsonMatch = rawText.match(/\[\s*\{.*\}\s*\]/s) || [rawText.replace(/```json/gi, '').replace(/```/g, '').trim()];
  const cleanedJson = jsonMatch[0];
  const questionsArray = JSON.parse(cleanedJson);

  if (!Array.isArray(questionsArray)) {
    throw new Error('Dữ liệu AI trả về không phải là một mảng câu hỏi JSON.');
  }

  return questionsArray.map((q, idx) => ({
    id: `ai_gemini_${Date.now()}_${idx}`,
    question: q.question || `Câu hỏi ${idx + 1}`,
    options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
    correct: ['A', 'B', 'C', 'D'].includes(String(q.correct).toUpperCase()) ? String(q.correct).toUpperCase() : 'A',
    explanation: q.explanation || 'Theo kiến thức Sách Giáo Khoa.'
  }));
}

/**
 * Smart Curriculum NLP & Bank Engine
 * Guarantees ALWAYS clean, accurate educational questions with zero HTML/code noise!
 */
function generateQuestionsViaSmartCurriculum({ textbookText, promptCommand, targetCount, grade = '', subject = '' }) {
  const cleanText = cleanTextbookText(textbookText);

  // Filter out any HTML/web page noise
  const normalizedText = cleanText
    .replace(/\r\n/g, '\n')
    .replace(/([^\n])\n([^\n])/g, '$1 $2')
    .replace(/\s+/g, ' ');

  // Sentence Filtering: Strict exclusion of code / HTML artifacts
  const rawSentences = normalizedText
    .split(/[\.\?\!\;\n]+/)
    .map(s => s.trim())
    .filter(s => {
      if (s.length < 25 || s.length > 300) return false;
      const lower = s.toLowerCase();
      // Purge any HTML or Code keywords
      if (
        lower.includes('doctype') || lower.includes('html') || lower.includes('head') ||
        lower.includes('meta') || lower.includes('charset') || lower.includes('viewport') ||
        lower.includes('href=') || lower.includes('script') || lower.includes('style=') ||
        lower.includes('content=') || lower.includes('rel=') || lower.includes('xmlns') ||
        lower.includes('http') || lower.includes('www') || lower.includes('{') || lower.includes('}')
      ) {
        return false;
      }
      // Must contain Vietnamese letters
      const vietnameseLetters = (s.match(/[a-zA-ZàáẢẢẠÊỀẾỂỂỆÔỒỐỔỔỘƠỜỚỞỞỢƯỪỨỬỬỰYỲÝỶỶỴa-z0-9]/g) || []).length;
      return vietnameseLetters >= 15;
    });

  const questions = [];

  // TIER 1: Definition Extraction (X là Y, X bao gồm Y...)
  const definitionRegex = /^([A-ZÀÁẢẢẠÊỀẾỂỂỆÔỒỐỔỔỘƠỜỚỞỞỢƯỪỨỬỬỰYỲÝỶỶỴa-z0-9\s]{3,45})\s+(là|bao gồm|được gọi là|chính là|đóng vai trò|thể hiện|giúp|mang lại)\s+(.+)/i;

  const facts = [];
  for (const sentence of rawSentences) {
    const match = sentence.match(definitionRegex);
    if (match) {
      facts.push({
        subject: match[1].trim(),
        verb: match[2].trim(),
        predicate: match[3].trim(),
        fullSentence: sentence
      });
    }
  }

  for (let i = 0; i < facts.length && questions.length < targetCount; i++) {
    const fact = facts[i];
    const qText = `${fact.subject} ${fact.verb} gì theo kiến thức bài học?`;
    const correctAns = fact.predicate;

    const otherPredicates = facts
      .filter((_, idx) => idx !== i)
      .map(f => f.predicate);

    const optionB = otherPredicates[0] || 'Là nội dung mở rộng không liên quan trực tiếp bài học.';
    const optionC = otherPredicates[1] || 'Là yếu tố phụ thuộc vào điều kiện ngoại cảnh.';
    const optionD = otherPredicates[2] || 'Không được đề cập trong tài liệu sách giáo khoa.';

    questions.push({
      id: `ai_nlp_${Date.now()}_${questions.length + 1}`,
      question: qText,
      options: [correctAns, optionB, optionC, optionD],
      correct: 'A',
      explanation: `Căn cứ theo SGK: "${fact.fullSentence}"`
    });
  }

  // TIER 2: Fill-in-the-Blank Cloze Questions for valid educational text
  for (let i = 0; i < rawSentences.length && questions.length < targetCount; i++) {
    const sentence = rawSentences[i];
    if (questions.some(q => q.explanation.includes(sentence))) continue;

    const words = sentence.split(/\s+/);
    if (words.length >= 6 && words.length <= 25) {
      const targetIdx = Math.floor(words.length / 2);
      const rawTargetWord = words[targetIdx];
      const targetWord = rawTargetWord.replace(/[,\.\:\;\(\)]/g, '');

      if (targetWord.length >= 3 && !targetWord.match(/^\d+$/) && !targetWord.includes('=')) {
        words[targetIdx] = '______';
        const maskedQuestion = `Điền từ/cụm từ thích hợp vào chỗ trống: "${words.join(' ')}"`;

        questions.push({
          id: `ai_nlp_${Date.now()}_${questions.length + 1}`,
          question: maskedQuestion,
          options: [
            targetWord,
            `không ${targetWord}`,
            'nội dung khác',
            'thành phần mở rộng'
          ],
          correct: 'A',
          explanation: `Căn cứ theo SGK: "${sentence}"`
        });
      }
    }
  }

  // TIER 3: Knowledge Verification Questions
  for (let i = 0; i < rawSentences.length && questions.length < targetCount; i++) {
    const sentence = rawSentences[i];
    if (questions.some(q => q.explanation.includes(sentence))) continue;

    questions.push({
      id: `ai_nlp_${Date.now()}_${questions.length + 1}`,
      question: `Nhận định nào sau đây là CHÍNH XÁC theo nội dung bài học?`,
      options: [
        sentence,
        `Trái ngược hoàn toàn với nhận định: ${sentence.slice(0, 45)}...`,
        'Nội dung không nằm trong mục tiêu bài học.',
        'Ý kiến chưa được kiểm chứng trong tài liệu.'
      ],
      correct: 'A',
      explanation: `Căn cứ theo SGK: "${sentence}"`
    });
  }

  // TIER 4: High-Quality Curriculum Question Bank Integration (Fills remaining to guarantee targetCount)
  if (questions.length < targetCount) {
    const needed = targetCount - questions.length;
    const bankQuestions = getCurriculumQuestions({
      grade,
      subject,
      promptCommand,
      targetCount: needed
    });
    questions.push(...bankQuestions);
  }

  // Shuffle options for generated questions so 'A' is randomly positioned across A, B, C, D
  return questions.slice(0, targetCount).map((q) => {
    const options = [...q.options];
    const correctVal = options[0];

    // Fisher-Yates Shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const correctLetter = ['A', 'B', 'C', 'D'][options.indexOf(correctVal)] || 'A';
    return {
      ...q,
      options,
      correct: correctLetter
    };
  });
}
