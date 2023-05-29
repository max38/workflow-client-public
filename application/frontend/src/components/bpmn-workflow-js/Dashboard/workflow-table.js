import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Table, Button, Tag } from 'UIKit';
import axios from "axios";



class WorkflowTable extends Component {
    state = {
        data: [],
        loaded: false,
        placeholder: "Loading..."
    };

    componentDidMount() {
        const { coreProps } = this.props;

        const headers = {};
        if(coreProps.user_token){
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }

        axios.get(coreProps.engine_url+'/workflows/', {
            headers: headers
          })
            .then(response => {
                if (response.status !== 200) {
                    return this.setState({ placeholder: "Something went wrong" });
                }
                return response.data;
            })
            .then(data => this.setState({ data: data, loaded: true }));
    }

    render() {
        const { coreProps } = this.props;
        const { data, loaded, placeholder } = this.state;

        const table_columns = [
            {
                title: 'State',
                dataIndex: 'name',
                key: 'name',
                render: text => <Tag color="geekblue">Testing</Tag>,
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => <a><Link to={`${coreProps.urls.view_process}/${record.workflow_id}`} title={record.name}>{record.name}</Link></a>,
            },
            {
                title: 'Version',
                dataIndex: 'version',
                key: 'version',
            },
            {
                title: 'Incidents',
                dataIndex: 'name',
                key: 'name',
                render: text => <span>-</span>,
            },
            {
                title: 'Running Instances',
                dataIndex: 'name',
                key: 'name',
                render: text => <span>-</span>,
            },
            {
                title: '',
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => <Button><Link to={`${coreProps.urls.edit_bpmn}/${record.workflow_id}`} title="Edit">Edit</Link></Button>,
            },
        ];

        return (
            <Table columns={table_columns} dataSource={data} />
        )
    }
}


export default WorkflowTable;
