import React, { useState } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import DropDownCrudProfil from './DropDownCrudProfil';

const ProfilHeader = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const closeDropdown = () => {
        setDropdownOpen(false);
    };


    return (
        <div className="bg-white shadow-lg p-4 sm:p-6 rounded-lg max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <img src="https://via.placeholder.com/80" alt="Profile" className="rounded-full h-16 w-16 sm:h-20 sm:w-20 mr-4" />
                    <div>
                        <div className="flex items-center space-x-2">
                            <h2 className="text-lg sm:text-xl font-bold">@amanda_nash</h2>
                            <span className="text-yellow-500">⭐</span>
                        </div>
                        <p className="text-gray-500">Amanda Nash</p>
                    </div>
                </div>
                <div className="relative">
                    <button onClick={toggleDropdown} className="text-gray-500 hover:text-gray-700">
                        <FaEllipsisH size={20} />
                    </button>
                    <DropDownCrudProfil isOpen={dropdownOpen} onClose={closeDropdown} />
                </div>
            </div>
            <div className="mt-4">
                <div className="flex flex-wrap space-x-2">
                    <span className="px-3 py-1 bg-gray-200 rounded-full text-gray-700">Lifestyle</span>
                    <span className="px-3 py-1 bg-gray-200 rounded-full text-gray-700">Music</span>
                </div>
                <div className="mt-4 flex space-x-6">
                    <div className="text-center">
                        <span className="font-bold text-lg">1,022</span>
                        <p className="text-gray-500">Posts</p>
                    </div>
                    <div className="text-center">
                        <span className="font-bold text-lg">47.2k</span>
                        <p className="text-gray-500">Followers</p>
                    </div>
                    <div className="text-center">
                        <span className="font-bold text-lg">652</span>
                        <p className="text-gray-500">Following</p>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-gray-700">
                        Actor, musician, songwriter. #amanda_nash Mailbox: amanda.nash@gmail.com "Rhythm&Blues is Life" // Link to our new video!
                    </p>
                    <a href="https://youtu.be/8TcueZUy881" className="text-blue-500">
                        https://youtu.be/8TcueZUy881
                    </a>
                </div>
                <div className="mt-4 flex space-x-2">
                    <span className="h-6 w-6 rounded-full bg-red-500"></span>
                    <span className="h-6 w-6 rounded-full bg-yellow-500"></span>
                    <span className="h-6 w-6 rounded-full bg-purple-500"></span>
                </div>
            </div>
        </div>
    );
};

export default ProfilHeader;
