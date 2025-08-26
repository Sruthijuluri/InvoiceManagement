const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  date: String,
  status: String,
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
