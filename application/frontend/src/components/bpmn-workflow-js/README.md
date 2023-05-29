### put these lines to package.json (dependencies session)


"react": "^16.13.1",
"ace-builds": "^1.4.11",
"actions": "^1.3.0",
"antd": "^3.26.17",
"autobind-decorator": "^2.4.0",
"axios": "^0.19.2",
"bootstrap": "^4.5.0",
"bpmn-js": "^6.5.1",
"bpmn-js-bpmnlint": "^0.13.1",
"bpmn-js-properties-panel": "^0.33.2",
"bpmn-moddle": "^6.0.6",
"camunda-bpmn-moddle": "^4.4.0",
"css-loader": "^3.5.3",
"downloadjs": "^1.4.7",
"file-loader": "^5.1.0",
"flexlayout-react": "^0.3.11",
"grommet": "^2.13.0",
"grommet-icons": "^4.4.0",
"jquery": "^3.5.1",
"jsonschema": "^1.2.6",
"less": "^3.11.2",
"mdbreact": "^4.27.0",
"prop-types": "^15.7.2",
"raw-loader": "^4.0.1",
"react-ace": "^8.1.0",
"react-bootstrap": "^1.0.1",
"react-chartjs-2": "^2.9.0",
"react-dom": "^16.13.1",
"react-file-picker": "0.0.6",
"react-json-view": "^1.19.1",
"react-list-input": "^1.1.0",
"react-redux": "^7.2.0",
"react-router-dom": "^5.2.0",
"react-spinkit": "^3.0.0",
"react-split-pane": "^2.0.3",
"react-tooltip": "^3.11.6",
"style-loader": "^1.2.1",
"styled-components": "^4.4.1",
"theme": "^0.1.0",
"weak-key": "^1.0.2",
"webfontloader": "^1.6.28",
"xml-js": "^1.6.11"

----------------------
Example to use

```
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import BpmnWorkflow from './bpmn-workflow-js/index';


ReactDom.render(
    <BrowserRouter>
        <Switch>
            <Route
                path="/workflow/"
                render={(props) => (
                    <BpmnWorkflow {...props} engine_url={"/flow-api"} />
                )}
            />
        </Switch>
    </BrowserRouter>, 
    document.getElementById('app')
)

```