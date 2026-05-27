// const multer = require("multer");

// // file filter
// const fileFilter = (req, file, cb) => {

//   const allowedTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/webp"
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(
//       new Error("Only images allowed"),
//       false
//     );
//   }
// };

// module.exports = multer({
//   storage: multer.memoryStorage(),
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB
//   }
// });


const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg", 
    "image/png", 
    "image/webp", 
    "image/gif",
    "text/html"
  ];

  const allowedExtensions = /jpeg|jpg|png|webp|gif|html/; 
  const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedMimeTypes.includes(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    return cb(new Error("អនុញ្ញាតតែឯកសារប្រភេទ រូបភាព និង HTML តែប៉ុណ្ណោះ!"), false);
  }
};

// បង្កើត upload middleware
const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = uploadMiddleware;