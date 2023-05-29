import React, { Component, Fragment } from 'react';
import { Form, Select, Input } from 'UIKit';
import CrontabInput from './crontab-input/CrontabInput';


const { Option } = Select;

const form_layout = {
    labelCol: {
      span: 10,
    },
    wrapperCol: {
      span: 14,
    },
  };


export default class PeriodicTimeInput extends Component {
    constructor(props) {
        super(props);
        let value_cron, value_interval, value_interval_input, value_interval_period;

        if(props.type == "0"){
            value_cron = props.value;
            value_interval = "1-days";
            value_interval_input = "1";
            value_interval_period = "days";
        }else if(props.type == "1"){
            value_interval = props.value;
            value_cron = "0 * * * *";

            let value_intervals = value_interval.split("-");
            if(value_intervals.length > 1){
                value_interval_input = value_intervals[0];
                value_interval_period = value_intervals[1];
            }
        }

        this.state = {
            type: props.type,
            value_cron: value_cron,
            value_interval: value_interval,
            value_interval_input: value_interval_input,
            value_interval_period: value_interval_period
        }
    }

    onTimerDefinitionTypeChange(value){
        if(value == "0"){

        }
    
        this.setState({
            type: value,
        }, () => {
            this.onChange();
        });
    }

    onCronTabInputChange(value){
        if(!this.props.readonly){
            this.setState({
                value_cron: value,
            }, () => {
                this.onChange();
            });
        }
    }

    onIntervalPeriodChange(value){
        let { value_interval_input } = this.state;
        let value_interval = value_interval_input + "-" + value;

        this.setState({
            value_interval_period: value,
            value_interval: value_interval
        }, () => {
            this.onChange();
        });
    }

    onIntervalInputChange(event){
        if(!this.props.readonly){
            let { value_interval_period } = this.state;
            let value_interval = event.target.value + "-" + value_interval_period;
    
            console.log(event.target.value);
    
            this.setState({
                value_interval_input: event.target.value,
                value_interval: value_interval
            }, () => {
                this.onChange();
            });
        }
    }

    onChange(){
        if(this.props.onChange){
            let { type, value_cron, value_interval } = this.state;
            let value = value_cron;
            
            if(type == "0"){
                value = value_cron;
            }else if(type == "1"){
                value = value_interval;
            }
            this.props.onChange(type, value);
        }
    }

    render() {
        let $time_definition;
        let { type, value_interval_input, value_interval_period } = this.state;
        let { readonly } = this.props;

        if(type == "0"){
            $time_definition = <CrontabInput locale="en" onChange={value => this.onCronTabInputChange(value)} value={this.state.value_cron} readonly={readonly}/>;
        }else if(type == "1"){
            $time_definition = <Input.Group compact style={{marginTop: 25}}>
            <Input style={{ width: '60%' }} value={value_interval_input} onChange={this.onIntervalInputChange.bind(this)} />
            <Select style={{ width: '40%' }} value={value_interval_period} onChange={this.onIntervalPeriodChange.bind(this)} disabled={readonly} >
              <Option value="days">Days</Option>
              <Option value="hours">Hours</Option>
              <Option value="minutes">Minutes</Option>
              <Option value="seconds">Seconds</Option>
              {/* <Option value="microseconds">Microseconds</Option> */}
            </Select>
          </Input.Group>
        }

        return (
            <Form
            {...form_layout}
            >
              <Form.Item
                label={
                  <span>
                    Timer Definition Type&nbsp;
                  </span>
                }
              >
                <Select
                  value={type}
                  onChange={this.onTimerDefinitionTypeChange.bind(this)}
                  disabled={readonly}
                >
                  <Option value="0">Crontab Schedule</Option>
                  <Option value="1">Interval Schedule</Option>
                  {/* <Option value="2">Clocked Schedule</Option> */}
                </Select>
              </Form.Item>
              {$time_definition}
            </Form>
        )
    }
}