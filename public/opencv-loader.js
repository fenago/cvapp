// OpenCV.js loader script
// This will be loaded in the HTML head to initialize OpenCV
var Module = {
  onRuntimeInitialized() {
    console.log('OpenCV.js is ready');
    // Dispatch custom event when OpenCV is loaded
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('opencv-ready'));
    }
  }
};
