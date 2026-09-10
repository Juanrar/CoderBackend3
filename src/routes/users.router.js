import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/users.controller.js";
import upload from '../middlewares/upload.middleware.js';
import { uploadUserDocument } from '../controllers/users.controller.js';

const router = Router();

router.get("/", getUsers);

router.post("/", createUser);

router.get("/:uid", getUserById);

router.put("/:uid", updateUser);

router.delete("/:uid", deleteUser);

router.post('/:uid/documents', upload.single('document'), uploadUserDocument);


export default router;