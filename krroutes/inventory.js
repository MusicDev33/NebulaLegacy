const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Part = require('../krmodels/part');
const Shelf = require('../krmodels/shelf');

router.get('/shelves', (req, res, next) => {
  Shelf.find().sort({name: 1}).exec(function(err, shelves){
    if (err) throw err;
    if (!shelves){
      res.json({success: false, msg: "Couldn't get any shelves"})
    }else{
      res.json({success: true, msg: "Shelves found.", shelves: shelves})
    }
  })
});

router.post('/shelves/add', (req, res, next) => {
  var shelf = new Shelf({
    name: req.body.name
  })

  Shelf.addShelf(shelf, (err, savedShelf) => {
    if (err) throw err;
    if (!savedShelf){
      res.json({success: false, msg: "Couldn't save shelf"})
    }else{
      res.json({success: true, msg: "Shelf saved."})
    }
  });
});

router.post('/parts/add', (req, res, next) => {
  var part = new Part({
    partNumber: req.body.partNumber,
    shelf: req.body.shelf,
    quantity: req.body.quantity
  });

  Part.addPart(part, (err, savedPart) => {
    if (err) throw err;
    if (!savedPart){
      res.json({success: false, msg: "Couldn't save part."})
    }else{
      res.json({success: true, msg: "Part saved."})
    }
  })
});

router.get('/parts', (req, res, next) => {
  Part.find().exec( (err, parts) => {
    if (err) throw err;
    if (!parts){
      res.json({success: false, msg: "Couldn't find any parts, sorry."})
    }else{
      res.json({success: true, parts: parts})
    }
  })
})

router.get('/parts/:partNumber', (req, res, next) => {
  Part.getByPartNumber(req.params.partNumber.replace("_", " "), (err, part) => {
    if (!part){
      res.json({success: false, msg: "Couldn't find part!"})
    }else{
      res.json({success: true, part: part})
    }
  })
})

router.get('/shelves/:shelf/parts', (req, res, next) => {
  Part.find({ shelf: {$regex : "^" + req.params.shelf}}).sort({shelf: 1, partNumber: 1}).exec( (err, parts) => {
    if (!parts){
      res.json({success: false, msg: "Couldn't find parts"})
    }else{
      res.json({success: true, parts: parts})
    }
  });
});

router.get('/shelves/:shelf', (req, res, next) => {
  Shelf.find({ name: {$regex : "^" + req.params.shelf}}).sort({name: 1}).exec( (err, shelves) => {
    if (!shelves){
      res.json({success: false, msg: "Couldn't find parts"})
    }else{
      res.json({success: true, shelves: shelves})
    }
  });
});

router.delete('/shelves/:shelf', (req, res, next) => {
  Shelf.find({name: req.params.shelf}).remove().exec( (err, deletedShelf) => {
    if (deletedShelf){
      Part.find({shelf: req.params.shelf}).remove().exec( (err, deletedParts) => {
        if (deletedParts){
          res.json({success: true, msg: "Shelf and all associated parts have been deleted."})
        }
      });
    }
  });
});

router.delete('/shelves/:shelf/parts', (req, res, next) => {
  Part.find({shelf: req.params.shelf}).remove().exec( (err, deletedParts) => {
    if (deletedParts){
      console.log(deletedParts)
      res.json({success: true, msg: "All parts have been deleted from shelf " + req.params.shelf})
    }
  });
});

router.delete('/shelves/:shelf/parts/:partNumber', (req, res, next) => {
  Part.find({partNumber: req.params.partNumber.replace(/_/g, ' '),
              shelf: req.params.shelf}).remove().exec( (err, deletedPart) => {
    if (deletedPart){
      var part = new Part({
        partNumber: req.params.partNumber.replace(/_/g, ' '),
        shelf: req.params.shelf,
        quantity: 1
      });
      res.json({success: true, msg: "Part deleted.", part: part});
    }
  });
})

module.exports = router;
