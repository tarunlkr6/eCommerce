import { Order } from "../models/order.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

// @desc    Create new order
// @route   POST /api/orders/add
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, shippingInfo, itemPrice, taxPrice, shippingPrice, totalPrice, paymentMethod } = req.body

    if (orderItems && orderItems.length === 0) {
        throw new ApiError(400, "No order items")
    }

    const order = await Order.create({
        user: req.user._id,
        orderItems,
        shippingInfo,
        paymentMethod,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    })

    const createdOrder = await Order.findOne(order._id)
    if (!createdOrder) {
        throw new ApiError(500, "Order creation failed")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdOrder, "Order created successfully."))
})

// @desc    Post logged in user orders
// @route   Put /api/orders/myorders/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params

    const order = await Order.findById(orderId)

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    if (order.orderStatus === 'cancelled') {
        throw new ApiError(400, "Order is already cancelled")
    } else if (order.orderStatus === 'delivered') {
        throw new ApiError(400, "Delivered orders cannot be cancelled")
    }
    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
        $set: {
            orderStatus: 'cancelled',
        }
    }, { new: true })

    return res
        .status(200)
        .json(new ApiResponse(200, updatedOrder, "Order cancelled successfully."))

})

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user?._id })
    if (!orders) {
        throw new ApiError(404, "Order not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "Orders fetched successfully"))
})

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name')
    res.json(orders)
})

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    )
    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order fetched successfully."))
})

// @desc    Update order to paid
// @route   GET /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (order) {
        order.isPaid = true
        order.paidAt = Date.now()
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer.email_address,
        }

        const updatedOrder = await order.save()

        return res
            .status(200)
            .json(new ApiResponse(200, updatedOrder, "Payment done"))
    } else {
        throw new Error(400, 'Order not found')
    }
})

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (order) {
        order.isDelivered = true
        order.deliveredAt = Date.now()

        const updatedOrder = await order.save()

        return res
            .status(200)
            .json(new ApiResponse(200, updatedOrder, "Order Delivered"))
    } else {
        throw new Error(404, 'Order not found')
    }
})

export {
    createOrder,
    cancelOrder,
    getMyOrders,
    getOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
}
