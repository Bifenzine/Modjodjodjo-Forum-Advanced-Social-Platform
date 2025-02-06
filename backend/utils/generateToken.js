import jwt from "jsonwebtoken";
import config from "../config/config.js";

const generateTokenAndSetCookie = (userId, res) => {
  console.log("Generating token for user:", userId);

  const token = jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  res.cookie(config.cookie.name, token, {
    maxAge: config.cookie.maxAge,
    httpOnly: config.cookie.httpOnly,
    sameSite: config.cookie.sameSite,
    secure: config.cookie.secure,
    path: config.cookie.path,
  });

  console.log(
    `Token generated and cookie set for ${config.nodeEnv} environment`
  );
  // added this ligne for mobile app support
  console.log("Token generated", token);

  return token;
};

export default generateTokenAndSetCookie;
