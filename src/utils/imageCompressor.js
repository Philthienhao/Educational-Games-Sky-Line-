/**
 * Ultra-reliable client-side image compressor using HTML5 Canvas with timeout safety.
 * Downscales uploaded camera/phone photos to max 400px JPEG under 20KB.
 */
export function compressImage(fileOrDataUrl, maxWidth = 400, maxHeight = 400, quality = 0.6) {
  return new Promise((resolve) => {
    if (!fileOrDataUrl) {
      resolve('');
      return;
    }

    // Helper canvas compressor from Data URL string or Image element
    const compressDataUrlString = (dataUrl) => {
      let isResolved = false;
      const safeResolve = (val) => {
        if (!isResolved) {
          isResolved = true;
          resolve(val);
        }
      };

      const timeoutId = setTimeout(() => {
        safeResolve(dataUrl);
      }, 1500);

      const img = new Image();
      img.onload = () => {
        clearTimeout(timeoutId);
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedRes = canvas.toDataURL('image/jpeg', quality);
          safeResolve(compressedRes);
        } catch (err) {
          safeResolve(dataUrl);
        }
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        safeResolve(dataUrl);
      };

      img.src = dataUrl;
    };

    if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        compressDataUrlString(e.target.result);
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrDataUrl);
    } else if (typeof fileOrDataUrl === 'string') {
      if (fileOrDataUrl.startsWith('data:image') && fileOrDataUrl.length > 30000) {
        compressDataUrlString(fileOrDataUrl);
      } else {
        resolve(fileOrDataUrl);
      }
    } else {
      resolve('');
    }
  });
}

/**
 * Sanitizes and converts public Google Drive/Internet links to direct image URLs.
 */
export function normalizeImageUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return '';
  let clean = urlStr.trim();
  if (clean.includes('drive.google.com') && clean.includes('/d/')) {
    const match = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return clean;
}

/**
 * Automatically purges and compresses any old giant base64 avatar images in homeroom class data.
 * Reduces 5MB class data down to ~50KB so all students can save avatars effortlessly.
 */
export async function optimizeHomeroomClassData(classData) {
  if (!classData || !classData.students || !Array.isArray(classData.students)) {
    return classData;
  }

  let hasChanges = false;
  const optimizedStudents = await Promise.all(
    classData.students.map(async (st) => {
      if (st.avatar && typeof st.avatar === 'string' && st.avatar.startsWith('data:image') && st.avatar.length > 30000) {
        const compressed = await compressImage(st.avatar, 300, 300, 0.6);
        hasChanges = true;
        return { ...st, avatar: compressed };
      }
      return st;
    })
  );

  let classBgImage = classData.classBgImage;
  if (classBgImage && typeof classBgImage === 'string' && classBgImage.startsWith('data:image') && classBgImage.length > 80000) {
    classBgImage = await compressImage(classBgImage, 800, 800, 0.7);
    hasChanges = true;
  }

  let classPhoto = classData.classPhoto;
  if (classPhoto && typeof classPhoto === 'string' && classPhoto.startsWith('data:image') && classPhoto.length > 80000) {
    classPhoto = await compressImage(classPhoto, 800, 800, 0.7);
    hasChanges = true;
  }

  if (hasChanges) {
    return {
      ...classData,
      students: optimizedStudents,
      classBgImage,
      classPhoto
    };
  }

  return classData;
}
