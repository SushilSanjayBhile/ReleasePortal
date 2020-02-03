import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Card,
    CardBody,
} from 'reactstrap';

import { cardChartData3, cardChartOpts3 } from '../constants';

class ReleaseTestCaseCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalTests: 0
        }
    }
    render() {
        return (
            <Card className="text-white bg-warning">
                <CardBody className="pb-0">
                    <div className="text-value">{this.state.totalTests}</div>
                    <div>Tests</div>
                </CardBody>
                <div className="chart-wrapper" style={{ height: '70px' }}>
                    <Line data={cardChartData3} options={cardChartOpts3} height={70} />
                </div>
            </Card>
        )
    }
}

export default ReleaseTestCaseCard;