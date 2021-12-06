import "./App.css";
import SignUp from "./Components/SignUp";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Components/Login";
import MyNav from "./Components/MyNav";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Details from "./Components/Details";
import { useEffect, useState } from "react";
import LoginFirst from "./Components/LoginFirst";
import ForgotPasswordPage from "./Components/ForgetPassword";
import ResetPassword from "./Components/Resetpassword";
import Home from "./Components/Home";

function App() {
  const [token, setToken] = useState();
  const [flag, setFlag] = useState();

  useEffect(() => {
    console.log("value of flag in app js is ", flag);
    setToken(localStorage.getItem("auth-token"));
  }, [flag]);

  return (
    <div>
      <BrowserRouter>
        {/* Always use link inside router */}

        <MyNav flag={flag} setFlag={setFlag} />

        <Switch>
          <Route exact path="/" component={SignUp} />
          <Route exact path="/signup" component={SignUp} />

          {/* <Route exact path="/home" component={Home} /> */}

          <Route
            exact
            path="/login"
            render={() => <Login flag={flag} setFlag={setFlag} />}
          />
          {/* 
          <Route
            exact
            path="/details"
            render={(props) =>
              token ? <Details {...props} /> : <LoginFirst />
            }
          /> */}

          {
            <Route
              exact
              path="/details"
              render={() => (token ? <Details /> : <LoginFirst />)}
            />
          }

          <Route
            exact
            path="/home"
            render={() => (token ? <Home /> : <LoginFirst />)}
          />

          <Route
            path="/resetPassword/:token"
            render={() => <ResetPassword />}
          />

          <Route
            exact
            path="/forgetPassword"
            render={() => <ForgotPasswordPage />}
          />

          {/* <Route exact path="/details" component={Details} /> */}

          {/* <Route path="*" component={ErrorPage} /> */}
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
