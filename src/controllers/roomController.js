import * as roomModel from '../models/roomModel.js'


export const getAllRooms = async (req, res) => {
    try {
        const allRooms = await roomModel.getAllRooms();

        const formattedData = {};

        allRooms.forEach(({ buildingName, roomId, roomName }) => {
            let majorBuilding = buildingName.split(" ")[0].trim() + " Building";

            if (!formattedData[majorBuilding]) {
                formattedData[majorBuilding] = {};
            }

            if (!formattedData[majorBuilding][buildingName]) {
                formattedData[majorBuilding][buildingName] = {};
            }

            formattedData[majorBuilding][buildingName][roomName] = { 
                id: roomId, 
                name: roomName 
            };
        });

        return res.status(200).json({
            success: true,
            data: formattedData,
            message: "Rooms retrieved successfully",
        });

    } catch (error) {
        console.error("Error fetching rooms:", error);
        return res.status(500).json({
            success: false,
            data: null,
            message: "Internal Server Error",
        });
    }
};

export const getBuildingsWithRooms = async (req, res) => {
    try {
      const buildings = await roomModel.getAllBuildingsWithRooms();
      res.json({ success: true, data: buildings });
    } catch (error) {
      console.error("Error fetching buildings and rooms:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
  


export const getRoomStatus = async (req, res) => {
    try {
      const rooms = await roomModel.getRoomAvailability();
      res.json({ success: true, data: rooms });
    } catch (error) {
      console.error("Error fetching room availability:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };

export const getRoomStatusDay = async (req,res) => {
    const { date } = req.query   // data = req.query.date

    if (!date) {
        return res.status(400).json({ success:false, message:"Date required!"})
    }

    try {
        const rooms = await roomModel.getAllRoomAvailabilityByDay(date);
        res.json({ success: true, data: rooms})
    } catch(error) {
        console.error("Error fetching room availability:", error);
        res.status(500).json({ success: false, error: "Date data format Wrong" });
    }
}
  
export const getRoomSchedule = async (req,res) => {
    const { roomId, date } = req.query;
  
    if(!roomId || !date){
      return res.status(400).json({ success: false, message: "Room ID and Date are require!"})
    }
  
    try {
      const roomSchedule = await roomModel.getRoomScheduleByDay(roomId,date)
      res.json({ success: true, data: roomSchedule });

    } catch(error){
        res.status(500).json({ success: false, error: "Internal Server Error"})
    }
  }