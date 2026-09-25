import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type DepartmentStatus = "Active" | "Inactive";

export interface IDepartment extends Document {
  orgId: Types.ObjectId;
  name: string;
  status: DepartmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema<IDepartment> = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization reference is required"],
    },
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
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
  },
  {
    timestamps: true,
    collection: "departments",
  }
);

// Compound Unique Index: uniqueTogether: [["orgId", "name"]]
DepartmentSchema.index({ orgId: 1, name: 1 }, { unique: true });

export const Department: Model<IDepartment> = mongoose.model<IDepartment>(
  "Department",
  DepartmentSchema,
  "departments"
);

export default Department;
