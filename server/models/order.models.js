import mongoose, { Schema } from "mongoose"

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            product: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Product",
            },
        }
    ],
    shippingInfo: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        postalCode: {
            type: Number,
            required: true,
        },
        phoneNo: {
            type: Number,
            required: true,
        },
    },
    itemPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    payementResult: {
        id: {
            type: String,
        },
        status: {
            type: String,
        },
        updateTime: {
            type: String,
        },
        emailAddress: {
            type: String,
        }
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['received', 'shipped', 'delivered', 'cancelled'],
        default: "received",
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    deliveredOn: {
        type: Date,
    },
}, { timestamps: true })

export const Order = mongoose.model("Order", orderSchema)