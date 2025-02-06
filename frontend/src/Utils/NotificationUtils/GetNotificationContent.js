import truncateUsername from "../Truncate";

const getNotificationContent = (notification) => {
  switch (notification.type) {
    case "follow":
      return `${truncateUsername(notification?.sender?.username)} followed you`;
    case "post_upvote":
      return `${truncateUsername(
        notification?.sender?.username
      )} upvoted your post`;
    case "post_downvote":
      return `${truncateUsername(
        notification?.sender?.username
      )} downvoted your post`;
    case "comment":
      return `${truncateUsername(
        notification?.sender?.username
      )} commented on your post`;
    case "comment_like":
      return `${truncateUsername(
        notification?.sender?.username
      )} liked your comment`;
    case "comment_reply":
      return `${truncateUsername(
        notification?.sender?.username
      )} replied to your comment`;
    case "direct_message":
      return `${truncateUsername(
        notification?.sender?.username
      )} sent you a message`;
    case "clan_message":
      return `New message in ${notification?.clan?.name}`;
    default:
      return notification?.content;
  }
};

export default getNotificationContent;
