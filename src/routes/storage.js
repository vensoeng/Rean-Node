const router = require("express").Router();

const storage = require("../controllers/storageController");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const cpUpload = uploadMiddleware.fields([
  { name: 'img', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]);

router.get("/data/url/:filename", storage.getFile);
router.post("/", authMiddleware, cpUpload, storage.createFile);
router.get("/", storage.getAllFiles);
router.get("/:id", storage.getFileById);
router.put("/:id", authMiddleware, cpUpload, storage.updateFile);
router.delete("/:id", authMiddleware, storage.deleteFile);

module.exports = router;