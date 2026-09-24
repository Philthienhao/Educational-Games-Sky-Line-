import fs from 'fs';

async function extractPPTXText(buffer) {
  const uint8 = new Uint8Array(buffer);
  let textResult = '';
  
  // Find zip entries (PK\x03\x04)
  for (let i = 0; i < uint8.length - 30; i++) {
    if (uint8[i] === 0x50 && uint8[i+1] === 0x4b && uint8[i+2] === 0x03 && uint8[i+3] === 0x04) {
      const compMethod = uint8[i+8] | (uint8[i+9] << 8);
      const compSize = uint8[i+18] | (uint8[i+19] << 8) | (uint8[i+20] << 16) | (uint8[i+21] << 24);
      const fileNameLen = uint8[i+26] | (uint8[i+27] << 8);
      const extraLen = uint8[i+28] | (uint8[i+29] << 8);
      
      const fileNameBuf = uint8.subarray(i + 30, i + 30 + fileNameLen);
      const fileName = new TextDecoder().decode(fileNameBuf);
      
      const dataStart = i + 30 + fileNameLen + extraLen;
      
      if (fileName.includes('ppt/slides/slide') && fileName.endsWith('.xml')) {
        const compressedData = uint8.subarray(dataStart, dataStart + compSize);
        try {
          let xmlStr = '';
          if (compMethod === 8 && typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('deflate-raw');
            const writer = ds.writable.getWriter();
            writer.write(compressedData);
            writer.close();
            const response = new Response(ds.readable);
            xmlStr = await response.text();
          } else if (compMethod === 0) {
            xmlStr = new TextDecoder().decode(compressedData);
          }
          
          if (xmlStr) {
            const matches = xmlStr.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
            const slideTexts = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
            if (slideTexts.length > 0) {
              textResult += `\n--- ${fileName} ---\n` + slideTexts.join(' ');
            }
          }
        } catch (e) {
          // ignore slide decompression errors gracefully
        }
      }
    }
  }
  return textResult;
}

const testFile = './slide/bai1.pptx';
if (fs.existsSync(testFile)) {
  const buf = fs.readFileSync(testFile);
  const text = await extractPPTXText(buf);
  console.log(`Extracted PPTX length: ${text.length}`);
  console.log('Sample content:\n', text.slice(0, 500));
}
