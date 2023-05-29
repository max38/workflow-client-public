import React, { Component } from 'react';
import { Form, Icon, Input, Row, Col, Tabs } from 'UIKit';
import GeneralElementInput from './utils/general-element-input';

const { TabPane } = Tabs;

const form_layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};


export default class StartProperty extends Component {
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

  render() {
    const style_tab_pane = { paddingTop: 0, paddingLeft: 10, paddingRight: 10 };
    let { nodeName, nodeId, currentElement } = this.state;
    let { readonly } = this.props;

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
        <TabPane tab="Tab 2" key="2" style={style_tab_pane}>
          Content of Tab Pane 2
                </TabPane>
        <TabPane tab="Tab 3" key="3" style={style_tab_pane}>
          Content of Tab Pane 3
                </TabPane>
      </Tabs>
    );
  }
}
