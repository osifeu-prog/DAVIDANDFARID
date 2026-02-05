const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5001;

// Connect to database
const db = new sqlite3.Database("./database.db");

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
    db.get("SELECT COUNT(*) as total_simple FROM submissions", [], (err, simpleResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        
        db.get("SELECT COUNT(*) as total_detailed FROM submissions25", [], (err, detailedResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }
            
            const totalSimple = simpleResult.total_simple || 0;
            const totalDetailed = detailedResult.total_detailed || 0;
            const totalSubmissions = totalSimple + totalDetailed;
            const totalRefund = 45000; // Temporary
            const totalCommission = 4500; // Temporary
            
            res.json({
                total_simple: totalSimple,
                total_detailed: totalDetailed,
                total_submissions: totalSubmissions,
                total_refund: totalRefund,
                total_commission: totalCommission
            });
        });
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
    
    // Save to database
    db.run(
        `INSERT INTO submissions (submission_id, client_name, client_phone, client_email, estimated_refund, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            submissionId,
            req.body.client_name,
            req.body.client_phone,
            req.body.client_email,
            estimatedRefund,
            "new"
        ],
        function(err) {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                    success: false,
                    message: "שגיאה בשמירת הנתונים"
                });
            }
            
            res.json({
                success: true,
                message: "הטופס התקבל בהצלחה!",
                submission_id: submissionId,
                estimated_refund: estimatedRefund,
                commission: commission
            });
        }
    );
});

// Handle extended form submissions (הטופס המורחב) - הפתרון לבעיה שלך!
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
    
    // Prepare form data with defaults - כולל את כל השדות מהטבלה
    const formData = {
        fullName: req.body.fullName || "",
        phone: req.body.phone || "",
        email: req.body.email || "",
        idNumber: req.body.idNumber || "",
        personalStatus: req.body.personalStatus || "",
        children: req.body.children || "",
        monthlyIncome: req.body.monthlyIncome || "",
        employmentType: req.body.employmentType || "",
        carExpenses: req.body.carExpenses || "",
        medicalExpenses: req.body.medicalExpenses || "",
        donations: req.body.donations || "",
        education: req.body.education || "",
        workYears: req.body.workYears || "",
        mortgage: req.body.mortgage || "",
        socialBenefits: req.body.socialBenefits || "",
        investments: req.body.investments || "",
        pension: req.body.pension || "",
        travelAbroad: req.body.travelAbroad || "", // זה היה חסר!
        rental: req.body.rental || "",
        student: req.body.student || "",
        disability: req.body.disability || "",
        hitech: req.body.hitech || "",
        workFromHome: req.body.workFromHome || "",
        financeEducation: req.body.financeEducation || "",
        loans: req.body.loans || "",
        government: req.body.government || "",
        childrenSavings: req.body.childrenSavings || "",
        lastCalculation: req.body.lastCalculation || ""
    };
    
    // Save to database - עכשיו עם 31 ערכים ל-31 עמודות
    db.run(
        `INSERT INTO submissions25 (
            submission_id, created_at, fullName, phone, email, idNumber, personalStatus, children,
            monthlyIncome, employmentType, carExpenses, medicalExpenses, donations, education,
            workYears, mortgage, socialBenefits, investments, pension, travelAbroad, rental,
            student, disability, hitech, workFromHome, financeEducation, loans, government,
            childrenSavings, lastCalculation, estimated_refund, status
        ) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            submissionId,
            formData.fullName,
            formData.phone,
            formData.email,
            formData.idNumber,
            formData.personalStatus,
            formData.children,
            formData.monthlyIncome,
            formData.employmentType,
            formData.carExpenses,
            formData.medicalExpenses,
            formData.donations,
            formData.education,
            formData.workYears,
            formData.mortgage,
            formData.socialBenefits,
            formData.investments,
            formData.pension,
            formData.travelAbroad, // הוספנו את travelAbroad
            formData.rental,
            formData.student,
            formData.disability,
            formData.hitech,
            formData.workFromHome,
            formData.financeEducation,
            formData.loans,
            formData.government,
            formData.childrenSavings,
            formData.lastCalculation,
            estimatedRefund,
            "new"
        ],
        function(err) {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                    success: false,
                    message: "שגיאה בשמירת הנתונים במסד הנתונים: " + err.message
                });
            }
            
            res.json({
                success: true,
                message: "טופס מורחב התקבל בהצלחה! נציג יצור איתך קשר בתוך 24 שעות.",
                submission_id: submissionId,
                estimated_refund: estimatedRefund,
                commission: commission
            });
        }
    );
});

// Get all submissions for dashboard
app.get("/api/submissions", (req, res) => {
    db.all("SELECT * FROM submissions ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
    });
});

// Get extended form submissions
app.get("/api/submissions25", (req, res) => {
    const recent = req.query.recent;
    
    let query = "SELECT * FROM submissions25";
    
    if (recent) {
        query += " ORDER BY created_at DESC LIMIT 10";
    } else {
        query += " ORDER BY created_at DESC";
    }
    
    db.all(query, (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log(`📋 Form25: http://localhost:${PORT}/form25.html`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
});
