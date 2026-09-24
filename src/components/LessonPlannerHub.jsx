import React, { useState } from 'react';
import { Sparkles, BookOpen, Upload, Presentation, Network, FileText, CheckCircle2, RefreshCw, Layers, FileUp, Wand2, Download, Printer } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { AISlideEditor } from './planner/AISlideEditor';
import { AIMindmapCanvas } from './planner/AIMindmapCanvas';
import { AIWorksheetView } from './planner/AIWorksheetView';
import { BUILTIN_TEXTBOOKS, loadBuiltInTextbook } from '../services/aiTextbookService';

const SAMPLE_SGK_LESSONS = {
  '6': {
    'Địa Lí': [
      'Bài 1: Hế thống kinh, vĩ tuyến. Tọa độ địa lí',
      'Bài 2: Ký hiệu và chú giải trên một số bản đồ thông dụng',
      'Bài 3: Tìm đường đi trên bản đồ',
      'Bài 4: Lược đồ trí nhớ',
      'Bài 5: Trái Đất trong hệ Mặt Trời. Hình dạng, kích thước của Trái Đất',
      'Bài 6: Chuyển động tự quay quanh trục của Trái Đất và hệ quả',
      'Bài 7: Chuyển động của Trái Đất quanh Mặt Trời và hệ quả',
      'Bài 8: Cấu tạo bên trong của Trái Đất. Động đất và núi lửa'
    ],
    'Lịch Sử': [
      'Bài 1: Lịch sử là gì?',
      'Bài 2: Thời gian trong lịch sử',
      'Bài 3: Nguồn gốc loài người',
      'Bài 4: Xã hội nguyên thủy'
    ],
    'KHTN': [
      'Bài 1: Giới thiệu về Khoa học tự nhiên',
      'Bài 2: Một số dụng cụ đo và quy định an toàn',
      'Bài 3: Các thể của chất'
    ]
  },
  '7': {
    'Địa Lí': [
      'Bài 1: Vị trí địa lí, đặc điểm tự nhiên Châu Âu',
      'Bài 2: Đô thị hóa và dân cư Châu Âu'
    ]
  }
};

