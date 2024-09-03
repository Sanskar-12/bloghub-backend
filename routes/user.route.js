import express from "express"
import { verifyToken } from "../utils/verifyUser.js"
import { deleteUser, deleteUserProfile, getUser, getUsers, updateUser} from "../controllers/user.controller.js"

const router=express.Router()

router.put("/update/:userId",verifyToken,updateUser)
router.delete("/delete/:userId",verifyToken,deleteUserProfile)
router.delete("/delete/user/:userId",verifyToken,deleteUser)
router.get("/get/all/users",verifyToken,getUsers)
router.get("/get/user/:userId",verifyToken,getUser)

export default router