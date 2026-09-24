"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const BankDetailsSchema = new mongoose_1.Schema({
    bankName: { type: String, required: true },
    bankBranch: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    accountHolderName: { type: String, required: true },
});
const EducationDetailsSchema = new mongoose_1.Schema({
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    university: { type: String, required: true },
    yearOfCompletion: { type: String, required: true },
    grade: { type: String, required: true },
});
const WorkExperienceSchema = new mongoose_1.Schema({
    companyName: { type: String, required: true },
    designation: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    responsibilities: { type: String, required: true },
});
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    employeeId: { type: String, unique: true }, // Auto-generated
    email: { type: String, required: true },
    officialEmail: { type: String },
    phone: { type: String, required: true },
    designation: { type: String },
    department: { type: mongoose_1.Schema.Types.ObjectId, ref: "Department" },
    isReportTo: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    isLeaveManager: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    isReport: { type: Boolean, default: false },
    isLeaveReport: { type: Boolean, default: false },
    joiningDate: { type: Date, required: true },
    role: { type: mongoose_1.Schema.Types.ObjectId, ref: "Role", required: true },
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
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
// Enforce unique email/phone per role
UserSchema.index({ email: 1, role: 1 }, { unique: true });
UserSchema.index({ phone: 1, role: 1 }, { unique: true });
// Hash password before saving
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
});
// Method to compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    return await bcryptjs_1.default.compare(candidatePassword, this.password);
};
exports.default = mongoose_1.default.model("User", UserSchema);
