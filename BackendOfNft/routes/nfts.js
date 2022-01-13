const router = require("express").Router();

const Nft = require("../model/nfts");

const User = require("../model/User");

const TokenImageModel = require("../model/TokenImage");

const AuctionTime = require("../model/AuctionTime.js");

const BidNFT = require("../model/BidNFT.js");

const Web3 = require("web3");

const request = require('request');

var express = require('express');

var bodyParser = require('body-parser');

var app = express();

const nftContractABI = require("../contract_details/NFT.json");

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false })

const web3 = new Web3(

  new Web3.providers.HttpProvider(

    "https://rinkeby.infura.io/v3/0480f6f61a2c48d18ca1365c7de71013"

  )

);

const ETx = require("ethereumjs-tx");

const transaction = require("ethereumjs-tx");

const privateKey = Buffer.from(

  process.env.PRIVATE_KEY,

  "hex"

);

const owner = process.env.OWNER;

const contractAddress = nftContractABI.networks[3].address;

const contractABI = nftContractABI.abi;

const contract = new web3.eth.Contract(contractABI, contractAddress);

router.post("/mintToken", async (req, res) => {

  const { url, value, userAddress, userPrivateKey } = req.body;

  console.log("value of the NFT ", value);

  const ownerName = "Rushikesh";

  const userPrivKeyBuffered = Buffer.from(userPrivateKey, "hex");

  const tokenImageObj = new TokenImageModel({

    url: url,

  });

  const savedImage = await tokenImageObj.save();

  const idForImage = JSON.stringify(savedImage._id);

  let nonce = await web3.eth.getTransactionCount(userAddress);

  console.log("nonce", nonce);

  const NetworkId = await web3.eth.net.getId();

  const transferFunction = contract.methods.mintNFT(idForImage, value, ownerName).encodeABI();

  let balanceOfAccount = web3.eth.getBalance(userAddress)

    .then(console.log);

  const rawTx = {

    from: userAddress,

    to: contractAddress,

    contractAddress: contractAddress,

    data: transferFunction,

    nonce: "0x" + nonce.toString(16),

    value: 0x00000000000000,

    gas: web3.utils.toHex(1500000),

    gasPrice: web3.utils.toHex(30000000000),

    chainId: NetworkId,

  };

  console.log('rawTx', rawTx);

  let trans = new transaction(rawTx, {

    chain: "rinkeby",

    hardfork: "petersburg",

  });

  console.log('trans ', trans);

  trans.sign(userPrivKeyBuffered);

  console.log('sign trans is done........');

  web3.eth

    .sendSignedTransaction("0x" + trans.serialize().toString("hex"))

    .on("receipt", async (data) => {

      console.log("Reciept", data.contractAddress);


      var details = await contract.methods.getTokenDetails().call();

      const nft = new Nft({

        url: JSON.parse(details["3"]),

        owner: details["0"],

        tokenId: details["1"],

        value: details["2"],
      });

      nft
        .save()

        .then((result) => {

          res.send("Token Minted Successfully ");

        })

        .catch((err) => {

          res.status(400).send(err);
        });
    })
    .on("error", async (data) => {

      TokenImageModel.deleteOne({ _id: savedImage._id })

        .then((result) => console.log("Image Deleted ", result))

        .catch((err) => console.log("Error while deleting Image", err));

      console.log("errrrrr", data.message);

      res.status(400).send(data.message);
    });
});

