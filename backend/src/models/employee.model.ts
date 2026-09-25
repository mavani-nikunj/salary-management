import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type EmployeeRole = "HR" | "Employee";
export type EmployeeLevel = "junior" | "mid" | "senior" | "lead" | "manager";
export type EmploymentType = "Full-time" | "Part-time" | "Contract";
export type EmployeeStatus = "Active" | "Inactive";

export interface IEmployee extends Document {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  departmentId: Types.ObjectId;
  role: EmployeeRole;
  level: EmployeeLevel;
  countryId: Types.ObjectId;
  currencyId: Types.ObjectId;
  salary: number;
  hireDate: Date;
  employmentType: EmploymentType;
  leaveDate?: Date;
  status: EmployeeStatus;
  orgId: Types.ObjectId;
  passwordHash?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema<IEmployee> = new Schema(
  {
    employeeCode: {
      type: String,
      required: [true, "Employee code is required"],
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Employee email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department reference is required"],
    },
    role: {
      type: String,
      required: [true, "Employee role is required"],
      enum: {
        values: ["HR", "Employee"],
        message: "{VALUE} is not a valid role",
      },
      default: "Employee",
    },
    level: {
      type: String,
      required: [true, "Employee level is required"],
      lowercase: true,
      enum: {
        values: ["junior", "mid", "senior", "lead", "manager"],
        message: "{VALUE} is not a valid level",
      },
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "Country reference is required"],
    },
    currencyId: {
      type: Schema.Types.ObjectId,
      ref: "Currency",
      required: [true, "Currency reference is required"],
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [1, "Salary must be at least 1"],
    },
    hireDate: {
      type: Date,
      required: [true, "Hire date is required"],
    },
    employmentType: {
      type: String,
      required: [true, "Employment type is required"],
      enum: {
        values: ["Full-time", "Part-time", "Contract"],
        message: "{VALUE} is not a valid employment type",
      },
    },
    leaveDate: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["Active", "Inactive"],
        message: "{VALUE} is not a valid status",
      },
      default: "Active",
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization reference is required"],
    },
    passwordHash: {
      type: String,
      required: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "employees",
  }
);

// Compound Unique Index: uniqueTogether: [["orgId", "employeeCode"]]
EmployeeSchema.index({ orgId: 1, employeeCode: 1 }, { unique: true });

// Performance indexes for multi-tenant and dashboard query operations
EmployeeSchema.index({ orgId: 1, departmentId: 1 });
EmployeeSchema.index({ orgId: 1, countryId: 1 });
EmployeeSchema.index({ orgId: 1, status: 1 });

export const Employee: Model<IEmployee> = mongoose.model<IEmployee>(
  "Employee",
  EmployeeSchema,
  "employees"
);

export default Employee;
