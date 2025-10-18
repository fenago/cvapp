"use client";

import { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Sliders, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { OpenCVUtils, ProcessingOptions } from '@/lib/opencv-utils';

interface ImageProcessorProps {
  cv: any;
}

export default function ImageProcessor({ cv }: ImageProcessorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  
  // Processing options
  const [grayscale, setGrayscale] = useState(false);
  const [blur, setBlur] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1);
  const [cannyEdge, setCannyEdge] = useState(false);
  const [cannyThreshold1, setCannyThreshold1] = useState(50);
  const [cannyThreshold2, setCannyThreshold2] = useState(150);

  const addDebugLog = (message: string) => {
    console.log(`[ImageProcessor] ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    addDebugLog(`File selected: ${file ? file.name : 'none'}`);
    
    if (!file) {
      addDebugLog('ERROR: No file selected');
      return;
    }

    setFileName(file.name);
    setError(null);
    setImageLoaded(false);
    setDebugInfo([]); // Clear previous logs
    addDebugLog(`File type: ${file.type}, Size: ${(file.size / 1024).toFixed(2)} KB`);

    // Use setTimeout to ensure the ref is available after render
    setTimeout(() => {
      if (!imageRef.current) {
        addDebugLog('ERROR: imageRef.current is still null after timeout');
        setError('Image reference not available. Please try again.');
        return;
      }

      try {
        const url = URL.createObjectURL(file);
        addDebugLog(`Created object URL: ${url.substring(0, 50)}...`);
        imageRef.current.src = url;
        addDebugLog('Set image src, waiting for onLoad event...');
      } catch (err) {
        addDebugLog(`ERROR creating object URL: ${err}`);
        setError(`Failed to load image: ${err}`);
      }
    }, 0);
  };

  const handleImageLoad = () => {
    addDebugLog('Image onLoad event fired!');
    
    if (!imageRef.current) {
      addDebugLog('ERROR: imageRef.current is null in handleImageLoad');
      return;
    }

    const width = imageRef.current.naturalWidth;
    const height = imageRef.current.naturalHeight;
    
    addDebugLog(`Image dimensions: ${width}x${height}`);
    setImageDimensions({ width, height });

    if (width === 0 || height === 0) {
      addDebugLog('ERROR: Image has zero dimensions');
      setError('Image failed to load properly (zero dimensions)');
      return;
    }

    setImageLoaded(true);
    addDebugLog('Image loaded successfully, calling processImage...');
    processImage();
  };

  const handleImageError = (e: any) => {
    addDebugLog(`ERROR: Image failed to load - ${e.type}`);
    setError('Failed to load image. Please try a different file.');
    setImageLoaded(false);
  };

  const processImage = () => {
    addDebugLog('processImage() called');
    
    if (!cv) {
      addDebugLog('ERROR: cv is not available');
      setError('OpenCV not loaded');
      return;
    }

    if (!imageRef.current) {
      addDebugLog('ERROR: imageRef.current is null');
      return;
    }

    if (!canvasRef.current) {
      addDebugLog('ERROR: canvasRef.current is null');
      return;
    }

    if (!imageLoaded) {
      addDebugLog('SKIP: Image not loaded yet');
      return;
    }

    setProcessing(true);
    setError(null);
    addDebugLog('Starting image processing...');

    try {
      const utils = new OpenCVUtils(cv);
      addDebugLog('OpenCVUtils created');
      
      // Read image from img element
      addDebugLog('Reading image with cv.imread...');
      const src = cv.imread(imageRef.current);
      addDebugLog(`Mat created: ${src.rows}x${src.cols}, channels: ${src.channels()}, type: ${src.type()}`);
      
      // Prepare processing options
      const options: ProcessingOptions = {
        grayscale,
        blur: blur > 0 ? blur : undefined,
        brightness: brightness !== 0 ? brightness : undefined,
        contrast: contrast !== 1 ? contrast : undefined,
        canny: cannyEdge ? { threshold1: cannyThreshold1, threshold2: cannyThreshold2 } : undefined,
      };
      addDebugLog(`Processing options: ${JSON.stringify(options)}`);

      // Process image
      addDebugLog('Calling utils.processImage...');
      const processed = utils.processImage(src, options);
      addDebugLog(`Processed Mat: ${processed.rows}x${processed.cols}`);
      
      // Display result
      addDebugLog('Displaying with cv.imshow...');
      cv.imshow(canvasRef.current, processed);
      addDebugLog('Image displayed successfully!');
      
      // Clean up
      src.delete();
      processed.delete();
      addDebugLog('Mats cleaned up');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addDebugLog(`ERROR in processImage: ${errorMsg}`);
      console.error('Error processing image:', error);
      setError(`Processing error: ${errorMsg}`);
    } finally {
      setProcessing(false);
    }
  };

  // Re-process when options change
  useEffect(() => {
    if (imageLoaded) {
      addDebugLog('Options changed, re-processing...');
      processImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grayscale, blur, brightness, contrast, cannyEdge, cannyThreshold1, cannyThreshold2]);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300">Error</h4>
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {imageLoaded && !error && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-300">Image Loaded Successfully</h4>
              <p className="text-green-700 dark:text-green-400 text-sm">
                {fileName} • {imageDimensions?.width}x{imageDimensions?.height} pixels
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <ImageIcon className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Image Processing
          </h2>
        </div>
        
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-indigo-500 transition-colors cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Click to upload an image
          </p>
          <p className="text-sm text-gray-500">PNG, JPG, JPEG up to 10MB</p>
          {fileName && (
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
              Selected: {fileName}
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Controls Section */}
      {imageLoaded && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sliders className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Processing Controls
            </h3>
          </div>

          <div className="space-y-4">
            {/* Grayscale Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700 dark:text-gray-300 font-medium">
                Grayscale
              </label>
              <input
                type="checkbox"
                checked={grayscale}
                onChange={(e) => setGrayscale(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded"
              />
            </div>

            {/* Blur Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-gray-700 dark:text-gray-300 font-medium">
                  Blur
                </label>
                <span className="text-gray-600 dark:text-gray-400">{blur}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Brightness Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-gray-700 dark:text-gray-300 font-medium">
                  Brightness
                </label>
                <span className="text-gray-600 dark:text-gray-400">{brightness}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-gray-700 dark:text-gray-300 font-medium">
                  Contrast
                </label>
                <span className="text-gray-600 dark:text-gray-400">{contrast.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Canny Edge Detection */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700 dark:text-gray-300 font-medium">
                Edge Detection
              </label>
              <input
                type="checkbox"
                checked={cannyEdge}
                onChange={(e) => setCannyEdge(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded"
              />
            </div>

            {cannyEdge && (
              <>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                      Threshold 1
                    </label>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{cannyThreshold1}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={cannyThreshold1}
                    onChange={(e) => setCannyThreshold1(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                      Threshold 2
                    </label>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{cannyThreshold2}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    value={cannyThreshold2}
                    onChange={(e) => setCannyThreshold2(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Display Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Original
          </h3>
          <div className="relative flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden min-h-[300px]">
            {!imageLoaded && (
              <p className="text-gray-500">No image loaded</p>
            )}
            <img
              ref={imageRef}
              alt="Original"
              onLoad={handleImageLoad}
              onError={handleImageError}
              className="max-w-full h-auto"
              style={{ 
                display: imageLoaded ? 'block' : 'none',
                maxHeight: '600px',
                position: imageLoaded ? 'relative' : 'absolute',
                visibility: imageLoaded ? 'visible' : 'hidden'
              }}
            />
          </div>
        </div>

        {/* Processed Image */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Processed {processing && <span className="text-sm text-indigo-600">(Processing...)</span>}
          </h3>
          <div className="relative flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden min-h-[300px]">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto"
              style={{ 
                display: imageLoaded ? 'block' : 'none',
                maxHeight: '600px'
              }}
            />
            {!imageLoaded && (
              <p className="text-gray-500">No image processed</p>
            )}
          </div>
        </div>
      </div>

      {/* Debug Console */}
      {debugInfo.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
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
