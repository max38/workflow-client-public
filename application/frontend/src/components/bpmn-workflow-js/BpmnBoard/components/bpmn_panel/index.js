import React, { Component } from 'react';
import TaskProperty from './properties/task';
import ScriptTaskProperty from './properties/script_task';
import ServiceTaskProperty from './properties/service_task';
import StartProperty from './properties/start';
import StartTimerProperty from './properties/start_timer';
import TimerProperty from './properties/timer_event';
import ConditionalEventProperty from './properties/conditional_event';
import MainBpmnProperty from './properties/main';
import ElementProperty from './properties/element';
import SequenceFlowProperty from './properties/sequence_flow';
import IntermediateCatchMsgProperty from './properties/intermediate_catch_msg';
import { Typography } from 'UIKit';

const { Title, Text } = Typography;


export default class BpmnPanel extends Component {

    constructor(props) {
        super(props);
    
        this.state = {
          workflow: null,
          title_show: '',
          nodeId: '',
          nodeName: '',
          nodeType: null,
          eventType: null,
          // isAsyncTask: false,
          // toCreateForm: false,
          currentElement: null,
        }
    
      }

    componentWillReceiveProps(nextProps) {
      const { currentElement, workflow } = nextProps;
      if (workflow){
        this.setState({
          workflow: workflow,
          title_show: workflow.name,
        });
      }
      // console.log(workflow);
      if (currentElement) {
        this.setState({
          currentElement: currentElement,
          title_show: currentElement.$type != 'bpmn:Collaboration' ? currentElement.name : workflow.name,
          nodeId: currentElement.id,
          nodeName: currentElement.name || '',
          nodeType: currentElement.$type,
          eventType: currentElement.eventDefinitions != null
            && currentElement.eventDefinitions.length > 0
            ? currentElement.eventDefinitions[0].$type : null,
        });
      }
    }

    callBack_Main = (workflow) => {
      this.setState({
        workflow: workflow,
        title_show: workflow.name,
      });
      if(this.props.update_workflow_callback){
        this.props.update_workflow_callback(workflow);
      }
      if(this.props.updateByBpmnProperty){
        this.props.updateByBpmnProperty(this.state.nodeId, {});
      }
    }

    updateByBpmnProperty(nodeId, newProps){
      let { name, id } = newProps;
      if(name){
        let { workflow, currentElement } = this.state;
        let title_show = currentElement.$type != 'bpmn:Collaboration' ? name : workflow.name;
        this.setState({ nodeName: name, title_show: title_show });
      }
      if(id){
        this.setState({ nodeId: id });
      }
  
      if(this.props.updateByBpmnProperty){
        this.props.updateByBpmnProperty(nodeId, newProps);
      }
    }

