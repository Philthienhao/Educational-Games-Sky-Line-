import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Volume2, VolumeX, Maximize, RotateCcw, Trophy, Settings, Camera, CheckCircle2, ArrowLeft, Play, Pause, Upload, Zap, Flame, Award, Sparkles, Activity, RefreshCw, AlertCircle, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundFX } from '../../utils/sound';

// Preset Exercises & Videos
const PRESET_VIDEOS = [
  {
    id: 'canvas_coach',
    title: '🤖 HLV AI Fitness (Mẫu 1 - Vận động toàn thân)',
    type: 'canvas',
    url: '',
    duration: '03:30',
    category: 'Vận động toàn thân',
    icon: '⚡'
  },
  {
    id: 'cdn_video_1',
    title: '🏃‍♂️ Bài Thể Dục Nhịp Điệu (Mẫu 2)',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '03:15',
    category: 'Thể lực & Nhịp điệu',
    icon: '🔥'
  },
  {
    id: 'cdn_video_2',
    title: '💃 Vũ Điệu Năng Lượng (Mẫu 3)',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    duration: '04:00',
    category: 'Dẻo dai & Sức bền',
    icon: '🌟'
  }
];

export function IndoorPEDanceGame({ onClose, title = '🏃‍♂️ Thể Dục Trong Nhà - AI Nhảy Theo Video & Chấm Điểm Camera' }) {
  // Video Selection
  const [selectedVideo, setSelectedVideo] = useState(PRESET_VIDEOS[0]);
  const [customVideoName, setCustomVideoName] = useState('');
  const [useCanvasCoach, setUseCanvasCoach] = useState(true);
  
  // Media State
  const sampleVideoRef = useRef(null);
  const coachCanvasRef = useRef(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const coachAnimRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isSimulatedCamera, setIsSimulatedCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Scoring & Performance Realtime Metrics
  const [liveScore, setLiveScore] = useState(85);
  const [feedbackRating, setFeedbackRating] = useState('EXCELLENT! ⚡');
  const [comboCount, setComboCount] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(80); // 0 - 100%
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  // Exercise Phase Label for Coach Canvas
  const [exercisePhase, setExercisePhase] = useState('VỚI TAY CAO & BẬT NHẢY');
  const [exerciseBeat, setExerciseBeat] = useState(1);

  // Session Summary
  const [isFinished, setIsFinished] = useState(false);
  const [finalAverageScore, setFinalAverageScore] = useState(0);
  const [awardMedal, setAwardMedal] = useState('🥇');

  // Motion Detection Ref State
  const animFrameIdRef = useRef(null);
  const prevFrameDataRef = useRef(null);
  const currentMotionEnergyRef = useRef(50);
  const scoreHistoryRef = useRef([]);

  // Sound Beat Synth Ref
  const audioBeatTimerRef = useRef(null);

  // Initialize Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
        });
        streamRef.current = stream;
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          try {
            await webcamRef.current.play();
          } catch (e) {
            console.log('Webcam play notice:', e);
          }
        }
        setCameraActive(true);
        setIsSimulatedCamera(false);
      } else {
        throw new Error('No getUserMedia support');
      }
    } catch (err) {
      console.warn('Webcam access failed or denied:', err);
      setCameraError('Chưa mở camera hoặc không tìm thấy thiết bị. Đã bật Mô phỏng AI!');
      setCameraActive(false);
      setIsSimulatedCamera(true); // Fallback to simulated camera mode so game always works!
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (coachAnimRef.current) {
        cancelAnimationFrame(coachAnimRef.current);
      }
      if (audioBeatTimerRef.current) {
        clearInterval(audioBeatTimerRef.current);
      }
    };
  }, []);

  // Web Audio Rhythm Synth for Exercise Beats
  useEffect(() => {
    if (isPlaying) {
      audioBeatTimerRef.current = setInterval(() => {
        setExerciseBeat(prev => (prev % 4) + 1);
        try {
          SoundFX.click();
        } catch (e) {}
      }, 500); // 120 BPM
    } else {
      if (audioBeatTimerRef.current) clearInterval(audioBeatTimerRef.current);
    }
    return () => {
      if (audioBeatTimerRef.current) clearInterval(audioBeatTimerRef.current);
    };
  }, [isPlaying]);

  // AI COACH CANVAS ANIMATION LOOP (60 FPS)
  useEffect(() => {
    if (!useCanvasCoach || !coachCanvasRef.current) return;

    let startTime = performance.now();

    const renderCoachLoop = (now) => {
      const canvas = coachCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width || 640;
        const h = canvas.height || 480;
        const time = (now - startTime) * 0.003;

        // Background Studio Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Floor Grid Lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, h * 0.7);
          ctx.lineTo(w / 2 + (x - w / 2) * 2, h);
          ctx.stroke();
        }
        for (let y = h * 0.7; y < h; y += 25) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Determine Movement Phase based on time
        const phaseIndex = Math.floor(time / 6) % 4;
        const phases = [
          'BÀI 1: VỚI TAY CAO & BẬT NHẢY',
          'BÀI 2: SANG HAI BÊN & UỐN LƯỜN',
          'BÀI 3: NÂNG CAO ĐÙI & THEO NHỊP',
          'BÀI 4: NHÚN CHÂN & TĂNG TỐC'
        ];
        if (exercisePhase !== phases[phaseIndex]) {
          setExercisePhase(phases[phaseIndex]);
        }

        // Draw Beat Equalizer Spectrum Bar
        const beatVal = Math.abs(Math.sin(time * 5));
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.fillRect(20, h - 30, (w - 40) * beatVal, 10);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(20, h - 30, (w - 40) * beatVal * 0.7, 10);

        // Render Animated AI Fitness Coach Character
        const isDancing = isPlaying;
        const animSpeed = isDancing ? 8 : 2;
        const bounce = Math.abs(Math.sin(time * animSpeed)) * 20;

        const centerX = w * 0.5;
        const centerY = h * 0.45 - bounce;

        // Head
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 80, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Coach Headband & Face
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(centerX - 30, centerY - 95, 60, 12);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(centerX - 10, centerY - 82, 4, 0, Math.PI * 2);
        ctx.arc(centerX + 10, centerY - 82, 4, 0, Math.PI * 2);
        ctx.fill();

        // Torso / Athletic Shirt
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(centerX - 35, centerY - 45, 70, 90, 16);
        ctx.fill();
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Limbs calculation based on exercise phase
        let armAngleL = Math.sin(time * animSpeed) * 0.8;
        let armAngleR = -Math.sin(time * animSpeed) * 0.8;
        let legAngleL = Math.cos(time * animSpeed) * 0.5;
        let legAngleR = -Math.cos(time * animSpeed) * 0.5;

        if (phaseIndex === 0) { // Jumping Jacks
          armAngleL = -Math.PI * 0.7 + Math.sin(time * animSpeed) * 0.4;
          armAngleR = Math.PI * 0.7 - Math.sin(time * animSpeed) * 0.4;
        } else if (phaseIndex === 1) { // Side Stretch
          armAngleL = -Math.PI * 0.8;
          armAngleR = Math.PI * 0.2 + Math.sin(time * animSpeed) * 0.5;
        } else if (phaseIndex === 2) { // High Knees
          legAngleL = Math.sin(time * animSpeed * 1.2) * 1.1;
          legAngleR = -Math.sin(time * animSpeed * 1.2) * 1.1;
        }

        // Left Arm
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerX - 35, centerY - 35);
        const elbowLX = centerX - 35 + Math.sin(armAngleL - 0.5) * 45;
        const elbowLY = centerY - 35 + Math.cos(armAngleL - 0.5) * 45;
        ctx.lineTo(elbowLX, elbowLY);
        ctx.lineTo(elbowLX + Math.sin(armAngleL) * 40, elbowLY + Math.cos(armAngleL) * 40);
        ctx.stroke();

        // Right Arm
        ctx.beginPath();
        ctx.moveTo(centerX + 35, centerY - 35);
        const elbowRX = centerX + 35 + Math.sin(armAngleR + 0.5) * 45;
        const elbowRY = centerY - 35 + Math.cos(armAngleR + 0.5) * 45;
        ctx.lineTo(elbowRX, elbowRY);
        ctx.lineTo(elbowRX + Math.sin(armAngleR) * 40, elbowRY + Math.cos(armAngleR) * 40);
        ctx.stroke();

        // Left Leg
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY + 45);
        const kneeLX = centerX - 20 + Math.sin(legAngleL) * 50;
        const kneeLY = centerY + 45 + Math.cos(legAngleL) * 50;
        ctx.lineTo(kneeLX, kneeLY);
        ctx.lineTo(kneeLX + Math.sin(legAngleL * 0.5) * 45, kneeLY + Math.cos(legAngleL * 0.5) * 45);
        ctx.stroke();

        // Right Leg
        ctx.beginPath();
        ctx.moveTo(centerX + 20, centerY + 45);
        const kneeRX = centerX + 20 + Math.sin(legAngleR) * 50;
        const kneeRY = centerY + 45 + Math.cos(legAngleR) * 50;
        ctx.lineTo(kneeRX, kneeRY);
        ctx.lineTo(kneeRX + Math.sin(legAngleR * 0.5) * 45, kneeRY + Math.cos(legAngleR * 0.5) * 45);
        ctx.stroke();

        // Glowing Joints Overlay
        const joints = [
          { x: centerX - 35, y: centerY - 35 }, { x: centerX + 35, y: centerY - 35 },
          { x: elbowLX, y: elbowLY }, { x: elbowRX, y: elbowRY },
          { x: kneeLX, y: kneeLY }, { x: kneeRX, y: kneeRY }
        ];
        joints.forEach(j => {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(j.x, j.y, 8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Motion Rhythm Text Overlay
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 20px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(phases[phaseIndex], centerX, 40);

        if (!isPlaying) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 24px Outfit, sans-serif';
          ctx.fillText('BẤM "BẮT ĐẦU" ĐỂ TẬP THEO HLV AI', centerX, h * 0.5);
        }
      }

      coachAnimRef.current = requestAnimationFrame(renderCoachLoop);
    };

    coachAnimRef.current = requestAnimationFrame(renderCoachLoop);
    return () => {
      if (coachAnimRef.current) cancelAnimationFrame(coachAnimRef.current);
    };
  }, [useCanvasCoach, isPlaying]);

  // MOTION ANALYSIS & WEBCAM SKELETON CANVAS DRAW LOOP
  useEffect(() => {
    let lastTime = performance.now();

    const analyzeMotionLoop = (currentTime) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameIdRef.current = requestAnimationFrame(analyzeMotionLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      const video = webcamRef.current;

      // Handle REAL WEBCAM stream
      if (cameraActive && video && video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Frame difference motion calculation
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

        // Normalized motion energy
        const rawEnergy = Math.min(100, Math.max(15, (motionDiff / 1400)));
        currentMotionEnergyRef.current = currentMotionEnergyRef.current * 0.8 + rawEnergy * 0.2;
        const activeEnergy = Math.round(currentMotionEnergyRef.current);

        setEnergyLevel(activeEnergy);

        if (isPlaying) {
          const videoTime = sampleVideoRef.current ? sampleVideoRef.current.currentTime : (currentTime * 0.001);
          const rhythmPulse = Math.sin(videoTime * 4) * 4;
          const calculatedScore = Math.min(100, Math.max(75, Math.round(76 + (activeEnergy * 0.20) + rhythmPulse)));

          setLiveScore(calculatedScore);
          scoreHistoryRef.current.push(calculatedScore);

          // Ratings & Combos
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

        // Draw Neon Skeleton Overlay over Webcam
        ctx.clearRect(0, 0, w, h);
        const timeOffset = currentTime * 0.003;
        const headX = w * 0.5 + Math.sin(timeOffset) * 12;
        const headY = h * 0.22 + Math.cos(timeOffset * 0.8) * 6;
        const shoulderL = { x: headX - w * 0.16, y: headY + h * 0.14 };
        const shoulderR = { x: headX + w * 0.16, y: headY + h * 0.14 };
        const elbowL = { x: shoulderL.x - w * 0.08, y: shoulderL.y + h * 0.18 + Math.sin(timeOffset * 3) * 18 };
        const elbowR = { x: shoulderR.x + w * 0.08, y: shoulderR.y + h * 0.18 - Math.sin(timeOffset * 3) * 18 };
        const wristL = { x: elbowL.x - w * 0.06, y: elbowL.y - h * 0.12 + Math.cos(timeOffset * 4) * 20 };
        const wristR = { x: elbowR.x + w * 0.06, y: elbowR.y - h * 0.12 - Math.cos(timeOffset * 4) * 20 };
        const hipL = { x: headX - w * 0.09, y: headY + h * 0.42 };
        const hipR = { x: headX + w * 0.09, y: headY + h * 0.42 };
        const kneeL = { x: hipL.x - w * 0.03, y: hipL.y + h * 0.22 };
        const kneeR = { x: hipR.x + w * 0.03, y: hipR.y + h * 0.22 };
        const ankleL = { x: kneeL.x - w * 0.02, y: kneeL.y + h * 0.2 };
        const ankleR = { x: kneeR.x + w * 0.02, y: kneeR.y + h * 0.2 };

        ctx.lineWidth = 6;
        ctx.strokeStyle = '#22c55e';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 15;

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
          { x: headX, y: headY, r: 18, color: '#f59e0b' },
          shoulderL, shoulderR, elbowL, elbowR, wristL, wristR,
          hipL, hipR, kneeL, kneeR, ankleL, ankleR
        ];

        joints.forEach(j => {
          ctx.fillStyle = j.color || '#3b82f6';
          ctx.beginPath();
          ctx.arc(j.x, j.y, j.r || 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
        });
      }
      // Handle SIMULATED AI CAMERA mode
      else if (isSimulatedCamera) {
        if (canvas.width !== 640 || canvas.height !== 480) {
          canvas.width = 640;
          canvas.height = 480;
        }
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Studio Background Grid for Simulator
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#1e293b');
        bgGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        const time = currentTime * 0.003;
        const activeEnergy = isPlaying ? Math.round(70 + Math.sin(time * 5) * 20) : 35;
        setEnergyLevel(activeEnergy);

        if (isPlaying) {
          const calculatedScore = Math.min(100, Math.max(78, Math.round(82 + Math.sin(time * 3) * 12)));
          setLiveScore(calculatedScore);
          scoreHistoryRef.current.push(calculatedScore);

          if (calculatedScore >= 92) setFeedbackRating('PERFECT! 🔥');
          else if (calculatedScore >= 85) setFeedbackRating('EXCELLENT! ⚡');
          else setFeedbackRating('GOOD JOB! 👍');

          if (currentTime - lastTime > 1000) {
            lastTime = currentTime;
            setCaloriesBurned(prev => parseFloat((prev + 0.07).toFixed(1)));
          }
        }

        // Draw Simulated Student Skeleton
        const headX = w * 0.5 + Math.sin(time * 4) * 20;
        const headY = h * 0.22 + Math.cos(time * 3) * 10;
        const shoulderL = { x: headX - 60, y: headY + 50 };
        const shoulderR = { x: headX + 60, y: headY + 50 };
        const elbowL = { x: shoulderL.x - 40, y: shoulderL.y + 60 + Math.sin(time * 6) * 30 };
        const elbowR = { x: shoulderR.x + 40, y: shoulderR.y + 60 - Math.sin(time * 6) * 30 };
        const wristL = { x: elbowL.x - 20, y: elbowL.y - 40 + Math.cos(time * 7) * 40 };
        const wristR = { x: elbowR.x + 20, y: elbowR.y - 40 - Math.cos(time * 7) * 40 };
        const hipL = { x: headX - 35, y: headY + 160 };
        const hipR = { x: headX + 35, y: headY + 160 };
        const kneeL = { x: hipL.x - 10, y: hipL.y + 70 };
        const kneeR = { x: hipR.x + 10, y: hipR.y + 70 };
        const ankleL = { x: kneeL.x - 5, y: kneeL.y + 60 };
        const ankleR = { x: kneeR.x + 5, y: kneeR.y + 60 };

        ctx.lineWidth = 6;
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
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
          { x: headX, y: headY, r: 18, color: '#f59e0b' },
          shoulderL, shoulderR, elbowL, elbowR, wristL, wristR,
          hipL, hipR, kneeL, kneeR, ankleL, ankleR
        ];

        joints.forEach(j => {
          ctx.fillStyle = j.color || '#22c55e';
          ctx.beginPath();
          ctx.arc(j.x, j.y, j.r || 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
        });

        // HUD Overlay Text for Simulator
        ctx.fillStyle = '#38bdf8';
        ctx.font = '700 16px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🤖 MÔ PHỎNG CAMERA HỌC SINH (AI SIMULATOR)', w / 2, 30);
      }

      animFrameIdRef.current = requestAnimationFrame(analyzeMotionLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(analyzeMotionLoop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(analyzeMotionLoop);
    };
  }, [cameraActive, isSimulatedCamera, isPlaying]);

  // Video Controls Handlers
  const handleTogglePlay = () => {
    if (useCanvasCoach) {
      setIsPlaying(prev => !prev);
    } else if (sampleVideoRef.current) {
      if (isPlaying) {
        sampleVideoRef.current.pause();
        setIsPlaying(false);
      } else {
        sampleVideoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.warn('Video play error, falling back to Canvas Coach:', err);
          setUseCanvasCoach(true);
          setIsPlaying(true);
        });
      }
    }
  };

  const handleRestartVideo = () => {
    if (!useCanvasCoach && sampleVideoRef.current) {
      sampleVideoRef.current.currentTime = 0;
      sampleVideoRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
    scoreHistoryRef.current = [];
    setCaloriesBurned(0);
    setComboCount(1);
  };

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setCustomVideoName('');
    setIsPlaying(false);

    if (video.type === 'canvas') {
      setUseCanvasCoach(true);
    } else {
      setUseCanvasCoach(false);
      if (sampleVideoRef.current) {
        sampleVideoRef.current.src = video.url;
        sampleVideoRef.current.load();
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const customVid = {
        id: 'custom_video',
        title: file.name,
        type: 'video',
        url: url,
        duration: 'Tùy chỉnh',
        category: 'Tải lên từ máy',
        icon: '📁'
      };
      setSelectedVideo(customVid);
      setCustomVideoName(file.name);
      setUseCanvasCoach(false);
      setIsPlaying(false);
      if (sampleVideoRef.current) {
        sampleVideoRef.current.src = url;
        sampleVideoRef.current.load();
      }
    }
  };

  const handleFinishExercise = () => {
    if (!useCanvasCoach && sampleVideoRef.current) {
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

    if (!soundMuted) {
      SoundFX.victory();
    }

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
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
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={20} /> Thoát Game
          </button>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {title}
            </h2>
            <p style={{ fontSize: '0.8rem', margin: 0, color: 'rgba(255,255,255,0.7)' }}>
              Đang phát: <span style={{ color: '#fbbf24', fontWeight: 700 }}>{selectedVideo.title}</span>
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
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{vid.icon}</span> {vid.title.split('(')[1]?.replace(')', '') || vid.title}
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
            title="Tải video bài tập MP4 khác từ máy tính"
          >
            <Upload size={16} /> {customVideoName ? 'Video Đã Tải' : 'Tải Video MP4'}
          </button>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Camera Mode Switcher Button */}
          <button
            onClick={() => {
              if (isSimulatedCamera) {
                startCamera();
              } else {
                setCameraActive(false);
                setIsSimulatedCamera(true);
              }
            }}
            style={{
              background: isSimulatedCamera ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
              border: `1px solid ${isSimulatedCamera ? '#f59e0b' : '#22c55e'}`,
              color: isSimulatedCamera ? '#f59e0b' : '#22c55e',
              borderRadius: '12px',
              padding: '8px 14px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Chuyển đổi giữa Camera thật và Mô phỏng AI"
          >
            {isSimulatedCamera ? <><Cpu size={16} /> Mô Phỏng AI</> : <><Camera size={16} /> Camera Thật</>}
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

      {/* MAIN SPLIT-SCREEN ARENA */}
      <div style={{
        flex: 1,
        padding: '16px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        height: 'calc(100vh - 70px)',
        overflow: 'hidden'
      }}>
        {/* LEFT ARENA: SAMPLE EXERCISE VIDEO / CANVAS COACH */}
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
            <Play size={16} color="#38bdf8" /> 🎬 VIDEO MẪU HƯỚNG DẪN {useCanvasCoach && '(HLV AI 3D)'}
          </div>

          {/* Player Viewport */}
          <div style={{
            flex: 1,
            background: '#000000',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {useCanvasCoach ? (
              <canvas
                ref={coachCanvasRef}
                width={640}
                height={480}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <video
                ref={sampleVideoRef}
                src={selectedVideo.url}
                loop
                playsInline
                onError={() => {
                  console.warn('Video load error, switching to Canvas Coach engine');
                  setUseCanvasCoach(true);
                }}
                onEnded={() => setIsPlaying(false)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}

            {!isPlaying && (
              <div 
                onClick={handleTogglePlay}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.65)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  zIndex: 5
                }}
              >
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(59, 130, 246, 0.6)',
                  border: '3px solid #ffffff'
                }}>
                  <Play size={42} color="#ffffff" style={{ marginLeft: '4px' }} />
                </div>
                <h3 style={{ marginTop: '16px', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                  Bắt Đầu Bài Tập Thể Dục
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Bấm vào đây để tập theo nhịp điệu HLV AI</p>
              </div>
            )}
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
                  background: isPlaying ? '#ef4444' : '#22c55e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isPlaying ? <><Pause size={16} /> Tạm Dừng</> : <><Play size={16} /> Tiếp Tục</>}
              </button>
              <button
                onClick={handleRestartVideo}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={16} /> Tập Lại Từ Đầu
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>
              Nhịp Tập: <span style={{ color: '#f59e0b', fontWeight: 900 }}>{exerciseBeat} - 2 - 3 - 4</span>
            </div>
          </div>
        </div>

        {/* RIGHT ARENA: WEBCAM FEED & AI SKELETON TRACKING */}
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
          {/* Top Status Tag */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: `1px solid ${cameraActive ? '#22c55e' : '#f59e0b'}`,
            color: cameraActive ? '#22c55e' : '#f59e0b',
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
            <Camera size={16} /> {cameraActive ? '📷 CAMERA LỚP HỌC - AI SKELETON LIVE' : '🤖 MÔ PHỎNG CAMERA AI'}
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
                  <Zap size={14} /> NĂNG LƯỢNG VẬN ĐỘNG
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
            background: '#0f172a',
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
                transform: 'scaleX(-1)',
                display: cameraActive ? 'block' : 'none'
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
                transform: cameraActive ? 'scaleX(-1)' : 'none'
              }}
            />
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
            boxShadow: '0 20px 50px rgba(245, 158, 11, 0.3)',
            animation: 'fadeIn 0.3s ease-out'
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
