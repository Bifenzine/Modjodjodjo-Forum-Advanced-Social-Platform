import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import PostCardNewUi from "../../PostNewUi/PostCardNewUi/PostCardNewUi";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import CreateClanPostModal from "../CreateClanPostModal/CreateClanPostModal";
import { checkUserRole } from "../../../Utils/ClanHelperFunctios/CheckIfMemberOfClan";
import { useAuthContext } from "../../../Context/AuthContext";
import UploadProgressToast from "../../Toasts/UploadProgressToast";
import useCreateClanPost from "../../../Hooks/ClanHooks/ClanPostHooks/useCreateClanPost";
import truncateMsg from "../../../Utils/TruncateMsg";

export default function ClanPageTabs({
  trendingPosts,
  popularPosts,
  newestPosts,
  clanInfo,
}) {
  const [openModal, setOpenModal] = useState(false);
  const { authUser } = useAuthContext();
  const { createClanPost, Loading, progress, setToastStatus, toastStatus } =
    useCreateClanPost();

  const { isAdmin, isMember, isModerator } = checkUserRole(
    clanInfo,
    authUser?._id
  );

  // console.log(isAdmin, isMember, isModerator);

  const handleModalStat = () => {
    setOpenModal((prevStat) => !prevStat);
  };

  if (!trendingPosts || !popularPosts || !newestPosts) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex relative w-full justify-center items-center py-2 sm:py-4 px-0 sm:px-4">
        <div className="w-full max-w-xl lg:max-w-2xl">
          <TabGroup>
            <TabList className="flex flex-wrap justify-center gap-1 sm:gap-4">
              {["Newest", "Popular", "Trending"].map((tab) => (
                <Tab
                  key={tab}
                  className="rounded-full py-1 px-2 sm:px-3 text-xs sm:text-sm font-semibold text-white focus:outline-none data-[selected]:bg-white/10 data-[hover]:bg-white/5 data-[selected]:data-[hover]:bg-white/10 data-[focus]:outline-1 data-[focus]:outline-white">
                  {tab}
                </Tab>
              ))}
              {isAdmin || isModerator || isMember ? (
                <button
                  onClick={handleModalStat}
                  className="rounded-full border border-slate-700 flex justify-center items-center py-1 px-2 sm:px-3 text-xs sm:text-sm font-semibold text-white">
                  <FaPlus className="mr-1" /> <span>Create</span>
                </button>
              ) : null}
            </TabList>
            <TabPanels className="mt-3 w-full">
              {[newestPosts, popularPosts, trendingPosts].map((posts, idx) => (
                <TabPanel
                  key={idx}
                  className="rounded-xl w-full bg-white/5 p-2 sm:p-3">
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCardNewUi
                        key={post._id}
                        PostId={post._id}
                        username={post?.user?.username}
                        userId={post?.user?._id}
                        userProfilePic={post?.user?.profilePic}
                        title={post?.title}
                        content={post?.content}
                        postImage={post?.photo}
                        category={post?.category}
                        clan={post?.clan}
                        comments={post?.comments?.length}
                        upVotes={post?.upVotes}
                        downVotes={post?.downVotes}
                        time={post?.createdAt}
                        clanInfo={clanInfo}
                        shareCount={post?.shareCount}
                      />
                    ))}
                  </div>
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </div>
      {openModal && (
        <CreateClanPostModal
          onclose={handleModalStat}
          clanInfo={clanInfo}
          createClanPost={createClanPost}
        />
      )}
      <UploadProgressToast
        title={`creating post in ${clanInfo?.name}`}
        isVisible={toastStatus !== "idle"}
        progress={progress}
        status={toastStatus}
        onDismiss={() => setToastStatus("idle")}
      />
    </>
  );
}