// PURCHASE TOKENS - USE OF BUY TOKEN IS PREFERRED.
router.post("/purchaseToken", urlencodedParser, async (req, res) => {

  console.log("Send Transfer called");

  const sellerAddress = req.body.sellerAddress;

  const buyerAddresss = req.body.buyerAddresss;

  const amount = req.body.amount;

  const tokenID = req.body.tokenID;

  console.log("Seller found is", sellerAddress);

  console.log("User found is", buyerAddresss);

  console.log(req.body.amount);

  const user = await User.findOne({ Address: buyerAddresss });

  if (!user) return res.status(400).send("Buyer Address Doesn't Exists");

  console.log("User found is", user);

  const privKey = user.privateKey;

  try {
    const createTransaction = await web3.eth.accounts.signTransaction(
      {
        from: buyerAddresss,

        to: sellerAddress,

        value: web3.utils.toWei(amount, "ether"),

        gas: "3000000",

      },

      privKey

    );

    const createReceipt = await web3.eth.sendSignedTransaction(

      createTransaction.rawTransaction

    );

    console.log(

      `Transaction successful with hash: ${createReceipt.transactionHash}`

    );


    if (createReceipt.transactionHash) {

      const userPrivKeyBuffered = Buffer.from(privKey, "hex");

      let nonce = await web3.eth.getTransactionCount(sellerAddress);

      const NetworkId = await web3.eth.net.getId();


      const transferFunction = contract.methods

        .transferFrom(buyerAddresss, sellerAddress, tokenID)

        .encodeABI();

      const rawTx = {

        from: sellerAddress,

        to: contractAddress,

        data: transferFunction,

        nonce: nonce,

        value: "0x00000000000000",

        gas: web3.utils.toHex(1500000),

        gasPrice: web3.utils.toHex(30000000000),

        chainId: NetworkId,

      };
      let trans = new transaction(rawTx, {

        chain: "rinkeby",

        hardfork: "petersburg",

      });

      trans.sign(userPrivKeyBuffered);


      web3.eth

        .sendSignedTransaction("0x" + trans.serialize().toString("hex"))

        .on("receipt", async (data) => {

          console.log("Reciept for transfer", data);

          Nft.updateOne(

            { tokenId: tokenID },

            {

              $set: {

                owner: addressTo,
              },

            }

          )
            .then((result) => res.send("Token Transferred Successfully"))

            .catch((err) => res.status(400).send(err));

        })

        .on("error", async (data) => {

          console.log("errrrrr in transfer", data.message);

          res.status(400).send(data.message);

        });

    }
  } catch (err) {

    res.status(400).send(err.message);
  }

});

// SET AUCTION TIME PERIOD
router.post("/setAuctionTime", urlencodedParser, async (req, res) => {

  console.log("Send setTimeAuction called");

  const { _biddingTime, tokenID, tokenOwner } = req.body;

  console.log("bidding time is", _biddingTime);

  console.log("token ID ", tokenID);

  console.log("TOken owner", tokenOwner);

  const auctionTime = new AuctionTime({ bidder: tokenOwner.toString(), tokenID: tokenID, _biddingTime: _biddingTime });

  const saveTimeAndTokenID = await auctionTime.save();

  const user = await User.findOne({ Address: tokenOwner });

  console.log('user details', user);

  if (!user) return res.status(400).send(user);

  const userPrivKeyBuffered = Buffer.from(user.privateKey, "hex");

  let nonce = await web3.eth.getTransactionCount(tokenOwner);

  const NetworkId = await web3.eth.net.getId();

  console.log("nonce", nonce);

  const transferFunction = contract.methods

    .setAuctionPeriod(_biddingTime, tokenID)
    .encodeABI()

  const rawTx = {

    from: tokenOwner,

    to: contractAddress,

    data: transferFunction,

    nonce: nonce,

    value: "0x00000000000000",

    gas: web3.utils.toHex(1500000),

    gasPrice: web3.utils.toHex(30000000000),

    chainId: NetworkId,

  };

  let trans = new transaction(rawTx, {

    chain: "rinkeby",

    hardfork: "petersburg",

  });

  trans.sign(userPrivKeyBuffered);

  web3.eth

    .sendSignedTransaction("0x" + trans.serialize().toString("hex")).on("receipt", async (data) => {

      console.log("Reciept", data);

    })

    .on("error", async (data) => {

      console.log("errrrrr", data.message);

      res.status(400).send(data.message);

    });

});

//GET AUCTION PERIOD BY TOKEN ID
router.get("/getAuctionPeriod", async (req, res) => {

  const tokenID = req.query.tokenID;

  let contract = new web3.eth.Contract(contractABI, contractAddress);

  var details = await contract.methods.getAuctionPeriod(tokenID).call();

  console.log("Auction Time Period", details);

  res.send(details);

});

