import db from "../config/database.js";



export const getOrCreateUserIdByEmail = async (firstName, lastName, email) => {
  // Check if the user exists
  const checkQuery = "SELECT id FROM User WHERE email = ?";
  const [rows] = await db.promise().query(checkQuery, [email]);

  if (rows.length > 0) {
    return rows[0].id; // Return existing user ID
  }

  let role = "Unknown"; // Default role

  const allowedDomain = process.env.MAILFORMAT;  // Student/Staff domain
  const teacherMail = process.env.TEACHERMAIL;  // Teacher domain

  if (email.endsWith(allowedDomain)) {
    role = "Student/Staff";
  } else if (email.endsWith(teacherMail)) {
    role = "Teacher";
  }

  // If user doesn't exist, insert them
  const insertQuery = "INSERT INTO User (firstName, lastName, email, createdAt, updatedAt, role) VALUES (?, ?, ?, NOW(), NOW(), ?)";   
  const [result] = await db.promise().query(insertQuery, [firstName, lastName, email, role]);

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

export const createMultipleReservations = async (title, description, times, roomId, userId, key) => {
  if (!times || times.length === 0) {
    return { success: false, message: "No valid time slots selected." };
  }

  // Extract all start/end times from the new format
  const timeSlots = times.flatMap(period =>
    Object.values(period).map(({ start, end }) => [
      title,
      description,
      start,
      end,
      roomId,
      userId,
      "pending",  // Status column
      key,        // Reservation Key
      new Date(), // createdAt (NOW() in SQL)
      new Date()  // updatedAt (NOW() in SQL)
    ])
  );

  if (timeSlots.length === 0) {
    return { success: false, message: "No valid time slots selected." };
  }

  //  Insert into database with the correct number of values
  const [result] = await db.promise().query(
    `INSERT INTO Reservation (title, description, reservationStart, reservationEnd, roomId, userId, status, reservationKey, createdAt, updatedAt)
     VALUES ?`,
    [timeSlots]
  );

  return { success: result.affectedRows > 0, message: "Reservations created successfully." };
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

  if (currentState === "expired") {
    return { success: false, message: "This reservation cannot be changed." };
  }
  if (currentState === "confirmed" && status !== "cancelled") {
    return { success: false, message: "This reservation cannot be changed. Only cancellation is allowed." };
  }
  

  // If status is pending 
  const [result] =  await db.promise().query(`
    UPDATE Reservation SET status = ?, updatedAt = NOW() WHERE reservationKey = ?
  `,[status, key])

  return { success : result.affectedRows > 0, message: "Reservation status update succesfully."} // affectedRows mean the row that have affected like this query has update 1 rows
};

export const deleteReservation = async (key) => {
  // Check if reservation exists
  const [existing] = await db.promise().query(
    `SELECT status FROM Reservation WHERE reservationKey = ?`,
    [key]
  );

  if (existing.length === 0) {
    return { success: false, message: "Invalid reservation key" };
  }

  const currentState = existing[0].status;

  // Only allow deletion if the reservation is cancelled or expired
  if (currentState !== "cancelled" && currentState !== "expired") {
    return { success: false, message: "Only cancelled or expired reservations can be deleted." };
  }

  // Perform the delete operation
  const [result] = await db.promise().query(
    `DELETE FROM Reservation WHERE reservationKey = ?`,
    [key]
  );

  return { success: result.affectedRows > 0, message: "Reservation deleted successfully." };
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


// export const autoExpirePendingReservations = async () => {
//   const [result] = await db.promise().query(`
//     UPDATE Reservation 
//     SET status = 'expired'
//     WHERE status = 'pending' AND TIMESTAMPDIFF(MINUTE, createdAt, NOW()) >= 30
//   `);
//   return result.affectedRows;
// }; 

// Force UTC time_STamp
export const autoExpirePendingReservations = async () => {
  const [result] = await db.promise().query(`
    UPDATE Reservation 
    SET status = 'expired'
    WHERE status = 'pending' 
    AND TIMESTAMPDIFF(MINUTE, createdAt, NOW()) >= 30;
  `);
  return result.affectedRows;
};






