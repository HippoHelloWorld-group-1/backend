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

export const reservRoom = async () => {

}

