export const checkUserRole = (clan, userId) => {
  if (!clan || !userId)
    return { isAdmin: false, isModerator: false, isMember: false };

  return {
    isAdmin: clan.admins?.some(
      (admin) => admin?._id?.toString() === userId?.toString()
    ),
    isModerator: clan?.moderators?.some(
      (mod) => mod?._id?.toString() === userId?.toString()
    ),
    isMember: clan?.members?.some(
      (member) => member?._id?.toString() === userId?.toString()
    ),
  };
};
