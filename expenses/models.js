'use strict';

const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;
mongoose.Promise = global.Promise;

const expenseSchema = mongoose.Schema({
  propId: {type: String, required: true},
  category: {type: String, required: true},
  amount:   {type: Currency, required: true},
  vendor:   {type: String, required: true},
  description:  {type: String, required: true},
  date: {type: Date, required: true},
  imageURL: {type: [Buffer]}
});

expenseSchema.methods.serialize = function() {
  return {
    id: this._id,
    propId: this.propId,
    category: this.category,
    amount: "$" + (this.amount/100).toFixed(2),
    vendor: this.vendor,
    description: this.description,
    date: this.date,
    imageURL: this.imageURL
  };
};

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = {Expense};
