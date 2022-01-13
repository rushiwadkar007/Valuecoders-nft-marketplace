const mongoose = require("mongoose");


const { ObjectId } = mongoose.Schema; // for category

const nftSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },

  url: {
    type: ObjectId,
    ref: "TokenImage",
    required: true,
    // max: 255,
    // min: 6,
  },

  tokenId: {
    type: Number,
    required: true,
    // max: 1024,
    // min: 6,
  },

  value: {
    type: Number,
    required: true,
    // max: 1024,
    // min: 6,
  },

  title: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Nft", nftSchema);
