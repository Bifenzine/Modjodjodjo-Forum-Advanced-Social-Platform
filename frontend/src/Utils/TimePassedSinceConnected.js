export const formatTimePassed = (ms) => {
  if (!ms) return "Just now";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// // Constants for time calculations
// const SECOND = 1000;
// const MINUTE = SECOND * 60;
// const HOUR = MINUTE * 60;
// const DAY = HOUR * 24;
// const WEEK = DAY * 7;
// const MONTH = DAY * 30;
// const YEAR = DAY * 365;

// /**
//  * Formats the time passed since a user's last connection
//  * @param {number} ms - Milliseconds since last connection
//  * @param {boolean} isOnline - Whether the user is currently online
//  * @returns {string} Formatted time string
//  */
// export const formatTimePassed = (ms, isOnline = false) => {
//   // Handle edge cases
//   if (!ms && isOnline) return "Online";
//   if (!ms) return "Offline";

//   const now = Date.now();
//   const timestamp = now - ms;
//   const elapsed = now - timestamp;

//   // If user is online, show "Online"
//   if (isOnline) return "Online";

//   // Calculate time units
//   const years = Math.floor(elapsed / YEAR);
//   const months = Math.floor(elapsed / MONTH);
//   const weeks = Math.floor(elapsed / WEEK);
//   const days = Math.floor(elapsed / DAY);
//   const hours = Math.floor(elapsed / HOUR);
//   const minutes = Math.floor(elapsed / MINUTE);
//   const seconds = Math.floor(elapsed / SECOND);

//   // Format last seen message
//   if (years > 0) {
//     return `Last seen ${years === 1 ? "a year" : `${years} years`} ago`;
//   } else if (months > 0) {
//     return `Last seen ${months === 1 ? "a month" : `${months} months`} ago`;
//   } else if (weeks > 0) {
//     return `Last seen ${weeks === 1 ? "a week" : `${weeks} weeks`} ago`;
//   } else if (days > 0) {
//     return `Last seen ${days === 1 ? "yesterday" : `${days} days ago`}`;
//   } else if (hours > 0) {
//     return `Last seen ${hours === 1 ? "an hour" : `${hours} hours`} ago`;
//   } else if (minutes > 0) {
//     return `Last seen ${minutes === 1 ? "a minute" : `${minutes} minutes`} ago`;
//   } else if (seconds > 30) {
//     return `Last seen ${seconds} seconds ago`;
//   } else {
//     return "Last seen just now";
//   }
// };

// /**
//  * Gets the active status message for a user
//  * @param {number} ms - Milliseconds since last connection
//  * @param {boolean} isOnline - Whether the user is currently online
//  * @param {boolean} showDetailedTime - Whether to show detailed time information
//  * @returns {Object} Status object containing message and CSS class
//  */
// export const getActiveStatus = (
//   ms,
//   isOnline = false,
//   showDetailedTime = false
// ) => {
//   const timeMessage = formatTimePassed(ms, isOnline);

//   return {
//     message: timeMessage,
//     className: isOnline ? "text-green-500" : "text-gray-400",
//   };
// };
