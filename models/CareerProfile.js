const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  interests: {
    type: String,
    required: true,
  },
  skills: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
    required: true,
  },
  result: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CareerProfile', profileSchema);
