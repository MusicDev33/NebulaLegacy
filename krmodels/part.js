const mongoose = require('mongoose');
const config = require('../config/database');
const utility = require('../utils/Utility');

//convo schema
const PartSchema = mongoose.Schema({
  partNumber: {
    type: String
  },
  shelf: {
    type: String
  },
  quantity: {
    type: Number
  }
});

const Part = module.exports = mongoose.model('Part', PartSchema);

module.exports.getByPartNumber = function(partNumber, callback){
  Part.findOne({partNumber: partNumber}, (err, part) => {
    if (err){
      throw err;
    }else{
      callback(null, part)
    }
  })
}

module.exports.addPart = function(part, callback){
  if (!part){
    callback(null, null)
  }else{
    part.save(callback);
  }
}

module.exports.getByShelf = function(shelfID, callback){
  Part.find({shelf: shelfID}, (err, parts) => {
    if (err){
      throw err;
    }else{
      callback(null, parts)
    }
  })
}
