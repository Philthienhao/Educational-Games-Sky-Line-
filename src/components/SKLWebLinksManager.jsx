import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, 
  Plus, 
  Search, 
  ExternalLink, 
  Copy, 
  Edit3, 
  Trash2, 
  Star, 
  Bookmark, 
  FolderPlus, 
  Download, 
  Upload, 
  Check, 
  Sparkles, 
  Link as LinkIcon, 
  X,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { StorageService } from '../services/storage';

const CATEGORY_PRESETS = [
  'Tất cả',
  'Hệ Thống Sky-Line',
  'Cổng Giáo Dục & Dạy Học',
  'Sách & Học Liệu',
  'Công Cụ Thiết Kế',
  'Lưu Trữ & Bài Giảng'
];

const ICON_PRESETS = ['🏫', '💻', '📚', '🎨', '☁️', '🌐', '📌', '⚡', '📊', '🎓', '🔬', '📝'];

const EMOJI_COLORS = [
  { name: 'Xanh Lam', hex: '#0284c7' },
  { name: 'Xanh Lục', hex: '#059669' },
  { name: 'Xanh Ngọc', hex: '#0d9488' },
  { name: 'Hồng Nhạt', hex: '#ec4899' },
  { name: 'Vàng Cam', hex: '#f59e0b' },
  { name: 'Tím', hex: '#8b5cf6' }
];

const PRESET_SAMPLE_WEBSITES = [
  {
    title: 'Cổng Thông Tin Sky-Line',
    url: 'https://sky-line.edu.vn',
    category: 'Hệ Thống Sky-Line',
    description: 'Trang thông tin chính thức Hệ thống Giáo dục Sky-Line',
    icon: '🏫',
    color: '#0284c7'
  },
  {
    title: 'Hệ Thống K12Online',
    url: 'https://k12online.vn',
    category: 'Cổng Giáo Dục & Dạy Học',
    description: 'Nền tảng quản lý học tập & tổ chức kiểm tra đánh giá trực tuyến',
    icon: '💻',
    color: '#059669'
  },
  {
    title: 'Kho Học Liệu VN',
    url: 'https://hoclieu.vn',
    category: 'Sách & Học Liệu',
    description: 'Kho sách giáo khoa điện tử và học liệu số',
    icon: '📚',
    color: '#0d9488'
  },
  {
    title: 'Canva Giáo Dục',
    url: 'https://www.canva.com/education',
    category: 'Công Cụ Thiết Kế',
    description: 'Công cụ thiết kế bài giảng trực quan & infographic',
    icon: '🎨',
    color: '#ec4899'
  },
  {
    title: 'Google Drive Cá Nhân',
    url: 'https://drive.google.com',
    category: 'Lưu Trữ & Bài Giảng',
    description: 'Thư mục lưu trữ bài giảng & hồ sơ lớp học',
    icon: '☁️',
    color: '#f59e0b'
  }
];

