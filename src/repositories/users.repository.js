import UserModel from "../models/user.model.js";

export const usersRepository = {
  findAll: async () => {
    return UserModel.find();
  },

  findById: async (id) => {
    return UserModel.findById(id);
  },

  create: async (userData) => {
    return UserModel.create(userData);
  },

  update: async (id, updates) => {
    return UserModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
  },

  delete: async (id) => {
    return UserModel.findByIdAndDelete(id)
  }
};