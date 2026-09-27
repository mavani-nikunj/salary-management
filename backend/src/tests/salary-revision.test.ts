/**
 * Salary Revision & Historical Progression Domain Unit Tests
 * Follows the Arrange-Act-Assert (AAA) pattern.
 */

describe("Salary Revision Domain Logic", () => {
  interface SalaryRevision {
    id: string;
    employeeId: string;
    effectiveDate: string; // YYYY-MM-DD
    baseSalary: number;
    paySalary: number;
    remark?: string;
  }

  // Domain logic: Resolve active salary as of a given target date
  const resolveEffectiveSalary = (
    revisions: SalaryRevision[],
    asOfDate: string = new Date().toISOString().split("T")[0]
  ): SalaryRevision | null => {
    const applicable = revisions
      .filter((r) => r.effectiveDate <= asOfDate)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());

    return applicable.length > 0 ? applicable[0] : null;
  };

  // Domain logic: Calculate hike percentage between revisions
  const calculateHikePercentage = (previousSalary: number, newSalary: number): number => {
    if (previousSalary <= 0) return 0;
    const hike = ((newSalary - previousSalary) / previousSalary) * 100;
    return Math.round(hike * 100) / 100;
  };

  // Domain logic: Check for duplicate effective dates for the same employee
  const validateRevisionUniqueness = (
    existing: SalaryRevision[],
    newRevision: Omit<SalaryRevision, "id">
  ): { valid: boolean; error?: string } => {
    const exists = existing.some(
      (r) => r.employeeId === newRevision.employeeId && r.effectiveDate === newRevision.effectiveDate
    );
    if (exists) {
      return {
        valid: false,
        error: `Revision already exists for employee ${newRevision.employeeId} on ${newRevision.effectiveDate}`,
      };
    }
    return { valid: true };
  };

  describe("resolveEffectiveSalary()", () => {
    it("should resolve the latest revision when all revisions are in the past (AAA)", () => {
      // Arrange
      const revisions: SalaryRevision[] = [
        { id: "1", employeeId: "EMP-001", effectiveDate: "2023-01-01", baseSalary: 60000, paySalary: 60000 },
        { id: "2", employeeId: "EMP-001", effectiveDate: "2024-01-01", baseSalary: 75000, paySalary: 75000 },
        { id: "3", employeeId: "EMP-001", effectiveDate: "2024-07-01", baseSalary: 85000, paySalary: 85000 },
      ];

      // Act
      const current = resolveEffectiveSalary(revisions, "2024-10-01");

      // Assert
      expect(current).not.toBeNull();
      expect(current?.id).toBe("3");
      expect(current?.paySalary).toBe(85000);
    });

    it("should ignore future scheduled revisions when resolving current active salary (AAA)", () => {
      // Arrange
      const revisions: SalaryRevision[] = [
        { id: "1", employeeId: "EMP-001", effectiveDate: "2023-01-01", baseSalary: 60000, paySalary: 60000 },
        { id: "2", employeeId: "EMP-001", effectiveDate: "2024-01-01", baseSalary: 75000, paySalary: 75000 },
        { id: "3", employeeId: "EMP-001", effectiveDate: "2025-01-01", baseSalary: 100000, paySalary: 100000 }, // Future
      ];

      // Act
      const current = resolveEffectiveSalary(revisions, "2024-06-15");

      // Assert
      expect(current?.id).toBe("2");
      expect(current?.paySalary).toBe(75000);
    });

    it("should return null if all revisions are scheduled in the future relative to query date (AAA)", () => {
      // Arrange
      const revisions: SalaryRevision[] = [
        { id: "1", employeeId: "EMP-001", effectiveDate: "2025-01-01", baseSalary: 90000, paySalary: 90000 },
      ];

      // Act
      const current = resolveEffectiveSalary(revisions, "2024-01-01");

      // Assert
      expect(current).toBeNull();
    });
  });

  describe("calculateHikePercentage()", () => {
    it("should calculate positive increment percentage accurately (AAA)", () => {
      // Arrange
      const oldPay = 80000;
      const newPay = 100000;

      // Act
      const hike = calculateHikePercentage(oldPay, newPay);

      // Assert
      expect(hike).toBe(25.0); // 25% hike
    });

    it("should handle fractional hike percentages rounded to 2 decimals (AAA)", () => {
      // Arrange
      const oldPay = 75000;
      const newPay = 82500;

      // Act
      const hike = calculateHikePercentage(oldPay, newPay);

      // Assert
      expect(hike).toBe(10.0);
    });

    it("should return 0 when previous salary is zero or negative (AAA)", () => {
      // Arrange & Act & Assert
      expect(calculateHikePercentage(0, 50000)).toBe(0);
      expect(calculateHikePercentage(-1000, 50000)).toBe(0);
    });
  });

  describe("validateRevisionUniqueness()", () => {
    it("should reject revision when employee already has an entry on the same date (AAA)", () => {
      // Arrange
      const existing: SalaryRevision[] = [
        { id: "1", employeeId: "EMP-100", effectiveDate: "2024-01-01", baseSalary: 70000, paySalary: 70000 },
      ];
      const duplicateProposal = {
        employeeId: "EMP-100",
        effectiveDate: "2024-01-01",
        baseSalary: 75000,
        paySalary: 75000,
      };

      // Act
      const result = validateRevisionUniqueness(existing, duplicateProposal);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Revision already exists");
    });

    it("should accept revisions for different effective dates for the same employee (AAA)", () => {
      // Arrange
      const existing: SalaryRevision[] = [
        { id: "1", employeeId: "EMP-100", effectiveDate: "2024-01-01", baseSalary: 70000, paySalary: 70000 },
      ];
      const newProposal = {
        employeeId: "EMP-100",
        effectiveDate: "2024-07-01",
        baseSalary: 75000,
        paySalary: 75000,
      };

      // Act
      const result = validateRevisionUniqueness(existing, newProposal);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
