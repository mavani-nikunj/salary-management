export const countrySchemas = {
  Country: {
    type: "object",
    properties: {
      _id: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7d1" },
      name: { type: "string", example: "United States" },
      code: { type: "string", example: "US" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateCountryInput: {
    type: "object",
    required: ["name", "code"],
    properties: {
      name: { type: "string", example: "United States" },
      code: { type: "string", example: "US" },
    },
  },
};
