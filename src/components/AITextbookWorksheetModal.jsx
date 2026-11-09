import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, BookOpen, Layers, CheckCircle2, 
  Printer, Download, Copy, Edit3, Plus, Trash2, Eye, 
  FileText, Check, Layout, Award, RefreshCw, AlertCircle
} from 'lucide-react';
import { SoundFX } from '../utils/sound';
import { 
  WORKSHEET_THEMES, 
  EXERCISE_TYPES, 
  generateAITextbookWorksheet,
  generateCurriculumFallbackWorksheet 
} from '../services/aiWorksheetService';

const safePlaySound = (type = 'click') => {
  try {
    if (typeof window !== 'undefined' && SoundFX) {
      if (typeof SoundFX[type] === 'function') {
        SoundFX[type]();
      } else if (typeof SoundFX.click === 'function') {
        SoundFX.click();
      }
    }
  } catch (e) {}
};

// ==========================================
// TOP-LEVEL SUB-COMPONENTS (Rule 1 Compliance)
// ==========================================

function MultipleChoiceSection({ section, sectionIdx, onUpdateItem, onRemoveItem, isEditing }) {
  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
          {section.title}
        </h4>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
          ({section.items?.length || 0} câu)
        </span>
      </div>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {section.items?.map((item, itemIdx) => (
          <div 
            key={item.id || itemIdx}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                Câu {itemIdx + 1}: {item.question}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>
                [{item.points || '1.0 đ'}]
              </span>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '6px', 
              marginTop: '6px' 
            }}>
              {item.options?.map((opt, optIdx) => (
                <div 
                  key={optIdx}
                  style={{
                    fontSize: '0.82rem',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#334155'
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FillBlankSection({ section, sectionIdx }) {
  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
        {section.title}
      </h4>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {section.items?.map((item, itemIdx) => (
          <div 
            key={item.id || itemIdx}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.6 }}>
                <strong>Bài {itemIdx + 1}:</strong> {item.question}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>
                [{item.points || '1.0 đ'}]
              </span>
            </div>
            {item.wordBank && item.wordBank.length > 0 && (
              <div style={{ 
                marginTop: '8px', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                background: '#e0f2fe', 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                color: '#0369a1'
              }}>
                <span>💡 Từ gợi ý:</span>
                <strong>{item.wordBank.join('  •  ')}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchingSection({ section }) {
  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
        {section.title}
      </h4>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        padding: '12px 16px',
        borderRadius: '10px',
        backgroundColor: '#f8fafc',
        border: '1.5px dashed #cbd5e1'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase' }}>Cột A</div>
          {section.pairs?.map((p, idx) => (
            <div 
              key={idx}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{p.left}</span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284c7' }}></span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase' }}>Cột B</div>
          {section.pairs?.map((p, idx) => (
            <div 
              key={idx}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', flexShrink: 0 }}></span>
              <span>{p.right}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrueFalseSection({ section }) {
  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
        {section.title}
      </h4>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {section.items?.map((item, idx) => (
          <div 
            key={idx}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <span style={{ fontSize: '0.86rem', color: '#0f172a' }}>
              <strong>{idx + 1}.</strong> {item.statement}
            </span>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '6px', 
              border: '2px solid #94a3b8', 
              backgroundColor: '#ffffff',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#cbd5e1'
            }}>
              [ &nbsp; ]
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableMatrixSection({ section }) {
  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
        {section.title}
      </h4>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.84rem',
          border: '1px solid #94a3b8',
          backgroundColor: '#ffffff'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              {section.headers?.map((h, idx) => (
                <th 
                  key={idx}
                  style={{
                    padding: '8px 10px',
                    border: '1px solid #94a3b8',
                    textAlign: 'left',
                    fontWeight: 800,
                    color: '#1e293b'
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows?.map((r, rIdx) => (
              <tr key={rIdx}>
                <td style={{ padding: '8px 10px', border: '1px solid #94a3b8', fontWeight: 600, color: '#0f172a', width: '35%' }}>
                  {r.col1 || ''}
                </td>
                <td style={{ padding: '8px 10px', border: '1px solid #94a3b8', color: '#334155' }}>
                  {r.col2 || <div style={{ minHeight: '28px', borderBottom: '1px dotted #cbd5e1' }}></div>}
                </td>
                {section.headers?.length > 2 && (
                  <td style={{ padding: '8px 10px', border: '1px solid #94a3b8', color: '#334155' }}>
                    {r.col3 || <div style={{ minHeight: '28px', borderBottom: '1px dotted #cbd5e1' }}></div>}
                  </td>
                )}
                {section.headers?.length > 3 && (
                  <td style={{ padding: '8px 10px', border: '1px solid #94a3b8', color: '#334155' }}>
                    {r.col4 || <div style={{ minHeight: '28px', borderBottom: '1px dotted #cbd5e1' }}></div>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShortAnswerSection({ section }) {
  return (
    <div className="worksheet-section" style={{ marginBottom: '22px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: '#1e293b' }}>
        {section.title}
      </h4>
      {section.instruction && (
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontStyle: 'italic', color: '#475569' }}>
          {section.instruction}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {section.items?.map((item, idx) => {
          const lines = Array.from({ length: item.lines || 3 });
          return (
            <div key={item.id || idx}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
                  Câu {idx + 1}: {item.question}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>
                  [{item.points || '2.0 đ'}]
                </span>
              </div>

              {/* Dotted lines for student answer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '6px 0 10px 0' }}>
                {lines.map((_, lIdx) => (
                  <div 
                    key={lIdx} 
                    style={{ 
                      borderBottom: '1px dotted #94a3b8', 
                      width: '100%',
                      height: '4px'
                    }} 
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function AITextbookWorksheetModal({
  isOpen,
  onClose,
  book,
  bookText = '',
  currentUser
}) {
  if (!isOpen || !book) return null;

  const [selectedTheme, setSelectedTheme] = useState('primary_cute');
  const [promptCommand, setPromptCommand] = useState('Tạo phiếu bài tập cuối tuần ôn tập toàn diện bài học');
  const [selectedTypes, setSelectedTypes] = useState([
    'multiple_choice', 'fill_blank', 'matching', 'true_false', 'table_matrix', 'short_answer'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [worksheetData, setWorksheetData] = useState(null);
  const [activeTab, setActiveTab] = useState('worksheet'); // 'worksheet' | 'answer_key'
  const [copySuccess, setCopySuccess] = useState(false);

  const printAreaRef = useRef(null);

  // Auto-init on opening
  useEffect(() => {
    if (isOpen && book) {
      setCopySuccess(false);
      setActiveTab('worksheet');
      const isKid = (book.grade || '').includes('1') || (book.grade || '').includes('2') || (book.grade || '').includes('3') || (book.grade || '').includes('4') || (book.grade || '').includes('5');
      const initialTheme = isKid ? 'primary_cute' : 'standard_secondary';
      setSelectedTheme(initialTheme);
      
      // 1. Immediately create rich worksheet from curriculum engine so teacher NEVER faces empty screen
      const immediateWs = generateCurriculumFallbackWorksheet({
        textbookTitle: book.title || 'Sách Giáo Khoa',
        grade: book.grade || 'Lớp 2',
        subject: book.subject || 'Tiếng Việt',
        theme: initialTheme,
        selectedTypes
      });
      setWorksheetData(immediateWs);

      // 2. Then trigger asynchronous AI enhancement
      performGeneration(initialTheme, selectedTypes, promptCommand);
    }
  }, [isOpen, book?.id]);

  const handleToggleType = (typeId) => {
    safePlaySound('click');
    const updatedTypes = selectedTypes.includes(typeId)
      ? (selectedTypes.length === 1 ? selectedTypes : selectedTypes.filter(t => t !== typeId))
      : [...selectedTypes, typeId];
    
    setSelectedTypes(updatedTypes);
    
    // Immediately refresh visible sections
    const refreshedWs = generateCurriculumFallbackWorksheet({
      textbookTitle: book.title || 'Sách Giáo Khoa',
      grade: book.grade || 'Lớp 2',
      subject: book.subject || 'Tiếng Việt',
      theme: selectedTheme,
      selectedTypes: updatedTypes,
      promptCommand
    });
    setWorksheetData(refreshedWs);
  };

  const handleSelectTheme = (themeId) => {
    safePlaySound('click');
    setSelectedTheme(themeId);
    if (worksheetData) {
      setWorksheetData(prev => prev ? ({ ...prev, theme: themeId }) : prev);
    }
  };

  const performGeneration = async (themeToUse, typesToUse, commandToUse) => {
    setIsLoading(true);
    setLoadingStep('🤖 Gemini AI đang phân tích bài học và soạn phiếu bài tập...');

    try {
      let effectiveText = bookText;
      if (!effectiveText || effectiveText.length < 50) {
        if (book.textPath) {
          try {
            const res = await fetch(book.textPath);
            if (res.ok) effectiveText = await res.text();
          } catch (e) {}
        }
      }

      const result = await generateAITextbookWorksheet({
        book,
        bookText: effectiveText,
        promptCommand: commandToUse || promptCommand,
        theme: themeToUse || selectedTheme,
        selectedTypes: typesToUse || selectedTypes
      });

      if (result && result.worksheet) {
        setWorksheetData(result.worksheet);
        safePlaySound('fanfare');
      }
    } catch (err) {
      console.error('Worksheet generation error:', err);
      // Fallback guarantees worksheet is always populated
      const fallback = generateCurriculumFallbackWorksheet({
        textbookTitle: book.title || 'Sách Giáo Khoa',
        grade: book.grade || 'Lớp 2',
        subject: book.subject || 'Tiếng Việt',
        theme: themeToUse || selectedTheme,
        selectedTypes: typesToUse || selectedTypes,
        promptCommand: commandToUse || promptCommand
      });
      setWorksheetData(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    safePlaySound('click');
    await performGeneration(selectedTheme, selectedTypes, promptCommand);
  };

  // Print A4 Worksheet
  const handlePrint = () => {
    safePlaySound('click');
    window.print();
  };

  // Copy Plain Text for Word
  const handleCopyWord = () => {
    if (!worksheetData) return;
    safePlaySound('click');

    let text = `${worksheetData.title}\n${worksheetData.subtitle}\n`;
    text += `Trường: ${worksheetData.school || 'Sky-Line'}\n`;
    text += `Họ và tên: ............................................ Lớp: ................. Ngày: .................\n`;
    text += `Thời gian làm bài: ${worksheetData.timeAllowed || '35 phút'}\n`;
    text += `---------------------------------------------------------\n\n`;

    worksheetData.sections?.forEach((sec) => {
      text += `${sec.title}\n`;
      if (sec.instruction) text += `${sec.instruction}\n`;

      if (sec.type === 'multiple_choice') {
        sec.items?.forEach((it, i) => {
          text += `Câu ${i + 1}: ${it.question} [${it.points || '1.0 đ'}]\n`;
          it.options?.forEach(opt => { text += `   ${opt}\n`; });
        });
      } else if (sec.type === 'fill_blank') {
        sec.items?.forEach((it, i) => {
          text += `Bài ${i + 1}: ${it.question}\n`;
          if (it.wordBank) text += `   (Từ gợi ý: ${it.wordBank.join(', ')})\n`;
        });
      } else if (sec.type === 'matching') {
        sec.pairs?.forEach(p => {
          text += `• ${p.left}  ----->  ${p.right}\n`;
        });
      } else if (sec.type === 'true_false') {
        sec.items?.forEach((it, i) => {
          text += `[   ] ${i + 1}. ${it.statement}\n`;
        });
      } else if (sec.type === 'table_matrix') {
        text += `[BẢNG TỔNG HỢP KIẾN THỨC]\n`;
        text += `${sec.headers?.join(' | ')}\n`;
        sec.rows?.forEach(r => {
          text += `${r.col1 || ''} | ${r.col2 || ''} | ${r.col3 || ''}\n`;
        });
      } else if (sec.type === 'short_answer') {
        sec.items?.forEach((it, i) => {
          text += `Câu ${i + 1}: ${it.question}\n`;
          text += `Trả lời: ........................................................................................\n`;
          text += `.................................................................................................\n`;
        });
      }
      text += `\n`;
    });

    if (worksheetData.teacherGuide) {
      text += `\n--- ĐÁP ÁN & HƯỚNG DẪN CHẤM ---\n`;
      text += `Tổng điểm: ${worksheetData.teacherGuide.totalPoints || '10 điểm'}\n`;
      text += `Đáp án: ${worksheetData.teacherGuide.answerKey || ''}\n`;
      text += `Ghi chú: ${worksheetData.teacherGuide.notes || ''}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  const activeThemeObj = WORKSHEET_THEMES.find(t => t.id === selectedTheme) || WORKSHEET_THEMES[0];

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      {/* Print Specific CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #worksheet-printable-area, #worksheet-printable-area * {
            visibility: visible !important;
          }
          #worksheet-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            box-shadow: none !important;
            border: none !important;
            background-color: #ffffff !important;
          }
          .worksheet-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm 10mm;
          }
        }
      `}</style>

      {/* Main Container Card (Single Viewport Guardrail Rule 14) */}
      <div 
        style={{
          width: '100%',
          maxWidth: '1280px',
          height: 'min(95vh, 720px)',
          maxHeight: 'calc(100vh - 20px)',
          backgroundColor: '#0f172a',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Top Header Bar */}
        <div 
          style={{
            padding: '14px 20px',
            backgroundColor: '#1e293b',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#f8fafc' }}>
                  AI Soạn Phiếu Học Tập & Bài Tập Chuẩn Bộ GD&ĐT
                </h3>
                <span 
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff'
                  }}
                >
                  GDPT 2018
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Sách: <strong style={{ color: '#38bdf8' }}>{book.title}</strong> • {book.grade} • Môn {book.subject}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={!worksheetData}
              title="In phiếu bài tập hoặc Lưu file PDF chuẩn khổ A4"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: worksheetData ? 'pointer' : 'not-allowed',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              <Printer size={16} /> In Phiếu / Xuất PDF (A4)
            </button>

            {/* Copy for Word Button */}
            <button
              onClick={handleCopyWord}
              disabled={!worksheetData}
              title="Sao chép toàn bộ văn bản để dán vào Microsoft Word"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: copySuccess ? '#059669' : '#334155',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: worksheetData ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              {copySuccess ? <Check size={15} color="#34d399" /> : <Copy size={15} />}
              {copySuccess ? 'Đã chép vào Word!' : 'Chép vào Word'}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div 
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden'
          }}
        >
          {/* LEFT COLUMN: Controls & Configurations */}
          <div 
            style={{
              width: '380px',
              flexShrink: 0,
              backgroundColor: '#1e293b',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              overflowY: 'auto'
            }}
          >
            {/* Theme Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                🎨 1. Chọn phong cách mẫu phiếu
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {WORKSHEET_THEMES.map(th => {
                  const isSel = selectedTheme === th.id;
                  return (
                    <div 
                      key={th.id}
                      onClick={() => handleSelectTheme(th.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: isSel ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: isSel ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.4)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isSel ? '#38bdf8' : '#e2e8f0' }}>
                          {th.icon} {th.name}
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                          {th.badge}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        {th.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prompt Instruction */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                ✍️ 2. Yêu cầu biên soạn từ giáo viên
              </label>
              <textarea 
                value={promptCommand}
                onChange={(e) => setPromptCommand(e.target.value)}
                placeholder="Ví dụ: Tạo phiếu ôn tập Tuần 10, tập trung vào từ chỉ hoạt động và câu Ai làm gì..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Exercise Types Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                📋 3. Các dạng bài tập xuất hiện trên phiếu
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {EXERCISE_TYPES.map(type => {
                  const isChecked = selectedTypes.includes(type.id);
                  return (
                    <label 
                      key={type.id}
                      onClick={() => handleToggleType(type.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: isChecked ? '#f1f5f9' : '#64748b',
                        cursor: 'pointer',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        backgroundColor: isChecked ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                        transition: 'all 0.15s'
                      }}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ cursor: 'pointer', accentColor: '#0284c7' }}
                      />
                      {type.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Re-generate Action Button */}
            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                {isLoading ? <RefreshCw size={17} className="animate-spin" /> : <Sparkles size={17} />}
                {isLoading ? 'AI Đang Soạn Phiếu...' : '⚡ AI Soạn Lại Phiếu Này'}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Live A4 Printable Preview */}
          <div 
            style={{
              flex: 1,
              backgroundColor: '#0b1120',
              overflowY: 'auto',
              padding: '24px 20px 48px 20px',
              display: 'block'
            }}
          >
            {/* View Mode Switcher Tabs */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '4px',
                borderRadius: '10px',
                width: 'fit-content',
                margin: '0 auto 20px auto'
              }}
            >
              <button
                onClick={() => {
                  safePlaySound('click');
                  setActiveTab('worksheet');
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: activeTab === 'worksheet' ? '#0284c7' : 'transparent',
                  color: activeTab === 'worksheet' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layout size={14} /> Trang Phiếu Bài Tập (A4)
              </button>
              <button
                onClick={() => {
                  safePlaySound('click');
                  setActiveTab('answer_key');
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: activeTab === 'answer_key' ? '#0284c7' : 'transparent',
                  color: activeTab === 'answer_key' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Award size={14} /> Trang Đáp Án & Hướng Dẫn Chấm
              </button>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div 
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#38bdf8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '0 auto'
                }}
              >
                <RefreshCw size={36} className="animate-spin" />
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{loadingStep}</div>
              </div>
            )}

            {/* A4 Paper Container - 100% Seamless Continuous Document */}
            {!isLoading && worksheetData && (
              <div 
                id="worksheet-printable-area"
                ref={printAreaRef}
                style={{
                  width: '100%',
                  maxWidth: '820px',
                  margin: '0 auto',
                  height: 'auto',
                  minHeight: '1000px',
                  display: 'block',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  borderRadius: selectedTheme === 'primary_cute' ? '18px' : '6px',
                  boxShadow: '0 12px 45px rgba(0, 0, 0, 0.55)',
                  padding: '40px 44px 48px 44px',
                  boxSizing: 'border-box',
                  border: selectedTheme === 'primary_cute' 
                    ? '4px solid #7dd3fc' 
                    : selectedTheme === 'eco_bw'
                    ? '2px solid #000000'
                    : '2px solid #64748b',
                  position: 'relative'
                }}
              >
                {activeTab === 'worksheet' ? (
                  <>
                    {/* Cute border decoration for primary theme */}
                    {selectedTheme === 'primary_cute' && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '16px',
                          fontSize: '1.2rem',
                          display: 'flex',
                          gap: '6px',
                          opacity: 0.8
                        }}
                      >
                        🌟 ✏️ 🎨 📚
                      </div>
                    )}

                    {/* Header: School & Student Information */}
                    <div 
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.3fr 1fr',
                        gap: '16px',
                        paddingBottom: '14px',
                        marginBottom: '18px',
                        borderBottom: selectedTheme === 'eco_bw' ? '2px solid #000000' : '2px dashed #cbd5e1'
                      }}
                    >
                      {/* School & Subject */}
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                          {worksheetData.school || 'HỆ THỐNG GIÁO DỤC SKY-LINE'}
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                          Môn: {worksheetData.subject} • {worksheetData.grade}
                        </div>
                        <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: '#64748b', marginTop: '2px' }}>
                          Thời gian làm bài: {worksheetData.timeAllowed || '35 phút'}
                        </div>
                      </div>

                      {/* Student info box */}
                      <div 
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: selectedTheme === 'eco_bw' ? '1px solid #000' : '1px solid #cbd5e1',
                          backgroundColor: selectedTheme === 'primary_cute' ? '#f0f9ff' : '#f8fafc',
                          fontSize: '0.82rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div>Họ và tên: ....................................................</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Lớp: .................</span>
                          <span>Ngày: .................</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0284c7' }}>
                          <span>Điểm: ...........</span>
                          <span>Lời phê: .................</span>
                        </div>
                      </div>
                    </div>

                    {/* Worksheet Main Title */}
                    <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                      <h2 
                        style={{
                          margin: 0,
                          fontSize: '1.35rem',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          color: selectedTheme === 'primary_cute' ? '#0284c7' : '#0f172a',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {worksheetData.title}
                      </h2>
                      {worksheetData.subtitle && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', fontWeight: 700, color: '#475569' }}>
                          {worksheetData.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Content Sections */}
                    {worksheetData.sections?.map((section, idx) => {
                      if (section.type === 'multiple_choice') {
                        return <MultipleChoiceSection key={idx} section={section} sectionIdx={idx} />;
                      } else if (section.type === 'fill_blank') {
                        return <FillBlankSection key={idx} section={section} sectionIdx={idx} />;
                      } else if (section.type === 'matching') {
                        return <MatchingSection key={idx} section={section} />;
                      } else if (section.type === 'true_false') {
                        return <TrueFalseSection key={idx} section={section} />;
                      } else if (section.type === 'table_matrix') {
                        return <TableMatrixSection key={idx} section={section} />;
                      } else if (section.type === 'short_answer') {
                        return <ShortAnswerSection key={idx} section={section} />;
                      }
                      return null;
                    })}

                    {/* Footer */}
                    <div 
                      style={{
                        marginTop: '30px',
                        paddingTop: '12px',
                        borderTop: '1px dashed #cbd5e1',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontStyle: 'italic',
                        color: '#94a3b8'
                      }}
                    >
                      --- Chúc các em học sinh hoàn thành tốt bài tập! ---
                    </div>
                  </>
                ) : (
                  /* TEACHER GUIDE & ANSWER KEY VIEW */
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #0284c7', paddingBottom: '12px' }}>
                      <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0284c7' }}>
                        📋 ĐÁP ÁN & HƯỚNG DẪN CHẤM CHI TIẾT
                      </h2>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Dành riêng cho giáo viên môn {worksheetData.subject} • {worksheetData.grade}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#166534', marginBottom: '4px' }}>
                          Thang điểm toàn bài: {worksheetData.teacherGuide?.totalPoints || '10 điểm'}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#15803d' }}>
                          {worksheetData.teacherGuide?.notes || 'Giáo viên linh hoạt chấm điểm khuyến khích với các câu trả lời sáng tạo và trình bày sạch đẹp.'}
                        </p>
                      </div>

                      {/* Step by step answer key */}
                      {worksheetData.sections?.map((sec, sIdx) => (
                        <div key={sIdx} style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>
                            {sec.title}
                          </h4>

                          {sec.type === 'multiple_choice' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.84rem' }}>
                              {sec.items?.map((it, i) => (
                                <div key={i} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                                  Câu {i + 1}: Đáp án {it.answer}
                                </div>
                              ))}
                            </div>
                          )}

                          {sec.type === 'fill_blank' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.84rem', color: '#334155' }}>
                              {sec.items?.map((it, i) => (
                                <div key={i}>
                                  <strong>Bài {i + 1}:</strong> Từ cần điền là: <span style={{ color: '#059669', fontWeight: 700 }}>{it.answer}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {sec.type === 'matching' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.84rem', color: '#334155' }}>
                              {sec.pairs?.map((p, i) => (
                                <div key={i}>
                                  • {p.left}  ➔  <span style={{ color: '#059669', fontWeight: 700 }}>{p.right}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {sec.type === 'true_false' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.84rem' }}>
                              {sec.items?.map((it, i) => (
                                <div key={i} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 700 }}>
                                  Câu {i + 1}: [{it.answer}]
                                </div>
                              ))}
                            </div>
                          )}

                          {sec.type === 'short_answer' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                              {sec.items?.map((it, i) => (
                                <div key={i} style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Câu {i + 1}: Gợi ý chấm điểm</div>
                                  <div style={{ color: '#059669', marginTop: '2px', lineHeight: 1.5 }}>
                                    {it.suggestedAnswer || 'Học sinh nêu được 2 ý chính theo nội dung bài học.'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
