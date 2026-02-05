const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/test", (req, res) => {
    res.json({ message: "Test endpoint works!" });
});

// Serve HTML files
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/form25.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "form25.html"));
});

app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Start server on all network interfaces
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`🌐 Access locally: http://localhost:${PORT}`);
    console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
});
