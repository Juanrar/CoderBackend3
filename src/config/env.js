import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production"
};