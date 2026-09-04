import { usersRepository } from "../repositories/users.repository.js";
import { createError } from "../utils/apiResponse.js";

export const usersService = {
  getUsers: async () => {
    return usersRepository.findAll();
  },

  getUserById: async (id) => {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw createError("USER_NOT_FOUND");
    }

    return user;
  },

  createUser: async (userData) => {
    const { firstName, lastName, email, password, role } = userData;
    if (!firstName || !lastName || !email || !password) {
      throw createError("VALIDATION_ERROR");
    }
    return usersRepository.create(userData);
  },

  updateUser: async (id, updates) => {
    const user = await usersRepository.update(id, updates);
    if (!user) {
      throw createError("USER_NOT_FOUND");
    }

    return user;
  },

  deleteUser: async (id) => {
    const user = await usersRepository.delete(id);
    if (!user) {
      throw createError("USER_NOT_FOUND");
    }

    return user;
  }
};