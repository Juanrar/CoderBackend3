import { mocksService } from "../services/mocks.service.js";
import { successResponse } from "../utils/apiResponse.js";

export const getMockUsers = (req, res, next) => {
  try {
    const users = mocksService.getMockUsers();
    successResponse(res, { message: "Usuarios simulados generados", payload: users });
  } catch (error) {
    next(error);
  }
};

export const getMockOrders = (req, res, next) => {
  try {
    const orders = mocksService.getMockOrders();
    successResponse(res, { message: "Pedidos simulados generados", payload: orders });
  } catch (error) {
    next(error);
  }
};

export const createMockUsers = (req, res, next) => {
  try {
    const users = mocksService.getMockUsers(req.body.users);
    successResponse(res, {
      statusCode: 201,
      message: "Usuarios simulados generados",
      payload: users
    });
  } catch (error) {
    next(error);
  }
};

export const createMockOrders = (req, res, next) => {
  try {
    const orders = mocksService.getMockOrders(req.body.orders);
    successResponse(res, {
      statusCode: 201,
      message: "Pedidos simulados generados",
      payload: orders
    });
  } catch (error) {
    next(error);
  }
};

export const generateData = async (req, res, next) => {
  try {
    const resumen = await mocksService.generateData(req.body);
    successResponse(res, {
      statusCode: 201,
      message: "Datos de prueba generados e insertados en la base",
      payload: resumen
    });
  } catch (error) {
    next(error);
  }
};
