import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    ButtonDropdown,
    ButtonGroup,
    Card,
    CardBody,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap';

import { cardChartData4, cardChartOpts4 } from '../constants';

class ReleaseCustomerCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalCustomers: 0
        }
    }
    render() {
        return (
            <Card className="text-white bg-danger">
                <CardBody className="pb-0">
                    <ButtonGroup className="float-right">
                        <ButtonDropdown id='card4' isOpen={this.state.card4} toggle={() => { this.setState({ card4: !this.state.card4 }); }}>
                            <DropdownToggle caret className="p-0" color="transparent">
                                <i className="icon-settings"></i>
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem>Action</DropdownItem>
                                <DropdownItem>Another action</DropdownItem>
                                <DropdownItem>Something else here</DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    </ButtonGroup>
                    <div className="text-value">{this.props.release && this.props.release.Customers ? this.props.release.Customers.length : 0}</div>
                    <div>Customers</div>
                </CardBody>
                <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
                    <Bar data={cardChartData4} options={cardChartOpts4} height={70} />
                </div>
            </Card>
        )
    }
}

export default ReleaseCustomerCard;