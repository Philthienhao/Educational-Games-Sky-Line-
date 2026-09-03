import React, { useState, useMemo } from 'react';
import { BookOpen, Download, Search, FileText, ExternalLink, ShieldCheck, Filter, ChevronDown, CheckCircle2, RefreshCw, Eye, X, Copy, Sparkles, AlertTriangle, CloudDownload, HardDrive } from 'lucide-react';
import catalogData from '../services/textbookCatalog.json';

const GOOGLE_DRIVE_FOLDER_ID = '1pCBvcvkADMVeaNWGMylxwQTToYC9PJHZ';
const GOOGLE_DRIVE_SGK_FOLDER_URL = `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_FOLDER_ID}?usp=sharing`;

// Precise Mapping of Google Drive Subfolders per Grade
const GRADE_DRIVE_MAP = {
  'Lớp 1': 'https://drive.google.com/drive/folders/1t7QCCHv9xJzbzKdV5CoOaA2HvhRXg-_T?usp=sharing',
  'Lớp 2': 'https://drive.google.com/drive/folders/1mUSvtBMbYuXSKGR3RqEbWoPal5JJWVxU?usp=drive_link',
  'Lớp 3': 'https://drive.google.com/drive/folders/11Lr_jl5nzuK1EcfNiuazyfogtpvWJ8Qg?usp=drive_link',
  'Lớp 4': 'https://drive.google.com/drive/folders/1aWzIbl0QPwqEa2hhtvJYATP0jbmYMp5u?usp=drive_link',
  'Lớp 5': 'https://drive.google.com/drive/folders/1CIslwprisxLPC-pBedobkFCIUBC6mo4T?usp=drive_link',
  'Lớp 6': 'https://drive.google.com/drive/folders/1Mk7HPTSNA6LZX9yOxtbZ7TxGfi_XGWWU?usp=drive_link',
  'Lớp 7': 'https://drive.google.com/drive/folders/1rM0fYj9LigMti5uiEw9CHAJPo_aAMFUN?usp=drive_link',
  'Lớp 8': 'https://drive.google.com/drive/folders/1YvXTp-toRQPCQuaOM5IaLoTGwXEGr0LD?usp=sharing',
  'Lớp 9': 'https://drive.google.com/drive/folders/1mP_ghFKk1xJbYNtFErxUx6p3om-QUFEp?usp=drive_link',
  'Lớp 10': 'https://drive.google.com/drive/folders/1gH2TzpVfKvarKinKpNXwjookea58t6Cn?usp=drive_link',
  'Lớp 11': 'https://drive.google.com/drive/folders/1cmNZ6GWsjbWRhjfsAPJFXoyHBehCzlNj?usp=drive_link',
  'Lớp 12': 'https://drive.google.com/drive/folders/1zbW3nydN65mavsdP2mGz3jGVR0vNH8rO?usp=drive_link',
};