// BUY TOKEN AFTER NFT MINTING
router.post("/buyToken", urlencodedParser, async (req, res) => {

  console.log("buy Token called");

  const { sellerAddress, buyerAddresss, price, tokenID } = req.body;

  console.log("buyerAddresss", buyerAddresss);

  const user = await User.findOne({ Address: buyerAddresss });

  console.log("User", user)

  if (!user) return res.status(400).send("Buyer Address Doesn't Exists");

  const userPrivKeyBuffered = Buffer.from(user.privateKey, "hex");

  let nonce = await web3.eth.getTransactionCount(buyerAddresss);

  const NetworkId = await web3.eth.net.getId();

  console.log("nonce", nonce);

  const transferFunction = contract.methods
    .transferPayment(buyerAddresss, sellerAddress)
    .encodeABI()

  const rawTx = {

    from: buyerAddresss,

    to: contractAddress,

    data: transferFunction,

    nonce: nonce,

    value: web3.utils.toWei(web3.utils.toBN(price), 'ether'),

    gas: web3.utils.toHex(1500000),

    gasPrice: web3.utils.toHex(30000000000),

    chainId: NetworkId,

  };

  let trans = new transaction(rawTx, {

    chain: "rinkeby",

    hardfork: "petersburg",

  });


  trans.sign(userPrivKeyBuffered);

  web3.eth

    .sendSignedTransaction("0x" + trans.serialize().toString("hex")).on("receipt", async (data) => {

      console.log("Reciept", data);

      res.status(200).send(data);

    })
    .on("error", async (data) => {

      console.log("errrrrr", data.message);

      res.status(400).send(data.message);

    });

  const seller = await User.findOne({ Address: sellerAddress });

  console.log("Seller", seller);

  if (!seller) return res.status(400).send("Buyer Address Doesn't Exists");

  const sellerPrivKeyBuffered = Buffer.from(seller.privateKey, "hex");

  let nonce1 = await web3.eth.getTransactionCount(sellerAddress);

  const NetworkId1 = await web3.eth.net.getId();

  console.log("nonce", nonce);

  const transferFunction1 = contract.methods
    .transferNFT(sellerAddress, buyerAddresss, tokenID)
    .encodeABI()

  const rawTrx = {

    from: sellerAddress,

    to: contractAddress,

    data: transferFunction1,

    nonce: nonce1,

    value: "0x00000000000000",

    gas: web3.utils.toHex(1500000),

    gasPrice: web3.utils.toHex(30000000000),

    chainId: NetworkId1,

  };

  let trans1 = new transaction(rawTrx, {

    chain: "rinkeby",

    hardfork: "petersburg",

  });


  trans1.sign(sellerPrivKeyBuffered);

  web3.eth

    .sendSignedTransaction("0x" + trans1.serialize().toString("hex")).on("receipt", async (data) => {

      console.log("Reciept", data);

      res.status(200).send(data);

    })
    .on("error", async (data) => {

      console.log("errrrrr", data.message);

      res.status(400).send(data.message);

    });

});

// BID PLACING API ENDPOINT.
router.post("/bid", urlencodedParser, async (req, res) => {

  console.log("Send setTimeAuction called");

  const { bidder, participatory, tokenID, bidAmount } = req.body;

  console.log("bidder is ", bidder);

  console.log("particpatory is ", participatory);

  console.log("token ID is ", tokenID);

  console.log(" Bidding Amount is ", bidAmount);

  const nft = await Nft.findOne({ tokenID: tokenID });

  if (!nft) return res.status(400).send(nft);

  console.log('user details', nft.url);

  const url = nft.url;

  let _biddingTime = await contract.methods.getAuctionPeriod(tokenID).call();

  const bidParticipators = new BidNFT({ bidder: bidder.toString(), participatory: participatory.toString(), url: url, tokenID: tokenID, _biddingTime: _biddingTime });

  const saveBidInfor = await bidParticipators.save();

  console.log("saveBidInfor ", saveBidInfor);

  const user = await User.findOne({ Address: participatory });

  if (!user) return res.status(400).send(user);

  console.log("User DETAILS", user);

  const userPrivKeyBuffered = Buffer.from(user.privateKey, "hex");

  let nonce = await web3.eth.getTransactionCount(participatory);

  const NetworkId = await web3.eth.net.getId();

  console.log("nonce", nonce);

  const transferFunction = contract.methods
    .conductBid(bidder, participatory, tokenID)
    .encodeABI()

  const rawTx = {

    from: participatory,

    to: contractAddress,

    data: transferFunction,

    nonce: nonce,

    value: web3.utils.toWei(web3.utils.toBN(bidAmount), 'ether'),

    gas: web3.utils.toHex(1500000),

    gasPrice: web3.utils.toHex(30000000000),

    chainId: NetworkId,

  };

  let trans = new transaction(rawTx, {

    chain: "rinkeby",

    hardfork: "petersburg",

  });

  trans.sign(userPrivKeyBuffered);

  web3.eth

    .sendSignedTransaction("0x" + trans.serialize().toString("hex")).on("receipt", async (data) => {

      console.log("Reciept", data);

    })

    .on("error", async (data) => {

      console.log("errrrrr", data.message);

      res.status(400).send(data.message);

    });

});

