import express from 'express'
import * as reservationController from '../controllers/reservationController.js'

const reservationRoute = express.Router();

reservationRoute.post("/create", reservationController.createReservation);
reservationRoute.get("/confirm/:key", reservationController.confirmReservation);
reservationRoute.get("/edit/:key", reservationController.getEditPage);
reservationRoute.put("/edit/:key", reservationController.editReservation);
reservationRoute.get("/cancel/:key", reservationController.cancelReservation);
reservationRoute.delete("/cancel/:key", reservationController.deleteReservation);


export default reservationRoute;