const router = require("express").Router();
const category = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const { validateCategory } = require("../validators/categoryValidator");

const cpUpload = uploadMiddleware.fields([
  { name: 'img', maxCount: 1 },
]);

router.get("/", category.getAllCategory);
router.get("/:id", category.getAllCategoryById);
//action
router.post("/", authMiddleware, cpUpload, validateCategory, category.createCategory);
router.put("/:id", authMiddleware, cpUpload, validateCategory, category.updateCategory);
router.delete("/:id", authMiddleware, category.deleteCategory);

module.exports = router;
