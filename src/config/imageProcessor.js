// const sharp = require("sharp");

// const TARGET_BYTES = 1024 * 1024; // 1MB

// exports.compressToTargetSize = async (inputBuffer, mimeType) => {
//   const metadata = await sharp(inputBuffer).metadata();
//   const startWidth = metadata.width || 1920;
//   const startHeight = metadata.height || 1080;

//   // Keep small images as-is.
//   if (inputBuffer.length <= TARGET_BYTES) {
//     return {
//       buffer: inputBuffer,
//       extension: mimeType === "image/png" ? ".png" : mimeType === "image/webp" ? ".webp" : ".jpg",
//       mimeType,
//       compressed: false
//     };
//   }

//   let width = startWidth;
//   let height = startHeight;
//   let quality = 82;
//   let output = null;

//   for (let pass = 0; pass < 9; pass += 1) {
//     output = await sharp(inputBuffer)
//       .rotate()
//       .resize({ width, height, fit: "inside", withoutEnlargement: true })
//       .jpeg({ quality, mozjpeg: true })
//       .toBuffer();

//     if (output.length <= TARGET_BYTES) {
//       return {
//         buffer: output,
//         extension: ".jpg",
//         mimeType: "image/jpeg",
//         compressed: true
//       };
//     }

//     if (quality > 55) {
//       quality -= 7;
//     } else {
//       width = Math.max(640, Math.floor(width * 0.85));
//       height = Math.max(640, Math.floor(height * 0.85));
//     }
//   }

//   return {
//     buffer: output,
//     extension: ".jpg",
//     mimeType: "image/jpeg",
//     compressed: true
//   };
// };

// const sharp = require("sharp");

// const TARGET_BYTES = 89 * 1024;

// exports.compressToTargetSize = async (inputBuffer, mimeType) => {
//   const metadata = await sharp(inputBuffer).metadata();
//   const startWidth = metadata.width || 1920;
//   const startHeight = metadata.height || 1080;

//   if (mimeType === "image/webp" && inputBuffer.length <= TARGET_BYTES) {
//     return {
//       buffer: inputBuffer,
//       extension: ".webp",
//       mimeType,
//       compressed: false
//     };
//   }

//   let width = startWidth;
//   let height = startHeight;
//   let quality = 82;
//   let output = null;

//   for (let pass = 0; pass < 10; pass += 1) {
//     output = await sharp(inputBuffer)
//       .rotate()
//       .resize({ width, height, fit: "inside", withoutEnlargement: true })
//       .webp({ quality, effort: 6 })
//       .toBuffer();

//     if (output.length <= TARGET_BYTES) {
//       return {
//         buffer: output,
//         extension: ".webp",
//         mimeType: "image/webp",
//         compressed: true
//       };
//     }

//     if (quality > 45) {
//       quality -= 8;
//     } else {
//       width = Math.max(640, Math.floor(width * 0.8));
//       height = Math.max(640, Math.floor(height * 0.8));
//     }
//   }

//   return {
//     buffer: output,
//     extension: ".webp",
//     mimeType: "image/webp",
//     compressed: true
//   };
// };



const sharp = require("sharp");

const TARGET_BYTES = 89 * 1024;

exports.compressToTargetSize = async (inputBuffer, mimeType) => {
  if (mimeType === "image/webp" && inputBuffer.length <= TARGET_BYTES) {
    return {
      buffer: inputBuffer,
      extension: ".webp",
      mimeType,
      compressed: false
    };
  }

  const pipeline = sharp(inputBuffer).rotate();
  const metadata = await pipeline.metadata();
  
  let width = metadata.width || 1920;
  let height = metadata.height || 1080;

  if (width > 1920 || height > 1080) {
    const ratio = Math.min(1920 / width, 1080 / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }

  let quality = 80;
  let output = null;
  
  for (let pass = 0; pass < 5; pass += 1) {
    output = await pipeline
      .clone() 
      .resize({ width, height, fit: "inside", withoutEnlargement: true }) 
      .webp({ quality, effort: 4 }) 
      .toBuffer();

    // Target size achieved!
    if (output.length <= TARGET_BYTES) {
      return {
        buffer: output,
        extension: ".webp",
        mimeType: "image/webp",
        compressed: true
      };
    }

    if (quality > 50) {
      quality -= 15; 
    } else {
      width = Math.max(400, Math.floor(width * 0.7));
      height = Math.max(400, Math.floor(height * 0.7));
    }
  }

  return {
    buffer: output,
    extension: ".webp",
    mimeType: "image/webp",
    compressed: true
  };
};