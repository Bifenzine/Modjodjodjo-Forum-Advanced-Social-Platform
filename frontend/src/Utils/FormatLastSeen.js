// utils/timeUtils.js
export const formatLastSeen = (lastSeenTime) => {
    const now = new Date();
    const lastSeen = new Date(lastSeenTime);
    const diffInSeconds = Math.floor((now - lastSeen) / 1000);
  
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };