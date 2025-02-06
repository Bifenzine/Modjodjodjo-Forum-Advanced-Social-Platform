import React from "react";

const displayMedia = (fileUrl, altText, message) => {
  const isVideo = fileUrl.toLowerCase().endsWith(".mp4");
  // modified
  // const mediaUrl = fileUrl ? `${config.apiUrl}/${fileUrl}` : fileUrl;
  // cloud config for files upload
  const mediaUrl = fileUrl ? fileUrl : null;

  // console.log(mediaUrl)

  return isVideo ? (
    <video
      className={`bg-black ${
        message ? "h-[10rem]" : "h-[20rem]"
      } object-contain rounded-md"`}
      src={mediaUrl}
      alt={altText}
      width="100%"
      controls>
      Your browser does not support the video tag.
    </video>
  ) : (
    <img
      className={`bg-black ${
        message ? "h-[10rem]" : "h-[20rem]"
      } object-contain rounded-md`}
      src={mediaUrl}
      alt={altText}
      width="100%"
      lazyload
    />
  );
};

export default displayMedia;
