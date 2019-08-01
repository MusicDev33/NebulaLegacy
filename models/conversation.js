const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const utility = require('../utils/Utility');

//convo schema
const ConversationSchema = mongoose.Schema({
  id: {
    type: String
  },
  involved: {
    type: String
  },
  lastMessage: {
    type: String,
    default: ""
  },
  lastMsgRead: Object,
  latestMessageTime: {
    type: String,
    default: ""
  }
});

const Conversation = module.exports = mongoose.model('Conversation', ConversationSchema);

module.exports.getConversationByInvolved = function(usersInvolved, callback){
  let userList = [];
  for (i=0; i<usersInvolved.length; i++){
    userList.push(usersInvolved[i]);
  }
  const query = {involved: userList}
  Conversation.find(query, callback);
}

module.exports.getAllConvFromUser = function(user, callback){
  var qString = ".*"+user+".*";
  const query = {involved: {$regex : qString}}
  Conversation.find(query, callback);
}
/*
module.exports.updateConv = function(updateObj, callback){
  console.log("Update Conv Query: " + updateObj.query);
  console.log(updateObj);
  var tempString = "lastMsgRead." + updateObj.id
  var q = {};
  q[tempString] = updateObj.params;
  console.log(q);
  Conversation.findOneAndUpdate(updateObj.involved, q, function(err, data){
    if(err){
      console.log(err)
    }else{
      console.log("Success:")
      console.log(data)
    }
  });
}*/

module.exports.updateLastRead = function(convId, messageId, username, callback){
  var userString = "lastMsgRead." + username;
  var tempQuery = {}
  tempQuery[userString] = messageId
  var q ={$set: tempQuery}
  console.log(q)
  Conversation.findOneAndUpdate({id: convId}, q, function(err, data){
    if(err){
      console.log(err)
      callback(err, null);
    }else{
      console.log("Success:!!!")
      console.log(data)
      callback(null, data);
    }
  });
}

module.exports.changeLastMessage = function(messageId, convId, callback){
  var date = new Date();
  console.log(messageId);
  Conversation.findOneAndUpdate({id: convId}, {$set: {lastMessage: messageId, latestMessageTime: date}}, function(err, data){
    if(err){
      console.log(err);
      callback(err, null);
    }else{
      console.log("Success:!");
      console.log(data);
      callback(null, data);
    }
  });
}

// Does both of the functions above at the same time
module.exports.updateConversation = function(messageID, convID, callback){
  var date = new Date();
  var userString = "lastMsgRead." + username;
  var tempQuery = {}
  tempQuery[userString] = messageId;
  tempQuery["lastMessage"] = messageId;
  tempQuery["latestMessageTime"] = date;
  var q ={$set: tempQuery}
  console.log(messageId);
  Conversation.findOneAndUpdate({id: convId}, q, {new:true},function(err, data){
    if(err){
      console.log(err);
      callback(err, null);
    }else{
      console.log("Success:!");
      console.log(data);
      callback(null, data);
    }
  });
}
module.exports.newConversation = function(messageId, convId, username, callback){
  var date = new Date();
  var userString = "lastMsgRead." + username;
  var tempQuery = {}
  tempQuery[userString] = messageId;
  tempQuery["lastMessage"] = messageId;
  tempQuery["latestMessageTime"] = date;
  var q ={$set: tempQuery}
  console.log(messageId);
  Conversation.findOneAndUpdate({id: convId}, q, {new:true},function(err, data){
    if(err){
      console.log(err);
      callback(err, null);
    }else{
      console.log("Success:!");
      console.log(data);
      callback(null, data);
    }
  });
}

module.exports.changeGroupMembers = function(convId, involved, callback){
  var newInvolved = utility.alphabetizeConvId(involved);
  Conversation.findOneAndUpdate({id: convId}, {$set: {involved: newInvolved}}, function(err, data){
    if(err){
      console.log(err);
      callback(err, null);
    }else{
      console.log("Success:!");
      console.log(data);
      callback(null, data);
    }
  });
}

module.exports.saveConv = function(newMessage, callback){
  console.log("Conv Saving: " + newMessage);

  Conversation.find({involved: newMessage.involved}, function(err, docs) {
    if (docs.length){
      console.log("Exists")
    }else{
      var lastMessage = "";
      var date = new Date();
      if(newMessage.hasOwnProperty('lastMessage')){
        lastMessage = newMessage.lastMessage;
      }
      let conv = new Conversation({
        involved: newMessage.involved,
        id: newMessage.id,
        lastMsgRead: newMessage.lastMsgRead,
        lastMessage: lastMessage,
        latestMessageTime: date

      });
      conv.save(callback);
    }
  });
}
