import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/products.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiFeatures } from "../utils/ApiFeatures.js";

// Single product details
const productById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        throw new ApiError(400, "Product not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Products fetched successfully."))
})

// create product (admin)
const createProduct = asyncHandler(async (req, res) => {

    const { name, description, price, category, brand } = req.body

    if ([name, description, price, category, brand].some((field) => field?.trim() === "")) {
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


// Get All products
const getAllProducts = asyncHandler(async (req, res) => {
    const resultPerPage = 10
    const productCount = await Product.countDocuments()
    const searchItem = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage)
    //console.log("Search item: ", searchItem)
    const products = await searchItem.query
    //console.log("Products ", products)

    if (!products) {
        throw new ApiError(500, "Error while fetching products")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { products, productCount }, "Products fetched successfully."))
})

// update product (admin)
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

// delete product (admin)
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

// product review
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body

    const product = await Product.findById(req.params.id)

    if (!rating && !comment) { throw new ApiError(400, "All fields are required") }

    const review = {
        user: req.user._id,
        name: req.user.fullName,
        rating: Number(rating),
        comment,
    }

    const isReviewd = product.reviews.find((rev) => rev.user.toString() === req.user?.id.toString())

    if (isReviewd) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user?.id.toString()) {
                rev.rating = rating
                rev.comment = comment
            }
        })
    } else {
        product.reviews.push(review)
        product.numReviews = product.reviews.length
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating
    })
    product.ratings = avg / product.reviews.length
    await product.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Reviewd succuessfully."))
})

// get all product review
const allProductReview = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.params.id)

    if (!product) {
        return res.status(400).json(new ApiResponse(400, "Invalid Product ID"))
    }
    const review = product.reviews
    return res
        .status(200)
        .json(new ApiResponse(200, review, "Review fetched successfully."))
})

// delete review
const deleteReview = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    console.log(product)

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    const toBeDeleted = product.reviews.find(rev => rev._id.toString() !== req.params.id.toString())

    if (!toBeDeleted) {
        throw new ApiError(404, "Review not found")
    }

    const updatedReviews = product.reviews.filter(rev => rev._id.toString() !== toBeDeleted._id.toString())
    //console.log(updatedReviews)

    let avg = 0
    updatedReviews.forEach(rev => {
        avg += rev.rating
    })

    const ratings = updatedReviews.length > 0 ? avg / updatedReviews.length : 0

    const numReviews = updatedReviews.length

    const updatedReview = await Product.findByIdAndUpdate(req.params.id,
        {
            reviews: updatedReviews,
            ratings,
            numReviews,
        },
        { new: true })

    return res
        .status(200)
        .json(new ApiResponse(200, updatedReview, "Review  deleted and Product updated successfully"))
})

export {
    createProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    productById,
    createProductReview,
    allProductReview,
    deleteReview,
}