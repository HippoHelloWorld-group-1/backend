import express from "express";
import connection from "./config/database.js";
import bodyParser from "body-parser";
import cors from "cors";
import { logger } from "./middlewares/logger.js";
import roomRoute from "./routes/roomRoute.js";
import reservationRoute from "./routes/reservationRoute.js"
import { autoExpirePendingReservations } from "./models/reservationModel.js";
import reportRoute from "./routes/reportRoute.js";
import cron from "node-cron";

const app = express();
const PORT = process.env.PORT;

app.use(logger);
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});



app.use('/api/rooms', roomRoute)
app.use("/reservation", reservationRoute);
app.use("/report", reportRoute);

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to the database");
  }
});

// Run when server starts
(async () => {
  try {
    await autoExpirePendingReservations();
    console.log("Checked for expired reservations on server start.");
    if (autoExpirePendingReservations.length > 0){
      console.log("update status to expired success")
    } else {
      console.log("nothing update");
    }
  } catch (error) {
    console.error("Error expiring reservations on startup:", error);
  }
})();

// Run every 10 minutes on real-world time  if use setInterval the time will reset after restart
cron.schedule("*/10 * * * *", async () => {
  try {
    await autoExpirePendingReservations();
    console.log("Checked for expired reservations on cron schedule.");
    if (autoExpirePendingReservations.length > 0){
      console.log("update status to expired success")
    } else {
      console.log("nothing update");
    }
    
  } catch (error) {
    console.error("Error expiring reservations on cron schedule:", error);
  }
});

app.listen(PORT, () => {
  console.log("Server is running on localhost:3002");
});
