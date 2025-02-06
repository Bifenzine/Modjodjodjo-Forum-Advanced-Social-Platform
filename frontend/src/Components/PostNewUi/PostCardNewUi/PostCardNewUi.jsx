import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoSettingsOutline } from "react-icons/io5";
import ReactionSection from "../ReactionSection/ReactionSection";
import UpdateClanPostModal from "../../ClanComponenets/UpdateClanPostModal/UpdateClanPostModal";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";
import useDeleteClanPost from "../../../Hooks/ClanHooks/ClanPostHooks/useDeleteClanPost";
import { useAuthContext } from "../../../Context/AuthContext";
import BookmarkPost from "../../PostComponenets/BookmarkPost/BookmarkPost";
import displayMedia from "../../../Utils/displayMediaBasedOnExtension";
import FormatDate from "../../../Utils/FormatDate";
import Avatar from "../../Avatar/Avatar";
import useDeletePost from "../../../Hooks/PostHooks/useDeletePost";
import useEditClanPost from "../../../Hooks/ClanHooks/ClanPostHooks/useEditClanPost";
import useUpdatePost from "../../../Hooks/PostHooks/useUpdatePost";
import UploadProgressToast from "../../Toasts/UploadProgressToast";

const PostCardNewUi = ({
  clanInfo,
  key,
  PostId,
  userId,
  username,
  shareCount,
  userProfilePic,
  title,
  content,
  postImage,
  category,
  clan,
  comments,
  upVotes,
  downVotes,
  time,
}) => {
  const { authUser } = useAuthContext();

  console.log("clan", clan);
  // console.log("clan", clan);

  const isAdmin = clanInfo?.admins?.some(
    (admin) => admin._id.toString() === authUser?._id.toString()
  );
  const isMember = clanInfo?.members?.some(
    (isMemb) => isMemb._id.toString() === authUser?._id.toString()
  );
  const isModerator = clanInfo?.moderators?.some(
    (mod) => mod._id.toString() === authUser?._id.toString()
  );

  const [updatePostModal, setUpdatePostModal] = useState(false);

  const { editClanPost, loadingClan, progress, setToastStatus, toastStatus } =
    useEditClanPost();
  const { updatePost, loading } = useUpdatePost();
  const { deleteClanPost } = useDeleteClanPost();
  const { deletePost } = useDeletePost();

  const handleModalStat = () => {
    setUpdatePostModal((prevStat) => !prevStat);
  };

  const handleDeletePost = async () => {
    try {
      // console.log("clan", clanInfo);
      if (clan?._id) {
        // console.log("clan");
        await deleteClanPost(PostId, true);
      } else {
        // console.log("post");
        await deletePost(PostId, true);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const canDelete = authUser?._id === userId || isAdmin || isModerator;
  const canAccessMenu = canDelete || isMember || authUser;
  const canEdit = authUser?._id === userId || isAdmin;

  return (
    <>
      {updatePostModal && (
        <UpdateClanPostModal
          PostId={PostId}
          title={title}
          content={content}
          postImage={postImage}
          category={category}
          onclose={handleModalStat}
          clan={clan}
          clanInfo={clanInfo}
          editClanPost={editClanPost}
          updatePost={updatePost}
        />
      )}
      <UploadProgressToast
        title={`Updating post  ${clan?._id ? "in Clan" : ""}: ${title}`}
        isVisible={toastStatus !== "idle"}
        progress={progress}
        status={toastStatus}
        onDismiss={() => setToastStatus("idle")}
      />

      <div
        key={key}
        className="bg-background-dark rounded-lg h-fit border border-slate-800 p-3 mb-4 shadow-lg">
        {/* Header Section */}
        <div className="flex flex-col space-y-2 mb-3">
          {/* User Info and Avatar */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Link className="relative" to={`/profile/${userId}`}>
                <Avatar
                  ProfilePic={userProfilePic}
                  username={username}
                  userId={userId}
                  className="w-8 h-8 md:w-10 md:h-10"
                />
              </Link>
              <div className="flex flex-col">
                <Link to={`/profile/${userId}`}>
                  <p className="text-sm font-bold line-clamp-1">{username}</p>
                </Link>
                <Link
                  to={
                    clan?.name
                      ? `/Clans/clan/${clan._id}`
                      : `/${category?.name}/${category?._id}`
                  }>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {clan?.name ? `posted in ${clan.name}` : category?.name}
                  </p>
                </Link>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="flex items-center space-x-1">
              <p className="text-xs text-gray-500">{FormatDate(time)}</p>
              <div className="flex items-center">
                <button className="p-1">
                  <BookmarkPost postId={PostId} />
                </button>

                {canAccessMenu && (
                  <Menu>
                    <MenuHandler>
                      <Button className="p-1">
                        <IoSettingsOutline className="w-4 h-4" />
                      </Button>
                    </MenuHandler>
                    <MenuList className="p-1 bg-slate-950 border-slate-700">
                      {canDelete && (
                        <>
                          {/* <MenuItem onClick={handleModalStat}>Edit</MenuItem> */}
                          <MenuItem onClick={handleDeletePost}>Delete</MenuItem>
                        </>
                      )}
                      {canEdit && (
                        <MenuItem onClick={handleModalStat}>Edit</MenuItem>
                      )}
                      <MenuItem>Report</MenuItem>
                    </MenuList>
                  </Menu>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mb-3">
          <Link to={`/${category?.name}/PostDetail/${PostId}`}>
            <p className="text-sm font-bold mb-2 line-clamp-2">{title}</p>
            {postImage && (
              <div className="relative w-full overflow-hidden rounded-lg">
                <div className="aspect-w-16 aspect-h-9">
                  {displayMedia(postImage, title)}
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Reaction Section */}
        <ReactionSection
          upVotes={upVotes}
          downVotes={downVotes}
          comments={comments}
          PostId={PostId}
          userId={userId}
          shareCount={shareCount}
          category={category?.name}
        />
      </div>
    </>
  );
};

export default PostCardNewUi;
