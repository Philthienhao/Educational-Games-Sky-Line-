import React, { useState, useEffect } from 'react';
import { 
  X, Upload, FileSpreadsheet, Plus, Trash2, Save, Play, 
  CheckCircle2, AlertCircle, FileText, Users, ClipboardList, 
  RotateCcw, UserPlus, Sparkles, Share2
} from 'lucide-react';
import { downloadExcelTemplate, downloadStudentListExcelTemplate } from '../utils/excel';
import { parseUploadedFile, parseStudentRosterFile } from '../utils/universalParser';
import { SoundFX } from '../utils/sound';
import { StorageService } from '../services/storage';

const DEFAULT_SAMPLE_STUDENTS = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Đức',
  'Hoàng Ngọc Ánh', 'Đỗ Thanh Hà', 'Bùi Hữu Phước', 'Ngô Hải Yến',
  'Vũ Quốc Hùng', 'Đặng Mai Phương', 'Lý Gia Hưng', 'Dương Thảo Nhi',
  'Trịnh Bảo Ngọc', 'Đoàn Anh Tuấn', 'Trương Khánh Linh', 'Hồ Thanh Thảo'
];

export function QuestionEditorModal({ 
  isOpen, 
  onClose, 
  gameTemplate, 
  currentUser, 
  onSaveAndPlay, 
  onSaveToMyGames,
  onSaveAndAssignHomework
}) {
  if (!isOpen || !gameTemplate) return null;

  const isMysteryBox = Boolean(
    gameTemplate?.engineType === 'mystery-box' ||
    gameTemplate?.id === 'mystery-gift' ||
    gameTemplate?.title === 'Hộp Quà Bí Mật'
  );

  // Determine if this game is a student picker / name race game
  const isStudentPickerGame = !isMysteryBox && Boolean(
    gameTemplate?.isStudentPicker ||
    gameTemplate?.category === 'Gọi tên và chia nhóm' ||
    gameTemplate?.category === 'Kho game gọi tên học sinh' ||
    ['duck-race', 'turtle-race', 'marble-race', 'claw-machine', 'student-group-divider', 'astronaut-explorer', 'magic-hat', 'magic-grimoire'].includes(gameTemplate?.engineType) ||
    ['duck-race-quiz', 'turtle-race-quiz', 'marble-race-quiz', 'claw-machine-quiz', 'student-group-divider-quiz', 'astronaut-quiz', 'magic-hat-quiz', 'magic-grimoire-quiz'].includes(gameTemplate?.id) ||
    ['duck-race-quiz', 'turtle-race-quiz', 'marble-race-quiz', 'claw-machine-quiz', 'student-group-divider-quiz', 'astronaut-quiz', 'magic-hat-quiz', 'magic-grimoire-quiz'].includes(gameTemplate?.baseGameId) ||
    (/đua vịt|đua rùa|đua bi|gắp thú|phi hành gia|chiếc mũ|cổ thư|chia nhóm/i.test(gameTemplate?.title || '') && !/hộp quà bí mật/i.test(gameTemplate?.title || ''))
  );

  const [title, setTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [subject, setSubject] = useState(currentUser?.subject || 'Tổng hợp');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState('');
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
      setUploadError('');
      setUploadSuccess('');

      if (isStudentPickerGame) {
        // Initialize Students List
        let initialStudents = [];
        if (Array.isArray(gameTemplate.students) && gameTemplate.students.length > 0) {
          initialStudents = gameTemplate.students.map((s, idx) => ({
            id: s.id || `st_${idx}_${Date.now()}`,
            name: typeof s === 'string' ? s : (s.name || s.studentName || ''),
            note: typeof s === 'string' ? '' : (s.note || s.teacherNotes || s.explanation || '')
          })).filter(s => s.name.trim().length > 0);
        } else if (Array.isArray(gameTemplate.studentList) && gameTemplate.studentList.length > 0) {
          initialStudents = gameTemplate.studentList.map((s, idx) => ({
            id: `st_${idx}_${Date.now()}`,
            name: typeof s === 'string' ? s : (s.name || s.studentName || ''),
            note: typeof s === 'string' ? '' : (s.note || '')
          })).filter(s => s.name.trim().length > 0);
        } else if (Array.isArray(gameTemplate.questions) && gameTemplate.questions.length > 0) {
          // If stored questions were created from student names
          const candidateStudents = gameTemplate.questions.map((q, idx) => ({
            id: q.id || `st_${idx}_${Date.now()}`,
            name: q.name || q.question || '',
            note: q.note || q.explanation || ''
          })).filter(s => s.name.trim().length > 0);

          if (candidateStudents.length > 0 && !candidateStudents[0].name.includes('Châu lục nào') && !candidateStudents[0].name.includes('Thủ đô')) {
            initialStudents = candidateStudents;
          }
        }

        // If still empty, check teacher homeroom roster
        if (initialStudents.length === 0 && currentUser?.id) {
          try {
            const hr = StorageService.getTeacherHomeroom(currentUser.id);
            if (hr && Array.isArray(hr.students) && hr.students.length > 0) {
              initialStudents = hr.students.map((s, idx) => ({
                id: s.id || `st_${idx}_${Date.now()}`,
                name: s.name || s.studentName || '',
                note: s.teacherNotes || s.note || hr.name || ''
              })).filter(s => s.name.trim().length > 0);
            }
          } catch (e) {}
        }

        // Final fallback to sample students
        if (initialStudents.length === 0) {
          initialStudents = DEFAULT_SAMPLE_STUDENTS.map((name, idx) => ({
            id: `st_${idx}_${Date.now()}`,
            name,
            note: 'Lớp 10A1'
          }));
        }

        setStudents(initialStudents);
        setBulkPasteText(initialStudents.map(s => s.name).join('\n'));
      } else {
        // Normal Quiz Game Questions
        const existingQs = gameTemplate.questions || gameTemplate.defaultQuestions || [];
        const normalizedQs = (Array.isArray(existingQs) ? existingQs : []).map((q, idx) => ({
          id: q?.id || `q_${idx}_${Date.now()}`,
          question: q?.question || q?.title || '',
          options: (Array.isArray(q?.options) && q.options.length > 0) ? [...q.options] : ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          correct: q?.correct || 'A',
          explanation: q?.explanation || ''
        }));
        setQuestions(normalizedQs);
      }
    }
  }, [gameTemplate, isStudentPickerGame, currentUser]);

  // Handle Secret Key Image File Upload (Picture Reveal)
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

  // Handle File Upload for Quiz Questions or Student Roster
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      if (isStudentPickerGame) {
        // Dedicated student roster parsing
        let parsedStudents = [];
        try {
          parsedStudents = await parseStudentRosterFile(file);
        } catch (e1) {
          // Fallback to general parser
          const res = await parseUploadedFile(file);
          if (Array.isArray(res)) {
            parsedStudents = res.map((item, idx) => ({
              id: item.id || `st_${idx}_${Date.now()}`,
              name: item.name || item.studentName || item.question || '',
              note: item.note || item.teacherNotes || item.explanation || ''
            }));
          }
        }

        if (!parsedStudents || parsedStudents.length === 0) {
          throw new Error('Không đọc được danh sách học sinh từ file đã chọn.');
        }

        const formatted = parsedStudents.map((s, idx) => ({
          id: s.id || `st_${Date.now()}_${idx}`,
          name: String(typeof s === 'string' ? s : (s.name || s.studentName || s.question || '')).trim(),
          note: String(typeof s === 'string' ? '' : (s.note || s.teacherNotes || s.explanation || '')).trim()
        })).filter(s => s.name.length > 0);

        if (formatted.length === 0) {
          throw new Error('Không tìm thấy họ và tên học sinh nào trong tệp.');
        }

        setStudents(formatted);
        setBulkPasteText(formatted.map(s => s.name).join('\n'));
        setUploadSuccess(`Đã nạp thành công ${formatted.length} học sinh từ tệp ${file.name}!`);
        SoundFX.correct();
      } else {
        // Normal Quiz Questions
        const parsedQuestions = await parseUploadedFile(file);
        if (!parsedQuestions || parsedQuestions.length === 0) {
          throw new Error('Không đọc được câu hỏi nào từ file đã chọn.');
        }
        setQuestions(parsedQuestions);
        setUploadSuccess(`Đã nhập thành công ${parsedQuestions.length} câu hỏi từ tệp ${file.name}!`);
        SoundFX.correct();
      }
    } catch (err) {
      setUploadError(err.message || 'Lỗi khi nhập file.');
      SoundFX.wrong();
    } finally {
      setIsProcessingFile(false);
      e.target.value = '';
    }
  };

  // Load from Homeroom Roster
  const handleLoadFromHomeroom = () => {
    try {
      const hr = StorageService.getTeacherHomeroom(currentUser?.id);
      if (hr && Array.isArray(hr.students) && hr.students.length > 0) {
        const hrStudents = hr.students.map((s, idx) => ({
          id: s.id || `st_${Date.now()}_${idx}`,
          name: String(s.name || s.studentName || '').trim(),
          note: String(s.teacherNotes || s.note || hr.name || '').trim()
        })).filter(s => s.name.length > 0);

        if (hrStudents.length > 0) {
          setStudents(hrStudents);
          setBulkPasteText(hrStudents.map(s => s.name).join('\n'));
          setUploadSuccess(`Đã nạp thành công ${hrStudents.length} học sinh từ Lớp Chủ Nhiệm (${hr.name || 'Lớp của bạn'})!`);
          SoundFX.correct();
          return;
        }
      }
      alert('Chưa có học sinh nào trong Lớp Chủ Nhiệm! Thầy cô vui lòng vào mục "Lớp Chủ Nhiệm" để thêm danh sách lớp trước.');
    } catch (e) {
      alert('Không thể nạp danh sách từ Lớp Chủ Nhiệm: ' + e.message);
    }
  };

  // Student Operations
  const handleAddStudent = () => {
    const newStudent = {
      id: `st_${Date.now()}_${students.length + 1}`,
      name: '',
      note: ''
    };
    setStudents([...students, newStudent]);
    SoundFX.click();
  };

  const handleUpdateStudent = (index, field, value) => {
    const updated = [...students];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setStudents(updated);
    }
  };

  const handleDeleteStudent = (index) => {
    const updated = students.filter((_, idx) => idx !== index);
    setStudents(updated);
    SoundFX.click();
  };

  const handleClearAllStudents = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả học sinh trong danh sách hiện tại không?')) {
      setStudents([]);
      SoundFX.click();
    }
  };

  const handleApplyBulkPaste = () => {
    const lines = bulkPasteText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      alert('Vui lòng nhập hoặc dán ít nhất 1 tên học sinh.');
      return;
    }
    const newStudents = lines.map((line, idx) => {
      let name = line.replace(/^\d+[\.\:\)\-]\s*/, '').trim();
      let note = '';
      if (name.includes(' - ')) {
        const parts = name.split(' - ');
        name = parts[0].trim();
        note = parts.slice(1).join(' - ').trim();
      } else if (name.includes('\t')) {
        const parts = name.split('\t');
        name = parts[0].trim();
        note = parts.slice(1).join(' ').trim();
      }
      return {
        id: `st_${Date.now()}_${idx}`,
        name: name,
        note: note
      };
    }).filter(s => s.name.length > 0);

    setStudents(newStudents);
    setShowBulkPasteModal(false);
    setUploadSuccess(`Đã cập nhật danh sách ${newStudents.length} học sinh từ văn bản dán nhanh!`);
    SoundFX.correct();
  };

  // Question Operations (for Normal Quiz Games)
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

  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleUpdateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    if (!updated[qIndex]) return;
    if (!Array.isArray(updated[qIndex].options)) {
      updated[qIndex].options = ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'];
    }
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
    SoundFX.click();
  };

  // Package Data for Saving / Playing
  const getCustomGameData = () => {
    const effectiveTitle = title || gameTemplate?.title || lessonTitle || (isStudentPickerGame ? 'Đua Vịt Gọi Tên' : 'Bài Game Cá Nhân');
    const effectiveLesson = lessonTitle || title || gameTemplate?.title || 'Bài Game Cá Nhân';
    const isAlreadySaved = gameTemplate?.isSaved || gameTemplate?.isSavedGame || (typeof gameTemplate?.id === 'string' && gameTemplate.id.startsWith('saved_'));

    // Resolve Engine Type
    const rawTitle = (title || gameTemplate?.title || lessonTitle || '').toLowerCase();
    const rawId = (gameTemplate?.baseGameId || gameTemplate?.id || '').toLowerCase();
    let effectiveEngineType = gameTemplate?.engineType;

    if (rawTitle.includes('bắt chước')) effectiveEngineType = 'pose-imitation';
    else if (rawTitle.includes('nghiêng đầu')) effectiveEngineType = 'head-tilt';
    else if (rawTitle.includes('diệt muỗi') || rawTitle.includes('đập muỗi') || rawTitle.includes('muỗi') || rawId.includes('mosquito')) effectiveEngineType = 'mosquito-slayer';
    else if (rawTitle.includes('kéo co đôi') || rawTitle.includes('kéo co kiến thức')) effectiveEngineType = 'tug-of-war-dual';
    else if (rawTitle.includes('kéo co')) effectiveEngineType = 'tug-of-war';
    else if (rawTitle.includes('triệu phú')) effectiveEngineType = 'millionaire';
    else if (rawTitle.includes('hộp quà')) effectiveEngineType = 'mystery-box';
    else if (rawTitle.includes('mảnh ghép') || rawTitle.includes('bức ảnh')) effectiveEngineType = 'picture-reveal';
    else if (rawTitle.includes('ô chữ')) effectiveEngineType = 'crossword';
    else if (rawTitle.includes('đoàn tàu') || rawTitle.includes('tàu hỏa')) effectiveEngineType = 'train';
    else if (rawTitle.includes('flashcard') || rawTitle.includes('thẻ ghi nhớ')) effectiveEngineType = 'flashcard';
    else if (rawTitle.includes('chém hoa quả') || rawTitle.includes('trái cây')) effectiveEngineType = 'fruit-ninja';
    else if (rawTitle.includes('đua xe')) effectiveEngineType = 'car-race';
    else if (rawTitle.includes('dò mìn')) effectiveEngineType = 'minesweeper';
    else if (rawTitle.includes('từ bay') || rawTitle.includes('từ ngữ biết bay')) effectiveEngineType = 'flying-words';
    else if (rawTitle.includes('nối ý') || rawTitle.includes('ghép cặp')) effectiveEngineType = 'matching-pairs';
    else if (rawTitle.includes('đua vịt')) effectiveEngineType = 'duck-race';
    else if (rawTitle.includes('đua rùa')) effectiveEngineType = 'turtle-race';
    else if (rawTitle.includes('gắp thú') || rawId.includes('claw-machine')) effectiveEngineType = 'claw-machine';
    else if (rawTitle.includes('phi hành gia') || rawId.includes('astronaut')) effectiveEngineType = 'astronaut-explorer';
    else if (rawTitle.includes('chiếc mũ') || rawId.includes('magic-hat')) effectiveEngineType = 'magic-hat';
    else if (rawTitle.includes('cổ thư') || rawId.includes('magic-grimoire')) effectiveEngineType = 'magic-grimoire';
    else if (rawTitle.includes('chia nhóm') || rawId.includes('student-group-divider')) effectiveEngineType = 'student-group-divider';
    else if (rawTitle.includes('đua bi') || rawId.includes('marble-race')) effectiveEngineType = 'marble-race';
    else if (rawTitle.includes('rừng xanh')) effectiveEngineType = 'jungle-rescue';
    else if (rawTitle.includes('jeopardy')) effectiveEngineType = 'jeopardy';
    else if (!effectiveEngineType) effectiveEngineType = 'wheel';

    if (isStudentPickerGame) {
      const cleanStudents = (students && students.length > 0 ? students : []).map((s, idx) => ({
        id: s.id || `st_${idx}_${Date.now()}`,
        name: String(s.name || '').trim() || `Học sinh ${idx + 1}`,
        note: String(s.note || '').trim()
      })).filter(s => s.name.length > 0);

      const cleanStudentList = cleanStudents.map(s => s.name);

      // Backwards compatibility fallback questions
      const fallbackQuestions = cleanStudents.map((s, idx) => ({
        id: `q_${idx}_${s.id}`,
        question: s.name,
        name: s.name,
        options: ['Có mặt', 'Vắng mặt', '', ''],
        correct: 'A',
        explanation: s.note || ''
      }));

      return {
        id: isAlreadySaved ? gameTemplate.id : `saved_${Date.now()}`,
        userId: currentUser?.id || 'user_admin',
        username: currentUser?.username || 'ThayHao',
        baseGameId: gameTemplate?.baseGameId || gameTemplate?.id || effectiveEngineType,
        title: effectiveTitle,
        lessonTitle: effectiveLesson,
        subject: subject || 'Chủ nhiệm & Gọi tên',
        gradient: gameTemplate?.gradient || 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        icon: gameTemplate?.icon || '🦆',
        engineType: effectiveEngineType,
        description: description || gameTemplate?.description || '',
        students: cleanStudents,
        studentList: cleanStudentList,
        questions: fallbackQuestions,
        isStudentPicker: true,
        category: 'Gọi tên và chia nhóm',
        updatedAt: new Date().toISOString().split('T')[0]
      };
    }

    // Normal Quiz Game Payload
    return {
      id: isAlreadySaved ? gameTemplate.id : `saved_${Date.now()}`,
      userId: currentUser?.id || 'user_admin',
      username: currentUser?.username || 'ThayHao',
      baseGameId: gameTemplate?.baseGameId || gameTemplate?.id || effectiveEngineType,
      title: effectiveTitle,
      lessonTitle: effectiveLesson,
      subject: subject || 'Địa Lí',
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
    if (isStudentPickerGame) {
      const validStudents = students.filter(s => s.name && s.name.trim().length > 0);
      if (validStudents.length === 0) {
        alert('Vui lòng thêm ít nhất 1 học sinh tham gia trò chơi.');
        return;
      }
    } else {
      const finalQs = (questions && questions.length > 0) ? questions : (gameTemplate?.questions || []);
      if (!finalQs || finalQs.length === 0) {
        alert('Vui lòng nhập tệp Excel hoặc thêm ít nhất 1 câu hỏi.');
        return;
      }
    }
    const data = getCustomGameData();
    if (onSaveToMyGames) onSaveToMyGames(data);
    try { SoundFX.correct(); } catch(e) {}
    if (onClose) onClose();
  };

  const handleSaveAndPlayClick = () => {
    if (isStudentPickerGame) {
      const validStudents = students.filter(s => s.name && s.name.trim().length > 0);
      if (validStudents.length === 0) {
        alert('Vui lòng thêm ít nhất 1 học sinh tham gia trò chơi.');
        return;
      }
    } else {
      const finalQs = (questions && questions.length > 0) ? questions : (gameTemplate?.questions || []);
      if (!finalQs || finalQs.length === 0) {
        alert('Vui lòng nhập tệp Excel hoặc thêm ít nhất 1 câu hỏi.');
        return;
      }
    }
    const data = getCustomGameData();
    if (onSaveAndPlay) onSaveAndPlay(data);
    try { SoundFX.fanfare(); } catch(e) {}
    if (onClose) onClose();
  };

  const handleSaveAndAssignHomework = () => {
    if (isStudentPickerGame) {
      const validStudents = students.filter(s => s.name && s.name.trim().length > 0);
      if (validStudents.length === 0) {
        alert('Vui lòng thêm ít nhất 1 học sinh tham gia trò chơi.');
        return;
      }
    } else {
      const finalQs = (questions && questions.length > 0) ? questions : (gameTemplate?.questions || []);
      if (!finalQs || finalQs.length === 0) {
        alert('Vui lòng nhập tệp Excel hoặc thêm ít nhất 1 câu hỏi trước khi giao bài.');
        return;
      }
    }
    const data = getCustomGameData();
    if (onSaveAndAssignHomework) {
      onSaveAndAssignHomework(data);
    } else if (onSaveToMyGames) {
      onSaveToMyGames(data);
    }
    try { SoundFX.correct(); } catch(e) {}
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
            <div style={{ fontSize: '2rem' }}>{gameTemplate.icon || (isStudentPickerGame ? '🦆' : '🎮')}</div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>
                {isStudentPickerGame ? 'Tùy Biến Danh Sách Học Sinh: ' : 'Tùy Biến Nội Dung Game: '}
                <span style={{ color: isStudentPickerGame ? '#0284c7' : '#8b5cf6' }}>{gameTemplate.title}</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                {isStudentPickerGame 
                  ? 'Nạp danh sách học sinh từ file Excel mẫu, lấy từ Lớp Chủ Nhiệm hoặc nhập thủ công.'
                  : 'Nhập file Excel mẫu hoặc tự thiết kế chi tiết các câu hỏi bên dưới.'}
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
                {isStudentPickerGame ? 'Tên Trò Chơi / Tiêu Đề Bài Đua:' : 'Tên Bài Kiểm Tra / Tên Game Cá Nhân:'}
              </label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isStudentPickerGame ? "VD: Đua Vịt Lớp 10A1 - Học Sinh May Mắn" : "VD: Kiểm Tra Kéo Co - Châu Âu 7"}
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
                {isStudentPickerGame ? 'Lớp / Phân Loại:' : 'Môn Học / Chủ Đề:'}
              </label>
              <input 
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isStudentPickerGame ? "VD: Lớp 10A1" : "VD: Địa lí 7"}
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
          <div style={{ background: 'rgba(13, 148, 136, 0.1)', padding: '14px 18px', borderRadius: '16px', border: '1.5px solid rgba(94, 234, 212, 0.35)' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#5eead4', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              📖 {isStudentPickerGame ? 'Ghi Chú Hoạt Động / Tiết Học:' : 'Tên Bài Học / Chủ Đề Game (Giúp Giáo Viên Tìm Kiếm Dễ Dàng):'}
            </label>
            <input 
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder={isStudentPickerGame ? "VD: Tiết sinh hoạt đầu tuần, Khởi động bài mới, Gọi tên nhận thưởng..." : "VD: Kiến thức Châu Âu trong Địa lí 7, Ôn tập giữa kỳ 1..."}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1.5px solid rgba(94, 234, 212, 0.5)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 600,
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
            background: isStudentPickerGame ? 'rgba(2, 132, 199, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            border: isStudentPickerGame ? '1.5px solid rgba(2, 132, 199, 0.25)' : '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isStudentPickerGame ? '📥 Nhập Danh Sách Học Sinh Từ File Excel' : '📊 Nhập File Mẫu Excel Có Sẵn'}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                {isStudentPickerGame 
                  ? 'Tải file mẫu Excel danh sách học sinh (cột Họ và tên học sinh & Ghi chú/Nhóm).'
                  : 'Nạp tệp câu hỏi mẫu dạng file Excel (.xlsx) đã soạn sẵn.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (isStudentPickerGame) {
                    downloadStudentListExcelTemplate('Mau_Danh_Sach_Hoc_Sinh_Dua_Vit_Dua_Rua');
                  } else {
                    downloadExcelTemplate(gameTemplate.title, gameTemplate.engineType);
                  }
                }}
                style={{ fontWeight: 700 }}
              >
                <FileSpreadsheet size={16} /> Tải File Excel Mẫu
              </button>

              <label className="btn btn-success btn-sm" style={{ cursor: 'pointer', fontWeight: 700 }}>
                <Upload size={16} />
                {isProcessingFile ? 'Đang Đọc File...' : (isStudentPickerGame ? 'Nhập Từ File Excel' : 'Nhập Từ File Excel')}
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv, .docx, .doc, .txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {isStudentPickerGame && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleLoadFromHomeroom}
                  style={{ fontWeight: 700, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                >
                  <Users size={16} /> Lấy Từ Lớp Chủ Nhiệm
                </button>
              )}
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

          {/* Quick Bulk Paste Section for Student Picker Games */}
          {isStudentPickerGame && showBulkPasteModal && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1.5px solid #0284c7',
              borderRadius: '16px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '0.95rem', fontWeight: 800 }}>
                  📋 Dán Nhanh Danh Sách Học Sinh (Mỗi học sinh một dòng)
                </h4>
                <button
                  type="button"
                  onClick={() => setShowBulkPasteModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                Thầy cô có thể sao chép cột họ tên từ Zalo, Word, Excel và dán trực tiếp vào ô bên dưới:
              </p>
              <textarea
                rows={6}
                value={bulkPasteText}
                onChange={(e) => setBulkPasteText(e.target.value)}
                placeholder="Nguyễn Văn An&#10;Trần Thị Bình&#10;Lê Hoàng Cường - Nhóm 1..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowBulkPasteModal(false)}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={handleApplyBulkPaste}
                  style={{ fontWeight: 800 }}
                >
                  ✓ Áp Dụng Danh Sách
                </button>
              </div>
            </div>
          )}

          {/* Student Roster Table for Student Picker Games */}
          {isStudentPickerGame ? (
            <div id="student-roster-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>
                    👥 Danh Sách Học Sinh Tham Gia ({students.length} em):
                  </h3>
                  <span style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8', fontWeight: 700 }}>
                    Game Gọi Tên / Đua Top
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowBulkPasteModal(!showBulkPasteModal)}
                    style={{ fontWeight: 700 }}
                  >
                    <ClipboardList size={16} /> Dán Nhanh
                  </button>

                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddStudent}
                    style={{ fontWeight: 700 }}
                  >
                    <UserPlus size={16} /> + Thêm Học Sinh
                  </button>

                  {students.length > 0 && (
                    <button 
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={handleClearAllStudents}
                      style={{ padding: '6px 12px' }}
                      title="Xóa tất cả danh sách"
                    >
                      <Trash2 size={15} /> Xóa Tất Cả
                    </button>
                  )}
                </div>
              </div>

              {students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.15)', color: 'var(--text-muted)' }}>
                  <p style={{ margin: '0 0 14px 0', fontSize: '0.95rem' }}>
                    Chưa có học sinh nào trong danh sách. Thầy cô có thể:
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleLoadFromHomeroom}>
                      <Users size={15} /> Lấy Từ Lớp Chủ Nhiệm
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowBulkPasteModal(true)}>
                      <ClipboardList size={15} /> Dán Nhanh Danh Sách
                    </button>
                    <button type="button" className="btn btn-success btn-sm" onClick={handleAddStudent}>
                      <UserPlus size={15} /> Thêm Thủ Công
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '420px',
                  overflowY: 'auto',
                  paddingRight: '6px'
                }}>
                  {students.map((student, sIndex) => (
                    <div 
                      key={student.id || sIndex}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        display: 'grid',
                        gridTemplateColumns: '46px 1fr 180px 40px',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Index Badge */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(2, 132, 199, 0.25)',
                        border: '1.5px solid #0284c7',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.85rem'
                      }}>
                        {sIndex + 1}
                      </div>

                      {/* Student Name Input */}
                      <div>
                        <input
                          type="text"
                          value={student.name}
                          onChange={(e) => handleUpdateStudent(sIndex, 'name', e.target.value)}
                          placeholder="Nhập họ và tên học sinh..."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Student Note / Group / Class Input */}
                      <div>
                        <input
                          type="text"
                          value={student.note}
                          onChange={(e) => handleUpdateStudent(sIndex, 'note', e.target.value)}
                          placeholder="Ghi chú / Nhóm / Lớp..."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(sIndex)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          borderRadius: '8px',
                          width: '34px',
                          height: '34px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Xóa học sinh này"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Interactive Questions Table / Editor for Normal Quiz Games */
            <div id="questions-list-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>
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
                              value={(q && Array.isArray(q.options) && q.options[optIndex]) || ''}
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
          )}

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

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button 
              type="button"
              className="btn btn-primary"
              onClick={handleSaveOnly}
              style={{ fontWeight: 700 }}
            >
              <Save size={16} /> Lưu Vào Kho Game
            </button>

            <button 
              type="button"
              className="btn"
              onClick={handleSaveAndAssignHomework}
              style={{ 
                fontWeight: 900, 
                padding: '9px 18px', 
                background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)',
                cursor: 'pointer'
              }}
              title="Lưu game vào kho của tôi và mở link giao bài tập về nhà cho học sinh"
            >
              <Share2 size={16} />
              <span>🚀 Lưu & Giao Bài Về Nhà (Gửi Link)</span>
            </button>

            <button 
              type="button"
              className="btn btn-success"
              onClick={handleSaveAndPlayClick}
              style={{ 
                fontWeight: 900, 
                padding: '9px 20px', 
                background: isStudentPickerGame ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
              }}
            >
              <Play size={16} /> Bắt Đầu Chơi Ngay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
