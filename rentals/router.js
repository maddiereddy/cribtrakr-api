'use strict';

const { Rental } = require('./models');
const { Expense } = require('../expenses/models');
const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', {session: false});
const router = express.Router();
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
  let {user, street, city, state, zip} = req.body;
  let mortgage = 0, 
      pmi = 0, 
      propertyTax = 0, 
      insurance = 0, 
      hoa = 0, 
      managementFees = 0, 
      misc = 0;

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
    return {user, street, city, state, zip, mortgage, pmi, insurance, propertyTax, hoa, managementFees, misc};
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