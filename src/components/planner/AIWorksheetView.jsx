import React, { useState } from 'react';
import { FileText, Printer, Download, Sparkles, Image, CheckCircle, HelpCircle, Edit3 } from 'lucide-react';

export function AIWorksheetView({ worksheetData: initialData, topicTitle }) {
  const [worksheet, setWorksheet] = useState(initialData || {
    title: 'PHIẾU HỌC TẬP SGK',
    subject: 'Địa Lí',
    grade: '6',
    objectives: [],
    summaryNotes: '',
    questions: []
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Worksheet Control Bar */}
      <div className="no-print" style={{
        background: '#0f172a',
        padding: '14px 20px',
        borderRadius: '18px',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={22} color="#ec4899" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', margin: 0 }}>
              Phiếu Học Tập Sinh Động Kèm Minh Họa (A4)
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Bố cục thiết kế chuẩn khổ giấy in A4 • Sẵn sàng in ấn cho học sinh
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '12px',
            fontSize: '0.85rem', fontWeight: 900, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)'
          }}
        >
          <Printer size={16} /> 🖨️ In Phiếu Học Tập (Khổ A4)
        </button>
      </div>

      {/* Printable A4 Worksheet Sheet Container */}
      <div className="printable-worksheet-sheet" style={{
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '820px',
        margin: '0 auto',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        border: '1px solid #cbd5e1',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        
        {/* Header Branding & Student Info Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0d9488', letterSpacing: '0.05em' }}>
              HỆ THỐNG GIÁO DỤC SKY-LINE • ĐỒ NGHỀ DẠY HỌC
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
              {worksheet.title}
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 700 }}>
              Môn: {worksheet.subject || 'Địa Lí'} • Khối {worksheet.grade || '6'} (GDPT 2018)
            </div>
          </div>

          {/* Student Info Box */}
          <div style={{
            border: '1.5px solid #0f172a',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#0f172a',
            minWidth: '220px'
          }}>
            <div>Họ & Tên: .......................................</div>
            <div style={{ marginTop: '4px' }}>Lớp: ............... Ngày: ...../...../202...</div>
            <div style={{ marginTop: '4px', borderTop: '1px stroke #cbd5e1', paddingTop: '4px', fontWeight: 900, color: '#0284c7' }}>
              Điểm số: ........ / 10
            </div>
          </div>
        </div>

        {/* Learning Objectives Box */}
        {worksheet.objectives && worksheet.objectives.length > 0 && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
            <div style={{ fontWeight: 900, color: '#166534', fontSize: '0.85rem', marginBottom: '6px' }}>
              🎯 MỤC TIÊU CẦN ĐẠT CỦA BÀI HỌC:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#14532d', lineHeight: 1.5 }}>
              {worksheet.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Core Knowledge Box */}
        {worksheet.summaryNotes && (
          <div style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ fontWeight: 900, color: '#0369a1', fontSize: '0.85rem', marginBottom: '4px' }}>
              📖 KIẾN THỨC NỀN TẢNG CẦN NHỚ:
            </div>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: 1.5 }}>
              {worksheet.summaryNotes}
            </p>
          </div>
        )}

        {/* Illustration Image Placeholder */}
        <div style={{
          background: '#f1f5f9',
          border: '2px dashed #94a3b8',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '24px',
          color: '#475569'
        }}>
          <Image size={28} color="#0284c7" style={{ margin: '0 auto 6px auto', display: 'block' }} />
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
            🖼️ HÌNH ẢNH SƠ ĐỒ / BẢN ĐỒ MINH HỌA BÀI HỌC
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {worksheet.illustrationHint || 'Quan sát sơ đồ thực tế trong SGK để hoàn thành phiếu bài tập bên dưới.'}
          </div>
        </div>

        {/* Question Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* PHẦN 1: TRẮC NGHIỆM */}
          {worksheet.questions && worksheet.questions.filter(q => q.type === 'mcq' || !q.type).length > 0 && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ fontWeight: 900, color: '#0284c7', fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
                PHẦN 1: CÂU HỎI TRẮC NGHIỆM (Khoanh tròn vào đáp án đúng nhất)
              </div>

              {worksheet.questions.filter(q => q.type === 'mcq' || !q.type).map((q, idx) => (
                <div key={q.id || idx} style={{ marginBottom: '14px', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    Câu {idx + 1}: {q.question}
                  </div>
                  {q.options && Array.isArray(q.options) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingLeft: '12px' }}>
                      {q.options.map((opt, oIdx) => {
                        const letter = ['A', 'B', 'C', 'D'][oIdx] || String.fromCharCode(65 + oIdx);
                        return (
                          <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                            <span style={{ fontWeight: 800, color: '#0284c7' }}>{letter}.</span> {opt}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PHẦN 2: TỰ LUẬN & VẬN DỤNG */}
          {worksheet.questions && worksheet.questions.filter(q => q.type === 'essay' || q.type === 'fill_in').length > 0 && (
            <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ fontWeight: 900, color: '#db2777', fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#db2777', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
                PHẦN 2: TỰ LUẬN & VẬN DỤNG THỰC TẾ (Học sinh suy nghĩ và điền câu trả lời)
              </div>

              {worksheet.questions.filter(q => q.type === 'essay' || q.type === 'fill_in').map((q, idx) => (
                <div key={q.id || idx} style={{ marginBottom: '18px', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    Câu {idx + 1}: {q.question}
                  </div>
                  <div style={{
                    borderBottom: '1px dashed #cbd5e1',
                    lineHeight: '2rem',
                    color: '#94a3b8',
                    paddingLeft: '8px',
                    fontSize: '0.85rem'
                  }}>
                    ........................................................................................................................................................................
                    <br />
                    ........................................................................................................................................................................
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer Signature */}
        <div style={{ marginTop: '30px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
          <div>Sky-Line Educational Games Platform</div>
          <div>Giáo viên bộ môn: .......................................</div>
        </div>

      </div>

    </div>
  );
}
