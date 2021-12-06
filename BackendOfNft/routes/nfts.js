const router = require("express").Router();
const Nft = require("../model/nfts");
const TokenImageModel = require("../model/TokenImage");
const Web3 = require("web3");

//latest url new project
// const web3 = new Web3(
//   "https://rinkeby.infura.io/v3/b22f85c0dfe34bc88c60e3f132dbe4a4"
// );

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://rinkeby.infura.io/v3/0480f6f61a2c48d18ca1365c7de71013"
  )
);

// const ETx = require("ethereumjs-tx");
const transaction = require("ethereumjs-tx");

const privateKey = Buffer.from(
  "13c9c83602dbf416fb8c2ceadb2420aaf4e0e42547ec093f0059429f95a2ac09",
  "hex"
);
const owner = "0x63d8132f7862BA47832DB44EeABaf206d1D6CDD5";
const contractAddress = "0xb3538BfD46C0E3837a1230a2833f79313e673B6b";

const contractABI = [
  {
    constant: true,
    inputs: [
      {
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_color",
        type: "string",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "to",
        type: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "from",
        type: "address",
      },
      {
        name: "to",
        type: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "owner",
        type: "address",
      },
      {
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "from",
        type: "address",
      },
      {
        name: "to",
        type: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenByIndex",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "to",
        type: "address",
      },
      {
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "from",
        type: "address",
      },
      {
        name: "to",
        type: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
      },
      {
        name: "_data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    name: "colors",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "owner",
        type: "address",
      },
      {
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getTokenDetails",
    outputs: [
      {
        name: "",
        type: "address",
      },
      {
        name: "",
        type: "uint256",
      },
      {
        name: "",
        type: "uint256",
      },
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "",
        type: "address",
      },
      {
        indexed: false,
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        name: "",
        type: "string",
      },
    ],
    name: "Details",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
];
const contract = new web3.eth.Contract(contractABI, contractAddress);

router.post("/mintToken", async (req, res) => {
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

  let nonce = await web3.eth.getTransactionCount(userAddress); //nonce is one time number , keep the owner same here
  console.log("nonce", nonce);
  const NetworkId = await web3.eth.net.getId();
  // console.log("network ID", NetworkId);

  const transferFunction = contract.methods.mint(idForImage, value).encodeABI();
  // console.log("fncn", transferFunction);

  const rawTx = {
    from: userAddress, // add user address here which comes from frontend and check msg.sender from contract , userAddress didnt work
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

router.get("/getDetails", async (req, res) => {
  let contract = new web3.eth.Contract(contractABI, contractAddress);
  var details = await contract.methods.getTokenDetails().call();
  console.log("Details", details);
  res.send(details);
});

router.post("/getOwnerOf", async (req, res) => {
  const { tokenID } = req.body;
  console.log("Token ID", tokenID);
  let contract = new web3.eth.Contract(contractABI, contractAddress);
  var details = await contract.methods.ownerOf(tokenID).call();
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

module.exports = router;
