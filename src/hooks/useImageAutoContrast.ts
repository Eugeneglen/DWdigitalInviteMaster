'use client';

import { useState, useEffect } from 'react';
import { getAutoTextColorFromRGB } from '@/lib/contrast';

interface ImageAutoContrast {
  /** Primary text colour for headline */
  textColor: string;
  /** Subtitle colour (70% opacity of primary) */
  subtitleColor: string;
  /** True while the image is being analysed */
  analysing: boolean;
  /** Text-shadow for extra readability on image backgrounds */
  textShadow: string;
}

/**
 * Analyses the centre region of a background image to determine whether
 * it is predominantly light or dark, then returns the appropriate text
 * colour using the same WCAG luminance logic as the page-level contrast
 * system — but independently, based on the actual image content.
 *
 * Uses an off-screen <canvas> to sample pixel data.  Falls back to dark
 * text (#1A1A1A) if the image cannot be loaded (CORS, network error, etc.).
 */
export function useImageAutoContrast(imageUrl: string): ImageAutoContrast {
  const [result, setResult] = useState<ImageAutoContrast>({
    textColor: '#1A1A1A',
    subtitleColor: 'rgba(26, 26, 26, 0.7)',
    analysing: true,
    textShadow: '0 1px 3px rgba(0,0,0,0.1)',
  });

  useEffect(() => {
    if (!imageUrl) {
      setResult({
        textColor: '#1A1A1A',
        subtitleColor: 'rgba(26, 26, 26, 0.7)',
        analysing: false,
        textShadow: '0 1px 3px rgba(0,0,0,0.1)',
      });
      return;
    }

    let cancelled = false;

    const analyse = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        if (cancelled) return;

        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) throw new Error('no 2d context');

          // Sample the centre band of the image — that's where the headline sits
          const sampleW = Math.min(img.naturalWidth, 600);
          const sampleH = Math.min(img.naturalHeight, 300);
          const sx = Math.floor((img.naturalWidth - sampleW) / 2);
          const sy = Math.floor((img.naturalHeight - sampleH) / 2);

          canvas.width = sampleW;
          canvas.height = sampleH;
          ctx.drawImage(img, sx, sy, sampleW, sampleH, 0, 0, sampleW, sampleH);

          const { data } = ctx.getImageData(0, 0, sampleW, sampleH);

          // Compute average RGB of the sampled region
          let totalR = 0;
          let totalG = 0;
          let totalB = 0;
          const pixelCount = sampleW * sampleH;

          for (let i = 0; i < data.length; i += 4) {
            totalR += data[i];
            totalG += data[i + 1];
            totalB += data[i + 2];
          }

          const avgR = Math.round(totalR / pixelCount);
          const avgG = Math.round(totalG / pixelCount);
          const avgB = Math.round(totalB / pixelCount);

          const textColor = getAutoTextColorFromRGB(avgR, avgG, avgB);
          const isLight = textColor === '#1A1A1A';

          setResult({
            textColor,
            subtitleColor: isLight
              ? 'rgba(26, 26, 26, 0.7)'
              : 'rgba(232, 224, 208, 0.7)',
            analysing: false,
            textShadow: isLight
              ? '0 1px 3px rgba(0,0,0,0.1)'
              : '0 1px 4px rgba(0,0,0,0.5)',
          });
        } catch {
          // CORS tainted canvas, missing context, etc. — safe fallback to dark text
          setResult({
            textColor: '#1A1A1A',
            subtitleColor: 'rgba(26, 26, 26, 0.7)',
            analysing: false,
            textShadow: '0 1px 3px rgba(0,0,0,0.1)',
          });
        }
      };

      img.onerror = () => {
        if (!cancelled) {
          setResult({
            textColor: '#1A1A1A',
            subtitleColor: 'rgba(26, 26, 26, 0.7)',
            analysing: false,
            textShadow: '0 1px 3px rgba(0,0,0,0.1)',
          });
        }
      };

      img.src = imageUrl;
    };

    // Defer slightly to avoid blocking the initial paint
    const timer = setTimeout(analyse, 50);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [imageUrl]);

  return result;
}