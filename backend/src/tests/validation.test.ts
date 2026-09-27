/**
 * Validation Rules Domain Unit Tests
 * Follows the Arrange-Act-Assert (AAA) pattern.
 */

describe("Validation Rules Domain Logic", () => {
  // Domain validation helpers
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidEmployeeCode = (code: string): boolean => {
    // Expected format: EMP- followed by 3 or more alphanumeric characters
    const codeRegex = /^EMP-[A-Za-z0-9]{3,}$/;
    return codeRegex.test(code);
  };

  const validateSalaryCreation = (payload: {
    salary: number;
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
    hireDate: string;
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!payload.firstName?.trim()) errors.push("First name is required");
    if (!payload.lastName?.trim()) errors.push("Last name is required");
    if (!isValidEmail(payload.email)) errors.push("Invalid email address format");
    if (!isValidEmployeeCode(payload.employeeCode)) errors.push("Invalid employee code format");
    if (typeof payload.salary !== "number" || isNaN(payload.salary) || payload.salary <= 0) {
      errors.push("Salary must be a positive number");
    }
    if (!payload.hireDate || isNaN(Date.parse(payload.hireDate))) {
      errors.push("Valid hire date is required");
    }

    return { isValid: errors.length === 0, errors };
  };

  describe("isValidEmail()", () => {
    it("should accept valid standard and yopmail email formats (AAA)", () => {
      // Arrange & Act & Assert
      expect(isValidEmail("hr.manager@acme.com")).toBe(true);
      expect(isValidEmail("employee.123@yopmail.com")).toBe(true);
    });

    it("should reject malformed email strings missing @ or domain (AAA)", () => {
      // Arrange & Act & Assert
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("test@domain")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("isValidEmployeeCode()", () => {
    it("should accept EMP- prefixes with alphanumeric identifiers (AAA)", () => {
      // Arrange & Act & Assert
      expect(isValidEmployeeCode("EMP-001")).toBe(true);
      expect(isValidEmployeeCode("EMP-ACME1024")).toBe(true);
    });

    it("should reject codes without EMP- prefix or too short (AAA)", () => {
      // Arrange & Act & Assert
      expect(isValidEmployeeCode("001")).toBe(false);
      expect(isValidEmployeeCode("EMP-")).toBe(false);
      expect(isValidEmployeeCode("STAFF-001")).toBe(false);
    });
  });

  describe("validateSalaryCreation()", () => {
    it("should pass validation with fully compliant employee payload (AAA)", () => {
      // Arrange
      const validPayload = {
        firstName: "Sarah",
        lastName: "Connor",
        email: "s.connor@yopmail.com",
        employeeCode: "EMP-900",
        salary: 85000,
        hireDate: "2024-01-15",
      };

      // Act
      const result = validateSalaryCreation(validPayload);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should collect all errors when multiple fields fail validation (AAA)", () => {
      // Arrange
      const invalidPayload = {
        firstName: "",
        lastName: "   ",
        email: "bad-email",
        employeeCode: "INVALID",
        salary: -500,
        hireDate: "invalid-date",
      };

      // Act
      const result = validateSalaryCreation(invalidPayload);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("First name is required");
      expect(result.errors).toContain("Last name is required");
      expect(result.errors).toContain("Invalid email address format");
      expect(result.errors).toContain("Invalid employee code format");
      expect(result.errors).toContain("Salary must be a positive number");
      expect(result.errors).toContain("Valid hire date is required");
    });
  });
});
