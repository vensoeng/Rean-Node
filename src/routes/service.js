const router = require("express").Router();
const serviceController = require("../controllers/serviceController");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const { validateService } = require("../validators/serviceValidator");

const cpUpload = uploadMiddleware.fields([
  { name: 'img', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]);

router.get("/", serviceController.getAllService);
router.get("/:id", serviceController.getAllServiceById);
//action
router.post("/", authMiddleware, cpUpload, validateService, serviceController.createService);
router.put("/:id", authMiddleware, cpUpload, validateService, serviceController.updateService);
router.delete("/:id", authMiddleware, serviceController.deleteService);

module.exports = router;