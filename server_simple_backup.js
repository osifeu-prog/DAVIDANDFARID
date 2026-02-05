const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Route for health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        message: "David & Farid Tax Refund System",
        version: "1.0.0"
    });
});

// Route for stats
app.get("/api/stats", (req, res) => {
    res.json({
        total_simple: 10,
        total_detailed: 5,
        total_submissions: 15,
        total_refund: 45000,
        total_commission: 4500
    });
});

// Serve HTML pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/form25.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "form25.html"));
});

app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Handle simple form submissions
app.post("/api/submit", (req, res) => {
    console.log("Simple form submission received:", req.body);
    
    const submissionId = "SUB-" + Date.now();
    const estimatedRefund = 2500 + Math.floor(Math.random() * 5000);
    const commission = Math.floor(estimatedRefund * 0.1);
    
    res.json({
        success: true,
        message: "הטופס התקבל בהצלחה!",
        submission_id: submissionId,
        estimated_refund: estimatedRefund,
        commission: commission
    });
});

// Handle extended form submissions - גרסה פשוטה שעובדת
app.post("/api/submit25", (req, res) => {
    console.log("Extended form submission received:", req.body);
    
    const submissionId = "SUB25-" + Date.now();
    
    // Calculate estimated refund
    let estimatedRefund = 3000; // Base amount
    
    // Add bonuses based on form data
    if (req.body.monthlyIncome && req.body.monthlyIncome.includes("20000+")) {
        estimatedRefund += 2000;
    }
    if (req.body.children && req.body.children !== "0") {
        estimatedRefund += 1000 * parseInt(req.body.children);
    }
    if (req.body.workYears && req.body.workYears.includes("20+")) {
        estimatedRefund += 1500;
    }
    
    // Add randomness
    estimatedRefund += Math.floor(Math.random() * 3000);
    
    // Calculate commission (10%)
    const commission = Math.floor(estimatedRefund * 0.1);
    
    // Just log and return success - no database
    console.log("Form data saved (simulated)");
    
    res.json({
        success: true,
        message: "טופס מורחב התקבל בהצלחה! נציג יצור איתך קשר בתוך 24 שעות.",
        submission_id: submissionId,
        estimated_refund: estimatedRefund,
        commission: commission
    });
});

// Mock APIs for dashboard
app.get("/api/submissions", (req, res) => {
    const mockData = [
        {
            id: 1,
            submission_id: "SUB-12345",
            created_at: "2024-01-15T10:30:00Z",
            client_name: "דוד לוי",
            client_phone: "050-1234567",
            client_email: "david@example.com",
            estimated_refund: 4500,
            status: "new"
        },
        {
            id: 2,
            submission_id: "SUB-12346",
            created_at: "2024-01-14T14:20:00Z",
            client_name: "שרה כהן",
            client_phone: "052-7654321",
            client_email: "sarah@example.com",
            estimated_refund: 3200,
            status: "new"
        }
    ];
    res.json(mockData);
});

app.get("/api/submissions25", (req, res) => {
    const mockData = [
        {
            id: 1,
            submission_id: "SUB25-12345",
            created_at: "2024-01-15T10:30:00Z",
            fullName: "ארז כהן",
            phone: "050-1111111",
            email: "erez@example.com",
            estimated_refund: 8680,
            status: "new"
        }
    ];
    res.json(mockData);
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log(`📋 Form25: http://localhost:${PORT}/form25.html`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
    console.log(`🎯 Forms are working! Database is mocked for now.`);
});
