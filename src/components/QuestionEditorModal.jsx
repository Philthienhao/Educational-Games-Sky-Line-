import React, { useState, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, Plus, Trash2, Save, Play, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { parseExcelFile, downloadExcelTemplate } from '../utils/excel';
import { SoundFX } from '../utils/sound';

export function QuestionEditorModal({ isOpen, onClose, gameTemplate, currentUser, onSaveAndPlay, onSaveToMyGames }) {
  if (!isOpen || !gameTemplate) return null;

  const [title, setTitle] = useState('');
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
    return {
      id: gameTemplate.isSaved ? gameTemplate.id : `saved_${Date.now()}`,
      userId: currentUser?.id,
      username: currentUser?.username,
      baseGameId: gameTemplate.baseGameId || gameTemplate.id,
      title: title || gameTemplate.title,
      subject: subject,
      gradient: gameTemplate.gradient,
      icon: gameTemplate.icon,
      engineType: gameTemplate.engineType,
      description: description,
      secretImage: secretImage,
      bgImageUrl: secretImage,
      questions: questions,
      updatedAt: new Date().toISOString().split('T')[0]
    };
  };

  const handleSaveOnly = () => {
    if (questions.length === 0) {
      alert('Vui lòng thêm ít nhất 1 câu hỏi.');
      return;
    }
    const data = getCustomGameData();
    onSaveToMyGames(data);
    SoundFX.correct();
    onClose();
  };

  const handleSaveAndPlayClick = () => {
    if (questions.length === 0) {
      alert('Vui lòng thêm ít nhất 1 câu hỏi.');
      return;
    }
    const data = getCustomGameData();
    onSaveAndPlay(data);
    SoundFX.fanfare();
    onClose();
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
      <div className="glass-modal" style={{ width: '100%', maxWidth: '960px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        
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
                Nhập file Excel câu hỏi môn học của bạn hoặc chỉnh sửa trực tiếp bên dưới. Game sẽ được lưu vào tài khoản <strong>{currentUser?.name}</strong>.
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
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
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
                placeholder="VD: Kiểm Tra Toán 10 - Chương 1"
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
                placeholder="VD: Ngữ Văn, Toán, Tiếng Anh"
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

              {/* Image File Input & URL Input */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                
                {/* File Upload Button */}
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

                {/* Direct Image URL Input */}
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

              {/* Image Preview Thumbnail */}
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
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                      {secretImage.length > 60 ? secretImage.slice(0, 60) + '...' : secretImage}
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

          {/* Excel Template & File Upload Bar */}
          <div style={{
            padding: '18px 22px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={18} />
                Nhập Câu Hỏi Từ File Excel / CSV (.xlsx, .csv)
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Tải tệp mẫu Excel về máy, điền danh sách câu hỏi của bạn rồi tải lên đây.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => downloadExcelTemplate(title || gameTemplate.title)}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <FileSpreadsheet size={16} />
                Tải Mẫu Excel
              </button>

              <label className="btn btn-success btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={16} />
                {isProcessingFile ? 'Đang đọc file...' : 'Tải File Excel Up'}
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Feedback messages */}
          {uploadError && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              {uploadSuccess}
            </div>
          )}

          {/* Interactive Questions Table Editor */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Danh Sách Câu Hỏi ({questions.length} câu • Không Giới Hạn Số Lượng)
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleAddQuestion}
              >
                <Plus size={16} />
                Thêm Câu Hỏi Mới
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((q, idx) => (
                <div 
                  key={q.id || idx}
                  style={{
                    padding: '18px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <span className="badge badge-teacher" style={{ borderRadius: '8px', padding: '6px 10px' }}>
                        Câu {idx + 1}
                      </span>
                      <input 
                        type="text"
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(idx, 'question', e.target.value)}
                        placeholder="Nhập nội dung câu hỏi..."
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>

                    <button 
                      onClick={() => handleDeleteQuestion(idx)}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#fca5a5', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Options Grid A, B, C, D */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {['A', 'B', 'C', 'D'].map((optLabel, optIdx) => (
                      <div 
                        key={optLabel}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: q.correct === optLabel ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.04)',
                          border: q.correct === optLabel ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={`correct_${idx}`} 
                          checked={q.correct === optLabel}
                          onChange={() => handleUpdateQuestion(idx, 'correct', optLabel)}
                          style={{ cursor: 'pointer', accentColor: '#10b981' }}
                        />
                        <span style={{ fontWeight: 800, color: q.correct === optLabel ? '#6ee7b7' : 'var(--text-muted)' }}>
                          {optLabel}:
                        </span>
                        <input 
                          type="text"
                          value={q.options[optIdx] || ''}
                          onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                          placeholder={`Đáp án ${optLabel}`}
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '0.85rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Explanation / Hint */}
                  <div>
                    <input 
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => handleUpdateQuestion(idx, 'explanation', e.target.value)}
                      placeholder="Giải thích / Gợi ý khi trả lời (tùy chọn)..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div style={{
          padding: '20px 28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.03)'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Tài khoản lưu: <strong style={{ color: '#fff' }}>{currentUser?.name}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="btn btn-secondary"
              onClick={handleSaveOnly}
            >
              <Save size={18} />
              Lưu Vào Kho Game Của Tôi
            </button>

            <button 
              className="btn btn-primary"
              onClick={handleSaveAndPlayClick}
            >
              <Play size={18} fill="#fff" />
              Lưu & Bắt Đầu Trình Chiếu
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
