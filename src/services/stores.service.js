import { storesRepository } from "../repositories/stores.repository.js";
import { createError } from "../utils/apiResponse.js";
import { buildPaginationOptions, formatPaginated } from "../utils/pagination.js";

export const storesService = {
  getStores: async (query = {}) => {
    const { isActive, owner } = query;
    const filter = {};

    if (isActive !== undefined) {
      if (!["true", "false"].includes(isActive)) {
        throw createError("VALIDATION_ERROR", "El parámetro 'isActive' debe ser true o false");
      }
      filter.isActive = isActive === "true";
    }

    if (owner) filter.owner = owner;

    const options = buildPaginationOptions(query, {
      allowedSortFields: ["createdAt", "updatedAt", "name", "isActive"]
    });

    return formatPaginated(await storesRepository.findAll(filter, options));
  },

  getStoreById: async (id) => {
    const store = await storesRepository.findById(id);
    if (!store) {
      throw createError("STORE_NOT_FOUND");
    }

    return store;
  },

  createStore: async (storeData) => {
    const { name, address, owner } = storeData;

    if (!name || !address || !owner) {
      throw createError("VALIDATION_ERROR");
    }

    const user = await storesRepository.findOwnerById(owner);
    if (!user) {
      throw createError("USER_NOT_FOUND");
    }

    if (user.role !== "store") {
      throw createError("USER_NOT_STORE_ROLE");
    }

    return storesRepository.create(storeData);
  },

  updateStore: async (id, updates) => {
    const store = await storesRepository.update(id, updates);
    if (!store) {
      throw createError("STORE_NOT_FOUND");
    }

    return store;
  },

  deleteStore: async (id) => {
    const store = await storesRepository.delete(id);
    if (!store) {
      throw createError("STORE_NOT_FOUND");
    }

    return store;
  }
};