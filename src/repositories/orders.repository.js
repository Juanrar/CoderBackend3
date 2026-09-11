import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import StoreModel from "../models/store.model.js";

export const ordersRepository = {
  findAll: async (filter = {}, options = {}) => {
    return OrderModel.paginate(filter, {
      ...options,
      populate: [
        { path: "customer", select: "firstName lastName email role" },
        { path: "store", select: "name address isActive" }
      ]
    });
  },

  findById: async (id) => {
    return OrderModel.findById(id).populate("customer").populate("store");
  },

  create: async (orderData) => {
    return OrderModel.create(orderData);
  },

  updateStatus: async (id, status, historyEntry) => {
    return OrderModel.findByIdAndUpdate(
      id,
      {
        status,
        ...(historyEntry && { $push: { statusHistory: historyEntry } })
      },
      { new: true, runValidators: true }
    );
  },


  delete: async (id) => {
    return OrderModel.findByIdAndDelete(id);
  },

  findCustomerById: async (id) => {
    return UserModel.findById(id);
  },

  findStoreById: async (id) => {
    return StoreModel.findById(id);
  },

  update: async (id, updateData) => {
    return OrderModel.findByIdAndUpdate(id, updateData, { new: true });
  },

  insertMany: async (orders) => {
    return OrderModel.insertMany(orders);
  }
};