import db from "../config/database.js"


export const createReport = async (detail, userEmail, roomId, buildingId, reportStartAt, reportEndAt) => {
    const [result] = await db.promise().query(
      `INSERT INTO Report (detail, userEmail, roomId, buildingId, report_start_at, report_end_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [detail, userEmail, roomId, buildingId, reportStartAt, reportEndAt]
    );
  
    return { success: result.affectedRows > 0, message: "Report created successfully." };
  };
  

export const getAllReports = async () => {
    const [rows] = await db.promise().query(`SELECT * FROM Report ORDER BY report_start_at DESC`);
    return rows;
  };

  