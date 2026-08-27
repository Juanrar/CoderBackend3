import mongoose from "mongoose";
import { envConfig } from "./env.js";

const connectDB = async () => {
  const mongoUri = envConfig.mongoUri;

  if (!mongoUri) {
    throw new Error("Falta la variable MONGODB_URI");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB conectado");
};

export default connectDB;
