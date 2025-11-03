// hooks/useCamera.js
import { useEffect, useState } from 'react';

export const useCamera = (videoRef) => {
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    let stream = null;
    
    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsReady(true);
          };
        }
      } catch (err) {
        console.error('Camera initialization error:', err);
        setError('Failed to access camera. Please grant camera permissions.');
      }
    };
    
    initCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoRef]);
  
  return { error, isReady };
};
