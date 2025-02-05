import express from 'express'
import * as reservationController from '../controllers/reservationController.js'

const reservationRoute = express.Router();

reservationRoute.post("/create", reservationController.createReservation);
reservationRoute.get("/confirm/:key", reservationController.confirmReservation);
reservationRoute.get("/cancel/:key", reservationController.cancelReservation);
reservationRoute.put("/edit/:key", reservationController.editReservation)

export default reservationRoute;