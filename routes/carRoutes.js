import { Router } from 'express';
const router = Router();
import { getAllCars, addCar, updateCar, deleteCar, getCarById } from '../controllers/carControllers.js';
import { authAdmin } from '../middlewares/authAdmin.js';
import { upload } from '../middlewares/multer.js';


router.get('/getcars', getAllCars);
router.post('/addacar', upload.single("image"), addCar);
router.put('/updatecar/:id', updateCar)
router.delete('/deleteacar/:id',authAdmin, deleteCar);
router.get('/getcarbyid/:id', getCarById);

export { router as carRouter };