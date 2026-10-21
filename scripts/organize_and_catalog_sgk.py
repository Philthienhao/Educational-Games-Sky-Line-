import os
import re
import json
import hashlib
import unicodedata

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_TEXTBOOKS = os.path.join(BASE_DIR, 'public', 'textbooks')
CATALOG_PATH = os.path.join(BASE_DIR, 'src', 'services', 'textbookCatalog.json')

# Correct grade folder mapping
# Note: files with prefix 08- are Grade 8 (located in ./SGK/Lớp 11)
# files with prefix 09- are Grade 9 (located in ./SGK/Lớp 12)
# files with prefix 10- are Grade 10 (located in ./SGK/Lớp 8)
# files with prefix 11- are Grade 11 (located in ./SGK/Lớp 10)
# files with prefix 12- are Grade 12 (located in ./SGK/Lớp 9)
GRADE_SOURCES = {
    1: [os.path.join(BASE_DIR, 'SGK', 'Lớp 1'), os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_1')],
    2: [os.path.join(BASE_DIR, 'SGK', 'Lớp 2'), os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_2')],
    3: [os.path.join(BASE_DIR, 'SGK', 'Lớp 3'), os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_3')],
    4: [os.path.join(BASE_DIR, 'SGK', 'Lớp 4'), os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_4')],
    5: [os.path.join(BASE_DIR, 'SGK', 'Lớp 5'), os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_5')],
    6: [os.path.join(BASE_DIR, 'SGK', 'Lớp 6'), os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_6')],
    7: [os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_7')],
    8: [os.path.join(BASE_DIR, 'SGK', 'Lớp 11'), os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_8')],
    9: [os.path.join(BASE_DIR, 'SGK', 'Lớp 12'), os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_9')],
    10: [os.path.join(BASE_DIR, 'SGK', 'Lớp 8'), os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_10')],
    11: [os.path.join(BASE_DIR, 'SGK', 'Lớp 10'), os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_11')],
    12: [os.path.join(BASE_DIR, 'SGK', 'Lớp 9'), os.path.join(BASE_DIR, 'textbooks_local_backup', 'SGK_lop_12')]
}

def normalize_text(text):
    return unicodedata.normalize('NFC', text)

def detect_subject(title, filename):
    t = (title + ' ' + filename).lower()
    t = normalize_text(t)
    
    if any(k in t for k in ['lịch sử và địa lí', 'lịch sử và địa lý', 'lich-su-va-dia-li', 'lich_su_va_dia_li', 'lich_su_va_dia_ly', 'lsdl']):
        return 'Lịch Sử & Địa Lý'
    if any(k in t for k in ['tự nhiên và xã hội', 'tu-nhien-va-xa-hoi', 'tu_nhien_va_xa_hoi', 'tnxh']):
        return 'Tự Nhiên & Xã Hội'
    if any(k in t for k in ['khoa học tự nhiên', 'khoa-hoc-tu-nhien', 'khoa_hoc_tu_nhien', 'khtn']):
        return 'Khoa Học Tự Nhiên'
    if any(k in t for k in ['địa lí', 'địa lý', 'dia-li', 'dia_li', 'dia-ly', 'dia_ly']):
        return 'Địa Lý'
    if any(k in t for k in ['lịch sử', 'lich-su', 'lich_su']):
        return 'Lịch Sử'
    if any(k in t for k in ['kinh tế', 'pháp luật', 'gdktpl', 'kt-pl', 'kt_pl', 'kinh-te']):
        return 'GD Kinh Tế & Pháp Luật'
    if any(k in t for k in ['đạo đức', 'dao-duc', 'dao_duc', 'công dân', 'cong-dan', 'cong_dan', 'gdcd']):
        return 'Đạo Đức / GDCD'
    if any(k in t for k in ['ngữ văn', 'tiếng việt', 'tập viết', 'tập đọc', 'ngu-van', 'ngu_van', 'tieng-viet', 'tieng_viet']):
        return 'Ngữ Văn / Tiếng Việt'
    if any(k in t for k in ['tiếng anh', 'english', 'global success', 'tieng-anh', 'tieng_anh', 'shs-tieng', 'shs_tieng']):
        return 'Tiếng Anh'
    if any(k in t for k in ['vật lí', 'vật lý', 'vat-li', 'vat_li', 'vat-ly', 'vat_ly', 'sgk vl', 'vl 10', 'vl 11', 'vl 12']):
        return 'Vật Lý'
    if any(k in t for k in ['hóa học', 'hoá học', 'hoa-hoc', 'hoa_hoc']):
        return 'Hóa Học'
    if any(k in t for k in ['sinh học', 'sinh-hoc', 'sinh_hoc']):
        return 'Sinh Học'
    if any(k in t for k in ['tin học', 'tin-hoc', 'tin_hoc']):
        return 'Tin Học'
    if any(k in t for k in ['âm nhạc', 'am-nhac', 'am_nhac']):
        return 'Âm Nhạc'
    if any(k in t for k in ['mĩ thuật', 'mỹ thuật', 'mi-thuat', 'mi_thuat', 'my-thuat', 'my_thuat']):
        return 'Mỹ Thuật'
    if any(k in t for k in ['trải nghiệm', 'trai-nghiem', 'trai_nghiem', 'hdtn', 'hđtn']):
        return 'Hoạt Động Trải Nghiệm'
    if any(k in t for k in ['thể chất', 'the-chat', 'the_chat', 'gdtc', 'bóng chuyền', 'cầu lông', 'bóng rổ', 'bóng đá']):
        return 'Giáo Dục Thể Chất'
    if any(k in t for k in ['quốc phòng', 'quoc-phong', 'quoc_phong', 'gdqp']):
        return 'GD Quốc Phòng - An Ninh'
    if any(k in t for k in ['công nghệ', 'cong-nghe', 'cong_nghe']):
        return 'Công Nghệ'
    if any(k in t for k in ['tiếng pháp', 'tieng-phap', 'tieng_phap']):
        return 'Tiếng Pháp'
    if any(k in t for k in ['tiếng nhật', 'tieng-nhat', 'tieng_nhat']):
        return 'Tiếng Nhật'
    if any(k in t for k in ['tiếng trung', 'tieng-trung', 'tieng_trung']):
        return 'Tiếng Trung Quốc'
    if any(k in t for k in ['tiếng nga', 'tieng-nga', 'tieng_nga']):
        return 'Tiếng Nga'
    if any(k in t for k in ['tiếng đức', 'tieng-duc', 'tieng_duc']):
        return 'Tiếng Đức'
    if any(k in t for k in ['toán', 'toan']):
        return 'Toán Học'
    if any(k in t for k in ['khoa học', 'khoa-hoc', 'khoa_hoc']):
        return 'Khoa Học'
    return 'Môn Khác'

def format_clean_title(filename, grade_num):
    raw_name = os.path.splitext(filename)[0]
    # Remove prefix like 01-sgk-, 08-sgv-, 10-sbt-
    clean = re.sub(r'^\d\d-', '', raw_name)
    
    # Detect book type
    book_type = 'SGK'
    if 'sgv' in clean.lower() or 'sach_giao_vien' in clean.lower():
        book_type = 'SGV'
    elif 'sbt' in clean.lower() or 'sach_bai_tap' in clean.lower() or 'vo_bai_tap' in clean.lower() or 'vbt' in clean.lower() or 'bai_tap' in clean.lower():
        book_type = 'SBT'
    elif 'chuyen-de' in clean.lower() or 'chuyen_de' in clean.lower():
        book_type = 'Chuyên Đề'
        
    # Standardize phrasing
    parts = clean.replace('-', ' ').replace('_', ' ').split()
    # Filter out redundant tokens
    filtered = []
    for p in parts:
        p_low = p.lower()
        if p_low in ['sgk', 'sgv', 'sbt', 'shs']:
            continue
        filtered.append(p)
    
    formatted_name = ' '.join(filtered)
    # Title-case capitalizing first letter of words
    formatted_name = ' '.join(w.capitalize() for w in formatted_name.split())
    
    # Beautify specific Vietnamese words
    replacements = {
        'Tap Mot': 'Tập 1',
        'Tap 1': 'Tập 1',
        'Tap Hai': 'Tập 2',
        'Tap 2': 'Tập 2',
        'Toan': 'Toán',
        'Tieng Viet': 'Tiếng Việt',
        'Tieng Anh': 'Tiếng Anh',
        'Khoa Hoc Tu Nhien': 'Khoa Học Tự Nhiên',
        'Lich Su Va Dia Li': 'Lịch Sử & Địa Lí',
        'Lich Su Va Dia Ly': 'Lịch Sử & Địa Lí',
        'Lich Su Dia Li': 'Lịch Sử & Địa Lí',
        'Dia Li': 'Địa Lí',
        'Dia Ly': 'Địa Lí',
        'Lich Su': 'Lịch Sử',
        'Vat Li': 'Vật Lí',
        'Vat Ly': 'Vật Lí',
        'Hoa Hoc': 'Hóa Học',
        'Sinh Hoc': 'Sinh Học',
        'Tin Hoc': 'Tin Học',
        'Cong Nghe': 'Công Nghệ',
        'Am Nhac': 'Âm Nhạc',
        'Mi Thuat': 'Mĩ Thuật',
        'My Thuat': 'Mỹ Thuật',
        'Dao Duc': 'Đạo Đức',
        'Giao Duc Cong Dan': 'Giáo Dục Công Dân',
        'Giao Duc Kinh Te Va Phap Luat': 'GD Kinh Tế & Pháp Luật',
        'Gdktpl': 'GD Kinh Tế & Pháp Luật',
        'Giao Duc The Chat': 'Giáo Dục Thể Chất',
        'Hoat Dong Trai Nghiem': 'Hoạt Động Trải Nghiệm',
        'Huong Nghiep': 'Hướng Nghiệp',
        'Tu Nhien Va Xa Hoi': 'Tự Nhiên & Xã Hội',
        'Chuyen De Hoc Tap': 'Chuyên Đề Học Tập',
        'Ket Noi Tri Thuc': 'Kết Nối Tri Thức',
        'Ket Noi Tri Thuc Voi Cuoc Song': 'Kết Nối Tri Thức',
        'Voi Cuoc Song': '',
        'Global Success': 'Global Success',
        'Global Sucess': 'Global Success',
        'Sach Giao Vien': 'Sách Giáo Viên',
        'Sach Bai Tap': 'Sách Bài Tập',
        'Vo Bai Tap': 'Vở Bài Tập',
        'Bai Tap': 'Bài Tập'
    }
    
    for k, v in replacements.items():
        formatted_name = re.sub(re.escape(k), v, formatted_name, flags=re.IGNORECASE)
    
    # Ensure grade number is formatted nicely
    formatted_name = re.sub(r'\s+', ' ', formatted_name).strip()
    
    type_badge = f'[{book_type}] ' if book_type in ['SGV', 'SBT', 'Chuyên Đề'] else ''
    full_title = f'{type_badge}{formatted_name}'
    return full_title, book_type

def main():
    print('Starting SGK organization and catalog generation...')
    os.makedirs(PUBLIC_TEXTBOOKS, exist_ok=True)
    
    catalog = []
    seen_file_names = set()
    total_processed = 0

    for grade_num in range(1, 13):
        grade_name = f'Lớp {grade_num}'
        grade_dest_dir = os.path.join(PUBLIC_TEXTBOOKS, f'SGK_lop_{grade_num}')
        os.makedirs(grade_dest_dir, exist_ok=True)
        
        sources = GRADE_SOURCES.get(grade_num, [])
        for src_dir in sources:
            if not os.path.exists(src_dir):
                continue
            
            for fname in sorted(os.listdir(src_dir)):
                if not fname.lower().endswith('.pdf'):
                    continue
                
                # Check for duplicates across same grade
                clean_key = f'{grade_num}_{fname.lower()}'
                if clean_key in seen_file_names:
                    continue
                seen_file_names.add(clean_key)
                
                src_path = os.path.join(src_dir, fname)
                dst_path = os.path.join(grade_dest_dir, fname)
                
                # Hardlink into public directory if not exists
                if not os.path.exists(dst_path):
                    try:
                        os.link(src_path, dst_path)
                    except Exception as e:
                        # Fallback to copy if cross-device or permission error
                        import shutil
                        shutil.copyfile(src_path, dst_path)
                
                # Metadata
                file_size_mb = round(os.path.getsize(dst_path) / (1024 * 1024), 1)
                book_title, book_type = format_clean_title(fname, grade_num)
                subject = detect_subject(book_title, fname)
                
                # Deterministic ID
                h = hashlib.md5(f'{grade_num}_{fname}'.encode('utf-8')).hexdigest()[:8]
                book_id = f'sgk_{grade_num}_{h}'
                
                entry = {
                    'id': book_id,
                    'title': book_title,
                    'fileName': f'SGK_lop_{grade_num}/{fname}',
                    'pdfUrl': f'/textbooks/SGK_lop_{grade_num}/{fname}',
                    'grade': grade_name,
                    'subject': subject,
                    'bookType': book_type,
                    'sizeMB': file_size_mb
                }
                
                catalog.append(entry)
                total_processed += 1

    # Also register LSDL7 standalone
    lsdl7_path = os.path.join(PUBLIC_TEXTBOOKS, 'LSDL7.pdf')
    if os.path.exists(lsdl7_path):
        catalog.append({
            'id': 'sgk_wpr3rk9',
            'title': 'Lịch Sử & Địa Lí 7 (Bản Chuẩn)',
            'fileName': 'LSDL7.pdf',
            'pdfUrl': '/textbooks/LSDL7.pdf',
            'grade': 'Lớp 7',
            'subject': 'Lịch Sử & Địa Lý',
            'bookType': 'SGK',
            'sizeMB': round(os.path.getsize(lsdl7_path) / (1024 * 1024), 1)
        })
        total_processed += 1

    print(f'Successfully cataloged {len(catalog)} textbooks across grades 1-12!')
    
    with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
        
    print(f'Saved catalog to {CATALOG_PATH}')

if __name__ == '__main__':
    main()
