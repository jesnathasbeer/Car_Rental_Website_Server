import { Router } from 'express';
const router = Router();
import { getAllCars, addCar, deleteCar } from '../controllers/carControllers.js';
import { authAdmin } from '../middlewares/authAdmin.js';

router.get('/getcars', getAllCars);
router.post('/addacar', addCar);
router.delete('/deleteacar/:id', deleteCar);



export { router as carRouter };