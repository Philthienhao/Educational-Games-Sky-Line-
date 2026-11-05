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
        let pdfIndex = null;
        const getPdfIndex = () => {
          if (pdfIndex) return pdfIndex;
          pdfIndex = new Map();
          const walk = (dir) => {
            if (!fs.existsSync(dir)) return;
            try {
              const entries = fs.readdirSync(dir, { withFileTypes: true });
              for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                  walk(fullPath);
                } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
                  pdfIndex.set(entry.name.toLowerCase(), fullPath);
                  pdfIndex.set(entry.name, fullPath);
                }
              }
            } catch (e) {}
          };
          walk(path.join(__dirname, 'public'));
          walk(path.join(__dirname, 'SGK'));
          walk(path.join(__dirname, 'textbooks_local_backup'));
          return pdfIndex;
        };

        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.toLowerCase().includes('.pdf')) {
            const cleanUrl = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
            const baseName = path.basename(cleanUrl);
            const index = getPdfIndex();

            let targetFile = index.get(baseName) || index.get(baseName.toLowerCase());

            // If not found in index, check direct relative path
            if (!targetFile) {
              const directPublic = path.join(__dirname, 'public', cleanUrl.replace(/^\//, ''));
              if (fs.existsSync(directPublic) && fs.statSync(directPublic).isFile()) {
                targetFile = directPublic;
              }
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
