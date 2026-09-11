import fs from "node:fs/promises";
import logger from "../config/logger.js";

export const removeUploadedFile = async (file) => {
  if (!file?.path) return;

  try {
    await fs.unlink(file.path);
  } catch (error) {
    logger.warning(`No se pudo eliminar el archivo huerfano '${file.path}': ${error.message}`);
  }
};
