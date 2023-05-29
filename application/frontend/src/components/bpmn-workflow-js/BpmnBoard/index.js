import React, { Component } from 'react';
import { Link } from "react-router-dom";
import $ from 'jquery';

import { Layout, Icon, Button, message, Typography, Tag, Row, Col } from 'UIKit';

import { Box, Layer, Text } from 'grommet';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import FileControls from "./components/FileControls";
import EditingTools from './components/EditingTools';
import BpmnPanel from './components/bpmn_panel';


import ConfigResourceManagement from '../utils/config_resources_management';
import { set_service_task_image_element } from '../utils/bpmn_overlays.js';


// import propertiesPanelModule from 'bpmn-js-properties-panel';
// import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
// import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';

import download from 'downloadjs';
import { json2xml, xml2json } from 'xml-js';
import axios from "axios";

// import diagramXML from './resources/newDiagram.bpmn';
import './css/app.css';

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-python";

const { Sider, Content } = Layout;
const { Title } = Typography;


let scale = 1;
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'


export default class index extends Component {

  constructor(props) {
    super(props);
    this.state = {
      canvasStyle: { height: 0 },
      workflow: { name: '', workflow_key: '', workflow_id: 0, version: 0, variables: [] },
      collapsed: true,
      resource_collapsed: true,
      is_autocollapsed: false,
      currentElement: null,
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
//    this.handle_workflow_input_change = this.handle_workflow_input_change.bind(this);
  }

  toggle_sidebar = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  toggle_resource_sidebar = () => {
    this.setState({
      resource_collapsed: !this.state.resource_collapsed,
    });
  };

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);

    this.modeler = new BpmnModeler({
      container: '#canvas',
      // propertiesPanel: {
      //   parent: '#js-properties-panel'
      // },
      // additionalModules: [
      //   propertiesPanelModule,
      //   propertiesProviderModule
      // ],
      // // needed if you'd like to maintain camunda:XXX properties in the properties panel
      // moddleExtensions: {
      //   camunda: camundaModdleDescriptor
      // }
    });

