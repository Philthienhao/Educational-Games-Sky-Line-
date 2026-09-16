# Project Rules & Best Practices - Game Giáo Dục Sky-Line

## 1. React Component Scope Safety
- **NEVER** define sub-component classes (e.g. `GameErrorBoundary`) or inner function components inside the body of another React functional component. Doing so causes component type identity changes on re-renders, forcing React to unmount the entire subtree (resulting in blank screens). Always declare Error Boundaries and sub-components at the top-level scope of the module.

## 2. User Accounts & Authentication Architecture Rules (Quy Tắc Tạo Tài Khoản 100% Thành Công)
- **1. Quy tắc Khai báo Đồng bộ (Dual-Seed Protocol)**: Mọi tài khoản mới bắt buộc phải được khai báo đồng thời ở cả 2 file: `INITIAL_USERS` trong `src/services/storage.js` VÀ `public/cloud_users.json` với đầy đủ `id`, `username`, `password`, `name`, `role`, `subject`, `school`.
- **2. Quy tắc Đẩy Bản Build Live (Git Push & Vercel Trigger)**: Sau khi tạo tài khoản địa phương, bắt buộc phải thực hiện lệnh `git add . && git commit -m "..." && git push origin main` HOẶC hướng dẫn/chạy lệnh `npm run deploy` để Vercel build lại bản live và liên kết tên miền `eduvth.vercel.app` & `giao-vien-sky-line.vercel.app`.
- **3. Hướng dẫn Bộ Nhớ Đệm Trình Duyệt (Browser Cache Guidance)**: Luôn chủ động nhắc người dùng bấm `Ctrl + F5` (`Cmd + Shift + R`) hoặc tải lại trang để trình duyệt xóa cache cũ và nhận ngay file JavaScript chứa tài khoản mới.
- **Cross-Device & Incognito Readiness**: All core system accounts (`philthienhao`, `phamtham`, `thanhthao`, `thanhlai`, `tritoan`, `bachhat`, `tieungoc`) MUST remain registered in `INITIAL_USERS` in `src/services/storage.js` so that ANY browser, ANY device, and ANY Incognito window can log in out-of-the-box without requiring prior localStorage populated on that specific client device.
- **No Seed Overwriting (`...iu`)**: In `StorageService.init()`, `INITIAL_USERS` seed records MUST NEVER overwrite existing user properties (e.g. custom password, updated name, subject) stored in `localStorage`. If `username` exists in `localStorage`, the stored object MUST be preserved 100%.
- **Safe String Password Validation**: In `authenticateUser`, `createUser`, and `updateUser`, ALWAYS cast `username` and `password` to trimmed strings (`String(u.password).trim()`) to prevent `TypeError` crashes if passwords are ever stored as numeric types or non-string values.
- **No Volatile Blacklists**: DO NOT use fragile `gvd_deleted_usernames` local blacklists that can cause newly created accounts to be blocked on login or deleted during `init()`. The `users` list in `localStorage` + `IndexedDB` is the single source of truth.
- **Storage Init Safety**: `StorageService.init()` MUST NEVER wipe or overwrite `USERS_KEY` in `catch(e)` blocks. Any initialization warnings must be logged gracefully without wiping user data.

## 3. Game Excel Templates & Universal Parser Standards
- **Game Nghiêng đầu chuẩn**: Only generate 2-option Excel templates (A & B) named `Mau_Cau_Hoi_Nghieng_Dau_Chuan.xlsx`.
- **Game Đua Vịt & Game Đua Rùa**: Generate student name list Excel templates (`Họ và tên học sinh`, `Ghi chú / Nhóm`) named `Mau_Danh_Sach_Hoc_Sinh_Dua_Vit_Dua_Rua.xlsx`.
- **Universal Parser**: Must automatically detect `Họ và tên học sinh` columns when teachers import student roster Excel files for Đua Vịt & Đua Rùa.

