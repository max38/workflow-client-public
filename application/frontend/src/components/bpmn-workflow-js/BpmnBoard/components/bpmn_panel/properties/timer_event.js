import React, { Component } from 'react';
import { Form, Icon, Input, Select, Row, Col, Tabs } from 'UIKit';
import GeneralElementInput from './utils/general-element-input';
import PeriodicTimeInput from './utils/periodic-time-input';
import InputStartActivity from './utils/input-start-activity';


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


export default class TimerProperty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nodeId: 'TEST',
      nodeName: '',
      nodeType: null,
      eventType: null,
      // isAsyncTask: false,
      // toCreateForm: false,
      currentElement: null,
    }

    if (props.currentElement) {
      let currentElement = props.currentElement;
      this.state = {
        nodeId: props.currentElement.id,
        nodeName: props.currentElement.name,
        nodeType: props.currentElement.$type,
        eventType: props.currentElement.eventDefinitions != null
          && props.currentElement.eventDefinitions.length > 0
          ? props.currentElement.eventDefinitions[0].$type : null,
        // isAsyncTask: false,
        // toCreateForm: false,
        currentElement: props.currentElement,
      }

      if(currentElement.$attrs){
        this.state.time_def_type = currentElement.$attrs.time_def_type ? currentElement.$attrs.time_def_type : "0";
        this.state.time_def_value = currentElement.$attrs.time_def_value ? currentElement.$attrs.time_def_value : "0";
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
        // eventType: currentElement.eventDefinitions != null
        //   && currentElement.eventDefinitions.length > 0
        //   ? currentElement.eventDefinitions[0].$type : null,
      });
    }
  }

  onPeriodicTimeChange(type, value){
    let { nodeId } = this.state;
    this.setState({
      time_def_type: type,
      time_def_value: value,
    });

    if (this.props.updateByBpmnProperty) {
        this.props.updateByBpmnProperty(nodeId, {
          'time_def_type': type,
          'time_def_value': value
        });
    }
  }

  onJobMappingChange(job_mapping_info) {
    let { nodeId } = this.state;

    if (this.props.updateByBpmnProperty) {
      this.props.updateByBpmnProperty(nodeId, {
        'job_mapping_type': job_mapping_info.type,
        'job_mapping_info': job_mapping_info.info,
      });
    }
  }

  render() {
    const style_tab_pane = { paddingTop: 0, paddingLeft: 10, paddingRight: 10 };
    let { nodeName, nodeId, currentElement, time_def_type, time_def_value } = this.state;
    let { workflow, coreProps, readonly } = this.props;
    let job_mapping = null;

    if (currentElement && currentElement.$attrs) {
      job_mapping = {
        type: currentElement.$attrs.job_mapping_type,
        info: currentElement.$attrs.job_mapping_info
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
                updateByBpmnProperty={this.props.updateByBpmnProperty}
                readonly={readonly}
              />
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Timer" key="2" style={style_tab_pane}>
          <PeriodicTimeInput 
            type={time_def_type}
            value={time_def_value}
            onChange={this.onPeriodicTimeChange.bind(this)}
            readonly={readonly}
          />
        </TabPane>
        <TabPane tab="Update Job Variable" key="3" style={style_tab_pane}>

        <Row > 
            {/* style={{overflowY: "scroll"}} */}
            <Form
              {...form_layout}
              name="basic"
            >
              <InputStartActivity 
                label={"Job Veriable"}
                variables={workflow.variables}
                onChange={this.onJobMappingChange.bind(this)}
                mapping_info={job_mapping}
                python_return_var='updated_data'
                python_param='job_data'
                readonly={readonly}
              />
            </Form>
          </Row>
        </TabPane>
      </Tabs>
    );
  }
}