export function LessonPlannerHub({ currentUser }) {
  const [grade, setGrade] = useState('6');
  const [subject, setSubject] = useState('Địa Lí');
  const [selectedSgkLesson, setSelectedSgkLesson] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  // Target Output Checkboxes: Slide, Mindmap, Worksheet
  const [generateSlides, setGenerateSlides] = useState(true);
  const [generateMindmap, setGenerateMindmap] = useState(true);
  const [generateWorksheet, setGenerateWorksheet] = useState(true);

  // Active Output Tab: 'slides' | 'mindmap' | 'worksheet'
  const [activeOutputTab, setActiveOutputTab] = useState('slides');

  // Generated Content State
  const [slidesData, setSlidesData] = useState(null);
  const [mindmapData, setMindmapData] = useState(null);
  const [worksheetData, setWorksheetData] = useState(null);

  const getAvailableLessons = () => {
    return SAMPLE_SGK_LESSONS[grade]?.[subject] || [
      'Bài 1: Kiến thức tổng quan và mở đầu',
      'Bài 2: Khai thác kiến thức trọng tâm SGK',
      'Bài 3: Thực hành và vận dụng bài học'
    ];
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    if (file.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setFileContent(result.value);
      } catch (err) {
        alert('Lỗi đọc file DOCX: ' + err.message);
      }
    } else {
      // Plain text or fallback
      const text = await file.text();
      setFileContent(text.slice(0, 5000));
    }
  };

  const handleGenerateAll = async () => {
    const topicText = selectedSgkLesson || customPrompt || fileName || 'Bài Học Trọng Tâm SGK';
    if (!topicText.trim()) {
      alert('Vui lòng chọn bài học SGK hoặc nhập thông tin chủ đề bài học.');
      return;
    }

    if (!generateSlides && !generateMindmap && !generateWorksheet) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm đầu ra (Slide, Sơ đồ tư duy hoặc Phiếu học tập).');
      return;
    }

    setLoading(true);

    try {
      // 1. Try finding and loading full SGK text from built-in textbook catalog
      let textbookText = fileContent || '';
      if (!textbookText) {
        const searchGrade = String(grade).toLowerCase().replace('lớp', '').trim();
        const searchSubject = (subject || '').toLowerCase().trim();
        const searchTopic = (topicText || '').toLowerCase().trim();

        const matched = BUILTIN_TEXTBOOKS.filter(b => {
          const bGrade = (b.grade || '').toLowerCase();
          const bSubject = (b.subject || '').toLowerCase();
          const matchG = !searchGrade || bGrade.includes(searchGrade);
          const matchS = !searchSubject || bSubject.includes(searchSubject) || searchSubject.includes(bSubject);
          return matchG && matchS;
        });

        if (matched.length > 0) {
          const rawSgk = await loadBuiltInTextbook(matched[0].id);
          if (rawSgk && rawSgk.length > 50) {
            // Find specific chapter/lesson index if possible
            const topicClean = searchTopic.replace(/^bài\s*\d+:\s*/i, '').trim();
            const idx = rawSgk.toLowerCase().indexOf(topicClean);
            if (idx !== -1) {
              textbookText = rawSgk.slice(Math.max(0, idx - 100), idx + 8000);
            } else {
              textbookText = rawSgk.slice(0, 10000);
            }
          }
        }
      }

      // 2. Concurrently generate selected outputs only
      const tasks = [
        generateSlides ? GeminiService.generateLessonSlidesJSON(topicText, grade, subject, textbookText, fileContent) : Promise.resolve(null),
        generateMindmap ? GeminiService.generateMindmapJSON(topicText, grade, subject, textbookText, fileContent) : Promise.resolve(null),
        generateWorksheet ? GeminiService.generateWorksheetJSON(topicText, grade, subject, textbookText, fileContent) : Promise.resolve(null)
      ];

      const [slidesRes, mindmapRes, worksheetRes] = await Promise.all(tasks);

      if (slidesRes) setSlidesData(slidesRes);
      if (mindmapRes) setMindmapData(mindmapRes);
      if (worksheetRes) setWorksheetData(worksheetRes);

      // Auto switch to first selected product tab
      if (generateSlides) setActiveOutputTab('slides');
      else if (generateMindmap) setActiveOutputTab('mindmap');
      else if (generateWorksheet) setActiveOutputTab('worksheet');

    } catch (err) {
      alert('Lỗi khởi tạo giáo án AI: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentTopicTitle = selectedSgkLesson || customPrompt || 'Bài Học Trọng Tâm SGK';

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#ffffff' }}>
      
      {/* HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderRadius: '24px',
        padding: '28px 32px',
        border: '2px solid #8b5cf6',
        boxShadow: '0 12px 40px rgba(139, 92, 246, 0.3)',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(168, 85, 247, 0.45)',
            border: '2px solid rgba(255,255,255,0.4)',
            shrink: 0
          }}>
            <Sparkles size={30} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              Trung Tâm Soạn Giáo Án AI Đa Năng
              <span className="badge" style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 900, fontSize: '0.72rem', padding: '3px 9px', borderRadius: '12px' }}>
                PRO 3.6
              </span>
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#c4b5fd', margin: '4px 0 0 0' }}>
              Trích xuất 1-Click từ Sách Giáo Khoa ➔ Tự động tạo Slide PPT, Sơ đồ tư duy & Phiếu học tập A4
            </p>
          </div>
        </div>
      </div>

      {/* STEP 1: INPUT CONTROL SECTION */}
      <div style={{
        background: '#090d16',
        border: '1.5px solid rgba(139, 92, 246, 0.35)',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BookOpen size={20} color="#10b981" /> 
          BƯỚC 1: CHỌN NGUỒN BÀI HỌC HOẶC TẢI TỆP NỘI DUNG
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* 1-Click SGK Selector */}
          <div style={{ background: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #334155' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8', marginBottom: '8px', display: 'block' }}>
              📚 Chọn 1-Click Từ Sách Giáo Khoa (SGK):
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <select 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                style={{ background: '#1e293b', border: '1px solid #475569', color: '#fff', padding: '8px 12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}
              >
                <option value="6">Khối 6</option>
                <option value="7">Khối 7</option>
                <option value="8">Khối 8</option>
                <option value="9">Khối 9</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>

              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ background: '#1e293b', border: '1px solid #475569', color: '#fff', padding: '8px 12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}
              >
                <option value="Địa Lí">Địa Lí</option>
                <option value="Lịch Sử">Lịch Sử</option>
                <option value="KHTN">KHTN (Khoa Học Tự Nhiên)</option>
                <option value="Toán">Toán Học</option>
                <option value="Ngữ Văn">Ngữ Văn</option>
              </select>
            </div>

            <select 
              value={selectedSgkLesson}
              onChange={(e) => setSelectedSgkLesson(e.target.value)}
              style={{ width: '100%', background: '#1e293b', border: '1.5px solid #8b5cf6', color: '#fff', padding: '10px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '0.88rem', outline: 'none' }}
            >
              <option value="">-- Bấm chọn bài học trong SGK --</option>
              {getAvailableLessons().map((les, idx) => (
                <option key={idx} value={les}>{les}</option>
              ))}
            </select>
          </div>

          {/* Upload File / Image OCR Option */}
          <div style={{ background: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #334155' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', marginBottom: '8px', display: 'block' }}>
              📁 Hoặc Tải Tệp Bài Học (DOCX / PDF / Ảnh OCR):
            </label>
            
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1.5px dashed rgba(245, 158, 11, 0.4)',
              color: '#fde68a',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}>
              <FileUp size={18} />
              <span>{fileName ? `Tệp đã chọn: ${fileName}` : 'Bấm để chọn Tệp DOCX / PDF...'}</span>
              <input type="file" accept=".docx,.pdf,.txt,image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            {fileContent && (
              <div style={{ fontSize: '0.72rem', color: '#86efac', marginTop: '6px', fontWeight: 700 }}>
                ✓ Đã trích xuất {fileContent.length} ký tự từ tệp!
              </div>
            )}
          </div>

          {/* Teacher Custom Prompt Notes */}
          <div style={{ background: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #334155' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c4b5fd', marginBottom: '8px', display: 'block' }}>
              ✏️ Yêu Cầu Bổ Sung Của Giáo Viên (Nếu có):
            </label>
            
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Nhập ghi chú yêu cầu riêng (VD: Tập trung vào hoạt động nhóm và hiện tượng tự nhiên thực tế...)"
              rows={3}
              style={{
                width: '100%', background: '#1e293b', border: '1px solid #475569',
                color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '0.82rem', outline: 'none', resize: 'none'
              }}
            />
          </div>

        </div>

        {/* STEP 2: SELECT TARGET OUTPUT PRODUCTS */}
        <div style={{
          marginTop: '20px',
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '20px',
          borderRadius: '18px',
          border: '1.5px solid rgba(168, 85, 247, 0.4)'
        }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Layers size={18} color="#a855f7" /> 
            BƯỚC 2: CHỌN CÁC SẢN PHẨM KHỞI TẠO MONG MUỐN (Có thể chọn 1 hoặc nhiều)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            
            {/* Target 1: Slide bài dạy PPT */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 18px', borderRadius: '14px',
              background: generateSlides ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${generateSlides ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={generateSlides}
                onChange={(e) => setGenerateSlides(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.92rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Presentation size={18} color="#818cf8" /> Slide Bài Dạy PPT
                </div>
                <div style={{ fontSize: '0.78rem', color: '#c7d2fe', marginTop: '2px' }}>
                  Nhiều phong cách, tùy chỉnh & trình chiếu
                </div>
              </div>
            </label>

            {/* Target 2: Sơ đồ tư duy khoa học */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 18px', borderRadius: '14px',
              background: generateMindmap ? 'rgba(13, 148, 136, 0.25)' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${generateMindmap ? '#0d9488' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={generateMindmap}
                onChange={(e) => setGenerateMindmap(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#0d9488', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.92rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Network size={18} color="#2dd4bf" /> Sơ Đồ Tư Duy Khoa Học
                </div>
                <div style={{ fontSize: '0.78rem', color: '#99f6e4', marginTop: '2px' }}>
                  Đám mây nhiều màu sắc chuẩn Tony Buzan & SVG
                </div>
              </div>
            </label>

            {/* Target 3: Phiếu học tập A4 */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 18px', borderRadius: '14px',
              background: generateWorksheet ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${generateWorksheet ? '#ec4899' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={generateWorksheet}
                onChange={(e) => setGenerateWorksheet(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#ec4899', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.92rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={18} color="#f472b6" /> Phiếu Học Tập A4
                </div>
                <div style={{ fontSize: '0.78rem', color: '#fbcfe8', marginTop: '2px' }}>
                  Sinh động, có ảnh minh họa & in ấn khổ A4
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Generate Trigger Button */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleGenerateAll}
            disabled={loading}
            style={{
              padding: '14px 36px',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(168, 85, 247, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Wand2 size={22} className={loading ? 'spin-icon' : ''} />
            <span>{loading ? '⏳ AI đang tự động biên soạn nội dung mong muốn...' : '🪄 Khởi Tạo Sản Phẩm Giáo Án AI'}</span>
          </button>
        </div>

      </div>

      {/* STEP 2: OUTPUT STUDIO TABS SECTION */}
      {(slidesData || mindmapData || worksheetData) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Output Selector Tabs Header */}
          <div style={{
            display: 'flex',
            gap: '10px',
            background: '#0f172a',
            padding: '8px',
            borderRadius: '20px',
            border: '1.5px solid #8b5cf6'
          }}>
            <button
              onClick={() => setActiveOutputTab('slides')}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '14px',
                background: activeOutputTab === 'slides' ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Presentation size={18} /> 📊 Slide Bài Dạy PowerPoint (PPT)
            </button>

            <button
              onClick={() => setActiveOutputTab('mindmap')}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '14px',
                background: activeOutputTab === 'mindmap' ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Network size={18} /> 🧠 Sơ Đồ Tư Duy (Mindmap SVG)
            </button>

            <button
              onClick={() => setActiveOutputTab('worksheet')}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '14px',
                background: activeOutputTab === 'worksheet' ? 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <FileText size={18} /> 📝 Phiếu Học Tập Chuẩn In A4
            </button>
          </div>

          {/* Active Tab View Render */}
          <div style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px' }}>
            {activeOutputTab === 'slides' && (
              <AISlideEditor slides={slidesData} topicTitle={currentTopicTitle} />
            )}

            {activeOutputTab === 'mindmap' && (
              <AIMindmapCanvas mindmapData={mindmapData} topicTitle={currentTopicTitle} />
            )}

            {activeOutputTab === 'worksheet' && (
              <AIWorksheetView worksheetData={worksheetData} topicTitle={currentTopicTitle} />
            )}
          </div>

        </div>
      )}

    </div>
  );
}
