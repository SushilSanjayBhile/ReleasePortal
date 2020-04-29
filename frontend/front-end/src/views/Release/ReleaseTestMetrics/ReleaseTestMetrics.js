// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Badge, Card, CardBody, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table, Button, Input, Collapse
    , Modal, ModalHeader, ModalBody, ModalFooter, Progress, Popover, PopoverBody,
} from 'reactstrap';
import { connect } from 'react-redux';
import { getCurrentRelease, getTCStrategyForUISubDomainsScenario } from '../../../reducers/release.reducer';
import {
    getTCStrategyForUIDomains, getTCStrategyForUISubDomains, alldomains, getTCStatusForSunburst,
    getTCStrategyForUISubDomainsDistribution, getTCStrategyForUIDomainsDistribution
} from '../../../reducers/release.reducer';
import { getEachTCStrategyScenario } from '../../../reducers/testcase.reducer';
import { roles, workingStatuses, tcTypes } from '../../../constants';
import { Bar, Doughnut, Line, Pie, Polar, Radar } from 'react-chartjs-2';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../../actions';
import TestCases from '../../../components/TestCases/TestCases';
import TestCasesAll from '../../../components/TestCasesAll/TestCasesAll';
import TestCasesLifecycle from '../../../components/TestCasesLifecycle/TestCasesLifecycle';

import './ReleaseTestMetrics.scss'
import Sunburst from '../components/Sunburst';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import CreateTCs from '../CreateTCs/CreateTCs';
import PendingForApproval from '../PendingForApproval/PendingForApproval';
import MyTcsForRegression from '../MyTcsForRegression/MyTcsForRegression';
import AssignTcs from '../AssignTcs/AssignTcs';
import MyTcsPendingForApproval from '../MyTcsPendingForApproval/MyTcsPendingForApproval';
import AddOptions from '../AddOptions/AddOptions';
const options = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    // legend: { labels: { fontSize: '14px', fontColor: 'black' } }
}
const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
class ReleaseTestMetrics extends Component {
    newCards = {};
    constructor(props) {
        super(props);
        this.state = {
            addTC: { Master: true },
            open: false,
            width: window.screen.availWidth > 1700 ? 500 : 380,
            doughnutsDist: getTCStrategyForUIDomainsDistribution(this.props.selectedRelease),
            doughnuts: getTCStrategyForUIDomains(this.props.selectedRelease),
            qaStrategy: {},
            domainSelected: false,
            domains: getTCStatusForSunburst(this.props.selectedRelease),
            metricsOpen: false,
            edited: {}
        }
    }
    componentDidMount() {
        if (this.props.currentUser &&
            (this.props.currentUser.role === 'MANAGER' || this.props.currentUser.role === 'EXECUTIVE')) {
            this.setState({ metricsOpen: true })
        }
        if (!this.props.currentUser) {
            this.setState({ metricsOpen: true })
        }
    }
    toggle = () => this.setState({ modal: !this.state.modal });
    confirmToggle() {
        let data = { ...this.state.addTC }
        if (!data || (data && !data.TcID) || !this.state.domainSelected) {
            alert('Please Add Tc ID or Domain');
            return;
        }
        this.toggle();
    }
    sunburstClick(node) {
        console.log('clicked node');
        console.log(node);
        if (alldomains.includes(node.data.name)) {
            this.setState({
                doughnuts: getTCStrategyForUISubDomains(this.props.selectedRelease, node.data.name),
                doughnutsDist: getTCStrategyForUISubDomainsDistribution(this.props.selectedRelease, node.data.name),
                domainSelected: false
            })
            return true;
        }
        if (node.data.name === 'domains') {
            this.setState({
                doughnuts: getTCStrategyForUIDomains(this.props.selectedRelease),
                doughnutsDist: getTCStrategyForUIDomainsDistribution(this.props.selectedRelease),
                domainSelected: false
            })
            return true;
        }
        if (!alldomains.includes(node.data.name) && node.data.name !== 'domains') {
            this.setState({ domainSelected: node.data.name, doughnuts: null, doughnutsDist: null })
            axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/tcinfo/domain/' + node.data.name)
                .then(all => {
                    console.log(all)
                    if (all && all.data.length) {
                        axios.get('/api/' + this.props.selectedRelease.ReleaseNumber + '/tcstatus/domain/' + node.data.name)
                            .then(res => {
                                // this.props.saveTestCase({ id: this.props.selectedRelease.ReleaseNumber, data: all.data })
                                this.setState({ domainSelected: node.data.name, doughnuts: getEachTCStrategyScenario({ data: res.data, domain: node.data.name, release: this.props.selectedRelease }) })
                            }, error => {

                            });
                    }
                    // console.log(res.data);
                    // console.log('from domains')
                    // console.log(node.data.name);
                    // this.props.saveTestCase({ id: this.props.selectedRelease.ReleaseNumber, data: res.data })
                    // this.setState({
                    //     domainSelected: node.data.name, doughnuts: getTCStrategyForUISubDomainsScenario(
                    //         this.props.selectedRelease, 'Storage', node.data.name, res.data
                    //     )
                    // })
                }, error => {

                })

            return false;
        }
    }

