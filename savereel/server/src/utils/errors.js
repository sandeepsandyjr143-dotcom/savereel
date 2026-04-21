'use strict';

/**
 * Custom operational error hierarchy.
 * All errors that extend AppError are treated as "expected" and
 * serialised cleanly to the client. Unexpected errors hit the 500 fallback.
 */

class AppError extends Error {
  /**
   * @param {string} message   - User-facing error message
   * @param {number} statusCode
   * @param {string} code      - Machine-readable error code
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name       = this.constructor.name;
    this.statusCode = statusCode;
    this.code       = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Invalid request.') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class UnsupportedError extends AppError {
  constructor(message = 'This URL or content type is not supported.') {
    super(message, 422, 'UNSUPPORTED_URL');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found.') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ProviderError extends AppError {
  constructor(message = 'Provider request failed.', code = 'PROVIDER_ERROR') {
    super(message, 502, code);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnsupportedError,
  NotFoundError,
  ProviderError,
  RateLimitError,
};