## 4. Vercel Deployment & Alias Synchronization
- **Complete Live Production Deployment Protocol**: Whenever adding teacher accounts or updating core features:
  1. Seed the account in `src/services/storage.js` (`INITIAL_USERS`) and `public/cloud_users.json`.
  2. Execute `git add . && git commit -m "..." && git push origin main` and `npm run deploy` to update production Vercel aliases `eduvth.vercel.app` & `giao-vien-sky-line.vercel.app`.
  3. Instruct the user to perform a hard refresh (`Ctrl + F5` or `Cmd + Shift + R`) on `eduvth.vercel.app` to clear stale browser cache.
- Always inspect runtime errors silently and verify visually before reporting completion to the user.

## 5. Strict Per-User Data Isolation & Permanent Storage Invariants
- **`getTeacherSavedGames(userId)` MUST always filter by `userId`**: NEVER return the entire `runtimeSavedGamesCache` without filtering. Each teacher must ONLY see their own saved games.
- **`syncWithIndexedDB(userId)` MUST receive and forward `userId`**: All callers in `App.jsx`, `TeacherLibrary.jsx` and any other component MUST pass `currentUser?.id` to `syncWithIndexedDB()` so the returned list is user-scoped.
- **`LectureSlideManager` MUST always receive `currentUser` prop from App.jsx**: Never render `<LectureSlideManager />` without `currentUser={currentUser}`. Missing this prop causes the component to silently fall through to the wrong user's session.
- **`getLectureSlides`, `saveLectureSlides`, `getGradeDriveFolders`, `saveGradeDriveFolders` User & Empty Array Handling**: These methods MUST use `StorageService.getEffectiveUserId(userId)` so operations never fail due to `null` userId. When reading stored items, MUST check `data !== null` instead of `parsed.length > 0` so that deleting items (even down to an empty array `[]`) is preserved without resurrecting initial administrative seed data.
- **Slide bài giảng & Grade Drive Folders**: Stored per-user using keys `gvd_user_slides_{userId}` and `gvd_user_grade_folders_{userId}`. This pattern MUST be preserved and NEVER changed to a global key.
- **`INITIAL_SAVED_GAMES` entries**: Each entry MUST have `userId: 'user_admin'` so they only appear for admin, not for other teachers.
- **Dual-Tier & Triple-Tier Permanence (LocalStorage + IndexedDB + Cloud Sync)**: All private teacher mutations (games, homeroom, slides, grade folders) MUST be written synchronously to LocalStorage, asynchronously persisted to IndexedDB (`GVD_Educational_Games_DB`), AND pushed to Cloud KV Storage (`CloudStorageService.saveUserPrivateCloudData`) to guarantee 100% data permanence across F5 refreshes, browser cache wipes, device reboots, incognito sessions, and app updates.
- **Rule**: Never store or return user-specific data (games, slides, homeroom) using a shared global key. Always namespace with `userId` in both the storage key and the in-memory filter.

