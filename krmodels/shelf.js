const mongoose = require('mongoose');
const config = require('../config/database');
const utility = require('../utils/Utility');

//convo schema
const ShelfSchema = mongoose.Schema({
  name: {
    type: String
  }
});

const Shelf = module.exports = mongoose.model('Shelf', ShelfSchema);

module.exports.getByName = function(name, callback){
  Part.findOne({name: name}, (err, part) => {
    if (err){
      throw err;
    }else{
      callback(null, part)
    }
  })
}

module.exports.addShelf = function(shelf, callback){
  if (!shelf){
    callback(null, null)
  }else{
    shelf.save(callback);
  }
}
