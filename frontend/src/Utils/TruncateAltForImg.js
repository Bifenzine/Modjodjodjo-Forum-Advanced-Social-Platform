const TuncateAltForImg = (username, maxLength = 5) => {
    if (!username) return "Guest";
    return username.length > maxLength ? username.substring(0, maxLength) + "..." : username;
  };

export default TuncateAltForImg