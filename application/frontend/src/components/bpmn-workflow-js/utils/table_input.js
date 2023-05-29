import React, { Component } from 'react';
import { Table, Input, Icon, Button, Checkbox, Form } from 'UIKit';

const default_datas = [
    // {
    //     id: 1,
    //     key: "test",
    //     value: "1234"
    // }
];


export default class TableInput extends Component {
    constructor(props) {
        super(props);

        let data_list = default_datas;
        if(props.default_data_list){
            data_list = props.default_data_list;
        }
        if(props.value){
            data_list = props.value;
        }

        this.state = {
            data_list: data_list
        }
    }

    componentWillReceiveProps(nextProps) {
        const { value, default_data_list } = nextProps;
        if (value) {
            this.setState({
                data_list: value
            });
        }else if(default_data_list){
            this.setState({
                data_list: default_data_list
            });
        }else{
            this.setState({
                data_list: default_datas
            });
        }
      }

    onDataChange(){
        if(this.props.onChange){
            this.props.onChange(this.state.data_list);
        }
    }

    onChange(id, name, e){
        const { value } = e.target;
        const new_data_list = [...this.state.data_list];
        
        const index = new_data_list.findIndex(item => id === item.id);
        let item = new_data_list[index];
        item[name] = value;
        new_data_list[index] = item;

        this.setState({
            data_list: new_data_list
        });
        this.onDataChange();
    }

    onDelete(id, e){
        let new_data_list = [...this.state.data_list];
        const index = new_data_list.findIndex(item => id === item.id);
        new_data_list.splice(index, 1);

        this.setState({
            data_list: new_data_list
        });

        if(this.props.onChange){
            this.props.onChange(new_data_list);
        }
    }
    
    onAdd(){
        let data_list = this.state.data_list;
        let id = data_list.length;
        if(id > 0){
            id = data_list[data_list.length-1].id + 1
        }
        data_list.push({
            id: id,
            key: "",
            value: ""
        });
        this.setState({
            data_list: data_list
        });
        this.onDataChange();
    }

    render() {
        // const [data, setData] = useState(originData);
        let { readonly } = this.props;

        const footer = () => {
            return <Button type="primary" onClick={this.onAdd.bind(this)}>
                    <Icon type="plus" /> KEY
                  </Button>
        }

        let columns = [
            {
                title: 'key',
                //   width: '15%',
                editable: true,
                render: (text, record) => {
                    return <Form.Item
                        name="key"
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
                        <Input value={record.key} onChange={this.onChange.bind(this, record.id, "key")} disabled={readonly} />
                    </Form.Item>
                }
            },
            {
                title: 'value',
                //   width: '40%',
                editable: true,
                render: (text, record) => {
                    return <Form.Item
                        name="value"
                        style={{
                            margin: 0,
                        }}
                    >
                        <Input value={record.value} onChange={this.onChange.bind(this, record.id, "value")} disabled={readonly} />
                    </Form.Item>
                }
            },
        ];

        if(!readonly){
            columns.push({
                title: '',
                dataIndex: 'operation',
                render: (text, record) => {
                    return <Button type="danger" onClick={this.onDelete.bind(this, record.id)}>
                        <Icon type="delete" />
                    </Button>
                },
            });
        }

        

        return (
            <Table
                size="small"
                footer={readonly ? null : footer}
                bordered
                dataSource={this.state.data_list}
                columns={columns}
                rowClassName="editable-row"
                rowKey="id"
            // pagination={{
            // onChange: cancel,
            // }}
            />
        );
    }
}
