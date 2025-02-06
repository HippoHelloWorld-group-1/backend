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
  const [existing] = await db.promise().query(`
    SELECT Reservation.status from Reservation where reservationKey = ?
    `, [key]) // find first if have this user id in db reservation

  if (existing.length === 0){
    return {success: false,message: 'Invalid reservation key'}
  }

  const currentState = existing[0].status

  if((currentState === 'confirmed' && status != 'cancelled')) {
    return {success: false,message:"This reservation cannot be changed. only cancel"}
  }
  if(currentState === 'expired' || currentState === 'cancelled'){
    return {success: false,message:"This reservation cannot be changed."}
  }
  

  // If status is pending 
  const [result] =  await db.promise().query(`
    UPDATE Reservation SET status = ?, updatedAt = NOW() WHERE reservationKey = ?
  `,[status, key])

  return { success : result.affectedRows > 0, message: "Reservation status update succesfully."} // affectedRows mean the row that have affected like this query has update 1 rows
};

export const editReservation = async (key, title, description) => {
  // check if user have reservation room 
  const [existing] = await db.promise().query(`
    SELECT status FROM Reservation WHERE reservationKey = ?
    `, [key])

    if (existing.length === 0) {
      return { success: false, message: "Invalid reservation key." };
    }

    const currentStatus = existing[0].status;


  if (currentStatus === 'confirmed' || currentStatus === 'expired' || currentStatus === 'cancelled') {
    return { success: false, message: "This reservation cannot be changed." };
  }


  //update
  const [result] = await db.promise().query(`
    UPDATE Reservation
    SET title = ?, description = ?, updatedAt = NOW()
    WHERE reservationKey = ?
  `, [title, description, key]);

    console.log("Rows affected:", result.affectedRows);
  

  return { success: result.affectedRows > 0, message: "Reservation details updated successfully." };
  }


export const autoExpirePendingReservations = async () => {
  const [result] = await db.promise().query(`
    UPDATE Reservation 
    SET status = 'expired'
    WHERE status = 'pending' AND TIMESTAMPDIFF(MINUTE, createdAt, NOW()) >= 30
  `);
  return result.affectedRows;
};






