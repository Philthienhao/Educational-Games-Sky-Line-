import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-root-and-public-pdfs',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.toLowerCase().includes('.pdf')) {
            const cleanUrl = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
            const baseName = path.basename(cleanUrl);
            
            // Search priority locations
            const candidatePaths = [
              path.join(__dirname, 'public/textbooks', baseName),
              path.join(__dirname, 'public', baseName),
              path.join(__dirname, cleanUrl.replace(/^\//, '')),
              path.join(__dirname, baseName),
              path.join(__dirname, 'public/textbooks/SGK_lop_7', baseName)
            ];

            let targetFile = candidatePaths.find(p => fs.existsSync(p) && fs.statSync(p).isFile());

            // If requesting LSDL7 or Lich_su_va_dia_ly_7 specifically
            if (!targetFile && (cleanUrl.toLowerCase().includes('lsdl7') || cleanUrl.toLowerCase().includes('lich_su_va_dia_ly_7'))) {
              const fallback = path.join(__dirname, 'LSDL7.pdf');
              if (fs.existsSync(fallback)) targetFile = fallback;
            }

            if (targetFile) {
              const stat = fs.statSync(targetFile);
              const fileSize = stat.size;
              const range = req.headers.range;

              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Accept-Ranges', 'bytes');
              res.setHeader('Access-Control-Allow-Origin', '*');

              if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunkSize = (end - start) + 1;
                
                res.writeHead(206, {
                  'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                  'Content-Length': chunkSize
                });
                fs.createReadStream(targetFile, { start, end }).pipe(res);
              } else {
                res.setHeader('Content-Length', fileSize);
                fs.createReadStream(targetFile).pipe(res);
              }
              return;
            }
          }
          next();
        });
      }
    }
  ],
  build: {
    target: ['es2015', 'safari12'],
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }
          if (id.includes('node_modules/canvas-confetti')) {
            return 'vendor-confetti';
          }
          if (id.includes('node_modules/mammoth')) {
            return 'vendor-mammoth';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1200
  },
  server: {
    port: 3000,
    host: true
  }
});
