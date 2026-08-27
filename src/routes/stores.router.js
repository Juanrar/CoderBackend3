import { Router } from "express";
import StoreModel from "../models/store.model.js";
import { getStores, getStoreById, createStore, updateStore, deleteStore } from "../controllers/stores.controller.js";


const router = Router();

router.get("/", getStores);

router.get("/:sid", getStoreById);

router.post("/", createStore);

router.put("/:sid", updateStore);

router.delete("/:sid", deleteStore);

export default router;