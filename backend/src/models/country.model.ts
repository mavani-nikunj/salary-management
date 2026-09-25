import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICountry extends Document {
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema: Schema<ICountry> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Country name is required"],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Country code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "countries",
  }
);

export const Country: Model<ICountry> = mongoose.model<ICountry>(
  "Country",
  CountrySchema,
  "countries"
);

export default Country;
