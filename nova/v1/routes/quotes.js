const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../../../config/database');
require('dotenv').config();

router.get('/quotes', (req, res, next) => {
  var quoteList = []
  quoteList.push("Rad.")
  quoteList.push("Don't forget to put ranch on your burrito.")
  quoteList.push("Go Team Valor!")
  quoteList.push("Have you brushed your teeth today?")
  quoteList.push("Do guys know where Sammy went?")
  quoteList.push("If I shower too long, my feet get tired.")
  quoteList.push("Annoying AF")
  quoteList.push("Copy the pasta, not the copy pasta.")
  quoteList.push("Make a donation to the Flying Spaghetti Monster today!")
  quoteList.push("HELP!")
  quoteList.push("I'm being held hostage!")
  quoteList.push("It's 3:12 AM...only an hour and 8 minutes to go!")
  quoteList.push("*intense floor mopping*")
  quoteList.push("Play a ii - V - I or don't play at all.")
  quoteList.push("There's something to be said about things that are to be said.")
  quoteList.push("Listen to more jazz.")
  quoteList.push("Mozart is overrated. Come at me bro.")
  quoteList.push("Don't dig straight down!")
  quoteList.push("Default Dance < Orange Justice")
  quoteList.push("Blasting off of Kerbin in 3...2...1...")
  quoteList.push("Does Mason know what the numbers mean yet?")
  quoteList.push("The lie is the cake.")
  quoteList.push("You were almost a Jill sandwich! (Voice Acting - 100)")
  quoteList.push("I am sworn to carry your burdens... - Lydia, 2011")
  quoteList.push("Hold guards, knees, and arrows...what was that from again?")
  quoteList.push("Am Pablo Escobork, fren.")
  quoteList.push("Did we ever find out what color the dress was?")
  quoteList.push("Geriatric Parkour!")
  quoteList.push("I'm pretty much a theoretical physicist now.")
  quoteList.push("*Bad Words*")
  quoteList.push("Still waiting on that 3rd Half Life game...")
  quoteList.push("Bitcoin's price changed by $100 in the time you took to read this.")
  quoteList.push("Stay at an appropriate amount of diggity when using Nebula. Thank you.")
  quoteList.push("We didn't want foldable phones and we got them, so now we want foldable phones.")
  quoteList.push("Why leave the house when you can just go back to bed?")
  quoteList.push(":)")
  quoteList.push("Let me guess, someone stole your sweetroll?")
  quoteList.push("Looks like the President got kidnapped by ninjas again...")
  quoteList.push("Remember: the safe word is 'banana'.")
  res.json({quotes: quoteList});
});

module.exports = router;
