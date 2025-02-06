import React, { useEffect, useState, useCallback } from "react";
import { getUserFeedPosts } from "../../DataFetching/DataFetching";
import PostCardNewUi from "../PostNewUi/PostCardNewUi/PostCardNewUi";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAuthContext } from "../../Context/AuthContext";

const FeedPosts = () => {
  // State variables
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Get authenticated user from context
  const { authUser } = useAuthContext();

  // Function to fetch posts
  const fetchPosts = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Fetch posts from the API using the getUserFeedPosts function
      const response = await getUserFeedPosts(page, 5); // Set limit to 5

      if (response && response.posts) {
        // Update posts state, filtering out duplicates
        setPosts((prevPosts) => {
          const newPosts = response.posts.filter(
            (newPost) =>
              !prevPosts.some(
                (existingPost) => existingPost._id === newPost._id
              )
          );
          return [...prevPosts, ...newPosts];
        });

        // Update pagination state
        setHasMore(response.currentPage < response.totalPages);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, posts]);

  // Effect to reset and fetch posts when user changes
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts();
  }, [authUser]);

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchPosts}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
      endMessage={
        <p style={{ textAlign: "center" }}>
          <b>Yay! You have seen it all</b>
        </p>
      }>
      {posts.map((post) => (
        <PostCardNewUi
          key={post._id}
          PostId={post._id}
          username={post.user.username}
          userId={post.user._id}
          userProfilePic={post.user.profilePic}
          title={post.title}
          content={post.content}
          postImage={post.photo}
          category={post.category}
          clan={post?.clan}
          comments={post.comments.length}
          upVotes={post.upVotes}
          downVotes={post.downVotes}
          time={post.createdAt}
          shareCount={post.shareCount}
        />
      ))}
    </InfiniteScroll>
  );
};

export default FeedPosts;