export function TextbookDownloadManager({ searchTerm = '' }) {
  const [selectedGrade, setSelectedGrade] = useState('Tất cả');
  const [selectedSubject, setSelectedSubject] = useState('Tất cả các môn');
  const [localSearch, setLocalSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  
  // Active Book for Digital Reader Modal
  const [readingBook, setReadingBook] = useState(null);
  const [readerText, setReaderText] = useState('');
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [readerSearch, setReaderSearch] = useState('');

  // Toast Notification for Drive Download
  const [toastMessage, setToastMessage] = useState(null);

  // Helper to resolve direct Grade Drive link
  const getDriveUrlForBook = (book) => {
    const normGrade = (book.grade || '').normalize('NFC').trim();
    if (GRADE_DRIVE_MAP[normGrade]) {
      return GRADE_DRIVE_MAP[normGrade];
    }
    const match = normGrade.match(/\d+/);
    if (match) {
      const key = `Lớp ${match[0]}`;
      if (GRADE_DRIVE_MAP[key]) return GRADE_DRIVE_MAP[key];
    }
    return GOOGLE_DRIVE_SGK_FOLDER_URL;
  };

  // Extract unique grades list sorted logically 1-12
  const gradesList = useMemo(() => {
    const set = new Set();
    catalogData.forEach(item => {
      if (item.grade && item.grade !== 'Sách Khác') {
        set.add(item.grade.normalize('NFC'));
      }
    });

    const sorted = Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 99;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 99;
      return numA - numB;
    });

    return ['Tất cả', ...sorted];
  }, []);

  // Helper to infer clear subject name from title — supports all 3 naming formats in catalog:
  // 1. Vietnamese with diacritics: "Địa Lý 10", "Ngữ Văn 12"
  // 2. Slug/hyphenated: "dia-ly-10", "ngu-van-6-tap-1"
  // 3. Plain unaccented/abbreviated: "Dia ly 10", "VL 10 KNTT", "GD KT-PL 10", "gdtc-8"
  const getSubjectName = (item) => {
    const raw = (item.title || item.subject || '').normalize('NFC');
    const t = raw.toLowerCase();

    // --- COMBINED: Lịch Sử & Địa Lý ---
    if (
      t.includes('lịch sử và địa lí') || t.includes('lịch sử và địa lý') ||
      t.includes('lich su va dia li') || t.includes('lich su va dia ly') ||
      t.includes('lich-su-va-dia-li') || t.includes('lich-su-va-dia-ly') ||
      t.includes('lich_su_va_dia_li') || t.includes('lich_su_va_dia_ly') ||
      t.includes('lich-su-dia-li') || t.includes('lich_su_dia_li') || t.includes('lich su dia li') ||
      t.includes('lich-su-dia-ly') || t.includes('lich_su_dia_ly') || t.includes('lich su dia ly')
    ) return 'Lịch Sử & Địa Lý';

    // --- COMBINED: Tự Nhiên & Xã Hội ---
    if (
      t.includes('tự nhiên và xã hội') || t.includes('tu nhien va xa hoi') ||
      t.includes('tu-nhien-va-xa-hoi') || t.includes('tu_nhien_va_xa_hoi') ||
      t.includes('tnxh')
    ) return 'Tự Nhiên & Xã Hội';

    // --- Khoa Học Tự Nhiên ---
    if (
      t.includes('khoa học tự nhiên') || t.includes('khoa hoc tu nhien') ||
      t.includes('khoa-hoc-tu-nhien') || t.includes('khoa_hoc_tu_nhien') || t.includes('khtn')
    ) return 'Khoa Học Tự Nhiên';

    // --- Địa Lý ---
    if (
      t.includes('địa lí') || t.includes('địa lý') ||
      t.includes('dia li') || t.includes('dia ly') ||
      t.includes('dia-li') || t.includes('dia-ly') ||
      t.includes('dia_li') || t.includes('dia_ly')
    ) return 'Địa Lý';

    // --- Lịch Sử ---
    if (
      t.includes('lịch sử') || t.includes('lich su') ||
      t.includes('lich-su') || t.includes('lich_su')
    ) return 'Lịch Sử';

    // --- GD Kinh Tế & Pháp Luật ---
    if (
      t.includes('kinh tế') || t.includes('kinh te') || t.includes('gdkt') || t.includes('kt-pl') || t.includes('kt_pl') ||
      t.includes('pháp luật') || t.includes('phap luat') ||
      t.includes('kinh-te') || t.includes('kinh_te') ||
      t.includes('phap-luat') || t.includes('phap_luat')
    ) return 'GD Kinh Tế & Pháp Luật';

    // --- Đạo Đức / GDCD ---
    if (
      t.includes('đạo đức') || t.includes('dao duc') || t.includes('gdcd') ||
      t.includes('công dân') || t.includes('cong dan') ||
      t.includes('dao-duc') || t.includes('dao_duc') ||
      t.includes('giao duc cong dan') ||
      t.includes('giao-duc-cong-dan') || t.includes('giao_duc_cong_dan')
    ) return 'Đạo Đức / GDCD';

    // --- Ngữ Văn / Tiếng Việt ---
    if (
      t.includes('ngữ văn') || t.includes('tiếng việt') || t.includes('tập viết') ||
      t.includes('ngu van') || t.includes('tieng viet') || t.includes('tap viet') ||
      t.includes('ngu-van') || t.includes('ngu_van') ||
      t.includes('tieng-viet') || t.includes('tieng_viet') ||
      t.includes('tap-viet') || t.includes('tap_viet') ||
      t.includes('tap_doc') || t.includes('vobaitap') || t.includes('vbt')
    ) return 'Ngữ Văn / Tiếng Việt';

    // --- Tiếng Anh ---
    if (
      t.includes('tiếng anh') || t.includes('english') || t.includes('global success') ||
      t.includes('tieng anh') || t.includes('tieng-anh') || t.includes('tieng_anh') ||
      t.includes('shs-tieng') || t.includes('shs_tieng') || t.includes('shs tieng')
    ) return 'Tiếng Anh';

    // --- Vật Lý ---
    if (
      t.includes('vật lí') || t.includes('vật lý') ||
      t.includes('vat li') || t.includes('vat ly') ||
      t.includes('vat-li') || t.includes('vat_li') ||
      t.includes('vat-ly') || t.includes('vat_ly') ||
      t.includes('sgk vl') || t.includes('vl 10') || t.includes('vl 11') || t.includes('vl 12')
    ) return 'Vật Lý';

    // --- Hóa Học ---
    if (
      t.includes('hóa') || t.includes('hoá') ||
      t.includes('hoa hoc') || t.includes('hoa-hoc') || t.includes('hoa_hoc')
    ) return 'Hóa Học';

    // --- Sinh Học ---
    if (
      t.includes('sinh học') || t.includes('sinh hoc') ||
      t.includes('sinh-hoc') || t.includes('sinh_hoc') ||
      t.includes('sinh 10') || t.includes('sinh 11') || t.includes('sinh 12')
    ) return 'Sinh Học';

    // --- Tin Học ---
    if (
      t.includes('tin học') || t.includes('tin hoc') ||
      t.includes('tin-hoc') || t.includes('tin_hoc') ||
      t.includes('tin 10') || t.includes('tin 11') || t.includes('tin 12')
    ) return 'Tin Học';

    // --- Âm Nhạc ---
    if (
      t.includes('âm nhạc') || t.includes('am nhac') ||
      t.includes('am-nhac') || t.includes('am_nhac')
    ) return 'Âm Nhạc';

    // --- Mỹ Thuật ---
    if (
      t.includes('mĩ thuật') || t.includes('mỹ thuật') ||
      t.includes('mi thuat') || t.includes('my thuat') ||
      t.includes('mi-thuat') || t.includes('mi_thuat') ||
      t.includes('my-thuat') || t.includes('my_thuat')
    ) return 'Mỹ Thuật';

    // --- Hoạt Động Trải Nghiệm ---
    if (
      t.includes('trải nghiệm') || t.includes('trai nghiem') || t.includes('hđtn') || t.includes('hdtn') ||
      t.includes('hoat dong trai nghiem') ||
      t.includes('hoat-dong-trai-nghiem') || t.includes('hoat_dong_trai_nghiem')
    ) return 'Hoạt Động Trải Nghiệm';

    // --- Giáo Dục Thể Chất ---
    if (
      t.includes('thể chất') || t.includes('the chat') || t.includes('gdtc') ||
      t.includes('the-chat') || t.includes('the_chat') ||
      t.includes('giao duc the chat') ||
      t.includes('giao-duc-the-chat') || t.includes('giao_duc_the_chat')
    ) return 'Giáo Dục Thể Chất';

    // --- GD Quốc Phòng - An Ninh ---
    if (
      t.includes('quốc phòng') || t.includes('quoc phong') || t.includes('gdqp') ||
      t.includes('quoc-phong') || t.includes('quoc_phong')
    ) return 'GD Quốc Phòng - An Ninh';

    // --- Công Nghệ ---
    if (
      t.includes('công nghệ') || t.includes('cong nghe') ||
      t.includes('cong-nghe') || t.includes('cong_nghe')
    ) return 'Công Nghệ';

    // --- Toán Học ---
    if (
      t.includes('toán') || t.includes('toan')
    ) return 'Toán Học';

    // --- Khoa Học ---
    if (
      t.includes('khoa học') || t.includes('khoa hoc') ||
      t.includes('khoa-hoc') || t.includes('khoa_hoc')
    ) return 'Khoa Học';

    return 'SGK Khác';
  };

  // Dynamically extract available subjects based on selected grade
  const availableSubjectsList = useMemo(() => {
    const set = new Set();
    catalogData.forEach(item => {
      if (!item.fileName || item.fileName.endsWith('.txt')) return;
      
      const normGrade = (item.grade || '').normalize('NFC');
      if (selectedGrade !== 'Tất cả' && normGrade !== selectedGrade) {
        return;
      }
      
      const subj = getSubjectName(item);
      if (subj) set.add(subj);
    });

    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
    return ['Tất cả các môn', ...sorted];
  }, [selectedGrade]);

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
    setSelectedSubject('Tất cả các môn');
  };

  // Filter books based on active dropdown & search criteria
  const filteredBooks = useMemo(() => {
    const query = (localSearch || searchTerm).trim().normalize('NFC').toLowerCase();

    return catalogData.filter(item => {
      if (!item.fileName || item.fileName.endsWith('.txt')) return false;

      const normGrade = (item.grade || '').normalize('NFC');

      if (selectedGrade !== 'Tất cả' && normGrade !== selectedGrade) {
        return false;
      }

      const inferredSubject = getSubjectName(item);
      if (selectedSubject !== 'Tất cả các môn' && inferredSubject !== selectedSubject) {
        return false;
      }

      if (query) {
        const titleMatch = (item.title || '').normalize('NFC').toLowerCase().includes(query);
        const gradeMatch = normGrade.toLowerCase().includes(query);
        const subjectMatch = inferredSubject.toLowerCase().includes(query);
        return titleMatch || gradeMatch || subjectMatch;
      }

      return true;
    });
  }, [selectedGrade, selectedSubject, localSearch, searchTerm]);

  // Bulletproof PDF File Download Handler (Direct Access to Specific Grade Google Drive Subfolder)
  const handleDownloadPdf = async (book) => {
    const fileId = book.id || book.fileName;
    const targetDriveUrl = getDriveUrlForBook(book);
    const gradeName = book.grade || 'Lớp';

    try {
      setDownloadingId(fileId);
      const cleanFileName = (book.fileName || '').trim();
      const pdfUrl = `/textbooks/${cleanFileName}`;
      
      // Try local PDF download first if running on local server
      const response = await fetch(pdfUrl, { method: 'HEAD' });
      if (response.ok) {
        const link = document.createElement('a');
        link.href = pdfUrl;
        const safeTitle = (book.title || 'Sach_Giao_Khoa')
          .normalize('NFC')
          .replace(/[/\\?%*:|"<>]/g, '_');
        
        link.download = safeTitle.endsWith('.pdf') ? safeTitle : `${safeTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Show toast guidance & open direct Google Drive grade subfolder
      setToastMessage(`📂 Đang mở thư mục Google Drive [${gradeName}]. Thầy cô chọn tệp [${book.title}] để tải về.`);
      setTimeout(() => setToastMessage(null), 5000);

      window.open(targetDriveUrl, '_blank');

    } catch (err) {
      window.open(targetDriveUrl, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  // Open In-App Reader Modal for Online Reading
  const handleOpenReader = async (book) => {
    setReadingBook(book);
    setIsLoadingText(true);
    setReaderText('');
    setReaderSearch('');

    if (book.textPath) {
      try {
        const res = await fetch(book.textPath);
        if (res.ok) {
          const txt = await res.text();
          setReaderText(txt);
        } else {
          setReaderText('Nội dung cuốn sách đang được cập nhật...');
        }
      } catch (e) {
        setReaderText('Nội dung cuốn sách đang được cập nhật...');
      }
    } else {
      setReaderText('Nội dung cuốn sách đang được cập nhật...');
    }
    setIsLoadingText(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0d9488',
          color: '#ffffff',
          padding: '14px 24px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          fontWeight: 800,
          fontSize: '0.92rem',
          zIndex: 5000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={20} color="#5eead4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #0284c7 100%)',
        borderRadius: '24px',
        padding: '28px 32px',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(13, 148, 136, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '12px' }}>
            <ShieldCheck size={16} /> THƯ VIỆN SÁCH GIÁO KHOA CHUẨN ĐỊNH DẠNG PDF GỐC
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
            📚 Kho Tải Sách Giáo Khoa Nguyên Bản (PDF Gốc Theo Lớp)
          </h2>
          <p style={{ fontSize: '0.92rem', opacity: 0.95, lineHeight: 1.5, marginBottom: '16px' }}>
            Tải về đầy đủ 203 cuốn Sách Giáo Khoa chuẩn định dạng tệp PDF gốc (.pdf) nguyên bản của NXB Giáo Dục Việt Nam. Mở trực tiếp thư mục chuẩn của từng Khối Lớp trong Google Drive.
          </p>

          <a
            href={GOOGLE_DRIVE_SGK_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              color: '#0d9488',
              padding: '12px 24px',
              borderRadius: '16px',
              fontWeight: 900,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              transition: 'all 0.2s'
            }}
          >
            <CloudDownload size={20} color="#0d9488" /> ☁️ Mở Thư Mục Google Drive Kho Sách Gốc Tổng
          </a>
        </div>

        <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.15)', padding: '16px 24px', borderRadius: '20px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{catalogData.filter(b => b.fileName && !b.fileName.endsWith('.txt')).length}</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9, fontWeight: 700 }}>Tệp PDF Gốc</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>12</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9, fontWeight: 700 }}>Khối Lớp (Lớp 1 - 12)</div>
          </div>
        </div>
      </div>

      {/* Cloud Notice Alert Banner */}
      <div style={{
        background: '#ecfdf5',
        border: '1.5px solid #a7f3d0',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.88rem',
        color: '#065f46',
        fontWeight: 700
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0 }} />
          <div>
            ✨ <strong>Đã Đấu Nối 12 Thư Mục Google Drive Theo Lớp:</strong> Bấm <strong>"Tải File PDF Gốc (.pdf)"</strong> ở cuốn sách nào thì ứng dụng sẽ tự động chuyển hướng đến <strong>đúng thư mục của Khối Lớp đó</strong> (Ví dụ: `SGK_lop_1`, `SGK_lop_2`... `SGK_lop_12`)!
          </div>
        </div>
      </div>

      {/* Interactive Filter Toolbar & Dropdowns */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
        border: '1.5px solid #ccfbf1',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* Row 1: Search Box & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={18} color="#0d9488" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Nhập tên cuốn sách (VD: Toán 1, Địa Lí 10, Tiếng Anh, Tiếng Việt...)"
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                borderRadius: '14px',
                border: '2px solid #0d9488',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.95rem',
                fontWeight: 700,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488', background: '#ccfbf1', padding: '8px 16px', borderRadius: '12px' }}>
            Hiển thị {filteredBooks.length} cuốn sách
          </div>
        </div>

        {/* Row 2: Two Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          {/* Dropdown 1: Select Grade */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="#0d9488" /> KHỐI LỚP CẦN TẢI:
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedGrade}
                onChange={(e) => handleGradeSelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: '40px',
                  borderRadius: '12px',
                  border: '2px solid #0d9488',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none'
                }}
              >
                {gradesList.map(grade => (
                  <option key={grade} value={grade}>
                    {grade === 'Tất cả' ? '🏫 Tất Cả Các Khối Lớp (Lớp 1 - 12)' : `🎓 ${grade}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} color="#0d9488" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Dropdown 2: Select Subject */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} color="#0284c7" /> MÔN HỌC CẦN TẢI:
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: '40px',
                  borderRadius: '12px',
                  border: '2px solid #0284c7',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none'
                }}
              >
                {availableSubjectsList.map(subj => (
                  <option key={subj} value={subj}>
                    {subj === 'Tất cả các môn' ? '📖 Tất Cả Các Môn Học' : `📚 Môn ${subj}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} color="#0284c7" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

        </div>

        {/* Row 3: Grade Quick Click Pills */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.5px' }}>
            CHỌN NHANH THEO KHỐI LỚP:
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
            {gradesList.map(grade => (
              <button
                key={grade}
                onClick={() => handleGradeSelect(grade)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: selectedGrade === grade ? 800 : 700,
                  fontSize: '0.85rem',
                  border: selectedGrade === grade ? '2px solid #0d9488' : '1px solid #cbd5e1',
                  background: selectedGrade === grade ? '#0d9488' : '#ffffff',
                  color: selectedGrade === grade ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {grade === 'Tất cả' ? '🏫 Tất Cả Lớp' : `🎓 ${grade}`}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Books Cards Grid */}
      {filteredBooks.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '60px 20px',
          textAlign: 'center',
          border: '2px dashed #cbd5e1',
          color: '#64748b'
        }}>
          <BookOpen size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Không tìm thấy cuốn sách giáo khoa phù hợp</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px', maxWidth: '500px', margin: '6px auto 0' }}>
            Vui lòng thử thay đổi tùy chọn môn học, khối lớp hoặc nhập từ khóa tìm kiếm khác.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          width: '100%'
        }}>
          {filteredBooks.map(book => {
            const subjectName = getSubjectName(book);
            const isDownloading = downloadingId === (book.id || book.fileName);
            const targetDriveUrl = getDriveUrlForBook(book);

            return (
              <div 
                key={book.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  border: '1.5px solid #e2e8f0',
                  padding: '22px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'all 0.25s ease'
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#ccfbf1',
                      color: '#0f766e',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      padding: '5px 12px',
                      borderRadius: '12px'
                    }}>
                      🎓 {book.grade || 'Sách Khác'}
                    </span>

                    <span style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      padding: '5px 12px',
                      borderRadius: '12px'
                    }}>
                      📖 Môn {subjectName}
                    </span>

                    <span style={{
                      background: '#fef2f2',
                      color: '#dc2626',
                      fontWeight: 900,
                      fontSize: '0.75rem',
                      padding: '5px 10px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FileText size={13} /> DRIVE GỐC
                    </span>
                  </div>

                  {/* Book Title */}
                  <h3 style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {book.title}
                  </h3>
                </div>

                {/* Bottom Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  
                  {/* Main Download PDF Button */}
                  <button
                    disabled={isDownloading}
                    onClick={() => handleDownloadPdf(book)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      background: isDownloading 
                        ? '#94a3b8' 
                        : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: isDownloading ? 'wait' : 'pointer',
                      boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isDownloading ? (
                      <>
                        <RefreshCw size={16} className="spin-icon" /> Đang Mở...
                      </>
                    ) : (
                      <>
                        <Download size={16} /> Tải File PDF Gốc (.pdf)
                      </>
                    )}
                  </button>

                  {/* In-App Reader Button */}
                  <button
                    onClick={() => handleOpenReader(book)}
                    title="Đọc trực tiếp nội dung cuốn sách trên ứng dụng"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      background: '#f0fdf4',
                      color: '#166534',
                      border: '1.5px solid #86efac',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={16} /> Đọc Sách
                  </button>

                  {/* Google Drive Folder Direct Link Icon for this specific grade */}
                  <a
                    href={targetDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Mở trực tiếp thư mục Google Drive [${book.grade || 'Kho Sách'}] chứa file PDF gốc`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      borderRadius: '14px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                  >
                    <ExternalLink size={16} />
                  </a>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* IN-APP DIGITAL BOOK READER MODAL */}
      {readingBook && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '900px',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            border: '2px solid #0d9488'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              background: '#0d9488',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, opacity: 0.9 }}>
                  🎓 {readingBook.grade} • SÁCH GIÁO KHOA CHÍNH THỨC
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, marginTop: '2px' }}>
                  📖 {readingBook.title}
                </h3>
              </div>

              <button
                onClick={() => setReadingBook(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Reader Toolbar */}
            <div style={{
              padding: '12px 24px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={readerSearch}
                  onChange={(e) => setReaderSearch(e.target.value)}
                  placeholder="Tìm kiếm nội dung bài học trong sách..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleDownloadPdf(readingBook)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: '#0d9488',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={15} /> Tải File PDF Gốc
                </button>
              </div>
            </div>

            {/* Reader Body Text Container */}
            <div style={{
              flex: 1,
              padding: '24px',
              overflowY: 'auto',
              fontSize: '1rem',
              lineHeight: 1.7,
              color: '#1e293b',
              background: '#ffffff',
              whiteSpace: 'pre-wrap',
              fontFamily: 'Roboto, system-ui, sans-serif'
            }}>
              {isLoadingText ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <RefreshCw size={32} className="spin-icon" style={{ marginBottom: '12px', color: '#0d9488' }} />
                  <p style={{ fontWeight: 800 }}>Đang nạp dữ liệu cuốn sách...</p>
                </div>
              ) : readerText ? (
                readerText
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <BookOpen size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Nội dung cuốn sách giáo khoa chuẩn</h4>
                  <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>
                    Nội dung kiến thức cuốn sách này đã sẵn sàng trong Ngân Hàng Câu Hỏi AI của hệ thống.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
