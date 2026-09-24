import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function runVisualTest() {
  console.log("Launching Chrome for visual UI testing...");
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log("Navigating to http://localhost:5173/...");
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Screenshot 1: Home page
  await page.screenshot({ path: './scratch/ui_1_home.png' });
  console.log("Captured Home page screenshot -> ./scratch/ui_1_home.png");

  // Click on "AI Soạn giáo án" sidebar menu item
  console.log("Clicking 'AI Soạn giáo án' in sidebar...");
  const menuButtons = await page.$$('button, a, div');
  let clickedPlanner = false;
  for (const btn of menuButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('AI Soạn giáo án')) {
      await btn.click();
      clickedPlanner = true;
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1500));

  // Screenshot 2: AI Soạn giáo án screen
  await page.screenshot({ path: './scratch/ui_2_planner.png' });
  console.log("Captured AI Soạn giáo án screen -> ./scratch/ui_2_planner.png");

  // Find select or input for lesson topic
  console.log("Selecting lesson 'Bài 4: Lược đồ trí nhớ'...");
  const selects = await page.$$('select');
  if (selects.length > 0) {
    // Select lesson from options if available
    const lessonSelect = selects[selects.length - 1]; // last select is usually lesson select
    await lessonSelect.select('Bài 4: Lược đồ trí nhớ');
  }

  // Click Generate button "Khởi Tạo Bài Giảng & Tư Liệu" or "Tạo bài giảng"
  console.log("Clicking generate button...");
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && (text.includes('KHỞI TẠO BÀI GIẢNG') || text.includes('Bắt Đầu Tạo Bài Giảng') || text.includes('Tạo'))) {
      await btn.click();
      console.log("Clicked generate button:", text.trim());
      break;
    }
  }

  // Wait 3 seconds for generation to complete
  await new Promise(r => setTimeout(r, 3500));

  // Screenshot 3: Generated Slide tab
  await page.screenshot({ path: './scratch/ui_3_slides.png' });
  console.log("Captured Slides tab -> ./scratch/ui_3_slides.png");

  // Click "Sơ Đồ Tư Duy" tab if present
  const tabs = await page.$$('button');
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text && text.includes('Sơ Đồ Tư Duy')) {
      await tab.click();
      console.log("Clicked Sơ Đồ Tư Duy tab");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './scratch/ui_4_mindmap.png' });
  console.log("Captured Mindmap tab -> ./scratch/ui_4_mindmap.png");

  // Click "Phiếu Học Tập" tab if present
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text && text.includes('Phiếu Học Tập')) {
      await tab.click();
      console.log("Clicked Phiếu Học Tập tab");
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './scratch/ui_5_worksheet.png' });
  console.log("Captured Worksheet tab -> ./scratch/ui_5_worksheet.png");

  await browser.close();
  console.log("✅ Visual UI testing completed successfully!");
}

if (!fs.existsSync('./scratch')) fs.mkdirSync('./scratch', { recursive: true });
runVisualTest().catch(err => {
  console.error("Visual test error:", err.message);
  process.exit(1);
});
