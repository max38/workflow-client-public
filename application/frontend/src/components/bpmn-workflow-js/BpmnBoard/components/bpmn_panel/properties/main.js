import React, { Component } from 'react';
import { Form, Icon, Button, Input, Row, Col, Tabs, Checkbox, Select } from 'UIKit';
import ReactJson from 'react-json-view';
import TableVariableInput from './utils/table-variable-input';
import AceEditor from "react-ace";

const { TabPane } = Tabs;
const { Option } = Select;


const form_layout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
  },
};


export default class MainBpmnProperty extends Component {

  constructor(props) {
    super(props);

    this.state = {
      workflow: props.workflow,
      currentElement: null,
      show_example_payload: {},
      job_ref_method: "1",
      wf_key_need_auto: false ? props.workflow.workflow_key : true,
    }

    if (props.currentElement) {
      this.state.currentElement = props.currentElement;
    }
  }

  componentDidMount() {
    this.updateVariableList(this.state.workflow.variables);
  }

  updateVariableList = (variable_list) => {
    let example_payload = {};
    let value_list = [...new Set(variable_list)];
    value_list.forEach(element => {
      example_payload[element.variable] = element.default ? element.default : 'xxxxxx';
    });

    let workflow_re = { ...this.state.workflow, ...{ variables: value_list } }

    this.setState({ workflow: workflow_re, show_example_payload: example_payload });

    this.props.parentCallback(workflow_re);
  }

  handle_workflow_name_change(event) {
    if(!this.props.readonly){
      let { workflow, wf_key_need_auto } = this.state;
      workflow.name = event.target.value;
      if(wf_key_need_auto){
        workflow.workflow_key = workflow.name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/[^\w ]+/g,'').replace(/ +/g,'-');
      }
      this.setState({ workflow: workflow });

      this.props.parentCallback(workflow);
    }
  }

  handle_workflow_key_change(event) {
    if(!this.props.readonly){
      let workflow = this.state.workflow;
      let wf_key_need_auto = false;
      workflow.workflow_key = event.target.value;

      if(!workflow.workflow_key){
        wf_key_need_auto = true;
      }

      this.setState({ workflow: workflow, wf_key_need_auto: wf_key_need_auto });

      this.props.parentCallback(workflow);
    }
  }

  onJobRefMethodChange = (value) => {
      this.setState({ job_ref_method: value }, () => {
          // this.onChange();
      });
  }

  render() {
    const style_tab_pane = { paddingTop: 0, paddingLeft: 10, paddingRight: 10 };
    const { coreProps } = this.props;
    let { job_ref_method, workflow } = this.state;
    let create_job_url = "-";
    let script_generate = <></>;

    if(workflow.workflow_key){
      create_job_url = coreProps.engine_url + "/workflow/" + workflow.workflow_key + "/run";
    }

    if(job_ref_method == "2"){
      script_generate = <Form.Item>
      <AceEditor
          mode="python"
          // theme="github"
          fontSize={15}
          height='30vh'
          // value={mappingInfo}
          // onChange={this.onMappingChange.bind(this)}
          name="UNIQUE_ID_OF_DIV"
      // editorProps={{ $blockScrolling: true }}
      />
    </Form.Item>;
    }

    return (
      <Tabs type="card">
        <TabPane tab="General" key="1" style={style_tab_pane}>
          <Row>
            <Col>
              <Form.Item
                label={
                  <span>
                    Workflow Name&nbsp;
                          </span>
                }
              >
                <Input value={workflow.name} onChange={this.handle_workflow_name_change.bind(this)} />
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    Workflow Key&nbsp;
                          </span>
                }
              >
                <Input value={workflow.workflow_key} onChange={this.handle_workflow_key_change.bind(this)} />
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    Create Job URL&nbsp;
                          </span>
                }
              >
                <Input addonBefore="POST : " value={create_job_url} readOnly />
              </Form.Item>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Job Variable" key="2" style={style_tab_pane}>
              {!this.props.readonly && <TableVariableInput value={workflow.variables} onChange={value => this.updateVariableList(value)} /> }
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
            src={this.state.show_example_payload}
            name={false}
            displayDataTypes={false}
          />
        </TabPane>
        {/* <TabPane tab="Job Reference ID" key="3" style={style_tab_pane}>
          <Row>
            <Form
              {...form_layout}
            >
              <Form.Item
                label={
                  <span>
                    Job Reference ID Method&nbsp;
                          </span>
                }
              >
                <Select
                  value={job_ref_method}
                  onChange={this.onJobRefMethodChange.bind(this)}
                >
                  <Option value="1">System Generating</Option>
                  <Option value="2">Script Generating</Option>
                </Select>
              </Form.Item>
              { script_generate }
            </Form>
          </Row>
        </TabPane> */}
      </Tabs>
    );
  }
}
