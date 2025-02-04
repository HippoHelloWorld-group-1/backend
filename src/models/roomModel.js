import db from "../config/database.js";

export const getAllRooms = async (req, res) => {
    // Query to fetch rooms with their building information
    const [rooms] = await db.promise().query(`
      SELECT Building.buildingName, Room.roomName 
      FROM Room 
      JOIN Building ON Room.buildingId = Building.id
    `);
    return rooms

};

export const getRoomAvailability = async () => {
  const [rooms] = await db.promise().query(`
    SELECT 
      Room.id AS roomId, 
      Room.roomName, 
      Building.buildingName,
      Reservation.status, 
      Reservation.reservationStart, 
      Reservation.reservationEnd,
      Reservation.createdAt
    FROM Room
    JOIN Building ON Room.buildingId = Building.id
    LEFT JOIN Reservation ON Room.id = Reservation.roomId 
      AND Reservation.status IN ('pending', 'confirmed')
  `);

  return rooms; // Return all rooms with their status (available or booked)
};

export const isRoomAvailable = async (roomId, start, end) => {
    const [existing] = await db.promise().query(`
      SELECT COUNT(*) AS count FROM Reservation 
      WHERE roomId = ? 
        AND status IN ('pending', 'confirmed')  -- Room is unavailable if status is pending or confirmed
        AND (
          (reservationStart BETWEEN ? AND ?)  -- New booking starts inside an existing booking
          OR (reservationEnd BETWEEN ? AND ?) -- New booking ends inside an existing booking
          OR (? BETWEEN reservationStart AND reservationEnd) -- New booking fully overlaps
        )
    `, [roomId, start, end, start, end, start]);
  
    return existing[0].count === 0; 
  };
  