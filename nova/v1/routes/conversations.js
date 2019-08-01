const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../../config/database');
const User = require('../../../models/user');
const Message = require("../../../models/message");
const Conversation = require("../../../models/conversation");
const Utils = require("../../../utils/Utility")
const Async = require('async');
var VerifyToken = require('./middleware/VerifyToken');
var VerifyJWT = require('./middleware/VerifyJWT');

router.get('/:convid', VerifyJWT, (req, res, next) => {
  Conversation.findOne({id: req.params.convid}).exec(function (err, doc){
    if (err) throw err
    if (!doc){
      console.log("Not found!")
      res.json({success: false, msg: "Could not find conversation!"});
    }else{
      res.json(doc);
    }
  });
});

router.get('/:convid/messages', VerifyJWT, (req, res, next) => {
  var simpleArray = [];
  console.log(req.params.convid)

  Message.find({id:req.params.convid}).sort({"_id": 1}).exec(function (err, docs){
    docs.forEach(function(doc){
      simpleArray.push(doc);
      //console.log(doc)
    });
    res.json({msgs: simpleArray});
  });
});

router.post('/:convid/send', VerifyJWT, (req, res, next) => {
  console.log("Conversation ID")
  console.log(req.params.convid)
  createAndSaveConversation(req.body.involved, req.params.convid, req.body.sender, (err, conv, didCreateConv) => {
    if (err) throw err;

    if(!conv){
      res.json({success: false, msg: "Looks like this conversation doesn't exist. It probably does though. Sorry."})
    }else{
      newMessagePayload = new Message({
        sender: req.body.sender,
        body: req.body.body,
        id: conv.id,
        dateTime: req.body.dateTime
      });

      Message.saveMessage(newMessagePayload, (err, newMsg) => {
        if (err) throw err;

        if (!newMsg){
          res.json({success: false, msg: "Couldn't send message, sorry mate. Go play Kirby or something."})
        }else{
          console.log("NEW MESSAGE")
          console.log(newMsg)
          Conversation.newConversation(newMsg._id, conv.id, req.body.sender, (err, finalConv) => {
            if (err) throw err;

            if (!finalConv){
              res.json({success: false, msg: "Failed to update conversation after creation."});
            }else{
              console.log("The new conv route worked somehow!");
              res.json({success: true, msg:"Updated last message!", conv: finalConv, didCreateConv: didCreateConv});
            }
          });
        }
      });
    }
  });
});

router.post('/:convid/update', VerifyJWT, (req, res, next) => {
  Message.findOne({id:req.params.convid}).sort('-_id').limit(1).exec(function (err, doc){
    if (err) throw err;

    if (doc){
      Conversation.newConversation(doc._id, req.params.convid, req.body.sender, (err, conv) => {
        if (err) throw err;

        if (!conv){
          res.json({success: false, msg: "Failed to update conversation after creation."});
        }else{
          res.json({success: true, msg:"Updated last message!"});
        }
      });
    }else{
      return res.json({success: false, msg: "Document not found, conversation update failed."});
    }
  });
});

router.delete('/:convid/:msgid', (req, res, next) => {
  var query = {}
  query["_id"] = req.body.id
  Message.findOne(query, (err, message) => {
    if (err) throw err;

    if (message){
      message.remove()
      res.json({success: true, msg: "Message deleted."});
    }
  })
});

router.post('/:convid/involved/change', VerifyJWT, (req, res, next) => {

  Conversation.changeGroupMembers(req.params.convid, req.body.involved, (err, conv) =>{
    if (err) throw err;
    if (conv){
      res.json({success: true, msg: "Successfully changed group members."});
    } else{
      res.json({success: false, msg: "Could not update group members."});
    }
  });
});

router.delete('/:convid', (req, res, next) => {
  query = {}
  query["id"] = req.params.convid;
  Message.find(query).remove().exec()
  Conversation.find(query).remove().exec();
  res.json({success: true, msg: "Conversation and all associated messages deleted."});
})

// Will always return a callback, shouldExecute is whether or not the function
// should create and save a conversation
// Callback: Error, ConvObject, DidCreateConversation
function createAndSaveConversation(involved, convID, sender, callback){
  Conversation.findOne({id: convID}, (err, conversation) => {
    if (err) throw err;

    if (!conversation){
      var lastMsgReadObject = {}
      var usersInvolved = Utils.parseInvolved(involved);

      for(var i = 0; i < usersInvolved.length; i++){
        if (usersInvolved[i] === sender){
          lastMsgReadObject[usersInvolved[i]] = ""
        }
      }

      var alphabetizedInvolved = Utils.alphabetizeInvolved(involved);

      let newConv = new Conversation({
        id: convID,
        involved: alphabetizedInvolved,
        lastMsgRead: lastMsgReadObject
      });

      Conversation.saveConv(newConv, (err, conv) => {
        if (err) throw err;
        if (!conv){
          callback("Couldn't save conversation!", null, false)
        }else{
          callback(null, conv, true)
        }
      });
    }else{
      callback(null, conversation, false)
    }
  });
}

module.exports = router;
