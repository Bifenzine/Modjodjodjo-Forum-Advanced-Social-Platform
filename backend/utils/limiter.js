import rateLimit from "express-rate-limit";

// Define the rate limit rule
const limiter = rateLimit({
  windowMs: 20 * 1000, // 20 seconds
  max: 100, // limit each IP to 1 request per windowMs
  message: 'Too many requests from this IP, please try again after 20 seconds',
  headers: true, // Sends rate limit info in the `RateLimit-*` headers
});

export default limiter