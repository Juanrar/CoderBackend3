import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import mongoose from "mongoose";

export const mochaHooks = {
  async beforeAll() {
    await mongoose.connect(process.env.MONGODB_URI);
  },

  async afterEach() {
    for (const coleccion of Object.values(mongoose.connection.collections)) {
      await coleccion.deleteMany({});
    }
  },

  async afterAll() {
    await mongoose.disconnect();
  }
};
