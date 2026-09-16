---
name: teacher-account-creation
description: Create and deploy teacher seed accounts for Sky-Line Educational Games with 100% cross-device login guarantee. Use whenever user asks to create or seed a teacher account.
---

# Teacher Account Creation Protocol — 100% Guaranteed Success

When requested to create or seed a teacher account for Sky-Line Educational Games:

## 1. Extract Account Metadata
Parse the user input (image, table, or text) into standard fields:
- `id`: `user_<snake_case_name>` (e.g. `user_bach_hat`)
- `username`: exact username string (e.g. `bachhat`)
- `password`: exact password string (e.g. `123456`)
- `name`: Full teacher name with Vietnamese diacritics (e.g. `Nguyễn Thị Bạch Hạt`)
- `role`: `'teacher'` (or `'admin'`)
- `subject`: Subject name or `'Giáo viên'`
- `school`: School name (e.g., `'Trường TH và THCS Nguyễn Văn Trỗi'`, `'Hệ thống giáo dục Sky-Line'`)
- `createdAt`: `YYYY-MM-DD`

## 2. Dual-Seed Protocol (Mandatory Synchronous Declaration)
1. Add account object to `INITIAL_USERS` array in `src/services/storage.js`.
2. Add matching JSON object to array in `public/cloud_users.json`.
3. Add username to core account lists in both `AGENTS.md` and `.agents/AGENTS.md`.

## 3. Local Verification
Run `npm run build` to verify clean build without any syntax or bundle errors.

## 4. Production Deployment & Sandbox Network Clearance
1. Execute `git add . && git commit -m "Add teacher account <username> (<name>)"`.
2. Push and deploy:
   - Run `git push origin main` and `npm run deploy`.
   - If remote Vercel queue is delayed or aliases do not resolve, run `npx vercel build --prod --yes && npx vercel deploy --prebuilt --prod --yes` and explicitly set aliases: `npx vercel alias set <deployment_url> eduvth.vercel.app` and `npx vercel alias set <deployment_url> giao-vien-sky-line.vercel.app`.

## 5. User Feedback & Cache Refresh Guidance
1. Verify live endpoints using `curl -s "https://eduvth.vercel.app/cloud_users.json"` and `curl -s "https://giao-vien-sky-line.vercel.app/cloud_users.json"`.
2. Report clean summary of created credentials.
3. Remind user to hard refresh browser (`Ctrl + F5` or `Cmd + Shift + R`) on `eduvth.vercel.app`.
