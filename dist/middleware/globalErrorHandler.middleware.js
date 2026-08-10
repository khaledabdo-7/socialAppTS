"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    console.log(err);
    res.status(statusCode).json({
        message: message,
    });
};
exports.globalErrorHandler = globalErrorHandler;
