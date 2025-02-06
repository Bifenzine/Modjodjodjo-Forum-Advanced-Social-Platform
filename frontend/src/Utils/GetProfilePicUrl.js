const getProfilePicUrl = (pic) => {
  if (!pic) {
    return "https://via.placeholder.com/100"; // Handle case where pic is undefined or null
  }
  //   for development
  // return pic.startsWith("http") ? pic : `${config.apiUrl}/${pic}`;
  //   for production
  return pic;
};

export default getProfilePicUrl;
