const dotenv = require("dotenv");
dotenv.config();

const axios = require("axios");

const USERNAME = process.env.OWNER || "vensoeng";
const REPO = process.env.REPO || "storage";
const BRANCH = process.env.BRANCH || "main";
const UPLOADS_DIR = process.env.UPLOADS_DIR || "storage";

exports.getImages = async (req, res) => {

    try {

        const filename = req.params.filename;

        const githubApiUrl =
            `https://api.github.com/repos/${USERNAME}/${REPO}/contents/${UPLOADS_DIR}/${filename}?ref=${BRANCH}`;

        const response = await axios.get(githubApiUrl, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3.raw"
            },
            responseType: "arraybuffer"
        });

        res.set("Content-Type", "image/jpeg");

        res.send(response.data);

    } catch (error) {

        console.log(error.response?.data || error.message);

        res.status(500).json({
            success: false,
            message: "Image not found"
        });

    }

};