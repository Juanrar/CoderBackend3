import winston from 'winston';

const customLevels = {
    levels:{
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    }
}

const logger = winston.createLogger({
    levels: customLevels.levels,

    level: process.env.NODE_ENV === "production" ? "info" : "debug",

    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports:[
        new winston.transports.Console(),
        new winston.transports.File({filename: './logs/test.conwinston.log'})
    ]

})

export default logger