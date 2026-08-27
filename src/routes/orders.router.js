import { Router } from "express";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import StoreModel from "../models/store.model.js";
import { getOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } from "../controllers/orders.controller.js";

const router = Router();

router.get("/", getOrders);

router.get("/:oid", getOrderById);

router.post("/", createOrder);

router.put("/:oid/status", updateOrderStatus);

router.delete("/:oid", deleteOrder);

export default router;