import rateLimit from "express-rate-limit";

const rateLimiter = (windowMs: number, limit: number) => {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
};

export default rateLimiter;
