import React, { useEffect, useState } from "react";
import { Button, Modal, Card, Spinner } from "react-bootstrap";
import FileBase from "react-file-base64";
import axios from "axios";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./Home.css";
import { useSelector } from "react-redux";

toast.configure();

const Home = () => {
  const [show, setShow] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [images, setImages] = useState([]);
  const [flag, setFlag] = useState(false);
  const [loading, setLoading] = useState(false);

  const userDetailsRedux = useSelector((state) => state.user.userDetails);

  // const [hasSameImage, setHasSameImage] = useState(false);

  //for transferring token
  const [addressTo, setAddressTo] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [tokenidToSend, setTokenIdToSend] = useState("");
  const handleCloseTransferModal = () => setShowTransferModal(false);
  const handleShowTransferModal = () => setShowTransferModal(true);

  //for but modal
  const [showBuy, setShowBuy] = useState(false);
  const handleCloseBuy = () => setShowBuy(false);
  const handleShowBuy = () => setShowBuy(true);

  const [details, setDetails] = useState({
    value: "",
    url: "",
    privateKey: "",
  });

  const handleClose = () => {
    setShow(false);
    clearState();
  };
  const handleShow = () => setShow(true);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/token/getAllTokens")
      .then((result) => {
        // console.log("All Tokens", result.data);
        setTokens(result.data);
      })
      .catch((err) => console.log("eroor in all tokens api", err));
  }, [flag]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/token/getAllImages")
      .then((result) => {
        // console.log("All Images", result.data);
        setImages(result.data);
      })
      .catch((err) => console.log("Error In All Images Api", err));
  }, [flag]);

  const clearState = () => {
    setDetails({
      value: "",
      url: "",
      privateKey: "",
    });

    setAddressTo("");
    setTokenIdToSend("");
  };

  //function to check if uploaded image is already present or not
  const checkImage = () => {
    let hasSameImage = false;

    images.length > 0 &&
      images.map((img) => {
        if (img.url == details.url) {
          // console.log("HAS SAME IMAGE");
          hasSameImage = true;
          return;
        }
      });

    return hasSameImage;
  };

  const handleSubmit = () => {
    const checkSameImg = checkImage();
    // console.log("Has Same image value", checkSameImg);

    const payload = {
      ...details,
      userAddress: userDetailsRedux.Address,
      userPrivateKey: userDetailsRedux.privateKey,
    };

    // console.log("Payload", payload);

    if (!checkSameImg) {
      setLoading(true);

      axios
        .post("http://localhost:8080/api/token/mintToken", payload)
        .then((res) => {
          // console.log("ress", res);
          toast.info("Token Minted Successfully");

          setLoading(false);
          // console.log("Submiting form with values", details);
          setFlag(!flag);
          clearState();
          setTimeout(() => {
            handleClose();
          }, 2000);
        })
        .catch((err) => {
          // console.log("err", err.response.data);
          setLoading(false);
          toast.error(err.response.data);
        });
    } else {
      toast.error(
        "This Image Already Exists Please Try Again With A New Image"
      );
    }
  };

  const transferToken = () => {
    setLoading(true);

    let payload = {
      addressFrom: userDetailsRedux.Address,
      userPrivateKey: userDetailsRedux.privateKey,
      addressTo,
      tokenID: tokenidToSend,
    };
    // console.log("Transfer Function called", payload);

    axios
      .post("http://localhost:8080/api/token/transferToken", payload)
      .then((res) => {
        // console.log("ress", res);
        toast.info("Token Transferred Successfully");
        setLoading(false);
        // console.log("Submiting form with values", details);
        setFlag(!flag);
        clearState();
        setTimeout(() => {
          handleCloseTransferModal();
        }, 2000);
      })
      .catch((err) => {
        // console.log("err", err.response.data);
        setLoading(false);
        toast.error(err.response.data);
      });
  };

  const buyToken = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 3000);

    // let payload = {
    //   addressFrom: userDetailsRedux.Address,
    //   userPrivateKey: userDetailsRedux.privateKey,
    //   addressTo,
    //   tokenID: tokenidToSend,
    //    };
    // console.log("Transfer Function called", payload);

    // axios
    //   .post("http://localhost:8080/api/token/transferToken", payload)
    //   .then((res) => {
    //     // console.log("ress", res);
    //     toast.info("Token Transferred Successfully");
    //     setLoading(false);
    //     // console.log("Submiting form with values", details);
    //     setFlag(!flag);
    //     clearState();
    //     setTimeout(() => {
    //       handleCloseTransferModal();
    //     }, 2000);
    //   })
    //   .catch((err) => {
    //     // console.log("err", err.response.data);
    //     setLoading(false);
    //     toast.error(err.response.data);
    //   });
  };

  return (
    <div>
      <div className="text-center">
        <Button
          variant="secondary"
          onClick={handleShow}
          style={{ marginTop: "15px" }}
        >
          Mint NFT
        </Button>
        {/* 
        <Button
          variant="secondary"
          onClick={checkImage}
          style={{ marginTop: "15px" }}
        >
          Check Image
        </Button> */}
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Please fill this form</Modal.Title>
        </Modal.Header>

        {loading ? (
          <div className="p-2 text-center">
            <Spinner variant="dark" animation="border" role="status"></Spinner>
            <h3 style={{ color: "black" }}>
              Please wait while token is being created...
            </h3>
          </div>
        ) : (
          <Modal.Body>
            <div style={{ background: "white" }}>
              <form className="form-tg">
                <div className="row row-div">
                  <div className="col-md-3">
                    <label className="labl"> Picture : </label>
                  </div>
                  <div className="col-md-9">
                    <FileBase
                      type="file"
                      multiple={false}
                      onDone={({ base64 }) =>
                        setDetails({ ...details, url: base64 })
                      }
                    />
                  </div>
                </div>

                <div className="row row-div">
                  <div className="col-md-3">
                    <label className="labl"> Value : </label>
                  </div>
                  <div className="col-md-9">
                    <input
                      type="text"
                      value={details.value}
                      onChange={(e) =>
                        setDetails({ ...details, value: e.target.value })
                      }
                    />
                  </div>
                </div>
                {/* 
              <div className="row row-div">
                <div className="col-md-3">
                  <label className="labl"> Private Key : </label>
                </div>
                <div className="col-md-9">
                  <input
                    type="text"
                    value={details.privateKey}
                    onChange={(e) =>
                      setDetails({ ...details, privateKey: e.target.value })
                    }
                  />
                </div>
              </div> */}
              </form>
            </div>{" "}
          </Modal.Body>
        )}

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <>
        <Modal
          show={showBuy}
          onHide={handleCloseBuy}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Buy NFT</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to buy the NFT and pay the ETH for it ?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseBuy}>
              No
            </Button>
            <Button variant="primary" onClick={buyToken}>
              Yes{" "}
            </Button>
          </Modal.Footer>
        </Modal>
      </>

      <div className="row ">
        {tokens.length > 0 ? (
          tokens.map((tokn, i) => (
            <div className="p-5 col-md-4" key={i}>
              <Card className="main-card" style={{ width: "24rem" }}>
                <Card.Body>
                  <Card.Img
                    variant="top"
                    src={tokn.url.url}
                    style={{
                      width: "350px",
                      height: "200px",
                      borderRadius: "30px",
                    }}
                  />
                  <Card.Title style={{ padding: "5px" }}>
                    {" "}
                    {`Token ID : ${tokn.tokenId}`}
                  </Card.Title>
                  <Card.Title
                    style={{ padding: "5px" }}
                  >{`Value : ${tokn.value}  ETH`}</Card.Title>
                  <Card.Title
                    style={{ padding: "5px" }}
                  >{`Owner : ${tokn.owner}`}</Card.Title>

                  <div className="row">
                    <div className="col">
                      <Button
                        variant="danger"
                        style={{ width: "100%" }}
                        onClick={handleShowBuy}
                      >
                        Buy
                      </Button>
                    </div>
                    <div className="col"> </div>

                    <div className="col">
                      <Button
                        variant="dark"
                        hidden={
                          tokn.owner.toLowerCase() ==
                          userDetailsRedux.Address.toLowerCase()
                            ? false
                            : true
                        }
                        style={{ width: "100%" }}
                        onClick={() => {
                          handleShowTransferModal();
                          setTokenIdToSend(tokn.tokenId);
                        }}
                      >
                        Transfer
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))
        ) : (
          <div className="text-center">
            <h2 style={{ color: "white" }}>No Tokens Created Yet ! </h2>
            <br />
          </div>
        )}
      </div>

      <Modal show={showTransferModal} onHide={handleCloseTransferModal}>
        <Modal.Header closeButton>
          <Modal.Title>Transfer Token</Modal.Title>
        </Modal.Header>

        {loading ? (
          <div className="p-2 text-center">
            <Spinner variant="dark" animation="border" role="status"></Spinner>
            <h3 style={{ color: "black" }}>Transferring Token...</h3>
          </div>
        ) : (
          <Modal.Body>
            <div className="col">
              <h5>Enter the Adress where you want to transfer this token : </h5>
            </div>

            <input
              type="text"
              style={{ width: "100%" }}
              value={addressTo}
              onChange={(e) => setAddressTo(e.target.value)}
            />
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTransferModal}>
            Close
          </Button>
          <Button variant="primary" onClick={transferToken}>
            Transfer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Home;
