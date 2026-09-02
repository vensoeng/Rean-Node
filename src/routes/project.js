const router = require("express").Router();
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const { validateDesign } = require("../validators/projectValidator");

const cpUpload = uploadMiddleware.fields([
  { name: 'img', maxCount: 1 },
]);

router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getAllProjectById);
//action
router.post("/", authMiddleware, cpUpload, validateDesign, projectController.createProject);
router.put("/:id", authMiddleware, cpUpload, validateDesign, projectController.updateProject);
router.delete("/:id", authMiddleware, projectController.deleteProject);

module.exports = router;
