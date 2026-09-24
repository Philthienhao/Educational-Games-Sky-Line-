import { getSGKLessonData, parseUploadedDocumentToOutputs } from '../src/services/sgkKnowledgeEngine.js';

console.log('=== TEST 1: SGK LESSON ("Bài 4: Lược đồ trí nhớ") ===');
const sgkRes = getSGKLessonData('Bài 4: Lược đồ trí nhớ', '6', 'Địa Lí');
console.log('SGK Title:', sgkRes?.title);
console.log('SGK Slides Count:', sgkRes?.slides?.length);
console.log('SGK Slide 1 Title:', sgkRes?.slides?.[0]?.title);
console.log('SGK Slide 2 Title:', sgkRes?.slides?.[1]?.title);
console.log('SGK Slide 2 Bullets:', sgkRes?.slides?.[1]?.bulletPoints);
console.log('SGK Mindmap Root:', sgkRes?.mindmap?.label);
console.log('SGK Mindmap Branch 1:', sgkRes?.mindmap?.children?.[0]?.label);
console.log('SGK Worksheet Questions:', sgkRes?.worksheet?.questions?.map(q => q.question));

console.log('\n=== TEST 2: UPLOADED DOCUMENT ("BAI_1_DIA_LI.pdf") ===');
const sampleDocText = `
BÀI 1: HỆ THỐNG KINH VĨ TUYẾN VÀ TỌA ĐỘ ĐỊA LÍ

I. HỆ THỐNG KINH VĨ TUYẾN
- Kinh tuyến là đường nối liền hai cực Bắc và Nam trên bề mặt quả Địa Cầu.
- Kinh tuyến gốc 0 độ đi qua đài thiên văn Greenwich thuộc nước Anh.
- Vĩ tuyến là các vòng tròn song song với đường Xích đạo.
- Vĩ tuyến gốc 0 độ chính là đường Xích đạo.

II. TỌA ĐỘ ĐỊA LÍ
- Tọa độ địa lí của một điểm gồm vĩ độ và kinh độ của điểm đó.
- Hà Nội có tọa độ địa lý là 21 độ 02 phút Bắc, 105 độ 51 phút Đông.
`;

const uploadRes = getSGKLessonData('BÀI 1.pdf', '6', 'Địa Lí', sampleDocText);
console.log('Upload Title:', uploadRes?.title);
console.log('Upload Slides Count:', uploadRes?.slides?.length);
console.log('Upload Slide 2 Title:', uploadRes?.slides?.[1]?.title);
console.log('Upload Slide 2 Bullets:', uploadRes?.slides?.[1]?.bulletPoints);
console.log('Upload Mindmap Root:', uploadRes?.mindmap?.label);
console.log('Upload Mindmap Branch 1:', uploadRes?.mindmap?.children?.[0]?.label);
console.log('Upload Worksheet Question 1:', uploadRes?.worksheet?.questions?.[0]?.question);
console.log('Upload Worksheet Options 1:', uploadRes?.worksheet?.questions?.[0]?.options);
