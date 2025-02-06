import React, { useState, useEffect } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ChatImagePicker = ({
  fileInputRef,
  handleBtnClick,
  handleFileChange,
  cancelPost,
  existingImage,
  clearPreview,
}) => {
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clearPreview) {
      setMediaPreview(null);
      setMediaType(null);
      setError(null);
    }
  }, [clearPreview]);

  useEffect(() => {
    if (typeof existingImage === "string") {
      setMediaPreview(existingImage);
      setMediaType(
        existingImage.toLowerCase().endsWith(".mp4") ? "video" : "image"
      );
    }
  }, [existingImage]);

  const handleFilePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds 10MB limit.");
        e.target.value = "";
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
        setMediaType(file.type.startsWith("video") ? "video" : "image");
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
      setMediaType(null);
    }
  };

  const handleCancel = () => {
    cancelPost();
    setMediaPreview(null);
    setMediaType(null);
    setError(null);
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300"
        onClick={handleBtnClick}>
        <input
          type="file"
          ref={fileInputRef}
          accept=".png, .jpg, .jpeg, .gif, .mp4"
          onChange={(e) => {
            handleFilePreview(e);
            if (!error) handleFileChange(e);
          }}
          className="hidden"
        />
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      {mediaPreview && (
        <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
          {mediaType === "video" ? (
            <video
              src={mediaPreview}
              controls
              className="object-cover w-full h-full"
            />
          ) : (
            <img
              src={mediaPreview}
              alt="Selected"
              className="object-cover w-full h-full"
            />
          )}
          <button
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            onClick={handleCancel}>
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {!mediaPreview && !error && (
        <p className="text-gray-500 text-sm">No media selected</p>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatImagePicker;
