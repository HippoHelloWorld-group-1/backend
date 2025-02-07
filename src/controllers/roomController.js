import * as roomModel from '../models/roomModel.js'


export const getAllRooms = async (req, res) => {
    try {
        const allRooms = await roomModel.getAllRooms();

        // Object to store the formatted data
        const formattedData = {};

        allRooms.forEach(({ buildingName, roomName }) => {
            // Extract the major building name (e.g., "CB2 Building", "LX Building")
            let majorBuilding = buildingName.split(" ")[0].trim(); // Extract main part before "("

            majorBuilding = `${majorBuilding} Building`;
            // If the major building does not exist, initialize it
            if (!formattedData[majorBuilding]) {
                formattedData[majorBuilding] = {};
            }

            // If the sub-building (full building name) does not exist, initialize it
            if (!formattedData[majorBuilding][buildingName]) {
                formattedData[majorBuilding][buildingName] = [];
            }

            // Push room name into the correct sub-building category
            formattedData[majorBuilding][buildingName].push(roomName);
        });

        return res.status(200).json({
            success: true,
            data: [formattedData], // Wrapping inside an array to match frontend format
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
    const { date } = req.query   // data = req.query.data

    if (!date) {
        return res.status(400).json({ success:false, message:"Date required!"})
    }

    try {
        const rooms = await roomModel.getRoomAvailabilityByDay(date);
        res.json({ success: true, data: rooms})
    } catch(error) {
        console.error("Error fetching room availability:", error);
        res.status(500).json({ success: false, error: "Date data format Wrong" });
    }
}

  