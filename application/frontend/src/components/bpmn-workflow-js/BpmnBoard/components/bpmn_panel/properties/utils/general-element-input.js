import React, { Component } from 'react';
import { Form, Input } from 'UIKit';

const { TextArea } = Input;

const form_layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 18,
    },
};

export default class GeneralElementInput extends Component {
    constructor(props) {
        super(props);

        let nodeDescription = null;
        if(props.currentElement && props.currentElement.$attrs){
            nodeDescription = props.currentElement.$attrs.description;
        }

        this.state = {
            nodeId: props.nodeId,
            nodeName: props.nodeName,
            nodeDescription: nodeDescription || '',
            input_nodeId_validateStatus: null,
            input_nodeId_help: "",
        }
    }

    componentWillReceiveProps(nextProps) {
        const { nodeId, nodeName, currentElement } = nextProps;

        let nodeDescription = null;
        if(currentElement && currentElement.$attrs){
            nodeDescription = currentElement.$attrs.description;
        }

        this.setState({
            nodeId: nodeId,
            nodeName: nodeName,
            nodeDescription: nodeDescription,
        });
    }

    handleNodeIdChange(event) {
        const old_node_id = this.state.nodeId;
        if(!this.props.readonly){
            try {
                if (this.props.updateByBpmnProperty) {
                    this.props.updateByBpmnProperty(old_node_id, { id: event.target.value });
                }
                this.setState({ nodeId: event.target.value, input_nodeId_validateStatus: null, input_nodeId_help: "" });
            } catch (err) {
                console.log(err);
                let input_nodeId_help = "element with id = '" + event.target.value + "' already added";
                this.setState({ input_nodeId_validateStatus: "error", input_nodeId_help: input_nodeId_help });
            }
        }
    }

    handleNodeNameChange(event) {
        if(!this.props.readonly){
            const { nodeId } = this.state;
            if (this.props.updateByBpmnProperty) {
                this.props.updateByBpmnProperty(nodeId, { name: event.target.value });
            }
            this.setState({ nodeName: event.target.value });
        }
    }

    handleNodeDescriptionChange(event) {
        if(!this.props.readonly){
            const { nodeId } = this.state;
            if (this.props.updateByBpmnProperty) {
                this.props.updateByBpmnProperty(nodeId, { description: event.target.value });
            }
            this.setState({ nodeDescription: event.target.value });
        }
    }

    render() {
        let { nodeName, nodeId, nodeDescription, input_nodeId_validateStatus, input_nodeId_help } = this.state;

        return (
            <Form
                {...form_layout}
                name="basic"
            // initialValues={{
            //   remember: true,
            // }}
            // onFinish={onFinish}
            // onFinishFailed={onFinishFailed}
            >
                <Form.Item
                    label={
                        <span>ID&nbsp;</span>
                    }
                    hasFeedback
                    validateStatus={input_nodeId_validateStatus}
                    help={input_nodeId_help}
                >
                    <Input value={nodeId} onChange={this.handleNodeIdChange.bind(this)} />
                </Form.Item>
                <Form.Item
                    label={
                        <span>
                            Name&nbsp;
                          </span>
                    }
                >
                    <Input value={nodeName} onChange={this.handleNodeNameChange.bind(this)} />
                </Form.Item>
                <Form.Item
                    label={
                        <span>
                            Description&nbsp;
                          </span>
                    }
                >
                    <TextArea rows={4} value={nodeDescription} onChange={this.handleNodeDescriptionChange.bind(this)} />
                </Form.Item>
            </Form>
        )
    }
}
