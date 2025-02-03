import express from "express";
import connection from "./config/database.js";
import cors from "cors";
import { logger } from "./middlewares/logger.js";
import roomRoute from "./routes/roomRoute.js";

const app = express();
const PORT = process.env.PORT;

app.use(logger);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use('/api/rooms', roomRoute)

connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to the database");
  }
});

app.listen(PORT, () => {
  console.log("Server is running on localhost:3000");
});
