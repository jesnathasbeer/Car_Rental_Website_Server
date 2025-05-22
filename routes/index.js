import e from "express";
import {userRouter} from './userRoutes.js'
import { adminRouter } from "./adminRoutes.js";
import { carRouter } from "./carRoutes.js";
import { reviewRouter } from "./reviewRoutes.js";
import { orderRouter } from "./orderRoutes.js";

const router = e.Router()



router.use("/user",userRouter)
router.use("/admin",adminRouter)
router.use("/car",carRouter)

//review
router.use("/review",reviewRouter)
// payment
router.use("/order", orderRouter)



export {router as apiRouter}




