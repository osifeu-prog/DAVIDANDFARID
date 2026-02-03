const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const sqlite3 = require("sqlite3").verbose();
const XLSX = require("xlsx");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("public"));

// Database setup
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
        initializeDatabase();
    }
});

function initializeDatabase() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            submission_id TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            client_name TEXT,
            client_phone TEXT,
            client_email TEXT,
            was_employee_last_6_years TEXT,
            fired_or_resigned TEXT,
            work_accident TEXT,
            paid_income_tax TEXT,
            changed_jobs TEXT,
            multiple_jobs TEXT,
            unemployment_maternity_unpaid TEXT,
            redeemed_pension_fund TEXT,
            received_severance TEXT,
            retired TEXT,
            paid_real_estate_tax TEXT,
            special_needs_child TEXT,
            parent_support_payment TEXT,
            lives_periphery TEXT,
            pension_deposit TEXT,
            military_academic_completed TEXT,
            forex_securities_trading TEXT,
            disability_over_90 TEXT,
            single_parent_alimony TEXT,
            public_institution_donation TEXT,
            life_insurance_payment TEXT,
            stock_market_loss TEXT,
            long_term_abroad TEXT,
            new_immigrant_foreign_investor TEXT,
            real_estate_landlord TEXT,
            additional_notes TEXT,
            estimated_refund INTEGER,
            status TEXT DEFAULT "new"
        )
    `;

    db.run(createTableSQL, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Submissions table ready.");
        }
    });
}

// API Routes
app.post("/api/submit", (req, res) => {
    const formData = req.body;
    const submissionId = "SUB" + Date.now() + Math.random().toString(36).substr(2, 9);

    // Calculate estimated refund
    const yesCount = Object.values(formData).filter(val => val === "כן").length;
    const estimatedRefund = yesCount * 500;

    const insertSQL = `
        INSERT INTO submissions (
            submission_id, client_name, client_phone, client_email,
            was_employee_last_6_years, fired_or_resigned, work_accident,
            paid_income_tax, changed_jobs, multiple_jobs,
            unemployment_maternity_unpaid, redeemed_pension_fund,
            received_severance, retired, paid_real_estate_tax,
            special_needs_child, parent_support_payment, lives_periphery,
            pension_deposit, military_academic_completed,
            forex_securities_trading, disability_over_90,
            single_parent_alimony, public_institution_donation,
            life_insurance_payment, stock_market_loss, long_term_abroad,
            new_immigrant_foreign_investor, real_estate_landlord,
            additional_notes, estimated_refund
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        submissionId,
        formData.client_name,
        formData.client_phone,
        formData.client_email,
        formData.was_employee_last_6_years,
        formData.fired_or_resigned,
        formData.work_accident,
        formData.paid_income_tax,
        formData.changed_jobs,
        formData.multiple_jobs,
        formData.unemployment_maternity_unpaid,
        formData.redeemed_pension_fund,
        formData.received_severance,
        formData.retired,
        formData.paid_real_estate_tax,
        formData.special_needs_child,
        formData.parent_support_payment,
        formData.lives_periphery,
        formData.pension_deposit,
        formData.military_academic_completed,
        formData.forex_securities_trading,
        formData.disability_over_90,
        formData.single_parent_alimony,
        formData.public_institution_donation,
        formData.life_insurance_payment,
        formData.stock_market_loss,
        formData.long_term_abroad,
        formData.new_immigrant_foreign_investor,
        formData.real_estate_landlord,
        formData.additional_notes || "",
        estimatedRefund
    ];

    db.run(insertSQL, params, function(err) {
        if (err) {
            console.error("Error inserting submission:", err.message);
            res.status(500).json({ error: "שגיאה בשמירת הטופס" });
        } else {
            res.json({
                success: true,
                message: "הטופס נשלח בהצלחה!",
                submission_id: submissionId,
                estimated_refund: estimatedRefund,
                commission: estimatedRefund * 0.1
            });
        }
    });
});

app.get("/api/submissions", (req, res) => {
    const sql = "SELECT * FROM submissions ORDER BY created_at DESC";

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching submissions:", err.message);
            res.status(500).json({ error: "שגיאה בקבלת הנתונים" });
        } else {
            res.json(rows);
        }
    });
});

app.get("/api/export/excel", (req, res) => {
    const sql = "SELECT * FROM submissions";

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching submissions:", err.message);
            res.status(500).json({ error: "שגיאה בקבלת הנתונים" });
        } else if (rows.length === 0) {
            res.status(404).json({ error: "אין נתונים לייצוא" });
        } else {
            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");

            const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=submissions.xlsx");
            res.send(buffer);
        }
    });
});

app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});
