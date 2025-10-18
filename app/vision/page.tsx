"use client";

import { useState } from 'react';
import { useOpenCV } from '@/hooks/useOpenCV';
import ImageProcessor from '@/components/ImageProcessor';
import VideoProcessor from '@/components/VideoProcessor';
import { Camera, Image, Loader2, AlertCircle } from 'lucide-react';

export default function VisionPage() {
  const { loaded, error, cv } = useOpenCV();
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Error Loading OpenCV</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading OpenCV.js
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we initialize the computer vision library...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Computer Vision Studio
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Real-time image and video processing with OpenCV.js
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 inline-flex">
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'image'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Image className="w-5 h-5" />
              Image Processing
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'video'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Camera className="w-5 h-5" />
              Video Processing
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'image' ? (
            <ImageProcessor cv={cv} />
          ) : (
            <VideoProcessor cv={cv} />
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-green-600 dark:text-green-400">✓ OpenCV.js Loaded</span>
              {' • '}
              Ready for computer vision processing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
