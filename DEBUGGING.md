# Debugging Guide for OpenCV.js Application

## Image Processing Debugging Features

The ImageProcessor component now includes comprehensive debugging tools to help identify issues.

### Visual Indicators

1. **Success Banner (Green)**
   - Appears when image loads successfully
   - Shows filename and dimensions
   - Example: `photo.jpg • 1920x1080 pixels`

2. **Error Banner (Red)**
   - Appears when something goes wrong
   - Shows specific error message
   - Common errors:
     - "Image reference not available"
     - "Failed to load image"
     - "Processing error: [details]"

3. **File Selection Indicator**
   - Shows selected filename in upload area
   - Updates when new file is chosen

### Debug Console

A live debug console appears at the bottom of the page showing:
- Timestamp for each event
- File selection events
- Image loading progress
- OpenCV processing steps
- Error messages

**Example output:**
```
10:30:45: File selected: photo.jpg
10:30:45: File type: image/jpeg, Size: 245.67 KB
10:30:45: Created object URL: blob:http://localhost:3000/...
10:30:45: Set image src, waiting for onLoad event...
10:30:46: Image onLoad event fired!
10:30:46: Image dimensions: 1920x1080
10:30:46: Image loaded successfully, calling processImage...
10:30:46: processImage() called
10:30:46: Starting image processing...
10:30:46: Mat created: 1080x1920, channels: 4, type: 24
10:30:46: Image displayed successfully!
```

### Browser Console

Additional detailed logging is available in the browser console (F12):
- All debug messages are prefixed with `[ImageProcessor]`
- Full error stack traces
- OpenCV.js internal messages

## Common Issues and Solutions

### Issue: Image doesn't load after selection

**Check:**
1. Look at the Debug Console - does it show "File selected"?
2. Is there an error message in the red banner?
3. Check browser console for errors

**Possible causes:**
- File format not supported (use JPG, PNG, WEBP)
- File too large (>10MB)
- Browser security restrictions
- OpenCV.js not loaded

### Issue: Image loads but doesn't process

**Check:**
1. Debug Console should show "Image onLoad event fired!"
2. Look for "Mat created" message
3. Check if OpenCV.js is loaded (green banner at bottom of /vision page)

**Possible causes:**
- OpenCV.js failed to load
- Image dimensions are zero
- Processing error (check error banner)

### Issue: Processing is slow

**Check:**
1. Image dimensions in success banner
2. Processing options enabled (blur, edge detection)

**Solutions:**
- Use smaller images (resize before upload)
- Disable expensive operations (high blur values, edge detection)
- Check FPS in video mode

## Debugging Workflow

1. **Open browser console** (F12)
2. **Navigate to /vision**
3. **Select an image**
4. **Watch the Debug Console** at bottom of page
5. **Check for error banners**
6. **Review browser console** for detailed errors

## Testing with Sample Images

Try these test cases:

1. **Small image** (< 1MB, < 1000px) - Should load instantly
2. **Large image** (> 5MB, > 4000px) - May take a few seconds
3. **Different formats** - JPG, PNG, WEBP
4. **Invalid file** - Try a text file to see error handling

## Logging Details

Every major step is logged:

- ✅ File selection
- ✅ Object URL creation
- ✅ Image src assignment
- ✅ Image load event
- ✅ Dimension validation
- ✅ OpenCV Mat creation
- ✅ Processing operations
- ✅ Canvas display
- ✅ Memory cleanup

## Need More Help?

If issues persist:

1. Copy the Debug Console output
2. Copy browser console errors
3. Note the image file type and size
4. Check if OpenCV.js loaded successfully (green banner)
5. Try a different image file

## Performance Tips

- Images are processed in real-time as you adjust sliders
- Each slider change triggers a full reprocess
- Larger images = slower processing
- Edge detection is computationally expensive
- Blur with high values (>5) can be slow on large images
