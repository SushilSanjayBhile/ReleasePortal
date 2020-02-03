import React, { Component } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Col,
    FormGroup,
    Input,
    Label,
} from 'reactstrap';
import './ChatBox.scss';
class ChatBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chats: [
                {
                    user: '0',
                    datetime: new Date("2015-03-25T12:00:00-06:00"),
                    message: `
                    First Meeting
                    `
                },
                {
                    user: '1',
                    datetime: new Date("2015-03-25T12:00:00-06:00"),
                    message: `
                    Second Meeting
                    `
                },
                {
                    user: '1',
                    datetime: new Date("2015-03-25T12:00:00-06:00"),
                    message: `
                    Second
                    `
                },
                {
                    user: '1',
                    datetime: new Date("2015-03-25T12:00:00-06:00"),
                    message: `
                    Second
                    `
                }, {
                    user: '1',
                    datetime: new Date("2015-03-25T12:00:00-06:00"),
                    message: `
                    Second
                    `
                }
            ]
        }
    }
    render() {
        return (
            <div>
                <Card className='rp-cb-dimensions'>
                    <CardBody className='rp-cb-card-body'>
                        {
                            this.state.chats.map(item =>
                                <div class='rp-cb-messages'>
                                    <div class='rp-cb-user'>User: {item.user}</div>
                                    <div class='rp-cb-datetime'>Date: {item.datetime.toString()}</div>
                                    <div>{item.message}</div>
                                </div>)
                        }
                    </CardBody>
                </Card>
            </div>
        )
    }
}
export default ChatBox;