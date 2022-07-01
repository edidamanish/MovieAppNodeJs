const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.DB_CONNECT, () => {
  console.log("connected to DB");
});

const authRoute = require("./routes/auth");

app.use(express.json())

app.use("/api/user", authRoute);

app.listen(3000, () => {
  console.log("Server up and running");
});