## 6. Triple-Tier Auto Cloud & Local Permanent Storage Invariants (Zero Data Loss Protocol)
- **Automatic Multi-Tier Recovery on Login**: When any user logs in or launches the app, `syncAllUserDataFromCloud(userId)` and `syncWithIndexedDB(userId)` MUST run automatically to recover missing or cleared LocalStorage data from Cloud and IndexedDB back onto the device.
- **Chrome Persistent Storage Enforcement**: `StorageService.init()` MUST invoke `navigator.storage.persist()` to explicitly request Chrome Persistent Storage permission, preventing browser storage eviction under low disk conditions.
- **Strict Anti-Wipe Guarantee**: `StorageService.init()` MUST NEVER execute destructive `localStorage.removeItem` on active user data keys (`CURRENT_USER_KEY`, `USERS_KEY`, `SAVED_GAMES_KEY`, `gvd_homeroom_*`, `gvd_user_slides_*`).
- **Unified IndexedDB Engine**: All components MUST use `IDBStorageService` with the single unified database `GVD_Educational_Games_DB`. Never create or read from mismatched IndexedDB database names.
- **Permanent Game Deletion Invariant & Deleted Game Blacklist (`gvd_deleted_game_ids_${userId}`)**: Deleting a saved game via `deleteTeacherGame` or `deleteTeacherSavedGame` MUST persist the deleted game ID into `gvd_deleted_game_ids_${userId}` across LocalStorage, IndexedDB, and Cloud KV Storage (`deleted_game_ids`). `StorageService.init()`, `getTeacherSavedGames()`, `syncWithIndexedDB()`, and `syncAllUserDataFromCloud()` MUST ALL filter out blacklisted deleted game IDs so that deleted games (including initial sample games) can NEVER be resurrected by app initialization or background syncs.
- **Native Vercel Serverless API Endpoint (`/api/storage`) & Stateless Invariant**: Vercel Serverless API handlers (`/api/storage.js`) MUST NEVER store persistent data in Node.js module-level in-memory state (such as `let store = {}`). Because serverless functions cold-start and recycle containers dynamically, in-memory state is erased when idle. `/api/storage.js` MUST directly read from and write to 24/7 persistent cloud storage backends (Supabase REST API, persistent Cloud KV stores). All private mutations MUST push to `/api/storage` and redundant Cloud DB endpoints to guarantee 100% cross-device, 24/7 cloud durability.
- **Customization Anti-Overwriting Invariant (`isCustomized: true`)**: Once homeroom or user data is saved by a teacher, the payload MUST store `isCustomized: true`. `StorageService.getTeacherHomeroom` MUST check `isCustomized: true` and MUST NEVER overwrite a customized user homeroom (even if empty) with default sample student data.
- **QuotaExceeded Storage Safety**: High-capacity image base64 strings MUST be offloaded to `AvatarStorageService` and `IndexedDB` (`GVD_Educational_Games_DB`) before writing to `localStorage`, keeping `localStorage` payloads small and preventing `QuotaExceededError` write failures under browser limits.
- **Universal JSON Backup Portability**: `StorageService.exportFullBackup()` and `StorageService.importFullBackup()` MUST be maintained across all UI screens so users can export and import a complete 100% system backup anytime.
- **Universal New Account Protection Inheritance**: All newly created accounts (via `createUser` or Sign up) automatically inherit the 3-tier storage architecture (LocalStorage + IndexedDB + Vercel Serverless `/api/storage`). Once any new account saves homeroom or games, the payload is permanently stored on Vercel Cloud Server and IndexedDB with `isCustomized: true` to prevent any future data loss.

## 7. HD Image Quality Preservation & Storage Offloading
- **HD Image Compression Standard**: When compressing uploaded class cover photos, student avatars, or game images, use **2560px max dimension** with **0.92 (92%) HD quality preset**. Never downsample images to low resolutions (800-900px, 70% quality) which cause pixelation on 4K displays and classroom projectors.
- **IndexedDB Storage Offloading**: Base64 image payloads MUST be offloaded to IndexedDB (`GVD_Educational_Games_DB`) and Vercel Cloud Server (`/api/storage`) to prevent browser `QuotaExceededError` storage write crashes.

## 8. Student Picker Target Positioning & Grid Coordinates
- **Upper Arena Target Grid**: In student name picker games (e.g. `AstronautExplorerGame`), dynamic columns MUST expand (`cols = count` when `count <= 7`) so all students sit on a single row near the top.
- **Lower Arena Launch Clearance**: Target Y coordinates MUST be strictly bounded in the upper region (`Y <= 46%`), leaving the lower 54% of the arena completely open for bottom launchpads and vertical animation trajectories.

## 9. Homeroom Header Layout & Photo Showcase Invariants
- **Un-blurred Controls Panel**: Homeroom header info panels MUST use clean glassmorphic dark theme backgrounds without dark blurred background images tinting or obscuring controls and text.
- **Standalone Large Showcase Banner**: Class cover photos MUST be rendered in a dedicated standalone showcase hero card with 100% full brightness, un-blurred HD resolution (`filter: none, opacity: 1`).

## 10. React Inline Style Object Syntax Safety
- **Strict Property Colon Invariant**: In JSX inline `style={{ ... }}` objects, ALWAYS verify property syntax (e.g., `fontWeight: 900`, `fontSize: '1rem'`). Never omit colons between CSS property keys and values.


