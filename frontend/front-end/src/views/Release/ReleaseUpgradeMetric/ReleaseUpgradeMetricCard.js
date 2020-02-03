import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import {
    ButtonGroup,
    Card,
    CardBody,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap';

import { cardChartData1, cardChartOpts1 } from '../constants';

class ReleaseUpgradeMetricCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'Under-Work'
        }
    }
    render() {
        return (
            <Card className="text-white bg-primary">
                <CardBody className="pb-0">
                    <ButtonGroup className="float-right">
                        <Dropdown id='card2' isOpen={this.state.card2} toggle={() => { this.setState({ card2: !this.state.card2 }); }}>
                            <DropdownToggle className="p-0" color="transparent">
                                <i className="icon-location-pin"></i>
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem>Action</DropdownItem>
                                <DropdownItem>Another action</DropdownItem>
                                <DropdownItem>Something else here</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </ButtonGroup>
                    <div className="text-value">{this.state.status}</div>
                    <div>Upgrade Metric</div>
                </CardBody>
                <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
                    <Line data={cardChartData1} options={cardChartOpts1} height={70} />
                </div>
            </Card>
        )
    }
}

export default ReleaseUpgradeMetricCard;