import { Schema, model } from 'mongoose';

const carSchema = new Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  priceperday: { type: Number, required: true, min: 1 },
  image: { type: String },
  mileage: { type: String },
  description: { type: String, trim: true },
  dateadded: { type: String },
  available: { type: Boolean, default: true },
});

export default model('Car', carSchema);
