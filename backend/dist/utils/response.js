"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
/**
 * Standardized API Response Helper
 * @param res Express Response object
 * @param code HTTP Status Code
 * @param message Human-readable message
 * @param data Response payload (optional)
 */
const sendResponse = (res, code, message, data = null) => {
    return res.status(code).json({
        data,
        code,
        message,
    });
};
exports.sendResponse = sendResponse;
