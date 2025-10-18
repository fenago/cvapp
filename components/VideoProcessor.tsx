"use client";

import { useRef, useState, useEffect } from 'react';
import { Video, Camera, Square, Play, Pause, Info } from 'lucide-react';

interface VideoProcessorProps {
  cv: any;
}

export default function VideoProcessor({ cv }: VideoProcessorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const [streaming, setStreaming] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  // Processing options
  const [processMode, setProcessMode] = useState<'none' | 'grayscale' | 'canny' | 'blur'>('none');
  const [fps, setFps] = useState(0);

  const addDebugLog = (message: string) => {
    console.log(`[VideoProcessor] ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const startCamera = async () => {
    try {
      addDebugLog('Starting camera...');
      setError(null);
      setDebugInfo([]); // Clear previous logs
      
      addDebugLog('Requesting camera permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      addDebugLog(`Camera stream obtained: ${stream.id}`);
      addDebugLog(`Video tracks: ${stream.getVideoTracks().length}`);

      if (!videoRef.current) {
        addDebugLog('ERROR: videoRef.current is null');
        setError('Video element not available');
        return;
      }

      addDebugLog('Setting video srcObject...');
      videoRef.current.srcObject = stream;
      
      addDebugLog('Calling video.play()...');
      await videoRef.current.play();
      
      addDebugLog(`Video playing: ${!videoRef.current.paused}`);
      addDebugLog(`Video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
      
      setStreaming(true);
      addDebugLog('Camera started successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addDebugLog(`ERROR: ${errorMsg}`);
      console.error('Error accessing camera:', err);
      setError(`Failed to access camera: ${errorMsg}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
    setProcessing(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const processVideoFrame = () => {
    if (!cv) {
      addDebugLog('ERROR: cv not available in processVideoFrame');
      return;
    }
    if (!videoRef.current) {
      addDebugLog('ERROR: videoRef.current is null in processVideoFrame');
      return;
    }
    if (!canvasRef.current) {
      addDebugLog('ERROR: canvasRef.current is null in processVideoFrame');
      return;
    }
    if (!streaming) {
      addDebugLog('SKIP: Not streaming in processVideoFrame');
      return;
    }

    const begin = Date.now();

    try {
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;

      if (videoWidth === 0 || videoHeight === 0) {
        addDebugLog(`WARNING: Video dimensions are ${videoWidth}x${videoHeight}, retrying...`);
        // Retry after a short delay
        setTimeout(() => {
          if (processing) {
            processVideoFrame();
          }
        }, 100);
        return;
      }

      // Set canvas size to match video
      if (canvasRef.current.width !== videoWidth) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        addDebugLog(`Canvas resized to ${videoWidth}x${videoHeight}`);
      }

      // Draw video frame to hidden canvas, then read from canvas
      if (!hiddenCanvasRef.current) {
        addDebugLog('ERROR: hiddenCanvasRef.current is null');
        return;
      }

      // Set hidden canvas size to match video
      if (hiddenCanvasRef.current.width !== videoWidth) {
        hiddenCanvasRef.current.width = videoWidth;
        hiddenCanvasRef.current.height = videoHeight;
      }

      // Draw current video frame to hidden canvas
      const ctx = hiddenCanvasRef.current.getContext('2d');
      if (!ctx) {
        addDebugLog('ERROR: Could not get 2d context from hidden canvas');
        return;
      }
      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

      // Read from the hidden canvas
      const src = cv.imread(hiddenCanvasRef.current);

      let dst = new cv.Mat();

      // Apply processing based on mode
      switch (processMode) {
        case 'grayscale':
          cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
          cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
          break;
        
        case 'canny':
          cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
          cv.Canny(dst, dst, 50, 150);
          cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
          break;
        
        case 'blur':
          const ksize = new cv.Size(15, 15);
          cv.GaussianBlur(src, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
          break;
        
        default:
          dst = src.clone();
      }

      // Display processed frame
      cv.imshow(canvasRef.current, dst);

      // Clean up
      src.delete();
      dst.delete();

      // Calculate FPS
      const delay = Date.now() - begin;
      setFps(Math.round(1000 / delay));

      // Schedule next frame
      if (processing) {
        animationFrameRef.current = requestAnimationFrame(processVideoFrame);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addDebugLog(`ERROR in processVideoFrame: ${errorMsg}`);
      console.error('Error processing video frame:', err);
      
      // Try to continue processing despite error
      if (processing) {
        setTimeout(() => {
          processVideoFrame();
        }, 100);
      }
    }
  };

  const toggleProcessing = () => {
    if (processing) {
      setProcessing(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      setProcessing(true);
      processVideoFrame();
    }
  };

  // Auto-start processing when mode changes and camera is streaming
  useEffect(() => {
    if (streaming) {
      addDebugLog(`Processing mode changed to: ${processMode}`);
      
      // Auto-start processing if not already processing
      if (!processing) {
        addDebugLog('Auto-starting processing...');
        setProcessing(true);
        processVideoFrame();
      } else {
        // Restart processing with new mode
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        processVideoFrame();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Real-time Video Processing
            </h2>
          </div>
          
          <div className="flex gap-3">
            {!streaming ? (
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Camera className="w-5 h-5" />
                Start Camera
              </button>
            ) : (
              <>
                <button
                  onClick={toggleProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {processing ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Process
                    </>
                  )}
                </button>
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Square className="w-5 h-5" />
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Processing Controls */}
      {streaming && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Processing Mode
          </h3>
          
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setProcessMode('none')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                processMode === 'none'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setProcessMode('grayscale')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                processMode === 'grayscale'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Grayscale
            </button>
            <button
              onClick={() => setProcessMode('canny')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                processMode === 'canny'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Edge Detection
            </button>
            <button
              onClick={() => setProcessMode('blur')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                processMode === 'blur'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Blur
            </button>
          </div>

          {processing && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Processing at ~{fps} FPS
            </div>
          )}
        </div>
      )}

      {/* Video Display */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Video */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Camera Feed
          </h3>
          <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            {!streaming && (
              <div className="text-center p-8 z-10">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Camera not started</p>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{
                display: streaming ? 'block' : 'none',
                position: streaming ? 'relative' : 'absolute'
              }}
            />
          </div>
        </div>

        {/* Processed Video */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Processed Output
          </h3>
          <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            {!(streaming && processing) && (
              <div className="text-center p-8 z-10">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {streaming ? 'Processing will start automatically' : 'No video processing'}
                </p>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
              style={{
                display: streaming && processing ? 'block' : 'none',
                position: streaming && processing ? 'relative' : 'absolute'
              }}
            />
          </div>
        </div>
      </div>

      {/* Hidden canvas for video frame capture */}
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />

      {/* Debug Console */}
      {debugInfo.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Info className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Debug Console
              </h3>
            </div>
            <button
              onClick={() => setDebugInfo([])}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Clear
            </button>
          </div>
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs max-h-64 overflow-y-auto">
            {debugInfo.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Check browser console (F12) for additional details
          </p>
        </div>
      )}
    </div>
  );
}
