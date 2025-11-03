// lib/mediapipe/initialization.js
import {
    FilesetResolver,
    HandLandmarker,
    FaceLandmarker,
    PoseLandmarker,
  } from '@mediapipe/tasks-vision';
  
  let visionFileset = null;
  
  export async function initializeVision() {
    if (!visionFileset) {
      try {
        visionFileset = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
      } catch (error) {
        console.error('Error initializing vision fileset:', error);
        throw error;
      }
    }
    return visionFileset;
  }
  
  export async function initializeHandDetection() {
    try {
      const vision = await initializeVision();
      
      return await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    } catch (error) {
      console.error('Error initializing hand detection:', error);
      throw error;
    }
  }
  
  export async function initializeFaceDetection() {
    try {
      const vision = await initializeVision();
      
      return await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    } catch (error) {
      console.error('Error initializing face detection:', error);
      throw error;
    }
  }
  
  export async function initializePoseDetection() {
    try {
      const vision = await initializeVision();
      
      return await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    } catch (error) {
      console.error('Error initializing pose detection:', error);
      throw error;
    }
  }
  