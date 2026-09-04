import { storesService } from "../services/stores.service.js";
import { successResponse } from "../utils/apiResponse.js";

export const getStores = async (req, res, next) => {
  try {
    const stores = await storesService.getStores();

    successResponse(res, { message: "Lista de tiendas obtenida", payload: stores });
  } catch (error) {
    next(error);
    }
};

export const getStoreById = async (req, res, next) => {
  try {
    const store = await storesService.getStoreById(req.params.sid);
    successResponse(res, { message: "Tienda obtenida por id", payload: store });
  } catch (error) {
    next(error);
  }
};

export const createStore = async (req, res, next) => {
  try {
    const store = await storesService.createStore(req.body);
    successResponse(res, {statusCode:201, message: "Tienda creada", payload: store });
  } catch (error) {
    next(error);
  }
};

export const updateStore = async (req, res, next) => {
  try {
    const store = await storesService.updateStore(req.params.sid, req.body);
    successResponse(res, { message: "Tienda modificada", payload: store });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (req, res, next) => {
  try {
    const store = await storesService.deleteStore(req.params.sid);
    successResponse(res, { message: "Tienda eliminada", payload: store });
  } catch (error) {
    next(error);
  }
};