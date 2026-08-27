import { usersRepository } from "../repositories/users.repository.js";

export const usersService = {
  getUsers: async () => {
    return usersRepository.findAll();
  },

  getUserById: async (id) => {
    const user = await usersRepository.findById(id);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return user;
  },

  createUser: async (userData) => {
    const { firstName, lastName, email, password, role } = userData;
    if (!firstName || !lastName || !email || !password) {
      const error = new Error("Faltan datos obligatorios");
      error.statusCode = 400;
      throw error;
    }

    //falta validar si role contiene un valor valido

    return usersRepository.create(userData);
  },

  updateUser: async (id, updates) => {
    const user = await usersRepository.update(id, updates);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return user;
  },

  deleteUser: async (id) => {
    const user = await usersRepository.delete(id);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
};