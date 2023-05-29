import React, { Component } from 'react';
import { Table, Button, Modal, Form, Input, Typography, Spin, Icon, Tag } from 'UIKit';
import JobDetailModal from "./jobDetailModal";
import moment from 'moment';

import axios from "axios";




export default class JobInstancesView extends Component {
    state = {
        data: [],
        loaded: false,
        workflow_attributes: null,
        current_modal_view_job: null,
        visible_modal_view_job: false,
        task_filter: ""
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { coreProps } = this.props;

        const headers = {};
        if(coreProps.user_token){
            headers['Authorization'] = 'Token ' + coreProps.user_token;
        }

        // this.interval = setInterval(() => this.getJobs(), 1000);

        this.getJobs();
    }

    componentWillReceiveProps(nextProps) {
        let currentElement = nextProps.currentElement;
        let { task_filter } = this.state;

        this.setState({ 
            workflow_attributes: nextProps.workflow_attributes, 
            selected_workflow: nextProps.selected_workflow, 
        }, () => {
            if(currentElement && currentElement.id && currentElement.$type != "bpmn:Process" && task_filter != currentElement.id){
                this.setState({ 
                    task_filter: currentElement.id
                }, () => {
                    this.getJobs();
                });
            }else{
                this.getJobs();
            }
        });
    }

    getJobs() {
        const { coreProps } = this.props;
        let { workflow_attributes, selected_workflow, task_filter } = this.state;
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
            axios.get(coreProps.engine_url+'/workflow/'+workflow_key+"/jobs?version_id=" + version_id + "&task=" + task_filter, {
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
    }

    handleModalViewJobCancel = e => {
        this.setState({
            visible_modal_view_job: false,
        });
    };

    refreshClick(){
        this.getJobs.bind(this);
        if(this.props.refreshJob){
            this.props.refreshJob();
        }
    }


    render() {
        const { coreProps } = this.props;
        const { data, loaded, workflow_attributes, current_modal_view_job, task_filter } = this.state;
        let self = this;

        const table_columns = [
            {
                title: 'Job Key',
                dataIndex: 'job_key',
                key: 'job_key',
                render: (job_key, record)  => <Button type="link" >{job_key}</Button>,
            },
            {
                title: 'Task',
                dataIndex: 'task',
                key: 'task',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: text => {
                    let color = "geekblue";
                    if(text == "COMPLETE"){
                        color = "green";
                    }else if(text == "WAITING_TO_PROCESS"){
                        color = "gold";
                    }
                    return <Tag color={color}>{text.replace(/ /g,"_")}</Tag>
                },
            },
            {
                title: 'Modified By',
                dataIndex: 'modified_by',
                key: 'modified_by',
            },
            {
                title: 'Modified Time',
                dataIndex: 'modified_time',
                key: 'modified_time',
                render: modified_time => <span>{moment(modified_time).format("dddd, MMM DD, HH:mm:ss")}</span>,
            },
            {
                title: 'Create Time',
                dataIndex: 'create_date',
                key: 'create_date',
                render: create_date => <span>{moment(create_date).format("dddd, MMM DD, HH:mm:ss")}</span>,
            },
        ];

        return (
            <>
            <Button type="primary" onClick={this.refreshClick.bind(this)}>
                <Icon type="reload" /> Refresh
            </Button>
            

            {task_filter && <Tag
                closable
                onClose={() => this.setState({ task_filter: "" }, () => {this.getJobs();})}
            >
                {task_filter}
            </Tag>}

            <Spin spinning={!loaded} size="large" >
                <Table columns={table_columns} dataSource={data} pagination={{ pageSize: 10 }} scroll={{ y: 240 }}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: event => {
                                const headers = {};
                                if(coreProps.user_token){
                                    headers['Authorization'] = 'Token ' + coreProps.user_token;
                                }
                                let workflow_key = null;
                                if(workflow_attributes && workflow_attributes.workflow_key){
                                    workflow_key = workflow_attributes.workflow_key;
                                }

                                axios.get(coreProps.engine_url+'/workflow/'+workflow_key+"/job/" + record.job_key, {
                                    headers: headers
                                })
                                .then(response => {
                                    if (response.status !== 200) {
                                        return this.setState({ placeholder: "Something went wrong" });
                                    }
                                    return response.data;
                                })
                                .then(data => this.setState({ current_modal_view_job: data, visible_modal_view_job: true }));
                            }, // click row
                        };
                    }}
                />
            </Spin>
            <JobDetailModal
                job_data={current_modal_view_job}
                visible={this.state.visible_modal_view_job}
                onCancel={this.handleModalViewJobCancel}
            />
            </>
        );
    }
};