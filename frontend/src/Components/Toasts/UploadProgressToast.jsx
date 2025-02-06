import React from "react";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

const UploadProgressToast = ({
  title,
  isVisible,
  progress,
  status,
  onDismiss,
}) => {
  const [show, setShow] = useState(false);
  console.log("Toast props:", { isVisible, status, progress, title });

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timer = setTimeout(() => {
        setShow(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  const getStatusConfig = () => {
    switch (status) {
      case "processing":
        return {
          icon: <Loader2 className="animate-spin w-5 h-5" />,
          text: "Processing...",
          bgColor: "bg-black/70",
          borderColor: "border-blue-500/50",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          text: "Complete",
          bgColor: "bg-black/70",
          borderColor: "border-green-500/50",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          text: "Error",
          bgColor: "bg-black/70",
          borderColor: "border-red-500/50",
        };
      default:
        return {
          icon: <Loader2 className="animate-spin w-5 h-5" />,
          text: "Processing...",
          bgColor: "bg-blue-500/50",
          borderColor: "border-blue-500/50",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="fixed z-100 bottom-0 left-0 right-0 w-full flex justify-center items-center p-4">
      <div
        className={`w-full max-w-sm transform transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}>
        <div
          className={`rounded-lg shadow-lg ${statusConfig.bgColor} border ${statusConfig.borderColor} p-4 mx-auto`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{statusConfig.icon}</div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium text-foreground">{title}</p>
              <div className="mt-1 text-xs text-muted-foreground">
                {statusConfig.text}
              </div>
              {status === "processing" && (
                <div className="mt-2 w-full bg-secondary rounded-full h-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 ml-4 hover:text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProgressToast;
