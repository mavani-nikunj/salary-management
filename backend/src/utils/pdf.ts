import PDFDocument from "pdfkit";

export interface SalarySlipPDFData {
  organizationName?: string;
  organizationEmail?: string;
  employeeCode: string;
  employeeName: string;
  employeeEmail: string;
  jobTitle: string;
  departmentName?: string;
  countryName?: string;
  employmentType?: string;
  baseSalary: number;
  paySalary: number;
  currencyCode: string;
  currencyName?: string;
  exchangeRate?: number;
  effectiveDate: Date | string;
  remark?: string;
  salaryId?: string;
}

/**
 * Generate a clean, professional salary slip PDF in memory and return as Buffer
 */
export const generateSalarySlipPDF = async (
  data: SalarySlipPDFData,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        info: {
          Title: `Salary Slip - ${data.employeeName} (${data.employeeCode})`,
          Author: data.organizationName || "Salary Management",
          Subject: "Salary Slip / Payslip",
        },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on("error", (err: Error) => reject(err));

      const orgName = data.organizationName || "SALARY MANAGEMENT SYSTEM";
      const orgEmail = data.organizationEmail || "payroll@company.com";
      const formattedDate = new Date(data.effectiveDate).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );
      const generatedAt = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // --- HEADER ---
      // Primary accent bar
      doc.rect(40, 40, 515, 60).fill("#1e293b");

      // Org Title
      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(18)
        .text(orgName.toUpperCase(), 55, 52, { width: 340, ellipsis: true });

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#94a3b8")
        .text(`Payroll & Remuneration | ${orgEmail}`, 55, 75);

      // Payslip Badge on the right
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#38bdf8")
        .text("PAYSLIP", 400, 52, { width: 140, align: "right" });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#cbd5e1")
        .text(`Date: ${formattedDate}`, 400, 72, { width: 140, align: "right" });

      if (data.salaryId) {
        doc.text(`Ref: ${String(data.salaryId).slice(-8).toUpperCase()}`, 400, 84, {
          width: 140,
          align: "right",
        });
      }

      // --- EMPLOYEE INFORMATION SECTION ---
      let y = 120;

      doc
        .fillColor("#0f172a")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("EMPLOYEE DETAILS", 40, y);

      // Divider line
      doc
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .moveTo(40, y + 16)
        .lineTo(555, y + 16)
        .stroke();

      y += 26;

      // Table Box for Employee Info
      doc.rect(40, y, 515, 84).fillAndStroke("#f8fafc", "#e2e8f0");

      const col1X = 55;
      const col2X = 200;
      const col3X = 330;
      const col4X = 430;

      // Row 1
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748b").text("Employee ID:", col1X, y + 10);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f172a").text(data.employeeCode, col2X - 50, y + 10);

      doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748b").text("Designation:", col3X, y + 10);
      doc.font("Helvetica").fontSize(9).fillColor("#0f172a").text(data.jobTitle || "N/A", col4X, y + 10);

      // Row 2
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748b").text("Employee Name:", col1X, y + 28);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f172a").text(data.employeeName, col2X - 50, y + 28);

      doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748b").text("Department:", col3X, y + 28);
      doc.font("Helvetica").fontSize(9).fillColor("#0f172a").text(data.departmentName || "N/A", col4X, y + 28);

      // Row 3
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748b").text("Official Email:", col1X, y + 46);
      doc.font("Helvetica").fontSize(9).fillColor("#0f172a").text(data.employeeEmail, col2X - 50, y + 46);

      doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748b").text("Employment Type:", col3X, y + 46);
      doc.font("Helvetica").fontSize(9).fillColor("#0f172a").text(data.employmentType || "Full-time", col4X, y + 46);

      // Row 4
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748b").text("Country:", col1X, y + 64);
      doc.font("Helvetica").fontSize(9).fillColor("#0f172a").text(data.countryName || "N/A", col2X - 50, y + 64);

      doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748b").text("Effective Date:", col3X, y + 64);
      doc.font("Helvetica").fontSize(9).fillColor("#0f172a").text(formattedDate, col4X, y + 64);

      // --- SALARY BREAKDOWN SECTION ---
      y += 110;

      doc
        .fillColor("#0f172a")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("SALARY & COMPENSATION BREAKDOWN", 40, y);

      doc
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .moveTo(40, y + 16)
        .lineTo(555, y + 16)
        .stroke();

      y += 26;

      // Table Header
      doc.rect(40, y, 515, 24).fill("#f1f5f9");
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#475569");
      doc.text("DESCRIPTION / ITEM", 55, y + 7);
      doc.text("CURRENCY", 320, y + 7);
      doc.text("AMOUNT", 450, y + 7, { width: 90, align: "right" });

      y += 24;

      // Item 1: Base Salary
      doc.rect(40, y, 515, 26).fillAndStroke("#ffffff", "#f1f5f9");
      doc.font("Helvetica").fontSize(9).fillColor("#1e293b").text("Base Monthly / Contract Salary", 55, y + 8);
      doc.text(data.currencyCode, 320, y + 8);
      doc.font("Helvetica-Bold").text(data.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 450, y + 8, { width: 90, align: "right" });

      y += 26;

      // Item 2: Pay Salary
      doc.rect(40, y, 515, 26).fillAndStroke("#f8fafc", "#f1f5f9");
      doc.font("Helvetica").fontSize(9).fillColor("#1e293b").text("Net Payable Salary", 55, y + 8);
      doc.text(data.currencyCode, 320, y + 8);
      doc.font("Helvetica-Bold").text(data.paySalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 450, y + 8, { width: 90, align: "right" });

      y += 26;

      // Item 3: Exchange Rate (if available)
      if (data.exchangeRate !== undefined) {
        doc.rect(40, y, 515, 26).fillAndStroke("#ffffff", "#f1f5f9");
        doc.font("Helvetica").fontSize(9).fillColor("#64748b").text(`Exchange Rate (1 INR = ${data.exchangeRate} ${data.currencyCode})`, 55, y + 8);
        doc.text("INR / " + data.currencyCode, 320, y + 8);
        const inrEquivalent = data.exchangeRate > 0 ? (data.paySalary / data.exchangeRate) : data.paySalary;
        doc.font("Helvetica").text(`~ ₹${inrEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 450, y + 8, { width: 90, align: "right" });
        y += 26;
      }

      // Remarks row
      if (data.remark) {
        doc.rect(40, y, 515, 26).fillAndStroke("#ffffff", "#f1f5f9");
        doc.font("Helvetica-Oblique").fontSize(8.5).fillColor("#64748b").text(`Note / Remark: ${data.remark}`, 55, y + 8, { width: 480 });
        y += 26;
      }

      // --- NET PAYABLE SUMMARY BOX ---
      y += 16;
      doc.rect(40, y, 515, 50).fillAndStroke("#ecfdf5", "#a7f3d0");

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#065f46")
        .text("TOTAL NET DISBURSEMENT", 55, y + 14);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#047857")
        .text(`Payable in ${data.currencyName || data.currencyCode} (${data.currencyCode})`, 55, y + 30);

      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .fillColor("#065f46")
        .text(`${data.currencyCode} ${data.paySalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 350, y + 16, { width: 190, align: "right" });

      // --- FOOTER & SIGN-OFF ---
      y = 660;

      // Horizontal separator
      doc
        .strokeColor("#cbd5e1")
        .lineWidth(0.5)
        .moveTo(40, y)
        .lineTo(555, y)
        .stroke();

      y += 15;

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#94a3b8")
        .text("Note: This is a computer-generated salary slip and requires no physical signature.", 40, y, { align: "center", width: 515 });

      y += 12;
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#94a3b8")
        .text(`Confidential Document | Generated on ${generatedAt} | Powered by ${orgName}`, 40, y, { align: "center", width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
