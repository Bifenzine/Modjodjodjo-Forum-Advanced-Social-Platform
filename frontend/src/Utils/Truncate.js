const truncateUsername = (username, maxLength = 10) => {
    if (!username) return "Guest";
    return username.length > maxLength ? username.substring(0, maxLength) + "..." : username;
  };

export default truncateUsername