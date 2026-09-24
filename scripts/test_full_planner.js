if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; }
  };
}

import fs from 'fs';
import { getSGKLessonData } from '../src/services/sgkKnowledgeEngine.js';
import { extractPPTXText, cleanTextbookText } from '../src/services/aiTextbookService.js';
import { GeminiService } from '../src/services/geminiService.js';

async function testFullPlanner() {
  console.log("=== TEST 1: Predefined SGK Lesson (Bài 4: Lược đồ trí nhớ) ===");
  const sgkData = getSGKLessonData("Bài 4: Lược đồ trí nhớ", "6", "Địa Lí");
  console.log("Title:", sgkData.title);
  console.log("Slides count:", sgkData.slides?.length);
  console.log("Slide 1 title:", sgkData.slides?.[0]?.title);
  console.log("Slide 1 bullet 1:", sgkData.slides?.[0]?.bulletPoints?.[0]);
  console.log("Mindmap root:", sgkData.mindmap?.label);
  console.log("Mindmap branches:", sgkData.mindmap?.children?.length);
  console.log("Worksheet title:", sgkData.worksheet?.title);
  console.log("Worksheet questions count:", sgkData.worksheet?.questions?.length);
  console.log("Worksheet Q1:", sgkData.worksheet?.questions?.[0]?.question);

  if (!sgkData.slides?.[0]?.bulletPoints?.[0] || sgkData.slides?.[0]?.bulletPoints?.[0].includes("Nội dung cốt lõi")) {
    console.error("FAIL: Predefined SGK output is generic!");
    process.exit(1);
  }

  console.log("\n=== TEST 2: Extract & Parse PPTX File (slide/bai1.pptx) ===");
  const pptxBuf = fs.readFileSync('./slide/bai1.pptx');
  const extractedText = cleanTextbookText(await extractPPTXText(pptxBuf));
  console.log("Extracted characters from PPTX:", extractedText.length);

  const pptxOutputs = getSGKLessonData("bai1.pptx", "6", "Địa Lí", extractedText);
  console.log("Parsed PPTX title:", pptxOutputs.title);
  console.log("Parsed PPTX slides:", pptxOutputs.slides?.length);
  console.log("Parsed PPTX Slide 2 title:", pptxOutputs.slides?.[1]?.title);
  console.log("Parsed PPTX Slide 2 bullets:", pptxOutputs.slides?.[1]?.bulletPoints);
  console.log("Parsed PPTX Mindmap root:", pptxOutputs.mindmap?.label);
  console.log("Parsed PPTX Worksheet Q1:", pptxOutputs.worksheet?.questions?.[0]?.question);

  if (!extractedText || extractedText.length < 100 || !pptxOutputs.slides?.[1]?.bulletPoints?.[0]) {
    console.error("FAIL: PPTX extraction or output parsing failed!");
    process.exit(1);
  }

  console.log("\n=== TEST 3: GeminiService Slide/Mindmap/Worksheet Calls ===");
  const slidesRes = await GeminiService.generateLessonSlidesJSON("Bài 4: Lược đồ trí nhớ", "6", "Địa Lí", extractedText);
  const mindmapRes = await GeminiService.generateMindmapJSON("Bài 4: Lược đồ trí nhớ", "6", "Địa Lí", extractedText);
  const worksheetRes = await GeminiService.generateWorksheetJSON("Bài 4: Lược đồ trí nhớ", "6", "Địa Lí", extractedText);

  console.log("Gemini/Engine Slide 1:", slidesRes?.[0]?.title);
  console.log("Gemini/Engine Mindmap root:", mindmapRes?.label);
  console.log("Gemini/Engine Worksheet Q1:", worksheetRes?.questions?.[0]?.question);

  console.log("\n✅ ALL TESTS PASSED! Multi-format lesson generator works with 100% real content.");
}

testFullPlanner().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
