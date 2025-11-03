// lib/mediapipe/drawing.js

/**
 * Draw hand landmarks on canvas
 */
export function drawHandLandmarks(canvas, handLandmarks) {
    const ctx = canvas.getContext('2d');
    if (!ctx || !handLandmarks || handLandmarks.length === 0) return;
    
    try {
      for (const landmarks of handLandmarks) {
        // Draw connections
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],  // Thumb
          [0, 5], [5, 6], [6, 7], [7, 8],  // Index
          [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
          [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
          [0, 17], [17, 18], [18, 19], [19, 20]   // Pinky
        ];
        
        connections.forEach(([start, end]) => {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];
          
          if (startPoint && endPoint) {
            ctx.beginPath();
            ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
            ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
            ctx.stroke();
          }
        });
        
        // Draw landmarks
        ctx.fillStyle = '#FF0000';
        landmarks.forEach((landmark) => {
          if (landmark) {
            ctx.beginPath();
            ctx.arc(
              landmark.x * canvas.width,
              landmark.y * canvas.height,
              5,
              0,
              2 * Math.PI
            );
            ctx.fill();
          }
        });
      }
    } catch (error) {
      console.error('Error drawing hand landmarks:', error);
    }
  }
  
  /**
   * Draw face mesh landmarks on canvas
   */
  export function drawFaceMeshLandmarks(canvas, faceResults) {
    const ctx = canvas.getContext('2d');
    if (!ctx || !faceResults.faceLandmarks || faceResults.faceLandmarks.length === 0) return;
    
    try {
      for (const landmarks of faceResults.faceLandmarks) {
        ctx.fillStyle = '#00FFFF';
        
        // Draw key facial points
        const keyPoints = [1, 33, 133, 263, 362, 61, 291]; // Nose, eyes, mouth corners
        
        keyPoints.forEach((index) => {
          const point = landmarks[index];
          if (point) {
            ctx.beginPath();
            ctx.arc(
              point.x * canvas.width,
              point.y * canvas.height,
              3,
              0,
              2 * Math.PI
            );
            ctx.fill();
          }
        });
      }
    } catch (error) {
      console.error('Error drawing face landmarks:', error);
    }
  }
  
  /**
   * Draw pose landmarks on canvas
   */
  export function drawPoseLandmarks(canvas, poseLandmarks) {
    const ctx = canvas.getContext('2d');
    if (!ctx || !poseLandmarks || poseLandmarks.length === 0) return;
    
    try {
      for (const landmarks of poseLandmarks) {
        // Draw connections
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2;
        
        const connections = [
          [11, 12], // Shoulders
          [11, 13], [13, 15], // Left arm
          [12, 14], [14, 16], // Right arm
          [11, 23], [12, 24], // Torso
          [23, 24], // Hips
          [23, 25], [25, 27], // Left leg
          [24, 26], [26, 28]  // Right leg
        ];
        
        connections.forEach(([start, end]) => {
          const startPoint = landmarks[start];
          const endPoint = landmarks[end];
          
          if (startPoint && endPoint && 
              (startPoint.visibility || 0) > 0.5 && 
              (endPoint.visibility || 0) > 0.5) {
            ctx.beginPath();
            ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
            ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
            ctx.stroke();
          }
        });
        
        // Draw landmarks
        ctx.fillStyle = '#FF00FF';
        landmarks.forEach((landmark) => {
          if (landmark && (landmark.visibility || 0) > 0.5) {
            ctx.beginPath();
            ctx.arc(
              landmark.x * canvas.width,
              landmark.y * canvas.height,
              4,
              0,
              2 * Math.PI
            );
            ctx.fill();
          }
        });
      }
    } catch (error) {
      console.error('Error drawing pose landmarks:', error);
    }
  }
  