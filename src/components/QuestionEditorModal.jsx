import React, { useState, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, Plus, Trash2, Save, Play, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { parseExcelFile, downloadExcelTemplate } from '../utils/excel';
import { SoundFX } from '../utils/sound';

export function QuestionEditorModal({ isOpen, onClose, gameTemplate, currentUser, onSaveAndPlay, onSaveToMyGames }) {
  if (!isOpen || !gameTemplate) return null;

  const [title, setTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [subject, setSubject] = useState(currentUser?.subject || 'Tổng hợp');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [secretImage, setSecretImage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  useEffect(() => {
    if (gameTemplate) {
      setTitle(gameTemplate.title || '');
      setLessonTitle(gameTemplate.lessonTitle || '');
      setDescription(gameTemplate.description || '');
      setSecretImage(gameTemplate.secretImage || gameTemplate.bgImageUrl || '');
      const existingQs = gameTemplate.questions || gameTemplate.defaultQuestions || [];
      setQuestions(JSON.parse(JSON.stringify(existingQs)));
      setUploadError('');
      setUploadSuccess('');
    }
  }, [gameTemplate]);

  // Handle Secret Key Image File Upload
  const handleSecretImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSecretImage(event.target.result);
      setUploadSuccess(`Đã tải ảnh chìa khóa bí mật thành công!`);
      SoundFX.correct();
    };
    reader.readAsDataURL(file);
  };

  // Handle Excel File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessingFile(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const parsedQuestions = await parseExcelFile(file);
      setQuestions(parsedQuestions);
      setUploadSuccess(`Đã nhập thành công ${parsedQuestions.length} câu hỏi từ tệp ${file.name}!`);
      SoundFX.correct();
    } catch (err) {
      setUploadError(err.message || 'Lỗi khi nhập file Excel.');
      SoundFX.wrong();
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Add empty question row
  const handleAddQuestion = () => {
    const newQ = {
      id: `q_${Date.now()}_${questions.length + 1}`,
      question: 'Câu hỏi mới...',
      options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
      correct: 'A',
      explanation: ''
    };
    setQuestions([...questions, newQ]);
    SoundFX.click();
  };

  // Update question field
  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // Update question option
  const handleUpdateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  // Delete question row
  const handleDeleteQuestion = (index) => {
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
    SoundFX.click();
  };

  // Package Data
  const getCustomGameData = () => {
    const effectiveTitle = title || gameTemplate?.title || lessonTitle || 'Bài Game Cá Nhân';
    const effectiveLesson = lessonTitle || title || gameTemplate?.title || 'Bài Game Cá Nhân';
    
    // Check if game is already saved
    const isAlreadySaved = gameTemplate?.isSaved || gameTemplate?.isSavedGame || (typeof gameTemplate?.id === 'string' && gameTemplate.id.startsWith('saved_'));
    
    // Determine exact engineType
    const effectiveEngineType = gameTemplate?.engineType || gameTemplate?.baseGameId || 'tug-of-war-dual';

    return {
      id: isAlreadySaved ? gameTemplate.id : `saved_${Date.now()}`,
      userId: currentUser?.id || 'user_admin',
      username: currentUser?.username || 'ThayHao',
      baseGameId: gameTemplate?.baseGameId || gameTemplate?.id || effectiveEngineType,
      title: effectiveTitle,
      lessonTitle: effectiveLesson,
      subject: subject || 'Địa Lý',
      gradient: gameTemplate?.gradient || 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
      icon: gameTemplate?.icon || '🎮',
      engineType: effectiveEngineType,
      description: description || gameTemplate?.description || '',
      secretImage: secretImage || gameTemplate?.secretImage || gameTemplate?.bgImageUrl || '',
      bgImageUrl: secretImage || gameTemplate?.secretImage || gameTemplate?.bgImageUrl || '',
      questions: ((questions && questions.length > 0) ? questions : (gameTemplate?.questions || [])).map(q => {
        if (!q || !Array.isArray(q.options)) return q;
        const cleanOpts = q.options.map(o => String(o || '').trim());
        if (!cleanOpts[2] && !cleanOpts[3]) {
          return { ...q, options: [cleanOpts[0] || 'Đúng', cleanOpts[1] || 'Sai'] };
        }
        if (!cleanOpts[3]) {
          return { ...q, options: [cleanOpts[0] || 'A', cleanOpts[1] || 'B', cleanOpts[2]] };
        }
        return { ...q, options: cleanOpts };
      }),
      updatedAt: new Date().toISOString().split('T')[0]
    };
  };

  const handleSaveOnly = () => {
    const finalQs = (questions && questions.length > 0) ? questions : (gameTemplate?.questions || []);
    if (!finalQs || finalQs.length === 0) {
      alert('Vui lòng nhập tệp Excel hoặc thêm ít nhất 1 câu hỏi.');
      return;
    }
    const data = getCustomGameData();
    if (onSaveToMyGames) onSaveToMyGames(data);
    try { SoundFX.correct(); } catch(e) {}
    if (onClose) onClose();
  };

  const handleSaveAndPlayClick = () => {
    const finalQs = (questions && questions.length > 0) ? questions : (gameTemplate?.questions || []);
    if (!finalQs || finalQs.length === 0) {
      alert('Vui lòng nhập tệp Excel hoặc thêm ít nhất 1 câu hỏi.');
      return;
    }
    const data = getCustomGameData();
    if (onSaveAndPlay) onSaveAndPlay(data);
    try { SoundFX.fanfare(); } catch(e) {}
    if (onClose) onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-modal" style={{ width: '100%', maxWidth: '1020px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        
        {/* Modal Top Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '2rem' }}>{gameTemplate.icon || '🎮'}</div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Tùy Biến Nội Dung Game: <span style={{ color: '#8b5cf6' }}>{gameTemplate.title}</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Nhập file Excel mẫu hoặc tự thiết kế chi tiết các câu hỏi bên dưới.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Game Title & Subject Input */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>
                Tên Bài Kiểm Tra / Tên Game Cá Nhân:
              </label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Kiểm Tra Kéo Co - Châu Âu 7"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)', display: 'block', marginBottom: '6px' }}>
                Môn Học / Chủ Đề:
              </label>
              <input 
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="VD: Địa lí 7"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Lesson / Topic Title Input Field for Easy Teacher Search */}
          <div style={{ background: 'rgba(13, 148, 136, 0.1)', padding: '16px 20px', borderRadius: '16px', border: '1.5px solid rgba(94, 234, 212, 0.35)' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#5eead4', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              📖 Tên Bài Học / Chủ Đề Game (Giúp Giáo Viên Tìm Kiếm Dễ Dàng Sau Này):
            </label>
            <input 
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="VD: Kiến thức Châu Âu trong Địa lí 7, Ôn tập giữa kỳ 1..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1.5px solid rgba(94, 234, 212, 0.5)',
                color: '#ffffff',
                fontSize: '0.98rem',
                fontWeight: 700,
                outline: 'none'
              }}
            />
          </div>

          {/* Secret Key Image Uploader Section (Special for Picture Reveal Game) */}
          {(gameTemplate.engineType === 'picture-reveal') && (
            <div style={{
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1.5px solid rgba(236, 72, 153, 0.4)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.6rem' }}>🖼️</span>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f472b6', margin: 0 }}>
                    Hình Ảnh Chìa Khóa Bí Mật (Bức Tranh Ẩn Sau Mảnh Ghép)
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Tải tệp ảnh từ máy tính hoặc dán đường link ảnh chìa khóa để học sinh lật mở khám phá.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                <div>
                  <label style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                    📁 Chọn Ảnh Từ Máy Tính:
                  </label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleSecretImageFileUpload}
                    style={{ display: 'none' }}
                    id="secret-image-file-input"
                  />
                  <label 
                    htmlFor="secret-image-file-input"
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: 'rgba(236, 72, 153, 0.2)',
                      border: '1px dashed #ec4899',
                      color: '#f472b6',
                      cursor: 'pointer',
                      padding: '10px',
                      fontWeight: 700
                    }}
                  >
                    <Upload size={16} /> Tải Tệp Ảnh Lên Máy...
                  </label>
                </div>

                <div>
                  <label style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                    🔗 Hoặc Nhập Link Ảnh (URL):
                  </label>
                  <input 
                    type="text"
                    placeholder="https://example.com/bua-anh-chia-khoa.jpg"
                    value={secretImage}
                    onChange={(e) => setSecretImage(e.target.value)}
                    style={{ 
                      width: '100%',
                      padding: '10px 14px', 
                      borderRadius: '10px', 
                      background: '#1e293b', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {secretImage && (
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(15, 23, 42, 0.7)', padding: '12px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img 
                    src={secretImage} 
                    alt="Xem trước bức ảnh chìa khóa"
                    style={{ width: '90px', height: '65px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ec4899' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ color: '#6ee7b7', fontWeight: 800, fontSize: '0.85rem', display: 'block' }}>
                      ✓ Đã sẵn sàng bức ảnh chìa khóa bí mật
                    </span>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSecretImage('')}
                    style={{ color: '#fca5a5', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444' }}
                  >
                    Xóa Ảnh
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Standard Excel Import Section */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>
                📊 Nhập File Mẫu Excel Có Sẵn
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Nạp tệp câu hỏi mẫu dạng file Excel (.xlsx) đã soạn sẵn.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => downloadExcelTemplate(gameTemplate.title, gameTemplate.engineType)}
              >
                <FileSpreadsheet size={16} /> Tải File Excel Mẫu
              </button>

              <label className="btn btn-success btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={16} />
                {isProcessingFile ? 'Đang Đọc File...' : 'Nhập Từ File Excel'}
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Error & Success Toasts */}
          {uploadError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} /> {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#6ee7b7', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} /> {uploadSuccess}
            </div>
          )}

          {/* Interactive Questions Table / Editor */}
          <div id="questions-list-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                📝 Danh Sách Câu Hỏi Trong Game ({questions.length} câu):
              </h3>

              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddQuestion}
              >
                <Plus size={16} /> Thêm Câu Hỏi Thủ Công
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                  Chưa có câu hỏi nào. Hãy tải file Excel lên hoặc bấm nút "Thêm Câu Hỏi Thủ Công".
                </div>
              ) : (
                questions.map((q, qIndex) => (
                  <div 
                    key={q.id || qIndex}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <span style={{ fontWeight: 800, color: '#8b5cf6', fontSize: '0.95rem' }}>
                        Câu {qIndex + 1}:
                      </span>
                      <button 
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteQuestion(qIndex)}
                        style={{ padding: '4px 8px' }}
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(qIndex, 'question', e.target.value)}
                      placeholder="Nhập nội dung câu hỏi..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />

                    {/* 4 Answer Options */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {['A', 'B', 'C', 'D'].map((letter, optIndex) => (
                        <div 
                          key={letter}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: q.correct === letter ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                            border: `1px solid ${q.correct === letter ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                            padding: '6px 12px',
                            borderRadius: '10px'
                          }}
                        >
                          <input 
                            type="radio"
                            name={`correct_${qIndex}`}
                            checked={q.correct === letter}
                            onChange={() => handleUpdateQuestion(qIndex, 'correct', letter)}
                            style={{ cursor: 'pointer', accentColor: '#10b981' }}
                          />
                          <span style={{ fontWeight: 800, color: q.correct === letter ? '#6ee7b7' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {letter}.
                          </span>
                          <input 
                            type="text"
                            value={q.options[optIndex] || ''}
                            onChange={(e) => handleUpdateOption(qIndex, optIndex, e.target.value)}
                            placeholder={optIndex >= 2 ? `Phương án ${letter} (Bỏ trống nếu là Đúng/Sai)...` : `Phương án ${letter}...`}
                            style={{
                              flex: 1,
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: '#fff',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '8px', borderLeft: '3px solid #8b5cf6' }}>
                        💡 <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Modal Bottom Action Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Hủy Bỏ
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button"
              className="btn btn-primary"
              onClick={handleSaveOnly}
              style={{ fontWeight: 700 }}
            >
              <Save size={16} /> Lưu Vào Kho Game Của Tôi
            </button>

            <button 
              type="button"
              className="btn btn-success"
              onClick={handleSaveAndPlayClick}
              style={{ fontWeight: 900, padding: '10px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <Play size={16} /> 🚀 Bắt Đầu Cho Học Sinh Chơi Ngay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
