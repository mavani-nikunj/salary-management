import mongoose, { Schema, Document, Model } from "mongoose";

export type OrganizationStatus = "Active" | "Inactive";

export interface IOrganization extends Document {
  name: string;
  email: string;
  passwordHash: string;
  status: OrganizationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema<IOrganization> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Organization email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
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
    collection: "organizations",
  }
);

export const Organization: Model<IOrganization> = mongoose.model<IOrganization>(
  "Organization",
  OrganizationSchema,
  "organizations"
);

export default Organization;
