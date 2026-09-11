import winston from 'winston';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { envConfig } from "./env.js";

const customLevels = {
    levels:{
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: "red",
        error: "magenta",
        warning: "yellow",
        info: "blue",
        http: "green",
        debug: "white"
    }
}

winston.addColors(customLevels.colors);

const logsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../logs");
fs.mkdirSync(logsDir, { recursive: true });

const baseFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) =>
        `${timestamp} [${level.toUpperCase()}] ${message}`
    )
);

const fileOptions = {
    maxsize: 5 * 1024 * 1024,
    maxFiles: 5,
    tailable: true
};

const transports = [
    new winston.transports.File({
        filename: path.join(logsDir, "error.log"),
        level: "error",
        ...fileOptions
    }),
    new winston.transports.File({
        filename: path.join(logsDir, "combined.log"),
        ...fileOptions
    })
];

if (envConfig.nodeEnv === "development") {
    transports.push(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                baseFormat
            )
        })
    );
}

const logger = winston.createLogger({
    levels: customLevels.levels,
    level: envConfig.logLevel,
    format: baseFormat,
    transports
})

export default logger
