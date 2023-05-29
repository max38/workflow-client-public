import React, { Component } from 'react';
import { Tabs, Row, Col, Button, Icon, Form, Input, Divider } from 'UIKit';
import GeneralElementInput from './utils/general-element-input';
import ServiceModule from './utils/service-module';
import { set_service_image_overlay } from '../../../../utils/bpmn_overlays.js';

const { TabPane } = Tabs;
const form_layout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

export default class ServiceTaskProperty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nodeId: '',
      nodeName: '',
      nodeType: null,
      currentElement: null,
      service_data: null,
      // services: [],
      // modules: [],
      // service_selected: [],
      // module_selected: [],
      // connection_service_id: 0,
    }
    if (props.currentElement) {
      let currentElement = props.currentElement;
      this.state.currentElement = currentElement;
      this.state.nodeId = currentElement.id;
      this.state.nodeName = currentElement.name;
      this.state.nodeType = currentElement.$type;

      if(currentElement && currentElement.$attrs){
        console.log("----->>> service_data");
        console.log(currentElement.$attrs.service_data);
        if(currentElement.$attrs.service_data){
          this.state.service_data = currentElement.$attrs.service_data;
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { currentElement } = nextProps;
    if (currentElement) {

      let service_data = null;
      if(currentElement && currentElement.$attrs){
        if(currentElement.$attrs.service_data){
          service_data = currentElement.$attrs.service_data;
        }
      }
      console.log("----->>> service_data");
      console.log(service_data);

      this.setState({
        currentElement: currentElement,
        nodeId: currentElement.id,
        nodeName: currentElement.name || '',
        nodeType: currentElement.$type,
        service_data: service_data,
      });
    }
  }

  componentDidMount() {
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

  set_service_image(logo_url){
    console.log(logo_url);
    let { nodeId } = this.state;
    let overlays = this.props.modeler.get('overlays');

    set_service_image_overlay(overlays, nodeId, logo_url);

    // let $rend = `<img src="`+logo_url+`" style="width: 40px; height: 40px; border-radius: 5px; border: 1px solid #555;">`;
    // overlays.add(nodeId, {
    //   position: {
    //     top: -10,
    //     left: -10
    //   },
    //   html: $rend
    // });
  }

  remove_service_image(){
    let { nodeId } = this.state;
    let overlays = this.props.modeler.get('overlays');
    overlays.remove({ element: nodeId });
  }

  

  render() {
    const style_tab_pane = { paddingTop: 0, paddingLeft: 10, paddingRight: 10 };

    let { nodeName, nodeId, currentElement, service_data } = this.state;
    let { readonly, coreProps, workflow } = this.props;

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
        <TabPane tab="Services" key="2" style={style_tab_pane}>
          <ServiceModule 
            coreProps={coreProps}
            service_data={service_data}
            workflow={workflow}
            set_service_image={this.set_service_image.bind(this)}
            remove_service_image={this.remove_service_image.bind(this)}
            updateByBpmnProperty={(values) => this.updateByBpmnProperty(nodeId, {'service_data': values})}
          />
        </TabPane>
      </Tabs>
    );
  }
}
