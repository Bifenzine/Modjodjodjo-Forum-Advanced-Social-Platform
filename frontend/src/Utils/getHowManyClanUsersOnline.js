export default function getHowManyClanUsersOnline(clanInfo, onlineUsers) {
  const onlineClanMembers = clanInfo?.members?.filter((member) =>
    onlineUsers.some(
      (onlineUser) =>
        onlineUser._id === member._id || onlineUser._id === member.id
    )
  ).length;

  const onlineClanAdmins = clanInfo?.admins?.filter((admin) =>
    onlineUsers.some(
      (onlineUser) =>
        onlineUser._id === admin._id || onlineUser._id === admin.id
    )
  ).length;

  const onlineClanMods = clanInfo?.moderators?.filter((mod) =>
    onlineUsers.some(
      (onlineUser) => onlineUser._id === mod._id || onlineUser._id === mod.id
    )
  ).length;

  return onlineClanMembers + onlineClanAdmins + onlineClanMods;
}
