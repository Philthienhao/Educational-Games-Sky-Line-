import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Atom, 
  Dna, 
  Zap, 
  Search, 
  Plus, 
  Play, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Filter, 
  CheckCircle2, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { ExperimentService } from '../services/experimentService';
import { InteractiveExperimentCanvas } from './experiments/InteractiveExperimentCanvas';

export function VirtualLabManager({ currentUser }) {
  const [experiments, setExperiments] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Interactive Lab Modal State
  const [activeExperiment, setActiveExperiment] = useState(null);

  // Create Custom Experiment Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newExp, setNewExp] = useState({
    title: '',
    subject: 'Hóa học',
    grade: 10,
    chapter: '',
    objective: '',
    equipment: '',
    steps: '',
    phenomenon: '',
    explanation: '',
    interactiveType: 'chemistry_acid_base'
  });

  useEffect(() => {
    loadExperiments();
    if (currentUser?.subject && (currentUser.subject.includes('Địa') || currentUser.subject.includes('Dia'))) {
      setSelectedSubject('Địa lí');
      setSelectedGrade('6');
    }
  }, [currentUser]);

  const loadExperiments = () => {
    const list = ExperimentService.getExperiments(currentUser?.id);
    setExperiments(list);
  };

  const handleDelete = async (expId, title, e) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài thí nghiệm "${title}" khỏi danh sách không?`)) {
      await ExperimentService.deleteExperiment(currentUser?.id, expId);
      loadExperiments();
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newExp.title.trim()) return alert("Vui lòng nhập tên bài thí nghiệm!");

    const formatted = {
      ...newExp,
      grade: Number(newExp.grade),
      equipment: typeof newExp.equipment === 'string' ? newExp.equipment.split(',').map(s => s.trim()) : [],
      steps: typeof newExp.steps === 'string' ? newExp.steps.split('\n').map(s => s.trim()).filter(Boolean) : []
    };

    await ExperimentService.saveExperiment(currentUser?.id, formatted);
    setIsCreateModalOpen(false);
    setNewExp({
      title: '',
      subject: 'Hóa học',
      grade: 10,
      chapter: '',
      objective: '',
      equipment: '',
      steps: '',
      phenomenon: '',
      explanation: '',
      interactiveType: 'chemistry_acid_base'
    });
    loadExperiments();
  };

  // Filtering Logic
  const filteredExperiments = experiments.filter(exp => {
    const matchGrade = selectedGrade === 'all' || String(exp.grade) === String(selectedGrade);
    const isKHTNFilter = selectedSubject === 'KHTN' || selectedSubject === 'Khoa học tự nhiên';
    
    // Support both 'Địa lí' and 'Địa lý' spellings
    const isGeoSubject = selectedSubject === 'Địa lí' || selectedSubject === 'Địa lý';
    const expIsGeo = exp.subject === 'Địa lí' || exp.subject === 'Địa lý';

    const matchSubject = selectedSubject === 'all' || 
      (isGeoSubject ? expIsGeo : exp.subject === selectedSubject) || 
      (isKHTNFilter && (exp.subjectCategory === 'KHTN' || exp.subject === 'Khoa học tự nhiên' || expIsGeo || Number(exp.grade) <= 9));
    
    // Normalize diacritics for search matching: treat 'lý' and 'lí' identically
    const normSearch = (searchTerm || '').trim().toLowerCase().replace(/lý/g, 'lí');
    const normTitle = (exp.title || '').toLowerCase().replace(/lý/g, 'lí');
    const normExplanation = (exp.explanation || '').toLowerCase().replace(/lý/g, 'lí');
    const normObjective = (exp.objective || '').toLowerCase().replace(/lý/g, 'lí');
    const normChapter = (exp.chapter || '').toLowerCase().replace(/lý/g, 'lí');

    const matchSearch = !normSearch || 
      normTitle.includes(normSearch) || 
      normExplanation.includes(normSearch) ||
      normObjective.includes(normSearch) ||
      normChapter.includes(normSearch);

    return matchGrade && matchSubject && matchSearch;
  });

  const getSubjectBadgeColor = (subject) => {
    if (subject === 'Hóa học') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' };
    if (subject === 'Vật lí') return { bg: 'rgba(14, 116, 144, 0.2)', color: '#38bdf8', border: 'rgba(14, 116, 144, 0.4)' };
    if (subject === 'Sinh học') return { bg: 'rgba(34, 197, 94, 0.15)', color: '#86efac', border: 'rgba(34, 197, 94, 0.3)' };
    if (subject === 'Địa lí') return { bg: 'rgba(245, 158, 11, 0.2)', color: '#fde047', border: 'rgba(245, 158, 11, 0.4)' };
    return { bg: 'rgba(13, 148, 136, 0.15)', color: '#2dd4bf', border: 'rgba(13, 148, 136, 0.3)' };
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, #091a28 0%, #0d2b3a 50%, #0f172a 100%)',
        borderRadius: '24px',
        padding: '28px 32px',
        border: '1.5px solid rgba(13, 148, 136, 0.35)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(13, 148, 136, 0.45)'
              }}>
                <FlaskConical size={26} color="#ffffff" />
              </div>
              <h1 style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #2dd4bf 0%, #38bdf8 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                Phòng Thí Nghiệm Trực Quan
              </h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, fontWeight: 500, maxWidth: '700px' }}>
              Thư viện mô phỏng thí nghiệm thực hành & biểu diễn trực quan chuẩn bộ SGK GDPT 2018 (Khoa học tự nhiên 6-9, Hóa học - Vật lí - Sinh học 10-12).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                setSelectedSubject('Địa lí');
                setSelectedGrade('6');
                setSearchTerm('');
              }}
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                color: '#ffffff',
                border: '1.5px solid #fde047',
                borderRadius: '12px',
                padding: '12px 20px',
                fontWeight: 900,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(217, 119, 6, 0.45)'
              }}
            >
              <Sparkles size={18} color="#ffffff" /> 🌍 7 Thí Nghiệm Địa Lí Khối 6
            </button>

            <button 
              onClick={() => setActiveExperiment({
                id: 'exp_chem_sandbox_00',
                title: '🧪 Phòng Thí Nghiệm Mở (Sandbox Nguyên Tố & Hóa Chất Tự Chọn)',
                subject: 'Hóa học',
                subjectCategory: 'KHTN',
                grade: 9,
                chapter: 'Mô Phỏng Tự Do - GDPT 2018 (Open Element Sandbox Lab)',
                objective: 'Tự do thêm nguyên tố kim loại (Na, K, Fe, Cu, Zn, Mg, Al), rót nước H2O, thêm dung dịch acid/base, đun nóng và tự động xuất hiện Phương trình Hóa học cân bằng.',
                equipment: [
                  'Cốc thủy tinh chia độ 250ml',
                  'Đèn cồn đun nóng',
                  'Khay Nguyên Tố Kim Loại (Na, K, Fe, Cu, Zn, Mg, Al)',
                  'Khay Dung Dịch (H2O, HCl, H2SO4, NaOH, CuSO4, AgNO3)',
                  'Chất chỉ thị (Phenolphthalein, Quỳ tím)',
                  'Cảm biến nhiệt độ & pHProbe real-time'
                ],
                steps: [
                  '1. Chọn nguyên tố hoặc chất hóa học từ khay reagent thả vào cốc nghiệm.',
                  '2. Bấm "💧 Rót Nước H2O" hoặc thêm dung dịch thích hợp.',
                  '3. Bật ngọn lửa Đèn Cồn để đun nóng chất phản ứng.',
                  '4. Quan sát hiện tượng biến đổi, sủi bọt, đổi màu và đọc Phương Trình Hóa Học tự động hiển thị!'
                ],
                phenomenon: 'Xuất hiện bọt khí effervescence, kết tủa keo màu, hiện tượng đổi màu chỉ thị, sự thay đổi nhiệt độ & pH real-time.',
                explanation: 'Hệ thống tự động nhận diện các chất tham gia phản ứng trong cốc và truy xuất PTHH cân bằng chuẩn mực kèm log hiện tượng khoa học.',
                interactiveType: 'chemistry_sandbox'
              })}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontWeight: 900,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(2, 132, 199, 0.45)'
              }}
            >
              <Sparkles size={18} color="#ffffff" /> 🧪 Phòng Thí Nghiệm Mở (Sandbox Nguyên Tố)
            </button>

            <button 
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(13, 148, 136, 0.35)'
              }}
            >
              <Plus size={18} /> Thêm Thí Nghiệm Mới
            </button>
          </div>
        </div>
      </div>

      {/* Featured 3D NOBOOK Whiteboard Experiment Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #064e3b 50%, #0f172a 100%)',
        borderRadius: '20px',
        padding: '22px 28px',
        border: '2px solid rgba(245, 158, 11, 0.6)',
        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.25)',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
              🔥 MỚI - CHUẨN NOBOOK 3D
            </span>
            <span style={{ color: '#fde047', fontSize: '0.8rem', fontWeight: 800 }}>
              Bảng Tương Tác Cảm Ứng
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0' }}>
            🧪 Thí Nghiệm 3D: Khử Sắt(III) Oxit (Fe₂O₃) Bằng Khí CO
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
            Mô phỏng 3D trực quan như trong video: Thìa Spatula đong bột, quẹt diêm đốt đèn cồn, điều chỉnh giá nâng lò xo Scissor Jack, bình khí CO, kính hiển vi phân tử & bảng thông số real-time.
          </p>
        </div>

        <button 
          onClick={() => setActiveExperiment({
            id: 'exp_chem9_fe2o3_co',
            title: '🔥 Thí Nghiệm 3D: Khử Sắt(III) Oxit (Fe₂O₃) Bằng Khí Carbon Monoxide (CO)',
            subject: 'Hóa học',
            subjectCategory: 'KHTN',
            grade: 9,
            chapter: 'Chương 2: Kim loại - Tính chất hóa học & Điều chế kim loại (GDPT 2018)',
            objective: 'Thao tác trên bảng tương tác: Đong bột Fe₂O₃ bằng thìa, quẹt diêm đốt đèn cồn, điều chỉnh giá nâng, dẫn khí CO khử Fe₂O₃ ở nhiệt độ cao, quan sát bột chuyển đỏ nâu sang xám đen Fe, khí CO₂ thoát ra làm đục nước vôi trong Ca(OH)₂, xem kính hiển vi phân tử & chỉ số real-time.',
            equipment: [
              'Ống thủy tinh chịu nhiệt nằm ngang & Khay giá kẹp kiềm sắt',
              'Đèn cồn & Hộp diêm quẹt lửa trực quan',
              'Giá nâng lò xo (Scissor Jack Lift) nâng hạ chiều cao',
              'Thìa đong hóa chất spatula kèm slider khối lượng',
              'Bột Fe₂O₃ (đỏ nâu), Bình khí CO kèm van xả',
              'Ống nghiệm chứa nước vôi trong Ca(OH)₂ & Nút cao su dẫn khí',
              'Kính hiển vi phân tử (Microscope View) & Bảng thông số AoS, Temp, Vol'
            ],
            steps: [
              '1. Dùng thìa Spatula đong 15g bột Fe₂O₃ cho vào ống thủy tinh nằm ngang.',
              '2. Quẹt diêm trên hộp diêm rồi đưa lại gần bấc đèn cồn để thắp lửa.',
              '3. Điều chỉnh giá nâng Scissor Jack nâng đèn cồn sát ống nghiệm.',
              '4. Mở van bình khí CO để dòng khí CO chạy qua ống nghiệm.',
              '5. Bật bảng thông số (Temperature, Volume, AoS, Equation, Microscope) trên bảng tương tác để theo dõi phản ứng nhiệt độ tăng tới 600°C, Fe₂O₃ hóa xám đen và nước vôi trong vẩn đục.'
            ],
            phenomenon: 'Bột Fe₂O₃ đỏ nâu chuyển dần thành bột sắt Fe màu xám đen bóng. Khí CO₂ sinh ra đi qua ống dẫn khí làm dung dịch Ca(OH)₂ trong suốt chuyển thành kết tủa đục trắng CaCO₃.',
            explanation: 'Khí CO có tính khử mạnh ở nhiệt độ cao (>500°C), chiếm oxy của Fe₂O₃ tạo ra kim loại Fe và khí CO₂. Khí CO₂ tác dụng với Ca(OH)₂ tạo kết tủa CaCO₃ không tan.',
            interactiveType: 'chem9_fe2o3_co'
          })}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            padding: '14px 24px',
            fontWeight: 900,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.45)',
            whiteSpace: 'nowrap'
          }}
        >
          <Play size={20} fill="#ffffff" /> ▶️ Trải Nghiệm Thí Nghiệm 3D NOBOOK Ngay!
        </button>
      </div>

      {/* Filter and Search Control Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        borderRadius: '18px',
        padding: '16px 20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left Filter Dropdowns */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          
          {/* Grade Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700 }}>Khối lớp:</span>
            <select 
              value={selectedGrade} 
              onChange={(e) => setSelectedGrade(e.target.value)}
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <option value="all">Tất Cả Khối Lớp (6 - 12)</option>
              <option value="6">Khối 6 (KHTN)</option>
              <option value="7">Khối 7 (KHTN)</option>
              <option value="8">Khối 8 (KHTN)</option>
              <option value="9">Khối 9 (KHTN)</option>
              <option value="10">Khối 10 (Hóa / Lý / Sinh)</option>
              <option value="11">Khối 11 (Hóa / Lý / Sinh)</option>
              <option value="12">Khối 12 (Hóa / Lý / Sinh)</option>
            </select>
          </div>

          {/* Subject Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700 }}>Phân môn:</span>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <option value="all">Tất Cả Phân Môn</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Vật lí">Vật lí</option>
              <option value="Sinh học">Sinh học</option>
              <option value="Địa lí">Địa lí (Lớp 6)</option>
              <option value="Khoa học tự nhiên">KHTN (Lớp 6-9)</option>
            </select>
          </div>
        </div>

        {/* Right Search Input */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            placeholder="Tìm theo tên bài, phương trình, dụng cụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '8px 14px 8px 38px',
              color: '#f8fafc',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* Experiments Grid Display */}
      {filteredExperiments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px', border: '1px dashed #334155' }}>
          <FlaskConical size={48} color="#64748b" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#cbd5e1', fontWeight: 700 }}>Không tìm thấy bài thí nghiệm nào phù hợp</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '22px'
        }}>
          {filteredExperiments.map(exp => {
            const badge = getSubjectBadgeColor(exp.subject);
            return (
              <div 
                key={exp.id}
                onClick={() => setActiveExperiment(exp)}
                style={{
                  background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(13, 148, 136, 0.6)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {exp.subject}
                    </span>
                    <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                      Khối {exp.grade}
                    </span>
                  </div>

                  {/* Delete button for custom ones */}
                  {exp.isCustomized && (
                    <button 
                      onClick={(e) => handleDelete(exp.id, exp.title, e)}
                      title="Xóa bài thí nghiệm này"
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Title & Chapter */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                    {exp.title}
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 500 }}>
                    {exp.chapter}
                  </div>
                </div>

                {/* Objective */}
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4, flex: 1 }}>
                  {exp.objective}
                </p>

                {/* Footer Action */}
                <div style={{
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#2dd4bf', fontWeight: 700 }}>
                    {exp.equipment?.length || 0} Dụng cụ & Hóa chất
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveExperiment(exp);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Play size={14} fill="#ffffff" /> Trình Chiếu Thí Nghiệm
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Experiment Interactive Canvas Modal */}
      {activeExperiment && (
        <InteractiveExperimentCanvas 
          experiment={activeExperiment}
          onClose={() => setActiveExperiment(null)}
        />
      )}

      {/* Create Custom Experiment Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 1050,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#0f172a', borderRadius: '20px', border: '1px solid rgba(13, 148, 136, 0.4)',
            maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', color: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2dd4bf', margin: 0 }}>
                Thêm Bài Thí Nghiệm Mới
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tên Bài Thí Nghiệm:</label>
                <input 
                  type="text" required placeholder="Ví dụ: Thí nghiệm điều chế khí Oxygen"
                  value={newExp.title} onChange={e => setNewExp({...newExp, title: e.target.value})}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Phân Môn:</label>
                  <select 
                    value={newExp.subject} onChange={e => setNewExp({...newExp, subject: e.target.value})}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="Hóa học">Hóa học</option>
                    <option value="Vật lí">Vật lí</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Khối Lớp:</label>
                  <select 
                    value={newExp.grade} onChange={e => setNewExp({...newExp, grade: e.target.value})}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                  >
                    {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Khối {g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Chương / Bài trong SGK:</label>
                <input 
                  type="text" placeholder="Ví dụ: Chương 2: Phản ứng Oxi hóa - Khử"
                  value={newExp.chapter} onChange={e => setNewExp({...newExp, chapter: e.target.value})}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Mục Đích Thí Nghiệm:</label>
                <textarea 
                  rows={2} placeholder="Mô tả mục đích..."
                  value={newExp.objective} onChange={e => setNewExp({...newExp, objective: e.target.value})}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Dụng Cụ & Hóa Chất (phân cách bằng dấu phẩy):</label>
                <input 
                  type="text" placeholder="Ống nghiệm, Đèn cồn, KMnO4, Que đốm"
                  value={newExp.equipment} onChange={e => setNewExp({...newExp, equipment: e.target.value})}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Hiện Tượng Quan Sát & Giải Thích:</label>
                <textarea 
                  rows={2} placeholder="Hiện tượng quan sát được và phương trình hóa học/định luật..."
                  value={newExp.explanation} onChange={e => setNewExp({...newExp, explanation: e.target.value})}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ background: '#334155', color: '#ccc', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
                  Hủy
                </button>
                <button type="submit" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 800, cursor: 'pointer' }}>
                  Lưu Thí Nghiệm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
