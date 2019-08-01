var jwt = require('jsonwebtoken');
var config = require('../../config/database');

function verifyToken(req, res, next) {
  var token = req.header("Authorization");
  console.log(token)

  if (token) {
      // verifies secret and checks exp
      // wtf is exp
      jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
          console.log(err)
          return res.status(420).json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          next()
        }
      });
    }
    else{
      return res.status(420).json({ success: false, message: 'Failed to authenticate token.' });
    }
}


module.exports = verifyToken;
