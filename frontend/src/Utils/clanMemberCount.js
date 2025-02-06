export default function clanMemberCount(clan) {
  const admins = clan?.admins?.length;
  const moderators = clan?.moderators?.length;
  const members = clan?.members?.length;

  return admins + moderators + members;
}
