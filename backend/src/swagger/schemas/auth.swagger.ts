export const authSchemas = {
  LoginInput: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "nickdev@yopmail.com",
      },
      password: {
        type: "string",
        format: "password",
        example: "Admin@123",
      },
    },
  },
  RegisterOrgInput: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: {
        type: "string",
        example: "ACME Corp",
      },
      email: {
        type: "string",
        format: "email",
        example: "contact@acme.com",
      },
      password: {
        type: "string",
        format: "password",
        example: "SecretPassword123!",
      },
    },
  },
  RegisterHRInput: {
    type: "object",
    required: [
      "employeeCode",
      "firstName",
      "lastName",
      "email",
      "password",
      "orgId",
    ],
    properties: {
      employeeCode: { type: "string", example: "HR_002" },
      firstName: { type: "string", example: "Sarah" },
      lastName: { type: "string", example: "Connor" },
      email: {
        type: "string",
        format: "email",
        example: "sarah.hr@acme.com",
      },
      password: {
        type: "string",
        format: "password",
        example: "SecurePass123!",
      },
      jobTitle: { type: "string", example: "Senior HR Specialist" },
      departmentId: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7f1" },
      countryId: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7d1" },
      currencyId: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7e1" },
      salary: { type: "number", example: 95000 },
      hireDate: { type: "string", format: "date", example: "2024-01-15" },
      employmentType: {
        type: "string",
        enum: ["Full-time", "Part-time", "Contract"],
        example: "Full-time",
      },
      orgId: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7c8" },
    },
  },
  ForgotPasswordInput: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "nickdev@yopmail.com",
      },
    },
  },
  ResetPasswordInput: {
    type: "object",
    required: ["token", "newPassword"],
    properties: {
      token: {
        type: "string",
        example: "c7f99846b0a1d48b8c2d1e0f...",
      },
      newPassword: {
        type: "string",
        format: "password",
        minLength: 6,
        example: "NewSecurePassword123!",
      },
    },
  },
  ChangePasswordInput: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    properties: {
      currentPassword: {
        type: "string",
        format: "password",
        example: "OldPassword123!",
      },
      newPassword: {
        type: "string",
        format: "password",
        minLength: 6,
        example: "NewPassword123!",
      },
    },
  },
};

export default authSchemas;
