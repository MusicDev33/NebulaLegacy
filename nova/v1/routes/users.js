const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../../config/database');
const User = require('../../../models/user');
const Message = require("../../../models/message");
const Conversation = require("../../../models/conversation");
const Async = require('async');
var VerifyToken = require('./middleware/VerifyToken');
var VerifyJWT = require('./middleware/VerifyJWT');
require('dotenv').config();

router.post('/register', (req, res, next) => {
  var illegalCharFound = false;
  var illegalChars = "!@#$%^&*():;\"\'/\\.,~`+=[]{}|<>"
  for (var i = 0;i<req.body.username.length;i++){
    if (illegalChars.includes(i)){
      illegalCharFound = true;
    }
  }
  if (req.body.username.indexOf(' ')>=0){
    illegalCharFound = true;
  }
  if (req.body.username.length < 4){
    res.json({success: false, msg: "Username must be at least 4 characters long!"})
  }else if (req.body.username.length > 15) {
    res.json({success: false, msg: "Username must be less than 16 characters long!"})
  }else if (req.body.password.length < 6) {
    res.json({success: false, msg: "Password must be 6 characters."})
  }else if (illegalCharFound){
    res.json({success: false, msg: "Illegal character found!"})
  }else if (req.body.password.indexOf(' ')>=0){
    res.json({success: false, msg: "Password can't have spaces."})
  }else if (!(req.body.email.indexOf('@') > -1)){
    res.json({success: false, msg: "Must have real email!"})
  }else if (req.body.username == "master" || req.body.username == "Master"){
    res.json({success: false, msg: "You prove your worth to have this username."})
  }else{
    let newUser = new User({
      registrationTokens: req.body.registrationTokens,
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      friends: [],
      requestedFriends: [],
      customization: {}
    });

    User.getUserByUsername(req.body.username, (err, user) =>{
      if (!user){
        User.addUser(newUser, (err, userPerson) => {
          if (err) throw err;
          if (!userPerson){ // lol
            res.json({success: false, msg:"Failed to register user."});
          } else {
            res.json({success: true, msg: "User registered"});
          }
        });
      }
      else{
        res.json({success: false, msg: "Username taken!"})
      }
    })
  }
});

router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log("Attempting to log " + username + " in.")
  console.log("Logged in.")
  console.log("\uD83E\uDD84")
  User.getUserByUsername(username, (err, user) => {
    console.log("USER!!!!!")
    console.log(user)
    if(err) throw err;
    if (!user){
      console.log("User doesn't exist!");
      return res.json({success: false, msg: "Failed to authenticate, user doesn't exist"});
    }

    if(!("requestedFriends" in user)){
      console.log("No requested friends.");
      User.updateUserObject(req.body.username, (req, res, next) => {

      });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if(isMatch){
        const token = jwt.sign(user.toJSON(), config.secret, {
          expiresIn: 21600 // 6 hours
        });
        console.log(req.body.username + " has logged in.");

        if (req.body.newToken){
          console.log("GOT A TOKEN!")
          console.log(req.body.newToken)
          User.updateToken(req.body.newToken, user, (err,user) => {
            if (err){
              throw err;
            }else{
              res.json({
                success: true,
                token: /*'JWT ' + */token,
                user: {
                  id: user._id,
                  name: user.name,
                  username: user.username,
                  email: user.email,
                  friends: user.friends,
                  requestedFriends: user.requestedFriends,
                  customization: user.customization,
                  poolSubs: user.poolSubs
                }
              });
            }
          })
        }else{
          res.json({
            success: true,
            token: /*'JWT ' + */token,
            user: {
              id: user._id,
              name: user.name,
              username: user.username,
              email: user.email,
              friends: user.friends,
              requestedFriends: user.requestedFriends,
              customization: user.customization,
              poolSubs: user.poolSubs
            }
          });
        }
      }

      else{
        console.log("Wrong password!");
        return res.json({success: false, msg: "Wrong password!"});
      }
    });
  });
});

router.post('/addphonenumber', VerifyJWT, (req, res, next) => {
  console.log("ADDING NUMBER")
  console.log(req.body.username)
  User.addPhoneNumber(req.body.phoneNumber, req.body.username, (err, user) => {
    if (err){
      res.json({success: false, msg: "Failed to add phone number."});
    }else{
      res.json({success: true, msg: "Added phone number."})
    }
  })
});

