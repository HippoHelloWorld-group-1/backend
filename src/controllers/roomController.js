import * as reservationModel from '../models/reservationModel.js'


export const getAllRooms = async (req,res) => {
    try{
        const AllRooms = await reservationModel.getAllRooms()
            // Group rooms by building
    const groupedData = {};
    AllRooms.forEach((room) => {
      const { buildingName, roomName } = room;
      if (!groupedData[buildingName]) {
        groupedData[buildingName] = [];
      }
      groupedData[buildingName].push(roomName);
    });

    // Format the response
    const formattedData = Object.keys(groupedData).map((building) => ({
      [building]: groupedData[building],
    }));
        return res.status(200).json({
            success : true,
            data: formattedData,
            message: 'Room retrieved successfully'
        })
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            data: null,
            message: 'Internal Server error'
        })
    }
}