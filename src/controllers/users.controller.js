import { usersService } from "../services/users.service.js";
import { successResponse } from "../utils/apiResponse.js";
import fs from 'fs';

export const getUsers = async (req, res, next) => {
  try {
    const { payload, pagination } = await usersService.getUsers(req.query);
    successResponse(res, { message: "Lista de usuarios obtenido", payload, pagination });
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

export const uploadUserDocument = async (req, res, next) => {
  try {
    const { uid } = req.params
    const file = req.file
    const { type } = req.body
    const user = await usersService.addDocument(uid, file, type)
    successResponse(res, { message: "Documento subido correctamente", payload: user });
  }catch (error) {
    if (req.file && req.file.path) {
      await fs.promises.unlink(req.file.path)
    }
    
    next(error);
  }
}