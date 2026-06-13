const router = require("express").Router();
const playListController = require("../controllers/playlistController");
const authMiddleware = require("../middlewares/authMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const { validatePlaylist } = require("../validators/playlistValidator");

const cpUpload = uploadMiddleware.fields([
  { name: 'img', maxCount: 1 },
]);

router.get("/", playListController.getAllPlaylist);
router.get("/:id", playListController.getAllPlaylistById);
//action
router.post("/", authMiddleware, cpUpload, validatePlaylist, playListController.createPlaylist);
router.put("/:id", authMiddleware, cpUpload, validatePlaylist, playListController.updatePlaylist);
router.delete("/:id", authMiddleware, playListController.deletePlaylist);

module.exports = router;
