import React, { Component } from 'react';
import { Table, Input, Icon, Button, Row, Col, Form, Select, message } from 'UIKit';
import TableInput from './table_input';
import axios from "axios";


const { Option } = Select;
const form_layout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 18,
    },
};

const tailLayout = {
    wrapperCol: {
        offset: 6,
        span: 18,
    },
};


export default class ConfigResourceManagement extends Component {
    constructor(props) {
        super(props);

        this.state = {
            config_resource_id: 0,
            config_resource_name: null,
            config_resources: [],
            config_resource_list: [],
        };
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidMount(){
        this.loadConfigResourcesList();
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
            console.log(response);
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

    onConfigResourceSelectChange = (value) => {
        this.setState({
            config_resource_id: value,
            config_resource_name: null,
            config_resources: []
        });
        let self = this;
        const { coreProps } = this.props;
        const headers = {};
        if(coreProps.user_token){
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }

        if(value){
            axios.get(coreProps.engine_url+'/config-resource/' + value, {
                headers: headers
            }).then(function (response) {
                let response_data = response.data;
                self.setState({ 
                    config_resource_name: response_data.name,
                    config_resources: response_data.variable
                });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });
        }
    }

    onSaveConfigResource(){
        const { config_resource_id, config_resource_name, config_resources } = this.state;
        const { coreProps } = this.props;

        const config_resource_save = {
            id: config_resource_id,
            name: config_resource_name,
            variable: config_resources
        }

        let self = this;

        const headers = {};
        if(coreProps.user_token){
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }

        if(config_resource_id){
            axios.put(coreProps.engine_url+'/config-resource/' + config_resource_id, config_resource_save, {
                headers: headers
              }).then(function (response) {
                message.info(config_resource_name + " already saved.");
                self.loadConfigResourcesList();
              }).catch(function (error) {
                message.error("Save " + config_resource_name + " Error.");
            });
        }else{
            axios.post(coreProps.engine_url+'/config-resources/', config_resource_save, {
                headers: headers
              }).then(function (response) {
                self.loadConfigResourcesList();
                message.info(config_resource_name + " already saved.");
              }).catch(function (error) {
                message.error("Save " + config_resource_name + " Error.");
            });
        }
    }

    onConfigListChange(data_list){
        this.setState({ 
            config_resources: data_list
        });
    }

    onConfigResourceNameChange(e){
        this.setState({ 
            config_resource_name: e.target.value
        });
    }

    render() {
        const { config_resource_id, config_resource_name, config_resource_list, config_resources } = this.state;

        return (
            <Row>
                <Form
                    {...form_layout}
                    name="basic"
                >
                    <Form.Item
                        label={
                          <span>
                            Config Resource&nbsp;
                          </span>
                        }
                    >
                        <Select
                            style={{ width: '100%' }}
                            value={config_resource_id}
                            onChange={this.onConfigResourceSelectChange.bind(this)}
                        >
                            {config_resource_list.map(v => (
                                <Option value={v.id}>{v.name}</Option>
                            ))}
                            <Option value={0}> ---- Create New Config Resource ---- </Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label={
                          <span>
                            Name&nbsp;
                          </span>
                        }
                    >
                        <Input
                            style={{
                                width: '100%',
                            }}
                            placeholder="Config Resource Name"
                            value={config_resource_name}
                            onChange={this.onConfigResourceNameChange.bind(this)}
                        />
                    </Form.Item>
                    <Form.Item {...tailLayout}>
                        <Button
                            type="primary"
                            size='large'
                            style={{ background: "green", borderColor: "green" }}
                            // loading={loadings[1]}
                            onClick={this.onSaveConfigResource.bind(this)}
                        >
                            <Icon type="save" />Save
                        </Button>
                    </Form.Item>
                    <div style={{ marginTop: 20 }}>
                        <TableInput 
                            onChange={this.onConfigListChange.bind(this)}
                            value={config_resources}
                        />
                    </div>
                </Form>
            </Row>
        );
    }
}
