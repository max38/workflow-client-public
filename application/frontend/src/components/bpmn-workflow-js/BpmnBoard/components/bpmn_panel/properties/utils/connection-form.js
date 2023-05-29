
import React from 'react';
import axios from "axios";
import {
    Form,
    Input,
    Button,
    Modal,
    Select,
    Divider,
    Typography,
} from 'UIKit';

const { Option } = Select;
const { Title } = Typography;


export default class ConnectionForm extends React.Component {
    

    constructor(props) {
        super(props);

        this.state = {
            autoCompleteResult: [],
            connected: false,
            conectionLoading: false,
            saveVisible: false,
            saveLoading: false,
            connectionName: "",
            connectionInfo: null,
            connectionInfoSelected: null,
            connections: [],
            connectionSelected: 0,
            showEditConnection: false,
        };
    }

    componentDidMount() {
        const { service_selected } = this.props;
        
        if(service_selected){
            this.loadConnectionSettings();
        }
    }

    handleCancelSaveModal = e => {
        this.setState({
            saveVisible: false,
        });
    };

    handleShowEditConnection = e => {
        this.setState({
            showEditConnection: true,
        });
    };

    componentWillReceiveProps(nextProps) {
        const { service_selected } = nextProps;
        
        if(service_selected != this.props.service_selected){
            this.loadConnectionSettings();
        }
    }

    handleSubmit = e => {
        let self = this;
        e.preventDefault();
        self.setState({ conectionLoading: true });
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);

                let { coreProps, service_selected } = self.props;

                const headers = {};
                if (coreProps.user_token) {
                    headers['Authorization'] = 'Token ' + coreProps.user_token;
                }
                axios.post(coreProps.engine_url + '/service/' + service_selected.id + '/connect?test=1', values, {
                    headers: headers
                })
                    .then(function (response) {
                        // message.info(workflow.name + " DRAF v." + (workflow.version + 1) + " already saved.");
                        self.setState({ saveVisible: true, conectionLoading: false, connected: true, connectionInfo: values });
                    })
                    .catch(function (error) {
                        // handle error
                        console.log(error);
                        self.setState({ saveVisible: false, conectionLoading: false, connected: false, connectionInfo: null });
                    })
                    .then(function () {
                        // always executed
                    });


