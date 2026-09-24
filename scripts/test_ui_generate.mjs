import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

console.log("Launching Chrome CDP for visual generation test...");
const chromeProc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless',
  '--no-sandbox',
  '--remote-debugging-port=9222',
  '--user-data-dir=/tmp/chrome_cdp_profile_gen',
  'http://localhost:5173/#ai-lesson-planner'
], { detached: true });

async function getPageTarget() {
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try {
      const body = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json/list', (res) => {
          let b = '';
          res.on('data', chunk => b += chunk);
          res.on('end', () => resolve(b));
        }).on('error', reject);
      });
      const targets = JSON.parse(body);
      const page = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch (e) {}
  }
  return null;
}

const pageTarget = await getPageTarget();
if (!pageTarget) {
  console.error("Could not find Chrome page target!");
  chromeProc.kill();
  process.exit(1);
}

const WebSocket = (await import('ws')).default;
const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

let msgId = 1;
const send = (method, params = {}) => new Promise((resolve) => {
  const id = msgId++;
  const handler = (data) => {
    const parsed = JSON.parse(data);
    if (parsed.id === id) {
      ws.off('message', handler);
      resolve(parsed.result);
    }
  };
  ws.on('message', handler);
  ws.send(JSON.stringify({ id, method, params }));
});

ws.on('open', async () => {
  console.log("Connected to Chrome DevTools Protocol!");
  await send('Page.enable');
  await send('DOM.enable');
  await send('Runtime.enable');

  await new Promise(r => setTimeout(r, 2000));

  // Select lesson 'Bài 4: Lược đồ trí nhớ' and click generate button magic wand
  const genScript = `
    (() => {
      const selects = Array.from(document.querySelectorAll('select'));
      if (selects.length > 0) {
        const s = selects[selects.length - 1];
        // find option containing 'Bài 4' or 'Lược đồ'
        const options = Array.from(s.options);
        const match = options.find(o => o.text.includes('Bài 4') || o.text.includes('Lược đồ'));
        if (match) {
          s.value = match.value;
          s.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      
      // Click big magic button
      const buttons = Array.from(document.querySelectorAll('button'));
      const magicBtn = buttons.find(b => b.innerHTML && (b.innerHTML.includes('lucide-wand') || b.innerHTML.includes('svg') || b.textContent.includes('Tạo') || b.style.borderRadius === '50%'));
      if (magicBtn) {
        magicBtn.click();
        return "Clicked magic generator button!";
      }
      
      // Fallback click any button in planner container
      const container = document.querySelector('div');
      const allBtns = Array.from(document.querySelectorAll('button'));
      const lastBtn = allBtns[allBtns.length - 1];
      if (lastBtn) {
        lastBtn.click();
        return "Clicked last button";
      }
      return "No button found";
    })()
  `;

  const genResult = await send('Runtime.evaluate', { expression: genScript });
  console.log("Action result:", genResult?.result?.value);

  // Wait 4 seconds for generation
  await new Promise(r => setTimeout(r, 4000));

  // Take screenshot of generated Slides
  const ss1 = await send('Page.captureScreenshot', { format: 'png' });
  if (!fs.existsSync('./scratch')) fs.mkdirSync('./scratch', { recursive: true });
  fs.writeFileSync('./scratch/ui_generated_slides.png', Buffer.from(ss1.data, 'base64'));
  console.log("📸 CAPTURED SLIDES -> ./scratch/ui_generated_slides.png");

  // Click Mindmap tab
  const mindmapClick = `
    (() => {
      const btns = Array.from(document.querySelectorAll('button, div'));
      const target = btns.find(b => b.textContent && b.textContent.includes('Sơ Đồ Tư Duy'));
      if (target) {
        target.click();
        return "Clicked Mindmap Tab";
      }
      return "Mindmap tab not found";
    })()
  `;
  await send('Runtime.evaluate', { expression: mindmapClick });
  await new Promise(r => setTimeout(r, 1200));

  const ss2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('./scratch/ui_generated_mindmap.png', Buffer.from(ss2.data, 'base64'));
  console.log("📸 CAPTURED MINDMAP -> ./scratch/ui_generated_mindmap.png");

  // Click Worksheet tab
  const worksheetClick = `
    (() => {
      const btns = Array.from(document.querySelectorAll('button, div'));
      const target = btns.find(b => b.textContent && b.textContent.includes('Phiếu Học Tập'));
      if (target) {
        target.click();
        return "Clicked Worksheet Tab";
      }
      return "Worksheet tab not found";
    })()
  `;
  await send('Runtime.evaluate', { expression: worksheetClick });
  await new Promise(r => setTimeout(r, 1200));

  const ss3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('./scratch/ui_generated_worksheet.png', Buffer.from(ss3.data, 'base64'));
  console.log("📸 CAPTURED WORKSHEET -> ./scratch/ui_generated_worksheet.png");

  ws.close();
  chromeProc.kill();
  process.exit(0);
});
