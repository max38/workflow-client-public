import React, { useState, Component } from 'react';
import ReactDOM from 'react-dom';
import { Table, Input, Icon, Button, Checkbox, Form } from 'UIKit';
// import { DeleteOutlined } from '@ant-design/icons';


export default class TableVariableInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            variable_list: props.value
        }
    }

    onDataChange(){
        this.props.onChange(this.state.variable_list);
    }

    onChange(key, name, e){
        const { value } = e.target;
        const new_variable_list = [...this.state.variable_list];
        
        const index = new_variable_list.findIndex(item => key === item.key);
        let item = new_variable_list[index];

        if(name == "variable"){
            item[name] = value.toLowerCase();
        }else{
            item[name] = value;
        }
        new_variable_list[index] = item;

        this.setState({
            variable_list: new_variable_list
        });
        this.onDataChange();
    }

    onDelete(key, e){
        let new_variable_list = [...this.state.variable_list];
        const index = new_variable_list.findIndex(item => key === item.key);
        new_variable_list.splice(index, 1);

        this.setState({
            variable_list: new_variable_list
        });

        this.props.onChange(new_variable_list);
    }

    onChangeRequire(key, e){
        const { checked } = e.target;
        const new_variable_list = [...this.state.variable_list];
        
        const index = new_variable_list.findIndex(item => key === item.key);
        let item = new_variable_list[index];

        item.require = checked;
        new_variable_list[index] = item;

        this.setState({
            variable_list: new_variable_list
        })
        this.onDataChange();
    }
    
    onAdd(){
        let variable_list = this.state.variable_list;
        let key = variable_list.length;
        if(key > 0){
            key = variable_list[variable_list.length-1].key + 1
        }
        variable_list.push({
            key: key,
            require: false,
            variable: "",
            default: ""
        });
        this.setState({
            variable_list: variable_list
        });
        this.onDataChange();
    }

    render() {
        // const [data, setData] = useState(originData);

        const footer = () => {
            return <Button type="primary" onClick={this.onAdd.bind(this)}>
                    <Icon type="plus" /> Variable
                  </Button>
        }

        const columns = [
            {
                title: 'Require',
                dataIndex: 'require',
                width: 85,
                editable: true,
                render: (text, record) => {
                    return <Checkbox checked={record.require} onChange={this.onChangeRequire.bind(this, record.key)} />
                }
            },
            {
                title: 'Variable',
                dataIndex: 'variable',
                //   width: '15%',
                editable: true,
                render: (text, record) => {
                    return <Form.Item
                        name="variable"
                        style={{
                            margin: 0,
                        }}
                        rules={[
                            {
                                required: true,
                                // message: `Please Input ${variable}!`,
                            },
                        ]}
                    >
                        <Input value={record.variable} onChange={this.onChange.bind(this, record.key, "variable")} />
                    </Form.Item>
                }
            },
            {
                title: 'Default Value',
                dataIndex: 'default',
                //   width: '40%',
                editable: true,
                render: (text, record) => {
                    return <Form.Item
                        name="default"
                        style={{
                            margin: 0,
                        }}
                    >
                        <Input value={record.default} onChange={this.onChange.bind(this, record.key, "default")} />
                    </Form.Item>
                }
            },
            {
                title: '',
                dataIndex: 'operation',
                render: (text, record) => {
                    return <Button type="danger" onClick={this.onDelete.bind(this, record.key)}>
                        <Icon type="delete" />
                    </Button>
                },
            },
        ];

        return (
            <Table
                size="small"
                footer={footer}
                bordered
                dataSource={this.state.variable_list}
                columns={columns}
                rowClassName="editable-row"
            // pagination={{
            // onChange: cancel,
            // }}
            />
        );
    }
}
