import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.router.js";
import storesRouter from "./routes/stores.router.js";
import ordersRouter from "./routes/orders.router.js";
import mocksRouter from "./routes/mocks.router.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { addLogger } from "./middlewares/logger.middleware.js";
import { envConfig } from "./config/env.js";

import { swaggerSpec } from "./docs/swagger.config.js";
import swaggerUiExpress from "swagger-ui-express";


const app = express();

app.use(cors());
app.use(express.json());
app.use(addLogger);

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ShipNow API"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "API funcionando"
  });
});

app.use("/api/users", usersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/orders", ordersRouter);


if (!envConfig.isProd){
  app.use("/api/mocks", mocksRouter);
  app.use("/api/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec));
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
