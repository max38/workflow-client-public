import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route // for later
} from 'react-router-dom';
import Dashboard from './Dashboard/index';
import BpmnBoard from './BpmnBoard/index';
import ProcessWorkflow from './ProcessWorkflow/index';
import 'antd/dist/antd.css';
import './app.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

export default class BpmnWorkflow extends Component {
  render() {
    const { match, engine_url, user_token } = this.props;

    let engine_url_prop = engine_url;

    if(!engine_url){
        engine_url_prop = "/flow-api";
    }

    // let coreProps = {
    //     urls: {
    //         add_bpmn: match.path + "add",
    //         edit_bpmn: match.path + ":workflow_id/edit",
    //         view_process: match.path + ":workflow_id",
    //         dashboard: match.path,
    //     },
    //     engine_url: engine_url_prop
    // };

    let coreProps = {
        urls: {
            add_bpmn: `${match.path}/add_bpmn`,
            edit_bpmn: `${match.path}/edit_bpmn`,
            view_process: `${match.path}/view_process`,
            dashboard: `${match.path}/dashboard`,
        },
        engine_url: engine_url_prop,
        user_token: user_token
    };
    return (
      <Router>
          <Switch>
            <Route
                path={coreProps.urls.add_bpmn}
                render={(props) => (
                    <BpmnBoard {...props} coreProps={coreProps} />
                )}
            />
            {/* <Route
                path={coreProps.urls.edit_bpmn}
                render={(props) => (
                    <BpmnBoard {...props} coreProps={coreProps} />
                )}
            /> */}
            <Route
                path={`${coreProps.urls.edit_bpmn}/:workflow_id`}
                render={(props) => (
                    <BpmnBoard {...props} coreProps={coreProps} />
                )}
            />
            {/* <Route
                path={coreProps.urls.view_process}
                render={(props) => (
                    <ProcessWorkflow {...props} coreProps={coreProps} />
                )}
            /> */}
            <Route
                path={`${coreProps.urls.view_process}/:workflow_id`}
                render={(props) => (
                    <ProcessWorkflow {...props} coreProps={coreProps} />
                )}
            />
            <Route
                path={coreProps.urls.dashboard}
                render={(props) => (
                    <Dashboard {...props} coreProps={coreProps} />
                )}
            />
          </Switch>
      </Router>
    )
  }
}
