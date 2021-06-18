require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

const exerciseSchema = new Schema(
    {
      description : {type: String, required: true },
      duration : {type: Number, required: true },
      date : Date
    }
);

const userSchema = new Schema(
  {
    username : {type: String, required: true },
    exercises : [exerciseSchema]
  }
);



mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

// Functions

const createAndSaveUser = (userName, done) => {
    var userDocument = new User({userName});

    userDocument.save(function (err, savedUser){
        if (err) return console.log(err);
        done(null, {_id : savedUser._id, username: savedUser.username });
    });
};


const addExercise = (userId, exercise, done) => {
    User.findById(userId, function(err, user) {
        if (err) return console.log(err);
        
        user.exercises.push(exercise);

        user.save(function (err, updatedUser) {
            if (err) return console.log(err);

            done(null, {_id : updatedUser._id, userName : updatedUser.username, ...exercise});
        })
    });    
};

const findAllUsers = (done) => {
    User.find( {}, function(err, all) {
        if (err) return console.log(err);
        done(null, all);
    });
};

const findAllExercises = (userId, done) => {
    User.findById(userId, function (err, user) {
        if (err) return console.log(err);

        done(null, {
            _id : user._id,
            username: user.username,
            count: user.exercises.length,
            log: user.exercises
        });
    });
};

const findExercises = (userId, fromDate, toDate, limit, done) => {
    if (!fromDate && !toDate && !limit) {
        findAllExercises(userId, done);
    } else {

        let findOption = { _id: userId };
        
        if (fromDate || toDate) {
            findOption['date'] = {};
        } 

        if (fromDate) {
            findOption['date']['$gte'] = fromDate;
        }

        if (toDate) {
            findOption['date']['$lt'] = toDate;
        }

        const query = User.find( findOption );

        if (limit) {
            query.limit(limit);
        }

        query.exec(function (err, user) {
            if (err) return console.log(err);

            done(null, {
                _id : user._id,
                username: user.username,
                count: user.exercises.length,
                log: user.exercises
            });
        });
    }
};

// Exports

exports.UserModel = User;
exports.ExerciseModel = Exercise;
exports.createAndSaveUser = createAndSaveUser;
exports.addExercise = addExercise;
exports.findAllUsers = findAllUsers;
exports.findExercises = findExercises;