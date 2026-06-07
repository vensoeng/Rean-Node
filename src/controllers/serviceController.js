const path = require("path");
const ServiceModel = require("../models/Services");
const { readJsonFile, writeJsonFile, uploadBufferFile, deleteFile } = require("../utils/githubJsonStore");
const { compressToTargetSize } = require("../config/imageProcessor");

const SERVICE_FILE_PATH = process.env.SERVICE_FILE_PATH || "data/portfolio/services.json";
const UPLOADS_DIR = process.env.UPLOADS_DIR || "storage";

exports.createService = async (req, res) => {
  try {
    const serviceData = req.body;
    const { title } = serviceData;

    let imageName = null;
    if (req.files?.img?.[0]?.buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: blog img ${imageName}`);
    }

    let htmlFileName = null;
    if (req.files?.file?.[0]?.buffer) {
      const serviceFile = req.files.file[0];
      const fileExt = path.extname(serviceFile.originalname) || ".html";
      htmlFileName = `${Date.now()}${fileExt}`;
      await uploadBufferFile(`${UPLOADS_DIR}/${htmlFileName}`, serviceFile.buffer, `uploads: Service file ${htmlFileName}`);
    }

    const servicesList = await readJsonFile(SERVICE_FILE_PATH, []);

    const newService = new ServiceModel({
      id: Date.now(),
      user_id: req.user.id,  
      status: serviceData.status,
      index: serviceData.index,
      upper: serviceData.upper,
      booking_length: serviceData.booking_length,
      list_id: serviceData.list_id,
      list_name: serviceData.list_name,
      title: serviceData.title,
      title_kh: serviceData.title_kh,
      title_zh: serviceData.title_zh,
      description: serviceData.description,
      description_kh: serviceData.description_kh,
      description_zh: serviceData.description_zh,
      tags: serviceData.tags,
      tags_zh: serviceData.tags_zh,
      tags_kh: serviceData.tags_kh,
      tags_active: serviceData.tags_active,
      tags_active_kh: serviceData.tags_active_kh,
      tags_active_zh: serviceData.tags_active_zh,
      price_start: serviceData.price_start,
      price_end: serviceData.price_end,
      warranty: serviceData.warranty,
      warranty_zh: serviceData.warranty_zh,
      warranty_kh: serviceData.warranty_kh,
      deposit: serviceData.deposit,
      time: serviceData.time,
      time_kh: serviceData.time_kh,
      time_zh: serviceData.time_zh,
      location: serviceData.location,
      location_zh: serviceData.location_zh,
      location_kh: serviceData.location_kh,
      note: serviceData.note,
      note_kh: serviceData.note_kh,
      note_zh: serviceData.note_zh,  
      img_slider: serviceData.img_slider,
      img: imageName,            
      file: htmlFileName,       
      created_at: new Date(),
      updated_at: new Date()              
    });

    servicesList.push(newService);
    await writeJsonFile(SERVICE_FILE_PATH, servicesList, `Services: created ${title || 'New Service'}`);

    // 6. Return response
    return res.status(201).json({ 
      success: true,
      message: "បង្កើត Services បានជោគជ័យ", 
      data: newService 
    });

  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

//update 
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;

    const servicesList = await readJsonFile(SERVICE_FILE_PATH, []);

    const serviceIndex = servicesList.findIndex(s => s.id === parseInt(id) || s.id === id);

    if (serviceIndex === -1) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញសេវាកម្មដែលត្រូវកែប្រែឡើយ!" });
    }

    const oldService = servicesList[serviceIndex];

    let imageName = oldService.img;
    if (req.files?.img?.[0]?.buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: updated img ${imageName}`);

      if (oldService.img) {
        try {
          await deleteFile(`${UPLOADS_DIR}/${oldService.img}`, `uploads: deleted old img ${oldService.img}`);
        } catch (e) {
          console.log("Error deleting old image:", e.message); // បង្ការកុំឱ្យគាំងប្រព័ន្ធបើរកហ្វាល់ចាស់មិនឃើញ
        }
      }
    }

    let htmlFileName = oldService.file;
    if (req.files?.file?.[0]?.buffer) {
      const serviceFile = req.files.file[0];
      const fileExt = path.extname(serviceFile.originalname) || ".html";
      htmlFileName = `${Date.now()}${fileExt}`;

      await uploadBufferFile(`${UPLOADS_DIR}/${htmlFileName}`, serviceFile.buffer, `uploads: updated file ${htmlFileName}`);

      if (oldService.file) {
        try {
          await deleteFile(`${UPLOADS_DIR}/${oldService.file}`, `uploads: deleted old file ${oldService.file}`);
        } catch (e) {
          console.log("Error deleting old file:", e.message);
        }
      }
    }

    const updatedService = {
      ...oldService,       
      ...serviceData,      
      img: imageName,      
      file: htmlFileName, 
      updatedAt: new Date() 
    };

    servicesList[serviceIndex] = updatedService;

    await writeJsonFile(SERVICE_FILE_PATH, servicesList, `Services: updated ${updatedService.title || id}`);

    return res.status(200).json({
      success: true,
      message: "ធ្វើបច្ចុប្បន្នភាពសេវាកម្មបានជោគជ័យ",
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

//delete
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const servicesList = await readJsonFile(SERVICE_FILE_PATH, []);

    const serviceToDelete = servicesList.find(s => s.id === parseInt(id) || s.id === id);

    if (!serviceToDelete) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញសេវាកម្មដែលត្រូវលុបឡើយ!" });
    }

    if (serviceToDelete.img) {
      try {
        await deleteFile(`${UPLOADS_DIR}/${serviceToDelete.img}`, `uploads: deleted img due to service deletion ${serviceToDelete.img}`);
      } catch (e) {
        console.log("Image not found on GitHub storage, skipping delete:", e.message);
      }
    }

    if (serviceToDelete.file) {
      try {
        await deleteFile(`${UPLOADS_DIR}/${serviceToDelete.file}`, `uploads: deleted file due to service deletion ${serviceToDelete.file}`);
      } catch (e) {
        console.log("File not found on GitHub storage, skipping delete:", e.message);
      }
    }

    const filteredServices = servicesList.filter(s => s.id !== serviceToDelete.id);

    await writeJsonFile(SERVICE_FILE_PATH, filteredServices, `Services: deleted service with ID ${id}`);

    return res.status(200).json({
      success: true,
      message: "លុបសេវាកម្ម និងហ្វាល់ពាក់ព័ន្ធបានជោគជ័យ"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};
//Get All item services
exports.getAllService = async (req, res) => {
  try {
    let services = await readJsonFile(SERVICE_FILE_PATH, []);

    const { search, list_id, status, upper, page, limit } = req.query;

    if (search) {
      const searchLower = search.toLowerCase();
      services = services.filter(s => 
        (s.title && s.title.toLowerCase().includes(searchLower)) ||
        (s.title_kh && s.title_kh.toLowerCase().includes(searchLower)) ||
        (s.description && s.description.toLowerCase().includes(searchLower))
      );
    }

    if (list_id) {
      services = services.filter(s => String(s.list_id) === String(list_id));
    }

    if (status) {
      const isStatusTrue = status === 'true';
      services = services.filter(s => s.status === isStatusTrue);
    }

    if (upper) {
      const isUpperTrue = upper === 'true';
      services = services.filter(s => s.upper === isUpperTrue);
    }

    services.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const totalItems = services.length;

    if (page || limit) {
      const currentPage = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      const paginatedData = services.slice(startIndex, endIndex);

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
      data: services
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

//Get by ID
exports.getAllServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const services = await readJsonFile(SERVICE_FILE_PATH, []);
    
    const service = services.find(s => String(s.id) === String(id));

    if (!service) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញសេវាកម្មនេះឡើយ" });
    }

    return res.json({
      success: true,
      data: service
    });
    
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};