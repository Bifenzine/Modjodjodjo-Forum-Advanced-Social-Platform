const OnlineStatus = (userId, onlineUsers) => {
    return onlineUsers.some(user => user._id === userId);
};

export default OnlineStatus;