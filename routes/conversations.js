const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
let User = require('../models/user');
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const Utils = require("../utils/Utility")
const Async = require('async');
var VerifyToken = require('./middleware/VerifyToken');
var VerifyHeaderToken = require('./middleware/VerifyHeaderToken')


router.post('/addconv', (req, res, next) => {
  console.log(req.body.involved);

  var randomObject = {}
  var parsedFriends = Utils.parseConvID(req.body.convId)
  for(var i=0;i<parsedFriends.length;i++){
    randomObject[parsedFriends[i]] = "hello"
  }

  let newConv = new Conversation({
    id: req.body.id,
    involved: req.body.convId,
    lastMsgRead: randomObject
  });

  Conversation.saveConv(newConv, (err, msgSender) => {
    if (err){
      throw err;
      res.json({success: false, msg:"Failed to add conversation. Do you really want to talk to people anyway?"});
    } else {
      console.log("Added a conversation!");
      res.json({success: true, msg: "Conv registered"});
    }
  });
});
/*
router.post('/updateconv', (req, res, next) => {
  console.log("Conv request: " + req.body.id);
  console.log("Conv params" + req.body.params);
  console.log(req.body);
  var pass = {
    id: req.body.id.id,
    params: req.body.params,
    involved: req.body.query
  }

  Conversation.updateConv(pass, (err, msgSender) => {
    if (err){
      throw err;
      res.json({success: false, msg:"Failed to update conversation."});
    } else {
      console.log("Conv update works");
      res.json({success: true, msg: "Conv updated."});
    }
  });
});*/

router.post('/changegroupmembers', (req, res, next) => {

  var token = req.body.token;

  if (token) {
    //console.log(token);

      // verifies secret and checks exp
      jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
          console.log(err)
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          Conversation.changeGroupMembers(req.body.id, req.body.involved, (err, conv) =>{
            if (err) throw err;
            if (conv){
              res.json({success: true, msg: "Successfully changed group members."});
            } else{
              res.json({success: false, msg: "Could not update group members."});
            }
          });
        }
      });
    }
    else{
      return res.json({ success: false, message: 'Failed to authenticate token.' });
    }
});

router.post('/updatelastread', (req, res, next) => {
  Message.findOne({id:req.body.id}).sort('-_id').limit(1).exec(function (err, doc){
    if (err) throw err;
    if (doc){
      Conversation.changeLastMessage(doc._id, req.body.id, (err, conv) => {
        if (err){
          throw err
          return res.json({success: false, msg:"Failed to update last message."});
        }else if (conv){
          Conversation.updateLastRead(req.body.id, doc._id, req.body.username, (err, msgSender) => {
            if (err) throw err;
            if (!msgSender){
              return res.json({success: false, msg:"Failed to update conversation."});
            }else {
              return res.json({success: true, msg: "Conv updated."});
            }
          });
        }
      });
    }else{
      return res.json({success: false, msg: "Document not found, conversation update failed."});
    }
  });
});

//Returns one conversation
router.post('/getconv', VerifyToken, (req, res, next) => {
  console.log("ADGJADGJDFHADFAHFADFH")
  var friendsArray = req.body.users.sort();
  var id = ""
  for (var i = 0; i < friendsArray.length; i++){
    if (i < friendsArray.length-1){
      id += friendsArray[i]
      id += ":"
    }
    if (i == friendsArray.length-1){
      id += friendsArray[i]
      id += ';'
    }
  }

  Conversation.findOne({involved: id}).exec(function (err, doc){
    if (err) throw err
    if (!doc){
      console.log("Not found!")
      res.json({success: false, msg: "Could not find conversation!"});
    }else{
      res.json(doc);
    }
  });
});

router.post('/getconvs', (req, res, next) => {
  var simpleArray = [];
  var qString = ".*"+req.body.user+".*";

  Conversation.find({involved: {$regex : qString}}).exec(function (err, docs){
    docs.forEach(function(doc){
      simpleArray.push(doc);
    });
    res.json({conv: simpleArray});
  });
});

router.get("/:userid", VerifyHeaderToken, (req, res, next) => {
  var convArray = [];
  User.findById(req.params.userid, (err, user) => {
    if (err) throw err;
    if (user){
      var query = ".*" + user.username + ".*";
      Conversation.find({involved: {$regex: query}}).exec(function(err, docs){
        docs.forEach(function(doc){
          convArray.push(doc)
        });
        res.json({success: true, convs: convArray});
      })
    }else{
      res.json({success: false, msg: "Couldn't find user."})
    }
  })
})

router.post('/deleteconv', (req, res, next) => {
  query = {}
  query["id"] = req.body.id;
  Conversation.find(query).remove().exec();
  Message.find(query).remove().exec();
  res.json({success: true, msg: "Conversation and all associated messages deleted."});
});

router.post('/getstatus', (req, res, next) => {
  res.json({success: true, msg: "Online"});
});

router.post('/getroutes', (req, res, next) => {
  res.json({success: true, routes: ["addconv", "changegroupmembers", "updatelastread", "getconv", "getconvs", "deleteconv"]});
});

module.exports = router;
