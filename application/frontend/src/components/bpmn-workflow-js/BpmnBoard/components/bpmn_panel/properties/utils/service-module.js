import React, { Component } from 'react';
import axios from "axios";
import { Row, Col, Button, List, Icon, Avatar, Form, Empty, Divider, Typography } from 'UIKit';

import ConnectionForm from './connection-form';
import CustomForm from './custom-form';
import InfiniteScroll from 'react-infinite-scroller';
import InputMapper from './input-mapper';

const { Title, Text } = Typography;


const WrappedConnectionForm = Form.create({ name: 'connection' })(ConnectionForm);
const WrappedCustomForm = Form.create({ 
    name: 'input',
    onFieldsChange(props, changedFields) {
        props.onChange(changedFields);
    },
})(CustomForm);

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


export default class ServiceModule extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          services: [],
          service_selected: [],
          connection_service_id: 0,
          modules: [],
          module_selected: [],
          output_mapping: null
        }

        let { service_data } = this.props;
        if(service_data){
            try{
                service_data = JSON.parse(service_data);

                if(service_data.module_selected){
                    this.state.module_selected = [service_data.module_selected];
                }
                if(service_data.service_selected){
                    this.state.service_selected = [service_data.service_selected];
                }
                this.state.module_values = service_data.module_values;
                this.state.connection_service_id = service_data.connection_service_id;
                this.state.output_mapping = service_data.output_mapping;
            } catch(e) { 
                console.log("Caught: " + e.message)
            }
        }
    }
    
    componentDidMount() {
        this.load_services();
    }

    componentWillReceiveProps(nextProps) {
        const { service_data } = nextProps;
        if (service_data) {
            try{
                service_data = JSON.parse(service_data);

                let module_selected = [];
                let service_selected = [];
                if(service_data.module_selected){
                    module_selected = [service_data.module_selected];
                }
                if(service_data.service_selected){
                    service_selected = [service_data.service_selected];
                }
                this.setState({
                    service_selected: service_selected,
                    module_selected: module_selected,
                    module_values: service_data.module_values,
                    connection_service_id: service_data.connection_service_id,
                    outpur_mapping: service_data.output_mapping,
                });
            } catch(e) { 
                console.log("Caught: " + e.message)
            }
        }
    }

    load_services() {
        let { coreProps } = this.props;
        let self = this;
    
        const headers = {};
        if(coreProps.user_token){
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }
        axios.get(coreProps.engine_url+'/services', {
          headers: headers
        })
          .then(function (response) {
            self.setState({ services: response.data });
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
          .then(function () {
            // always executed
          });
    }

    select_service(service){
        // let { nodeId } = this.state;
    
        this.setState({ service_selected: [service], modules: [] });
        this.props.set_service_image(service.logo);
    
        // if (this.props.updateByBpmnProperty) {
        //   this.props.updateByBpmnProperty(nodeId, {
        //     'selected_service': JSON.stringify(service),
        //   });
        // }
    }

    unselect_service(){
        // let { nodeId } = this.state;
        this.setState({ service_selected: [], modules: [], connection_service_id: 0 });
        this.props.remove_service_image();
    
        // if (this.props.updateByBpmnProperty) {
        //   this.props.updateByBpmnProperty(nodeId, {
        //     'selected_service': null,
        //   });
        // }
    }

    connectionSelectedChange(connection_id){
        // let { nodeId } = this.state;
        this.setState({ connection_service_id: connection_id });
    
        // if (this.props.updateByBpmnProperty) {
        //   this.props.updateByBpmnProperty(nodeId, {
        //     'connection_service_id': connection_id,
        //   });
        // }
    }

    handleConnectionSave(values){
        // console.log(values);
    };

    loadModule(conn_data){
        let { coreProps } = this.props;
        let self = this;
    
        const headers = {};
        if(coreProps.user_token){
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }
        axios.get(coreProps.engine_url+'/service/'+conn_data['service']+'/fetch_module?id='+conn_data['id'], {
          headers: headers
        })
          .then(function (response) {
            self.setState({ modules: response.data['modules'] });
            // modules
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
          .then(function () {
            // always executed
          });
    }

    select_module(module_data){
        let { nodeId } = this.state;
        
        this.setState({ module_selected: [module_data] });
        console.log(module_data);
    
        // if (this.props.updateByBpmnProperty) {
        //   this.props.updateByBpmnProperty(nodeId, {
        //     'selected_module': JSON.stringify(module_data),
        //   });
        // }
    }

    unselect_module(){
        // let { nodeId } = this.state;
        this.setState({ module_selected: [] });
    
        // if (this.props.updateByBpmnProperty) {
        //   this.props.updateByBpmnProperty(nodeId, {
        //     'selected_service': null,
        //   });
        // }
    }

    saveModuleSetting(values){
        let { service_selected, module_selected, connection_service_id } = this.state;

        let dataSet = {
            service_selected: service_selected[0],
            module_selected: module_selected[0],
            module_values: values,
            connection_service_id: connection_service_id,
        };
        if (this.props.updateByBpmnProperty) {
            this.props.updateByBpmnProperty(JSON.stringify(dataSet));
        }
    }

    customInputModuleChange(changedFields){
        console.log("changedFields");
        console.log(changedFields);
        let module_values = {}

        Object.keys(changedFields).map((key, index) => {
            module_values[key] = changedFields[key].value;
        })

        if(module_values.length > 0){
            this.setState({
                module_values: module_values
            });
        }
    }

    onOutputMappingChange(mapping_info) {
        // let { nodeId } = this.state;
    
        // if (this.props.updateByBpmnProperty) {
        //   this.props.updateByBpmnProperty(nodeId, {
        //     'output_mapping_type': mapping_info.type,
        //     'output_mapping_info': mapping_info.info,
        //   });
        // }
    }

    render() {
        let { service_selected, services, connection_service_id, modules, module_selected, output_mapping } = this.state;
        let { readonly, coreProps, workflow } = this.props;

        return (
            <>
                { service_selected.length > 0 && 
                    <Row>
                        <List
                            itemLayout="horizontal"
                            dataSource={service_selected}
                            renderItem={item => (
                                <List.Item 
                                actions={[
                                    // <Button onClick={() => alert(item.name)}>Connect</Button>, 
                                    <Button type="text" onClick={() => this.unselect_service()}><Icon type="delete" /></Button>
                                ]}
                                >
                                <List.Item.Meta
                                    avatar={<Avatar shape="square" size={64} src={item.logo} />}
                                    title={item.name}
                                    description={item.description}
                                />
                                </List.Item>
                            )}
                        />
                        <WrappedConnectionForm 
                            coreProps={coreProps}
                            service_selected={service_selected[0]}
                            connectionSelected={connection_service_id}
                            handleConnectionSave={this.handleConnectionSave.bind(this)}
                            loadModule={this.loadModule.bind(this)}
                            connectionSelectedChange={this.connectionSelectedChange.bind(this)}
                            readonly={module_selected.length > 0}
                        />
                        { module_selected.length > 0 && 
                            <>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={module_selected}
                                    renderItem={item => (
                                        <List.Item
                                            actions={[<Button type="text" onClick={() => this.unselect_module()}><Icon type="delete" /></Button>]}
                                        >
                                        <List.Item.Meta
                                            avatar={<Avatar shape="square" size={64} src={item.logo} />}
                                            title={item.name}
                                            description={item.description}
                                        />
                                        </List.Item>
                                    )}
                                />

                                <WrappedCustomForm 
                                    formItemLayout={formItemLayout}
                                    tailFormItemLayout={tailFormItemLayout}
                                    fields={module_selected[0].parameters}
                                    handleSubmit={this.saveModuleSetting.bind(this)}
                                    formButtons={[
                                        <Button type="text" onClick={() => this.unselect_module()}><Icon type="delete" /></Button>
                                    ]}
                                    onChange={this.customInputModuleChange.bind(this)}
                                />

                                <Form
                                    {...formItemLayout}
                                    name="basic"
                                    >
                                <InputMapper
                                    label={"Output Mapping"}
                                    variables={workflow.variables}
                                    type={"output"}
                                    onChange={this.onOutputMappingChange.bind(this)}
                                    mapping_info={output_mapping}
                                    readonly={readonly}
                                />
                                </Form>


                                {/* <Form {...formItemLayout}>
                                    <Form.Item
                                        label={
                                            <span>Connection&nbsp;</span>
                                        }
                                    >
                                        
                                    </Form.Item>
                                    <Form.Item {...tailFormItemLayout}>
                                        <Button type="primary" onClick={this.saveModuleSetting.bind(this)}>Save</Button>
                                        <Button onClick={this.handleShowEditConnection.bind(this)}>Edit</Button>
                                        <Button type="text" onClick={() => this.unselect_module()}><Icon type="delete" /></Button>
                                    </Form.Item>
                                </Form> */}

                                <Divider dashed />
                            </>
                        }
                        { module_selected.length == 0 && <div style={{height: "500px", "overflow": "auto"}}>
                            <Title level={4}><Text underline>Select Module</Text></Title>
                            <InfiniteScroll
                                pageStart={0}
                                // loadMore={loadFunc}
                                hasMore={true || false}
                                loader={<div className="loader" key={0}>Loading ...</div>}
                                useWindow={false}
                            >
                                { (modules.length > 0) && <List
                                    itemLayout="horizontal"
                                    dataSource={modules}
                                    renderItem={item => (
                                    <a 
                                        onClick={() => this.select_module(item)}
                                        >
                                        <List.Item 
                                        // actions={[<Button >Select</Button>]}
                                        >
                                        <List.Item.Meta
                                            avatar={<Avatar shape="square" size={64} src={item.logo} />}
                                            title={item.name}
                                            description={item.description}
                                        />
                                        </List.Item>
                                    </a>
                                    )}
                                /> }
                            </InfiniteScroll>
                        </div>
                        }
                    </Row> 
                }
                <Row > 
                    { service_selected.length == 0 && <Empty
                    image="/static/services/5337163.png"
                    // imageStyle={{
                    //   height: 60,
                    // }}
                    description={
                        <span>
                        Please <a type="primary" onClick={() => this.load_services()}>Select Services</a>
                        </span>
                    }>
                    <Button type="primary" onClick={() => this.load_services()}>Show ours Services</Button>
                    </Empty> 
                    }
                    
                    { (service_selected.length == 0 && services.length > 0) && <List
                    itemLayout="horizontal"
                    dataSource={services}
                    renderItem={item => (
                        <a onClick={() => this.select_service(item)}>
                        <List.Item 
                            actions={[<Button onClick={() => this.select_service(item)}>Connect</Button>]}
                        >
                            <List.Item.Meta
                            avatar={<Avatar shape="square" size={64} src={item.logo} />}
                            title={item.name}
                            description={item.description}
                            />
                        </List.Item>
                        </a>
                    )}
                    /> }
                </Row>
            </>
        )
    }
}
