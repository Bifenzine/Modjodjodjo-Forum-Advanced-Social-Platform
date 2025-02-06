import React, { createContext, useContext, useEffect, useState } from "react";

// Create context for authentication
export const AuthContext = createContext();

// Custom hook to use authentication context
export const useAuthContext = () => {
  return useContext(AuthContext);
};

// Provider component to manage authentication state
export const AuthContextProvider = ({ children }) => {
  // State to store authenticated user
  const [authUser, setAuthUser] = useState(() => {
    // Load user from localStorage or set to null if not available
    const storedUser = localStorage.getItem("forum-user");
    const storedTimestamp = localStorage.getItem("forum-user-timestamp");

    // Check if the timestamp is valid and within 24 hours
    const now = Date.now();
    const oneDayInMillis = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (
      storedUser &&
      storedTimestamp &&
      now - storedTimestamp < oneDayInMillis
    ) {
      return JSON.parse(storedUser);
    } else {
      // Clear localStorage if timestamp is older than 24 hours
      localStorage.removeItem("forum-user");
      localStorage.removeItem("forum-user-timestamp");
      return null;
    }
  });

  // Function to update authUser with the latest user data
  const updateUserProfile = (userData) => {
    setAuthUser(userData);
  };

  // Effect to update localStorage when authUser changes
  useEffect(() => {
    if (authUser) {
      // Store updated authUser and timestamp in localStorage
      localStorage.setItem("forum-user", JSON.stringify(authUser));
      localStorage.setItem("forum-user-timestamp", Date.now());
    }
  }, [authUser]);

  // Provide authUser, setAuthUser, and updateUserProfile to children components
  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
