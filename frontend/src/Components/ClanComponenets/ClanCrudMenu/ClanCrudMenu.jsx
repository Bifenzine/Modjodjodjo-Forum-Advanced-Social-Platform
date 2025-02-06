import React, { useState } from "react";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
} from "@material-tailwind/react";
import useDeleteClan from "../../../Hooks/ClanHooks/useDeleteClan";
import useEditClan from "../../../Hooks/ClanHooks/useEditClan";
import UpdateClanModal from "../UpdateClan/UpdateClanModal";
import AdminDashbord from "../AdminDashbord/AdminDashbord";
import { Loader } from "lucide-react";
import UploadProgressToast from "../../Toasts/UploadProgressToast";

const ClanCrudMenu = ({ clanInfo, admin, mods }) => {
  const [openMenu, setOpenMenu] = useState(false);

  const { editClan, loadingClan, progress, setToastStatus, toastStatus } =
    useEditClan();
  const { deleteClan, loading } = useDeleteClan();

  const dltClan = async () => {
    try {
      const deleteCLAN = await deleteClan(clanInfo?._id);
      console.log("Deleted Clan:", deleteCLAN);
    } catch (error) {
      console.error("Error deleting Clan:", error);
    }
  };

  const [openAdminMenu, setOpenAdminMenu] = useState(false);

  const handleAdminMenu = () => {
    setOpenAdminMenu((pervStat) => !pervStat);
  };

  const handleClose = () => {
    setOpenMenu((pervStat) => !pervStat);
  };

  if (!clanInfo) {
    return <div>loading ...</div>;
  }

  return (
    <>
      <UploadProgressToast
        title={`Updating clan: ${clanInfo.name}`}
        isVisible={toastStatus !== "idle"}
        progress={progress}
        status={toastStatus}
        onDismiss={() => setToastStatus("idle")}
      />
      <Menu>
        <MenuHandler>
          <Button className="border-2 border-slate-700">Menu</Button>
        </MenuHandler>
        <MenuList className="bg-slate-900 border-slate-700 space-y-2 py-2">
          <MenuItem onClick={handleAdminMenu}>Admin Menu</MenuItem>
          {admin && (
            <>
              <MenuItem onClick={handleClose}>Edit Clan</MenuItem>
              <MenuItem onClick={dltClan} disabled={loading}>
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Delete Clan"
                )}
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>

      {openMenu ? (
        <UpdateClanModal
          clanInfo={clanInfo}
          onCancel={handleClose}
          editClan={editClan}
        />
      ) : null}

      {openAdminMenu ? (
        <AdminDashbord
          clanInfo={clanInfo}
          admin={admin}
          mods={mods}
          onCancel={handleAdminMenu}
        />
      ) : null}
    </>
  );
};

export default ClanCrudMenu;
