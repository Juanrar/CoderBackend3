import { Router } from "express";
import { getOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder, uploadUserDocument, uploadOrderProof } from "../controllers/orders.controller.js";
import {uploadProof} from '../middlewares/upload.middleware.js';

const router = Router();

router.get("/", getOrders);

router.get("/:oid", getOrderById);

router.post("/", createOrder);

router.put("/:oid/status", updateOrderStatus);

router.delete("/:oid", deleteOrder);

router.post('/:oid/proof', uploadProof.single('proof'), uploadOrderProof);

export default router;