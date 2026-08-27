import { storesRepository } from "../repositories/stores.repository.js";

export const storesService = {
  getStores: async () => {
    return storesRepository.findAll();
  },

  getStoreById: async (id) => {
    const store = await storesRepository.findById(id);
    if (!store) {
      const error = new Error("Tienda no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return store;
  },

  createStore: async (storeData) => {
    const { name, address, owner } = storeData;

    if (!name || !address || !owner) {
      const error = new Error("Faltan datos obligatorios");
      error.statusCode = 400;
      throw error;
    }

    const user = await storesRepository.findOwnerById(owner);
    if (!user) {
      const error = new Error("Usuario owner no encontrado");
      error.statusCode = 404;
      throw error;
    }

    if (user.role !== "store") {
      const error = new Error("El owner de una tienda debe tener rol store");
      error.statusCode = 400;
      throw error;
    }

    return storesRepository.create(storeData);
  },

  updateStore: async (id, updates) => {
    const store = await storesRepository.update(id, updates);
    if (!store) {
      const error = new Error("Tienda no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return store;
  },

  deleteStore: async (id) => {
    const store = await storesRepository.delete(id);
    if (!store) {
      const error = new Error("Tienda no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return store;
  }
};