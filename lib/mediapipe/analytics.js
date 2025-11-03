// lib/mediapipe/analytics.js

/**
 * Determines if user is facing forward based on face landmarks
 * @param {Array} faceLandmarks - Face landmark positions
 * @returns {boolean}
 */
export function isFacingForward(faceLandmarks) {
    if (!faceLandmarks || faceLandmarks.length < 468) {
      return false;
    }
    
    try {
      // Key points: nose tip (1), left eye (33), right eye (263)
      const noseTip = faceLandmarks[1];
      const leftEye = faceLandmarks[33];
      const rightEye = faceLandmarks[263];
      
      if (!noseTip || !leftEye || !rightEye) {
        return false;
      }
      
      // Calculate horizontal distance between eyes
      const eyeDistance = Math.abs(leftEye.x - rightEye.x);
      
      if (eyeDistance === 0) {
        return false;
      }
      
      // Calculate nose position relative to eyes
      const noseRelativeX = (noseTip.x - leftEye.x) / eyeDistance;
      
      // User is facing forward if nose is centered between eyes (0.4 to 0.6)
      const isCentered = noseRelativeX > 0.4 && noseRelativeX < 0.6;
      
      // Check z-depth (nose should be close to camera plane)
      const isCloseToCamera = Math.abs(noseTip.z || 0) < 0.1;
      
      return isCentered && isCloseToCamera;
    } catch (error) {
      console.error('Error in isFacingForward:', error);
      return false;
    }
  }
  
  /**
   * Determines if user has bad posture based on pose landmarks
   * @param {Array} poseLandmarks - Pose landmark positions
   * @returns {boolean}
   */
  export function isBadPosture(poseLandmarks) {
    if (!poseLandmarks || poseLandmarks.length < 33) {
      return false;
    }
    
    try {
      // Key points for posture: shoulders (11, 12) and nose (0)
      const leftShoulder = poseLandmarks[11];
      const rightShoulder = poseLandmarks[12];
      const nose = poseLandmarks[0];
      
      if (!leftShoulder || !rightShoulder || !nose) {
        return false;
      }
      
      // Calculate shoulder midpoint
      const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
      
      // Bad posture indicators:
      // 1. Shoulders not level (tilt > 0.05)
      const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
      
      // 2. Head not aligned with shoulders (offset > 0.08)
      const headOffset = Math.abs(nose.x - shoulderMidX);
      
      // 3. Slouching (nose too far forward from shoulders in z-axis)
      const shoulderMidZ = ((leftShoulder.z || 0) + (rightShoulder.z || 0)) / 2;
      const slouching = (nose.z || 0) - shoulderMidZ > 0.1;
      
      return shoulderTilt > 0.05 || headOffset > 0.08 || slouching;
    } catch (error) {
      console.error('Error in isBadPosture:', error);
      return false;
    }
  }
  
  /**
   * Calculate overall body language score based on metrics
   */
  export function calculateBodyLanguageScore(metrics) {
    try {
      const {
        handDetectionDuration = 0,
        eyeContactLossDuration = 0,
        badPostureDuration = 0,
        totalDuration = 1
      } = metrics;
      
      // Prevent division by zero
      if (totalDuration === 0) {
        return 100;
      }
      
      // Convert durations to percentages
      const handGesturePercent = (handDetectionDuration / totalDuration) * 100;
      const eyeContactLossPercent = (eyeContactLossDuration / totalDuration) * 100;
      const badPosturePercent = (badPostureDuration / totalDuration) * 100;
      
      // Scoring logic
      let score = 100;
      
      // Deduct for excessive hand movements (ideal: 10-30%)
      if (handGesturePercent > 40) {
        score -= Math.min(20, (handGesturePercent - 40) * 0.5);
      } else if (handGesturePercent < 5) {
        score -= 10; // Too little gesturing
      }
      
      // Deduct for eye contact loss (should be < 20%)
      if (eyeContactLossPercent > 20) {
        score -= Math.min(30, (eyeContactLossPercent - 20) * 1.5);
      }
      
      // Deduct for bad posture (should be < 15%)
      if (badPosturePercent > 15) {
        score -= Math.min(30, (badPosturePercent - 15) * 2);
      }
      
      return Math.max(0, Math.round(score));
    } catch (error) {
      console.error('Error calculating body language score:', error);
      return 50; // Return neutral score on error
    }
  }
  