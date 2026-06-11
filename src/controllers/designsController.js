const path = require("path");
const DesignsModel = require("../models/Designs");
const { readJsonFile, writeJsonFile, uploadBufferFile, deleteFile } = require("../utils/githubJsonStore");
const { compressToTargetSize } = require("../config/imageProcessor");

const DESIGNS_FILE_PATH = process.env.DESIGNS_FILE_PATH || "data/portfolio/designs.json";
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

exports.createDesign = async (req, res) => {
  try {
    const designData = req.body;
    const { title } = designData;

    let imageName = null;
    if (req.files?.img?.[0]?.buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: design img ${imageName}`);
    }

    const designsList = await readJsonFile(DESIGNS_FILE_PATH, []);

    const newDesign = {
      id: Date.now(),
      status: designData.status === 'true' || designData.status === true,
      pin_num: parseInt(designData.pin_num) || 0,
      user_id: req.user?.id || null, 
      cat_id: designData.cat_id,
      main_ti: designData.main_ti,
      title: designData.title,
      des: designData.des,
      detail: designData.detail || "",
      img: imageName,                 
      list_img: designData.list_img || "",
      tags: designData.tags || "",
      share_count: parseInt(designData.share_count) || 0,
      view_count: parseInt(designData.view_count) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()              
    };

    designsList.push(newDesign);
    
    await writeJsonFile(DESIGNS_FILE_PATH, designsList, `Designs: created ${title || 'New Design'}`);

    return res.status(201).json({ 
      success: true,
      message: "បង្កើត Designs បានជោគជ័យ", 
      data: newDesign 
    });

  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

exports.updateDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const designData = req.body;

    const designsList = await readJsonFile(DESIGNS_FILE_PATH, []);
    const designIndex = designsList.findIndex(s => s.id === parseInt(id) || s.id === id);

    if (designIndex === -1) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញ Designs ដែលត្រូវកែប្រែឡើយ!" });
    }

    const oldDesign = designsList[designIndex];

    let imageName = oldDesign.img;
    if (req.files?.img?.[0]?.buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: updated img ${imageName}`);

      if (oldDesign.img) {
        try {
          await deleteFile(`${UPLOADS_DIR}/${oldDesign.img}`, `uploads: deleted old img ${oldDesign.img}`);
        } catch (e) {
          console.log("Error deleting old image:", e.message);
        }
      }
    }

    const updatedDesign = {
      ...oldDesign,       
      ...designData,      
      img: imageName,      
      updated_at: new Date()
    };

    designsList[designIndex] = updatedDesign;
    await writeJsonFile(DESIGNS_FILE_PATH, designsList, `Designs: updated ${updatedDesign.title || id}`);

    return res.status(200).json({
      success: true,
      message: "ធ្វើបច្ចុប្បន្នភាព Designs បានជោគជ័យ",
      data: updatedDesign
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};


exports.deleteDesign = async (req, res) => {
  try {
    const { id } = req.params;
    const designsList = await readJsonFile(DESIGNS_FILE_PATH, []);
    const designToDelete = designsList.find(s => s.id === parseInt(id) || s.id === id);

    if (!designToDelete) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញ Designs ដែលត្រូវលុបឡើយ!" });
    }

    if (designToDelete.img) {
      try {
        await deleteFile(`${UPLOADS_DIR}/${designToDelete.img}`, `uploads: deleted img due to design deletion ${designToDelete.img}`);
      } catch (e) {
        console.log("Image not found on GitHub storage, skipping delete:", e.message);
      }
    }

    const filteredDesigns = designsList.filter(s => s.id !== designToDelete.id);
    await writeJsonFile(DESIGNS_FILE_PATH, filteredDesigns, `Designs: deleted design with ID ${id}`);

    return res.status(200).json({
      success: true,
      message: "លុប Designs និងហ្វាល់ពាក់ព័ន្ធបានជោគជ័យ"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.getAllDesign = async (req, res) => {
  try {
    let designs = await readJsonFile(DESIGNS_FILE_PATH, []);
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

exports.getAllDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const designs = await readJsonFile(DESIGNS_FILE_PATH, []);
    const design = designs.find(s => String(s.id) === String(id));

    if (!design) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញ Designs នេះឡើយ" });
    }
    
    const formattedDesign = {
      ...design,
      created_at: formatBackendDate(design.created_at),
      updated_at: formatBackendDate(design.updated_at)
    };

    return res.json({
      success: true,
      data: formattedDesign
    });
    
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
