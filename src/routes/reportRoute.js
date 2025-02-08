import express from 'express'
import * as reportController from '../controllers/reportController.js'



const reportRoute = express.Router();

reportRoute.post('/create', reportController.createReport)
reportRoute.get('/allreport', reportController.getAllReports)

export default reportRoute