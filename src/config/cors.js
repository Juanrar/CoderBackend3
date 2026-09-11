import cors from "cors";
import { envConfig } from "./env.js";

const devOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://127.0.0.1:5173"
];

const allowedOrigins = envConfig.corsOrigins.length
  ? envConfig.corsOrigins
  : envConfig.isProd
    ? []
    : devOrigins;

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    const error = new Error(`Origen no permitido por CORS: ${origin}`);
    error.statusCode = 403;
    error.code = "CORS_NOT_ALLOWED";
    return callback(error);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400
});
