const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');

// API 0
const users = require('./routes/users');
const messages = require('./routes/messages');
const conversations = require('./routes/conversations');
const friends = require('./routes/friends');
const pools = require('./routes/pools');
const diagnostics = require('./routes/diagnostics');
const testing = require('./routetest/test2/testing')

//Nova V1
const usersV1 = require('./nova/v1/routes/users');
const conversationsV1 = require('./nova/v1/routes/conversations');
const poolsV1 = require('./nova/v1/routes/pools');
const diagnosticsV1 = require('./nova/v1/routes/diagnostics');

//K & R routes
//I made these to make my job easier.
//Because the job is hard. Sooooo hard.

const krInventory = require('./krroutes/inventory')

const User = require('./models/user');
const http = require('http');
const admin = require('firebase-admin');
const serviceAccount = require('./retro-messenger-firebase-adminsdk-g1mk4-db8d51a0db.json');
const utility = require("./utils/Utility");
require('dotenv').config();

//Connect to database
mongoose.connect(config.database);

// On connection
mongoose.connection.on('connected', () => {
  console.log("Connected to database "+ config.database);
});

mongoose.connection.on('error', (err) => {
  console.log("Database error: "+ err);
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://retro-messenger.firebaseio.com"
});

const app = express();
const server = http.Server(app);
const socketIO = require('socket.io');
app.set('secretToken', config.secret);

const io = socketIO(server);

const port = 3000;

//CORS middleware
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

//body parser Middleware
app.use(bodyParser.json());

//passport
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.set('json spaces', 2);

app.use('/users', users);
app.use('/messages', messages);
app.use('/friends', friends);
app.use('/conversations', conversations);
app.use('/pools', pools);
app.use('/diagnostics', diagnostics);

// Nova
var novaV1Url = '/nova/v1'

app.use(novaV1Url + '/users', usersV1);
//app.use(novaV1Url + '/messages', messagesV1);
app.use(novaV1Url + '/conversations', conversationsV1);
app.use(novaV1Url + '/pools', poolsV1);
app.use(novaV1Url + '/diagnostics', diagnosticsV1);

app.use('/kr/inv', krInventory);


// indexing route
app.get('/', (req, res) => {
  res.send("Invalid Endpoint");
});

app.get('*', (req, res) =>{
  res.sendFile(path.join(__dirname, 'public/index.html'))
});

server.listen(port, () => {
  console.log('Started on port: 3000');
});

