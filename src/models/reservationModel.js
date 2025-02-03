import db from "../config/database.js";

export const getAllRooms = async () => {
  const [response] = await db.promise().query(
    ` SELECT Room.id AS roomId,Room.roomName,Building.buildingName
      FROM 
        Room
      INNER JOIN 
        Building 
      ON 
        Room.buildingId = Building.id
      ORDER BY 
        Building.buildingName, Room.roomName `
  );
  return response;
};
