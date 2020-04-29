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
import TestCasesAllGUI from '../../../components/TestCasesAllGUI/TestCasesAllGUI';
import './ReleaseTestMetricsGUI.scss'
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import CreateTCs from '../CreateTCs/CreateTCs';
const options = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    // legend: { labels: { fontSize: '14px', fontColor: 'black' } }
}
const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
class ReleaseTestMetricsGUI extends Component {
    newCards = {};
    constructor(props) {
        super(props);
        this.state = {
            addTC: { Master: true },
            open: false,
            width: window.screen.availWidth > 1700 ? 500 : 380,
            // doughnutsDist: getTCStrategyForUIDomainsDistribution(this.props.selectedRelease),
            // doughnuts: getTCStrategyForUIDomains(this.props.selectedRelease),
            qaStrategy: {},
            domainSelected: false,
            // domains: getTCStatusForSunburst(this.props.selectedRelease),
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
                <TestCasesAllGUI title={'Test Cases'} type='all'></TestCasesAllGUI>
                {/* {
                    this.props.currentUser &&
                    <CreateTCs isEditing={true} update={() => this.save()}></CreateTCs>
                } */}

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
export default connect(mapStateToProps, { saveTestCase, saveTestCaseStatus, saveSingleTestCase })(ReleaseTestMetricsGUI);








