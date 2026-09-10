import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, uploadUserDocument } from "../controllers/users.controller.js";
import {uploadDocument} from '../middlewares/upload.middleware.js';

const router = Router();

router.get("/", getUsers);

router.post("/", createUser);

router.get("/:uid", getUserById);

router.put("/:uid", updateUser);

router.delete("/:uid", deleteUser);

router.post('/:uid/documents', uploadDocument.single('document'), uploadUserDocument);


export default router;