class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    const statusCode = err.statusCode || 500;

    console.error('Error:', {
        message: err.message,
        statusCode,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(statusCode).json({
        success: false,
        error: error.message || 'Server Error',...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { AppError, errorHandler };