export const arrayBufferToBase64 = (buffer) => {
  if (!buffer) return null;

  try {
    let binary = '';
    const bytes = new Uint8Array(buffer.data || buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  } catch (error) {
    console.error("Failed to convert array buffer to base64:", error);
    return null;
  }
};

export const processProfileImage = (profileImage) => {
  if (!profileImage) return null;

  if (profileImage.preview) {
    return profileImage.preview;
  }

  if (profileImage.url) {
    return profileImage.url;
  }

  if (profileImage.data) {
    try {
      if (typeof profileImage.data === 'string') {
        if (profileImage.data.startsWith('data:')) {
          return profileImage.data;
        }
        return `data:${profileImage.contentType || 'image/jpeg'};base64,${profileImage.data}`;
      }

      if (typeof profileImage.data === 'object') {
        const base64String = arrayBufferToBase64(profileImage.data);
        if (base64String) {
          return `data:${profileImage.contentType || 'image/jpeg'};base64,${base64String}`;
        }
      }
    } catch (err) {
      console.error('Error processing profile image:', err);
      return null;
    }
  }

  return null;
}; 