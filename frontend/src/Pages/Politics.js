import React, { useContext } from "react";
import { pageActiveContext } from "../Components/ContextPageActive/ContextPageActive";
import { PostsByCategories } from "../Components";
import { useParams } from "react-router-dom";

const Politics = () => {
  useContext(pageActiveContext);

  const { id } = useParams();
  // console.log(id);
  return (
    <>
      <PostsByCategories id={id} />
    </>
  );
};

export default Politics;
