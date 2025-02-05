import db from "../config/database.js";

export const getAllRooms = async (req, res) => {
  // Query to fetch rooms with their building information
  const [rooms] = await db.promise().query(`
      SELECT Building.buildingName, Room.roomName 
      FROM Room 
      JOIN Building ON Room.buildingId = Building.id
    `);
  return rooms;
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

export const getRoomAvailabilityByDay = async (selectDate) => {
  const [rooms] = await db.promise().query(`
    SELECT
        Room.id AS roomId,
        Room.roomName,
        Building.buildingName,
        Reservation.status,
        Reservation.reservationStart,
        Reservation.reservationEnd,
        DATE_FORMAT(Reservation.reservationStart,"%Y-%m-%d") as day_strat,
        DATE_FORMAT(Reservation.reservationEnd,"%Y-%m-%d") as day_end,
        Reservation.createdAt
    FROM Room
            JOIN Building ON Room.buildingId = Building.id
            LEFT JOIN Reservation ON Room.id = Reservation.roomId
        AND Reservation.status IN ('pending', 'confirmed')
        AND (
            DATE(Reservation.reservationStart) = ?
            or DATE(Reservation.reservationStart) = ?
            );
  `,[selectDate,selectDate]);

  return rooms; // Return all rooms with their status (available or booked)
};

export const isRoomAvailable = async (roomId, start, end) => {
  const [existing] = await db.promise().query(
    `
      SELECT COUNT(*) AS count FROM Reservation 
      WHERE roomId = ? 
        AND status IN ('pending', 'confirmed')  
        AND (
          (reservationStart BETWEEN ? AND ?)  
          OR (reservationEnd BETWEEN ? AND ?) 
          OR (? BETWEEN reservationStart AND reservationEnd) -- New booking fully overlaps
        )
    `,
    [roomId, start, end, start, end, start]
  );

  return existing[0].count === 0;
};
