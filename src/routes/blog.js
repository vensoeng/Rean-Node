const router = require("express").Router();
const blogController = require("../controllers/blogController");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const cpUpload = uploadMiddleware.fields([
  { name: 'img', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]);

router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);

router.post("/", authMiddleware, cpUpload, blogController.createBlog);
router.put("/:id", authMiddleware, cpUpload, blogController.updateBlog);
router.delete("/:id", authMiddleware, blogController.deleteBlog);

module.exports = router;