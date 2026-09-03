# Project Rules & Best Practices - Game Giáo Dục Sky-Line

## 1. React Component Scope Safety
- **NEVER** define sub-component classes (e.g. `GameErrorBoundary`) or inner function components inside the body of another React functional component. Doing so causes component type identity changes on re-renders, forcing React to unmount the entire subtree (resulting in blank screens). Always declare Error Boundaries and sub-components at the top-level scope of the module.

## 2. User Accounts & Authentication Architecture Rules
- **Cross-Device & Incognito Readiness**: All core system accounts (`philthienhao`, `phamtham`, `thanhthao`, `thanhlai`) MUST remain registered in `INITIAL_USERS` in `src/services/storage.js` so that ANY browser, ANY device, and ANY Incognito window can log in out-of-the-box without requiring prior localStorage populated on that specific client device.
- **No Seed Overwriting (`...iu`)**: In `StorageService.init()`, `INITIAL_USERS` seed records MUST NEVER overwrite existing user properties (e.g. custom password, updated name, subject) stored in `localStorage`. If `username` exists in `localStorage`, the stored object MUST be preserved 100%.
- **Safe String Password Validation**: In `authenticateUser`, `createUser`, and `updateUser`, ALWAYS cast `username` and `password` to trimmed strings (`String(u.password).trim()`) to prevent `TypeError` crashes if passwords are ever stored as numeric types or non-string values.
- **No Volatile Blacklists**: DO NOT use fragile `gvd_deleted_usernames` local blacklists that can cause newly created accounts to be blocked on login or deleted during `init()`. The `users` list in `localStorage` + `IndexedDB` is the single source of truth.
- **Storage Init Safety**: `StorageService.init()` MUST NEVER wipe or overwrite `USERS_KEY` in `catch(e)` blocks. Any initialization warnings must be logged gracefully without wiping user data.

## 3. Game Excel Templates & Universal Parser Standards
- **Game Nghiêng đầu chuẩn**: Only generate 2-option Excel templates (A & B) named `Mau_Cau_Hoi_Nghieng_Dau_Chuan.xlsx`.
- **Game Đua Vịt & Game Đua Rùa**: Generate student name list Excel templates (`Họ và tên học sinh`, `Ghi chú / Nhóm`) named `Mau_Danh_Sach_Hoc_Sinh_Dua_Vit_Dua_Rua.xlsx`.
- **Universal Parser**: Must automatically detect `Họ và tên học sinh` columns when teachers import student roster Excel files for Đua Vịt & Đua Rùa.

## 4. Vercel Deployment & Alias Synchronization
- Whenever building and deploying to Vercel via CLI, ensure domain aliases (`eduvth.vercel.app` & `giao-vien-sky-line.vercel.app`) are explicitly bound to the newest deployment ID using `npx vercel alias set` or deployment scripts.
- Always inspect runtime errors silently and verify visually before reporting completion to the user.
