import { ordersService } from "../services/orders.service.js";

export const getOrders = async (req, res) => {
  try {
    const orders = await ordersService.getOrders();
    res.json({ status: "success", payload: orders });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await ordersService.getOrderById(req.params.oid);
    res.json({ status: "success", payload: order });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const createOrder = async(req, res) => {
  try {
    const order = await ordersService.createOrder(req.body);
    res.status(201).json({ status: "success", payload: order });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateOrderStatus = async(req, res) => {
  try {
    const order = await ordersService.updateOrderStatus(req.params.oid, req.body.status);
    res.json({ status: "success", payload: order });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const deleteOrder = async(req, res) => {
  try {
    const order = await ordersService.deleteOrder(req.params.oid);
    res.json({ status: "success", payload: order });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};