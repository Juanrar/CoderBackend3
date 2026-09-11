import dotenv from "dotenv";

dotenv.config();

const REQUIRED_VARS = ["MONGODB_URI", "NODE_ENV"];

const VALID_ENVIRONMENTS = ["development", "test", "production"];
const VALID_LOG_LEVELS = ["fatal", "error", "warning", "info", "http", "debug"];

const DEFAULT_LOG_LEVEL_BY_ENV = {
  production: "info",
  test: "error",
  development: "debug"
};

const errors = [];

const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
if (missing.length) {
  errors.push(`Faltan variables de entorno obligatorias: ${missing.join(", ")}`);
}

const nodeEnv = process.env.NODE_ENV;
if (nodeEnv && !VALID_ENVIRONMENTS.includes(nodeEnv)) {
  errors.push(
    `NODE_ENV='${nodeEnv}' no es valido. Valores permitidos: ${VALID_ENVIRONMENTS.join(", ")}`
  );
}

const port = Number(process.env.PORT ?? 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  errors.push(`PORT='${process.env.PORT}' debe ser un numero entero entre 1 y 65535`);
}

const logLevel = process.env.LOG_LEVEL || DEFAULT_LOG_LEVEL_BY_ENV[nodeEnv] || "debug";
if (!VALID_LOG_LEVELS.includes(logLevel)) {
  errors.push(
    `LOG_LEVEL='${logLevel}' no es valido. Valores permitidos: ${VALID_LOG_LEVELS.join(", ")}`
  );
}

const parseBoolean = (rawValue, fallback) => {
  if (rawValue === undefined || rawValue === "") return fallback;
  if (rawValue === "true") return true;
  if (rawValue === "false") return false;

  errors.push(`ENABLE_MOCKS='${rawValue}' no es valido. Valores permitidos: true, false`);
  return fallback;
};

const enableMocks = parseBoolean(process.env.ENABLE_MOCKS, nodeEnv !== "production");

if (errors.length) {
  console.error("\n[CONFIG] La aplicacion no puede iniciar por errores de configuracion:");
  errors.forEach((error) => console.error(`  - ${error}`));
  console.error("\nRevisa tu archivo .env tomando como referencia .env.example\n");
  process.exit(1);
}

export const envConfig = {
  port,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv,
  logLevel,
  isProd: nodeEnv === "production",
  isTest: nodeEnv === "test",
  enableMocks,
  
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
};