    selectCardTypes(event, checked, select) {
        let card = event.val();
        this.newCards[card] = checked;
        console.log(this.newCards);
    }
    selectOP(event, checked) {
        let op = event.val();
        this.newOP[op] = checked;
        console.log(this.newOP);
    }
    render() {
        let users = this.props.users && this.props.users.filter(item => item.role !== 'EXECUTIVE');
        let statuses = this.props.selectedRelease.StatusOptions

        let cards = this.props.selectedRelease.CardType ? this.props.selectedRelease.CardType.map(item => ({ value: item })) : [];
        let op = this.props.selectedRelease.OrchestrationPlatform ? this.props.selectedRelease.OrchestrationPlatform.map(item => ({ value: item })) : [];
        return (
            <div>
                <TestCasesAll title={'Test Cases'} type='all'></TestCasesAll>
                {/* <TestCasesLifecycle title={tcTypes.ALL.title} type={tcTypes.ALL}></TestCasesLifecycle> */}
                {/* {
                    this.props.currentUser && this.props.currentUser.isAdmin &&
                    <TestCasesLifecycle title={tcTypes.PFAPPROVAL.title} type={tcTypes.PFAPPROVAL}></TestCasesLifecycle>
                }
                {
                    this.props.currentUser && this.props.currentUser.isAdmin &&
                    <TestCasesLifecycle title={tcTypes.PFREGRESSION.title} type={tcTypes.PFREGRESSION}></TestCasesLifecycle>
                } */}

                {/* <TestCasesAll title={tcTypes.ASSIGNAUTO.title} type={tcTypes.ASSIGNAUTO.type}></TestCasesAll>
                <TestCasesAll title={tcTypes.ASSIGNREGRESSION.title} type={tcTypes.ASSIGNREGRESSION.type}></TestCasesAll>
                <TestCasesAll title={tcTypes.ASSIGNEDAUTO.title} type={tcTypes.ASSIGNEDAUTO.type}></TestCasesAll>
                <TestCasesAll title={tcTypes.ASSIGNEDREGRESSION.title} type={tcTypes.ASSIGNEDREGRESSION.type}></TestCasesAll>
                <TestCasesAll title={tcTypes.MPFAPPROVAL.title} type={tcTypes.MPFAPPROVAL.type}></TestCasesAll> */}
                {
                    this.props.currentUser &&
                    <CreateTCs isEditing={true} update={() => this.save()}></CreateTCs>
                }
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ metricsOpen: !this.state.metricsOpen })}>

                            <div class='row'>
                                <div class='col-md-6 col-lg-6'>
                                    {
                                        !this.state.metricsOpen &&
                                        <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                    }
                                    {
                                        this.state.metricsOpen &&
                                        <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                    }

                                    <div className='rp-icon-button'><i className="fa fa-compass"></i></div>
                                    <span className='rp-app-table-title'>Test Case Distribution</span>
                                </div>
                            </div>
                        </div>
                        <Collapse isOpen={this.state.metricsOpen}>
                            <Row>

                                <Col xs="11" sm="11" md="11" lg="4">
                                    <div style={{ marginLeft: '1rem', marginTop: '1rem' }}>
                                        <Sunburst
                                            tooltip={false}
                                            onClick={(node) => this.sunburstClick(node)}
                                            data={this.state.domains}
                                            width={this.state.width}
                                            height={this.state.width}
                                            count_member="size"
                                            labelFunc={(node) => node.data.name}
                                        />
                                    </div>
                                </Col>
                                <Col xs="11" sm="11" md="11" lg="8">
                                    {
                                        this.state.domainSelected &&
                                        !(this.state.doughnuts || this.state.doughnutsDist) &&
                                        loading()
                                    }
                                    {
                                        this.state.domainSelected &&
                                        <div style={{ textAlign: 'center' }}>
                                            <strong class="h4">{this.state.domainSelected}</strong>

                                        </div>
                                    }
                                    {
                                        !this.state.domainSelected &&
                                        <Row style={{ marginLeft: '2.5rem' }}>
                                            {
                                                this.state.doughnutsDist &&
                                                this.state.doughnutsDist.map((item, index) => {

                                                    return (
                                                        <Col>
                                                            <div className="chart-wrapper" style={{ minHeight: '400px' }}>
                                                                {/* <Doughnut data={item.data} /> */}
                                                                <Bar data={item.data} options={options} />
                                                            </div>
                                                            <div className='rp-tc-dougnut-text'>
                                                                {item && item.title}
                                                            </div>
                                                        </Col>
                                                    )


                                                })
                                            }
                                        </Row>
                                    }

                                    <Row style={{ marginLeft: '2.5rem' }}>
                                        {
                                            this.state.doughnuts &&
                                            this.state.doughnuts.map((item, index) => {

                                                return (
                                                    !item.hide &&
                                                    <Col>
                                                        <div className="chart-wrapper" style={{ minHeight: '400px' }}>

                                                            <Bar data={item.data} options={options} />
                                                        </div>
                                                        <div className='rp-tc-dougnut-text'>
                                                            {item && item.title}
                                                        </div>
                                                    </Col>
                                                )


                                            })
                                        }
                                    </Row>
                                </Col>
                            </Row>
                        </Collapse>
                        {/* <Row>
                            {
                                this.state.doughnuts &&
                                this.state.doughnuts.length >= 4 &&
                                this.state.doughnuts.map((item, index) => {
                                    if (index >= 4) {
                                        return (<Col xs="12" sm="12" md="4" lg="4">
                                            <div className="chart-wrapper">
                                                <Doughnut data={item.data} />
                                            </div>
                                            <div className='rp-tc-dougnut-text'>
                                                {item && item.title}
                                            </div>
                                        </Col>)
                                    }
                                })
                            }
                        </Row> */}
                    </Col>
                </Row>



                {
                    // this.props.currentUser && this.props.currentUser.isAdmin &&
                    // <UpdateTCOptions></UpdateTCOptions>
                }
                {/* {
                    this.props.currentUser && this.props.currentUser.isAdmin &&
                    <PendingForApproval></PendingForApproval>
                } */}
                {/* {
                    this.props.currentUser && this.props.currentUser.isAdmin &&
                    <AssignTcs></AssignTcs>
                } */}
                {/* {
                    // this.props.currentUser && this.props.currentUser.role === 'QA' &&
                    this.props.currentUser &&
                    <MyTcsForRegression></MyTcsForRegression>
                } */}
                {/* {
                    this.props.currentUser && this.props.currentUser.role === 'QA' &&
                    <MyTcsForAutomation></MyTcsForAutomation>
                } */}
                {/* {
                    this.props.currentUser && (this.props.currentUser.role === 'QA' || this.props.currentUser.role === 'DEVELOPER') &&
                    <MyTcsPendingForApproval></MyTcsPendingForApproval>
                } */}
                {
                    this.props.currentUser && this.props.currentUser.email &&
                    <AddOptions></AddOptions>
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
            </div >)
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    selectedTC: state.testcase.all[state.release.current.id],
    testcaseDetail: state.testcase.testcaseDetail
})
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase })(ReleaseTestMetrics);








