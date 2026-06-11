const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const path = require("path");

const USERNAME = process.env.OWNER || "vensoeng";
const REPO = process.env.NEW_REPO || "filedata";
const BRANCH = process.env.BRANCH || "main";
const UPLOADS_DIR = process.env.UPLOADS_DIR || "storage";
const FILE_PATH = process.env.FILE_PATH || "data/data/storage.json";

const StorageModel = require("../models/Storage");
const { readJsonFile, writeJsonFile, uploadBufferFile, deleteFile } = require("../utils/newStore");
const { compressToTargetSize } = require("../config/storageProcessor");

const getUploadedFile = (req) => req.files?.file?.[0] || req.files?.img?.[0] || null;

const makeFileName = (baseName, ext) => `${baseName}${ext}`;

const buildStorageItem = (item) => ({
  ...item,
  created_at: formatBackendDate(item.created_at),
  updated_at: formatBackendDate(item.updated_at),
  file_url: item.name ? `/storage/data/url/${item.name}` : null
});

const removeStoredFile = async (filename, message) => {
  if (!filename) {
    return;
  }

  try {
    await deleteFile(`${UPLOADS_DIR}/${filename}`, message);
  } catch (error) {
    console.log("Error deleting file:", error.message);
  }
};

exports.getFile = async (req, res) => {
    try {
        const filename = req.params.filename;
        
        const ext = path.extname(filename).toLowerCase();

        const githubApiUrl =
            `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${UPLOADS_DIR}/${filename}?ref=${BRANCH}`;

        const isHtml = ext === '.html' || ext === '.htm';
        
        const response = await axios.get(githubApiUrl, {
            headers: {
                Authorization: `Bearer ${process.env.NEW_GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3.raw"
            },
            responseType: isHtml ? "text" : "arraybuffer"
        });

        if (isHtml) {
            res.set("Content-Type", "text/html; charset=utf-8");
        } else if (ext === '.webp') {
          res.set("Content-Type", "image/webp");
        } else if (ext === '.png') {
            res.set("Content-Type", "image/png");
        } else if (ext === '.gif') {
            res.set("Content-Type", "image/gif");
        } else if (ext === '.jpg' || ext === '.jpeg') {
          res.set("Content-Type", "image/jpeg");
        } else if (ext === '.css') {
          res.set("Content-Type", "text/css; charset=utf-8");
        } else if (ext === '.js') {
          res.set("Content-Type", "application/javascript; charset=utf-8");
        } else if (ext === '.json') {
          res.set("Content-Type", "application/json; charset=utf-8");
        } else {
          res.set("Content-Type", "application/octet-stream"); 
        }

        res.send(response.data);

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "File or Image not found"
        });
    }
};


const formatBackendDate = (dateInput) => {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

exports.getAllFiles = async (req, res) => {
  try {
    const items = await readJsonFile(FILE_PATH, []);

    return res.status(200).json({
      success: true,
      data: items.map(buildStorageItem)
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await readJsonFile(FILE_PATH, []);
    const item = items.find((record) => String(record.id) === String(id));

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "រកមិនឃើញ file នេះឡើយ"
      });
    }

    return res.status(200).json({
      success: true,
      data: buildStorageItem(item)
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.createFile = async (req, res) => {
  try {
    let FileName = null;
    const uploadedFile = getUploadedFile(req);

    if (uploadedFile?.buffer) {
      const fileExt = path.extname(uploadedFile.originalname) || ".html";
      const isImage = typeof uploadedFile.mimetype === "string" && uploadedFile.mimetype.startsWith("image/");

      if (isImage) {
        const processed = await compressToTargetSize(uploadedFile.buffer, uploadedFile.mimetype);
        FileName = `${Date.now()}${processed.extension}`;
        await uploadBufferFile(`${UPLOADS_DIR}/${FileName}`, processed.buffer, `uploads: file ${FileName}`);
      } else {
        FileName = `${Date.now()}${fileExt}`;
        await uploadBufferFile(`${UPLOADS_DIR}/${FileName}`, uploadedFile.buffer, `uploads: file ${FileName}`);
      }
    }

    const datafile = await readJsonFile(FILE_PATH, []);

    const newData = new StorageModel(
      Date.now(),
      req.user.id,
      FileName,
      new Date(),
      new Date()
    );

    datafile.push(newData);
    await writeJsonFile(FILE_PATH, datafile, `datafile: created ${FileName}`);
    
    return res.status(201).json({ 
      success: true,
      message: "បង្កើត file បានជោគជ័យ", 
      data: buildStorageItem(newData) 
    });

  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};

exports.updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await readJsonFile(FILE_PATH, []);
    const itemIndex = items.findIndex((record) => String(record.id) === String(id));

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "រកមិនឃើញ file ដែលត្រូវកែប្រែឡើយ!"
      });
    }

    const oldItem = items[itemIndex];
    const uploadedFile = getUploadedFile(req);
    let nextFileName = oldItem.name || null;

    if (uploadedFile?.buffer) {
      const oldBaseName = oldItem.name ? path.parse(oldItem.name).name : `${Date.now()}`;
      const isImage = typeof uploadedFile.mimetype === "string" && uploadedFile.mimetype.startsWith("image/");

      await removeStoredFile(oldItem.name, `uploads: deleted old file ${oldItem.name}`);

      if (isImage) {
        const processed = await compressToTargetSize(uploadedFile.buffer, uploadedFile.mimetype);
        nextFileName = makeFileName(oldBaseName, processed.extension);
        await uploadBufferFile(`${UPLOADS_DIR}/${nextFileName}`, processed.buffer, `uploads: updated file ${nextFileName}`);
      } else {
        const newExt = path.extname(uploadedFile.originalname) || path.extname(oldItem.name || "") || ".bin";
        nextFileName = makeFileName(oldBaseName, newExt);
        await uploadBufferFile(`${UPLOADS_DIR}/${nextFileName}`, uploadedFile.buffer, `uploads: updated file ${nextFileName}`);
      }
    }

    const updatedItem = {
      ...oldItem,
      name: nextFileName,
      updated_at: new Date()
    };

    items[itemIndex] = updatedItem;
    await writeJsonFile(FILE_PATH, items, `datafile: updated ${updatedItem.name || id}`);

    return res.status(200).json({
      success: true,
      message: "ធ្វើបច្ចុប្បន្នភាព file បានជោគជ័យ",
      data: buildStorageItem(updatedItem)
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await readJsonFile(FILE_PATH, []);
    const itemToDelete = items.find((record) => String(record.id) === String(id));

    if (!itemToDelete) {
      return res.status(404).json({
        success: false,
        message: "រកមិនឃើញ file ដែលត្រូវលុបឡើយ!"
      });
    }

    await removeStoredFile(itemToDelete.name, `uploads: deleted file ${itemToDelete.name}`);

    const filteredItems = items.filter((record) => String(record.id) !== String(id));
    await writeJsonFile(FILE_PATH, filteredItems, `datafile: deleted ${itemToDelete.name || id}`);

    return res.status(200).json({
      success: true,
      message: "លុប file បានជោគជ័យ"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};
