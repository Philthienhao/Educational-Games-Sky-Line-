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
      apiKey = ''
    } = body || {};

    const effectiveApiKey = (apiKey && apiKey.trim().length > 15) ? apiKey.trim() : GEMINI_API_KEY;

    if (!effectiveApiKey) {
      return res.status(500).json({ error: 'Chưa cấu hình API Key Gemini trên hệ thống.' });
    }

    const isHeadTilt = gameType === 'head-tilt';
    const numQuestions = Math.min(30, Math.max(3, parseInt(targetCount, 10) || 10));

    // Truncate textbook text to avoid context token limits
    const safeText = (textbookText || '').slice(0, 35000);

    const systemPrompt = `Bạn là trợ lý AI chuyên gia sư phạm & thiết kế trò chơi giáo dục chuẩn Bộ GD&ĐT Việt Nam (Chương trình GDPT 2018).

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

    // Clean & Parse JSON
    let cleanJsonStr = candidatesData
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

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