router.get('/getcurrentios', (req, res, next) => {
  var currentVersion = process.env.IOS_BETA_VERSION;
  var lastSupportedBuild = process.env.IOS_BETA_BUILD;

  if (req.query.version == currentVersion && req.query.build >= lastSupportedBuild){
    res.json({success: true, msg: "You're up to date! Thanks for updating!"});
  }else{
    res.json({success: false, msg: "Build outdated. Update the app through TestFlight."});
  }
});

router.get('/quotes', (req, res, next) => {
  var quoteList = []
  quoteList.push("Rad.")
  quoteList.push("Don't forget to put ranch on your burrito.")
  quoteList.push("Go Team Valor!")
  quoteList.push("Have you brushed your teeth today?")
  quoteList.push("Do guys know where Sammy went?")
  quoteList.push("If I shower too long, my feet get tired.")
  quoteList.push("Annoying AF")
  quoteList.push("Copy the pasta, not the copy pasta.")
  quoteList.push("Make a donation to the Flying Spaghetti Monster today!")
  quoteList.push("HELP!")
  quoteList.push("I'm being held hostage!")
  quoteList.push("It's 3:12 AM...only an hour and 8 minutes to go!")
  quoteList.push("*intense floor mopping*")
  quoteList.push("Play a ii - V - I or don't play at all.")
  quoteList.push("There's something to be said about things that are to be said.")
  quoteList.push("Listen to more jazz.")
  quoteList.push("Mozart is overrated. Come at me bro.")
  quoteList.push("Don't dig straight down!")
  quoteList.push("Default Dance < Orange Justice")
  quoteList.push("Blasting off of Kerbin in 3...2...1...")
  quoteList.push("Does Mason know what the numbers mean yet?")
  quoteList.push("The lie is the cake.")
  quoteList.push("You were almost a Jill sandwich! (Voice Acting - 100)")
  quoteList.push("I am sworn to carry your burdens... - Lydia, 2011")
  quoteList.push("Hold guards, knees, and arrows...what was that from again?")
  quoteList.push("Am Pablo Escobork, fren.")
  quoteList.push("Did we ever find out what color the dress was?")
  quoteList.push("Geriatric Parkour!")
  quoteList.push("I'm pretty much a theoretical physicist now.")
  quoteList.push("*Bad Words*")
  quoteList.push("Still waiting on that 3rd Half Life game...")
  quoteList.push("Bitcoin's price changed by $100 in the time you took to read this.")
  quoteList.push("Stay at an appropriate amount of diggity when using Nebula. Thank you.")
  quoteList.push("We didn't want foldable phones and we got them, so now we want foldable phones.")
  quoteList.push("Why leave the house when you can just go back to bed?")
  quoteList.push(":)")
  res.json({quotes: quoteList});
});

router.get("/search/:username", VerifyJWT, (req, res, next) => {
  User.getUserByUsername(req.params.username, (err, foundUser) => {
    returnUser = {
      username: foundUser.username,
      name: foundUser.name
    }
    res.json({user: returnUser});
  })
})

router.get('/:userid', VerifyJWT, (req, res, next) => {
  console.log("Sent")
  console.log(req.params.userid)

  User.getUserById(req.params.userid, (err, user) => {
    if (!user){
      var msgString = "Couldn't find user " + "'" + req.params.userid + "'."
      res.status(404).json({success: false, msg: msgString});
    }else{
      res.json({success: true, user: user})
    }
  })
});

router.get('/:userid/friends', VerifyJWT, (req, res, next) => {
  console.log(req.params.attribute)

  User.getUserById(req.params.userid, (err, user) => {
    if (!user){
      var msgString = "Couldn't find user " + "'" + req.params.userid + "'."
      res.status(404).json({success: false, msg: msgString});
    }else{
      var promise = User.find({ username: { $in: user.friends }}).exec();
      promise.then(function(friendArray) {
          var passList = []
          for (var i = 0;i<friendArray.length;i++){
              var userObject = {
                name: friendArray[i].name,
                username: friendArray[i].username
              }
              passList.push(userObject)
          }
          res.json({success: true, friends: passList, name: user.name});
      });
    }
  });
});

