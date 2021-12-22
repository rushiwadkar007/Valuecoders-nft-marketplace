const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

//for ethereu wallet
const Web3 = require("web3");
//infura link , logged in using gmail main acc
const web3 = new Web3(
  "https://rinkeby.infura.io/v3/0480f6f61a2c48d18ca1365c7de71013"
);

const { EthHdWallet } = require("eth-hd-wallet");
var hdkey = require("ethereumjs-wallet/hdkey");
var bip39 = require("bip39");

const ETx = require("ethereumjs-tx");
const Transaction = require("ethereumjs-tx");

dotenv.config();
sgMail.setApiKey(`SG.${process.env.APIKEY}`);

router.post("/register", async (req, res) => {
  console.log("register called", req.body);

  //checking if user already exists or not
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email Already Exists");

  //hashing the password
  //10 is the complixity of the generated string
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  //creating new ethereum acc for the signedup user
  const mnemonic = bip39.generateMnemonic(); //generates string , if we enter same string here all details will be same eg private key etc
  // console.log(`mnemonic: ${mnemonic}`);

  const wallet = EthHdWallet.fromMnemonic(mnemonic);
  let address = wallet.generateAddresses(1);
  // console.log(`EthHdWallet Address: ${address}`);

  bip39.mnemonicToSeed(mnemonic).then(async (seed) => {
    // console.log(seed);
    var path = `m/44'/60'/0'/0/0`;
    var hdwallet = hdkey.fromMasterSeed(seed);
    var wallet = hdwallet.derivePath(path).getWallet();
    var address2 = "0x" + wallet.getAddress().toString("hex");
    var privateKey = wallet.getPrivateKey().toString("hex");
    //   console.log(`ethereumjs-wallet address: ${address2}`);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      privateKey: privateKey,
      Address: address2,
      Mnemonic: mnemonic,
    });

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

    //sending email
    const msg = {
      to: `${req.body.email}`,
      from: "bhutani.sachin1019@gmail.com",
      subject: "Welcome to our platform",
      html: ` <h1>Thank you for signing up to our platform , here are your wallet details </h1>
        <span> 
         <b> Private Key :</b>  <p>${privateKey} </p> <br>
         <b> Address : </b> <p> ${address2} </p> <br>
         <b> Mnemonic: </b> <p> ${mnemonic} </p> <br>
         <a href='http://localhost:8080/api/user/confirm/${token}' >link</a> to verify your email.
        </span>  
        `,
    };

    sgMail.send(msg, function (err, info) {
      if (err) {
        console.log("Errorin sending Mail", err);
        res.status(400).send(err);
      } else {
        console.log("Mail sent");
        res
          .status(200)
          .send(
            "SignUp Successful , Please check your email for wallet details"
          );
      }
    });

    user.save();
  });
});

router.post("/login", async (req, res) => {
  //checking if user already exists or not
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email Doesn't Exists");

  if (!user.verified)
    return res.status(400).send("Please verify your Email address");

  //if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid Password");

  //res.send("Logged in Successfully");
  // console.log("User logged in backend", user);
  //Create and assign a token , we can add any details inside the token eg name
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

  //getting the balance
  // const balance = web3.utils.fromWei(
  //   await web3.eth.getBalance(user.Address),
  //   "ether"
  // );

  // console.log("User Balance", balance);

  let responseObject = {
    token: token,
    userDetails: user,
    // walletBalance: balance,
  };

  //adding token to the header
  // res.cookie("auth-token-poc", token);
  res.header("auth-token", token).send(responseObject);
});

router.get("/confirm/:token", async (req, res) => {
  const token = req.params.token;
  console.log(token);

  if (!token) return res.status(401).send("access denied");

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log(verified);
    User.findOneAndUpdate(
      { _id: verified._id },
      { $set: { verified: true } },
      { new: true }
    )
      .then((result) => res.send("Account Verified"))
      .catch((err) => res.status(400).send("cant update password"));

    // res.send(verified)
    // next()
  } catch (err) {
    res.status(400).send("invalid token");
  }
});

router.post("/forgotPassword", async (req, res) => {
  //add a check for the email , is email already registered or not
  const email = req.body.email;
  console.log(email);

  const token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 5 * 60,
      data: email,
    },
    process.env.TOKEN_SECRET
  );

  const msg = {
    to: `${email}`,
    from: "bhutani.sachin1019@gmail.com",
    subject: "Welcome to our platform",
    html: ` <h1>Password reset </h1>
      <span> 
       <a href='http://localhost:3000/resetPassword/${token}' >link</a> to reset your password.
      </span>  
      `,
  };

  sgMail.send(msg, function (err, info) {
    if (err) {
      console.log("Errorin sending Mail", err);
      res.status(400).send(err);
    } else {
      console.log("Mail sent");
      res.status(200).send("Please Check Your Email");
    }
  });
});

//updating old password
router.put("/resetPassword", async (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;

  console.log("Reset Password called");

  try {
    const email = jwt.verify(sentToken, process.env.TOKEN_SECRET);

    // console.log("Email", email);

    //hashing the password
    //10 is the complixity of the generated string
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    User.updateOne(
      { email: email.data },
      {
        $set: {
          password: hashPassword,
        },
      }
    )
      .then((result) => res.send(result))
      .catch((err) => res.status(400).send(err));
  } catch (err) {
    res.status(400).send(err);
  }
});

//updating user name
router.put("/updateDetails", async (req, res) => {
  const userName = req.body.userName;
  const email = req.body.email;

  console.log("Edit User Detailscalled", userName, email);

  try {
    User.updateOne(
      { email: email },
      {
        $set: {
          name: userName,
        },
      }
    )
      .then((result) => res.send(result))
      .catch((err) => res.status(400).send(err));
  } catch (err) {
    console.log("Error in finding user while editing details");
    res.status(400).send("No Such User");
  }
});

module.exports = router;
