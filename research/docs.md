Here are the main documentation resources:
Official OpenCV.js Documentation:
    •    Main docs: https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html
    •    API reference: https://docs.opencv.org/4.x/d5/d0f/tutorial_js_table_of_contents_core.html
    •    JavaScript tutorials: https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html
Loading OpenCV.js:
    •    CDN: https://docs.opencv.org/4.x/opencv.js


    Steps
In this tutorial, you will learn how to include and start to use opencv.js inside a web page. You can get a copy of opencv.js from opencv-{VERSION_NUMBER}-docs.zip in each release, or simply download the prebuilt script from the online documentations at "https://docs.opencv.org/{VERSION_NUMBER}/opencv.js" (For example, https://docs.opencv.org/4.5.0/opencv.js. Use 4.x if you want the latest build). You can also build your own copy by following the tutorial Build OpenCV.js.

Create a web page
First, let's create a simple web page that is able to upload an image.

<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Hello OpenCV.js</title>
</head>
<body>
<h2>Hello OpenCV.js</h2>
<div>
  <div class="inputoutput">
    <img id="imageSrc" alt="No Image" />
    <div class="caption">imageSrc <input type="file" id="fileInput" name="file" /></div>
  </div>
</div>
<script type="text/javascript">
let imgElement = document.getElementById("imageSrc")
let inputElement = document.getElementById("fileInput");
inputElement.addEventListener("change", (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);
</script>
</body>
</html>
To run this web page, copy the content above and save to a local index.html file. To run it, open it using your web browser.

Note
It is a better practice to use a local web server to host the index.html.
Include OpenCV.js
Set the URL of opencv.js to src attribute of <script> tag.

Note
For this tutorial, we host opencv.js at same folder as index.html. You can also choose to use the URL of the prebuilt opencv.js in our online documentation.
Example for synchronous loading:

<script src="opencv.js" type="text/javascript"></script>
You may want to load opencv.js asynchronously by async attribute in <script> tag. To be notified when opencv.js is ready, you can register a callback to onload attribute.

Example for asynchronous loading

<script async src="opencv.js" onload="onOpenCvReady();" type="text/javascript"></script>
Use OpenCV.js
Once opencv.js is ready, you can access OpenCV objects and functions through cv object. The promise-typed cv object should be unwrap with await operator. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await .

For example, you can create a cv.Mat from an image by cv.imread.

Note
Because image loading is asynchronous, you need to put cv.Mat creation inside the onload callback.
imgElement.onload = await function() {
  cv = (cv instanceof Promise) ? await cv : cv;
  let mat = cv.imread(imgElement);
}
Many OpenCV functions can be used to process cv.Mat. You can refer to other tutorials, such as Image Processing, for details.

In this tutorial, we just show a cv.Mat on screen. To show a cv.Mat, you need a canvas element.

<canvas id="outputCanvas"></canvas>
You can use cv.imshow to show cv.Mat on the canvas.

cv.imshow("outputCanvas", mat);
Putting all of the steps together, the final index.html is shown below.

<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Hello OpenCV.js</title>
</head>
<body>
<h2>Hello OpenCV.js</h2>
<p id="status">OpenCV.js is loading...</p>
<div>
  <div class="inputoutput">
    <img id="imageSrc" alt="No Image" />
    <div class="caption">imageSrc <input type="file" id="fileInput" name="file" /></div>
  </div>
  <div class="inputoutput">
    <canvas id="canvasOutput" ></canvas>
    <div class="caption">canvasOutput</div>
  </div>
</div>
<script type="text/javascript">
let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);
 
imgElement.onload = async function() {
  cv = (cv instanceof Promise) ? await cv : cv;
  let mat = cv.imread(imgElement);
  cv.imshow('canvasOutput', mat);
  mat.delete();
};
 
var Module = {
  // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
  onRuntimeInitialized() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  }
};
</script>
<script async src="opencv.js" type="text/javascript"></script>
</body>
</html>
Note
You have to call delete method of cv.Mat to free memory allocated in Emscripten's heap. Please refer to Memory management of Emscripten for details.
Try it


Goals
Learn how to read an image and how to display it in a web.
Read an image
OpenCV.js saves images as cv.Mat type. We use HTML canvas element to transfer cv.Mat to the web or in reverse. The ImageData interface can represent or set the underlying pixel data of an area of a canvas element.

Note
Please refer to canvas docs for more details.
First, create an ImageData obj from canvas:

let canvas = document.getElementById(canvasInputId);
let ctx = canvas.getContext('2d');
let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
Then, use cv.matFromImageData to construct a cv.Mat:

let src = cv.matFromImageData(imgData);
Note
Because canvas only support 8-bit RGBA image with continuous storage, the cv.Mat type is cv.CV_8UC4. It is different from native OpenCV because images returned and shown by the native imread and imshow have the channels stored in BGR order.
Display an image
First, convert the type of src to cv.CV_8UC4:

let dst = new cv.Mat();
// scale and shift are used to map the data to [0, 255].
src.convertTo(dst, cv.CV_8U, scale, shift);
// *** is GRAY, RGB, or RGBA, according to src.channels() is 1, 3 or 4.
cv.cvtColor(dst, dst, cv.COLOR_***2RGBA);
Then, new an ImageData obj from dst:

let imgData = new ImageData(new Uint8ClampedArray(dst.data), dst.cols, dst.rows);
Finally, display it:

let canvas = document.getElementById(canvasOutputId);
let ctx = canvas.getContext('2d');
ctx.clearRect(0, 0, canvas.width, canvas.height);
canvas.width = imgData.width;
canvas.height = imgData.height;
ctx.putImageData(imgData, 0, 0);
In OpenCV.js
OpenCV.js implements image reading and showing using the above method.

