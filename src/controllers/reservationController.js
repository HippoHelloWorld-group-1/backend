import * as reservationModel from "../models/reservationModel.js";
import * as roomModel from "../models/roomModel.js";
import crypto from "crypto";
import sendEmail from "../config/mailer.js";
import dotenv from "dotenv";
import * as htmlError from "../utils/htmlError.js";
dotenv.config();

export const createReservation = async (req, res) => {
  const { title, description, times, firstName, lastName, email, roomId } = req.body;

  try {
    const allowedDomain = process.env.MAILFORMAT; // check email format
    if (!email.endsWith(allowedDomain)) {
      return res.status(400).json({ success: false, error: "Only student emails are allowed." });
    }

    if (!times || times.length === 0) { 
      return res.status(400).json({ success: false, error: "At least one time slot must be selected." });
    }

    
    const timeSlots = times.flatMap(period => Object.values(period));
    
    // Check room available for each time slot
    for (const { start, end } of timeSlots) {
      const isAvailable = await roomModel.isRoomAvailable(roomId, start, end);
      if (!isAvailable) {
        return res.status(400).json({ success: false, error: `Room is already booked from ${start} to ${end}.` });
      }
    }

    //  Get userId from email
    const userId = await reservationModel.getOrCreateUserIdByEmail(firstName, lastName, email);
    if (!userId) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    //  Generate a single reservationKey for all time slots
    const reservationKey = crypto.randomBytes(16).toString("hex");

    //  Save all reservations
    await reservationModel.createMultipleReservations(title, description, times, roomId, userId, reservationKey);

    // Get the room name
    const roomName = await roomModel.getRoomName(roomId);

    //  Generate confirmation links
    const confirmLink = `http://localhost:3002/reservation/confirm/${reservationKey}`;
    const cancelLink = `http://localhost:3002/reservation/cancel/${reservationKey}`;
    const editLink = `http://localhost:3002/reservation/edit/${reservationKey}`;

    //  Format selected times for email
    const formattedTimes = timeSlots.map(({ start, end }) => `<li>${start} - ${end}</li>`).join("");

    //  Send email with new format
    const emailContent = `
      <h1>Room Booking Confirmation</h1>
      <h2>${roomName}</h2>
      <p>Selected Times:</p>
      <ul>${formattedTimes}</ul>
      <p>Thank you for booking a room. Please use the following links:</p>
      <ul>
        <li><a href="${confirmLink}">Confirm Booking</a></li>
        <li><a href="${cancelLink}">Cancel Booking</a></li>
        <li><a href="${editLink}">Edit Booking (Only for pending reservations)</a></li>
      </ul>
      <p>Note: The booking will expire in 30 minutes if not confirmed.</p>
    `;
    await sendEmail(email, "Room Booking Confirmation", emailContent);

    res.json({ success: true, message: "Reservations created and email sent!" });
  } catch (error) {
    console.error("Error creating reservations:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const confirmReservation = async (req, res) => {
  const { key } = req.params;

  try {
    const result = await reservationModel.updateReservationStatus(
      key,
      "confirmed"
    );
    //result get object from model
    if (!result.success) {
      // return res.status(404).json({ success: false, message: "Invalid or expired reservation key. or you have cancelled" });
    return res.send(htmlError.invalidKey);
    }
    // res.json({ success: true, message: "Reservation confirmed!" });
    return res.send(`
      <head>
          <title>Reservation confirmed</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: Arial, Helvetica, sans-serif;
              }
              body{
                  background-image: url(https://cdn.discordapp.com/attachments/1327890645922091059/1337424714213101598/SIT_1.webp?ex=67a76554&is=67a613d4&hm=823d275d5d40a81439766a983d9f1b18b85ecff14429a75be0cd170d4dfc6125&;);
                  background-repeat: none;
                  background-position: center;
                  background-attachment: fixed;
                  background-size: cover;
              }
              .cover{
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              .box {
                  text-align: center;
                  background-color: white;
                  padding: 50px;
                  border-radius: 20px;
              }
              .text {
                  margin-top: 40px;
              }
              .text h1 {
                  color: #1B2845;
              }
              .small-text{
                  margin-top: 40px;
                  color: #199238;
                  font-weight: bold;
              }
              .footer-box{
                  margin-top: 50px;
              }
              button{
                  padding: 10px;
                  border: 0;
                  border-radius: 7px;
                  background-color: #1B2845;
                  color: white;
                  width: 100%;
              }
          </style>
      </head>
      <body>
          <div class="cover">
              <div class="box">
                  <div class="top-box">
                      <img alt="logo-sit" src="https://cdn.discordapp.com/attachments/1327890645922091059/1337424714599108723/Group_36.webp?ex=67a76554&is=67a613d4&hm=61d40abca3722757f3c2c345e89bc2c8e0f917c7929fa672cd61d92c290a1633&">
                  </div>
                  <div class="text">
                      <h1>Reservation</h1>
                      <div class="small-text">
                          <p>Booking confirmed successfully,</p><br>
                          <p>Please check the reservation schedule.</p>
                      </div>
                  </div>
                  <div class="footer-box">
                      <a href=${process.env.website} target="_blank"><button>Go to website</button></a>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error confirming reservation:", error);
    // res.status(500).json({ success: false, error: "Internal Server Error" });
    return res.send(`
      <head>
          <title>${error}</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: Arial, Helvetica, sans-serif;
              }
              body{
                  background-image: url(https://cdn.discordapp.com/attachments/1327890645922091059/1337424714213101598/SIT_1.webp?ex=67a76554&is=67a613d4&hm=823d275d5d40a81439766a983d9f1b18b85ecff14429a75be0cd170d4dfc6125&;);
                  background-repeat: none;
                  background-position: center;
                  background-attachment: fixed;
                  background-size: cover;
              }
              .cover{
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              .box {
                  text-align: center;
                  background-color: white;
                  padding: 50px;
                  border-radius: 20px;
              }
              .text {
                  margin-top: 40px;
              }
              .text h1 {
                  color: #1B2845;
              }
              .small-text{
                  margin-top: 40px;
                  color: #470000;
                  font-weight: bold;
              }
              .footer-box{
                  margin-top: 50px;
              }
              button{
                  padding: 10px;
                  border: 0;
                  border-radius: 7px;
                  background-color: #1B2845;
                  color: white;
                  width: 100%;
              } 
              button:hover{
                  background-color: #b4bfd0;
            }
          </style>
      </head>
      <body>
          <div class="cover">
              <div class="box">
                  <div class="top-box">
                      <img alt="logo-sit" src="https://cdn.discordapp.com/attachments/1327890645922091059/1337424714599108723/Group_36.webp?ex=67a76554&is=67a613d4&hm=61d40abca3722757f3c2c345e89bc2c8e0f917c7929fa672cd61d92c290a1633&">
                  </div>
                  <div class="text">
                      <h1>Reservation</h1>
                      <div class="small-text">
                          <p>Reservation Confirmation error</p><br>
                          <p>Internal Server Error</p>
                      </div>
                  </div>
                  <div class="footer-box">
                      <a href=${website} target="_blank"><button>Go to website</button></a>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `);
  }
};


export const cancelReservation = async (req, res) => {
  const { key } = req.params;

  try {
    const result = await reservationModel.updateReservationStatus(key, "cancelled");

    if (!result.success) {
      return res.send(htmlError.invalidKey)
    }

    // Return an HTML page for user confirmation
    res.send(`
      <html>
        <head>
          <title>Invalid or expired reservation key</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: Arial, Helvetica, sans-serif;
              }
              body{
                  background-image: url(https://cdn.discordapp.com/attachments/1327890645922091059/1337424714213101598/SIT_1.webp?ex=67a76554&is=67a613d4&hm=823d275d5d40a81439766a983d9f1b18b85ecff14429a75be0cd170d4dfc6125&;);
                  background-repeat: none;
                  background-position: center;
                  background-attachment: fixed;
                  background-size: cover;
              }
              .cover{
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              .box {
                  text-align: center;
                  background-color: white;
                  padding: 50px;
                  border-radius: 20px;
              }
              .text {
                  margin-top: 40px;
              }
              .text h1 {
                  color: #1B2845;
              }
              .small-text{
                  margin-top: 40px;
                  color: #470000;
                  font-weight: bold;
              }
              .footer-box{
                  margin-top: 50px;
              }
              button{
                  padding: 10px;
                  border: 0;
                  border-radius: 7px;
                  background-color: #1B2845;
                  color: white;
                  width: 100%;
              } 
              button:hover{
                  background-color: #b4bfd0;
            }
          </style>
      </head>
      <body>
          <div class="cover">
              <div class="box">
                  <div class="top-box">
                      <img alt="logo-sit" src="https://cdn.discordapp.com/attachments/1327890645922091059/1337424714599108723/Group_36.webp?ex=67a76554&is=67a613d4&hm=61d40abca3722757f3c2c345e89bc2c8e0f917c7929fa672cd61d92c290a1633&">
                  </div>
                  <div class="text">
                      <h1>Your reservation has been cancelled.</h1>
                      <div class="small-text">
                          <p>If you want to permanently delete this reservation, click below.</p>
                      </div>
                  </div>
                  <div class="footer-box">
                      <div id="status-message"></div>
                      <button id="delete-button" onclick="deleteReservation()">Delete Reservation</button>
                  </div>
              </div>
          </div>
          <script>
              function deleteReservation() {
                fetch("http://localhost:3002/reservation/cancel/${key}", { method: "DELETE" })
                  .then(response => response.json()) 
                  .then(data => {   // data is response.json
                    if (data.success) {
                      alert("Reservation deleted successfully!");
                      
                      
                      const statusMessage = document.getElementById("status-message");
                      if (statusMessage) {
                        statusMessage.innerHTML = "<h1 style='color: green;'>Reservation Deleted Successfully</h1>";
                      }
                      
                      const deleteButton = document.getElementById("delete-button");
                      if (deleteButton) {
                        deleteButton.style.display = "none";
                      }
                    } else {
                      alert("Error: " + data.message);
                    }
                  })
                  .catch(error => alert("Request failed: " + error));
              }
            </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" }); // ✅ Fixed
  }
};


export const deleteReservation = async (req, res) => {
  const { key } = req.params;

  try {
    if (!key) {
      return res
        .status(400)
        .json({ success: false, message: "Missing reservation key" });
    }

    console.log("Received DELETE request for reservation key:", key);

    const result = await reservationModel.deleteReservation(key);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.json({
      success: true,
      message: "Reservation deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getEditPage = async (req, res) => {
  const { key } = req.params;

  try {
    const existing = await roomModel.getDescription(key); 

    if (!existing) { 
      return res.send(htmlError.invalidKey);
    }

    const { title, description, status } = existing; 

    if (status === "confirmed" || status === "expired" || status === "cancelled") {
      return res.send(`
        <head>
            <title>Invalid or expired reservation key</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: Arial, Helvetica, sans-serif;
                }
                body{
                    background-image: url(https://cdn.discordapp.com/attachments/1327890645922091059/1337424714213101598/SIT_1.webp?ex=67a76554&is=67a613d4&hm=823d275d5d40a81439766a983d9f1b18b85ecff14429a75be0cd170d4dfc6125&;);
                    background-repeat: none;
                    background-position: center;
                    background-attachment: fixed;
                    background-size: cover;
                }
                .cover{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .box {
                    text-align: center;
                    background-color: white;
                    padding: 50px;
                    border-radius: 20px;
                }
                .text {
                    margin-top: 40px;
                }
                .text h1 {
                    color: red;
                }
                .small-text{
                    margin-top: 40px;
                    color: #470000;
                    font-weight: bold;
                }
                .footer-box{
                    margin-top: 50px;
                }
                button{
                    padding: 10px;
                    border: 0;
                    border-radius: 7px;
                    background-color: #1B2845;
                    color: white;
                    width: 100%;
                } 
                button:hover{
                    background-color: #b4bfd0;
              }
            </style>
        </head>
        <body>
            <div class="cover">
                <div class="box">
                    <div class="top-box">
                        <img alt="logo-sit" src="https://cdn.discordapp.com/attachments/1327890645922091059/1337424714599108723/Group_36.webp?ex=67a76554&is=67a613d4&hm=61d40abca3722757f3c2c345e89bc2c8e0f917c7929fa672cd61d92c290a1633&">
                    </div>
                    <div class="text">
                        <h1>This reservation cannot be changed.</h1>
                        <div class="small-text">
                            <p>The reservation has already been confirmed, cancelled, or expired.</p>
                        </div>
                    </div>
                    <div class="footer-box">
                        <a href=${process.env.website} target="_blank"><button>Go to website</button></a>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `);
    } // if status is confirmed,expired,cancel this is error page 

    res.send(`
      <html>
      <head>
          <title>Edit Reservation</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: Arial, Helvetica, sans-serif;
              }
              body {
                  background-image: url(https://cdn.discordapp.com/attachments/1327890645922091059/1337424714213101598/SIT_1.webp?ex=67a76554&is=67a613d4&hm=823d275d5d40a81439766a983d9f1b18b85ecff14429a75be0cd170d4dfc6125&);
                  background-repeat: no-repeat;
                  background-position: center;
                  background-attachment: fixed;
                  background-size: cover;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              .container {
                  background: white;
                  padding: 40px;
                  border-radius: 12px;
                  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                  text-align: center;
                  width: 400px;
              }
              .container img {
                  width: 120px;
                  margin-bottom: 20px;
              }
              .container h1 {
                  font-size: 22px;
                  color: #1B2845;
              }
              .input-group {
                  margin-top: 20px;
                  text-align: left;
              }
              .input-group p {
                  font-weight: bold;
                  color: #333;
                  margin-bottom: 5px;
              }
              input {
                  width: 100%;
                  padding: 10px;
                  border: 1px solid #ccc;
                  border-radius: 5px;
                  font-size: 14px;
              }
              button {
                  margin-top: 20px;
                  padding: 12px;
                  background-color: #1B2845;
                  color: white;
                  border: none;
                  width: 100%;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 16px;
                  transition: 0.3s ease;
              }
              button:hover {
                  background-color: #b4bfd0;
              }
              .confirmation-box {
                  display: none;
                  background: rgba(0, 0, 0, 0.6);
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  justify-content: center;
                  align-items: center;
              }
              .confirmation-content {
                  background: white;
                  padding: 30px;
                  border-radius: 10px;
                  text-align: center;
                  width: 350px;
              }
              .confirmation-content h2 {
                  color: green;
              }
              .confirmation-content p {
                  margin-top: 10px;
                  color: #333;
              }
          </style>
      </head>
      <body>

          <div class="container">
              <img src="https://cdn.discordapp.com/attachments/1327890645922091059/1337424714599108723/Group_36.webp?ex=67a76554&is=67a613d4&hm=61d40abca3722757f3c2c345e89bc2c8e0f917c7929fa672cd61d92c290a1633&" alt="logo-sit">
              <h1 id="main-text">Edit Your Reservation</h1>
              
              <form id="edit-form">
                  <div class="input-group">
                      <p>Title</p>
                      <input type="text" id="title" name="title" placeholder="Title" value="${title}" required />
                  </div>
                  <div class="input-group">
                      <p>Description</p>
                      <input type="text" id="description" name="description" placeholder="Description" value="${description}" required />
                  </div>
                  <button type="button" onclick="submitEdit()">Save Changes</button>
              </form>
          </div>

          <!-- Confirmation Message -->
          <div class="confirmation-box" id="confirmation-box">
              <div class="confirmation-content">
                  <h2>Reservation Updated!</h2>
                  <p>Your reservation details have been changed successfully.</p>
                  <button onclick="closeConfirmation()">Close</button>
              </div>
          </div>

          <script>
              function submitEdit() {
                  const title = document.getElementById("title").value;
                  const description = document.getElementById("description").value;

                  fetch("http://localhost:3002/reservation/edit/${key}", { 
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title, description }) 
                  })
                  .then(response => response.json())
                  .then(data => {
                      if (data.success) {
                          document.getElementById("confirmation-box").style.display = "flex";
                      } else {
                          alert("Error: " + data.message);
                      }
                  })
                  .catch(error => alert("Request failed: " + error));
              }

              function closeConfirmation() {
                  document.getElementById("confirmation-box").style.display = "none";
              }
          </script>

      </body>
      </html>

    `);
  } catch (error) {
    console.error("Error loading edit page:", error);
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body><h1>Internal Server Error</h1></body>
      </html>
    `);
  }
};



export const editReservation = async (req, res) => {
  const { key } = req.params;
  const { title, description } = req.body;

  try {
    const result = await reservationModel.editReservation(
      key,
      title,
      description
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error editing reservation:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