router.get("/:userid/conversations", VerifyJWT, (req, res, next) => {
  var convArray = [];
  User.findById(req.params.userid, (err, user) => {
    if (err) throw err;
    if (user){
      var query = ".*" + user.username + ".*";
      Conversation.find({involved: {$regex: query}}).sort({"lastMessage": -1}).exec(function(err, docs){
        docs.forEach(function(doc){
          convArray.push(doc)
        });
        res.json({success: true, conversations: convArray});
      })
    }else{
      res.json({success: false, msg: "Couldn't find user."})
    }
  })
});

router.post('/:userid/requests/:friend', VerifyJWT, (req, res, next) => {
  console.log("Testing");
  User.getUserById(req.params.userid, (err, user) => {
    if (err) throw err;
    if (!user){
      res.json({success: false, msg: "Couldn't find user by ID or something like that...ERROR"});
    }else{
      User.addFriendRequest(user.username, req.params.friend, (err, user) => {
        if (err) throw err;
        if (!user){
          res.json({success: false, msg: "Couldn't add friend. Sorry dude."});
        }else{
          res.json({success: true, msg: "If this person replies, you might have a friend!"});
        }
      })
    }
  });
});

router.delete('/:userid/requests/:friend', VerifyJWT, (req, res, next) => {
  console.log("Test")
  User.getUserById(req.params.userid, (err, user) => {
    if (err) throw err;
    if (!user){
      res.json({success: false, msg: "Couldn't find user by ID or something like that...ERROR"});
    }else{
      User.deleteFriendRequest(user.username, req.params.friend, (err, user) => {
        if (err) throw err;
        if (!user){
          console.log("Couldn't delete request.")
          res.json({success: false, msg: "Couldn't add friend. Sorry dude."});
        }else{
          console.log("Friend request deleted.")
          res.json({success: true, msg: "If this person replies, you might have a friend!"});
        }
      })
    }
  });
})

router.get('/:userid/:attribute', VerifyJWT, (req, res, next) => {
  User.getUserById(req.params.userid, (err, user) => {
    if (!user){
      var msgString = "Couldn't find user " + "'" + req.params.userid + "'."
      res.status(404).json({success: false, msg: msgString});
    }else{
      console.log(user)
      if (user[req.params.attribute] !== undefined){
        res.json({success: true, attr: user[req.params.attribute]})
      }else{
        res.json({success: false, msg: "Attribute '" + req.params.attribute + "' doesn't exist on user!"})
      }
    }
  });
});

router.get("/:userid/conversations/:convid", VerifyJWT, (req, res, next) => {
  var msgArray = []
  console.log("GRABBING")
  Message.find({id:req.params.convid}).sort({"_id": -1}).limit(30).exec(function (err, docs){
    docs.forEach(function(doc){
      msgArray.push(doc);
    });
    msgArray.reverse();
    res.json({msgs: msgArray});
  });
});

router.post('/:userid/pools/subscriptions/add', VerifyJWT, (req, res, next) => {
  console.log("Adding pool subscription.")
  User.getUserById(req.params.userid, (err, user) => {
    if (err) throw err;
    if (!user) {
      res.json({success: false, msg: "Couldn't find user by ID. Try harder."});
    }else{
      User.addPoolSub(user.username, req.body.poolId, (err, user) => {
        if (err){
          res.json({success: false, msg: "Failed to add pool subscriptions."})
        }else{
          res.json({success: true, msg: "Added pool subscription."})
        }
      })
    }
  })
});

router.post('/:userid/pools/subscriptions/remove', VerifyJWT, (req, res, next) => {
  console.log("Removing pool subscription.")
  User.getUserById(req.params.userid, (err, user) => {
    if (err) throw err;
    if (!user) {
      res.json({success: false, msg: "Couldn't find user by ID. Try it again, it'll probably work."})
    }else{
      User.removePoolSub(user.username, req.body.poolId, (err, user) => {
        if (err){
          res.json({success: false, msg: "Failed to remove pool subscriptions."})
        }else{
          res.json({success: true, msg: "Removed pool subscription."})
        }
      })
    }
  })
})

router.post('/refreshtoken', VerifyJWT, (req, res, next) => {
  // Request body includes old token and new token and username
  User.updateToken(req.body.newToken, req.body.username, (err,user) => {
    if (err) throw err;

    if (!user){
      res.json({success: false, msg: "Couldn't update user's Firebase token. Maybe we should stop using Firebase..."})
    }else{
      res.json({success: true, msg: "Good job homie! You replaced that token!"});
    }
  })
});

module.exports = router;
