// CUSTOMER USING THIS RELEASE (OPTIONAL) (M)
// Issues faced on customer side (jira - list)
// customers to be given to
import React, { Component } from 'react';
import {
    TabContent, TabPane, Nav, NavItem, NavLink, Col, Row, Collapse, Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { } from 'reactstrap';

import { connect } from 'react-redux';
import { getCurrentRelease, getTCStrategyForUISubDomainsScenario } from '../../../reducers/release.reducer';
import {
    getTCStrategyForUIDomains, getTCStrategyForUISubDomains, alldomains, getTCStatusForSunburst,
    getTCStrategyForUISubDomainsDistribution, getTCStrategyForUIDomainsDistribution
} from '../../../reducers/release.reducer';
import { getEachTCStrategyScenario } from '../../../reducers/testcase.reducer';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import { saveTestCase, saveTestCaseStatus, saveSingleTestCase } from '../../../actions';
import SanityTestCases from '../../../components/SanityTestCases/SanityTestCases';
import E2ETestCases from '../../../components/E2ETestCases/E2ETestCases';
import LongevityTestCases from '../../../components/LongevityTestCases/LongevityTestCases';
import StressTestCases from '../../../components/StressTestCases/StressTestCases';
import './ReleaseSanityResult.scss'
import classnames from 'classnames';
import CreateResult from './CreateResult';
const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

class ReleaseSanityResult extends Component {
    newCards = {};
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            metricsOpen: false,
            edited: {},
            activeTab: '1',
            counter: 1,
            deleteE2ESanityCntr: 1,
            deleteE2EDailyCntr: 1,
            deleteE2EWeeklyCntr: 1,
            deleteLongevityCntr: 1,
            deleteStressCntr: 1,
            E2ESANITY: 1,
            E2EDAILY: 1,
            E2EWEEKLY: 1,
            saveE2ESanityCntr:1,
            saveE2EDailyCntr:1,
            saveE2EWeeklyCntr:1,
            saveStressCntr:1,
            saveLongevityCntr:1,
            Longevity: 1,
            Stress: 1,
            tcOpen: true,
            createOpen: false,
            deleteOpen: false
        }
    }
    toggleCreate = () => { this.setState({ createOpen: !this.state.createOpen }) };
    confirmDeleteToggle = () => { this.setState({ deleteOpen: !this.state.deleteOpen }) }
    confirmSaveToggle = () => { this.setState({ saveOpen: !this.state.saveOpen }) }
    create = () => {
        this.setState({ counter: this.state.counter + 1 })
    }
    componentDidMount() {
        this.setState({ tcOpen: true, activeTab: '4' })
    }
    toggleTab = tab => {
        if (this.state.activeTab !== tab) this.setState({ activeTab: tab });
    }
    delete = () => {

        if (this.state.activeTab === '1') {
            this.setState({ deleteE2ESanityCntr: this.state.deleteE2ESanityCntr + 1 })
        }

        if (this.state.activeTab === '2') {
            this.setState({ deleteE2EDailyCntr: this.state.deleteE2EDailyCntr + 1 })
        }

        if (this.state.activeTab === '3') {
            this.setState({ deleteE2EWeeklyCntr: this.state.deleteE2EWeeklyCntr + 1 })
        }
        if (this.state.activeTab === '4') {
            this.setState({ deleteStressCntr: this.state.deleteStressCntr + 1 })
        }
        if (this.state.activeTab === '5') {
            this.setState({ deleteLongevityCntr: this.state.deleteLongevityCntr + 1 })
        }
        // this.confirmDeleteToggle();
    }
    save = () => {

        if (this.state.activeTab === '1') {
            this.setState({ saveE2ESanityCntr: this.state.saveE2ESanityCntr + 1 })
        }

        if (this.state.activeTab === '2') {
            this.setState({ saveE2EDailyCntr: this.state.saveE2EDailyCntr + 1 })
        }

        if (this.state.activeTab === '3') {
            this.setState({ saveE2EWeeklyCntr: this.state.saveE2EWeeklyCntr + 1 })
        }
        if (this.state.activeTab === '4') {
            this.setState({ saveStressCntr: this.state.saveStressCntr + 1 })
        }
        if (this.state.activeTab === '5') {

            this.setState({ saveLongevityCntr: this.state.saveLongevityCntr + 1 })
        }
        // this.confirmSaveToggle();
    }
    confirmDelete = () => {
        this.confirmDeleteToggle();
    }
    confirmSave = () => {
        this.confirmSaveToggle();
    }
    render() {
        let users = this.props.users && this.props.users.filter(item => item.role !== 'EXECUTIVE');
        let statuses = this.props.selectedRelease.StatusOptions

        let cards = this.props.selectedRelease.CardType ? this.props.selectedRelease.CardType.map(item => ({ value: item })) : [];
        let op = this.props.selectedRelease.OrchestrationPlatform ? this.props.selectedRelease.OrchestrationPlatform.map(item => ({ value: item })) : [];
        return (
            <div>
                <Row>
                    <Col xs="11" sm="11" md="11" lg="11" className="rp-summary-tables" style={{ 'margin-left': '1.5rem' }}>
                        <div className='rp-app-table-header' style={{ cursor: 'pointer' }} onClick={() => this.setState({ tcOpen: !this.state.tcOpen })}>
                            <div class="row">
                                <div class='col-lg-12'>
                                    <div style={{ display: 'flex' }}>
                                        <div style={{ display: 'inlineBlock' }}>
                                            {/* {
                                                !this.state.tcOpen &&
                                                <i className="fa fa-angle-down rp-rs-down-arrow"></i>
                                            }
                                            {
                                                this.state.tcOpen &&
                                                <i className="fa fa-angle-up rp-rs-down-arrow"></i>
                                            } */}
                                            <div className='rp-icon-button'><i className="fa fa-leaf"></i></div>
                                            <span className='rp-app-table-title'>Other Test Result</span>
                                            <span style={{ 'marginLeft': '2rem' }}>Please keep rows selected before making changes...</span>
                                            
                                            {
                                                this.props.currentUser && this.props.currentUser.email &&
                                                <React.Fragment>
                                                   
                                                   
                                                    <Button style={{ marginLeft: '1rem', right: '1rem', position: 'absolute' }} id="getDelete" onClick={() => this.confirmDelete()} type="button">Delete</Button>
                                                    <Button style={{ marginLeft: '1rem', right: '6rem', position: 'absolute' }} id="getall" onClick={() => this.confirmSave()} type="button">Update</Button>
                                                    <Button style={{ marginLeft: '1rem', right: '11rem', position: 'absolute' }} id="getall" onClick={() => this.toggleCreate()} type="button">Create</Button>
                                                </React.Fragment>
                                            }
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <Nav tabs>
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: this.state.activeTab === '1' })}
                                    onClick={() => this.toggleTab('1')}>
                                    E2E Sanity
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: this.state.activeTab === '2' })}
                                    onClick={() => this.toggleTab('2')}
                                >
                                    E2E Daily
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: this.state.activeTab === '3' })}
                                    onClick={() => this.toggleTab('3')}
                                >
                                    E2E Weekly
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: this.state.activeTab === '4' })}
                                    onClick={() => this.toggleTab('4')}
                                >
                                    Stress
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: this.state.activeTab === '5' })}
                                    onClick={() => this.toggleTab('5')}
                                >
                                    Longevity
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab}>
                            <TabPane tabId="1">
                                <E2ETestCases tag='SANITY' e2eCounter={this.state.E2ESANITY} deleteCounter={this.state.deleteE2ESanityCntr} saveCounter={this.state.saveE2ESanityCntr}></E2ETestCases>
                            </TabPane>
                            <TabPane tabId="2">
                                <E2ETestCases tag='DAILY' e2eCounter={this.state.E2EDAILY} deleteCounter={this.state.deleteE2EDailyCntr} saveCounter={this.state.saveE2EDailyCntr}></E2ETestCases>
                            </TabPane>
                            <TabPane tabId="3">
                                <E2ETestCases tag='WEEKLY' e2eCounter={this.state.E2EWEEKLY} deleteCounter={this.state.deleteE2EWeeklyCntr} saveCounter={this.state.saveE2EWeeklyCntr}></E2ETestCases>
                            </TabPane>
                            <TabPane tabId="4">
                                <StressTestCases e2eCounter={this.state.Stress} deleteCounter={this.state.deleteStressCntr} saveCounter={this.state.saveStressCntr}></StressTestCases>
                            </TabPane>
                            <TabPane tabId="5">
                                <LongevityTestCases e2eCounter={this.state.Longevity} deleteCounter={this.state.deleteLongevityCntr} saveCounter={this.state.saveLongevityCntr}></LongevityTestCases>
                            </TabPane>
                        </TabContent>
                    </Col>
                </Row>
                <Modal isOpen={this.state.createOpen} toggle={() => this.toggleCreate()}>
                    {
                        <ModalHeader toggle={() => this.toggleCreate()}>{
                            'Create'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        <CreateResult counter={this.state.counter} close={(type) => {
                            this.setState({ [type]: this.state[type] + 1 })
                            this.toggleCreate()
                        }
                        } />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.create()}>Create</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.toggleCreate()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.deleteOpen} toggle={() => this.confirmDeleteToggle()}>
                    {
                        <ModalHeader toggle={() => this.confirmDeleteToggle()}>{
                            'Create'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        Are you sure you want to make the delete the results?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => { this.confirmDeleteToggle(); setTimeout(() => this.delete(), 1)}}>Delete</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.confirmDeleteToggle()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.saveOpen} toggle={() => this.confirmSaveToggle()}>
                    {
                        <ModalHeader toggle={() => this.confirmSaveToggle()}>{
                            'Save'
                        }</ModalHeader>
                    }
                    <ModalBody>
                        Are you sure you want to save the results?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => { this.confirmSaveToggle(); setTimeout(() => this.save(), 1)}}>Save</Button>{' '}
                        {
                            <Button color="secondary" onClick={() => this.confirmSaveToggle()}>Cancel</Button>
                        }
                    </ModalFooter>
                </Modal>
            </div>

        )
    }
}
const mapStateToProps = (state, ownProps) => ({
    currentUser: state.auth.currentUser,
    selectedRelease: getCurrentRelease(state, state.release.current.id),
    selectedTC: state.testcase.all[state.release.current.id],
    testcaseDetail: state.testcase.testcaseDetail
})
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase })(ReleaseSanityResult);








