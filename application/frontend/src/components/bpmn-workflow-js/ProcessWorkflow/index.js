import React, { Component } from 'react';
import { Link } from "react-router-dom";
import SplitPane, { Pane } from 'react-split-pane';
import axios from "axios";
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import { json2xml, } from 'xml-js';
import { Box, Collapsible } from 'grommet';
import VersionControlTools from './components/VersionControlTools';

import { Layout, Icon, Button, Typography, Tag, Row, Col, Tabs, Select, Card, Modal, Form, Input, Badge } from 'UIKit';

import ViewerTools from './components/ViewerTools';
import JobInstancesView from './components/jobInstancesView.js'
import CreateJobVariableModal from './components/createJobVariableModal';
import BpmnPanel from '../BpmnBoard/components/bpmn_panel';

import { set_service_task_image_element } from '../utils/bpmn_overlays.js';

import "./css/app.css";

let scale = 1;
const { Sider, Content, Footer } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;


// function VersionTools(props) {
// 	if(selected_version == "draf"){
// 		return <Button type="default" >
// 			<Link to={"/workflow/" + props.workflow_id + "/edit"} title="Edit">Edit</Link>}
// 	  </Button>
// 	}
// 	return <></>;
// // const isLoggedIn = props.isLoggedIn;
// // if (isLoggedIn) {
// // 	return <UserGreeting />;
// // }
// // return <GuestGreeting />;
// };


export default class index extends Component {

	constructor(props) {
		super(props);
		this.state = {
			mainStyle: { height: 800 },
			// canvasStyle: { height: 0 },
			workflow: { name: '', workflow_id: 0, versions: [], version: 0 },
			selected_workflow: null,
			selected_version: "draf",
			right_collapsed: false,
			workflow_attributes: null,
			currentElement: null,
		};
		this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
	}

	updateWindowDimensions() {
		let height = window.innerHeight;
		this.setState({ mainStyle: { height: height } });
		this.setState({ canvasStyle: { height: height } });
	}

	componentDidMount() {
		this.updateWindowDimensions();
		const viewer = new BpmnViewer({
			container: '#canvas',
			overlays: {
				defaults: {
					show: { minZoom: 0.2 },
					scale: true
				}
			}
		});
		this.viewer = viewer;

		const eventBus = this.viewer.get('eventBus');

		eventBus.on('element.click', (event) => {
			const currentElement = event.element.businessObject;

			// console.log(event);
			this.setState({
				right_collapsed: false,
			});

			if (currentElement.outgoing != null) { // To set available nodes when set gateway's condition
				const nextNodes = currentElement.outgoing.map(element => element.targetRef.id);
				// this.props.dispatch(workflowActions.setNextNodes(nextNodes));
			}

			// this.props.dispatch(workflowActions.setCurrentElement(currentElement));
			// console.log(currentElement);
			this.setState({
				currentElement: currentElement
			});
		})

		if (this.props.match.params.hasOwnProperty('workflow_id')) {
			let { workflow_id } = this.props.match.params;
			this.loadWorkflowDetail(workflow_id);
		}
		window.onresize = this.centerCanvas.bind(this);
	}

	loadWorkflowDetail = (workflow_id, selected=null) => {
		let self = this;
		const { coreProps } = this.props;

		const headers = {};
        if(coreProps.user_token){
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }
		
		axios.get(coreProps.engine_url+'/workflow/' + workflow_id + '/detail', {
            headers: headers
          }).then(function (response) {
				let version_selected = "draf";

				if(selected){
					response.data.versions.map(v => {
						if(v.version == selected){
							version_selected = v.id;
						}
					});
				}else{
					response.data.versions.map(v => {
						if(v.is_active){
							version_selected = v.id;
						}
					});
				}

				self.setState({ workflow: response.data, selected_version: version_selected });
				self.onVersionChange(version_selected);
			})
			.catch(function (error) {
				// handle error
				console.log(error);
			})
			.then(function () {
				// always executed
			});
	}

	renderDiagram = (xml) => {
		let self = this;
		this.viewer.importXML(xml, err => {
		  console.log(err);
		  if (err) {
			// Import failed
			console.log("error rendering", err);
		  } else {
			// Render success
			self.centerCanvas();
			self.renderJobDiagram();
		  }
		});
	}

	renderJobDiagram = () => {
		const { coreProps } = this.props;
		let self = this;
        let { workflow_attributes, selected_workflow } = this.state;
        let workflow_key = null;

        if(workflow_attributes && workflow_attributes.workflow_key){
            workflow_key = workflow_attributes.workflow_key;
        }
        this.setState({ data: [], loaded: false });

        const headers = {};
        if(coreProps.user_token){
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }
        if(selected_workflow){
            let version_id = 'latest';
            if(selected_workflow.id){
                version_id = selected_workflow.id;
			}
			
			let overlays = self.viewer.get('overlays');
			overlays.clear();

            axios.get(coreProps.engine_url+'/workflow/'+workflow_key+"/jobs-summary?version_id=" + version_id, {
                headers: headers
			}).then(response => {
				if (response.status == 200) {
					let summary_job = response.data['summary_job'];

					summary_job.forEach(element => {
						// ant-badge-status-processing
					//   ant-badge-status-warning
					//   ant-badge-status-default
					//   ant-badge-status-error
					//   ant-badge-status-success
						let color_class = "ant-badge-status-processing";  // 1
						if(element.status == 4){
							color_class = "ant-badge-status-success";
						}
						let $rend = `<sup data-show="true" class="ant-scroll-number ant-badge-count `+color_class+`" title="`+element.count+`">`+element.count+`</sup>`;
						overlays.add(element.task, {
							position: {
								top:0,
								right:0
							},
							html: $rend
						});
					});
				}
				return response.data;
			});

			// Render Overlays
			const elementRegistry = self.viewer.get('elementRegistry');
			elementRegistry.filter(function(element) {
				if(element.type == 'bpmn:ServiceTask'){
					set_service_task_image_element(overlays, element);
				}
			});
        }
	}

