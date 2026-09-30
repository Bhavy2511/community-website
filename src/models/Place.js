import mongoose from "mongoose";

const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  cuisine: { type: String, required: true, trim: true },
  description: String,
  locality: String,
  address: String,
  mapUrl: String,
  verified: { type: Boolean, default: false },
  published: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.models.Place || mongoose.model("Place", PlaceSchema);
