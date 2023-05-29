import React, { Component } from 'react';
import { Tabs, Row, Col, Select, Form, Button } from 'UIKit';

import GeneralElementInput from './utils/general-element-input';
import InputMapper from './utils/input-mapper';

import AceEditor from "react-ace";

const { Option } = Select;
const { TabPane } = Tabs;

const form_layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};


export default class ScriptTaskProperty extends Component {
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
      scriptInfo: ""
    }
    if (props.currentElement) {
      let currentElement = props.currentElement;
      this.state.currentElement = currentElement;
      this.state.nodeId = currentElement.id;
      this.state.nodeName = currentElement.name;
      this.state.nodeType = currentElement.$type;

      if(currentElement && currentElement.$attrs){
        this.state.scriptInfo = currentElement.$attrs.script_info;
      }
    }

  }

  componentWillReceiveProps(nextProps) {
    const { currentElement } = nextProps;
    if (currentElement) {
      // console.log("nextProps");
      // console.log(nextProps);
      let { scriptInfo } = this.state;

      if(currentElement && currentElement.$attrs){
        scriptInfo = currentElement.$attrs.script_info;
      }
      this.setState({
        currentElement: currentElement,
        nodeId: currentElement.id,
        nodeName: currentElement.name || '',
        nodeType: currentElement.$type,
        scriptInfo: scriptInfo
        // eventType: currentElement.eventDefinitions != null
        //   && currentElement.eventDefinitions.length > 0
        //   ? currentElement.eventDefinitions[0].$type : null,
      });
    }
  }

  updateByBpmnProperty(nodeId, newProps) {
    let { name, id } = newProps;

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, newProps);
    }
  }

  onInputMappingChange(mapping_info){
    let { nodeId } = this.state;

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'input_mapping_type': mapping_info.type,
        'input_mapping_info': mapping_info.info,
      });
    }
  }

  onOutputMappingChange(mapping_info){
    let { nodeId } = this.state;

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'output_mapping_type': mapping_info.type,
        'output_mapping_info': mapping_info.info,
      });
    }
  }

  onScriptInfoChange = (value) => {
    let { nodeId } = this.state;

    let self = this;
    this.setState({ scriptInfo: value }, () => {
      self.updateByBpmnProperty(nodeId, {
        'script_info': value,
      });
    });
  }

  getExample(){
    let { workflow } = this.props;
    let scriptInfo = "";
    let ex_str = "";

    // Python
        let function_name = "task";
        let param_name = "job_data";

        workflow.variables.forEach(element => {
            ex_str += '\t\t"' + element.variable + '": '+param_name+'["' + element.variable + '"],\n';
        });

        scriptInfo = 'def ' + function_name + '('+param_name+'): \n\t# Function name must be "task".\n\treturn_data = {\n' + ex_str + '\t}\n\treturn return_data\n';

    let self = this;
    this.setState({ scriptInfo: scriptInfo }, () => {
        let { nodeId } = self.state;
        self.updateByBpmnProperty(nodeId, {
          'script_info': scriptInfo,
        });
    });
}


  render() {
    const style_tab_pane = { paddingTop: 0, paddingLeft: 10, paddingRight: 10 };

    let { nodeName, nodeId, currentElement, scriptInfo } = this.state;
    let { workflow, readonly } = this.props;

    let input_mapping = null;
    if(currentElement && currentElement.$attrs){
      input_mapping = {
        type: currentElement.$attrs.input_mapping_type,
        info: currentElement.$attrs.input_mapping_info
      };
    }
    let output_mapping = null;
    if(currentElement && currentElement.$attrs){
      output_mapping = {
        type: currentElement.$attrs.output_mapping_type,
        info: currentElement.$attrs.output_mapping_info
      };
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
                    Language&nbsp;
                          </span>
                }
              >
                <Select
                  // style={{ width: 120 }}
                  value={"python"}
                // onChange={this.onVersionChange}
                  disabled={readonly}
                >
                  <Option value="python">Python</Option>
                </Select>
                {!readonly && <Button type="default" size="small" onClick={this.getExample.bind(this)}>Example</Button>}
              </Form.Item>
              <Form.Item>
                  <AceEditor
                      mode={"python"}
                      fontSize={15}
                      height='60vh'
                      readOnly={readonly}
                      value={scriptInfo}
                      onChange={this.onScriptInfoChange.bind(this)}
                      name="UNIQUE_ID_OF_DIV"
                  // editorProps={{ $blockScrolling: true }}
                  />
              </Form.Item>
            </Form>
            </Row>
          </TabPane>
        <TabPane tab="Input / Output" key="3" style={style_tab_pane}>
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