// TOP-LEVEL SUB-COMPONENT MODAL (Rule 1 Safe)
function WebLinkModal({ isOpen, onClose, onSave, editingLink }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Hệ Thống Sky-Line');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🌐');
  const [color, setColor] = useState('#0284c7');
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title || '');
      setUrl(editingLink.url || '');
      setCategory(editingLink.category || 'Hệ Thống Sky-Line');
      setDescription(editingLink.description || '');
      setIcon(editingLink.icon || '🌐');
      setColor(editingLink.color || '#0284c7');
      setUseCustomCategory(false);
      setCustomCategory('');
    } else {
      setTitle('');
      setUrl('');
      setCategory('Hệ Thống Sky-Line');
      setDescription('');
      setIcon('🌐');
      setColor('#0284c7');
      setUseCustomCategory(false);
      setCustomCategory('');
    }
  }, [editingLink, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const finalCategory = useCustomCategory && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    onSave({
      id: editingLink ? editingLink.id : `link_${Date.now()}`,
      title: title.trim(),
      url: formattedUrl,
      category: finalCategory,
      description: description.trim(),
      icon,
      color,
      isFavorite: editingLink ? !!editingLink.isFavorite : false,
      createdAt: editingLink ? editingLink.createdAt : new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '540px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Globe size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              {editingLink ? 'Chỉnh Sửa Địa Chỉ Web' : 'Thêm Địa Chỉ Web Mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
              Tên Trang Web / Ứng Dụng <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Cổng Thông Tin Sky-Line, Canva Bài Giảng..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '12px 14px',
                color: '#ffffff',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
              Địa Chỉ Web (URL) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <LinkIcon size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                placeholder="https://sky-line.edu.vn hoặc k12online.vn"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '12px 14px 12px 40px',
                  color: '#38bdf8',
                  fontSize: '0.92rem',
                  outline: 'none',
                  fontWeight: 600
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                Danh Mục / Nhóm
              </label>
              {!useCustomCategory ? (
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM_NEW') {
                      setUseCustomCategory(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  {CATEGORY_PRESETS.filter(c => c !== 'Tất cả').map(cat => (
                    <option key={cat} value={cat} style={{ background: '#0f172a', color: '#fff' }}>{cat}</option>
                  ))}
                  <option value="CUSTOM_NEW" style={{ background: '#0f172a', color: '#38bdf8', fontWeight: 'bold' }}>+ Nhập nhóm mới...</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Tên nhóm mới..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid #3b82f6',
                      borderRadius: '12px',
                      padding: '12px',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setUseCustomCategory(false)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0 10px',
                      color: '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                Biểu Tượng Icon
              </label>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {ICON_PRESETS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    style={{
                      background: icon === ic ? 'rgba(59, 130, 246, 0.3)' : 'rgba(15, 23, 42, 0.6)',
                      border: icon === ic ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
              Mô Tả Nhanh / Ghi Chú (Tùy chọn)
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú về tài khoản, công dụng hoặc hướng dẫn truy cập..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '10px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 24px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)'
              }}
            >
              {editingLink ? 'Lưu Thay Đổi' : 'Tạo Địa Chỉ Web'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SKLWebLinksManager({ currentUser }) {
  const [webLinks, setWebLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [fileInputRef, setFileInputRef] = useState(null);

  // Load links per user on mount & currentUser change
  useEffect(() => {
    const loaded = StorageService.getSKLWebLinks(currentUser?.id);
    setWebLinks(loaded);
  }, [currentUser]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveLink = (linkObj) => {
    let updated;
    const existsIndex = webLinks.findIndex(l => l.id === linkObj.id);
    if (existsIndex >= 0) {
      updated = [...webLinks];
      updated[existsIndex] = linkObj;
    } else {
      updated = [linkObj, ...webLinks];
    }
    setWebLinks(updated);
    StorageService.saveSKLWebLinks(currentUser?.id, updated);
    triggerToast(existsIndex >= 0 ? '🎉 Đã cập nhật địa chỉ Web!' : '✨ Đã thêm địa chỉ Web mới!');
  };

  const handleDeleteLink = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ web này khỏi danh sách cá nhân?')) {
      const updated = webLinks.filter(l => l.id !== id);
      setWebLinks(updated);
      StorageService.saveSKLWebLinks(currentUser?.id, updated);
      triggerToast('🗑️ Đã xóa địa chỉ web khỏi danh sách!');
    }
  };

  const handleToggleFavorite = (id) => {
    const updated = webLinks.map(l => l.id === id ? { ...l, isFavorite: !l.isFavorite } : l);
    setWebLinks(updated);
    StorageService.saveSKLWebLinks(currentUser?.id, updated);
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      triggerToast('📋 Đã sao chép đường dẫn Web vào bộ nhớ tạm!');
    }).catch(() => {
      triggerToast('❌ Không thể sao chép đường dẫn!');
    });
  };

  const handleLoadSamplePresets = () => {
    let count = 0;
    const currentUrls = new Set(webLinks.map(l => l.url.toLowerCase().trim()));
    const newLinks = [...webLinks];

    PRESET_SAMPLE_WEBSITES.forEach((preset, idx) => {
      if (!currentUrls.has(preset.url.toLowerCase().trim())) {
        newLinks.push({
          ...preset,
          id: `link_preset_${Date.now()}_${idx}`,
          isFavorite: false,
          createdAt: new Date().toISOString().split('T')[0]
        });
        count++;
      }
    });

    if (count > 0) {
      setWebLinks(newLinks);
      StorageService.saveSKLWebLinks(currentUser?.id, newLinks);
      triggerToast(`✨ Đã thêm ${count} mẫu trang web giáo dục phổ biến!`);
    } else {
      triggerToast('ℹ️ Các trang web mẫu đã có sẵn trong danh sách của bạn!');
    }
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    StorageService.exportSKLWebLinksBackup(currentUser?.id);
    triggerToast('📥 Đã xuất tệp sao lưu địa chỉ web SKL!');
  };

  // Import JSON Backup
  const handleImportJSON = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = StorageService.importSKLWebLinksBackup(currentUser?.id, evt.target.result);
      if (res.success) {
        const updated = StorageService.getSKLWebLinks(currentUser?.id);
        setWebLinks(updated);
        triggerToast(res.message);
      } else {
        triggerToast('❌ ' + res.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Dynamically computed categories list
  const availableCategories = useMemo(() => {
    const set = new Set(CATEGORY_PRESETS);
    webLinks.forEach(l => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set);
  }, [webLinks]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return webLinks.filter(l => {
      const matchSearch = searchTerm.trim() === '' || 
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.category && l.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategory === 'Tất cả' || l.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [webLinks, searchTerm, selectedCategory]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#ffffff',
      padding: '24px 32px',
      fontFamily: 'Montserrat, system-ui, sans-serif'
    }}>
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '32px',
          background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '16px',
          fontWeight: 800,
          fontSize: '0.92rem',
          boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastMessage}
        </div>
      )}

      {/* HEADER BAR */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '28px',
        background: 'rgba(30, 41, 59, 0.6)',
        padding: '20px 28px',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            width: '52px',
            height: '52px',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.35)'
          }}>
            <Globe size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
                Địa chỉ web SKL
              </h1>
              <span style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px'
              }}>
                🔒 Bộ Nhớ Riêng: {currentUser?.name || currentUser?.username || 'Giáo Viên'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#94a3b8', fontWeight: 500 }}>
              Sổ tay lưu trữ & mở nhanh các trang web dạy học cá nhân (Bảo mật 100% theo từng tài khoản)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              setEditingLink(null);
              setIsModalOpen(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '12px 20px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)'
            }}
          >
            <Plus size={18} /> + Thêm Địa Chỉ Web Mới
          </button>

          <button
            onClick={handleLoadSamplePresets}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#fde047',
              border: '1px solid rgba(253, 224, 71, 0.3)',
              borderRadius: '14px',
              padding: '12px 16px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Tự động thêm danh sách các website giáo dục phổ biến"
          >
            <Sparkles size={16} /> Mẫu Website Hay
          </button>

          <button
            onClick={handleExportJSON}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '14px',
              padding: '12px 14px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Xuất sao lưu định dạng JSON"
          >
            <Download size={16} /> Xuất JSON
          </button>

          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            ref={ref => setFileInputRef(ref)}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef && fileInputRef.click()}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '14px',
              padding: '12px 14px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Nhập khôi phục từ tệp JSON"
          >
            <Upload size={16} /> Nhập JSON
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {availableCategories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(30, 41, 59, 0.6)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '380px' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Tìm tên trang web, URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '14px',
              padding: '10px 14px 10px 42px',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* WEB LINKS GRID VIEW */}
      {filteredLinks.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredLinks.map(link => {
            const domain = link.url ? link.url.replace(/^https?:\/\//i, '').split('/')[0] : '';
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

            return (
              <div
                key={link.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  borderRadius: '20px',
                  border: link.isFavorite ? '2px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(8px)',
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Top Row: Icon/Favicon, Category Pill, Star */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={faviconUrl} 
                          alt="icon" 
                          onError={(e) => { e.target.style.display = 'none'; }}
                          style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                        />
                        <span style={{ position: 'absolute' }}>{link.icon || '🌐'}</span>
                      </div>

                      <span style={{
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '10px',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        {link.category || 'Hệ Thống Sky-Line'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleFavorite(link.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: link.isFavorite ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title={link.isFavorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}
                    >
                      <Star size={20} fill={link.isFavorite ? '#f59e0b' : 'none'} />
                    </button>
                  </div>

                  {/* Title & Domain URL */}
                  <h3 style={{
                    margin: '0 0 6px 0',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    lineHeight: 1.3
                  }}>
                    {link.title}
                  </h3>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.82rem',
                      color: '#38bdf8',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginBottom: '10px',
                      wordBreak: 'break-all'
                    }}
                  >
                    {domain || link.url} <ExternalLink size={12} />
                  </a>

                  {/* Description / Notes */}
                  {link.description && (
                    <p style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      color: '#94a3b8',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {link.description}
                    </p>
                  )}
                </div>

                {/* Bottom Action Controls */}
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      padding: '8px 16px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
                    }}
                  >
                    <Compass size={16} /> Truy Cập Web
                  </a>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => handleCopyUrl(link.url)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#cbd5e1',
                        borderRadius: '10px',
                        padding: '8px',
                        cursor: 'pointer'
                      }}
                      title="Sao chép link"
                    >
                      <Copy size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setEditingLink(link);
                        setIsModalOpen(true);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#cbd5e1',
                        borderRadius: '10px',
                        padding: '8px',
                        cursor: 'pointer'
                      }}
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5',
                        borderRadius: '10px',
                        padding: '8px',
                        cursor: 'pointer'
                      }}
                      title="Xóa trang web này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* EMPTY STATE VIEW */
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          border: '2px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '60px 24px',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '16px'
          }}>
            🌐
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            {searchTerm || selectedCategory !== 'Tất cả' 
              ? 'Không tìm thấy địa chỉ web phù hợp' 
              : 'Chưa có địa chỉ web nào trong danh sách cá nhân'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '460px', margin: '0 auto 24px auto' }}>
            {searchTerm || selectedCategory !== 'Tất cả'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bấm chọn nhóm khác.'
              : 'Thêm ngay các địa chỉ web quan trọng như Cổng Sky-Line, K12Online, Canva, Drive bài giảng để truy cập nhanh chóng mọi lúc!'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => {
                setEditingLink(null);
                setIsModalOpen(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '12px 24px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)'
              }}
            >
              <Plus size={18} /> + Thêm Địa Chỉ Web Đầu Tiên
            </button>

            <button
              onClick={handleLoadSamplePresets}
              style={{
                background: 'rgba(253, 224, 71, 0.15)',
                color: '#fde047',
                border: '1px solid rgba(253, 224, 71, 0.4)',
                borderRadius: '14px',
                padding: '12px 20px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={18} /> Thêm Danh Sách Mẫu
            </button>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      <WebLinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLink}
        editingLink={editingLink}
      />
    </div>
  );
}
