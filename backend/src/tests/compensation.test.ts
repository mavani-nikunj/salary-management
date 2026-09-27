describe("Compensation & Currency Conversion Logic", () => {
  // Utility conversion function matching backend report aggregation
  const normalizeToINR = (amount: number, exRate: number): number => {
    const rate = exRate > 0 ? exRate : 1;
    return Math.round((amount / rate) * 100) / 100;
  };

  const convertINRToUSD = (inrAmount: number, usdExRate: number): number => {
    return Math.round(inrAmount * usdExRate * 100) / 100;
  };

  it("should accurately convert foreign currencies to INR using exchange rates", () => {
    // 1 EUR = ~0.0108 INR -> 1000 EUR should equal ~92,592.59 INR
    const eurSalary = 1000;
    const eurExRate = 0.0108;
    const inrValue = normalizeToINR(eurSalary, eurExRate);
    expect(inrValue).toBe(92592.59);
  });

  it("should handle 1:1 INR exchange rate without modification", () => {
    const inrSalary = 50000;
    const inrExRate = 1.0;
    const result = normalizeToINR(inrSalary, inrExRate);
    expect(result).toBe(50000);
  });

  it("should gracefully handle zero or negative exchange rates with fallback to 1", () => {
    const salary = 75000;
    expect(normalizeToINR(salary, 0)).toBe(75000);
    expect(normalizeToINR(salary, -0.5)).toBe(75000);
  });

  it("should accurately convert aggregated INR payroll to USD", () => {
    const totalINR = 83000000; // 8.3 Crore INR
    const usdExRate = 0.012;  // ~1 USD = 83.33 INR
    const usdValue = convertINRToUSD(totalINR, usdExRate);
    expect(usdValue).toBe(996000);
  });

  it("should round floating point values to 2 decimal places deterministically", () => {
    const salary = 100000;
    const rate = 0.0113333333333;
    const normalized = normalizeToINR(salary, rate);
    const decimals = normalized.toString().split(".")[1] || "";
    expect(decimals.length).toBeLessThanOrEqual(2);
  });
});
