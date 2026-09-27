/**
 * State Transitions Domain Unit Tests
 * Follows the Arrange-Act-Assert (AAA) pattern.
 */

describe("Employee & Compensation State Transitions", () => {
  type EmployeeStatus = "Active" | "On Leave" | "Terminated";

  interface EmployeeState {
    id: string;
    status: EmployeeStatus;
    terminationDate?: string;
    salary: number;
  }

  // Domain state machine transitions
  const transitionEmployeeStatus = (
    current: EmployeeState,
    nextStatus: EmployeeStatus,
    effectiveDate?: string
  ): EmployeeState => {
    // Invariant: Terminated employees cannot transition to any status without executive reinstatement
    if (current.status === "Terminated") {
      throw new Error("Invalid State Transition: Terminated employees cannot change status directly.");
    }

    if (nextStatus === "Terminated") {
      return {
        ...current,
        status: "Terminated",
        terminationDate: effectiveDate || new Date().toISOString().split("T")[0],
      };
    }

    return {
      ...current,
      status: nextStatus,
    };
  };

  const applySalaryRevisionToEmployee = (
    employee: EmployeeState,
    newSalary: number
  ): EmployeeState => {
    // Invariant: Cannot adjust salary for terminated employees
    if (employee.status === "Terminated") {
      throw new Error("Business Rule Violation: Cannot revise compensation for a terminated employee.");
    }
    if (newSalary <= 0) {
      throw new Error("Business Rule Violation: Revised salary must be greater than zero.");
    }

    return {
      ...employee,
      salary: newSalary,
    };
  };

  describe("transitionEmployeeStatus()", () => {
    it("should allow transitioning from Active to On Leave (AAA)", () => {
      // Arrange
      const employee: EmployeeState = { id: "EMP-1", status: "Active", salary: 90000 };

      // Act
      const updated = transitionEmployeeStatus(employee, "On Leave");

      // Assert
      expect(updated.status).toBe("On Leave");
    });

    it("should allow transitioning from On Leave back to Active (AAA)", () => {
      // Arrange
      const employee: EmployeeState = { id: "EMP-1", status: "On Leave", salary: 90000 };

      // Act
      const updated = transitionEmployeeStatus(employee, "Active");

      // Assert
      expect(updated.status).toBe("Active");
    });

    it("should record termination date when transitioning to Terminated (AAA)", () => {
      // Arrange
      const employee: EmployeeState = { id: "EMP-1", status: "Active", salary: 90000 };

      // Act
      const updated = transitionEmployeeStatus(employee, "Terminated", "2024-12-31");

      // Assert
      expect(updated.status).toBe("Terminated");
      expect(updated.terminationDate).toBe("2024-12-31");
    });

    it("should prevent direct status transition once an employee is Terminated (AAA)", () => {
      // Arrange
      const employee: EmployeeState = {
        id: "EMP-1",
        status: "Terminated",
        terminationDate: "2024-12-31",
        salary: 90000,
      };

      // Act & Assert
      expect(() => transitionEmployeeStatus(employee, "Active")).toThrow(
        "Invalid State Transition: Terminated employees cannot change status directly."
      );
    });
  });

  describe("applySalaryRevisionToEmployee()", () => {
    it("should update salary when employee is Active (AAA)", () => {
      // Arrange
      const employee: EmployeeState = { id: "EMP-2", status: "Active", salary: 80000 };

      // Act
      const updated = applySalaryRevisionToEmployee(employee, 95000);

      // Assert
      expect(updated.salary).toBe(95000);
    });

    it("should reject salary revision for a Terminated employee (AAA)", () => {
      // Arrange
      const employee: EmployeeState = {
        id: "EMP-3",
        status: "Terminated",
        terminationDate: "2024-05-01",
        salary: 70000,
      };

      // Act & Assert
      expect(() => applySalaryRevisionToEmployee(employee, 85000)).toThrow(
        "Business Rule Violation: Cannot revise compensation for a terminated employee."
      );
    });
  });
});
