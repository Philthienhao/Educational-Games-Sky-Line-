// Vercel Serverless API Endpoint for Gemini AI Question & Game Generation
// Path: /api/gemini

const DEFAULT_ENC_KEY = 'QVEuQWI4Uk42TGZHYjdxS3YwVzNJMXNfQkNTU2l5SUhCRjV0YlFfSENrVFJPaGhHVDhBLXc=';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || (typeof Buffer !== 'undefined' ? Buffer.from(DEFAULT_ENC_KEY, 'base64').toString('utf8') : '');

// Supported & Verified Active Google Gemini Models (Fallbacks in order)
const ACTIVE_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-3.8-flash'
];

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is supported.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const {
      promptCommand = '',
      textbookTitle = '',
      textbookText = '',
      targetCount = 10,
      gameType = 'tug-of-war-dual',
      grade = '',
      subject = '',
      apiKey = '',
      mode = 'game',
      worksheetTheme = 'primary_cute',
      worksheetTypes = []
    } = body || {};

    const effectiveApiKey = (apiKey && apiKey.trim().length > 15) ? apiKey.trim() : GEMINI_API_KEY;

    if (!effectiveApiKey) {
      return res.status(500).json({ error: 'Chưa cấu hình API Key Gemini trên hệ thống.' });
    }

    const isWorksheet = mode === 'worksheet';
    const isHeadTilt = gameType === 'head-tilt';
    const numQuestions = Math.min(30, Math.max(3, parseInt(targetCount, 10) || 10));

    // Truncate textbook text to avoid context token limits
    const safeText = (textbookText || '').slice(0, 35000);

    let systemPrompt = '';

    if (isWorksheet) {
      systemPrompt = `Bạn là trợ lý AI chuyên gia sư phạm & thiết kế Phiếu bài tập / Phiếu học tập chuẩn Bộ GD&ĐT Việt Nam (Chương trình GDPT 2018).

Nhiệm vụ của bạn là đọc tài liệu Sách Giáo Khoa dưới đây và biên soạn một PHIẾU BÀI TẬP / PHIẾU HỌC TẬP hoàn chỉnh, sư phạm, hấp dẫn theo phong cách giáo dục Việt Nam.

--- THÔNG TIN SÁCH & BÀI HỌC ---
• Tên sách: ${textbookTitle || 'Sách Giáo Khoa'}
• Khối lớp: ${grade || 'Lớp 2'}
• Môn học: ${subject || 'Tiếng Việt'}
• Phong cách mẫu: ${worksheetTheme || 'primary_cute'} (primary_cute: Tiểu học sắc màu vui tươi, standard_secondary: THCS/THPT tiêu chuẩn trang nhã, eco_bw: Tối giản đen trắng in ấn A4)
• Yêu cầu từ giáo viên: "${promptCommand || 'Tạo phiếu bài tập / phiếu học tập ôn luyện bài học'}"

--- NỘI DUNG TÀI LIỆU / BÀI HỌC TRONG SÁCH ---
${safeText ? safeText : `Sách ${textbookTitle} môn ${subject} ${grade}. Hãy bám sát kiến thức trọng tâm chuẩn GDPT 2018.`}
---------------------------------------------

YÊU CẦU BẮT BUỘC:
1. XÁC ĐỊNH RÕ RÀNG TÊN BÀI HỌC VÀ TIÊU ĐỀ PHIẾU:
   - Trường "lesson": BẮT BUỘC ghi rõ BÀI HỌC CỤ THỂ theo đúng yêu cầu từ giáo viên và mục lục SGK (Ví dụ: giáo viên yêu cầu "bài 1" sách Tiếng Việt 1 Tập 2 -> "lesson": "BÀI 1: TÔI LÀ HỌC SINH LỚP 1"; sách Tiếng Việt 1 Tập 1 -> "lesson": "BÀI 1: A a"; sách Toán 1 -> "lesson": "BÀI 1: CÁC SỐ TRONG PHẠM VI 20"). TUYỆT ĐỐI KHÔNG được để trống trường này!
   - Trường "title": Phải kèm số bài học (Ví dụ: "PHIẾU BÀI TẬP VÀ ÔN LUYỆN - BÀI 1" hoặc "PHIẾU HỌC TẬP BÀI 1").
   - Trường "subtitle": Phải ghi rõ: "Bài 1: [Tên bài học cụ thể] · Chủ đề: [Nội dung trọng tâm]".
   - Toàn bộ nội dung câu hỏi, từ ngữ, bài tập BẮT BUỘC bám sát chính xác các từ vựng, bài đọc, câu văn của đúng BÀI HỌC ĐÓ trong sách giáo khoa!
2. Soạn nội dung phiếu gồm các phần đa dạng, thiết thực, chuẩn mực, phù hợp lứa tuổi học sinh ${grade || ''}:
   - Phần 1: Trắc nghiệm khách quan (3-4 câu, khoanh tròn đáp án đúng A, B, C, D)
   - Phần 2: Điền khuyết / Điền từ vào chỗ trống (2-3 câu, có kho từ gợi ý wordBank nếu là cấp tiểu học)
   - Phần 3: Nối cột tương ứng (ghép nối 3-4 cặp ý logic hai cột Trái - Phải; với tiểu học hãy tạo dạng nối hình ảnh/từ ngữ sinh động)
   - Phần 4: Đúng / Sai (3 câu nhận định để học sinh điền Đ hoặc S)
   - Phần 5: Bảng phân tích / Bảng tổng hợp kiến thức (dạng ma trận 2 cột rõ ràng)
   - Phần 6: Tự luận & Vận dụng thực tế (1-2 câu, kèm số dòng kẻ chừa sẵn cho học sinh viết)
3. QUY TẮC MINH HỌA HÌNH ẢNH & ICON (ĐẶC BIỆT DÀNH CHO TIỂU HỌC):
   - Các đáp án trắc nghiệm ("options") phải ngắn gọn, súc tích để nằm vừa vặn trên 1 HÀNG NGANG duy nhất.
   - QUY TẮC KHỚP NGHĨA 100%: Trường "optionIcons" CHỈ CUNG CẤP khi 4 phương án là 4 sự vật/con vật/đồ vật/hoa quả cụ thể và ICON PHẢI KHỚP 100% VỚI NỘI DUNG TỪNG ĐÁP ÁN (Ví dụ: options = ["Cây bút chì", "Con mèo", "Quả bóng", "Bông hoa"] -> optionIcons = ["✏️", "🐱", "⚽", "🌸"]).
   - NẾU các đáp án là từ ngữ trừu tượng, từ chỉ đặc điểm, âm vần, hoặc câu dài (ví dụ: "chăm chỉ", "ngoan ngoãn", "khéo léo"): HÃY ĐỂ TRỐNG "optionIcons": []. TUYỆT ĐỐI KHÔNG gán bừa icon con vật hay hoa quả không liên quan!
   - Thêm trường "illustration" (book, pencil, school, cat, dog, duck, bird, fish, apple, flower, tree, sun, car, clock, runner, star, calculator...) cho từng câu hỏi khớp đúng với nội dung câu hỏi.
   - Cung cấp "leftIcon" cho từng cặp nối ở Phần 3 để làm thẻ tranh hình ảnh minh họa to rõ, khớp đúng với từ ngữ ở Cột A.
4. Kèm theo hướng dẫn chấm điểm & đáp án chi tiết cho giáo viên (teacherGuide).
5. CHỈ TRẢ VỀ DUY NHẤT một đối tượng JSON thuần túy (Object), KHÔNG có bất kỳ lời mở đầu, kết luận hay markdown codeblock nào (tránh ```json).

