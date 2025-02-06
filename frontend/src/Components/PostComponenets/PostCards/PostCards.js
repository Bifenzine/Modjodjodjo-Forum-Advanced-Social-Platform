import React, { useContext, useEffect, useState } from "react";
import "./postCards.css";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { getPostsByCategories } from "../../../DataFetching/DataFetching";
import { pageActiveContext } from "../../ContextPageActive/ContextPageActive";
import FormatDate from "../../../Utils/FormatDate";

const PostCards = () => {
  useContext(pageActiveContext);

  const { id } = useParams();
  // console.log(id);

  const ColorsAn = [
    "#808080",
    "#ffa600",
    "#009bff",
    "#800080",
    "#ff0000",
    "#000000",
  ];

  const [PostsByCategories, setPostsByCategories] = useState([]);

  useEffect(() => {
    getPostsByCategories(id)
      .then((data) => {
        setPostsByCategories(data.data);
        // console.log(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id, PostsByCategories]);

  return (
    <>
      {PostsByCategories.map((post) => (
        <Link
          to={`/${post.category.name}/PostDetail/${post._id}`}
          key={post._id}>
          <motion.div
            style={{
              borderColor: "#808000",
            }}
            animate={{
              borderColor: ColorsAn,
              transition: {
                ease: "linear",
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
            whileHover={{ x: 20, borderColor: "#007bff" }}
            className="notification h-fit px-4 mt-1 cursor-pointer border bg-background-dark  ">
            <div className="notiglow"></div>
            <div className="notiborderglow"></div>
            <div className="notititle md:text-sm sm:text-xs">
              creator : {post?.user?.username}{" "}
              <span className="absolute text-sm  bottom-1 right-4 text-slate-300">
                {FormatDate(post?.createdAt)}
              </span>{" "}
            </div>
            <div className="notibody md:text-sm sm:text-xs">
              {post?.title?.substring(0, 200)}
            </div>
          </motion.div>
        </Link>
      ))}
    </>
  );
};

export default PostCards;
