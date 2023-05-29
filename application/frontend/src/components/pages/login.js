import React, { Component } from "react";

import { Form, Icon, Input, Button, Card, message } from "UIKit";

import auth from "../auth";

class Login_form extends Component {
  constructor() {
    super();
    this.state = { msg: "" };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault();
    const logined_url = "/workflow/dashboard"; 

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ msg: "กำลังเข้าสู่ระบบ" });
        localStorage.clear();
        auth.login(values.username, values.password, loggedIn => {
          if (!loggedIn) {
            var err = auth.getError();
            message.error("ไม่สามารถเข้าสู่ระบบได้");
            // Swal.fire({
            //   title: "ไม่สามารถเข้าสู่ระบบได้",
            //   html: err,
            //   type: "warning",
            //   confirmButtonText: "รับทราบ"
            // });
            return this.setState({ msg: "" });
          } else {
            this.setState({ msg: "" });
            // this.props.history.push(logined_url);
            window.location = logined_url;
          }
        });
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { msg } = this.state;
    return (
      <div
        style={{
          background: "#ECECEC",
          // background: "rgb(21, 21, 21)",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-around",
          display: "flex",
          height: "100vh"
        }}
      >
        <Card
          title="BPMN Workflow"
          // bordered={false}
          style={{ width: 300, borderRadius: "10px" }}
          headStyle={
            {
              // background: "linear-gradient(#394581, #273164)",
              // color: "white",
              // justifyContent: "space-around",
              // display: "flex",
              // fontWeight: "bold",
              // borderRadius: "10px 10px 0 0"
            }
          }
        >
          <Form onSubmit={this.handleSubmit.bind(this)} className="login-form">
            <Form.Item>
              {getFieldDecorator("username", {
                rules: [
                  { required: true, message: "Please input your username!" }
                ]
              })(
                <Input
                  prefix={
                    <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  placeholder="Username"
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator("password", {
                rules: [
                  { required: true, message: "Please input your Password!" }
                ]
              })(
                <Input
                  prefix={
                    <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  type="password"
                  placeholder="Password"
                />
              )}
            </Form.Item>
            {msg ? (
              <center>
                <p>
                  <Icon type="loading" />
                  &emsp;{msg}
                </p>
              </center>
            ) : null}
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                icon="login"
              >
                LOG IN
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }
}

const loginPage = Form.create({ name: "login_form" })(Login_form);

export default loginPage;
