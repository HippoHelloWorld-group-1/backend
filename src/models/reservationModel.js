import db from "../config/database.js";


export const getOrCreateUserIdByEmail = async (firstName,lastName,email) => {
  // Check if the user exists
  const checkQuery = "SELECT id FROM User WHERE email = ?";
  const [rows] = await db.promise().query(checkQuery, [email]);

  if (rows.length > 0) {
    return rows[0].id; // Return existing user ID
  }
 
  // If user doesn't exist, insert them
  const insertQuery = "INSERT INTO User (firstName,lastName,email,createdAt, updatedAt) VALUES (?,?,?,NOW(), NOW())";   
  const [result] = await db.promise().query(insertQuery, [firstName,lastName,email]);

  return result.insertId; // Return newly created user ID
};



// Insert a new reservation
export const createReservation = async (title, description, reservationStart, reservationEnd,roomId, userId, key) => {
  await db.promise().query(`
    INSERT INTO Reservation (title, description, reservationStart, reservationEnd, roomId, userId, status, reservationKey, createdAt, updatedAt)
    VALUES (?,?,?,?,?, ?, 'pending', ?, NOW(), NOW())`,
    [title, description, reservationStart, reservationEnd,roomId, userId, key]
  )
};

// Update reservation status
export const updateReservationStatus = async (key, status) => {
  return await db.promise().query(`
    UPDATE Reservation SET status = ?, updatedAt = NOW() WHERE reservationKey = ?
  `,[status, key])
};


export const autoExpirePendingReservations = async () => {
  const [result] = await db.promise().query(`
    UPDATE Reservation 
    SET status = 'expired'
    WHERE status = 'pending' AND TIMESTAMPDIFF(MINUTE, createdAt, NOW()) >= 30
  `);
  return result.affectedRows;
};






