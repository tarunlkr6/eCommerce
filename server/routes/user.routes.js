import { Router } from "express"
import { forgotPassword, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/password/reset").post(forgotPassword)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(verifyJWT, refreshAccessToken)

export default router