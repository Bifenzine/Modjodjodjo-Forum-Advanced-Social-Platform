import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Trash2,
  RotateCcw,
  Maximize2,
  Minimize2,
  Edit3,
  Move,
  Pencil,
  Eraser,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";

// Helper function to handle Cloudinary media download
const downloadCloudinaryMedia = async (
  mediaUrl,
  filename = "downloaded-media"
) => {
  try {
    const originalUrl = mediaUrl.replace("/upload/", "/upload/fl_attachment/");
    const response = await fetch(originalUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading media:", error);
  }
};

const MediaViewerModal = ({
  isOpen,
  onClose,
  mediaUrl,
  onDelete,
  isCurrentUser,
}) => {
  // Existing image-related states
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#FF0000");
  const [drawSize, setDrawSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  // New video-related states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);

  const isVideo = mediaUrl?.toLowerCase().endsWith(".mp4");

  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFFFFF",
    "#000000",
  ];

  const modalRef = useRef(null);
  const mediaRef = useRef(null);
  const canvasRef = useRef(null);
  const drawingContextRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Existing useEffect hooks
  useEffect(() => {
    if (!isOpen) {
      resetMedia();
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isDrawMode && canvasRef.current && !isVideo) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const img = mediaRef.current;

      if (img) {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = drawColor;
      context.lineWidth = drawSize;
      drawingContextRef.current = context;
    }
  }, [isDrawMode, drawColor, drawSize, isVideo]);

  // New video-related useEffects
  useEffect(() => {
    if (isVideo && mediaRef.current) {
      mediaRef.current.volume = volume;
    }
  }, [volume, isVideo]);

  useEffect(() => {
    const video = mediaRef.current;
    if (isVideo && video) {
      const handleTimeUpdate = () => setCurrentTime(video.currentTime);
      const handleDurationChange = () => setDuration(video.duration);

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleDurationChange);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleDurationChange);
      };
    }
  }, [isVideo]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          if (!isVideo) handleZoomIn();
          break;
        case "-":
          if (!isVideo) handleZoomOut();
          break;
        case "r":
          if (!isVideo) handleRotate();
          break;
        case "f":
          handleToggleFullscreen();
          break;
        case " ":
          if (isVideo) handlePlayPause();
          break;
        case "ArrowLeft":
          if (isVideo) handleSeek(-5);
          break;
        case "ArrowRight":
          if (isVideo) handleSeek(5);
          break;
        case "m":
          if (isVideo) handleToggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, scale, isVideo]);

  // Video control functions
  const handlePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (deltaSeconds) => {
    if (mediaRef.current) {
      const newTime = Math.max(
        0,
        Math.min(mediaRef.current.currentTime + deltaSeconds, duration)
      );
      mediaRef.current.currentTime = newTime;
    }
  };

  const handleTimelineChange = (e) => {
    if (mediaRef.current) {
      const time = parseFloat(e.target.value);
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Existing image control functions
  const handleZoomIn = () => {
    if (scale < 3) setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    if (scale > 0.5) setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleMouseDown = (e) => {
    if (scale > 1 && !isVideo) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1 && !isVideo) {
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;
      const maxOffset = 100 * scale;

      setPosition({
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      if (modalRef.current.requestFullscreen) {
        modalRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Drawing functions (only for images)
  const handleDrawStart = (e) => {
    if (!isDrawMode || isDragging || isVideo) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    setIsDrawing(true);
    const ctx = drawingContextRef.current;
    ctx.beginPath();
    ctx.strokeStyle = isEraser ? "#00000000" : drawColor;
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    ctx.moveTo(x, y);
  };

  const handleDrawMove = (e) => {
    if (!isDrawing || !isDrawMode || isDragging || isVideo) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = drawingContextRef.current;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleDrawEnd = () => {
    setIsDrawing(false);
    if (drawingContextRef.current) {
      drawingContextRef.current.closePath();
    }
  };

  const handleDownload = async () => {
    try {
      if (isVideo) {
        await downloadCloudinaryMedia(mediaUrl);
      } else {
        if (isEditMode || isDrawMode) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = mediaRef.current;

          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;

          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);

          if (canvasRef.current) {
            ctx.drawImage(canvasRef.current, -img.width / 2, -img.height / 2);
          }

          canvas.toBlob(
            (blob) => {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "edited-media.jpg";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            },
            "image/jpeg",
            0.9
          );
        } else {
          await downloadCloudinaryMedia(mediaUrl);
        }
      }
    } catch (error) {
      console.error("Error downloading media:", error);
    }
  };

  const resetMedia = () => {
    setScale(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setPosition({ x: 0, y: 0 });
    setIsEditMode(false);
    setIsDrawMode(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (isVideo && mediaRef.current) {
      mediaRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div ref={modalRef} className="relative w-full h-full">
        {/* Header controls */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/70 to-transparent z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={resetMedia}
              className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
              title="Reset changes">
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
              title="Toggle fullscreen">
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800/50 transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        {/* Main media container */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          onMouseDown={
            isVideo ? null : isDrawMode ? handleDrawStart : handleMouseDown
          }
          onMouseMove={
            isVideo ? null : isDrawMode ? handleDrawMove : handleMouseMove
          }
          onMouseUp={
            isVideo ? null : isDrawMode ? handleDrawEnd : handleMouseUp
          }
          onMouseLeave={
            isVideo ? null : isDrawMode ? handleDrawEnd : handleMouseUp
          }>
          {!isMediaLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {isVideo ? (
            <video
              ref={mediaRef}
              src={mediaUrl}
              className="max-w-full max-h-full object-contain"
              onLoadedData={() => setIsMediaLoaded(true)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <>
              <img
                ref={mediaRef}
                src={mediaUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  cursor: isDrawMode
                    ? "crosshair"
                    : scale > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
                  opacity: isMediaLoaded ? 1 : 0,
                }}
                draggable="false"
                onLoad={() => setIsMediaLoaded(true)}
              />
              {isDrawMode && (
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          {/* Video controls */}
          {isVideo && (
            <div className="flex flex-col items-center gap-2 px-6 py-3 bg-gray-900/90 backdrop-blur-sm rounded-lg w-full max-w-2xl">
              {/* Timeline */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-white text-sm">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleTimelineChange}
                  className="flex-grow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-white text-sm">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleSeek(-10)}
                    className="p-2 rounded-full hover:bg-gray-800/50 transition-colors">
                    <SkipBack className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="p-2 rounded-full hover:bg-gray-800/50 transition-colors">
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSeek(10)}
                    className="p-2 rounded-full hover:bg-gray-800/50 transition-colors">
                    <SkipForward className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleMute}
                    className="p-2 rounded-full hover:bg-gray-800/50 transition-colors">
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Draw controls (image only) */}
          {!isVideo && isDrawMode && (
            <div className="flex items-center gap-6 px-6 py-3 bg-gray-900/90 backdrop-blur-sm rounded-lg mb-4">
              <div className="flex items-center gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setDrawColor(color);
                      setIsEraser(false);
                    }}
                    className={`w-8 h-8 rounded-full border-2 ${
                      drawColor === color && !isEraser
                        ? "border-white"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button
                  onClick={() => setIsEraser(!isEraser)}
                  className={`p-2 rounded-full ${
                    isEraser ? "bg-gray-700" : "hover:bg-gray-800/50"
                  } transition-colors ml-2`}
                  title="Eraser">
                  <Eraser className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="w-px h-8 bg-gray-700" />
              <div className="flex flex-col items-center gap-2">
                <label className="text-xs text-gray-400">Brush Size</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={drawSize}
                  onChange={(e) => setDrawSize(parseInt(e.target.value))}
                  className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Edit controls (image only) */}
          {!isVideo && isEditMode && (
            <div className="flex items-center gap-6 px-6 py-3 bg-gray-900/90 backdrop-blur-sm rounded-lg mb-4">
              <div className="flex flex-col items-center gap-2">
                <label className="text-xs text-gray-400">Brightness</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(e.target.value)}
                  className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="w-px h-8 bg-gray-700" />
              <div className="flex flex-col items-center gap-2">
                <label className="text-xs text-gray-400">Contrast</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(e.target.value)}
                  className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Main controls */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 backdrop-blur-sm rounded-lg">
            {!isVideo && (
              <>
                <button
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="p-2 rounded-full hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Zoom out">
                  <ZoomOut className="w-5 h-5 text-white" />
                </button>

                <span className="text-white text-sm min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>

                <button
                  onClick={handleZoomIn}
                  disabled={scale >= 3}
                  className="p-2 rounded-full hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Zoom in">
                  <ZoomIn className="w-5 h-5 text-white" />
                </button>

                <div className="w-px h-6 bg-gray-700 mx-2" />

                <button
                  onClick={handleRotate}
                  className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                  title="Rotate">
                  <RotateCcw className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    setIsDrawMode(false);
                  }}
                  className={`p-2 rounded-full hover:bg-gray-800/50 transition-colors ${
                    isEditMode ? "bg-gray-800/50" : ""
                  }`}
                  title="Edit image">
                  <Edit3 className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={() => {
                    setIsDrawMode(!isDrawMode);
                    setIsEditMode(false);
                  }}
                  className={`p-2 rounded-full hover:bg-gray-800/50 transition-colors ${
                    isDrawMode ? "bg-gray-800/50" : ""
                  }`}
                  title="Draw mode">
                  <Pencil className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            <button
              onClick={handleDownload}
              className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
              title="Download media">
              <Download className="w-5 h-5 text-white" />
            </button>

            {isCurrentUser && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-full hover:bg-red-950/50 transition-colors"
                title="Delete media">
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            )}
          </div>
        </div>

        {!isVideo && scale > 1 && !isDrawMode && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-gray-400 text-sm flex items-center gap-2">
            <Move className="w-4 h-4" /> Drag to move image
          </div>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-sm mx-4">
              <p className="text-white text-center mb-6">
                Are you sure you want to delete this{" "}
                {isVideo ? "video" : "image"}?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaViewerModal;
