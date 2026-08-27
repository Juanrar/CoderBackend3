import { usersService } from "../services/users.service.js";

export const getUsers = async (req, res) => {
  try {
    const users = await usersService.getUsers();
    res.json({ status: "success", payload: users });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.uid);
    res.json({ status: "success", payload: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await usersService.createUser(req.body);
    res.status(201).json({ status: "success", payload: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await usersService.updateUser(req.params.uid, req.body);
    res.json({ status: "success", payload: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await usersService.deleteUser(req.params.uid);
    res.json({ status: "success", payload: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};