// Utility functions for OpenCV.js operations

export interface ProcessingOptions {
  grayscale?: boolean;
  blur?: number;
  canny?: { threshold1: number; threshold2: number };
  brightness?: number;
  contrast?: number;
}

export class OpenCVUtils {
  private cv: any;

  constructor(cv: any) {
    this.cv = cv;
  }

  /**
   * Process image with various filters
   */
  processImage(
    src: any,
    options: ProcessingOptions
  ): any {
    let processed = src.clone();

    try {
      // Convert to grayscale
      if (options.grayscale) {
        this.cv.cvtColor(processed, processed, this.cv.COLOR_RGBA2GRAY);
        this.cv.cvtColor(processed, processed, this.cv.COLOR_GRAY2RGBA);
      }

      // Apply Gaussian blur
      if (options.blur && options.blur > 0) {
        const ksize = new this.cv.Size(options.blur * 2 + 1, options.blur * 2 + 1);
        this.cv.GaussianBlur(processed, processed, ksize, 0, 0, this.cv.BORDER_DEFAULT);
      }

      // Apply Canny edge detection
      if (options.canny) {
        const gray = new this.cv.Mat();
        this.cv.cvtColor(processed, gray, this.cv.COLOR_RGBA2GRAY);
        this.cv.Canny(gray, gray, options.canny.threshold1, options.canny.threshold2);
        this.cv.cvtColor(gray, processed, this.cv.COLOR_GRAY2RGBA);
        gray.delete();
      }

      // Adjust brightness and contrast
      if (options.brightness !== undefined || options.contrast !== undefined) {
        const alpha = options.contrast !== undefined ? options.contrast : 1.0;
        const beta = options.brightness !== undefined ? options.brightness : 0;
        processed.convertTo(processed, -1, alpha, beta);
      }

      return processed;
    } catch (error) {
      processed.delete();
      throw error;
    }
  }

  /**
   * Detect faces using Haar Cascade (requires cascade file)
   */
  detectFaces(src: any, classifier: any): any[] {
    const gray = new this.cv.Mat();
    this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY);

    const faces = new this.cv.RectVector();
    const msize = new this.cv.Size(0, 0);

    classifier.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);

    const result = [];
    for (let i = 0; i < faces.size(); i++) {
      result.push(faces.get(i));
    }

    gray.delete();
    faces.delete();

    return result;
  }

  /**
   * Draw rectangles on image
   */
  drawRectangles(src: any, rectangles: any[], color = [255, 0, 0, 255]): void {
    const colorObj = new this.cv.Scalar(...color);
    for (const rect of rectangles) {
      const point1 = new this.cv.Point(rect.x, rect.y);
      const point2 = new this.cv.Point(rect.x + rect.width, rect.y + rect.height);
      this.cv.rectangle(src, point1, point2, colorObj, 2);
    }
  }

  /**
   * Apply histogram equalization
   */
  equalizeHistogram(src: any): any {
    const result = new this.cv.Mat();
    const gray = new this.cv.Mat();
    
    this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY);
    this.cv.equalizeHist(gray, gray);
    this.cv.cvtColor(gray, result, this.cv.COLOR_GRAY2RGBA);
    
    gray.delete();
    return result;
  }

  /**
   * Apply morphological operations
   */
  morphology(src: any, operation: 'erode' | 'dilate' | 'open' | 'close', kernelSize = 5): any {
    const result = new this.cv.Mat();
    const kernel = this.cv.Mat.ones(kernelSize, kernelSize, this.cv.CV_8U);
    
    const opMap = {
      erode: this.cv.MORPH_ERODE,
      dilate: this.cv.MORPH_DILATE,
      open: this.cv.MORPH_OPEN,
      close: this.cv.MORPH_CLOSE,
    };

    this.cv.morphologyEx(src, result, opMap[operation], kernel);
    kernel.delete();
    
    return result;
  }

  /**
   * Blend two images
   */
  blendImages(src1: any, src2: any, alpha: number): any {
    const result = new this.cv.Mat();
    const beta = 1.0 - alpha;
    this.cv.addWeighted(src1, alpha, src2, beta, 0.0, result);
    return result;
  }
}
