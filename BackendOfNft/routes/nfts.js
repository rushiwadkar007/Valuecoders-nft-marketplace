const router = require("express").Router();
const Nft = require("../model/nfts");
const User = require("../model/User");
const TokenImageModel = require("../model/TokenImage");
const BidNFT = require("../model/bidNFT.js");
const Web3 = require("web3");
var express = require('express')
var bodyParser = require('body-parser')
var app = express()
const nftContractABI = require("../contract_details/NFT.json");
//latest url new project
// const web3 = new Web3(
//   "https://rinkeby.infura.io/v3/b22f85c0dfe34bc88c60e3f132dbe4a4"
// );
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
// const contractAddress = "0xb3538BfD46C0E3837a1230a2833f79313e673B6b"; //without buy .

const contractAddress = nftContractABI.networks[3].address;

const contractABI = nftContractABI.abi;

const contract = new web3.eth.Contract(contractABI, contractAddress);

router.post("/mintToken", async (req, res) => {
  const { url, value, userAddress, userPrivateKey } = req.body;
  console.log("value of the NFT ", value);
  const ownerName = "Rushikesh";
  // console.log("Mint called", userAddress, userPrivateKey);

  const userPrivKeyBuffered = Buffer.from(userPrivateKey, "hex");

  //saving image and passing its _id as the url in contract
  const tokenImageObj = new TokenImageModel({
    url: url,
  });

  const savedImage = await tokenImageObj.save();
  // console.log("Saved Image ", savedImage);
  // console.log("IMAGEEEEEEEEEEEEEEEEEEEE", JSON.stringify(savedImage._id));

  const idForImage = JSON.stringify(savedImage._id);

  let nonce = await web3.eth.getTransactionCount(userAddress); //nonce is one time number , keep the owner same here
  console.log("nonce", nonce);
  const NetworkId = await web3.eth.net.getId();
  // console.log("network ID", NetworkId);

  const transferFunction = contract.methods.mint(idForImage, value, ownerName).encodeABI();
  let balanceOfAccount = web3.eth.getBalance(userAddress)
    .then(console.log);
  // console.log("fncn", transferFunction);
  const rawTx = {
    from: userAddress, // add user address here which comes from frontend and check msg.sender from contract , userAddress didnt work
    to: contractAddress,
    contractAddress: contractAddress,
    data: transferFunction,
    nonce: "0x" + nonce.toString(16),
    value: 0x00000000000000,
    gas: web3.utils.toHex(1500000),
    gasPrice: web3.utils.toHex(30000000000),
    chainId: NetworkId,
    // web3.utils.toWei(web3.utils.toBN(1), 'ether')
    // web3.utils.toWei('100', 'wei')
    // gasLimit: web3.utils.toHex(300000),
    // gasPrice: web3.utils.toHex(100000000000),
  };

  // gas: web3.utils.toHex('65000'),
  // gasPrice: web3.utils.toHex('20000000000'),
  console.log('rawTx', rawTx);
  // console.log(transferFunction);

  let trans = new transaction(rawTx, {
    chain: "rinkeby",
    hardfork: "petersburg",
  });

  console.log('trans ', trans);

  trans.sign(userPrivKeyBuffered);
  // console.log("trans************");
  console.log('sign trans is done........');
  web3.eth
    .sendSignedTransaction("0x" + trans.serialize().toString("hex"))
    .on("receipt", async (data) => {
      console.log("Reciept", data.contractAddress);

      //getting created token and storing in db after successfull transaction
      var details = await contract.methods.getTokenDetails().call();

      // console.log("address", details["0"]);
      // console.log("token id", details["1"]);
      // console.log("Value ", details["2"]);
      // console.log("Name", JSON.parse(details["3"])); //url

      const nft = new Nft({
        url: JSON.parse(details["3"]),
        owner: details["0"],
        tokenId: details["1"],
        value: details["2"],
      });

      nft
        .save()
        .then((result) => {
          // console.log(result);
          res.send("Token Minted Successfully ");
        })
        .catch((err) => {
          // console.log(err);
          res.status(400).send(err);
        });
    })
    .on("error", async (data) => {
      // res.send(data) ;
      //delete the uploaded image from db .

      TokenImageModel.deleteOne({ _id: savedImage._id })
        .then((result) => console.log("Image Deleted ", result))
        .catch((err) => console.log("Error while deleting Image", err));

      console.log("errrrrr", data.message);
      res.status(400).send(data.message);
    });
});

