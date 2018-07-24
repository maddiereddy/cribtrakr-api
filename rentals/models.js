'use strict';

const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;
mongoose.Promise = global.Promise;

const rentalSchema = mongoose.Schema({
  user: {type: String, required: true},
  street: {type: String, required: true},
  city:   {type: String, required: true},
  state:  {type: String, required: true},
  zip: {type: String, required: true},
  status: {type: String, default: 'active'},
  imageURL: {type: Buffer},
  mortgage: {type: Currency, default: 0},
  pmi: {type: Currency, default: 0},
  insurance: {type: Currency, default: 0},
  propertyTax: {type: Currency, default: 0},
  hoa: {type: Currency, default: 0},
  managementFees: {type: Currency, default: 0},
  misc: {type: Currency, default: 0}
});

rentalSchema.methods.serialize = function() {
  return {
    id: this._id,
    user: this.user,
    name: this.street,
    user: this.user,
    street: this.street,
    city: this.city,
    state: this.state,
    zip: this.zip,
    status: this.status,
    imageURL: this.imageURL,
    mortgage:  "$" + (this.mortgage/100).toFixed(2),
    pmi:  "$" + (this.pmi/100).toFixed(2),
    insurance:  "$" + (this.insurance/100).toFixed(2),
    propertyTax:  "$" + (this.propertyTax/100).toFixed(2),
    hoa:  "$" + (this.hoa/100).toFixed(2),
    managementFees:  "$" + (this.managementFees/100).toFixed(2),
    misc:  "$" + (this.misc/100).toFixed(2)
  };
};

const Rental = mongoose.model('Rental', rentalSchema);

module.exports = {Rental};
