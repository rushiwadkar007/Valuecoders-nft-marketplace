import React, { useEffect, useState } from "react";
// import crypto from "../crypto.jpg";
import crypto from "../etherLogo.png";
// import crypto from "../crypto2.jpg";
import "./Details.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Card, Spinner } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import nftImg from "../../src/images/nft1.jpg";

import { useSelector } from "react-redux";

//used bootstrap icon below

toast.configure();

const Details = (props) => {
  const userDetails = useSelector((state) => state.user.userDetails);

  return (
    <div>
      {console.log("details", userDetails)}

      <div className="row">
        <div className="col-lg-2  md-2"></div>
        <div className="col-lg-8  md-8">
          <div className="main-box">
            <div className="img-div">
              <img className="crypto-img" src={nftImg} width="50%" />
            </div>

            <div className="row ">
              <div className="col-lg-1"></div>
              <div className="col-lg-4">
                <Card
                  // bg="secondary"
                  className="cards"
                  text="white"
                  style={{ width: "26rem", height: "190px" }}
                >
                  <Card.Body>
                    <Card.Title>User Details</Card.Title>
                    <Card.Text>{`Name : ${userDetails?.name}`}</Card.Text>
                    <Card.Text>{`Email ID :${userDetails?.email}`}</Card.Text>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-lg-1"></div>

              <div className="col-lg-5">
                <Card
                  // bg="secondary"
                  className="cards"
                  text="white"
                  style={{ width: "27rem", height: "190px" }}
                >
                  <Card.Body>
                    <Card.Title>Wallet Details</Card.Title>
                    <Card.Text>
                      {`Address :  ${userDetails?.Address} `}
                      <CopyToClipboard text={userDetails.Address}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-files"
                          viewBox="0 0 16 16"
                          style={{ cursor: "pointer" }}
                          onClick={() => toast.info("Address Copied")}
                        >
                          <path d="M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z" />
                        </svg>
                      </CopyToClipboard>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
              {/* <div className="col-lg-1"></div> */}
            </div>
          </div>
        </div>
        <div className="col-lg-2  md-2"></div>
      </div>
    </div>
  );
};

export default Details;

/*
import React from "react";

const Details = () => {
  return (
    <div>
      <h1 style={{ color: "white" }}>Show User Details Here</h1>
    </div>
  );
};

export default Details;
*/
