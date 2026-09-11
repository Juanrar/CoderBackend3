import winston from 'winston';
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

const logger = winston.createLogger({
    levels: customLevels.levels,

    level: envConfig.logLevel,

    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) =>
            `${timestamp} [${level.toUpperCase()}] ${message}`
        )
    ),
    transports:[
        new winston.transports.Console(),
        new winston.transports.File({
            filename: './logs/error.log',
            level: customLevels.levels.error,
            maxsize: 5 * 1024 * 1024, 
            maxFiles: 5,
            tailable: true
        })
    ]

})

export default logger