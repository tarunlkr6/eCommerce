import { Router } from "express"
import { changeCurrentPassword, forgotPassword, getAllUsers, getSingleUser, getUserDetails, loginUser, logoutUser, refreshAccessToken, registerUser, resetPassword } from "../controllers/user.controllers.js"
import { authRole, verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

// public routes
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/password/forgot").post(forgotPassword)
router.route("/password/reset/:token").put(resetPassword)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(verifyJWT, refreshAccessToken)
router.route("/me").get(verifyJWT, getUserDetails)
router.route("/password/update").put(verifyJWT, changeCurrentPassword)

// admin secured routes
router.route("/users").get(verifyJWT, authRole, getAllUsers)
router.route("/users/:id").get(verifyJWT, authRole, getSingleUser)

export default router