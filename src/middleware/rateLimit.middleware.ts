import rateLimit from "express-rate-limit";

const rateLimiter = (windowMs: number, limit: number) => {
  return rateLimit({
    windowMs,
    limit, // Limit each IP to 100 requests per window
    standardHeaders: "draft-8", // Return rate limit info in headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
  });
};


export default rateLimiter;