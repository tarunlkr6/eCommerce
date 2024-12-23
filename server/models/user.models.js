import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import validator from "validator"
import crypto from "crypto"

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is mandatory"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, "Please enter a valid email"],
        index: true,
    },
    password: {
        type: String,
        required: [true, "Password is mandatory"],
        minLength: [8, "password must be in between 8 to 14 characters"],
        maxLength: [14, "password must be in between 8 to 14 characters"],
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    refreshToken: {
        type: String,
    },
    resetToken: {
        type: String,
    },
    resetTokenExpiry: {
        type: Date,
    },
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

userSchema.methods.generateResetToken = function () {
    const token = crypto.randomBytes(20).toString("hex")

    this.resetToken = crypto.createHash("sha256").update(token).digest("hex")

    this.resetTokenExpiry = Date.now() + 5 * 60 * 1000

    return token
}
export const User = mongoose.model("User", userSchema)