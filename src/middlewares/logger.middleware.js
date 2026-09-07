import logger from "../config/logger.js";

export function addLogger(req, res, next) {
  req.logger = logger;

  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) {
      req.logger.error(message);
    } else if (res.statusCode >= 400) {
      req.logger.warning(message);
    } else {
      req.logger.http(message);
    }
  });

  next();
}
