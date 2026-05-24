
const dotenv = require("dotenv");
dotenv.config();

const Post = require("../models/post");
const { readJsonFile, writeJsonFile } = require("../utils/githubJsonStore");

const POSTS_FILE_PATH = process.env.POSTS_FILE_PATH || "src/db/posts.json";