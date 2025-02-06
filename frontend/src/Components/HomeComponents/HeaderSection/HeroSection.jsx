import React from "react";
import { ArrowDownToLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover">
        <source
          src="https://res.cloudinary.com/dp9d2rdk2/video/upload/v1730121812/r9hijqnqx5lacxfjn0t4.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay (for additional effect) */}
      <div className="absolute inset-0 bg-black/50 z-1"></div>

      {/* Main content container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 flex flex-col items-center justify-center min-h-screen text-white">
        <div className="max-w-4xl w-full space-y-8 text-center">
          {/* Gradient badge */}
          <div className="inline-block mx-auto">
            <span className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-gray-700 rounded-full py-1 px-4 text-sm backdrop-blur-sm">
              🎉 Welcome to Modjodjodjo Forum
            </span>
          </div>

          {/* Main heading with animated gradient text */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent animate-gradient-wind">
              Join the conversation
            </span>
            <br className="hidden sm:block" />
            <span className="mt-2 sm:mt-0"> in your favorite community</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Explore trending topics, share your thoughts, and connect with
            like-minded people in the Modjodjodjo Forum. Dive into categories
            like sports, tech, memes, and more!
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => navigate("/Register")}
              className="group bg-white hover:bg-gray-100 text-black font-medium py-3 px-6 rounded-full flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-white/20">
              <ArrowDownToLine className="w-5 h-5" />
              <span>Join Now</span>
            </button>
            {/* Uncomment for additional button */}
            {/* <button className="group bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-full flex items-center justify-center space-x-2 transition-all duration-200 border border-gray-700 hover:border-gray-600">
              <Info className="w-5 h-5" />
              <span>Learn More</span>
            </button> */}
          </div>

          {/* Preview image */}
          <div className="mt-16 relative">
            <img
              src="/api/placeholder/800/400"
              alt="Forum preview"
              className="rounded-lg shadow-2xl shadow-purple-500/10 mx-auto"
            />
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-purple-500 opacity-50" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-blue-500 opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
