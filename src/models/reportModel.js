import db from "../config/database.js"

// db.run(`CREATE TABLE IF NOT EXISTS reports (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     report_date TEXT,
//     area TEXT,
//     room TEXT,
//     text TEXT
// )`);

export const addReport = (report_date, area, room, text, callback) => {
    const stmt = db.prepare("INSERT INTO reports (report_date, area, room, text) VALUES (?, ?, ?, ?)");
    stmt.run(report_date, area, room, text, function (err) {
        callback(err, this?.lastID);
    });
    stmt.finalize();
};

export const getAllReports = (callback) => {
    db.all("SELECT * FROM reports", [], (err, rows) => {
        callback(err, rows);
    });
};

