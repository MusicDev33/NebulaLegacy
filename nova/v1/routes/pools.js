const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../../config/database');
const User = require('../../../models/user');
const Message = require("../../../models/message");
const Conversation = require("../../../models/conversation");
const Pool = require("../../../models/pool");
const GPSUtils = require("../../../utils/GPSUtils")
const Utils = require("../../../utils/Utility")
const Async = require('async');
var VerifyJWT = require('./middleware/VerifyJWT');

function print(text){
  console.log("[Routes: pools.js] " + text)
}

var badWords = ["nigga", "nigger", "ass", "bitch", "shit", "tits", "fuck", "boobs", "damn", "asshole", "clit", "cunt", "butt",
"sex", "cunnilingus", "fucker", "cock", "cocksucker", "motherfucker", "pussy", "puss", "bukkake", "cuck", "piss", "pee",
"tiktok", "smut", "mofo", "whore", "slut", "thot", "arse", "arsehole", "bastard", "fag", "faggot", "beaner", "bitchass",
"bullshit", "chinc", "chink", "choad", "chode", "goddamn", "godamn", "dammit", "coochie", "coochy", "cooch", "coon", "cooter",
"semen", "cumming", "dick", "dickhead", "dipshit", "dumbass", "smartass", "fatass", "dumbfuck", "dickhole", "faggit",
"fucking", "shitting", "bitching", "shits", "shithead", "bitches", "gooch", "gringo", "hoe", "heeb", "honkey", "jackass",
"jap", "jigaboo", "jizz", "kike", "kooch", "kock", "kyke", "kunt", "muffdiver", "milf", "minge", "masturbate", "masterbate",
"masturbating", "masterbating", "nigaboo", "nigaboos", "niggas", "nigguhs", "niggers", "niglet", "niglett", "niglets",
"nigletts", "queef", "ruski", "sandnigger", "spic", "spick", "twat", "slipback", "wetback", "masturb8", "masterb8"]

router.post('/create', VerifyJWT, (req, res, next) => {
  console.log(req.body.coordinates);
  let newPool = new Pool({
    coordinates: req.body.coordinates,
    poolId: req.body.coordinates[0].toString()+req.body.coordinates[1].toString(),
    name: req.body.name,
    creator: req.body.username,
    connectionLimit: req.body.connectionLimit,
    usersConnected: [req.body.username]
  });

  Pool.savePool(newPool, (err, pool) => {
    if (err){
      throw err;
      res.json({success: false, msg:"Failed to add conversation. Do you really want to talk to people anyway?"});
    } else {
      console.log("Added a conversation!");
      res.json({success: true, msg: "Conv registered", pool: pool});
    }
  });
});

router.get('', VerifyJWT, (req, res, next) => {
  var simpleArray = [];
  User.getUserById(req.query.userid, (err, user) => {
    if (err) throw err;
    if (!user){
      res.json({success: false, msg: "Invalid user ID, that's a no from me, dawg."})
    }else{
      Pool.find().exec(function (err, docs){
        docs.forEach(function(doc){
          for (i = 0; i < badWords.length; i++) {
            if (doc.creator != user.username){
              if (doc.name.toLowerCase().includes(badWords[i])){
                doc.name = "*Bad Words*";
              }
            }
          }
          simpleArray.push(doc);
          //console.log(doc)
        });
        res.json({pools: simpleArray});
      });
    }
  });
});

router.get('/distance', (req, res, next) => {
  console.log(GPSUtils.getDistanceBetweenPoints(req.body.c1, req.body.c2));
  res.json({success: true, msg: "Gottem"});
})

router.post('/:poolid/send', VerifyJWT, (req, res, next) => {

  newMessagePayload = new Message({
    sender: req.body.sender,
    body: req.body.body,
    friend: "",
    id: req.params.poolid,
    convId: "",
    dateTime: req.body.dateTime,
    read: false
  });

  Message.saveMessage(newMessagePayload, (err, msgSender) => {
    if (err){
      console.log("Message couldn't send.");
      res.json({success: false, msg:"Failed to send message. Try again. And again."});
    } else {
      console.log("Message sent.");
      res.json({success: true, msg: "Message sent successfully."});
    }
  });

});

router.delete('/:poolid', VerifyJWT, (req, res, next) => {
  var query = {}
  var poolQuery = {}
  query["id"] = req.params.poolid;
  poolQuery["poolId"] = req.params.poolid;
  Pool.findOne(poolQuery).exec(function (err, doc){
    if (doc.creator == req.body.username){
      doc.remove();
      Message.find(query).remove().exec();
      res.json({success:true, msg: "Pool has been removed."});
    }else{
      res.json({success:false, msg: "Couldn't remove pool. Authorization required."});
    }
  });
});


router.get('/:poolid/messages', VerifyJWT, (req, res, next) => {
  var simpleArray = [];

  Message.find({id:req.params.poolid}).sort({"_id":1}).exec(function (err, docs){
    docs.forEach(function(doc){
      simpleArray.push(doc);
      //console.log(doc)
    });
    res.json(simpleArray);
  });
});

router.post('/getstatus', (req, res, next) => {
  res.json({success: true, msg: "Online"});
});

router.post('/getroutes', (req, res, next) => {
  res.json({success: true, routes: ["createpool", "getpools", "send", "deletepool", "getmsgs"]});
});

module.exports = router;
