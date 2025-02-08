import db from "../config/database.js"


export const createReport = async (detail, userEmail, roomId, buildingId, problemStartAt, problemEndAt) => {
    // check if user has use the website before
    const [userCheck] = await db.promise().query(
      `SELECT email FROM User WHERE email = ?`,
      [userEmail]
    );
  
    // if user never use
    if (userCheck.length === 0) {
      return { success: false, message: "Error: User email not found in the system. Please register first." };
    }
  
    const [result] = await db.promise().query(
      `INSERT INTO Report (detail, userEmail, roomId, buildingId, problem_start_at, problem_end_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [detail, userEmail, roomId || null, buildingId, problemStartAt, problemEndAt]
    );
  
    return { success: result.affectedRows > 0, message: "Report created successfully." };
  };

export const getAllReports = async () => {
    const [rows] = await db.promise().query(`SELECT * FROM Report ORDER BY report_start_at DESC`);
    return rows;
};
  

  