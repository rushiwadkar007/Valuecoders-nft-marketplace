const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema; // for category

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
  },
});

module.exports = mongoose.model("TokenImage", imageSchema);
