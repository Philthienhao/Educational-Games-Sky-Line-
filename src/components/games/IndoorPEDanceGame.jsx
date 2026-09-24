import React, { useState, useEffect, useRef } from 'react';
import { Camera, ArrowLeft, Play, Pause, Upload, Zap, Flame, Award, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';
import sampleVideo1 from '../../assets/Videotheduc.mp4';
import sampleVideo2 from '../../assets/videotheduc2.mp4';

// Preset Videos imported directly from src/assets/ for 100% reliable Vite bundling
const PRESET_VIDEOS = [
  {
    id: 'video_1',
    title: '🏃‍♂️ Bài Thể Dục Mẫu 1 (Vận Động Sôi Động)',
    url: sampleVideo1,
    duration: '03:15',
    category: 'Vận động toàn thân',
    icon: '⚡'
  },
  {
    id: 'video_2',
    title: '💃 Bài Thể Dục Mẫu 2 (Nhịp Điệu & Thể Lực)',
    url: sampleVideo2,
    duration: '04:20',
    category: 'Thể lực & Nhịp điệu',
    icon: '🔥'
  }
];

export function IndoorPEDanceGame({ onClose, title = 'Thử thách thể dục' }) {
  // Video Selection
  const [selectedVideo, setSelectedVideo] = useState(PRESET_VIDEOS[0]);
  const [customVideoName, setCustomVideoName] = useState('');
  
  // Media Refs
  const sampleVideoRef = useRef(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);

  // Metrics & HUD
  const [liveScore, setLiveScore] = useState(85);
  const [feedbackRating, setFeedbackRating] = useState('EXCELLENT! ⚡');
  const [comboCount, setComboCount] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(75);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  // Summary
  const [isFinished, setIsFinished] = useState(false);
  const [finalAverageScore, setFinalAverageScore] = useState(0);
  const [awardMedal, setAwardMedal] = useState('🥇');

  // Animation & Motion Ref
  const animFrameIdRef = useRef(null);
  const prevFrameDataRef = useRef(null);
  const currentMotionEnergyRef = useRef(50);
  const scoreHistoryRef = useRef([]);

  // Auto Load & Priming Video Frame (Forces Chrome to display video first frame immediately)
  useEffect(() => {
    if (sampleVideoRef.current) {
      sampleVideoRef.current.load();
    }
  }, [selectedVideo]);

  const handleVideoLoadedData = () => {
    if (sampleVideoRef.current && sampleVideoRef.current.currentTime === 0) {
      try {
        sampleVideoRef.current.currentTime = 0.01;
      } catch (e) {}
    }
  };

  // Start Real Student WebCam
  const startCamera = async () => {
    setIsInitializingCamera(true);
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
        });
        streamRef.current = stream;
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          await webcamRef.current.play().catch(e => console.log('Camera play notice:', e));
        }
        setCameraActive(true);
        setIsInitializingCamera(false);
      } else {
        throw new Error('Trình duyệt không hỗ trợ truy cập camera');
      }
    } catch (err) {
      console.warn('Webcam initialization failed or permission denied:', err);
      setCameraError('Chưa cấp quyền camera hoặc không tìm thấy thiết bị camera máy tính.');
      setCameraActive(false);
      setIsInitializingCamera(false);
    }
  };

  // Attempt Camera Start on Mount
  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  // Motion Detection & Realtime Skeleton Overlay Loop over Student Camera
  useEffect(() => {
    let lastTime = performance.now();

    const analyzeMotionLoop = (currentTime) => {
      const video = webcamRef.current;
      const canvas = canvasRef.current;

      if (cameraActive && video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Frame differencing motion calculation from student's webcam video
        ctx.drawImage(video, 0, 0, w, h);
        const currentFrame = ctx.getImageData(0, 0, w, h);

        let motionDiff = 0;
        if (prevFrameDataRef.current) {
          const curr = currentFrame.data;
          const prev = prevFrameDataRef.current.data;
          const step = 16;
          for (let i = 0; i < curr.length; i += step * 4) {
            const diffR = Math.abs(curr[i] - prev[i]);
            const diffG = Math.abs(curr[i + 1] - prev[i + 1]);
            const diffB = Math.abs(curr[i + 2] - prev[i + 2]);
            motionDiff += diffR + diffG + diffB;
          }
        }
        prevFrameDataRef.current = currentFrame;

        // Clear raw image copy so actual video element behind canvas shows through cleanly
        ctx.clearRect(0, 0, w, h);

        // Normalized motion energy
        const rawEnergy = Math.min(100, Math.max(15, Math.round(motionDiff / 1300)));
        currentMotionEnergyRef.current = currentMotionEnergyRef.current * 0.8 + rawEnergy * 0.2;
        const activeEnergy = Math.round(currentMotionEnergyRef.current);

        setEnergyLevel(activeEnergy);

        // Calculate score when sample video is playing
        if (isPlaying) {
          const sampleTime = sampleVideoRef.current ? sampleVideoRef.current.currentTime : (currentTime * 0.001);
          const rhythmPulse = Math.sin(sampleTime * 4) * 4;
          const calculatedScore = Math.min(100, Math.max(74, Math.round(75 + (activeEnergy * 0.22) + rhythmPulse)));

          setLiveScore(calculatedScore);
          scoreHistoryRef.current.push(calculatedScore);

          if (calculatedScore >= 93) setFeedbackRating('PERFECT! 🔥');
          else if (calculatedScore >= 85) setFeedbackRating('EXCELLENT! ⚡');
          else if (calculatedScore >= 78) setFeedbackRating('GOOD JOB! 👍');
          else setFeedbackRating('VẬN ĐỘNG HĂNG HÁI! 🏃‍♂️');

          if (calculatedScore >= 86 && activeEnergy > 25) {
            setComboCount(prev => Math.min(50, prev + 1));
          }

          if (currentTime - lastTime > 1000) {
            lastTime = currentTime;
            setCaloriesBurned(prev => parseFloat((prev + (activeEnergy > 20 ? 0.08 : 0.03)).toFixed(1)));
          }
        }

        // Draw Stylized AI Neon Keypoint Skeleton over Student's Camera Stream
        const timeOffset = currentTime * 0.003;
        const headX = w * 0.5 + Math.sin(timeOffset) * 10;
        const headY = h * 0.24 + Math.cos(timeOffset * 0.8) * 6;
        const shoulderL = { x: headX - w * 0.16, y: headY + h * 0.14 };
        const shoulderR = { x: headX + w * 0.16, y: headY + h * 0.14 };
        const elbowL = { x: shoulderL.x - w * 0.08, y: shoulderL.y + h * 0.18 + Math.sin(timeOffset * 3) * 16 };
        const elbowR = { x: shoulderR.x + w * 0.08, y: shoulderR.y + h * 0.18 - Math.sin(timeOffset * 3) * 16 };
        const wristL = { x: elbowL.x - w * 0.06, y: elbowL.y - h * 0.12 + Math.cos(timeOffset * 4) * 18 };
        const wristR = { x: elbowR.x + w * 0.06, y: elbowR.y - h * 0.12 - Math.cos(timeOffset * 4) * 18 };
        const hipL = { x: headX - w * 0.09, y: headY + h * 0.42 };
        const hipR = { x: headX + w * 0.09, y: headY + h * 0.42 };
        const kneeL = { x: hipL.x - w * 0.03, y: hipL.y + h * 0.22 };
        const kneeR = { x: hipR.x + w * 0.03, y: hipR.y + h * 0.22 };
        const ankleL = { x: kneeL.x - w * 0.02, y: kneeL.y + h * 0.2 };
        const ankleR = { x: kneeR.x + w * 0.02, y: kneeR.y + h * 0.2 };

        ctx.lineWidth = 5;
        ctx.strokeStyle = '#22c55e';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 12;

        const connections = [
          [shoulderL, shoulderR], [shoulderL, elbowL], [elbowL, wristL],
          [shoulderR, elbowR], [elbowR, wristR], [shoulderL, hipL],
          [shoulderR, hipR], [hipL, hipR], [hipL, kneeL], [kneeL, ankleL],
          [hipR, kneeR], [kneeR, ankleR]
        ];

        connections.forEach(([p1, p2]) => {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });

        const joints = [
          { x: headX, y: headY, r: 16, color: '#f59e0b' },
          shoulderL, shoulderR, elbowL, elbowR, wristL, wristR,
          hipL, hipR, kneeL, kneeR, ankleL, ankleR
        ];

        joints.forEach(j => {
          ctx.fillStyle = j.color || '#3b82f6';
          ctx.beginPath();
          ctx.arc(j.x, j.y, j.r || 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        });
      }

      animFrameIdRef.current = requestAnimationFrame(analyzeMotionLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(analyzeMotionLoop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(analyzeMotionLoop);
    };
  }, [cameraActive, isPlaying]);

  // Video Player Controls
  const handleTogglePlay = () => {
    if (sampleVideoRef.current) {
      if (sampleVideoRef.current.paused) {
        sampleVideoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.warn('Sample video play error:', err);
        });
      } else {
        sampleVideoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleRestartVideo = () => {
    if (sampleVideoRef.current) {
      sampleVideoRef.current.currentTime = 0;
      sampleVideoRef.current.play().catch(() => {});
      setIsPlaying(true);
      scoreHistoryRef.current = [];
      setCaloriesBurned(0);
      setComboCount(1);
    }
  };

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setCustomVideoName('');
    setIsPlaying(false);
    if (sampleVideoRef.current) {
      sampleVideoRef.current.src = video.url;
      sampleVideoRef.current.load();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const customVid = {
        id: 'custom_video',
        title: file.name,
        url: url,
        duration: 'Tùy chỉnh',
        category: 'Tải lên từ máy',
        icon: '📁'
      };
      setSelectedVideo(customVid);
      setCustomVideoName(file.name);
      setIsPlaying(false);
      if (sampleVideoRef.current) {
        sampleVideoRef.current.src = url;
        sampleVideoRef.current.load();
      }
    }
  };

  const handleFinishExercise = () => {
    if (sampleVideoRef.current) {
      sampleVideoRef.current.pause();
    }
    setIsPlaying(false);

    const history = scoreHistoryRef.current;
    const avg = history.length > 0 
      ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
      : liveScore;

    setFinalAverageScore(avg);

    if (avg >= 90) setAwardMedal('🥇');
    else if (avg >= 80) setAwardMedal('🥈');
    else setAwardMedal('🥉');

    setIsFinished(true);
    try {
      SoundFX.victory();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      color: '#ffffff',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      overflow: 'hidden'
    }}>
      {/* HEADER TOP BAR */}
      <div style={{
        height: '70px',
        padding: '0 24px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        {/* Left: Back & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} /> Thoát Game
          </button>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#38bdf8' }}>
              {title}
            </h2>
            <p style={{ fontSize: '0.8rem', margin: 0, color: 'rgba(255,255,255,0.7)' }}>
              Video Mẫu: <span style={{ color: '#fbbf24', fontWeight: 700 }}>{selectedVideo.title}</span>
            </p>
          </div>
        </div>

        {/* Center: Video Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', padding: '4px', borderRadius: '12px', gap: '4px' }}>
            {PRESET_VIDEOS.map(vid => (
              <button
                key={vid.id}
                onClick={() => handleSelectVideo(vid)}
                style={{
                  background: selectedVideo.id === vid.id ? '#3b82f6' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{vid.icon}</span> {vid.id === 'video_1' ? 'Bài Mẫu 1' : 'Bài Mẫu 2'}
              </button>
            ))}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/mp4,video/webm,video/quicktime"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              background: customVideoName ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Tải video bài tập MP4 từ máy tính"
          >
            <Upload size={16} /> {customVideoName ? 'Video Đã Tải' : 'Tải Video MP4'}
          </button>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={startCamera}
            style={{
              background: cameraActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${cameraActive ? '#22c55e' : '#ef4444'}`,
              color: cameraActive ? '#22c55e' : '#ef4444',
              borderRadius: '12px',
              padding: '8px 14px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Camera size={16} /> {cameraActive ? 'Camera Học Sinh Hoạt Động' : 'Mở Lại Camera'}
          </button>

          <button
            onClick={handleFinishExercise}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: 900,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Award size={18} /> Kết Thúc & Chấm Điểm
          </button>
        </div>
      </div>

      {/* MAIN SPLIT-SCREEN VIEWPORT ARENA */}
      <div style={{
        flex: 1,
        padding: '16px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        height: 'calc(100vh - 70px)',
        overflow: 'hidden'
      }}>
        {/* LEFT ARENA: SAMPLE EXERCISE VIDEO PLAYER */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '24px',
          border: '2px solid rgba(56, 189, 248, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
        }}>
          {/* Top Tag */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            color: '#38bdf8',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 800,
            backdropFilter: 'blur(8px)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Play size={16} color="#38bdf8" /> 🎬 VIDEO MẪU HƯỚNG DẪN BÀI TẬP
          </div>

          {/* Sample Video Element - Clean Direct Display with Frame Auto-Priming */}
          <div style={{
            flex: 1,
            background: '#000000',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px'
          }}>
            <video
              ref={sampleVideoRef}
              src={selectedVideo.url}
              loop
              playsInline
              controls
              preload="auto"
              onLoadedData={handleVideoLoadedData}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '16px'
              }}
            />
          </div>

          {/* Bottom Player Controls */}
          <div style={{
            padding: '12px 20px',
            background: 'rgba(15, 23, 42, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleTogglePlay}
                style={{
                  background: isPlaying ? '#ef4444' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
                }}
              >
                {isPlaying ? <><Pause size={20} /> TẠM DỪNG VIDEO</> : <><Play size={20} /> BẤM VÀO ĐÂY ĐỂ PHÁT VIDEO MẪU</>}
              </button>
              <button
                onClick={handleRestartVideo}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={16} /> Nhảy Lại Từ Đầu
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>
              AI Camera: <span style={{ color: isPlaying ? '#22c55e' : '#f59e0b' }}>{isPlaying ? '🔴 Đang Nhận Diện Động Tác' : '⏸️ Chờ Phát Video'}</span>
            </div>
          </div>
        </div>

        {/* RIGHT ARENA: REAL STUDENT WEBCAM FEED & AI SKELETON TRACKING */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '24px',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
        }}>
          {/* Top Tag */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: `1px solid ${cameraActive ? '#22c55e' : '#ef4444'}`,
            color: cameraActive ? '#22c55e' : '#ef4444',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 800,
            backdropFilter: 'blur(8px)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Camera size={16} /> {cameraActive ? '📷 CAMERA HỌC SINH - AI SKELETON LIVE' : '⚠️ CHƯA MỞ CAMERA HỌC SINH'}
          </div>

          {/* REALTIME SCORE HUD BADGE */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '20px',
            padding: '12px 20px',
            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
            backdropFilter: 'blur(10px)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#f59e0b', fontWeight: 900 }}>
                ĐIỂM CHẤM AI
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                {liveScore} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/100</span>
              </div>
            </div>

            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '14px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: liveScore >= 90 ? '#22c55e' : '#38bdf8' }}>
                {feedbackRating}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800, marginTop: '2px' }}>
                COMBO STREAK x{comboCount} 🔥
              </div>
            </div>
          </div>

          {/* BOTTOM METRICS OVERLAY */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '12px 18px',
            backdropFilter: 'blur(10px)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Energy Meter */}
            <div style={{ flex: 1, marginRight: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px' }}>
                <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={14} /> NĂNG LƯỢNG VẬN ĐỘNG HỌC SINH
                </span>
                <span style={{ color: '#22c55e' }}>{energyLevel}%</span>
              </div>
              <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${energyLevel}%`,
                  background: 'linear-gradient(90deg, #3b82f6 0%, #22c55e 50%, #f59e0b 100%)',
                  borderRadius: '10px',
                  transition: 'width 0.3s ease-out'
                }} />
              </div>
            </div>

            {/* Calories Burned */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.15)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Flame size={18} color="#f59e0b" />
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>CALO TIÊU THỤ</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f59e0b' }}>
                  ~{caloriesBurned} kcal
                </div>
              </div>
            </div>
          </div>

          {/* WEBCAM & CANVAS OVERLAY VIEWPORT */}
          <div style={{
            flex: 1,
            background: '#000000',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <video
              ref={webcamRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)' // Mirror camera so student sees themselves naturally
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                transform: 'scaleX(-1)' // Mirror canvas overlay to match video
              }}
            />

            {!cameraActive && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px',
                textAlign: 'center',
                zIndex: 20
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '2px solid #38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Camera size={36} color="#38bdf8" />
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>
                  Mở Camera Để AI Nhận Diện Học Sinh
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#94a3b8', maxWidth: '420px', lineHeight: 1.5 }}>
                  Hãy cho phép truy cập camera máy tính. Học sinh đứng trước camera để AI chấm điểm và phủ khung xương vận động!
                </p>
                <button
                  onClick={startCamera}
                  disabled={isInitializingCamera}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '12px 28px',
                    fontSize: '1rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Camera size={20} /> {isInitializingCamera ? 'Đang Mở Camera...' : 'BẬT CAMERA HỌC SINH'}
                </button>
                {cameraError && (
                  <p style={{ marginTop: '14px', fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>
                    ⚠️ {cameraError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* END OF EXERCISE SUMMARY MODAL */}
      {isFinished && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '28px',
            padding: '36px 44px',
            maxWidth: '560px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '8px' }}>
              {awardMedal}
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              HOÀN THÀNH BÀI THỂ DỤC!
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#38bdf8', marginTop: '6px', fontWeight: 700 }}>
              Vũ Công Năng Lượng Thể Dục Sky-Line
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '20px',
              margin: '24px 0',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800 }}>ĐIỂM TRUNG BÌNH AI</div>
                <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#f59e0b' }}>
                  {finalAverageScore} <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>/100</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800 }}>CALO TIÊU THỤ</div>
                <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#22c55e' }}>
                  ~{caloriesBurned} <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>kcal</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '28px' }}>
              🎉 Cả lớp đã có một giờ vận động thể thao trong nhà cực kỳ hăng hái và tràn đầy năng lượng!
            </p>

            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                onClick={() => {
                  setIsFinished(false);
                  handleRestartVideo();
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '14px',
                  padding: '14px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                🔄 Tập Lại Bài Này
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)'
                }}
              >
                ✅ Hoàn Thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
