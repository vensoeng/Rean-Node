const path = require("path");
const Blog = require("../models/Blogs");
const { readJsonFile, writeJsonFile, uploadBufferFile , deleteFile} = require("../utils/githubJsonStore");
const { compressToTargetSize } = require("../config/imageProcessor");

const BLOGS_FILE_PATH = process.env.BLOGS_FILE_PATH || "data/portfolio/blogs.json";
const UPLOADS_DIR = process.env.UPLOADS_DIR || "storage";

const makeFileName = (ext) => `${Date.now()}${ext}`;

exports.createBlog = async (req, res) => {
  try {
    const { status, title, des, detail, main_hastag, hastag } = req.body;

    if (!title) {
      return res.status(400).json({ message: "ចំណងជើងមិនអាចទទេបានទេ!" });
    }

    let imageName = null;
    if (req.files?.img?.[0]?.buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: blog img ${imageName}`);
    }

    let htmlFileName = null;
    if (req.files?.file?.[0]?.buffer) {
      const blogFile = req.files.file[0];
      const fileExt = path.extname(blogFile.originalname) || ".html";
      htmlFileName = `${Date.now()}${fileExt}`;
      
      // Upload file ទៅកាន់ GitHub
      await uploadBufferFile(`${UPLOADS_DIR}/${htmlFileName}`, blogFile.buffer, `uploads: blog file ${htmlFileName}`);
    }

    const blogs = await readJsonFile(BLOGS_FILE_PATH, []);

    const newBlog = new Blog(
      Date.now(),
      req.user.id,
      status || 0,
      title,
      des,
      detail,
      main_hastag,
      hastag,
      imageName,     
      htmlFileName,
      new Date(),
      new Date()
    );

    blogs.push(newBlog);
    await writeJsonFile(BLOGS_FILE_PATH, blogs, `blogs: created ${title}`);

    res.status(201).json({ message: "បង្កើត Blog បានជោគជ័យ", blog: newBlog });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blogs = await readJsonFile(BLOGS_FILE_PATH, []);
    const blogIndex = blogs.findIndex(b => b.id === Number(req.params.id));

    if (blogIndex === -1) return res.status(404).json({ message: "Blog not found" });

    const currentBlog = blogs[blogIndex];

    if (currentBlog.user_id !== req.user.id && Number(req.user.role) !== 1) {
      return res.status(403).json({ message: "Unauthorized to edit this blog" });
    }

    const { status, title, des, detail, main_hastag, hastag, htmlContent } = req.body;

    let imageName = currentBlog.img;
    if (req.files?.img?.[0]?.buffer) {

      if (currentBlog.img && deleteFile) {
        try {
          const oldImgPath = `${UPLOADS_DIR}/${currentBlog.img}`;
          await deleteFile(oldImgPath, `uploads: delete old img ${currentBlog.img}`);
        } catch (imgDelErr) {
          console.error("មិនអាចលុបរូបភាពចាស់បានទេ ប៉ុន្តែនឹងបន្តដំណើរការទៅមុខទៀត:", imgDelErr.message);
        }
      }

      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = makeFileName(processed.extension); // បង្កើតឈ្មោះជាលក្ខណៈ Timestamp (ឧទាហរណ៍៖ 1779761471541.png)
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: updated img ${imageName}`);
    }

    let htmlFileName = currentBlog.file;
    
    if (req.files?.file?.[0]?.buffer) {

      if (currentBlog.file && deleteFile) {
        try {
          const oldFilePath = `${UPLOADS_DIR}/${currentBlog.file}`;
          await deleteFile(oldFilePath, `uploads: delete old html ${currentBlog.file}`);
        } catch (fileDelErr) {
          console.error("មិនអាចលុបឯកសារ HTML ចាស់បានទេ:", fileDelErr.message);
        }
      }

      const blogFile = req.files.file[0];
      const fileExt = path.extname(blogFile.originalname) || ".html";
      htmlFileName = makeFileName(fileExt);
      await uploadBufferFile(`${UPLOADS_DIR}/${htmlFileName}`, blogFile.buffer, `uploads: updated html file ${htmlFileName}`);
    } 

    else if (htmlContent) {
      if (currentBlog.file && deleteFile) {
        try {
          const oldFilePath = `${UPLOADS_DIR}/${currentBlog.file}`;
          await deleteFile(oldFilePath, `uploads: delete old html ${currentBlog.file}`);
        } catch (fileDelErr) {
          console.error("មិនអាចលុបឯកសារ HTML ចាស់បានទេ:", fileDelErr.message);
        }
      }

      htmlFileName = makeFileName(".html");
      const htmlBuffer = Buffer.from(htmlContent, "utf-8");
      await uploadBufferFile(`${UPLOADS_DIR}/${htmlFileName}`, htmlBuffer, `uploads: updated html string ${htmlFileName}`);
    }

    blogs[blogIndex] = {
      ...currentBlog,
      status: status || currentBlog.status,
      title: title || currentBlog.title,
      des: des || currentBlog.des,
      detail: detail || currentBlog.detail,
      main_hastag: main_hastag || currentBlog.main_hastag,
      hastag: hastag || currentBlog.hastag,
      img: imageName,
      file: htmlFileName, 
      updated_at: new Date()
    };

    await writeJsonFile(BLOGS_FILE_PATH, blogs, `blogs: updated ${blogs[blogIndex].title}`);
    res.json({ message: "Blog updated successfully", blog: blogs[blogIndex] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// exports.getAllBlogs = async (req, res) => {
//   try {
//     const blogs = await readJsonFile(BLOGS_FILE_PATH, []);
//     res.json(blogs);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await readJsonFile(BLOGS_FILE_PATH, []);
    const limit = parseInt(req.query.limit);
    if (!isNaN(limit)) {

      return res.json(blogs.slice(0, limit));

    }
    res.json(blogs);
  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }

};

exports.getBlogById = async (req, res) => {
  try {
    const blogs = await readJsonFile(BLOGS_FILE_PATH, []);
    const blog = blogs.find(b => b.id === Number(req.params.id));

    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blogs = await readJsonFile(BLOGS_FILE_PATH, []);
    const blog = blogs.find(b => b.id === Number(req.params.id));

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.user_id !== req.user.id && Number(req.user.role) !== 1) {
      return res.status(403).json({ message: "Unauthorized to delete this blog" });
    }

    if (blog.img && deleteFile) {
      try {
        const imgPath = `${UPLOADS_DIR}/${blog.img}`;
        await deleteFile(imgPath, `uploads: delete blog img ${blog.img} due to blog deletion`);
      } catch (imgDelErr) {
        console.error("មិនអាចលុបរូបភាពចេញពី GitHub បានទេ ប៉ុន្តែនឹងបន្តទៅមុខទៀត:", imgDelErr.message);
      }
    }

    if (blog.file && deleteFile) {
      try {
        const filePath = `${UPLOADS_DIR}/${blog.file}`;
        await deleteFile(filePath, `uploads: delete blog file ${blog.file} due to blog deletion`);
      } catch (fileDelErr) {
        console.error("មិនអាចលុបឯកសារ HTML ចេញពី GitHub បានទេ ប៉ុន្តែនឹងបន្តទៅមុខទៀត:", fileDelErr.message);
      }
    }

    const updatedBlogs = blogs.filter(b => b.id !== Number(req.params.id));
    await writeJsonFile(BLOGS_FILE_PATH, updatedBlogs, `blogs: deleted ID ${req.params.id}`);

    res.json({ message: "Blog and associated files deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};