import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import {
    ButtonDropdown,
    ButtonGroup,
    Card,
    CardBody,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap';

import { cardChartOpts2, cardChartData2 } from '../constants';

class ReleaseResourceInfoCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalResources: 0
        }
    }
    render() {
        return (
            <Card className="text-white bg-info">
                <CardBody className="pb-0">
                    <ButtonGroup className="float-right">
                        <ButtonDropdown id='card1' isOpen={this.state.card1} toggle={() => { this.setState({ card1: !this.state.card1 }); }}>
                            <DropdownToggle caret className="p-0" color="transparent">
                                <i className="icon-settings"></i>
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem>Action</DropdownItem>
                                <DropdownItem>Another action</DropdownItem>
                                <DropdownItem disabled>Disabled action</DropdownItem>
                                <DropdownItem>Something else here</DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    </ButtonGroup>
                    <div className="text-value">{this.state.totalResources}</div>
                    <div>Resources</div>
                </CardBody>
                <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
                    <Line data={cardChartData2} options={cardChartOpts2} height={70} />
                </div>
            </Card>
        )
    }
}

export default ReleaseResourceInfoCard;