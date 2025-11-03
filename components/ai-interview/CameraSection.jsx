'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Hand, Eye, Activity, AlertTriangle } from 'lucide-react';

export default function CameraSection({ isActive, onMetricsUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  
  const { error: cameraError, isReady } = useCamera(videoRef);
  
  const {
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
  } = useMediaPipe(videoRef, canvasRef, overlayEnabled);
  
  // Memoize the callback to prevent infinite loops
  const memoizedOnMetricsUpdate = useCallback(onMetricsUpdate, []);
  
  // Update parent component with metrics - FIX: Use interval instead of effect on every change
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      const metrics = {
        handDetectionCount: handDetectionCounter,
        handDetectionDuration: handDetectionDuration,
        eyeContactLossCount: notFacingCounter,
        eyeContactLossDuration: notFacingDuration,
        badPostureCount: badPostureCounter,
        badPostureDuration: badPostureDuration
      };
      memoizedOnMetricsUpdate(metrics);
    }, 2000); // Update every 2 seconds instead of on every change
    
    return () => clearInterval(interval);
  }, [
    isActive,
    handDetectionCounter,
    handDetectionDuration,
    notFacingCounter,
    notFacingDuration,
    badPostureCounter,
    badPostureDuration,
    memoizedOnMetricsUpdate
  ]);
  
  if (cameraError) {
    return (
      <Card className="border-red-300">
        <CardHeader>
          <CardTitle className="text-red-600">Camera Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{cameraError}</p>
          <p className="text-sm text-gray-600 mt-2">
            Please grant camera permissions and refresh the page.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Body Language Monitoring</CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              id="overlay-toggle"
              checked={overlayEnabled}
              onCheckedChange={setOverlayEnabled}
              disabled={!isActive}
            />
            <Label htmlFor="overlay-toggle" className="text-sm">
              {overlayEnabled ? 'Overlay On' : 'Overlay Off'}
            </Label>
          </div>
        </CardHeader>
        <CardContent>
          {/* Video Feed */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="absolute inset-0 w-full h-full"
              style={{ backgroundColor: 'transparent' }}
            />
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <Badge variant={isReady ? 'default' : 'secondary'}>
                {isReady ? '● Recording' : 'Initializing...'}
              </Badge>
            </div>
          </div>
          
          {/* Real-time Metrics */}
          <div className="grid grid-cols-3 gap-3">
            {/* Hand Gesture Detection */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Hand className="w-4 h-4" />
                  <CardTitle className="text-sm">Gestures</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge
                  variant={isHandOnScreenRef.current ? 'destructive' : 'default'}
                  className={
                    isHandOnScreenRef.current
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }
                >
                  {isHandOnScreenRef.current ? 'Detected' : 'Natural'}
                </Badge>
                <div className="text-xs space-y-1">
                  <p>Count: <span className="font-semibold">{handDetectionCounter}</span></p>
                  <p>Duration: <span className="font-semibold">{handDetectionDuration.toFixed(1)}s</span></p>
                </div>
              </CardContent>
            </Card>
            
            {/* Eye Contact */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <CardTitle className="text-sm">Eye Contact</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge
                  variant={!notFacingRef.current ? 'default' : 'destructive'}
                  className={
                    !notFacingRef.current
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }
                >
                  {!notFacingRef.current ? 'Maintained' : 'Lost'}
                </Badge>
                <div className="text-xs space-y-1">
                  <p>Breaks: <span className="font-semibold">{notFacingCounter}</span></p>
                  <p>Lost: <span className="font-semibold">{notFacingDuration.toFixed(1)}s</span></p>
                </div>
              </CardContent>
            </Card>
            
            {/* Posture */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <CardTitle className="text-sm">Posture</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge
                  variant={!hasBadPostureRef.current ? 'default' : 'destructive'}
                  className={
                    !hasBadPostureRef.current
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }
                >
                  {hasBadPostureRef.current ? 'Poor' : 'Good'}
                </Badge>
                <div className="text-xs space-y-1">
                  <p>Issues: <span className="font-semibold">{badPostureCounter}</span></p>
                  <p>Duration: <span className="font-semibold">{badPostureDuration.toFixed(1)}s</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tips */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Tips for Best Results:</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>Keep gestures natural and moderate</li>
                  <li>Maintain steady eye contact with camera</li>
                  <li>Sit upright with shoulders back</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
