import React from 'react';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';

const creators = [
    { id: 1, name: 'Dereon Erickson', username: '@dereon', status: 'Following', img: 'https://via.placeholder.com/40' },
    { id: 2, name: 'Destiney Wood', username: '@destiney', status: 'Follow', img: 'https://via.placeholder.com/40' },
    { id: 3, name: 'Chace Rojas', username: '@c_rojas', status: 'Follow', img: 'https://via.placeholder.com/40' },
    { id: 4, name: 'Darwin Shaffer', username: '@darwin', status: 'Follow', img: 'https://via.placeholder.com/40' },
];

const FollowersCards = () => {
    return (
        <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 max-w-sm mx-auto w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Followers</h2>
                <button className="text-pink-500 text-sm">See all</button>
            </div>
            <ul>
                {creators.map((creator, index) => (
                    <li key={creator.id} className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <span className="text-lg font-semibold mr-2">{index + 1}.</span>
                            <img src={creator.img} alt={creator.name} className="rounded-full h-10 w-10 mr-3" />
                            <div>
                                <p className="font-semibold">{creator.name}</p>
                                <p className="text-gray-500">{creator.username}</p>
                            </div>
                        </div>
                        <button
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-white ${
                                creator.status === 'Following' ? 'bg-pink-500' : 'bg-gray-300'
                            }`}
                        >
                            {creator.status === 'Following' ? <FaUserCheck /> : <FaUserPlus />}
                            <span className="text-sm">{creator.status}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FollowersCards;
