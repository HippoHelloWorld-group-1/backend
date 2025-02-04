import express from "express";
import connection from "./config/database.js";
import bodyParser from "body-parser";
import cors from "cors";
import { logger } from "./middlewares/logger.js";
import roomRoute from "./routes/roomRoute.js";
import reservationRoute from "./routes/reservationRoute.js"
import { autoExpirePendingReservations } from "./models/reservationModel.js";

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

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to the database");
  }
});

// Run every 10 minutes to expire old reservations
setInterval(async () => {
  try {
    const expiredCount = await autoExpirePendingReservations();
    if (expiredCount > 0) {
      console.log(`Expired ${expiredCount} pending reservations.`);
    }
  } catch (error) {
    console.error("Error expiring reservations:", error);
  }
}, 600000); // Runs every 10 minutes (600,000ms)


app.listen(PORT, () => {
  console.log("Server is running on localhost:3002");
});
