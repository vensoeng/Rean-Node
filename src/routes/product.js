const router = require("express").Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const { productValidator } = require("../validators/productValidator");

const cpUpload = uploadMiddleware.fields([
  { name: 'img', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]);

router.get("/", productController.getAllProduct);
router.get("/:id", productController.getAllProductById);
//action
router.post("/", authMiddleware, cpUpload,  productValidator, productController.createProduct);
router.put("/:id", authMiddleware, cpUpload,  productValidator, productController.updateProduct);
router.delete("/:id", authMiddleware, productController.deleteProduct);

module.exports = router;
