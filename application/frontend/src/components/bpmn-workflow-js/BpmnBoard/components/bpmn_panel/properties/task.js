import React, { Component } from 'react';
import { Tabs, Row, Col, Select, Form, Input, Icon, Switch, Button } from 'UIKit';

import AceEditor from "react-ace";

import GeneralElementInput from './utils/general-element-input';
import TableInput from '../../../../utils/table_input';
import InputMapper from './utils/input-mapper';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const form_layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

const form_async_layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};


export default class TaskProperty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nodeId: '',
      nodeName: '',
      nodeType: null,
      eventType: null,
      isAsyncTask: false,
      toCreateForm: false,
      currentElement: null,
      service_url: null,
      service_method: null,
      service_headers: null,
    }
    if (props.currentElement) {
      let currentElement = props.currentElement;
      this.state.currentElement = currentElement;
      this.state.nodeId = currentElement.id;
      this.state.nodeName = currentElement.name;
      this.state.nodeType = currentElement.$type;

      if(currentElement.$attrs){
        if(currentElement.$attrs.service_method){
          this.state.service_method = currentElement.$attrs.service_method;
        }
        this.state.service_url = currentElement.$attrs.service_url;
        this.state.service_headers = currentElement.$attrs.service_headers;
        this.state.service_asynchronous = currentElement.$attrs.service_asynchronous;
        this.state.service_async_mappingInfo = currentElement.$attrs.service_async_mappingInfo;
        this.state.service_async_mapmethod = currentElement.$attrs.service_async_mapmethod ? currentElement.$attrs.service_async_mapmethod : "0";
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { currentElement } = nextProps;
    if (currentElement) {
      // console.log("nextProps");
      // console.log(nextProps);
      let service_method = null;
      if(currentElement.$attrs.service_method){
        service_method = currentElement.$attrs.service_method;
      }

      this.setState({
        currentElement: currentElement,
        nodeId: currentElement.id,
        nodeName: currentElement.name || '',
        nodeType: currentElement.$type,
        service_method: service_method,
        service_url: currentElement.$attrs.service_url,
        service_headers: currentElement.$attrs.service_headers,
        service_asynchronous: currentElement.$attrs.service_asynchronous,
        service_async_mapmethod: currentElement.$attrs.service_async_mapmethod ? currentElement.$attrs.service_async_mapmethod : "1",
        service_async_mappingInfo: currentElement.$attrs.service_async_mappingInfo,
      });
    }
  }

  updateByBpmnProperty(nodeId, newProps) {
    let { name, id } = newProps;

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, newProps);
    }
  }

  onInputMappingChange(mapping_info) {
    let { nodeId } = this.state;

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'input_mapping_type': mapping_info.type,
        'input_mapping_info': mapping_info.info,
      });
    }
  }

  onOutputMappingChange(mapping_info) {
    let { nodeId } = this.state;

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'output_mapping_type': mapping_info.type,
        'output_mapping_info': mapping_info.info,
      });
    }
  }

  onServiceUrlChange(event){
    let { nodeId } = this.state;
    
    this.setState({
      service_url: event.target.value,
    });

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'service_url': event.target.value,
      });
    }
  }

  onAsynchronousChange(value, event){
    let { nodeId } = this.state;
    
    this.setState({
      service_asynchronous: value,
    });

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'service_asynchronous': value,
      });
    }
  }

  onServiceMethodChange(value){
    let { nodeId } = this.state;

    this.setState({
      service_method: value,
    });

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'service_method': value,
      });
    }
  }

  onServiceAsyncMethodChange(value){
    let { nodeId } = this.state;

    this.setState({
      service_async_mapmethod: value,
    });

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'service_async_mapmethod': value,
      });
    }
  }

  onServiceAsyncMappingChange(value){
      let { nodeId } = this.state;
  
      this.setState({
        service_async_mappingInfo: value,
      });
  
      if (this.props.updateByBpmnProperty) {
        this.props.updateByBpmnProperty(nodeId, {
          'service_async_mappingInfo': value,
        });
      }
  }

  onServiceHeadersChange(value){
    let { nodeId } = this.state;
    let json_value = JSON.stringify(value);

    this.setState({
      service_headers: json_value,
    });

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'service_headers': json_value,
      });
    }
  }

  getAsyncMappingInfoExample(){
    let { workflow } = this.props;
    let ex_str = "";
    let param_name = "submitted_response";

    if(workflow && workflow.variables){
      workflow.variables.forEach(element => {
          ex_str += '\t\t"' + element.variable + '": '+param_name+'["' + element.variable + '"],\n';
      });
    }
    let mappingInfo = 'def reference(job_key, '+param_name+'): \n\t# Function name must be "reference".\n\tmapped_data = {\n' + ex_str + '\t}\n\treturn "XXXX" # Return Value must be string\n';
    this.onServiceAsyncMappingChange(mappingInfo);
  }


  render() {
    const style_tab_pane = { paddingTop: 0, paddingLeft: 10, paddingRight: 10 };

    let { nodeName, nodeId, currentElement, service_method, service_url, service_headers, 
      service_asynchronous, service_async_mapmethod, service_async_mappingInfo } = this.state;
    let { workflow, coreProps, readonly } = this.props;

    let input_mapping = null;
    let output_mapping = null;
    let $Asynchronous = null;

    if (currentElement && currentElement.$attrs) {
      input_mapping = {
        type: currentElement.$attrs.input_mapping_type,
        info: currentElement.$attrs.input_mapping_info
      };
      
      output_mapping = {
        type: currentElement.$attrs.output_mapping_type,
        info: currentElement.$attrs.output_mapping_info
      };
    }
    if(service_headers){
      service_headers = JSON.parse(service_headers);
    }

    if(service_asynchronous){
      let $Async_submitted_res_mapping = null;
      if(service_async_mapmethod == "2"){
        $Async_submitted_res_mapping = <>
          {!readonly && <Form.Item
            label={
                <span>
                    &nbsp;
                  </span>
            }
          >
            <Button type="default" size="small" onClick={this.getAsyncMappingInfoExample.bind(this)}>Example</Button>
          </Form.Item>}
          <p>
          This function will be called after request Submitted data to Service.
          </p>
          <Form.Item>
            <AceEditor
              mode="python"
              // theme="github"
              readOnly={readonly}
              fontSize={15}
              height='30vh'
              value={service_async_mappingInfo}
              onChange={this.onServiceAsyncMappingChange.bind(this)}
              name="UNIQUE_ID_OF_DIV"
            // editorProps={{ $blockScrolling: true }}
            />
          </Form.Item>
        </>
      }

      $Asynchronous = <TabPane tab="Asynchronous" key="3" style={style_tab_pane}>
          <Row >
            <Col>
              <Form.Item
                label={
                  <span>
                    Callback URL&nbsp;
                          </span>
                }
              >
                <Input addonBefore="POST : " value={coreProps.engine_url + "/workflow/" + workflow.workflow_key + "/" + nodeId + "/<Reference ID>/response"} readOnly />
              </Form.Item>
            </Col>
            <p>
            The Reference will be use after this workflow Submitted data to Service and matching callback data to job.
            </p>
            <Form
              {...form_async_layout}
            >
              <Form.Item
                label={
                  <span>
                    Reference Mapping&nbsp;
                          </span>
                }
              >
                <Select
                  value={service_async_mapmethod}
                  onChange={this.onServiceAsyncMethodChange.bind(this)}
                  disabled={readonly}
                >
                  <Option value="0">Job Key (Default)</Option>
                  <Option value="1">Job ID</Option>
                  <Option value="2">Submitted Response</Option>
                </Select>
              </Form.Item>
              {$Async_submitted_res_mapping}
            </Form>
          </Row>
      </TabPane>;
    }

    return (
      <Tabs type="card">
        <TabPane tab="General" key="1" style={style_tab_pane}>
          <Row>
            <Col>
              <GeneralElementInput
                nodeId={nodeId}
                nodeName={nodeName}
                currentElement={currentElement}
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
              />
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Task" key="2" style={style_tab_pane}>
          <Row >
            {/* style={{overflowY: "scroll"}} */}
            <Form
              {...form_layout}
              name="basic"
            >
              <Form.Item
                label={
                  <span>
                    Asynchronous&nbsp;
                          </span>
                }
              >
                <Switch
                  checked={service_asynchronous}
                  onChange={this.onAsynchronousChange.bind(this)}
                  checkedChildren={<Icon type="check" />}
                  unCheckedChildren={<Icon type="close" />}
                  disabled={readonly}
                />
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    Service Type&nbsp;
                          </span>
                }
              >
                <Select
                  value={"1"}
                  disabled={readonly}
                >
                  <Option value="1">RESTful API</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="method"
                label="Method"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  style={{
                    width: 100,
                  }}
                  value={service_method}
                  onChange={this.onServiceMethodChange.bind(this)}
                  disabled={readonly}
                >
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                  <Option value="PUT">PUT</Option>
                  <Option value="PATCH">PATCH</Option>
                  <Option value="DELETE">DELETE</Option>
                  <Option value="OPTIONS">OPTIONS</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="url"
                label="URL"
                rules={[
                  {
                    required: true,
                    message: 'Please give URL service!',
                  },
                ]}
              >
                <Input
                  style={{
                    width: '100%',
                  }}
                  disabled={readonly}
                  placeholder="https://api.domain.com/post"
                  value={service_url}
                  onChange={this.onServiceUrlChange.bind(this)}
                />
              </Form.Item>
              <Form.Item
                label="Header"
              >
              </Form.Item>
              
              <TableInput 
                value={service_headers}
                default_data_list={[
                  {
                      id: 1,
                      key: "Content-Type",
                      value: "application/json"
                  }
                ]}
                onChange={this.onServiceHeadersChange.bind(this)}
                readonly={readonly}
              />
            </Form>
          </Row>
        </TabPane>
        {$Asynchronous}
        <TabPane tab="Input / Output" key="4" style={style_tab_pane}>
          <Row >
            {/* style={{overflowY: "scroll"}} */}
            <Form
              {...form_layout}
              name="basic"
            >
              <InputMapper
                label={"Input Mapping"}
                variables={workflow.variables}
                type={"input"}
                onChange={this.onInputMappingChange.bind(this)}
                mapping_info={input_mapping}
                readonly={readonly}
              />
              <InputMapper
                label={"Output Mapping"}
                variables={workflow.variables}
                type={"output"}
                onChange={this.onOutputMappingChange.bind(this)}
                mapping_info={output_mapping}
                readonly={readonly}
              />
            </Form>
          </Row>
        </TabPane>
      </Tabs>
    );
  }
}
