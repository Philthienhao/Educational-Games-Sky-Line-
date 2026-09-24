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
  const renderNodeTree = (node, depth = 0, parentColor = null) => {
    const isCollapsed = collapsedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isEditing = editingNodeId === node.id;

    // Organic Vibrant Colors matching Tony Buzan Mindmap style
    const branchColors = ['#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
    const nodeColor = node.color || parentColor || branchColors[depth % branchColors.length];

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: depth === 0 ? '0 20px' : '0 10px', position: 'relative' }}>
        
        {/* Node Box */}
        <div style={{
          padding: depth === 0 ? '18px 32px' : depth === 1 ? '12px 22px' : '8px 16px',
          borderRadius: depth === 0 ? '30px' : '16px',
          background: depth === 0 
            ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)' 
            : depth === 1
            ? 'rgba(15, 23, 42, 0.92)'
            : 'rgba(30, 41, 59, 0.9)',
          border: `3px solid ${nodeColor}`,
          color: '#ffffff',
          fontWeight: depth === 0 ? 900 : 800,
          fontSize: depth === 0 ? '1.25rem' : depth === 1 ? '0.98rem' : '0.85rem',
          boxShadow: depth === 0 
            ? '0 10px 30px rgba(236, 72, 153, 0.5)' 
            : `0 6px 20px ${nodeColor}50`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          userSelect: 'none',
          maxWidth: depth === 0 ? '340px' : '260px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
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
              {depth === 0 ? `🧠 ${node.label}` : node.label}
            </span>
          )}

          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
              style={{
                background: nodeColor, border: 'none', color: '#fff',
                width: '22px', height: '22px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 900,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              {isCollapsed ? '+' : '-'}
            </button>
          )}
        </div>

        {/* Children Branch Lines */}
        {hasChildren && !isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '14px' }}>
            <div style={{ width: '3px', height: '22px', background: nodeColor, borderRadius: '3px' }} />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', borderTop: `3px solid ${nodeColor}`, paddingTop: '18px', borderRadius: '4px' }}>
              {node.children.map((child, idx) => {
                const childColor = child.color || branchColors[(idx + depth) % branchColors.length];
                return renderNodeTree({ ...child, color: childColor }, depth + 1, childColor);
              })}
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
