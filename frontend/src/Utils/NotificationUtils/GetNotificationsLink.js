const getNotificationLink = (notification) => {
  const { type, post, sender } = notification;
  // console.log(type)
  // console.log(post?._id)
  // console.log(comment)
  // console.log(sender)
  // console.log(recipient)
  // console.log("notification", notification)

  switch (type) {
    case "post_upvote":
    case "post_downvote":
    case "comment_like":
    case "new_post":
    case "comment_reply":
    case "comment":
      return `/${post?.category?.name}/PostDetail/${post?._id}`;
    case "follow":
      return `/profile/${sender?._id}`;
    // case 'direct_message':
    //     return `/messages/${notification.sender?._id}`;
    // case 'clan_message':
    //     return `/Clans/clan/${notification.clan?._id}`;
    // case "new_post":
    //   return `/${post?.category?.name}/PostDetail/${post?._id}`;
    default:
      return "";
  }
};

export default getNotificationLink;
