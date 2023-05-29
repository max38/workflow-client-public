import React, { Component } from 'react';
import { Tabs, Row, Col } from 'UIKit';
import GeneralElementInput from './utils/general-element-input';

const { TabPane } = Tabs;

export default class ElementProperty extends Component {
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
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
              />
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    );
  }
}
