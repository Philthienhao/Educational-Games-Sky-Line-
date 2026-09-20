import React, { useState } from 'react';
import { 
  Globe, 
  Sun, 
  Moon, 
  Flame, 
  Activity, 
  Droplets, 
  Layers, 
  Mountain, 
  Play, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  FlaskConical,
  Compass
} from 'lucide-react';
import defaultExperiments from '../services/experimentCatalog.json';
import { InteractiveExperimentCanvas } from './experiments/InteractiveExperimentCanvas';

export function GeoExperimentsView({ currentUser }) {
  const [activeExperiment, setActiveExperiment] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter 7 Geography 6 experiments from catalog
  const geoExperiments = defaultExperiments.filter(exp => 
    exp.subject === 'Địa lí' || exp.subject === 'Địa lý' || exp.interactiveType?.startsWith('geo_')
  );

  const categories = [
    { id: 'all', label: '🌐 Tất Cả 7 Thí Nghiệm', count: geoExperiments.length },
    { id: 'astronomy', label: '🪐 Trái Đất & Vũ Trụ', filter: ['geo_solar_system', 'geo_earth_sun_moon'] },
    { id: 'geology', label: '🌋 Nội Lực & Kiến Tạo', filter: ['geo_volcano', 'geo_earthquake', 'geo_earth_structure'] },
    { id: 'hydrology', label: '💧 Nước & Băng Tuyết', filter: ['geo_water_cycle', 'geo_glacial_river'] }
  ];

  const filteredExps = geoExperiments.filter(exp => {
    if (activeCategory === 'all') return true;
    const cat = categories.find(c => c.id === activeCategory);
    return cat?.filter?.includes(exp.interactiveType);
  });

  const getExpIcon = (type) => {
    switch (type) {
      case 'geo_solar_system': return <Globe size={24} color="#38bdf8" />;
      case 'geo_earth_sun_moon': return <Sun size={24} color="#fde047" />;
      case 'geo_volcano': return <Flame size={24} color="#ef4444" />;
      case 'geo_earthquake': return <Activity size={24} color="#f97316" />;
      case 'geo_water_cycle': return <Droplets size={24} color="#0284c7" />;
      case 'geo_earth_structure': return <Layers size={24} color="#a855f7" />;
      case 'geo_glacial_river': return <Mountain size={24} color="#2dd4bf" />;
      default: return <Compass size={24} color="#38bdf8" />;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#0f172a' }}>
      
      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 243, 199, 0.95) 50%, rgba(224, 242, 254, 0.95) 100%)',
        borderRadius: '24px',
        padding: '30px 36px',
        border: '2px solid rgba(245, 158, 11, 0.5)',
        boxShadow: '0 10px 40px rgba(15, 23, 42, 0.08)',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                width: '50px',
                height: '50px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.35)',
                border: '1.5px solid rgba(255, 255, 255, 0.6)'
              }}>
                <Globe size={28} color="#ffffff" />
              </div>
              <div>
                <span style={{ background: '#d97706', color: '#ffffff', fontSize: '0.72rem', fontWeight: 900, padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CHUYÊN MỤC ĐỊA LÍ KHỐI 6 - GDPT 2018
                </span>
                <h1 style={{
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  color: '#0f172a',
                  margin: '4px 0 0 0'
                }}>
                  Mô Hình 3D Địa Lí
                </h1>
              </div>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#334155', margin: 0, fontWeight: 600, maxWidth: '750px', lineHeight: 1.5 }}>
              Tập hợp đầy đủ 7 mô hình tương tác 3D/SVG trực quan chuyên sâu môn Địa lý 6: Vũ trụ, Trái Đất, Núi lửa, Động đất, Vòng tuần hoàn nước & Sông suối băng tan.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                const solarExp = geoExperiments.find(e => e.interactiveType === 'geo_solar_system') || geoExperiments[0];
                setActiveExperiment({ ...solarExp, startInCockpit: true });
              }}
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '16px',
                padding: '12px 20px',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 24px rgba(245, 158, 11, 0.35)'
              }}
            >
              <Sparkles size={18} color="#ffffff" /> 🚀 BẬT PHI THUYỀN LÁI VŨ TRỤ 3D NGAY
            </button>

            <div style={{ background: '#ffffff', border: '1.5px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 800 }}>TÁC GIẢ BỘ MÔ NÂNG CAO</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#d97706' }}>Thầy Hảo Địa Lý</div>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '1.1rem', boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)' }}>
                🌐
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              background: activeCategory === cat.id ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : '#ffffff',
              color: activeCategory === cat.id ? '#ffffff' : '#334155',
              border: activeCategory === cat.id ? '1.5px solid #d97706' : '1.5px solid rgba(13, 148, 136, 0.25)',
              borderRadius: '14px',
              padding: '12px 20px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeCategory === cat.id ? '0 4px 18px rgba(245, 158, 11, 0.35)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.2s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of 7 Geography 6 Experiments */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '24px'
      }}>
        {filteredExps.map((exp, idx) => (
          <div 
            key={exp.id}
            onClick={() => setActiveExperiment(exp)}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1.5px solid rgba(245, 158, 11, 0.35)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = '#d97706';
              e.currentTarget.style.boxShadow = '0 16px 36px rgba(245, 158, 11, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.35)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.06)';
            }}
          >
            {/* Header Icon & Badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '12px',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getExpIcon(exp.interactiveType)}
                </div>
                <div>
                  <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                    Địa lí 6
                  </span>
                </div>
              </div>

              <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 800 }}>
                Mô Hình #{idx + 1}
              </span>
            </div>

            {/* Title & Chapter */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                {exp.title}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
                {exp.chapter}
              </div>
            </div>

            {/* Objective */}
            <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, lineHeight: 1.5, flex: 1, fontWeight: 500 }}>
              {exp.objective}
            </p>

            {/* Equipment list preview */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {exp.equipment?.slice(0, 3).map((item, i) => (
                <span key={i} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                  {item}
                </span>
              ))}
              {exp.equipment?.length > 3 && (
                <span style={{ color: '#d97706', fontSize: '0.72rem', fontWeight: 800, padding: '3px 4px' }}>
                  +{exp.equipment.length - 3} thiết bị
                </span>
              )}
            </div>

            {/* Action Launch Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveExperiment(exp);
                }}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(217, 119, 6, 0.35)'
                }}
              >
                <Play size={14} fill="#ffffff" /> ▶️ Trình Chiếu 3D
              </button>

              {exp.interactiveType === 'geo_solar_system' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveExperiment({ ...exp, startInCockpit: true });
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(2, 132, 199, 0.35)'
                  }}
                >
                  🛸 Lái Phi Thuyền 3D
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Active Experiment Modal Canvas */}
      {activeExperiment && (
        <InteractiveExperimentCanvas 
          experiment={{ ...activeExperiment, isGeo: true }}
          onClose={() => setActiveExperiment(null)}
        />
      )}
    </div>
  );
}
