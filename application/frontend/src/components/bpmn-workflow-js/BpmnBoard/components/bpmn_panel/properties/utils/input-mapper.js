import React, { Component, Fragment } from 'react';
import { Form, Select, Button } from 'UIKit';

import AceEditor from "react-ace";


export default class InputMapper extends Component {
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
        let { variables, type } = this.props;
        let { typeMapping } = this.state;
        let ex_str = "";

        if (typeMapping == "json") {
            variables.forEach(function(element, idx, array){
                ex_str += '\t"' + element.variable + '": "{{ ' + element.variable + ' }}"';
                if (idx === array.length - 1){ 
                    ex_str += '\n';
                }else{
                    ex_str += ',\n';
                }
            });

            mappingInfo = '{\n' + ex_str + '}';

        } else if (typeMapping == "python") {
            let function_name = "mapper";
            let param_name = "data";

            if(type=="output"){
                param_name = "response_data";
            }else if(type=="input"){
                param_name = "job_data";
            }

            variables.forEach(element => {
                ex_str += '\t\t"' + element.variable + '": '+param_name+'["' + element.variable + '"],\n';
            });

            mappingInfo = 'def ' + function_name + '('+param_name+'): \n\t# Function name must be "mapper".\n\tmapped_data = {\n' + ex_str + '\t}\n\treturn mapped_data\n';
        }
        this.setState({ mappingInfo: mappingInfo }, () => {
            this.onChange();
        });
    }

    render() {
        let { typeMapping, mappingInfo } = this.state;
        let { label, readonly } = this.props;

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
                        <Select.Option value="json">Json Template</Select.Option>
                        <Select.Option value="python">Python Generate</Select.Option>
                    </Select>
                    {!readonly && <Button type="default" size="small" onClick={this.getExample.bind(this)}>Example</Button>}
                </Form.Item>
                <Form.Item>
                    <AceEditor
                        mode={typeMapping}
                        // theme="github"
                        readOnly={readonly}
                        fontSize={15}
                        height='30vh'
                        value={mappingInfo}
                        onChange={this.onMappingChange.bind(this)}
                        name="UNIQUE_ID_OF_DIV"
                    // editorProps={{ $blockScrolling: true }}
                    />
                </Form.Item>
            </Fragment>
        )
    }
}