const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');

const path = require('path');



const app = express();

const allowedOrigins = [
    // 'http://localhost:3000',
    // 'http://127.0.0.1:3000',
    // 'http://localhost:5173',
    // 'http://127.0.0.1:5173',
    'https://vensoeng.vercel.app',
    'https://vensoeng.free.nf',
    process.env.FRONTEND_URL
].filter(Boolean);

// app.use(cors({
//     origin: function (origin, callback) {
//         // allow mobile apps or server-to-server
//         if (!origin) return callback(null, true);

//         if (allowedOrigins.includes(origin)) {
//             return callback(null, true);
//         }

//         return callback(new Error('CORS blocked: ' + origin));
//     },
//     credentials: true
// }));

app.use(cors({
    origin: function (origin, callback) {
        // allow mobile apps or server-to-server
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('CORS blocked: ' + origin));
    },
    credentials: true,
    // 👇 ADDED THIS LINE: Crucial to stop iPhone/Safari from throwing CORS errors
    allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent', 'X-Requested-With']
}));

app.use(express.json());
app.use("/auth", require('./src/routes/auth'));
app.use("/blogs", require('./src/routes/blog'));
app.use("/images", require('./src/routes/images'));
// app.use("/items", require('./src/routes/item'));

app.get("/", (req, res) => {  
    res.send("Welcome to the API - Node.js MVC Pattern Learning");
});

const PORT = process.env.PORT || 5000;

// Function to start the server
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
}

startServer();

module.exports = app;