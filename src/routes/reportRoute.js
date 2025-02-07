import express from 'express'
import * as reportController from '../controllers/reportController.js'



const reportRoute = express.Router();

reportRoute.post('/', reportController.addReport)
reportRoute.get('/allreport', reportController.getAllReports)

export default reportRoute