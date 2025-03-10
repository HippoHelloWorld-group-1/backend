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

// export const getAllReports = async () => {
//     const [rows] = await db.promise().query(`SELECT * FROM Report ORDER BY problem_start_at DESC`);
//     return rows;
// };

export const getAllReports = async () => {
    const [rows] = await db.promise().query(`
        SELECT 
            Report.id,
            Report.detail,
            Report.problem_start_at,
            Report.problem_end_at,
            Report.userEmail,
            Room.roomName,
            Building.buildingName
        FROM Report
        LEFT JOIN Room ON Report.roomId = Room.id
        JOIN Building ON Report.buildingId = Building.id
        ORDER BY Report.problem_start_at DESC
    `);
    return rows;
};

  

  