    const eventBus = this.modeler.get('eventBus');
    eventBus.on('element.click', (event) => {
      const currentElement = event.element.businessObject;

      // console.log(event);
      if (!this.state.is_autocollapsed){
        this.setState({
          collapsed: false,
          is_autocollapsed: true,
        });
      }

      if (currentElement.outgoing != null) { // To set available nodes when set gateway's condition
        const nextNodes = currentElement.outgoing.map(element => element.targetRef.id);
        // this.props.dispatch(workflowActions.setNextNodes(nextNodes));
      }

      // this.props.dispatch(workflowActions.setCurrentElement(currentElement));
      console.log(currentElement);
      this.setState({
        currentElement: currentElement
      });
    })
    this.load_bpmn_data();
    
  }

  load_bpmn_data = () => {
    if (this.props.match.params.hasOwnProperty('workflow_id')) {
      let { workflow_id } = this.props.match.params;
      let { coreProps } = this.props;
      // this.setState({ state: "EDIT" });
      let self = this;

      const headers = {};
      if(coreProps.user_token){
          headers['Authorization'] = 'Token ' + coreProps.user_token;
      }
      axios.get(coreProps.engine_url+'/workflow/' + workflow_id, {
        headers: headers
      })
        .then(function (response) {
          // handle success
          // let data_bpmn = JSON.parse(response.data.bpmn);

          let data_bpmn = response.data.bpmn;
          delete response.data["bpmn"];
          let workflow_data = {...data_bpmn.declaration.attributes, ...response.data}
          self.update_workflow(workflow_data);
          // console.log(response.data.bpmn);
          self.renderDiagram(json2xml(data_bpmn));
          self.updateWindowDimensions();
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .then(function () {
          // always executed
        });

    } else {
      this.createNewDiagram();
      this.updateWindowDimensions();
    }
  }

  // centerCanvas = () => {
  //   const canvas = this.viewer.get('canvas');
  //   canvas.zoom('fit-viewport', 'center');
  // }

  createNewDiagram = () => {
    this.renderDiagram(`<?xml version="1.0" encoding="UTF-8"?>
    <bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
      <bpmn2:process id="Process_1" isExecutable="false">
        <bpmn2:startEvent id="StartEvent_1"/>
      </bpmn2:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
          <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
            <dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/>
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn2:definitions>`);
  }

  renderDiagram = (xml) => {
    let self = this;
    self.modeler.importXML(xml, err => {
      console.log(err);
      if (err) {
        // Import failed
        console.log("error rendering", err);
      } else {
        // Render success
        self.centerCanvas();

        // Render Overlays
        let overlays = self.modeler.get('overlays');

        const elementRegistry = self.modeler.get('elementRegistry');
        elementRegistry.filter(function(element) {
          if(element.type == 'bpmn:ServiceTask'){
            set_service_task_image_element(overlays, element);
          }
        });
      }
    });

  }

  update_workflow = (workflow) => {
    let new_workflow = {...this.state.workflow, ...workflow}
    this.setState({ workflow: new_workflow });
  }

  updateWindowDimensions() {
    let $palette_palette = $("#canvas .djs-palette");
    if (window.innerHeight < 650) {
      $palette_palette.addClass('two-column');
    } else {
      $palette_palette.removeClass('two-column');
    }

    this.setState({ canvasStyle: { height: window.innerHeight } });
  }

  centerCanvas = () => {
    const canvas = this.modeler.get('canvas');
    canvas.zoom('fit-viewport', 'center');
  }
  
  updateByBpmnProperty(nodeId, newProps) {
    
    if(nodeId){
      const modeling = this.modeler.get('modeling');
      const elementRegistry = this.modeler.get('elementRegistry');
  
      const element = elementRegistry.get(nodeId);
      if(element){
        console.log("----- updateByBpmnProperty -----");
        console.log(newProps);
        modeling.updateProperties(element, newProps);
      }
    }
  }

  handleOpen = (fileObj) => {
    let reader = new FileReader();

    reader.onloadend = ((obj) => {
      this.renderDiagram(obj.srcElement.result);
      // try{
      //   this.renderDiagram(obj.srcElement.result);
      // }catch(e){
      //   this.renderDiagram(json2xml(obj.srcElement.result));
      // }
    })

    reader.readAsText(fileObj)
  };

  handleSaveFile = () => {
    this.modeler.saveXML({ format: true }, function (err, xml) {
      if (!err) {
        download(xml, 'diagram.bpmn', 'application/xml');
      }
    });
  }

  handleSaveImage = () => {
    this.modeler.saveSVG((err, svg) => {
      if (!err) {
        download(svg, "diagram.svg", "image/svg+xml")
      }
    })
  }

  handleZoom = () => {
    this.modeler.get('canvas').zoom(scale);
  }

  handleZoomIn = () => {
    scale += 0.1;
    this.handleZoom();
  }

  handleZoomOut = () => {
    if (scale <= 0.3) {
      scale = 0.2
    } else {
      scale -= 0.1;
    };
    this.handleZoom();
  }

  handleZoomReset = () => {
    scale = 1;
    this.handleZoom();
  }

  handleRedo = () => {
    this.modeler.get('commandStack').redo();
  }

  handleUndo = () => {
    this.modeler.get('commandStack').undo();
  }

  onSubmitDiagram = () => {
    const { coreProps } = this.props;

    this.modeler.saveXML({ format: true }, (err, xml) => {
      if (err) {
        console.error(err);
      } else {
        let bpmnJson = JSON.parse(xml2json(xml, { compact: false, spaces: 2 }));
        let workflow = this.state.workflow;
        let variables = {};

        workflow.variables.forEach(element => {
          element.variable = element.variable.toLowerCase();
          variables[element.variable] = element;
        });

        workflow.variables = [];
        Object.keys(variables).map((key, index) => {
          workflow.variables.push(variables[key]);
        });
        
        // console.log(workflow.variables);


        bpmnJson.declaration.attributes = {...bpmnJson.declaration.attributes, ...workflow};
        // console.log(bpmnJson);
        const workflow_data = {
          name: this.state.workflow.name,
          workflow_key: this.state.workflow.workflow_key,
          bpmn: bpmnJson
        };
        let self = this;

        if(workflow.workflow_id > 0){
          workflow_data.workflow_id = workflow.workflow_id;
          console.log("----- SAVE -------------------");
          console.log(workflow_data);

          const headers = {};
          if(coreProps.user_token){
              headers['Authorization'] = 'Token ' + coreProps.user_token;
          }

          axios.put(coreProps.engine_url+'/workflow/' + workflow.workflow_id, workflow_data, {
            headers: headers
          }).then(function (response) {
            // console.log(response);
            message.info(workflow.name + " DRAF v." + (workflow.version + 1) + " already saved.");
          }).catch(function (error) {
            message.error("Save " + workflow.name + " DRAF v." + (workflow.version + 1) + " Error.");
          });
        }else{
          const headers = {};
          if(coreProps.user_token){
              headers['Authorization'] = 'Token ' + coreProps.user_token;
          }

          axios.post(coreProps.engine_url+'/workflows/', workflow_data, {
            headers: headers
          }).then(function (response) {
            let workflow = self.state.workflow;
            workflow.workflow_id = response.data.workflow_id
            self.setState({ workflow: workflow });
            message.info(workflow.name + " DRAF v." + (workflow.version + 1) + " already saved.");
          }).catch(function (error) {
            message.error("Save " + workflow.name + " DRAF v." + (workflow.version + 1) + " Error.");
            console.log(error);
            });
        }


        
        // const { workflowConditions, workflowPreInputs,
        //   workflowTimers, workflow, dispatch } = this.props;
        // const { name, description, generatedForms,
        //   appliedMethods, appliedAsyncs, mode } = workflow;
        // const { appliedConditions } = workflowConditions;
        // const { appliedPreInputs } = workflowPreInputs;
        // const { appliedTimers } = workflowTimers;

        // const workflowData = {
        //   bpmnJson,
        //   appliedAsyncs,
        //   appliedMethods,
        //   appliedConditions,
        //   appliedPreInputs,
        //   generatedForms,
        //   appliedTimers,
        // }

        // if (debug === "ToEngine") {
        //   dispatch(workflowActions.sendWorkflowDataToEngine(
        //     name,
        //     description,
        //     workflowData
        //   ));
        // } if (mode === "CREATE_NEW") {
        //   dispatch(workflowActions.createNewWorkflow(
        //     name,
        //     description,
        //     workflowData
        //   ));
        // } if (mode === "VIEW_EXISTING") {
        //   dispatch(workflowActions.updateWorkflow(
        //     name,
        //     description,
        //     workflowData));
        // }
      }
    });
  }

  render() {
    const { coreProps } = this.props;
    
    return (
        <Box fill>
          <Layout>
            <Content style={{position: 'relative'}}>
              <div className="canvas content" id="canvas" style={this.state.canvasStyle}></div>

              <div style={{position: 'absolute', top: 20, right: "50%", marginRight: -50}}>
                <Title level={4}>
                  {/* {this.state.workflow.workflow_id ? <Link to={"/workflow/" + this.state.workflow.workflow_id + ""} title={this.state.workflow.name}>{this.state.workflow.name} <Icon type="pie-chart" /></Link>: ""} */}
                  {this.state.workflow.workflow_id ? <Link to={`${coreProps.urls.view_process}/${this.state.workflow.workflow_id}`} title={this.state.workflow.name}>{this.state.workflow.name} <Icon type="pie-chart" /></Link>: ""}
                  &nbsp;<Tag>DRAF v.{this.state.workflow.version+1}</Tag>
                </Title>
              </div>

              <FileControls
                onOpenFile={this.handleOpen}
                onSaveFile={this.handleSaveFile}
                onSaveImage={this.handleSaveImage}
              />
              <EditingTools
                load_bpmn_data={this.load_bpmn_data}
                saveDiagram={this.onSubmitDiagram}
                onRedo={this.handleRedo}
                onUndo={this.handleUndo}
                onZoomIn={this.handleZoomIn}
                onZoomOut={this.handleZoomOut}
              />
              <Button onClick={this.toggle_sidebar} type="default" style={{ position: 'absolute', right: -8, top: 20 }}>
                <Icon
                  className="trigger"
                  type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                />
              </Button>
              <Button size='large' onClick={this.toggle_resource_sidebar} type="default" style={{ position: 'absolute', right: 10, top: 60 }}>
                <Icon
                  className="trigger"
                  type="build"
                />
                <span style={{ transform: [{ rotate: '90deg'}] }}>Resources</span>
              </Button>
            </Content>
            <Sider
              trigger={null} collapsible collapsed={this.state.collapsed}
              breakpoint="md"
              width={500}
              collapsedWidth={0}
              style={{
                // padding: 5,
                backgroundColor: "#fff",
                borderLeft: "5px solid #e8e8e8"
              }}
            >
            <BpmnPanel 
              workflow={this.state.workflow}
              currentElement={this.state.currentElement} 
              update_workflow_callback={this.update_workflow}
              updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
              modeler={this.modeler}
              coreProps={coreProps}
              />
            </Sider>

            <Sider
              trigger={null} collapsible collapsed={this.state.resource_collapsed}
              breakpoint="md"
              width={500}
              collapsedWidth={0}
              style={{
                // padding: 5,
                backgroundColor: "#fff",
                borderLeft: "5px solid #e8e8e8"
              }}
            >
              <div>
                <Title level={4} style={{paddingLeft: 10, paddingTop: 10}}>
                  Config Resources
                </Title>
                <ConfigResourceManagement coreProps={coreProps} />
              </div>
            </Sider>
          </Layout>
        </Box>
    )
  }
}
