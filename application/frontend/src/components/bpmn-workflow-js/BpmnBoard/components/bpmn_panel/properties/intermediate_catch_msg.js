import React, { Component } from 'react';
import { Tabs, Row, Col, Form, Select, Input, Button } from 'UIKit';
import GeneralElementInput from './utils/general-element-input';
import InputMapper from './utils/input-mapper';
import AceEditor from "react-ace";

const { TabPane } = Tabs;
const { Option } = Select;

const form_layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

const form_message_layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

export default class IntermediateCatchMsgProperty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nodeId: '',
      nodeName: '',
      nodeType: null,
      currentElement: null,
    }
    if (props.currentElement) {
      let currentElement = props.currentElement;
      this.state.currentElement = currentElement;
      this.state.nodeId = currentElement.id;
      this.state.nodeName = currentElement.name;
      this.state.nodeType = currentElement.$type;

      if(currentElement.$attrs){
        this.state.reference_mapping_info = currentElement.$attrs.reference_mapping_info;
        this.state.reference_mapping_method = currentElement.$attrs.reference_mapping_method ? currentElement.$attrs.reference_mapping_method : "0";
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { currentElement } = nextProps;
    if (currentElement) {
      this.setState({
        currentElement: currentElement,
        nodeId: currentElement.id,
        nodeName: currentElement.name || '',
        nodeType: currentElement.$type,
      });
    }
  }

  updateByBpmnProperty(nodeId, newProps){
    let { name, id } = newProps;

    if(name){
      this.setState({ nodeName: name });
    }
    if(id){
      this.setState({ nodeId: id });
    }

    if(this.props.updateByBpmnProperty){
      this.props.updateByBpmnProperty(nodeId, newProps);
    }
  }


  onMessageMappingChange(mapping_info) {
    let { nodeId } = this.state;

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'message_mapping_type': mapping_info.type,
        'message_mapping_info': mapping_info.info,
      });
    }
  }

  onReferenceMessageMethodChange(value){
    let { nodeId } = this.state;

    this.setState({
      reference_mapping_method: value,
    });

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'reference_mapping_method': value,
      });
    }
  }

  onReferenceMappingInfoChange(value){
    let { nodeId } = this.state;

    this.setState({
      reference_mapping_info: value,
    });

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'reference_mapping_info': value,
      });
    }
  }

  getReferenceMappingInfoExample(){
    let { workflow } = this.props;
    let ex_str = "";
    let param_name = "job_data";

    if(workflow && workflow.variables){
      workflow.variables.forEach(element => {
          ex_str += '\t\t"' + element.variable + '": '+param_name+'["' + element.variable + '"],\n';
      });
    }
    let mappingInfo = 'def reference(job_key, '+param_name+'): \n\t# Function name must be "reference".\n\tmapped_data = {\n' + ex_str + '\t}\n\treturn "XXXX" # Return Value must be string\n';
    this.onReferenceMappingInfoChange(mappingInfo);
  }

  render() {
    const style_tab_pane = { paddingTop: 0, paddingLeft: 10, paddingRight: 10 };

    let { nodeName, nodeId, currentElement, reference_mapping_method, reference_mapping_info } = this.state;
    let { workflow, coreProps, readonly } = this.props;


    let message_mapping = null;
    let $reference_mapping = null;

    if (currentElement && currentElement.$attrs) {
      message_mapping = {
        type: currentElement.$attrs.message_mapping_type,
        info: currentElement.$attrs.message_mapping_info
      };
    }

    if(reference_mapping_method == "2"){
      $reference_mapping = <>
        {!readonly && <Form.Item
          label={
              <span>
                  &nbsp;
                </span>
          }
        >
          <Button type="default" size="small" onClick={this.getReferenceMappingInfoExample.bind(this)}>Example</Button>
        </Form.Item>}
        <p>
        This function will be find reference when message Submitted to Workflow.
        </p>
        <Form.Item>
          <AceEditor
              mode="python"
              // theme="github"
              fontSize={15}
              height='30vh'
              value={reference_mapping_info}
              onChange={this.onReferenceMappingInfoChange.bind(this)}
              name="UNIQUE_ID_OF_DIV"
              readOnly={readonly}
          // editorProps={{ $blockScrolling: true }}
          />
        </Form.Item>
      </>
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
        <TabPane tab="Message" key="2" style={style_tab_pane}>
          <Row>
            <Col>
              <Form.Item
                label={
                  <span>
                    Message Event URL&nbsp;
                          </span>
                }
              >
                <Input addonBefore="POST : " value={coreProps.engine_url + "/workflow/" + workflow.workflow_key + "/message/" + nodeId + "/<Reference ID>"} readOnly />
              </Form.Item>
            </Col>
            <p>
            The Reference will be use after this workflow Submitted data to Service and matching callback data to job.
            </p>
            <Form
              {...form_message_layout}
            >
              <Form.Item
                label={
                  <span>
                    Reference Mapping&nbsp;
                          </span>
                }
              >
                <Select
                  value={reference_mapping_method}
                  onChange={this.onReferenceMessageMethodChange.bind(this)}
                  disabled={readonly}
                >
                  <Option value="0">Job Key (Default)</Option>
                  <Option value="1">Job ID</Option>
                  <Option value="2">Submitted Response</Option>
                </Select>
              </Form.Item>
              {$reference_mapping}
            </Form>
          </Row>
        </TabPane>
        <TabPane tab="Mapping" key="4" style={style_tab_pane}>
          <Row >
            <Form
              {...form_layout}
              name="basic"
            >
              <InputMapper
                label={"Message Mapping"}
                variables={workflow.variables}
                type={"data"}
                onChange={this.onMessageMappingChange.bind(this)}
                mapping_info={message_mapping}
                readonly={readonly}
              />
            </Form>
          </Row>
        </TabPane>
      </Tabs>
    );
  }
}
