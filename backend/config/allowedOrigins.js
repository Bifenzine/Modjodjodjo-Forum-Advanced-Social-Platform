import config from "./config.js";

// const allowedOrigins = config.frontendUrl;
// new ligne to support web and mobile
const allowedOrigins = config.getAllowedOrigins();
export default allowedOrigins;
