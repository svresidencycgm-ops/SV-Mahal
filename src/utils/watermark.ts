/**
 * Utility to overlay a visible timestamp watermark onto an image.
 * Accepts a base64 Data URL or file and returns a Promise resolving to the watermarked base64 Data URL.
 */
export const addTimestampWatermark = (base64Str: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!base64Str) {
      resolve('');
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Str);
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Watermark formatting
        const now = new Date();
        const timestamp = now.toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        // Determine font size relative to image dimensions
        const fontSize = Math.max(12, Math.floor(canvas.width / 35));
        ctx.font = `bold ${fontSize}px sans-serif`;
        
        // Measure text size for background banner
        const textWidth = ctx.measureText(timestamp).width;
        const padding = fontSize * 0.4;
        const bannerWidth = textWidth + padding * 2;
        const bannerHeight = fontSize + padding * 2;
        
        const x = canvas.width - bannerWidth - padding;
        const y = canvas.height - bannerHeight - padding;

        // Draw orange background badge
        ctx.fillStyle = 'rgba(239, 108, 0, 0.85)'; // High-visibility premium orange
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, bannerWidth, bannerHeight, fontSize * 0.3);
        } else {
          ctx.rect(x, y, bannerWidth, bannerHeight);
        }
        ctx.fill();

        // Draw white text
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'top';
        ctx.fillText(timestamp, x + padding, y + padding);

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch (err) {
        console.error('Failed to apply watermark:', err);
        resolve(base64Str); // Fallback to original
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};