router.get("/getDetails", async (req, res) => {

  let contract = new web3.eth.Contract(contractABI, contractAddress);

  var details = await contract.methods.getTokenDetails().call();

  console.log("Details", details);

  res.send(details);

});

router.post("/getOwnerOf", async (req, res) => {

  const { tokenID } = req.body;

  console.log("Token ID in getOwnerOf", tokenID);

  let contract = new web3.eth.Contract(contractABI, contractAddress);

  var details = await contract.methods.ownerOf(tokenID).call();

  console.log("Details", details);

  res.send(details);

});

router.get("/totalSupply", async (req, res) => {

  let contract = new web3.eth.Contract(contractABI, contractAddress);

  var details = await contract.methods.totalSupply().call();

  console.log("Details", details);

  res.send(details);

});

router.get("/getAllTokens", async (req, res) => {

  Nft.find()

    .populate("url")

    .then((result) => res.send(result))

    .catch((err) => console.log(err));

});

router.get("/getAllImages", async (req, res) => {

  TokenImageModel.find()

    .then((result) => res.send(result))

    .catch((err) => console.log(err));

});

router.post("/transferToken", async (req, res) => {

  const { addressFrom, addressTo, tokenID, userPrivateKey } = req.body;

  const userPrivKeyBuffered = Buffer.from(userPrivateKey, "hex");

  let nonce = await web3.eth.getTransactionCount(addressFrom);

  const NetworkId = await web3.eth.net.getId();

  const transferFunction = contract.methods

    .transferFrom(addressFrom, addressTo, tokenID)
    .encodeABI();

  const rawTx = {

    from: addressFrom,

    to: contractAddress,

    data: transferFunction,

    nonce: nonce,

    value: "0x00000000000000",

    gasLimit: web3.utils.toHex(300000),

    gasPrice: web3.utils.toHex(100000000000),

    chainId: NetworkId,

  };

  let trans = new transaction(rawTx, {

    chain: "rinkeby",

    hardfork: "petersburg",

  });

  trans.sign(userPrivKeyBuffered);

  web3.eth

    .sendSignedTransaction("0x" + trans.serialize().toString("hex"))

    .on("receipt", async (data) => {

      console.log("Reciept for transfer", data);

      Nft.updateOne(

        { tokenId: tokenID },

        {

          $set: {

            owner: addressTo,

          },

        }

      )

        .then((result) => res.send("Token Transferred Successfully"))

        .catch((err) => res.status(400).send(err));

    })

    .on("error", async (data) => {

      console.log("errrrrr in transfer", data.message);

      res.status(400).send(data.message);

    });

});

router.post("/mintTokens", async (req, res) => {

  const { url, value, userAddress, userPrivateKey } = req.body;

  const userPrivKeyBuffered = Buffer.from(userPrivateKey, "hex");

  const tokenImageObj = new TokenImageModel({

    url: url,

  });

  const savedImage = await tokenImageObj.save();

  const idForImage = JSON.stringify(savedImage._id);

  let Nonce = await web3.eth.getTransactionCount(userAddress);

  console.log("Nonce: " + Nonce);

  let Data = contract.methods.mint(idForImage, value).encodeABI();

  console.log("Data", Data);

  const NetworkID = await web3.eth.net.getId();

  const rawTx = {

    nonce: Nonce,

    gasPrice: web3.utils.toHex(2000000),

    gasLimit: web3.utils.toHex(210000),

    from: userAddress,

    to: contractAddress,

    data: Data,

    value: "0x0",

    chainID: NetworkID,

  };

  let Tx = new ETx(rawTx, { chain: "rinkeby", hardfork: "petersburg" });

  console.log("TX", Tx);

  Tx.sign(userPrivKeyBuffered);

  web3.eth

    .sendSignedTransaction("0x" + Tx.serialize().toString("hex"))

    .on("receipt", async (data) => {

      console.log("Reciept", data);

      var details = await contract.methods.getTokenDetails().call();

      const nft = new Nft({

        url: JSON.parse(details["3"]),

        owner: details["0"],

        tokenId: details["1"],

        value: details["2"],

      });

      nft

        .save()

        .then((result) => {

          res.send("Token Minted Successfully ");

        })

        .catch((err) => {


          res.status(400).send(err);

        });

    })
    .on("error", async (data) => {

      TokenImageModel.deleteOne({ _id: savedImage._id })

        .then((result) => console.log("Image Deleted ", result))

        .catch((err) => console.log("Error while deleting Image", err));

      console.log("errrrrr", data.message);

      res.status(400).send(data.message);

    });

});

module.exports = router;
