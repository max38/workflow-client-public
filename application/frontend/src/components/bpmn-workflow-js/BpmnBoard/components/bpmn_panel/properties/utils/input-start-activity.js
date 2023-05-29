import React, { Component, Fragment } from 'react';
import { Form, Select, Button } from 'UIKit';

import AceEditor from "react-ace";


export default class InputStartActivity extends Component {
    constructor(props) {
        super(props);

        this.state = {
            typeMapping: "json",
            mappingInfo: "",
        }

        let { mapping_info } = props;

        if (mapping_info && mapping_info.type) {
            this.state.typeMapping = mapping_info.type;
            this.state.mappingInfo = mapping_info.info;
        }
    }

    componentDidMount() {
        let { typeMapping, mappingInfo } = this.state;
        if (!mappingInfo) {
            this.onTypeMappingChange(typeMapping);
        }
    }

    componentWillReceiveProps(nextProps) {
        let { mapping_info } = nextProps;
        if (mapping_info && mapping_info.type) {
            this.setState({
                typeMapping: mapping_info.type,
                mappingInfo: mapping_info.info,
            })
        }
    }

    onChange() {
        let { typeMapping, mappingInfo } = this.state;

        this.setState({
            mappingInfo: mappingInfo,
        })

        if (this.props.onChange) {
            let return_data = {
                type: typeMapping,
                info: mappingInfo
            };
            this.props.onChange(return_data);
        }
    }


    onTypeMappingChange = (value) => {
        let mappingInfo = "";
        let { mapping_info } = this.props;

        if(mapping_info && value == mapping_info.type){
            mappingInfo = mapping_info.info;
        }
        this.setState({ typeMapping: value, mappingInfo: mappingInfo }, () => {
            this.onChange();
        });
    }

    onMappingChange = (value) => {
        this.setState({ mappingInfo: value }, () => {
            this.onChange();
        });
    }

    getExample(){
        let mappingInfo = "";
        let { variables } = this.props;
        let { typeMapping } = this.state;
        let ex_str = "";

        if (typeMapping == "json") {
            variables.forEach(function(element, idx, array){
                ex_str += '\t"' + element.variable + '": "'+ (element.default? element.default : "") +'",\n';
            });
            ex_str += '\t"start_time": "{{ datetime.now }}"\n';

            mappingInfo = '{\n' + ex_str + '}';

        } else if (typeMapping == "python") {
            let function_name = "job";

            variables.forEach(element => {
                ex_str += '\t\t"' + element.variable + '": "'+ (element.default? element.default : "") +'",\n';
            });
            ex_str += '\t\t"start_time": datetime.now(),\n';

            let python_param = this.props.python_param ? this.props.python_param: 'resources';
            let python_return_var = this.props.python_return_var ? this.props.python_return_var: 'job_data';

            mappingInfo = 'def ' + function_name + '('+ python_param +'): \n\t# Function name must be "job".\n\t' + python_return_var + ' = {\n' + ex_str + '\t}\n\treturn ' + python_return_var + '\n';
        }
        this.setState({ mappingInfo: mappingInfo }, () => {
            this.onChange();
        });
    }

    render() {
        let { typeMapping, mappingInfo } = this.state;
        let { label, readonly } = this.props;
        let $editor, $example_button;

        if(typeMapping != '-'){
            $editor = <AceEditor
                mode={typeMapping}
                // theme="github"
                fontSize={15}
                height='30vh'
                value={mappingInfo}
                onChange={this.onMappingChange.bind(this)}
                name="UNIQUE_ID_OF_DIV"
                readOnly={readonly}
            // editorProps={{ $blockScrolling: true }}
            />;
            $example_button = <Button type="default" size="small" onClick={this.getExample.bind(this)}>Example</Button>;
        }

        return (
            <Fragment>
                <Form.Item
                    label={
                        <span>
                            {label}&nbsp;
                          </span>
                    }
                >
                    <Select
                        value={typeMapping}
                        onChange={this.onTypeMappingChange.bind(this)}
                        disabled={readonly}
                    >
                        <Select.Option value="-"> - </Select.Option>
                        <Select.Option value="json">Json Template</Select.Option>
                        <Select.Option value="python">Python Generate</Select.Option>
                    </Select>
                    {!readonly && $example_button}
                </Form.Item>
                <Form.Item>
                    {$editor}
                </Form.Item>
            </Fragment>
        )
    }
}