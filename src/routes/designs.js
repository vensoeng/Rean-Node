const router = require("express").Router();
const designsController = require("../controllers/designsController");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const { validateDesign } = require("../validators/designsValidator");

const cpUpload = uploadMiddleware.fields([
  { name: 'img', maxCount: 1 },
]);

router.get("/", designsController.getAllDesign);
router.get("/:id", designsController.getAllDesignById);
//action
router.post("/", authMiddleware, cpUpload, validateDesign, designsController.createDesign);
router.put("/:id", authMiddleware, cpUpload, validateDesign, designsController.updateDesign);
router.delete("/:id", authMiddleware, designsController.deleteDesign);

module.exports = router;
