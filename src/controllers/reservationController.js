import * as reservationModel from '../models/reservationModel.js'
import * as roomModel from '../models/roomModel.js'
import crypto from 'crypto';
import sendEmail from '../config/mailer.js'


export const createReservation = async (req, res) => {
  const { title, description, reservationStart, reservationEnd, firstName, lastName, email, roomId } = req.body;

  try {

    const isAvailable = await roomModel.isRoomAvailable(roomId, reservationStart,reservationEnd)
    if (!isAvailable) {
        return res.status(400).json({ success: false, error: "Room is already booked for this time slot." });
      }

    const userId = await reservationModel.getOrCreateUserIdByEmail(firstName, lastName, email)
    if (!userId) {
        return res.status(404).json({ success: false, error: "User not found" });
    }
    // Generate a unique reservation key
    const reservationKey = crypto.randomBytes(16).toString("hex");

    // Save to the database
    await reservationModel.createReservation(title, description, reservationStart, reservationEnd, roomId, userId, reservationKey);

    // Generate links
    const confirmLink = `http://localhost:3002/reservation/confirm/${reservationKey}`;
    const cancelLink = `http://localhost:3002/reservation/cancel/${reservationKey}`;
    const editLink = `http://localhost:3002/reservation/edit/${reservationKey}`;

    // Send email
    const emailContent = `
      <h1>Room Booking Confirmation</h1>
      <p>Thank you for booking a room. Please use the following links:</p>
      <ul>
        <li><a href="${confirmLink}">Confirm Booking</a></li>
        <li><a href="${cancelLink}">Cancel Booking</a></li>
        <li><a href="${editLink}">Edit Booking</a></li>
      </ul>
      <p>Note: The booking will expire in 30 minutes if not confirmed.</p>
    `;
    await sendEmail(email, "Room Booking Confirmation", emailContent);

    res.json({ success: true, message: "Reservation created and email sent!" });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const confirmReservation = async (req, res) => {
  const { key } = req.params;

  try {
    const [result] = await reservationModel.updateReservationStatus(key, "confirmed");

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Invalid or expired reservation key." });
    }

    res.json({ success: true, message: "Reservation confirmed!" });
  } catch (error) {
    console.error("Error confirming reservation:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const cancelReservation = async (req, res) => {
  const { key } = req.params;

  try {
    const [result] = await reservationModel.updateReservationStatus(key, "cancelled");

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Invalid reservation key." });
    }

    res.json({ success: true, message: "Reservation cancelled!" });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
