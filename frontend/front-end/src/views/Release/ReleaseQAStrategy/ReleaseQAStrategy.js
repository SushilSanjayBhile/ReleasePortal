// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button, Input, Collapse
    , Modal, ModalHeader, ModalBody, ModalFooter, Progress
} from 'reactstrap';
import { connect } from 'react-redux';
import AppTable from '../../../components/AppTable/AppTable';
import { getCurrentRelease } from '../../../reducers/release.reducer';
import { getTCStrategyForUISubDomains, alldomains, getTCStatusForSunburst } from '../../../reducers/release.reducer';
import { TABLE_OPTIONS } from '../../../constants';
import { Bar, Doughnut, Line, Pie, Polar, Radar } from 'react-chartjs-2';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../../actions';
import './ReleaseQAStrategy.scss'
// import sunburst from '../../../reducers/domains.js'
import Sunburst from '../components/Sunburst';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Carousel, CarouselCaption, CarouselControl, CarouselIndicators, CarouselItem } from 'reactstrap';

const options = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false
}

const data = [
    { date: 'Dec 2019', QARateOfProgress: 5, tcTotal: 2199, tcSkipped: 11, tcNA: 0, SetupsUsed: ['autotb1', 'autotb2', 1, 2, 3, 4, 5, 6, 7, 8, 9], Engineer: ['achavan@diamanti.com', 'sushil@diamanti.com', 'nikhil@diamanti.com', 1, 2, 3, 4, 5], startdate: '1-Oct-2019', freezedate: '15-Dec-2019', upgrade: '4/21' },
    { date: 'Nov 2019', QARateOfProgress: 10, tcTotal: 1500, tcSkipped: 0, tcNA: 0, SetupsUsed: ['autotb1', 'autotb2', 1, 2, 3, 4, 5, 6, 7], Engineer: ['achavan@diamanti.com', 'sushil@diamanti.com', 'nikhil@diamanti.com', 1, 2, 3, 4, 5], startdate: '1-Oct-2019', freezedate: '07-Dec-2019', upgrade: '0/21' },
    { date: 'Oct 2019', QARateOfProgress: 10, tcTotal: 900, tcSkipped: 0, tcNA: 0, SetupsUsed: ['autotb5', 'auto8', 'atuo10', 1, 2], Engineer: ['achavan@diamanti.com', 'sushil@diamanti.com', 'nikhil@diamanti.com', 1, 2], startdate: '1-Oct-2019', freezedate: '1-Dec-2019', upgrade: '0/21' },
    // { date: 'Sept 2019', QARateOfProgress: 60, tcTotal: 500, tcSkipped: 50, tcNA: 200, SetupsUsed: ['autotb1', 'autotb2'], Engineer: ['achavan@diamanti.com', 'sushil@diamanti.com', 'nikhil@diamanti.com'], startdate: '5th Nov, 2019', freezedate: '30th Nov, 2019', upgrade: [2.2, 2.2] },
]
class ReleaseQAStrategy extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addTC: {},
            open: {},
            width: window.screen.availWidth > 1700 ? 500 : 380,
            basic: { editOptions: [TABLE_OPTIONS.EDIT], editing: false, updated: {}, open: false },
            qaStrategy: { editOptions: [TABLE_OPTIONS.EDIT], editing: false, updated: {}, open: false, collapseOpen: { SetupsUsed: false, Engineers: false } },
            domainSelected: false,
            items: []
        }
    }
    componentDidMount() {
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    save() {
        let data = { ...this.state.addTC };
        let dates = [
            'TargetedReleaseDate', 'ActualReleaseDate', 'TargetedCodeFreezeDate',
            'UpgradeTestingStartDate', 'QAStartDate', 'ActualCodeFreezeDate', 'TargetedQAStartDate'
        ]
        let formattedDates = {};
        dates.forEach(item => {
            if (data[item]) {
                let date = new Date(data[item]);
                formattedDates[item] = date.toISOString()
            }
        })
        data = { ...data, ...formattedDates };
        data.Domain = this.state.domainSelected;
        console.log('saved data ', data);
        axios.post(`/api/tcinfo/${this.props.selectedRelease.ReleaseNumber}`, { ...data })
            .then(res => {
                this.getTcs();
                this.setState({ addTC: {} });
            }, error => {
                alert('error in updating');
            });
        if (this.state.modal) {
            this.toggle();
        }
    }
    confirmToggle() {
        let data = { ...this.state.addTC }
        if (!data || (data && !data.TcID) || !this.state.domainSelected) {
            alert('Please Add Tc ID or Domain');
            return;
        }
        this.toggle();
    }
    render() {
        return (
            <div>
                {
                    this.props.selectedRelease && this.props.selectedRelease.ReleaseNumber !== '2.3.0' &&
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%'
                    }}>
                        NO RECORDS AVAILABLE
                    </div>
                }
                {
                    this.props.selectedRelease && this.props.selectedRelease.ReleaseNumber === '2.3.0' &&
                
                <Row>
                    {/* <Col xs="11" sm="11" md="6" lg="3" className="rp-summary-tables">
                        <div className='rp-app-table-header'>
                            <span className='rp-app-table-title'>Dec 2019</span>
                        </div>
                        <Table scroll responsive style={{ overflow: 'scroll', }}>
                            <tbody>
                                {
                                    [
                                        { key: 'Expected rate of Progress per week', field: 'QARateOfProgress', value: this.props.selectedRelease.QARateOfProgress ? this.props.selectedRelease.QARateOfProgress : 0 },
                                        { key: 'Test Cases', restrictEdit: true, field: 'run', value: this.props.tcStrategy ? this.props.tcStrategy.totalTests : 0 },
                                        { key: 'Test Cases Skipped', restrictEdit: true, field: 'skip', value: this.props.tcStrategy ? this.props.tcStrategy.skipped : 0 },
                                        { key: 'Test Cases Not Applicable', restrictEdit: true, field: 'na', value: this.props.tcStrategy ? this.props.tcStrategy.notApplicable : 0 },

                                        { key: 'Setups Used', restrictEdit: true, field: 'SetupsUsed', value: this.props.selectedRelease.SetupsUsed ? this.props.selectedRelease.SetupsUsed.length : 0 },
                                        { key: 'Engineers', field: 'Engineers', value: this.props.selectedRelease.Engineers ? this.props.selectedRelease.Engineers : 0 },
                                        { key: 'QA Start Date', field: 'QAStartDate', value: this.props.selectedRelease.QAStartDate, type: 'date' },
                                        { key: 'Target Code Freeze Date', field: 'TargetedCodeFreezeDate', value: this.props.selectedRelease.TargetedCodeFreezeDate, type: 'date' },
                                        { key: 'Upgrade Metrics Count', restrictEdit: true, field: 'UpgradeMetrics', value: this.props.selectedRelease.UpgradeMetrics ? this.props.selectedRelease.UpgradeMetrics.length : '' },

                                    ].map((item, index) => {
                                        return (
                                            <tr>
                                                <React.Fragment>

                                                    <td className='rp-app-table-key'>{item.key}</td>
                                                    <td>
                                                        {item.value}
                                                        {
                                                            item.field === 'QARateOfProgress' && <span>%</span>
                                                        }
                                                        {
                                                            item.field === 'QARateOfProgress' &&
                                                            <div>
                                                                <div className="progress-group">
                                                                    <div className="progress-group-bars">
                                                                        <Progress className="progress-xs" color="warning" value={this.props.selectedRelease[item.field]} />

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        }


                                                    </td>
                                                </React.Fragment>

                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    </Col> */}
                    {
                        data.map((each, i) =>
                            <Col xs="11" sm="11" md="6" lg="3" className="rp-summary-tables">
                                <div className='rp-app-table-header'>
                                    <div className='rp-icon-button'><i className="fa fa-cogs"></i></div><span className='rp-app-table-title'>{each.date}</span>
                                </div>

                                <Table scroll responsive style={{ overflow: 'scroll', }}>
                                    <tbody>
                                        {
                                            [
                                                // { key: 'Expected rate of Progress per week', field: 'QARateOfProgress', value: each.QARateOfProgress },
                                                { key: 'Test Cases Run', restrictEdit: true, field: 'run', value: each.tcTotal },
                                                { key: 'Test Cases Skipped', restrictEdit: true, field: 'skip', value: each.tcSkipped },
                                                { key: 'Test Cases Not Applicable', restrictEdit: true, field: 'na', value: each.tcNA },

                                                { key: 'Setups Used', restrictEdit: true, field: 'SetupsUsed', value: each.SetupsUsed.length },
                                                { key: 'Engineers', field: 'Engineers', value: each.Engineer.length },
                                                { key: 'QA Start Date', field: 'QAStartDate', value: each.startdate },
                                                { key: 'Target Code Freeze Date', field: 'TargetedCodeFreezeDate', value: each.freezedate },
                                                { key: 'Upgrade Metrics Count', restrictEdit: true, field: 'UpgradeMetrics', value: each.upgrade },

                                            ].map((item, index) => {
                                                return (
                                                    <tr>
                                                        <React.Fragment>

                                                            <td className='rp-app-table-key'>{item.key}</td>

                                                            <td>{item.value}
                                                                {
                                                                    item.field === 'QARateOfProgress' && <span>%</span>
                                                                }
                                                                {
                                                                    item.field === 'QARateOfProgress' &&
                                                                    <div>
                                                                        <div className="progress-group">
                                                                            <div className="progress-group-bars">
                                                                                <Progress className="progress-xs" color="warning" value={this.props.selectedRelease[item.field]} />

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </td>
                                                        </React.Fragment>

                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                                {/* {
                                    !this.state.open[each.date] &&
                                    <div style={{ textAlign: 'center' }}>
                                        <i className="fa fa-angle-down rp-rs-down-arrow" onClick={() => this.setState({ open: { ...this.state.open, [each.date]: !this.state.open[each.date] } })}></i>
                                    </div>
                                }
                                {
                                    this.state.open[each.date] &&
                                    <div style={{ textAlign: 'center' }}>
                                        <i className="fa fa-angle-up rp-rs-down-arrow" onClick={() => this.setState({ open: { ...this.state.open, [each.date]: !this.state.open[each.date] } })}></i>
                                    </div>
                                } */}
                            </Col>
                        )

                    }
                </Row>
                }

                <Modal isOpen={this.state.modal} toggle={() => this.toggle()}>
                    <ModalHeader toggle={() => this.toggle()}>Confirmation</ModalHeader>
                    <ModalBody>
                        Are you sure you want to make the changes?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.save()}>Ok</Button>{' '}
                        <Button color="secondary" onClick={() => this.toggle()}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div >
        )
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    selectedTC: state.testcase.all[state.release.current.id],
})
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus })(ReleaseQAStrategy);








