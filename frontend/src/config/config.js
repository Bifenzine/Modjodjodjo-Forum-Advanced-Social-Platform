// src/config/config.js

const config = {
  env: process.env.NODE_ENV || "development",
  get isProduction() {
    return this.env === "production";
  },
  get isDevelopment() {
    return this.env === "development";
  },
  get apiUrl() {
    return this.isProduction
      ? process.env.REACT_APP_API_PROD_URL
      : process.env.REACT_APP_API_DEV_URL;
  },
  get frontendUrl() {
    return this.isProduction
      ? process.env.REACT_APP_PROD_URL
      : process.env.REACT_APP_DEV_URL;
  },
};

export default config;
