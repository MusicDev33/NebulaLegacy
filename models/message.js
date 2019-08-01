const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

//message schema
const MessageSchema = mongoose.Schema({
  sender: {
    type: String
  },
  body: {
    type: String
  },
  id: {
    type: String
  },
  convId: {
    type: String
  },
  dateTime: {
    type: String
  },
  read: {
    type: Boolean
  }

});

const Message = module.exports = mongoose.model('Message', MessageSchema);

module.exports.getMessageById = function(id, callback){
  Message.findById(id, callback);
}

module.exports.getMessagesBySender = function(user, callback){
  const query = {sender: user}
  Message.find(query, callback);
}

module.exports.saveMessage = function(newMessage, callback){
  console.log("Saving message.!!!")
  let message = new Message({
    sender: newMessage.sender,
    body: newMessage.body,
    id: newMessage.id,
    convId: newMessage.convId,
    read: newMessage.read,
    dateTime: newMessage.dateTime
  })
  message.save(callback);
}
