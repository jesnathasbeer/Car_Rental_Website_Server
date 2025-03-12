import e from "express";
import {userRouter} from './userRoutes.js'
import { adminRouter } from "./adminRoutes.js";
import { carRouter } from "./carRoutes.js";

const router = e.Router()



router.use("/user",userRouter)
router.use("/admin",adminRouter)
router.use("/car",carRouter)
// admin
// courses
// cart
// payment




export {router as apiRouter}




