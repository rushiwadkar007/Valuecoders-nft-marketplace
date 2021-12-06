import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import "./SignUp.css";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, Redirect } from "react-router-dom";
import cookie from "react-cookies";
import Details from "./Details";

import { addDetails } from "../redux/actions";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

toast.configure();

const Login = ({ flag, setFlag }) => {
  // const counter = useSelector((state) => state);
  const dispatch = useDispatch();

  const [details, setDetails] = useState({
    email: "",
    password: "",
  });

  const [loginSuccess, setLoginSuccess] = useState(false);
  // const [walletDetails, setWalletDetails] = useState();

  const handleSubmit = () => {
    // console.log("Submit button clicked", details);

    if ((details.email == "", details.password == "")) {
      toast.error("Please Enter some value");
    } else {
      const payload = {
        email: details.email,
        password: details.password,
      };

      axios
        .post("http://localhost:8080/api/user/login", payload)
        .then((res) => {
          //res.data has token
          // cookie.save("auth-token", res.data);
          // const tok = cookie.load("auth-token-poc");

          const tok = res.data.token;
          console.log("token", tok);

          localStorage.setItem("auth-token", tok);
          // setToken(tok);
          setFlag(true);
          // setWalletDetails(res.data.userDetails);
          dispatch(addDetails(res.data.userDetails));

          toast.info("Login Successful");

          setDetails({
            email: "",
            password: "",
          });

          document.getElementById("password").value = "";
          document.getElementById("email").value = "";
          setLoginSuccess(true);
        })
        .catch((err) => {
          console.log("Login error", err.response.data);
          toast.error(err.response.data);
        });
    }
  };

  return (
    <div>
      <h1 className="text-center  registr form-heading"> Login Here</h1>
      <div className="form-div">
        <div className="row">
          <div className="col-md-3 sm-1"></div>
          <div className="col-md-6 sm-1">
            <Form className="main-form">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  // className="input-box"
                  type="email"
                  id="email"
                  placeholder="Enter email"
                  onChange={(e) =>
                    setDetails({ ...details, email: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  // className="input-box"
                  type="password"
                  id="password"
                  placeholder="Password"
                  onChange={(e) =>
                    setDetails({ ...details, password: e.target.value })
                  }
                />
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Button
                    variant="primary"
                    type="button"
                    onClick={handleSubmit}
                  >
                    Login
                  </Button>
                </div>

                <div className="col-md-3"></div>

                <div className="col-md-3">
                  {" "}
                  <Link
                    to="/forgetPassword"
                    // style={{ textDecoration: "none", color: "white" }}
                    style={{ textAlign: "right" }}
                  >
                    Forget Password ?
                  </Link>
                </div>
              </div>
            </Form>
          </div>
          <div className="col-md-3 sm-1"></div>
        </div>
      </div>

      {loginSuccess && (
        <Redirect
          to={{
            pathname: "/home",
            // state: { walletDetails: walletDetails },
          }}
        />
      )}
    </div>
  );
};

export default Login;
