import express from 'express';
import * as roomController from '../controllers/roomController.js'


const roomRoute = express.Router();

roomRoute.get('/', roomController.getAllRooms)
roomRoute.get('/status', roomController.getRoomStatus)



export default roomRoute
