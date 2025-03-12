import { Schema, model } from 'mongoose';

const carSchema = new Schema({
    name: String,
    type: String,
    pricePerDay: Number,
    image: String,
    available: Boolean,
});

export default model('Car', carSchema);