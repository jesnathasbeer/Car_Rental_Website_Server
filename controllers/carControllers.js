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

// Add a new car (Admin only)
export async function addCar(req, res) {
    try {
        const car = new Car(req.body);
        await car.save();
        res.status(201).json(car);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}

// Delete car (Admin only)
export async function deleteCar(req, res) {
    try {
        await Car.findByIdAndDelete(req.params.id); // ✅ Use Car.findByIdAndDelete()
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}

