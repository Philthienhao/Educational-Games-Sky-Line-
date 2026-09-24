import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

console.log("Launching Chrome with remote debugging on port 9222...");
const chromeProc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless',
  '--no-sandbox',
  '--remote-debugging-port=9222',
  '--user-data-dir=/tmp/chrome_cdp_profile_2',
  'http://localhost:5173/'
], { detached: true });

async function getPageTarget() {
  for (let i = 0; i < 10; i++) {
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

console.log("Found Chrome page target URL:", pageTarget.url);
console.log("WebSocket URL:", pageTarget.webSocketDebuggerUrl);

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
  console.log("Connected to Chrome via CDP WebSocket!");
  await send('Page.enable');
  await send('DOM.enable');
  await send('Runtime.enable');

  await new Promise(r => setTimeout(r, 2000));

  // Click 'AI Soạn giáo án'
  const clickScript = `
    (() => {
      const buttons = Array.from(document.querySelectorAll('button, a, div, span'));
      const target = buttons.find(b => b.textContent && b.textContent.includes('AI Soạn giáo án'));
      if (target) {
        target.click();
        return "Clicked AI Soạn giáo án";
      }
      return "Not found";
    })()
  `;
  const clickRes = await send('Runtime.evaluate', { expression: clickScript });
  console.log("Click result:", clickRes?.result?.value);

  await new Promise(r => setTimeout(r, 2000));

  // Select lesson & click Generate
  const genScript = `
    (() => {
      const selects = Array.from(document.querySelectorAll('select'));
      if (selects.length > 0) {
        const s = selects[selects.length - 1];
        s.value = 'Bài 4: Lược đồ trí nhớ';
        s.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll('button'));
      const genBtn = btns.find(b => b.textContent && (b.textContent.includes('KHỞI TẠO BÀI GIẢNG') || b.textContent.includes('Tạo')));
      if (genBtn) {
        genBtn.click();
        return "Clicked generate button";
      }
      return "Generate button not found";
    })()
  `;
  const genRes = await send('Runtime.evaluate', { expression: genScript });
  console.log("Generate result:", genRes?.result?.value);

  await new Promise(r => setTimeout(r, 4000));

  // Capture screenshot
  const screenshotObj = await send('Page.captureScreenshot', { format: 'png' });
  if (!fs.existsSync('./scratch')) fs.mkdirSync('./scratch', { recursive: true });
  if (screenshotObj && screenshotObj.data) {
    fs.writeFileSync('./scratch/ui_live_planner_result.png', Buffer.from(screenshotObj.data, 'base64'));
    console.log("✅ CAPTURED LIVE PLANNER RESULT -> ./scratch/ui_live_planner_result.png");
  }

  ws.close();
  chromeProc.kill();
  process.exit(0);
});
