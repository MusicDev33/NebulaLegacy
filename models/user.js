const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

function print(text){
  console.log("[Models: user.js] " + text);
}

// User Schema
const UserSchema = mongoose.Schema({
  registrationTokens: {
    type: Array,
    required: true
  },
  name: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  friends: {
    type: Array,
    required: true
  },
  phoneNumber: {
    type: String,
    required: false
  },
  requestedFriends: {
    type: Array,
    required: true
  },
  poolSubs: {
    type: Array,
    required: true
  },
  customization: {
    type: Object,
    required: true
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}

module.exports.getUserByUsername = function(user, callback){
  const query = {username: user}
  User.findOne(query, callback);
}

module.exports.getUserByRegistrationToken = function(oldToken, callback){
  const query = {registrationToken: oldToken}
  User.findOne(query, callback)
}

module.exports.replaceToken = function(oldToken, newToken, user, callback){
  const query = {username: user}
  User.findOne(query, (err, userObject) => {
    var tokenArray = userObject.registrationTokens
    var index = tokenArray.indexOf(oldToken);
    if (index !== -1){
      tokenArray.splice(index, 1);
      tokenArray.push(newToken);
    } else{
      return;
    }
    User.findOneAndUpdate({
      username: user.username
    }, {
      registrationTokens: tokenArray
    },{
      new: true,
      runValidators: true
    })
    .then(doc => {
      console.log("Token refreshed!")
    })
    .catch(err => {
      console.error(err);
    });

  });
}

module.exports.updateToken = function(newToken, user, callback){
  var tokenArray = [newToken]
  console.log("Updating:")
  console.log(tokenArray)
  console.log("User:" + user)

  var passUser = user

  if (typeof passUser == "object"){
    passUser = user.username
  }

  console.log(typeof passUser)

  User.findOneAndUpdate({
    username: passUser
  }, {
    registrationTokens: tokenArray
  },{
    new: true,
    runValidators: true
  })
  .then(doc => {
    console.log("user.js: Token refreshed!");
    console.log("user.js: " + doc);
    callback(null, doc);
  })
  .catch(err => {
    console.error(err);
    callback(err, null);
  });
}

module.exports.updateUserObject = function(username, callback){
  const query = {username: username}
  User.findOne(query, (err, userObject) => {
    User.findOneAndUpdate({
      username: username
    }, {
      requestedFriends: [],
      customization: {
        poolSubs: []
      }
    },{
      new: true,
      runValidators: true
    })
    .then(doc => {
      console.log("Object updated.")
      callback(null, callback);
    })
    .catch(err => {
      console.error(err);
      callback(err, null);
    });

  });
}

module.exports.addUser = function(newUser, callback){
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if(err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.addPhoneNumber = function(number, username, callback){
  const query = {username: username}
  User.findOne(query, (err, userObject) => {
    User.findOneAndUpdate({
      username: username
    }, {
      phoneNumber: number
    },{
      new: false,
      runValidators: true
    })
    .then(doc => {
      console.log("Phone number added.")
      console.log(userObject.username)
      callback(null, callback);
    })
    .catch(err => {
      console.error(err);
      callback(err, null);
    });

  });
}

module.exports.addPoolSub = function(username, poolId, callback){
  const query = {username: username}
  User.findOne(query, (err, userObject) =>{
    console.log("ADD POOL")
    console.log(userObject)
    console.log(userObject.hasOwnProperty("poolSubs"));
    if (userObject.poolSubs){
      var poolSubscriptions = userObject.poolSubs
      console.log("poolSubscriptions")
      poolSubscriptions.push(poolId)
      console.log(poolSubscriptions)
      User.findOneAndUpdate({username: username},
        {poolSubs: poolSubscriptions},
        {new: true, runValidators: true})
        .then(doc => {
          console.log("Updated pool subscriptions");
          callback(null, callback)
        })
        .catch(err => {
          console.error(err);
          callback(err, null);
        })
    }else{
      User.findOneAndUpdate({username: username},
        {poolSubs: [poolId]},
        {new: true, runValidators: true})
        .then(doc => {
          console.log("Updated pool subscriptions");
          callback(null, callback)
        })
        .catch(err => {
          console.error(err);
          callback(err, null);
        })
    }
  })
}

module.exports.removePoolSub = function(username, poolId, callback){
  const query = {username: username}
  console.log(username)
  console.log(poolId)
  User.findOne(query, (err, userObject) =>{
    var poolSubscriptions = userObject.poolSubs
    var index = poolSubscriptions.indexOf(poolId);
    if (index > -1) {
      poolSubscriptions.splice(index, 1);
    }
    User.findOneAndUpdate({username: username},
      {poolSubs: poolSubscriptions},
      {new: false, runValidators: true})
      .then(doc => {
        console.log("Updated pool subscriptions");
        callback(null, callback)
      })
      .catch(err => {
        console.error(err);
        callback(err, null);
      })
  })
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}

module.exports.addFriendRequest = function(sender, friend, callback){
  const query = {username: friend}

  // Find friend that you requested
  User.findOne(query, (err, userObject) => {
    var oldRequests = userObject.requestedFriends
    if (oldRequests.indexOf(sender) > -1){
      print("Already requested!")
    }else{
      if (userObject.friends.indexOf(sender) > -1){
        print("Already friends, can't request!")
      }else{
        oldRequests.push(sender)
      }
    }
    User.findOneAndUpdate({
      username: userObject.username
    }, {
      requestedFriends: oldRequests
    },{
      new: true,
      runValidators: true
    })
    .then(doc => {
      print("Requested list refreshed!")
      print(doc)
      callback(null, callback);
    })
    .catch(err => {
      print(err);
      callback(err, null);
    });

  });
}

module.exports.deleteFriendRequest = function(user, sender, callback){
  const query = {username: user}

  // Find friend that you requested
  User.findOne(query, (err, userObject) => {

    var oldRequests = userObject.requestedFriends

    if (oldRequests.indexOf(sender) <= -1){
      print("Friend doesn't exist")
    }

    var index = oldRequests.indexOf(sender);
    if (index > -1) {
      oldRequests.splice(index, 1);
    }

    User.findOneAndUpdate({
      username: userObject.username
    }, {
      requestedFriends: oldRequests
    },{
      new: true,
      runValidators: true
    })
    .then(doc => {
      console.log("Requested list refreshed!")
      console.log(doc)
      callback(null, callback);
    })
    .catch(err => {
      console.error(err);
      callback(err, null);
    });

  });
}

module.exports.addFriend = function(user, friend, callback){
  if (user.username === friend.username){
    console.log("You can't be your own friend, no matter how lonely you are.")
    return false
  }
  let newFriendArray = user.friends;

  if (newFriendArray.indexOf(friend.username) >= 0) {
    console.log("Already friend with this person!");
  }else{
    newFriendArray.push(friend.username);

    requestsArray = user.requestedFriends;
    var index = requestsArray.indexOf(friend.username);
    if (index > -1) {
      requestsArray.splice(index, 1);
    }

    User.findOneAndUpdate({
      username: user.username
    }, {"$set":{
      friends: newFriendArray,
      requestedFriends: requestsArray
    }},{
      new: true,
      runValidators: true
    })
    .then(doc => {
      console.log("Friend:")
      console.log(doc);
    })
    .catch(err => {
      console.error(err);
    });
  }

  newFriendArray = friend.friends;
  if (newFriendArray.indexOf(user.username) >= 0) {
    console.log("Friend has already added you!");
  }else{
    newFriendArray.push(user.username);

    User.findOneAndUpdate({
      username: friend.username
    }, {
      friends: newFriendArray
    },{
      new: true,
      runValidators: true
    })
    .then(doc => {
      console.log("User:")
      console.log(doc);
    })
    .catch(err => {
      console.error(err);
    });
  }
  console.log("Finished adding friends.");
  return callback(null, true);

}

module.exports.removeFriend = function(user, friend, callback){
  if (user.username === friend.username){
    console.log("How are you even on your own friend's list???")
    return false
  }
  let newFriendArray = user.friends;
  var index = newFriendArray.indexOf(friend.username);
  if (index > -1) {
    newFriendArray.splice(index, 1);
    User.findOneAndUpdate({
      username: user.username
    }, {
      friends: newFriendArray
    },{
      new: true,
      runValidators: true
    })
    .then(doc => {
      console.log(doc);
    })
    .catch(err => {
      console.error(err);
    });
  }

  newFriendArray = friend.friends;
  index = newFriendArray.indexOf(user.username);
  if (index > -1) {
    newFriendArray.splice(index, 1);
    User.findOneAndUpdate({
      username: friend.username
    }, {
      friends: newFriendArray
    },{
      new: true,
      runValidators: true
    })
    .then(doc => {
      console.log(doc);
    })
    .catch(err => {
      console.error(err);
    });
  }

  return callback(null, true);
}
