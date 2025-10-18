import { useState, useEffect } from 'react';

declare global {
  interface Window {
    cv: any;
  }
}

export function useOpenCV() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if OpenCV is already loaded
    if (typeof window !== 'undefined' && window.cv && window.cv.Mat) {
      setLoaded(true);
      return;
    }

    // Listen for opencv-ready event
    const handleOpenCVReady = () => {
      if (window.cv && window.cv.Mat) {
        setLoaded(true);
      } else {
        setError('OpenCV loaded but cv object not available');
      }
    };

    window.addEventListener('opencv-ready', handleOpenCVReady);

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (!loaded) {
        setError('OpenCV loading timeout');
      }
    }, 30000); // 30 second timeout

    return () => {
      window.removeEventListener('opencv-ready', handleOpenCVReady);
      clearTimeout(timeout);
    };
  }, [loaded]);

  return { loaded, error, cv: typeof window !== 'undefined' ? window.cv : null };
}