We use cv.imread (imageSource) to read an image from html canvas or img element.

Parameters
imageSource	canvas element or id, or img element or id.
Returns
mat with channels stored in RGBA order.
We use cv.imshow (canvasSource, mat) to display it. The function may scale the mat, depending on its depth:

If the mat is 8-bit unsigned, it is displayed as is.
If the mat is 16-bit unsigned or 32-bit integer, the pixels are divided by 256. That is, the value range [0,255*256] is mapped to [0,255].
If the mat is 32-bit floating-point, the pixel values are multiplied by 255. That is, the value range [0,1] is mapped to [0,255].
Parameters
canvasSource	canvas element or id.
mat	mat to be shown.
The above code of image reading and showing could be simplified as below.

let img = cv.imread(imageSource);
cv.imshow(canvasOutput, img);
img.delete();
Try it


Goal
Learn to capture video from a camera and display it.
Capture video from camera
Often, we have to capture live stream with a camera. In OpenCV.js, we use WebRTC and HTML canvas element to implement this. Let's capture a video from the camera(built-in or a usb), convert it into grayscale video and display it.

To capture a video, you need to add some HTML elements to the web page:

a <video> to display video from camera directly
a <canvas> to transfer video to canvas ImageData frame-by-frame
another <canvas> to display the video OpenCV.js gets
First, we use WebRTC navigator.mediaDevices.getUserMedia to get the media stream.

let video = document.getElementById("videoInput"); // video is the id of video tag
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
    })
    .catch(function(err) {
        console.log("An error occurred! " + err);
    });
Note
This function is unnecessary when you capture video from a video file. But notice that HTML video element only supports video formats of Ogg(Theora), WebM(VP8/VP9) or MP4(H.264).
Playing video
Now, the browser gets the camera stream. Then, we use CanvasRenderingContext2D.drawImage() method of the Canvas 2D API to draw video onto the canvas. Finally, we can use the method in Getting Started with Images to read and display image in canvas. For playing video, cv.imshow() should be executed every delay milliseconds. We recommend setTimeout() method. And if the video is 30fps, the delay milliseconds should be (1000/30 - processing_time).

let canvasFrame = document.getElementById("canvasFrame"); // canvasFrame is the id of <canvas>
let context = canvasFrame.getContext("2d");
let src = new cv.Mat(height, width, cv.CV_8UC4);
let dst = new cv.Mat(height, width, cv.CV_8UC1);
 
const FPS = 30;
function processVideo() {
    let begin = Date.now();
    context.drawImage(video, 0, 0, width, height);
    src.data.set(context.getImageData(0, 0, width, height).data);
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    cv.imshow("canvasOutput", dst); // canvasOutput is the id of another <canvas>;
    // schedule next one.
    let delay = 1000/FPS - (Date.now() - begin);
    setTimeout(processVideo, delay);
}
 
// schedule first one.
setTimeout(processVideo, 0);
OpenCV.js implements cv.VideoCapture (videoSource) using the above method. You need not to add the hidden canvas element manually.

Parameters
videoSource	the video id or element.
Returns
cv.VideoCapture instance
We use read (image) to get one frame of the video. For performance reasons, the image should be constructed with cv.CV_8UC4 type and same size as the video.

Parameters
image	image with cv.CV_8UC4 type and same size as the video.
The above code of playing video could be simplified as below.

let src = new cv.Mat(height, width, cv.CV_8UC4);
let dst = new cv.Mat(height, width, cv.CV_8UC1);
let cap = new cv.VideoCapture(videoSource);
 
const FPS = 30;
function processVideo() {
    let begin = Date.now();
    cap.read(src);
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    cv.imshow("canvasOutput", dst);
    // schedule next one.
    let delay = 1000/FPS - (Date.now() - begin);
    setTimeout(processVideo, delay);
}
 
// schedule first one.
setTimeout(processVideo, 0);
Note
Remember to delete src and dst after when stop.
Try it


Goal
Use HTML DOM Input Range Object to add a trackbar to your application.
Code Demo
Here, we will create a simple application that blends two images. We will let the user enter the weight by using the trackbar.

First, we need to create three canvas elements: two for input and one for output. Please refer to the tutorial Getting Started with Images.

let src1 = cv.imread('canvasInput1');
let src2 = cv.imread('canvasInput2');
Then, we use HTML DOM Input Range Object to implement the trackbar, which is shown as below. 

Note
<input> elements with type="range" are not supported in Internet Explorer 9 and earlier versions.
You can create an <input> element with type="range" with the document.createElement() method:

let x = document.createElement('INPUT');
x.setAttribute('type', 'range');
You can access an <input> element with type="range" with getElementById():

let x = document.getElementById('myRange');
As a trackbar, the range element need a trackbar name, the default value, minimum value, maximum value, step and the callback function which is executed every time trackbar value changes. The callback function always has a default argument, which is the trackbar position. Additionally, a text element to display the trackbar value is fine. In our case, we can create the trackbar as below:

Weight: <input type="range" id="trackbar" value="50" min="0" max="100" step="1" oninput="callback()">
<input type="text" id="weightValue" size="3" value="50"/>
Finally, we can use the trackbar value in the callback function, blend the two images, and display the result.

let weightValue = document.getElementById('weightValue');
let trackbar = document.getElementById('trackbar');
weightValue.setAttribute('value', trackbar.value);
let alpha = trackbar.value/trackbar.max;
let beta = ( 1.0 - alpha );
let src1 = cv.imread('canvasInput1');
let src2 = cv.imread('canvasInput2');
let dst = new cv.Mat();
cv.addWeighted( src1, alpha, src2, beta, 0.0, dst, -1);
cv.imshow('canvasOutput', dst);
dst.delete();
src1.delete();
src2.delete();
See also
cv.addWeighted
Try it


