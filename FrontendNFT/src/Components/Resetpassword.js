import axios from "axios";
import React, { useState } from "react";
import { useHistory, useParams } from "react-router";

import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Details.css";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import resetPassImg from "../images/reset-password2.jpg";

toast.configure();

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState();
  let history = useHistory();

  const updatePassword = () => {
    if (!password || password.length < 6) {
      toast.error("Password should have atleast 6 digits");
      return;
    }

    token &&
      axios
        .put(`http://localhost:8080/api/user/resetPassword`, {
          token,
          password,
        })
        .then((res) => {
          console.log(res);
          toast.info(res.data);
          history.push("/login");
        })
        .catch((err) => {
          console.log(err.response.data.name);
          toast.error(err.response.data.name);
        });
  };

  return (
    <div className="text-center">
      <h1 className="fgPass-h1"> Reset Password </h1>
      <div className="row">
        <div className="col-md-6">
          <h1 className="reg-h1">Please Enter Your New Password Here .</h1>
          <div className="forgetpassdiv">
            <input
              type="text"
              className="input-pass"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new Password"
            />
            <Button
              variant="warning"
              style={{ marginLeft: "4px" }}
              onClick={updatePassword}
            >
              Done
            </Button>
          </div>
        </div>
        <div className="col-md-6 img-div-2">
          <img
            src={resetPassImg}
            style={{ width: "75%", borderRadius: "40px" }}
          />
        </div>
        {/* <div className="col-md-1"></div> */}
      </div>
    </div>
  );
};

export default ResetPassword;
