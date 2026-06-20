const router = require("express").Router();
const creatorController = require("../controllers/creatorsController");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const { validateCreator } = require("../validators/creatorValidator");

const cpUpload = uploadMiddleware.fields([
  { name: 'img', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]);

router.get("/", creatorController.getAllCreator);
router.get("/:id", creatorController.getAllCreatorById);
//action
router.post("/", authMiddleware, cpUpload, validateCreator, creatorController.createCreator);
router.put("/:id", authMiddleware, cpUpload, validateCreator, creatorController.updateCreator);
router.delete("/:id", authMiddleware, creatorController.deleteCreator);

module.exports = router;
