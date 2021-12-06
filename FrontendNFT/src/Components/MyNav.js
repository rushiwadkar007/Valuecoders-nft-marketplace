import React, { useEffect, useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  Button,
  DropdownButton,
  Dropdown,
  Modal,
} from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import "./MyNav.css";
// import Dropdown from "react-bootstrap/Dropdown";

import { removeDetails, updateUsername } from "../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

const MyNav = ({ flag, setFlag }) => {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);

  const userDetailsRedux = useSelector((state) => state.user.userDetails);
  const dispatch = useDispatch();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);

  const [token, setToken] = useState();
  let history = useHistory();

  const [userName, setUserName] = useState("");

  useEffect(() => {
    console.log("Value of flag  in nav", flag);
    setToken(localStorage.getItem("auth-token"));
  }, [flag]);

  const logout = () => {
    localStorage.removeItem("auth-token");
    setFlag(false);
    dispatch(removeDetails());

    handleClose();
    history.push("/login");
  };

  const editUserDetails = () => {
    let updatedData = {
      userName,
      email: userDetailsRedux.email,
    };

    console.log("Details are", updatedData, userName);

    // dispatch(updateUsername(userName));

    axios
      .put("http://localhost:8080/api/user/updateDetails", updatedData)
      .then((res) => {
        dispatch(updateUsername(userName));
        handleClose2();
        setUserName("");
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Are you sure you want to logout ?</h4>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            No
          </Button>
          <Button variant="primary" onClick={logout}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={show2} onHide={handleClose2}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ background: "white" }}>
            <form className="form-tg">
              <div className="row row-div">
                <div className="col-md-4">
                  <label style={{ fontSize: "20px" }}> User Name : </label>
                </div>
                <div className="col-md-8">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </div>{" "}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose2}>
            Close
          </Button>
          <Button variant="primary" onClick={editUserDetails}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <Navbar className="nav-bar" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="">NFT Blockchain</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link></Nav.Link>
            <Nav.Link></Nav.Link>

            {!token ? (
              <>
                <Nav.Link>
                  <Link
                    to="/signup"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    {" "}
                    SignUp Page{" "}
                  </Link>
                </Nav.Link>

                <Nav.Link>
                  <Link
                    to="/login"
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    {" "}
                    Login Page{" "}
                  </Link>
                </Nav.Link>
              </>
            ) : null}
          </Nav>
        </Container>

        <div className="row">
          <div className="logout-button  col-md-10">
            {token ? (
              // <Button variant="danger" onClick={() => logout()}>
              //   Logout
              // </Button>
              <DropdownButton
                id="dropdown-basic-button"
                variant="dark"
                title="Actions"
              >
                <Dropdown.Item>
                  <Link
                    to="/details"
                    style={{ textDecoration: "none", color: "black" }}
                  >
                    {" "}
                    My Profile{" "}
                  </Link>
                </Dropdown.Item>

                <Dropdown.Item href="#/action-2" onClick={handleShow2}>
                  Edit User Details
                </Dropdown.Item>

                <Dropdown.Item>
                  <Link
                    to="/home"
                    style={{ textDecoration: "none", color: "black" }}
                  >
                    {" "}
                    Home Page{" "}
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item href="#/action-2" onClick={handleShow}>
                  Logout
                </Dropdown.Item>
              </DropdownButton>
            ) : null}
          </div>
          <div className="col-md-2"></div>
        </div>
      </Navbar>
    </>
  );
};

export default MyNav;
