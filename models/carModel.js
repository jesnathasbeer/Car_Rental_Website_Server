import { Schema, model } from 'mongoose';

const carSchema = new Schema({
    name: String,
    type: String,
    priceperday: Number,
    image: String,
    mileage: String,
    description: String,
    dateadded: String,
    available: Boolean,
});

export default model('Car', carSchema);