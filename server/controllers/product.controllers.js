import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/products.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find()

    if (!products) {
        throw new ApiError(500, "Error while fetching products")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, products, "Products fetched successfully."))
})

const productDetails = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        throw new ApiError(400, "Product not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Products fetched successfully."))
})

const createProduct = asyncHandler(async (req, res) => {

    const { name, description, price, brand, category } = req.body


    if ([name, description, price, brand, category].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    let imageLocalPath = []
    imageLocalPath = req.files.image

    if (!imageLocalPath) {
        throw new ApiError(401, "Image is required")
    }
    //console.log(imageLocalPath)
    let imageArray = []
    for (let i = 0; i < imageLocalPath.length; i++) {
        let imageLinks = imageLocalPath[i]?.path;
        const result = await uploadOnCloudinary(imageLinks)
        imageArray.push({
            publicId: result.public_id,
            url: result.url
        })
    }

    const product = await Product.create({
        user: req.user._id,
        name,
        description,
        image: imageArray,
        price,
        brand,
        category,

    })
    const createdProduct = await Product.findById(product._id)

    if (!createdProduct) {
        throw new ApiError(500, "Something went wrong while creating product")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdProduct, "Prouct created successfully"))
})

const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        throw new ApiError(400, "Product not found")
    }
    if (!req.user) {
        throw new ApiError(401, "User not found")
    }

    if (product.user._id.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "User not authorized")
    }

    const updatedProduct = Product.findByIdAndUpdate(req.params.id, req.body, { new: true, })

    if (!updatedProduct) {
        throw new ApiError(500, "Something went wrong while updating product.")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedProduct, "Product updated successfully"))
})

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.find(req.params.id)

    if (!product) {
        throw new ApiError(400, "Product not found")
    }

    if (!req.user) {
        throw new ApiError(401, "User not found")
    }

    if (product.user._id.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "User not authorized")
    }

    await Product.findByIdAndDelete(product._id)

    return res
        .status(200)
        .json(new ApiResponse(200, product._id, "Product deleted successfully."))
})
export {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    productDetails,
}