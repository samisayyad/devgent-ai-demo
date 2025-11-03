// hooks/useMediaPipe.js
import { useEffect, useRef, useState } from 'react';
import {
  initializeHandDetection,
  initializeFaceDetection,
  initializePoseDetection
} from '@/lib/mediapipe/initialization';
import { isFacingForward, isBadPosture } from '@/lib/mediapipe/analytics';
import {
  drawHandLandmarks,
  drawFaceMeshLandmarks,
  drawPoseLandmarks
} from '@/lib/mediapipe/drawing';

export const useMediaPipe = (videoRef, canvasRef, overlayEnabled) => {
  // Detection states
  const [handPresence, setHandPresence] = useState(false);
  const [facePresence, setFacePresence] = useState(false);
  const [posePresence, setPosePresence] = useState(false);
  
  // Metrics
  const [handDetectionCounter, setHandDetectionCounter] = useState(0);
  const [handDetectionDuration, setHandDetectionDuration] = useState(0);
  const [notFacingCounter, setNotFacingCounter] = useState(0);
  const [notFacingDuration, setNotFacingDuration] = useState(0);
  const [badPostureCounter, setBadPostureCounter] = useState(0);
  const [badPostureDuration, setBadPostureDuration] = useState(0);
  
  // Refs for tracking
  const isHandOnScreenRef = useRef(false);
  const handDetectionStartTimeRef = useRef(0);
  const notFacingStartTimeRef = useRef(null);
  const notFacingRef = useRef(false);
  const hasBadPostureRef = useRef(false);
  const badPostureStartTimeRef = useRef(0);
  
  // Detector refs
  const handDetectorRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const poseDetectorRef = useRef(null);
  
  useEffect(() => {
    let animationFrameId;
    
    const setupDetectors = async () => {
      try {
        handDetectorRef.current = await initializeHandDetection();
        faceDetectorRef.current = await initializeFaceDetection();
        poseDetectorRef.current = await initializePoseDetection();
        console.log('✅ MediaPipe detectors initialized');
      } catch (error) {
        console.error('❌ Failed to initialize MediaPipe:', error);
      }
    };
    
    const detect = () => {
      const currentTime = performance.now();
      
      if (
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        canvasRef.current
      ) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Hand Detection
        if (handDetectorRef.current) {
          try {
            const handResults = handDetectorRef.current.detectForVideo(
              videoRef.current,
              currentTime
            );
            
            setHandPresence(handResults.handednesses.length > 0);
            
            if (handResults.landmarks.length > 0) {
              if (!isHandOnScreenRef.current) {
                setHandDetectionCounter((prev) => prev + 1);
                handDetectionStartTimeRef.current = currentTime;
                isHandOnScreenRef.current = true;
              }
            } else {
              if (isHandOnScreenRef.current && handDetectionStartTimeRef.current) {
                const durationSec = (currentTime - handDetectionStartTimeRef.current) / 1000;
                setHandDetectionDuration((prev) => prev + durationSec);
                handDetectionStartTimeRef.current = 0;
              }
              isHandOnScreenRef.current = false;
            }
            
            if (overlayEnabled && handResults.landmarks) {
              drawHandLandmarks(canvas, handResults.landmarks);
            }
          } catch (error) {
            console.error('Hand detection error:', error);
          }
        }
        
        // Face Detection
        if (faceDetectorRef.current) {
          try {
            const faceResults = faceDetectorRef.current.detectForVideo(
              videoRef.current,
              currentTime
            );
            
            const hasFace = faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0;
            setFacePresence(hasFace);
            
            if (hasFace) {
              const lookingForward = isFacingForward(faceResults.faceLandmarks[0]);
              notFacingRef.current = !lookingForward;
              
              if (!lookingForward) {
                if (notFacingStartTimeRef.current === null) {
                  notFacingStartTimeRef.current = currentTime;
                  setNotFacingCounter((prev) => prev + 1);
                }
              } else {
                if (notFacingStartTimeRef.current !== null) {
                  const elapsedSec = (currentTime - notFacingStartTimeRef.current) / 1000;
                  setNotFacingDuration((prev) => prev + elapsedSec);
                  notFacingStartTimeRef.current = null;
                }
              }
              
              if (overlayEnabled) {
                drawFaceMeshLandmarks(canvas, faceResults);
              }
            }
          } catch (error) {
            console.error('Face detection error:', error);
          }
        }
        
        // Pose Detection
        if (poseDetectorRef.current) {
          try {
            const poseResults = poseDetectorRef.current.detectForVideo(
              videoRef.current,
              currentTime
            );
            
            const hasPose = poseResults.landmarks && poseResults.landmarks.length > 0;
            setPosePresence(hasPose);
            
            if (hasPose) {
              const landmarks = poseResults.landmarks[0];
              const badPosture = isBadPosture(landmarks);
              
              if (badPosture) {
                if (!hasBadPostureRef.current) {
                  setBadPostureCounter((prev) => prev + 1);
                  badPostureStartTimeRef.current = currentTime;
                  hasBadPostureRef.current = true;
                }
              } else {
                if (hasBadPostureRef.current) {
                  const durationSec = (currentTime - badPostureStartTimeRef.current) / 1000;
                  setBadPostureDuration((prev) => prev + durationSec);
                  badPostureStartTimeRef.current = 0;
                  hasBadPostureRef.current = false;
                }
              }
              
              if (overlayEnabled && poseResults.landmarks) {
                drawPoseLandmarks(canvas, poseResults.landmarks);
              }
            }
          } catch (error) {
            console.error('Pose detection error:', error);
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(detect);
    };
    
    setupDetectors().then(() => {
      detect();
    });
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      handDetectorRef.current?.close();
      faceDetectorRef.current?.close();
      poseDetectorRef.current?.close();
    };
  }, [videoRef, canvasRef, overlayEnabled]);
  
  return {
    handPresence,
    facePresence,
    posePresence,
    handDetectionCounter,
    handDetectionDuration,
    notFacingCounter,
    notFacingDuration,
    badPostureCounter,
    badPostureDuration,
    isHandOnScreenRef,
    notFacingRef,
    hasBadPostureRef
  };
};
