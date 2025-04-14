import { cloudinaryInstance } from '../config/cloudinary.js';
import Car from '../models/carModel.js'; // ✅ Only import Car

// Get all cars
export async function getAllCars(req, res) {
    try {
        const cars = await Car.find(); // ✅ Use Car.find()
        res.json(cars);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}

export async function getCarById(req, res) {
    try {
        const { id } = req.params;
        const car = await Car.findById(id); // Find car by ID

        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }

        res.json(car);
    } catch (error) {
        console.error("Error fetching car details:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// Add a new car (Admin only)
export async function addCar(req, res) {
    try {
       //  const newCar = new Car(req.body);
         const { name, type, priceperday, available } = req.body;

        // console.log(req.file,"-----req.file")

        const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path);
        // console.log("cloudinaryResponse=====", cloudinaryRes);


         const newCar = new Car({
             name,
             type,
             priceperday,
             image: cloudinaryRes.url,
             available,
         });
        await newCar.save();

        res.json({ data: newCar, message: "Car details added successfully" });
    } catch (error) {
        console.error("Error adding car:", error);
        res.status(500).json({ error: 'Server error' });
    }
}

// Update car details (Admin only)
 export async function updateCar(req, res) {
     try {
       
        const { id } = req.params; // Get car ID from request parameters
        const car = await Car.findById(id);
        console.log(car);
         const {name, type, priceperday, image, available} = req.body; // Get update data from request body

         const updatedCar = await Car.findByIdAndUpdate(id, {name, type, priceperday, image, available}, { new: true, runValidators: true });
        if (!updatedCar) {
             return res.status(404).json({ message: "Car not found" });
         }

         res.json({ data: updatedCar, message: "Car details updated successfully" });
     } catch (error) {
         res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
     }
 }

// Delete car (Admin only)
 export async function deleteCar(req, res) {
     try {
        await Car.findByIdAndDelete(req.params.id); // ✅ Use Car.findByIdAndDelete()

         res.json({ message: "Car has been deleted successfully" });
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message || "Internal server" });
        }
    }

