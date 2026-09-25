import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICurrency extends Document {
  countryId: Types.ObjectId;
  code: string;
  name: string;
  exRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const CurrencySchema: Schema<ICurrency> = new Schema(
  {
    countryId: {
      type: Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "Country reference is required"],
    },
    code: {
      type: String,
      required: [true, "Currency code is required"],
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Currency name is required"],
      trim: true,
    },
    exRate: {
      type: Number,
      required: [true, "Exchange rate is required"],
      min: [0.0001, "Exchange rate must be at least 0.0001"],
    },
  },
  {
    timestamps: true,
    collection: "currencies",
  }
);

// Compound Unique Index: uniqueTogether: [["countryId", "code"]]
CurrencySchema.index({ countryId: 1, code: 1 }, { unique: true });

export const Currency: Model<ICurrency> = mongoose.model<ICurrency>(
  "Currency",
  CurrencySchema,
  "currencies"
);

export default Currency;
