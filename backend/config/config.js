import dotenv from "dotenv";

dotenv.config();
// config to switch between development and production

const config = {
  port: process.env.PORT || 8000,
  mongoDbUri: process.env.MONGO_DB_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
  proton: process.env.proton,
  storageOption: process.env.STORAGE_OPTION,
  cloudinary: {
    url: process.env.CLOUDINARY_URL,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  imgbbApiKey: process.env.IMGBB_API_KEY,
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
    },
  },
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiApiKeyModjo: process.env.GEMINI_API_KEY_MODJO,
  sessionSecret: process.env.SESSION_SECRET,
  frontendUrl: {
    // new config for testing the api to support both web and mobile
    web: {
      production: process.env.FRONTEND_PROD_URL,
      development: process.env.FRONTEND_PROD_URL,
    },
    mobile: {
      production: process.env.EXPO_URL_PROD,
      development: process.env.EXPO_URL,
    },
  },
  // previous config
  // process.env.NODE_ENV === "production"
  //   ? process.env.FRONTEND_PROD_URL
  //   : [
  //       process.env.FRONTEND_DEV_URL,
  //       process.env.FRONTEND_PROD_URL,
  //       process.env.EXPO_URL,
  //       process.env.EXPO_URL_PROD,
  //     ].filter(Boolean),

  // Helper function to get allowed origins based on environment and client type
  getAllowedOrigins: function () {
    if (this.nodeEnv === "production") {
      return [
        this.frontendUrl.web.production,
        this.frontendUrl.mobile.production,
      ].filter(Boolean);
    }
    return [
      this.frontendUrl.web.development,
      this.frontendUrl.web.production,
      this.frontendUrl.mobile.development,
      this.frontendUrl.mobile.production,
    ].filter(Boolean);
  },
  // Helper function to get frontend url based on environment and client type for socket
  getFrontendUrl: function (clientType, environment) {
    const envType = environment || this.nodeEnv;
    return this.frontendUrl[clientType][envType];
  },
  backendUrl:
    process.env.NODE_ENV === "production"
      ? process.env.BACKEND_PROD_URL
      : [
          process.env.BACKEND_PROD_URL,
          process.env.EXPO_URL,
          process.env.EXPO_URL_PROD,
          process.env.BACKEND_URL,
        ].filter(Boolean),
  mailtrap: {
    token: process.env.MAILTRAP_TOKEN,
    endpoint: process.env.MAILTRAP_ENDPOINT,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.NODE_ENV === "production" ? "24h" : "15d",
  },
  cookie: {
    name: "jwt",
    maxAge:
      process.env.NODE_ENV === "production"
        ? 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        : 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
};

export default config;
