import { Router } from 'express';
const router = Router();
import { getAllCars, addCar, updateCar, deleteCar } from '../controllers/carControllers.js';
import { authAdmin } from '../middlewares/authAdmin.js';
import { upload } from '../middlewares/multer.js';


router.get('/getcars', getAllCars);
router.post('/addacar', upload.single("image"), addCar);
router.put('/updatecar/:id', updateCar)
router.delete('/deleteacar/:id',authAdmin, deleteCar);


export { router as carRouter };