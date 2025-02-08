import db from "../config/database.js";

export const getAllRooms = async (req, res) => {
  // Query to fetch rooms with their building information
  const [allRooms] = await db.promise().query(`
    SELECT 
        Building.id AS buildingId,
        Building.buildingName, 
        Room.id AS roomId, 
        Room.roomName
    FROM Room
    JOIN Building ON Room.buildingId = Building.id
`);
 return allRooms
};

export const getAllBuildingsWithRooms = async () => {
  const [rooms] = await db.promise().query(`
    SELECT Room.id AS roomId, Room.roomName, Building.buildingName
    FROM Room
    JOIN Building ON Room.buildingId = Building.id
    ORDER BY Building.buildingName, Room.roomName;
  `);

  // Group rooms by building
  const buildings = {};
  rooms.forEach((room) => {
    if (!buildings[room.buildingName]) {
      buildings[room.buildingName] = [];
    }
    buildings[room.buildingName].push({ id: room.roomId, name: room.roomName });
  });

  return buildings;
};


export const getDescription = async (key) => {
  const [existing] = await db.promise().query(
    `SELECT title, description, status FROM Reservation WHERE reservationKey = ?`,
    [key]
  );

  return existing.length > 0 ? existing[0] : null; // ✅ Return first row OR null
};



export const getRoomName = async (roomId) => {
  const [rows] = await db.promise().query(`
    select Room.roomname
    from Room
    where id = ?
    `, [roomId])
  return rows.length > 0 ? rows[0].roomname : null;
}

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

//
export const getAllRoomAvailabilityByDay = async (selectDate) => {
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


// By day 
export const getRoomScheduleByDay = async (roomId, selectedDate) => {
  const [roomSchedule] = await db.promise().query(`
    SELECT
        Reservation.id AS reservationId,
        Reservation.title,
        Reservation.description,
        Reservation.status,
        Reservation.reservationStart,
        Reservation.reservationEnd,
        Reservation.createdAt,
        Reservation.updatedAt,
        User.firstName AS createdBy
    FROM Reservation
    JOIN User ON Reservation.userId = User.id
    WHERE Reservation.roomId = ?
      AND DATE(Reservation.reservationStart) = ?
      AND Reservation.status IN ('pending', 'confirmed')
    ORDER BY Reservation.reservationStart;
  `, [roomId, selectedDate]);

  return roomSchedule;
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