//process -> send ether and then call the transfer function
router.post("/purchaseToken", urlencodedParser, async (req, res) => {
  console.log("Send Transfer called");
  const sellerAddress = req.body.sellerAddress;
  const buyerAddresss = req.body.buyerAddresss;
  const amount = req.body.amount;
  const tokenID = req.body.tokenID;
  // const privKey = req.body.privateKey; //buyers key as he is the one sending ether.
  console.log("Seller found is", sellerAddress);
  console.log("User found is", buyerAddresss);
  console.log(req.body.amount);
  const user = await User.findOne({ Address: buyerAddresss });
  if (!user) return res.status(400).send("Buyer Address Doesn't Exists");

  console.log("User found is", user);

  // const userPrivKeyBuffered = Buffer.from(user.privateKey, "hex");
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
    // Deploy transaction
    const createReceipt = await web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction
    );

    console.log(
      `Transaction successful with hash: ${createReceipt.transactionHash}`
    );

    //if sending ether is successfull
    if (createReceipt.transactionHash) {
      const userPrivKeyBuffered = Buffer.from(privKey, "hex");

      let nonce = await web3.eth.getTransactionCount(sellerAddress); //nonce is one time number , keep the owner same here
      // console.log("nonce", nonce);
      const NetworkId = await web3.eth.net.getId();
      // console.log("network ID", NetworkId);

      const transferFunction = contract.methods
        .transferFrom(buyerAddresss, sellerAddress, tokenID)
        .encodeABI();

      const rawTx = {
        from: sellerAddress, // add user address here which comes from frontend and check msg.sender from contract , userAddress didnt work
        to: contractAddress,
        data: transferFunction,
        nonce: nonce,
        value: "0x00000000000000",
        gas: web3.utils.toHex(1500000),
        gasPrice: web3.utils.toHex(30000000000),
        chainId: NetworkId,
      };
      // console.log(transferFunction);
      // gasLimit: web3.utils.toHex(300000),
      // gasPrice: web3.utils.toHex(100000),

      let trans = new transaction(rawTx, {
        chain: "rinkeby",
        hardfork: "petersburg",
      });

      trans.sign(userPrivKeyBuffered);
      // console.log("trans************");

      web3.eth
        .sendSignedTransaction("0x" + trans.serialize().toString("hex"))
        .on("receipt", async (data) => {
          //update in DB
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
    // console.log("Error in Transfer", err.message);
    res.status(400).send(err.message);
  }
});

//process -> send ether and then call the transfer function
router.post("/setAuctionTime", urlencodedParser, async (req, res) => {
  console.log("Send setTimeAuction called");
  // const sellerAddress = req.body.sellerAddress;
  // const buyerAddresss = req.body.buyerAddresss;
  const _biddingTime = req.body._biddingTime;
  const tokenID = req.body.tokenID;
  const tokenOwner = req.body.tokenOwner;
  // const privKey = req.body.privateKey; //buyers key as he is the one sending ether.
  console.log("bidding time is", _biddingTime);
  console.log("token ID ", tokenID);
  console.log("TOken owner", tokenOwner);
  const bidNFT = new BidNFT({ _biddingTime: _biddingTime, tokenID: tokenID, bidder: tokenOwner });
  const saveTimeAndTokenID = await bidNFT.save();

  const user = await Nft.findOne({ owner: tokenOwner });
  console.log(user);
  if (!user) return res.status(400).send(user.owner);

  // const userPrivKeyBuffered = Buffer.from(user.privateKey, "hex");
  const userPrivKeyBuffered = Buffer.from(process.env.PRIVATE_KEY, "hex");
  // console.log(privKey);
  let nonce = await web3.eth.getTransactionCount(tokenOwner); //nonce is one time number , keep the owner same here
  const NetworkId = await web3.eth.net.getId();
  // console.log("network ID", NetworkId);
  console.log("nonce", nonce);
  const transferFunction = contract.methods
    .setAuctionPeriod(_biddingTime, tokenID)
    .encodeABI()
  // console.log("fncn", transferFunction);

  const rawTx = {
    from: tokenOwner, // add user address here which comes from frontend and check msg.sender from contract , userAddress didnt work
    to: contractAddress,
    data: transferFunction,
    nonce: nonce,
    value: "0x00000000000000",
    gas: web3.utils.toHex(1500000),
    gasPrice: web3.utils.toHex(30000000000),
    chainId: NetworkId,
    // from: web3.utils.toChecksumAddress(buyerAddresss),
    // to: contractAddress,
    // data: transferFunction,
    // nonce: nonce + 1,
    // // value: "0x00000000000000",
    // value: web3.utils.toWei(web3.utils.toBN(price), "ether"),
    // // gasLimit: web3.utils.toHex(100000),
    // // gasPrice: web3.utils.toHex(20000000000),
    // gas: web3.utils.toHex(1500000),
    // gasPrice: web3.utils.toHex(30000000000) * 1.40,
    // chainId: NetworkId,
  };

  // console.log(web3.eth.getBlock('latest').then((data) => { console.log(data) }));

  // console.log(rawTx);

  let trans = new transaction(rawTx, {
    chain: "rinkeby",
    hardfork: "petersburg",
  });
  // console.log(trans)

  trans.sign(userPrivKeyBuffered);


  web3.eth
    .sendSignedTransaction("0x" + trans.serialize().toString("hex")).on("receipt", async (data) => {
      // web3.eth.getPendingTransactions().then(console.log);
      console.log("Reciept", data);
    })
    .on("error", async (data) => {
      console.log("errrrrr", data.message);
      res.status(400).send(data.message);
    });

});

//getting an error -> Returned error: insufficient funds for gas * price + value
router.post("/buyToken", urlencodedParser, async (req, res) => {
  console.log("buy Token called");
  const { sellerAddress, buyerAddresss, price, tokenID } = req.body;
  console.log("sellerAddress", sellerAddress);
  const user = await User.findOne({ Address: sellerAddress });
  if (!user) return res.status(400).send("Seller Address Doesn't Exists");

  // console.log("User found is", user.privateKey);

  const userPrivKeyBuffered = Buffer.from(user.privateKey, "hex");

  let nonce = await web3.eth.getTransactionCount(sellerAddress); //nonce is one time number , keep the owner same here
  const NetworkId = await web3.eth.net.getId();
  // console.log("network ID", NetworkId);
  console.log("nonce", nonce);
  const transferFunction = contract.methods
    .buyToken(sellerAddress, buyerAddresss, tokenID)
    .encodeABI()
  // console.log("fncn", transferFunction);

  const rawTx = {
    from: sellerAddress, // add user address here which comes from frontend and check msg.sender from contract , userAddress didnt work
    to: contractAddress,
    data: transferFunction,
    nonce: nonce,
    value: "0x00000000000000",
    gas: web3.utils.toHex(1500000),
    gasPrice: web3.utils.toHex(30000000000),
    chainId: NetworkId,
    // from: web3.utils.toChecksumAddress(buyerAddresss),
    // to: contractAddress,
    // data: transferFunction,
    // nonce: nonce + 1,
    // // value: "0x00000000000000",
    // value: web3.utils.toWei(web3.utils.toBN(price), "ether"),
    // // gasLimit: web3.utils.toHex(100000),
    // // gasPrice: web3.utils.toHex(20000000000),
    // gas: web3.utils.toHex(1500000),
    // gasPrice: web3.utils.toHex(30000000000) * 1.40,
    // chainId: NetworkId,
  };

  // console.log(web3.eth.getBlock('latest').then((data) => { console.log(data.gasLimit, data.gasUsed) }));

  // console.log(rawTx);

  let trans = new transaction(rawTx, {
    chain: "rinkeby",
    hardfork: "petersburg",
  });
  // console.log(trans)

  trans.sign(userPrivKeyBuffered);


  web3.eth
    .sendSignedTransaction("0x" + trans.serialize().toString("hex")).on("receipt", async (data) => {
      web3.eth.getPendingTransactions().then(console.log);
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

  // console.log("Details are", addressFrom, addressTo, tokenID, userPrivateKey);
  // res.send("YO");

  const userPrivKeyBuffered = Buffer.from(userPrivateKey, "hex");

  let nonce = await web3.eth.getTransactionCount(addressFrom); //nonce is one time number , keep the owner same here
  // console.log("nonce", nonce);
  const NetworkId = await web3.eth.net.getId();
  // console.log("network ID", NetworkId);

  const transferFunction = contract.methods
    .transferFrom(addressFrom, addressTo, tokenID)
    .encodeABI();

  const rawTx = {
    from: addressFrom, // add user address here which comes from frontend and check msg.sender from contract , userAddress didnt work
    to: contractAddress,
    data: transferFunction,
    nonce: nonce,
    value: "0x00000000000000",
    gasLimit: web3.utils.toHex(300000),
    gasPrice: web3.utils.toHex(100000000000),
    chainId: NetworkId,
  };
  // console.log(transferFunction);

  let trans = new transaction(rawTx, {
    chain: "rinkeby",
    hardfork: "petersburg",
  });

  trans.sign(userPrivKeyBuffered);
  // console.log("trans************");

  web3.eth
    .sendSignedTransaction("0x" + trans.serialize().toString("hex"))
    .on("receipt", async (data) => {
      //update in DB
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

//sir's method
router.post("/mintTokens", async (req, res) => {
  const { url, value, userAddress, userPrivateKey } = req.body;

  // console.log("Mint called", userAddress, userPrivateKey);

  const userPrivKeyBuffered = Buffer.from(userPrivateKey, "hex");

  //saving image and passing its _id as the url in contract
  const tokenImageObj = new TokenImageModel({
    url: url,
  });

  const savedImage = await tokenImageObj.save();
  // console.log("Saved Image ", savedImage);
  // console.log("IMAGEEEEEEEEEEEEEEEEEEEE", JSON.stringify(savedImage._id));

  const idForImage = JSON.stringify(savedImage._id);

  // let nonce = await web3.eth.getTransactionCount(userAddress); //nonce is one time number , keep the owner same here
  // console.log("nonce", nonce);
  // const NetworkId = await web3.eth.net.getId();
  // console.log("network ID", NetworkId);

  // const transferFunction = contract.methods.mint(idForImage, value).encodeABI();
  // console.log("fncn", transferFunction);

  // const rawTx = {
  //   from: userAddress, // add user address here which comes from frontend and check msg.sender from contract , userAddress didnt work
  //   to: contractAddress,
  //   data: transferFunction,
  //   nonce: nonce,
  //   value: "0x00000000000000",
  //   gasLimit: web3.utils.toHex(300000),
  //   gasPrice: web3.utils.toHex(100000000000),
  //   // gasPrice: web3.utils.toHex(2000000),
  //   // gasLimit: web3.utils.toHex(210000),
  //   chainId: NetworkId,
  // };
  // console.log(transferFunction);

  // let trans = new transaction(rawTx, {
  //   chain: "rinkeby",
  //   hardfork: "petersburg",
  // });

  // trans.sign(userPrivKeyBuffered);
  // console.log("trans************");

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

      //getting created token and storing in db after successfull transaction
      var details = await contract.methods.getTokenDetails().call();

      // console.log("address", details["0"]);
      // console.log("token id", details["1"]);
      // console.log("Value ", details["2"]);
      // console.log("Name", JSON.parse(details["3"])); //url

      const nft = new Nft({
        url: JSON.parse(details["3"]),
        owner: details["0"],
        tokenId: details["1"],
        value: details["2"],
      });

      nft
        .save()
        .then((result) => {
          // console.log(result);
          res.send("Token Minted Successfully ");
        })
        .catch((err) => {
          // console.log(err);
          res.status(400).send(err);
        });
    })
    .on("error", async (data) => {
      // res.send(data) ;
      //delete the uploaded image from db .

      TokenImageModel.deleteOne({ _id: savedImage._id })
        .then((result) => console.log("Image Deleted ", result))
        .catch((err) => console.log("Error while deleting Image", err));

      console.log("errrrrr", data.message);
      res.status(400).send(data.message);
    });
});

module.exports = router;
