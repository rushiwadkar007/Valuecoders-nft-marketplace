import axios from "axios";
import React, { useEffect, useState } from "react";

import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "./Details.css";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import forgot from "../images/forgott.jpg";

toast.configure();

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState();

  useEffect(() => {
    console.log("value of email is", email);
  }, [email]);

  const mailAPIcall = () => {
    if (!email || email.length < 5) {
      toast.error("Enter correct email address");
      return;
    }

    email &&
      axios
        .post("http://localhost:8080/api/user/forgotPassword", { email: email })
        .then((res) => {
          if (res.status == 200)
            toast.info("Mail Sent , Please Check your email");
        })
        .catch((err) => {
          console.log(err);
          toast.error(err);
        });
  };

  return (
    <div className="text-center">
      <h1 className="fgPass-h1"> Forgot Password </h1>
      <div className="row">
        <div className="col-md-6 img-div">
          <img src={forgot} style={{ width: "70%", borderRadius: "40px" }} />
        </div>

        <div className="col-md-5">
          <h1 className="reg-h1">
            Please Enter Your Registered Email id Below
          </h1>
          <div className="forgetpassdiv">
            <input
              className="input-pass"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your email here"
            />
            <Button
              variant="warning"
              style={{ marginLeft: "4px" }}
              onClick={mailAPIcall}
            >
              Send Mail
            </Button>
          </div>
        </div>

        <div className="col-md-1"></div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
