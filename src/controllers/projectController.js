const path = require("path");
const ProjectModel = require("../models/Project");
const { readJsonFile, writeJsonFile, uploadBufferFile, deleteFile } = require("../utils/githubJsonStore");
const { compressToTargetSize } = require("../config/imageProcessor");

const PROJECT_FILE_PATH = process.env.PROJECT_FILE_PATH || "data/portfolio/projects.json";
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

exports.createProject = async (req, res) => {
  try {
    const projectData = req.body;
    const { title } = projectData;

    let imageName = null;
    if (req.files?.img?.[0]?.buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: project img ${imageName}`);
    }

    const projectList = await readJsonFile(PROJECT_FILE_PATH, []);

    const newProject = {
      id: Date.now(),
      status: projectData.status === 'true' || projectData.status === true,
      user_id: req.user?.id || null, 
      service_id: parseInt(projectData.service_id),
      title: projectData.title,
      des: projectData.des,
      img: imageName,                 
      tags: projectData.tags || "",
      link: projectData.link || "",
      ifram: projectData.ifram || "",
      view_count: parseInt(projectData.view_count) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()              
    };

    projectList.push(newProject);
    
    await writeJsonFile(PROJECT_FILE_PATH, projectList, `Projects: created ${title || 'New Project demo'}`);

    return res.status(201).json({ 
      success: true,
      message: "បង្កើត Projects បានជោគជ័យ", 
      data: newProject 
    });

  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = req.body;

    const projectList = await readJsonFile(PROJECT_FILE_PATH, []);
    const projectIndex = projectList.findIndex(s => s.id === parseInt(id) || s.id === id);

    if (projectIndex === -1) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញ Projects ដែលត្រូវកែប្រែឡើយ!" });
    }

    const oldProject = projectList[projectIndex];

    let imageName = oldProject.img;
    if (req.files?.img?.[0]?.buffer) {
      const imgFile = req.files.img[0];
      const processed = await compressToTargetSize(imgFile.buffer, imgFile.mimetype);
      imageName = `${Date.now()}${processed.extension}`;
      
      await uploadBufferFile(`${UPLOADS_DIR}/${imageName}`, processed.buffer, `uploads: updated img ${imageName}`);

      if (oldProject.img) {
        try {
          await deleteFile(`${UPLOADS_DIR}/${oldProject.img}`, `uploads: deleted old img ${oldProject.img}`);
        } catch (e) {
          console.log("Error deleting old image:", e.message);
        }
      }
    }

    const updatedProject = {
      ...oldProject,       
      ...projectData,      
      img: imageName,      
      updated_at: new Date()
    };

    projectList[projectIndex] = updatedProject;
    await writeJsonFile(PROJECT_FILE_PATH, projectList, `Projects: updated ${updatedProject.title || id}`);

    return res.status(200).json({
      success: true,
      message: "ធ្វើបច្ចុប្បន្នភាព Projects បានជោគជ័យ",
      data: updatedProject
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};


exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectList = await readJsonFile(PROJECT_FILE_PATH, []);
    const projectToDelete = projectList.find(s => s.id === parseInt(id) || s.id === id);

    if (!projectToDelete) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញ Projects ដែលត្រូវលុបឡើយ!" });
    }

    if (projectToDelete.img) {
      try {
        await deleteFile(`${UPLOADS_DIR}/${projectToDelete.img}`, `uploads: deleted img due to project deletion ${projectToDelete.img}`);
      } catch (e) {
        console.log("Image not found on GitHub storage, skipping delete:", e.message);
      }
    }

    const filteredProjects = projectList.filter(s => s.id !== projectToDelete.id);
    await writeJsonFile(PROJECT_FILE_PATH, filteredProjects, `Projects: deleted project with ID ${id}`);

    return res.status(200).json({
      success: true,
      message: "លុប Projects និងហ្វាល់ពាក់ព័ន្ធបានជោគជ័យ"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};


// Helper function to shuffle an array randomly
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

exports.getAllProjects = async (req, res) => {
  try {
    let projects = await readJsonFile(PROJECT_FILE_PATH, []);

    const { search, service_id, status, page, limit, random } = req.query;

    // 1. Search filter (handles both 'description' and 'des')
    if (search) {
      const searchLower = search.toLowerCase();
      projects = projects.filter(s => 
        (s.title && s.title.toLowerCase().includes(searchLower)) ||
        (s.title_kh && s.title_kh.toLowerCase().includes(searchLower)) ||
        (s.des && s.des.toLowerCase().includes(searchLower)) ||
        (s.description && s.description.toLowerCase().includes(searchLower))
      );
    }

    // 2. Category filter
    if (service_id) {
      const catIdsArray = String(service_id).split(',').map(id => id.trim());
      projects = projects.filter(s => catIdsArray.includes(String(s.service_id)));
    }

    // 3. Status filter (safely converts boolean or string status to string)
    if (status !== undefined) {
      projects = projects.filter(s => String(s.status) === String(status));
    }

    // 4. Sorting / Randomizing
    if (random === 'true') {
      projects = shuffleArray(projects);
    } else {
      projects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // 5. Formatting dates
    const formattedProjects = projects.map(s => ({
      ...s,
      created_at: formatBackendDate(s.created_at),
      updated_at: formatBackendDate(s.updated_at)
    }));

    const totalItems = formattedProjects.length;

    // 6. Pagination
    if (page || limit) {
      const currentPage = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      const paginatedData = formattedProjects.slice(startIndex, endIndex);

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
      data: formattedProjects
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

exports.getAllProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await readJsonFile(PROJECT_FILE_PATH, []);
    const project = projects.find(s => String(s.id) === String(id));

    if (!project) {
      return res.status(404).json({ success: false, message: "រកមិនឃើញ projects នេះឡើយ" });
    }
    
    const formattedProject = {
      ...project,
      created_at: formatBackendDate(project.created_at),
      updated_at: formatBackendDate(project.updated_at)
    };

    return res.json({
      success: true,
      data: formattedProject
    });
    
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
