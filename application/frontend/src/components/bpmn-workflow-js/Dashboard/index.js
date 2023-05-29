import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Row, Col, Button } from 'UIKit';
// import ChartsPage from './doughnut-chart';
// import DataProvider from '../DataProvider';
import WorkflowTable from './workflow-table';
import auth from "../../auth";


export default class index extends Component {

    logOut = () => {
        auth.logout(() => {
            window.location = "/login";
        });
    };

    render() {
        const { coreProps } = this.props;

        return (
            <div style={{ margin: '10px 0' }}>
                <Row>
                    <Col span={16} offset={4}>
                        <Row>
                            <Col span={16}>
                                <h1>Workflows</h1>
                            </Col>
                            <Col span={8}>
                                <Button type="danger" style={{float: 'right'}} onClick={this.logOut.bind(this)}>
                                    Logout
                                </Button>
                                <Button type="primary" style={{float: 'right'}}>
                                    <Link to={coreProps.urls.add_bpmn} className="btn btn-primary" >Create New Workflow</Link>
                                </Button>
                            </Col>
                        </Row>
                        <WorkflowTable coreProps={coreProps} />
                    </Col>
                </Row>
            </div>
        )
    }
}
