const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // Corrected 'require' to 'required'
  },
  email: {
    type: String,
    required: true,  // Corrected 'require' to 'required'
  },
  phone: {
    type: String,
    required: true,  // Corrected 'require' to 'required'
  },
  image: {
    type: String,
    required: false,  // Corrected 'require' to 'required'
  },
  created: {
    type: Date,
    required: true,  // Corrected 'require' to 'required'
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);  // Conventionally, model names are capitalized
