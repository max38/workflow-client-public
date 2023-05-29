import React, { Component, Fragment } from 'react';
import axios from "axios";
import { Link } from "react-router-dom";
import { Popconfirm, message, Layout, Icon, Button, Typography, Tag, Form, Row, Col, Tabs, Select } from 'UIKit';

const { Option } = Select;
const form_layout = {
    labelCol: {
      span: 7,
    },
    wrapperCol: {
      span: 17,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 7,
        span: 17,
    },
};

export default class VersionControlTools extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            workflow: props.workflow,
            selected_version: props.selected_version,
            selected_workflow: props.selected_workflow,
            config_resource_list: [],
            config_resource_selected: [],
		};
    }

    componentWillReceiveProps(nextProps) {
        const { selected_version, selected_workflow, workflow } = nextProps;
        this.setState({
            selected_version: selected_version,
            selected_workflow: selected_workflow,
            workflow: workflow
        });
    }

    componentDidMount(){
        this.loadConfigResourcesList();
    }

    onVersionChange = (value) => {
        this.props.onChange(value);
    }

    loadConfigResourcesList(){
        let self = this;
        const { coreProps } = this.props;
        
        const headers = {};
        if(coreProps.user_token){
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }

        axios.get(coreProps.engine_url+'/config-resources/', {
            headers: headers
        }).then(function (response) {
            self.setState({ config_resource_list: response.data });
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
    }

    handleConfigResourceSelectChange(value){
        this.setState({
            config_resource_selected: value
        });
    }

    onApplyVersion(){
        const { workflow, selected_version, selected_workflow, config_resource_selected } = this.state;
        let apply_data = {
            version: selected_version,
            workflow: workflow.workflow_id,
            config_resources: config_resource_selected,
            status: "run"
        };
        const { coreProps } = this.props;
        let self = this;

        const headers = {};
        if(coreProps.user_token){
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }

        axios.post(coreProps.engine_url+'/workflow/apply', apply_data, {
            headers: headers
        }).then(function (response) {
            console.log(response);
            message.info(workflow.name + " v." + selected_workflow.version + " already Apply and Run.");
            self.props.onCommit(workflow.workflow_id);
        }).catch(function (error) {
            console.log(error);
        });
    }

    onCommitVersion(){
        const { workflow } = this.state;
        const { coreProps } = this.props;
        let patch_data = {
            version: workflow.version+1,
            workflow_id: workflow.workflow_id
        };
        let self = this;

        const headers = {};
        if(coreProps.user_token){
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }

        axios.patch(coreProps.engine_url+'/workflow/' + workflow.workflow_id, patch_data, {
            headers: headers
        }).then(function (response) {
            // console.log(response);
            message.info(workflow.name + " v." + (workflow.version+1) + " already committed.");
            self.props.onCommit(workflow.workflow_id, workflow.version);
        }).catch(function (error) {
            console.log(error);
        });
    }

    render() {
        const { coreProps } = this.props;
        const { selected_version, selected_workflow, workflow, config_resource_list } = this.state;
        let button_version, element_config_resource;
        
        if(selected_version == "draf"){
            button_version = <Fragment>
                <Popconfirm
                    placement="bottomLeft"
                    title={"Commit v." + (workflow.version+1) + " and create DRAF v." + (workflow.version+2) + " ?"}
                    onConfirm={this.onCommitVersion.bind(this)}
                    okText="Confirm"
                    cancelText="No"
                >
                    <Button type="primary" style={{ background: "green", borderColor: "green" }}>
                        Commit
                    </Button>
                </Popconfirm>
                <Button style={{marginLeft: 10}}>
                    {/* <Link to={"/workflow/" + workflow.workflow_id + "/edit"} title="Edit">Edit</Link> */}
                    <Link to={`${coreProps.urls.edit_bpmn}/${workflow.workflow_id}`} title="Edit">Edit</Link>
                </Button>
            </Fragment>;
        }else{
            if(selected_workflow){
                if(selected_workflow.is_active){
                    button_version = "Already use";
                } else {
                    element_config_resource = <Form.Item
                        label={
                        <span>
                            Configs&nbsp;
                        </span>
                        }
                    >
                        <Select
                            mode="tags"
                            style={{ width: '100%' }}
                            onChange={this.handleConfigResourceSelectChange.bind(this)}
                        >
                            {config_resource_list.map(v => (
                                <Option key={v.id}>{v.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    button_version = <Popconfirm
                        placement="bottomLeft"
                        title={"Apply and run " + workflow.name + " (v." + selected_workflow.version + ") ?"}
                        onConfirm={this.onApplyVersion.bind(this)}
                        okText="Apply and Run"
                        cancelText="No"
                    >
                        <Button type="primary">
                            Apply
                        </Button>
                    </Popconfirm>;
                }
            }
        }

        return (
            <Row>
                <Form
                    {...form_layout}
                    name="basic"
                >
                    <Form.Item
                        label={
                          <span>
                            Version&nbsp;
                          </span>
                        }
                    >
                        <Select
                            style={{ width: '100%' }}
                            value={selected_version}
                            onChange={this.onVersionChange}
                        >
                            <Option value="draf">DRAF v.{workflow.version+1}</Option>
                            {workflow.versions.map(v => (
                                v.version > 0 && <Option value={v.id}>v.{v.version}{v.is_active ? " (Active)": ""}</Option>
                            ))}
                        </Select>
                    </Form.Item>   
                    {element_config_resource}
                    <Form.Item {...tailLayout}>
                        {button_version} <span style={{marginLeft: 10}}>this version</span>
                    </Form.Item>
                </Form>
                
                {/* <Button type="primary" >
                    <Link to={"/workflow/" + workflow.workflow_id + "/edit"} title="Edit">Edit</Link>
                </Button> */}
            </Row>
        );
    }
}