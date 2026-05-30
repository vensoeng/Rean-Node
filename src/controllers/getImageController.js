// const dotenv = require("dotenv");
// dotenv.config();

// const axios = require("axios");

// const USERNAME = process.env.OWNER || "vensoeng";
// const REPO = process.env.REPO || "storage";
// const BRANCH = process.env.BRANCH || "main";
// const UPLOADS_DIR = process.env.UPLOADS_DIR || "storage";

// exports.getImages = async (req, res) => {

//     try {

//         const filename = req.params.filename;

//         const githubApiUrl =
//             `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${UPLOADS_DIR}/${filename}?ref=${BRANCH}`;

//         const response = await axios.get(githubApiUrl, {
//             headers: {
//                 Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
//                 Accept: "application/vnd.github.v3.raw"
//             },
//             responseType: "arraybuffer"
//         });

//         res.set("Content-Type", "image/jpeg");

//         res.send(response.data);

//     } catch (error) {

//         console.log(error.response?.data || error.message);

//         res.status(500).json({
//             success: false,
//             message: "Image not found"
//         });

//     }

// };

const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const path = require("path"); // 📌 បន្ថែម Node.js path module ដើម្បីឆែកកន្ទុយហ្វាយ

const USERNAME = process.env.OWNER || "vensoeng";
const REPO = process.env.REPO || "storage";
const BRANCH = process.env.BRANCH || "main";
const UPLOADS_DIR = process.env.UPLOADS_DIR || "storage";

exports.getImages = async (req, res) => {
    try {
        const filename = req.params.filename;
        
        // 🎯 ១. រកមើលកន្ទុយហ្វាយ (ឧទាហរណ៍៖ .jpg, .html, .png)
        const ext = path.extname(filename).toLowerCase();

        const githubApiUrl =
            `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${UPLOADS_DIR}/${filename}?ref=${BRANCH}`;

        // 🎯 ២. កំណត់លក្ខខណ្ឌ Response Type ទៅតាមប្រភេទហ្វាយ
        // បើជា .html យកប្រភេទ 'text' ឬ 'string' បើជារូបភាពយក 'arraybuffer'
        const isHtml = ext === '.html' || ext === '.htm';
        
        const response = await axios.get(githubApiUrl, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3.raw"
            },
            responseType: isHtml ? "text" : "arraybuffer"
        });

        // 🎯 ៣. កំណត់ Content-Type ទៅតាមប្រភេទហ្វាយពិតប្រាកដ
        if (isHtml) {
            res.set("Content-Type", "text/html; charset=utf-8");
        } else if (ext === '.png') {
            res.set("Content-Type", "image/png");
        } else if (ext === '.gif') {
            res.set("Content-Type", "image/gif");
        } else {
            res.set("Content-Type", "image/jpeg"); // default សម្រាប់ .jpg / .jpeg
        }

        // ៤. បញ្ជូនទិន្នន័យទៅកាន់ Frontend
        res.send(response.data);

    } catch (error) {
        console.log(error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "File or Image not found"
        });
    }
};