import { Router } from "express"
import { createProduct, deleteProduct, getAllProducts, updateProduct, productById } from "../controllers/product.controllers.js"
import { verifyJWT, authRole } from "../middlewares/auth.middlewares.js"
import { upload } from "../middlewares/multer.middlewares.js"

const router = Router()

router.route("/").get(getAllProducts)
router.route("/:id").get(productById)

//secured routes
router.route("/new").post(verifyJWT, authRole, upload.fields([
    {
        name: "image",
        maxCount: 5
    }
]), createProduct)
router.route("/delete/:id").delete(verifyJWT, authRole, deleteProduct)
router.route("/update/:id").put(verifyJWT, authRole, updateProduct)

export default router