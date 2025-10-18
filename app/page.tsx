import Link from "next/link";
import { Camera, Image, Video, Scan, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg">
              <Camera className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Computer Vision App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            A modern Next.js foundation for building powerful computer vision applications
          </p>
          
          <Link
            href="/vision"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Launch Vision Studio
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <FeatureCard
            icon={<Image className="w-8 h-8" />}
            title="Image Processing"
            description="Process and analyze images with advanced computer vision algorithms"
          />
          <FeatureCard
            icon={<Video className="w-8 h-8" />}
            title="Video Analysis"
            description="Real-time video processing and object detection capabilities"
          />
          <FeatureCard
            icon={<Scan className="w-8 h-8" />}
            title="Object Detection"
            description="Identify and track objects with machine learning models"
          />
        </div>

        {/* Getting Started Section */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Getting Started
          </h2>
          <div className="space-y-4">
            <Step
              number={1}
              title="Install Dependencies"
              description="Run npm install to install all required packages"
            />
            <Step
              number={2}
              title="Start Development Server"
              description="Run npm run dev to start the development server on port 3000"
            />
            <Step
              number={3}
              title="Build Your Vision App"
              description="Visit /vision to start using the computer vision features"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 dark:text-gray-400">
        <p>Built with Next.js, React, TailwindCSS, and OpenCV.js</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="text-indigo-600 dark:text-indigo-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}
