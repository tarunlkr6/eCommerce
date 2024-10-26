import { Router } from "express"
import { authRole, verifyJWT } from "../middlewares/auth.middlewares.js"
import { cancelOrder, createOrder, getMyOrders, getOrderById, getOrders, updateOrderToDelivered, updateOrderToPaid } from "../controllers/order.controller.js"

const router = Router()

// secured routes
router.route("/add").post(verifyJWT, createOrder)
router.route("/myorders").get(verifyJWT, getMyOrders)
router.route("/:id").get(verifyJWT, getOrderById)
router.route("/cancel/:id").post(verifyJWT, cancelOrder)
router.route("/:id/pay").get(verifyJWT, updateOrderToPaid)

// secured admin routes
router.route("/").get(verifyJWT, authRole, getOrders)
router.route("/:id/deliver").post(verifyJWT, authRole, updateOrderToDelivered)

export default router