import React, { useState } from 'react';
import { Network, Download, Edit2, Plus, Minus, RefreshCw, ZoomIn, ZoomOut, Check, Sparkles } from 'lucide-react';

export function AIMindmapCanvas({ mindmapData: initialData, topicTitle }) {
  const [mindmap, setMindmap] = useState(initialData || { id: 'root', label: 'Bài Học SGK', children: [] });
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  const toggleCollapse = (id) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStartEdit = (node) => {
    setEditingNodeId(node.id);
    setEditingText(node.label);
  };

  const handleSaveNodeText = (targetId) => {
    const updateLabel = (curr) => {
      if (curr.id === targetId) {
        return { ...curr, label: editingText };
      }
      if (curr.children && Array.isArray(curr.children)) {
        return { ...curr, children: curr.children.map(updateLabel) };
      }
      return curr;
    };

    setMindmap(prev => updateLabel(prev));
    setEditingNodeId(null);
  };

  // Helper to render tree nodes hierarchically
  const renderNodeTree = (node, depth = 0) => {
    const isCollapsed = collapsedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isEditing = editingNodeId === node.id;

    // Color theme by depth
    const colors = ['#0284c7', '#0d9488', '#8b5cf6', '#d97706', '#ec4899'];
    const nodeColor = node.color || colors[depth % colors.length];

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 12px', position: 'relative' }}>
        
        {/* Node Box */}
        <div style={{
          padding: depth === 0 ? '14px 24px' : '10px 18px',
          borderRadius: depth === 0 ? '20px' : '14px',
          background: depth === 0 ? 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)' : '#0f172a',
          border: `2px solid ${nodeColor}`,
          color: '#ffffff',
          fontWeight: depth === 0 ? 900 : 800,
          fontSize: depth === 0 ? '1.1rem' : depth === 1 ? '0.92rem' : '0.82rem',
          boxShadow: `0 6px 20px ${nodeColor}40`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          maxWidth: '260px',
          textAlign: 'center'
        }}>
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveNodeText(node.id)}
                autoFocus
                style={{
                  background: '#090d16', border: '1px solid #38bdf8', color: '#fff',
                  padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', outline: 'none'
                }}
              />
              <button 
                onClick={() => handleSaveNodeText(node.id)}
                style={{ background: '#10b981', border: 'none', color: '#fff', padding: '4px', borderRadius: '6px', cursor: 'pointer' }}
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <span onClick={() => handleStartEdit(node)}>
              {node.label}
            </span>
          )}

          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
                width: '20px', height: '20px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 900
              }}
            >
              {isCollapsed ? '+' : '-'}
            </button>
          )}
        </div>

        {/* Children Branch Lines */}
        {hasChildren && !isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px' }}>
            <div style={{ width: '2px', height: '20px', background: nodeColor }} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', borderTop: `2px solid ${nodeColor}`, paddingTop: '16px' }}>
              {node.children.map(child => renderNodeTree(child, depth + 1))}
            </div>
          </div>
        )}

      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Mindmap Control Header */}
      <div style={{
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
          <Network size={22} color="#0d9488" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', margin: 0 }}>
              Sơ Đồ Tư Duy Khoa Học AI
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Bấm vào chữ trên sơ đồ để chỉnh sửa • Nút (+ / -) để ẩn hiện nhánh
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.1))}
            style={{ background: '#1e293b', border: '1px solid #475569', color: '#fff', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer' }}
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
            style={{ background: '#1e293b', border: '1px solid #475569', color: '#fff', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer' }}
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Mindmap Viewport Area */}
      <div style={{
        background: '#070b14',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(13, 148, 136, 0.15) 0%, transparent 60%)',
        border: '2px solid rgba(13, 148, 136, 0.3)',
        borderRadius: '24px',
        padding: '50px 20px',
        minHeight: '450px',
        overflowX: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s ease'
      }}>
        {renderNodeTree(mindmap)}
      </div>

    </div>
  );
}
