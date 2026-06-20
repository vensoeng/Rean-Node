const path = require("path");
const CreatorModel = require("../models/Creator");
const { readJsonFile, writeJsonFile, uploadBufferFile, deleteFile } = require("../utils/githubJsonStore");
const { compressToTargetSize } = require("../config/imageProcessor");

const CREATOR_FILE_PATH = process.env.CREATOR_FILE_PATH || "data/portfolio/creator.json";
const UPLOADS_DIR = process.env.UPLOADS_DIR || "storage";

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

exports.createCreator = async (req, res) => {
  try {
    const creatorData = req.body;
    const { title } = creatorData;

    // Process image buffer safely
    let imageName = null;
    if (req.files && req.files.img && req.files.img[0] && req.files.img[0].buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: creator img ${imageName}`);
    }

    // Process HTML file buffer safely
    let htmlFileName = null;
    if (req.files && req.files.file && req.files.file[0] && req.files.file[0].buffer) {
      const serviceFile = req.files.file[0];
      const fileExt = path.extname(serviceFile.originalname) || ".html";
      htmlFileName = `${Date.now()}${fileExt}`;
      await uploadBufferFile(`${UPLOADS_DIR}/${htmlFileName}`, serviceFile.buffer, `uploads: creator file ${htmlFileName}`);
    }

    const creatorList = await readJsonFile(CREATOR_FILE_PATH, []);

    // Instantiate with the clean modern Object pattern (from previous fix)
    const newCreator = new CreatorModel({
      id: Date.now(),
      status: creatorData.status,
      pin: creatorData.pin,
      user_id: req.user?.id || null,
      cat_id: creatorData.cat_id,
      title: creatorData.title,
      des: creatorData.des,
      img: imageName,
      file: htmlFileName,
      tags: creatorData.tags,
      share_count: creatorData.share_count || 0,
      view_count: creatorData.view_count || 0,
      created_at: new Date(),
      updated_at: new Date()
    });

    creatorList.push(newCreator);
    await writeJsonFile(CREATOR_FILE_PATH, creatorList, `Creator: created ${title || 'New Service'}`);

    return res.status(201).json({ 
      success: true,
      message: "បង្កើត Creator បានជោគជ័យ", 
      data: newCreator 
    });

  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};

exports.updateCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorData = req.body;

    const creatorList = await readJsonFile(CREATOR_FILE_PATH, []);

    const creatorIndex = creatorList.findIndex(s => String(s.id) === String(id));

    if (creatorIndex === -1) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញមាតិការដែលត្រូវកែប្រែឡើយ!" });
    }

    const oldCreator = creatorList[creatorIndex];

    let imageName = oldCreator.img;
    if (req.files && req.files.img && req.files.img[0] && req.files.img[0].buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: updated img ${imageName}`);

      if (oldCreator.img) {
        try {
          await deleteFile(`${UPLOADS_DIR}/${oldCreator.img}`, `uploads: deleted old img ${oldCreator.img}`);
        } catch (e) {
          console.log("Error deleting old image:", e.message);
        }
      }
    }

    let htmlFileName = oldCreator.file;
    if (req.files && req.files.file && req.files.file[0] && req.files.file[0].buffer) {
      const serviceFile = req.files.file[0];
      const fileExt = path.extname(serviceFile.originalname) || ".html";
      htmlFileName = `${Date.now()}${fileExt}`;

      await uploadBufferFile(`${UPLOADS_DIR}/${htmlFileName}`, serviceFile.buffer, `uploads: updated file ${htmlFileName}`);

      if (oldCreator.file) {
        try {
          await deleteFile(`${UPLOADS_DIR}/${oldCreator.file}`, `uploads: deleted old file ${oldCreator.file}`);
        } catch (e) {
          console.log("Error deleting old file:", e.message);
        }
      }
    }

    const updatedService = {
      ...oldCreator,      
      ...creatorData,      
      img: imageName,      
      file: htmlFileName, 
      updated_at: new Date()
    };

    creatorList[creatorIndex] = updatedService;
    await writeJsonFile(CREATOR_FILE_PATH, creatorList, `Services: updated ${updatedService.title || id}`);

    return res.status(200).json({
      success: true,
      message: "ធ្វើបច្ចុប្បន្នភាពមាតិការបានជោគជ័យ",
      data: updatedService
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.deleteCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorList = await readJsonFile(CREATOR_FILE_PATH, []);
    
    // String safe element search
    const creatorToDelete = creatorList.find(s => String(s.id) === String(id));

    if (!creatorToDelete) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញសេវាកម្មដែលត្រូវលុបឡើយ!" });
    }

    if (creatorToDelete.img) {
      try {
        await deleteFile(`${UPLOADS_DIR}/${creatorToDelete.img}`, `uploads: deleted img due to service deletion ${creatorToDelete.img}`);
      } catch (e) {
        console.log("Image not found on GitHub storage, skipping delete:", e.message);
      }
    }

    if (creatorToDelete.file) {
      try {
        await deleteFile(`${UPLOADS_DIR}/${creatorToDelete.file}`, `uploads: deleted file due to service deletion ${creatorToDelete.file}`);
      } catch (e) {
        console.log("File not found on GitHub storage, skipping delete:", e.message);
      }
    }

    const filteredCreator = creatorList.filter(s => String(s.id) !== String(creatorToDelete.id));
    await writeJsonFile(CREATOR_FILE_PATH, filteredCreator, `Services: deleted service with ID ${id}`);

    return res.status(200).json({
      success: true,
      message: "លុបមាតិការ និងហ្វាល់ពាក់ព័ន្ធបានជោគជ័យ"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.getAllCreator = async (req, res) => {
    try {
      let designs = await readJsonFile(CREATOR_FILE_PATH, []);
      const { search, cat_id, status, page, limit } = req.query;
  
      if (search) {
        const searchLower = search.toLowerCase();
        designs = designs.filter(s => 
          (s.title && s.title.toLowerCase().includes(searchLower)) ||
          (s.title_kh && s.title_kh.toLowerCase().includes(searchLower)) ||
          (s.description && s.description.toLowerCase().includes(searchLower))
        );
      }
  
      if (cat_id) {
        designs = designs.filter(s => String(s.cat_id) === String(cat_id));
      }
  
      if (status) {
        designs = designs.filter(s => s.status === status);
      }
  
      designs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
      const formattedDesigns = designs.map(s => ({
        ...s,
        created_at: formatBackendDate(s.created_at),
        updated_at: formatBackendDate(s.updated_at)
      }));
  
      const totalItems = formattedDesigns.length;
  
      if (page || limit) {
        const currentPage = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
  
        const paginatedData = formattedDesigns.slice(startIndex, endIndex);
  
        return res.json({
          success: true,
          meta: {
            total_items: totalItems,
            current_page: currentPage,
            limit: pageSize,
            total_pages: Math.ceil(totalItems / pageSize)
          },
          data: paginatedData
        });
      }
  
      return res.json({
        success: true,
        total: totalItems,
        data: formattedDesigns
      });
  
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message
      });
    }
};

exports.getAllCreatorById = async (req, res) => {
  try {
    const { id } = req.params;
    const creators = await readJsonFile(CREATOR_FILE_PATH, []);
    const creator = creators.find(s => String(s.id) === String(id));

    if (!creator) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញមាតិការនេះឡើយ" });
    }
    
    const formattedCreator = {
      ...creator,
      created_at: formatBackendDate(creator.created_at),
      updated_at: formatBackendDate(creator.updated_at)
    };

    return res.json({
      success: true,
      data: formattedCreator
    });
    
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};