const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../../config/database');
const Diagnostic = require('../../../models/diagnostic');
var VerifyJWT = require('./middleware/VerifyJWT');

router.post('/sendinfo', VerifyJWT, (req, res, next) => {
  // Request body includes old token and new token and username
  if(req.body.hasOwnProperty('optional')){
    var optional = req.body.optional
  }else{
    var optional = ""
  }

  let info = new Diagnostic({
    username: req.body.username,
    info: req.body.info,
    device: req.body.device,
    optional: optional
  });
  Diagnostic.saveDiagnostic(info, (err, userPerson) => {
    if (err){
      res.json({success: false, msg:"Failed to save diagnostics data."});
    } else {
      res.json({success: true, msg: "Diagnostics sent."});
    }
  });
});

router.post('/getstatus', (req, res, next) => {
  res.json({success: true, msg: "Online"});
});

router.post('/getroutes', (req, res, next) => {
  res.json({success: true, routes: ["sendinfo"]});
});

module.exports = router;