Cấu trúc JSON bắt buộc:
{
  "lesson": "BÀI 1: TÔI LÀ HỌC SINH LỚP 1",
  "title": "PHIẾU BÀI TẬP VÀ ÔN LUYỆN - BÀI 1",
  "subtitle": "Bài 1: Tôi là học sinh lớp 1 · Chủ đề: Rèn kĩ năng đọc hiểu & chính tả",
  "school": "TRƯỜNG SKY-LINE",
  "subject": "${subject || 'Kiến thức chung'}",
  "grade": "${grade || 'Tiểu học'}",
  "timeAllowed": "35 - 40 phút",
  "sections": [
    {
      "type": "multiple_choice",
      "title": "I. TRẮC NGHIỆM KHÁCH QUAN",
      "instruction": "Khoanh vào chữ cái đặt trước câu trả lời đúng nhất:",
      "items": [
        {
          "id": 1,
          "question": "Đồ dùng học tập nào giúp em viết những dòng chữ sạch đẹp hàng ngày?",
          "options": ["Cây bút chì", "Con mèo", "Quả bóng", "Bông hoa"],
          "optionIcons": ["✏️", "🐱", "⚽", "🌸"],
          "answer": "A",
          "illustration": "pencil",
          "points": "0.5 đ"
        }
      ]
    },
    {
      "type": "fill_blank",
      "title": "II. ĐIỀN KHUYẾT",
      "instruction": "Chọn từ thích hợp trong ngoặc để điền vào chỗ trống:",
      "items": [
        {
          "id": 2,
          "question": "Câu có chỗ trống ________ cần điền.",
          "wordBank": ["từ 1", "từ 2", "từ 3"],
          "answer": "từ 1",
          "illustration": "pencil",
          "points": "1.0 đ"
        }
      ]
    },
    {
      "type": "matching",
      "title": "III. NỐI TỪ VỚI HÌNH MINH HỌA PHÙ HỢP",
      "instruction": "Em hãy quan sát hình vẽ và nối với từ ngữ tương ứng:",
      "pairs": [
        { "left": "Từ ngữ 1", "leftIcon": "🐱", "right": "Đặc điểm / Lời giải nghĩa 1" },
        { "left": "Từ ngữ 2", "leftIcon": "📖", "right": "Đặc điểm / Lời giải nghĩa 2" }
      ],
      "points": "1.5 đ"
    },
    {
      "type": "true_false",
      "title": "IV. ĐÚNG GHI Đ, SAI GHI S",
      "instruction": "Đọc kĩ các nhận định sau và ghi Đ (Đúng) hoặc S (Sai) vào ô trống:",
      "items": [
        { "statement": "Nhận định kiến thức...", "answer": "Đ", "illustration": "star", "points": "1.0 đ" }
      ]
    },
    {
      "type": "table_matrix",
      "title": "V. BẢNG TỔNG HỢP KIẾN THỨC BÀI HỌC",
      "instruction": "Hoàn thành bảng phân loại kiến thức dưới đây:",
      "headers": ["Nhóm đối tượng / Tiêu chí", "Đặc điểm / Ứng dụng thực tế"],
      "rows": [
        { "col1": "Mục 1", "col2": "Nội dung tóm tắt..." },
        { "col1": "Mục 2", "col2": "" }
      ],
      "points": "2.0 đ"
    },
    {
      "type": "short_answer",
      "title": "VI. TỰ LUẬN & VẬN DỤNG THỰC TẾ",
      "instruction": "Trả lời câu hỏi sau bằng 2-3 câu hoàn chỉnh:",
      "items": [
        {
          "id": 6,
          "question": "Câu hỏi tự luận vận dụng thực tế từ bài học?",
          "lines": 3,
          "suggestedAnswer": "Gợi ý đáp án đầy đủ...",
          "points": "2.0 đ"
        }
      ]
    }
  ],
  "teacherGuide": {
    "totalPoints": "10 điểm",
    "answerKey": "Tóm tắt đáp án chi tiết các phần...",
    "notes": "Lưu ý phương pháp khi nhận xét bài làm của học sinh."
  }
}`;
    } else {
      systemPrompt = `Bạn là trợ lý AI chuyên gia sư phạm & thiết kế trò chơi giáo dục chuẩn Bộ GD&ĐT Việt Nam (Chương trình GDPT 2018).

