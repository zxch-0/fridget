function preprocess(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1800;
      const scale = Math.min(1.8, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const image = ctx.getImageData(0, 0, w, h);
      const d = image.data;
      for (let i = 0; i < d.length; i += 4) {
        const g = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
        const c = g > 168 ? 255 : g < 90 ? 0 : (g - 90) * 3.2;
        d[i] = d[i + 1] = d[i + 2] = c;
      }
      ctx.putImageData(image, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('canvas'))), 'image/png', 0.95);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function readReceipt(file, onProgress) {
  onProgress?.('Préparation de l’image…');
  const blob = await preprocess(file);
  onProgress?.('Chargement du moteur de lecture…');
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('fra', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && m.progress) {
        onProgress?.(`Lecture du ticket… ${Math.round(m.progress * 100)} %`);
      }
    },
  });
  onProgress?.('Lecture du ticket…');
  const { data } = await worker.recognize(blob);
  await worker.terminate();
  return data.text || '';
}
