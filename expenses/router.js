'use strict';

const { Expense } = require('./models');
const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', {session: false});
const router = express.Router();
router.use(jwtAuth);

// GET endpoint for a user's rental property expenses
router.get('/:propId', (req, res) => {
  Expense
    .find({propId: req.params.propId}) 
    .then(expenses => {
      res.json(expenses.map(expense => expense.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error: GET' });
    });
});

// GET endpoint for a user's rental property particular expense
router.get('/:propId/:id', (req, res) => {
  Expense
    .findById(req.params.id)
    .then(expense => {
      if(expense.propId === req.params.propId) { 
        res.status(200).json(expense.serialize());
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

// add new expense to rental
router.post('/:propId', jsonParser, (req, res) => {
  const requiredFields = ['category', 'amount', 'vendor', 'description', 'date'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  let {category, amount, vendor, description, date} = req.body;
  let propId = req.params.propId;

  Expense
  .create( {propId, category, amount, vendor, description, date} )
  .then( created => {
    return res.status(201).json(created.serialize());
  })
  .catch(err => {
    res.status(err.code).json(err);
  });

});

// update expense for a particular id
router.put('/:propId/:id', jsonParser, (req, res) => {

  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['category', 'amount', 'vendor', 'description', 'date'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });
  Expense
    .findById(req.params.id)
    .then(expense => {
      if(expense.propId === req.params.propId) { 
        Expense
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

// delete item by id and propId
router.delete('/:propId/:id', jsonParser, (req, res) => {

  Expense
    .findById(req.params.id)
    .then(expense => {
      if(expense.propId === req.params.propId) { 
        Expense
        .findByIdAndRemove(req.params.id)
        .then(() => {
          res.status(204).json({ message: 'success' });
        })
      } else {
          const message = 'Unauthorized';
          console.error(message);
          return res.status(401).send(message);
        }
      })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error: DELETE' });
    });
});

// delete all expenses by propId
router.delete('/:propId', jsonParser, (req, res) => {
  Expense
    .remove({propId: req.params.propId})
    .then(() => {
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error: DELETE' });
    })
});

module.exports = {router};