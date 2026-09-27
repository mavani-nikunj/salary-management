import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import {
  Organization,
  Country,
  Currency,
  Department,
  Employee,
  Salary,
} from "../models";

const CURRENCY_CDN_URL =
  process.env.INR_CURRENCIES_CDN ||
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json";

/**
 * Resolves the path to a seed json file, checking cwd and __dirname
 */
const resolveSeedPath = (fileName: string): string => {
  const localSeedsDir = path.resolve(process.cwd(), "../seeds", fileName);
  if (fs.existsSync(localSeedsDir)) {
    return localSeedsDir;
  }
  const relativeDir = path.resolve(__dirname, "../../../seeds", fileName);
  if (fs.existsSync(relativeDir)) {
    return relativeDir;
  }
  return localSeedsDir;
};

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log("--------------------------------------------------");
    console.log("[Seeder] Starting database seeding process...");

    // ========================================================
    // 1. SEED COUNTRIES
    // ========================================================
    const countryJsonPath = resolveSeedPath("country.json");
    if (!fs.existsSync(countryJsonPath)) {
      console.warn(`[Seeder] country.json not found at ${countryJsonPath}`);
      return;
    }

    const rawCountryData = JSON.parse(
      fs.readFileSync(countryJsonPath, "utf-8"),
    );
    const countryCount = await Country.countDocuments();

    if (countryCount === 0) {
      console.log("[Seeder] Seeding countries from country.json...");
      const countryDocs = Object.entries(rawCountryData).map(
        ([codeKey, val]: [string, any]) => ({
          name: val.country_name,
          code: codeKey.toUpperCase(),
        }),
      );

      await Country.insertMany(countryDocs, { ordered: false });
      console.log(`[Seeder] Seeded ${countryDocs.length} countries.`);
    } else {
      console.log(`[Seeder] Countries already seeded (${countryCount} found).`);
    }

    // Build country map for fast foreign key resolution
    const allCountries = await Country.find({});
    const countryMap = new Map<string, any>(); // "US" -> Country doc
    for (const c of allCountries) {
      countryMap.set(c.code, c);
    }

    // ========================================================
    // 2. SEED CURRENCIES & FETCH FROM INR_CURRENCIES_CDN
    // ========================================================
    const currencyCount = await Currency.countDocuments();
    let rates: Record<string, number> = {};

    try {
      console.log(`[Seeder] Fetching rates from CDN: ${CURRENCY_CDN_URL}`);
      const res = await fetch(CURRENCY_CDN_URL);
      if (res.ok) {
        const cdnData: any = await res.json();
        rates = cdnData?.inr || {};
        console.log(
          `[Seeder] Fetched ${Object.keys(rates).length} exchange rates relative to INR.`,
        );
      } else {
        console.warn(
          `[Seeder] CDN responded with HTTP ${res.status}. Falling back to default rates.`,
        );
      }
    } catch (err: any) {
      console.warn(
        `[Seeder] Could not reach currency CDN (${err.message}). Using fallback rates.`,
      );
    }

    if (currencyCount === 0) {
      console.log("[Seeder] Seeding currencies linked to countries...");
      const currencyDocs = [];

      for (const [codeKey, val] of Object.entries(rawCountryData) as [
        string,
        any,
      ][]) {
        const countryCode = codeKey.toUpperCase();
        const country = countryMap.get(countryCode);
        if (!country || !val.currency_code) {
          continue;
        }

        const currCode = val.currency_code.toUpperCase();
        const rawRate = rates[val.currency_code.toLowerCase()];
        const validRate =
          typeof rawRate === "number" && !isNaN(rawRate) && rawRate >= 0.0001
            ? rawRate
            : 1.0;

        currencyDocs.push({
          countryId: country._id,
          code: currCode,
          name: val.currency_name || currCode,
          exRate: validRate,
        });
      }

      if (currencyDocs.length > 0) {
        await Currency.insertMany(currencyDocs, { ordered: false });
        console.log(`[Seeder] Seeded ${currencyDocs.length} currencies.`);
      }
    } else {
      console.log(
        `[Seeder] Currencies already seeded (${currencyCount} found).`,
      );
    }

    // Build currency lookup maps
    const allCurrencies = await Currency.find({});
    const currencyByCountryAndCode = new Map<string, any>(); // "DE_EUR" -> Currency doc
    const currencyByCode = new Map<string, any>(); // "EUR" -> Currency doc

    for (const curr of allCurrencies) {
      currencyByCode.set(curr.code, curr);
    }
    for (const [codeKey, val] of Object.entries(rawCountryData) as [
      string,
      any,
    ][]) {
      const country = countryMap.get(codeKey.toUpperCase());
      if (country && val.currency_code) {
        const curr = allCurrencies.find(
          (c) =>
            c.countryId.toString() === country._id.toString() &&
            c.code === val.currency_code.toUpperCase(),
        );
        if (curr) {
          currencyByCountryAndCode.set(
            `${codeKey.toUpperCase()}_${curr.code}`,
            curr,
          );
        }
      }
    }

    // ========================================================
    // 3. SEED DEFAULT ORGANIZATION
    // ========================================================
    const orgName = process.env.DEFAULT_ORG_NAME || "Nick Dev";
    const orgEmail = (
      process.env.DEFAULT_ORG_EMAIL || "nickdev@yopmail.com"
    ).toLowerCase();
    const orgPassword = process.env.DEFAULT_ORG_PASSWORD || "Admin@123";

    let organization = await Organization.findOne({ email: orgEmail });
    if (!organization) {
      console.log(
        `[Seeder] Creating default organization: ${orgName} (${orgEmail})...`,
      );
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(orgPassword, salt);

      organization = await Organization.create({
        name: orgName,
        email: orgEmail,
        passwordHash,
        status: "Active",
      });
      console.log(
        `[Seeder] Default organization created with ID: ${organization._id}`,
      );
    } else {
      console.log(
        `[Seeder] Default organization exists (${organization.name}).`,
      );
    }

    // ========================================================
    // 4. SEED DEPARTMENTS
    // ========================================================
    const employeesJsonPath = resolveSeedPath("employees.json");
    const departmentJsonPath = resolveSeedPath("department.json");

    const deptNameSet = new Set<string>();

    if (fs.existsSync(departmentJsonPath)) {
      try {
        const rawDept = JSON.parse(
          fs.readFileSync(departmentJsonPath, "utf-8"),
        );
        if (Array.isArray(rawDept)) {
          rawDept.forEach((d: string) => deptNameSet.add(d.trim()));
        }
      } catch (err: any) {
        console.warn(
          `[Seeder] Could not parse department.json: ${err.message}`,
        );
      }
    }

    let employeesData: any[] = [];
    if (fs.existsSync(employeesJsonPath)) {
      employeesData = JSON.parse(fs.readFileSync(employeesJsonPath, "utf-8"));
      employeesData.forEach((e: any) => {
        if (e.department) {
          deptNameSet.add(e.department.trim());
        }
      });
    }

    console.log(
      `[Seeder] Found ${deptNameSet.size} unique departments to ensure for org.`,
    );

    const existingDepts = await Department.find({ orgId: organization._id });
    const existingDeptNames = new Set(existingDepts.map((d) => d.name));
    const deptsToInsert = [];

    for (const name of deptNameSet) {
      if (!existingDeptNames.has(name)) {
        deptsToInsert.push({
          orgId: organization._id,
          name,
          status: "Active",
        });
      }
    }

    if (deptsToInsert.length > 0) {
      await Department.insertMany(deptsToInsert);
      console.log(`[Seeder] Seeded ${deptsToInsert.length} new departments.`);
    }

    const allDepts = await Department.find({ orgId: organization._id });
    const departmentMap = new Map<string, any>();
    for (const d of allDepts) {
      departmentMap.set(d.name, d);
    }

    // ========================================================
    // 5. SEED DEFAULT HR USER
    // ========================================================
    const hrCode = process.env.DEFAULT_HR_CODE || "HR_001";
    const hrEmail = (
      process.env.DEFAULT_HR_EMAIL || "hr-nick-dev@yopmail.com"
    ).toLowerCase();
    const hrFirstName = process.env.DEFAULT_HR_FIRST_NAME || "HR";
    const hrLastName = process.env.DEFAULT_HR_LAST_NAME || "Manager";
    const hrJobTitle = process.env.DEFAULT_HR_JOB_TITLE || "HR Manager";
    const hrPassword = process.env.DEFAULT_HR_PASSWORD || "Admin@123";

    let hrEmployee = await Employee.findOne({
      orgId: organization._id,
      $or: [{ employeeCode: hrCode }, { email: hrEmail }],
    });

    if (!hrEmployee) {
      console.log(`[Seeder] Creating default HR Employee (${hrCode})...`);
      const hrDept = departmentMap.get("Human Resources") || allDepts[0];
      const defaultCountry =
        countryMap.get("US") || countryMap.get("IN") || allCountries[0];
      const defaultCurrency =
        currencyByCountryAndCode.get(`${defaultCountry.code}_USD`) ||
        currencyByCode.get("USD") ||
        allCurrencies[0];

      const hrPasswordHash = await bcrypt.hash(hrPassword, 10);

      hrEmployee = await Employee.create({
        employeeCode: hrCode,
        firstName: hrFirstName,
        lastName: hrLastName,
        email: hrEmail,
        jobTitle: hrJobTitle,
        departmentId: hrDept._id,
        role: "HR",
        level: "manager",
        countryId: defaultCountry._id,
        currencyId: defaultCurrency._id,
        salary: 120000,
        hireDate: new Date("2023-01-01"),
        employmentType: "Full-time",
        status: "Active",
        orgId: organization._id,
        passwordHash: hrPasswordHash,
      });

      await Salary.create({
        employeeId: hrEmployee._id,
        baseSalary: 120000,
        paySalary: 120000,
        currencyId: defaultCurrency._id,
        effectiveDate: new Date("2023-01-01"),
        remark: "Initial HR compensation",
      });

      console.log(
        `[Seeder] Seeded default HR Employee: ${hrEmail} (${hrCode}).`,
      );
    } else {
      console.log(
        `[Seeder] Default HR user already exists (${hrEmployee.email}).`,
      );
    }

    // ========================================================
    // 6. SEED 10,000 EMPLOYEES & INITIAL SALARIES
    // ========================================================
    const existingEmployeeCount = await Employee.countDocuments({
      orgId: organization._id,
      role: "Employee",
    });

    if (existingEmployeeCount < 10000 && employeesData.length > 0) {
      console.log(
        `[Seeder] Seeding ${employeesData.length} employees from employees.json...`,
      );

      const batchSize = 2000;
      let insertedCount = 0;

      for (let i = 0; i < employeesData.length; i += batchSize) {
        const batch = employeesData.slice(i, i + batchSize);
        const employeeDocs = [];

        for (const item of batch) {
          const dept = departmentMap.get(item.department);
          const country = countryMap.get(item.countryCode?.toUpperCase());
          const curr =
            currencyByCountryAndCode.get(
              `${item.countryCode?.toUpperCase()}_${item.currency?.toUpperCase()}`,
            ) || currencyByCode.get(item.currency?.toUpperCase());

          if (!dept || !country || !curr) {
            continue;
          }

          employeeDocs.push({
            employeeCode: item.employeeCode,
            firstName: item.firstName,
            lastName: item.lastName,
            email: item.email,
            jobTitle: item.jobTitle,
            departmentId: dept._id,
            role: "Employee",
            level: (item.level || "mid").toLowerCase(),
            countryId: country._id,
            currencyId: curr._id,
            salary: item.salary || 50000,
            hireDate: new Date(item.hireDate),
            employmentType: item.employmentType || "Full-time",
            status: "Active",
            orgId: organization._id,
          });
        }

        if (employeeDocs.length > 0) {
          const insertedEmployees = await Employee.insertMany(employeeDocs, {
            ordered: false,
          });

          // Create corresponding initial Salary record for each employee
          const salaryDocs = insertedEmployees.map((emp) => ({
            employeeId: emp._id,
            baseSalary: emp.salary,
            paySalary: emp.salary,
            currencyId: emp.currencyId,
            effectiveDate: emp.hireDate,
            remark: "Initial employment salary record",
          }));

          await Salary.insertMany(salaryDocs, { ordered: false });
          insertedCount += insertedEmployees.length;

          console.log(
            `[Seeder] Batch processed: ${insertedCount}/${employeesData.length} employees & salary records seeded.`,
          );
        }
      }

      console.log(
        `[Seeder] Completed seeding ${insertedCount} employees and salary records.`,
      );
    } else {
      console.log(
        `[Seeder] Employees already seeded (${existingEmployeeCount} records exist for org).`,
      );
    }

    console.log("[Seeder] Database seeding successfully completed!");
    console.log("--------------------------------------------------");
  } catch (error: any) {
    console.error("[Seeder] Error during seeding:", error);
  }
};

export default seedDatabase;
