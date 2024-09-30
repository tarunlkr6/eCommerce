import { Router } from "express"
import { createProduct, deleteProduct, getProducts, updateProduct, productDetails } from "../controllers/product.controllers.js"
import { verifyJWT, admin } from "../middlewares/auth.middlewares.js"
import { upload } from "../middlewares/multer.middlewares.js"

const router = Router()

router.route("/").get(getProducts)
router.route("/:id").get(productDetails)

//secured routes
router.route("/create").post(verifyJWT, admin, upload.fields([
    {
        name: "image",
        maxCount: 5
    }
]), createProduct)
router.route("/delete/:id").delete(verifyJWT, deleteProduct)
router.route("/update/:id").put(verifyJWT, updateProduct)

export default router