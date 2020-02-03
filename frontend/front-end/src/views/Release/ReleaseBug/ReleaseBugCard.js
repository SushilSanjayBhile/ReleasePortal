import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Dropdown,
    ButtonGroup,
    Card,
    CardBody,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap';

import { cardChartData1, cardChartOpts1 } from '../constants';

class ReleaseBugCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalBugs: 0
        }
    }
    render() {
        return (<Card className="text-white bg-danger">
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
                <div className="text-value">{this.state.totalBugs}</div>
                <div>Bugs</div>
            </CardBody>
            <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
                <Line data={cardChartData1} options={cardChartOpts1} height={70} />
            </div>
        </Card>)
    }
}

export default ReleaseBugCard;