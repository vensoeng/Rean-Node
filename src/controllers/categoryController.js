const path = require("path");
const CategoryModel = require("../models/Category");
const { readJsonFile, writeJsonFile, uploadBufferFile, deleteFile } = require("../utils/githubJsonStore");
const { compressToTargetSize } = require("../config/imageProcessor");

const CATEGORY_FILE_PATH = process.env.CATEGORY_FILE_PATH || "data/portfolio/category.json";
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

exports.createCategory = async (req, res) => {
  try {
    const creatorData = req.body;
    const { title } = creatorData;

    let imageName = null;
    if (req.files?.img?.[0]?.buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: creator img ${imageName}`);
    }

    const creatorList = await readJsonFile(CATEGORY_FILE_PATH, []);

    const newCreator = {
      id: Date.now(),
      status: creatorData.status || "true",
      title: creatorData.title || "",
      des: creatorData.des || "",
      img: imageName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    creatorList.push(newCreator);
    await writeJsonFile(CATEGORY_FILE_PATH, creatorList, `Playlist: created ${title || 'New playlist'}`);

    return res.status(201).json({ 
      success: true,
      message: "បង្កើត playlsit បានជោគជ័យ", 
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

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorData = req.body;

    const creatorList = await readJsonFile(CATEGORY_FILE_PATH, []);
    const creatorIndex = creatorList.findIndex(s => s.id === parseInt(id) || s.id === id);

    if (creatorIndex === -1) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញមាតិការដែលត្រូវកែប្រែឡើយ!" });
    }

    const oldCreator = creatorList[creatorIndex];

    let imageName = oldCreator.img;
    if (req.files?.img?.[0]?.buffer) {
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

    const updatedService = {
      ...oldCreator,       
      ...creatorData,      
      img: imageName,      
      updated_at: new Date()
    };

    creatorList[creatorIndex] = updatedService;
    await writeJsonFile(CATEGORY_FILE_PATH, creatorList, `Services: updated ${updatedService.title || id}`);

    return res.status(200).json({
      success: true,
      message: "ធ្វើបច្ចុប្បន្នភាពplaylistបានជោគជ័យ",
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

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const creatorList = await readJsonFile(CATEGORY_FILE_PATH, []);
    const creatorToDelete = creatorList.find(s => s.id === parseInt(id) || s.id === id);

    if (!creatorToDelete) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញplaylistដែលត្រូវលុបឡើយ!" });
    }

    if (creatorToDelete.img) {
      try {
        await deleteFile(`${UPLOADS_DIR}/${creatorToDelete.img}`, `upload: deleted img due to playlist deletion ${creatorToDelete.img}`);
      } catch (e) {
        console.log("Image not found on GitHub storage, skipping delete:", e.message);
      }
    }

    if (creatorToDelete.file) {
      try {
        await deleteFile(`${UPLOADS_DIR}/${creatorToDelete.file}`, `uploads: deleted file due to playlist deletion ${creatorToDelete.file}`);
      } catch (e) {
        console.log("File not found on GitHub storage, skipping delete:", e.message);
      }
    }

    const filteredCreator = creatorList.filter(s => s.id !== creatorToDelete.id);
    await writeJsonFile(CATEGORY_FILE_PATH, filteredCreator, `playlists: deleted playlist with ID ${id}`);

    return res.status(200).json({
      success: true,
      message: "លុបplaylist និងហ្វាល់ពាក់ព័ន្ធបានជោគជ័យ"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.getAllCategory = async (req, res) => {
    try {
      let designs = await readJsonFile(CATEGORY_FILE_PATH, []);
      const { search, status, page, limit } = req.query;
  
      if (search) {
        const searchLower = search.toLowerCase();
        designs = designs.filter(s => 
          (s.title && s.title.toLowerCase().includes(searchLower)) ||
          (s.title_kh && s.title_kh.toLowerCase().includes(searchLower)) ||
          (s.description && s.description.toLowerCase().includes(searchLower))
        );
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

exports.getAllCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const creators = await readJsonFile(CATEGORY_FILE_PATH, []);
    const creator = creators.find(s => String(s.id) === String(id));

    if (!creator) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញplaylistនេះឡើយ" });
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