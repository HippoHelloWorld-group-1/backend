import * as reservationModel from '../models/reservationModel.js'


export const getAllRooms = async (req,res) => {
    try{
        const AllRooms = await reservationModel.getAllRooms()
        return res.status(200).json({
            success : true,
            data: AllRooms,
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