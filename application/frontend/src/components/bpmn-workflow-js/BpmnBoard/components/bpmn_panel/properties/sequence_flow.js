import React, { Component } from 'react';
import { Tabs, Row, Col, Select, Form, Input, Button } from 'UIKit';
import GeneralElementInput from './utils/general-element-input';

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

export default class SequenceFlowProperty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nodeId: '',
      nodeName: '',
      nodeType: null,
      currentElement: null,
      condition_script_type: '-',
      condition_script_info: "",
    }
    if (props.currentElement) {
      let currentElement = props.currentElement;
      this.state.currentElement = currentElement;
      this.state.nodeId = currentElement.id;
      this.state.nodeName = currentElement.name;
      this.state.nodeType = currentElement.$type;

      if(currentElement.$attrs){
        this.state.condition_script_type = currentElement.$attrs.condition_script_type;
        this.state.condition_script_info = currentElement.$attrs.condition_script_info;
        if(!this.state.condition_script_type){
          this.state.condition_script_type = "-";
        }
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

      if(currentElement.$attrs){
        let condition_script_type = "-";
        if(currentElement.$attrs.condition_script_type){
          condition_script_type = currentElement.$attrs.condition_script_type;
        }
        this.setState({
          condition_script_type: condition_script_type,
          condition_script_info: currentElement.$attrs.condition_script_info,
        });
      }
    }
  }

  updateByBpmnProperty(nodeId, newProps){
    let { name, id } = newProps;
    let { condition_script_type } = this.state;

    if(condition_script_type != '-' && (!name || !name.includes("Filter"))){
      name = "Filter - " + name;
      newProps.name = name;
    }

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

  onConditionTypeChange(value){
    this.setState({
      condition_script_type: value,
    }, () => {
      this.onConditionInfoChange();
    });
  }

  getExample(){
    let condition_script_info = "";
    let { condition_script_type } = this.state;
    let ex_str = "";

    if (condition_script_type == "expression") {

        // condition_script_info = '{\n' + ex_str + '}';

    } else if (condition_script_type == "python") {
        let function_name = "filter";
        let param_name = "job_data";

        condition_script_info = 'def ' + function_name + '('+param_name+'): \n\t# Function name must be "filter".\n\treturn True\n';
    }
    this.setState({ condition_script_info: condition_script_info }, () => {
        this.onConditionInfoChange();
    });
  }

  onConditionInfoChange(){
    let { nodeId, nodeName, condition_script_type, condition_script_info } = this.state;

    if(condition_script_type != '-'){
      this.updateByBpmnProperty(nodeId, { 
        name: nodeName,
        condition_script_type: condition_script_type,
        condition_script_info: condition_script_info,
      });
    }
  }

  onConditionScriptChange = (value) => {
    this.setState({ condition_script_info: value }, () => {
        this.onConditionInfoChange();
    });
  }

  render() {
    const style_tab_pane = { paddingTop: 0, paddingLeft: 10, paddingRight: 10 };

    let { nodeName, nodeId, currentElement, condition_script_type, condition_script_info } = this.state;
    let input_condition_element = null;
    let { readonly } = this.props;
    
    if(condition_script_type == "expression"){
      input_condition_element = <Form.Item
          label={
            <span>Expression&nbsp;</span>
          }>
          <Input value={condition_script_info} disabled={readonly} />
      </Form.Item>
    }else if(condition_script_type == "python"){
      input_condition_element = <Form.Item
          label={
            <span>Python Script&nbsp;</span>
          }>
          {!readonly && <Button type="default" size="small" onClick={this.getExample.bind(this)}>Example</Button>}
          <AceEditor
              mode="python"
              // theme="github"
              fontSize={15}
              height='30vh'
              value={condition_script_info}
              onChange={this.onConditionScriptChange.bind(this)}
              name="UNIQUE_ID_OF_DIV"
              readonly={readonly}
          // editorProps={{ $blockScrolling: true }}
          />
      </Form.Item>
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
        <TabPane tab="Condition" key="2" style={style_tab_pane}>
        <Row >
            {/* style={{overflowY: "scroll"}} */}
            <Form
              {...form_layout}
              name="basic"
            >
              <Form.Item
                label={
                  <span>Condition Type&nbsp;</span>
                }
              >
                <Select
                  value={condition_script_type}
                  onChange={this.onConditionTypeChange.bind(this)}
                  disabled={readonly}
                >
                  <Option value="-"> - </Option>
                  <Option value="python">Python Script</Option>
                  {/* <Option value="expression">Expression</Option> */}
                </Select>
              </Form.Item>
              {input_condition_element}
            </Form>
          </Row>
        </TabPane>
      </Tabs>
    );
  }
}
