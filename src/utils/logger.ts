/**
 * Centralized Logging System for VIT-Verse
 * Provides structured logging with levels, timestamps, and context
 */

import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`;
  }
  
  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  
  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { service: 'vit-verse-backend' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      ),
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File transport for combined logs
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// Add daily rotate file transport for production
if (process.env.NODE_ENV === 'production') {
  // You can add winston-daily-rotate-file here for production
  logger.add(new winston.transports.File({
    filename: path.join('logs', 'production.log'),
    maxsize: 10485760, // 10MB
    maxFiles: 30,
  }));
}

// Helper functions for structured logging
export const log = {
  info: (message: string, meta?: any) => logger.info(message, meta),
  error: (message: string, error?: Error | any, meta?: any) => {
    if (error instanceof Error) {
      logger.error(message, { error: error.message, stack: error.stack, ...meta });
    } else {
      logger.error(message, { error, ...meta });
    }
  },
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta),
};

// Export logger for advanced usage
export default logger;
