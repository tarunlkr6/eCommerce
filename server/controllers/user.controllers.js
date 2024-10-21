import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import jwt from "jsonwebtoken"
import { sendEmail } from "../utils/sendEmail.js"

const options = {
    httpOnly: true,
    secure: true
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (err) {
        throw new ApiError(500, "Something went wrong while generating acess and refresh token")
    }
}

// create new user
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, isAdmin } = req.body

    if (
        [fullName, email, password].some((field) => field?.trim() === "")
    ) { throw new ApiError(400, "All fields are required") }

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new ApiError(409, "User with same email already exists")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        isAdmin,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registerd successfully."))
})

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email) {
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect
        (password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged In Successfully"))
})

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: null,
        },
    }, { new: true, })

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

// Refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully."))
    } catch (err) {
        throw new ApiError(500, "Something went wrong while refreshing access token")
    }
})


// Forgot password token generation and mail sender
const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const resetToken = user.generateResetToken()

    await user.save({ validateBeforeSave: false })

    const passwordURL = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `We have received a request for changing your password for Poshak Ghar.\nIf you want to change your password, please click on the link: ${passwordURL}`

    try {

        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        })

        return res
            .status(200)
            .json(new ApiResponse(200, {}, `Email sent to ${user.email} successfully!`))

    } catch (err) {
        user.resetToken = null
        user.resetTokenExpiry = null

        await user.save({ validateBeforeSave: false })

        throw new ApiError(500, err.message)
    }
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    forgotPassword,
}