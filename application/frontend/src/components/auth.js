import axios from "axios";

const auth = {
  login: function(userName, pass, cb) {
    cb = arguments[arguments.length - 1];
    if (localStorage.token) {
      if (cb) cb(true);
      this.onChange(true);
      return;
    }
    if (userName && pass) {
      pretendRequest(userName, pass, (res) => {
        if (res.authenticated) {
          localStorage.token = res.token;
          if (cb) cb(true);
          this.onChange(true);
        } else {
          err = res.msg;
          if (cb) cb(false);
          this.onChange(false);
        }
      });
    } else {
      err = "username & password is undefined";
      if (cb) cb(false);
      this.onChange(false);
    }
  },
  getToken: function() {
    return localStorage.token;
  },
  getError: function() {
    return err;
  },
  logout: function(cb) {
    const headers = {
      authorization: "Token " + localStorage.token,
      accept: "application/json;odata=verbose",
    };

    axios.get("/logout/", {
      headers: headers
    }).then(function (response) {
      localStorage.clear();
      if (cb) cb();
      this.onChange(false);
    }).catch(function (error) {
      localStorage.clear();
    });
  },
  loggedIn: function() {
    return !!localStorage.token;
  },
  onChange: function() {},
  getUser: function() {
    // $.ajax({
    //   async: false,
    //   url: hostname + "/users/userinfo/",
    //   type: "GET",
    //   dataType: "json",
    //   contentType: "application/json",
    //   headers: {
    //     authorization: "Token " + localStorage.token,
    //     accept: "application/json;odata=verbose",
    //   },
    //   success: function(output) {
    //     user = output.results[0];
    //   }.bind(this),
    //   error: function(response) {
    //     user = undefined;
    //     localStorage.clear();
    //     history.push("/login");
    //   },
    // });
    // return user;
  },
  getUserInfo: function() {
    // return user || {};
  },
};

export default auth;

function pretendRequest(userName, pass, cb) {
  setTimeout(() => {
    let login_data = {
      username: userName,
      password: pass,
    }
    axios.post("/api-auth/", login_data).then(function (response) {
      let data = response.data;
      cb({
        authenticated: true,
        token: data.token,
      });
    }).catch(function (error) {
      cb({
        authenticated: false,
        msg: "tx",
      });
    });
  }, 0);
}
