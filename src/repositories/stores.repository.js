import StoreModel from "../models/store.model.js";
import UserModel from "../models/user.model.js";


export const storesRepository = {
  findAll: async (filter = {}, options = {}) => {
    return StoreModel.paginate(filter, options);
  },

  findById: async (id) => {
    return StoreModel.findById(id);
  },

  create: async (storeData) => {
    return StoreModel.create(storeData);
  },

  update: async (id, updates) => {
    return StoreModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
  },

  delete: async (id) => {
    return StoreModel.findByIdAndDelete(id)
  },

  findOwnerById: async (id) => {
    return UserModel.findById(id);
  },

  insertMany: async (stores) => {
    return StoreModel.insertMany(stores);
  }
};