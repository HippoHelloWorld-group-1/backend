import express from 'express';
import * as roomController from '../controllers/roomController.js'


const roomRoute = express.Router();

roomRoute.get('/', roomController.getAllRooms)
roomRoute.get('/status', roomController.getRoomStatus)
roomRoute.get('/statusDay', roomController.getRoomStatusDay)
roomRoute.get('/room-schedule', roomController.getRoomSchedule)
roomRoute.get("/buildings", roomController.getBuildingsWithRooms);




export default roomRoute
