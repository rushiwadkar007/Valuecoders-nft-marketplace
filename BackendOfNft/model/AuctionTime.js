const mongoose = require("mongoose");


const { ObjectId } = mongoose.Schema; // for category

const AuctionTimeSchema = new mongoose.Schema({
    bidder: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    // participatory: {
    //     type: String,
    //     required: true,
    //     min: 6,
    //     max: 255,
    // },

    // url: {
    //     type: ObjectId,
    //     ref: "TokenImage",
    //     required: true,
    //     // max: 255,
    //     // min: 6,
    // },

    tokenID: {
        type: Number,
        required: true,
        // max: 1024,
        // min: 6,
    },

    _biddingTime: {
        type: Number,
        required: true,
        // max: 1024,
        // min: 6,
    },
});

module.exports = mongoose.model("AuctionTime", AuctionTimeSchema);
