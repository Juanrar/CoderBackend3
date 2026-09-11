import { ordersService } from "../services/orders.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { removeUploadedFile } from "../utils/fileCleanup.js";

export const getOrders = async (req, res, next) => {
  try {
    const { payload, pagination } = await ordersService.getOrders(req.query);
    successResponse(res, { message: "Lista de pedidos obtenida", payload, pagination });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await ordersService.getOrderById(req.params.oid);
    successResponse(res, { message: "Pedido obtenido por id", payload: order });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async(req, res, next) => {
  try {
    const order = await ordersService.createOrder(req.body);
    successResponse(res, {statusCode:201, message: "Pedido creado", payload: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async(req, res, next) => {
  try {
    const order = await ordersService.updateOrderStatus(req.params.oid, req.body.status);
    successResponse(res, { message: "Estado del pedido actualizado", payload: order });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async(req, res, next) => {
  try {
    const order = await ordersService.deleteOrder(req.params.oid);
    successResponse(res, { message: "Pedido eliminado", payload: order });
  } catch (error) {
    next(error);
  }
};

export const uploadOrderProof = async (req, res, next) => {
  try {
    const { oid } = req.params;
    const file = req.file;

    const updatedOrder = await ordersService.addProof(oid, file);

    successResponse(res, { message: "Comprobante subido correctamente", payload: updatedOrder });
  } catch (error) {
    await removeUploadedFile(req.file);
    next(error);
  }
}