    renderSpecialProperties() {
      const { nodeType, nodeName, eventType } = this.state;
      const { coreProps, readonly } = this.props;
      // const { onSelectServiceMethod,
      //   onShowConditions, onAssignTask } = this.props;
      let element = null;
      console.log("==== eventType ====");
      console.log(eventType);
      console.log(this.state.currentElement);
      console.log("-----------------------------------------");
  
      switch (nodeType) {
        case 'bpmn:Process': 
        case 'bpmn:Collaboration': { // case 'bpmn:Collaboration'
          /*this.setState({
            title_show: this.state.workflow.name
          });*/
          element = [
            <MainBpmnProperty 
              workflow={this.state.workflow}
              currentElement={this.state.currentElement} 
              parentCallback={this.callBack_Main}
              coreProps={coreProps}
              readonly={readonly}
            />
          ]
        } break;

        case 'bpmn:Task': {
          element = [
              <TaskProperty 
                coreProps={coreProps}
                workflow={this.state.workflow}
                currentElement={this.state.currentElement} 
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
              />
          ]
          // const { workflow } = this.props;
          // if (workflow.currentNode == null) return null;
          // const elementId = workflow.currentNode.id;
          // const disabled = workflow.appliedMethods[elementId] != null ? false : true;
          // element = [
          //   <TaskProperty
          //     key={1}
          //     taskId={workflow.currentNode.id}
          //     onSelectServiceMethod={(serviceMethod) => onSelectServiceMethod(serviceMethod)}
          //   />,
          //   <Button label="Define input" disabled={disabled}
          //     icon={<Edit />} onClick={this.onDefineInput} key={2} />,
          //   <Button label="Create form"
          //     onClick={() => this.onSelectFormType()} />
          // ]
        } break;

        case 'bpmn:ScriptTask': {
          element = [
              <ScriptTaskProperty 
                coreProps={coreProps}
                workflow={this.state.workflow}
                currentElement={this.state.currentElement} 
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
              />
          ];
        } break;

        case 'bpmn:ServiceTask': {
          element = [
              <ServiceTaskProperty 
                coreProps={coreProps}
                workflow={this.state.workflow}
                currentElement={this.state.currentElement} 
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
                modeler={this.props.modeler}
              />
          ];
        } break;
  
        case "bpmn:Lane": {
          element = [
            <ElementProperty 
              currentElement={this.state.currentElement} 
              updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
              readonly={readonly}
            />
          ];
            
        } break;
  
        case "bpmn:ExclusiveGateway": {
          // element = <GatewayProperty onShowConditions={onShowConditions} />
        } break;


        case "bpmn:SequenceFlow": {
          element = [
            <SequenceFlowProperty 
                currentElement={this.state.currentElement} 
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                modeler={this.props.modeler}
                readonly={readonly}
            />
          ];
        } break;
        
        case "bpmn:IntermediateThrowEvent": {
          element = [
            <TaskProperty
              workflow={this.state.workflow}
              currentElement={this.state.currentElement}
              updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
              readonly={readonly}
            />
          ];
        } break;
          
        case "bpmn:StartEvent": {
          if (eventType === "bpmn:TimerEventDefinition") {
            element = [
              <StartTimerProperty 
                coreProps={coreProps}
                workflow={this.state.workflow}
                currentElement={this.state.currentElement} 
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
              />
            ];
          }else{
            element = [
              <StartProperty 
                  currentElement={this.state.currentElement} 
                  updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                  readonly={readonly}
              />
            ];
          }
        } break;
          
        case "bpmn:IntermediateCatchEvent": {
          if(eventType === "bpmn:MessageEventDefinition") {
            element = [
              <IntermediateCatchMsgProperty 
                coreProps={coreProps}
                workflow={this.state.workflow}
                currentElement={this.state.currentElement} 
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
              />
            ]
          } else if (eventType === "bpmn:TimerEventDefinition") {
            element = [
              <TimerProperty 
                coreProps={coreProps}
                workflow={this.state.workflow}
                currentElement={this.state.currentElement} 
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
              />
            ]
          } else if (eventType === "bpmn:ConditionalEventDefinition") {
            element = [
              <ConditionalEventProperty 
                coreProps={coreProps}
                workflow={this.state.workflow}
                currentElement={this.state.currentElement} 
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
              />
            ]
          } else {
            element = [
              <ElementProperty 
                  currentElement={this.state.currentElement} 
                  updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                  readonly={readonly}
              />
            ]
          }
        } break;

        case "bpmn:BoundaryEvent": {
          if(eventType === "bpmn:TimerEventDefinition") {
            element = [
              <TimerProperty 
                coreProps={coreProps}
                workflow={this.state.workflow}
                currentElement={this.state.currentElement} 
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
              />
            ]
          } else if(eventType === "bpmn:MessageEventDefinition") {
            element = [
              <IntermediateCatchMsgProperty 
                coreProps={coreProps}
                workflow={this.state.workflow}
                currentElement={this.state.currentElement} 
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
              />
            ]
          } else if (eventType === "bpmn:ConditionalEventDefinition") {
            element = [
              <ConditionalEventProperty 
                coreProps={coreProps}
                workflow={this.state.workflow}
                currentElement={this.state.currentElement} 
                isBoundary={true}
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
              />
            ]
          } else {
            element = [
              <ElementProperty 
                  currentElement={this.state.currentElement} 
                  updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                  readonly={readonly}
              />
            ]
          }
        } break;
  
        default: {
          console.log("nodeType : ", nodeType);
          console.log("eventType : ", eventType);
          // bpmn:messageFlow
          element = [
            <ElementProperty 
                currentElement={this.state.currentElement} 
                updateByBpmnProperty={this.updateByBpmnProperty.bind(this)}
                readonly={readonly}
            />
          ]
        } break;
      }
      return element;
    }

    componentDidMount() {
    }
  
    render() {
      let { title_show, nodeType, eventType } = this.state;
      let rendered_panel = this.renderSpecialProperties();
      if(!title_show){
        title_show = "-";
      }
      let $event_type = null;
      if(eventType){
        $event_type = <Text code >{ eventType }</Text>;
      }

        return (
            <div>
                <Title level={4} style={{paddingLeft: 10, paddingTop: 10}}>
                  { title_show }
                </Title>
                <div style={{marginBottom: 10}}>
                  <Text code >{ nodeType }</Text>
                  { $event_type }
                </div>
                { rendered_panel }
                {/* { rendered_panel } */}
            </div>
        );
    }
}
