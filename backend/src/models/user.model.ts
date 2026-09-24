import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IBankDetails {
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface IEducationDetails {
  degree: string;
  fieldOfStudy: string;
  university: string;
  yearOfCompletion: string;
  grade: string;
}

export interface IWorkExperience {
  companyName: string;
  designation: string;
  startDate: Date;
  endDate: Date;
  responsibilities: string;
}

export interface IUser extends Document {
  name: string;
  employeeId: string;
  email: string;
  officialEmail?: string;
  phone: string;
  designation?: string;
  department?: mongoose.Types.ObjectId;
  isReportTo?: mongoose.Types.ObjectId;
  isLeaveManager?: mongoose.Types.ObjectId;
  isReport: boolean;
  isLeaveReport: boolean;
  joiningDate: Date;
  role: mongoose.Types.ObjectId;
  password?: string;
  tempPassword?: string;
  dateOfBirth: Date;
  gender?: string;
  residencyAddress?: string;
  permanentAddress?: string;
  bankDetails?: IBankDetails;
  eductionDetails?: IEducationDetails[];
  workExperience?: IWorkExperience[];
  status: boolean;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  subscriptions: string[];
  profilePic?: string;
  createdBy?: mongoose.Types.ObjectId;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const BankDetailsSchema = new Schema({
  bankName: { type: String, required: true },
  bankBranch: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  accountHolderName: { type: String, required: true },
});

const EducationDetailsSchema = new Schema({
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  university: { type: String, required: true },
  yearOfCompletion: { type: String, required: true },
  grade: { type: String, required: true },
});

const WorkExperienceSchema = new Schema({
  companyName: { type: String, required: true },
  designation: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  responsibilities: { type: String, required: true },
});

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    employeeId: { type: String, unique: true }, // Auto-generated
    email: { type: String, required: true },
    officialEmail: { type: String },
    phone: { type: String, required: true },
    designation: { type: String },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    isReportTo: { type: Schema.Types.ObjectId, ref: "User" },
    isLeaveManager: { type: Schema.Types.ObjectId, ref: "User" },
    isReport: { type: Boolean, default: false },
    isLeaveReport: { type: Boolean, default: false },
    joiningDate: { type: Date, required: true },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    password: { type: String, required: true, select: false },
    tempPassword: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String },
    residencyAddress: { type: String },
    permanentAddress: { type: String },
    bankDetails: BankDetailsSchema,
    eductionDetails: [EducationDetailsSchema],
    workExperience: [WorkExperienceSchema],
    status: { type: Boolean, required: true, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    subscriptions: {
      type: [String],
      enum: ["empverse", "workvia", "offix"],
      default: ["empverse", "workvia", "offix"],
    },
    profilePic: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Enforce unique email/phone per role
UserSchema.index({ email: 1, role: 1 }, { unique: true });
UserSchema.index({ phone: 1, role: 1 }, { unique: true });

// Hash password before saving
UserSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
