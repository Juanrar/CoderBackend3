import mongoose from "mongoose";
import { envConfig } from "./env.js";
import logger from "../config/logger.js";

const connectDB = async () => {
  const mongoUri = envConfig.mongoUri;

  if (!mongoUri) {
    throw new Error("Falta la variable MONGODB_URI");
  }

  await mongoose.connect(mongoUri);
  logger.info("MongoDB conectado");
};

export default connectDB;
