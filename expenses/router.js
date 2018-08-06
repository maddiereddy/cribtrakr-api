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
router.get('/', (req, res) => {
  Expense
    .find({user: req.user.username})
    .then(expenses => {
      res.json(expenses.map(expense => expense.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error: GET' });
    });
});

// GET endpoint for a user's rental property expenses
router.get('/prop/:propId', (req, res) => {
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
router.get('/:id', (req, res) => {
  Expense
    .findById(req.params.id)
    .then(expense => {
        res.status(200).json(expense.serialize());
    })
    .catch(err => {
      res.status(500).json({ message: 'Internal server error: GET id' });
    })
});


// add new expense to rental
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['propName', 'category', 'amount', 'vendor', 'description', 'date'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  let {user,propId, propName, category, amount, vendor, description, date} = req.body;

  Expense
  .create( {user, propId, propName, category, amount, vendor, description, date} )
  .then( created => {
    return res.status(201).json(created.serialize());
  })
  .catch(err => {
    res.status(err.code).json(err);
  });

});

// update expense for a particular id
router.put('/:id', jsonParser, (req, res) => {

  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['propName', 'category', 'amount', 'vendor', 'description', 'date'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });
  Expense
    .findById(req.params.id)
    .then(expense => {
      Expense
        .findByIdAndUpdate(req.params.id, { $set: updated })
        .then(() => res.status(204).end())
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error: PUT/:id' });
    });
});

// delete item by id and propId
router.delete('/:id', jsonParser, (req, res) => {

  Expense
    .findById(req.params.id)
    .then(expense => {
      Expense
      .findByIdAndRemove(req.params.id)
      .then(() => {
        res.status(204).json({ message: 'success' });
      })
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error: DELETE' });
    });
});

// delete all expenses for a property
router.delete('/prop/:propId', jsonParser, (req, res) => {
  Expense
    .remove({propId: req.params.propId})
    .then(() => {
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error: DELETE ALL EXPENSES' });
    })
});

module.exports = {router};