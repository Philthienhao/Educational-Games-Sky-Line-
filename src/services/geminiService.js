/**
 * Gemini AI Service for Sky-Line Educational Games Platform
 * Integrates Google Gemini 2.5 Flash API for automated game creation,
 * homeroom remarks, lesson outlines, parent meeting scripts, and textbook quizzes.
 */

const FALLBACK_GEMINI_KEY = ''; // Public zero-config fallback key (or user enters custom key)

export const GeminiService = {
  /**
   * Get active Gemini API key (custom or fallback)
   */
  getApiKey() {
    const customKey = localStorage.getItem('user_gemini_api_key');
    if (customKey && customKey.trim().length > 15) {
      return customKey.trim();
    }
    return FALLBACK_GEMINI_KEY;
  },

  /**
   * Save custom API key
   */
  saveApiKey(key) {
    if (!key) {
      localStorage.removeItem('user_gemini_api_key');
    } else {
      localStorage.setItem('user_gemini_api_key', key.trim());
    }
  },

  /**
   * Base fetch call to Google Gemini REST API
   */
  async callGeminiAPI(systemInstruction, userPrompt, temperature = 0.7) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Chưa cài đặt Gemini API Key. Vui lòng bấm vào ô Cài Đặt AI ở góc màn hình để nhập API Key!");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const bodyPayload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      systemInstruction: systemInstruction ? {
        parts: [{ text: systemInstruction }]
      } : undefined,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 2048
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `Lỗi API (${response.status})`;
      throw new Error(`Gemini AI Error: ${errMsg}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return candidateText.trim();
  },

  /**
   * 1. Auto-generate Game Multiple-Choice Questions (ABCD / True-False / Tilt)
   */
  async generateGameQuestions(promptText, count = 10, gameType = 'standard') {
    const systemPrompt = `Bạn là chuyên gia giáo dục biên soạn câu hỏi kiểm tra cho học sinh phổ thông Việt Nam (GDPT 2018).
Nhiệm vụ của bạn là tạo chính xác ${count} câu hỏi trắc nghiệm dựa trên yêu cầu của giáo viên.
BẮT BUỘC trả về đúng định dạng JSON thuần túy (không chứa mã markdown \`\`\`json hay văn bản thừa ngoài mảng JSON) theo cấu trúc mảng các đối tượng sau:
[
  {
    "question": "Nội dung câu hỏi rõ ràng, chính xác",
    "optionA": "Đáp án A",
    "optionB": "Đáp án B",
    "optionC": "Đáp án C",
    "optionD": "Đáp án D",
    "correctAnswer": "A", // Chỉ chọn một trong các chữ cái: A, B, C, hoặc D
    "explanation": "Giải thích ngắn gọn tại sao đáp án đúng"
  }
]
Chú ý: Các đáp án A, B, C, D phải ngắn gọn, hấp dẫn, đúng kiến thức SGK.`;

    const userPrompt = `Hãy biên soạn ${count} câu hỏi trắc nghiệm chuẩn về chủ đề: "${promptText}".`;

    const rawResult = await this.callGeminiAPI(systemPrompt, userPrompt, 0.4);
    
    // Clean potential markdown wrap ```json ... ```
    let cleanJson = rawResult
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    try {
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: `ai_q_${Date.now()}_${idx}`,
          question: item.question || `Câu hỏi ${idx + 1}`,
          optionA: item.optionA || 'Lựa chọn A',
          optionB: item.optionB || 'Lựa chọn B',
          optionC: item.optionC || 'Lựa chọn C',
          optionD: item.optionD || 'Lựa chọn D',
          correctAnswer: (item.correctAnswer || 'A').toUpperCase().trim(),
          explanation: item.explanation || ''
        }));
      }
    } catch (e) {
      console.error('Failed to parse Gemini JSON questions:', e, rawResult);
    }

    throw new Error("Không thể phân tích dữ liệu câu hỏi từ AI. Vui lòng thử lại với câu lệnh rõ ràng hơn!");
  },

  /**
   * 2. Auto-generate Homeroom Student Personal Remark / Report
   */
  async generateStudentRemark(studentName, behaviorCount, rewardCount, academicProgress, teacherNotes) {
    const systemPrompt = `Bạn là Giáo viên chủ nhiệm tận tụy, am hiểu tâm lý học sinh phổ thông.
Hãy viết một đoạn nhận xét học bạ / sổ liên lạc vừa chân thành, sâu sắc, giàu tính động viên và định hướng cho học sinh.
Nội dung ngắn gọn khoảng 3-5 câu, nhấn mạnh ưu điểm, cách khắc phục nhược điểm và lời chúc tiến bộ.`;

    const userPrompt = `Viết nhận xét cho học sinh tên "${studentName}".
- Tình hình học tập: ${academicProgress || 'Đạt chuẩn'}
- Số lượt khen thưởng: ${rewardCount || 0} lượt
- Số lượt vi phạm nề nếp: ${behaviorCount || 0} lượt
- Ghi chú riêng của giáo viên: ${teacherNotes || 'Học sinh ngoan ngoãn, hòa đồng'}`;

    return await this.callGeminiAPI(systemPrompt, userPrompt, 0.7);
  },

  /**
   * 3. Auto-generate Lesson Slide Outline (Công văn 5512)
   */
  async generateLessonOutline(topic, grade, subject) {
    const systemPrompt = `Bạn là Chuyên gia phương pháp dạy học đổi mới theo Công văn 5512 Bộ GD&ĐT Việt Nam.
Hãy xây dựng dàn ý bài giảng chi tiết gồm các phần:
1. MỤC TIÊU BÀI HỌC (Kiến thức, Năng lực, Phẩm chất)
2. HOẠT ĐỘNG 1: KHỞI ĐỘNG (Tạo hứng thú, tình huống có vấn đề)
3. HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI (Các mục nội dung chính)
4. HOẠT ĐỘNG 3: LUYỆN TẬP (Bài tập trắc nghiệm & vận dụng)
5. HOẠT ĐỘNG 4: VẬN DỤNG & MỞ RỘNG (Dự án thực tế)
Nội dung trình bày khoa học, hiện đại, sẵn sàng đưa vào Slide bài giảng.`;

    const userPrompt = `Xây dựng kế hoạch bài dạy môn ${subject || 'Địa Lí'} lớp ${grade || '6'} cho bài học: "${topic}".`;

    return await this.callGeminiAPI(systemPrompt, userPrompt, 0.6);
  },

  /**
   * 4. Auto-generate Parent Meeting Content & Letters
   */
  async generateParentMeetingContent(topic, className) {
    const systemPrompt = `Bạn là Trợ lý Giáo viên chủ nhiệm chuyên nghiệp.
Hãy soạn thảo kịch bản họp phụ huynh và lời cảm ơn phụ huynh chân thành, trang trọng.`;

    const userPrompt = `Soạn thảo kịch bản buổi họp phụ huynh cho lớp "${className || 'Chủ nhiệm'}" với chủ đề: "${topic || 'Họp phụ huynh đầu năm / kết thúc học kỳ'}".
Bao gồm:
- Lời chào mừng & Thông điệp tri ân gửi cha mẹ học sinh
- Kịch bản 4 bước tiến hành buổi họp ấn tượng
- Lời dặn dò phối hợp giữa gia đình và nhà trường`;

    return await this.callGeminiAPI(systemPrompt, userPrompt, 0.7);
  },

  /**
   * 5. General AI Teaching Assistant Q&A
   */
  async askGeneralAssistant(userPrompt, contextTab = 'catalog') {
    const systemPrompt = `Bạn là Antigravity AI - Trợ Lý AI Giáo Viên thông minh thuộc hệ thống "ĐỒ NGHỀ DẠY HỌC - Thầy Hảo Địa Lý".
Bạn luôn xưng là "Trợ lý AI Thầy Hảo" hoặc "Em", xưng hô thân thiện với giáo viên là "Thầy/Cô".
Trả lời ngắn gọn, chuyên nghiệp, chính xác, có biểu tượng cảm xúc vui tươi. Hỗ trợ giáo viên tạo game, thiết kế bài giảng, soạn câu hỏi, quản lý lớp chủ nhiệm.
Ngữ cảnh trang hiện tại của giáo viên: ${contextTab}.`;

    return await this.callGeminiAPI(systemPrompt, userPrompt, 0.7);
  }
};
