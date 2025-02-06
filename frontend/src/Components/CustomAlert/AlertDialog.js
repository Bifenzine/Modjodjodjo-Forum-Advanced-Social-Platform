import React from "react";
import { motion } from "framer-motion";

const AlertDialog = ({ isOpen, onClose, title, description }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background-dark bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 15, stiffness: 300 }}
        className="bg-surface rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-primary-light/20">
        <h2 className="text-2xl font-bold mb-4 text-text">{title}</h2>
        <p className="text-text-muted mb-8">{description}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary hover:bg-primary-light text-text font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-50">
            OK
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AlertDialog;
