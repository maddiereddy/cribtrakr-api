'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');
const fileType = require('file-type');
const bluebird = require('bluebird');
const multiparty = require('multiparty');

const { Rental } = require('./models');
const { Expense } = require('../expenses/models');
const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', {session: false});
const router = express.Router();


// configure the keys for accessing AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const bucket = process.env.AWS_S3_BUCKET;

// configure AWS to work with promises
AWS.config.setPromisesDependency(bluebird);

// create S3 instance
const s3 = new AWS.S3();

// abstracts function to upload a file returning a promise
const uploadFile = (buffer, name, type) => {
  const params = {
    ACL: 'public-read-write',
    Body: buffer,
    Bucket: bucket,
    Key: `${name}`
  };
  return s3.upload(params).promise();
};

// Define POST route
router.post('/upload', (request, response) => {
  const form = new multiparty.Form();
  form.parse(request, async (error, fields, files) => {
    if (error) throw new Error(error);
    try {
      const path = files.file[0].path;
      const buffer = fs.readFileSync(path);
      const type = fileType(buffer);
      const timestamp = Date.now().toString();
      const fileName = `rentalsBucket/${fields.name}`;
      const data = await uploadFile(buffer, fileName, type);
      console.log(data);
      return response.status(200).send(data.Location);
    } catch (error) {
      return response.status(400).send(error);
    }
  });
});

router.use(jwtAuth);
// GET endpoint for a user's rental properties
router.get('/', (req, res) => {
  Rental
    .find({user: req.user.username}) 
    .then(rentals => {
      console.log(rentals);
      res.json(rentals.map(rental => rental.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error: GET' });
    });
});

router.get('/:id', (req, res) => {
  Rental
    .findById(req.params.id)
    .then(rental => {
      if(rental.user === req.user.username) { 
        res.status(200).json(rental.serialize());
      } else {
        const message = 'Unauthorized';
        console.error(message);
        return res.status(401).send(message);
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Internal server error: GET id' });
    })
});

// add new item to list
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['street', 'city', 'state', 'zip'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  // check if new property already on the user's list; if not, the create entry
  let {user, street, city, state, zip, imageURL, mortgage, pmi, propertyTax, insurance, hoa, managementFees, misc} = req.body;

  return Rental.find({user, street, zip})
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'New property already created.',
        });
      }
    return {user, street, city, state, zip, imageURL, mortgage, pmi, insurance, propertyTax, hoa, managementFees, misc};
  }).then(newItem => {
    return Rental.create(newItem);
  }).then( created => {
    return res.status(201).json(created.serialize());
  })
  .catch(err => {
    res.status(err.code).json(err);
  });

});

// update rental details by id
router.put('/:id', jsonParser, (req, res) => {

  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['street', 'city', 'state', 'zip', 'mortgage', 'pmi', 'insurance', 'propertyTax', 'hoa', 'managementFees', 'misc'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });
  Rental
    .findById(req.params.id)
    .then(rental => {
      if(rental.user === req.user.username) { 
        Rental
          .findByIdAndUpdate(req.params.id, { $set: updated })
          .then(() => res.status(204).end())
      } else {
        const message = 'Unauthorized';
        console.error(message);
        return res.status(401).send(message);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error: PUT/:id' });
    });
});

// Do we actually need to remove a property? Maybe just retire it if you sell it,
// In that way you can keep the expenses on it
// delete item by id
router.delete('/:id', jsonParser, (req, res) => {
  Expense
    .remove({propId: req.params.id})
    .then(() => {
      Rental
        .findByIdAndRemove(req.params.id)
        .then(() => {
          res.status(204).json({ message: 'success' });
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Internal server error: DELETE rental property' });
        })
      })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error: DELETE all expense on rental property' });
    });
});

module.exports = {router};