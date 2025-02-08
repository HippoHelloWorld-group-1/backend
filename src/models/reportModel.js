import db from "../config/database.js"


export const createReport = async (detail, userEmail, roomId, buildingId, problemStartAt, problemEndAt) => {
    const [result] = await db.promise().query(
      `INSERT INTO Report (detail, userEmail, roomId, buildingId, problem_start_at, problem_end_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [detail, userEmail, roomId, buildingId, problemStartAt, problemEndAt]
    );
  
    return { success: result.affectedRows > 0, message: "Report created successfully." };
  };
  
  

export const getAllReports = async () => {
    const [rows] = await db.promise().query(`SELECT * FROM Report ORDER BY problem_start_at DESC`);
    return rows;
  };

  