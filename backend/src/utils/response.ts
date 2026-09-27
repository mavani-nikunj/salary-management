import { Response } from "express";

/**
 * Standardized API Response Helper
 * @param res Express Response object
 * @param code HTTP Status Code
 * @param message Human-readable message
 * @param data Response payload (optional)
 */
export const sendResponse = (
  res: Response,
  code: number,
  message: string,
  data: any = null,
) => {
  return res.status(code).json({
    success: code >= 200 && code < 300,
    data,
    code,
    message,
  });
};
