import React from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    Typography,
} from 'UIKit';

const { Option } = Select;
const { Title } = Typography;


export default class CustomForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            savingFlag: false,
        };
    }

    handleSubmit = e => {
        let self = this;
        e.preventDefault();
        // self.setState({ savingFlag: true });
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                if(this.props.handleSubmit){
                    this.props.handleSubmit(values);
                }
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { formItemLayout, tailFormItemLayout, fields, formButtons } = this.props;
        let { savingFlag } = this.state;

        return (
            <Form {...formItemLayout} 
                onSubmit={this.handleSubmit}
            >
                {
                    Object.keys(fields).map((key, index) => (
                        <Form.Item
                            label={
                                <span>{fields[key].title}&nbsp;</span>
                            }
                        >
                            {getFieldDecorator(key, {
                                initialValue: fields[key].value ? fields[key].value : fields[key].default,
                                rules: [
                                    // { value={connectionInfoSelected.config_interface[key]}
                                    //     type: 'email',
                                    //     message: 'The input is not valid E-mail!',
                                    // },
                                    {
                                        required: fields[key].required,
                                        message: 'Please input ' + fields[key].title,
                                    },
                                ],
                            })(<Input />)}
                        </Form.Item>
                    ))
                }
                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" loading={savingFlag}>Save</Button>
                    {formButtons}
                    {/* <Button htmlType="submit" loading={conectionLoading}>Connect</Button>
                    {connected &&
                        <Button type="primary" onClick={() => this.setState({ saveVisible: true })}>Save</Button>
                    } */}
                </Form.Item>
            </Form> 


            // <Form {...formItemLayout}>
            //     <Form.Item
            //         label={
            //             <span>Connection&nbsp;</span>
            //         }
            //     >
                    
            //     </Form.Item>
            //     <Form.Item {...tailFormItemLayout}>
            //         <Button type="primary" onClick={this.saveModuleSetting.bind(this)}>Save</Button>
            //         {/* <Button onClick={this.handleShowEditConnection.bind(this)}>Edit</Button> */}
            //         <Button type="text" onClick={() => this.unselect_module()}><Icon type="delete" /></Button>
            //     </Form.Item>
            // </Form>
        );
    }
}