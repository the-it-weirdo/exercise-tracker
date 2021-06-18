require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

const exerciseSchema = new Schema(
    {
      user_id : String,
      description : {type: String, required: true },
      duration : {type: Number, required: true },
      dateObj : Date,
      date : String
    }
);

const userSchema = new Schema(
  {
    username : {type: String, required: true },
  }
);

mongoose.connect(process.env['DB_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

// Functions

const createAndSaveUser = (userName, done) => {
    var userDocument = new User({'username':userName});

    userDocument.save(function (err, savedUser){
        if (err) return console.log(err);
        done(null, {_id : savedUser._id, username: savedUser.username });
    });
};


const addExercise = (userId, exercise, done) => {

    User.findById(userId, function(err, user) {
        if (err) return console.log(err);
        
        exercise.user_id = userId;

        exercise.save(function(err, savedExercise){
          if (err) return console.log(err);

          done(null, {_id : user._id, username : user.username, description: savedExercise.description, duration: savedExercise.duration, date: savedExercise.date});
        });
    });    
};

const findAllUsers = (done) => {
    User.find( {}, function(err, all) {
        if (err) return console.log(err);
        done(null, all);
    });
};


const findExercises = (userId, fromDate, toDate, limit, done) => {
        let findOption = { user_id: userId };
        
        if (fromDate || toDate) {
            findOption['dateObj'] = {};
        } 

        if (fromDate) {
            findOption['dateObj']['$gte'] = fromDate;
        }

        if (toDate) {
            findOption['dateObj']['$lt'] = toDate;
        }

        const query = Exercise.find( findOption );

        if (limit) {
            query.limit(parseInt(limit));
        }

        query.select({_id:0, user_id: 0, __v: 0, dateObj: 0});

        query.exec(function (err, exercises) {
            if (err) return console.log(err);

            User.findById(userId, function(err, user){
              if (err) return console.log(err);

              done(null, {
                  _id : user._id,
                  username: user.username,
                  count: exercises.length,
                  log: exercises
              });
            });
        });
};

// Exports

exports.UserModel = User;
exports.ExerciseModel = Exercise;
exports.createAndSaveUser = createAndSaveUser;
exports.addExercise = addExercise;
exports.findAllUsers = findAllUsers;
exports.findExercises = findExercises;