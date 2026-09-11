import { ordersRepository } from "../repositories/orders.repository.js";
import { createError } from "../utils/apiResponse.js";
import { ORDER_STATUSES } from "../constants/order.constants.js";
import { buildPaginationOptions, formatPaginated } from "../utils/pagination.js";

export const ordersService = {
  getOrders: async (query = {}) => {
    const { status, priority, customer, store } = query;
    const filter = {};

    if (status) {
      if (!ORDER_STATUSES.includes(status)) {
        throw createError("VALIDATION_ERROR", `El estado '${status}' no es valido`);
      }
      filter.status = status;
    }

    if (priority) {
      if (!["low", "normal", "high"].includes(priority)) {
        throw createError("VALIDATION_ERROR", `La prioridad '${priority}' no es valida`);
      }
      filter.priority = priority;
    }

    if (customer) filter.customer = customer;
    if (store) filter.store = store;

    const options = buildPaginationOptions(query, {
      allowedSortFields: ["createdAt", "updatedAt", "total", "status", "priority"]
    });

    return formatPaginated(await ordersRepository.findAll(filter, options));
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
    if (!ORDER_STATUSES.includes(status)) {
      throw createError(
        "VALIDATION_ERROR",
        `El estado '${status ?? ""}' no es valido`
      );
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
  },

  addProof : async (oid, file) => {
    if (!file) {
      throw createError("FILE_REQUIRED");
    }

    const order = await ordersRepository.findById(oid);

    if (!order) {
      throw createError("ORDER_NOT_FOUND");
    }

    const proof = {
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
    };

    return ordersRepository.update(oid, { proof });
  }
};
