import allowedOrigins from "./allowedOrigins.js";

// new corsOptions to support web and mobile
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "x-client-type", // Add this new header
  ],
};

export default corsOptions;

// previous corsOptions
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (allowedOrigins.includes(origin) || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   optionsSuccessStatus: 200,
//   // new lignes
//   allowedHeaders: ["Authorization", "Content-Type"],
// };

// export default corsOptions;
