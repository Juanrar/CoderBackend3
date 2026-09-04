import { usersService } from "../services/users.service.js";
import { successResponse } from "../utils/apiResponse.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await usersService.getUsers();
    successResponse(res, { message: "Lista de usuarios obtenido", payload: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.uid);
    successResponse(res, { message: "Usuario obtenido por id", payload: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await usersService.createUser(req.body);
    successResponse(res, {statusCode:201, message: "Usuario creado", payload: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await usersService.updateUser(req.params.uid, req.body);
    successResponse(res, { message: "Usuario modificado", payload: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await usersService.deleteUser(req.params.uid);
    successResponse(res, { message: "Usuario eliminado", payload: user });
  } catch (error) {
    next(error);
  }
};