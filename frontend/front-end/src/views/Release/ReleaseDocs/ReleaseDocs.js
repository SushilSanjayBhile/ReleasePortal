import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import UserInterfaceGuide from '../../../assets/UserInterfaceGuide.png';
import ZoneCapability from '../../../assets/ZoneCapability.png';
import StorageSnapshot from '../../../assets/StorageSnapshot.png';
import KVM from '../../../assets/KVM.png';
import CSI from '../../../assets/CSI.png';
import CLI from '../../../assets/CLI.png';
import {
    ButtonDropdown,
    ButtonGroup,
    Card,
    CardBody,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Row, Col
} from 'reactstrap';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import { connect } from 'react-redux';

import { cardChartData4, cardChartOpts4 } from '../constants';

class ReleaseDocs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: this.props.selectedRelease.ReleaseNumber === '2.3.0' ? true : false
        }
    }
    render() {
        return (
            <React.Fragment>
                            {
                !this.state.show &&
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%'
                }}>
                    NO RECORDS AVAILABLE
                </div>
            }
           
            <Row>

                {
                    this.state.show &&
                    [
                        { img: UserInterfaceGuide, url: 'https://drive.google.com/open?id=1RyPgDlaDt2J2qnnlBFWkKcC3crq4v6lC' },
                        { img: ZoneCapability, url: 'https://drive.google.com/open?id=1MvWv8tVUjluHbUsIWIgr3otjDHr9Vgkh' },
                        { img: StorageSnapshot, url: 'https://drive.google.com/open?id=1lYhT5QqQDyY6gWsruTW7W_SMxHaoZa0U' },
                        { img: KVM, url: 'https://drive.google.com/open?id=1ThNSfaO3S-65canDYu7BhXtZNwGmylLH' },
                        { img: CSI, url: 'https://drive.google.com/open?id=1ipl8dPJDjRQ0kK7fC-FibZLAkj0JeZOz' },
                        { img: CLI, url: 'https://drive.google.com/open?id=14CnvvHSyGa8qs4JV3tN-oeDqjW1ZweUA' }
                    ]
                        .map(item =>

                            <Col xs="12" sm="12" md="6" lg="3" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                                <div
                                    onClick={() => window.open(item.url, '_blank')}
                                    style={{
                                        backgroundImage: `url(${item.img})`,
                                        backgroundPosition: 'center',
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        width: '100%',
                                        height: '340px'
                                    }}></div>
                            </Col>

                        )
                }
            </Row>
            </React.Fragment>

            // <Card className="text-white bg-danger">
            //     <CardBody className="pb-0">
            //         <ButtonGroup className="float-right">
            //             <ButtonDropdown id='card4' isOpen={this.state.card4} toggle={() => { this.setState({ card4: !this.state.card4 }); }}>
            //                 <DropdownToggle caret className="p-0" color="transparent">
            //                     <i className="icon-settings"></i>
            //                 </DropdownToggle>
            //                 <DropdownMenu right>
            //                     <DropdownItem>Action</DropdownItem>
            //                     <DropdownItem>Another action</DropdownItem>
            //                     <DropdownItem>Something else here</DropdownItem>
            //                 </DropdownMenu>
            //             </ButtonDropdown>
            //         </ButtonGroup>
            //         <div className="text-value">{this.props.release && this.props.release.Customers ? this.props.release.Customers.length : 0}</div>
            //         <div>Customers</div>
            //     </CardBody>
            //     <div className="chart-wrapper mx-3" style={{ height: '70px' }}>
            //         <Bar data={cardChartData4} options={cardChartOpts4} height={70} />
            //     </div>
            // </Card>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    selectedRelease: getCurrentRelease(state, state.release.current.id),
})
export default connect(mapStateToProps, {})(ReleaseDocs);