	centerCanvas = () => {
		const canvas = this.viewer.get('canvas');
		canvas.zoom('fit-viewport', 'center');
	}

	handleZoom = () => {
		this.viewer.get('canvas').zoom(scale);
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

	onVersionChange = (value) => {
		let self = this;
		const { coreProps } = this.props;
		
		this.setState({
			selected_version: value
		});
		if(value=="draf"){
			this.setState({
				selected_workflow: this.state.workflow,
			});
			const xml = json2xml(this.state.workflow.bpmn);
			this.renderDiagram(xml);
		}else{
			const headers = {};
			if(coreProps.user_token){
				headers['Authorization'] = 'Token ' + coreProps.user_token;
			}
		
			axios.get(coreProps.engine_url+'/workflow/' + value + '/version', {
				headers: headers
			}).then(function (response) {
				// handle success
				// let bpmn = JSON.parse(response.data.bpmn);
				let bpmn = response.data.bpmn;

				self.setState({ 
					selected_workflow: response.data,
					workflow_attributes: bpmn.declaration.attributes
				});

				const xml = json2xml(bpmn);
				self.renderDiagram(xml)
			})
			.catch(function (error) {
				// handle error
				console.log(error);
			})
			.then(function () {
				// always executed
			});
		}
	};

	toggle_controller_sidebar = () => {
		this.setState({
			right_collapsed: !this.state.right_collapsed,
		});
	};
	

	render() {
		const { selected_version, selected_workflow, workflow, workflow_attributes } = this.state;
		const { coreProps } = this.props;
		
		return (
			<Box fill style={this.state.mainStyle}>
				<SplitPane split="horizontal" initialSize="25%">
					<Layout style={{height: "100%"}}>
						<Content style={{position: 'relative', height: "100%"}}>
							<div className="canvas content" id="canvas" style={{position: 'relative', height: "100%"}}></div>

							<div style={{position: 'absolute', top: 20, right: "40%", marginRight: -50}}>
								<Title level={2}>
									{workflow.name}
								<Button type="default" size="small" ><Link to={`${coreProps.urls.dashboard}`} title="Dashboard">Dashboard</Link></Button>	
								</Title>
							</div>


							<Button size='large' onClick={this.toggle_controller_sidebar} type="default" style={{ position: 'absolute', right: 10, top: 10 }}>
								<Icon
								className="trigger"
								type="dashboard"
								/>
								<span >Detail</span>
							</Button>

							<Card
								title={"Workflow Controller"}
								style={{ width: 300, marginTop: 16, position: 'absolute', left: 10, top: 10 }}
								actions={[
									<Box >
										<Button.Group size='large'>
											<Button type="default">
												<Icon type="border" />
											</Button>
											<Button type="default">
												<Icon type="caret-right" />
											</Button>
										</Button.Group>
									</Box>,
									<ViewerTools
										onZoomIn={this.handleZoomIn}
										onZoomOut={this.handleZoomOut}
									/>,
								]}
							>
								<VersionControlTools 
									coreProps={coreProps}
									workflow={workflow}
									selected_version={selected_version}
									selected_workflow={selected_workflow}
									onChange={this.onVersionChange}
									onCommit={this.loadWorkflowDetail}
								/>

								{workflow_attributes && <CreateJobVariableModal 
									coreProps={coreProps} 
									workflow_attributes={workflow_attributes} 
								/>}
							</Card>

						</Content>
						<Sider
							trigger={null} collapsible collapsed={this.state.right_collapsed}
							breakpoint="md"
							width={500}
							collapsedWidth={0}
							style={{
								padding: 5,
								backgroundColor: "#fff",
								borderLeft: "5px solid #e8e8e8"
							}}
						>
							<BpmnPanel 
								workflow={this.state.workflow}
								currentElement={this.state.currentElement} 
								// modeler={this.modeler}
								coreProps={coreProps}
								readonly={true}
							/>
						</Sider>
					</Layout>
					<div style={{padding: 5}}>
						<Tabs type="card">
							<TabPane tab="Process Instances" key="1">
								<JobInstancesView 
									coreProps={coreProps} 
									workflow_attributes={workflow_attributes}
									selected_workflow={selected_workflow}
									currentElement={this.state.currentElement} 
									refreshJob={this.renderJobDiagram}
								/>
							</TabPane>
							<TabPane tab="Incidents" key="2">
								Incidents
							</TabPane>
						</Tabs>
					</div>
				</SplitPane>
			</Box>
			// <Box fill animation="fadeIn" style={this.state.mainStyle}>
			// 	<SplitPane split="horizontal" width="70%" >
			// 		<SplitPane split="vertical" defaultSize="70%" >
			// 			<div style={{padding: 5}}>
			// 				<Title level={4}>
			// 					{workflow.name}
			// 				</Title>
			// 			</div>
			// 		</SplitPane>
					// <div style={{padding: 5}}>
					// 	<Tabs type="card">
					// 		<TabPane tab="Process Instances" key="1">
					// 			process instances
					// 		</TabPane>
					// 		<TabPane tab="Incidents" key="2">
					// 			Incidents
					// 		</TabPane>
					// 	</Tabs>
					// </div>
			// 	</SplitPane>
			// </Box>
		)
	}
}