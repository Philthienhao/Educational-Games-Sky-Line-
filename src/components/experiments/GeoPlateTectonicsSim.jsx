import React, { useRef, useEffect, useState } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Layers, 
  Compass, 
  HelpCircle, 
  Flame, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2,
  Info,
  ChevronRight,
  RefreshCw,
  Sliders,
  Globe,
  BookOpen
} from "lucide-react";

export function GeoPlateTectonicsSim({ experiment, onLog, isFullscreen, toggleFullscreen }) {
  const canvasRef = useRef(null);
  
  // State variables
  const [scene, setScene] = useState("oc"); // "oc" | "cc" | "rift" | "ridge"
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 -> 100% (represents 0 -> 100 Ma)
  const [speed, setSpeed] = useState(1); // 0.5x, 1x, 2x
  
  // Visual Toggles
  const [showConvection, setShowConvection] = useState(true);
  const [showSeismograph, setShowSeismograph] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [drilledSample, setDrilledSample] = useState(null);
  
  // Quiz Modal State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Seismograph data buffer
  const seisBufRef = useRef(new Array(80).fill(0));
  const seisAmpRef = useRef(0);

  // Particles ref for magma/ash/bubbles
  const particlesRef = useRef([]);

  // Quiz Questions Bank
  const quizQuestions = [
    {
      question: "Khi mảng đại dương Nazca chìm dưới mảng lục địa Nam Mỹ, địa hình nào được hình thành tại ranh giới va chạm?",
      options: [
        "Sống núi giữa đại dương và đảo núi lửa",
        "Vực sâu đại dương (Peru-Chile) và dãy núi uốn nếp cao (Andes)",
        "Thung lũng tách giãn lục địa Đông Phi",
        "Sơn nguyên rộng lớn không có núi"
      ],
      correct: 1,
      explanation: "Mảng đại dương dày và nặng hơn bị đẩy uốn chìm xuống manti hình thành Vực sâu đại dương, đồng thời vỏ lục địa bị nén uốn nếp nâng cao thành dãy Andes."
    },
    {
      question: "Tại sao trên đỉnh núi Everest (dãy Himalaya) cao gần 9000m lại tìm thấy hóa thạch sinh vật biển?",
      options: [
        "Do nước biển cổ đại từng dâng cao bao phủ toàn bộ Trái Đất",
        "Do sinh vật biển tự di chuyển lên đỉnh núi",
        "Do đại dương Tethys bị khép lại, lớp trầm tích đáy biển bị nén ép uốn nếp nâng cao lên",
        "Do hiện tượng núi lửa phun trào mang hóa thạch từ lòng đất lên"
      ],
      correct: 2,
      explanation: "Sự va chạm giữa mảng Ấn Độ và mảng Á - Âu đã khép kín đại dương Tethys cổ, dồn ép các lớp đá trầm tích chứa hóa thạch đáy biển nâng lên đỉnh núi Himalaya."
    },
    {
      question: "Kết quả của sự tách giãn mảng lục địa ở Đông Phi là gì?",
      options: [
        "Hình thành sống núi ngầm đại dương",
        "Hình thành Thung lũng tách giãn Đông Phi, chuỗi hồ đứt gãy và tương lai phát triển thành biển mới (Biển Đỏ)",
        "Hình thành dãy núi cao uốn nếp",
        "Hình thành dải sọc từ tính đảo cực"
      ],
      correct: 1,
      explanation: "Cột magma manti (Mantle Plume) dâng lên làm vồng vỏ lục địa, nứt vỡ sụt lở tạo thung lũng tách giãn và biển hẹp."
    },
    {
      question: "Tại sống núi giữa Đại Tây Dương, các dải đá trầm tích/basalt đối xứng có đặc điểm gì về độ tuổi?",
      options: [
        "Càng xa sống núi đá càng trẻ",
        "Càng gần sống núi đá càng già",
        "Càng gần sống núi đá càng trẻ (0 Ma), càng xa sống núi đá càng già",
        "Độ tuổi đá ngẫu nhiên không có quy luật"
      ],
      correct: 2,
      explanation: "Magma trào dâng đông đặc tạo vỏ đại dương mới ngay tại trục sống núi (0 Ma), các lớp vỏ cũ hơn bị liên tục đẩy ra xa hai bên."
    },
    {
      question: "Động lực chính làm dịch chuyển các mảng kiến tạo thạch quyển là gì?",
      options: [
        "Lực hấp dẫn của Mặt Trăng và Mặt Trời",
        "Các dòng đối lưu vật chất quánh dẻo trong lớp manti (Astenosphere)",
        "Sức gió và dòng chảy đại dương trên bề mặt",
        "Sự tự quay quanh trục của Trái Đất"
      ],
      correct: 1,
      explanation: "Nhiệt năng tích tụ trong lòng Trái Đất sinh ra các dòng đối lưu vật chất quánh dẻo ở lớp manti, tác dụng lực kéo di chuyển các mảng thạch quyển nổi phía trên."
    }
  ];

  // Helper Smoothstep Function
  const sm = (e0, e1, x) => {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };

  // Integrator for Subductive Slab Path
  const getSlabPath = (x0, y0, maxAng, sb, bendLen, maxLen) => {
    const pts = [{ x: x0, y: y0 }];
    let x = x0, y = y0, s = 0;
    const ds = 4;
    while (s < maxLen) {
      const a = maxAng * sm(sb, sb + bendLen, s);
      x += Math.cos(a) * ds;
      y += Math.sin(a) * ds;
      pts.push({ x, y });
      s += ds;
    }
    return pts;
  };

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let p = progress;

    const render = () => {
      // Step simulation timeline
      if (isPlaying) {
        p = (p + 0.12 * speed) % 100;
        setProgress(p);

        // Random trigger earthquakes
        if (Math.random() < 0.03) {
          seisAmpRef.current = Math.min(1.0, seisAmpRef.current + Math.random() * 0.6);
        }
      }

      const q = p / 100; // Normalized progress 0..1

      // 1. Clear background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Render Asthenosphere Mantle
      const mantleGrad = ctx.createLinearGradient(0, 200, 0, 560);
      mantleGrad.addColorStop(0, "#7c2d12");
      mantleGrad.addColorStop(0.4, "#451a03");
      mantleGrad.addColorStop(1, "#180e0a");
      ctx.fillStyle = mantleGrad;
      ctx.fillRect(0, 190, 1000, 370);

      // Mantle convection vectors stream
      if (showConvection) {
        ctx.strokeStyle = "rgba(249, 115, 22, 0.22)";
        ctx.lineWidth = 2;
        const time = Date.now() * 0.002;

        const drawConvectionCell = (cx, cy, w, h, dir) => {
          for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 6; col++) {
              const rx = cx - w/2 + (col / 5) * w;
              const ry = cy - h/2 + (row / 3) * h;
              
              const X = (rx - (cx - w/2)) / w;
              const Y = (ry - (cy - h/2)) / h;
              
              const vx = dir * Math.PI * Math.sin(Math.PI * X) * Math.cos(Math.PI * Y);
              const vy = -dir * Math.PI * (h / w) * Math.cos(Math.PI * X) * Math.sin(Math.PI * Y);
              
              const angle = Math.atan2(vy, vx) + (dir > 0 ? time : -time);
              const len = 12;

              ctx.beginPath();
              ctx.moveTo(rx, ry);
              ctx.lineTo(rx + Math.cos(angle) * len, ry + Math.sin(angle) * len);
              ctx.stroke();
            }
          }
        };

        if (scene === "oc") {
          drawConvectionCell(300, 360, 380, 240, 1);
          drawConvectionCell(700, 360, 380, 240, -1);
        } else if (scene === "cc") {
          drawConvectionCell(300, 360, 380, 240, 1);
          drawConvectionCell(700, 360, 380, 240, -1);
        } else if (scene === "rift" || scene === "ridge") {
          drawConvectionCell(300, 360, 380, 240, -1);
          drawConvectionCell(700, 360, 380, 240, 1);
        }
      }

      // 3. Render Specific Geological Scenario
      if (scene === "oc") {
        // --- SCENARIO 1: Continental - Oceanic Convergence ---
        const subX = 480 - q * 60;
        const slab = getSlabPath(subX, 190, 0.78, 40, 130, 340);

        // Draw Oceanic Crust (Subducting)
        ctx.beginPath();
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 18;
        ctx.lineCap = "round";
        ctx.moveTo(subX - 450, 190);
        slab.forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.stroke();

        // Trench Dip
        ctx.fillStyle = "#0369a1";
        ctx.beginPath();
        ctx.moveTo(subX - 300, 190);
        ctx.lineTo(subX, 190);
        ctx.lineTo(subX + 35, 225);
        ctx.lineTo(subX - 300, 225);
        ctx.fill();

        // Overriding Continental Crust & Andes Mountain Range
        ctx.beginPath();
        ctx.fillStyle = "#78350f";
        ctx.moveTo(subX + 35, 190);
        for (let x = subX + 35; x <= 1000; x += 8) {
          const mtnH = Math.sin((x - subX) * 0.04) * 45 * q * Math.exp(-((x - (subX + 160)) ** 2) / 16000);
          ctx.lineTo(x, 190 - Math.max(0, mtnH));
        }
        ctx.lineTo(1000, 320);
        ctx.lineTo(subX + 110, 320);
        ctx.fill();

        // Snowcaps on high peaks
        if (q > 0.4) {
          ctx.fillStyle = "#f8fafc";
          ctx.beginPath();
          const peakX = subX + 160;
          const peakY = 190 - 45 * q;
          ctx.moveTo(peakX - 25, peakY + 20);
          ctx.lineTo(peakX, peakY);
          ctx.lineTo(peakX + 25, peakY + 20);
          ctx.fill();
        }

        // Magma Chamber & Volcano Eruption at 100km depth
        if (q > 0.3) {
          const magX = subX + 160;
          const magY = 280 - (q - 0.3) * 80;

          // Conduit
          ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(magX, 320);
          ctx.lineTo(magX, 190 - 45 * q);
          ctx.stroke();

          // Chamber
          const pulse = Math.sin(Date.now() * 0.01) * 4;
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(magX, magY, 18 + pulse, 0, Math.PI * 2);
          ctx.fill();

          // Ash Particles & Lava
          if (isPlaying && Math.random() < 0.4) {
            particlesRef.current.push({
              x: magX + (Math.random() - 0.5) * 10,
              y: 190 - 45 * q,
              vx: (Math.random() - 0.5) * 2,
              vy: -Math.random() * 3 - 2,
              life: 1,
              color: Math.random() > 0.5 ? "#f97316" : "#64748b"
            });
          }
        }

        // Ocean Water Level
        ctx.fillStyle = "rgba(14, 165, 233, 0.45)";
        ctx.fillRect(0, 120, subX + 35, 70);

        // Labels
        if (showLabels) {
          ctx.fillStyle = "#38bdf8";
          ctx.font = "bold 12px Inter, sans-serif";
          ctx.fillText("MẢNG ĐẠI DƯƠNG (NAZCA)", subX - 240, 175);

          ctx.fillStyle = "#fde047";
          ctx.fillText("MẢNG LỤC ĐỊA (NAM MỸ)", subX + 220, 160);

          ctx.fillStyle = "#38bdf8";
          ctx.fillText("VỰC SÂU PERU - CHI-LÊ", subX - 30, 235);

          ctx.fillStyle = "#ef4444";
          ctx.fillText("DÃY ANDES & NÚI LỬA", subX + 110, 120 - 45 * q);
        }

      } else if (scene === "cc") {
        // --- SCENARIO 2: Continental - Continental Convergence ---
        const collisionX = 500;
        const leftWidth = 420 + q * 30;
        const rightWidth = 420 + q * 30;

        // Left Continental Crust (India)
        ctx.fillStyle = "#92400e";
        ctx.fillRect(0, 160, leftWidth, 90);

        // Right Continental Crust (Eurasia)
        ctx.fillStyle = "#78350f";
        ctx.fillRect(1000 - rightWidth, 160, rightWidth, 90);

        // Fold Mountain Uplift & Crustal Thickening (70km)
        ctx.beginPath();
        ctx.fillStyle = "#b45309";
        ctx.moveTo(collisionX - 160, 160);
        for (let x = collisionX - 160; x <= collisionX + 160; x += 4) {
          const foldH = 100 * q * Math.sin((x - (collisionX - 160)) / 14) * Math.exp(-((x - collisionX) ** 2) / 6000);
          ctx.lineTo(x, 160 - Math.max(0, foldH));
        }
        ctx.lineTo(collisionX + 160, 250 + q * 50); // Deep root thickening
        ctx.lineTo(collisionX - 160, 250 + q * 50);
        ctx.fill();

        // Snowcaps on Everest Peak
        if (q > 0.3) {
          ctx.fillStyle = "#f8fafc";
          ctx.beginPath();
          const peakY = 160 - 95 * q;
          ctx.moveTo(collisionX - 35, peakY + 30);
          ctx.lineTo(collisionX, peakY);
          ctx.lineTo(collisionX + 35, peakY + 30);
          ctx.fill();

          // Marine Fossils Badge Indicator
          ctx.fillStyle = "#06b6d4";
          ctx.beginPath();
          ctx.arc(collisionX - 10, peakY + 45, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Tethys Sea remnant water (Closing down)
        if (q < 0.7) {
          ctx.fillStyle = `rgba(14, 165, 233, ${0.5 * (1 - q / 0.7)})`;
          ctx.fillRect(collisionX - 80 * (1 - q), 120, 160 * (1 - q), 40);
        }

        // Labels
        if (showLabels) {
          ctx.fillStyle = "#fde047";
          ctx.font = "bold 12px Inter, sans-serif";
          ctx.fillText("MẢNG ẤN ĐỘ", 150, 145);
          ctx.fillText("MẢNG Á - ÂU", 750, 145);

          ctx.fillStyle = "#38bdf8";
          ctx.fillText("DÃY HIMALAYA (ĐỈNH EVEREST)", collisionX - 90, 130 - 95 * q);
          if (q > 0.4) {
            ctx.fillStyle = "#22d3ee";
            ctx.fillText("🐚 HÓA THẠCH BIỂN CỔ", collisionX + 15, 160 - 95 * q + 50);
          }
        }

      } else if (scene === "rift") {
        // --- SCENARIO 3: Continental Rift (East Africa) ---
        const riftCenter = 500;
        const gap = q * 110;

        // Mantle Plume Thermal Dome
        ctx.fillStyle = "rgba(239, 68, 68, 0.75)";
        ctx.beginPath();
        ctx.ellipse(riftCenter, 270, 70 + q * 40, 100, 0, 0, Math.PI * 2);
        ctx.fill();

        // Left Block (Subsiding Graben)
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.moveTo(0, 170);
        ctx.lineTo(riftCenter - gap / 2 - 40, 170);
        ctx.lineTo(riftCenter - gap / 2, 210 + q * 25);
        ctx.lineTo(riftCenter - gap / 2, 270);
        ctx.lineTo(0, 270);
        ctx.fill();

        // Right Block
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.moveTo(1000, 170);
        ctx.lineTo(riftCenter + gap / 2 + 40, 170);
        ctx.lineTo(riftCenter + gap / 2, 210 + q * 25);
        ctx.lineTo(riftCenter + gap / 2, 270);
        ctx.lineTo(1000, 270);
        ctx.fill();

        // Graben Valley Floor
        ctx.fillStyle = "#451a03";
        ctx.fillRect(riftCenter - gap / 2, 210 + q * 25, gap, 60);

        // Water Filling Valley (Rift Lake / Red Sea Stage)
        if (q > 0.3) {
          ctx.fillStyle = "rgba(14, 165, 233, 0.65)";
          const waterH = Math.min(40, (q - 0.3) * 60);
          ctx.fillRect(riftCenter - gap / 2, 210 + q * 25 - waterH, gap, waterH);
        }

        // Normal Fault Lines
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(riftCenter - gap / 2 - 40, 170);
        ctx.lineTo(riftCenter - gap / 2, 210 + q * 25);
        ctx.moveTo(riftCenter + gap / 2 + 40, 170);
        ctx.lineTo(riftCenter + gap / 2, 210 + q * 25);
        ctx.stroke();
        ctx.setLineDash([]);

        if (showLabels) {
          ctx.fillStyle = "#fde047";
          ctx.font = "bold 12px Inter, sans-serif";
          ctx.fillText("THUNG LŨNG TÁCH GIÃN ĐÔNG PHI", riftCenter - 110, 150);
          ctx.fillStyle = "#ef4444";
          ctx.fillText("🔥 MANTLE PLUME (CỘT MAGMA)", riftCenter - 90, 310);
        }

      } else if (scene === "ridge") {
        // --- SCENARIO 4: Mid-Ocean Ridge Seafloor Spreading ---
        const ridgeX = 500;

        // Seafloor Plate Left & Right
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 210, 1000, 120);

        // Geomagnetic Polarity Reversal Stripes
        const stripes = [
          { age: "Brunhes (Chính)", width: 45, color: "#38bdf8" },
          { age: "Matuyama (Đảo)", width: 65, color: "#f43f5e" },
          { age: "Gauss (Chính)", width: 55, color: "#38bdf8" },
          { age: "Gilbert (Đảo)", width: 75, color: "#f43f5e" }
        ];

        // Render symmetric magnetic stripes from ridge outwards
        let currentOffset = 0;
        stripes.forEach((stripe) => {
          const w = stripe.width;

          // Right side
          ctx.fillStyle = stripe.color;
          ctx.fillRect(ridgeX + currentOffset, 210, w, 40);

          // Left side
          ctx.fillRect(ridgeX - currentOffset - w, 210, w, 40);

          currentOffset += w;
        });

        // Ridge Axis Conduit & Magma Accretion
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(ridgeX - 12, 210, 24, 150);

        // Water Body
        ctx.fillStyle = "rgba(14, 165, 233, 0.45)";
        ctx.fillRect(0, 80, 1000, 130);

        // Core Drilling Visualizer (if sample drilled)
        if (drilledSample) {
          ctx.strokeStyle = "#fde047";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(drilledSample.x, 80);
          ctx.lineTo(drilledSample.x, 210);
          ctx.stroke();

          ctx.fillStyle = drilledSample.hslColor;
          ctx.beginPath();
          ctx.arc(drilledSample.x, 210, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        if (showLabels) {
          ctx.fillStyle = "#fde047";
          ctx.font = "bold 12px Inter, sans-serif";
          ctx.fillText("SỐNG NÚI GIỮA ĐẠI TÂY DƯƠNG", ridgeX - 100, 70);
          ctx.fillStyle = "#38bdf8";
          ctx.fillText("⟵ VỎ ĐẠI DƯƠNG CŨ", ridgeX - 320, 195);
          ctx.fillText("VỎ ĐẠI DƯƠNG CŨ ⟶", ridgeX + 200, 195);
        }
      }

      // 4. Update & Draw Particles (Lava / Ash / Bubbles)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.02;

        if (pt.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3 * pt.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 5. Draw Seismograph HUD Widget (if enabled)
      if (showSeismograph) {
        // Seismograph wave decay
        const phase = Date.now() * 0.025;
        const wave = Math.sin(phase) * (Math.random() * 0.4 + 0.6);
        const noise = (Math.random() - 0.5) * 0.04;
        
        seisBufRef.current.shift();
        seisBufRef.current.push(noise + seisAmpRef.current * wave);
        seisAmpRef.current *= 0.982; // Exponential Decay

        // Draw Seismograph Box
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(16, 16, 260, 80, 12);
        } else {
          ctx.rect(16, 16, 260, 80);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.fillText("MÁY ĐO ĐỊA CHẤN (SEISMOGRAPH)", 28, 34);

        // Draw Waveform Line
        ctx.beginPath();
        ctx.strokeStyle = seisAmpRef.current > 0.3 ? "#ef4444" : "#22c55e";
        ctx.lineWidth = 2;
        seisBufRef.current.forEach((val, idx) => {
          const wx = 28 + (idx / 80) * 236;
          const wy = 64 + val * 22;
          if (idx === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        });
        ctx.stroke();

        // Richter Reading
        const richter = (seisAmpRef.current * 7.5).toFixed(1);
        ctx.fillStyle = seisAmpRef.current > 0.3 ? "#ef4444" : "#94a3b8";
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.fillText(`CƯỜNG ĐỘ: ${richter} RICHTER`, 160, 34);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [scene, isPlaying, speed, showConvection, showSeismograph, showLabels, progress, drilledSample]);

  // Handle Drilling Core Sample Click
  const handleCanvasClick = (e) => {
    if (scene !== "ridge") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 1000;
    const clickY = ((e.clientY - rect.top) / rect.height) * 560;

    // Check if clicked in ocean crust area
    if (clickY >= 180 && clickY <= 260) {
      const distFromRidge = Math.abs(clickX - 500);
      const ageMa = (distFromRidge / 42).toFixed(2); // Age calculation
      const hue = Math.min(240, (ageMa / 10.7) * 230);
      const hslColor = `hsl(${hue}, 75%, 45%)`;

      setDrilledSample({
        x: clickX,
        ageMa,
        hslColor,
        location: clickX < 500 ? "Mảng Đại Dương Tây" : "Mảng Đại Dương Đông"
      });

      if (onLog) {
        onLog(`[Khoan Mẫu Đá] Vị trí X=${Math.round(clickX)}px - Tuổi địa chất: ${ageMa} Ma (Triệu năm).`);
      }
    }
  };

  // Trigger Quiz Option Select
  const handleSelectQuizOption = (optIdx) => {
    if (quizSubmitted) return;
    setSelectedAnswer(optIdx);
  };

  // Submit Quiz Answer
  const handleSubmitQuizAnswer = () => {
    if (selectedAnswer === null || quizSubmitted) return;
    setQuizSubmitted(true);
    if (selectedAnswer === quizQuestions[currentQuizIdx].correct) {
      setQuizScore(prev => prev + 20);
    }
  };

  // Next Quiz Question
  const handleNextQuizQuestion = () => {
    if (currentQuizIdx < quizQuestions.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 text-slate-100 font-sans">
      
      {/* Top Banner Control Panel */}
      <div style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
        borderRadius: "20px",
        padding: "20px 24px",
        border: "1.5px solid rgba(56, 189, 248, 0.3)",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px"
      }}>
        {/* Title & Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
            width: "48px", height: "48px", borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 18px rgba(2, 132, 199, 0.4)"
          }}>
            <Globe size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                background: "#0369a1", color: "#ffffff", fontSize: "0.7rem",
                fontWeight: 900, padding: "3px 8px", borderRadius: "6px", textTransform: "uppercase"
              }}>
                Địa Lý 10 - GDPT 2018
              </span>
              <span style={{ background: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", fontSize: "0.7rem", fontWeight: 800, padding: "3px 8px", borderRadius: "6px" }}>
                Thạch Quyển & Kiến Tạo Mảng
              </span>
            </div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f8fafc", margin: "4px 0 0 0" }}>
              Mô Phỏng 2D Kiến Tạo Mảng & Nội Lực Trái Đất
            </h1>
          </div>
        </div>

        {/* Scene Selection Buttons */}
        <div style={{ display: "flex", background: "rgba(15, 23, 42, 0.8)", padding: "4px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
          {[
            { id: "oc", label: "🌋 Lục Địa - Đại Dương", desc: "Mảng Nazca & Nam Mỹ" },
            { id: "cc", label: "🏔️ Lục Địa - Lục Địa", desc: "Himalaya & Tây Tạng" },
            { id: "rift", label: "⚡ Tách Giãn Lục Địa", desc: "Đông Phi & Biển Đỏ" },
            { id: "ridge", label: "🌊 Sống Núi Đại Dương", desc: "Đại Tây Dương" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setScene(tab.id);
                setProgress(0);
                setDrilledSample(null);
              }}
              style={{
                background: scene === tab.id ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" : "transparent",
                color: scene === tab.id ? "#ffffff" : "#94a3b8",
                border: "none", borderRadius: "10px",
                padding: "8px 14px", fontWeight: 800, fontSize: "0.82rem",
                cursor: "pointer", transition: "all 0.2s ease",
                boxShadow: scene === tab.id ? "0 4px 14px rgba(2, 132, 199, 0.4)" : "none"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Widgets */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setShowQuiz(true)}
            style={{
              background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              color: "#ffffff", border: "none", borderRadius: "12px",
              padding: "10px 16px", fontWeight: 900, fontSize: "0.85rem",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              boxShadow: "0 4px 16px rgba(217, 119, 6, 0.4)"
            }}
          >
            <Award size={18} /> 🏆 CHÁU NGOAN ĐỊA CHẤT (QUIZ)
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div style={{
        position: "relative", width: "100%", aspectRatio: "10 / 5.6",
        background: "#090d16", borderRadius: "20px", overflow: "hidden",
        border: "2px solid rgba(56, 189, 248, 0.25)", boxShadow: "0 16px 48px rgba(0, 0, 0, 0.6)"
      }}>
        <canvas
          ref={canvasRef}
          width={1000}
          height={560}
          onClick={handleCanvasClick}
          style={{ width: "100%", height: "100%", display: "block", cursor: scene === "ridge" ? "crosshair" : "default" }}
        />

        {/* Floating Controls HUD */}
        <div style={{
          position: "absolute", top: "16px", right: "16px",
          display: "flex", flexDirection: "column", gap: "8px", zIndex: 10
        }}>
          <button
            onClick={() => setShowConvection(!showConvection)}
            style={{
              background: showConvection ? "rgba(2, 132, 199, 0.85)" : "rgba(15, 23, 42, 0.8)",
              color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "10px", padding: "8px 12px", fontSize: "0.78rem", fontWeight: 800,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            {showConvection ? <Eye size={14} /> : <EyeOff size={14} />} Dòng Đối Lưu Manti
          </button>

          <button
            onClick={() => setShowSeismograph(!showSeismograph)}
            style={{
              background: showSeismograph ? "rgba(2, 132, 199, 0.85)" : "rgba(15, 23, 42, 0.8)",
              color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "10px", padding: "8px 12px", fontSize: "0.78rem", fontWeight: 800,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            {showSeismograph ? <Activity size={14} /> : <Activity size={14} />} Máy Đo Địa Chấn
          </button>

          <button
            onClick={() => setShowLabels(!showLabels)}
            style={{
              background: showLabels ? "rgba(2, 132, 199, 0.85)" : "rgba(15, 23, 42, 0.8)",
              color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "10px", padding: "8px 12px", fontSize: "0.78rem", fontWeight: 800,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <Info size={14} /> {showLabels ? "Ẩn Chú Thích" : "Hiện Chú Thích"}
          </button>
        </div>

        {/* Core Drilling Sample Display Card (Scenario 4) */}
        {scene === "ridge" && (
          <div style={{
            position: "absolute", top: "16px", left: "290px",
            background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)",
            border: "1.5px solid rgba(250, 204, 21, 0.5)", borderRadius: "14px",
            padding: "10px 16px", display: "flex", alignItems: "center", gap: "12px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)"
          }}>
            <Compass size={20} color="#fde047" />
            <div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>
                KHOAN MẪU ĐÁ ĐÁY BIỂN (CLICK ĐÁY BIỂN ĐỂ KHOAN)
              </div>
              {drilledSample ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: drilledSample.hslColor }} />
                  <span style={{ fontSize: "0.88rem", fontWeight: 900, color: "#f8fafc" }}>
                    {drilledSample.location} - Tuổi: <span style={{ color: "#fde047" }}>{drilledSample.ageMa} Ma</span>
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: 600 }}>
                  Click vào vỏ đại dương trên Canvas để lấy mẫu khoáng vật!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Time & Timeline Slider HUD */}
        <div style={{
          position: "absolute", bottom: "16px", left: "16px", right: "16px",
          background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(255, 255, 255, 0.15)", borderRadius: "16px",
          padding: "12px 20px", display: "flex", alignItems: "center", gap: "16px"
        }}>
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: isPlaying ? "rgba(239, 68, 68, 0.2)" : "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              color: isPlaying ? "#ef4444" : "#ffffff",
              border: isPlaying ? "1px solid #ef4444" : "none",
              borderRadius: "12px", width: "40px", height: "40px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s ease"
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="#ffffff" />}
          </button>

          {/* Reset */}
          <button
            onClick={() => { setProgress(0); setDrilledSample(null); }}
            style={{
              background: "rgba(255, 255, 255, 0.08)", color: "#cbd5e1",
              border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "12px",
              width: "40px", height: "40px", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer"
            }}
          >
            <RotateCcw size={18} />
          </button>

          {/* Progress Bar Slider */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 800 }}>
              <span style={{ color: "#38bdf8" }}>TIẾN TRÌNH ĐỊA CHẤT</span>
              <span style={{ color: "#fde047", fontFamily: "monospace" }}>
                {(progress * 0.8).toFixed(1)} Ma (Triệu Năm)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={e => setProgress(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#0284c7", cursor: "pointer" }}
            />
          </div>

          {/* Speed Multipliers */}
          <div style={{ display: "flex", gap: "4px", background: "rgba(0,0,0,0.4)", padding: "3px", borderRadius: "10px" }}>
            {[0.5, 1, 2].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{
                  background: speed === s ? "#0284c7" : "transparent",
                  color: speed === s ? "#ffffff" : "#94a3b8",
                  border: "none", borderRadius: "8px", padding: "4px 8px",
                  fontSize: "0.72rem", fontWeight: 900, cursor: "pointer"
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Geological Explanation & Learning Card */}
      <div style={{
        background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(8px)",
        border: "1.5px solid rgba(255, 255, 255, 0.12)", borderRadius: "20px",
        padding: "20px 24px"
      }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#38bdf8", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen size={20} /> KIẾN THỨC ĐỊA LÝ 10 CỐT LÕI
        </h3>

        {scene === "oc" && (
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "#fde047" }}>1. Ranh giới Hội tụ Lục địa - Đại dương:</strong> Mảng đại dương Nazca (dày, tỉ trọng lớn) va chạm và chìm sâu dưới mảng lục địa Nam Mỹ (nhẹ hơn). 
            Tại nơi chìm hình thành <span style={{ color: "#38bdf8", fontWeight: 800 }}>Vực sâu đại dương Peru - Chile</span>. Ở độ sâu khoảng 100km, nhiệt độ cao làm vỏ chìm tan chảy sinh ra Magma trào dâng tạo thành <span style={{ color: "#ef4444", fontWeight: 800 }}>Dãy núi cao uốn nếp Andes và chuỗi núi lửa</span>.
          </p>
        )}

        {scene === "cc" && (
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "#fde047" }}>2. Ranh giới Hội tụ Lục địa - Lục địa:</strong> Khi mảng Ấn Độ xô vào mảng Á - Âu, đại dương Tethys cổ bị khép lại hoàn toàn. 
            Hai mảng vỏ lục địa cùng tỉ trọng nhẹ không chìm xuống mà bị dồn nén, uốn nếp nâng cao hình thành <span style={{ color: "#38bdf8", fontWeight: 800 }}>Dãy núi trẻ đồ sộ Himalaya (Đỉnh Everest)</span> và <span style={{ color: "#f59e0b", fontWeight: 800 }}>Sơn nguyên Tây Tạng</span>. Lớp vỏ Trái Đất tại đây dày lên tới 70km.
          </p>
        )}

        {scene === "rift" && (
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "#fde047" }}>3. Ranh giới Tách giãn Lục địa:</strong> Dưới tác dụng của các cột Magma dâng lên từ manti (Mantle Plume), vỏ lục địa bị vồng lên, nứt vỡ và sụt lở tạo ra các đứt gãy thuận. 
            Kết quả hình thành <span style={{ color: "#38bdf8", fontWeight: 800 }}>Thung lũng tách giãn Đông Phi</span>, chuỗi hồ dài sâu và tương lai sẽ tách hẳn thành đại dương mới (như Biển Đỏ hiện tại).
          </p>
        )}

        {scene === "ridge" && (
          <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "#fde047" }}>4. Ranh giới Tách giãn Đại dương:</strong> Hai mảng đại dương tách xa nhau làm trào dâng Magma Basalt đông đặc tạo vỏ đại dương mới ngay tại trục <span style={{ color: "#38bdf8", fontWeight: 800 }}>Sống núi giữa Đại Tây Dương</span>. 
            Các dải khoáng vật từ tính bám theo hướng từ trường Trái Đất (tạo dải sọc từ tính đảo cực đối xứng). Vỏ đại dương càng xa sống núi càng có tuổi đời cổ hơn (lên đến 10+ Ma).
          </p>
        )}
      </div>

      {/* Quiz Interactive Modal */}
      {showQuiz && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            background: "#0f172a", border: "2px solid rgba(56, 189, 248, 0.4)",
            borderRadius: "24px", width: "100%", maxWidth: "650px", padding: "28px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)", position: "relative"
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowQuiz(false)}
              style={{
                position: "absolute", top: "20px", right: "20px",
                background: "rgba(255, 255, 255, 0.1)", border: "none",
                color: "#94a3b8", borderRadius: "50%", width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
              }}
            >
              <XCircle size={20} />
            </button>

            {/* Quiz Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ background: "#d97706", padding: "10px", borderRadius: "12px" }}>
                <Award size={24} color="#fff" />
              </div>
              <div>
                <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase" }}>
                  CỦNG CỐ KIẾN THỨC ĐỊA LÝ 10
                </span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                  Thách Thức Nhà Địa Chất Học Sky-Line
                </h2>
              </div>
            </div>

            {/* Question Progress */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8", fontWeight: 800, marginBottom: "12px" }}>
              <span>CÂU HỎI {currentQuizIdx + 1} / {quizQuestions.length}</span>
              <span style={{ color: "#38bdf8" }}>ĐIỂM SỐ: {quizScore} ĐIỂM</span>
            </div>

            {/* Question Title */}
            <p style={{ fontSize: "1rem", fontWeight: 800, color: "#f1f5f9", lineHeight: 1.5, marginBottom: "20px" }}>
              {quizQuestions[currentQuizIdx].question}
            </p>

            {/* Options List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {quizQuestions[currentQuizIdx].options.map((opt, idx) => {
                let btnBg = "rgba(30, 41, 59, 0.8)";
                let btnBorder = "rgba(255, 255, 255, 0.12)";
                let textColor = "#cbd5e1";

                if (selectedAnswer === idx) {
                  btnBg = "rgba(2, 132, 199, 0.3)";
                  btnBorder = "#0284c7";
                  textColor = "#38bdf8";
                }

                if (quizSubmitted) {
                  if (idx === quizQuestions[currentQuizIdx].correct) {
                    btnBg = "rgba(34, 197, 94, 0.25)";
                    btnBorder = "#22c55e";
                    textColor = "#4ade80";
                  } else if (selectedAnswer === idx) {
                    btnBg = "rgba(239, 68, 68, 0.25)";
                    btnBorder = "#ef4444";
                    textColor = "#f87171";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuizOption(idx)}
                    style={{
                      background: btnBg, border: `1.5px solid ${btnBorder}`,
                      borderRadius: "14px", padding: "14px 18px",
                      textAlign: "left", fontSize: "0.88rem", fontWeight: 700,
                      color: textColor, cursor: quizSubmitted ? "default" : "pointer",
                      transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: "12px"
                    }}
                  >
                    <span style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: "0.75rem"
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after submit */}
            {quizSubmitted && (
              <div style={{
                background: "rgba(2, 132, 199, 0.15)", border: "1px solid rgba(2, 132, 199, 0.4)",
                borderRadius: "12px", padding: "12px 16px", marginBottom: "20px",
                fontSize: "0.82rem", color: "#7dd3fc", lineHeight: 1.5
              }}>
                <strong>💡 Giải thích khoa học:</strong> {quizQuestions[currentQuizIdx].explanation}
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuizAnswer}
                  disabled={selectedAnswer === null}
                  style={{
                    background: selectedAnswer !== null ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" : "rgba(255,255,255,0.1)",
                    color: "#ffffff", border: "none", borderRadius: "12px",
                    padding: "12px 24px", fontWeight: 900, fontSize: "0.9rem",
                    cursor: selectedAnswer !== null ? "pointer" : "not-allowed"
                  }}
                >
                  XÁC NHẬN CÂU TRẢ LỜI
                </button>
              ) : (
                <button
                  onClick={handleNextQuizQuestion}
                  style={{
                    background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
                    color: "#ffffff", border: "none", borderRadius: "12px",
                    padding: "12px 24px", fontWeight: 900, fontSize: "0.9rem",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
                  }}
                >
                  CÂU HỎI TIẾP THEO <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
