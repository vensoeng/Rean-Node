const path = require("path");
const ProductModel = require("../models/Product");
const { readJsonFile, writeJsonFile, uploadBufferFile, deleteFile } = require("../utils/githubJsonStore");
const { compressToTargetSize } = require("../config/imageProcessor");

const PRODUCT_FILE_PATH = process.env.PRODUCT_FILE_PATH || "data/portfolio/product.json";
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

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const { title } = productData;

    let imageName = null;
    if (req.files?.img?.[0]?.buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: product img ${imageName}`);
    }

    let htmlFileName = null;
    if (req.files?.file?.[0]?.buffer) {
      const serviceFile = req.files.file[0];
      const fileExt = path.extname(serviceFile.originalname) || ".html";
      htmlFileName = `${Date.now()}${fileExt}`;
      await uploadBufferFile(`${UPLOADS_DIR}/${htmlFileName}`, serviceFile.buffer, `uploads: product file ${htmlFileName}`);
    }

    const productList = await readJsonFile(PRODUCT_FILE_PATH, []);

    const newProduct = {
      id: Date.now(),
      pin: productData.pin || "0",
      status: productData.status === "true" || productData.status === true,
      user_id: req.user?.id || null, 
      cat_id: Number(productData.cat_id) || 1, 
      name: productData.name || "", 
      des: productData.des || "",
      detail: productData.detail || "",
      price: productData.price || "0",
      stock: productData.stock || "0",
      pesent: productData.pesent || "",
      note: productData.note || "",
      tags: productData.tags || "",
      share_count: productData.share_count || 0,
      view_count: productData.view_count || 0,
      list_img: productData.list_img || '',
      img: imageName,            
      file: htmlFileName,       
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()              
    };

    productList.push(newProduct);
    await writeJsonFile(PRODUCT_FILE_PATH, productList, `Products: created ${title || 'New Product'}`);

    return res.status(201).json({ 
      success: true,
      message: "បង្កើត Product បានជោគជ័យ", 
      data: newProduct
    });

  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const productList = await readJsonFile(PRODUCT_FILE_PATH, []);
    const productIndex = productList.findIndex(s => s.id === parseInt(id) || s.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញProductដែលត្រូវកែប្រែឡើយ!" });
    }

    const oldProduct = productList[productIndex];

    let imageName = oldProduct.img;
    if (req.files?.img?.[0]?.buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: updated img ${imageName}`);

      if (oldProduct.img) {
        try {
          await deleteFile(`${UPLOADS_DIR}/${oldProduct.img}`, `uploads: deleted old img ${oldProduct.img}`);
        } catch (e) {
          console.log("Error deleting old image:", e.message);
        }
      }
    }

    let htmlFileName = oldProduct.file;
    if (req.files?.file?.[0]?.buffer) {
      const serviceFile = req.files.file[0];
      const fileExt = path.extname(serviceFile.originalname) || ".html";
      htmlFileName = `${Date.now()}${fileExt}`;

      await uploadBufferFile(`${UPLOADS_DIR}/${htmlFileName}`, serviceFile.buffer, `uploads: updated file ${htmlFileName}`);

      if (oldProduct.file) {
        try {
          await deleteFile(`${UPLOADS_DIR}/${oldProduct.file}`, `uploads: deleted old file ${oldProduct.file}`);
        } catch (e) {
          console.log("Error deleting old file:", e.message);
        }
      }
    }

    const updatedProduct = {
      ...oldProduct,       
      ...productData,      
      img: imageName,      
      file: htmlFileName, 
      updated_at: new Date().toISOString()
    };

    productList[productIndex] = updatedProduct; 
    await writeJsonFile(PRODUCT_FILE_PATH, productList, `Product: updated ${updatedProduct.title || id}`);

    return res.status(200).json({
      success: true,
      message: "ធ្វើបច្ចុប្បន្នភាពProductបានជោគជ័យ",
      data: updatedProduct
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const ProductList = await readJsonFile(PRODUCT_FILE_PATH, []);
    const productToDelete = ProductList.find(s => s.id === parseInt(id) || s.id === id);

    if (!productToDelete) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញProductដែលត្រូវលុបឡើយ!" });
    }

    if (productToDelete.img) {
      try {
        await deleteFile(`${UPLOADS_DIR}/${productToDelete.img}`, `uploads: deleted img due to service deletion ${productToDelete.img}`);
      } catch (e) {
        console.log("Image not found on GitHub storage, skipping delete:", e.message);
      }
    }

    if (productToDelete.file) {
      try {
        await deleteFile(`${UPLOADS_DIR}/${productToDelete.file}`, `uploads: deleted file due to service deletion ${productToDelete.file}`);
      } catch (e) {
        console.log("File not found on GitHub storage, skipping delete:", e.message);
      }
    }

    const filteredCreator = ProductList.filter(s => s.id !== productToDelete.id);
    await writeJsonFile(PRODUCT_FILE_PATH, filteredCreator, `Services: deleted service with ID ${id}`);

    return res.status(200).json({
      success: true,
      message: "លុបProduct និងហ្វាល់ពាក់ព័ន្ធបានជោគជ័យ"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.getAllProduct = async (req, res) => {
    try {
      let product = await readJsonFile(PRODUCT_FILE_PATH, []);
      const { search, cat_id, status, page, limit } = req.query;
  
      if (search) {
        const searchLower = search.toLowerCase();
        product = product.filter(s => 
          (s.name && s.name.toLowerCase().includes(searchLower)) ||
          (s.des && s.des.toLowerCase().includes(searchLower))
        );
      }
  
      if (cat_id) {
        product = product.filter(s => String(s.cat_id) === String(cat_id));
      }
  
      if (status) {
        product = product.filter(s => String(s.status) === String(status));
      }
  
      product.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
      const formattedProduct = product.map(s => ({
        ...s,
        created_at: formatBackendDate(s.created_at),
        updated_at: formatBackendDate(s.updated_at)
      }));
  
      const totalItems = formattedProduct.length;
  
      if (page || limit) {
        const currentPage = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
  
        const paginatedData = formattedProduct.slice(startIndex, endIndex);
  
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
        data: formattedProduct
      });
  
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message
      });
    }
};

exports.getAllProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readJsonFile(PRODUCT_FILE_PATH, []);
    const product = products.find(s => String(s.id) === String(id)); 

    if (!product) { 
      return res.status(404).json({ success: false, message: "រកមិនឃើញProductនេះឡើយ" });
    }
    
    const formattedProduct = {
      ...product,
      created_at: formatBackendDate(product.created_at),
      updated_at: formatBackendDate(product.updated_at)
    };

    return res.json({
      success: true,
      data: formattedProduct
    });
    
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};