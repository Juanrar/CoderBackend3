import { storesService } from "../services/stores.service.js";

export const getStores = async (req, res, next) => {
  try {
    const stores = await storesService.getStores();

    res.json({ status: "success", payload: stores });
  } catch (error) {
    next(error);
    }
};

export const getStoreById = async (req, res, next) => {
  try {
    const store = await storesService.getStoreById(req.params.sid);
    res.json({ status: "success", payload: store });
  } catch (error) {
    next(error);
  }
};

export const createStore = async (req, res, next) => {
  try {
    const store = await storesService.createStore(req.body);
    res.status(201).json({ status: "success", payload: store });
  } catch (error) {
    next(error);
  }
};

export const updateStore = async (req, res, next) => {
  try {
    const store = await storesService.updateStore(req.params.sid, req.body);
    res.json({ status: "success", payload: store });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (req, res, next) => {
  try {
    const store = await storesService.deleteStore(req.params.sid);
    res.json({ status: "success", payload: store });
  } catch (error) {
    next(error);
  }
};