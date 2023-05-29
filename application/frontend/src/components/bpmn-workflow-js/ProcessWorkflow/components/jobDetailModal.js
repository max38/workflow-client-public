import React, { Component } from 'react';
import ReactJson from 'react-json-view';
import { Form, Input, Modal, Row, Col, Tag, Table } from 'UIKit';
import moment from 'moment';


export default class JobDetailModal extends Component {
    constructor(props) {
        super(props);
        
    }

    render() {
        let { visible, onCancel, job_data } = this.props;
        let title = "Job Detail";
        let $show_jobdata = null;
        let $show_historical = null;

        const table_columns = [
            {
                title: 'Task',
                dataIndex: 'task',
                key: 'task',
            },
            {
                title: 'Task Status',
                dataIndex: 'process_status',
                key: 'process_status',
                render: text => {
                    let color = "geekblue";
                    if(text == "SUCCESS"){
                        color = "green";
                    }else if(text == "WAITING_RESPONSE"){
                        color = "gold";
                    }else if(text == "PROCESSING"){
                        color = "geekblue";
                    }else if(text == "WAITING_TO_PROCESS"){
                        color = "orange";
                    }else if(text == "ERROR"){
                        color = "red";
                    }
                    return <Tag color={color}>{text && text.replace(/ /g,"_")}</Tag>
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
            }
        ];

        if(job_data){
            title += " - " + job_data.job_key;


            let color = "geekblue";
            if(job_data.status == "COMPLETE"){
                color = "green";
            }else if(job_data.status == "WAITING_TO_PROCESS"){
                color = "gold";
            }
            let $tag_status = <Tag color={color}>{job_data.status && job_data.status.replace(/ /g,"_")}</Tag>;

            color = "geekblue";
            if(job_data.process_status == "SUCCESS"){
                color = "green";
            }else if(job_data.process_status == "WAITING_RESPONSE"){
                color = "gold";
            }else if(job_data.process_status == "PROCESSING"){
                color = "geekblue";
            }else if(job_data.process_status == "WAITING_TO_PROCESS"){
                color = "orange";
            }else if(job_data.process_status == "ERROR"){
                color = "red";
            }
            let $tag_task_status = <Tag color={color}>{job_data.process_status && job_data.process_status.replace(/ /g,"_")}</Tag>;

            $show_jobdata = <Form 
                {...{
                    labelCol: {
                    span: 8,
                    },
                    wrapperCol: {
                    span: 16,
                    },
                }}
            >
                <Form.Item label="Job Key">
                    <Input value={job_data.job_key} readonly />
                </Form.Item>
                <Form.Item label="Task">
                    <Input value={job_data.task} readonly />
                </Form.Item>
                <Form.Item label="Status">
                    {$tag_status}
                </Form.Item>
                <Form.Item label="Task Status">
                    {$tag_task_status}
                </Form.Item>
                <Form.Item label="Create Time">
                    <Input value={moment(job_data.create_date).format("dddd, MMM DD, HH:mm:ss")} readonly />
                </Form.Item>
                <Form.Item label="Modified By">
                    <Input value={job_data.modified_by} readonly />
                </Form.Item>
                <Form.Item label="Modified Time">
                    <Input value={moment(job_data.modified_time).format("dddd, MMM DD, HH:mm:ss")} readonly />
                </Form.Item>
                
            </Form>;  
            
            // $show_historical = <Table columns={table_columns} dataSource={job_data.histories} />;
        }

        return (
            <Modal
                title={title} 
                visible={visible}
                onCancel={onCancel}
                footer={null}
                width={840}
                >
                    <Row gutter={16}>
                    <Col span={24}>
                        <div style={{padding: '8px 0' }}>{$show_jobdata}</div>
                    </Col>
                    </Row>
                    <Row gutter={16}>
                        <div class="ant-col ant-col-8 ant-form-item-label"><label class="" title="Variabless">Variables</label></div>
                        <Col span={16}>
                            {(job_data && job_data.variable) && <ReactJson
                                src={job_data.variable}
                                name={false}
                                displayDataTypes={false}
                            />}
                        </Col>
                    </Row>
                    <Row gutter={16}>
                    <Col span={24}>
                        <div style={{padding: '8px 0' }}>{(job_data && job_data.histories) && <Table pagination={{ pageSize: 10 }} columns={table_columns} dataSource={job_data.histories} />}</div>
                    </Col>
                    </Row>
            </Modal>
        );
    }
};