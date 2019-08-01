const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const Async = require('async');
var VerifyToken = require('./middleware/VerifyToken');


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

router.post('/searchfriends', (req, res, next) => {
  var friendsArray = []
  var searchQuery = ""
  if(req.body.hasOwnProperty('string')){
    searchQuery = req.body.string
  }else{
    searchQuery = req.body.searchQuery
  }
  User.find(
    { "username": { "$regex": searchQuery, "$options": "i" } },
    function(err,docs) {
      docs.forEach(function(doc){
        friendsArray.push(doc.username)
      });
      return res.json({friends: friendsArray});
    }
);

})

router.post('/getfriends', (req, res, next) => {
  console.log("getting friends")
  var friendsList = []
  var friendsResponseList = []
  User.getUserByUsername(req.body.username, (err, user) => {
    if(err) throw err;
    if (!user){
      console.log("Couldn't find user during search.")
      }
      else{
        friendsList = user.friends

        var promise = User.find({ username: { $in: user.friends }}).exec();
        promise.then(function(arrayOfPeople) {
            var passList = []
            for (var i = 0;i<arrayOfPeople.length;i++){
                var userObject = {
                  name: arrayOfPeople[i].name,
                  username: arrayOfPeople[i].username
                }
                passList.push(userObject)
            }
            return res.json({friends: passList})
        });
      }
  });
});

router.post('/getrequested', (req, res, next) => {
  requestedList = [];

  var promise = User.find({ username: { $in: req.body.requestedFriends }}).exec();
  promise.then(function(arrayOfPeople) {
      var passList = []
      for (var i = 0;i<arrayOfPeople.length;i++){
          var userObject = {
            name: arrayOfPeople[i].name,
            username: arrayOfPeople[i].username
          }
          passList.push(userObject)
      }
      return res.json({friends: passList})
  });
})

router.post('/addfriend', (req, res, next) => {
  console.log("ADDING");
  User.getUserByUsername(req.body.user, (err, user) => {
    if (err) throw err;
    if (!user){
      console.log("Couldn't add friends: User not found")
      res.json({success: false, msg: "How did you even log in????"});
    }
    else{
      User.getUserByUsername(req.body.friend, (err, friend) => {
        if (err) throw err;
        if (!friend){
          console.log("Couldn't add friends: Friend not found")
          res.json({success: false, msg: "Friend not found!"});
        }
        else{
          console.log("User: " + user.username);
          User.addFriend(user, friend, (err, canReturn) => {
            if (err) throw err;
            console.log("Adding " + req.body.user + " to " + req.body.friend + "'s friend list!");
            return res.json({success: true, msg: "Friends added!", friend: friend.name});
          });
        }
      });
    }
  })
});

router.post('/sendrequest', VerifyToken, (req, res, next) => {
  console.log("Testing");
  User.addFriendRequest(req.body.username, req.body.friend, (err, user) => {
    if (err) throw err;
    console.log(user);
    if (!user){
      res.json({success: false, msg: "Couldn't add friend. Sorry dude."});
    }else{
      res.json({success: true, msg: "If this person replies, you might have a friend!"});
    }
  })
});

router.post('/deleterequest', VerifyToken, (req, res, next) => {
  User.deleteFriendRequest(req.body.username, req.body.friend, (err, user) => {
    if (err) throw err;
    console.log(user);
    if (!user){
      res.json({success: false, msg: "Couldn't delete request. Sorry dude."});
    }else{
      res.json({success: true, requestsArray: user.requestedFriends});
    }
  })
});

router.post('/removefriend', (req, res, next) => {
  User.getUserByUsername(req.body.user, (err, user) => {
    if (err) throw err;
    if (!user){
      console.log("Couldn't remove friends: User not found")
      res.json({success: false, msg: "User not found! Could't remove."});
    }
    else{
      User.getUserByUsername(req.body.friend, (err, friend) => {
        if (err) throw err;
        if (!friend){
          console.log("Couldn't remove friends: Friend not found")
          res.json({success: false, msg: "Friend not found! Couldn't remove."});
        }
        else{
          User.removeFriend(user, friend, (err, user) => {
            if (err) throw err;
            console.log("Removing " + req.body.user + " from " + req.body.friend + "'s friend list!");
            return res.json({success: true, msg: "Friends removed!"});
          });
        }
      })
    }
  })
});

router.post('/testaddfriend', (req, res, next) => {
  User.getUserByUsername(req.body.user, (err, user) => {
    if (err) throw err;
    if (!user){
      console.log("Couldn't add friends: User not found")
      res.json({success: false, msg: "How did you even log in????"});
    }
    else{
      User.getUserByUsername(req.body.friend, (err, friend) => {
        if (err) throw err;
        if (!friend){
          console.log("Couldn't add friends: Friend not found")
          res.json({success: false, msg: "Friend not found!"});
        }
        else{
          User.addFriend(user, friend, (err, user) => {
            if (err) throw err;
            console.log("Adding " + req.body.user + " to " + req.body.friend + "'s friend list!");
            res.json({success: true, msg: "Friends added!"});
          });
        }
      });
    }
  })
});

router.post('/getstatus', (req, res, next) => {
  res.json({success: true, msg: "Online"});
});

router.post('/getroutes', (req, res, next) => {
  res.json({success: true, routes: ["searchfriends", "getfriends", "getrequested", "addfriend", "sendrequest", "deleterequest",
  "removefriend", "testaddfriend"]});
});

module.exports = router;
