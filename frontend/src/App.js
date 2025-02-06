import React, { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Navbar, ForumOZO, MobileNavbar } from "./Components";
import LoadingScreen from "./Pages/LoadingScreen/LoadingScreen";
import {
  Home,
  AuthRegis,
  Technologie,
  Sport,
  Education,
  Music,
  Anime,
  SearchModal,
  PostDetail,
  PostsPage,
  UsersProfile,
  Clans,
  ClanDetail,
  Entertainment,
  Memes,
} from "./Pages";
import { pageActiveContext } from "./Components/ContextPageActive/ContextPageActive";
import { useAuthContext } from "./Context/AuthContext";
import { Toaster } from "react-hot-toast";
import Chatbot from "./Components/Chatbot/Chatbot";
import OAuthCallback from "./OauthCallback/OAuthCallback";
import Feeds from "./Pages/Feeds/Feeds";
import VerifyEmailPage from "./Pages/VerifyEmail/VerifyEmailPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage/ResetPasswordPage";
import Politics from "./Pages/Politics";

function App() {
  const [pageActive, setPageActive] = useState("Home");
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { authUser } = useAuthContext();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLoading, setIsLoading] = useState(true);

  const toggleNavbar = () => {
    setIsNavbarOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      if (newIsMobile) {
        setIsNavbarOpen(false);
      } else {
        setIsNavbarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const RedirectAuthenticatedUser = ({
    children,
    allowAuthenticated = false,
  }) => {
    if (authUser && authUser.isVerified && !allowAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // Show loading screen if isLoading is true
  if (isLoading) {
    return (
      <LoadingScreen setIsLoading={setIsLoading} maintenanceMode={false} />
    );
  }

  return (
    <BrowserRouter>
      <pageActiveContext.Provider value={{ pageActive, setPageActive }}>
        <div className="App min-h-screen flex bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
          <Toaster position="top-center" reverseOrder={false} />
          {!isMobile && (
            <Navbar isOpen={isNavbarOpen} toggleNavbar={toggleNavbar} />
          )}
          <div
            className={`flex-1 transition-all duration-300 ${
              !isMobile && isNavbarOpen ? "ml-44" : "md:ml-20 ml-0"
            } ${isMobile ? "mb-16" : ""}`}>
            <Routes>
              <Route
                path="/verify-email"
                element={
                  <RedirectAuthenticatedUser>
                    <VerifyEmailPage />
                  </RedirectAuthenticatedUser>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <RedirectAuthenticatedUser allowAuthenticated={true}>
                    <ForgotPasswordPage />
                  </RedirectAuthenticatedUser>
                }
              />
              <Route
                path="/reset-password/:token"
                element={
                  <RedirectAuthenticatedUser allowAuthenticated={true}>
                    <ResetPasswordPage />
                  </RedirectAuthenticatedUser>
                }
              />
              <Route
                path="*"
                element={
                  <>
                    <div className="main flex-1">
                      <ForumOZO />
                      <main className="md:p-4 pt-2">
                        <Routes>
                          <Route path="/Search" element={<SearchModal />} />
                          <Route
                            path="/"
                            element={authUser ? <Feeds /> : <Home />}
                          />
                          <Route
                            path="/Technology/:id"
                            element={<Technologie />}
                          />
                          <Route path="/Sport/:id" element={<Sport />} />
                          <Route
                            path="/Education/:id"
                            element={<Education />}
                          />
                          <Route path="/Music/:id" element={<Music />} />
                          <Route path="/Anime/:id" element={<Anime />} />
                          <Route
                            path="/Entertainment/:id"
                            element={<Entertainment />}
                          />
                          <Route path="/Politics/:id" element={<Politics />} />
                          <Route path="/Memes/:id" element={<Memes />} />
                          <Route path="/Category/:id" element={<PostsPage />} />
                          <Route
                            path="/:query/PostDetail/:id"
                            element={<PostDetail />}
                          />
                          <Route
                            path="/profile/:id"
                            element={<UsersProfile />}
                          />
                          <Route path="/Clans" element={<Clans />} />
                          <Route
                            path="/Clans/clan/:id"
                            element={<ClanDetail />}
                          />
                          <Route
                            path="/oauth-callback"
                            element={<OAuthCallback />}
                          />
                          <Route
                            path="/Register"
                            element={
                              authUser ? <Navigate to={"/"} /> : <AuthRegis />
                            }
                          />
                          <Route
                            path="/Logout"
                            element={<Navigate to={"/"} />}
                          />
                        </Routes>
                        <Chatbot />
                      </main>
                    </div>
                  </>
                }
              />
            </Routes>
          </div>
          {isMobile && <MobileNavbar />}
        </div>
      </pageActiveContext.Provider>
    </BrowserRouter>
  );
}

export default App;
