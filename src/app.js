import express from "express";
import { corsMiddleware } from "./config/cors.js";
import usersRouter from "./routes/users.router.js";
import storesRouter from "./routes/stores.router.js";
import ordersRouter from "./routes/orders.router.js";
import mocksRouter from "./routes/mocks.router.js";
import loggerRouter from "./routes/logger.router.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { addLogger } from "./middlewares/logger.middleware.js";
import { envConfig } from "./config/env.js";
import mongoose from "mongoose";
import { successResponse } from "./utils/apiResponse.js";


import { swaggerSpec } from "./docs/swagger.config.js";
import swaggerUiExpress from "swagger-ui-express";


const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(addLogger);

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ShipNow API"
  });
});

app.get("/health", (req, res) => {
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  successResponse(res, {
    message: "API funcionando",
    payload: {
      status: "ok",
      environment: envConfig.nodeEnv,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: dbStates[mongoose.connection.readyState] ?? "unknown"
    }
  });
});

app.use("/api/users", usersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/orders", ordersRouter);

app.use("/api/loggerTest", loggerRouter);

if (envConfig.enableMocks) {
  app.use("/api/mocks", mocksRouter);
}

app.use("/api/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec));


app.use(notFoundHandler);
app.use(errorHandler);

export default app;
