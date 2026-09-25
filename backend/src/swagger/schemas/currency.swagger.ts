export const currencySchemas = {
  Currency: {
    type: "object",
    properties: {
      _id: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7e1" },
      countryId: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7d1" },
      code: { type: "string", example: "USD" },
      name: { type: "string", example: "US Dollar" },
      exRate: { type: "number", minimum: 0.0001, example: 1.0 },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateCurrencyInput: {
    type: "object",
    required: ["countryId", "code", "name", "exRate"],
    properties: {
      countryId: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7d1" },
      code: { type: "string", example: "USD" },
      name: { type: "string", example: "US Dollar" },
      exRate: { type: "number", minimum: 0.0001, example: 1.0 },
    },
  },
};
