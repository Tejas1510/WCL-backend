// Routes to handle upload and fetch of question data

// importing all the required libraries
const router = require("express").Router();
const Question = require("../models/question");
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis')
const dotenv = require("dotenv");
dotenv.config();

// A Get Api to fetch all data based on the password of a particular batch
router.get('/', async (req, res) => {
  const { pass, key } = req.query
  // const pass= req.query.pass
  try {
    if (key === process.env.BACKEND_API_SECRET) {
      const data = await Question.find({ testPassword: pass })
      res.status(200).json(data)
    }
    else {
      res.status(500).json({})
    }

  }
  catch (error) {
    res.status(500).json(error)
  }
})

// Creating a storage on the disk of a local machine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });

// Api to take a file as a input from the user and upload it to Cloud Storage
router.post("/fileUpload", upload.single("file"), async (req, res) => {

  const { name, fileType, timeSlot, testPassword, key } = req.body
  const CLIENT_ID = process.env.CLIENT_ID
  const CLIENT_SECRET = process.env.CLIENT_SECRET
  const REDIRECT_URI = process.env.REDIRECT_URI
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
  });

  const filePath = path.join(__dirname, "../images", name);

  try {

    if (key === process.env.BACKEND_API_SECRET) {
      const response = await drive.files.create({
        requestBody: {
          name: name, //This can be name of your choice
          mimeType: 'image/jpg',
        },
        media: {
          mimeType: 'image/jpg',
          body: fs.createReadStream(filePath),
        },
      });

      const driveId = response.data.id
      await drive.permissions.create({
        fileId: driveId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const question = new Question({ fileType, testPassword, timeSlot, driveId })

      await question.save()
      fs.unlink(filePath, (e) => {
        console.log(e)
      })
      res.status(200).json(response.data)
    }
    else{
      try{
      fs.unlink(filePath, (e) => {
        console.log(e)
      })
      res.status(500).json({})
    }
      catch(err){
        res.status(500).json({})
      }
    }
  }
  catch (err) {
    res.status(500).json({})
  }
});

// Exporting the entire router
module.exports = router;