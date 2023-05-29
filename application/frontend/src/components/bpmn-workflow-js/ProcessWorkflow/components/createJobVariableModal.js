import React, { Component } from 'react';
import ReactJson from 'react-json-view';
import { Button, Modal, Form, Input, Typography, Spin, Alert } from 'UIKit';
import { Divider } from 'antd';
import axios from "axios";

const { Title } = Typography;


class CreateJobForm extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            loading: false,
            alert: null
		};
    }

    handleSubmit = e => {
        let { coreProps, workflow_attributes } = this.props;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                const headers = {};
                if(coreProps.user_token){
                    headers['Authorization'] = 'Token ' + coreProps.user_token;
                }
                this.setState({ loading: true });
                let self = this;

                axios.post(coreProps.engine_url + "/workflow/" + workflow_attributes.workflow_key + "/run", values, {
                    headers: headers
                  }).then(function (response) {
                      if(response.status == 202){
                        self.setState({ 
                            loading: false,
                            alert_list: <Alert message="Create Job Success" type="success" showIcon closable />
                        });
                      }
                  }).catch(function (error) {
                    console.log(error);
                    self.setState({ 
                        loading: false,
                        alert_list: <Alert message={error} type="error" showIcon closable />
                    });
                });
            }
        });
    };

    handleCreatingJobCancel = () => {
        this.props.handleCreatingJobCancel();
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        let { alert_list } = this.state;
        let { variables } = this.props;
        return (
            <>
            <Spin spinning={this.state.loading} size="large" >
                {alert_list}
                <Form 
                    {...{
                        labelCol: {
                        span: 8,
                        },
                        wrapperCol: {
                        span: 16,
                        },
                    }}
                    onSubmit={this.handleSubmit}
                    // onFinish={this.handleCreatingJobSubmit}
                    // preserve={false}
                    >
                            
                    {variables.map(function(object, i){
                        return <Form.Item label={object.variable} >
                            {getFieldDecorator(object.variable, {
                                rules: [{ required: object.require, message: 'Please input your '+object.variable+'!' }],
                            })(<Input />)}
                        </Form.Item>
                    })}
                    <Form.Item {...{
                        wrapperCol: {
                            offset: 8,
                            span: 16,
                        },
                    }}>
                        <Button type="primary" htmlType="submit">
                        Submit
                        </Button>
                        <Button key="back" onClick={this.handleCreatingJobCancel}>
                        Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Spin>
            </>
        );
    }
}

const WrappedCreateJobForm = Form.create({ name: 'dynamic_rule' })(CreateJobForm);


export default class CreateJobVariableModal extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            visible_create_job: false
		};
    }

    handleCreatingJobSubmit(values){
		console.log('Success:', values);
	};

    handleCreatingJobCancel = () => {
		this.setState({ visible_create_job: false });
    };
    
    showCreatingJobModal = () => {
		this.setState({
			visible_create_job: true,
		});
    };


    render() {
        let { workflow_attributes, coreProps } = this.props;
        // const { getFieldDecorator } = this.props.form;
        let { visible_create_job } = this.state;
        let show_example_payload = {};

        let create_job_url = "-";
        if(workflow_attributes.workflow_key){
            create_job_url = coreProps.engine_url + "/workflow/" + workflow_attributes.workflow_key + "/run";
        }

        if(workflow_attributes && workflow_attributes.variables){
            let value_list = [...new Set(workflow_attributes.variables)];
            value_list.forEach(element => {
                show_example_payload[element.variable] = element.default ? element.default : 'xxxxxx';
            });
        }

        return (
            <>
            <Button onClick={this.showCreatingJobModal} >
                Create Job
            </Button>
            { workflow_attributes && <Modal
                visible={visible_create_job}
                title="Create Job"
                footer={null}
                onCancel={this.handleCreatingJobCancel}
                >
                    <Form 
                    >
                        <Form.Item
                            label={
                            <span>
                                Create Job URL&nbsp;
                            </span>
                            }
                        >
                            <Input addonBefore="POST : " value={create_job_url} readOnly />
                        </Form.Item>
                        <ReactJson
                            src={show_example_payload}
                            name={false}
                            displayDataTypes={false}
                        />
                    </Form>
                    <Divider orientation="left">
                        Or Submit This Form
                    </Divider>
                    <WrappedCreateJobForm 
                        coreProps={coreProps}
                        workflow_attributes={workflow_attributes}
                        variables={workflow_attributes.variables} 
                        handleCreatingJobCancel={this.handleCreatingJobCancel.bind(this)}
                    />
            </Modal>
            }
            </>
        );
    }
};
