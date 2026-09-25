import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISalary extends Document {
  employeeId: Types.ObjectId;
  baseSalary: number;
  paySalary: number;
  currencyId: Types.ObjectId;
  effectiveDate: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SalarySchema: Schema<ISalary> = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee reference is required"],
    },
    baseSalary: {
      type: Number,
      required: [true, "Base salary is required"],
      min: [1, "Base salary must be at least 1"],
    },
    paySalary: {
      type: Number,
      required: [true, "Pay salary is required"],
      min: [1, "Pay salary must be at least 1"],
    },
    currencyId: {
      type: Schema.Types.ObjectId,
      ref: "Currency",
      required: [true, "Currency reference is required"],
    },
    effectiveDate: {
      type: Date,
      required: [true, "Effective date is required"],
    },
    remark: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "salaries",
  }
);

// Compound Unique Index: uniqueTogether: [["employeeId", "effectiveDate"]]
SalarySchema.index({ employeeId: 1, effectiveDate: 1 }, { unique: true });

// Query optimization index for salary history/reports
SalarySchema.index({ employeeId: 1, createdAt: -1 });

export const Salary: Model<ISalary> = mongoose.model<ISalary>(
  "Salary",
  SalarySchema,
  "salaries"
);

export default Salary;
