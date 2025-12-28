import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        // Write all logs with level 'info' and below to 'access.log'
        new winston.transports.File({ filename: path.join(logsDir, 'access.log') }),
        // Write all logs with level 'error' and below to 'error.log'
        new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
        // Also log to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

/**
 * Middleware to log request details and response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    // Listener for when the response is sent
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
        const { method, originalUrl, ip } = req;
        const { statusCode } = res;

        const logMessage = `${method} ${originalUrl} ${statusCode} - ${timeInMs}ms (IP: ${ip})`;

        if (statusCode >= 400) {
            logger.error(logMessage);
        } else {
            logger.info(logMessage);
        }
    });

    next();
};

export default logger;
