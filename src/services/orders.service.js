import { ordersRepository } from "../repositories/orders.repository.js";
import { createError } from "../utils/apiResponse.js";

export const ordersService = {
  getOrders: async () => {
    return ordersRepository.findAll();
  },

  getOrderById: async (id) => {
    const order = await ordersRepository.findById(id);
    if (!order) {
      throw createError("ORDER_NOT_FOUND");
    }

    return order;
  },

  createOrder: async (orderData) => {
    const { customer, store, items, deliveryAddress, priority } = orderData;

    if (!customer || !store || !items || !deliveryAddress) {
      throw createError("VALIDATION_ERROR");
    }

    const userFound = await ordersRepository.findCustomerById(customer);
    if (!userFound) {
      throw createError("USER_NOT_FOUND");
    }

    const storeFound = await ordersRepository.findStoreById(store)
    if (!storeFound) {
      throw createError("STORE_NOT_FOUND");
    }

    const total = items.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0);

    const newOrder = {
      ...orderData,
      total,
      status: "created",
      priority: "normal"
    };

    return ordersRepository.create(newOrder);
  },

  updateOrderStatus: async (id, status) => {
    if (!status) {
      throw createError("VALIDATION_ERROR");
    }
    const order = await ordersRepository.updateStatus(id, status);
    if (!order) {
      throw createError("ORDER_NOT_FOUND");
    }

    return order;
  },

  deleteOrder: async (id) => {
    const order = await ordersRepository.delete(id);
    if (!order) {
      throw createError("ORDER_NOT_FOUND");
    }

    return order;
  }
};