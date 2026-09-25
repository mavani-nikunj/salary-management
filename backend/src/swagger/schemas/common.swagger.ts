export const commonSchemas = {
  ApiResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation completed successfully" },
      data: { type: "object" },
    },
  },
  ApiErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Error message details" },
      error: { type: "object" },
    },
  },
};
