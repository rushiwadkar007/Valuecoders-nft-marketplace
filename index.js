const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

app.use(express.json({ limit: "5mb", extended: true })); // so we dont get payload too large error while transferring file
app.use(cors());

const userRoute = require("./routes/user");
const nftRoute = require("./routes/nfts");

// const mongoURI = "mongodb://localhost:27017/BlockchainPOC";

//connnect to DB

mongoose
  .connect(process.env.mongoURILocal, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true, // not supported
  })
  .then((result) => {
    console.log("Connected to DB");
  })
  .catch((err) => console.log(err));

//middlewares
app.use(bodyParser.json());
app.use("/api/user", userRoute);
app.use("/api/token", nftRoute);

const PORT = process.env.PORT || 8080;

app.listen(8080, () => console.log(`Server running...  ${PORT}`));
// mongodb+srv://nilesh:nilneo1601@appdata.qehsi.mongodb.net/NFT?retryWrites=true&w=majority