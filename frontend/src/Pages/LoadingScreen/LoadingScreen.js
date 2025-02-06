import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, AlertCircle } from "lucide-react";
import { getAllCategories } from "../../DataFetching/DataFetching";

const LoadingScreen = ({ setIsLoading, maintenanceMode }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [categoriesFetched, setCategoriesFetched] = useState(false);

  useEffect(() => {
    if (maintenanceMode) return;

    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        if (res.data) {
          setCategoriesFetched(true);
        }
      } catch (error) {
        // Handle error case
      }
    };

    fetchCategories();

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [maintenanceMode]);

  useEffect(() => {
    if (categoriesFetched && !maintenanceMode) {
      setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 300);
      }, 10);
    }
  }, [categoriesFetched, setIsLoading, maintenanceMode]);

  const MaintenanceContent = () => (
    <div className="flex flex-col items-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative">
        <motion.div
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-red-500/10 flex items-center justify-center"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          <Wrench className="w-12 h-12 sm:w-16 sm:h-16 text-red-400" />
        </motion.div>
      </motion.div>

      <div className="text-center space-y-4">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold"
          animate={{ scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 4, repeat: Infinity }}>
          <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
            Under Maintenance
          </span>
        </motion.h1>

        <div className="space-y-2">
          <p className="text-gray-300 text-lg sm:text-xl">
            We're making some improvements to our forum
          </p>
          <p className="text-gray-400 text-sm sm:text-base">
            Expected completion: 2 hours
          </p>
        </div>

        <motion.div
          className="flex items-center justify-center space-x-2 text-yellow-400"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}>
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Please check back later</span>
        </motion.div>
      </div>
    </div>
  );

  const LoadingContent = () => (
    <div className="flex flex-col items-center space-y-4 sm:space-y-8">
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-indigo-500/50"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-indigo-400/30 shadow-lg shadow-indigo-500/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          <img
            src="https://res.cloudinary.com/dp9d2rdk2/image/upload/v1728913659/logo_light_version_fmddvl.png"
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl font-bold px-4"
        animate={{ scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 4, repeat: Infinity }}>
        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Modjodjodjo Forum
        </span>
      </motion.h1>

      <div className="w-48 sm:w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          initial={{ width: "0%" }}
          animate={{ width: `${loadingProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="text-indigo-200 text-base sm:text-lg font-light tracking-wider px-4">
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}>
          {loadingProgress < 90
            ? "Loading Your Modjodjodjo Experience"
            : "Almost ready"}
          <span className="inline-flex space-x-1">
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}>
              .
            </motion.span>
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}>
              .
            </motion.span>
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}>
              .
            </motion.span>
          </span>
        </motion.span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 p-4">
      <div className="text-center relative w-full max-w-sm mx-auto">
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            background: maintenanceMode
              ? [
                  "radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(0,0,0,0) 50%)",
                  "radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(0,0,0,0) 50%)",
                  "radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(0,0,0,0) 50%)",
                ]
              : [
                  "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 50%)",
                  "radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(0,0,0,0) 50%)",
                  "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 50%)",
                ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {maintenanceMode ? <MaintenanceContent /> : <LoadingContent />}

        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-indigo-400/30"
            animate={{
              y: [-5, -15, -5],
              x: [-5, 5, -5],
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            style={{
              left: `${30 + i * 10}%`,
              top: `${50 + (i % 2 ? 10 : -10)}%`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
