import fs from 'fs';
import { extractPPTXText, cleanTextbookText } from '../src/services/aiTextbookService.js';

function parsePedagogicalDocument(rawText, fileName = '', topicQuery = '', grade = '6', subject = 'Địa Lí') {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 20) {
    return null;
  }

  // 1. Clean raw text & strip structural file noise (like ppt/slides/slideX.xml)
  let clean = rawText
    .replace(/--- ppt\/slides\/slide\d+\.xml ---/gi, '\n')
    .replace(/--- Sheet: [^---]+ ---/gi, '\n')
    .replace(/\r\n/g, '\n')
    .trim();

  // Filter out noise lines (XML tags, filenames, repetitive boilerplate)
  const lines = clean
    .split('\n')
    .map(l => l.trim())
    .filter(l => {
      if (!l || l.length < 3) return false;
      if (/^(ppt\/slides\/|http|https|file:)/i.test(l)) return false;
      if (/^\d+$/.test(l)) return false; // standalone page numbers
      return true;
    });

  const docTitle = fileName ? fileName.replace(/\.[^/.]+$/, "") : (topicQuery || 'Nội Dung Bài Học');

  // 2. Identify Headings vs Body Text
  const activities = [];
  let currentActivity = {
    title: 'HÌNH THÀNH KIẾN THỨC MỚI',
    type: 'concept',
    content: []
  };

  const isActivityHeader = (line) => {
    return /^(hoạt động|hoat dong)\s*\d+/i.test(line) ||
           /^(mục|phần|chương|bài)\s*[\d\w]+/i.test(line) ||
           /^[I|V|X]+\.\s+/i.test(line) ||
           /^[\d]+\.\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯ]/i.test(line);
  };

  lines.forEach(line => {
    // Check if line is a major heading
    if (isActivityHeader(line)) {
      if (currentActivity.content.length > 0) {
        activities.push(currentActivity);
      }
      
      let actType = 'concept';
      const lower = line.toLowerCase();
      if (lower.includes('khởi động') || lower.includes('mở đầu')) actType = 'intro';
      else if (lower.includes('luyện tập') || lower.includes('củng cố')) actType = 'activity';
      else if (lower.includes('vận dụng') || lower.includes('dặn dò') || lower.includes('bài tập về nhà')) actType = 'summary';

      currentActivity = {
        title: line.replace(/^[-•*+]\s*/, '').trim(),
        type: actType,
        content: []
      };
    } else {
      // Body content line
      const cleanLine = line.replace(/^[-•*+]\s*/, '').trim();
      if (cleanLine.length > 5) {
        currentActivity.content.push(cleanLine);
      }
    }
  });

  if (currentActivity.content.length > 0) {
    activities.push(currentActivity);
  }

  // 3. Build Slides according to Pedagogical Teaching Process (Công văn 5512)
  const slides = [];

  // SLIDE 1: Title & Objectives
  slides.push({
    title: `BÀI HỌC: ${docTitle.toUpperCase()}`,
    subtitle: `Kế hoạch bài dạy môn ${subject} - Khối lớp ${grade}`,
    bulletPoints: [
      `Mục tiêu kiến thức: Khám phá trọng tâm bài dạy "${docTitle}"`,
      'Mục tiêu năng lực: Tự học, làm việc nhóm và giải quyết vấn đề',
      'Mục tiêu phẩm chất: Chăm chỉ, trách nhiệm và vận dụng thực tiễn'
    ],
    teacherNote: 'Hoạt động Khởi động (5 phút): Giáo viên phổ biến mục tiêu và yêu cầu bài học cho học sinh.',
    visualHint: 'Sơ đồ mục tiêu bài dạy và bìa bài học',
    slideType: 'intro'
  });

  // SLIDE 2: Hoạt động 1 - Khởi động (Opening / Warm-up)
  const introAct = activities.find(a => a.type === 'intro') || activities[0];
  slides.push({
    title: 'HOẠT ĐỘNG 1: KHỞI ĐỘNG',
    subtitle: 'Tạo tình huống có vấn đề & khơi gợi hứng thú',
    bulletPoints: [
      introAct?.content[0] || `Quan sát hình ảnh / video minh họa liên quan đến ${docTitle}`,
      introAct?.content[1] || 'Thảo luận cặp đôi trả lời câu hỏi gợi mở của giáo viên',
      'Xác định nhiệm vụ học tập trọng tâm của bài học hôm nay'
    ],
    teacherNote: 'Giáo viên chiếu câu hỏi / hình ảnh khởi động, yêu cầu học sinh thảo luận cặp đôi trong 3 phút.',
    visualHint: 'Hình ảnh tình huống khởi động thực tế',
    slideType: 'intro'
  });

  // SLIDE 3+: Hoạt động 2 - Hình thành kiến thức mới (Core Teaching Content)
  const conceptActs = activities.filter(a => a.type === 'concept');
  if (conceptActs.length > 0) {
    conceptActs.forEach((act, idx) => {
      const bullets = act.content.filter(c => c.length > 10).slice(0, 4);
      if (bullets.length === 0) bullets.push(`Nội dung kiến thức trọng tâm phần ${idx + 1}`);

      slides.push({
        title: act.title.length > 5 ? act.title : `HOẠT ĐỘNG 2.${idx + 1}: HÌNH THÀNH KIẾN THỨC MỚI`,
        subtitle: `Chi tiết kiến thức bài dạy - Phần ${idx + 1}`,
        bulletPoints: bullets,
        teacherNote: `Giáo viên diễn giảng nội dung phần "${act.title}", hướng dẫn học sinh làm việc với SGK và ghi vở.`,
        visualHint: 'Sơ đồ hình vẽ kiến thức bài học',
        slideType: 'concept'
      });
    });
  } else {
    // Fallback if no explicit concept sections were split
    const allBody = lines.filter(l => !isActivityHeader(l) && l.length > 15);
    for (let i = 0; i < allBody.length; i += 3) {
      const chunk = allBody.slice(i, i + 3);
      if (chunk.length > 0 && slides.length < 6) {
        slides.push({
          title: `HOẠT ĐỘNG 2.${Math.floor(i / 3) + 1}: HÌNH THÀNH KIẾN THỨC MỚI`,
          subtitle: `Nội dung bài dạy trọng tâm`,
          bulletPoints: chunk,
          teacherNote: 'Giáo viên tổ chức cho học sinh thảo luận nhóm khai thác kiến thức bài học.',
          visualHint: 'Sơ đồ tư duy kiến thức bài học',
          slideType: 'concept'
        });
      }
    }
  }

  // SLIDE N-1: Hoạt động 3 - Luyện tập (Practice & Quiz)
  const practiceAct = activities.find(a => a.type === 'activity');
  slides.push({
    title: 'HOẠT ĐỘNG 3: LUYỆN TẬP & CỦNG CỐ',
    subtitle: 'Rèn luyện kỹ năng & trả lời câu hỏi bài học',
    bulletPoints: [
      practiceAct?.content[0] || 'Hoàn thành các câu hỏi trắc nghiệm củng cố bài học',
      practiceAct?.content[1] || 'Giải quyết các bài tập tự luận và làm việc nhóm',
      'Đại diện nhóm học sinh trình bày kết quả trước lớp'
    ],
    teacherNote: 'Tổ chức trò chơi trắc nghiệm hoặc phát Phiếu học tập A4 cho học sinh làm trong 7 phút.',
    visualHint: 'Biểu tượng bài tập trắc nghiệm và nhóm học tập',
    slideType: 'activity'
  });

  // SLIDE N: Hoạt động 4 - Vận dụng & Dặn dò (Application & Homework)
  const summaryAct = activities.find(a => a.type === 'summary');
  slides.push({
    title: 'HOẠT ĐỘNG 4: VẬN DỤNG & DẶN DÒ',
    subtitle: 'Liên hệ thực tế đời sống & nhiệm vụ về nhà',
    bulletPoints: [
      summaryAct?.content[0] || `Vận dụng kiến thức bài ${docTitle} giải thích hiện tượng thực tế`,
      summaryAct?.content[1] || 'Hoàn thành bài tập nâng cao trong Phiếu Học Tập',
      'Đọc trước nội dung bài học tiếp theo trong Sách Giáo Khoa'
    ],
    teacherNote: 'Dặn dò học sinh ghi chép nhiệm vụ tự học tại nhà vào vở.',
    visualHint: 'Hình ảnh ngôi nhà và cuốn sách dặn dò',
    slideType: 'summary'
  });

  return {
    title: docTitle,
    subject,
    grade,
    slides,
    activities
  };
}

// Test with PPTX sample
const pptxBuf = fs.readFileSync('./slide/bai1.pptx');
const extractedText = cleanTextbookText(await extractPPTXText(pptxBuf));
const result = parsePedagogicalDocument(extractedText, "bai1.pptx", "Bài 1", "6", "Địa Lí");

console.log("=== PARSED PEDAGOGICAL SLIDES ===");
console.log("Total Slides:", result.slides.length);
result.slides.forEach((s, i) => {
  console.log(`\nSlide ${i + 1}: ${s.title}`);
  console.log(`Subtitle: ${s.subtitle}`);
  console.log(`Bullets:`, s.bulletPoints);
  console.log(`TeacherNote:`, s.teacherNote);
});
