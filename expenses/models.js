'use strict';
const moment = require('moment');

const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;
mongoose.Promise = global.Promise;

const expenseSchema = mongoose.Schema({
  user: {type: String, required: true},
  propId: {type: String, required: true},
  propName: {type: String, required: true},
  category: {type: String, required: true},
  amount:   {type: Currency, required: true},
  vendor:   {type: String, required: true},
  description:  {type: String, required: true},
  date: {type: String, required: true},
  imageURL: {type: [Buffer]}
});

expenseSchema.methods.serialize = function() {
  return {
    id: this._id,
    user: this.user,
    propId: this.propId,
    propName: this.propName,
    category: this.category,
    amount: "$" + (this.amount/100).toFixed(2),
    vendor: this.vendor,
    description: this.description,
    date: moment(this.date).format("YYYY-MM-DD"),
    imageURL: this.imageURL
  };
};

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = {Expense};
