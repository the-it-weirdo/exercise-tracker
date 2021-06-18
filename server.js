const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
require('dotenv').config()


const Exercise = require("./exerciseTracker.js").ExerciseModel;
const createAndSaveUser = require("./exerciseTracker.js").createAndSaveUser;
const addExercise = require("./exerciseTracker.js").addExercise;
const findAllUsers = require("./exerciseTracker.js").findAllUsers;
const findExercises = require("./exerciseTracker.js").findExercises;

app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users')
.post(function (req, res) {
  createAndSaveUser(req.body.username, function(err, newUser) {
    if (err) return console.log(err);
    res.json(newUser);
  });
})
.get(function (req, res){
  findAllUsers(function (err, allUsers) {
    if (err) return console.log(err);
    res.json(allUsers);
  });
});


app.post('/api/users/:_id/exercises', function(req, res) {
  const eDate = req.body.date ? new Date(req.body.date) : new Date();
  const exercise = new Exercise({
      description: req.body.description,
      duration: req.body.duration,
      dateObj: eDate,
      date: eDate.toDateString()
  });
  addExercise(req.params._id, exercise, function(err, savedData) {
    if (err) return console.log(err);
    res.json(savedData);
  })
});

app.get('/api/users/:_id/logs', function (req, res) {
  const userId = req.params._id;
  const fromDate = req.query.from ? new Date(req.query.from) : undefined;
  const toDate = req.query.to ? new Date(req.query.to) : undefined;
  const limit = req.query.limit;

  findExercises(userId, fromDate, toDate, limit, function(err, data) {
    if (err) return console.log(err);
    
    res.json(data);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
