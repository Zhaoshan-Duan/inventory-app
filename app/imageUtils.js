export const resizeImage = (dataUrl, maxWidth) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate new dimensions
      let newWidth = img.width;
      let newHeight = img.height;

      if (newWidth > maxWidth) {
        newHeight = (maxWidth * newHeight) / newWidth;
        newWidth = maxWidth;
      }

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw resized image on canvas
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Get new data URL
      const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // You can adjust quality here

      resolve(resizedDataUrl);
    };
  });
};