io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('create', function (room) {
    socket.join(room);
  });
  socket.on('disconnect', function() {
    console.log('Client disconnected.');
  });

  socket.on('add-message', (message) => {
    var skipNotif = false
    var isPool = false

    var msgObject = JSON.parse(message)
    console.log(msgObject);
    console.log()
    /*
    var socketList = utility.parseConvID(msgObject.convId);
    socketList.forEach(function(room){
      io.sockets.in(room).emit("message", message);
    });*/

    io.emit('message', message);
    if(msgObject.hasOwnProperty('groupChat')){
      console.log("Group Chat!")
      skipNotif = true
    }

    if(msgObject.hasOwnProperty('isPool')){
      isPool = true
    }

    if(msgObject.hasOwnProperty('isGroupChat')){
      skipNotif = msgObject.isGroupChat;
      console.log(msgObject);
      //console.log(utility.parseConvID(msgObject.convId));
    }
    var sendTopic = ""
    if (msgObject.hasOwnProperty("topic")){
      sendTopic = msgObject.topic
    }else{
      if (isPool == true){
        sendTopic = "POOL"
        console.log("TESTING POOL")
        console.log(msgObject.id)
      }else{
        sendTopic = utility.returnOneFriendFromConvId(msgObject.convId, msgObject.sender)
      }
    }

    console.log("SOCKET");
    console.log(msgObject);
    // This registration token comes from the client FCM SDKs.
    var sendMsg = {
      data: {
        id: msgObject.id,
        purpose: "Messaging",
        sound: 'default'
      },
      notification: {
        title: msgObject.sender,
        body : msgObject.body
      },
      apns: {
        headers: {
            'apns-priority': '10',
        },
        payload: {
            aps: {
              notification: {
                sound: 'RetroTone.caf'
              },
              sound: 'RetroTone.caf',
              badge: 1
            }
        },
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
        }
      },
        topic: sendTopic
      };

    // Send a message to the device corresponding to the provided
    // registration token.
    if (!skipNotif){
      admin.messaging().send(sendMsg)
        .then((response) => {
          // Response is a message ID string.
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });
      }else{
        console.log("LOG")
        var topicString = msgObject.id;
        var newTopicString = topicString.replace(/:/g, '~');
        var sendMsg = {
          data: {
            id: msgObject.id,
            purpose: "Messaging",
            sound: 'default'
          },
          notification: {
            title: msgObject.sender,
            body : msgObject.body
          },
          apns: {
            headers: {
                'apns-priority': '10',
            },
            payload: {
                aps: {
                  notification: {
                    sound: 'RetroTone.caf'
                  },
                  sound: 'RetroTone.caf',
                  badge: 1
                }
            },
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
            }
          },
            topic: newTopicString
          };

        var tokensArray = []

        if (isPool){
          sendMsg.topic = msgObject.id
          admin.messaging().send(sendMsg)
            .then((response) => {
              // Response is a message ID string.
              console.log('Successfully sent message:', response);
            })
            .catch((error) => {
              console.log('Error sending message:', error);
            });
        }else{
          User.find({'username': { $in: utility.parseConvID(msgObject.convId)}},
            function(err, docs){
               docs.forEach(function(doc){
                 if (doc.registrationTokens[0]){
                   console.log(doc.username);
                   tokensArray.push(doc.registrationTokens[0]);
                 }
               });
               admin.messaging().subscribeToTopic(tokensArray, newTopicString)
                 .then((response) => {
                   admin.messaging().send(sendMsg)
                     .then((response) => {
                       // Response is a message ID string.
                       console.log('Firebase: Successfully sent message:', response);
                     })
                     .catch((error) => {
                       console.log('Firebase: Error sending message:', error);
                     });
                   console.log('Firebase: Could not subscribe:', response.errors[0].error);
                   console.log(tokensArray)
                 })
                 .catch((error) => {
                   console.log('Firebase: Error subscribing:', error);
                 });
          });
        }
      }



    });

  socket.on('add-to-groupchat', (friend) =>{
    console.log("Adding friend to groupchat")
    io.emit('groupchat-added', friend)
  });

  socket.on('set-version', (version) =>{
    var versObj = JSON.parse(version);
    process.env['IOS_BETA_VERSION'] = versObj.version;
    process.env['IOS_BETA_BUILD'] = versObj.build;
  })

  socket.on('currently-typing', (friend) =>{
    //console.log(friend);
    var friendObj = JSON.parse(friend);
    io.emit('typing', friend);
  });

  socket.on('done-typing', (friend) =>{
    io.emit('nottyping', friend)
  });


  socket.on('add-friend', (request) =>{
    console.log("Adding friend via socket.")
    console.log(request)
    //io.emit('friend', friend)
    var requestObj = JSON.parse(request);
    console.log("TEST AB")
    console.log(requestObj)
    console.log(requestObj.friend)
    io.emit('_add-friend', request);

    var sendMsg = {
      data: {
        sound: 'default',
        purpose: "Friend Request",
        id: requestObj.friend
      },
      notification: {
        title: "Friend Request",
        body : requestObj.sender + " has sent you a friend request!"
      },
      apns: {
        headers: {
            'apns-priority': '10',
        },
        payload: {
            aps: {
              notification: {
                sound: 'RetroTone.caf'
              },
              sound: 'RetroTone.caf',
              badge: 1
            }
        },
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
        }
      },
        topic: requestObj.friend
      };

      admin.messaging().send(sendMsg)
        .then((response) => {
          // Response is a message ID string.
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });
  });

  socket.on('test-socket', (test) =>{
    console.log("Test Socket On");
    var testObj = JSON.parse(test)
    console.log(testObj)
    console.log(testObj.msg)
    io.emit('_test-socket', test)
  });

  socket.on('pool-created', (pool) => {
    var poolObj = JSON.parse(pool)
    console.log(poolObj)
    console.log(poolObj.msg)
    io.emit('_pool-created', pool)
  });

});

process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });
