import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useResetPassword } from "../../Hooks/AuthHooks/useVerifyEmail";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    resetPassword,
    message,
    loading,
    error,
    checkPassword,
    passwordCriteria,
    isValid,
    getCriteriaStatus,
  } = useResetPassword();

  const { token } = useParams();
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPassword(newPassword, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    checkPassword(password, newConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) {
      const unmetCriteria = getCriteriaStatus()
        .filter((criterion) => !criterion.met)
        .map((criterion) => criterion.label);

      toast.error("Please meet all password criteria:");
      unmetCriteria.forEach((criterion) => toast.error(criterion));
      return;
    }

    try {
      await resetPassword(token, password, confirmPassword);
      toast.success(
        "Password reset successfully, redirecting to login page..."
      );
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full mx-auto mt-[5rem] bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-violet-500 text-transparent bg-clip-text">
          Reset Password
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-blue-500 text-sm mb-4">{message}</p>}

        <form onSubmit={handleSubmit}>
          {/* Password Input with Toggle */}
          <div className="relative mb-2">
            <input
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 pr-12"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none">
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Confirm Password Input with Toggle */}
          <div className="relative mb-2">
            <input
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 pr-12"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none">
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Password Criteria Checklist */}
          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            {getCriteriaStatus().map((criterion, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 text-sm ${
                  criterion.met ? "text-green-400" : "text-gray-400"
                }`}>
                <span>{criterion.met ? "✓" : "○"}</span>
                <span>{criterion.label}</span>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: isValid ? 1.02 : 1 }}
            whileTap={{ scale: isValid ? 0.98 : 1 }}
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-bold rounded-lg shadow-lg transition duration-200 ${
              !isValid
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-blue-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            }`}
            type="submit"
            disabled={loading || !isValid}>
            {loading ? "Resetting..." : "Set New Password"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage;
