import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./SignUp.css";
import axios from "axios";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

toast.configure();

const SignUp = () => {
  const [details, setDetails] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = () => {
    console.log("Submit button clicked  in SIGNUP form ", details);
    if ((details.name == "" || details.email == "", details.password == "")) {
      // console.log("Please Enter some value");
      toast.error("Please Enter some value");
    } else {
      const payload = {
        name: details.name,
        email: details.email,
        password: details.password,
      };

      axios
        .post("http://localhost:8080/api/user/register", payload)
        .then((res) => {
          console.log("Signup Response", res);
          toast.info(res.data);

          setDetails({
            name: "",
            email: "",
            password: "",
          });

          document.getElementById("name").value = "";
          document.getElementById("password").value = "";
          document.getElementById("email").value = "";
        })
        .catch((err) => {
          console.log("Signup error", err.response.data);
          toast.error(err.response.data);
        });
    }
  };

  return (
    <div>
      <h1 className="text-center  registr form-heading"> Register Here </h1>
      <div className="form-div">
        <div className="row">
          <div className="col-md-3  sm-1"></div>
          <div className="col-md-6 sm-10">
            <Form className="main-form">
              <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  // className="input-box"
                  id="name"
                  type="text"
                  placeholder="Enter Name"
                  onChange={(e) =>
                    setDetails({ ...details, name: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  // className="input-box"
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  onChange={(e) =>
                    setDetails({ ...details, email: e.target.value })
                  }
                />
                <Form.Text className="text-muted">
                  We'll never share your email with anyone else.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  // className="input-box"
                  id="password"
                  type="password"
                  placeholder="Password"
                  onChange={(e) =>
                    setDetails({ ...details, password: e.target.value })
                  }
                />
              </Form.Group>

              <Button variant="primary" type="button" onClick={handleSubmit}>
                Submit
              </Button>

              <br></br>
              <span>
                Already have an account?
                <Link to="/login" style={{ textDecoration: "none" }}>
                  {" "}
                  login{" "}
                </Link>
              </span>
            </Form>
          </div>
          <div className="col-md-3 sm-1"></div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
