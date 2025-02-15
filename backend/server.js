const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require('http');
const authRoutes = require("./routes/auth");
const aiRoutes = require("./routes/ai");
const quizRoutes = require("./routes/quiz");
const assignmentRoutes = require("./routes/assignments");
const path = require("path");
require("dotenv").config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: ['http://localhost:5001', 'http://127.0.0.1:5001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(bodyParser.json());

// Increase payload size limit for file uploads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '../')));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/assignments", assignmentRoutes);

// Serve index.html for the root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Handle all other routes by serving index.html (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = http.createServer(app);

// Handle server startup
function startServer(port) {
    return new Promise((resolve, reject) => {
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
            resolve(port);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is busy, trying ${port + 1}`);
                resolve(startServer(port + 1));
            } else {
                console.error('Server error:', err);
                reject(err);
            }
        });
    });
}

// Start server and handle errors
startServer(PORT).then(actualPort => {
    if (actualPort !== PORT) {
        console.log(`Note: Server is running on port ${actualPort} instead of ${PORT}`);
    }
}).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
