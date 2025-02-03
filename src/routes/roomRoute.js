import express from 'express';
import * as roomController from '../controllers/roomController.js'

const roomRoute = express.Router();

roomRoute.get('/', roomController.getAllRooms)


export default roomRoute
