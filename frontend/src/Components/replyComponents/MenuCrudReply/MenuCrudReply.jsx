import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";
import { HiDotsVertical } from "react-icons/hi";
import useDeleteReply from "../../../Hooks/replyHooks/useDeleteReply";
import { useState } from "react";
import { useAuthContext } from "../../../Context/AuthContext";
import UpdateReplyModal from "../UpdateReplyModal/UpdateReplyModal";
import { Loader } from "lucide-react";

const MenuCrudReply = ({ reply }) => {
  // received comment from parent component
  // console.log(comment)
  console.log(reply);
  // console.log(comment?.replies[0]?._id)

  const { authUser } = useAuthContext();

  const { deleteReply, loading } = useDeleteReply();

  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteReply = async () => {
    try {
      await deleteReply(reply._id);
    } catch (error) {
      // Handle the error
      console.error("Error deleting reply:", error);
    }
  };

  const handleModal = () => {
    setIsOpen((pervStat) => !pervStat);
  };

  return (
    <>
      <Menu>
        <MenuHandler>
          <Button className="bg-slate-950 w-1">
            <HiDotsVertical />
          </Button>
        </MenuHandler>
        <MenuList className=" bg-slate-950 border-slate-800">
          {authUser?._id === reply?.user?._id && (
            <>
              <MenuItem className="hover:bg-slate-800" onClick={handleModal}>
                update
              </MenuItem>
              <hr className="my-1" />

              <MenuItem
                className="hover:bg-slate-800"
                onClick={handleDeleteReply}>
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Delete"
                )}
              </MenuItem>
              <hr className="my-1" />
            </>
          )}
          <MenuItem className="hover:bg-slate-800">report</MenuItem>
        </MenuList>
      </Menu>
      {isOpen && (
        <UpdateReplyModal
          replyId={reply._id}
          replyContent={reply.content}
          replyImage={reply.photo}
          closeModal={handleModal}
        />
      )}
    </>
  );
};

export default MenuCrudReply;
