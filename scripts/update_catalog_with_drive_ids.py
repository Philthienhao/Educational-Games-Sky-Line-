import urllib.request
import re
import ssl
import json
import os

ssl._create_default_https_context = ssl._create_unverified_context

GRADE_DRIVE_MAP = {
  'Lớp 1': 'https://drive.google.com/drive/folders/1t7QCCHv9xJzbzKdV5CoOaA2HvhRXg-_T?usp=sharing',
  'Lớp 2': 'https://drive.google.com/drive/folders/1mUSvtBMbYuXSKGR3RqEbWoPal5JJWVxU?usp=drive_link',
  'Lớp 3': 'https://drive.google.com/drive/folders/11Lr_jl5nzuK1EcfNiuazyfogtpvWJ8Qg?usp=drive_link',
  'Lớp 4': 'https://drive.google.com/drive/folders/1aWzIbl0QPwqEa2hhtvJYATP0jbmYMp5u?usp=drive_link',
  'Lớp 5': 'https://drive.google.com/drive/folders/1CIslwprisxLPC-pBedobkFCIUBC6mo4T?usp=drive_link',
  'Lớp 6': 'https://drive.google.com/drive/folders/1Mk7HPTSNA6LZX9yOxtbZ7TxGfi_XGWWU?usp=drive_link',
  'Lớp 7': 'https://drive.google.com/drive/folders/1rM0fYj9LigMti5uiEw9CHAJPo_aAMFUN?usp=drive_link',
  'Lớp 8': 'https://drive.google.com/drive/folders/1YvXTp-toRQPCQuaOM5IaLoTGwXEGr0LD?usp=sharing',
  'Lớp 9': 'https://drive.google.com/drive/folders/1mP_ghFKk1xJbYNtFErxUx6p3om-QUFEp?usp=drive_link',
  'Lớp 10': 'https://drive.google.com/drive/folders/1gH2TzpVfKvarKinKpNXwjookea58t6Cn?usp=drive_link',
  'Lớp 11': 'https://drive.google.com/drive/folders/1cmNZ6GWsjbWRhjfsAPJFXoyHBehCzlNj?usp=drive_link',
  'Lớp 12': 'https://drive.google.com/drive/folders/1zbW3nydN65mavsdP2mGz3jGVR0vNH8rO?usp=drive_link',
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

drive_files = {}

print("Scanning Google Drive folders for all 12 grades...")
for grade, url in GRADE_DRIVE_MAP.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            rows = re.findall(r'<tr[^>]*?data-id=\"([a-zA-Z0-9_-]{25,})\"[^>]*?>.*?([a-zA-Z0-9_.-]+\.pdf)', html, re.DOTALL)
            print(f"[{grade}] Found {len(rows)} files in Google Drive.")
            for fid, fname in rows:
                clean_name = fname.strip().lower()
                drive_files[clean_name] = {
                    'driveId': fid,
                    'drivePreviewUrl': f'https://drive.google.com/file/d/{fid}/preview',
                    'grade': grade,
                    'fileName': fname.strip()
                }
    except Exception as e:
        print(f"[{grade}] Error: {e}")

print(f"\nTotal Drive files scanned: {len(drive_files)}")

# Save raw mapping for reference
with open('src/services/googleDriveFileMap.json', 'w', encoding='utf-8') as f:
    json.dump(drive_files, f, ensure_ascii=False, indent=2)

# Now update src/services/textbookCatalog.json
catalog_path = 'src/services/textbookCatalog.json'
with open(catalog_path, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

matched = 0
for book in catalog:
    fn = os.path.basename(book.get('fileName', '')).strip().lower()
    if fn in drive_files:
        matched += 1
        book['driveId'] = drive_files[fn]['driveId']
        book['drivePreviewUrl'] = drive_files[fn]['drivePreviewUrl']
    else:
        # Try fuzzy match on normalized name
        norm_fn = re.sub(r'[^a-z0-9]', '', fn)
        found = False
        for df_name, df_data in drive_files.items():
            if re.sub(r'[^a-z0-9]', '', df_name) == norm_fn:
                book['driveId'] = df_data['driveId']
                book['drivePreviewUrl'] = df_data['drivePreviewUrl']
                matched += 1
                found = True
                break

print(f"Matched {matched} / {len(catalog)} textbooks with direct Google Drive Preview URLs!")

with open(catalog_path, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)

print("textbookCatalog.json updated successfully!")
