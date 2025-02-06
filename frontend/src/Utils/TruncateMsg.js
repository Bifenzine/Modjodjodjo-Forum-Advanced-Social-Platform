const truncateMsg = (Msg, maxLength) => {
    if (!Msg) return "Guest";
    return Msg.length > maxLength ? Msg.substring(0, maxLength) + "..." : Msg;
  };

export default truncateMsg