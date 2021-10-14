// Main File from where the code runs

// Exporting all required libraries
const express = require("express");
const app = express();
const cors = require('cors');
const {google} = require('googleapis')
app.use(cors());
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
const userDataRoute = require("./routes/userData");
const path = require('path');
const fs = require('fs');

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(express.static(path.join(__dirname, "client/build")));

dotenv.config();
app.use(express.json());

// Calling the required routes
const questionRoute = require("./routes/questionData");
const authRoute = require("./routes/auth");
const changePassword = require("./routes/changePassword");
const downloadFile = require("./routes/download");

// Connecting with Mongoose Database
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify:true
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Using the called API
app.use("/api/userdata", userDataRoute);
app.use("/api/questionData",questionRoute);
app.use("/api/auth", authRoute);
app.use("/api/password", changePassword);
app.use("/api/download", downloadFile);

app.get('/',(req,res) =>{
  res.send("Welcome to WCL Test System")
})

const PORT = process.env.PORT || 5000

// Contecting the Backend Server
app.listen(PORT, () => {
  console.log("Backend is running.");
});