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
- **Automatic 4-Step Production Pipeline**: Whenever creating, updating, or configuring any teacher account or system feature, the agent MUST automatically execute the complete 4-step pipeline without requiring ANY manual user action:
  1. Seed the account into `INITIAL_USERS` in `src/services/storage.js` & `public/cloud_users.json`.
  2. Execute `npx vercel --temporary --yes` to trigger Vercel Production build.
  3. Execute `npx vercel alias set <deploymentId> eduvth.vercel.app` & `npx vercel alias set <deploymentId> giao-vien-sky-line.vercel.app`.
  4. Verify the live Production HTTP response silently before declaring completion.
- Always inspect runtime errors silently and verify visually before reporting completion to the user.

## 5. Strict Per-User Data Isolation & Permanent Storage Invariants
- **`getTeacherSavedGames(userId)` MUST always filter by `userId`**: NEVER return the entire `runtimeSavedGamesCache` without filtering. Each teacher must ONLY see their own saved games.
- **`syncWithIndexedDB(userId)` MUST receive and forward `userId`**: All callers in `App.jsx`, `TeacherLibrary.jsx` and any other component MUST pass `currentUser?.id` to `syncWithIndexedDB()` so the returned list is user-scoped.
- **`LectureSlideManager` MUST always receive `currentUser` prop from App.jsx**: Never render `<LectureSlideManager />` without `currentUser={currentUser}`. Missing this prop causes the component to silently fall through to the wrong user's session.
- **`getLectureSlides`, `saveLectureSlides`, `getGradeDriveFolders`, `saveGradeDriveFolders` MUST require explicit `userId`**: These 4 methods MUST NOT auto-fallback to `StorageService.getCurrentUser()` when `userId` is not provided — they MUST return `[]` or `false` immediately to prevent cross-user data leakage.
- **Slide bài giảng & Grade Drive Folders**: Stored per-user using keys `gvd_user_slides_{userId}` and `gvd_user_grade_folders_{userId}`. This pattern MUST be preserved and NEVER changed to a global key.
- **`INITIAL_SAVED_GAMES` entries**: Each entry MUST have `userId: 'user_admin'` so they only appear for admin, not for other teachers.
- **Dual-Tier Permanence (LocalStorage + IndexedDB)**: All private teacher mutations (games, homeroom, slides, grade folders) MUST be written synchronously to LocalStorage and asynchronously persisted to IndexedDB to guarantee 100% data permanence across F5 refreshes, device reboots, and app updates.
- **Rule**: Never store or return user-specific data (games, slides, homeroom) using a shared global key. Always namespace with `userId` in both the storage key and the in-memory filter.
