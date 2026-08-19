import React, { useState } from 'react';
import { X, PlusCircle, Gamepad2, Sparkles } from 'lucide-react';
import { SoundFX } from '../utils/sound';

export function AdminCreateGameModal({ isOpen, onClose, onAddGame }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Trắc nghiệm tương tác');
  const [icon, setIcon] = useState('🎮');
  const [gradient, setGradient] = useState('linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)');
  const [engineType, setEngineType] = useState('wheel');
  const [description, setDescription] = useState('');
  const [secretImage, setSecretImage] = useState('');

  const handleSecretImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp ảnh hợp lệ.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setSecretImage(event.target.result);
      SoundFX.correct();
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) {
      alert('Vui lòng nhập tên Game mới.');
      return;
    }

    const newGame = {
      title,
      subtitle: subtitle || 'Trò chơi giáo dục tương tác',
      category,
      icon: icon || '🎮',
      gradient,
      engineType,
      secretImage,
      bgImageUrl: secretImage,
      description: description || 'Trò chơi học tập sinh động dành cho giáo viên và học sinh.',
      defaultQuestions: [
        {
          id: 'def_q1',
          question: 'Câu hỏi mẫu mặc định số 1?',
          options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          correct: 'A',
          explanation: 'Gợi ý giải thích mẫu'
        }
      ]
    };

    onAddGame(newGame);
    SoundFX.fanfare();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-modal" style={{ width: '100%', maxWidth: '580px', padding: '28px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle color="#f59e0b" size={24} />
              Tạo Mẫu Game Mới (Dành Cho Admin)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Thêm một mẫu trò chơi mới vào Kho Game chung cho tất cả giáo viên sử dụng.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
              Tên Trò Chơi Mới:
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đua Xe Tri Thức, Bắt Bong Bóng Quiz..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                Biểu Tượng Emoji:
              </label>
              <input 
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🎲, 🏎️, 🎈, 🎯"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
                Thể Loại:
              </label>
              <input 
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="VD: Đua xe, Đồ họa"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
              Kiểu Engine Game Hiển Thị:
            </label>
            <select
              value={engineType}
              onChange={(e) => setEngineType(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
            >
              <option value="wheel">🎡 Vòng Quay May Mắn (Wheel of Fortune)</option>
              <option value="tug-of-war">🪢 Kéo Co Kiến Thức 1 (Tug of War Turn-based)</option>
              <option value="tug-of-war-dual">⚔️ Kéo Co Kiến Thức 2 (Tug of War Dual Simultaneous)</option>
              <option value="millionaire">💰 Ai Là Triệu Phú (Millionaire Ladder)</option>
              <option value="mystery-box">🎁 Hộp Quà Bí Mật (Mystery Gift Boxes)</option>
              <option value="picture-reveal">🖼️ Lật Mảnh Ghép Tranh (Picture Puzzle)</option>
              <option value="crossword">🧩 Ô Chữ Khóa Bí Mật (Crossword)</option>
              <option value="train">🚂 Đoàn Tàu Tri Thức (Train Match)</option>
              <option value="flashcard">🎴 Thẻ Ghi Nhớ Flashcard (Memory Flip)</option>
              <option value="fruit-ninja">🍉 Chém Hoa Quả / Bắt Bong Bóng (Fruit Ninja Quiz)</option>
              <option value="car-race">🏎️ Đua Xe Kiến Thức (Knowledge Car Race)</option>
              <option value="minesweeper">💣 Dò Mìn Phiêu Lưu (Minesweeper Quiz)</option>
              <option value="flying-words">✈️ Từ Ngữ Biết Bay (Flying Words Builder)</option>
              <option value="matching-pairs">🔗 Kéo Thả Nối Ý (Drag & Match Pairs)</option>
              <option value="duck-race">🦆 Đua Vịt Tri Thức (Duck Race)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
              Tông Màu Banner (Gradient):
            </label>
            <select
              value={gradient}
              onChange={(e) => setGradient(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
            >
              <option value="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)">Tím Indigo Mộng Mơ</option>
              <option value="linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)">Đỏ Hồng Rực Rỡ</option>
              <option value="linear-gradient(135deg, #10b981 0%, #3b82f6 100%)">Xanh Ngọc & Biển</option>
              <option value="linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)">Vàng Cam Hoàng Hôn</option>
              <option value="linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)">Xanh Cyan Hiện Đại</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>
              Mô Tả Trò Chơi:
            </label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả cách chơi và trải nghiệm của trò chơi này..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy Bỏ
            </button>
            <button 
              type="submit"
              className="btn btn-accent"
            >
              <PlusCircle size={18} />
              Thêm Game Mới
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
