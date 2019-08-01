const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const Utils = require("../utils/Utility")
const Async = require('async')


router.post('/send', (req, res, next) => {
  var passId = ""
  var didCreateId = false;
  console.log(req.body);
  if(req.body.hasOwnProperty('friendsArray')){
    console.log("Yes, boyo!")
    console.log(req.body.friendsArray)
  }

  if(req.body.hasOwnProperty('id')){
    console.log("Has ID")
    console.log(req.body.id)
    passId = req.body.id
  }else{
    passId = ""
  }
  let newMessagePayload = new Message({});
  Conversation.findOne({id: passId}).exec(function (err, doc){
    if (!doc){
      var randomObject = {}
      var parsedFriends = Utils.parseConvID(req.body.convId)
      //console.log(parsedFriends)
      for(var i=0;i<parsedFriends.length;i++){
        if (parsedFriends[i] === req.body.sender){
          randomObject[parsedFriends[i]] = req.body.body
        }
      }

      var passConvId = Utils.alphabetizeConvId(req.body.convId);

      var d = new Date();
      var millisecondId = d.getTime().toString();
      millisecondId = millisecondId + ":" + parsedFriends[0];

      let newConv = new Conversation({
        id: millisecondId,
        involved: passConvId,
        lastMsgRead: randomObject
      });
      didCreateId = true

      Conversation.saveConv(newConv, (err, msgSender) => {
        if (err){
          throw err;
          // These throw an error saying you can't edit headers. I'll leave them
          // commented out because I don't know why
          //res.json({success: false, msg:"Failed to add conversation. Do you really want to talk to people anyway?"});
        } else {
          console.log("Added a conversation!");
          newMessagePayload = new Message({
            sender: req.body.sender,
            body: req.body.body,
            friend: req.body.friend,
            id: millisecondId,
            convId: passConvId,
            dateTime: req.body.dateTime,
            read: req.body.read
          });
          console.log("CONV CHECK")

          Message.saveMessage(newMessagePayload, (err, newMsg) => {
            console.log("CHECK");
            if (err){
              console.log(err);
              console.log("Message couldn't send.");
              res.json({success: false, msg:"Failed to send message. Try again. And again."});
            } else {
              console.log("Message sent.");
              console.log(newMsg);
              Conversation.newConversation(newMsg._id, millisecondId, req.body.sender, (err, finalConv) => {
                if (err){
                  throw err;
                  res.json({success: false, msg:"Failed to update conversation due to error"});
                }
                if (!finalConv){
                  console.log("Didn't update!");
                  res.json({success: false, msg: "Failed to update conversation after creation."});
                }else{
                  console.log("it worked somehow!");
                  res.json({success: true, msg:"Updated last message!", conv: finalConv});
                }
              });
            }
          });
        }
      });
    }else{
      newMessagePayload = new Message({
        sender: req.body.sender,
        body: req.body.body,
        friend: req.body.friend,
        id: req.body.id,
        convId: passConvId,
        dateTime: req.body.dateTime,
        read: req.body.read
      });
      console.log("CONV CHECK");

      Message.saveMessage(newMessagePayload, (err, msgSender) => {
        console.log("CHECK");
        console.log(newMessagePayload)
        if (err){
          throw err;
          console.log("Message couldn't send.");
          res.json({success: false, msg:"Failed to send message. Try again. And again."});
        }
        if (!msgSender){
          console.log("Something went wrong!")
          res.json({success: false, msg:"Failed to send message......."})
        } else {
          console.log("Message sent.");
          console.log(msgSender);

          Conversation.changeLastMessage(msgSender._id, passId, (err, conv) => {
            if (err){
              throw err
            }else{
              console.log("Updated last message successfully!")
              Conversation.updateLastRead(req.body.id, msgSender._id, req.body.sender, (err, finalConv) => {
                if (err) throw err;
                if (!finalConv){
                  console.log("UPDATELASTREAD Failed.")
                }else {
                  console.log("Conv update works");
                }
              });
            }
          });
          res.json({success: true, msg:"Updated last message!"});
        }
      });
    }
  });
});

router.post('/getmsgs', (req, res, next) => {
  var simpleArray = [];
  console.log("GETMSG");
  console.log(req.body.id)

  Message.find({id:req.body.id}).sort({"_id": 1}).exec(function (err, docs){
    docs.forEach(function(doc){
      simpleArray.push(doc);
      //console.log(doc)
    });
    res.json({msgs: simpleArray});
  });
});

router.post('/getmsgswithid', (req, res, next) => {
  var simpleArray = [];

  Message.find({id:req.body.id}).sort({"_id": 1}).exec(function (err, docs){
    docs.forEach(function(doc){
      simpleArray.push(doc);
      //console.log(doc)
    });
    res.json({msgs: simpleArray});
  });
});

router.post('/getmsgswithidtoken', (req, res, next) => {
  var simpleArray = [];

  var token = req.body.token;

  if (token) {

      // verifies secret and checks exp
      jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
          console.log(err)
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          Message.find({id:req.body.id}).sort({"_id": -1}).limit(30).exec(function (err, docs){
            docs.forEach(function(doc){
              simpleArray.push(doc);
              //console.log(doc)
            });
            simpleArray.reverse();
            res.json({msgs: simpleArray});
          });
        }
      });
    }
    else{
      return res.json({ success: false, message: 'Failed to authenticate token.' });
    }
});

router.post('/getonemsg', (req, res, next) => {
  var simpleArray = [];
  Message.find({id:req.body.id}).exec(function (err, docs){
    if (err) throw err
    docs.forEach(function(doc){
      simpleArray.push(doc);
    });
    res.json({msg: simpleArray});
  });
});

router.post('/getlastmsg', (req, res, next) => {
  User.getUserByUsername(req.body.id, (err, user) => {
    if(err) throw err;
    if (!user){
      return res.json({success: false, msg: "Couldn't get Friend Object. Maybe leave the house for once?"});
      }
      else{
        var passUser = {
          name: user.name,
          email: user.email,
          username: user.username
        }
        return res.json({friend: passUser});
      }
  });
});

router.post('/deletemsg', (req, res, next) => {
  var simpleArray = [];
  const query = {}

  query["_id"] = req.body.id

  Message.find(query).remove().exec();
  res.json({success: true, msg: "Message deleted."});
});

router.post('/deletemsgs', (req, res, next) => {
  // Pass in list of _ids as req.body.idList
  req.body.idList.forEach(function(id){
    Message.find({_id: id}).remove().exec(function(err){
      if (err) throw err;
    })
  })
  res.json({success: true, msg: "Deleted messages."});
})

module.exports = router;
