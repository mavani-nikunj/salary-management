export const organizationSchemas = {
  Organization: {
    type: "object",
    properties: {
      _id: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7c8" },
      name: { type: "string", example: "ACME Corporation" },
      email: { type: "string", format: "email", example: "admin@acme.com" },
      status: { type: "string", enum: ["Active", "Inactive"], example: "Active" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateOrganizationInput: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", example: "ACME Corporation" },
      email: { type: "string", format: "email", example: "admin@acme.com" },
      password: { type: "string", format: "password", example: "SecurePass123!" },
    },
  },
};
