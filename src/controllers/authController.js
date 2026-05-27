const dotenv = require("dotenv");
dotenv.config();

const path = require("path");
const UPLOADS_DIR = process.env.UPLOADS_DIR || "storage";
const User = require("../models/User");
const SECRET = process.env.SECRET || "npx123";
const USERS_FILE_PATH = process.env.USERS_FILE_PATH || "data/portfolio/users.json";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readJsonFile, writeJsonFile, uploadBufferFile } = require("../utils/githubJsonStore");

const { compressToTargetSize } = require("../config/imageProcessor");
const makeImageName = (ext) => {
  return `${Date.now()}${ext}`;
};


// exports.register = async (req, res) => {

//   try {

//     const { email, password } = req.body;

//     // validation
//     if (!email || !password) {
//       return res.status(400).json({
//         message: "email and password required"
//       });
//     }

//     const users = await readJsonFile(USERS_FILE_PATH, []);

//     // check existing user
//     const exist = users.find(
//       u => u.email === email
//     );

//     if (exist) {
//       return res.status(400).json({
//         message: "User already exists"
//       });
//     }

//     const { username, firstName, lastName, bio, gender, birthday, role = 2 } = req.body;

//     // hash password
//     const hash = await bcrypt.hash(password, 10);

//     let imageName = null;
//     if (req.file?.buffer) {
//       const processed = await compressToTargetSize(req.file.buffer, req.file.mimetype);
//       imageName = makeImageName(processed.extension);
//       const githubImagePath = `${UPLOADS_DIR}/${imageName}`;
//       await uploadBufferFile(githubImagePath, processed.buffer, `uploads: create ${imageName}`);
//     }

//     // create user
//     const id = Date.now();
//     const newUser = new User(
//       id,
//       username,
//       firstName,
//       lastName,
//       imageName,
//       bio,
//       gender,
//       birthday,
//       email,
//       hash,
//       role
//     );

//     // generate access token (short-lived)
//     const accessToken = jwt.sign(
//       {
//         id: newUser.id,
//         email: newUser.email,
//         username: newUser.username,
//         role: newUser.role
//       },
//       SECRET,
//       { expiresIn: "30m" }
//     );

//     // generate refresh token (long-lived)
//     const refreshToken = jwt.sign(
//       {
//         id: newUser.id,
//         email: newUser.email
//       },
//       SECRET,
//       { expiresIn: "7d" }
//     );

//     // add refresh token to user
//     newUser.refreshToken = refreshToken;
//     users.push(newUser);
//     await writeJsonFile(USERS_FILE_PATH, users, `users: register ${newUser.email}`);

//     res.status(201).json({
//       message: "User created",
//       accessToken,
//       refreshToken,
//       user: {
//         id: newUser.id,
//         email: newUser.email,
//         username: newUser.username,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//         pr_img: newUser.pr_img,
//         bio: newUser.bio,
//         gender: newUser.gender,
//         birthday: newUser.birthday,
//         role: newUser.role
//       }
//     });

//   } catch (err) {

//     res.status(500).json({
//       message: "Server error"
//     });

//   }
// };

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        message: "email and password required"
      });
    }

    const users = await readJsonFile(USERS_FILE_PATH, []);

    // find user
    const user = users.find(
      u => u.email === email
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // compare password
    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        message: "Wrong password"
      });
    }

    // generate access token (short-lived)
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      SECRET,
      { expiresIn: "30m" }
    );

    // generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      SECRET,
      { expiresIn: "7d" }
    );

    // save refresh token to user
    user.refreshToken = refreshToken;
    await writeJsonFile(USERS_FILE_PATH, users, `users: login ${user.email}`);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        pr_img: user.pr_img,
        bio: user.bio,
        gender: user.gender,
        birthday: user.birthday,
        role: user.role
      }
    });

  } catch (err) {

    res.status(500).json({
      message: "Server error"
    });

  }
};

//get only user data
exports.me = (req, res) => {
  try {
    res.json({
      message: "User data fetched successfully",
      user: req.user
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.dashboard = (req, res) => {
  try {
    res.json({
      message: "Dashboard access granted",
      user: req.user
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token required"
      });
    }

    // verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired refresh token"
      });
    }

    const users = await readJsonFile(USERS_FILE_PATH, []);
    const user = users.find(u => u.id === decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found or invalid"
      });
    }

    // generate new access token
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        pr_img: user.pr_img,
        bio: user.bio,
        gender: user.gender,
        birthday: user.birthday
      },
      SECRET,
      { expiresIn: "30m" }
    );

    res.json({
      accessToken: newAccessToken,
      message: "Token refreshed successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await readJsonFile(USERS_FILE_PATH, []);
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].refreshToken = null;
      await writeJsonFile(USERS_FILE_PATH, users, `users: logout ${users[userIndex].email}`);
    }

    res.json({
      message: "Logged out successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
};