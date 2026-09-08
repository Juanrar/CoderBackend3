import { Router } from "express";
import UserModel from "../models/user.model.js";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/users.controller.js";

const router = Router();

router.get("/", getUsers);

router.post("/", createUser);

router.get("/:uid", getUserById);

router.put("/:uid", updateUser);

router.delete("/:uid", deleteUser);

export default router;