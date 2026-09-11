import { faker } from "@faker-js/faker";
import { usersRepository } from "../repositories/users.repository.js";
import { storesRepository } from "../repositories/stores.repository.js";
import { ordersRepository } from "../repositories/orders.repository.js";
import { generateMockUsers } from "../mocks/users.mock.js";
import { generateMockStores } from "../mocks/stores.mock.js";
import { generateMockOrders, generateMockOrder } from "../mocks/orders.mock.js";
import { USER_ROLES } from "../constants/user.constants.js";
import { createError } from "../utils/apiResponse.js";

export const MAX_MOCK_QUANTITY = 100;
const DEFAULT_MOCK_QUANTITY = 10;

const validateQuantity = (value, field) => {
  if (!Number.isInteger(value)) {
    throw createError(
      "INVALID_MOCK_QUANTITY",
      `'${field}' debe ser un numero entero`
    );
  }

  if (value < 0) {
    throw createError(
      "INVALID_MOCK_QUANTITY",
      `'${field}' no puede ser negativo`
    );
  }

  if (value > MAX_MOCK_QUANTITY) {
    throw createError(
      "INVALID_MOCK_QUANTITY",
      `'${field}' no puede superar ${MAX_MOCK_QUANTITY}`
    );
  }

  return value;
};

export const mocksService = {

  getMockUsers: (count = DEFAULT_MOCK_QUANTITY) => {
    validateQuantity(count, "users");
    return generateMockUsers(count);
  },

  getMockOrders: (count = DEFAULT_MOCK_QUANTITY) => {
    validateQuantity(count, "orders");

    const fakeCustomerId = faker.database.mongodbObjectId();
    const fakeStoreId = faker.database.mongodbObjectId();

    return generateMockOrders(fakeCustomerId, count, fakeStoreId);
  },


  generateData: async ({ users = 0, stores = 0, orders = 0 } = {}) => {
    validateQuantity(users, "users");
    validateQuantity(stores, "stores");
    validateQuantity(orders, "orders");

    if (stores > 0 && users === 0) {
      throw createError(
        "INVALID_MOCK_QUANTITY",
        "Generar tiendas requiere al menos 1 usuario que actue como dueno"
      );
    }

    if (orders > 0 && (users === 0 || stores === 0)) {
      throw createError(
        "INVALID_MOCK_QUANTITY",
        "Generar pedidos requiere al menos 1 usuario y 1 tienda"
      );
    }

    const createdUsers = await usersRepository.insertMany(generateMockUsers(users));

    const owners = stores > 0
      ? await usersRepository.insertMany(
          generateMockUsers(stores, USER_ROLES.STORE)
        )
      : [];

    const createdStores = await storesRepository.insertMany(
      generateMockStores(stores, owners)
    );

    const mockOrders = Array.from({ length: orders }, () => {
      const customer = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const store = createdStores[Math.floor(Math.random() * createdStores.length)];
      return generateMockOrder(customer._id, store._id);
    });

    const createdOrders = await ordersRepository.insertMany(mockOrders);

    return {
      users: createdUsers.length,
      owners: owners.length,
      stores: createdStores.length,
      orders: createdOrders.length
    };
  }
};
