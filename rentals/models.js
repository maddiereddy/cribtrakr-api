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
  imageURL: {type: Buffer},
  mortgage: {type: Currency},
  pmi: {type: Currency},
  insurance: {type: Currency},
  propertyTax: {type: Currency},
  hoa: {type: Currency},
  managementFees: {type: Currency},
  misc: {type: Currency}
});

rentalSchema.methods.serialize = function() {
  return {
    id: this._id,
    name: this.street,
    user: this.user,
    street: this.street,
    city: this.city,
    state: this.state,
    zip: this.zip,
    imageURL: this.imageURL,
    mortgage: this.mortage,
    pmi: this.pmi,
    insurance: this.insurance,
    propertyTax: this.propertyTax,
    hoa: this.hoa,
    managementFees: this.managementFees,
    misc: this.misc
  };
};

const Rental = mongoose.model('Rental', rentalSchema);

module.exports = {Rental};
