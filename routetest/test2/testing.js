const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../config/database');
const User = require('../../models/user');
const Message = require("../../models/message");
const Conversation = require("../../models/conversation");
const Utils = require("../../utils/Utility")
const Async = require('async');
var VerifyToken = require('../../routes/middleware/VerifyToken');
var VerifyHeaderToken = require('../../routes/middleware/VerifyHeaderToken')
