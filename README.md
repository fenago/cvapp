# Computer Vision App with OpenCV.js

A complete Next.js/React application with OpenCV.js integration for real-time image and video processing.

## Features

- ⚡ **Next.js 14** with App Router
- ⚛️ **React 18** with TypeScript
- 🎨 **TailwindCSS** for styling
- 🎯 **Lucide React** for beautiful icons
- 🌙 **Dark mode** support
- 📱 **Responsive design**
- 🎥 **OpenCV.js** for computer vision
- 📸 **Real-time webcam processing**
- 🖼️ **Advanced image processing**

## What's Included

### Image Processing Features
- ✅ Image upload and display
- ✅ Grayscale conversion
- ✅ Gaussian blur with adjustable intensity
- ✅ Brightness and contrast adjustment
- ✅ Canny edge detection with threshold controls
- ✅ Side-by-side original and processed view

### Video Processing Features
- ✅ Real-time webcam capture
- ✅ Live video processing
- ✅ Multiple processing modes (grayscale, edge detection, blur)
- ✅ FPS monitoring
- ✅ Start/stop/pause controls

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A modern web browser with WebRTC support
- Webcam (for video processing features)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Click "Launch Vision Studio" to access the computer vision features

The application will start on port 3000 by default.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/
│   ├── layout.tsx           # Root layout with OpenCV.js loading
│   ├── page.tsx             # Home page
│   ├── vision/
│   │   └── page.tsx         # Computer vision studio
│   └── globals.css          # Global styles
├── components/
│   ├── ImageProcessor.tsx   # Image processing component
│   └── VideoProcessor.tsx   # Video processing component
├── hooks/
│   └── useOpenCV.ts         # OpenCV loading hook
├── lib/
│   ├── opencv-utils.ts      # OpenCV utility functions
│   └── utils.ts             # General utilities
├── public/
│   └── opencv-loader.js     # OpenCV initialization script
├── research/
│   └── docs.md              # OpenCV.js documentation
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

## Usage

### Image Processing

1. Navigate to `/vision`
2. Click on the "Image Processing" tab
3. Upload an image using the file picker
4. Adjust processing parameters:
   - Toggle grayscale conversion
   - Adjust blur intensity (0-10)
   - Modify brightness (-100 to +100)
   - Change contrast (0.5x to 3x)
   - Enable edge detection with threshold controls
5. View results in real-time

### Video Processing

1. Navigate to `/vision`
2. Click on the "Video Processing" tab
3. Click "Start Camera" to access your webcam
4. Click "Process" to begin real-time processing
5. Select processing mode:
   - Original (no processing)
   - Grayscale
   - Edge Detection (Canny)
   - Blur
6. Monitor FPS performance
7. Click "Stop" to end the session

## Building Upon This Application

This application provides a solid foundation for computer vision projects. You can extend it by:

### Adding More Filters
Edit `lib/opencv-utils.ts` to add new processing functions:
- Histogram equalization
- Morphological operations (erosion, dilation)
- Color space conversions
- Image blending
- Contour detection

### Face Detection
Integrate Haar Cascade classifiers for face/object detection

### Custom ML Models
Add TensorFlow.js or ONNX Runtime for custom model inference

### Advanced Features
- Object tracking
- Motion detection
- QR code scanning
- Augmented reality overlays

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide React](https://lucide.dev/) - Icon library
- [OpenCV.js](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html) - Computer vision library

## OpenCV.js Documentation

See `research/docs.md` for detailed OpenCV.js documentation and examples.

## Troubleshooting

### OpenCV.js fails to load
- Check your internet connection (OpenCV.js loads from CDN)
- Ensure JavaScript is enabled
- Try refreshing the page

### Camera access denied
- Grant camera permissions in your browser
- Check browser security settings
- Ensure you're using HTTPS or localhost

### Performance issues
- Close other applications using the camera
- Reduce video resolution
- Simplify processing operations
- Use a more powerful device

## License

MIT
