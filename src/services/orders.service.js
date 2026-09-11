import { ordersRepository } from "../repositories/orders.repository.js";
import { createError } from "../utils/apiResponse.js";
import {
  ORDER_STATUS,
  ORDER_STATUSES,
  ORDER_PRIORITY,
  ORDER_PRIORITIES,
  ORDER_STATUS_TRANSITIONS
} from "../constants/order.constants.js";
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
      if (!ORDER_PRIORITIES.includes(priority)) {
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

    if (priority && !ORDER_PRIORITIES.includes(priority)) {
      throw createError(
        "VALIDATION_ERROR",
        `La prioridad '${priority}' no es valida. Permitidas: ${ORDER_PRIORITIES.join(", ")}`
      );
    }

    const newOrder = {
      ...orderData,
      total,
      status: ORDER_STATUS.CREATED,
      priority: priority || ORDER_PRIORITY.NORMAL,
      statusHistory: [{ status: ORDER_STATUS.CREATED, changedAt: new Date() }]
    };

    return ordersRepository.create(newOrder);
  },

  updateOrderStatus: async (id, status) => {
    if (!ORDER_STATUSES.includes(status)) {
      throw createError(
        "INVALID_STATUS",
        `El estado '${status ?? ""}' no es valido. Estados permitidos: ${ORDER_STATUSES.join(", ")}`
      );
    }

    const order = await ordersRepository.findById(id);
    if (!order) {
      throw createError("ORDER_NOT_FOUND");
    }

    if (order.status === status) {
      throw createError(
        "INVALID_STATUS",
        `El pedido ya se encuentra en estado '${status}'`
      );
    }

    const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      throw createError(
        "INVALID_STATUS",
        allowed.length
          ? `No se puede pasar de '${order.status}' a '${status}'. Transiciones validas: ${allowed.join(", ")}`
          : `El pedido esta en estado final '${order.status}' y no admite mas cambios`
      );
    }

    return ordersRepository.updateStatus(id, status, {
      status,
      changedAt: new Date()
    });
  },

  getOrderTracking: async (id) => {
    const order = await ordersRepository.findById(id);
    if (!order) {
      throw createError("ORDER_NOT_FOUND");
    }

    return {
      orderId: order._id,
      currentStatus: order.status,
      deliveryAddress: order.deliveryAddress,
      priority: order.priority,
      nextStatuses: ORDER_STATUS_TRANSITIONS[order.status] ?? [],
      isFinal: (ORDER_STATUS_TRANSITIONS[order.status] ?? []).length === 0,
      hasProof: Boolean(order.proof),
      history: order.statusHistory,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
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
