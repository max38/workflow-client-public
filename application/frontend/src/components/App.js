import React, { Component } from 'react';
import ReactDom from 'react-dom';
import NotFoundPage from "./pages/page404";
import loginPage from "./pages/login";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import BpmnWorkflow from './bpmn-workflow-js/index';
import auth from "./auth";

var user_token;

export default class App extends Component {
    componentWillMount() {
        user_token = auth.getToken();
    }

    render() {
        if(auth.loggedIn()){
            return (
                <BrowserRouter>
                <Switch>
                    <Route path="/login" component={loginPage} />
                    <Route
                        // onEnter={requireAuth}
                        path="/workflow"
                        render={(props) => (
                            // <BpmnWorkflow {...props} engine_url={"http://103.212.181.125:8000/flow-api"} />
                            <BpmnWorkflow {...props} user_token={user_token} />
                        )}
                    />
                    <Route component={NotFoundPage} />
                </Switch>
            </BrowserRouter>
            );
        }else{
            return (
                <BrowserRouter>
                    <Switch>
                        <Route path="/login" component={loginPage} />
                        <Route component={loginPage} />
                    </Switch>
                </BrowserRouter>
            )
        }
    }
}

ReactDom.render(
    <App />, 
    document.getElementById('app')
)
