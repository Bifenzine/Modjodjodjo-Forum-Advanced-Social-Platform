import React from "react";
import {
  Button,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import useChangeToAdmin from "../../../Hooks/ClanHooks/ClansRoles/useChangeToAdmin";
import useChangeToMember from "../../../Hooks/ClanHooks/ClansRoles/useChangeToMember";
import useChangeToMods from "../../../Hooks/ClanHooks/ClansRoles/useChangeToMods";
import useDeleteMemberFromClan from "../../../Hooks/ClanHooks/ClansRoles/useDeleteMemberFromClan";
import { SlOptions } from "react-icons/sl";

const AdminDashboard = ({ clanInfo, onCancel, admin, mods }) => {
  const { changeToAdmin } = useChangeToAdmin();
  const { changeToMember } = useChangeToMember();
  const { changeToMods } = useChangeToMods();
  const { deleteMemberFromClan } = useDeleteMemberFromClan();

  const members = clanInfo?.members?.filter(
    (member) =>
      !clanInfo.admins.some((admin) => admin._id === member._id) &&
      !clanInfo.moderators.some((moderator) => moderator._id === member._id)
  );

  if (!clanInfo) {
    return <div>loading ...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-900 w-full max-w-4xl h-[90vh] overflow-auto relative p-4 sm:p-6 rounded-lg border-slate-700 border shadow-sm shadow-slate-400">
        <h2 className="text-xl sm:text-2xl mb-4">Admin Dashboard</h2>
        <div className="absolute top-2 right-2">
          <Button onClick={onCancel} color="red" size="sm">
            X
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {["Admins", "Mods", "Members"].map((role) => (
            <div key={role} className="flex-1">
              <h2 className="text-lg sm:text-xl border-b-2 p-2 font-bold mb-4 text-center">
                {role}
              </h2>
              <ul className="space-y-2 sm:space-y-4">
                {(role === "Admins"
                  ? clanInfo?.admins
                  : role === "Mods"
                  ? clanInfo?.moderators
                  : members
                )?.map((member) => (
                  <div
                    key={member._id}
                    className="p-2 sm:p-4 relative bg-slate-950 rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                    <span className="text-sm sm:text-base">
                      {member.username}
                    </span>
                    {((role === "Admins" && admin) ||
                      (role === "Mods" && (admin || mods)) ||
                      (role === "Members" && (admin || mods))) && (
                      <Menu>
                        <MenuHandler>
                          <Button className="border-2 border-slate-700 p-1 sm:p-2">
                            <SlOptions />
                          </Button>
                        </MenuHandler>
                        <MenuList className="bg-slate-900 border-slate-700 space-y-1 sm:space-y-2 py-1 sm:py-2 z-60">
                          {role === "Admins" && admin && (
                            <>
                              <MenuItem
                                onClick={() =>
                                  changeToMods(clanInfo._id, member._id)
                                }>
                                Change to Moderator
                              </MenuItem>
                              <MenuItem
                                onClick={() =>
                                  changeToMember(clanInfo._id, member._id)
                                }>
                                Change to Member
                              </MenuItem>
                            </>
                          )}
                          {role === "Mods" && (admin || mods) && (
                            <>
                              <MenuItem
                                onClick={() =>
                                  changeToMember(clanInfo._id, member._id)
                                }>
                                Change to Member
                              </MenuItem>
                            </>
                          )}
                          {role === "Members" && (
                            <>
                              {admin && (
                                <MenuItem
                                  onClick={() =>
                                    changeToAdmin(clanInfo._id, member._id)
                                  }>
                                  Upgrade to Admin
                                </MenuItem>
                              )}
                              {(mods || admin) && (
                                <MenuItem
                                  onClick={() =>
                                    changeToMods(clanInfo._id, member._id)
                                  }>
                                  Upgrade to Mod
                                </MenuItem>
                              )}
                            </>
                          )}
                          {(admin || mods) && (
                            <MenuItem
                              onClick={() =>
                                deleteMemberFromClan(clanInfo._id, member._id)
                              }>
                              Remove from Clan
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
                    )}
                  </div>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// previous code of the admindashboard
// import React from 'react';
// import { Button, Menu, MenuHandler, MenuItem, MenuList } from '@material-tailwind/react';
// import useChangeToAdmin from '../../../Hooks/ClanHooks/ClansRoles/useChangeToAdmin';
// import useChangeToMember from '../../../Hooks/ClanHooks/ClansRoles/useChangeToMember';
// import useChangeToMods from '../../../Hooks/ClanHooks/ClansRoles/useChangeToMods';
// import useDeleteMemberFromClan from '../../../Hooks/ClanHooks/ClansRoles/useDeleteMemberFromClan';
// import { SlOptions } from "react-icons/sl";

// const AdminDashbord = ({ clanInfo, onCancel, admin, mods }) => {
//   const { changeToAdmin } = useChangeToAdmin();
//   const { changeToMember } = useChangeToMember();
//   const { changeToMods } = useChangeToMods();
//   const { deleteMemberFromClan } = useDeleteMemberFromClan();

//   const members = clanInfo?.members?.filter(
//     (member) =>
//       !clanInfo.admins.some((admin) => admin._id === member._id) &&
//       !clanInfo.moderators.some((moderator) => moderator._id === member._id)
//   );

//   console.log(admin)
//   console.log(mods)

//   if (!clanInfo) {
//     return (
//       <div>loading ...</div>
//     )
//   }

//   return (
//     <>
//       <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
//         <div className="bg-slate-900 h-[40rem] overflow-auto relative w-[60%] p-6 rounded-lg border-slate-700 border shadow-sm shadow-slate-400">
//           <h2 className="text-2xl mb-4">Admin Dashboard</h2>
//           <div className='absolute top-0 right-0 p-2'>
//             <Button onClick={onCancel} color="red">
//               X
//             </Button>
//           </div>

//           <div className="flex items-center justify-center">
//             <div className="shadow-lg rounded-lg p-8 max-w-3xl w-full">
//               <div className="flex flex-wrap gap-6 justify-between">
//                 <div className="flex-1">
//                   <h2 className="text-2xl border-b-2 p-2 font-bold mb-4 text-center">Admins</h2>
//                   <ul className="space-y-4">
//                     {clanInfo?.admins?.map((admino) => (
//                       <div key={admino._id} className="p-4 relative bg-slate-950 rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
//                         {admino.username}
//                         {/* Show the menu only for admins */}
//                        {admin && (
//                         <Menu>
//                             <MenuHandler>
//                               <Button className="border-2 border-slate-700"><SlOptions /></Button>
//                             </MenuHandler>
//                             <MenuList className="bg-slate-900 border-slate-700 space-y-2 py-2 z-60">
//                               <MenuItem onClick={() => changeToMods(clanInfo._id, admino._id)}>change to Moderator</MenuItem>
//                               <MenuItem onClick={() => changeToMember(clanInfo._id, admino._id)}>change to Member</MenuItem>
//                               <MenuItem onClick={() => deleteMemberFromClan(clanInfo._id, admino._id)}>Remove from Clan</MenuItem>
//                             </MenuList>
//                           </Menu>
//                        )}

//                       </div>
//                     ))}
//                   </ul>
//                 </div>
//                 <div className="flex-1">
//                   <h2 className="text-2xl border-b-2 p-2 font-bold mb-4 text-center">Mods</h2>
//                   <ul className="space-y-4">
//                     {clanInfo?.moderators?.map((mod) => (
//                       <div key={mod._id} className="p-4 relative bg-slate-950 rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
//                         {mod.username}
//                         {/* Show the menu for admins and mods */}
//                         {(admin || mods) && (
//                           <Menu>
//                             <MenuHandler>
//                               <Button className="border-2 border-slate-700"><SlOptions /></Button>
//                             </MenuHandler>
//                             <MenuList className="bg-slate-900 border-slate-700 space-y-2 py-2 z-60">
//                             {/* {admin && (
//                               <MenuItem onClick={() => changeToMods(clanInfo._id, mod._id)}>Upgrade to Mods</MenuItem>
//                             )} */}
//                               <MenuItem onClick={() => changeToMember(clanInfo._id, mod._id)}>change to Member</MenuItem>
//                               <MenuItem onClick={() => deleteMemberFromClan(clanInfo._id, mod._id)}>Remove from Clan</MenuItem>
//                             </MenuList>
//                           </Menu>
//                         )}
//                       </div>
//                     ))}
//                   </ul>
//                 </div>
//                 <div className="flex-1">
//                   <h2 className="text-2xl font-bold mb-4 text-center border-b-2 p-2">Members</h2>
//                   <ul className="space-y-4">
//                     {members?.map((member) => (
//                       <div key={member._id} className="p-4 relative bg-slate-950 rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
//                         {member.username}
//                         {/* Show the menu for admins and mods */}
//                         {(admin || mods) && (
//                           <Menu>
//                             <MenuHandler>
//                               <Button className="border-2 border-slate-700"><SlOptions /></Button>
//                             </MenuHandler>
//                             <MenuList className="bg-slate-900 border-slate-700 space-y-2 py-2 z-60">
//                               {admin && (

//                                   <MenuItem onClick={() => changeToAdmin(clanInfo._id, member._id)}>Upgrade to Admin</MenuItem>
//                                   )}
//                                   {mods || admin && (
//                                     <>
//                               <MenuItem onClick={() => changeToMods(clanInfo._id, member._id)}>Upgrade to Mod</MenuItem>
//                               <MenuItem onClick={() => deleteMemberFromClan(clanInfo._id, member._id)}>Remove from Clan</MenuItem>
//                                     </>
//                                   )}

//                             </MenuList>
//                           </Menu>
//                         )}
//                       </div>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default AdminDashbord;
