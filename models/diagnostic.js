const mongoose = require('mongoose');
const config = require('../config/database');

// User Schema
const DiagnosticSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  info: {
    type: String,
    required: true
  },
  device: {
    type: String,
    required: true
  },
  optional: {
    type: String,
    required: true
  }
});

const Diagnostic = module.exports = mongoose.model('Diagnostic', DiagnosticSchema);

module.exports.saveDiagnostic = function(newDiag, callback){
  let diag = new Diagnostic({
    username: newDiag.username,
    info: newDiag.info,
    device: newDiag.device,
    optional: newDiag.optional
  });
  diag.save(callback);
}