Nhiệm vụ của bạn là đọc tài liệu Sách Giáo Khoa dưới đây và soạn bộ câu hỏi trắc nghiệm để chuyển thành trò chơi giáo dục tương tác cho học sinh.

--- THÔNG TIN SÁCH & BÀI HỌC ---
• Tên sách: ${textbookTitle || 'Sách Giáo Khoa'}
• Khối lớp: ${grade || 'Phổ thông'}
• Môn học: ${subject || 'Kiến thức chung'}
• Mẫu trò chơi: ${gameType}
• Yêu cầu chỉ đạo từ giáo viên: "${promptCommand || 'Tạo bộ câu hỏi bám sát nội dung bài học trong sách'}"

--- NỘI DUNG TÀI LIỆU / BÀI HỌC TRONG SÁCH ---
${safeText ? safeText : `Sách ${textbookTitle} môn ${subject} ${grade}. Hãy tạo các câu hỏi chuẩn xác, sư phạm bám sát chương trình GDPT 2018.`}
---------------------------------------------

YÊU CẦU BẮT BUỘC:
1. Tạo ĐÚNG ${numQuestions} câu hỏi trắc nghiệm chất lượng cao, vui nhộn, phù hợp đúng lứa tuổi học sinh ${grade || ''}.
${isHeadTilt 
  ? `2. ĐẶC BIỆT CHO GAME NGHIÊNG ĐẦU: Mỗi câu hỏi CHỈ ĐƯỢC CÓ ĐÚNG 2 ĐÁP ÁN (Option A và Option B). Trường options phải là mảng 2 phần tử ["...", "..."], correct là "A" hoặc "B".`
  : `2. Mỗi câu hỏi gồm ĐÚNG 4 phương án lựa chọn trong mảng options: ["...", "...", "...", "..."], trường correct là một trong 4 chữ cái: "A", "B", "C", hoặc "D".`
}
3. Tuyệt đối KHÔNG tạo câu hỏi về mã HTML, thẻ web hay ký tự lập trình rác.
4. Mỗi câu hỏi phải có phần giải thích ngắn gọn (explanation) căn cứ theo nội dung SGK.
5. CHỈ TRẢ VỀ DUY NHẤT một mảng JSON thuần túy (Array of Objects), KHÔNG có bất kỳ lời mở đầu, kết luận hay markdown codeblock nào (tránh \`\`\`json).

Cấu trúc từng câu hỏi:
[
  {
    "question": "Nội dung câu hỏi ngắn gọn, rõ ràng?",
    "options": ${isHeadTilt ? `["Đáp án A", "Đáp án B"]` : `["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"]`},
    "correct": "A",
    "explanation": "Căn cứ theo bài học trong sách giáo khoa..."
  }
]`;
    }

    let lastError = null;
    let candidatesData = null;

    // Try models in sequence
    for (const modelName of ACTIVE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${effectiveApiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const resJson = await response.json();
          const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText && rawText.length > 20) {
            candidatesData = rawText;
            break; // Success!
          }
        } else {
          const errBody = await response.text().catch(() => '');
          lastError = `Model ${modelName} returned status ${response.status}: ${errBody}`;
        }
      } catch (err) {
        lastError = `Model ${modelName} error: ${err.message}`;
      }
    }

    if (!candidatesData) {
      return res.status(502).json({
        error: 'Tất cả các model Gemini đều đang bận hoặc quá tải.',
        details: lastError
      });
    }

    // Clean JSON String
    let cleanJsonStr = candidatesData
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    if (isWorksheet) {
      const jsonMatch = cleanJsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJsonStr = jsonMatch[0];
      }
      const parsedWorksheet = JSON.parse(cleanJsonStr);

      return res.status(200).json({
        success: true,
        mode: 'worksheet',
        worksheet: parsedWorksheet,
        meta: {
          textbookTitle,
          grade,
          subject,
          theme: worksheetTheme
        }
      });
    }

    const jsonMatch = cleanJsonStr.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      cleanJsonStr = jsonMatch[0];
    }

    const parsedArray = JSON.parse(cleanJsonStr);

    if (!Array.isArray(parsedArray) || parsedArray.length === 0) {
      return res.status(502).json({ error: 'AI không tạo đúng định dạng mảng câu hỏi JSON.' });
    }

    // Format & validate questions
    const formattedQuestions = parsedArray.map((q, idx) => {
      let opts = Array.isArray(q.options) ? q.options.map(o => String(o).trim()) : [];
      if (isHeadTilt) {
        if (opts.length < 2) opts = ['Đúng / Đồng ý', 'Sai / Không đồng ý'];
        opts = opts.slice(0, 2);
      } else {
        if (opts.length < 4) {
          while (opts.length < 4) {
            opts.push(`Lựa chọn ${opts.length + 1}`);
          }
        }
        opts = opts.slice(0, 4);
      }

      let corr = String(q.correct || 'A').toUpperCase().trim();
      if (isHeadTilt && !['A', 'B'].includes(corr)) corr = 'A';
      if (!isHeadTilt && !['A', 'B', 'C', 'D'].includes(corr)) corr = 'A';

      return {
        id: `ai_sgk_${Date.now()}_${idx + 1}`,
        question: String(q.question || `Câu hỏi ${idx + 1}`).trim(),
        options: opts,
        correct: corr,
        explanation: String(q.explanation || 'Theo nội dung Sách Giáo Khoa.').trim()
      };
    });

    return res.status(200).json({
      success: true,
      questions: formattedQuestions,
      meta: {
        textbookTitle,
        grade,
        subject,
        gameType,
        count: formattedQuestions.length
      }
    });

  } catch (err) {
    console.error('API Gemini Error:', err);
    return res.status(500).json({
      error: 'Lỗi xử lý câu hỏi từ máy chủ: ' + err.message
    });
  }
}
