import { storesService } from "../services/stores.service.js";

export const getStores = async (req, res) => {
  try {
    const stores = await storesService.getStores();

    res.json({ status: "success", payload: stores });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getStoreById = async (req, res) => {
  try {
    const store = await storesService.getStoreById(req.params.sid);
    res.json({ status: "success", payload: store });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const createStore = async (req, res) => {
  try {
    const store = await storesService.createStore(req.body);
    res.status(201).json({ status: "success", payload: store });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateStore = async (req, res) => {
  try {
    const store = await storesService.updateStore(req.params.sid, req.body);
    res.json({ status: "success", payload: store });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const deleteStore = async (req, res) => {
  try {
    const store = await storesService.deleteStore(req.params.sid);
    res.json({ status: "success", payload: store });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};