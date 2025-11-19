const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Definir niveles de log
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Definir colores para cada nivel
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Formato de log
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Formato para consola (más legible)
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Transports
const transports = [
    // Console
    new winston.transports.Console({
        format: consoleFormat,
    }),

    // Error logs - archivo rotativo
    new winston.transports.DailyRotateFile({
        filename: path.join('logs', 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '30d',
        maxSize: '20m',
        format,
    }),

    // Combined logs - archivo rotativo
    new winston.transports.DailyRotateFile({
        filename: path.join('logs', 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d',
        maxSize: '20m',
        format,
    }),
];

// Crear logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    levels,
    format,
    transports,
    exitOnError: false,
});

// Stream para Morgan (HTTP logging)
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

module.exports = logger;
