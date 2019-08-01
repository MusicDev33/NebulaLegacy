const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport-jwt');
const mongoose = require('mongoose');
const config = require('./config/database')

mongoose.connect(config.database);

mongoose.connection.on('connected', () => {
  console.log("Database connected: " + config.database);
});

mongoose.connection.on('error', (err) => {
  console.log("Database error: " + err)
})

const app = express();
const port = 2999;

// Allows other domains to use this domain as an API
app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json())

// Routes
const users = require('./routes/users');


app.use('/users', users);

// create public folder with the index.html when finished
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.send(" No Endpoint.")
})

app.listen(port, () => {
  console.log("Inquantir Backend started!")
})
