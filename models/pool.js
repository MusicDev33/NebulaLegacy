const mongoose = require('mongoose');
const config = require('../config/database');

// User Schema
const PoolSchema = mongoose.Schema({
  coordinates: {
    type: Array,
    required: true
  },
  poolId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  creator: {
    type: String,
    required: true
  },
  connectionLimit: {
    type: Number,
    required: true
  },
  usersConnected: {
    type: Array,
    required: true
  }
});

const Pool = module.exports = mongoose.model('Pool', PoolSchema);

module.exports.savePool = function(newPool, callback){
  let pool = new Pool({
    coordinates: newPool.coordinates,
    poolId: newPool.poolId,
    name: newPool.name,
    creator: newPool.creator,
    connectionLimit: newPool.connectionLimit,
    usersConnected: newPool.usersConnected
  });
  pool.save(callback);
}
