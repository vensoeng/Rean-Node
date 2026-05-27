const router = require("express").Router();
const auth = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

// router.post("/register", uploadMiddleware.single("pr_img"), auth.register);
router.post("/login", auth.login);
router.post("/refresh", auth.refreshToken);
router.post("/logout", authMiddleware, auth.logout);

// protected user route
router.get("/me", authMiddleware, auth.me);

// authenticated dashboard route
router.get("/dashboard", authMiddleware, auth.dashboard);

// admin-only dashboard route (optional)
router.get("/admin/dashboard", authMiddleware, adminMiddleware, auth.dashboard);

module.exports = router;