                if (this.props.handleConnectionSave) {
                    this.props.handleConnectionSave(values)
                }
            }
        });
    };

    onConnectionChange(value){
        let connectionInfoSelected = null;
        let connectionName = "";
        let { connections } = this.state;
        connections.map((conn, index) => {
            if(conn.id == value){
                connectionInfoSelected = conn;
                connectionName = conn.name;
            }
        });
        this.setState({ connectionSelected: value, connectionName: connectionName, connectionInfoSelected: connectionInfoSelected, showEditConnection: false });
        
        if(this.props.connectionSelectedChange){
            this.props.connectionSelectedChange(value);
        }
    }

    handleSaveConnection = () => {
        let self = this;
        self.setState({ saveLoading: true });

        let { coreProps, service_selected } = self.props;
        let { connectionName, connectionInfo, connectionSelected } = self.state;

        const headers = {};
        let values = {
            id: connectionSelected,
            config_interface: connectionInfo,
            name: connectionName,
        };
        if (coreProps.user_token) {
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }
        axios.post(coreProps.engine_url + '/service/' + service_selected.id + '/connect', values, {
            headers: headers
        })
            .then(function (response) {
                // message.info(workflow.name + " DRAF v." + (workflow.version + 1) + " already saved.");
                self.loadConnectionSettings();
                self.setState({ connectionSelected: response.data.id, saveVisible: false });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
                self.setState({ saveLoading: false });
            });
    }

    loadConnectionSettings(){
        let self = this;
        let { coreProps, service_selected } = this.props;
        let { connectionSelected, connections, connectionName, connectionInfoSelected } = this.state;
        const headers = {};
        if (coreProps.user_token) {
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }
        axios.get(coreProps.engine_url + '/service/' + service_selected.id + '/connections', {
            headers: headers
        })
            .then(function (response) {
                // message.info(workflow.name + " DRAF v." + (workflow.version + 1) + " already saved.");
                if(connectionSelected == 0 && parseInt(self.props.connectionSelected) > 0){
                    connectionSelected = parseInt(self.props.connectionSelected);
                    // self.onConnectionChange(connectionSelected);
                    response.data.map((conn, index) => {
                        if(conn.id == connectionSelected){
                            connectionInfoSelected = conn;
                            connectionName = conn.name;
                        }
                    });
                }
                self.setState({ connections: response.data, connectionSelected: connectionSelected, connectionName: connectionName, connectionInfoSelected: connectionInfoSelected });
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    }

    handleInputNameConnectionChange(event) {
        this.setState({ connectionName: event.target.value });
    }

    handleInputChange = value => {
        self.setState({ connected: false });
        //     let autoCompleteResult;
        //     if (!value) {
        //       autoCompleteResult = [];
        //     } else {
        //       autoCompleteResult = ['.com', '.org', '.net'].map(domain => `${value}${domain}`);
        //     }
        //     this.setState({ autoCompleteResult });
    };

    handleLoadModule(){
        this.setState({showEditConnection: false});
        if(this.props.loadModule){
            this.props.loadModule(this.state.connectionInfoSelected);
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { conectionLoading, saveLoading, connected, connectionName, connections, connectionSelected, connectionInfoSelected, showEditConnection } = this.state;
        const { service_selected, readonly } = this.props;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 18,
                    offset: 6,
                },
            },
        };
        let connection = service_selected.connection;

        if(showEditConnection){
            // console.log('onnectionInfoSelected.config_interface');
            // console.log(onnectionInfoSelected.config_interface);
            // let config_interface = JSON.parse(connectionInfoSelected.config_interface);
            let config_interface = connectionInfoSelected.config_interface;
            Object.keys(config_interface).map((key, index) => {
                connection[key].value = config_interface[key];
            });
        }else{
            Object.keys(connection).map((key, index) => {
                connection[key].value = null;
            });
        }

        return (
            <>
                <Form {...formItemLayout}>
                    <Form.Item
                        label={
                            <span>Connection&nbsp;</span>
                        }
                    >
                        <Select 
                            value={connectionSelected}
                            onChange={this.onConnectionChange.bind(this)}
                            disabled={readonly}
                        >
                            <Option value={0}>Create New Connection</Option>
                            {
                                connections.map((value, index) => (
                                    <Option value={value.id}>{value.name}</Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    { (connectionSelected != 0 && !readonly) && <Form.Item {...tailFormItemLayout}>
                        <Button type="primary" onClick={this.handleLoadModule.bind(this)}>Load Module</Button>
                        <Button onClick={this.handleShowEditConnection.bind(this)}>Edit</Button>
                    </Form.Item> }
                </Form>
                <Divider dashed />
                { (connectionSelected == 0 || showEditConnection) && <>
                <Title level={4}>{ showEditConnection ? "Edit Connection" : "New Connection"}</Title>
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    {
                        Object.keys(connection).map((key, index) => (
                            <Form.Item
                                label={
                                    <span>{connection[key].title}&nbsp;</span>
                                }
                            >
                                {getFieldDecorator(key, {
                                    initialValue: connection[key].value,
                                    rules: [
                                        // { value={connectionInfoSelected.config_interface[key]}
                                        //     type: 'email',
                                        //     message: 'The input is not valid E-mail!',
                                        // },
                                        {
                                            required: connection[key].required,
                                            message: 'Please input ' + connection[key].title,
                                        },
                                    ],
                                })(<Input />)}
                            </Form.Item>
                        ))
                    }
                    <Form.Item {...tailFormItemLayout}>
                        <Button htmlType="submit" loading={conectionLoading}>Connect</Button>
                        {connected &&
                            <Button type="primary" onClick={() => this.setState({ saveVisible: true })}>Save</Button>
                        }
                    </Form.Item>
                </Form> 
                </>
                }
                <Modal
                    title="Save Connection"
                    visible={this.state.saveVisible}
                    onCancel={this.handleCancelSaveModal}
                    footer={[
                        <Button key="back" onClick={this.handleCancelSaveModal}>Cancel</Button>,
                        <Button key="submit" type="primary" loading={saveLoading} onClick={this.handleSaveConnection}>Save</Button>,
                    ]}
                >
                    <Form
                        {...formItemLayout}
                        name="save connection"
                    >
                        <Form.Item
                            label={
                                <span>Connection Name&nbsp;</span>
                            }
                        >
                            <Input value={connectionName} onChange={this.handleInputNameConnectionChange.bind(this)} />
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        );
    }
}

// export const ConnectionForm = Form.create({ name: 'register' })(ConnectionForm);

