// To handle all data of user incase of any network or electricity failure
const router = require("express").Router();
const User = require("../models/User");
const BatchData = require("../models/batchData");
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
  try {
    console.log(req.body)
    const userData = await User.findOne({
      'username': req.body.username,
      'user_password': req.body.user_password
    })
    console.log(userData)
    if(userData === null)
      res.status(200).json({'result': 'fail'});
    //console.log(userData)
    const batch_data = await BatchData.findOne({
      'test_password': req.body.test_password
    })
    console.log(batch_data)

    if(batch_data === null)
      res.status(200).json({'result': 'fail'});
   // console.log(batch_data)
    const token = await jwt.sign(
      { userName: req.body.username }
      , 'token',
      {
        expiresIn: "2d",
      }
    );

    console.log('C1')

    if (req.body.test_password === batch_data.test_password && userData.batch === batch_data.batch) {
      console.log('C2')
      let newUserData = userData.toObject();
      newUserData.token = token;
      newUserData.result = 'success';
      res.status(200).json(newUserData);
      console.log('C3')
    }
    else{
      console.log('C4')
      res.status(200).json({'result': 'fail'});
    }
    console.log('C5')
  }
  catch (err) {
    console.log(err)
    res.status(400).json({})
  }
})

router.post(('/create_batch_data'), async (req, res) => {
  try {
    const batchData = new BatchData(req.body)
    const data = await batchData.save();
    res.status(200).json(data);
  }
  catch (err) {
    res.status(500).json(err)
  }
})


router.post('/update_start_time', async (req, res) => {
  try {
    const userData = await User.findOne({ 'username': req.body.username });
    userData.start_time = req.body.start_time;
    userData.elapsed_time = 0;
    await userData.save();
    res.status(200).json(userData);
  }
  catch (err) {
    res.status(500).json(err)
  }
})

router.post('/update_reading_submission_received', async (req, res) => {
  try {
    const userData = await User.findOne({ 'username': req.body.username });
    userData.reading_submission_received = true;
    await userData.save();
    console.log("update_read_sub_time", userData);
    res.status(200).json(userData);
  }
  catch (err) {
    res.status(500).json(err)
  }
})


router.post('/update_submission_received', async (req, res) => {
  try {
    const userData = await User.findOne({ 'username': req.body.username });
    userData.submission_received = true;
    await userData.save();
    console.log("sub_rec", userData);
    res.status(200).json(userData);
  }
  catch (err) {
    res.status(500).json(err)
  }
})


router.post('/update_elapsed_time', async (req, res) => {
  try {
    const userData = await User.findOne({
      'username': req.body.username,
    });
    userData.elapsed_time = req.body.elapsed_time;
    await userData.save();
    res.status(200).json(userData);
  }
  catch (err) {
    res.status(500).json(err)
  }
})

router.get('/get_elapsed_time', async (req, res) => {
  try {
    const userData = await User.findOne({ 'username': req.query.username });
    res.status(200).json(userData);
  }
  catch (err) {
    res.status(500).json(err)
  }
})


router.post('/update_reading_elapsed_time', async (req, res) => {
  try {
    const userData = await User.findOne({
      'username': req.body.username,
    });
    userData.reading_elapsed_time = req.body.reading_elapsed_time;
    await userData.save();
    res.status(200).json(userData);
  }
  catch (err) {
    res.status(500).json(err)
  }
})

router.get('/get_reading_elapsed_time', async (req, res) => {
  try {
    const userData = await User.findOne({ 'username': req.query.username });
    res.status(200).json(userData);
  }
  catch (err) {
    res.status(500).json(err)
  }
})

router.post('/update_submission_folder_id', async (req, res) => {
  try {
    const userData = await User.findOne({ 'username': req.body.username });
    userData.submission_folder_id = req.body.submission_folder_id;
    userData.merged_file_id = req.body.merged_file_id;
    await userData.save();
    res.status(200).json(userData);
  }
  catch (err) {
    res.status(500).json(err)
  }
});


router.get('/get_batchwise_list', async (req, res) => {
  try {
    const batch = req.query.batch;
    const userData = await User.find({ batch: batch });
    let opArr = [];
    for(let i=0;i<userData.length;i++){
      opArr.push(userData[i].username);
    }
    res.status(200).json(opArr);
  }
  catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;