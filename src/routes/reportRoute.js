import express from 'express'
import * as reportController from '../controllers/reportController.js'
import roomRoute from './roomRoute';


const reportRoute = express.Router();

roomRoute.post('/', reportController.addReport)
roomRoute.get('/allreport', reportController.getAllReports)

export default reportRoute
